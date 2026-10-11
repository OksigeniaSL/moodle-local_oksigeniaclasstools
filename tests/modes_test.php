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
 * Tests for who opens the board and how: teachers, students (only when the site allows it), and the site data.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     ::local_oksigeniaclasstools_mode
 * @covers     ::local_oksigeniaclasstools_student_data
 * @covers     ::local_oksigeniaclasstools_visible_userids
 * @covers     ::local_oksigeniaclasstools_site
 * @covers     ::local_oksigeniaclasstools_default_mode
 * @covers     \local_oksigeniaclasstools\admin\setting_categorymodes
 */
#[\PHPUnit\Framework\Attributes\CoversFunction('local_oksigeniaclasstools_mode')]
#[\PHPUnit\Framework\Attributes\CoversFunction('local_oksigeniaclasstools_student_data')]
#[\PHPUnit\Framework\Attributes\CoversFunction('local_oksigeniaclasstools_visible_userids')]
#[\PHPUnit\Framework\Attributes\CoversFunction('local_oksigeniaclasstools_site')]
#[\PHPUnit\Framework\Attributes\CoversFunction('local_oksigeniaclasstools_default_mode')]
#[\PHPUnit\Framework\Attributes\CoversClass(\local_oksigeniaclasstools\admin\setting_categorymodes::class)]
final class modes_test extends \advanced_testcase {
    use generator_trait;

    public function test_students_only_when_the_site_allows_it(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        $context = \context_course::instance($course->id);
        $this->setUser($teacher);
        $this->assertSame('teacher', local_oksigeniaclasstools_mode($context));
        $this->setUser($students[0]);
        $this->assertNull(local_oksigeniaclasstools_mode($context));
        set_config('students', 1, 'local_oksigeniaclasstools');
        $this->assertSame('student', local_oksigeniaclasstools_mode($context));
        $this->setUser($this->getDataGenerator()->create_user());
        $this->assertNull(local_oksigeniaclasstools_mode($context));
    }

    public function test_the_students_board_carries_no_data_of_the_class(): void {
        $this->resetAfterTest();
        [$course] = $this->make_class(3);
        $data = local_oksigeniaclasstools_student_data($course, \context_course::instance($course->id));
        $this->assertSame('student', $data['mode']);
        $this->assertSame([], $data['lists']);
        foreach (['sesskey', 'pickurl', 'stateurl', 'groupsurl', 'state'] as $key) {
            $this->assertArrayNotHasKey($key, $data);
        }
        $this->assertNotContains('quien', $data['tools']);
        $this->assertNotContains('grupos', $data['tools']);
    }

    public function test_separate_groups_limit_who_can_be_picked(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, $editing, $students] = $this->make_class(2, ['groupmode' => SEPARATEGROUPS, 'groupmodeforce' => 1]);
        $teacher = $gen->create_and_enrol($course, 'teacher');
        $mine = $gen->create_group(['courseid' => $course->id]);
        $gen->create_group_member(['groupid' => $mine->id, 'userid' => $teacher->id]);
        $gen->create_group_member(['groupid' => $mine->id, 'userid' => $students[0]->id]);
        $context = \context_course::instance($course->id);

        $this->setUser($teacher);
        $visible = local_oksigeniaclasstools_visible_userids($course, $context);
        $this->assertContains((int) $students[0]->id, $visible);
        $this->assertNotContains((int) $students[1]->id, $visible);
        // Whoever can see all groups sees everyone.
        $this->setUser($editing);
        $this->assertNull(local_oksigeniaclasstools_visible_userids($course, $context));
    }

    public function test_site_data(): void {
        global $PAGE;
        $this->resetAfterTest();
        $PAGE = new \moodle_page();
        $PAGE->set_context(\context_system::instance());
        $PAGE->set_url('/local/oksigeniaclasstools/index.php');
        unset_config('levels', 'local_oksigeniaclasstools');
        $site = local_oksigeniaclasstools_site();
        $this->assertSame(LOCAL_OKSIGENIACLASSTOOLS_LEVELS, $site['levels']);
        $this->assertNotEmpty($site['logo']);
        $this->assertNotEmpty($site['tz']);
        $this->assertSame((new \moodle_url('/'))->out(false), $site['home']);
        $this->assertSame(current_language(), $site['lang']);
        $this->assertSame(get_string('app_tab_timer', 'local_oksigeniaclasstools'), $site['str']->tab_timer);
        set_config('levels', 'primary,secondary', 'local_oksigeniaclasstools');
        $this->assertSame(['primary', 'secondary'], local_oksigeniaclasstools_site()['levels']);
        // The screen mode courses start in: Primary unless the admin chooses another.
        $this->assertSame('primary', $site['mode']);
        set_config('defaultmode', 'advanced', 'local_oksigeniaclasstools');
        $this->assertSame('advanced', local_oksigeniaclasstools_site()['mode']);
        set_config('defaultmode', 'nonsense', 'local_oksigeniaclasstools');
        $this->assertSame('primary', local_oksigeniaclasstools_site()['mode']);
    }

    public function test_a_category_chooses_the_mode_its_courses_start_in(): void {
        global $CFG;
        require_once($CFG->libdir . '/adminlib.php');
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $early = $gen->create_category(['name' => 'Early years']);
        $room = $gen->create_category(['name' => 'Room 1', 'parent' => $early->id]);
        $primary = $gen->create_category(['name' => 'Primary']);
        $other = $gen->create_category(['name' => 'Other']);
        set_config('defaultmode', 'secondary', 'local_oksigeniaclasstools');
        // Nothing by category: the site's mode.
        $this->assertSame('secondary', local_oksigeniaclasstools_default_mode((int) $room->id));
        $setting = new \local_oksigeniaclasstools\admin\setting_categorymodes();
        $chosen = [$early->id => 'early', $primary->id => 'primary', $other->id => 'nonsense'];
        $this->assertSame('', $setting->write_setting($chosen));
        $this->assertSame([$early->id => 'early', $primary->id => 'primary'], json_decode($setting->get_setting(), true));
        // A subcategory without its own takes the one above; one with its own keeps it; without any, the site's.
        $this->assertSame('early', local_oksigeniaclasstools_default_mode((int) $room->id));
        $this->assertSame('primary', local_oksigeniaclasstools_default_mode((int) $primary->id));
        $this->assertSame('secondary', local_oksigeniaclasstools_default_mode((int) $other->id));
        $this->assertSame('secondary', local_oksigeniaclasstools_default_mode());
        $setting->write_setting([$early->id => 'early', $room->id => 'advanced']);
        $this->assertSame('advanced', local_oksigeniaclasstools_default_mode((int) $room->id));
        // The form lists every category, with «Like the category above» for a subcategory.
        $html = $setting->output_html($setting->get_setting());
        $this->assertStringContainsString('Early years / Room 1', $html);
        $this->assertStringContainsString(get_string('categorymodes_parent', 'local_oksigeniaclasstools'), $html);
    }
}
