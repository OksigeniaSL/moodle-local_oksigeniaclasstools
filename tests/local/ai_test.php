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
 * Tests for the exercises asked from the AI of the site: when it is offered, the prompt, and the answer.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\ai
 */
#[\PHPUnit\Framework\Attributes\CoversClass(ai::class)]
final class ai_test extends \advanced_testcase {
    public function test_the_prompt_has_the_game_the_topic_the_level_and_an_example(): void {
        $prompt = ai::prompt('whoami', 'Volcanoes', 'secondary', 5);
        $this->assertStringContainsString('Write 5 exercises', $prompt);
        $this->assertStringContainsString('«Who am I?»', $prompt);
        $this->assertStringContainsString('«Volcanoes»', $prompt);
        $this->assertStringContainsString('Secondary students', $prompt);
        $this->assertStringContainsString('«= answer»', $prompt);
        // The first example of the level, and only the first.
        $this->assertStringContainsString("# History\n= Charles V", $prompt);
        $this->assertStringNotContainsString('Isaac Newton', $prompt);
        $this->assertStringNotContainsString('{$a', $prompt);
    }

    public function test_without_a_topic_the_ai_chooses(): void {
        $this->assertStringContainsString('«a topic of your choice»', ai::prompt('order', '', 'primary', 3));
    }

    public function test_every_game_and_level_makes_a_prompt(): void {
        foreach (array_keys(ai::GAMES) as $type) {
            foreach (ai::LEVELS as $level) {
                $prompt = ai::prompt($type, 'Rivers', $level, 3);
                $this->assertStringContainsString("Example:\n#", $prompt, "$type $level");
            }
        }
    }

    public function test_the_answer_loses_its_code_fences(): void {
        $this->assertSame("# One\na\nb", ai::clean("```text\r\n# One\r\na\r\nb\r\n```\n"));
        $this->assertSame("# One\na\nb", ai::clean("  # One\na\nb  "));
    }

    public function test_not_offered_without_a_provider_nor_to_students(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $course = $gen->create_course();
        $context = \context_course::instance($course->id);
        $teacher = $gen->create_and_enrol($course, 'editingteacher');
        $student = $gen->create_and_enrol($course, 'student');
        // Only from Moodle 4.5, and here no provider is configured.
        $this->setUser($teacher);
        $this->assertFalse(ai::available($context));
        $this->setUser($student);
        $this->assertFalse(has_capability('local/oksigeniaclasstools:generate', $context));
        $this->assertFalse(ai::available($context));
    }

    public function test_without_a_provider_the_answer_says_why(): void {
        if (!class_exists('\core_ai\aiactions\generate_text')) {
            $this->markTestSkipped('The AI subsystem comes with Moodle 4.5.');
        }
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $course = $gen->create_course();
        $teacher = $gen->create_and_enrol($course, 'editingteacher');
        $this->setUser($teacher);
        $out = ai::generate(\context_course::instance($course->id), (int) $teacher->id, 'order', 'Rivers', 'primary', 3);
        $this->assertFalse($out['ok']);
        $this->assertNotEmpty($out['error']);
    }
}
