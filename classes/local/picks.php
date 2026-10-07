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
 * Picks of the name picker: each time a student is picked, for fair picking and participation.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class picks {
    /**
     * Records that a student was picked in a course.
     *
     * @param int $courseid
     * @param int $userid The student who was picked.
     * @param int $teacherid The teacher who picked.
     * @return int The new record id.
     * @throws \moodle_exception If the user is not an active student of the course.
     */
    public static function record(int $courseid, int $userid, int $teacherid): int {
        global $DB;
        $context = \context_course::instance($courseid);
        if (!is_enrolled($context, $userid, 'moodle/course:isincompletionreports', true)) {
            throw new \moodle_exception('invaliduser');
        }
        return $DB->insert_record('local_oksigeniaclasstools_picks', (object) [
            'courseid' => $courseid,
            'userid' => $userid,
            'teacherid' => $teacherid,
            'timecreated' => time(),
        ]);
    }

    /**
     * How many times each student has been picked in a course during the last days.
     *
     * @param int $courseid
     * @param int $days
     * @return array userid => count
     */
    public static function counts(int $courseid, int $days): array {
        global $DB;
        return array_map('intval', $DB->get_records_sql_menu('SELECT userid, COUNT(1)
                                                                FROM {local_oksigeniaclasstools_picks}
                                                               WHERE courseid = ? AND timecreated > ?
                                                            GROUP BY userid', [$courseid, time() - $days * DAYSECS]));
    }
}
