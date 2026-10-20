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
 * What the board keeps of a course, in the course backup.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Backs up, with the course, what the board keeps of it.
 *
 * Always: the use of the boards (per day, with no user). With users: what each teacher keeps of each tool, the picks
 * of fair picking, the real uses of the teachers' stickers and the pictures of the quiz questions. Left out, because
 * they are not course content: live sessions (gone after a day), the fixed remote and the guided helps a teacher did
 * (both belong to the teacher, not to a course).
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class backup_local_oksigeniaclasstools_plugin extends backup_local_plugin {
    /**
     * The plugin's part of the course.
     *
     * @return backup_plugin_element
     */
    protected function define_course_plugin_structure() {
        $plugin = $this->get_plugin_element();
        $board = new backup_nested_element($this->get_recommended_name());
        $plugin->add_child($board);

        $tallies = new backup_nested_element('tallies');
        $tally = new backup_nested_element('tally', ['id'], ['day', 'who', 'tool', 'opens', 'seconds']);
        $board->add_child($tallies);
        $tallies->add_child($tally);
        $tally->set_source_table('local_oksigeniaclasstools_tally', ['courseid' => backup::VAR_COURSEID]);

        if (!$this->get_setting_value('users')) {
            return $plugin;
        }
        $kept = new backup_nested_element('kept');
        $state = new backup_nested_element('state', ['id'], ['userid', 'tool', 'data', 'timemodified']);
        $board->add_child($kept);
        $kept->add_child($state);
        $state->set_source_table('local_oksigeniaclasstools_state', ['courseid' => backup::VAR_COURSEID]);
        $state->annotate_ids('user', 'userid');

        $picks = new backup_nested_element('picks');
        $pick = new backup_nested_element('pick', ['id'], ['userid', 'teacherid', 'timecreated']);
        $board->add_child($picks);
        $picks->add_child($pick);
        $pick->set_source_table('local_oksigeniaclasstools_picks', ['courseid' => backup::VAR_COURSEID]);
        $pick->annotate_ids('user', 'userid');
        $pick->annotate_ids('user', 'teacherid');

        $uses = new backup_nested_element('uses');
        $use = new backup_nested_element('use', ['id'], ['userid', 'cromo', 'day', 'week', 'timecreated']);
        $board->add_child($uses);
        $uses->add_child($use);
        $use->set_source_table('local_oksigeniaclasstools_uses', ['courseid' => backup::VAR_COURSEID]);
        $use->annotate_ids('user', 'userid');

        // The pictures of the quiz questions: in the course, one item per teacher (their user id).
        $board->annotate_files('local_oksigeniaclasstools', 'quizimg', null);
        return $plugin;
    }
}
