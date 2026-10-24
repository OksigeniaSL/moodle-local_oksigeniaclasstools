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
use local_oksigeniaclasstools\local\presentation as local_presentation;

/**
 * Where a Canva short link leads, for the presentation tab (only while the site shows it).
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class presentation extends api {
    /**
     * Parameters of resolve.
     *
     * @return external_function_parameters
     */
    public static function resolve_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'url' => new external_value(PARAM_RAW, 'The link the teacher pasted'),
        ]);
    }

    /**
     * The design behind a Canva link, if it leads to one.
     *
     * @param int $courseid
     * @param string $url
     * @return array json: ok and the design; or ok false, and off when the site does not show the tab
     */
    public static function resolve(int $courseid, string $url): array {
        $params = self::validate_parameters(self::resolve_parameters(), ['courseid' => $courseid, 'url' => $url]);
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        $design = local_presentation::on() ? local_presentation::resolve(trim($params['url'])) : null;
        return self::json($design ? ['ok' => true] + $design : ['ok' => false, 'off' => !local_presentation::on()]);
    }

    /**
     * Answer of resolve.
     *
     * @return external_single_structure
     */
    public static function resolve_returns(): external_single_structure {
        return self::json_returns('The design behind the link');
    }
}
