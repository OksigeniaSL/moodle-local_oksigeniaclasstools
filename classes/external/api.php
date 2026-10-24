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

use core_external\external_api;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * What the web services of the board share: the course they act on, checked as the board's pages check it, the
 * switch of live sessions, and the answers that are a JSON document (the state of a live session, the teachers' room…),
 * too nested and too changing for a fixed structure.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class api extends external_api {
    /**
     * The course and its context, for a user logged in to it who has the capabilities given.
     *
     * @param int $courseid
     * @param string ...$capabilities
     * @return array [course, context]
     */
    protected static function course(int $courseid, string ...$capabilities): array {
        $course = get_course($courseid);
        $context = \context_course::instance($course->id);
        self::validate_context($context);
        foreach ($capabilities as $capability) {
            require_capability($capability, $context);
        }
        return [$course, $context];
    }

    /**
     * Live sessions and the fixed remote, unless the site turns them off.
     */
    protected static function require_live(): void {
        if (get_config('local_oksigeniaclasstools', 'live') === '0') {
            throw new \moodle_exception('livedisabled', 'local_oksigeniaclasstools');
        }
    }

    /**
     * For a call that comes without a Moodle session (a device with the code, the phone with its key).
     */
    protected static function without_session(): void {
        global $PAGE;
        $PAGE->set_context(\context_system::instance());
    }

    /**
     * The description of an answer that is a JSON document.
     *
     * @param string $what What the document is.
     * @return external_single_structure
     */
    protected static function json_returns(string $what): external_single_structure {
        return new external_single_structure(['json' => new external_value(PARAM_RAW, $what . ', as a JSON document')]);
    }

    /**
     * A JSON document as the answer.
     *
     * @param mixed $value
     * @return array
     */
    protected static function json($value): array {
        return ['json' => json_encode($value, JSON_UNESCAPED_UNICODE)];
    }
}
