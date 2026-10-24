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
 * The teacher's fixed remote, from the board: the board asks for its orders, and the teacher turns the remote on or
 * off or changes its address.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class remote extends api {
    /**
     * Parameters of poll.
     *
     * @return external_function_parameters
     */
    public static function poll_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course of the board'),
            'since' => new external_value(PARAM_INT, 'The last order the board has', VALUE_DEFAULT, 0),
            'tool' => new external_value(PARAM_ALPHA, 'The tool on the board', VALUE_DEFAULT, ''),
            'tools' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_ALPHA, 'The tool'),
                'name' => new external_value(PARAM_RAW, 'Its name on the board (cleaned as text)'),
            ]), 'The tools of the board, for the phone to go to them', VALUE_DEFAULT, []),
            'here' => new external_value(PARAM_RAW, 'The buttons of the tool on the board, as JSON', VALUE_DEFAULT, ''),
        ]);
    }

    /**
     * The orders of the phone for this board (every second and a half while it is open), and what the board has.
     *
     * @param int $courseid
     * @param int $since
     * @param string $tool
     * @param array $tools
     * @param string $here
     * @return array json: on, seq, the orders and whether the phone is there
     */
    public static function poll(int $courseid, int $since = 0, string $tool = '', array $tools = [], string $here = ''): array {
        global $USER;
        $params = self::validate_parameters(self::poll_parameters(), [
            'courseid' => $courseid, 'since' => $since, 'tool' => $tool, 'tools' => $tools, 'here' => $here,
        ]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        self::require_live();
        // Every second and a half: the session is not kept locked.
        \core\session\manager::write_close();
        $list = [];
        foreach ($params['tools'] as $item) {
            $name = trim(clean_param($item['name'], PARAM_TEXT));
            if (preg_match('/^[a-z]{2,20}$/', $item['id']) && $name !== '' && count($list) < 30) {
                $list[] = [$item['id'], \core_text::substr($name, 0, 40)];
            }
        }
        return self::json(local_remote::board(
            (int) $USER->id,
            $course,
            $params['since'],
            $params['tool'],
            $list,
            local_remote::here($params['here'])
        ));
    }

    /**
     * Answer of poll.
     *
     * @return external_single_structure
     */
    public static function poll_returns(): external_single_structure {
        return self::json_returns('Whether the remote is on, its last order (seq), the orders since then and the phone');
    }

    /**
     * Parameters of status and rotate.
     *
     * @return external_function_parameters
     */
    public static function status_parameters(): external_function_parameters {
        return new external_function_parameters(['courseid' => new external_value(PARAM_INT, 'The course of the board')]);
    }

    /**
     * Whether the teacher's remote is on, and its address.
     *
     * @param int $courseid
     * @return array on, and url when on
     */
    public static function status(int $courseid): array {
        global $USER;
        $params = self::validate_parameters(self::status_parameters(), ['courseid' => $courseid]);
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        self::require_live();
        return local_remote::status((int) $USER->id);
    }

    /**
     * The status of the remote, as an answer.
     *
     * @return external_single_structure
     */
    public static function status_returns(): external_single_structure {
        return new external_single_structure([
            'on' => new external_value(PARAM_BOOL, 'Whether it is on'),
            'url' => new external_value(PARAM_URL, 'Its address, when on', VALUE_OPTIONAL),
        ]);
    }

    /**
     * Parameters of enable.
     *
     * @return external_function_parameters
     */
    public static function enable_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course of the board'),
            'on' => new external_value(PARAM_BOOL, 'On or off'),
        ]);
    }

    /**
     * Turns the teacher's remote on or off.
     *
     * @param int $courseid
     * @param bool $on
     * @return array on, and url when on
     */
    public static function enable(int $courseid, bool $on): array {
        global $USER;
        $params = self::validate_parameters(self::enable_parameters(), ['courseid' => $courseid, 'on' => $on]);
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        self::require_live();
        local_remote::set_enabled((int) $USER->id, (bool) $params['on']);
        return local_remote::status((int) $USER->id);
    }

    /**
     * Answer of enable.
     *
     * @return external_single_structure
     */
    public static function enable_returns(): external_single_structure {
        return self::status_returns();
    }

    /**
     * Parameters of rotate.
     *
     * @return external_function_parameters
     */
    public static function rotate_parameters(): external_function_parameters {
        return self::status_parameters();
    }

    /**
     * A new address for the teacher's remote (the old one stops working).
     *
     * @param int $courseid
     * @return array on, and url when on
     */
    public static function rotate(int $courseid): array {
        global $USER;
        $params = self::validate_parameters(self::rotate_parameters(), ['courseid' => $courseid]);
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        self::require_live();
        local_remote::rotate((int) $USER->id);
        return local_remote::status((int) $USER->id);
    }

    /**
     * Answer of rotate.
     *
     * @return external_single_structure
     */
    public static function rotate_returns(): external_single_structure {
        return self::status_returns();
    }
}
