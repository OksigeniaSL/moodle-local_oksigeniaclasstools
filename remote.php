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
 * The board's side of the fixed remote: whether it is on and its address, turning it on or off, a new address, and
 * the board asking for its orders while it is open.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\remote;

$courseid = required_param('courseid', PARAM_INT);
$action = required_param('action', PARAM_ALPHA);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
require_capability('local/oksigeniaclasstools:use', context_course::instance($course->id));
if (get_config('local_oksigeniaclasstools', 'live') === '0') {
    throw new moodle_exception('livedisabled', 'local_oksigeniaclasstools');
}

if ($action === 'poll') {
    // Every second and a half while the board is open: the session is not kept locked.
    \core\session\manager::write_close();
    // The tools of the board, «id|Name» separated by «;», for the phone to go to them.
    $tools = [];
    foreach (explode(';', optional_param('tools', '', PARAM_TEXT)) as $item) {
        [$id, $name] = array_pad(explode('|', $item, 2), 2, '');
        if (preg_match('/^[a-z]{2,20}$/', $id) && trim($name) !== '' && count($tools) < 30) {
            $tools[] = [$id, core_text::substr(trim($name), 0, 40)];
        }
    }
    $since = optional_param('since', 0, PARAM_INT);
    echo json_encode(remote::board((int) $USER->id, $course, $since, optional_param('tool', '', PARAM_ALPHA), $tools));
} else if ($action === 'status') {
    echo json_encode(remote::status((int) $USER->id));
} else if ($action === 'on' || $action === 'off') {
    remote::set_enabled((int) $USER->id, $action === 'on');
    echo json_encode(remote::status((int) $USER->id));
} else if ($action === 'rotate') {
    remote::rotate((int) $USER->id);
    echo json_encode(remote::status((int) $USER->id));
} else {
    throw new moodle_exception('invalidparameter', 'debug');
}
