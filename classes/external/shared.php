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
use local_oksigeniaclasstools\local\shared as local_shared;

/**
 * Class lists, letter wheels and locks shared with the whole school: the ones there are, sharing one, and stopping.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class shared extends api {
    /**
     * Whether the user can remove what others shared.
     *
     * @return bool
     */
    private static function can_manage(): bool {
        return has_capability('local/oksigeniaclasstools:manageshared', \context_system::instance());
    }

    /**
     * Parameters of items.
     *
     * @return external_function_parameters
     */
    public static function items_parameters(): external_function_parameters {
        return new external_function_parameters([
            'kind' => new external_value(PARAM_ALPHA, 'lists, roscos or locks'),
            'courseid' => new external_value(PARAM_INT, 'The course the board is open in'),
        ]);
    }

    /**
     * What the school shares of a kind (nothing when the site turns sharing off).
     *
     * @param string $kind
     * @param int $courseid
     * @return array items
     */
    public static function items(string $kind, int $courseid): array {
        global $USER;
        $params = self::validate_parameters(self::items_parameters(), ['kind' => $kind, 'courseid' => $courseid]);
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        if (!local_shared::on()) {
            return ['items' => []];
        }
        return ['items' => local_shared::items($params['kind'], (int) $USER->id, self::can_manage())];
    }

    /**
     * Answer of items.
     *
     * @return external_single_structure
     */
    public static function items_returns(): external_single_structure {
        return new external_single_structure([
            'items' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_INT, 'The shared item'),
                'name' => new external_value(PARAM_TEXT, 'Its name'),
                'data' => new external_value(PARAM_RAW, 'The item as the board keeps it, a JSON document'),
                'author' => new external_value(PARAM_TEXT, 'Who shared it'),
                'mine' => new external_value(PARAM_BOOL, 'Shared by the user who looks'),
                'candelete' => new external_value(PARAM_BOOL, 'The user who looks can remove it'),
            ])),
        ]);
    }

    /**
     * Parameters of save.
     *
     * @return external_function_parameters
     */
    public static function save_parameters(): external_function_parameters {
        return new external_function_parameters([
            'kind' => new external_value(PARAM_ALPHA, 'lists, roscos or locks'),
            'courseid' => new external_value(PARAM_INT, 'The course the board is open in'),
            'name' => new external_value(PARAM_RAW, 'Its name (cleaned as text)'),
            'data' => new external_value(PARAM_RAW, 'The item as the board keeps it, a JSON document'),
            'id' => new external_value(PARAM_INT, 'What the user shared before, to update it (0: something new)', VALUE_DEFAULT, 0),
        ]);
    }

    /**
     * Shares an item with the school, or updates the one the user shared.
     *
     * @param string $kind
     * @param int $courseid
     * @param string $name
     * @param string $data
     * @param int $id
     * @return array id
     */
    public static function save(string $kind, int $courseid, string $name, string $data, int $id = 0): array {
        global $USER;
        $params = self::validate_parameters(
            self::save_parameters(),
            ['kind' => $kind, 'courseid' => $courseid, 'name' => $name, 'data' => $data, 'id' => $id]
        );
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        if (!local_shared::on()) {
            throw new \moodle_exception('sharedoff', 'local_oksigeniaclasstools');
        }
        return ['id' => local_shared::save($params['kind'], $params['name'], $params['data'], (int) $USER->id, $params['id'])];
    }

    /**
     * Answer of save.
     *
     * @return external_single_structure
     */
    public static function save_returns(): external_single_structure {
        return new external_single_structure(['id' => new external_value(PARAM_INT, 'The shared item')]);
    }

    /**
     * Parameters of delete.
     *
     * @return external_function_parameters
     */
    public static function delete_parameters(): external_function_parameters {
        return new external_function_parameters(['id' => new external_value(PARAM_INT, 'The shared item')]);
    }

    /**
     * Stops sharing an item: its author, or a manager.
     *
     * @param int $id
     * @return array ok
     */
    public static function delete(int $id): array {
        global $USER;
        $params = self::validate_parameters(self::delete_parameters(), ['id' => $id]);
        self::validate_context(\context_system::instance());
        local_shared::delete($params['id'], (int) $USER->id, self::can_manage());
        return ['ok' => true];
    }

    /**
     * Answer of delete.
     *
     * @return external_single_structure
     */
    public static function delete_returns(): external_single_structure {
        return new external_single_structure(['ok' => new external_value(PARAM_BOOL, 'Removed')]);
    }
}
