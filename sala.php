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
 * The teachers' room: a teacher comes into it or leaves it (from «Which class?» or the board), and the room as they see
 * it, for the board.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\sala;

require_once(__DIR__ . '/lib.php');

$action = optional_param('action', 'join', PARAM_ALPHA);
require_sesskey();
require_login(null, false);
if (!sala::on()) {
    echo json_encode(['off' => true]);
    exit;
}
$join = $action === 'join' ? required_param('join', PARAM_BOOL) : null;
// Only teachers see the room or come into it (its names and stickers are for colleagues); anyone can leave it.
if ($join !== false && !sala::can_join((int) $USER->id)) {
    throw new required_capability_exception(context_system::instance(), 'local/oksigeniaclasstools:use', 'nopermissions', '');
}
if ($join !== null) {
    sala::join((int) $USER->id, $join);
}
echo json_encode(local_oksigeniaclasstools_sala_view((int) $USER->id));
