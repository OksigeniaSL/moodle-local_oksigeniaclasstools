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
 * What a device that joined a live session with its Moodle account does: join (or pick a team), answer (or send and
 * take back brainstorm answers), ask how it goes and, for the teacher's own phone, send commands to the board.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\live;

$action = required_param('action', PARAM_ALPHA);
$live = live::by_code(required_param('c', PARAM_ALPHANUM));
require_sesskey();
if (!$live || !in_array($live->identity, ['moodle', 'hidden'], true)) {
    echo json_encode(['ended' => true]);
    exit;
}
require_login(get_course($live->courseid), false, null, false, true);
// Anonymous with their account: a token that does not say who they are, and no user id kept.
$hidden = $live->identity === 'hidden';
$device = $hidden ? live::hidden_device($live, (int) $USER->id) : 'u' . $USER->id;

if ($action === 'command') {
    // Only the teacher who opened it, from their phone.
    if ($live->kind !== 'remote' || $live->userid != $USER->id) {
        throw new moodle_exception('nopermissions', 'error', '', 'remote');
    }
    live::control($live, 'command', ['command' => required_param('command', PARAM_ALPHANUMEXT)]);
} else if ($action === 'join') {
    if ($live->kind === 'remote' && $live->userid != $USER->id) {
        throw new moodle_exception('nopermissions', 'error', '', 'remote');
    }
    live::join($live, $device, $hidden ? 0 : (int) $USER->id, optional_param('team', 0, PARAM_INT));
} else if ($action === 'answer') {
    live::answer($live, $device, required_param('answer', PARAM_ALPHANUM));
} else if ($action === 'idea') {
    live::idea($live, $device, required_param('text', PARAM_TEXT));
} else if ($action === 'unidea') {
    live::unidea($live, $device, required_param('slot', PARAM_INT));
}
echo json_encode(live::device_view($live, $device));
