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
use core_external\external_single_structure;
use core_external\external_value;
use local_oksigeniaclasstools\local\ai as local_ai;

/**
 * Exercises written by the AI of the site: accepting its policy, and asking for some.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class ai extends api {
    /**
     * Parameters of accept.
     *
     * @return external_function_parameters
     */
    public static function accept_parameters(): external_function_parameters {
        return new external_function_parameters(['courseid' => new external_value(PARAM_INT, 'The course')]);
    }

    /**
     * The teacher accepts the AI policy of the site.
     *
     * @param int $courseid
     * @return array ok, or ok false and error.
     */
    public static function accept(int $courseid): array {
        global $USER;
        $params = self::validate_parameters(self::accept_parameters(), ['courseid' => $courseid]);
        [, $context] = self::course($params['courseid'], 'local/oksigeniaclasstools:generate');
        if (!local_ai::available($context)) {
            return ['ok' => false, 'error' => get_string('ai_unavailable', 'local_oksigeniaclasstools')];
        }
        local_ai::accept((int) $USER->id, $context);
        return ['ok' => true];
    }

    /**
     * Answer of accept.
     *
     * @return external_single_structure
     */
    public static function accept_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'Whether the policy is accepted'),
            'error' => new external_value(PARAM_TEXT, 'Why not', VALUE_OPTIONAL),
        ]);
    }

    /**
     * Parameters of generate.
     *
     * @return external_function_parameters
     */
    public static function generate_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'type' => new external_value(PARAM_ALPHA, 'What is asked for: an exercise game or a kind of content'),
            'level' => new external_value(PARAM_ALPHA, 'The school level'),
            'n' => new external_value(PARAM_INT, 'How many'),
            'topic' => new external_value(PARAM_RAW, 'On what (cleaned as text)', VALUE_DEFAULT, ''),
            'letters' => new external_value(PARAM_RAW, 'The letters of an alphabet wheel, separated by commas', VALUE_DEFAULT, ''),
        ]);
    }

    /**
     * Some exercises or content written by the AI of the site, for the teacher to check before saving.
     *
     * @param int $courseid
     * @param string $type
     * @param string $level
     * @param int $n
     * @param string $topic
     * @param string $letters
     * @return array ok and text; or ok false and error, or the policy to accept first.
     */
    public static function generate(
        int $courseid,
        string $type,
        string $level,
        int $n,
        string $topic = '',
        string $letters = ''
    ): array {
        global $USER;
        $params = self::validate_parameters(self::generate_parameters(), [
            'courseid' => $courseid, 'type' => $type, 'level' => $level, 'n' => $n, 'topic' => $topic, 'letters' => $letters,
        ]);
        [, $context] = self::course($params['courseid'], 'local/oksigeniaclasstools:generate');
        if (!local_ai::available($context)) {
            return ['ok' => false, 'error' => get_string('ai_unavailable', 'local_oksigeniaclasstools')];
        }
        if (!local_ai::accepted((int) $USER->id)) {
            return ['ok' => false, 'policy' => local_ai::policy()];
        }
        $known = isset(local_ai::GAMES[$params['type']]) || in_array($params['type'], local_ai::KINDS, true);
        $level = in_array($params['level'], local_ai::LEVELS, true);
        if (!$known || !$level || $params['n'] < 1 || $params['n'] > local_ai::COUNT_MAX) {
            throw new \invalid_parameter_exception('type, level or n');
        }
        // The letters of an alphabet wheel: only capital letters, separated by commas.
        $letters = clean_param($params['letters'], PARAM_TEXT);
        if (!preg_match('/^(\p{Lu}(, )?){0,40}$/u', $letters)) {
            throw new \invalid_parameter_exception('letters');
        }
        $topic = \core_text::substr(trim(clean_param($params['topic'], PARAM_TEXT)), 0, local_ai::TOPIC_MAX);
        // The AI can take a while: the session is not kept locked meanwhile.
        \core\session\manager::write_close();
        return local_ai::generate($context, (int) $USER->id, $params['type'], $topic, $params['level'], $params['n'], $letters);
    }

    /**
     * Answer of generate.
     *
     * @return external_single_structure
     */
    public static function generate_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'Whether the AI wrote something'),
            'text' => new external_value(PARAM_RAW, 'What it wrote, for the board to read', VALUE_OPTIONAL),
            'error' => new external_value(PARAM_TEXT, 'Why not', VALUE_OPTIONAL),
            'policy' => new external_value(PARAM_RAW, 'The AI policy of the site (HTML), to accept first', VALUE_OPTIONAL),
        ]);
    }
}
