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
 * The board asks the AI of the site for exercises of the shared format: the AI policy first, if the teacher has not
 * accepted it yet, and then the exercises, as text for the box of «My exercises».
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require(__DIR__ . '/../../config.php');

use local_oksigeniaclasstools\local\ai;

$courseid = required_param('courseid', PARAM_INT);
$action = required_param('action', PARAM_ALPHA);
require_sesskey();
$course = get_course($courseid);
require_login($course, false, null, false, true);
$context = context_course::instance($course->id);
require_capability('local/oksigeniaclasstools:generate', $context);
if (!ai::available($context)) {
    echo json_encode(['ok' => false, 'error' => get_string('ai_unavailable', 'local_oksigeniaclasstools')]);
} else if ($action === 'accept') {
    ai::accept((int) $USER->id, $context);
    echo json_encode(['ok' => true]);
} else if ($action === 'generate') {
    if (!ai::accepted((int) $USER->id)) {
        echo json_encode(['ok' => false, 'policy' => ai::policy()]);
        die();
    }
    $type = required_param('type', PARAM_ALPHA);
    $level = required_param('level', PARAM_ALPHA);
    $count = required_param('n', PARAM_INT);
    $known = isset(ai::GAMES[$type]) || in_array($type, ai::KINDS, true);
    if (!$known || !in_array($level, ai::LEVELS, true) || $count < 1 || $count > ai::COUNT_MAX) {
        throw new moodle_exception('invalidparameter', 'debug');
    }
    $topic = core_text::substr(trim(optional_param('topic', '', PARAM_TEXT)), 0, ai::TOPIC_MAX);
    // The letters of a rosco: only capital letters, separated by commas.
    $letters = optional_param('letters', '', PARAM_TEXT);
    if (!preg_match('/^(\p{Lu}(, )?){0,40}$/u', $letters)) {
        throw new moodle_exception('invalidparameter', 'debug');
    }
    // The AI can take a while: the session is not kept locked meanwhile.
    \core\session\manager::write_close();
    echo json_encode(ai::generate($context, (int) $USER->id, $type, $topic, $level, $count, $letters));
} else {
    throw new moodle_exception('invalidparameter', 'debug');
}
