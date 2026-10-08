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
 * Tests for the notice of a live session that students see in Moodle.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\notice
 */
#[\PHPUnit\Framework\Attributes\CoversClass(notice::class)]
final class notice_test extends \advanced_testcase {
    public function test_students_of_the_course_see_the_notice(): void {
        global $PAGE;
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $course = $gen->create_course(['shortname' => 'MAT5A']);
        $other = $gen->create_course();
        $teacher = $gen->create_and_enrol($course, 'editingteacher');
        $student = $gen->create_and_enrol($course, 'student');
        $outsider = $gen->create_and_enrol($other, 'student');
        $live = live::start($course, (int) $teacher->id, 'vote', 'anon');
        $PAGE->set_url('/course/view.php', ['id' => $course->id]);
        $PAGE->set_course($course);
        $PAGE->set_pagelayout('course');
        $this->setUser($student);
        $html = notice::html();
        $this->assertStringContainsString('join.php?c=' . $live->code, $html);
        $this->assertStringContainsString('MAT5A', $html);
        // The teacher who opened it, someone of another course, and a remote: nothing.
        $this->setUser($teacher);
        $this->assertSame('', notice::html());
        $this->setUser($outsider);
        $this->assertSame('', notice::html());
        $this->setUser($student);
        set_config('livenotice', 0, 'local_oksigeniaclasstools');
        $this->assertSame('', notice::html());
        set_config('livenotice', 1, 'local_oksigeniaclasstools');
        live::control($live, 'end');
        $this->assertSame('', notice::html());
    }
}
