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
 * The pictures of the quiz questions: kept in the course for the teacher who put them (a file area of the plugin,
 * one item for each teacher), named after what they hold so the same picture is kept once. The questions only keep
 * that name. A picture of the question bank is copied here when its question comes to the board, and those that no
 * set uses any more go away a day later.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class quizimages {
    /** The file area. */
    const AREA = 'quizimg';

    /** The kinds of picture, with their extension. */
    const TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];

    /** Largest picture, in bytes (the board makes them smaller before sending them). */
    const MAX_BYTES = 3 * 1024 * 1024;

    /** How a picture is named: the SHA-1 of what it holds and its extension. */
    const NAME = '/^[0-9a-f]{40}\.(jpg|png|gif|webp)$/';

    /** How long a picture that no set uses stays (another tab may be showing it). */
    const GRACE = DAYSECS;

    /**
     * Keeps a picture for a teacher in a course.
     *
     * @param \context_course $context
     * @param int $userid
     * @param string $bytes What the picture holds.
     * @return string Its name.
     * @throws \moodle_exception If it is not a picture of a known kind, or it is too big.
     */
    public static function save(\context_course $context, int $userid, string $bytes): string {
        $info = $bytes === '' || strlen($bytes) > self::MAX_BYTES ? false : @getimagesizefromstring($bytes);
        if (!$info || !isset(self::TYPES[$info['mime']])) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $name = sha1($bytes) . '.' . self::TYPES[$info['mime']];
        $fs = get_file_storage();
        $file = $fs->get_file($context->id, 'local_oksigeniaclasstools', self::AREA, $userid, '/', $name);
        if ($file) {
            // Already there: it is fresh again.
            $file->set_timemodified(time());
        } else {
            $fs->create_file_from_string(self::record($context, $userid, $name), $bytes);
        }
        return $name;
    }

    /**
     * Copies the first picture in the text of a question of the bank.
     *
     * @param \context_course $context Where it goes.
     * @param int $userid For whom.
     * @param int $qcontextid The context of the question's category.
     * @param int $questionid
     * @return string The picture's name here, or '' if the question has none.
     */
    public static function from_question(\context_course $context, int $userid, int $qcontextid, int $questionid): string {
        $fs = get_file_storage();
        foreach ($fs->get_area_files($qcontextid, 'question', 'questiontext', $questionid, 'filename', false) as $file) {
            if (!isset(self::TYPES[$file->get_mimetype()]) || $file->get_filesize() > self::MAX_BYTES) {
                continue;
            }
            $name = $file->get_contenthash() . '.' . self::TYPES[$file->get_mimetype()];
            $here = $fs->get_file($context->id, 'local_oksigeniaclasstools', self::AREA, $userid, '/', $name);
            if ($here) {
                $here->set_timemodified(time());
            } else {
                $fs->create_file_from_storedfile(self::record($context, $userid, $name), $file);
            }
            return $name;
        }
        return '';
    }

    /**
     * Where a teacher's pictures are served from (the name of each goes after it).
     *
     * @param \context_course $context
     * @param int $userid
     * @return string
     */
    public static function base(\context_course $context, int $userid): string {
        $url = \moodle_url::make_pluginfile_url($context->id, 'local_oksigeniaclasstools', self::AREA, $userid, '/', '');
        return $url->out(false);
    }

    /**
     * Removes the pictures of a teacher in a course that the sets no longer use (after a day).
     *
     * @param \context_course $context
     * @param int $userid
     * @param string $sets The sets as they are kept (JSON).
     */
    public static function tidy(\context_course $context, int $userid, string $sets): void {
        $files = get_file_storage()->get_area_files($context->id, 'local_oksigeniaclasstools', self::AREA, $userid, 'id', false);
        foreach ($files as $file) {
            if ($file->get_timemodified() < time() - self::GRACE && strpos($sets, $file->get_filename()) === false) {
                $file->delete();
            }
        }
    }

    /**
     * The file record of a picture.
     *
     * @param \context_course $context
     * @param int $userid
     * @param string $name
     * @return array
     */
    private static function record(\context_course $context, int $userid, string $name): array {
        return ['contextid' => $context->id, 'component' => 'local_oksigeniaclasstools', 'filearea' => self::AREA,
            'itemid' => $userid, 'filepath' => '/', 'filename' => $name, 'userid' => $userid];
    }
}
