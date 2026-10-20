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
 * Tests for the words that the word games take from the glossaries of a course.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\glossary
 */
#[\PHPUnit\Framework\Attributes\CoversClass(glossary::class)]
final class glossary_test extends \advanced_testcase {
    /**
     * A course with a glossary of two approved entries and one waiting for approval.
     *
     * @return array [course, glossary]
     */
    private function make_glossary(): array {
        $gen = $this->getDataGenerator();
        $course = $gen->create_course();
        $glossary = $gen->create_module('glossary', ['course' => $course->id, 'name' => 'Science words']);
        $ggen = $gen->get_plugin_generator('mod_glossary');
        $ggen->create_content(
            $glossary,
            [
                'concept' => 'Photosynthesis',
                'approved' => 1,
                'definition' => '<p>How plants make their food with light. <b>Photosynthesis</b> gives off oxygen.</p>',
            ]
        );
        $ggen->create_content($glossary, ['concept' => 'Cell', 'approved' => 1, 'definition' => 'The smallest unit of life.']);
        $ggen->create_content($glossary, ['concept' => 'Unapproved', 'approved' => 0, 'definition' => 'Waiting.']);
        return [$course, $glossary];
    }

    public function test_approved_words_with_their_clue(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        [$course, $glossary] = $this->make_glossary();
        $list = glossary::glossaries($course);
        $this->assertCount(1, $list);
        $this->assertSame('Science words', $list[0]['name']);
        $this->assertSame(2, $list[0]['count']);
        $words = glossary::words($course, (int) $glossary->id);
        $this->assertSame(['Cell', 'Photosynthesis'], array_column($words, 'w'));
        $clue = $words[1]['c'];
        $this->assertStringNotContainsStringIgnoringCase('photosynthesis', $clue, 'The clue does not give the word away.');
        $this->assertStringContainsString('How plants make their food with light.', $clue);
        $this->assertStringNotContainsString('<', $clue);
    }

    public function test_a_glossary_of_another_course_is_refused(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        [, $glossary] = $this->make_glossary();
        $other = $this->getDataGenerator()->create_course();
        $this->expectException(\moodle_exception::class);
        glossary::words($other, (int) $glossary->id);
    }

    public function test_long_clues_are_cut(): void {
        $clue = glossary::clue(str_repeat('word ', 60), 'nothing');
        $this->assertLessThanOrEqual(glossary::CLUE_MAX, \core_text::strlen($clue));
        $this->assertStringEndsWith('…', $clue);
    }
}
