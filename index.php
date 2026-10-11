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
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
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
    $PAGE->set_heading(get_string('pluginname', 'local_oksigeniaclasstools'));
    if ($courses) {
        $choose = local_oksigeniaclasstools_choose($courses);
        // The search and the stages: cards and categories that do not match go away (accents do not count).
        if ($choose['search'] || $choose['stages']) {
            $PAGE->requires->js_init_code("(function () {
                var input = document.getElementById('ct-choose-search'), stage = '';
                var plain = function (s) { return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); };
                var filter = function () {
                    var q = input ? plain(input.value.trim()) : '', shown = 0;
                    document.querySelectorAll('.ct-choose-cat').forEach(function (cat) {
                        var any = false;
                        cat.querySelectorAll('.ct-choose-card').forEach(function (card) {
                            var ok = (!q || plain(card.getAttribute('data-name')).indexOf(q) >= 0)
                                && (!stage || card.getAttribute('data-mode') === stage);
                            card.hidden = !ok;
                            if (ok) { any = true; shown++; }
                        });
                        cat.hidden = !any;
                    });
                    document.getElementById('ct-choose-none').hidden = shown > 0;
                };
                if (input) { input.addEventListener('input', filter); }
                document.querySelectorAll('.ct-choose-stages button').forEach(function (b, i, all) {
                    b.addEventListener('click', function () {
                        stage = b.getAttribute('data-mode');
                        all.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
                        filter();
                    });
                });
            })();");
        }
    }
    echo $OUTPUT->header();
    echo $OUTPUT->heading(get_string('choose', 'local_oksigeniaclasstools'));
    if ($courses) {
        echo $OUTPUT->render_from_template('local_oksigeniaclasstools/choose', $choose);
    } else {
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
