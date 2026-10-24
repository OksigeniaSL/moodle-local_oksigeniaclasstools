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
 * Tests for the user tour that shows teachers where the tools are.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\tour
 */
#[\PHPUnit\Framework\Attributes\CoversClass(tour::class)]
final class tour_test extends \advanced_testcase {
    public function test_the_tour_is_added_once_with_four_steps(): void {
        global $DB;
        $this->resetAfterTest();
        // The plugin's install already added it: it is found, not added again.
        $id = tour::install();
        $this->assertNotNull($id);
        $this->assertSame($id, tour::install());
        $this->assertSame(1, $DB->count_records('tool_usertours_tours', ['name' => tour::NAME]));
        $tour = \tool_usertours\tour::instance($id);
        $this->assertSame('/course/view.php%', $tour->get_pathmatch());
        $this->assertCount(4, $tour->get_steps());
        // Its name is a language string, shown in each teacher's language.
        $this->assertSame(tour::NAME, $tour->get_name());
        $this->assertSame(
            get_string('tourname', 'local_oksigeniaclasstools'),
            \tool_usertours\helper::get_string_from_input($tour->get_name())
        );
    }

    public function test_a_tour_from_before_gets_the_help_step_once(): void {
        global $DB;
        $this->resetAfterTest();
        $id = tour::install();
        // As installed before the step existed: three steps.
        $where = 'tourid = ? AND ' . $DB->sql_compare_text('title') . ' = ' . $DB->sql_compare_text('?');
        $DB->delete_records_select('tool_usertours_steps', $where, [$id, 'tourstep4title,local_oksigeniaclasstools']);
        $this->assertCount(3, \tool_usertours\tour::instance($id)->get_steps());
        $this->assertTrue(tour::add_help_step());
        $this->assertFalse(tour::add_help_step());
        $steps = array_values(\tool_usertours\tour::instance($id)->get_steps());
        $this->assertCount(4, $steps);
        $this->assertSame('tourstep4title,local_oksigeniaclasstools', $steps[3]->get_title());
    }

    public function test_the_help_leads_to_the_sites_guide_or_the_official_page(): void {
        $this->resetAfterTest();
        $official = get_string('help_official_url', 'local_oksigeniaclasstools');
        $this->assertSame($official, tour::help_url()->out(false));
        set_config('helpurl', 'https://school.example/guide.pdf', 'local_oksigeniaclasstools');
        $this->assertSame('https://school.example/guide.pdf', tour::help_url()->out(false));
        // Something that is not a web address: the official page.
        set_config('helpurl', 'javascript:alert(1)', 'local_oksigeniaclasstools');
        $this->assertSame($official, tour::help_url()->out(false));
    }
}
