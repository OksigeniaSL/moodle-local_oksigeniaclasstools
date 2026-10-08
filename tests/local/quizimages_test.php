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
 * Tests for the pictures of the quiz questions.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\quizimages
 */
#[\PHPUnit\Framework\Attributes\CoversClass(quizimages::class)]
final class quizimages_test extends \advanced_testcase {
    /**
     * A small PNG of one colour.
     *
     * @param int $red
     * @return string
     */
    private function png(int $red): string {
        $im = imagecreatetruecolor(8, 6);
        imagefill($im, 0, 0, imagecolorallocate($im, $red, 80, 120));
        ob_start();
        imagepng($im);
        return ob_get_clean();
    }

    /**
     * The pictures a teacher has in a course.
     *
     * @param \context_course $context
     * @param int $userid
     * @return string[] Their names.
     */
    private function names(\context_course $context, int $userid): array {
        $fs = get_file_storage();
        $files = $fs->get_area_files($context->id, 'local_oksigeniaclasstools', quizimages::AREA, $userid, 'filename', false);
        return array_values(array_map(fn($f) => $f->get_filename(), $files));
    }

    public function test_a_picture_is_kept_once_under_its_name(): void {
        $this->resetAfterTest();
        $context = \context_course::instance($this->getDataGenerator()->create_course()->id);
        $name = quizimages::save($context, 7, $this->png(200));
        $this->assertMatchesRegularExpression(quizimages::NAME, $name);
        $this->assertStringEndsWith('.png', $name);
        $this->assertSame($name, quizimages::save($context, 7, $this->png(200)));
        $this->assertSame([$name], $this->names($context, 7));
        $this->assertSame([], $this->names($context, 8));
        $base = quizimages::base($context, 7);
        $this->assertStringContainsString("/{$context->id}/local_oksigeniaclasstools/quizimg/7/", $base);
    }

    public function test_what_is_not_a_picture_is_refused(): void {
        $this->resetAfterTest();
        $context = \context_course::instance($this->getDataGenerator()->create_course()->id);
        $this->expectException(\moodle_exception::class);
        quizimages::save($context, 7, '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    }

    public function test_pictures_no_set_uses_go_away_a_day_later(): void {
        global $DB;
        $this->resetAfterTest();
        $course = $this->getDataGenerator()->create_course();
        $context = \context_course::instance($course->id);
        $used = quizimages::save($context, 7, $this->png(10));
        $old = quizimages::save($context, 7, $this->png(20));
        $new = quizimages::save($context, 7, $this->png(30));
        $where = 'filearea = ? AND filename IN (?, ?)';
        $DB->set_field_select('files', 'timemodified', time() - 2 * DAYSECS, $where, ['quizimg', $used, $old]);
        // Saving the sets tidies: the one in use and the recent one stay.
        $sets = ['sets' => [['id' => 'a', 'questions' => [['q' => 'Q', 'img' => $used]]]]];
        kept::save($course->id, 7, 'quizzes', json_encode($sets));
        $left = $this->names($context, 7);
        sort($left);
        $expected = [$used, $new];
        sort($expected);
        $this->assertSame($expected, $left);
    }

    public function test_the_picture_of_a_bank_question_comes_with_it(): void {
        global $CFG;
        $this->resetAfterTest();
        $this->setAdminUser();
        $course = $this->getDataGenerator()->create_course();
        if (file_exists($CFG->dirroot . '/mod/qbank/version.php')) {
            $qbank = $this->getDataGenerator()->create_module('qbank', ['course' => $course->id]);
            $qcontext = \context_module::instance($qbank->cmid);
        } else {
            $qcontext = \context_course::instance($course->id);
        }
        $qgen = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $qgen->create_question_category(['contextid' => $qcontext->id]);
        $question = $qgen->create_question('truefalse', null, ['category' => $category->id,
            'questiontext' => ['text' => 'Is this red? <img src="@@PLUGINFILE@@/red.png">', 'format' => FORMAT_HTML]]);
        get_file_storage()->create_file_from_string(['contextid' => $qcontext->id, 'component' => 'question',
            'filearea' => 'questiontext', 'itemid' => $question->id, 'filepath' => '/', 'filename' => 'red.png'], $this->png(250));
        $userid = (int) get_admin()->id;
        $got = bank::questions($course, (int) $category->id, $userid);
        $this->assertCount(1, $got['questions']);
        $img = $got['questions'][0]['img'];
        $this->assertMatchesRegularExpression(quizimages::NAME, $img);
        $this->assertSame([$img], $this->names(\context_course::instance($course->id), $userid));
        // Without someone to keep it for, no picture.
        $this->assertArrayNotHasKey('img', bank::questions($course, (int) $category->id)['questions'][0]);
    }
}
