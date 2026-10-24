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
 * Classroom tools with the course students already loaded. Without a course: the teacher's courses.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

$id = optional_param('id', 0, PARAM_INT);
$standalone = optional_param('standalone', 0, PARAM_BOOL);

if (!$id) {
    require_login();
    if ($standalone) {
        $PAGE->set_context(context_system::instance());
        $PAGE->set_url(new moodle_url('/local/oksigeniaclasstools/index.php', ['standalone' => 1]));
        local_oksigeniaclasstools_output(null);
        exit;
    }
    $courses = array_filter(
        enrol_get_my_courses(['id', 'fullname', 'shortname', 'category'], 'fullname ASC'),
        fn($c) => has_capability('local/oksigeniaclasstools:use', context_course::instance($c->id))
    );
    if (count($courses) === 1) {
        redirect(new moodle_url('/local/oksigeniaclasstools/index.php', ['id' => reset($courses)->id]));
    }
    $PAGE->set_context(context_system::instance());
    $PAGE->set_url(new moodle_url('/local/oksigeniaclasstools/index.php'));
    $PAGE->set_title(get_string('pluginname', 'local_oksigeniaclasstools'));
    // The page has its own header (the board's look): Moodle's heading is left out.
    $PAGE->set_heading('');
    if ($courses) {
        $choose = local_oksigeniaclasstools_choose($courses);
        $PAGE->requires->css(new moodle_url('/local/oksigeniaclasstools/app/choose.css'));
        // The page's own script (filters, the QR of the fixed remote, «My stickers») and what it draws with.
        $app = '/local/oksigeniaclasstools/app/';
        if ($choose['remote'] && $choose['remote']['on']) {
            $PAGE->requires->js(new moodle_url($app . 'lib/qrcode.js'));
        }
        if ($choose['album']) {
            foreach (['critter.js', 'cromos.js', 'logros.js'] as $file) {
                $PAGE->requires->js(new moodle_url($app . $file));
            }
        }
        $PAGE->requires->js_call_amd('local_oksigeniaclasstools/choose', 'init');
    }
    echo $OUTPUT->header();
    if ($courses) {
        echo $OUTPUT->render_from_template('local_oksigeniaclasstools/choose', $choose);
    } else {
        echo $OUTPUT->heading(get_string('choose', 'local_oksigeniaclasstools'));
        echo $OUTPUT->notification(get_string('nocourses', 'local_oksigeniaclasstools'), 'info');
        echo html_writer::link(
            new moodle_url('/local/oksigeniaclasstools/index.php', ['standalone' => 1]),
            get_string('standalone', 'local_oksigeniaclasstools'),
            ['class' => 'btn btn-secondary']
        );
    }
    echo $OUTPUT->footer();
    exit;
}

$course = get_course($id);
require_login($course);
$context = context_course::instance($course->id);
$mode = local_oksigeniaclasstools_mode($context);
if (!$mode) {
    require_capability('local/oksigeniaclasstools:use', $context);
}
$PAGE->set_context($context);
$PAGE->set_url(new moodle_url('/local/oksigeniaclasstools/index.php', ['id' => $course->id]));

local_oksigeniaclasstools_output($mode === 'student'
    ? local_oksigeniaclasstools_student_data($course, $context)
    : local_oksigeniaclasstools_data($course, $context));
