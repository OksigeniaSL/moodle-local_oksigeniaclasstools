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
 * The board's side of a live session: open one, ask how it goes (who is in, the answers, the remote's commands) and
 * run it (open a question or a round, close it, show the results on the devices, send a device out, end it).
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\live;

$courseid = required_param('courseid', PARAM_INT);
$action = required_param('action', PARAM_ALPHA);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
$context = context_course::instance($course->id);
require_capability('local/oksigeniaclasstools:use', $context);
if (get_config('local_oksigeniaclasstools', 'live') === '0') {
    throw new moodle_exception('livedisabled', 'local_oksigeniaclasstools');
}

if ($action === 'start') {
    $live = live::start(
        $course,
        $USER->id,
        required_param('kind', PARAM_ALPHA),
        optional_param('identity', 'anon', PARAM_ALPHA),
        [
            'vote' => optional_param('vote', 'abcd', PARAM_ALPHA),
            'teams' => json_decode(optional_param('teams', '[]', PARAM_RAW), true) ?: [],
            'show' => optional_param('show', 0, PARAM_BOOL),
        ]
    );
} else {
    $live = live::mine(required_param('id', PARAM_INT), $USER->id);
    if ($action !== 'state') {
        $live = live::control($live, $action, [
            'device' => optional_param('device', '', PARAM_ALPHANUM),
            'vote' => optional_param('vote', '', PARAM_ALPHA),
            'show' => optional_param('show', 0, PARAM_BOOL),
        ]);
    }
}
echo json_encode(live::board_view($live, optional_param('since', 0, PARAM_INT)));
