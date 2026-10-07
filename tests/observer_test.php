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

namespace local_oksigeniaclasstools;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__ . '/generator_trait.php');

/**
 * Tests for the clean-up when a course or a user is deleted.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\observer
 */
#[\PHPUnit\Framework\Attributes\CoversClass(observer::class)]
final class observer_test extends \advanced_testcase {
    use generator_trait;

    public function test_deleting_a_course_removes_its_picks_and_kept_tools(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        local\picks::record($course->id, $students[0]->id, $teacher->id);
        local\kept::save($course->id, $teacher->id, 'scoreboard', '{}');
        delete_course($course, false);
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_picks'));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_state'));
    }

    public function test_deleting_a_user_removes_their_data(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(2);
        local\picks::record($course->id, $students[0]->id, $teacher->id);
        local\picks::record($course->id, $students[1]->id, $teacher->id);
        local\kept::save($course->id, $teacher->id, 'scoreboard', '{}');
        delete_user($students[0]);
        delete_user($teacher);
        $this->assertSame(1, $DB->count_records('local_oksigeniaclasstools_picks'));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_picks', ['teacherid' => $teacher->id]));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_state'));
    }
}
