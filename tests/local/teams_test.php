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
 * Tests for saving the teams made on the board as course groups.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\teams
 */
#[\PHPUnit\Framework\Attributes\CoversClass(teams::class)]
final class teams_test extends \advanced_testcase {
    use \local_oksigeniaclasstools\generator_trait;

    public function test_teams_become_a_grouping_with_one_group_each(): void {
        global $CFG, $DB;
        require_once($CFG->dirroot . '/group/lib.php');
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(4);
        $grouping = teams::save_as_groups($course, 'Class A', [
            [$students[0]->id, $students[1]->id],
            [$students[2]->id, $students[3]->id, $teacher->id],
        ]);
        $record = $DB->get_record('groupings', ['id' => $grouping->id]);
        $this->assertStringStartsWith(teams::GROUPING_PREFIX, $record->idnumber);
        $this->assertStringContainsString('Class A', $grouping->name);
        $groups = groups_get_all_groups($course->id, 0, $grouping->id);
        $this->assertCount(2, $groups);
        $members = array_map(fn($g) => count(groups_get_members($g->id)), array_values($groups));
        sort($members);
        $this->assertSame([2, 2], $members, 'The teacher is not a student, so they are left out.');
    }

    public function test_names_do_not_repeat(): void {
        $this->resetAfterTest();
        [$course, , $students] = $this->make_class(2);
        $first = teams::save_as_groups($course, 'Class', [[$students[0]->id], [$students[1]->id]]);
        $second = teams::save_as_groups($course, 'Class', [[$students[0]->id], [$students[1]->id]]);
        $this->assertNotSame($first->name, $second->name);
    }

    public function test_no_teams_is_refused(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $this->expectException(\moodle_exception::class);
        teams::save_as_groups($course, 'Class', []);
    }
}
