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
 * The web services of the board, for its pages through Moodle's AJAX service. The devices of a live session that join
 * with the code only and the phone of the fixed remote come without a Moodle session (service-nologin.php): the code
 * or the key of the remote is what they bring.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_oksigeniaclasstools_ai_accept' => [
        'classname' => 'local_oksigeniaclasstools\external\ai',
        'methodname' => 'accept',
        'description' => 'The teacher accepts the AI policy of the site.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:generate',
    ],
    'local_oksigeniaclasstools_ai_generate' => [
        'classname' => 'local_oksigeniaclasstools\external\ai',
        'methodname' => 'generate',
        'description' => 'Exercises or content written by the AI of the site, for the teacher to check.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:generate',
    ],
    'local_oksigeniaclasstools_bank_categories' => [
        'classname' => 'local_oksigeniaclasstools\external\bank',
        'methodname' => 'categories',
        'description' => 'The categories of the question bank the board can use.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_bank_pairs' => [
        'classname' => 'local_oksigeniaclasstools\external\bank',
        'methodname' => 'pairs',
        'description' => 'The matching questions of a category, as pairs.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_bank_questions' => [
        'classname' => 'local_oksigeniaclasstools\external\bank',
        'methodname' => 'questions',
        'description' => 'The questions of a category for the quiz.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_board_share' => [
        'classname' => 'local_oksigeniaclasstools\external\board',
        'methodname' => 'share',
        'description' => 'Shares a page of the drawing board with a class.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use, moodle/course:manageactivities',
    ],
    'local_oksigeniaclasstools_course_hide' => [
        'classname' => 'local_oksigeniaclasstools\external\course',
        'methodname' => 'hide',
        'description' => 'Hides a course on «Which class?», or shows it again.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_glossary_list' => [
        'classname' => 'local_oksigeniaclasstools\external\glossary',
        'methodname' => 'glossaries',
        'description' => 'The glossaries of the course.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_glossary_words' => [
        'classname' => 'local_oksigeniaclasstools\external\glossary',
        'methodname' => 'words',
        'description' => 'The words of a glossary, with a clue from each definition.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_groups_save' => [
        'classname' => 'local_oksigeniaclasstools\external\groups',
        'methodname' => 'save',
        'description' => 'Saves the teams made on the board as groups of the course.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use, moodle/course:managegroups',
    ],
    'local_oksigeniaclasstools_live_control' => [
        'classname' => 'local_oksigeniaclasstools\external\live',
        'methodname' => 'control',
        'description' => 'Something the teacher does in an open live session.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_live_device' => [
        'classname' => 'local_oksigeniaclasstools\external\live',
        'methodname' => 'device',
        'description' => 'A device in a live session with the code only, without an account.',
        'type' => 'write',
        'ajax' => true,
        'loginrequired' => false,
        'readonlysession' => true,
    ],
    'local_oksigeniaclasstools_live_member' => [
        'classname' => 'local_oksigeniaclasstools\external\live',
        'methodname' => 'member',
        'description' => 'Someone in a live session with their Moodle account.',
        'type' => 'write',
        'ajax' => true,
    ],
    'local_oksigeniaclasstools_live_start' => [
        'classname' => 'local_oksigeniaclasstools\external\live',
        'methodname' => 'start',
        'description' => 'Opens a live session from the board.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_live_state' => [
        'classname' => 'local_oksigeniaclasstools\external\live',
        'methodname' => 'state',
        'description' => 'How an open live session is going, for the board.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
        'readonlysession' => true,
    ],
    'local_oksigeniaclasstools_logros_learn' => [
        'classname' => 'local_oksigeniaclasstools\external\logros',
        'methodname' => 'learn',
        'description' => 'The «Now you» of a guided help, done: its sticker is learned.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_logros_record' => [
        'classname' => 'local_oksigeniaclasstools\external\logros',
        'methodname' => 'record',
        'description' => 'A real use of a tool with a class, for its sticker.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_phone_command' => [
        'classname' => 'local_oksigeniaclasstools\external\phone',
        'methodname' => 'command',
        'description' => 'An order from the teacher\'s phone, with the key of the fixed remote.',
        'type' => 'write',
        'ajax' => true,
        'loginrequired' => false,
        'readonlysession' => true,
    ],
    'local_oksigeniaclasstools_phone_courses' => [
        'classname' => 'local_oksigeniaclasstools\external\phone',
        'methodname' => 'courses',
        'description' => 'The teacher\'s courses, for the fixed remote.',
        'type' => 'read',
        'ajax' => true,
        'loginrequired' => false,
        'readonlysession' => true,
    ],
    'local_oksigeniaclasstools_phone_state' => [
        'classname' => 'local_oksigeniaclasstools\external\phone',
        'methodname' => 'state',
        'description' => 'The teacher\'s open boards, for the fixed remote.',
        'type' => 'read',
        'ajax' => true,
        'loginrequired' => false,
        'readonlysession' => true,
    ],
    'local_oksigeniaclasstools_pick_record' => [
        'classname' => 'local_oksigeniaclasstools\external\pick',
        'methodname' => 'record',
        'description' => 'The turn of a student picked on the board, for fair picking.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_presentation_resolve' => [
        'classname' => 'local_oksigeniaclasstools\external\presentation',
        'methodname' => 'resolve',
        'description' => 'The design behind a Canva link, for the presentation tab.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_quizimage_save' => [
        'classname' => 'local_oksigeniaclasstools\external\quizimage',
        'methodname' => 'save',
        'description' => 'Keeps the picture of a quiz question for the teacher in the course.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_remote_enable' => [
        'classname' => 'local_oksigeniaclasstools\external\remote',
        'methodname' => 'enable',
        'description' => 'Turns the teacher\'s fixed remote on or off.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_remote_poll' => [
        'classname' => 'local_oksigeniaclasstools\external\remote',
        'methodname' => 'poll',
        'description' => 'The orders of the phone for a board.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
        'readonlysession' => true,
    ],
    'local_oksigeniaclasstools_remote_rotate' => [
        'classname' => 'local_oksigeniaclasstools\external\remote',
        'methodname' => 'rotate',
        'description' => 'A new address for the teacher\'s fixed remote.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_remote_status' => [
        'classname' => 'local_oksigeniaclasstools\external\remote',
        'methodname' => 'status',
        'description' => 'Whether the teacher\'s fixed remote is on, and its address.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_sala_join' => [
        'classname' => 'local_oksigeniaclasstools\external\sala',
        'methodname' => 'join',
        'description' => 'The teacher comes into the teachers\' room or leaves it.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_sala_view' => [
        'classname' => 'local_oksigeniaclasstools\external\sala',
        'methodname' => 'view',
        'description' => 'The teachers\' room as the teacher sees it.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_state_save' => [
        'classname' => 'local_oksigeniaclasstools\external\state',
        'methodname' => 'save',
        'description' => 'Keeps what a tool has, for the teacher in the course.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_shared_delete' => [
        'classname' => 'local_oksigeniaclasstools\external\shared',
        'methodname' => 'delete',
        'description' => 'Stops sharing a class list, letter wheel or lock with the school (its author, or a manager).',
        'type' => 'write',
        'ajax' => true,
    ],
    'local_oksigeniaclasstools_shared_list' => [
        'classname' => 'local_oksigeniaclasstools\external\shared',
        'methodname' => 'items',
        'description' => 'The class lists, letter wheels or locks shared with the school.',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_shared_save' => [
        'classname' => 'local_oksigeniaclasstools\external\shared',
        'methodname' => 'save',
        'description' => 'Shares a class list, letter wheel or lock with the school, or updates the one its author shared.',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/oksigeniaclasstools:use',
    ],
    'local_oksigeniaclasstools_tally_add' => [
        'classname' => 'local_oksigeniaclasstools\external\tally',
        'methodname' => 'add',
        'description' => 'What a board has been used for, for the report «Use of the boards».',
        'type' => 'write',
        'ajax' => true,
    ],
];
