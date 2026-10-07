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

require_once(__DIR__ . '/generator_trait.php');

/**
 * Tests for the links to the class tools in the course bar and the main menu.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\hook_callbacks
 */
#[\PHPUnit\Framework\Attributes\CoversClass(hook_callbacks::class)]
final class hook_callbacks_test extends \advanced_testcase {
    use generator_trait;

    /**
     * Sets the global page as the course page and returns its navigation.
     *
     * @param \stdClass $course
     * @return array [secondary, primary]
     */
    private function navigation(\stdClass $course): array {
        global $PAGE;
        $PAGE = new \moodle_page();
        $PAGE->set_course($course);
        $PAGE->set_url('/course/view.php', ['id' => $course->id]);
        $PAGE->set_pagelayout('course');
        $secondary = new \core\navigation\views\secondary($PAGE);
        $secondary->initialise();
        $primary = new \core\navigation\views\primary($PAGE);
        $primary->initialise();
        return [$secondary, $primary];
    }

    public function test_teachers_get_the_links(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(1);
        $this->setUser($teacher);
        [$secondary, $primary] = $this->navigation($course);
        $this->assertNotEmpty($secondary->find('local_oksigeniaclasstools', null));
        $this->assertNotEmpty($primary->find('local_oksigeniaclasstools', null));
    }

    public function test_students_do_not_get_the_links(): void {
        $this->resetAfterTest();
        [$course, , $students] = $this->make_class(1);
        $this->setUser($students[0]);
        [$secondary, $primary] = $this->navigation($course);
        $this->assertEmpty($secondary->find('local_oksigeniaclasstools', null));
        $this->assertEmpty($primary->find('local_oksigeniaclasstools', null));
    }

    public function test_the_main_menu_link_can_be_turned_off(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(1);
        set_config('menu', 0, 'local_oksigeniaclasstools');
        $this->setUser($teacher);
        [$secondary, $primary] = $this->navigation($course);
        $this->assertNotEmpty($secondary->find('local_oksigeniaclasstools', null));
        $this->assertEmpty($primary->find('local_oksigeniaclasstools', null));
    }
}
