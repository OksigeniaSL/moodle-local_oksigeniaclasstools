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
 * The board asks for the questions of the Moodle question bank it can use for a quiz: the categories, and the
 * questions of one of them.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\bank;

$courseid = required_param('courseid', PARAM_INT);
$action = required_param('action', PARAM_ALPHA);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
require_capability('local/oksigeniaclasstools:use', context_course::instance($course->id));

if ($action === 'categories') {
    echo json_encode(['categories' => bank::categories($course)]);
} else if ($action === 'questions') {
    echo json_encode(bank::questions($course, required_param('categoryid', PARAM_INT)));
} else {
    throw new moodle_exception('invalidparameter', 'debug');
}
