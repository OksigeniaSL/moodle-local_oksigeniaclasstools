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

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
require_once(__DIR__ . '/generator_trait.php');

/**
 * Tests for the course link in Moodle 4.3 (no navigation hooks), and that it steps aside when the hooks exist.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     ::local_oksigeniaclasstools_extend_navigation_course
 */
#[\PHPUnit\Framework\Attributes\CoversFunction('local_oksigeniaclasstools_extend_navigation_course')]
final class legacy_navigation_test extends \advanced_testcase {
    use generator_trait;

    /**
     * Calls the legacy callback on an empty node and says whether it added the link.
     *
     * @param \stdClass $course
     * @return bool
     */
    private function adds_link(\stdClass $course): bool {
        $node = \navigation_node::create('Course');
        local_oksigeniaclasstools_extend_navigation_course($node, $course, \context_course::instance($course->id));
        return (bool) $node->get('local_oksigeniaclasstools');
    }

    public function test_link_only_before_the_hooks_and_only_for_who_can_open_the_board(): void {
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(1);
        $hooks = class_exists(\core\hook\navigation\secondary_extend::class);
        $this->setUser($teacher);
        $this->assertSame(!$hooks, $this->adds_link($course));
        $this->setUser($students[0]);
        $this->assertFalse($this->adds_link($course));
        set_config('students', 1, 'local_oksigeniaclasstools');
        $this->assertSame(!$hooks, $this->adds_link($course));
    }
}
