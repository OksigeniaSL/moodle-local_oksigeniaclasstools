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

namespace local_oksigeniaclasstools\local;

/**
 * Content written by the AI of the site: exercises for the games of the shared format (Order, Sort, Spot the mistakes,
 * Who am I?), quiz questions, a letter wheel, words, pairs, a song for the score or the dates of a timeline. Only from
 * Moodle 4.5, when the administrator has a provider that generates text and has not turned this off, and the course
 * has not turned its AI tools off (Moodle 5.1). The prompt is built here from what is asked for, the topic, the level
 * and how many, so the board is not an open door to the AI. Moodle shows its AI policy before the first use and keeps
 * a record of each request.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class ai {
    /** The games, with the string of their name. */
    const GAMES = ['order' => 'app_ord_name', 'classify' => 'app_so_name', 'errors' => 'app_er_name', 'whoami' => 'app_wa_name'];

    /**
     * The other things that can be asked for, each with its «what», rules and example among the board's strings; and a
     * song for the score, by its name (its prompt has its own format and example).
     */
    const KINDS = ['quiz', 'rosco', 'words', 'pairs', 'trios', 'song', 'timeline'];

    /** The levels (the exercises of Early years take the examples of Primary). */
    const LEVELS = ['early', 'primary', 'secondary', 'advanced'];

    /** Most that can be asked for at once. */
    const COUNT_MAX = 30;

    /** Longest topic, in characters. */
    const TOPIC_MAX = 120;

    /** Longest answer kept, in characters: more than ten long exercises. */
    const ANSWER_MAX = 20000;

    /**
     * The action of Moodle that writes text, if this Moodle has the AI subsystem.
     *
     * @return string|null
     */
    private static function action(): ?string {
        return class_exists('\core_ai\aiactions\generate_text') ? \core_ai\aiactions\generate_text::class : null;
    }

    /**
     * Whether the user can ask the AI of the site for exercises in this context.
     *
     * @param \context $context The course.
     * @return bool
     */
    public static function available(\context $context): bool {
        $action = self::action();
        $off = get_config('local_oksigeniaclasstools', 'ai') === '0';
        if (!$action || $off || !has_capability('local/oksigeniaclasstools:generate', $context)) {
            return false;
        }
        // A static method in Moodle 4.5 and one of the instance from 5.0: called on the instance, both work.
        $manager = \core\di::get(\core_ai\manager::class);
        if (!$manager->is_action_available($action)) {
            return false;
        }
        // From Moodle 5.1 a course can turn its AI tools off.
        return !method_exists($manager, 'is_action_enabled_in_context')
            || $manager->is_action_enabled_in_context($context, $action);
    }

    /**
     * Whether the user has accepted the AI policy of the site.
     *
     * @param int $userid
     * @return bool
     */
    public static function accepted(int $userid): bool {
        return \core_ai\manager::get_user_policy_status($userid);
    }

    /**
     * The user accepts the AI policy of the site.
     *
     * @param int $userid
     * @param \context $context Where it is accepted.
     */
    public static function accept(int $userid, \context $context): void {
        \core_ai\manager::user_policy_accepted($userid, $context->id);
    }

    /**
     * The AI policy of the site, as Moodle words it (HTML).
     *
     * @return string
     */
    public static function policy(): string {
        return get_string('userpolicy', 'core_ai');
    }

    /**
     * The prompt: what is asked for, the topic, the level, the rules of the format and an example (for exercises, the
     * first of that level). The same text the teacher can copy for an AI of their own.
     *
     * @param string $type order, classify, errors or whoami; or quiz, rosco, words or pairs.
     * @param string $topic What it is about (may be empty: then the AI chooses).
     * @param string $level early, primary, secondary or advanced.
     * @param int $count How many.
     * @param string $letters The letters of a letter wheel («A, B, C…»).
     * @return string
     */
    public static function prompt(string $type, string $topic, string $level, int $count, string $letters = ''): string {
        $component = 'local_oksigeniaclasstools';
        if ($type === 'song') {
            $title = $topic !== '' ? $topic : get_string('app_sc_prompt_any', $component);
            return get_string('app_sc_prompt_text', $component, $title);
        }
        $topic = $topic !== '' ? $topic : get_string('app_ex_ai_any', $component);
        if (!isset(self::GAMES[$type])) {
            return get_string('app_ai_prompt', $component, (object) [
                'what' => get_string('app_ai_what_' . $type, $component, $count),
                'level' => get_string('app_ex_ai_for_' . $level, $component),
                'topic' => $topic,
                'rules' => get_string('app_ai_rules_' . $type, $component, $letters),
                'example' => get_string('app_ai_example_' . $type, $component),
            ]);
        }
        $examples = get_string('app_ex_example_' . $type . '_' . ($level === 'early' ? 'primary' : $level), $component);
        $example = trim(preg_split('/\R[ \t]*\R/u', str_replace("\r", '', $examples))[0]);
        return get_string('app_ex_ai_prompt', $component, (object) [
            'n' => $count,
            'game' => get_string(self::GAMES[$type], $component),
            'topic' => $topic,
            'level' => get_string('app_ex_ai_for_' . $level, $component),
            'rules' => get_string('app_ex_help_' . $type, $component) . ' ' . get_string('app_ex_format', $component),
            'example' => $example,
        ]);
    }

    /**
     * Asks the AI of the site for content.
     *
     * @param \context $context The course.
     * @param int $userid
     * @param string $type What is asked for (see prompt()).
     * @param string $topic
     * @param string $level early, primary, secondary or advanced.
     * @param int $count
     * @param string $letters The letters of a letter wheel.
     * @return array ok and text, or ok false and error.
     */
    public static function generate(
        \context $context,
        int $userid,
        string $type,
        string $topic,
        string $level,
        int $count,
        string $letters = ''
    ): array {
        $action = new \core_ai\aiactions\generate_text(
            contextid: $context->id,
            userid: $userid,
            prompttext: self::prompt($type, $topic, $level, $count, $letters),
        );
        $response = \core\di::get(\core_ai\manager::class)->process_action($action);
        if (!$response->get_success()) {
            return ['ok' => false, 'error' => (string) $response->get_errormessage()];
        }
        return ['ok' => true, 'text' => self::clean((string) ($response->get_response_data()['generatedcontent'] ?? ''))];
    }

    /**
     * The answer as plain text for the box of the exercises: without the fences of Markdown code that some models
     * add even when asked not to, and not endless.
     *
     * @param string $text
     * @return string
     */
    public static function clean(string $text): string {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/^[ \t]*\x60{3}[a-z]*[ \t]*$/mi', '', $text);
        return \core_text::substr(trim($text), 0, self::ANSWER_MAX);
    }
}
