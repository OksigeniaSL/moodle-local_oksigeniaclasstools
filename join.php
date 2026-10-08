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
 * Where a device joins a live session: from the QR on the board it comes with the code and goes straight in; with
 * the address alone it asks for the code. With the code only nobody logs in; with their account (named or anonymous),
 * Moodle asks them to.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// phpcs:ignore moodle.Files.RequireLogin.Missing -- with the code only nobody logs in; with an account, require_login below.
require(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

use local_oksigeniaclasstools\local\live;

$code = optional_param('c', '', PARAM_ALPHANUM);
if (get_config('local_oksigeniaclasstools', 'live') === '0') {
    throw new moodle_exception('livedisabled', 'local_oksigeniaclasstools');
}
$live = $code !== '' ? live::by_code($code) : null;
if ($live && in_array($live->identity, ['moodle', 'hidden'], true)) {
    require_login(get_course($live->courseid));
} else {
    $PAGE->set_context(context_system::instance());
}
$PAGE->set_url(new moodle_url('/local/oksigeniaclasstools/join.php', $code !== '' ? ['c' => $code] : []));
local_oksigeniaclasstools_join_output($live, $code);
