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

namespace local_oksigeniaclasstools\local;

/**
 * The notice that tells students, in Moodle, that their teacher has opened a live session: a small card at the bottom
 * of the page with «Join», so they need not type a code or scan anything. Shown on the pages of that course (and on
 * pages outside any course) to those enrolled in it who are not teachers there; it can be closed.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class notice {
    /** Page layouts where it never shows. */
    const SKIP_LAYOUTS = ['embedded', 'popup', 'frametop', 'print', 'redirect', 'maintenance', 'secure', 'login'];

    /**
     * The notice for the current user and page, or nothing.
     *
     * @return string
     */
    public static function html(): string {
        global $DB, $PAGE, $USER;
        if (during_initial_install() || !isloggedin() || isguestuser() || in_array($PAGE->pagelayout, self::SKIP_LAYOUTS, true)) {
            return '';
        }
        $off = fn($name) => get_config('local_oksigeniaclasstools', $name) === '0';
        if ($off('live') || $off('livenotice')) {
            return '';
        }
        $sessions = $DB->get_records_select(
            'local_oksigeniaclasstools_live',
            "timeend = 0 AND timemodified > ? AND kind <> 'remote' AND userid <> ?",
            [time() - live::IDLE, $USER->id],
            'timecreated DESC',
            'id, courseid, code, kind',
            0,
            30
        );
        $here = $PAGE->course && $PAGE->course->id != SITEID ? (int) $PAGE->course->id : 0;
        foreach ($sessions as $session) {
            if ($here && (int) $session->courseid !== $here) {
                continue;
            }
            $context = \context_course::instance($session->courseid, IGNORE_MISSING);
            if (!$context || !is_enrolled($context, $USER, '', true) || has_capability('local/oksigeniaclasstools:use', $context)) {
                continue;
            }
            return self::card($session, $context);
        }
        return '';
    }

    /**
     * The card.
     *
     * @param \stdClass $session
     * @param \context_course $context
     * @return string
     */
    private static function card(\stdClass $session, \context_course $context): string {
        global $PAGE;
        $course = get_course($session->courseid);
        $kind = get_string('app_lv_kind_' . $session->kind, 'local_oksigeniaclasstools');
        $url = new \moodle_url('/local/oksigeniaclasstools/join.php', ['c' => $session->code]);
        $id = 'local-oksigeniaclasstools-live';
        $join = get_string('livenotice_join', 'local_oksigeniaclasstools');
        // Closed once, it does not come back for this session (in this browser tab).
        $PAGE->requires->js_init_code("(function () {
            var card = document.getElementById('$id'); if (!card) { return; }
            var key = 'classtools-notice-' + card.getAttribute('data-code');
            var gone = false;
            try { gone = !!window.sessionStorage.getItem(key); } catch (e) { /* no storage */ }
            if (gone) { card.parentNode.removeChild(card); return; }
            card.querySelector('button').addEventListener('click', function () {
                try { window.sessionStorage.setItem(key, '1'); } catch (e) { /* no storage */ }
                card.parentNode.removeChild(card);
            });
        })();");
        return \html_writer::div(
            \html_writer::span('', 'live-dot', ['aria-hidden' => 'true'])
                . \html_writer::div(
                    \html_writer::tag('strong', s(get_string('livenotice_title', 'local_oksigeniaclasstools', $kind)))
                        . \html_writer::span(format_string($course->shortname, true, ['context' => $context])),
                    'live-text'
                )
                . \html_writer::link($url, $join, ['class' => 'btn btn-primary'])
                . \html_writer::tag('button', '&times;', ['type' => 'button', 'class' => 'live-close',
                    'aria-label' => get_string('livenotice_close', 'local_oksigeniaclasstools'),
                    'title' => get_string('livenotice_close', 'local_oksigeniaclasstools')]),
            'local-oksigeniaclasstools-live',
            ['id' => $id, 'role' => 'status', 'data-code' => $session->code]
        );
    }
}
