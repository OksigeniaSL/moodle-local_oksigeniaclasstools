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
 * A page of the drawing board, shared with a class: saved in the course and notified to its students.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class board extends api {
    /**
     * Parameters of share.
     *
     * @return external_function_parameters
     */
    public static function share_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'listid' => new external_value(PARAM_ALPHANUM, 'The class list it is for'),
            'name' => new external_value(PARAM_RAW, 'The name of the page (cleaned as text)'),
            'format' => new external_value(PARAM_ALPHA, 'png or pdf', VALUE_DEFAULT, 'png'),
            'image' => new external_value(PARAM_RAW, 'The page as a PNG data URL'),
        ]);
    }

    /**
     * Shares a page of the board with a class.
     *
     * @param int $courseid
     * @param string $listid
     * @param string $name
     * @param string $format
     * @param string $image
     * @return array ok, folder, url, filename, notified
     */
    public static function share(int $courseid, string $listid, string $name, string $format, string $image): array {
        $params = self::validate_parameters(self::share_parameters(), [
            'courseid' => $courseid, 'listid' => $listid, 'name' => $name, 'format' => $format, 'image' => $image,
        ]);
        [$course] = self::course(
            $params['courseid'],
            'local/oksigeniaclasstools:use',
            'moodle/course:manageactivities'
        );
        $png = base64_decode(preg_replace('#^data:image/png;base64,#', '', $params['image']), true);
        $result = \local_oksigeniaclasstools\local\boards::share(
            $course,
            $params['listid'],
            clean_param($params['name'], PARAM_TEXT),
            $png === false ? '' : $png,
            $params['format'] === 'pdf' ? 'pdf' : 'png'
        );
        return ['ok' => true] + (array) $result;
    }

    /**
     * Answer of share.
     *
     * @return external_single_structure
     */
    public static function share_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'Shared'),
            'folder' => new external_value(PARAM_TEXT, 'The folder of the course where it is'),
            'url' => new external_value(PARAM_URL, 'The address of the folder'),
            'filename' => new external_value(PARAM_FILE, 'The name of the file'),
            'notified' => new external_value(PARAM_INT, 'How many students were notified'),
        ]);
    }
}
