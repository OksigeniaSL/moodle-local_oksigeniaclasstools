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

/**
 * Shared set-up for the tests: a course with a teacher and students, the screen page ready.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
trait generator_trait {
    /**
     * A course with an editing teacher and some students.
     *
     * @param int $students How many students.
     * @param array $courseoptions Extra course fields.
     * @return array [course, teacher, students]
     */
    protected function make_class(int $students = 3, array $courseoptions = []): array {
        $gen = $this->getDataGenerator();
        $course = $gen->create_course($courseoptions);
        $teacher = $gen->create_and_enrol($course, 'editingteacher');
        $list = [];
        for ($i = 0; $i < $students; $i++) {
            $list[] = $gen->create_and_enrol($course, 'student', [
                'firstname' => 'Student' . $i,
                'lastname' => 'Surname' . $i . ' Second',
            ]);
        }
        return [$course, $teacher, $list];
    }

    /**
     * Sets the global page as the tools page of a course.
     *
     * @param \stdClass $course
     */
    protected function set_page(\stdClass $course): void {
        global $PAGE;
        $PAGE = new \moodle_page();
        $PAGE->set_context(\context_course::instance($course->id));
        $PAGE->set_url('/local/oksigeniaclasstools/index.php', ['id' => $course->id]);
    }
}
