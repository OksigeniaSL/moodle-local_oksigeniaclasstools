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
 * Tests for what teachers keep of each tool in each course.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\kept
 */
#[\PHPUnit\Framework\Attributes\CoversClass(kept::class)]
final class kept_test extends \advanced_testcase {
    public function test_save_replaces_what_was_kept(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $user = $this->getDataGenerator()->create_user();
        kept::save($course->id, $user->id, 'scoreboard', '{"teams":[{"score":1}]}');
        kept::save($course->id, $user->id, 'scoreboard', '{"teams":[{"score":5}]}');
        kept::save($course->id, $user->id, 'roscos', '{"sets":[]}');
        $this->assertSame(2, $DB->count_records('local_oksigeniaclasstools_state', ['courseid' => $course->id]));
        $this->assertSame(['teams' => [['score' => 5]]], kept::all($course->id, $user->id)['scoreboard']);
        $this->assertSame([], kept::all($course->id, $user->id + 1));
    }

    /**
     * Invalid tool names and data.
     *
     * @return array
     */
    public static function invalid_provider(): array {
        return [
            'empty tool' => ['', '{}'],
            'tool with spaces' => ['my tool', '{}'],
            'tool too long' => [str_repeat('a', 33), '{}'],
            'a tool that keeps nothing' => ['mytool', '{}'],
            'not JSON' => ['scoreboard', 'not json'],
            'too big' => ['scoreboard', '"' . str_repeat('a', 200001) . '"'],
        ];
    }

    /**
     * Invalid tool names and data are refused.
     *
     * @dataProvider invalid_provider
     * @param string $tool
     * @param string $data
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('invalid_provider')]
    public function test_invalid_tool_or_data_is_refused(string $tool, string $data): void {
        $this->resetAfterTest();
        $this->expectException(\moodle_exception::class);
        kept::save(1, 2, $tool, $data);
    }
}
