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
 * What a device that joined a live session with the code only does (no Moodle account, no cookies): join (or pick
 * a team), answer and ask how it goes. The device is a random token it keeps for itself.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
define('NO_MOODLE_COOKIES', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\live;

$action = required_param('action', PARAM_ALPHA);
$live = live::by_code(required_param('c', PARAM_ALPHANUM));
$device = live::device_param(required_param('device', PARAM_ALPHANUM));
if (!$live || $live->identity !== 'anon' || $device === '' || $device[0] === 'u') {
    echo json_encode(['ended' => true]);
    exit;
}

if ($action === 'join') {
    live::join($live, $device, 0, optional_param('team', 0, PARAM_INT));
} else if ($action === 'answer') {
    live::answer($live, $device, required_param('answer', PARAM_ALPHANUM));
}
echo json_encode(live::device_view($live, $device));
