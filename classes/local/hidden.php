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
 * The courses a teacher hides from «Which class?» (a dining hall or a staff room with hundreds of students is not a
 * class): only from that page and only for them; the course stays theirs, and the board opens in it as before.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class hidden {
    /** The user preference with the ids of the hidden courses, separated by commas. */
    const PREF = 'local_oksigeniaclasstools_hidden';

    /** Most courses kept hidden (the preference holds 1333 characters); the oldest go first. */
    const MAX = 150;

    /**
     * The courses the teacher has hidden.
     *
     * @param int $userid
     * @return int[]
     */
    public static function ids(int $userid): array {
        $value = (string) get_user_preferences(self::PREF, '', $userid);
        return array_values(array_unique(array_filter(array_map('intval', explode(',', $value)))));
    }

    /**
     * Hides a course from «Which class?», or shows it again.
     *
     * @param int $userid
     * @param int $courseid
     * @param bool $hide
     */
    public static function set(int $userid, int $courseid, bool $hide): void {
        $ids = array_values(array_diff(self::ids($userid), [$courseid]));
        if ($hide) {
            $ids[] = $courseid;
        }
        $ids = array_slice($ids, -self::MAX);
        if ($ids) {
            set_user_preference(self::PREF, implode(',', $ids), $userid);
        } else {
            unset_user_preference(self::PREF, $userid);
        }
    }
}
