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
 * Drawing boards shared with a class: the image is saved in the course (section «Class boards», one folder per class,
 * restricted to its group when the class is a Moodle group) and its students get a Moodle notification.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class boards {
    /** Prefix of the idnumber of the folders, followed by the list id (how a class's folder is found again). */
    const IDNUMBER_PREFIX = 'oksigeniaclasstools-board-';

    /** Largest image accepted, in bytes. */
    const MAX_BYTES = 8 * 1024 * 1024;

    /** Widest the board goes inside a mail: twice the 520 px it is shown at there. */
    const MAIL_WIDTH = 1040;

    /** The most the board may weigh inside a mail, in bytes. */
    const MAIL_BYTES = 200 * 1024;

    /**
     * Saves a board in the course and notifies the students of the class.
     *
     * @param \stdClass $course
     * @param string $listid The class, as the board knows it: «c» + course id, «g» + group id or «h» + cohort id.
     * @param string $name Name of the board (also its file name).
     * @param string $png The image (PNG).
     * @param string $format png or pdf.
     * @return \stdClass folder (name), url (of the folder), filename and notified (how many students).
     * @throws \moodle_exception If the image or the class are not valid.
     */
    public static function share(\stdClass $course, string $listid, string $name, string $png, string $format = 'png'): \stdClass {
        global $CFG, $DB, $USER;
        require_once($CFG->dirroot . '/course/lib.php');
        if (strlen($png) > self::MAX_BYTES || strncmp($png, "\x89PNG\r\n\x1a\n", 8) !== 0) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $class = self::resolve($course, $listid);
        $name = trim(\core_text::substr(clean_param($name, PARAM_TEXT), 0, 100));
        $titled = $name !== '';
        if (!$titled) {
            $when = userdate(time(), get_string('strftimedatetimeshort', 'core_langconfig'));
            $name = get_string('boardname', 'local_oksigeniaclasstools', $when);
        }
        $cm = self::folder($course, $listid, $class);
        $context = \context_module::instance($cm->id);

        // The file: the image itself, or a page of PDF with it.
        $content = $format === 'pdf' ? self::pdf($png) : $png;
        $fs = get_file_storage();
        $base = clean_filename($name);
        $filename = $base . '.' . $format;
        for ($i = 2; $fs->file_exists($context->id, 'mod_folder', 'content', 0, '/', $filename); $i++) {
            $filename = "$base ($i).$format";
        }
        $fs->create_file_from_string(['contextid' => $context->id, 'component' => 'mod_folder', 'filearea' => 'content',
            'itemid' => 0, 'filepath' => '/', 'filename' => $filename, 'userid' => $USER->id], $content);
        $revision = $DB->get_field('folder', 'revision', ['id' => $cm->instance]);
        $DB->set_field('folder', 'revision', $revision + 1, ['id' => $cm->instance]);
        rebuild_course_cache($course->id, true);

        $url = new \moodle_url('/mod/folder/view.php', ['id' => $cm->id]);
        $section = (string) $cm->get_section_info()->name ?: get_section_name($course, $cm->sectionnum);
        $where = ['titled' => $titled, 'folder' => format_string($cm->name, true, ['context' => $context, 'escape' => false]),
            'section' => format_string($section, true, ['context' => $context, 'escape' => false])];
        $notified = self::notify($course, $class['userids'], $name, $url, $png, $where);
        return (object) ['folder' => $cm->name, 'url' => $url->out(false), 'filename' => $filename, 'notified' => $notified];
    }

    /**
     * The class a list id stands for: its name, its group (if it is one) and its students, as the teacher may see them.
     *
     * @param \stdClass $course
     * @param string $listid
     * @return array name, groupid (or null) and userids.
     * @throws \moodle_exception If the list is not a class of this course.
     */
    private static function resolve(\stdClass $course, string $listid): array {
        global $CFG, $DB;
        require_once($CFG->dirroot . '/local/oksigeniaclasstools/lib.php');
        $context = \context_course::instance($course->id);
        $students = array_map('intval', array_keys(get_enrolled_users(
            $context,
            'moodle/course:isincompletionreports',
            0,
            'u.id',
            null,
            0,
            0,
            true
        )));
        $kind = substr($listid, 0, 1);
        $id = (int) substr($listid, 1);
        $groupid = null;
        if ($kind === 'c' && $id == $course->id) {
            $name = get_string('wholecourse', 'local_oksigeniaclasstools');
            $members = $students;
        } else if ($kind === 'g' && ($group = groups_get_group($id)) && $group->courseid == $course->id) {
            $name = format_string($group->name, true, ['context' => $context, 'escape' => false]);
            $members = array_map('intval', array_keys(groups_get_members($group->id, 'u.id')));
            $groupid = (int) $group->id;
        } else if (
            $kind === 'h' && ($cohort = $DB->get_record('cohort', ['id' => $id]))
                && $DB->record_exists('enrol', ['courseid' => $course->id, 'enrol' => 'cohort', 'customint1' => $id])
        ) {
            $cohortcontext = \context::instance_by_id($cohort->contextid);
            $name = format_string($cohort->name, true, ['context' => $cohortcontext, 'escape' => false]);
            $members = array_map('intval', $DB->get_fieldset_select('cohort_members', 'userid', 'cohortid = ?', [$id]));
        } else {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $userids = array_values(array_intersect($students, $members));
        $visible = local_oksigeniaclasstools_visible_userids($course, $context);
        if ($visible !== null) {
            $userids = array_values(array_intersect($userids, $visible));
        }
        return ['name' => $name, 'groupid' => $groupid, 'userids' => $userids];
    }

    /**
     * The folder of a class in the section «Class boards», created the first time (restricted to the group, if any).
     *
     * @param \stdClass $course
     * @param string $listid
     * @param array $class
     * @return \cm_info
     */
    private static function folder(\stdClass $course, string $listid, array $class): \cm_info {
        global $CFG, $DB;
        $idnumber = self::IDNUMBER_PREFIX . $listid;
        foreach (get_fast_modinfo($course)->get_instances_of('folder') as $cm) {
            if ($cm->idnumber === $idnumber) {
                return $cm;
            }
        }
        require_once($CFG->dirroot . '/course/modlib.php');
        require_once($CFG->dirroot . '/mod/folder/lib.php');
        $moduleinfo = (object) [
            'modulename' => 'folder',
            'module' => $DB->get_field('modules', 'id', ['name' => 'folder']),
            'course' => $course->id,
            'section' => self::section($course),
            'visible' => 1,
            'visibleoncoursepage' => 1,
            'name' => get_string('boardfolder', 'local_oksigeniaclasstools', $class['name']),
            'intro' => '',
            'introformat' => FORMAT_HTML,
            'display' => FOLDER_DISPLAY_PAGE,
            'showexpanded' => 1,
            'showdownloadfolder' => 1,
            'forcedownload' => 0,
            'files' => file_get_unused_draft_itemid(),
            'cmidnumber' => $idnumber,
            'groupmode' => 0,
            'groupingid' => 0,
            // A Moodle group: only its members see the folder.
            'availability' => $class['groupid'] ? json_encode(\core_availability\tree::get_root_json(
                [\availability_group\condition::get_json($class['groupid'])],
                \core_availability\tree::OP_AND,
                false
            )) : null,
        ];
        $moduleinfo = add_moduleinfo($moduleinfo, $course);
        return get_fast_modinfo($course->id)->get_cm($moduleinfo->coursemodule);
    }

    /**
     * The number of the section «Class boards», added at the end of the course the first time.
     *
     * @param \stdClass $course
     * @return int
     */
    private static function section(\stdClass $course): int {
        global $DB;
        $name = get_string('boardsection', 'local_oksigeniaclasstools');
        $section = $DB->get_record('course_sections', ['course' => $course->id, 'name' => $name], 'id, section', IGNORE_MULTIPLE);
        if ($section) {
            return (int) $section->section;
        }
        $section = course_create_section($course);
        course_update_section($course, $section, ['name' => $name]);
        return (int) $section->section;
    }

    /**
     * The image on a landscape A4 page, as large as it fits (Moodle's own PDF library).
     *
     * @param string $png
     * @return string The PDF.
     */
    private static function pdf(string $png): string {
        global $CFG;
        require_once($CFG->libdir . '/pdflib.php');
        $pdf = new \pdf('L', 'mm', 'A4');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(8, 8, 8);
        $pdf->AddPage();
        $pdf->Image('@' . $png, 8, 8, 281, 194, 'PNG', '', '', false, 300, '', false, false, 0, 'CM');
        return $pdf->Output('', 'S');
    }

    /**
     * Tells each student, in their language, that there is a new board. With Oksigenia Marandu 0.70 or later, whoever
     * gets it by mail gets the common mail of the site, with the board inside and a button to it.
     *
     * @param \stdClass $course
     * @param int[] $userids
     * @param string $name
     * @param \moodle_url $url
     * @param string $png The board.
     * @param array $where titled (the board has a name of its own), folder and section (where it is kept in the course).
     * @return int How many were notified.
     */
    private static function notify(
        \stdClass $course,
        array $userids,
        string $name,
        \moodle_url $url,
        string $png,
        array $where
    ): int {
        global $USER;
        $strings = get_string_manager();
        $coursecontext = \context_course::instance($course->id);
        $coursename = format_string($course->fullname, true, ['context' => $coursecontext, 'escape' => false]);
        $api = '\local_oksigeniamarandu\api';
        $mail = class_exists($api) && method_exists($api, 'mail_notice');
        $picture = $mail ? self::mail_picture($png) : null;
        $letters = [];
        $count = 0;
        foreach ($userids as $userid) {
            $user = \core_user::get_user($userid);
            if (!$user || $user->deleted || $user->suspended) {
                continue;
            }
            $lang = $user->lang ?: current_language();
            $a = (object) ['teacher' => fullname($USER), 'course' => $coursename, 'name' => $name,
                'titled' => !empty($where['titled'])];
            $message = new \core\message\message();
            $message->component = 'local_oksigeniaclasstools';
            $message->name = 'boardshared';
            $message->userfrom = $USER;
            $message->userto = $user;
            $message->subject = self::subject($a, $lang);
            $message->fullmessage = $strings->get_string('boardshared_body', 'local_oksigeniaclasstools', $a, $lang);
            $message->fullmessageformat = FORMAT_PLAIN;
            $message->fullmessagehtml = '<p>' . s($message->fullmessage) . '</p>';
            $message->smallmessage = $message->fullmessage;
            $message->notification = 1;
            $message->contexturl = $url->out(false);
            $message->contexturlname = $strings->get_string('boardshared_link', 'local_oksigeniaclasstools', null, $lang);
            $message->courseid = $course->id;
            if ($mail) {
                $letters[$lang] = $letters[$lang] ?? self::letter((object) ((array) $a + $where), $url, $picture, $lang);
                $api::mail_notice($message, $letters[$lang]);
            }
            if (message_send($message)) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * The mail of a shared board, as the common mail of Marandu takes its pieces: what the notice says, the board, where
     * it is kept, a button to its folder and the way to the preferences of the notices.
     *
     * @param \stdClass $a teacher, course and name, as the strings of the notice take them; titled, whether the board has
     *     a name of its own (then it heads the mail); folder and section, where the board is kept (without them, the mail
     *     does not say it).
     * @param \moodle_url $url The folder of the class.
     * @param string|null $picture The board, as mail_picture() leaves it; null to go without it.
     * @param string $lang
     * @return array The pieces.
     */
    public static function letter(\stdClass $a, \moodle_url $url, ?string $picture, string $lang): array {
        $strings = get_string_manager();
        $say = fn(string $key, $param = null) => $strings->get_string($key, 'local_oksigeniaclasstools', $param, $lang);
        $subject = self::subject($a, $lang);
        // A board with a name of its own is remembered by it: it heads the mail, and the first lines say who and where.
        $titled = !empty($a->titled);
        $body = $titled ? $say('boardshared_bodynamed', $a) : $say('boardshared_body', $a);
        $blocks = [['paragraph' => $body]];
        if ($picture !== null) {
            $blocks[] = ['picture' => ['picturebytes' => $picture, 'picturealt' => $say('boardshared_alt', $a->name),
                'picturecaption' => '', 'pictureframe' => true]];
        }
        if (!empty($a->folder) && !empty($a->section)) {
            $blocks[] = ['paragraph' => $say('boardshared_where', $a)];
        }
        $blocks[] = ['action' => ['actionurl' => $url->out(false), 'actiontext' => $say('boardshared_link')]];
        // It goes to the whole class at every board: the way out, to the preferences of the notices.
        $blocks[] = ['link' => ['linkbefore' => $say('boardshared_prefsbefore'),
            'linkurl' => (new \moodle_url('/message/notificationpreferences.php'))->out(false),
            'linktext' => $say('boardshared_prefs')]];
        return ['subject' => $subject, 'heading' => $titled ? $say('boardshared_heading', $a->name) : $subject,
            'preheader' => $body, 'blocks' => $blocks, 'reason' => $say('boardshared_reason', $a->course)];
    }

    /**
     * The subject of the notice of a shared board, and of its mail: the course and, when it has one of its own, the name
     * of the board.
     *
     * @param \stdClass $a course, name and titled, as letter() takes them.
     * @param string $lang
     * @return string
     */
    public static function subject(\stdClass $a, string $lang): string {
        $strings = get_string_manager();
        return !empty($a->titled)
            ? $strings->get_string('boardshared_subjectnamed', 'local_oksigeniaclasstools', $a, $lang)
            : $strings->get_string('boardshared_subject', 'local_oksigeniaclasstools', $a->course, $lang);
    }

    /**
     * The board as it goes inside a mail: on white (a dark mail would show through a transparent board), at most
     * MAIL_WIDTH wide, and as PNG while it weighs no more than MAIL_BYTES, else as JPEG.
     *
     * @param string $png
     * @return string|null The image; null if it cannot be made light enough (the mail then goes without it).
     */
    public static function mail_picture(string $png): ?string {
        if (!function_exists('imagecreatefromstring')) {
            return null;
        }
        $image = @imagecreatefromstring($png);
        if ($image === false) {
            return null;
        }
        $width = imagesx($image);
        $height = imagesy($image);
        $w = min($width, self::MAIL_WIDTH);
        $h = max(1, (int) round($height * $w / $width));
        $flat = imagecreatetruecolor($w, $h);
        imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
        imagecopyresampled($flat, $image, 0, 0, 0, 0, $w, $h, $width, $height);
        ob_start();
        imagepng($flat, null, 9);
        $bytes = (string) ob_get_clean();
        foreach ([85, 75, 60] as $quality) {
            if (strlen($bytes) <= self::MAIL_BYTES) {
                break;
            }
            ob_start();
            imagejpeg($flat, null, $quality);
            $bytes = (string) ob_get_clean();
        }
        return strlen($bytes) <= self::MAIL_BYTES ? $bytes : null;
    }
}
