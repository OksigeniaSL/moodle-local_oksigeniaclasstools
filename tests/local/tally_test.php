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

global $CFG;
require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');

/**
 * Tests for what the boards are used for: what a board sends adds up per course, day and kind of board, only items of
 * the board count, and the report puts first what students use most.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\tally
 */
#[\PHPUnit\Framework\Attributes\CoversClass(tally::class)]
final class tally_test extends \advanced_testcase {
    public function test_what_boards_send_adds_up_per_course_day_and_kind_of_board(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $now = make_timestamp(2026, 10, 19, 14);
        $this->assertSame(2, tally::add($course->id, 'student', ['pizarra' => [1, 120], 'juegos/rosco' => [2, 60]], $now));
        tally::add($course->id, 'student', ['pizarra' => [0, 45]], $now + 600);
        tally::add($course->id, 'teacher', ['pizarra' => [1, 30]], $now);
        // The next day, a row of its own.
        tally::add($course->id, 'student', ['pizarra' => [1, 15]], $now + DAYSECS);
        $rows = $DB->get_records('local_oksigeniaclasstools_tally', ['courseid' => $course->id, 'tool' => 'pizarra'], 'day, who');
        $got = array_values(array_map(fn($r) => [(int) $r->day, $r->who, (int) $r->opens, (int) $r->seconds], $rows));
        $this->assertSame([[20261019, 'student', 1, 165], [20261019, 'teacher', 1, 30], [20261020, 'student', 1, 15]], $got);
    }

    public function test_only_items_of_the_board_count_and_each_sending_has_a_ceiling(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $added = tally::add($course->id, 'student', [
            'juegos/rosco' => [1, 99999],
            'material/tangram' => [999, 10],
            'juegos/nothing' => [1, 10],
            'material/rosco' => [1, 10],
            'nothing' => [1, 10],
            'pizarra/rosco' => [1, 10],
            'reloj' => 'not a pair',
            'qr' => [0, 0],
        ]);
        $this->assertSame(2, $added);
        $table = 'local_oksigeniaclasstools_tally';
        $tools = $DB->get_fieldset_select($table, 'tool', 'courseid = ?', [$course->id]);
        $this->assertEqualsCanonicalizing(['juegos/rosco', 'material/tangram'], $tools);
        $this->assertSame(tally::MAXSECONDS, (int) $DB->get_field($table, 'seconds', ['tool' => 'juegos/rosco']));
        $this->assertSame(tally::MAXOPENS, (int) $DB->get_field($table, 'opens', ['tool' => 'material/tangram']));
    }

    public function test_only_teachers_and_students_boards(): void {
        $this->resetAfterTest();
        $this->expectException(\moodle_exception::class);
        tally::add(1, 'guest', ['pizarra' => [1, 10]]);
    }

    public function test_the_report_puts_first_what_students_use_most(): void {
        $this->resetAfterTest();
        $one = $this->getDataGenerator()->create_course();
        $two = $this->getDataGenerator()->create_course();
        $now = make_timestamp(2026, 10, 19, 14);
        tally::add($one->id, 'student', ['pizarra' => [3, 1800], 'juegos/rosco' => [1, 300]], $now);
        tally::add($one->id, 'teacher', ['juegos/rosco' => [2, 900], 'temporizador' => [4, 600]], $now);
        tally::add($two->id, 'student', ['juegos/rosco' => [1, 2400]], $now - 10 * DAYSECS);

        // In the first course: the board, then the rosco (students), then the timer (only teachers).
        $report = tally::report($one->id, 0);
        $this->assertSame(['pizarra', 'juegos/rosco', 'temporizador'], array_column($report, 'key'));
        $this->assertSame(['key' => 'juegos/rosco', 'name' => get_string('app_tab_games', 'local_oksigeniaclasstools') . ' › '
            . get_string('app_ro_name', 'local_oksigeniaclasstools'), 'sopens' => 1, 'sseconds' => 300, 'topens' => 2,
            'tseconds' => 900, 'days' => 1], $report[1]);

        // In all courses, the rosco adds up and goes first, on two days.
        $all = tally::report(0, 0);
        $this->assertSame('juegos/rosco', $all[0]['key']);
        $this->assertSame([2, 2700, 2], [$all[0]['sopens'], $all[0]['sseconds'], $all[0]['days']]);

        // The last week leaves out what was ten days ago.
        $week = tally::report(0, tally::since('week', $now));
        $this->assertSame([1, 300], [$week[1]['sopens'], $week[1]['sseconds']]);
        $this->assertSame(20261013, tally::since('week', $now));
        $this->assertSame(0, tally::since('all', $now));
        $this->assertEqualsCanonicalizing([(int) $one->id, (int) $two->id], tally::courses());
    }

    public function test_a_deleted_course_takes_its_counts_away(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $other = $this->getDataGenerator()->create_course();
        tally::add($course->id, 'student', ['pizarra' => [1, 60]]);
        tally::add($other->id, 'student', ['pizarra' => [1, 60]]);
        delete_course($course, false);
        $this->assertFalse($DB->record_exists('local_oksigeniaclasstools_tally', ['courseid' => $course->id]));
        $this->assertTrue($DB->record_exists('local_oksigeniaclasstools_tally', ['courseid' => $other->id]));
    }
}
