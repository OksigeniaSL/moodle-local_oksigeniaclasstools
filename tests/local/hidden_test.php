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
 * Tests for the courses a teacher hides from «Which class?».
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\hidden
 */
#[\PHPUnit\Framework\Attributes\CoversClass(hidden::class)]
final class hidden_test extends \advanced_testcase {
    public function test_hide_and_show_again(): void {
        $this->resetAfterTest();
        $user = $this->getDataGenerator()->create_user();
        $other = $this->getDataGenerator()->create_user();
        hidden::set($user->id, 12, true);
        hidden::set($user->id, 7, true);
        hidden::set($user->id, 12, true);
        $this->assertSame([7, 12], hidden::ids($user->id));
        $this->assertSame([], hidden::ids($other->id));
        hidden::set($user->id, 7, false);
        $this->assertSame([12], hidden::ids($user->id));
        hidden::set($user->id, 12, false);
        $this->assertSame([], hidden::ids($user->id));
        $this->assertNull(get_user_preferences(hidden::PREF, null, $user->id));
    }

    public function test_only_the_newest_are_kept(): void {
        $this->resetAfterTest();
        $user = $this->getDataGenerator()->create_user();
        for ($id = 1; $id <= hidden::MAX + 5; $id++) {
            hidden::set($user->id, $id, true);
        }
        $ids = hidden::ids($user->id);
        $this->assertCount(hidden::MAX, $ids);
        $this->assertSame(6, $ids[0]);
        $this->assertLessThanOrEqual(1333, strlen(get_user_preferences(hidden::PREF, '', $user->id)));
    }
}
