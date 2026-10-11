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
 * Words from the glossaries of a course for the word games of the board: each approved entry gives a word (its
 * concept) and a clue (the start of its definition, as plain text, with the word itself hidden). Only the glossaries
 * the teacher can see in the course; nothing is stored.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class glossary {
    /** Longest clue, in characters: one line under the word on the board. */
    const CLUE_MAX = 140;

    /**
     * The glossaries of the course that the user can see and that have approved entries.
     *
     * @param \stdClass $course
     * @return array[] Each with id (of the glossary), name and count.
     */
    public static function glossaries(\stdClass $course): array {
        global $DB;
        $out = [];
        foreach (get_fast_modinfo($course)->get_instances_of('glossary') as $cm) {
            $context = \context_module::instance($cm->id);
            if (!$cm->uservisible || !has_capability('mod/glossary:view', $context)) {
                continue;
            }
            $count = $DB->count_records('glossary_entries', ['glossaryid' => $cm->instance, 'approved' => 1]);
            if ($count) {
                $out[] = [
                    'id' => (int) $cm->instance,
                    'name' => format_string($cm->name, true, ['context' => $context, 'escape' => false]),
                    'count' => $count,
                ];
            }
        }
        return $out;
    }

    /**
     * The words of a glossary of the course, sorted: its concept and a clue from its definition.
     *
     * @param \stdClass $course
     * @param int $glossaryid
     * @return array[] Each with w (the word) and c (the clue, maybe empty).
     * @throws \moodle_exception If the glossary is not one the user can see in the course.
     */
    public static function words(\stdClass $course, int $glossaryid): array {
        global $DB;
        $cm = null;
        foreach (get_fast_modinfo($course)->get_instances_of('glossary') as $one) {
            if ((int) $one->instance === $glossaryid) {
                $cm = $one;
            }
        }
        if (!$cm || !$cm->uservisible) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $context = \context_module::instance($cm->id);
        require_capability('mod/glossary:view', $context);
        $words = [];
        $entries = $DB->get_records(
            'glossary_entries',
            ['glossaryid' => $glossaryid, 'approved' => 1],
            'concept',
            'id, concept, definition, definitionformat'
        );
        foreach ($entries as $entry) {
            $word = trim(strip_tags(format_string($entry->concept, true, ['context' => $context, 'escape' => false])));
            if ($word === '') {
                continue;
            }
            $html = format_text($entry->definition, $entry->definitionformat, ['context' => $context]);
            $words[] = ['w' => $word, 'c' => self::clue(html_to_text($html, 0, false), $word)];
        }
        return $words;
    }

    /**
     * A clue from a definition: one line, the word itself hidden (it would give the answer away), and cut short.
     *
     * @param string $text The definition as plain text.
     * @param string $word
     * @return string
     */
    public static function clue(string $text, string $word): string {
        $text = trim(preg_replace('/\s+/u', ' ', $text));
        $text = preg_replace('/' . preg_quote($word, '/') . '/iu', '___', $text);
        if (\core_text::strlen($text) > self::CLUE_MAX) {
            $text = rtrim(\core_text::substr($text, 0, self::CLUE_MAX - 1)) . '…';
        }
        return $text;
    }
}
