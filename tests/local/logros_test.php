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
 * Tests for the teacher's stickers: one real use per sticker, course and day, the levels by days, the album and the
 * thresholds, and forgetting them.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\logros
 */
#[\PHPUnit\Framework\Attributes\CoversClass(logros::class)]
final class logros_test extends \advanced_testcase {
    public function test_a_use_counts_once_a_day_and_the_level_goes_up_with_the_days(): void {
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        $course = $this->getDataGenerator()->create_course();
        $day = 86400;
        $start = make_timestamp(2026, 10, 5, 10);
        $first = logros::record((int) $teacher->id, (int) $course->id, 'sacanombres', $start);
        $this->assertSame(['cromo' => 'sacanombres', 'days' => 1, 'level' => 1, 'up' => true], $first);
        // The same day again: nothing new.
        $again = logros::record((int) $teacher->id, (int) $course->id, 'sacanombres', $start + 3600);
        $this->assertSame(1, $again['days']);
        $this->assertFalse($again['up']);
        logros::record((int) $teacher->id, (int) $course->id, 'sacanombres', $start + $day);
        $third = logros::record((int) $teacher->id, (int) $course->id, 'sacanombres', $start + 2 * $day);
        $this->assertSame(['cromo' => 'sacanombres', 'days' => 3, 'level' => 2, 'up' => true], $third);
        $this->assertSame(0, logros::level(0));
        $this->assertSame(5, logros::level(60));
    }

    public function test_an_unknown_sticker_is_refused(): void {
        $this->resetAfterTest();
        $this->expectException(\moodle_exception::class);
        logros::record(2, 1, 'nothing');
    }

    public function test_the_album_and_the_thresholds(): void {
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        $course = $this->getDataGenerator()->create_course();
        logros::record((int) $teacher->id, (int) $course->id, 'tiradados');
        $album = logros::album((int) $teacher->id);
        $this->assertCount(count(logros::CROMOS), $album['cromos']);
        $this->assertSame(1, $album['got']);
        $dice = array_values(array_filter($album['cromos'], fn($c) => $c['cromo'] === 'tiradados'))[0];
        $this->assertSame(
            ['cromo' => 'tiradados', 'family' => 'dice', 'days' => 1, 'level' => 1, 'learned' => false, 'next' => 3],
            $dice
        );
        $this->assertSame(1, $album['weeks']);
        $this->assertSame(['devices' => 5, 'picks' => 5, 'students' => 8], logros::thresholds());
        set_config('logros_devices', 12, 'local_oksigeniaclasstools');
        $this->assertSame(12, logros::thresholds()['devices']);
        $this->assertTrue(logros::on());
        set_config('logros', 0, 'local_oksigeniaclasstools');
        $this->assertFalse(logros::on());
        $this->assertNull(\local_oksigeniaclasstools_album((int) $teacher->id));
    }

    public function test_a_sticker_learned_in_its_guided_help(): void {
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        $course = $this->getDataGenerator()->create_course();
        $this->assertSame(['cromo' => 'domamoviles', 'learned' => true, 'before' => false], logros::learn(
            (int) $teacher->id,
            (int) $course->id,
            'domamoviles'
        ));
        // Learned again: kept once, and said so.
        $this->assertTrue(logros::learn((int) $teacher->id, (int) $course->id, 'domamoviles')['before']);
        $this->assertSame(['domamoviles'], logros::learned((int) $teacher->id));
        // Learned is not a use: no days, no level, but the sticker is in the album.
        $this->assertSame([], logros::days((int) $teacher->id));
        $album = logros::album((int) $teacher->id);
        $this->assertSame(1, $album['got']);
        $tamer = array_values(array_filter($album['cromos'], fn($c) => $c['cromo'] === 'domamoviles'))[0];
        $this->assertSame(0, $tamer['level']);
        $this->assertTrue($tamer['learned']);
        // And privacy forgets it with the course.
        \local_oksigeniaclasstools\privacy\provider::delete_data_for_all_users_in_context(\context_course::instance($course->id));
        $this->assertSame([], logros::learned((int) $teacher->id));
    }

    public function test_privacy_forgets_the_uses_of_a_course(): void {
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        $course = $this->getDataGenerator()->create_course();
        logros::record((int) $teacher->id, (int) $course->id, 'cumplemetas');
        $context = \context_course::instance($course->id);
        $contexts = \local_oksigeniaclasstools\privacy\provider::get_contexts_for_userid((int) $teacher->id)->get_contextids();
        $this->assertContains((int) $context->id, array_map('intval', $contexts));
        \local_oksigeniaclasstools\privacy\provider::delete_data_for_all_users_in_context($context);
        $this->assertSame([], logros::days((int) $teacher->id));
    }
}
