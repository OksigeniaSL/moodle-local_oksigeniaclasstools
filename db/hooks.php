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
 * Hook callbacks: links in the course bar and in the main menu (only for teachers), and the notice of a live session
 * for students.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$callbacks = [
    [
        'hook' => \core\hook\navigation\secondary_extend::class,
        'callback' => [\local_oksigeniaclasstools\hook_callbacks::class, 'secondary_extend'],
    ],
    [
        'hook' => \core\hook\navigation\primary_extend::class,
        'callback' => [\local_oksigeniaclasstools\hook_callbacks::class, 'primary_extend'],
    ],
    [
        'hook' => \core\hook\output\before_standard_top_of_body_html_generation::class,
        'callback' => [\local_oksigeniaclasstools\hook_callbacks::class, 'before_standard_top_of_body_html'],
    ],
];
