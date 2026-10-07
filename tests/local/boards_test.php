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

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/local/oksigeniaclasstools/tests/generator_trait.php');

/**
 * Tests for sharing a drawing board with a class: saved in the course and notified to its students.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\boards
 */
#[\PHPUnit\Framework\Attributes\CoversClass(boards::class)]
final class boards_test extends \advanced_testcase {
    use \local_oksigeniaclasstools\generator_trait;

    /** A 1×1 PNG. */
    const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    /**
     * The files in the folder of a class.
     *
     * @param \stdClass $course
     * @param string $listid
     * @return \stored_file[]
     */
    private function files(\stdClass $course, string $listid): array {
        foreach (get_fast_modinfo($course->id)->get_instances_of('folder') as $cm) {
            if ($cm->idnumber === boards::IDNUMBER_PREFIX . $listid) {
                $context = \context_module::instance($cm->id);
                return get_file_storage()->get_area_files($context->id, 'mod_folder', 'content', 0, 'filename', false);
            }
        }
        return [];
    }

    public function test_the_whole_course_gets_it_and_a_notification(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(2);
        $this->setUser($teacher);
        $sink = $this->redirectMessages();
        $result = boards::share($course, 'c' . $course->id, 'Fractions', base64_decode(self::PNG));
        $this->assertSame(2, $result->notified);
        $this->assertCount(2, $sink->get_messages());
        $this->assertSame('boardshared', $sink->get_messages()[0]->eventtype);
        $section = get_string('boardsection', 'local_oksigeniaclasstools');
        $this->assertTrue($DB->record_exists('course_sections', ['course' => $course->id, 'name' => $section]));
        $files = $this->files($course, 'c' . $course->id);
        $this->assertSame(['Fractions.png'], array_values(array_map(fn($f) => $f->get_filename(), $files)));
    }

    public function test_a_group_gets_its_own_folder_only_for_its_members(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, $teacher, $students] = $this->make_class(2);
        $group = $gen->create_group(['courseid' => $course->id]);
        $gen->create_group_member(['groupid' => $group->id, 'userid' => $students[0]->id]);
        $this->setUser($teacher);
        $sink = $this->redirectMessages();
        $result = boards::share($course, 'g' . $group->id, 'Map', base64_decode(self::PNG));
        $this->assertSame(1, $result->notified);
        $this->assertEquals($students[0]->id, $sink->get_messages()[0]->useridto);
        foreach (get_fast_modinfo($course->id)->get_instances_of('folder') as $cm) {
            $this->assertStringContainsString('"id":' . $group->id, (string) $cm->availability);
        }
    }

    public function test_another_board_goes_to_the_same_folder_and_pdf_works(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(1);
        $this->setUser($teacher);
        $this->redirectMessages();
        boards::share($course, 'c' . $course->id, 'Board', base64_decode(self::PNG));
        boards::share($course, 'c' . $course->id, 'Board', base64_decode(self::PNG), 'pdf');
        boards::share($course, 'c' . $course->id, 'Board', base64_decode(self::PNG));
        $this->assertCount(1, get_fast_modinfo($course->id)->get_instances_of('folder'));
        $files = $this->files($course, 'c' . $course->id);
        $names = array_values(array_map(fn($f) => $f->get_filename(), $files));
        sort($names);
        $this->assertSame(['Board (2).png', 'Board.pdf', 'Board.png'], $names);
        foreach ($files as $file) {
            if ($file->get_filename() === 'Board.pdf') {
                $this->assertStringStartsWith('%PDF', $file->get_content());
            }
        }
    }

    public function test_a_bad_image_or_another_course_s_group_is_refused(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, $teacher] = $this->make_class(1);
        $other = $gen->create_group(['courseid' => $gen->create_course()->id]);
        $this->setUser($teacher);
        try {
            boards::share($course, 'c' . $course->id, 'Bad', 'not an image');
            $this->fail('A file that is not a PNG was accepted');
        } catch (\moodle_exception $e) {
            $this->assertSame('invalidparameter', $e->errorcode);
        }
        $this->expectException(\moodle_exception::class);
        boards::share($course, 'g' . $other->id, 'Other', base64_decode(self::PNG));
    }
}
