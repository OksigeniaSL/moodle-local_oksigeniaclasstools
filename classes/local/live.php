<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

namespace local_oksigeniaclasstools\local;

/**
 * Live sessions: the board opens one, the students' devices join it (with a code, or with their Moodle account) and
 * answer — a vote, or a buzzer per team — and the board shows it as it happens. The teacher's phone can also join a
 * session of its own and work as a remote. Devices ask every second or so (no sockets): the state lives in two small
 * tables, where each answer is one row, so presses at the same moment never overwrite each other.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class live {
    /** What a session is for. */
    const KINDS = ['vote', 'buzz', 'remote'];

    /** How devices join: with the code only, or with their Moodle account. */
    const IDENTITIES = ['anon', 'moodle'];

    /** Characters of the codes (no 0/O or 1/I, which get mixed up). */
    const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    /** Seconds without news from the board after which a session is over. */
    const IDLE = 900;

    /** Most devices in one session. */
    const MAX_DEVICES = 80;

    /** The answers of each kind of vote (the board and the devices show them in the user's language). */
    const VOTES = [
        'abcd' => ['A', 'B', 'C', 'D'],
        'yesno' => ['yes', 'no'],
        'light' => ['green', 'yellow', 'red'],
        'five' => ['1', '2', '3', '4', '5'],
    ];

    /** What the remote can ask the board to do. */
    const COMMANDS = ['tm_toggle', 'tm_reset', 'tm_plus', 'pick', 'tab_next', 'tab_prev', 'present'];

    /**
     * Opens a session. The same teacher's previous session of the same kind in the course ends.
     *
     * @param \stdClass $course
     * @param int $teacherid
     * @param string $kind vote, buzz or remote.
     * @param string $identity anon or moodle (a remote is always moodle).
     * @param array $options vote => kind of vote; teams => names of the teams (buzz).
     * @return \stdClass The session.
     * @throws \moodle_exception If the kind or the options are not valid.
     */
    public static function start(
        \stdClass $course,
        int $teacherid,
        string $kind,
        string $identity,
        array $options = []
    ): \stdClass {
        global $DB;
        if (!in_array($kind, self::KINDS, true) || !in_array($identity, self::IDENTITIES, true)) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        if ($kind === 'remote') {
            $identity = 'moodle';
        }
        $state = ['open' => false, 'kicked' => [], 'show' => !empty($options['show'])];
        if ($kind === 'vote') {
            $state['vote'] = isset(self::VOTES[$options['vote'] ?? '']) ? $options['vote'] : 'abcd';
        }
        if ($kind === 'buzz') {
            $teams = array_slice(array_values(array_filter(array_map(
                fn($t) => \core_text::substr(trim(clean_param((string) $t, PARAM_TEXT)), 0, 24),
                (array) ($options['teams'] ?? [])
            ), fn($t) => $t !== '')), 0, 6);
            if (count($teams) < 2) {
                throw new \moodle_exception('invalidparameter', 'debug');
            }
            $state['teams'] = $teams;
        }
        if ($kind === 'remote') {
            $state['cmds'] = [];
            $state['seq'] = 0;
        }
        $now = time();
        $DB->set_field_select(
            'local_oksigeniaclasstools_live',
            'timeend',
            $now,
            'courseid = ? AND userid = ? AND kind = ? AND timeend = 0',
            [$course->id, $teacherid, $kind]
        );
        $live = (object) [
            'courseid' => $course->id, 'userid' => $teacherid, 'code' => self::new_code(), 'kind' => $kind,
            'identity' => $identity, 'state' => json_encode($state), 'round' => 0,
            'timecreated' => $now, 'timemodified' => $now, 'timeend' => 0,
        ];
        $live->id = $DB->insert_record('local_oksigeniaclasstools_live', $live);
        return $live;
    }

    /**
     * A code that no open session has.
     *
     * @return string
     */
    private static function new_code(): string {
        global $DB;
        do {
            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= self::CODE_CHARS[random_int(0, strlen(self::CODE_CHARS) - 1)];
            }
        } while ($DB->record_exists_select('local_oksigeniaclasstools_live', 'code = ? AND timeend = 0', [$code]));
        return $code;
    }

    /**
     * The open session with this code, or null.
     *
     * @param string $code
     * @return \stdClass|null
     */
    public static function by_code(string $code): ?\stdClass {
        global $DB;
        $code = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $code));
        if ($code === '') {
            return null;
        }
        $live = $DB->get_record_select(
            'local_oksigeniaclasstools_live',
            'code = ? AND timeend = 0 AND timemodified > ?',
            [$code, time() - self::IDLE],
            '*',
            IGNORE_MULTIPLE
        );
        return $live ?: null;
    }

    /**
     * A session of this teacher (the board asking about it, which also keeps it alive).
     *
     * @param int $id
     * @param int $teacherid
     * @return \stdClass
     * @throws \moodle_exception If it is not theirs.
     */
    public static function mine(int $id, int $teacherid): \stdClass {
        global $DB;
        $live = $DB->get_record('local_oksigeniaclasstools_live', ['id' => $id, 'userid' => $teacherid], '*', MUST_EXIST);
        if (!$live->timeend && $live->timemodified < time() - 10) {
            $live->timemodified = time();
            $DB->set_field('local_oksigeniaclasstools_live', 'timemodified', $live->timemodified, ['id' => $live->id]);
        }
        return $live;
    }

    /**
     * Open sessions of other teachers or courses on the site (to warn that the site may be busier).
     *
     * @param int $excludeid
     * @return int
     */
    public static function others(int $excludeid): int {
        global $DB;
        return $DB->count_records_select(
            'local_oksigeniaclasstools_live',
            "timeend = 0 AND timemodified > ? AND id <> ? AND kind <> 'remote'",
            [time() - self::IDLE, $excludeid]
        );
    }

    /**
     * What the teacher does with an open session.
     *
     * @param \stdClass $live
     * @param string $action open (a new question or round), close, show (results on the devices too), kick, command
     *     (from the remote) or end.
     * @param array $data device (kick), command (command), vote (open: another kind of vote).
     * @return \stdClass The session.
     */
    public static function control(\stdClass $live, string $action, array $data = []): \stdClass {
        global $DB;
        $state = json_decode($live->state, true);
        switch ($action) {
            case 'open':
                $live->round++;
                $state['open'] = true;
                if ($live->kind === 'vote' && isset(self::VOTES[$data['vote'] ?? ''])) {
                    $state['vote'] = $data['vote'];
                }
                // A vote can close by itself: from then on no answer gets in, whatever the board is doing.
                $secs = (int) ($data['secs'] ?? 0);
                $state['closesat'] = $live->kind === 'vote' && $secs > 0 ? time() + min(600, $secs) : 0;
                break;
            case 'close':
                $state['open'] = false;
                $state['closesat'] = 0;
                break;
            case 'show':
                $state['show'] = !empty($data['show']);
                break;
            case 'kick':
                $device = self::device_param((string) ($data['device'] ?? ''));
                if ($device !== '' && !in_array($device, $state['kicked'], true)) {
                    $state['kicked'][] = $device;
                    $DB->delete_records('local_oksigeniaclasstools_livein', ['liveid' => $live->id, 'device' => $device]);
                }
                break;
            case 'command':
                if ($live->kind !== 'remote' || !in_array($data['command'] ?? '', self::COMMANDS, true)) {
                    throw new \moodle_exception('invalidparameter', 'debug');
                }
                $state['seq']++;
                $state['cmds'][] = ['seq' => $state['seq'], 'cmd' => $data['command']];
                $state['cmds'] = array_slice($state['cmds'], -20);
                break;
            case 'end':
                $live->timeend = time();
                break;
            default:
                throw new \moodle_exception('invalidparameter', 'debug');
        }
        $live->state = json_encode($state);
        $DB->update_record('local_oksigeniaclasstools_live', $live);
        return $live;
    }

    /**
     * Whether answers get in: open, and its time (if it has one) not over.
     *
     * @param array $state
     * @return bool
     */
    private static function is_open(array $state): bool {
        return !empty($state['open']) && (empty($state['closesat']) || time() < $state['closesat']);
    }

    /**
     * Seconds until it closes by itself (0 without a time limit, or closed).
     *
     * @param array $state
     * @return int
     */
    private static function left(array $state): int {
        return self::is_open($state) && !empty($state['closesat']) ? max(0, $state['closesat'] - time()) : 0;
    }

    /**
     * A device token as the devices send it: their own random one, or «u» + user id with a Moodle account.
     *
     * @param string $device
     * @return string The token, or '' if it is not one.
     */
    public static function device_param(string $device): string {
        return preg_match('/^([a-f0-9]{16,40}|u[0-9]{1,18})$/', $device) ? $device : '';
    }

    /**
     * A device joins (or changes team).
     *
     * @param \stdClass $live
     * @param string $device
     * @param int $userid With a Moodle account; 0 with the code only.
     * @param int $team Buzzer team, from 1.
     * @throws \moodle_exception If it was sent out or the session is full.
     */
    public static function join(\stdClass $live, string $device, int $userid = 0, int $team = 0): void {
        global $DB;
        $state = json_decode($live->state, true);
        if (in_array($device, $state['kicked'], true)) {
            throw new \moodle_exception('kicked', 'local_oksigeniaclasstools');
        }
        $team = $live->kind === 'buzz' ? max(0, min(count($state['teams']), $team)) : 0;
        $where = ['liveid' => $live->id, 'round' => 0, 'device' => $device];
        if ($id = $DB->get_field('local_oksigeniaclasstools_livein', 'id', $where)) {
            $DB->set_field('local_oksigeniaclasstools_livein', 'team', $team, ['id' => $id]);
            return;
        }
        if ($DB->count_records('local_oksigeniaclasstools_livein', ['liveid' => $live->id, 'round' => 0]) >= self::MAX_DEVICES) {
            throw new \moodle_exception('livefull', 'local_oksigeniaclasstools');
        }
        try {
            $DB->insert_record('local_oksigeniaclasstools_livein', (object) ($where + [
                'userid' => $userid, 'team' => $team, 'answer' => '', 'timecreated' => self::ms(),
            ]));
        } catch (\dml_write_exception $e) {
            // The same device joining twice at once: it is in.
            return;
        }
    }

    /**
     * A device answers the open question (a vote, which can change while it is open) or presses its buzzer (only the
     * first press counts).
     *
     * @param \stdClass $live
     * @param string $device
     * @param string $answer An answer of the vote, or «press».
     * @return int For a buzzer, the place it got (1 = first); 0 otherwise.
     * @throws \moodle_exception If the device is not in or the question is closed.
     */
    public static function answer(\stdClass $live, string $device, string $answer): int {
        global $DB;
        $state = json_decode($live->state, true);
        $joined = $DB->get_record('local_oksigeniaclasstools_livein', ['liveid' => $live->id, 'round' => 0, 'device' => $device]);
        if (!$joined || in_array($device, $state['kicked'], true) || !self::is_open($state) || $live->round < 1) {
            throw new \moodle_exception('liveclosed', 'local_oksigeniaclasstools');
        }
        $where = ['liveid' => $live->id, 'round' => $live->round, 'device' => $device];
        if ($live->kind === 'vote') {
            if (!in_array($answer, self::VOTES[$state['vote']], true)) {
                throw new \moodle_exception('invalidparameter', 'debug');
            }
            $row = $DB->get_record('local_oksigeniaclasstools_livein', $where);
            if ($row) {
                // Changing the vote is fine; a burst of taps is not (one change every 300 ms at most).
                if (self::ms() - $row->timecreated >= 300) {
                    $row->answer = $answer;
                    $row->timecreated = self::ms();
                    $DB->update_record('local_oksigeniaclasstools_livein', $row);
                }
                return 0;
            }
        } else if ($live->kind !== 'buzz' || $answer !== 'press') {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        try {
            $DB->insert_record('local_oksigeniaclasstools_livein', (object) ($where + [
                'userid' => $joined->userid, 'team' => $joined->team, 'answer' => $answer, 'timecreated' => self::ms(),
            ]));
        } catch (\dml_write_exception $e) {
            // Pressed twice: the first press stays.
            unset($e);
        }
        if ($live->kind !== 'buzz') {
            return 0;
        }
        return self::place($DB->get_record('local_oksigeniaclasstools_livein', $where));
    }

    /**
     * The place of a press in its round (by the millisecond, and by arrival when two share it).
     *
     * @param \stdClass $press
     * @return int 1 = first.
     */
    private static function place(\stdClass $press): int {
        global $DB;
        return 1 + $DB->count_records_select(
            'local_oksigeniaclasstools_livein',
            'liveid = ? AND round = ? AND (timecreated < ? OR (timecreated = ? AND id < ?))',
            [$press->liveid, $press->round, $press->timecreated, $press->timecreated, $press->id]
        );
    }

    /**
     * What a device sees: the question, its answer, its team, its place.
     *
     * @param \stdClass $live
     * @param string $device
     * @return array
     */
    public static function device_view(\stdClass $live, string $device): array {
        global $DB;
        $state = json_decode($live->state, true);
        $view = [
            'kind' => $live->kind, 'round' => (int) $live->round, 'open' => self::is_open($state), 'left' => self::left($state),
            'ended' => (bool) $live->timeend, 'kicked' => in_array($device, $state['kicked'], true),
        ];
        $joined = $DB->get_record('local_oksigeniaclasstools_livein', ['liveid' => $live->id, 'round' => 0, 'device' => $device]);
        $view['joined'] = (bool) $joined;
        $view['team'] = $joined ? (int) $joined->team : 0;
        if ($live->kind === 'vote') {
            $view['vote'] = $state['vote'];
            $view['options'] = self::VOTES[$state['vote']];
        }
        if ($live->kind === 'buzz') {
            $view['teams'] = $state['teams'];
        }
        $mine = $live->round ? $DB->get_record(
            'local_oksigeniaclasstools_livein',
            ['liveid' => $live->id, 'round' => $live->round, 'device' => $device]
        ) : null;
        $view['mine'] = $mine ? $mine->answer : '';
        if ($mine && $live->kind === 'buzz') {
            $view['place'] = self::place($mine);
        }
        if (!empty($state['show']) && !self::is_open($state) && $live->kind === 'vote' && $live->round) {
            $view['results'] = self::counts($live);
        }
        return $view;
    }

    /**
     * What the board sees: who is in, and the answers of the current round.
     *
     * @param \stdClass $live
     * @param int $since For a remote, the commands after this one.
     * @return array
     */
    public static function board_view(\stdClass $live, int $since = 0): array {
        global $DB;
        $state = json_decode($live->state, true);
        $view = [
            'id' => (int) $live->id, 'code' => $live->code, 'kind' => $live->kind, 'identity' => $live->identity,
            'round' => (int) $live->round, 'open' => self::is_open($state), 'left' => self::left($state),
            'show' => !empty($state['show']),
            'ended' => (bool) $live->timeend, 'others' => self::others((int) $live->id),
            'url' => (new \moodle_url('/local/oksigeniaclasstools/join.php', ['c' => $live->code]))->out(false),
        ];
        if ($live->kind === 'remote') {
            $view['cmds'] = array_values(array_filter($state['cmds'], fn($c) => $c['seq'] > $since));
            $view['seq'] = (int) $state['seq'];
            $view['joined'] = $DB->record_exists('local_oksigeniaclasstools_livein', ['liveid' => $live->id, 'round' => 0]);
            return $view;
        }
        $names = self::names($live);
        $devices = [];
        $joined = $DB->get_records('local_oksigeniaclasstools_livein', ['liveid' => $live->id, 'round' => 0], 'timecreated, id');
        foreach ($joined as $row) {
            $devices[] = ['device' => $row->device, 'name' => $names[$row->device] ?? '', 'team' => (int) $row->team];
        }
        $view['devices'] = $devices;
        if ($live->kind === 'vote') {
            $view['vote'] = $state['vote'];
            $view['options'] = self::VOTES[$state['vote']];
            $view['results'] = $live->round ? self::counts($live) : [];
        }
        if ($live->kind === 'buzz') {
            $view['teams'] = $state['teams'];
            $presses = [];
            if ($live->round) {
                $rows = $DB->get_records(
                    'local_oksigeniaclasstools_livein',
                    ['liveid' => $live->id, 'round' => $live->round],
                    'timecreated, id'
                );
                $first = null;
                foreach ($rows as $row) {
                    $first = $first ?? $row->timecreated;
                    $presses[] = ['device' => $row->device, 'name' => $names[$row->device] ?? '', 'team' => (int) $row->team,
                        'after' => (int) ($row->timecreated - $first)];
                }
            }
            $view['presses'] = $presses;
        }
        return $view;
    }

    /**
     * How many devices chose each answer in the current round.
     *
     * @param \stdClass $live
     * @return array answer => count
     */
    private static function counts(\stdClass $live): array {
        global $DB;
        $state = json_decode($live->state, true);
        $counts = array_fill_keys(self::VOTES[$state['vote']], 0);
        $rows = $DB->get_records_sql_menu(
            'SELECT answer, COUNT(1) FROM {local_oksigeniaclasstools_livein} WHERE liveid = ? AND round = ? GROUP BY answer',
            [$live->id, $live->round]
        );
        foreach ($rows as $answer => $n) {
            if (isset($counts[$answer])) {
                $counts[$answer] = (int) $n;
            }
        }
        return $counts;
    }

    /**
     * The names of the devices that joined with their Moodle account (none for those with the code only).
     *
     * @param \stdClass $live
     * @return array device => name
     */
    private static function names(\stdClass $live): array {
        global $DB;
        if ($live->identity !== 'moodle') {
            return [];
        }
        $sql = 'SELECT li.device, u.*
                  FROM {local_oksigeniaclasstools_livein} li
                  JOIN {user} u ON u.id = li.userid
                 WHERE li.liveid = ? AND li.round = 0';
        $names = [];
        foreach ($DB->get_records_sql($sql, [$live->id]) as $device => $user) {
            $names[$device] = fullname($user);
        }
        return $names;
    }

    /**
     * Sessions of more than a day go, with their answers.
     */
    public static function cleanup(): void {
        global $DB;
        $old = $DB->get_fieldset_select('local_oksigeniaclasstools_live', 'id', 'timecreated < ?', [time() - DAYSECS]);
        foreach (array_chunk($old, 500) as $ids) {
            [$in, $params] = $DB->get_in_or_equal($ids);
            $DB->delete_records_select('local_oksigeniaclasstools_livein', "liveid $in", $params);
            $DB->delete_records_select('local_oksigeniaclasstools_live', "id $in", $params);
        }
    }

    /**
     * Now, in milliseconds.
     *
     * @return int
     */
    private static function ms(): int {
        return (int) round(microtime(true) * 1000);
    }
}
