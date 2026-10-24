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

namespace local_oksigeniaclasstools\external;

use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * The teams made on the board, saved as groups of the course (only when the teacher asks).
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class groups extends api {
    /**
     * Parameters of save.
     *
     * @return external_function_parameters
     */
    public static function save_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'listname' => new external_value(PARAM_RAW, 'The class list they were made from (cleaned as text)'),
            'teams' => new external_multiple_structure(
                new external_multiple_structure(new external_value(PARAM_INT, 'A student')),
                'The teams, each with the ids of its students'
            ),
        ]);
    }

    /**
     * Saves the teams as groups of the course, in a dated grouping.
     *
     * @param int $courseid
     * @param string $listname
     * @param array $teams
     * @return array ok, grouping, url
     */
    public static function save(int $courseid, string $listname, array $teams): array {
        global $CFG;
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        $params = self::validate_parameters(self::save_parameters(), [
            'courseid' => $courseid, 'listname' => $listname, 'teams' => $teams,
        ]);
        [$course, $context] = self::course(
            $params['courseid'],
            'local/oksigeniaclasstools:use',
            'moodle/course:managegroups'
        );
        $teams = $params['teams'];
        $visible = local_oksigeniaclasstools_visible_userids($course, $context);
        if ($visible !== null) {
            $teams = array_map(fn($team) => array_values(array_intersect(array_map('intval', $team), $visible)), $teams);
        }
        $listname = trim(clean_param($params['listname'], PARAM_TEXT));
        $grouping = \local_oksigeniaclasstools\local\teams::save_as_groups($course, $listname, $teams);
        return [
            'ok' => true,
            'grouping' => $grouping->name,
            'url' => (new \moodle_url('/group/groupings.php', ['id' => $course->id]))->out(false),
        ];
    }

    /**
     * Answer of save.
     *
     * @return external_single_structure
     */
    public static function save_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'Saved'),
            'grouping' => new external_value(PARAM_TEXT, 'The name of the grouping'),
            'url' => new external_value(PARAM_URL, 'The groupings of the course'),
        ]);
    }
}
