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
 * Shares a drawing board with a class: saved in the course and notified to its students.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

$courseid = required_param('courseid', PARAM_INT);
$listid = required_param('listid', PARAM_ALPHANUM);
$name = required_param('name', PARAM_TEXT);
$format = optional_param('format', 'png', PARAM_ALPHA);
$image = required_param('image', PARAM_RAW);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
$context = context_course::instance($course->id);
require_capability('local/oksigeniaclasstools:use', $context);
require_capability('moodle/course:manageactivities', $context);
$png = base64_decode(preg_replace('#^data:image/png;base64,#', '', $image), true);
$result = \local_oksigeniaclasstools\local\boards::share(
    $course,
    $listid,
    $name,
    $png === false ? '' : $png,
    $format === 'pdf' ? 'pdf' : 'png'
);
echo json_encode(['ok' => true] + (array) $result);
