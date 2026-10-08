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
 * Questions of the Moodle question bank for a quiz on the board: the multiple choice ones with a single right answer
 * (up to four answers) and the true/false ones, from the banks the teacher can use in the course — the course's own
 * (Moodle 4.x), its question bank activities (Moodle 5) and its quizzes. The text as plain text (formulas come as they
 * are written) and the first picture in it, copied for the teacher (see quizimages); questions that would not fit are
 * left out and counted.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class bank {
    /** Question types that make a quiz question. */
    const TYPES = ['multichoice', 'truefalse'];

    /** Capabilities that let the teacher use the questions of a bank. */
    const USE = ['moodle/question:useall', 'moodle/question:viewall', 'moodle/question:usemine'];

    /**
     * The contexts of the course with banks the teacher can use.
     *
     * @param \stdClass $course
     * @return \context[] contextid => context
     */
    public static function contexts(\stdClass $course): array {
        $contexts = [\context_course::instance($course->id)];
        foreach (get_fast_modinfo($course)->get_cms() as $cm) {
            if (in_array($cm->modname, ['qbank', 'quiz'], true)) {
                $contexts[] = \context_module::instance($cm->id);
            }
        }
        $out = [];
        foreach ($contexts as $context) {
            if (has_any_capability(self::USE, $context)) {
                $out[$context->id] = $context;
            }
        }
        return $out;
    }

    /**
     * SQL for the questions that can be used: the last version, ready, of the types above.
     *
     * @return string
     */
    private static function usable(): string {
        return "q.qtype IN ('multichoice', 'truefalse') AND q.parent = 0 AND qv.status = 'ready'
                AND qv.version = (SELECT MAX(v.version) FROM {question_versions} v WHERE v.questionbankentryid = qbe.id)";
    }

    /**
     * The categories with usable questions, named with their bank («Quiz on fractions · Default»).
     *
     * @param \stdClass $course
     * @return array [id, name, count]
     */
    public static function categories(\stdClass $course): array {
        global $DB;
        $contexts = self::contexts($course);
        if (!$contexts) {
            return [];
        }
        [$in, $params] = $DB->get_in_or_equal(array_keys($contexts), SQL_PARAMS_NAMED);
        $rows = $DB->get_records_sql(
            "SELECT qc.id, qc.name, qc.contextid, COUNT(q.id) AS n
               FROM {question_categories} qc
               JOIN {question_bank_entries} qbe ON qbe.questioncategoryid = qc.id
               JOIN {question_versions} qv ON qv.questionbankentryid = qbe.id
               JOIN {question} q ON q.id = qv.questionid
              WHERE qc.contextid $in AND " . self::usable() . "
           GROUP BY qc.id, qc.name, qc.contextid
           ORDER BY qc.name",
            $params
        );
        $out = [];
        foreach ($rows as $row) {
            $context = $contexts[$row->contextid];
            $where = $context->contextlevel == CONTEXT_MODULE ? $context->get_context_name(false, true) : get_string('course');
            $out[] = ['id' => (int) $row->id, 'name' => $where . ' · ' . format_string($row->name, true, ['context' => $context]),
                'count' => (int) $row->n];
        }
        return $out;
    }

    /**
     * The questions of a category, ready for the board.
     *
     * @param \stdClass $course
     * @param int $categoryid
     * @param int $userid Who takes them (their pictures are copied for them; none, no pictures).
     * @return array [questions => [[text, options, correct, img]], skipped]
     * @throws \moodle_exception If the category is not in a bank the teacher can use.
     */
    public static function questions(\stdClass $course, int $categoryid, int $userid = 0): array {
        global $DB;
        $category = $DB->get_record('question_categories', ['id' => $categoryid], 'id, contextid', MUST_EXIST);
        if (!isset(self::contexts($course)[$category->contextid])) {
            throw new \moodle_exception('nopermissions', 'error', '', 'question bank');
        }
        $rows = $DB->get_records_sql(
            "SELECT q.id, q.qtype, q.questiontext
               FROM {question_bank_entries} qbe
               JOIN {question_versions} qv ON qv.questionbankentryid = qbe.id
               JOIN {question} q ON q.id = qv.questionid
              WHERE qbe.questioncategoryid = :cat AND " . self::usable() . "
           ORDER BY q.name, q.id",
            ['cat' => $categoryid]
        );
        $questions = [];
        $skipped = 0;
        $here = \context_course::instance($course->id);
        foreach ($rows as $row) {
            $question = self::question($row);
            if ($question) {
                $img = $userid ? quizimages::from_question($here, $userid, (int) $category->contextid, (int) $row->id) : '';
                if ($img !== '') {
                    $question['img'] = $img;
                }
                $questions[] = $question;
            } else {
                $skipped++;
            }
        }
        return ['questions' => $questions, 'skipped' => $skipped];
    }

    /**
     * One question as text, its answers and the right one; null if it does not fit (several right answers, more than
     * four answers, an empty text).
     *
     * @param \stdClass $row
     * @return array|null
     */
    private static function question(\stdClass $row): ?array {
        global $DB;
        $text = self::plain($row->questiontext, 300);
        $answers = $DB->get_records('question_answers', ['question' => $row->id], 'id', 'id, answer, fraction');
        if ($text === '' || !$answers) {
            return null;
        }
        if ($row->qtype === 'truefalse') {
            $tf = $DB->get_record('question_truefalse', ['question' => $row->id], 'trueanswer, falseanswer');
            if (!$tf || !isset($answers[$tf->trueanswer])) {
                return null;
            }
            return ['text' => $text, 'options' => [get_string('true', 'qtype_truefalse'), get_string('false', 'qtype_truefalse')],
                'correct' => $answers[$tf->trueanswer]->fraction > 0 ? 0 : 1];
        }
        if ((int) $DB->get_field('qtype_multichoice_options', 'single', ['questionid' => $row->id]) !== 1 || count($answers) > 4) {
            return null;
        }
        $options = [];
        $correct = -1;
        foreach (array_values($answers) as $i => $answer) {
            $options[] = self::plain($answer->answer, 120);
            if ($answer->fraction >= 0.999) {
                $correct = $i;
            }
        }
        if ($correct < 0 || count($options) < 2 || in_array('', $options, true)) {
            return null;
        }
        return ['text' => $text, 'options' => $options, 'correct' => $correct];
    }

    /**
     * HTML as plain text, cut to a length.
     *
     * @param string $html
     * @param int $length
     * @return string
     */
    private static function plain(string $html, int $length): string {
        $text = preg_replace('/<(br|\/p|\/div|\/li)[^>]*>/i', ' ', $html);
        $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return \core_text::substr(trim(preg_replace('/\s+/u', ' ', $text)), 0, $length);
    }
}
