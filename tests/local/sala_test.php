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
 * Tests for the teachers' room: the span it counts (the last weeks or the season on now), who is in it (who wants, also
 * before their first sticker; only teachers can come in), their stickers in the span, the order by name and how many
 * more play.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\sala
 */
#[\PHPUnit\Framework\Attributes\CoversClass(sala::class)]
final class sala_test extends \advanced_testcase {
    public function test_the_span_is_the_last_weeks_or_the_season_on_now(): void {
        $this->resetAfterTest();
        $now = make_timestamp(2026, 10, 12, 10);
        $span = sala::span($now);
        $this->assertFalse($span['inseason']);
        $this->assertSame(12, $span['weeks']);
        $this->assertSame($now - 12 * WEEKSECS, $span['from']);
        set_config('sala_weeks', 4, 'local_oksigeniaclasstools');
        $this->assertSame(4, sala::span($now)['weeks']);
        set_config('sala_seasons', "2027-01-07 | Second term\nnot a date\n2026-09-08 | First term", 'local_oksigeniaclasstools');
        $span = sala::span($now);
        $this->assertTrue($span['inseason']);
        $this->assertSame('First term', $span['season']);
        $this->assertSame(20260908, $span['day']);
        // Before the first season: the last weeks again.
        $this->assertFalse(sala::span(make_timestamp(2026, 8, 1))['inseason']);
    }

    public function test_the_room_shows_only_who_wants_by_name_with_the_stickers_of_the_span(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $course = $gen->create_course();
        $zoe = $gen->create_user(['firstname' => 'Zoe', 'lastname' => 'Vidal']);
        $ana = $gen->create_user(['firstname' => 'Ana', 'lastname' => 'Ruiz']);
        $hidden = $gen->create_user();
        $newcomer = $gen->create_user(['firstname' => 'Bea', 'lastname' => 'Soler']);
        $viewer = $gen->create_user();
        $now = make_timestamp(2026, 10, 12, 10);
        // Zoe: three days with the dice (level 2), and one long ago that the span leaves out.
        foreach ([1, 2, 3, 200] as $daysago) {
            logros::record((int) $zoe->id, (int) $course->id, 'tiradados', $now - $daysago * DAYSECS);
        }
        logros::record((int) $ana->id, (int) $course->id, 'sacanombres', $now - DAYSECS);
        logros::record((int) $hidden->id, (int) $course->id, 'sacanombres', $now - DAYSECS);
        foreach ([$zoe, $ana, $newcomer] as $teacher) {
            sala::join((int) $teacher->id, true);
        }
        $room = sala::room((int) $viewer->id, $now);
        $this->assertSame(['Ana Ruiz', 'Bea Soler', 'Zoe Vidal'], array_column($room['teachers'], 'name'));
        // Who came in before their first sticker is in the room too, without stickers.
        $this->assertSame([], $room['teachers'][1]['stickers']);
        $this->assertSame([['cromo' => 'tiradados', 'level' => 2]], $room['teachers'][2]['stickers']);
        $this->assertSame(1, $room['others']);
        $this->assertFalse($room['joined']);
        // Who looks is not one of the others; and leaving the room is at once.
        $mine = sala::room((int) $hidden->id, $now);
        $this->assertSame(0, $mine['others']);
        sala::join((int) $ana->id, false);
        $this->assertSame(['Bea Soler', 'Zoe Vidal'], array_column(sala::room((int) $viewer->id, $now)['teachers'], 'name'));
        $this->assertTrue(sala::room((int) $zoe->id, $now)['teachers'][1]['me']);
    }

    public function test_who_looks_is_told_what_their_album_has_and_the_room_leaves_out(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $course = $gen->create_course();
        $me = $gen->create_user();
        $other = $gen->create_user();
        $now = time();
        // Used with a class now, used only long ago, learned in a help, and learned and used: two are left out.
        logros::record((int) $me->id, (int) $course->id, 'tiradados', $now - DAYSECS);
        logros::record((int) $me->id, (int) $course->id, 'sacanombres', $now - 200 * DAYSECS);
        logros::learn((int) $me->id, (int) $course->id, 'domamoviles');
        logros::learn((int) $me->id, (int) $course->id, 'tiradados');
        logros::record((int) $other->id, (int) $course->id, 'tiradados', $now - DAYSECS);
        sala::join((int) $me->id, true);
        sala::join((int) $other->id, true);
        $this->assertSame(['learned' => 1, 'before' => 1], sala::room((int) $me->id, $now)['mine']);
        // Said on the row of who looks, and on no other.
        $notes = array_column(\local_oksigeniaclasstools_sala_view((int) $me->id)['teachers'], 'note', 'id');
        $component = 'local_oksigeniaclasstools';
        $this->assertSame(
            get_string('sala_mine_learned_one', $component) . ' ' . get_string('sala_mine_before_one', $component),
            $notes[(int) $me->id]
        );
        $this->assertSame('', $notes[(int) $other->id]);
        // The album says it too, in «My stickers»: 3 of 25, 2 with the classes and 1 in the helps.
        $split = get_string('app_cr_got_split', $component, (object) ['real' => 2, 'learned' => 1]);
        $this->assertSame($split, \local_oksigeniaclasstools_album((int) $me->id)['split']);
        $this->assertSame('', \local_oksigeniaclasstools_album((int) $other->id)['split']);
    }

    public function test_only_teachers_can_come_in(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $course = $gen->create_course();
        $teacher = $gen->create_and_enrol($course, 'editingteacher');
        $student = $gen->create_and_enrol($course, 'student');
        $this->assertTrue(sala::can_join((int) $teacher->id));
        $this->assertFalse(sala::can_join((int) $student->id));
    }

    public function test_the_room_can_be_turned_off(): void {
        $this->resetAfterTest();
        $this->assertTrue(sala::on());
        set_config('sala', 0, 'local_oksigeniaclasstools');
        $this->assertFalse(sala::on());
        set_config('sala', 1, 'local_oksigeniaclasstools');
        set_config('logros', 0, 'local_oksigeniaclasstools');
        $this->assertFalse(sala::on());
        $this->assertNull(\local_oksigeniaclasstools_sala(2));
    }
}
