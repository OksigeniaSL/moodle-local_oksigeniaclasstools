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
 * What teachers share with the whole site (the school): class lists pasted by hand, letter wheels and locks. Every
 * teacher sees them in the same pickers as their own, with the name of whoever shared them; only that teacher can
 * change or remove one, and a manager can remove any. The administrator can turn it all off.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class shared {
    /** The table. */
    const TABLE = 'local_oksigeniaclasstools_shared';
    /** What can be shared: «Whose turn?» lists, letter wheels and secret-code locks. */
    const KINDS = ['lists', 'roscos', 'locks'];
    /** The longest name. */
    const NAME_MAX_LENGTH = 100;

    /**
     * Whether the site shares (the administrator can turn it off; on by default).
     *
     * @return bool
     */
    public static function on(): bool {
        return get_config('local_oksigeniaclasstools', 'shared') !== '0';
    }

    /**
     * Everything shared of a kind, with who shared it, as the user who looks sees it.
     *
     * @param string $kind
     * @param int $userid Who looks.
     * @param bool $canmanage Whether they can remove what others shared.
     * @return array[] id, name, data, author, mine, candelete.
     */
    public static function items(string $kind, int $userid, bool $canmanage): array {
        global $DB;
        self::check_kind($kind);
        $fields = \core_user\fields::for_name()->get_sql('u', false, '', '', false)->selects;
        $rows = $DB->get_records_sql(
            "SELECT s.id, s.name, s.data, s.userid, $fields
               FROM {" . self::TABLE . "} s
               JOIN {user} u ON u.id = s.userid
              WHERE s.kind = :kind
           ORDER BY s.name, s.id",
            ['kind' => $kind]
        );
        return array_values(array_map(fn($r) => [
            'id' => (int) $r->id,
            'name' => $r->name,
            'data' => $r->data,
            'author' => fullname($r),
            'mine' => (int) $r->userid === $userid,
            'candelete' => (int) $r->userid === $userid || $canmanage,
        ], $rows));
    }

    /**
     * Shares an item, or updates the one its author shared before.
     *
     * @param string $kind
     * @param string $name
     * @param string $data The item as the board keeps it, a JSON document.
     * @param int $userid The teacher.
     * @param int $id What they shared before, to update it (0: something new).
     * @return int Its id.
     */
    public static function save(string $kind, string $name, string $data, int $userid, int $id = 0): int {
        global $DB;
        self::check_kind($kind);
        $name = \core_text::substr(trim(clean_param($name, PARAM_TEXT)), 0, self::NAME_MAX_LENGTH);
        if ($name === '' || strlen($data) > kept::DATA_MAX_LENGTH || !is_array(json_decode($data, true))) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $now = time();
        if ($id) {
            $row = $DB->get_record(self::TABLE, ['id' => $id, 'kind' => $kind], '*', MUST_EXIST);
            if ((int) $row->userid !== $userid) {
                throw new \moodle_exception('nopermissions', 'error', '', get_string('shared_change', 'local_oksigeniaclasstools'));
            }
            $DB->update_record(self::TABLE, (object) ['id' => $id, 'name' => $name, 'data' => $data, 'timemodified' => $now]);
            return $id;
        }
        return (int) $DB->insert_record(self::TABLE, (object) ['kind' => $kind, 'name' => $name, 'data' => $data,
            'userid' => $userid, 'timecreated' => $now, 'timemodified' => $now]);
    }

    /**
     * Stops sharing an item: its author, or someone who can remove what others shared.
     *
     * @param int $id
     * @param int $userid
     * @param bool $canmanage
     */
    public static function delete(int $id, int $userid, bool $canmanage): void {
        global $DB;
        $row = $DB->get_record(self::TABLE, ['id' => $id], 'id, userid', MUST_EXIST);
        if ((int) $row->userid !== $userid && !$canmanage) {
            throw new \moodle_exception('nopermissions', 'error', '', get_string('shared_change', 'local_oksigeniaclasstools'));
        }
        $DB->delete_records(self::TABLE, ['id' => $id]);
    }

    /**
     * What a teacher has shared, for the privacy export.
     *
     * @param int $userid
     * @return \stdClass[]
     */
    public static function of_user(int $userid): array {
        global $DB;
        $fields = 'id, kind, name, data, timecreated, timemodified';
        return array_values($DB->get_records(self::TABLE, ['userid' => $userid], 'kind, name', $fields));
    }

    /**
     * Forgets what a teacher shared.
     *
     * @param int $userid
     */
    public static function delete_user(int $userid): void {
        global $DB;
        $DB->delete_records(self::TABLE, ['userid' => $userid]);
    }

    /**
     * Only the kinds that can be shared.
     *
     * @param string $kind
     */
    private static function check_kind(string $kind): void {
        if (!in_array($kind, self::KINDS, true)) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
    }
}
