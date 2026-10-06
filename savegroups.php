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
require_once($CFG->dirroot . '/group/lib.php');
require_once(__DIR__ . '/lib.php');

$courseid = required_param('courseid', PARAM_INT);
$listname = trim(required_param('listname', PARAM_TEXT));
$teams = json_decode(required_param('teams', PARAM_RAW), true);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
$context = context_course::instance($course->id);
require_capability('local/oksigeniaclasstools:use', $context);
require_capability('moodle/course:managegroups', $context);
if (!is_array($teams) || !$teams) {
    throw new moodle_exception('invalidparameter', 'debug');
}
foreach ($teams as $i => $userids) {
    if (!is_array($userids)) {
        throw new moodle_exception('invalidparameter', 'debug');
    }
    $teams[$i] = array_values(array_filter(array_map('intval', $userids),
        fn($u) => is_enrolled($context, $u, 'moodle/course:isincompletionreports', true)));
}

$when = userdate(time(), get_string('strftimedatetimeshort', 'core_langconfig'));
// Group and grouping names must not repeat within the course.
$freename = function (string $table, string $name) use ($DB, $course): string {
    $candidate = $name;
    for ($i = 2; $DB->record_exists($table, ['courseid' => $course->id, 'name' => $candidate]); $i++) {
        $candidate = "$name ($i)";
    }
    return $candidate;
};
$groupingname = $freename('groupings', get_string('groupingname', 'local_oksigeniaclasstools',
    (object) ['list' => $listname, 'when' => $when]));
$groupingid = groups_create_grouping((object) [
    'courseid' => $course->id,
    'name' => $groupingname,
    'idnumber' => LOCAL_OKSIGENIACLASSTOOLS_GROUPING_PREFIX . time() . '-' . random_int(100, 999),
]);
foreach ($teams as $i => $userids) {
    $groupid = groups_create_group((object) ['courseid' => $course->id,
        'name' => $freename('groups', get_string('teamname', 'local_oksigeniaclasstools',
            (object) ['n' => $i + 1, 'list' => $listname, 'when' => $when]))]);
    groups_assign_grouping($groupingid, $groupid);
    foreach ($userids as $userid) {
        groups_add_member($groupid, $userid);
    }
}
echo json_encode(['ok' => true, 'grouping' => $groupingname,
    'url' => (new moodle_url('/group/groupings.php', ['id' => $course->id]))->out(false)]);
