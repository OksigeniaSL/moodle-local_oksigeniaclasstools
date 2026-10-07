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

namespace local_oksigeniaclasstools\task;

/**
 * Deletes the picks that no longer count: older than the days counted for fair picking.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class purge_picks extends \core\task\scheduled_task {
    /**
     * Name of the task.
     *
     * @return string
     */
    public function get_name(): string {
        return get_string('taskpurgepicks', 'local_oksigeniaclasstools');
    }

    /**
     * Deletes them.
     */
    public function execute(): void {
        global $DB;
        $days = max(1, (int) (get_config('local_oksigeniaclasstools', 'days') ?: 90));
        $DB->delete_records_select('local_oksigeniaclasstools_picks', 'timecreated < ?', [time() - $days * DAYSECS]);
    }
}
