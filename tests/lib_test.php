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

global $CFG;
require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
require_once(__DIR__ . '/generator_trait.php');

/**
 * Tests for the screen data of a course: lists by group and cohort, names, picks and kept tools.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     ::local_oksigeniaclasstools_data
 */
#[\PHPUnit\Framework\Attributes\CoversFunction('local_oksigeniaclasstools_data')]
final class lib_test extends \advanced_testcase {
    use generator_trait;

    /**
     * The names of the lists in the screen data.
     *
     * @param array $data
     * @return array
     */
    private function list_names(array $data): array {
        return array_column($data['lists'], 'name');
    }

    public function test_whole_class_without_groups(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(3);
        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $this->assertSame([get_string('wholeclass', 'local_oksigeniaclasstools')], $this->list_names($data));
        $this->assertCount(3, $data['lists'][0]['students']);
        $this->assertSame((int) $course->id, $data['courseid']);
        $this->assertNotEmpty($data['pickurl']);
        $this->assertNotEmpty($data['groupsurl']);
        // The teacher, to join the lists when they play too; and sharing boards, for who can add content.
        $this->assertSame((int) $teacher->id, $data['me']['i']);
        $this->assertNotEmpty($data['me']['n']);
        $this->assertNotEmpty($data['boardurl']);
    }

    public function test_lists_per_group_and_cohort(): void {
        global $CFG;
        require_once($CFG->dirroot . '/enrol/cohort/locallib.php');
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(4);
        $gen = $this->getDataGenerator();
        $group = $gen->create_group(['courseid' => $course->id, 'name' => 'Group B']);
        $gen->create_group_member(['groupid' => $group->id, 'userid' => $students[0]->id]);
        $gen->create_group_member(['groupid' => $group->id, 'userid' => $students[1]->id]);
        $cohort = $gen->create_cohort(['name' => 'Class A']);
        cohort_add_member($cohort->id, $students[2]->id);
        cohort_add_member($cohort->id, $students[3]->id);
        enrol_get_plugin('cohort')->add_instance($course, [
            'customint1' => $cohort->id,
            'roleid' => $this->get_role_id('student'),
            'customint2' => 0,
        ]);
        enrol_cohort_sync(new \null_progress_trace(), $course->id);

        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $this->assertSame(['Class A', 'Group B', get_string('wholecourse', 'local_oksigeniaclasstools')], $this->list_names($data));
        $this->assertCount(2, $data['lists'][0]['students']);
        $this->assertCount(4, $data['lists'][2]['students']);
    }

    public function test_group_and_cohort_with_the_same_students_appear_once(): void {
        global $CFG;
        require_once($CFG->dirroot . '/enrol/cohort/locallib.php');
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(2);
        $gen = $this->getDataGenerator();
        $group = $gen->create_group(['courseid' => $course->id, 'name' => 'A group']);
        $cohort = $gen->create_cohort(['name' => 'Same students']);
        foreach ($students as $student) {
            $gen->create_group_member(['groupid' => $group->id, 'userid' => $student->id]);
            cohort_add_member($cohort->id, $student->id);
        }
        enrol_get_plugin('cohort')->add_instance($course, [
            'customint1' => $cohort->id,
            'roleid' => $this->get_role_id('student'),
            'customint2' => 0,
        ]);

        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $this->assertSame(['A group', get_string('wholecourse', 'local_oksigeniaclasstools')], $this->list_names($data));
    }

    public function test_saved_teams_are_not_offered_as_lists(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(4);
        $this->setUser($teacher);
        local\teams::save_as_groups($course, 'Class', [[$students[0]->id, $students[1]->id], [$students[2]->id, $students[3]->id]]);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $this->assertSame([get_string('wholeclass', 'local_oksigeniaclasstools')], $this->list_names($data));
    }

    public function test_separate_groups_show_only_the_teacher_groups(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, , $students] = $this->make_class(4, ['groupmode' => SEPARATEGROUPS, 'groupmodeforce' => 1]);
        $teacher = $gen->create_and_enrol($course, 'teacher');
        $mine = $gen->create_group(['courseid' => $course->id, 'name' => 'Mine']);
        $other = $gen->create_group(['courseid' => $course->id, 'name' => 'Other']);
        $gen->create_group_member(['groupid' => $mine->id, 'userid' => $teacher->id]);
        $gen->create_group_member(['groupid' => $mine->id, 'userid' => $students[0]->id]);
        $gen->create_group_member(['groupid' => $other->id, 'userid' => $students[1]->id]);

        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $this->assertSame(['Mine'], $this->list_names($data));
    }

    public function test_visible_groups_show_every_group(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, , $students] = $this->make_class(2, ['groupmode' => VISIBLEGROUPS, 'groupmodeforce' => 1]);
        $teacher = $gen->create_and_enrol($course, 'teacher');
        $mine = $gen->create_group(['courseid' => $course->id, 'name' => 'Mine']);
        $other = $gen->create_group(['courseid' => $course->id, 'name' => 'Other']);
        $gen->create_group_member(['groupid' => $mine->id, 'userid' => $teacher->id]);
        $gen->create_group_member(['groupid' => $mine->id, 'userid' => $students[0]->id]);
        $gen->create_group_member(['groupid' => $other->id, 'userid' => $students[1]->id]);

        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $this->assertSame(['Mine', 'Other', get_string('wholecourse', 'local_oksigeniaclasstools')], $this->list_names($data));
    }

    public function test_separate_groups_without_own_groups_give_no_list(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, , $students] = $this->make_class(2, ['groupmode' => SEPARATEGROUPS, 'groupmodeforce' => 1]);
        $teacher = $gen->create_and_enrol($course, 'teacher');
        $other = $gen->create_group(['courseid' => $course->id, 'name' => 'Other']);
        $gen->create_group_member(['groupid' => $other->id, 'userid' => $students[0]->id]);

        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $this->assertSame([], $data['lists']);
    }

    public function test_names_are_plain_text(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, $teacher, $students] = $this->make_class(1);
        $group = $gen->create_group(['courseid' => $course->id, 'name' => 'Maths & Science']);
        $gen->create_group_member(['groupid' => $group->id, 'userid' => $students[0]->id]);
        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        // The board escapes them itself: escaping here too would show «&amp;».
        $this->assertContains('Maths & Science', $this->list_names($data));
    }

    public function test_name_styles(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(1);
        $this->setUser($teacher);
        $this->set_page($course);
        $context = \context_course::instance($course->id);
        $expected = ['firstsurname' => 'Student0 Surname0', 'first' => 'Student0', 'full' => 'Student0 Surname0 Second'];
        foreach ($expected as $style => $name) {
            set_config('namestyle', $style, 'local_oksigeniaclasstools');
            $data = local_oksigeniaclasstools_data($course, $context);
            $this->assertSame($name, $data['lists'][0]['students'][0]['n'], $style);
        }
    }

    public function test_picks_and_kept_tools_reach_the_screen(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(2);
        local\picks::record($course->id, $students[1]->id, $teacher->id);
        local\picks::record($course->id, $students[1]->id, $teacher->id);
        local\kept::save($course->id, $teacher->id, 'scoreboard', '{"teams":[]}');
        $this->setUser($teacher);
        $this->set_page($course);
        $data = local_oksigeniaclasstools_data($course, \context_course::instance($course->id));
        $counts = array_column($data['lists'][0]['students'], 'v', 'i');
        $this->assertSame(2, $counts[$students[1]->id]);
        $this->assertSame(0, $counts[$students[0]->id]);
        $this->assertSame(['teams' => []], ((array) $data['state'])['scoreboard']);
    }

    /**
     * The id of a role.
     *
     * @param string $shortname
     * @return int
     */
    private function get_role_id(string $shortname): int {
        global $DB;
        return (int) $DB->get_field('role', 'id', ['shortname' => $shortname]);
    }

    /**
     * The content of the games comes in the user's language, or the nearest one there is.
     */
    public function test_content_file(): void {
        $this->assertSame('es.js', local_oksigeniaclasstools_content_file('es'));
        $this->assertSame('en.js', local_oksigeniaclasstools_content_file('en'));
        $this->assertSame('en.js', local_oksigeniaclasstools_content_file('en_us'));
        $this->assertSame('en.js', local_oksigeniaclasstools_content_file('xx'));
        $this->assertSame('es.js', local_oksigeniaclasstools_content_file('es_ve'));
        $this->assertSame('en.js', local_oksigeniaclasstools_content_file('../es'));
    }

    public function test_new_materials_join_the_ones_chosen(): void {
        $this->resetAfterTest();
        // Nothing chosen: nothing to add (all are shown).
        unset_config('materials', 'local_oksigeniaclasstools');
        local_oksigeniaclasstools_show_new('materials', ['calc', 'score']);
        $this->assertFalse(get_config('local_oksigeniaclasstools', 'materials'));
        // A choice without the new ones (one left out on purpose stays out).
        set_config('materials', 'rods,line,base10', 'local_oksigeniaclasstools');
        local_oksigeniaclasstools_show_new('materials', ['calc', 'score']);
        $this->assertSame('rods,line,base10,calc,score', get_config('local_oksigeniaclasstools', 'materials'));
        local_oksigeniaclasstools_show_new('materials', ['calc']);
        $this->assertSame('rods,line,base10,calc,score', get_config('local_oksigeniaclasstools', 'materials'));
        $site = local_oksigeniaclasstools_site();
        $this->assertSame(['rods', 'line', 'base10', 'calc', 'score'], $site['materials']);
    }
}
