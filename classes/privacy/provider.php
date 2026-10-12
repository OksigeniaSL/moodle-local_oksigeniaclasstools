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
use local_oksigeniaclasstools\local\quizimages;
use local_oksigeniaclasstools\local\remote;

/**
 * Stores the picks (who was picked and when), what each teacher keeps of each tool in each course, the live sessions,
 * the pictures of the quiz questions and each teacher's fixed remote (in their user context).
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
        $collection->add_database_table('local_oksigeniaclasstools_uses', [
            'userid' => 'privacy:metadata:uses:userid',
            'courseid' => 'privacy:metadata:uses:courseid',
            'cromo' => 'privacy:metadata:uses:cromo',
            'day' => 'privacy:metadata:uses:day',
            'timecreated' => 'privacy:metadata:uses:timecreated',
        ], 'privacy:metadata:uses');
        $collection->add_database_table('local_oksigeniaclasstools_learnt', [
            'userid' => 'privacy:metadata:learnt:userid',
            'courseid' => 'privacy:metadata:learnt:courseid',
            'cromo' => 'privacy:metadata:learnt:cromo',
            'timecreated' => 'privacy:metadata:learnt:timecreated',
        ], 'privacy:metadata:learnt');
        $collection->add_database_table('local_oksigeniaclasstools_live', [
            'courseid' => 'privacy:metadata:live:courseid',
            'userid' => 'privacy:metadata:live:userid',
            'timecreated' => 'privacy:metadata:live:timecreated',
        ], 'privacy:metadata:live');
        $collection->add_database_table('local_oksigeniaclasstools_livein', [
            'userid' => 'privacy:metadata:livein:userid',
            'team' => 'privacy:metadata:livein:team',
            'answer' => 'privacy:metadata:livein:answer',
            'timecreated' => 'privacy:metadata:livein:timecreated',
        ], 'privacy:metadata:livein');
        // Boards shared with a class are course content (a folder); its students get a Moodle notification.
        $collection->add_subsystem_link('core_message', [], 'privacy:metadata:core_message');
        // The pictures of the quiz questions, kept for the teacher who put them.
        $collection->add_subsystem_link('core_files', [], 'privacy:metadata:core_files');
        $collection->add_database_table('local_oksigeniaclasstools_remote', [
            'userid' => 'privacy:metadata:remote:userid',
            'token' => 'privacy:metadata:remote:token',
            'enabled' => 'privacy:metadata:remote:enabled',
            'timecreated' => 'privacy:metadata:remote:timecreated',
        ], 'privacy:metadata:remote');
        if (class_exists('\\core_ai\\manager')) {
            $collection->add_subsystem_link('core_ai', [], 'privacy:metadata:core_ai');
        }
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
        $contextlist->add_from_sql(
            'SELECT ctx.id
               FROM {context} ctx
               JOIN {local_oksigeniaclasstools_uses} u ON u.courseid = ctx.instanceid AND ctx.contextlevel = :level
              WHERE u.userid = :userid',
            ['level' => CONTEXT_COURSE, 'userid' => $userid]
        );
        $contextlist->add_from_sql(
            'SELECT ctx.id
               FROM {context} ctx
               JOIN {local_oksigeniaclasstools_learnt} l ON l.courseid = ctx.instanceid AND ctx.contextlevel = :level
              WHERE l.userid = :userid',
            ['level' => CONTEXT_COURSE, 'userid' => $userid]
        );
        $contextlist->add_from_sql(
            'SELECT ctx.id
                                      FROM {context} ctx
                                      JOIN {local_oksigeniaclasstools_live} l
                                           ON l.courseid = ctx.instanceid AND ctx.contextlevel = :level
                                 LEFT JOIN {local_oksigeniaclasstools_livein} li ON li.liveid = l.id AND li.userid = :student
                                     WHERE l.userid = :teacher OR li.id IS NOT NULL',
            ['level' => CONTEXT_COURSE, 'student' => $userid, 'teacher' => $userid]
        );
        $contextlist->add_from_sql(
            "SELECT DISTINCT f.contextid
               FROM {files} f
              WHERE f.component = 'local_oksigeniaclasstools' AND f.filearea = :area AND f.itemid = :userid
                    AND f.filename <> '.'",
            ['area' => quizimages::AREA, 'userid' => $userid]
        );
        $contextlist->add_from_sql(
            'SELECT ctx.id
               FROM {context} ctx
               JOIN {local_oksigeniaclasstools_remote} r ON r.userid = ctx.instanceid AND ctx.contextlevel = :level
              WHERE r.userid = :userid',
            ['level' => CONTEXT_USER, 'userid' => $userid]
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
        if ($context->contextlevel == CONTEXT_USER) {
            $userlist->add_from_sql(
                'userid',
                'SELECT userid FROM {local_oksigeniaclasstools_remote} WHERE userid = :userid',
                ['userid' => $context->instanceid]
            );
            return;
        }
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
        $userlist->add_from_sql(
            'userid',
            'SELECT userid FROM {local_oksigeniaclasstools_uses} WHERE courseid = :courseid',
            $params
        );
        $userlist->add_from_sql(
            'userid',
            'SELECT userid FROM {local_oksigeniaclasstools_learnt} WHERE courseid = :courseid',
            $params
        );
        $userlist->add_from_sql(
            'userid',
            'SELECT userid FROM {local_oksigeniaclasstools_live} WHERE courseid = :courseid',
            $params
        );
        $userlist->add_from_sql(
            'userid',
            'SELECT li.userid
               FROM {local_oksigeniaclasstools_livein} li
               JOIN {local_oksigeniaclasstools_live} l ON l.id = li.liveid
              WHERE l.courseid = :courseid AND li.userid > 0',
            $params
        );
        $userlist->add_from_sql(
            'itemid',
            "SELECT itemid FROM {files}
              WHERE contextid = :contextid AND component = 'local_oksigeniaclasstools' AND filearea = :area AND filename <> '.'",
            ['contextid' => $context->id, 'area' => quizimages::AREA]
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
            // The fixed remote: whether there is one and since when (its key is not exported).
            if ($context->contextlevel == CONTEXT_USER && (int) $context->instanceid === (int) $userid) {
                $row = remote::get((int) $userid);
                if ($row) {
                    writer::with_context($context)->export_data(
                        [get_string('privacy:remote', 'local_oksigeniaclasstools')],
                        (object) [
                            'enabled' => transform::yesno($row->enabled),
                            'timecreated' => transform::datetime($row->timecreated),
                        ]
                    );
                }
                continue;
            }
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
            // The real uses of the tools kept for their stickers: the days of each one.
            $where = ['courseid' => $context->instanceid, 'userid' => $userid];
            $uses = $DB->get_records('local_oksigeniaclasstools_uses', $where, 'day');
            if ($uses) {
                $bycromo = [];
                foreach ($uses as $use) {
                    $bycromo[$use->cromo][] = transform::date($use->timecreated);
                }
                $path = [
                    get_string('pluginname', 'local_oksigeniaclasstools'),
                    get_string('privacy:uses', 'local_oksigeniaclasstools'),
                ];
                writer::with_context($context)->export_data($path, (object) ['uses' => $bycromo]);
            }
            // The stickers learned in the guided helps opened in this course.
            $learnt = $DB->get_records('local_oksigeniaclasstools_learnt', $where, 'timecreated');
            if ($learnt) {
                $path = [
                    get_string('pluginname', 'local_oksigeniaclasstools'),
                    get_string('privacy:learnt', 'local_oksigeniaclasstools'),
                ];
                $list = array_map(fn($l) => ['cromo' => $l->cromo, 'timecreated' => transform::datetime($l->timecreated)], $learnt);
                writer::with_context($context)->export_data($path, (object) ['learnt' => array_values($list)]);
            }
            // Live sessions: the ones they opened, and what they answered in the others.
            $opened = $DB->get_records(
                'local_oksigeniaclasstools_live',
                ['courseid' => $context->instanceid, 'userid' => $userid],
                'timecreated',
                'id, kind, timecreated'
            );
            $answers = $DB->get_records_sql(
                'SELECT li.id, l.kind, li.round, li.team, li.answer, li.timecreated
                   FROM {local_oksigeniaclasstools_livein} li
                   JOIN {local_oksigeniaclasstools_live} l ON l.id = li.liveid
                  WHERE l.courseid = ? AND li.userid = ? AND li.round > 0
               ORDER BY li.timecreated',
                [$context->instanceid, $userid]
            );
            writer::with_context($context)->export_area_files(
                [get_string('pluginname', 'local_oksigeniaclasstools'), quizimages::AREA],
                'local_oksigeniaclasstools',
                quizimages::AREA,
                $userid
            );
            if ($opened || $answers) {
                writer::with_context($context)->export_data(
                    [get_string('pluginname', 'local_oksigeniaclasstools'), get_string('live', 'local_oksigeniaclasstools')],
                    (object) [
                        'opened' => array_values(array_map(fn($l) => ['kind' => $l->kind,
                            'timecreated' => transform::datetime($l->timecreated)], $opened)),
                        'answers' => array_values(array_map(fn($a) => ['kind' => $a->kind, 'round' => $a->round,
                            'team' => $a->team, 'answer' => $a->answer,
                            'time' => transform::datetime((int) floor($a->timecreated / 1000))], $answers)),
                    ]
                );
            }
        }
    }

    /**
     * Deletes live sessions of a course: all of them, or those of some users (the sessions they opened and their
     * answers in the others).
     *
     * @param int $courseid
     * @param int[]|null $userids
     */
    private static function delete_live(int $courseid, ?array $userids): void {
        global $DB;
        $ids = $DB->get_fieldset_select('local_oksigeniaclasstools_live', 'id', 'courseid = ?', [$courseid]);
        if (!$ids) {
            return;
        }
        [$inlive, $liveparams] = $DB->get_in_or_equal($ids);
        if ($userids === null) {
            $DB->delete_records_select('local_oksigeniaclasstools_livein', "liveid $inlive", $liveparams);
            $DB->delete_records_select('local_oksigeniaclasstools_live', "id $inlive", $liveparams);
            return;
        }
        [$inuser, $userparams] = $DB->get_in_or_equal($userids);
        $DB->delete_records_select(
            'local_oksigeniaclasstools_livein',
            "liveid $inlive AND userid $inuser",
            array_merge($liveparams, $userparams)
        );
        $theirs = $DB->get_fieldset_select(
            'local_oksigeniaclasstools_live',
            'id',
            "courseid = ? AND userid $inuser",
            array_merge([$courseid], $userparams)
        );
        if ($theirs) {
            [$in, $params] = $DB->get_in_or_equal($theirs);
            $DB->delete_records_select('local_oksigeniaclasstools_livein', "liveid $in", $params);
            $DB->delete_records_select('local_oksigeniaclasstools_live', "id $in", $params);
        }
    }

    /**
     * Deletes the picks of a course.
     *
     * @param \context $context
     */
    public static function delete_data_for_all_users_in_context(\context $context) {
        global $DB;
        if ($context->contextlevel == CONTEXT_USER) {
            remote::delete((int) $context->instanceid);
        }
        if ($context->contextlevel == CONTEXT_COURSE) {
            $DB->delete_records('local_oksigeniaclasstools_picks', ['courseid' => $context->instanceid]);
            $DB->delete_records('local_oksigeniaclasstools_state', ['courseid' => $context->instanceid]);
            $DB->delete_records('local_oksigeniaclasstools_uses', ['courseid' => $context->instanceid]);
            $DB->delete_records('local_oksigeniaclasstools_learnt', ['courseid' => $context->instanceid]);
            self::delete_live((int) $context->instanceid, null);
            get_file_storage()->delete_area_files($context->id, 'local_oksigeniaclasstools', quizimages::AREA);
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
            if ($context->contextlevel == CONTEXT_USER && (int) $context->instanceid === (int) $userid) {
                remote::delete((int) $userid);
                continue;
            }
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
            $DB->delete_records('local_oksigeniaclasstools_uses', ['courseid' => $context->instanceid, 'userid' => $userid]);
            $DB->delete_records('local_oksigeniaclasstools_learnt', ['courseid' => $context->instanceid, 'userid' => $userid]);
            self::delete_live((int) $context->instanceid, [$userid]);
            get_file_storage()->delete_area_files($context->id, 'local_oksigeniaclasstools', quizimages::AREA, $userid);
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
        if ($context->contextlevel == CONTEXT_USER && in_array($context->instanceid, $userlist->get_userids())) {
            remote::delete((int) $context->instanceid);
            return;
        }
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
        $DB->delete_records_select('local_oksigeniaclasstools_uses', "courseid = :courseid AND userid $insql", $params);
        $DB->delete_records_select('local_oksigeniaclasstools_learnt', "courseid = :courseid AND userid $insql", $params);
        self::delete_live((int) $context->instanceid, $userlist->get_userids());
        foreach ($userlist->get_userids() as $userid) {
            get_file_storage()->delete_area_files($context->id, 'local_oksigeniaclasstools', quizimages::AREA, $userid);
        }
    }
}
