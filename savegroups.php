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
 * Saves the teams made on the board as course groups, only when the teacher asks: a grouping with the date and one group per team.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

$courseid = required_param('courseid', PARAM_INT);
$listname = trim(required_param('listname', PARAM_TEXT));
$teams = json_decode(required_param('teams', PARAM_RAW), true);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
$context = context_course::instance($course->id);
require_capability('local/oksigeniaclasstools:use', $context);
require_capability('moodle/course:managegroups', $context);
require_once(__DIR__ . '/lib.php');
$teams = is_array($teams) ? $teams : [];
$visible = local_oksigeniaclasstools_visible_userids($course, $context);
if ($visible !== null) {
    $teams = array_map(
        fn($team) => is_array($team) ? array_values(array_intersect(array_map('intval', $team), $visible)) : [],
        $teams
    );
}
$grouping = \local_oksigeniaclasstools\local\teams::save_as_groups($course, $listname, $teams);
echo json_encode(['ok' => true, 'grouping' => $grouping->name,
    'url' => (new moodle_url('/group/groupings.php', ['id' => $course->id]))->out(false)]);
