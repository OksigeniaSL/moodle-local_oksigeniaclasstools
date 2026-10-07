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

namespace local_oksigeniaclasstools\privacy;

use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;
use core_privacy\tests\provider_testcase;
use local_oksigeniaclasstools\local\kept;
use local_oksigeniaclasstools\local\picks;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__ . '/../generator_trait.php');

/**
 * Tests for the privacy provider.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\privacy\provider
 */
#[\PHPUnit\Framework\Attributes\CoversClass(provider::class)]
final class provider_test extends provider_testcase {
    use \local_oksigeniaclasstools\generator_trait;

    /**
     * A course with picks and kept tools.
     *
     * @return array [course, context, teacher, students]
     */
    private function make_data(): array {
        [$course, $teacher, $students] = $this->make_class(2);
        picks::record($course->id, $students[0]->id, $teacher->id);
        picks::record($course->id, $students[1]->id, $teacher->id);
        kept::save($course->id, $teacher->id, 'scoreboard', '{"teams":[]}');
        return [$course, \context_course::instance($course->id), $teacher, $students];
    }

    public function test_metadata(): void {
        $collection = provider::get_metadata(new \core_privacy\local\metadata\collection('local_oksigeniaclasstools'));
        $tables = array_map(fn($item) => $item->get_name(), $collection->get_collection());
        $this->assertContains('local_oksigeniaclasstools_picks', $tables);
        $this->assertContains('local_oksigeniaclasstools_state', $tables);
        $this->assertContains('core_message', $tables);
    }

    public function test_contexts_and_users(): void {
        $this->resetAfterTest();
        [, $context, $teacher, $students] = $this->make_data();
        $this->assertEquals([$context->id], provider::get_contexts_for_userid($students[0]->id)->get_contextids());
        $this->assertEquals([$context->id], provider::get_contexts_for_userid($teacher->id)->get_contextids());
        $userlist = new userlist($context, 'local_oksigeniaclasstools');
        provider::get_users_in_context($userlist);
        $expected = [$teacher->id, $students[0]->id, $students[1]->id];
        $actual = $userlist->get_userids();
        sort($expected);
        sort($actual);
        $this->assertEquals($expected, $actual);
    }

    public function test_export(): void {
        $this->resetAfterTest();
        [, $context, $teacher, $students] = $this->make_data();
        $this->export_context_data_for_user($students[0]->id, $context, 'local_oksigeniaclasstools');
        $writer = writer::with_context($context);
        $this->assertTrue($writer->has_any_data());
        $data = $writer->get_data([get_string('pluginname', 'local_oksigeniaclasstools')]);
        $this->assertCount(1, $data->picks);
        writer::reset();
        $this->export_context_data_for_user($teacher->id, $context, 'local_oksigeniaclasstools');
        $path = [get_string('pluginname', 'local_oksigeniaclasstools'), 'scoreboard'];
        $kept = writer::with_context($context)->get_data($path);
        $this->assertNotEmpty($kept);
    }

    public function test_delete_for_everyone_in_a_course(): void {
        global $DB;
        $this->resetAfterTest();
        [, $context] = $this->make_data();
        provider::delete_data_for_all_users_in_context($context);
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_picks'));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_state'));
    }

    public function test_delete_for_one_user(): void {
        global $DB;
        $this->resetAfterTest();
        [, $context, $teacher, $students] = $this->make_data();
        provider::delete_data_for_user(new approved_contextlist($students[0], 'local_oksigeniaclasstools', [$context->id]));
        $this->assertSame(1, $DB->count_records('local_oksigeniaclasstools_picks'));
        provider::delete_data_for_user(new approved_contextlist($teacher, 'local_oksigeniaclasstools', [$context->id]));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_picks', ['teacherid' => $teacher->id]));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_state'));
    }

    public function test_delete_for_several_users(): void {
        global $DB;
        $this->resetAfterTest();
        [, $context, $teacher, $students] = $this->make_data();
        $userlist = new approved_userlist($context, 'local_oksigeniaclasstools', [$students[0]->id, $teacher->id]);
        provider::delete_data_for_users($userlist);
        $this->assertSame(1, $DB->count_records('local_oksigeniaclasstools_picks'));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_picks', ['teacherid' => $teacher->id]));
        $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_state'));
    }
}
