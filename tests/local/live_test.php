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
 * Tests for live sessions: votes, team buzzers, brainstorms and the teacher's phone as a remote.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\live
 */
#[\PHPUnit\Framework\Attributes\CoversClass(live::class)]
final class live_test extends \advanced_testcase {
    public function test_start_gives_a_readable_code_and_ends_the_previous_one(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $teacher = $this->getDataGenerator()->create_user();
        $first = live::start($course, $teacher->id, 'vote', 'anon');
        $this->assertMatchesRegularExpression('/^[A-HJ-NP-Z2-9]{6}$/', $first->code);
        $this->assertEquals($first->id, live::by_code(strtolower($first->code))->id);
        $second = live::start($course, $teacher->id, 'vote', 'anon');
        $this->assertNull(live::by_code($first->code));
        $this->assertEquals($second->id, live::by_code($second->code)->id);
        // A remote is always with the account.
        $this->assertSame('moodle', live::start($course, $teacher->id, 'remote', 'anon')->identity);
    }

    public function test_buzzers_need_two_teams(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $this->expectException(\moodle_exception::class);
        live::start($course, 2, 'buzz', 'anon', ['teams' => ['Only one']]);
    }

    public function test_a_vote_counts_one_answer_per_device_and_it_can_change(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'vote', 'anon', ['vote' => 'yesno']);
        $a = str_repeat('a', 32);
        $b = str_repeat('b', 32);
        live::join($live, $a);
        live::join($live, $b);
        live::join($live, $b);
        // Closed: no answers yet.
        try {
            live::answer($live, $a, 'yes');
            $this->fail('Answered a closed question');
        } catch (\moodle_exception $e) {
            $this->assertSame('liveclosed', $e->errorcode);
        }
        $live = live::control($live, 'open');
        live::answer($live, $a, 'yes');
        live::answer($live, $b, 'yes');
        // Changing it at once is a burst of taps: it stays; later it changes.
        live::answer($live, $b, 'no');
        $this->assertSame(['yes' => 2, 'no' => 0], live::board_view($live)['results']);
        $DB->set_field('local_oksigeniaclasstools_livein', 'timecreated', 0, ['liveid' => $live->id, 'device' => $b, 'round' => 1]);
        live::answer($live, $b, 'no');
        $view = live::board_view($live);
        $this->assertSame(['yes' => 1, 'no' => 1], $view['results']);
        $this->assertCount(2, $view['devices']);
        $this->assertSame('', $view['devices'][0]['name']);
        // Results reach the devices only when the teacher shows them, once it is closed.
        $this->assertArrayNotHasKey('results', live::device_view($live, $a));
        $live = live::control($live, 'show', ['show' => 1]);
        $live = live::control($live, 'close');
        $this->assertSame(['yes' => 1, 'no' => 1], live::device_view($live, $a)['results']);
        $this->assertSame('yes', live::device_view($live, $a)['mine']);
        // Something that is not an answer of the vote.
        $live = live::control($live, 'open');
        $this->expectException(\moodle_exception::class);
        live::answer($live, $a, 'maybe');
    }

    public function test_a_vote_can_close_by_itself(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'vote', 'anon', ['vote' => 'yesno', 'show' => 1]);
        [$a, $b] = [str_repeat('a', 32), str_repeat('b', 32)];
        live::join($live, $a);
        live::join($live, $b);
        $live = live::control($live, 'open', ['secs' => 30]);
        $view = live::board_view($live);
        $this->assertTrue($view['open']);
        $this->assertGreaterThan(25, $view['left']);
        live::answer($live, $a, 'yes');
        // Time is up: closed for everyone, even before the board says so.
        $state = json_decode($live->state, true);
        $state['closesat'] = time() - 1;
        $live->state = json_encode($state);
        $DB->set_field('local_oksigeniaclasstools_live', 'state', $live->state, ['id' => $live->id]);
        $this->assertFalse(live::board_view($live)['open']);
        $this->assertSame(0, live::board_view($live)['left']);
        $this->assertSame(['yes' => 1, 'no' => 0], live::device_view($live, $b)['results']);
        $this->expectException(\moodle_exception::class);
        live::answer($live, $b, 'no');
    }

    public function test_buzzers_keep_the_order_and_only_the_first_press(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'buzz', 'anon', ['teams' => ['Red', 'Blue']]);
        [$a, $b, $c] = [str_repeat('a', 32), str_repeat('b', 32), str_repeat('c', 32)];
        live::join($live, $a, 0, 1);
        live::join($live, $b, 0, 2);
        live::join($live, $c, 0, 9);
        $live = live::control($live, 'open');
        $this->assertSame(1, live::answer($live, $b, 'press'));
        $this->assertSame(2, live::answer($live, $a, 'press'));
        $this->assertSame(1, live::answer($live, $b, 'press'));
        $this->assertSame(3, live::answer($live, $c, 'press'));
        $view = live::board_view($live);
        $this->assertSame([2, 1, 2], array_column($view['presses'], 'team'));
        $this->assertSame(1, live::device_view($live, $b)['place']);
        // Another round starts empty.
        $live = live::control($live, 'open');
        $this->assertSame([], live::board_view($live)['presses']);
    }

    public function test_a_brainstorm_takes_up_to_max_answers_per_device(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'ideas', 'anon', ['max' => 2]);
        $a = str_repeat('a', 32);
        $b = str_repeat('b', 32);
        live::join($live, $a);
        live::join($live, $b);
        // Closed: nothing gets in.
        try {
            live::idea($live, $a, 'Sol');
            $this->fail('Answered a closed question');
        } catch (\moodle_exception $e) {
            $this->assertSame('liveclosed', $e->errorcode);
        }
        $live = live::control($live, 'open', ['q' => '  What does a plant need? <b>now</b> ']);
        live::idea($live, $a, '  Sun   light ');
        // The same answer again counts once; a third one with max 2, and an empty one, are left out; a long one is cut.
        live::idea($live, $a, 'sun LIGHT');
        live::idea($live, $a, '<script>x</script>Water');
        live::idea($live, $a, 'Soil');
        live::idea($live, $b, str_repeat('x', 50));
        live::idea($live, $b, '   ');
        $view = live::board_view($live);
        $this->assertSame('What does a plant need? now', $view['q']);
        $this->assertSame(['Sun light', 'xWater', str_repeat('x', 32)], array_column($view['ideas'], 'text'));
        $this->assertSame([$a, $a, $b], array_column($view['ideas'], 'device'));
        $mine = live::device_view($live, $a);
        $this->assertSame('What does a plant need? now', $mine['q']);
        $this->assertSame(2, $mine['max']);
        $this->assertSame([['slot' => 1, 'text' => 'Sun light'], ['slot' => 2, 'text' => 'xWater']], $mine['mine']);
        // Taking one back frees its slot.
        live::unidea($live, $a, 1);
        live::idea($live, $a, 'Soil');
        $mine = live::device_view($live, $a)['mine'];
        $this->assertSame([['slot' => 1, 'text' => 'Soil'], ['slot' => 2, 'text' => 'xWater']], $mine);
        // Closed and opened again, the answers stay; a new question starts empty.
        $live = live::control($live, 'close');
        $this->assertFalse(live::device_view($live, $a)['open']);
        $live = live::control($live, 'reopen');
        $this->assertTrue(live::device_view($live, $a)['open']);
        $this->assertCount(3, live::board_view($live)['ideas']);
        $live = live::control($live, 'open', ['q' => 'Another one', 'max' => 3]);
        $this->assertSame([], live::board_view($live)['ideas']);
        $this->assertSame(3, live::device_view($live, $b)['max']);
    }

    public function test_a_device_sent_out_of_a_brainstorm_loses_its_answers(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'ideas', 'anon', ['max' => 3]);
        $a = str_repeat('a', 32);
        $b = str_repeat('b', 32);
        live::join($live, $a);
        live::join($live, $b);
        $live = live::control($live, 'open', ['q' => 'Q']);
        live::idea($live, $a, 'One');
        live::idea($live, $a, 'Two');
        live::idea($live, $b, 'Three');
        $live = live::control($live, 'kick', ['device' => $a]);
        $view = live::board_view($live);
        $this->assertSame(['Three'], array_column($view['ideas'], 'text'));
        $this->assertCount(1, $view['devices']);
        $this->expectException(\moodle_exception::class);
        live::control(live::start($course, 2, 'vote', 'anon'), 'reopen');
    }

    public function test_anonymous_with_their_account_keeps_no_name(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $student = $this->getDataGenerator()->create_user(['firstname' => 'Ana', 'lastname' => 'López']);
        $live = live::start($course, 2, 'vote', 'hidden', ['lang' => 'es']);
        $this->assertSame('hidden', $live->identity);
        $device = live::hidden_device($live, (int) $student->id);
        // The same student gets the same token in the session (in only once), and another one in another session.
        $this->assertSame($device, live::hidden_device($live, (int) $student->id));
        $this->assertNotSame($device, live::hidden_device($live, (int) $student->id + 1));
        $other = live::start($course, 3, 'vote', 'hidden');
        $this->assertNotSame($device, live::hidden_device($other, (int) $student->id));
        $this->assertSame($device, live::device_param($device));
        live::join($live, $device, 0);
        $live = live::control($live, 'open');
        live::answer($live, $device, 'B');
        // No user id kept and no name on the board; the device sees its own token (for its critter).
        $named = $DB->count_records_select('local_oksigeniaclasstools_livein', 'liveid = ? AND userid <> 0', [$live->id]);
        $this->assertSame(0, $named);
        $view = live::board_view($live);
        $this->assertSame('', $view['devices'][0]['name']);
        $this->assertSame(['A' => 0, 'B' => 1, 'C' => 0, 'D' => 0], $view['results']);
        $mine = live::device_view($live, $device);
        $this->assertSame('hidden', $mine['identity']);
        $this->assertSame($device, $mine['seed']);
        // With their names, no seed; the language of the session is kept for the critters' names.
        $this->assertArrayNotHasKey('seed', live::device_view(live::start($course, 4, 'vote', 'moodle'), 'u5'));
        $this->assertSame('es', json_decode($live->state, true)['lang']);
    }

    public function test_a_quiz_scores_right_answers_and_shows_only_the_top_ones(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'quiz', 'anon', ['mode' => 'calm', 'top' => 3]);
        $devices = array_map(fn($c) => str_repeat($c, 32), ['a', 'b', 'c', 'd', 'e']);
        foreach ($devices as $d) {
            live::join($live, $d);
        }
        $question = ['q' => 'Capital of France?', 'options' => ['Rome', 'Paris', 'Oslo'], 'correct' => 1, 'secs' => 20];
        $live = live::control($live, 'open', $question);
        // Before the reveal the devices see how many answers there are, not which one is right.
        $view = live::device_view($live, $devices[0]);
        $this->assertSame(3, $view['n']);
        $this->assertArrayNotHasKey('result', $view);
        $this->assertArrayNotHasKey('options', $view);
        live::answer($live, $devices[0], '1');
        live::answer($live, $devices[0], '2');            // Only the first tap counts.
        live::answer($live, $devices[1], '1');
        live::answer($live, $devices[2], '0');
        try {
            live::answer($live, $devices[3], '7');
            $this->fail('An answer that is not there');
        } catch (\moodle_exception $e) {
            $this->assertSame('invalidparameter', $e->errorcode);
        }
        $board = live::board_view($live);
        $this->assertSame(3, $board['answered']);
        $this->assertSame([], $board['counts']);
        $this->assertSame(0, $board['scores'][0]['total']);   // Nothing counts until it is revealed.
        $live = live::control($live, 'reveal');
        $board = live::board_view($live);
        $this->assertSame([1, 2, 0], $board['counts']);
        $this->assertSame([1000, 1000, 0, 0, 0], array_column($board['scores'], 'total'));
        $mine = live::device_view($live, $devices[0]);
        $this->assertSame(['right' => true, 'points' => 1000, 'total' => 1000, 'correct' => 1, 'rank' => 1], $mine['result']);
        $this->assertFalse(live::device_view($live, $devices[2])['result']['right']);
        $this->assertNull(live::device_view($live, $devices[3])['result']['right']);
        // Second question: four devices tie at the top, the one with no points is fourth and does not see its place.
        $live = live::control($live, 'open', ['q' => 'True?', 'options' => ['True', 'False'], 'correct' => 0, 'secs' => 10]);
        foreach ([2, 3] as $i) {
            live::answer($live, $devices[$i], '0');
        }
        $live = live::control($live, 'reveal');
        $this->assertSame(0, live::device_view($live, $devices[4])['result']['rank']);
        $this->assertSame(1, live::device_view($live, $devices[2])['result']['rank']);
        $summary = live::board_view($live)['summary'];
        $this->assertSame([[1, 3, 2], [2, 2, 2]], array_map(fn($q) => [$q['round'], $q['answered'], $q['right']], $summary));
        // Fast: an answer right at the start is worth almost 1000, one at the very end about 500.
        $fast = live::start($course, 3, 'quiz', 'anon', ['mode' => 'fast']);
        live::join($fast, $devices[0]);
        live::join($fast, $devices[1]);
        $fast = live::control($fast, 'open', ['q' => 'Q', 'options' => ['A', 'B'], 'correct' => 0, 'secs' => 10]);
        live::answer($fast, $devices[0], '0');
        live::answer($fast, $devices[1], '0');
        $late = json_decode($fast->state, true)['qs'][1]['at'] + 10300;
        $DB->set_field(
            'local_oksigeniaclasstools_livein',
            'timecreated',
            $late,
            ['liveid' => $fast->id, 'device' => $devices[1], 'round' => 1]
        );
        $fast = live::control($fast, 'reveal');
        $totals = array_column(live::board_view($fast)['scores'], 'total', 'device');
        $this->assertGreaterThan(990, $totals[$devices[0]]);
        $this->assertSame(500, $totals[$devices[1]]);
    }

    public function test_quiz_teams_come_from_the_groups_or_are_chosen(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $options = ['teams' => ['Blue', 'Red'], 'members' => [41 => 2, 42 => 1], 'pick' => 1];
        $live = live::start($course, 2, 'quiz', 'hidden', $options);
        $one = live::hidden_device($live, 41);
        $two = live::hidden_device($live, 42);
        $three = live::hidden_device($live, 43);
        live::join($live, $one, 0, 1, 41);       // In a group: that team, whatever it chooses.
        live::join($live, $two, 0, 0, 42);
        live::join($live, $three, 0, 2, 43);     // Not in any group: the one it chose.
        $teams = array_column(live::board_view($live)['scores'], 'team', 'device');
        $this->assertSame([2, 1, 2], [$teams[$one], $teams[$two], $teams[$three]]);
        $live = live::control($live, 'open', ['q' => 'Q', 'options' => ['A', 'B'], 'correct' => 1]);
        live::answer($live, $one, '1');
        live::answer($live, $two, '1');
        live::answer($live, $three, '0');
        $live = live::control($live, 'reveal');
        // Teams by their average: Blue 1000 (one member), Red 500 (two members).
        $board = live::board_view($live);
        $teams = array_map(fn($t) => [$t['name'], $t['total'], $t['members']], $board['teamscores']);
        $this->assertSame([['Blue', 1000, 1], ['Red', 500, 2]], $teams);
        $this->assertSame(1, live::device_view($live, $two)['result']['teamrank']);
        $this->assertSame(2, live::device_view($live, $three)['result']['teamrank']);
    }

    public function test_a_device_sent_out_cannot_come_back(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'vote', 'anon');
        $a = str_repeat('a', 32);
        live::join($live, $a);
        $live = live::control($live, 'kick', ['device' => $a]);
        $this->assertTrue(live::device_view($live, $a)['kicked']);
        $this->assertSame([], live::board_view($live)['devices']);
        $this->expectException(\moodle_exception::class);
        live::join($live, $a);
    }

    public function test_with_accounts_the_board_shows_names(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $student = $this->getDataGenerator()->create_user(['firstname' => 'Virginia', 'lastname' => 'Pérez']);
        $live = live::start($course, 2, 'vote', 'moodle');
        live::join($live, 'u' . $student->id, $student->id);
        $this->assertSame(fullname($student), live::board_view($live)['devices'][0]['name']);
    }

    public function test_the_remote_queues_commands_for_the_board(): void {
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'remote', 'moodle');
        $live = live::control($live, 'command', ['command' => 'tm_toggle']);
        $live = live::control($live, 'command', ['command' => 'pick']);
        $this->assertSame(['tm_toggle', 'pick'], array_column(live::board_view($live)['cmds'], 'cmd'));
        $this->assertSame(['pick'], array_column(live::board_view($live, 1)['cmds'], 'cmd'));
        $this->expectException(\moodle_exception::class);
        live::control($live, 'command', ['command' => 'rm -rf']);
    }

    public function test_other_sessions_and_cleanup(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $mine = live::start($course, 2, 'vote', 'anon');
        live::start($course, 3, 'buzz', 'anon', ['teams' => ['A', 'B']]);
        live::start($course, 4, 'remote', 'moodle');
        // Remotes do not count: they are one phone.
        $this->assertSame(1, live::others($mine->id));
        live::join($mine, str_repeat('a', 32));
        $DB->set_field('local_oksigeniaclasstools_live', 'timecreated', time() - 2 * DAYSECS, ['id' => $mine->id]);
        live::cleanup();
        $this->assertFalse($DB->record_exists('local_oksigeniaclasstools_live', ['id' => $mine->id]));
        $this->assertFalse($DB->record_exists('local_oksigeniaclasstools_livein', ['liveid' => $mine->id]));
        $this->assertSame(2, $DB->count_records('local_oksigeniaclasstools_live'));
    }

    public function test_a_session_without_the_board_expires(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $live = live::start($course, 2, 'vote', 'anon');
        $DB->set_field('local_oksigeniaclasstools_live', 'timemodified', time() - live::IDLE - 1, ['id' => $live->id]);
        $this->assertNull(live::by_code($live->code));
        // The board coming back keeps it alive.
        live::mine($live->id, 2);
        $this->assertNotNull(live::by_code($live->code));
    }

    public function test_device_tokens(): void {
        $this->assertSame(str_repeat('a', 32), live::device_param(str_repeat('a', 32)));
        $this->assertSame('u42', live::device_param('u42'));
        $this->assertSame('', live::device_param('../../etc'));
        $this->assertSame('', live::device_param('short'));
    }
}
