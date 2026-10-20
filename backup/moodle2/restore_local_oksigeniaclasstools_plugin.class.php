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

/**
 * What the board kept of a course, back from the course backup.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Restores, with the course, what the board kept of it (see the backup side for what goes in).
 *
 * Restored into a course that already has data of the board, nothing is lost: the use of the boards adds up, a tool
 * the teacher already keeps there keeps the newer of the two, and a sticker use of the same day counts once.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class restore_local_oksigeniaclasstools_plugin extends restore_local_plugin {
    /**
     * The paths of the plugin's part of the course.
     *
     * @return restore_path_element[]
     */
    protected function define_course_plugin_structure() {
        $paths = [new restore_path_element('local_oksigeniaclasstools_tally', $this->get_pathfor('/tallies/tally'))];
        if ($this->get_setting_value('users')) {
            $paths[] = new restore_path_element('local_oksigeniaclasstools_state', $this->get_pathfor('/kept/state'));
            $paths[] = new restore_path_element('local_oksigeniaclasstools_pick', $this->get_pathfor('/picks/pick'));
            $paths[] = new restore_path_element('local_oksigeniaclasstools_use', $this->get_pathfor('/uses/use'));
        }
        return $paths;
    }

    /**
     * The use of the boards on one day: added to what the course already has.
     *
     * @param array $data
     */
    public function process_local_oksigeniaclasstools_tally($data) {
        $data = (object) $data;
        \local_oksigeniaclasstools\local\tally::add_day(
            (int) $this->task->get_courseid(),
            (int) $data->day,
            (string) $data->who,
            (string) $data->tool,
            (int) $data->opens,
            (int) $data->seconds
        );
    }

    /**
     * What a teacher kept of a tool: the newer one stays, if the course already has it.
     *
     * @param array $data
     */
    public function process_local_oksigeniaclasstools_state($data) {
        global $DB;
        $data = (object) $data;
        $userid = $this->get_mappingid('user', $data->userid);
        if (!$userid) {
            return;
        }
        $courseid = (int) $this->task->get_courseid();
        $value = $data->data;
        if ($data->tool === 'tarjetas') {
            $value = $this->cards_list($value, $courseid);
        }
        $where = ['courseid' => $courseid, 'userid' => $userid, 'tool' => $data->tool];
        $row = $DB->get_record('local_oksigeniaclasstools_state', $where);
        if (!$row) {
            $DB->insert_record('local_oksigeniaclasstools_state', (object) ($where + [
                'data' => $value, 'timemodified' => (int) $data->timemodified,
            ]));
        } else if ((int) $data->timemodified > (int) $row->timemodified) {
            $DB->update_record('local_oksigeniaclasstools_state', (object) [
                'id' => $row->id, 'data' => $value, 'timemodified' => (int) $data->timemodified,
            ]);
        }
    }

    /**
     * A pick of fair picking, with its student (and the teacher, if they come along).
     *
     * @param array $data
     */
    public function process_local_oksigeniaclasstools_pick($data) {
        global $DB;
        $data = (object) $data;
        $userid = $this->get_mappingid('user', $data->userid);
        if (!$userid) {
            return;
        }
        $DB->insert_record('local_oksigeniaclasstools_picks', (object) [
            'courseid' => (int) $this->task->get_courseid(),
            'userid' => $userid,
            'teacherid' => $data->teacherid ? (int) $this->get_mappingid('user', $data->teacherid, 0) : 0,
            'timecreated' => (int) $data->timecreated,
        ]);
    }

    /**
     * A real use of a sticker in the course: once per sticker and day.
     *
     * @param array $data
     */
    public function process_local_oksigeniaclasstools_use($data) {
        global $DB;
        $data = (object) $data;
        $userid = $this->get_mappingid('user', $data->userid);
        if (!$userid) {
            return;
        }
        $record = ['userid' => $userid, 'cromo' => $data->cromo, 'courseid' => (int) $this->task->get_courseid(),
            'day' => (int) $data->day];
        if (!$DB->record_exists('local_oksigeniaclasstools_uses', $record)) {
            $DB->insert_record('local_oksigeniaclasstools_uses', (object) ($record + [
                'week' => (int) $data->week, 'timecreated' => (int) $data->timecreated,
            ]));
        }
    }

    /**
     * The pictures of the quiz questions, for the teachers that come along.
     *
     * Their item is the teacher's user id, so they are matched with the user mapping without asking it to belong to the
     * course context (what add_related_files() would ask).
     */
    public function after_execute_course() {
        $results = restore_dbops::send_files_to_pool(
            $this->task->get_basepath(),
            $this->get_restoreid(),
            'local_oksigeniaclasstools',
            'quizimg',
            $this->task->get_old_contextid(),
            $this->task->get_userid(),
            'user',
            null,
            null,
            true
        );
        $this->task->add_result(array_fill_keys(array_column(array_map(fn($r) => (array) $r, $results), 'code'), true));
    }

    /**
     * The class the printed cards were made for, in the restored course: its group, or the whole course.
     *
     * @param string $json What the cards keep: the list and how many cards.
     * @param int $courseid The restored course.
     * @return string
     */
    private function cards_list(string $json, int $courseid): string {
        $cards = json_decode($json, true);
        if (!is_array($cards) || !isset($cards['list']) || !is_string($cards['list'])) {
            return $json;
        }
        $kind = substr($cards['list'], 0, 1);
        $id = (int) substr($cards['list'], 1);
        if ($kind === 'c') {
            $cards['list'] = 'c' . $courseid;
        } else if ($kind === 'g') {
            $group = $this->get_mappingid('group', $id);
            $cards['list'] = $group ? 'g' . $group : '';
        }
        return json_encode($cards);
    }
}
