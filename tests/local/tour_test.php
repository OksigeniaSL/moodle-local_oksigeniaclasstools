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
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\tour
 */
#[\PHPUnit\Framework\Attributes\CoversClass(tour::class)]
final class tour_test extends \advanced_testcase {
    public function test_the_tour_is_added_once_with_three_steps(): void {
        global $DB;
        $this->resetAfterTest();
        // The plugin's install already added it: it is found, not added again.
        $id = tour::install();
        $this->assertNotNull($id);
        $this->assertSame($id, tour::install());
        $this->assertSame(1, $DB->count_records('tool_usertours_tours', ['name' => tour::NAME]));
        $tour = \tool_usertours\tour::instance($id);
        $this->assertSame('/course/view.php%', $tour->get_pathmatch());
        $this->assertCount(3, $tour->get_steps());
        // Its name is a language string, shown in each teacher's language.
        $this->assertSame(tour::NAME, $tour->get_name());
        $this->assertSame(
            get_string('tourname', 'local_oksigeniaclasstools'),
            \tool_usertours\helper::get_string_from_input($tour->get_name())
        );
    }
}
