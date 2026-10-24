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

namespace local_oksigeniaclasstools\external;

use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;
use local_oksigeniaclasstools\local\glossary as local_glossary;

/**
 * Words from the glossaries of the course, for the word games.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class glossary extends api {
    /**
     * Parameters of glossaries.
     *
     * @return external_function_parameters
     */
    public static function glossaries_parameters(): external_function_parameters {
        return new external_function_parameters(['courseid' => new external_value(PARAM_INT, 'The course')]);
    }

    /**
     * The glossaries of the course.
     *
     * @param int $courseid
     * @return array ok, glossaries
     */
    public static function glossaries(int $courseid): array {
        $params = self::validate_parameters(self::glossaries_parameters(), ['courseid' => $courseid]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        return ['ok' => true, 'glossaries' => local_glossary::glossaries($course)];
    }

    /**
     * Answer of glossaries.
     *
     * @return external_single_structure
     */
    public static function glossaries_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'Done'),
            'glossaries' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_INT, 'The glossary'),
                'name' => new external_value(PARAM_TEXT, 'Its name'),
                'count' => new external_value(PARAM_INT, 'How many entries'),
            ])),
        ]);
    }

    /**
     * Parameters of words.
     *
     * @return external_function_parameters
     */
    public static function words_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'glossaryid' => new external_value(PARAM_INT, 'The glossary'),
        ]);
    }

    /**
     * The words of a glossary of the course, each with a clue from its definition.
     *
     * @param int $courseid
     * @param int $glossaryid
     * @return array ok, words
     */
    public static function words(int $courseid, int $glossaryid): array {
        $params = self::validate_parameters(self::words_parameters(), ['courseid' => $courseid, 'glossaryid' => $glossaryid]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        return ['ok' => true, 'words' => local_glossary::words($course, $params['glossaryid'])];
    }

    /**
     * Answer of words.
     *
     * @return external_single_structure
     */
    public static function words_returns(): external_single_structure {
        return new external_single_structure([
            'ok' => new external_value(PARAM_BOOL, 'Done'),
            'words' => new external_multiple_structure(new external_single_structure([
                'w' => new external_value(PARAM_TEXT, 'The word'),
                'c' => new external_value(PARAM_TEXT, 'Its clue, maybe empty'),
            ])),
        ]);
    }
}
