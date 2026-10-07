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
 * Keeps what the teacher has of a tool in a course (scoreboard, roscos…) to go on from any computer.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

$courseid = required_param('courseid', PARAM_INT);
$tool = required_param('tool', PARAM_ALPHANUMEXT);
$data = required_param('data', PARAM_RAW);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
$context = context_course::instance($course->id);
require_capability('local/oksigeniaclasstools:use', $context);
\local_oksigeniaclasstools\local\kept::save($course->id, $USER->id, $tool, $data);
echo json_encode(['ok' => true]);
