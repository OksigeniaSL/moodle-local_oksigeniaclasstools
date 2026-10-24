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
 * The picture of a quiz question, kept for the teacher in the course (the board sends it already made smaller).
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class quizimage extends api {
    /**
     * Parameters of save.
     *
     * @return external_function_parameters
     */
    public static function save_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'image' => new external_value(PARAM_RAW, 'The picture as a data URL (data:image/…;base64,…)'),
        ]);
    }

    /**
     * Keeps the picture of a quiz question.
     *
     * @param int $courseid
     * @param string $image
     * @return array ok, name
     */
    public static function save(int $courseid, string $image): array {
        global $USER;
        $params = self::validate_parameters(self::save_parameters(), ['courseid' => $courseid, 'image' => $image]);
        [, $context] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        $bytes = preg_match('#^data:image/[a-z]+;base64,(.+)$#s', $params['image'], $m) ? base64_decode($m[1], true) : false;
        $name = \local_oksigeniaclasstools\local\quizimages::save($context, (int) $USER->id, $bytes === false ? '' : $bytes);
        return ['ok' => true, 'name' => $name];
    }

    /**
     * Answer of save.
     *
     * @return external_single_structure
     */
    public static function save_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'Kept'),
            'name' => new external_value(PARAM_FILE, 'The name of the picture, for the question'),
        ]);
    }
}
