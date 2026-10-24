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
 * What a board in a course has been used for since it last sent it, for the report «Use of the boards».
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tally extends api {
    /**
     * Parameters of add.
     *
     * @return external_function_parameters
     */
    public static function add_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'items' => new external_multiple_structure(new external_single_structure([
                'tool' => new external_value(PARAM_SAFEPATH, 'A tab, or a game or material inside it (juegos/rosco)'),
                'opens' => new external_value(PARAM_INT, 'Times chosen'),
                'seconds' => new external_value(PARAM_INT, 'Seconds in use'),
            ]), 'What was used'),
        ]);
    }

    /**
     * Adds what a teacher's board or a student's one has been used for.
     *
     * @param int $courseid
     * @param array $items
     * @return array added
     */
    public static function add(int $courseid, array $items): array {
        global $CFG;
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        $params = self::validate_parameters(self::add_parameters(), ['courseid' => $courseid, 'items' => $items]);
        [$course, $context] = self::course($params['courseid']);
        $who = local_oksigeniaclasstools_mode($context);
        if (!$who) {
            require_capability('local/oksigeniaclasstools:use', $context);
        }
        $counts = [];
        foreach ($params['items'] as $item) {
            $counts[$item['tool']] = [$item['opens'], $item['seconds']];
        }
        return ['added' => \local_oksigeniaclasstools\local\tally::add($course->id, $who, $counts)];
    }

    /**
     * Answer of add.
     *
     * @return external_single_structure
     */
    public static function add_returns(): external_single_structure {
        return new external_single_structure(['added' => new external_value(PARAM_INT, 'How many items were added')]);
    }
}
