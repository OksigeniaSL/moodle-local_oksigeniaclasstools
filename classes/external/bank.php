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
use local_oksigeniaclasstools\local\bank as local_bank;

/**
 * Questions of the Moodle question bank of the course, for the quiz and for the pairs game.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class bank extends api {
    /**
     * Parameters of categories.
     *
     * @return external_function_parameters
     */
    public static function categories_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'kind' => new external_value(PARAM_ALPHA, 'quiz or pairs: the questions it counts', VALUE_DEFAULT, 'quiz'),
        ]);
    }

    /**
     * The categories of the question bank with questions the board can use.
     *
     * @param int $courseid
     * @param string $kind
     * @return array categories
     */
    public static function categories(int $courseid, string $kind = 'quiz'): array {
        $params = self::validate_parameters(self::categories_parameters(), ['courseid' => $courseid, 'kind' => $kind]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        return ['categories' => local_bank::categories($course, $params['kind'] === 'pairs' ? 'pairs' : 'quiz')];
    }

    /**
     * Answer of categories.
     *
     * @return external_single_structure
     */
    public static function categories_returns(): external_single_structure {
        return new external_single_structure([
            'categories' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_INT, 'The category'),
                'name' => new external_value(PARAM_TEXT, 'Where it is and its name'),
                'count' => new external_value(PARAM_INT, 'How many questions the board can use'),
            ])),
        ]);
    }

    /**
     * Parameters of pairs and questions.
     *
     * @return external_function_parameters
     */
    public static function pairs_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'The course'),
            'categoryid' => new external_value(PARAM_INT, 'The category'),
        ]);
    }

    /**
     * The matching questions of a category, as pairs.
     *
     * @param int $courseid
     * @param int $categoryid
     * @return array json: pairs and skipped
     */
    public static function pairs(int $courseid, int $categoryid): array {
        $params = self::validate_parameters(self::pairs_parameters(), ['courseid' => $courseid, 'categoryid' => $categoryid]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        return self::json(local_bank::pairs($course, $params['categoryid']));
    }

    /**
     * Answer of pairs.
     *
     * @return external_single_structure
     */
    public static function pairs_returns(): external_single_structure {
        return self::json_returns('The pairs ([a, b]) and how many questions were skipped');
    }

    /**
     * Parameters of questions.
     *
     * @return external_function_parameters
     */
    public static function questions_parameters(): external_function_parameters {
        return self::pairs_parameters();
    }

    /**
     * The questions of a category for the quiz (one right answer or true/false), with their pictures.
     *
     * @param int $courseid
     * @param int $categoryid
     * @return array json: questions and skipped
     */
    public static function questions(int $courseid, int $categoryid): array {
        global $USER;
        $params = self::validate_parameters(self::questions_parameters(), ['courseid' => $courseid, 'categoryid' => $categoryid]);
        [$course] = self::course($params['courseid'], 'local/oksigeniaclasstools:use');
        return self::json(local_bank::questions($course, $params['categoryid'], (int) $USER->id));
    }

    /**
     * Answer of questions.
     *
     * @return external_single_structure
     */
    public static function questions_returns(): external_single_structure {
        return self::json_returns('The questions ([text, options, correct, picture]) and how many were skipped');
    }
}
