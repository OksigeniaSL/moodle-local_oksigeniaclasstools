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
use local_oksigeniaclasstools\local\remote as local_remote;

/**
 * The teacher's fixed remote, on the phone: it comes with the key of its address and no Moodle session, so the key is
 * what says whose it is.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class phone extends api {
    /**
     * The remote of a key, if it is on and live sessions are on in the site.
     *
     * @param string $key
     * @return \stdClass|null
     */
    private static function remote(string $key): ?\stdClass {
        self::without_session();
        $row = local_remote::by_token(clean_param($key, PARAM_ALPHANUM));
        return $row && get_config('local_oksigeniaclasstools', 'live') !== '0' ? $row : null;
    }

    /**
     * Parameters of state.
     *
     * @return external_function_parameters
     */
    public static function state_parameters(): external_function_parameters {
        return new external_function_parameters(['k' => new external_value(PARAM_RAW, 'The key of the remote')]);
    }

    /**
     * The teacher's open boards, for the phone.
     *
     * @param string $k
     * @return array json: the boards, or off
     */
    public static function state(string $k): array {
        $params = self::validate_parameters(self::state_parameters(), ['k' => $k]);
        $row = self::remote($params['k']);
        return self::json($row ? local_remote::phone($row) : ['off' => true]);
    }

    /**
     * Answer of state.
     *
     * @return external_single_structure
     */
    public static function state_returns(): external_single_structure {
        return self::json_returns('The open boards of the teacher, for the phone');
    }

    /**
     * Parameters of courses.
     *
     * @return external_function_parameters
     */
    public static function courses_parameters(): external_function_parameters {
        return self::state_parameters();
    }

    /**
     * The teacher's courses, to send the board to another class.
     *
     * @param string $k
     * @return array off; or courses
     */
    public static function courses(string $k): array {
        $params = self::validate_parameters(self::courses_parameters(), ['k' => $k]);
        $row = self::remote($params['k']);
        return $row ? ['courses' => local_remote::courses((int) $row->userid)] : ['off' => true];
    }

    /**
     * Answer of courses.
     *
     * @return external_single_structure
     */
    public static function courses_returns(): external_single_structure {
        return new external_single_structure([
            'off' => new external_value(PARAM_BOOL, 'The remote is off, or its address changed', VALUE_OPTIONAL),
            'courses' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_INT, 'The course'),
                'name' => new external_value(PARAM_TEXT, 'Its name'),
            ]), 'The teacher\'s courses', VALUE_OPTIONAL),
        ]);
    }

    /**
     * Parameters of command.
     *
     * @return external_function_parameters
     */
    public static function command_parameters(): external_function_parameters {
        return new external_function_parameters([
            'k' => new external_value(PARAM_RAW, 'The key of the remote'),
            'cmd' => new external_value(PARAM_ALPHANUMEXT, 'The order'),
            'course' => new external_value(PARAM_INT, 'The course of the board it is for'),
        ]);
    }

    /**
     * An order from the phone, for an open board.
     *
     * @param string $k
     * @param string $cmd
     * @param int $course
     * @return array off; or ok, and why not
     */
    public static function command(string $k, string $cmd, int $course): array {
        $params = self::validate_parameters(self::command_parameters(), ['k' => $k, 'cmd' => $cmd, 'course' => $course]);
        $row = self::remote($params['k']);
        return $row ? local_remote::command($row, $params['cmd'], $params['course']) : ['off' => true];
    }

    /**
     * Answer of command.
     *
     * @return external_single_structure
     */
    public static function command_returns(): external_single_structure {
        return new external_single_structure([
            'off' => new external_value(PARAM_BOOL, 'The remote is off, or its address changed', VALUE_OPTIONAL),
            'ok' => new external_value(PARAM_BOOL, 'The order is on its way', VALUE_OPTIONAL),
            'why' => new external_value(PARAM_ALPHA, 'Why not: unknown, closed, gone or toofast', VALUE_OPTIONAL),
        ]);
    }
}
