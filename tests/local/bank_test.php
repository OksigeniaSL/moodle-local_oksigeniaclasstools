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
 * Tests for the questions of the Moodle question bank that a quiz on the board can use.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\bank
 */
#[\PHPUnit\Framework\Attributes\CoversClass(bank::class)]
final class bank_test extends \advanced_testcase {
    public function test_single_answer_and_true_false_questions_come_as_text(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->setAdminUser();
        $course = $this->getDataGenerator()->create_course();
        // Moodle 5 keeps banks in question bank activities; before, in the course.
        if (file_exists($CFG->dirroot . '/mod/qbank/version.php')) {
            $qbank = $this->getDataGenerator()->create_module('qbank', ['course' => $course->id]);
            $context = \context_module::instance($qbank->cmid);
        } else {
            $context = \context_course::instance($course->id);
        }
        $qgen = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $qgen->create_question_category(['contextid' => $context->id, 'name' => 'Fractions']);
        $qgen->create_question('multichoice', 'one_of_four', ['category' => $category->id, 'name' => 'A one',
            'questiontext' => ['text' => '<p>Which is <b>the</b> answer?</p>', 'format' => FORMAT_HTML]]);
        $qgen->create_question('truefalse', null, ['category' => $category->id, 'name' => 'B tf',
            'questiontext' => ['text' => 'The sky is blue', 'format' => FORMAT_HTML]]);
        $qgen->create_question('multichoice', 'two_of_four', ['category' => $category->id, 'name' => 'C two']);
        $qgen->create_question('shortanswer', null, ['category' => $category->id, 'name' => 'D short']);

        $categories = bank::categories($course);
        $mine = array_values(array_filter($categories, fn($c) => $c['id'] == $category->id));
        $this->assertCount(1, $mine);
        $this->assertSame(3, $mine[0]['count']);
        $this->assertStringContainsString('Fractions', $mine[0]['name']);

        $got = bank::questions($course, (int) $category->id);
        $this->assertSame(1, $got['skipped']);   // The one with two right answers.
        $this->assertCount(2, $got['questions']);
        [$one, $tf] = $got['questions'];
        $this->assertSame('Which is the answer?', $one['text']);
        $this->assertCount(4, $one['options']);
        $this->assertSame('One', $one['options'][$one['correct']]);
        $this->assertSame('The sky is blue', $tf['text']);
        $this->assertSame(0, $tf['correct']);
        $this->assertCount(2, $tf['options']);
    }

    public function test_a_category_of_another_course_is_refused(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        $course = $this->getDataGenerator()->create_course();
        $other = $this->getDataGenerator()->create_course();
        $qgen = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $qgen->create_question_category(['contextid' => \context_course::instance($other->id)->id]);
        $this->expectException(\moodle_exception::class);
        bank::questions($course, (int) $category->id);
    }
}
