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
use core_external\external_single_structure;
use core_external\external_value;

/**
 * The turn of a student picked on the board, for fair picking.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class pick extends api {
    /**
     * Parameters of record.
     *
     * @return external_function_parameters
     */
    public static function record_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'userid' => new external_value(PARAM_INT, 'The student who was picked'),
        ]);
    }

    /**
     * Keeps the turn of a student picked on the board (only one the teacher may pick: separate groups count).
     *
     * @param int $courseid
     * @param int $userid
     * @return array ok
     */
    public static function record(int $courseid, int $userid): array {
        global $CFG, $USER;
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        $params = self::validate_parameters(self::record_parameters(), ['courseid' => $courseid, 'userid' => $userid]);
        [$course, $context] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        $visible = local_oksigeniaclasstools_visible_userids($course, $context);
        if ($visible !== null && !in_array($params['userid'], $visible, true)) {
            throw new \moodle_exception('invaliduser');
        }
        \local_oksigeniaclasstools\local\picks::record($course->id, $params['userid'], $USER->id);
        return ['ok' => true];
    }

    /**
     * Answer of record.
     *
     * @return external_single_structure
     */
    public static function record_returns(): external_single_structure {
        return new external_single_structure(['ok' => new external_value(PARAM_BOOL, 'Kept')]);
    }
}
