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
 * What a board in a course has been used for since it last sent it: the tools, games and materials chosen and the seconds
 * of each one, counted for a teacher's board or a student's one.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

use local_oksigeniaclasstools\local\tally;

$courseid = required_param('courseid', PARAM_INT);
$data = required_param('data', PARAM_RAW);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
$context = context_course::instance($course->id);
$who = local_oksigeniaclasstools_mode($context);
if (!$who) {
    require_capability('local/oksigeniaclasstools:use', $context);
}
$items = json_decode($data, true);
echo json_encode(['added' => is_array($items) ? tally::add($course->id, $who, $items) : 0]);
