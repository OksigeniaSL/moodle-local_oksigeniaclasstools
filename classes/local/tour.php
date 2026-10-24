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
 * The user tour that announces the classroom tools to teachers: it points at the link in the course bar and in the
 * main menu, and says what is inside. Its texts are language strings, so each teacher reads it in their language.
 * It appears once per teacher (Moodle remembers who has seen it) and can be edited or switched off in
 * Site administration → Appearance → User tours.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tour {
    /** Language string that names the tour (also how it is found again). */
    const NAME = 'tourname,local_oksigeniaclasstools';

    /**
     * Adds the tour if it is not there yet (and the user tours tool is installed).
     *
     * @return int|null The tour id, or null if it could not be added.
     */
    public static function install(): ?int {
        global $DB;
        if (!class_exists('\tool_usertours\manager')) {
            return null;
        }
        if ($id = $DB->get_field('tool_usertours_tours', 'id', ['name' => self::NAME], IGNORE_MULTIPLE)) {
            return (int) $id;
        }
        $link = 'li[data-key="local_oksigeniaclasstools"]';
        $step = fn(int $n, int $type, string $target, array $config = []) => [
            'title' => "tourstep{$n}title,local_oksigeniaclasstools",
            'content' => "tourstep{$n}content,local_oksigeniaclasstools",
            'contentformat' => FORMAT_HTML,
            'targettype' => (string) $type,
            'targetvalue' => $target,
            'sortorder' => (string) ($n - 1),
            'configdata' => json_encode((object) $config),
        ];
        $tour = [
            'name' => self::NAME,
            'description' => 'tourdescription,local_oksigeniaclasstools',
            'pathmatch' => '/course/view.php%',
            'enabled' => '1',
            'endtourlabel' => '',
            'displaystepnumbers' => true,
            'configdata' => json_encode([
                'placement' => 'bottom',
                'orphan' => '0',
                'backdrop' => '1',
                'reflex' => '0',
                'filtervalues' => [
                    'role' => ['-1', 'manager', 'editingteacher', 'teacher'],
                    // Only where the link is: whoever can open the tools in this course.
                    'cssselector' => [".secondary-navigation $link"],
                ],
                'majorupdatetime' => time(),
            ]),
            'steps' => [
                $step(1, 0, ".secondary-navigation $link"),
                $step(2, 0, ".primary-navigation $link"),
                $step(3, 2, '', ['orphan' => '1', 'backdrop' => '1']),
                $step(4, 2, '', ['orphan' => '1', 'backdrop' => '1']),
            ],
        ];
        return (int) \tool_usertours\manager::import_tour_from_json(json_encode($tour))->get_id();
    }

    /**
     * Adds the last step, the video or guide of help, to a tour installed before it existed (once).
     *
     * @return bool Whether it was added.
     */
    public static function add_help_step(): bool {
        global $DB;
        if (!class_exists('\tool_usertours\tour')) {
            return false;
        }
        $id = $DB->get_field('tool_usertours_tours', 'id', ['name' => self::NAME], IGNORE_MULTIPLE);
        $title = 'tourstep4title,local_oksigeniaclasstools';
        $where = 'tourid = ? AND ' . $DB->sql_compare_text('title') . ' = ' . $DB->sql_compare_text('?');
        if (!$id || $DB->record_exists_select('tool_usertours_steps', $where, [$id, $title])) {
            return false;
        }
        $tour = \tool_usertours\tour::instance($id);
        $step = new \tool_usertours\step();
        $step->set_tourid($id);
        $step->set_title($title);
        $step->set_content('tourstep4content,local_oksigeniaclasstools', FORMAT_HTML);
        $step->set_targettype(\tool_usertours\target::TARGET_UNATTACHED);
        $step->set_targetvalue('');
        $step->set_config('orphan', '1');
        $step->set_config('backdrop', '1');
        $step->set_sortorder($tour->count_steps());
        $step->persist(true);
        \tool_usertours\tour::instance($id)->reset_step_sortorder();
        return true;
    }

    /**
     * Where the last step of the tour leads: the video or guide the site chose, or the official page of Classtools
     * (with its video) in the teacher's language.
     *
     * @return \moodle_url
     */
    public static function help_url(): \moodle_url {
        $url = trim((string) get_config('local_oksigeniaclasstools', 'helpurl'));
        if (!preg_match('~^https?://~i', $url)) {
            $url = get_string('help_official_url', 'local_oksigeniaclasstools');
        }
        return new \moodle_url($url);
    }
}
