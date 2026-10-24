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
use local_oksigeniaclasstools\local\logros as local_logros;

/**
 * The teacher's stickers: a real use of a tool with a class, and the «Now you» of its guided help, done.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class logros extends api {
    /**
     * Parameters of record.
     *
     * @return external_function_parameters
     */
    public static function record_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'cromo' => new external_value(PARAM_ALPHA, 'The sticker'),
        ]);
    }

    /**
     * A real use of a tool with a class, for its sticker (once per sticker, course and day).
     *
     * @param int $courseid
     * @param string $cromo
     * @return array off; or cromo, days, level and up
     */
    public static function record(int $courseid, string $cromo): array {
        global $USER;
        $params = self::validate_parameters(self::record_parameters(), ['courseid' => $courseid, 'cromo' => $cromo]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        if (!local_logros::on()) {
            return ['off' => true];
        }
        return local_logros::record((int) $USER->id, (int) $course->id, $params['cromo']);
    }

    /**
     * Answer of record.
     *
     * @return external_single_structure
     */
    public static function record_returns(): external_single_structure {
        return new external_single_structure([
            'off' => new external_value(PARAM_BOOL, 'The stickers are off in the site', VALUE_OPTIONAL),
            'cromo' => new external_value(PARAM_ALPHA, 'The sticker', VALUE_OPTIONAL),
            'days' => new external_value(PARAM_INT, 'Its days of use', VALUE_OPTIONAL),
            'level' => new external_value(PARAM_INT, 'Its level', VALUE_OPTIONAL),
            'up' => new external_value(PARAM_BOOL, 'Whether the level went up with this use', VALUE_OPTIONAL),
        ]);
    }

    /**
     * Parameters of learn.
     *
     * @return external_function_parameters
     */
    public static function learn_parameters(): external_function_parameters {
        return self::record_parameters();
    }

    /**
     * The «Now you» of the guided help of a tool, done: its sticker is learned.
     *
     * @param int $courseid
     * @param string $cromo
     * @return array off; or cromo, learned and before
     */
    public static function learn(int $courseid, string $cromo): array {
        global $USER;
        $params = self::validate_parameters(self::learn_parameters(), ['courseid' => $courseid, 'cromo' => $cromo]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        if (!local_logros::on()) {
            return ['off' => true];
        }
        return local_logros::learn((int) $USER->id, (int) $course->id, $params['cromo']);
    }

    /**
     * Answer of learn.
     *
     * @return external_single_structure
     */
    public static function learn_returns(): external_single_structure {
        return new external_single_structure([
            'off' => new external_value(PARAM_BOOL, 'The stickers are off in the site', VALUE_OPTIONAL),
            'cromo' => new external_value(PARAM_ALPHA, 'The sticker', VALUE_OPTIONAL),
            'learned' => new external_value(PARAM_BOOL, 'Learned', VALUE_OPTIONAL),
            'before' => new external_value(PARAM_BOOL, 'Whether it was learned already', VALUE_OPTIONAL),
        ]);
    }
}
