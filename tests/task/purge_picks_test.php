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

namespace local_oksigeniaclasstools\task;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/local/oksigeniaclasstools/tests/generator_trait.php');

/**
 * Tests for the task that deletes old picks.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\task\purge_picks
 */
#[\PHPUnit\Framework\Attributes\CoversClass(purge_picks::class)]
final class purge_picks_test extends \advanced_testcase {
    use \local_oksigeniaclasstools\generator_trait;

    public function test_picks_older_than_the_counted_days_are_deleted(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        set_config('days', 30, 'local_oksigeniaclasstools');
        $old = \local_oksigeniaclasstools\local\picks::record($course->id, $students[0]->id, $teacher->id);
        $DB->set_field('local_oksigeniaclasstools_picks', 'timecreated', time() - 31 * DAYSECS, ['id' => $old]);
        $recent = \local_oksigeniaclasstools\local\picks::record($course->id, $students[0]->id, $teacher->id);
        (new purge_picks())->execute();
        $this->assertFalse($DB->record_exists('local_oksigeniaclasstools_picks', ['id' => $old]));
        $this->assertTrue($DB->record_exists('local_oksigeniaclasstools_picks', ['id' => $recent]));
    }
}
