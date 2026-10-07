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
 * What each teacher keeps of each tool in each course (scoreboard, roscos, locks…), to go on from any computer.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class kept {
    /** Longest tool name. */
    const TOOL_MAX_LENGTH = 32;

    /** Largest JSON kept for a tool, in bytes. */
    const DATA_MAX_LENGTH = 200000;

    /**
     * Saves what a teacher keeps of a tool in a course, replacing what was there.
     *
     * @param int $courseid
     * @param int $userid
     * @param string $tool
     * @param string $data JSON.
     * @throws \moodle_exception If the tool name or the data are not valid.
     */
    public static function save(int $courseid, int $userid, string $tool, string $data): void {
        global $DB;
        if (
            $tool === '' || strlen($tool) > self::TOOL_MAX_LENGTH || clean_param($tool, PARAM_ALPHANUMEXT) !== $tool
                || strlen($data) > self::DATA_MAX_LENGTH || json_decode($data) === null
        ) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $where = ['courseid' => $courseid, 'userid' => $userid, 'tool' => $tool];
        if ($id = $DB->get_field('local_oksigeniaclasstools_state', 'id', $where)) {
            $record = (object) ['id' => $id, 'data' => $data, 'timemodified' => time()];
            $DB->update_record('local_oksigeniaclasstools_state', $record);
        } else {
            $DB->insert_record('local_oksigeniaclasstools_state', (object) ($where + ['data' => $data, 'timemodified' => time()]));
        }
    }

    /**
     * Everything a teacher keeps in a course, by tool.
     *
     * @param int $courseid
     * @param int $userid
     * @return array tool => decoded data
     */
    public static function all(int $courseid, int $userid): array {
        global $DB;
        $kept = [];
        foreach ($DB->get_records('local_oksigeniaclasstools_state', ['courseid' => $courseid, 'userid' => $userid]) as $row) {
            $kept[$row->tool] = json_decode($row->data, true);
        }
        return $kept;
    }
}
