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
 * The teachers' room, on «Which class?»: the colleagues who want to be seen, with their critter and the stickers they
 * got with their classes over a span of time (the last weeks, or the season on now, as the administrator chooses), and
 * how many more play with their classes. Each teacher decides whether to appear (at first, no) and can leave whenever
 * they like. Never counts or hours, never ordered by use, never a report on anyone.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class sala {
    /** The user preference that says whether the teacher appears in the room. */
    const PREF = 'local_oksigeniaclasstools_sala';

    /** The weeks the room counts when there are no seasons. */
    const WEEKS = 12;

    /**
     * Whether the room is on: it needs the stickers, and the administrator can turn it off.
     *
     * @return bool
     */
    public static function on(): bool {
        return logros::on() && get_config('local_oksigeniaclasstools', 'sala') !== '0';
    }

    /**
     * The seasons the administrator wrote, one per line: «2026-09-08 | First term» (the name may be left out).
     *
     * @return array Each with from (its first day, as a timestamp) and name, in order.
     */
    public static function seasons(): array {
        $seasons = [];
        foreach (preg_split('/\R/', (string) get_config('local_oksigeniaclasstools', 'sala_seasons')) as $line) {
            if (!preg_match('/^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*(?:\|\s*(.*?))?\s*$/', $line, $m)) {
                continue;
            }
            if (checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
                $seasons[] = ['from' => make_timestamp((int) $m[1], (int) $m[2], (int) $m[3]), 'name' => $m[4] ?? ''];
            }
        }
        usort($seasons, fn($a, $b) => $a['from'] <=> $b['from']);
        return $seasons;
    }

    /**
     * The span the room counts: the season on now, if there are seasons and one has begun, or the last weeks.
     *
     * @param int|null $now For tests.
     * @return array from (timestamp), day (its YYYYMMDD), season (the name, or '' when it has none), weeks (0 in a season)
     */
    public static function span(?int $now = null): array {
        $now = $now ?? time();
        $current = null;
        foreach (self::seasons() as $season) {
            if ($season['from'] <= $now) {
                $current = $season;
            }
        }
        if ($current) {
            $from = $current['from'];
            $weeks = 0;
        } else {
            $weeks = max(1, (int) (get_config('local_oksigeniaclasstools', 'sala_weeks') ?: self::WEEKS));
            $from = $now - $weeks * WEEKSECS;
        }
        return ['from' => $from, 'day' => (int) userdate($from, '%Y%m%d', 99, false),
            'season' => $current ? $current['name'] : '', 'inseason' => (bool) $current, 'weeks' => $weeks];
    }

    /**
     * Whether a teacher appears in the room.
     *
     * @param int $userid
     * @return bool
     */
    public static function joined(int $userid): bool {
        return (bool) get_user_preferences(self::PREF, 0, $userid);
    }

    /**
     * Whether someone can come into the room: who can use the board in some course (a teacher).
     *
     * @param int $userid
     * @return bool
     */
    public static function can_join(int $userid): bool {
        return (bool) get_user_capability_course('local/oksigeniaclasstools:use', $userid, false, '', '', 1);
    }

    /**
     * A teacher comes into the room or leaves it.
     *
     * @param int $userid
     * @param bool $in
     */
    public static function join(int $userid, bool $in): void {
        set_user_preference(self::PREF, $in ? 1 : 0, $userid);
    }

    /**
     * The room as a teacher sees it.
     *
     * @param int $userid Who looks.
     * @param int|null $now For tests.
     * @return array teachers (id, name, me, stickers: cromo and level), in the order of their names; others (how many more
     *     colleagues play with their classes); span; joined (whether who looks is in); mine (what «My stickers» of who
     *     looks has and the room leaves out: learned, the ones only learned in the guided helps; before, the ones got
     *     with a class only before the span)
     */
    public static function room(int $userid, ?int $now = null): array {
        global $DB;
        $span = self::span($now);
        // The level of each sticker of each teacher, from the days of use in the span.
        $levels = [];
        $rows = $DB->get_recordset_sql(
            'SELECT userid, cromo, COUNT(DISTINCT day) AS days
               FROM {local_oksigeniaclasstools_uses}
              WHERE day >= ?
           GROUP BY userid, cromo',
            [$span['day']]
        );
        foreach ($rows as $row) {
            $level = logros::level((int) $row->days);
            if ($level) {
                $levels[(int) $row->userid][$row->cromo] = $level;
            }
        }
        $rows->close();
        // Who wants to be seen (only teachers can say so: sala.php), also before their first sticker.
        $in = array_map(
            'intval',
            $DB->get_fieldset_select('user_preferences', 'userid', 'name = ? AND value = ?', [self::PREF, '1'])
        );
        $teachers = [];
        if ($in) {
            [$insql, $params] = $DB->get_in_or_equal($in);
            $fields = 'id, ' . implode(', ', \core_user\fields::get_name_fields());
            $users = $DB->get_records_select('user', "id $insql AND deleted = 0 AND suspended = 0", $params, '', $fields);
            $order = array_flip(array_keys(logros::CROMOS));
            foreach ($users as $user) {
                $stickers = [];
                foreach ($levels[(int) $user->id] ?? [] as $cromo => $level) {
                    $stickers[] = ['cromo' => $cromo, 'level' => $level];
                }
                usort($stickers, fn($a, $b) => ($order[$a['cromo']] ?? 99) <=> ($order[$b['cromo']] ?? 99));
                $teachers[] = ['id' => (int) $user->id, 'name' => fullname($user), 'me' => (int) $user->id === $userid,
                    'stickers' => $stickers];
            }
            // By their names, never by use.
            usort($teachers, fn($a, $b) => strnatcasecmp($a['name'], $b['name']));
        }
        $others = count(array_diff(array_keys($levels), array_column($teachers, 'id'), [$userid]));
        $ever = logros::days($userid);
        $mine = [
            'learned' => count(array_diff(logros::learned($userid), array_keys($ever))),
            'before' => count(array_diff_key($ever, $levels[$userid] ?? [])),
        ];
        return ['teachers' => $teachers, 'others' => $others, 'span' => $span, 'joined' => self::joined($userid),
            'mine' => $mine];
    }
}
