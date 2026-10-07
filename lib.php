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
 * Library functions: the data the classroom screen needs for a course.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/** Prefix of the idnumber of groupings saved from the board (their groups are not offered as lists). */
const LOCAL_OKSIGENIACLASSTOOLS_GROUPING_PREFIX = 'oksigeniaclasstools-';

/**
 * Screen data for a course: its name, the way back and the lists with each student's name and photo.
 *
 * One list per group and per cohort enrolled with cohort sync (a course with cohorts 5A to 5F gives six lists),
 * sorted by name, and the whole course last. A group and a cohort with the same members or the same name appear
 * once. Separate groups mode is respected for whoever opens the screen.
 *
 * @param stdClass $course
 * @param context_course $context
 * @return array
 */
function local_oksigeniaclasstools_data(stdClass $course, context_course $context): array {
    global $DB, $USER, $PAGE;

    $namestyle = get_config('local_oksigeniaclasstools', 'namestyle') ?: 'firstsurname';
    $displayname = function (stdClass $user) use ($namestyle): string {
        if ($namestyle === 'full') {
            return fullname($user);
        }
        $surname = preg_split('/\s+/', trim($user->lastname))[0] ?? '';
        return $namestyle === 'first' ? trim($user->firstname) : trim($user->firstname . ' ' . $surname);
    };

    // Picks in this course during the last days (fair picking and participation).
    $days = max(1, (int) (get_config('local_oksigeniaclasstools', 'days') ?: 90));
    $picks = $DB->get_records_sql_menu('SELECT userid, COUNT(1)
                                          FROM {local_oksigeniaclasstools_picks}
                                         WHERE courseid = ? AND timecreated > ?
                                      GROUP BY userid', [$course->id, time() - $days * DAYSECS]);

    // Students: users shown in completion reports (the student role), active enrolments only.
    $students = [];
    $enrolled = get_enrolled_users($context, 'moodle/course:isincompletionreports', 0, 'u.*', 'u.firstname, u.lastname',
        0, 0, true);
    foreach ($enrolled as $user) {
        $student = ['n' => $displayname($user), 'i' => (int) $user->id, 'v' => (int) ($picks[$user->id] ?? 0)];
        if ($user->picture) {
            $picture = new user_picture($user);
            $picture->size = 200; // The large one (f3).
            $student['f'] = $picture->get_url($PAGE)->out(false);
        }
        $students[(int) $user->id] = $student;
    }

    $classes = [];
    $add = function (string $id, string $name, array $userids) use ($students, &$classes): void {
        $members = array_intersect_key($students, array_flip(array_map('intval', $userids)));
        $key = implode(',', array_keys($members));
        $repeated = in_array($key, array_column($classes, 'key'), true)
            || in_array(core_text::strtolower($name), array_map('core_text::strtolower', array_column($classes, 'name')), true);
        if ($members && !$repeated) {
            $classes[] = ['id' => $id, 'name' => $name, 'students' => array_values($members), 'key' => $key];
        }
    };

    $accessall = has_capability('moodle/site:accessallgroups', $context);
    $separate = !$accessall && groups_get_course_groupmode($course) == SEPARATEGROUPS;
    $groups = groups_get_all_groups($course->id, $accessall ? 0 : $USER->id);
    // Teams saved from the board are not classes: they are not offered as lists.
    $saved = $DB->get_fieldset_sql('SELECT gg.groupid
                                      FROM {groupings_groups} gg
                                      JOIN {groupings} g ON g.id = gg.groupingid
                                     WHERE g.courseid = ? AND ' . $DB->sql_like('g.idnumber', '?'),
        [$course->id, LOCAL_OKSIGENIACLASSTOOLS_GROUPING_PREFIX . '%']);
    foreach (array_diff_key($groups, array_flip($saved)) as $group) {
        $add('g' . $group->id, format_string($group->name, true, ['context' => $context]),
            array_keys(groups_get_members($group->id, 'u.id')));
    }
    if (!$separate) {
        // Cohorts enrolled in the course with cohort sync.
        $cohorts = $DB->get_records_sql("SELECT DISTINCT c.id, c.name, c.contextid
                                           FROM {enrol} e
                                           JOIN {cohort} c ON c.id = e.customint1
                                          WHERE e.courseid = :courseid AND e.enrol = 'cohort' AND e.status = :enabled",
            ['courseid' => $course->id, 'enabled' => ENROL_INSTANCE_ENABLED]);
        foreach ($cohorts as $cohort) {
            $add('h' . $cohort->id, format_string($cohort->name, true, ['context' => context::instance_by_id($cohort->contextid)]),
                $DB->get_fieldset_select('cohort_members', 'userid', 'cohortid = ?', [$cohort->id]));
        }
    }
    usort($classes, fn($a, $b) => strnatcasecmp($a['name'], $b['name']));
    $lists = array_map(fn($class) => array_diff_key($class, ['key' => 0]), $classes);
    if (!$separate || !$groups) {
        $lists[] = ['id' => 'c' . $course->id,
            'name' => get_string($classes ? 'wholecourse' : 'wholeclass', 'local_oksigeniaclasstools'),
            'students' => array_values($students)];
    }

    // What this teacher keeps of each tool in this course.
    $state = [];
    foreach ($DB->get_records('local_oksigeniaclasstools_state', ['courseid' => $course->id, 'userid' => $USER->id]) as $row) {
        $state[$row->tool] = json_decode($row->data, true);
    }

    return [
        'course' => format_string($course->fullname, true, ['context' => $context]),
        'back' => (new moodle_url('/course/view.php', ['id' => $course->id]))->out(false),
        'lists' => $lists,
        'courseid' => (int) $course->id,
        'sesskey' => sesskey(),
        'days' => $days,
        'pickurl' => (new moodle_url('/local/oksigeniaclasstools/pick.php'))->out(false),
        'state' => (object) $state,
        'stateurl' => (new moodle_url('/local/oksigeniaclasstools/state.php'))->out(false),
        'groupsurl' => has_capability('moodle/course:managegroups', $context)
            ? (new moodle_url('/local/oksigeniaclasstools/savegroups.php'))->out(false) : null,
    ];
}

/**
 * Outputs the classroom screen (the same one as the SCORM package), with the course data if there is any.
 *
 * @param array|null $data
 */
function local_oksigeniaclasstools_output(?array $data): void {
    $html = file_get_contents(__DIR__ . '/app/index.html');
    $base = (new moodle_url('/local/oksigeniaclasstools/app/'))->out(false);
    $html = str_replace('<head>', "<head>\n<base href=\"" . s($base) . '">', $html);
    if ($data) {
        $json = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE);
        $html = str_replace('<script src="icons.js"></script>',
            "<script>window.CLASSTOOLS = $json;</script>\n<script src=\"icons.js\"></script>", $html);
    }
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Frame-Options: SAMEORIGIN');
    echo $html;
}
