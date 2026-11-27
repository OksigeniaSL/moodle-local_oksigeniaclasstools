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

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/local/oksigeniaclasstools/tests/generator_trait.php');

/**
 * Tests for sharing a drawing board with a class: saved in the course and notified to its students.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\boards
 */
#[\PHPUnit\Framework\Attributes\CoversClass(boards::class)]
final class boards_test extends \advanced_testcase {
    use \local_oksigeniaclasstools\generator_trait;

    /** A 1×1 PNG. */
    const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    /**
     * The files in the folder of a class.
     *
     * @param \stdClass $course
     * @param string $listid
     * @return \stored_file[]
     */
    private function files(\stdClass $course, string $listid): array {
        foreach (get_fast_modinfo($course->id)->get_instances_of('folder') as $cm) {
            if ($cm->idnumber === boards::IDNUMBER_PREFIX . $listid) {
                $context = \context_module::instance($cm->id);
                return get_file_storage()->get_area_files($context->id, 'mod_folder', 'content', 0, 'filename', false);
            }
        }
        return [];
    }

    public function test_the_whole_course_gets_it_and_a_notification(): void {
        global $DB;
        $this->resetAfterTest();
        [$course, $teacher, $students] = $this->make_class(2);
        $this->setUser($teacher);
        $sink = $this->redirectMessages();
        $result = boards::share($course, 'c' . $course->id, 'Fractions', base64_decode(self::PNG));
        $this->assertSame(2, $result->notified);
        $this->assertCount(2, $sink->get_messages());
        $this->assertSame('boardshared', $sink->get_messages()[0]->eventtype);
        $section = get_string('boardsection', 'local_oksigeniaclasstools');
        $this->assertTrue($DB->record_exists('course_sections', ['course' => $course->id, 'name' => $section]));
        $files = $this->files($course, 'c' . $course->id);
        $this->assertSame(['Fractions.png'], array_values(array_map(fn($f) => $f->get_filename(), $files)));
        $this->assertSame('New board in ' . $course->fullname . ': Fractions', $sink->get_messages()[0]->subject);
        // Without a name of its own, the date names the board and the subject says the course alone.
        $sink->clear();
        boards::share($course, 'c' . $course->id, '', base64_decode(self::PNG));
        $this->assertSame('New board in ' . $course->fullname, $sink->get_messages()[0]->subject);
    }

    public function test_a_group_gets_its_own_folder_only_for_its_members(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, $teacher, $students] = $this->make_class(2);
        $group = $gen->create_group(['courseid' => $course->id]);
        $gen->create_group_member(['groupid' => $group->id, 'userid' => $students[0]->id]);
        $this->setUser($teacher);
        $sink = $this->redirectMessages();
        $result = boards::share($course, 'g' . $group->id, 'Map', base64_decode(self::PNG));
        $this->assertSame(1, $result->notified);
        $this->assertEquals($students[0]->id, $sink->get_messages()[0]->useridto);
        foreach (get_fast_modinfo($course->id)->get_instances_of('folder') as $cm) {
            $this->assertStringContainsString('"id":' . $group->id, (string) $cm->availability);
        }
    }

    public function test_another_board_goes_to_the_same_folder_and_pdf_works(): void {
        $this->resetAfterTest();
        [$course, $teacher] = $this->make_class(1);
        $this->setUser($teacher);
        $this->redirectMessages();
        boards::share($course, 'c' . $course->id, 'Board', base64_decode(self::PNG));
        boards::share($course, 'c' . $course->id, 'Board', base64_decode(self::PNG), 'pdf');
        boards::share($course, 'c' . $course->id, 'Board', base64_decode(self::PNG));
        $this->assertCount(1, get_fast_modinfo($course->id)->get_instances_of('folder'));
        $files = $this->files($course, 'c' . $course->id);
        $names = array_values(array_map(fn($f) => $f->get_filename(), $files));
        sort($names);
        $this->assertSame(['Board (2).png', 'Board.pdf', 'Board.png'], $names);
        foreach ($files as $file) {
            if ($file->get_filename() === 'Board.pdf') {
                $this->assertStringStartsWith('%PDF', $file->get_content());
            }
        }
    }

    public function test_the_board_goes_into_a_mail_on_white_narrow_and_light(): void {
        // A wide board with a transparent ground and noise, so that as PNG it weighs too much for a mail.
        $board = imagecreatetruecolor(2400, 1350);
        imagesavealpha($board, true);
        imagealphablending($board, false);
        imagefill($board, 0, 0, imagecolorallocatealpha($board, 0, 0, 0, 127));
        mt_srand(7);
        for ($i = 0; $i < 60000; $i++) {
            imagesetpixel($board, mt_rand(0, 2399), mt_rand(0, 1349), mt_rand(0, 0xffffff));
        }
        ob_start();
        imagepng($board);
        $png = (string) ob_get_clean();
        $this->assertGreaterThan(boards::MAIL_BYTES, strlen($png));

        $picture = boards::mail_picture($png);
        $this->assertNotNull($picture);
        $this->assertLessThanOrEqual(boards::MAIL_BYTES, strlen($picture));
        [$width, $height] = getimagesizefromstring($picture);
        $this->assertSame([boards::MAIL_WIDTH, 585], [$width, $height]);
        // Too heavy as PNG, so JPEG.
        $this->assertSame("\xFF\xD8", substr($picture, 0, 2));

        // A light one stays PNG, and its transparent ground turns white.
        $small = boards::mail_picture(base64_decode(self::PNG));
        $this->assertStringStartsWith("\x89PNG", $small);
        $pixel = imagecolorsforindex($image = imagecreatefromstring($small), imagecolorat($image, 0, 0));
        $this->assertSame(0, $pixel['alpha']);
        $this->assertNull(boards::mail_picture('not an image'));
    }

    public function test_the_mail_says_the_notice_with_the_board_and_one_button(): void {
        $this->resetAfterTest();
        $a = (object) ['teacher' => 'Ana Ruiz', 'course' => 'Maths 5B', 'name' => 'Fractions', 'titled' => true,
            'folder' => 'Boards · 5B', 'section' => 'Class boards'];
        $url = new \moodle_url('/mod/folder/view.php', ['id' => 7]);
        $picture = boards::mail_picture(base64_decode(self::PNG));
        $pieces = boards::letter($a, $url, $picture, 'en');
        // The name of the board heads it, and the subject says the course and the board.
        $this->assertSame('New board in Maths 5B: Fractions', $pieces['subject']);
        $this->assertSame('New board: Fractions', $pieces['heading']);
        $this->assertSame(
            ['paragraph', 'picture', 'paragraph', 'action', 'link'],
            array_map(fn($b) => array_key_first($b), $pieces['blocks'])
        );
        $this->assertSame('Ana Ruiz has shared it with your class in Maths 5B.', $pieces['blocks'][0]['paragraph']);
        $this->assertSame('The board «Fractions»', $pieces['blocks'][1]['picture']['picturealt']);
        $this->assertTrue($pieces['blocks'][1]['picture']['pictureframe']);
        $this->assertSame(
            'It is kept in the folder «Boards · 5B», in the section «Class boards», with all the boards of your class.',
            $pieces['blocks'][2]['paragraph']
        );
        $this->assertSame(['actionurl' => $url->out(false), 'actiontext' => 'See the board'], $pieces['blocks'][3]['action']);
        // The way out: it goes to the whole class at every board.
        $preferences = new \moodle_url('/message/notificationpreferences.php');
        $this->assertSame($preferences->out(false), $pieces['blocks'][4]['link']['linkurl']);
        $this->assertSame('Choose which notices reach you', $pieces['blocks'][4]['link']['linktext']);
        $this->assertStringContainsString('Maths 5B', $pieces['reason']);
        // A board without a name of its own (the date names it), without the picture (it could not be made light enough)
        // nor where it is kept: the heading of the course, the notice, the button and the way out.
        $bare = (object) ['teacher' => 'Ana Ruiz', 'course' => 'Maths 5B', 'name' => 'Board of 27/11/26, 10:15'];
        $plain = boards::letter($bare, $url, null, 'en');
        $this->assertSame(['New board in Maths 5B', 'New board in Maths 5B'], [$plain['subject'], $plain['heading']]);
        $this->assertSame(['paragraph', 'action', 'link'], array_map(fn($b) => array_key_first($b), $plain['blocks']));
        $this->assertSame(
            'Ana Ruiz has shared a board with your class in Maths 5B: Board of 27/11/26, 10:15.',
            $plain['blocks'][0]['paragraph']
        );

        $api = '\local_oksigeniamarandu\api';
        if (!method_exists($api, 'mail_html')) {
            return;
        }
        // With Marandu, the common mail: the board inside it and the button, in the HTML and in the text.
        $mail = $api::mail_html($pieces, 'en');
        $this->assertSame('New board in Maths 5B: Fractions', $mail['subject']);
        $this->assertStringContainsString('See the board', $mail['html']);
        $this->assertStringContainsString('cid:' . sha1($picture) . '@marandu', $mail['html']);
        $this->assertStringContainsString($url->out(false), $mail['text']);
    }

    public function test_with_marandu_the_notice_still_reaches_every_student(): void {
        global $DB;
        $this->resetAfterTest();
        if (!method_exists('\local_oksigeniamarandu\api', 'mail_notice')) {
            $this->markTestSkipped('Without Oksigenia Marandu 0.70 or later the notice goes as always (covered above).');
        }
        [$course, $teacher] = $this->make_class(3);
        $this->setUser($teacher);
        $sink = $this->redirectMessages();
        $result = boards::share($course, 'c' . $course->id, 'Fractions', base64_decode(self::PNG));
        $this->assertSame(3, $result->notified);
        $this->assertCount(3, $sink->get_messages());
        $this->assertSame('New board in ' . $course->fullname . ': Fractions', $sink->get_messages()[0]->subject);

        // The mail Marandu keeps for the notice says where the board is, with the names it has in the course.
        $html = '';
        $files = $DB->get_records_select('files', 'component = ? AND ' . $DB->sql_like('filename', '?'), [
            'local_oksigeniamarandu',
            '%.html',
        ]);
        foreach ($files as $record) {
            $html .= get_file_storage()->get_file_instance($record)->get_content();
        }
        $this->assertStringContainsString('New board: Fractions', $html);
        $this->assertStringContainsString('See the board', $html);
        $this->assertStringContainsString('«' . s($result->folder) . '»', $html);
        $this->assertStringContainsString('«' . get_string('boardsection', 'local_oksigeniaclasstools') . '»', $html);
    }

    public function test_a_bad_image_or_another_course_s_group_is_refused(): void {
        $this->resetAfterTest();
        $gen = $this->getDataGenerator();
        [$course, $teacher] = $this->make_class(1);
        $other = $gen->create_group(['courseid' => $gen->create_course()->id]);
        $this->setUser($teacher);
        try {
            boards::share($course, 'c' . $course->id, 'Bad', 'not an image');
            $this->fail('A file that is not a PNG was accepted');
        } catch (\moodle_exception $e) {
            $this->assertSame('invalidparameter', $e->errorcode);
        }
        $this->expectException(\moodle_exception::class);
        boards::share($course, 'g' . $other->id, 'Other', base64_decode(self::PNG));
    }
}
