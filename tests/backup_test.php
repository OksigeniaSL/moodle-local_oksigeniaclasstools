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

use local_oksigeniaclasstools\local\tally;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/backup/util/includes/backup_includes.php');
require_once($CFG->dirroot . '/backup/util/includes/restore_includes.php');
require_once($CFG->dirroot . '/backup/moodle2/backup_plan_builder.class.php');
require_once($CFG->dirroot . '/backup/moodle2/restore_plan_builder.class.php');
require_once($CFG->dirroot . '/local/oksigeniaclasstools/backup/moodle2/backup_local_oksigeniaclasstools_plugin.class.php');
require_once($CFG->dirroot . '/local/oksigeniaclasstools/backup/moodle2/restore_local_oksigeniaclasstools_plugin.class.php');

/**
 * Tests for the course backup: what the board keeps of a course goes with it to the restored course, with users or
 * only the use of the boards without them, and adds up when restored over a course that already has it.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \backup_local_oksigeniaclasstools_plugin
 * @covers     \restore_local_oksigeniaclasstools_plugin
 */
#[\PHPUnit\Framework\Attributes\CoversClass(\backup_local_oksigeniaclasstools_plugin::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(\restore_local_oksigeniaclasstools_plugin::class)]
final class backup_test extends \advanced_testcase {
    /**
     * A course with a teacher, a student, a group and something of everything the board keeps.
     *
     * @return array course, teacher, student, group
     */
    private function make_course(): array {
        global $DB;
        $gen = $this->getDataGenerator();
        $course = $gen->create_course();
        $teacher = $gen->create_and_enrol($course, 'editingteacher');
        $student = $gen->create_and_enrol($course, 'student');
        $group = $gen->create_group(['courseid' => $course->id]);
        $gen->create_group_member(['groupid' => $group->id, 'userid' => $student->id]);
        $day = (int) userdate(time(), '%Y%m%d', 99, false);
        tally::add_day($course->id, $day, 'student', 'pizarra', 3, 1800);
        tally::add_day($course->id, $day, 'teacher', 'juegos/rosco', 1, 300);
        $DB->insert_record('local_oksigeniaclasstools_state', (object) ['courseid' => $course->id, 'userid' => $teacher->id,
            'tool' => 'scoreboard', 'data' => '{"teams":[{"name":"Red","points":4}]}', 'timemodified' => 1000]);
        $DB->insert_record('local_oksigeniaclasstools_state', (object) ['courseid' => $course->id, 'userid' => $teacher->id,
            'tool' => 'tarjetas', 'data' => json_encode(['list' => 'g' . $group->id, 'count' => 1]), 'timemodified' => 1000]);
        $DB->insert_record('local_oksigeniaclasstools_picks', (object) ['courseid' => $course->id, 'userid' => $student->id,
            'teacherid' => $teacher->id, 'timecreated' => time()]);
        $DB->insert_record('local_oksigeniaclasstools_uses', (object) ['userid' => $teacher->id, 'courseid' => $course->id,
            'cromo' => 'tiradados', 'day' => $day, 'week' => (int) date('oW'), 'timecreated' => time()]);
        get_file_storage()->create_file_from_string([
            'contextid' => \context_course::instance($course->id)->id, 'component' => 'local_oksigeniaclasstools',
            'filearea' => 'quizimg', 'itemid' => $teacher->id, 'filepath' => '/', 'filename' => 'frog.png',
        ], 'a picture');
        return [$course, $teacher, $student, $group];
    }

    /**
     * Backs a course up and restores it into a new course (or over another one).
     *
     * @param int $courseid
     * @param bool $users
     * @param int|null $into A course to restore over, deleting nothing.
     * @return int The restored course.
     */
    private function backup_and_restore(int $courseid, bool $users, ?int $into = null): int {
        global $CFG, $USER;
        $CFG->backup_file_logger_level = \backup::LOG_NONE;
        $bc = new \backup_controller(
            \backup::TYPE_1COURSE,
            $courseid,
            \backup::FORMAT_MOODLE,
            \backup::INTERACTIVE_NO,
            \backup::MODE_GENERAL,
            $USER->id
        );
        $bc->get_plan()->get_setting('users')->set_value($users);
        $bc->execute_plan();
        $file = $bc->get_results()['backup_destination'];
        $folder = 'classtools-' . random_string(8);
        $file->extract_to_pathname(get_file_packer('application/vnd.moodle.backup'), make_backup_temp_directory($folder));
        $bc->destroy();
        $target = $into ? \backup::TARGET_EXISTING_ADDING : \backup::TARGET_NEW_COURSE;
        $newid = $into ?: \restore_dbops::create_new_course('Restored', 'R' . random_string(4), 1);
        $rc = new \restore_controller($folder, $newid, \backup::INTERACTIVE_NO, \backup::MODE_GENERAL, $USER->id, $target);
        if ($into) {
            // Into a course that exists, the data of the course (and of its plugins) comes only overwriting its settings.
            $rc->get_plan()->get_setting('overwrite_conf')->set_value(true);
        }
        $this->assertTrue($rc->execute_precheck());
        $rc->execute_plan();
        $rc->destroy();
        return $newid;
    }

    public function test_with_users_everything_the_board_keeps_goes_to_the_restored_course(): void {
        global $DB;
        $this->resetAfterTest();
        $this->setAdminUser();
        [$course, $teacher, $student] = $this->make_course();
        $new = $this->backup_and_restore($course->id, true);

        $this->assertSame([1800, 300], array_map(
            fn($r) => (int) $r->seconds,
            array_values($DB->get_records('local_oksigeniaclasstools_tally', ['courseid' => $new], 'seconds DESC'))
        ));
        $kept = $DB->get_records_menu(
            'local_oksigeniaclasstools_state',
            ['courseid' => $new, 'userid' => $teacher->id],
            'tool',
            'tool, data'
        );
        $this->assertSame('{"teams":[{"name":"Red","points":4}]}', $kept['scoreboard']);
        // The printed cards point at the restored group, not the old one.
        $group = $DB->get_field('groups', 'id', ['courseid' => $new]);
        $this->assertSame('g' . $group, json_decode($kept['tarjetas'], true)['list']);
        $this->assertTrue($DB->record_exists(
            'local_oksigeniaclasstools_picks',
            ['courseid' => $new, 'userid' => $student->id, 'teacherid' => $teacher->id]
        ));
        $this->assertTrue($DB->record_exists(
            'local_oksigeniaclasstools_uses',
            ['courseid' => $new, 'userid' => $teacher->id, 'cromo' => 'tiradados']
        ));
        $files = get_file_storage()->get_area_files(
            \context_course::instance($new)->id,
            'local_oksigeniaclasstools',
            'quizimg',
            $teacher->id,
            'id',
            false
        );
        $this->assertSame(['frog.png'], array_values(array_map(fn($f) => $f->get_filename(), $files)));
    }

    public function test_without_users_only_the_use_of_the_boards_goes(): void {
        global $DB;
        $this->resetAfterTest();
        $this->setAdminUser();
        [$course] = $this->make_course();
        $new = $this->backup_and_restore($course->id, false);
        $this->assertSame(2, $DB->count_records('local_oksigeniaclasstools_tally', ['courseid' => $new]));
        foreach (['state', 'picks', 'uses'] as $table) {
            $this->assertSame(0, $DB->count_records('local_oksigeniaclasstools_' . $table, ['courseid' => $new]));
        }
        $this->assertSame([], get_file_storage()->get_area_files(
            \context_course::instance($new)->id,
            'local_oksigeniaclasstools',
            'quizimg',
            false,
            'id',
            false
        ));
    }

    public function test_restored_over_a_course_it_adds_up_and_keeps_the_newer(): void {
        global $DB;
        $this->resetAfterTest();
        $this->setAdminUser();
        [$course, $teacher] = $this->make_course();
        $other = $this->getDataGenerator()->create_course();
        $this->getDataGenerator()->enrol_user($teacher->id, $other->id, 'editingteacher');
        $day = (int) userdate(time(), '%Y%m%d', 99, false);
        tally::add_day($other->id, $day, 'student', 'pizarra', 1, 60);
        $DB->insert_record('local_oksigeniaclasstools_state', (object) ['courseid' => $other->id, 'userid' => $teacher->id,
            'tool' => 'scoreboard', 'data' => '{"newer":true}', 'timemodified' => 2000]);
        $this->backup_and_restore($course->id, true, $other->id);
        $board = $DB->get_record('local_oksigeniaclasstools_tally', ['courseid' => $other->id, 'who' => 'student',
            'tool' => 'pizarra']);
        $this->assertSame([4, 1860], [(int) $board->opens, (int) $board->seconds]);
        $this->assertSame('{"newer":true}', $DB->get_field(
            'local_oksigeniaclasstools_state',
            'data',
            ['courseid' => $other->id, 'userid' => $teacher->id, 'tool' => 'scoreboard']
        ));
    }
}
