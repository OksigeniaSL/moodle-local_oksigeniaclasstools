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

namespace local_oksigeniaclasstools\admin;

/**
 * The screen mode a course starts in, by its category: a choice for each category of the site («Like the site», or
 * «Like the category above» for a subcategory, or one of the modes). Kept as JSON (category id => mode), only for the
 * categories that have one.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class setting_categorymodes extends \admin_setting {
    /**
     * The setting, with its name and help.
     */
    public function __construct() {
        parent::__construct(
            'local_oksigeniaclasstools/categorymodes',
            get_string('categorymodes', 'local_oksigeniaclasstools'),
            get_string('categorymodes_desc', 'local_oksigeniaclasstools'),
            ''
        );
    }

    /**
     * What is kept now.
     *
     * @return string|null
     */
    public function get_setting() {
        return $this->config_read($this->name);
    }

    /**
     * Keeps the modes chosen: only real modes, for real category ids.
     *
     * @param mixed $data Category id => mode, from the form.
     * @return string Empty, or the error.
     */
    public function write_setting($data) {
        $map = [];
        foreach (is_array($data) ? $data : [] as $id => $mode) {
            if ((int) $id > 0 && in_array($mode, LOCAL_OKSIGENIACLASSTOOLS_MODES, true)) {
                $map[(int) $id] = $mode;
            }
        }
        return $this->config_write($this->name, $map ? json_encode($map) : '') ? '' : get_string('errorsetting', 'admin');
    }

    /**
     * A table with each category and its choice.
     *
     * @param mixed $data What is kept.
     * @param string $query
     * @return string
     */
    public function output_html($data, $query = '') {
        $map = json_decode((string) $data, true) ?: [];
        $modes = [];
        foreach (LOCAL_OKSIGENIACLASSTOOLS_MODES as $mode) {
            $modes[$mode] = get_string('mode_' . $mode, 'local_oksigeniaclasstools');
        }
        $rows = '';
        foreach (\core_course_category::make_categories_list() as $id => $name) {
            // A subcategory is named with its path («Primary / Year 1»).
            $inherit = strpos($name, ' / ') === false ? 'categorymodes_site' : 'categorymodes_parent';
            $select = \html_writer::select(
                ['' => get_string($inherit, 'local_oksigeniaclasstools')] + $modes,
                $this->get_full_name() . '[' . $id . ']',
                $map[$id] ?? '',
                false,
                ['id' => $this->get_id() . '_' . $id]
            );
            $label = \html_writer::label(s($name), $this->get_id() . '_' . $id);
            $rows .= \html_writer::tag('tr', \html_writer::tag('td', $label) . \html_writer::tag('td', $select));
        }
        $table = \html_writer::tag('table', $rows, ['class' => 'generaltable']);
        return format_admin_setting($this, $this->visiblename, $table, $this->description, false, '', null, $query);
    }
}
