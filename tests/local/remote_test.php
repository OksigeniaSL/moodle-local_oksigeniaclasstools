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
 * Tests for the teacher's fixed remote: its key, turning it off, a new address, and the orders for the open boards.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\remote
 */
#[\PHPUnit\Framework\Attributes\CoversClass(remote::class)]
final class remote_test extends \advanced_testcase {
    public function test_on_it_has_a_key_and_off_the_key_does_nothing(): void {
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        $this->assertSame(['on' => false], remote::status((int) $teacher->id));
        $row = remote::set_enabled((int) $teacher->id, true);
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9]{32}$/', $row->token);
        $this->assertSame((int) $teacher->id, (int) remote::by_token($row->token)->userid);
        $this->assertStringContainsString('mando.php?k=' . $row->token, remote::status((int) $teacher->id)['url']);
        remote::set_enabled((int) $teacher->id, false);
        $this->assertNull(remote::by_token($row->token));
        $this->assertNull(remote::by_token('short'));
        // On again: the same address.
        $this->assertSame($row->token, remote::set_enabled((int) $teacher->id, true)->token);
    }

    public function test_a_new_address_leaves_the_old_one_useless(): void {
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        $old = remote::set_enabled((int) $teacher->id, true)->token;
        $new = remote::rotate((int) $teacher->id)->token;
        $this->assertNotSame($old, $new);
        $this->assertNull(remote::by_token($old));
        $this->assertNotNull(remote::by_token($new));
    }

    public function test_orders_go_only_to_the_open_board_of_their_course(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $teacher = $gen->create_user();
        $one = $gen->create_course(['shortname' => 'One']);
        $two = $gen->create_course(['shortname' => 'Two']);
        remote::set_enabled((int) $teacher->id, true);
        $tools = [['quien', 'Whose turn?'], ['reloj', 'Clock']];
        $this->assertTrue(remote::board((int) $teacher->id, $one, 0, 'quien', $tools)['on']);
        $row = remote::get((int) $teacher->id);
        // The phone sees the open board, with its tools; not the other course.
        $boards = remote::phone($row)['boards'];
        $this->assertCount(1, $boards);
        $this->assertSame('One', $boards[0]['name']);
        $this->assertSame($tools, $boards[0]['tools']);
        $send = fn(string $cmd, \stdClass $course) => remote::command(remote::get((int) $teacher->id), $cmd, (int) $course->id);
        $this->assertSame(['ok' => false, 'why' => 'closed'], $send('pick', $two));
        $this->assertSame(['ok' => false, 'why' => 'unknown'], $send('drop', $one));
        $this->assertSame(['ok' => false, 'why' => 'closed'], $send('tool_zzz', $one));
        $this->assertSame(['ok' => true], $send('tool_reloj', $one));
        // Too fast after the last one.
        $this->assertSame(['ok' => false, 'why' => 'toofast'], $send('pick', $one));
        $got = remote::board((int) $teacher->id, $one, 0, 'quien', $tools);
        $this->assertSame(['tool_reloj'], array_column($got['cmds'], 'cmd'));
        $this->assertTrue($got['phone']);
        // The other course's board, once open, has none of them; and already seen, none again.
        $this->assertSame([], remote::board((int) $teacher->id, $two, 0, 'reloj', $tools)['cmds']);
        $this->assertSame([], remote::board((int) $teacher->id, $one, $got['seq'], 'quien', $tools)['cmds']);
        // Turned off, the board stops asking.
        remote::set_enabled((int) $teacher->id, false);
        $this->assertSame(['on' => false], remote::board((int) $teacher->id, $one, 0, 'quien', $tools));
    }

    public function test_privacy_forgets_the_remote(): void {
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        remote::set_enabled((int) $teacher->id, true);
        $context = \context_user::instance($teacher->id);
        $contexts = \local_oksigeniaclasstools\privacy\provider::get_contexts_for_userid((int) $teacher->id)->get_contextids();
        $this->assertContains((int) $context->id, array_map('intval', $contexts));
        \local_oksigeniaclasstools\privacy\provider::delete_data_for_all_users_in_context($context);
        $this->assertNull(remote::get((int) $teacher->id));
    }
}
