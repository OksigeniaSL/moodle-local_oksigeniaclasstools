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
 * Privacy provider.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_oksigeniaclasstools\privacy;

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\transform;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;

/**
 * Stores the picks (who was picked and when) and what each teacher keeps of each tool in each course.
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\core_userlist_provider,
    \core_privacy\local\request\plugin\provider {
    /**
     * What is stored.
     *
     * @param collection $collection
     * @return collection
     */
    public static function get_metadata(collection $collection): collection {
        $collection->add_database_table('local_oksigeniaclasstools_picks', [
            'courseid' => 'privacy:metadata:picks:courseid',
            'userid' => 'privacy:metadata:picks:userid',
            'teacherid' => 'privacy:metadata:picks:teacherid',
            'timecreated' => 'privacy:metadata:picks:timecreated',
        ], 'privacy:metadata:picks');
        $collection->add_database_table('local_oksigeniaclasstools_state', [
            'courseid' => 'privacy:metadata:state:courseid',
            'userid' => 'privacy:metadata:state:userid',
            'tool' => 'privacy:metadata:state:tool',
            'data' => 'privacy:metadata:state:data',
            'timemodified' => 'privacy:metadata:state:timemodified',
        ], 'privacy:metadata:state');
        // Boards shared with a class are course content (a folder); its students get a Moodle notification.
        $collection->add_subsystem_link('core_message', [], 'privacy:metadata:core_message');
        return $collection;
    }

    /**
     * Courses with picks of this user (as the student or as the teacher who picked).
     *
     * @param int $userid
     * @return contextlist
     */
    public static function get_contexts_for_userid(int $userid): contextlist {
        $contextlist = new contextlist();
        $contextlist->add_from_sql(
            'SELECT ctx.id
                                      FROM {context} ctx
                                      JOIN {local_oksigeniaclasstools_picks} p
                                           ON p.courseid = ctx.instanceid AND ctx.contextlevel = :level
                                     WHERE p.userid = :student OR p.teacherid = :teacher',
            ['level' => CONTEXT_COURSE, 'student' => $userid, 'teacher' => $userid]
        );
        $contextlist->add_from_sql(
            'SELECT ctx.id
                                      FROM {context} ctx
                                      JOIN {local_oksigeniaclasstools_state} s
                                           ON s.courseid = ctx.instanceid AND ctx.contextlevel = :level
                                     WHERE s.userid = :userid',
            ['level' => CONTEXT_COURSE, 'userid' => $userid]
        );
        return $contextlist;
    }

    /**
     * Users with picks in a course.
     *
     * @param userlist $userlist
     */
    public static function get_users_in_context(userlist $userlist) {
        $context = $userlist->get_context();
        if ($context->contextlevel != CONTEXT_COURSE) {
            return;
        }
        $params = ['courseid' => $context->instanceid];
        $userlist->add_from_sql(
            'userid',
            'SELECT userid FROM {local_oksigeniaclasstools_picks} WHERE courseid = :courseid',
            $params
        );
        $userlist->add_from_sql(
            'teacherid',
            'SELECT teacherid FROM {local_oksigeniaclasstools_picks} WHERE courseid = :courseid AND teacherid > 0',
            $params
        );
        $userlist->add_from_sql(
            'userid',
            'SELECT userid FROM {local_oksigeniaclasstools_state} WHERE courseid = :courseid',
            $params
        );
    }

    /**
     * Exports the student's picks in each course.
     *
     * @param approved_contextlist $contextlist
     */
    public static function export_user_data(approved_contextlist $contextlist) {
        global $DB;
        $userid = $contextlist->get_user()->id;
        foreach ($contextlist->get_contexts() as $context) {
            if ($context->contextlevel != CONTEXT_COURSE) {
                continue;
            }
            $picks = $DB->get_fieldset_select(
                'local_oksigeniaclasstools_picks',
                'timecreated',
                'courseid = ? AND userid = ?',
                [$context->instanceid, $userid]
            );
            if ($picks) {
                writer::with_context($context)->export_data(
                    [get_string('pluginname', 'local_oksigeniaclasstools')],
                    (object) ['picks' => array_map(fn($t) => transform::datetime($t), $picks)]
                );
            }
            $kept = $DB->get_records('local_oksigeniaclasstools_state', ['courseid' => $context->instanceid, 'userid' => $userid]);
            foreach ($kept as $row) {
                writer::with_context($context)->export_data(
                    [get_string('pluginname', 'local_oksigeniaclasstools'), $row->tool],
                    (object) ['data' => json_decode($row->data), 'timemodified' => transform::datetime($row->timemodified)]
                );
            }
        }
    }

    /**
     * Deletes the picks of a course.
     *
     * @param \context $context
     */
    public static function delete_data_for_all_users_in_context(\context $context) {
        global $DB;
        if ($context->contextlevel == CONTEXT_COURSE) {
            $DB->delete_records('local_oksigeniaclasstools_picks', ['courseid' => $context->instanceid]);
            $DB->delete_records('local_oksigeniaclasstools_state', ['courseid' => $context->instanceid]);
        }
    }

    /**
     * Deletes the user's picks; where they picked, no teacher is left.
     *
     * @param approved_contextlist $contextlist
     */
    public static function delete_data_for_user(approved_contextlist $contextlist) {
        global $DB;
        $userid = $contextlist->get_user()->id;
        foreach ($contextlist->get_contexts() as $context) {
            if ($context->contextlevel != CONTEXT_COURSE) {
                continue;
            }
            $DB->delete_records('local_oksigeniaclasstools_picks', ['courseid' => $context->instanceid, 'userid' => $userid]);
            $DB->set_field(
                'local_oksigeniaclasstools_picks',
                'teacherid',
                0,
                ['courseid' => $context->instanceid, 'teacherid' => $userid]
            );
            $DB->delete_records('local_oksigeniaclasstools_state', ['courseid' => $context->instanceid, 'userid' => $userid]);
        }
    }

    /**
     * Deletes the picks of several users in a course.
     *
     * @param approved_userlist $userlist
     */
    public static function delete_data_for_users(approved_userlist $userlist) {
        global $DB;
        $context = $userlist->get_context();
        if ($context->contextlevel != CONTEXT_COURSE || !$userlist->get_userids()) {
            return;
        }
        [$insql, $params] = $DB->get_in_or_equal($userlist->get_userids(), SQL_PARAMS_NAMED);
        $params['courseid'] = $context->instanceid;
        $DB->delete_records_select('local_oksigeniaclasstools_picks', "courseid = :courseid AND userid $insql", $params);
        $DB->execute(
            "UPDATE {local_oksigeniaclasstools_picks} SET teacherid = 0 WHERE courseid = :courseid AND teacherid $insql",
            $params
        );
        $DB->delete_records_select('local_oksigeniaclasstools_state', "courseid = :courseid AND userid $insql", $params);
    }
}
