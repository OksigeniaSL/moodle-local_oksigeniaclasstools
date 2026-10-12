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
 * The board tells of a real use of a tool with the class: kept for the teacher's stickers, and back the level of its
 * sticker and whether it went up.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\logros;

$courseid = required_param('courseid', PARAM_INT);
$cromo = required_param('cromo', PARAM_ALPHA);
// What happened: a real use with a class («use»), or the «Now you» of the guided help of the tool, done («learn»).
$action = optional_param('action', 'use', PARAM_ALPHA);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
require_capability('local/oksigeniaclasstools:use', context_course::instance($course->id));
if (!logros::on()) {
    echo json_encode(['off' => true]);
    exit;
}
if ($action === 'learn') {
    echo json_encode(logros::learn((int) $USER->id, (int) $course->id, $cromo));
    exit;
}
echo json_encode(logros::record((int) $USER->id, (int) $course->id, $cromo));
