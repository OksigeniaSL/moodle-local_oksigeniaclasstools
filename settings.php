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
 * Plugin settings.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_oksigeniaclasstools', get_string('pluginname', 'local_oksigeniaclasstools'));
    $ADMIN->add('localplugins', $settings);
    if ($ADMIN->fulltree) {
        $settings->add(new admin_setting_configselect(
            'local_oksigeniaclasstools/namestyle',
            get_string('namestyle', 'local_oksigeniaclasstools'),
            get_string('namestyle_desc', 'local_oksigeniaclasstools'),
            'firstsurname',
            [
                'firstsurname' => get_string('namestyle_firstsurname', 'local_oksigeniaclasstools'),
                'first' => get_string('namestyle_first', 'local_oksigeniaclasstools'),
                'full' => get_string('namestyle_full', 'local_oksigeniaclasstools'),
            ]
        ));
        $settings->add(new admin_setting_configtext(
            'local_oksigeniaclasstools/days',
            get_string('days', 'local_oksigeniaclasstools'),
            get_string('days_desc', 'local_oksigeniaclasstools'),
            90,
            PARAM_INT,
            4
        ));
        require_once(__DIR__ . '/lib.php');
        $modes = [];
        foreach (LOCAL_OKSIGENIACLASSTOOLS_MODES as $mode) {
            $modes[$mode] = get_string('mode_' . $mode, 'local_oksigeniaclasstools');
        }
        $settings->add(new admin_setting_configselect(
            'local_oksigeniaclasstools/defaultmode',
            get_string('defaultmode', 'local_oksigeniaclasstools'),
            get_string('defaultmode_desc', 'local_oksigeniaclasstools'),
            'primary',
            $modes
        ));
        $levels = [];
        foreach (LOCAL_OKSIGENIACLASSTOOLS_LEVELS as $level) {
            $levels[$level] = get_string('level_' . $level, 'local_oksigeniaclasstools');
        }
        $settings->add(new admin_setting_configmulticheckbox(
            'local_oksigeniaclasstools/levels',
            get_string('levels', 'local_oksigeniaclasstools'),
            get_string('levels_desc', 'local_oksigeniaclasstools'),
            array_fill_keys(array_keys($levels), 1),
            $levels
        ));
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/students',
            get_string('students', 'local_oksigeniaclasstools'),
            get_string('students_desc', 'local_oksigeniaclasstools'),
            0
        ));
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/menu',
            get_string('menu', 'local_oksigeniaclasstools'),
            get_string('menu_desc', 'local_oksigeniaclasstools'),
            1
        ));
    }
}
