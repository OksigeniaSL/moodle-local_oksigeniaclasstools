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
 * The fixed remote of a teacher: an address for the phone that does not change and needs no login, with a key the
 * teacher can change (the old address stops working) and a switch to turn it off. The phone sees the teacher's boards
 * that are open (by course, nothing about the students) and sends them orders; a board takes only its own, and only
 * while it is open. Whoever has the address can drive the board, so it is changed when it may have been shared.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class remote {
    /** The orders a phone can send: the ones of the remote of a live session, and some more. */
    const COMMANDS = ['tm_toggle', 'tm_reset', 'tm_plus', 'pick', 'tab_next', 'tab_prev', 'present', 'turn', 'next'];

    /** Length of the key. */
    const TOKEN_LENGTH = 32;

    /** A board is open while it has asked for orders within these seconds. */
    const BOARD_IDLE = 30;

    /** The board writes that it is open at most this often (seconds). */
    const HEARTBEAT = 10;

    /** Orders kept for the boards to take. */
    const KEPT = 20;

    /** Least time between two orders of the same phone (milliseconds). */
    const GAP_MS = 150;

    /**
     * The teacher's remote, if they ever turned it on.
     *
     * @param int $userid
     * @return \stdClass|null
     */
    public static function get(int $userid): ?\stdClass {
        global $DB;
        return $DB->get_record('local_oksigeniaclasstools_remote', ['userid' => $userid]) ?: null;
    }

    /**
     * The remote of a key, while it is on.
     *
     * @param string $token
     * @return \stdClass|null
     */
    public static function by_token(string $token): ?\stdClass {
        global $DB;
        if (strlen($token) !== self::TOKEN_LENGTH || !ctype_alnum($token)) {
            return null;
        }
        return $DB->get_record('local_oksigeniaclasstools_remote', ['token' => $token, 'enabled' => 1]) ?: null;
    }

    /**
     * A new key, not used by anyone else.
     *
     * @return string
     */
    private static function new_token(): string {
        global $DB;
        do {
            $token = random_string(self::TOKEN_LENGTH);
        } while ($DB->record_exists('local_oksigeniaclasstools_remote', ['token' => $token]));
        return $token;
    }

    /**
     * Turns the remote on (making it, the first time) or off.
     *
     * @param int $userid
     * @param bool $on
     * @return \stdClass
     */
    public static function set_enabled(int $userid, bool $on): \stdClass {
        global $DB;
        $now = time();
        $row = self::get($userid);
        if (!$row) {
            $row = (object) ['userid' => $userid, 'token' => self::new_token(), 'enabled' => (int) $on, 'state' => '{}',
                'timecreated' => $now, 'timemodified' => $now];
            $row->id = $DB->insert_record('local_oksigeniaclasstools_remote', $row);
            return $row;
        }
        $row->enabled = (int) $on;
        $row->timemodified = $now;
        $DB->update_record('local_oksigeniaclasstools_remote', $row);
        return $row;
    }

    /**
     * A new address: the old one stops working, and the orders waiting are dropped.
     *
     * @param int $userid
     * @return \stdClass
     */
    public static function rotate(int $userid): \stdClass {
        global $DB;
        $row = self::get($userid) ?: self::set_enabled($userid, true);
        $row->token = self::new_token();
        $row->state = '{}';
        $row->timemodified = time();
        $DB->update_record('local_oksigeniaclasstools_remote', $row);
        return $row;
    }

    /**
     * The address of the remote.
     *
     * @param \stdClass $row
     * @return string
     */
    public static function url(\stdClass $row): string {
        return (new \moodle_url('/local/oksigeniaclasstools/mando.php', ['k' => $row->token]))->out(false);
    }

    /**
     * What the board needs: whether it is on, and its address.
     *
     * @param int $userid
     * @return array on, and url when on.
     */
    public static function status(int $userid): array {
        $row = self::get($userid);
        return $row && $row->enabled ? ['on' => true, 'url' => self::url($row)] : ['on' => false];
    }

    /**
     * The state of a remote, as an array.
     *
     * @param \stdClass $row
     * @return array
     */
    private static function state(\stdClass $row): array {
        $state = json_decode((string) $row->state, true);
        $state = is_array($state) ? $state : [];
        return $state + ['seq' => 0, 'cmds' => [], 'boards' => [], 'phone' => 0, 'last' => 0];
    }

    /**
     * Keeps the state.
     *
     * @param \stdClass $row
     * @param array $state
     */
    private static function keep(\stdClass $row, array $state): void {
        global $DB;
        $row->state = json_encode($state);
        $row->timemodified = time();
        $DB->update_record('local_oksigeniaclasstools_remote', $row);
    }

    /**
     * An open board asks for its orders: it says it is open (in this course, on this tool) and takes the orders for its
     * course after the last one it saw.
     *
     * @param int $userid
     * @param \stdClass $course
     * @param int $since The last order the board ran.
     * @param string $tool The tool on screen.
     * @param array[] $tools The tools the board has, each [id, name], for the phone.
     * @return array on; when on, seq, cmds and whether the phone is there.
     */
    public static function board(int $userid, \stdClass $course, int $since, string $tool, array $tools): array {
        $row = self::get($userid);
        if (!$row || !$row->enabled) {
            return ['on' => false];
        }
        $state = self::state($row);
        $now = time();
        $was = $state['boards'][$course->id] ?? null;
        $board = ['name' => format_string($course->shortname, true, ['context' => \context_course::instance($course->id)]),
            'tool' => $tool, 'tools' => array_values($tools), 'seen' => $now];
        // Written only when something changed or every few seconds, not on each call.
        if (!$was || $now - $was['seen'] >= self::HEARTBEAT || $was['tool'] !== $tool || $was['tools'] !== $board['tools']) {
            $state['boards'][$course->id] = $board;
            self::keep($row, $state);
        }
        $mine = array_values(array_filter(
            $state['cmds'],
            fn($c) => $c['seq'] > $since && (int) $c['course'] === (int) $course->id
        ));
        return ['on' => true, 'seq' => $state['seq'], 'cmds' => $mine, 'phone' => $now - (int) $state['phone'] < self::BOARD_IDLE];
    }

    /**
     * The open boards, for the phone, from the last one used.
     *
     * @param \stdClass $row
     * @return array[] course, name, tool and tools of each.
     */
    private static function open_boards(\stdClass $row): array {
        $boards = [];
        foreach (self::state($row)['boards'] as $courseid => $b) {
            if (time() - $b['seen'] < self::BOARD_IDLE) {
                $boards[] = ['course' => (int) $courseid, 'name' => $b['name'], 'tool' => $b['tool'], 'tools' => $b['tools'],
                    'seen' => $b['seen']];
            }
        }
        usort($boards, fn($a, $b) => $b['seen'] <=> $a['seen']);
        return array_map(function ($b) {
            unset($b['seen']);
            return $b;
        }, $boards);
    }

    /**
     * What the phone sees: the open boards (and it says it is there).
     *
     * @param \stdClass $row
     * @return array boards.
     */
    public static function phone(\stdClass $row): array {
        $state = self::state($row);
        if (time() - (int) $state['phone'] >= self::HEARTBEAT) {
            $state['phone'] = time();
            self::keep($row, $state);
        }
        return ['boards' => self::open_boards($row)];
    }

    /**
     * An order from the phone for the board of a course: only known orders, for an open board, and not too fast.
     *
     * @param \stdClass $row
     * @param string $cmd
     * @param int $courseid
     * @return array ok, or ok false and why (unknown, closed, toofast).
     */
    public static function command(\stdClass $row, string $cmd, int $courseid): array {
        if (!in_array($cmd, self::COMMANDS, true) && !preg_match('/^tool_[a-z]{2,20}$/', $cmd)) {
            return ['ok' => false, 'why' => 'unknown'];
        }
        $open = array_column(self::open_boards($row), 'tools', 'course');
        $tools = isset($open[$courseid]) ? array_column($open[$courseid], 0) : [];
        if (!isset($open[$courseid]) || (strpos($cmd, 'tool_') === 0 && !in_array(substr($cmd, 5), $tools, true))) {
            return ['ok' => false, 'why' => 'closed'];
        }
        $state = self::state($row);
        $ms = (int) round(microtime(true) * 1000);
        if ($ms - (int) $state['last'] < self::GAP_MS) {
            return ['ok' => false, 'why' => 'toofast'];
        }
        $state['seq']++;
        $state['last'] = $ms;
        $state['phone'] = time();
        $state['cmds'][] = ['seq' => $state['seq'], 'cmd' => $cmd, 'course' => $courseid];
        $state['cmds'] = array_slice($state['cmds'], -self::KEPT);
        self::keep($row, $state);
        return ['ok' => true];
    }

    /**
     * Forgets a teacher's remote (privacy).
     *
     * @param int $userid
     */
    public static function delete(int $userid): void {
        global $DB;
        $DB->delete_records('local_oksigeniaclasstools_remote', ['userid' => $userid]);
    }
}
