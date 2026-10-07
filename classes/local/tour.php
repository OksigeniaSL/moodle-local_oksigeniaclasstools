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
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
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
            ],
        ];
        return (int) \tool_usertours\manager::import_tour_from_json(json_encode($tour))->get_id();
    }
}
