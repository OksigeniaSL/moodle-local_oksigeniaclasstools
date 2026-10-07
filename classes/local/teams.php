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
 * Teams made on the board, saved as course groups when the teacher asks.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class teams {
    /** Prefix of the idnumber of groupings saved from the board (their groups are not offered as lists). */
    const GROUPING_PREFIX = 'oksigeniaclasstools-';

    /**
     * Saves teams as course groups: a grouping with the date and one group per team. Users who are not active
     * students of the course are left out.
     *
     * @param \stdClass $course
     * @param string $listname The list the teams were made from.
     * @param array $teams Arrays of user ids, one per team.
     * @return \stdClass The grouping (id and name).
     * @throws \moodle_exception If there are no teams.
     */
    public static function save_as_groups(\stdClass $course, string $listname, array $teams): \stdClass {
        global $CFG, $DB;
        require_once($CFG->dirroot . '/group/lib.php');
        if (!$teams) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $context = \context_course::instance($course->id);
        foreach ($teams as $i => $userids) {
            if (!is_array($userids)) {
                throw new \moodle_exception('invalidparameter', 'debug');
            }
            $teams[$i] = array_values(array_filter(
                array_map('intval', $userids),
                fn($u) => is_enrolled($context, $u, 'moodle/course:isincompletionreports', true)
            ));
        }
        // Names must fit in a group name (254 characters), whatever the list is called.
        $listname = \core_text::substr(trim($listname), 0, 120);
        $when = userdate(time(), get_string('strftimedatetimeshort', 'core_langconfig'));
        // All or nothing: a failure halfway does not leave a grouping with half its groups.
        $transaction = $DB->start_delegated_transaction();
        $groupingname = self::free_name('groupings', $course->id, get_string(
            'groupingname',
            'local_oksigeniaclasstools',
            (object) ['list' => $listname, 'when' => $when]
        ));
        $groupingid = groups_create_grouping((object) [
            'courseid' => $course->id,
            'name' => $groupingname,
            'idnumber' => self::GROUPING_PREFIX . time() . '-' . random_int(100, 999),
        ]);
        foreach (array_values($teams) as $i => $userids) {
            $groupid = groups_create_group((object) ['courseid' => $course->id,
                'name' => self::free_name('groups', $course->id, get_string(
                    'teamname',
                    'local_oksigeniaclasstools',
                    (object) ['n' => $i + 1, 'list' => $listname, 'when' => $when]
                ))]);
            groups_assign_grouping($groupingid, $groupid);
            foreach ($userids as $userid) {
                groups_add_member($groupid, $userid);
            }
        }
        $transaction->allow_commit();
        return (object) ['id' => $groupingid, 'name' => $groupingname];
    }

    /**
     * A group or grouping name not used yet in the course («name», «name (2)»…).
     *
     * @param string $table groups or groupings.
     * @param int $courseid
     * @param string $name
     * @return string
     */
    private static function free_name(string $table, int $courseid, string $name): string {
        global $DB;
        $candidate = $name;
        for ($i = 2; $DB->record_exists($table, ['courseid' => $courseid, 'name' => $candidate]); $i++) {
            $candidate = "$name ($i)";
        }
        return $candidate;
    }
}
