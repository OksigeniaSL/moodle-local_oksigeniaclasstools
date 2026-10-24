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
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_oksigeniaclasstools', get_string('pluginname', 'local_oksigeniaclasstools'));
    $ADMIN->add('localplugins', $settings);
    // What the boards are used for, among the reports of the site, and a link to it at the top of the settings.
    $ADMIN->add('reports', new admin_externalpage(
        'local_oksigeniaclasstools_usage',
        get_string('usage', 'local_oksigeniaclasstools'),
        new moodle_url('/local/oksigeniaclasstools/usage.php')
    ));
    if ($ADMIN->fulltree) {
        $settings->add(new admin_setting_heading(
            'local_oksigeniaclasstools/usage',
            '',
            html_writer::link(
                new moodle_url('/local/oksigeniaclasstools/usage.php'),
                get_string('usage_see', 'local_oksigeniaclasstools')
            )
        ));
        $settings->add(new admin_setting_configselect(
            'local_oksigeniaclasstools/namestyle',
            get_string('namestyle', 'local_oksigeniaclasstools'),
            get_string('namestyle_desc', 'local_oksigeniaclasstools'),
            'firstsurname',
            [
                'firstsurname' => get_string('namestyle_firstsurname', 'local_oksigeniaclasstools'),
                'initials' => get_string('namestyle_initials', 'local_oksigeniaclasstools'),
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
        // And by category: a category (and the ones below it) can start in another mode.
        $settings->add(new \local_oksigeniaclasstools\admin\setting_categorymodes());
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
        // What the site shows: tools, games and materials (all of them unless the administrator leaves some out; the
        // presentation, which loads from canva.com, only if the administrator turns it on).
        $shown = [
            'tools' => LOCAL_OKSIGENIACLASSTOOLS_TOOLS,
            'games' => LOCAL_OKSIGENIACLASSTOOLS_GAMES,
            'materials' => LOCAL_OKSIGENIACLASSTOOLS_MATERIALS,
        ];
        foreach ($shown as $name => $all) {
            $choices = array_map(fn($key) => get_string($key, 'local_oksigeniaclasstools'), $all);
            $settings->add(new admin_setting_configmulticheckbox(
                'local_oksigeniaclasstools/' . $name,
                get_string('show_' . $name, 'local_oksigeniaclasstools'),
                get_string('show_' . $name . '_desc', 'local_oksigeniaclasstools'),
                array_fill_keys(array_diff(array_keys($all), $name === 'tools' ? LOCAL_OKSIGENIACLASSTOOLS_TOOLS_OFF : []), 1),
                $choices
            ));
        }
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/students',
            get_string('students', 'local_oksigeniaclasstools'),
            get_string('students_desc', 'local_oksigeniaclasstools'),
            0
        ));
        $settings->add(new admin_setting_configtext(
            'local_oksigeniaclasstools/helpurl',
            get_string('helpurl', 'local_oksigeniaclasstools'),
            get_string('helpurl_desc', 'local_oksigeniaclasstools'),
            '',
            PARAM_URL
        ));
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/shared',
            get_string('shared', 'local_oksigeniaclasstools'),
            get_string('shared_desc', 'local_oksigeniaclasstools'),
            1
        ));
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/menu',
            get_string('menu', 'local_oksigeniaclasstools'),
            get_string('menu_desc', 'local_oksigeniaclasstools'),
            1
        ));
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/live',
            get_string('live', 'local_oksigeniaclasstools'),
            get_string('live_desc', 'local_oksigeniaclasstools'),
            1
        ));
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/livenotice',
            get_string('livenotice', 'local_oksigeniaclasstools'),
            get_string('livenotice_desc', 'local_oksigeniaclasstools'),
            1
        ));
        // The fixed remote turns itself off after these hours without orders from the phone (0: never).
        $settings->add(new admin_setting_configselect(
            'local_oksigeniaclasstools/remoteoff',
            get_string('remoteoff', 'local_oksigeniaclasstools'),
            get_string('remoteoff_desc', 'local_oksigeniaclasstools'),
            2,
            [
                0 => get_string('remoteoff_never', 'local_oksigeniaclasstools'),
                1 => get_string('remoteoff_one', 'local_oksigeniaclasstools'),
                2 => get_string('remoteoff_hours', 'local_oksigeniaclasstools', 2),
                4 => get_string('remoteoff_hours', 'local_oksigeniaclasstools', 4),
                8 => get_string('remoteoff_hours', 'local_oksigeniaclasstools', 8),
            ]
        ));
        // The teacher's stickers: on or off, and what makes a use real.
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/logros',
            get_string('logros', 'local_oksigeniaclasstools'),
            get_string('logros_desc', 'local_oksigeniaclasstools'),
            1
        ));
        foreach (['logros_devices' => 5, 'logros_picks' => 5, 'logros_students' => 8] as $name => $default) {
            $settings->add(new admin_setting_configtext(
                'local_oksigeniaclasstools/' . $name,
                get_string($name, 'local_oksigeniaclasstools'),
                get_string($name . '_desc', 'local_oksigeniaclasstools'),
                $default,
                PARAM_INT,
                4
            ));
        }
        // The teachers' room: on or off, and the span of time it counts (the last weeks, or seasons).
        $settings->add(new admin_setting_configcheckbox(
            'local_oksigeniaclasstools/sala',
            get_string('sala', 'local_oksigeniaclasstools'),
            get_string('sala_desc', 'local_oksigeniaclasstools'),
            1
        ));
        $settings->add(new admin_setting_configtext(
            'local_oksigeniaclasstools/sala_weeks',
            get_string('sala_weeks', 'local_oksigeniaclasstools'),
            get_string('sala_weeks_desc', 'local_oksigeniaclasstools'),
            \local_oksigeniaclasstools\local\sala::WEEKS,
            PARAM_INT,
            4
        ));
        $settings->add(new admin_setting_configtextarea(
            'local_oksigeniaclasstools/sala_seasons',
            get_string('sala_seasons', 'local_oksigeniaclasstools'),
            get_string('sala_seasons_desc', 'local_oksigeniaclasstools'),
            '',
            PARAM_TEXT
        ));
        // Exercises written by the AI of the site, from Moodle 4.5.
        if (class_exists('\\core_ai\\manager')) {
            $settings->add(new admin_setting_configcheckbox(
                'local_oksigeniaclasstools/ai',
                get_string('ai', 'local_oksigeniaclasstools'),
                get_string('ai_desc', 'local_oksigeniaclasstools'),
                1
            ));
        }
    }
}
