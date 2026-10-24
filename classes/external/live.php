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

namespace local_oksigeniaclasstools\external;

use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;
use local_oksigeniaclasstools\local\live as local_live;

/**
 * Live sessions: the board that opens and runs one (vote, buzzers, brainstorm, quiz, exit ticket, the phone as a
 * remote), and the devices of the class that join it, with the code only or with their Moodle account.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class live extends api {
    /**
     * Parameters of start.
     *
     * @return external_function_parameters
     */
    public static function start_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'kind' => new external_value(PARAM_ALPHA, 'vote, buzz, ideas, quiz, exit, hands or remote'),
            'identity' => new external_value(
                PARAM_ALPHA,
                'anon (with the code), moodle (with their account, by name) or hidden',
                VALUE_DEFAULT,
                'anon'
            ),
            'vote' => new external_value(PARAM_ALPHA, 'The kind of answers of a vote', VALUE_DEFAULT, 'abcd'),
            'teams' => new external_value(PARAM_RAW, 'The teams, as JSON', VALUE_DEFAULT, '[]'),
            'show' => new external_value(PARAM_BOOL, 'Show the results on the devices', VALUE_DEFAULT, false),
            'max' => new external_value(PARAM_INT, 'How many answers each device can send', VALUE_DEFAULT, 1),
            'members' => new external_value(PARAM_RAW, 'Who is in each team, as JSON', VALUE_DEFAULT, '{}'),
            'pick' => new external_value(PARAM_BOOL, 'Teams picked by the students', VALUE_DEFAULT, false),
            'mode' => new external_value(PARAM_ALPHA, 'The scoring of a quiz: calm or fast', VALUE_DEFAULT, 'calm'),
            'top' => new external_value(PARAM_INT, 'How many places the ranking shows', VALUE_DEFAULT, 0),
            'devtext' => new external_value(PARAM_BOOL, 'The questions also on the devices', VALUE_DEFAULT, false),
        ]);
    }

    /**
     * Opens a live session from the board.
     *
     * @param int $courseid
     * @param string $kind
     * @param string $identity
     * @param string $vote
     * @param string $teams
     * @param bool $show
     * @param int $max
     * @param string $members
     * @param bool $pick
     * @param string $mode
     * @param int $top
     * @param bool $devtext
     * @return array json: the session as the board sees it
     */
    public static function start(
        int $courseid,
        string $kind,
        string $identity = 'anon',
        string $vote = 'abcd',
        string $teams = '[]',
        bool $show = false,
        int $max = 1,
        string $members = '{}',
        bool $pick = false,
        string $mode = 'calm',
        int $top = 0,
        bool $devtext = false
    ): array {
        global $USER;
        $params = self::validate_parameters(self::start_parameters(), [
            'courseid' => $courseid, 'kind' => $kind, 'identity' => $identity, 'vote' => $vote, 'teams' => $teams,
            'show' => $show, 'max' => $max, 'members' => $members, 'pick' => $pick, 'mode' => $mode, 'top' => $top,
            'devtext' => $devtext,
        ]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        self::require_live();
        $live = local_live::start($course, $USER->id, $params['kind'], $params['identity'], [
            'vote' => $params['vote'],
            'teams' => json_decode($params['teams'], true) ?: [],
            'show' => $params['show'],
            'max' => $params['max'],
            'lang' => current_language(),
            'members' => json_decode($params['members'], true) ?: [],
            'pick' => $params['pick'],
            'mode' => $params['mode'],
            'top' => $params['top'],
            'devtext' => $params['devtext'],
        ]);
        return self::json(local_live::board_view($live, 0));
    }

    /**
     * Answer of start.
     *
     * @return external_single_structure
     */
    public static function start_returns(): external_single_structure {
        return self::json_returns('The session as the board sees it');
    }

    /**
     * Parameters of control.
     *
     * @return external_function_parameters
     */
    public static function control_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'id' => new external_value(PARAM_INT, 'The session'),
            'action' => new external_value(PARAM_ALPHA, 'What the teacher does (open, close, end, kick…)'),
            'device' => new external_value(PARAM_ALPHANUM, 'The device it is about', VALUE_DEFAULT, ''),
            'vote' => new external_value(PARAM_ALPHA, 'The kind of answers', VALUE_DEFAULT, ''),
            'show' => new external_value(PARAM_BOOL, 'Show the results on the devices', VALUE_DEFAULT, false),
            'secs' => new external_value(PARAM_INT, 'Seconds of a question', VALUE_DEFAULT, 0),
            'q' => new external_value(PARAM_RAW, 'The question (cleaned as text)', VALUE_DEFAULT, ''),
            'max' => new external_value(PARAM_INT, 'How many answers each device can send', VALUE_DEFAULT, 0),
            'options' => new external_value(PARAM_RAW, 'The options of a question, as JSON', VALUE_DEFAULT, '[]'),
            'correct' => new external_value(PARAM_INT, 'The right option (-1: none)', VALUE_DEFAULT, -1),
            'feel' => new external_value(PARAM_BOOL, 'An exit ticket asks how they are getting on', VALUE_DEFAULT, false),
            'prompts' => new external_value(PARAM_RAW, 'The questions of an exit ticket, as JSON', VALUE_DEFAULT, '[]'),
            'since' => new external_value(PARAM_INT, 'What the board already has', VALUE_DEFAULT, 0),
        ]);
    }

    /**
     * Something the teacher does in an open session.
     *
     * @param int $courseid
     * @param int $id
     * @param string $action
     * @param string $device
     * @param string $vote
     * @param bool $show
     * @param int $secs
     * @param string $q
     * @param int $max
     * @param string $options
     * @param int $correct
     * @param bool $feel
     * @param string $prompts
     * @param int $since
     * @return array json: the session as the board sees it
     */
    public static function control(
        int $courseid,
        int $id,
        string $action,
        string $device = '',
        string $vote = '',
        bool $show = false,
        int $secs = 0,
        string $q = '',
        int $max = 0,
        string $options = '[]',
        int $correct = -1,
        bool $feel = false,
        string $prompts = '[]',
        int $since = 0
    ): array {
        global $USER;
        $params = self::validate_parameters(self::control_parameters(), [
            'courseid' => $courseid, 'id' => $id, 'action' => $action, 'device' => $device, 'vote' => $vote, 'show' => $show,
            'secs' => $secs, 'q' => $q, 'max' => $max, 'options' => $options, 'correct' => $correct, 'feel' => $feel,
            'prompts' => $prompts, 'since' => $since,
        ]);
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        self::require_live();
        $live = local_live::control(local_live::mine($params['id'], $USER->id), $params['action'], [
            'device' => $params['device'],
            'vote' => $params['vote'],
            'show' => $params['show'],
            'secs' => $params['secs'],
            'q' => clean_param($params['q'], PARAM_TEXT),
            'max' => $params['max'],
            'options' => json_decode($params['options'], true) ?: [],
            'correct' => $params['correct'],
            'feel' => $params['feel'],
            'prompts' => json_decode($params['prompts'], true) ?: [],
        ]);
        return self::json(local_live::board_view($live, $params['since']));
    }

    /**
     * Answer of control.
     *
     * @return external_single_structure
     */
    public static function control_returns(): external_single_structure {
        return self::json_returns('The session as the board sees it');
    }

    /**
     * Parameters of state.
     *
     * @return external_function_parameters
     */
    public static function state_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'id' => new external_value(PARAM_INT, 'The session'),
            'since' => new external_value(PARAM_INT, 'What the board already has', VALUE_DEFAULT, 0),
        ]);
    }

    /**
     * How an open session is going, for the board (it asks every couple of seconds).
     *
     * @param int $courseid
     * @param int $id
     * @param int $since
     * @return array json: the session as the board sees it
     */
    public static function state(int $courseid, int $id, int $since = 0): array {
        global $USER;
        $params = self::validate_parameters(self::state_parameters(), ['courseid' => $courseid, 'id' => $id, 'since' => $since]);
        self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        self::require_live();
        return self::json(local_live::board_view(local_live::mine($params['id'], $USER->id), $params['since']));
    }

    /**
     * Answer of state.
     *
     * @return external_single_structure
     */
    public static function state_returns(): external_single_structure {
        return self::json_returns('The session as the board sees it');
    }

    /**
     * What a device sends in a session, besides joining it.
     *
     * @return array
     */
    private static function device_fields(): array {
        return [
            'action' => new external_value(PARAM_ALPHA, 'state, join, answer, idea, unidea or ticket', VALUE_DEFAULT, 'state'),
            'team' => new external_value(PARAM_INT, 'The team it joins', VALUE_DEFAULT, 0),
            'answer' => new external_value(PARAM_RAW, 'Its answer (cleaned as letters and digits)', VALUE_DEFAULT, ''),
            'text' => new external_value(PARAM_RAW, 'An idea of a brainstorm (cleaned as text)', VALUE_DEFAULT, ''),
            'slot' => new external_value(PARAM_INT, 'The idea it takes back', VALUE_DEFAULT, 0),
            'feel' => new external_value(PARAM_ALPHANUM, 'How it is getting on, in an exit ticket', VALUE_DEFAULT, ''),
            'texts' => new external_multiple_structure(
                new external_value(PARAM_RAW, 'An answer of an exit ticket'),
                'The answers of an exit ticket',
                VALUE_DEFAULT,
                []
            ),
        ];
    }

    /**
     * What a device does in a session that is not joining it: an answer, an idea, taking an idea back, a ticket.
     *
     * @param \stdClass $live
     * @param string $device
     * @param array $params
     */
    private static function act(\stdClass $live, string $device, array $params): void {
        if ($params['action'] === 'answer') {
            local_live::answer($live, $device, clean_param($params['answer'], PARAM_ALPHANUM));
        } else if ($params['action'] === 'idea') {
            local_live::idea($live, $device, clean_param($params['text'], PARAM_TEXT));
        } else if ($params['action'] === 'unidea') {
            local_live::unidea($live, $device, $params['slot']);
        } else if ($params['action'] === 'ticket') {
            local_live::ticket($live, $device, $params['feel'], $params['texts']);
        }
    }

    /**
     * Parameters of device.
     *
     * @return external_function_parameters
     */
    public static function device_parameters(): external_function_parameters {
        return new external_function_parameters([
            'code' => new external_value(PARAM_RAW, 'The code of the session'),
            'device' => new external_value(PARAM_RAW, 'The random token of the device'),
        ] + self::device_fields());
    }

    /**
     * A device in a session with the code only (no account, no Moodle session): what it does, and the session as it
     * sees it.
     *
     * @param string $code
     * @param string $device
     * @param string $action
     * @param int $team
     * @param string $answer
     * @param string $text
     * @param int $slot
     * @param string $feel
     * @param array $texts
     * @return array json: the session as the device sees it, or ended
     */
    public static function device(
        string $code,
        string $device,
        string $action = 'state',
        int $team = 0,
        string $answer = '',
        string $text = '',
        int $slot = 0,
        string $feel = '',
        array $texts = []
    ): array {
        $params = self::validate_parameters(self::device_parameters(), [
            'code' => $code, 'device' => $device, 'action' => $action, 'team' => $team, 'answer' => $answer, 'text' => $text,
            'slot' => $slot, 'feel' => $feel, 'texts' => $texts,
        ]);
        self::without_session();
        $live = local_live::by_code(clean_param($params['code'], PARAM_ALPHANUM));
        $token = local_live::device_param(clean_param($params['device'], PARAM_ALPHANUM));
        if (!$live || $live->identity !== 'anon' || $token === '' || $token[0] === 'u') {
            return self::json(['ended' => true]);
        }
        if ($params['action'] === 'join') {
            local_live::join($live, $token, 0, $params['team']);
        } else {
            self::act($live, $token, $params);
        }
        return self::json(local_live::device_view($live, $token));
    }

    /**
     * Answer of device.
     *
     * @return external_single_structure
     */
    public static function device_returns(): external_single_structure {
        return self::json_returns('The session as the device sees it');
    }

    /**
     * Parameters of member.
     *
     * @return external_function_parameters
     */
    public static function member_parameters(): external_function_parameters {
        return new external_function_parameters([
            'code' => new external_value(PARAM_RAW, 'The code of the session'),
            'command' => new external_value(PARAM_ALPHANUMEXT, 'An order of the teacher\'s phone (a remote)', VALUE_DEFAULT, ''),
        ] + self::device_fields());
    }

    /**
     * Someone in a session with their Moodle account (by name, or anonymous with a token that does not say who they
     * are): what they do, and the session as they see it. For a remote, only the teacher who opened it, from the phone.
     *
     * @param string $code
     * @param string $command
     * @param string $action
     * @param int $team
     * @param string $answer
     * @param string $text
     * @param int $slot
     * @param string $feel
     * @param array $texts
     * @return array json: the session as the device sees it, or ended
     */
    public static function member(
        string $code,
        string $command = '',
        string $action = 'state',
        int $team = 0,
        string $answer = '',
        string $text = '',
        int $slot = 0,
        string $feel = '',
        array $texts = []
    ): array {
        global $USER;
        $params = self::validate_parameters(self::member_parameters(), [
            'code' => $code, 'command' => $command, 'action' => $action, 'team' => $team, 'answer' => $answer, 'text' => $text,
            'slot' => $slot, 'feel' => $feel, 'texts' => $texts,
        ]);
        $live = local_live::by_code(clean_param($params['code'], PARAM_ALPHANUM));
        if (!$live || !in_array($live->identity, ['moodle', 'hidden'], true)) {
            return self::json(['ended' => true]);
        }
        self::validate_context(\context_course::instance($live->courseid));
        // Anonymous with their account: a token that does not say who they are, and no user id kept.
        $hidden = $live->identity === 'hidden';
        $device = $hidden ? local_live::hidden_device($live, (int) $USER->id) : 'u' . $USER->id;
        $teacher = $live->kind === 'remote' && $live->userid == $USER->id;
        if ($params['action'] === 'command') {
            if (!$teacher) {
                throw new \moodle_exception('nopermissions', 'error', '', 'remote');
            }
            local_live::control($live, 'command', ['command' => $params['command']]);
        } else if ($params['action'] === 'join') {
            if ($live->kind === 'remote' && !$teacher) {
                throw new \moodle_exception('nopermissions', 'error', '', 'remote');
            }
            // In a quiz with teams made from groups, their team comes from who they are (also when anonymous).
            local_live::join($live, $device, $hidden ? 0 : (int) $USER->id, $params['team'], (int) $USER->id);
        } else {
            self::act($live, $device, $params);
        }
        return self::json(local_live::device_view($live, $device));
    }

    /**
     * Answer of member.
     *
     * @return external_single_structure
     */
    public static function member_returns(): external_single_structure {
        return self::json_returns('The session as the device sees it');
    }
}
