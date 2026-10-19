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
 * How much each tool, game and material of the board is used: per course and day, by teachers and by students, how
 * many times it is chosen and how many seconds it is on screen while someone works with it (the board sends it every
 * couple of minutes). For the administrator to see what classes like most and what they leave aside.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tally {
    /** The table. */
    const TABLE = 'local_oksigeniaclasstools_tally';
    /** The most one sending can add to an item: the board sends every couple of minutes, and when it is closed. */
    const MAXSECONDS = 3600;
    /** The most times chosen one sending can add to an item. */
    const MAXOPENS = 200;
    /** The most items one sending can bring. */
    const MAXITEMS = 50;
    /** The periods of the report, with how many days back they start (null: from the start). */
    const PERIODS = ['today' => 0, 'week' => 6, 'month' => 29, 'all' => null];

    /**
     * Whether an item is one of the board: a tab («pizarra»), or a game or a material inside its tab («juegos/rosco»,
     * «material/tangram»).
     *
     * @param string $key
     * @return bool
     */
    public static function known(string $key): bool {
        global $CFG;
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        $parts = explode('/', $key);
        if (count($parts) === 1) {
            return isset(LOCAL_OKSIGENIACLASSTOOLS_TOOLS[$key]);
        }
        $inside = ['juegos' => LOCAL_OKSIGENIACLASSTOOLS_GAMES, 'material' => LOCAL_OKSIGENIACLASSTOOLS_MATERIALS];
        return count($parts) === 2 && isset($inside[$parts[0]][$parts[1]]);
    }

    /**
     * Adds what a board sends: for each item, the times it was chosen and the seconds it was in use.
     *
     * @param int $courseid
     * @param string $who 'teacher' or 'student', as the board opened for the user.
     * @param array $items Item => [times chosen, seconds].
     * @param int|null $now For tests.
     * @return int How many items were added.
     */
    public static function add(int $courseid, string $who, array $items, ?int $now = null): int {
        global $DB;
        if (!in_array($who, ['teacher', 'student'], true)) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $day = (int) userdate($now ?? time(), '%Y%m%d', 99, false);
        $added = 0;
        foreach (array_slice($items, 0, self::MAXITEMS, true) as $key => $item) {
            $key = (string) $key;
            if (!is_array($item) || !self::known($key)) {
                continue;
            }
            $opens = max(0, min(self::MAXOPENS, (int) ($item[0] ?? 0)));
            $seconds = max(0, min(self::MAXSECONDS, (int) ($item[1] ?? 0)));
            if (!$opens && !$seconds) {
                continue;
            }
            $where = ['courseid' => $courseid, 'day' => $day, 'who' => $who, 'tool' => $key];
            if (!$DB->record_exists(self::TABLE, $where)) {
                try {
                    $DB->insert_record(self::TABLE, (object) ($where + ['opens' => $opens, 'seconds' => $seconds]));
                    $added++;
                    continue;
                } catch (\dml_write_exception $e) {
                    // Another sending of the same board made the row a moment ago: it is added to that one.
                    unset($e);
                }
            }
            $DB->execute(
                'UPDATE {' . self::TABLE . '} SET opens = opens + ?, seconds = seconds + ?
                  WHERE courseid = ? AND day = ? AND who = ? AND tool = ?',
                [$opens, $seconds, $courseid, $day, $who, $key]
            );
            $added++;
        }
        return $added;
    }

    /**
     * The first day of a period, as YYYYMMDD in the time zone of the one who looks.
     *
     * @param string $period One of PERIODS.
     * @param int|null $now For tests.
     * @return int 0 for the whole time.
     */
    public static function since(string $period, ?int $now = null): int {
        $back = self::PERIODS[$period] ?? null;
        return $back === null ? 0 : (int) userdate(($now ?? time()) - $back * DAYSECS, '%Y%m%d', 99, false);
    }

    /**
     * What has been used in a course (or in all of them) from a day on: each item with the times chosen and the seconds
     * of students and of teachers, and on how many days it was used. The most used by students first.
     *
     * @param int $courseid 0 for all courses.
     * @param int $since First day, YYYYMMDD (0: from the start).
     * @return array[] key, name, sopens, sseconds, topens, tseconds, days.
     */
    public static function report(int $courseid, int $since): array {
        global $DB;
        $where = 'day >= :since';
        $params = ['since' => $since];
        if ($courseid) {
            $where .= ' AND courseid = :courseid';
            $params['courseid'] = $courseid;
        }
        $items = [];
        $rows = $DB->get_recordset_sql(
            'SELECT tool, who, SUM(opens) AS opens, SUM(seconds) AS seconds
               FROM {' . self::TABLE . "}
              WHERE $where
           GROUP BY tool, who",
            $params
        );
        foreach ($rows as $row) {
            if (!self::known($row->tool)) {
                continue;
            }
            $items[$row->tool] = $items[$row->tool] ?? ['key' => $row->tool, 'name' => self::name($row->tool),
                'sopens' => 0, 'sseconds' => 0, 'topens' => 0, 'tseconds' => 0, 'days' => 0];
            $p = $row->who === 'student' ? 's' : 't';
            $items[$row->tool][$p . 'opens'] += (int) $row->opens;
            $items[$row->tool][$p . 'seconds'] += (int) $row->seconds;
        }
        $rows->close();
        $rows = $DB->get_recordset_sql(
            'SELECT tool, COUNT(DISTINCT day) AS days
               FROM {' . self::TABLE . "}
              WHERE $where
           GROUP BY tool",
            $params
        );
        foreach ($rows as $row) {
            if (isset($items[$row->tool])) {
                $items[$row->tool]['days'] = (int) $row->days;
            }
        }
        $rows->close();
        usort($items, fn($a, $b) => [$b['sseconds'], $b['sopens'], $b['tseconds'], $b['topens'], $a['name']]
            <=> [$a['sseconds'], $a['sopens'], $a['tseconds'], $a['topens'], $b['name']]);
        return $items;
    }

    /**
     * The courses with something counted, for the report to choose from.
     *
     * @return int[]
     */
    public static function courses(): array {
        global $DB;
        return array_map('intval', $DB->get_fieldset_sql('SELECT DISTINCT courseid FROM {' . self::TABLE . '}'));
    }

    /**
     * The name of an item as the board shows it: «Juegos › Rueda de letras».
     *
     * @param string $key
     * @return string
     */
    public static function name(string $key): string {
        global $CFG;
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        $component = 'local_oksigeniaclasstools';
        [$tool, $part] = array_pad(explode('/', $key, 2), 2, '');
        $name = get_string(LOCAL_OKSIGENIACLASSTOOLS_TOOLS[$tool], $component);
        if ($part !== '') {
            $inside = $tool === 'juegos' ? LOCAL_OKSIGENIACLASSTOOLS_GAMES : LOCAL_OKSIGENIACLASSTOOLS_MATERIALS;
            $name .= ' › ' . get_string($inside[$part], $component);
        }
        return $name;
    }

    /**
     * Forgets what was counted in a course (when it is deleted).
     *
     * @param int $courseid
     */
    public static function delete_course(int $courseid): void {
        global $DB;
        $DB->delete_records(self::TABLE, ['courseid' => $courseid]);
    }
}
