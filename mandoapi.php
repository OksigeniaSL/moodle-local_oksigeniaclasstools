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
 * What the fixed remote on the phone does, with the key of its address (no login, no cookies): ask which of the
 * teacher's boards are open, send an order to one of them, and list the teacher's courses to change the class.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
define('NO_MOODLE_COOKIES', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\remote;

$action = required_param('action', PARAM_ALPHA);
$row = remote::by_token(required_param('k', PARAM_ALPHANUM));
if (!$row || get_config('local_oksigeniaclasstools', 'live') === '0') {
    // Turned off, or the address was changed.
    echo json_encode(['off' => true]);
    exit;
}
if ($action === 'state') {
    echo json_encode(remote::phone($row));
} else if ($action === 'courses') {
    echo json_encode(['courses' => remote::courses((int) $row->userid)]);
} else if ($action === 'command') {
    echo json_encode(remote::command($row, required_param('cmd', PARAM_ALPHANUMEXT), required_param('course', PARAM_INT)));
} else {
    throw new moodle_exception('invalidparameter', 'debug');
}
