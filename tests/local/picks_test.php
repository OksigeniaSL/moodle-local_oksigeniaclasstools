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

require_once(__DIR__ . '/../generator_trait.php');

/**
 * Tests for the picks of the name picker.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\picks
 */
#[\PHPUnit\Framework\Attributes\CoversClass(picks::class)]
final class picks_test extends \advanced_testcase {
    use \local_oksigeniaclasstools\generator_trait;

    public function test_a_student_pick_is_recorded_and_counted(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(2);
        picks::record($course->id, $students[0]->id, $teacher->id);
        picks::record($course->id, $students[0]->id, $teacher->id);
        picks::record($course->id, $students[1]->id, $teacher->id);
        $this->assertSame([$students[0]->id => 2, $students[1]->id => 1], picks::counts($course->id, 90));
    }

    public function test_someone_who_is_not_a_student_cannot_be_picked(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(0);
        $this->expectException(\moodle_exception::class);
        picks::record($course->id, $teacher->id, $teacher->id);
    }

    public function test_old_picks_do_not_count(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        $id = picks::record($course->id, $students[0]->id, $teacher->id);
        $DB->set_field('local_oksigeniaclasstools_picks', 'timecreated', time() - 100 * DAYSECS, ['id' => $id]);
        $this->assertSame([], picks::counts($course->id, 90));
        $this->assertSame([$students[0]->id => 1], picks::counts($course->id, 120));
    }
}
