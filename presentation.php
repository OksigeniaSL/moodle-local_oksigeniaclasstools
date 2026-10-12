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
 * The board asks where a Canva short link leads, to open the presentation behind it.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\presentation;

$courseid = required_param('courseid', PARAM_INT);
$url = required_param('url', PARAM_RAW_TRIMMED);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
require_capability('local/oksigeniaclasstools:use', context_course::instance($course->id));

// Only while the site shows the tab; then the design behind the link, if it leads to one.
$design = presentation::on() ? presentation::resolve($url) : null;
echo json_encode($design ? ['ok' => true] + $design : ['ok' => false, 'off' => !presentation::on()]);
