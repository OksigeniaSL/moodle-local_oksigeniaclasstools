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
use local_oksigeniaclasstools\local\sala as local_sala;

/**
 * The teachers' room: a teacher comes into it or leaves it, and the room as they see it.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class sala extends api {
    /**
     * The room as the teacher sees it now, or off.
     *
     * @return array
     */
    private static function room(): array {
        global $CFG, $USER;
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        return self::json(local_oksigeniaclasstools_sala_view((int) $USER->id));
    }

    /**
     * Only teachers see the room or come into it: its names and stickers are for colleagues.
     */
    private static function require_teacher(): void {
        global $USER;
        if (!local_sala::can_join((int) $USER->id)) {
            throw new \required_capability_exception(
                \context_system::instance(),
                'local/oksigeniaclasstools:use',
                'nopermissions',
                ''
            );
        }
    }

    /**
     * Parameters of view.
     *
     * @return external_function_parameters
     */
    public static function view_parameters(): external_function_parameters {
        return new external_function_parameters([]);
    }

    /**
     * The room as the teacher sees it.
     *
     * @return array json: the room, or off
     */
    public static function view(): array {
        self::validate_parameters(self::view_parameters(), []);
        self::validate_context(\context_system::instance());
        if (!local_sala::on()) {
            return self::json(['off' => true]);
        }
        self::require_teacher();
        return self::room();
    }

    /**
     * Answer of view.
     *
     * @return external_single_structure
     */
    public static function view_returns(): external_single_structure {
        return self::json_returns('The room as the teacher sees it');
    }

    /**
     * Parameters of join.
     *
     * @return external_function_parameters
     */
    public static function join_parameters(): external_function_parameters {
        return new external_function_parameters(['join' => new external_value(PARAM_BOOL, 'Come in (or leave)')]);
    }

    /**
     * The teacher comes into the room or leaves it (anyone can leave it).
     *
     * @param bool $join
     * @return array json: the room, or off
     */
    public static function join(bool $join): array {
        global $USER;
        $params = self::validate_parameters(self::join_parameters(), ['join' => $join]);
        self::validate_context(\context_system::instance());
        if (!local_sala::on()) {
            return self::json(['off' => true]);
        }
        if ($params['join']) {
            self::require_teacher();
        }
        local_sala::join((int) $USER->id, (bool) $params['join']);
        return self::room();
    }

    /**
     * Answer of join.
     *
     * @return external_single_structure
     */
    public static function join_returns(): external_single_structure {
        return self::json_returns('The room as the teacher sees it');
    }
}
