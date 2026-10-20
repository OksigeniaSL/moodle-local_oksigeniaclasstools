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
 * What the boards are used for: each tool, game and material, how many times students and teachers chose it and for how
 * long, in a course or in all of them, over a period. To see what classes like most and get ideas from it.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');
require_once(__DIR__ . '/lib.php');

use local_oksigeniaclasstools\local\tally;

$courseid = optional_param('course', 0, PARAM_INT);
$period = optional_param('period', 'month', PARAM_ALPHA);
$download = optional_param('download', '', PARAM_ALPHA);
if (!array_key_exists($period, tally::PERIODS)) {
    $period = 'month';
}
admin_externalpage_setup('local_oksigeniaclasstools_usage', '', ['course' => $courseid, 'period' => $period]);
$component = 'local_oksigeniaclasstools';
$url = new moodle_url('/local/oksigeniaclasstools/usage.php', ['course' => $courseid, 'period' => $period]);
$items = tally::report($courseid, tally::since($period));
$columns = [
    'name' => get_string('usage_tool', $component),
    'sopens' => get_string('usage_students_opens', $component),
    'sseconds' => get_string('usage_students_time', $component),
    'topens' => get_string('usage_teachers_opens', $component),
    'tseconds' => get_string('usage_teachers_time', $component),
    'days' => get_string('usage_days', $component),
];

if ($download) {
    // The seconds as they are, for a spreadsheet.
    $rows = array_map(fn($item) => array_intersect_key($item, $columns), $items);
    \core\dataformat::download_data('classtools-usage-' . $period, $download, $columns, $rows);
    exit;
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('usage', $component));
echo html_writer::tag('p', get_string('usage_desc', $component));

$courses = [0 => get_string('usage_allcourses', $component)];
foreach (tally::courses() as $id) {
    $course = get_course($id);
    $courses[$id] = format_string($course->fullname, true, ['context' => context_course::instance($id)]);
}
if ($courseid && !isset($courses[$courseid])) {
    $courses[$courseid] = format_string(get_course($courseid)->fullname);
}
$periods = [];
foreach (array_keys(tally::PERIODS) as $key) {
    $periods[$key] = get_string('usage_period_' . $key, $component);
}
$base = '/local/oksigeniaclasstools/usage.php';
echo html_writer::start_div('d-flex flex-wrap align-items-center mb-3');
$byperiod = new moodle_url($base, ['period' => $period]);
$bycourse = new moodle_url($base, ['course' => $courseid]);
$label = fn(string $key) => ['label' => get_string($key, $component)];
$select = $OUTPUT->single_select($byperiod, 'course', $courses, $courseid, null, null, $label('usage_course'));
echo html_writer::div($select, 'me-4 mr-4');
echo html_writer::div($OUTPUT->single_select($bycourse, 'period', $periods, $period, null, null, $label('usage_period')));
echo html_writer::end_div();

if (!$items) {
    echo $OUTPUT->notification(get_string('usage_none', $component), 'info', false);
} else {
    $table = new html_table();
    $table->head = array_values($columns);
    $table->attributes['class'] = 'generaltable';
    $table->align = ['left', 'right', 'right', 'right', 'right', 'right'];
    $time = fn(int $seconds) => $seconds ? format_time(60 * (int) round($seconds / 60) ?: $seconds) : '–';
    foreach ($items as $item) {
        $table->data[] = [
            s($item['name']),
            $item['sopens'] ?: '–',
            $time($item['sseconds']),
            $item['topens'] ?: '–',
            $time($item['tseconds']),
            $item['days'],
        ];
    }
    echo html_writer::table($table);
    $params = ['course' => $courseid, 'period' => $period];
    $label = get_string('downloadas', 'table');
    echo $OUTPUT->download_dataformat_selector($label, $url->out_omit_querystring(), 'download', $params);
}
echo $OUTPUT->footer();
