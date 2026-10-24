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
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\writer;
use local_oksigeniaclasstools\external\shared as external_shared;
use local_oksigeniaclasstools\local\shared;
use local_oksigeniaclasstools\privacy\provider;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__ . '/generator_trait.php');

/**
 * Tests for what teachers share with the school: a teacher shares, another one sees it with its author, only its author
 * changes it, its author or a manager removes it, nothing when the site turns it off, and the privacy of the author.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\external\shared
 * @covers     \local_oksigeniaclasstools\local\shared
 */
#[\PHPUnit\Framework\Attributes\CoversClass(external_shared::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(shared::class)]
final class shared_test extends \core_privacy\tests\provider_testcase {
    use generator_trait;

    /**
     * A web service as the AJAX service calls it: its answer, cleaned with its description.
     *
     * @param string $method
     * @param mixed ...$args
     * @return mixed
     */
    private function call(string $method, ...$args) {
        return external_api::clean_returnvalue(external_shared::{$method . '_returns'}(), external_shared::$method(...$args));
    }

    /**
     * Two teachers, each in a course of their own.
     *
     * @return array [course of A, teacher A, course of B, teacher B]
     */
    private function two_teachers(): array {
        [$a, $ta] = $this->make_class(1);
        [$b, $tb] = $this->make_class(1);
        return [$a, $ta, $b, $tb];
    }

    public function test_a_teacher_shares_and_another_one_sees_it_with_its_author(): void {
        $this->resetAfterTest();
        [$a, $ta, $b, $tb] = $this->two_teachers();
        $this->setUser($ta);
        $id = $this->call('save', 'lists', $a->id, 'Reading club', '{"alumnos":["Ana","Bruno"]}')['id'];
        $this->assertGreaterThan(0, $id);
        $this->setUser($tb);
        $items = $this->call('items', 'lists', $b->id)['items'];
        $this->assertCount(1, $items);
        $want = ['id' => $id, 'name' => 'Reading club', 'data' => '{"alumnos":["Ana","Bruno"]}', 'author' => fullname($ta),
            'mine' => false, 'candelete' => false];
        $this->assertSame($want, $items[0]);
        // Other kinds are apart.
        $this->assertSame([], $this->call('items', 'roscos', $b->id)['items']);
        $this->setUser($ta);
        $this->assertTrue($this->call('items', 'lists', $a->id)['items'][0]['mine']);
    }

    public function test_only_its_author_changes_it(): void {
        $this->resetAfterTest();
        [$a, $ta, $b, $tb] = $this->two_teachers();
        $this->setUser($ta);
        $id = $this->call('save', 'locks', $a->id, 'Lab door', '{"code":"321"}')['id'];
        $this->setUser($tb);
        try {
            $this->call('save', 'locks', $b->id, 'Mine now', '{"code":"999"}', $id);
            $this->fail('Another teacher changed it');
        } catch (\moodle_exception $e) {
            $this->assertSame('nopermissions', $e->errorcode);
        }
        $this->setUser($ta);
        $this->assertSame($id, $this->call('save', 'locks', $a->id, 'Lab door 2', '{"code":"4321"}', $id)['id']);
        $this->assertSame('Lab door 2', shared::items('locks', (int) $ta->id, false)[0]['name']);
    }

    public function test_its_author_or_a_manager_removes_it(): void {
        global $DB;
        $this->resetAfterTest();
        [$a, $ta, $b, $tb] = $this->two_teachers();
        $this->setUser($ta);
        $one = $this->call('save', 'roscos', $a->id, 'Animals', '{"items":[]}')['id'];
        $two = $this->call('save', 'roscos', $a->id, 'Plants', '{"items":[]}')['id'];
        $this->setUser($tb);
        try {
            $this->call('delete', $one);
            $this->fail('Another teacher removed it');
        } catch (\moodle_exception $e) {
            $this->assertSame('nopermissions', $e->errorcode);
        }
        $this->setUser($ta);
        $this->assertTrue($this->call('delete', $one)['ok']);
        $manager = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->role_assign($DB->get_field('role', 'id', ['shortname' => 'manager']), $manager->id);
        $this->setUser($manager);
        $this->assertTrue($this->call('delete', $two)['ok']);
        $this->assertSame(0, $DB->count_records(shared::TABLE));
    }

    public function test_nothing_when_the_site_turns_it_off_and_only_for_who_uses_the_board(): void {
        $this->resetAfterTest();
        [$a, $ta] = $this->two_teachers();
        $this->setUser($ta);
        $this->call('save', 'lists', $a->id, 'Reading club', '{"alumnos":["Ana"]}');
        set_config('shared', 0, 'local_oksigeniaclasstools');
        $this->assertSame([], $this->call('items', 'lists', $a->id)['items']);
        try {
            $this->call('save', 'lists', $a->id, 'Another', '{"alumnos":["Bruno"]}');
            $this->fail('Shared while off');
        } catch (\moodle_exception $e) {
            $this->assertSame('sharedoff', $e->errorcode);
        }
        set_config('shared', 1, 'local_oksigeniaclasstools');
        // A student of the course cannot use the board as a teacher: no sharing, no list.
        $student = $this->getDataGenerator()->create_and_enrol($a, 'student');
        $this->setUser($student);
        $this->expectException(\required_capability_exception::class);
        $this->call('items', 'lists', $a->id);
    }

    public function test_bad_kinds_names_and_documents_are_refused(): void {
        $this->resetAfterTest();
        [$a, $ta] = $this->two_teachers();
        $this->setUser($ta);
        foreach ([['songs', 'X', '{}'], ['lists', '   ', '{}'], ['lists', 'X', 'not json']] as [$kind, $name, $data]) {
            try {
                $this->call('save', $kind, $a->id, $name, $data);
                $this->fail("Accepted $kind / $name / $data");
            } catch (\moodle_exception $e) {
                $this->assertSame('invalidparameter', $e->errorcode);
            }
        }
    }

    public function test_privacy_of_the_author(): void {
        global $DB;
        $this->resetAfterTest();
        [$a, $ta] = $this->two_teachers();
        shared::save('lists', 'Reading club', '{"alumnos":["Ana"]}', (int) $ta->id);
        $context = \context_user::instance($ta->id);
        $this->assertContainsEquals($context->id, provider::get_contexts_for_userid($ta->id)->get_contextids());
        provider::export_user_data(new approved_contextlist($ta, 'local_oksigeniaclasstools', [$context->id]));
        $data = writer::with_context($context)->get_data([get_string('privacy:shared', 'local_oksigeniaclasstools')]);
        $this->assertSame('Reading club', $data->items[0]->name);
        provider::delete_data_for_user(new approved_contextlist($ta, 'local_oksigeniaclasstools', [$context->id]));
        $this->assertSame(0, $DB->count_records(shared::TABLE));
        // And with the user deleted.
        shared::save('locks', 'Lab door', '{"code":"1"}', (int) $ta->id);
        delete_user($ta);
        $this->assertSame(0, $DB->count_records(shared::TABLE));
    }
}
