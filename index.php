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
    // The page has its own header (the board's look): Moodle's heading is left out.
    $PAGE->set_heading('');
    if ($courses) {
        $choose = local_oksigeniaclasstools_choose($courses);
        $PAGE->requires->css(new moodle_url('/local/oksigeniaclasstools/app/choose.css'));
        if ($choose['remote'] && $choose['remote']['on']) {
            $PAGE->requires->js(new moodle_url('/local/oksigeniaclasstools/app/lib/qrcode.js'));
        }
        // The filters (category, stage and the search, together) and the QR of the fixed remote.
        $PAGE->requires->js_init_code("(function () {
            var input = document.getElementById('ct-ch-buscar'), cat = '', stage = '';
            var plain = function (s) { return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); };
            var filter = function () {
                var q = input ? plain(input.value.trim()) : '', shown = 0;
                document.querySelectorAll('.ct-ch-curso').forEach(function (card) {
                    var ok = (!q || plain(card.getAttribute('data-name')).indexOf(q) >= 0)
                        && (!cat || card.getAttribute('data-cat') === cat)
                        && (!stage || card.getAttribute('data-mode') === stage);
                    card.hidden = !ok;
                    if (ok) { shown++; }
                });
                document.getElementById('ct-ch-nada').hidden = shown > 0;
            };
            if (input) { input.addEventListener('input', filter); }
            // A stage (or «All»), and a category from its list; both go together with the search.
            var buttons = document.querySelectorAll('.ct-ch-filtros button');
            buttons.forEach(function (b) {
                b.addEventListener('click', function () {
                    stage = b.dataset.mode;
                    buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
                    filter();
                });
            });
            var select = document.getElementById('ct-ch-categoria');
            if (select) { select.addEventListener('change', function () { cat = select.value; filter(); }); }
            var qr = document.getElementById('ct-ch-qr');
            if (qr && window.qrcode) {
                var code = window.qrcode(0, 'M');
                code.addData(qr.getAttribute('data-url'));
                code.make();
                qr.innerHTML = code.createSvgTag({cellSize: 4, margin: 0, scalable: true});
            }
        })();");
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
