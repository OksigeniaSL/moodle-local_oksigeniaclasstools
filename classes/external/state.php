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
 * What a teacher keeps of a tool in a course (scoreboard, letter wheels, quizzes, board pages…), to go on from another
 * computer.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class state extends api {
    /**
     * Parameters of save.
     *
     * @return external_function_parameters
     */
    public static function save_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'tool' => new external_value(PARAM_ALPHANUMEXT, 'The tool'),
            'data' => new external_value(PARAM_RAW, 'What the tool keeps, as the JSON document the board writes'),
        ]);
    }

    /**
     * Keeps what a tool has, for the teacher in the course.
     *
     * @param int $courseid
     * @param string $tool
     * @param string $data
     * @return array ok
     */
    public static function save(int $courseid, string $tool, string $data): array {
        global $USER;
        $params = self::validate_parameters(self::save_parameters(), ['courseid' => $courseid, 'tool' => $tool, 'data' => $data]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        \local_oksigeniaclasstools\local\kept::save($course->id, $USER->id, $params['tool'], $params['data']);
        return ['ok' => true];
    }

    /**
     * Answer of save.
     *
     * @return external_single_structure
     */
    public static function save_returns(): external_single_structure {
        return new external_single_structure(['ok' => new external_value(PARAM_BOOL, 'Kept')]);
    }
}
