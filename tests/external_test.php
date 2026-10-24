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

namespace local_oksigeniaclasstools;

use core_external\external_api;
use local_oksigeniaclasstools\external;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once(__DIR__ . '/generator_trait.php');

/**
 * Tests for the web services of the board (db/services.php): each one does what its page needed, answers as its
 * description says, and refuses who may not use it.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\external\api
 */
#[\PHPUnit\Framework\Attributes\CoversClass(external\api::class)]
final class external_test extends \advanced_testcase {
    use generator_trait;

    /** A 1×1 PNG. */
    const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    /**
     * Calls a web service as the AJAX service does: its answer, cleaned with the description of its answer.
     *
     * @param string $class The class in external\.
     * @param string $method
     * @param mixed ...$args
     * @return mixed
     */
    private function call(string $class, string $method, ...$args) {
        $class = '\\local_oksigeniaclasstools\\external\\' . $class;
        return external_api::clean_returnvalue($class::{$method . '_returns'}(), $class::$method(...$args));
    }

    /**
     * The same, for a web service whose answer is a JSON document: the document.
     *
     * @param string $class
     * @param string $method
     * @param mixed ...$args
     * @return array
     */
    private function json(string $class, string $method, ...$args): array {
        return json_decode($this->call($class, $method, ...$args)['json'], true);
    }

    /**
     * Expects a call to be refused because the user may not.
     *
     * @param callable $call
     */
    private function refused(callable $call): void {
        try {
            $call();
            $this->fail('It was not refused');
        } catch (\required_capability_exception | \require_login_exception $e) {
            $this->assertNotEmpty($e->errorcode);
        }
    }

    public function test_every_web_service_of_the_services_file_exists(): void {
        global $CFG;
        $functions = [];
        require($CFG->dirroot . '/local/oksigeniaclasstools/db/services.php');
        $this->assertCount(31, $functions);
        foreach ($functions as $name => $f) {
            $this->assertStringStartsWith('local_oksigeniaclasstools_', $name);
            $this->assertTrue($f['ajax']);
            foreach (['', '_parameters', '_returns'] as $suffix) {
                $this->assertTrue(method_exists($f['classname'], $f['methodname'] . $suffix), $name . $suffix);
            }
        }
        // Only the devices with the code and the phone of the fixed remote come without a session.
        $nologin = array_keys(array_filter($functions, fn($f) => isset($f['loginrequired']) && !$f['loginrequired']));
        $this->assertEqualsCanonicalizing(['local_oksigeniaclasstools_live_device', 'local_oksigeniaclasstools_phone_command',
            'local_oksigeniaclasstools_phone_courses', 'local_oksigeniaclasstools_phone_state'], $nologin);
    }

    public function test_through_the_ajax_service_as_the_board_calls_them(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(1);
        $this->setUser($teacher);
        $_POST['sesskey'] = sesskey();
        $saved = external_api::call_external_function(
            'local_oksigeniaclasstools_state_save',
            ['courseid' => (int) $course->id, 'tool' => 'scoreboard', 'data' => '{}'],
            true
        );
        $this->assertSame(['error' => false, 'data' => ['ok' => true]], $saved);
        // A wrong parameter comes back as an error, as the board expects it.
        $wrong = external_api::call_external_function(
            'local_oksigeniaclasstools_state_save',
            ['courseid' => (int) $course->id, 'tool' => 'scoreboard', 'data' => '{}', 'other' => 1],
            true
        );
        $this->assertTrue($wrong['error']);
        // Without a session: a device with a code that is not open.
        $this->setUser(0);
        unset($_POST['sesskey']);
        $device = external_api::call_external_function(
            'local_oksigeniaclasstools_live_device',
            ['code' => 'NOCODE', 'device' => str_repeat('d', 32)],
            true
        );
        $this->assertSame(['ended' => true], json_decode($device['data']['json'], true));
    }

    public function test_kept_state_picks_groups_and_hiding_a_course(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(3);
        $this->setUser($teacher);
        $this->assertSame(['ok' => true], $this->call('state', 'save', (int) $course->id, 'scoreboard', '{"teams":[]}'));
        $this->assertSame(['teams' => []], local\kept::all((int) $course->id, (int) $teacher->id)['scoreboard']);
        $this->assertSame(['ok' => true], $this->call('pick', 'record', (int) $course->id, (int) $students[0]->id));
        $this->assertSame(1, $DB->count_records('local_oksigeniaclasstools_picks', ['courseid' => $course->id]));
        $saved = $this->call('groups', 'save', (int) $course->id, 'Year 5', [[(int) $students[0]->id], [(int) $students[1]->id]]);
        $this->assertTrue($saved['ok']);
        $this->assertSame(2, $DB->count_records('groups', ['courseid' => $course->id]));
        $this->assertSame(['ok' => true, 'hidden' => true], $this->call('course', 'hide', (int) $course->id, true));
        $this->assertContains((int) $course->id, local\hidden::ids((int) $teacher->id));

        // A student uses none of them.
        $this->setUser($students[0]);
        $this->refused(fn() => $this->call('state', 'save', (int) $course->id, 'scoreboard', '{}'));
        $this->refused(fn() => $this->call('pick', 'record', (int) $course->id, (int) $students[1]->id));
        $this->refused(fn() => $this->call('course', 'hide', (int) $course->id, true));
        // And a teacher who may not manage groups does not save them.
        $assistant = $this->getDataGenerator()->create_and_enrol($course, 'teacher');
        $this->setUser($assistant);
        $this->refused(fn() => $this->call('groups', 'save', (int) $course->id, 'Year 5', [[(int) $students[0]->id]]));
    }

    public function test_sharing_a_board_and_the_picture_of_a_question(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(2);
        $this->setUser($teacher);
        $shared = $this->call(
            'board',
            'share',
            (int) $course->id,
            'c' . $course->id,
            'Fractions <b>1</b>',
            'png',
            'data:image/png;base64,' . self::PNG
        );
        $this->assertTrue($shared['ok']);
        $this->assertSame(2, $shared['notified']);
        $picture = $this->call('quizimage', 'save', (int) $course->id, 'data:image/png;base64,' . self::PNG);
        $this->assertTrue($picture['ok']);
        $this->assertNotEmpty($picture['name']);

        $assistant = $this->getDataGenerator()->create_and_enrol($course, 'teacher');
        $this->setUser($assistant);
        $this->refused(fn() => $this->call(
            'board',
            'share',
            (int) $course->id,
            'c' . $course->id,
            'Map',
            'png',
            'data:image/png;base64,' . self::PNG
        ));
        $student = $this->getDataGenerator()->create_and_enrol($course, 'student');
        $this->setUser($student);
        $this->refused(fn() => $this->call('quizimage', 'save', (int) $course->id, 'data:image/png;base64,' . self::PNG));
    }

    public function test_what_the_board_has_been_used_for(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(1);
        $this->setUser($teacher);
        $added = $this->call('tally', 'add', (int) $course->id, [['tool' => 'juegos/rosco', 'opens' => 2, 'seconds' => 60],
            ['tool' => 'nothing', 'opens' => 1, 'seconds' => 1]]);
        $this->assertSame(['added' => 1], $added);
        $this->assertSame('teacher', $DB->get_field('local_oksigeniaclasstools_tally', 'who', ['courseid' => $course->id]));
        // Someone who is not in the course.
        $this->setUser($this->getDataGenerator()->create_user());
        $items = [['tool' => 'pizarra', 'opens' => 1, 'seconds' => 1]];
        $this->refused(fn() => $this->call('tally', 'add', (int) $course->id, $items));
    }

    public function test_glossaries_and_the_question_bank_of_the_course(): void {
        global $CFG;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        $gen = $this->getDataGenerator();
        $glossary = $gen->create_module('glossary', ['course' => $course->id, 'name' => 'Science words']);
        $gen->get_plugin_generator('mod_glossary')->create_content($glossary, ['concept' => 'Cell', 'approved' => 1,
            'definition' => 'The smallest unit of life.']);
        if (file_exists($CFG->dirroot . '/mod/qbank/version.php')) {
            $context = \context_module::instance($gen->create_module('qbank', ['course' => $course->id])->cmid);
        } else {
            $context = \context_course::instance($course->id);
        }
        $qgen = $gen->get_plugin_generator('core_question');
        $category = $qgen->create_question_category(['contextid' => $context->id, 'name' => 'Fractions']);
        $qgen->create_question('truefalse', null, ['category' => $category->id, 'name' => 'B tf',
            'questiontext' => ['text' => 'The sky is blue', 'format' => FORMAT_HTML]]);
        $this->setUser($teacher);
        $list = $this->call('glossary', 'glossaries', (int) $course->id);
        $this->assertSame('Science words', $list['glossaries'][0]['name']);
        $words = $this->call('glossary', 'words', (int) $course->id, $list['glossaries'][0]['id']);
        $this->assertSame('Cell', $words['words'][0]['w']);
        $categories = $this->call('bank', 'categories', (int) $course->id, 'quiz');
        $this->assertSame((int) $category->id, $categories['categories'][0]['id']);
        $this->assertCount(1, $this->json('bank', 'questions', (int) $course->id, (int) $category->id)['questions']);
        $this->assertSame([], $this->json('bank', 'pairs', (int) $course->id, (int) $category->id)['pairs']);

        $this->setUser($students[0]);
        $this->refused(fn() => $this->call('glossary', 'glossaries', (int) $course->id));
        $this->refused(fn() => $this->call('bank', 'categories', (int) $course->id, 'quiz'));
    }

    public function test_the_ai_and_the_presentation_answer_when_they_are_off(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        $this->setUser($teacher);
        // No AI provider in the test site.
        $this->assertFalse($this->call('ai', 'accept', (int) $course->id)['ok']);
        $generated = $this->call('ai', 'generate', (int) $course->id, 'quiz', 'primary', 3, 'Planets', '');
        $this->assertFalse($generated['ok']);
        $this->assertNotEmpty($generated['error']);
        // The presentation tab starts off.
        $this->assertSame(['ok' => false, 'off' => true], $this->json(
            'presentation',
            'resolve',
            (int) $course->id,
            'https://canva.link/abc'
        ));

        $this->setUser($students[0]);
        $this->refused(fn() => $this->call('ai', 'generate', (int) $course->id, 'quiz', 'primary', 3, '', ''));
        $this->refused(fn() => $this->call('presentation', 'resolve', (int) $course->id, 'https://canva.link/abc'));
    }

    public function test_stickers_and_the_teachers_room(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        $this->setUser($teacher);
        $this->assertSame(
            ['cromo' => 'tiradados', 'days' => 1, 'level' => 1, 'up' => true],
            $this->call('logros', 'record', (int) $course->id, 'tiradados')
        );
        $this->assertSame(
            ['cromo' => 'tiradados', 'learned' => true, 'before' => false],
            $this->call('logros', 'learn', (int) $course->id, 'tiradados')
        );
        $this->assertTrue($this->json('sala', 'join', true)['joined']);
        $this->assertTrue($this->json('sala', 'view')['joined']);
        set_config('logros', 0, 'local_oksigeniaclasstools');
        $this->assertSame(['off' => true], $this->call('logros', 'record', (int) $course->id, 'tiradados'));
        $this->assertSame(['off' => true], $this->json('sala', 'view'));
        set_config('logros', 1, 'local_oksigeniaclasstools');

        // Students have no stickers, and do not see the room or come into it.
        $this->setUser($students[0]);
        $this->refused(fn() => $this->call('logros', 'record', (int) $course->id, 'tiradados'));
        $this->refused(fn() => $this->json('sala', 'join', true));
    }

    public function test_the_fixed_remote_from_the_board_and_from_the_phone(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        $this->setUser($teacher);
        $on = $this->call('remote', 'enable', (int) $course->id, true);
        $this->assertTrue($on['on']);
        $this->assertStringContainsString('mando.php?k=', $on['url']);
        $rotated = $this->call('remote', 'rotate', (int) $course->id);
        $this->assertNotSame($on['url'], $rotated['url']);
        $this->assertSame($rotated, $this->call('remote', 'status', (int) $course->id));
        // The board on the clock asks for its orders (a new address starts with no board).
        $poll = $this->json('remote', 'poll', (int) $course->id, 0, 'reloj', [['id' => 'reloj', 'name' => 'Clock <b>']], '');
        $this->assertTrue($poll['on']);
        $key = substr($rotated['url'], strpos($rotated['url'], 'k=') + 2);

        // The phone, with the key and no session.
        $this->setUser(0);
        $boards = $this->json('phone', 'state', $key)['boards'];
        $this->assertSame('reloj', $boards[0]['tool']);
        $this->assertSame((int) $course->id, $this->call('phone', 'courses', $key)['courses'][0]['id']);
        $this->assertSame(['ok' => false, 'why' => 'gone'], $this->call('phone', 'command', $key, 'x_nothing', (int) $course->id));
        $this->assertSame(['off' => true], $this->json('phone', 'state', 'wrongkey'));

        // Live sessions off: no remote either.
        $this->setUser($teacher);
        set_config('live', '0', 'local_oksigeniaclasstools');
        try {
            $this->call('remote', 'status', (int) $course->id);
            $this->fail('The remote answered with live sessions off');
        } catch (\moodle_exception $e) {
            $this->assertSame('livedisabled', $e->errorcode);
        }
        $this->assertSame(['off' => true], $this->json('phone', 'state', $key));
        set_config('live', '1', 'local_oksigeniaclasstools');
        $this->setUser($students[0]);
        $this->refused(fn() => $this->call('remote', 'enable', (int) $course->id, true));
    }

    public function test_a_live_session_from_the_board_and_from_the_devices(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(2);
        $this->setUser($teacher);
        $live = $this->json('live', 'start', (int) $course->id, 'vote', 'anon', 'yesno');
        $this->assertSame('vote', $live['kind']);
        $open = $this->json('live', 'control', (int) $course->id, $live['id'], 'open');
        $this->assertTrue($open['open']);

        // A device with the code only.
        $this->setUser(0);
        $device = str_repeat('c', 32);
        $joined = $this->json('live', 'device', strtolower($live['code']), $device, 'join');
        $this->assertTrue($joined['joined']);
        $this->json('live', 'device', $live['code'], $device, 'answer', 0, 'yes');
        $this->assertSame(['ended' => true], $this->json('live', 'device', 'NOCODE', $device, 'state'));

        $this->setUser($teacher);
        $state = $this->json('live', 'state', (int) $course->id, $live['id']);
        $this->assertSame(1, $state['results']['yes']);

        // With the account, a session by name: a student of the course joins it; a session with the code only is not
        // theirs to join that way.
        $named = $this->json('live', 'start', (int) $course->id, 'vote', 'moodle');
        $this->setUser($students[0]);
        $this->assertTrue($this->json('live', 'member', $named['code'], '', 'join')['joined']);
        $this->assertSame(['ended' => true], $this->json('live', 'member', $live['code'], '', 'join'));
        // Orders of a remote, only from the teacher who opened it.
        try {
            $this->json('live', 'member', $named['code'], 'tm_toggle', 'command');
            $this->fail('A student sent an order');
        } catch (\moodle_exception $e) {
            $this->assertSame('nopermissions', $e->errorcode);
        }
        $this->refused(fn() => $this->json('live', 'start', (int) $course->id, 'vote'));
    }
}
