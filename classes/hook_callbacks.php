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

/**
 * Hook callbacks: navigation, and the notice of a live session.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_oksigeniaclasstools;

use core\hook\navigation\primary_extend;
use core\hook\navigation\secondary_extend;
use moodle_url;
use navigation_node;
use pix_icon;

/**
 * Links to the classroom tools, and the notice of a live session.
 */
class hook_callbacks {
    /**
     * At the top of every page: the notice of a live session for the students of its course (Moodle 4.4 and later).
     *
     * @param \core\hook\output\before_standard_top_of_body_html_generation $hook
     */
    public static function before_standard_top_of_body_html(
        \core\hook\output\before_standard_top_of_body_html_generation $hook
    ): void {
        $hook->add_html(\local_oksigeniaclasstools\local\notice::html());
    }

    /**
     * In the course bar, right after «Course» (otherwise it would end up in the «More» menu). For teachers, and for
     * students when the site opens the board to them.
     *
     * @param secondary_extend $hook
     */
    public static function secondary_extend(secondary_extend $hook): void {
        global $CFG, $PAGE;
        $course = $PAGE->course;
        if (!$course || $course->id == SITEID) {
            return;
        }
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        if (!local_oksigeniaclasstools_mode(\context_course::instance($course->id))) {
            return;
        }
        $view = $hook->get_secondaryview();
        $node = navigation_node::create(
            get_string('navlabel', 'local_oksigeniaclasstools'),
            new moodle_url('/local/oksigeniaclasstools/index.php', ['id' => $course->id]),
            navigation_node::TYPE_CUSTOM,
            null,
            'local_oksigeniaclasstools',
            new pix_icon('i/group', '')
        );
        $view->add_node($node, $view->get('editsettings') ? 'editsettings' : null);
    }

    /**
     * In the main menu, for anyone who teaches a course (from inside a course it goes straight to that course).
     *
     * @param primary_extend $hook
     */
    public static function primary_extend(primary_extend $hook): void {
        global $PAGE, $SESSION, $USER;
        if (!get_config('local_oksigeniaclasstools', 'menu') || !isloggedin() || isguestuser()) {
            return;
        }
        $course = $PAGE->course;
        if (
            $course && $course->id != SITEID
                && has_capability('local/oksigeniaclasstools:use', \context_course::instance($course->id))
        ) {
            $url = new moodle_url('/local/oksigeniaclasstools/index.php', ['id' => $course->id]);
        } else {
            // Checked once per session.
            if (!isset($SESSION->local_oksigeniaclasstools_teaches)) {
                $SESSION->local_oksigeniaclasstools_teaches =
                    (bool) get_user_capability_course('local/oksigeniaclasstools:use', $USER->id, true, '', '', 1);
            }
            if (!$SESSION->local_oksigeniaclasstools_teaches) {
                return;
            }
            $url = new moodle_url('/local/oksigeniaclasstools/index.php');
        }
        $hook->get_primaryview()->add(
            get_string('navlabel', 'local_oksigeniaclasstools'),
            $url,
            navigation_node::TYPE_ROOTNODE,
            null,
            'local_oksigeniaclasstools',
            new pix_icon('i/group', '')
        );
    }
}
