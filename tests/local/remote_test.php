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
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
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

    public function test_the_phone_sends_the_cards_it_reads(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $teacher = $gen->create_user();
        $course = $gen->create_course();
        remote::set_enabled((int) $teacher->id, true);
        remote::board((int) $teacher->id, $course, 0, 'envivo', [['envivo', 'Live']]);
        $send = fn(string $cmd) => remote::command(remote::get((int) $teacher->id), $cmd, (int) $course->id);
        // Card numbers from 1 to 60, answers a to d, up to 20 at once.
        foreach (['cards_', 'cards_0a', 'cards_61b', 'cards_7e', 'cards_7', 'cards_' . str_repeat('1a', 21)] as $bad) {
            $this->assertSame(['ok' => false, 'why' => 'unknown'], $send($bad), $bad);
        }
        $this->assertSame(['ok' => true], $send('cards_7a12c60d'));
        $got = remote::board((int) $teacher->id, $course, 0, 'envivo', [['envivo', 'Live']]);
        $this->assertSame(['cards_7a12c60d'], array_column($got['cmds'], 'cmd'));
    }

    public function test_new_orders_and_going_to_another_course(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $teacher = $gen->create_user();
        $here = $gen->create_course(['fullname' => 'Maths 6']);
        $other = $gen->create_course(['fullname' => 'Language 5']);
        $notmine = $gen->create_course(['fullname' => 'Someone else']);
        $gen->enrol_user($teacher->id, $here->id, 'editingteacher');
        $gen->enrol_user($teacher->id, $other->id, 'editingteacher');
        $this->assertSame(['Language 5', 'Maths 6'], array_column(remote::courses((int) $teacher->id), 'name'));
        remote::set_enabled((int) $teacher->id, true);
        remote::board((int) $teacher->id, $here, 0, 'pizarra', [['pizarra', 'Board']]);
        $send = function (string $cmd) use ($teacher, $here) {
            global $DB;
            // No waiting between orders here.
            $row = remote::get((int) $teacher->id);
            $state = json_decode($row->state, true);
            $state['last'] = 0;
            $DB->set_field('local_oksigeniaclasstools_remote', 'state', json_encode($state), ['id' => $row->id]);
            return remote::command(remote::get((int) $teacher->id), $cmd, (int) $here->id);
        };
        foreach (['curtain', 'reveal', 'relay', 'live', 'course_' . $other->id] as $cmd) {
            $this->assertSame(['ok' => true], $send($cmd), $cmd);
        }
        // Not a course of theirs, nor the one on the board.
        $this->assertSame(['ok' => false, 'why' => 'unknown'], $send('course_' . $notmine->id));
        $this->assertSame(['ok' => false, 'why' => 'unknown'], $send('course_' . $here->id));
    }

    public function test_the_phone_gets_the_buttons_of_the_tool_on_screen(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        $teacher = $gen->create_user();
        $course = $gen->create_course();
        remote::set_enabled((int) $teacher->id, true);
        // What the board sends, and only what fits is kept: known ways to show, orders of the board, names as text.
        $json = json_encode([
            [['x_go', 'Make <b>groups</b>', 'big', 'mezclar'], ['x_bad-one', 'No', ''], ['x_le', 'One fewer', 'odd']],
            [['x_re', 'Start again', '', 'Bad icon!'], ['', 'A value', 'val', 'mezclar'], ['x_no', 'Too many', '', 'a', 'b']],
            [['', '4 groups', 'val'], ['x_mr', '', 'more'], ['pick', 'Pick', ''], ['drop', 'Drop', ''],
                ['x_ok', 'Right', 'yes']],
            [['x_no', 'A value with an order', 'val']],
            [
                ['', 'Look', 'cap'], ['x_o3x0', 'Ring', 'opton'], ['x_o3x1', 'Sand', 'opt'], ['x_o4', 'Suspense', 'chk'],
                ['x_o5', 'No', 'cap'],
            ],
            'not a row',
        ]);
        $here = remote::here($json);
        $this->assertSame([
            [['x_go', 'Make groups', 'big', 'mezclar']],
            [['x_re', 'Start again', ''], ['', 'A value', 'val']],
            [['', '4 groups', 'val'], ['pick', 'Pick', ''], ['x_ok', 'Right', 'yes']],
            [['', 'Look', 'cap'], ['x_o3x0', 'Ring', 'opton'], ['x_o3x1', 'Sand', 'opt'], ['x_o4', 'Suspense', 'chk']],
        ], $here);
        $this->assertSame([], remote::here('nonsense'));
        remote::board((int) $teacher->id, $course, 0, 'grupos', [['grupos', 'Groups']], $here);
        $this->assertSame($here, remote::phone(remote::get((int) $teacher->id))['boards'][0]['here']);
        // A button the board has; one it no longer has (the phone was behind).
        $send = fn(string $cmd) => remote::command(remote::get((int) $teacher->id), $cmd, (int) $course->id);
        $this->assertSame(['ok' => true], $send('x_go'));
        $this->assertSame(['ok' => false, 'why' => 'gone'], $send('x_mr'));
        $this->assertSame(['ok' => false, 'why' => 'gone'], $send('x_o5'));
        $this->assertSame(['ok' => false, 'why' => 'unknown'], $send('x_Go'));
        $got = remote::board((int) $teacher->id, $course, 0, 'grupos', [['grupos', 'Groups']], $here);
        $this->assertSame(['x_go'], array_column($got['cmds'], 'cmd'));
    }

    public function test_it_turns_itself_off_after_hours_without_orders(): void {
        global $DB;
        $this->resetAfterTest();
        $teacher = $this->getDataGenerator()->create_user();
        set_config('remoteoff', 1, 'local_oksigeniaclasstools');
        $row = remote::set_enabled((int) $teacher->id, true);
        $this->assertTrue(remote::status((int) $teacher->id)['on']);
        // An order from the phone half an hour ago keeps it on; two hours without one turn it off.
        $state = json_decode($row->state, true);
        $state['since'] = time() - 2 * HOURSECS;
        $state['last'] = (time() - 1800) * 1000;
        $DB->set_field('local_oksigeniaclasstools_remote', 'state', json_encode($state), ['id' => $row->id]);
        $this->assertNotNull(remote::by_token($row->token));
        $state['last'] = 0;
        $DB->set_field('local_oksigeniaclasstools_remote', 'state', json_encode($state), ['id' => $row->id]);
        $this->assertNull(remote::by_token($row->token));
        $this->assertFalse(remote::status((int) $teacher->id)['on']);
        // Turned on again, it counts from then; with «never» it stays on.
        remote::set_enabled((int) $teacher->id, true);
        $this->assertTrue(remote::status((int) $teacher->id)['on']);
        set_config('remoteoff', 0, 'local_oksigeniaclasstools');
        $DB->set_field('local_oksigeniaclasstools_remote', 'state', json_encode(['since' => 1]), ['userid' => $teacher->id]);
        $this->assertTrue(remote::status((int) $teacher->id)['on']);
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
