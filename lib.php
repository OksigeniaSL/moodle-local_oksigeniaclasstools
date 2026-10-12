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
 * Library functions: the data the classroom screen needs for a course.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/** Screen modes, from the youngest: one at a time, chosen per course (they change the look and the games' defaults). */
const LOCAL_OKSIGENIACLASSTOOLS_MODES = ['early', 'primary', 'secondary', 'advanced'];

/** School levels with built-in sets in the games, from the youngest. */
const LOCAL_OKSIGENIACLASSTOOLS_LEVELS = ['early', 'primary', 'secondary', 'upper', 'higher'];

/** The tabs of the board, with the string of their name; the administrator chooses which ones the site shows. */
const LOCAL_OKSIGENIACLASSTOOLS_TOOLS = [
    'temporizador' => 'app_tab_timer', 'cronometro' => 'app_tab_stopwatch', 'quien' => 'app_tab_picker',
    'grupos' => 'app_tab_groups', 'semaforo' => 'app_tab_noise', 'azar' => 'app_tab_chance', 'juegos' => 'app_tab_games',
    'material' => 'app_tab_materials', 'pizarra' => 'app_tab_board', 'marcador' => 'app_tab_scoreboard',
    'asi' => 'app_tab_rules', 'reloj' => 'app_tab_clock', 'qr' => 'app_tab_qr', 'envivo' => 'app_tab_live',
];

/** The games, with the string of their name. */
const LOCAL_OKSIGENIACLASSTOOLS_GAMES = [
    'rosco' => 'app_ro_name', 'simon' => 'app_si_name', 'ahorcado' => 'app_ah_name', 'palabra' => 'app_wo_name',
    'parejas' => 'app_me_pairs', 'codigo' => 'app_lock_name', 'ordenar' => 'app_ord_name', 'clasificar' => 'app_so_name',
    'errores' => 'app_er_name', 'quiensoy' => 'app_wa_name', 'eco' => 'app_ec_name',
];

/** The materials, with the string of their name. */
const LOCAL_OKSIGENIACLASSTOOLS_MATERIALS = [
    'rods' => 'app_mt_rods', 'tangram' => 'app_mt_tangram', 'line' => 'app_mt_line', 'fractions' => 'app_mt_fractions',
    'geoboard' => 'app_mt_geoboard', 'base10' => 'app_mt_base10', 'balanza' => 'app_mt_balance', 'plano' => 'app_mt_plane',
    'calc' => 'app_mt_calc', 'score' => 'app_mt_score', 'tiempo' => 'app_mt_timeline', 'cuerpos' => 'app_mt_solids',
];

/** Tools a student sees when the site opens the board to students (none uses data of the class). */
const LOCAL_OKSIGENIACLASSTOOLS_STUDENT_TOOLS = [
    'temporizador', 'cronometro', 'azar', 'juegos', 'material', 'pizarra', 'reloj', 'qr',
];

/**
 * How the board opens in a course for the current user: for teaching (with the lists of the class), for students
 * (limited, only if the site allows it: no names, photos, picks or groups, and nothing saved), or not at all.
 *
 * @param context_course $context
 * @return string|null 'teacher', 'student' or null.
 */
function local_oksigeniaclasstools_mode(context_course $context): ?string {
    if (has_capability('local/oksigeniaclasstools:use', $context)) {
        return 'teacher';
    }
    if (
        get_config('local_oksigeniaclasstools', 'students') && isloggedin() && !isguestuser()
            && (is_enrolled($context, null, '', true) || is_viewing($context))
    ) {
        return 'student';
    }
    return null;
}

/**
 * Screen data for a student: the course and the way back, and no data of the class.
 *
 * @param stdClass $course
 * @param context_course $context
 * @return array
 */
function local_oksigeniaclasstools_student_data(stdClass $course, context_course $context): array {
    return [
        'course' => format_string($course->fullname, true, ['context' => $context, 'escape' => false]),
        'back' => (new moodle_url('/course/view.php', ['id' => $course->id]))->out(false),
        'lists' => [],
        'courseid' => (int) $course->id,
        'mode' => 'student',
        'tools' => LOCAL_OKSIGENIACLASSTOOLS_STUDENT_TOOLS,
    ];
}

/**
 * The students the current user may pick or put in teams: everyone, or with separate groups (and without «access all
 * groups»), only the members of their own groups.
 *
 * @param stdClass $course
 * @param context_course $context
 * @return int[]|null User ids, or null for everyone.
 */
function local_oksigeniaclasstools_visible_userids(stdClass $course, context_course $context): ?array {
    global $USER;
    if (has_capability('moodle/site:accessallgroups', $context) || groups_get_course_groupmode($course) != SEPARATEGROUPS) {
        return null;
    }
    $ids = [];
    foreach (groups_get_all_groups($course->id, $USER->id) as $group) {
        $ids = array_merge($ids, array_keys(groups_get_members($group->id, 'u.id')));
    }
    return array_values(array_unique(array_map('intval', $ids)));
}

/**
 * Moodle 4.3 has no navigation hooks: there the link goes in the course navigation (it shows in its «More» menu).
 * From 4.4 on the hooks in classes/hook_callbacks.php put it next to «Settings», and this does nothing.
 *
 * @param navigation_node $parentnode
 * @param stdClass $course
 * @param context_course $context
 */
function local_oksigeniaclasstools_extend_navigation_course(
    navigation_node $parentnode,
    stdClass $course,
    context_course $context
): void {
    if (class_exists('\\core\\hook\\navigation\\secondary_extend') || !local_oksigeniaclasstools_mode($context)) {
        return;
    }
    $parentnode->add(
        get_string('navlabel', 'local_oksigeniaclasstools'),
        new moodle_url('/local/oksigeniaclasstools/index.php', ['id' => $course->id]),
        navigation_node::TYPE_CUSTOM,
        null,
        'local_oksigeniaclasstools',
        new pix_icon('i/group', '')
    );
}

/**
 * Moodle 4.3 has no output hooks: there the notice of a live session goes in through this callback. From 4.4 on the
 * hook in classes/hook_callbacks.php adds it, and this does nothing.
 *
 * @return string
 */
function local_oksigeniaclasstools_before_standard_top_of_body_html(): string {
    if (class_exists('\\core\\hook\\output\\before_standard_top_of_body_html_generation')) {
        return '';
    }
    return \local_oksigeniaclasstools\local\notice::html();
}

/**
 * The surnames in a last name, each with its initial: «de la Rosa Báez» is «de la Rosa» (R) and «Báez» (B).
 *
 * Particles (de, del, la, van, von, da, san…) go with the word after them, a hyphen joins (García-Pelayo is one), and
 * «y» or «i» between two surnames only separates them (Ortega y Gasset: Ortega and Gasset).
 *
 * @param string $lastname
 * @return array[] Each one with name and initial.
 */
function local_oksigeniaclasstools_surnames(string $lastname): array {
    $particles = ['de', 'del', 'la', 'las', 'los', 'lo', 'el', 'da', 'das', 'do', 'dos', 'di', 'du', 'van', 'von', 'der',
        'den', 'ter', 'le', 'les', 'della', 'dei', 'degli', 'dalla', 'al', 'bin', 'ben', 'mac', 'san', 'santa', 'st'];
    $separators = ['y', 'i', 'e'];
    $surnames = [];
    $pending = [];
    foreach (preg_split('/\s+/u', trim($lastname), -1, PREG_SPLIT_NO_EMPTY) as $word) {
        $lower = core_text::strtolower($word);
        if (in_array($lower, $separators, true) && $surnames && !$pending) {
            continue;
        }
        if (in_array($lower, $particles, true)) {
            $pending[] = $word;
            continue;
        }
        $surnames[] = [
            'name' => implode(' ', array_merge($pending, [$word])),
            'initial' => core_text::strtoupper(core_text::substr($word, 0, 1)),
        ];
        $pending = [];
    }
    // Only particles at the end (a surname such as «Le» or «Van»): they are the surname.
    if ($pending) {
        $surnames[] = ['name' => implode(' ', $pending), 'initial' => core_text::strtoupper(core_text::substr($pending[0], 0, 1))];
    }
    return $surnames;
}

/**
 * Screen data for a course: its name, the way back and the lists with each student's name and photo.
 *
 * One list per group and per cohort enrolled with cohort sync (a course with cohorts 5A to 5F gives six lists),
 * sorted by name, and the whole course last. A group and a cohort with the same members or the same name appear
 * once. Separate groups mode is respected for whoever opens the screen: only their own groups, and no list at all
 * if they are in none.
 *
 * @param stdClass $course
 * @param context_course $context
 * @return array
 */
function local_oksigeniaclasstools_data(stdClass $course, context_course $context): array {
    global $DB, $USER, $PAGE;

    $namestyle = get_config('local_oksigeniaclasstools', 'namestyle') ?: 'firstsurname';
    $displayname = function (stdClass $user) use ($namestyle): string {
        if ($namestyle === 'full') {
            return fullname($user);
        }
        if ($namestyle === 'first') {
            return trim($user->firstname);
        }
        $surnames = local_oksigeniaclasstools_surnames($user->lastname);
        if ($namestyle === 'initials') {
            return trim($user->firstname . ' ' . implode('', array_column($surnames, 'initial')));
        }
        return trim($user->firstname . ' ' . ($surnames[0]['name'] ?? ''));
    };

    // Picks in this course during the last days (fair picking and participation).
    $days = max(1, (int) (get_config('local_oksigeniaclasstools', 'days') ?: 90));
    $picks = \local_oksigeniaclasstools\local\picks::counts($course->id, $days);

    // Students: users shown in completion reports (the student role), active enrolments only.
    $students = [];
    $enrolled = get_enrolled_users(
        $context,
        'moodle/course:isincompletionreports',
        0,
        'u.*',
        'u.firstname, u.lastname',
        0,
        0,
        true
    );
    foreach ($enrolled as $user) {
        $student = ['n' => $displayname($user), 'i' => (int) $user->id, 'v' => (int) ($picks[$user->id] ?? 0)];
        if ($user->picture) {
            $picture = new user_picture($user);
            $picture->size = 200; // The large one (f3).
            $student['f'] = $picture->get_url($PAGE)->out(false);
        }
        $students[(int) $user->id] = $student;
    }

    $classes = [];
    $add = function (string $id, string $name, array $userids) use ($students, &$classes): void {
        $members = array_intersect_key($students, array_flip(array_map('intval', $userids)));
        $key = implode(',', array_keys($members));
        $repeated = in_array($key, array_column($classes, 'key'), true)
            || in_array(core_text::strtolower($name), array_map('core_text::strtolower', array_column($classes, 'name')), true);
        if ($members && !$repeated) {
            $classes[] = ['id' => $id, 'name' => $name, 'students' => array_values($members), 'key' => $key];
        }
    };

    $accessall = has_capability('moodle/site:accessallgroups', $context);
    $separate = !$accessall && groups_get_course_groupmode($course) == SEPARATEGROUPS;
    $groups = groups_get_all_groups($course->id, $separate ? $USER->id : 0);
    // Teams saved from the board are not classes: they are not offered as lists.
    $saved = $DB->get_fieldset_sql(
        'SELECT gg.groupid
                                      FROM {groupings_groups} gg
                                      JOIN {groupings} g ON g.id = gg.groupingid
                                     WHERE g.courseid = ? AND ' . $DB->sql_like('g.idnumber', '?'),
        [$course->id, \local_oksigeniaclasstools\local\teams::GROUPING_PREFIX . '%']
    );
    foreach (array_diff_key($groups, array_flip($saved)) as $group) {
        $add(
            'g' . $group->id,
            format_string($group->name, true, ['context' => $context, 'escape' => false]),
            array_keys(groups_get_members($group->id, 'u.id'))
        );
    }
    if (!$separate) {
        // Cohorts enrolled in the course with cohort sync.
        $cohorts = $DB->get_records_sql(
            "SELECT DISTINCT c.id, c.name, c.contextid
                                           FROM {enrol} e
                                           JOIN {cohort} c ON c.id = e.customint1
                                          WHERE e.courseid = :courseid AND e.enrol = 'cohort' AND e.status = :enabled",
            ['courseid' => $course->id, 'enabled' => ENROL_INSTANCE_ENABLED]
        );
        foreach ($cohorts as $cohort) {
            $add(
                'h' . $cohort->id,
                format_string($cohort->name, true, ['context' => context::instance_by_id($cohort->contextid), 'escape' => false]),
                $DB->get_fieldset_select('cohort_members', 'userid', 'cohortid = ?', [$cohort->id])
            );
        }
    }
    usort($classes, fn($a, $b) => strnatcasecmp($a['name'], $b['name']));
    $lists = array_map(fn($class) => array_diff_key($class, ['key' => 0]), $classes);
    // With separate groups, only the teacher's own groups (like the participants page); never the whole course.
    if (!$separate) {
        $lists[] = ['id' => 'c' . $course->id,
            'name' => get_string($classes ? 'wholecourse' : 'wholeclass', 'local_oksigeniaclasstools'),
            'students' => array_values($students)];
    }

    // The teacher who opens the board, to join the lists when they want to play too (never recorded as a pick).
    $me = ['n' => $displayname($USER), 'i' => (int) $USER->id];
    if (!empty($USER->picture)) {
        $picture = new user_picture($USER);
        $picture->size = 200;
        $me['f'] = $picture->get_url($PAGE)->out(false);
    }

    // What this teacher keeps of each tool in this course.
    $state = \local_oksigeniaclasstools\local\kept::all($course->id, $USER->id);

    return [
        'course' => format_string($course->fullname, true, ['context' => $context, 'escape' => false]),
        'back' => (new moodle_url('/course/view.php', ['id' => $course->id]))->out(false),
        'lists' => $lists,
        'courseid' => (int) $course->id,
        'mode' => 'teacher',
        'me' => $me,
        'sesskey' => sesskey(),
        'days' => $days,
        'pickurl' => (new moodle_url('/local/oksigeniaclasstools/pick.php'))->out(false),
        'state' => (object) $state,
        'stateurl' => (new moodle_url('/local/oksigeniaclasstools/state.php'))->out(false),
        'groupsurl' => has_capability('moodle/course:managegroups', $context)
            ? (new moodle_url('/local/oksigeniaclasstools/savegroups.php'))->out(false) : null,
        // Sharing a board saves it in the course: only for who can add content to it.
        'boardurl' => has_capability('moodle/course:manageactivities', $context)
            ? (new moodle_url('/local/oksigeniaclasstools/board.php'))->out(false) : null,
        // Live sessions (votes, buzzers, the phone as a remote), unless the site turns them off.
        'liveurl' => get_config('local_oksigeniaclasstools', 'live') !== '0'
            ? (new moodle_url('/local/oksigeniaclasstools/livehost.php'))->out(false) : null,
        // The teacher's fixed remote (with live sessions): where the board asks for its orders, and whether it is on.
        'remoteurl' => get_config('local_oksigeniaclasstools', 'live') !== '0'
            ? (new moodle_url('/local/oksigeniaclasstools/remote.php'))->out(false) : null,
        'remote' => \local_oksigeniaclasstools\local\remote::status((int) $USER->id),
        // The teacher's stickers: where real uses go, what makes a use real, and the level of each sticker now.
        'logrosurl' => \local_oksigeniaclasstools\local\logros::on()
            ? (new moodle_url('/local/oksigeniaclasstools/logros.php'))->out(false) : null,
        // The teachers' room, a tap away from the board.
        'salaurl' => \local_oksigeniaclasstools\local\sala::on()
            ? (new moodle_url('/local/oksigeniaclasstools/sala.php'))->out(false) : null,
        'logros' => \local_oksigeniaclasstools\local\logros::on() ? [
            'thr' => \local_oksigeniaclasstools\local\logros::thresholds(),
            'learned' => \local_oksigeniaclasstools\local\logros::learned((int) $USER->id),
            'levels' => (object) array_map(
                fn($days) => \local_oksigeniaclasstools\local\logros::level($days),
                \local_oksigeniaclasstools\local\logros::days((int) $USER->id)
            ),
        ] : null,
        // Questions of the Moodle question bank for a quiz (multiple choice with one answer, true/false).
        'bankurl' => (new moodle_url('/local/oksigeniaclasstools/quizbank.php'))->out(false),
        // Words from the glossaries of the course for the word games (concept and a clue from its definition).
        'glossaryurl' => (new moodle_url('/local/oksigeniaclasstools/glossary.php'))->out(false),
        // The AI of the site writing exercises, when there is one and the teacher can use it.
        'aiurl' => \local_oksigeniaclasstools\local\ai::available($context)
            ? (new moodle_url('/local/oksigeniaclasstools/ai.php'))->out(false) : null,
        // The pictures of the quiz questions: where they are sent, and where the teacher's are served from.
        'quizimgurl' => (new moodle_url('/local/oksigeniaclasstools/quizimage.php'))->out(false),
        'quizimg' => \local_oksigeniaclasstools\local\quizimages::base($context, (int) $USER->id),
    ];
}

/**
 * What the screen shows of the site itself, also outside a course: its icon for the middle of the QR codes (the
 * favicon, or the compact logo if the favicon is an .ico, which looks blurred when enlarged), the school levels
 * whose built-in sets are offered, the time zone and language, and the board's texts in that language.
 *
 * @return array
 */
function local_oksigeniaclasstools_site(): array {
    global $OUTPUT;
    $logo = $OUTPUT->favicon()->out(false);
    if (preg_match('/\.ico(\?|$)/i', $logo) && ($compact = $OUTPUT->get_compact_logo_url(300, 300))) {
        $logo = $compact->out(false);
    }
    // Not saved yet (before the settings page is first stored): all levels.
    $levels = get_config('local_oksigeniaclasstools', 'levels');
    $levels = $levels === false ? LOCAL_OKSIGENIACLASSTOOLS_LEVELS : array_values(array_filter(explode(',', $levels)));
    // The screen mode a course starts in, until the teacher chooses another (the course's own, by its category, is
    // set when the board opens in a course).
    $mode = local_oksigeniaclasstools_default_mode();
    // The tools, games and materials the site shows (all until the administrator chooses).
    $chosen = function (string $name, array $all): array {
        $value = get_config('local_oksigeniaclasstools', $name);
        return $value === false ? array_keys($all) : array_values(array_intersect(array_keys($all), explode(',', $value)));
    };
    // The board's texts («app_» strings), in the user's language with English for anything missing.
    $str = [];
    foreach (get_string_manager()->load_component_strings('local_oksigeniaclasstools', current_language()) as $key => $text) {
        if (strpos($key, 'app_') === 0) {
            $str[substr($key, 4)] = $text;
        }
    }
    return [
        // The site's front page sends each user on to their home page (Dashboard, My courses…): the way back when the
        // board is open without a course.
        'home' => (new moodle_url('/'))->out(false),
        'logo' => $logo,
        'levels' => $levels,
        'mode' => $mode,
        'tools' => $chosen('tools', LOCAL_OKSIGENIACLASSTOOLS_TOOLS),
        'games' => $chosen('games', LOCAL_OKSIGENIACLASSTOOLS_GAMES),
        'materials' => $chosen('materials', LOCAL_OKSIGENIACLASSTOOLS_MATERIALS),
        'tz' => core_date::get_user_timezone(),
        'lang' => current_language(),
        'str' => (object) $str,
    ];
}

/**
 * Whether the user teaches with the board: in a course, if it opens for teaching; without a course, if they may use it
 * in any of their courses (or anywhere on the site).
 *
 * @param array|null $data The screen data of the course, or null without a course.
 * @return bool
 */
function local_oksigeniaclasstools_teaches(?array $data): bool {
    if ($data !== null) {
        return ($data['mode'] ?? '') === 'teacher';
    }
    if (has_capability('local/oksigeniaclasstools:use', context_system::instance())) {
        return true;
    }
    foreach (enrol_get_my_courses(['id']) as $course) {
        if (has_capability('local/oksigeniaclasstools:use', context_course::instance($course->id))) {
            return true;
        }
    }
    return false;
}

/**
 * The content pack of the board for a language: its own (es_mx), its parent language (es), the base language, or
 * English. Portuguese of Portugal takes the Brazilian one.
 *
 * @param string $lang Moodle language code.
 * @return string File name in app/content.
 */
function local_oksigeniaclasstools_content_file(string $lang): string {
    if (!preg_match('/^[a-z]+(_[a-z]+)*$/', $lang)) {
        return 'en.js';
    }
    $candidates = [$lang];
    if ($parent = get_parent_language($lang)) {
        $candidates[] = $parent;
    }
    $candidates[] = strtok($lang, '_');
    $candidates[] = ['pt' => 'pt_br'][strtok($lang, '_')] ?? 'en';
    $candidates[] = 'en';
    foreach ($candidates as $code) {
        if (preg_match('/^[a-z]+(_[a-z]+)*$/', $code) && is_readable(__DIR__ . '/app/content/' . $code . '.js')) {
            return $code . '.js';
        }
    }
    return 'en.js';
}

/**
 * «Which class?»: a greeting, the teacher's courses in one grid (in the order of the categories of the site), each with
 * its picture (or the pattern Moodle makes for a course without one), its category, some faces of the class and how
 * many students, and the screen mode when one was chosen (by the teacher there, or for its category); filters by
 * category and stage; the last class used; and the fixed remote.
 *
 * @param stdClass[] $courses The courses where the teacher can use the tools (with id, fullname and category).
 * @return array The context of the template local_oksigeniaclasstools/choose.
 */
function local_oksigeniaclasstools_choose(array $courses): array {
    global $DB, $USER, $OUTPUT, $PAGE;
    $component = 'local_oksigeniaclasstools';
    $chosen = [];
    $used = [];
    if ($courses) {
        [$in, $params] = $DB->get_in_or_equal(array_keys($courses), SQL_PARAMS_NAMED);
        $params += ['userid' => $USER->id];
        // What the teacher keeps of the board in each course: the mode chosen, and when it was last used.
        $rows = $DB->get_records_select(
            'local_oksigeniaclasstools_state',
            "courseid $in AND userid = :userid",
            $params,
            '',
            'id, courseid, tool, data, timemodified'
        );
        foreach ($rows as $row) {
            $used[$row->courseid] = max($used[$row->courseid] ?? 0, (int) $row->timemodified);
            $data = $row->tool === 'settings' ? json_decode((string) $row->data, true) : null;
            if (is_array($data) && in_array($data['mode'] ?? '', LOCAL_OKSIGENIACLASSTOOLS_MODES, true)) {
                $chosen[$row->courseid] = $data['mode'];
            }
        }
    }
    $site = local_oksigeniaclasstools_default_mode();
    $categories = [];
    $cards = [];
    foreach ($courses as $course) {
        $context = context_course::instance($course->id);
        $category = core_course_category::get((int) $course->category, IGNORE_MISSING, true);
        $catid = $category ? (int) $category->id : 0;
        if (!isset($categories[$catid])) {
            $categories[$catid] = ['id' => $catid, 'name' => $category ? $category->get_formatted_name() : '',
                'sort' => $category ? (int) $category->sortorder : 0];
        }
        $bycategory = local_oksigeniaclasstools_default_mode((int) $course->category);
        $mode = $chosen[$course->id] ?? $bycategory;
        // Some faces of the class: those with a picture first; without one, their initials.
        $faces = [];
        $fields = 'u.id, u.picture, u.imagealt, u.email, u.firstname, u.lastname, u.firstnamephonetic, u.lastnamephonetic, '
            . 'u.middlename, u.alternatename';
        $some = get_enrolled_users(
            $context,
            'moodle/course:isincompletionreports',
            0,
            $fields,
            'u.picture DESC, u.firstname ASC',
            0,
            4,
            true
        );
        foreach ($some as $user) {
            if ($user->picture) {
                $picture = new user_picture($user);
                $picture->size = 64;
                $faces[] = ['src' => $picture->get_url($PAGE)->out(false)];
            } else {
                $initials = core_text::substr($user->firstname, 0, 1) . core_text::substr($user->lastname, 0, 1);
                $faces[] = ['initials' => core_text::strtoupper($initials)];
            }
        }
        $students = count_enrolled_users($context, 'moodle/course:isincompletionreports', 0, true);
        $label = $students === 1 ? 'choose_student' : 'choose_students';
        $image = \core_course\external\course_summary_exporter::get_course_image($course);
        $cards[] = [
            'url' => (new moodle_url('/local/oksigeniaclasstools/index.php', ['id' => $course->id]))->out(false),
            'name' => format_string($course->fullname, true, ['context' => $context]),
            'category' => $categories[$catid]['name'],
            'categoryid' => $catid,
            'image' => $image ?: $OUTPUT->get_generated_image_for_id($course->id),
            'mode' => $mode,
            // The tag only when the mode was chosen (by the teacher, or for the category), not the site's for all.
            'modename' => isset($chosen[$course->id]) || $bycategory !== $site ? get_string('mode_' . $mode, $component) : '',
            'students' => get_string($label, $component, $students),
            'faces' => $faces,
            'sort' => [$categories[$catid]['sort'], core_text::strtolower($course->fullname)],
            'used' => $used[$course->id] ?? 0,
        ];
    }
    usort($cards, fn($a, $b) => $a['sort'] <=> $b['sort']);
    uasort($categories, fn($a, $b) => $a['sort'] <=> $b['sort']);
    // A teacher can have classes in more than one stage (Early years and Primary, Primary and Secondary): then one
    // button per stage to see only its courses.
    $modes = array_unique(array_column($cards, 'mode'));
    $stages = [];
    foreach (LOCAL_OKSIGENIACLASSTOOLS_MODES as $mode) {
        if (in_array($mode, $modes, true)) {
            $stages[] = ['mode' => $mode, 'name' => get_string('mode_' . $mode, $component)];
        }
    }
    $last = null;
    foreach ($cards as $card) {
        if ($card['used'] && (!$last || $card['used'] > $last['used'])) {
            $last = $card;
        }
    }
    $filters = array_values(array_map(fn($c) => ['id' => $c['id'], 'name' => $c['name']], $categories));
    $album = local_oksigeniaclasstools_album((int) $USER->id);
    $hour = (int) userdate(time(), '%H');
    $hello = $hour < 14 ? 'choose_hello_morning' : ($hour < 21 ? 'choose_hello_afternoon' : 'choose_hello_evening');
    $remote = get_config($component, 'live') !== '0' ? \local_oksigeniaclasstools\local\remote::status((int) $USER->id) : null;
    return [
        'hello' => get_string($hello, $component, format_string($USER->firstname)),
        'date' => userdate(time(), get_string('strftimedaydate', 'langconfig')),
        'search' => count($cards) > 8,
        'categories' => count($categories) > 1 ? $filters : [],
        'stages' => count($stages) > 1 ? $stages : [],
        'courses' => array_map(function ($card) {
            unset($card['sort'], $card['used']);
            return $card;
        }, $cards),
        'continue' => $last ? ['url' => $last['url'], 'name' => $last['name'], 'image' => $last['image']] : null,
        'standalone' => (new moodle_url('/local/oksigeniaclasstools/index.php', ['standalone' => 1]))->out(false),
        'remote' => $remote ? ['on' => $remote['on'], 'url' => $remote['url'] ?? ''] : null,
        'album' => $album,
        'sala' => $album ? local_oksigeniaclasstools_sala((int) $USER->id) : null,
    ];
}

/**
 * The teachers' room for «Which class?»: whether the teacher is in it, how many are, the span it counts, how many more
 * play, and the teachers in it (name, critter seed and stickers with their level) for the page to draw.
 *
 * @param int $userid
 * @return array|null joined, count, span, others, json, url, sesskey; null when the room is off.
 */
function local_oksigeniaclasstools_sala(int $userid): ?array {
    if (!\local_oksigeniaclasstools\local\sala::on()) {
        return null;
    }
    $view = local_oksigeniaclasstools_sala_view($userid);
    return [
        'joined' => $view['joined'],
        'count' => $view['count'],
        'span' => $view['span'],
        'others' => $view['others'],
        'json' => json_encode(['teachers' => $view['teachers'], 'str' => $view['str']], JSON_UNESCAPED_UNICODE),
        'url' => (new moodle_url('/local/oksigeniaclasstools/sala.php'))->out(false),
        'sesskey' => sesskey(),
    ];
}

/**
 * The teachers' room as a teacher sees it, with its texts: for «Which class?» and for the board.
 *
 * @param int $userid
 * @return array joined, count, span, others (texts), teachers (id, name, me, stickers) and str (the texts of the room)
 */
function local_oksigeniaclasstools_sala_view(int $userid): array {
    $component = 'local_oksigeniaclasstools';
    $room = \local_oksigeniaclasstools\local\sala::room($userid);
    $span = $room['span'];
    if (!$span['inseason']) {
        $when = get_string('sala_weeks_span', $component, $span['weeks']);
    } else {
        $date = userdate($span['from'], get_string('strftimedate', 'langconfig'));
        $when = $span['season'] !== ''
            ? get_string('sala_season_span', $component, (object) ['name' => format_string($span['season']), 'date' => $date])
            : get_string('sala_season_span_noname', $component, $date);
    }
    $others = $room['others'] === 1 ? get_string('sala_others_one', $component)
        : ($room['others'] > 1 ? get_string('sala_others', $component, $room['others']) : '');
    $n = count($room['teachers']);
    $str = [];
    foreach (['you', 'none', 'empty', 'intro', 'join', 'join_note', 'close'] as $key) {
        $str[$key] = get_string('sala_' . $key, $component);
    }
    $str['title'] = get_string('sala', $component);
    return [
        'joined' => $room['joined'],
        'count' => $n ? get_string('sala_count', $component, $n) : get_string('sala_count_none', $component),
        'span' => $when,
        'others' => $others,
        'teachers' => $room['teachers'],
        'str' => $str,
    ];
}

/**
 * «My stickers» for «Which class?»: how many, and what the page needs to draw the album (each sticker with its level,
 * its days, the days for the next level and how to get it, with the thresholds of the site; the weeks of use; and the
 * texts of the stickers).
 *
 * @param int $userid
 * @return array|null got, json; null when the stickers are off.
 */
function local_oksigeniaclasstools_album(int $userid): ?array {
    if (!\local_oksigeniaclasstools\local\logros::on()) {
        return null;
    }
    $component = 'local_oksigeniaclasstools';
    $data = \local_oksigeniaclasstools\local\logros::album($userid);
    $thr = \local_oksigeniaclasstools\local\logros::thresholds();
    $measure = ['sacanombres' => $thr['picks'], 'repartequipos' => $thr['students']];
    $items = [];
    foreach ($data['cromos'] as $c) {
        $family = $c['family'];
        $a = $measure[$c['cromo']] ?? ($family === 'live' ? $thr['devices'] : null);
        $items[] = [
            'cromo' => $c['cromo'],
            'level' => $c['level'],
            'learned' => !empty($c['learned']),
            'days' => $c['days'] === 1 ? get_string('app_cr_day', $component) : get_string('app_cr_days', $component, $c['days']),
            'next' => $c['next'] ? get_string('app_cr_next', $component, $c['next']) : get_string('app_cr_top', $component),
            'how' => get_string('app_cr_' . $c['cromo'] . '_how', $component, $a),
        ];
    }
    // The texts of the stickers and of the album, without the «app_» of the board's strings.
    $str = [];
    foreach (get_string_manager()->load_component_strings($component, current_language()) as $key => $text) {
        if (strpos($key, 'app_cr_') === 0) {
            $str[substr($key, 4)] = $text;
        }
    }
    $weeks = $data['weeks'] >= $data['weeksneeded']
        ? get_string('app_cr_weeks_done', $component, $data['weeks'])
        : get_string('app_cr_weeks', $component, (object) ['n' => $data['weeks'], 'of' => $data['weeksneeded']]);
    return [
        'got' => get_string('app_cr_got', $component, (object) ['got' => $data['got'], 'all' => count($data['cromos'])]),
        'json' => json_encode(['items' => $items, 'weeks' => $weeks, 'str' => $str], JSON_UNESCAPED_UNICODE),
    ];
}

/**
 * The screen mode a course starts in: the one chosen for its category, or for the nearest category above it that has
 * one, or else the site's. The teacher can still choose another in each course.
 *
 * @param int $categoryid The course's category (0 for none).
 * @return string
 */
function local_oksigeniaclasstools_default_mode(int $categoryid = 0): string {
    $site = get_config('local_oksigeniaclasstools', 'defaultmode');
    $site = in_array($site, LOCAL_OKSIGENIACLASSTOOLS_MODES, true) ? $site : 'primary';
    $map = json_decode((string) get_config('local_oksigeniaclasstools', 'categorymodes'), true);
    if (!$categoryid || !is_array($map) || !$map) {
        return $site;
    }
    $category = core_course_category::get($categoryid, IGNORE_MISSING, true);
    if (!$category) {
        return $site;
    }
    // The path is «/top/…/this»: from this one up.
    foreach (array_reverse(array_filter(explode('/', $category->path))) as $id) {
        if (isset($map[$id]) && in_array($map[$id], LOCAL_OKSIGENIACLASSTOOLS_MODES, true)) {
            return $map[$id];
        }
    }
    return $site;
}

/**
 * Outputs the classroom screen (the same one as the SCORM package), with the course data if there is any.
 *
 * @param array|null $data
 */
function local_oksigeniaclasstools_output(?array $data): void {
    global $OUTPUT;
    $html = file_get_contents(__DIR__ . '/app/index.html');
    // The content of the games and materials (words, alphabet, keyboard, the time in words…) in the user's language.
    $html = str_replace('content/es.js', 'content/' . local_oksigeniaclasstools_content_file(current_language()), $html);
    $base = (new moodle_url('/local/oksigeniaclasstools/app/'))->out(false);
    // The site's icon in the browser tab, as on any other page of the site (the one of the theme or of Appearance).
    $icon = $OUTPUT->favicon()->out(false);
    $html = str_replace('<head>', "<head>\n<base href=\"" . s($base) . "\">\n<link rel=\"icon\" href=\"" . s($icon) . '">', $html);
    // The plugin version in the address of scripts and styles: after each upgrade the browser fetches them again
    // instead of mixing old and new files from its cache.
    $version = (int) get_config('local_oksigeniaclasstools', 'version');
    $assets = '/(<script src="[a-z0-9\/_-]+\.js|<link rel="stylesheet" href="[a-z0-9\/_-]+\.css)"/i';
    $html = preg_replace($assets, '$1?v=' . $version . '"', $html);
    $flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    $site = local_oksigeniaclasstools_site();
    if ($data && !empty($data['courseid'])) {
        $site['mode'] = local_oksigeniaclasstools_default_mode((int) get_course($data['courseid'])->category);
    }
    // Whether the one who opens it teaches: what is only for teachers (the teacher's guide) shows only to them.
    $site['teacher'] = local_oksigeniaclasstools_teaches($data);
    $script = '<script>window.CLASSTOOLS_SITE = ' . json_encode($site, $flags) . ";</script>\n";
    if ($data) {
        $script .= '<script>window.CLASSTOOLS = ' . json_encode($data, $flags) . ";</script>\n";
    }
    // A callback, so that nothing in the data can be read as a backreference.
    $html = preg_replace_callback('/<script src="icons\.js/', fn($m) => $script . $m[0], $html, 1);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Frame-Options: SAMEORIGIN');
    echo $html;
}

/**
 * Outputs the page where a device joins a live session, in the language of the site (or of the student, with their
 * account), with the session it found for the code, if any.
 *
 * @param stdClass|null $live
 * @param string $code What came in the address.
 */
function local_oksigeniaclasstools_join_output(?stdClass $live, string $code): void {
    global $OUTPUT, $SITE;
    $html = file_get_contents(__DIR__ . '/app/join.html');
    $base = (new moodle_url('/local/oksigeniaclasstools/app/'))->out(false);
    $icon = $OUTPUT->favicon()->out(false);
    $html = str_replace('<head>', "<head>\n<base href=\"" . s($base) . "\">\n<link rel=\"icon\" href=\"" . s($icon) . '">', $html);
    $html = str_replace('<html lang="en">', '<html lang="' . s(str_replace('_', '-', current_language())) . '">', $html);
    $title = s(get_string('jointitle', 'local_oksigeniaclasstools'));
    $html = str_replace('<title>Class tools</title>', '<title>' . $title . '</title>', $html);
    $version = (int) get_config('local_oksigeniaclasstools', 'version');
    $assets = '/(<script src="[a-z0-9\/_-]+\.js|<link rel="stylesheet" href="[a-z0-9\/_-]+\.css)"/i';
    $html = preg_replace($assets, '$1?v=' . $version . '"', $html);
    $str = [];
    foreach (get_string_manager()->load_component_strings('local_oksigeniaclasstools', current_language()) as $key => $text) {
        if (strpos($key, 'app_lv_') === 0) {
            $str[substr($key, 4)] = $text;
        }
    }
    $moodle = $live && in_array($live->identity, ['moodle', 'hidden'], true);
    // Without their name on the board, a critter and its name, from the content pack of the teacher's language.
    if ($live && $live->identity !== 'moodle') {
        $state = json_decode($live->state, true);
        $content = local_oksigeniaclasstools_content_file((string) ($state['lang'] ?? 'en'));
        $html = str_replace('<script src="join.js', '<script src="critter.js?v=' . $version . '"></script>' . "\n"
            . '<script src="content/' . $content . '?v=' . $version . '"></script>' . "\n" . '<script src="join.js', $html);
    }
    $config = [
        'code' => $live ? $live->code : strtoupper($code),
        'found' => (bool) $live,
        'kind' => $live ? $live->kind : '',
        'identity' => $live ? $live->identity : '',
        'api' => (new moodle_url('/local/oksigeniaclasstools/' . ($moodle ? 'joinapi.php' : 'joinanon.php')))->out(false),
        'sesskey' => $moodle ? sesskey() : '',
        'page' => (new moodle_url('/local/oksigeniaclasstools/join.php'))->out(false),
        'site' => format_string($SITE->shortname, true, ['context' => context_system::instance(), 'escape' => false]),
        'str' => (object) $str,
    ];
    $flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    $script = '<script>window.CLASSTOOLS_JOIN = ' . json_encode($config, $flags) . ";</script>\n";
    $html = str_replace('<script src="join.js', $script . '<script src="join.js', $html);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Frame-Options: SAMEORIGIN');
    echo $html;
}

/**
 * Outputs the fixed remote for the teacher's phone: its key (empty if it is off or the address changed), where to send
 * the orders, and its texts.
 *
 * @param string $token
 */
function local_oksigeniaclasstools_remote_output(string $token): void {
    global $OUTPUT, $SITE;
    $html = file_get_contents(__DIR__ . '/app/mando.html');
    $base = (new moodle_url('/local/oksigeniaclasstools/app/'))->out(false);
    $icon = $OUTPUT->favicon()->out(false);
    $html = str_replace('<head>', "<head>\n<base href=\"" . s($base) . "\">\n<link rel=\"icon\" href=\"" . s($icon) . '">', $html);
    $html = str_replace('<html lang="en">', '<html lang="' . s(str_replace('_', '-', current_language())) . '">', $html);
    $title = s(get_string('app_rm_title', 'local_oksigeniaclasstools'));
    $html = str_replace('<title>Class tools</title>', '<title>' . $title . '</title>', $html);
    $version = (int) get_config('local_oksigeniaclasstools', 'version');
    $assets = '/(<script src="[a-z0-9\/_-]+\.js|<link rel="stylesheet" href="[a-z0-9\/_-]+\.css)"/i';
    $html = preg_replace($assets, '$1?v=' . $version . '"', $html);
    $str = [];
    foreach (get_string_manager()->load_component_strings('local_oksigeniaclasstools', current_language()) as $key => $text) {
        if (strpos($key, 'app_lv_') === 0 || strpos($key, 'app_rm_') === 0) {
            $str[substr($key, 4)] = $text;
        }
    }
    $config = [
        'k' => $token,
        'api' => (new moodle_url('/local/oksigeniaclasstools/mandoapi.php'))->out(false),
        'site' => format_string($SITE->shortname, true, ['context' => context_system::instance(), 'escape' => false]),
        'str' => (object) $str,
    ];
    $flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    $script = '<script>window.CLASSTOOLS_REMOTE = ' . json_encode($config, $flags) . ";</script>\n";
    $html = str_replace('<script src="mando.js', $script . '<script src="mando.js', $html);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: no-referrer');
    echo $html;
}

/**
 * Serves the pictures of the quiz questions, to those who can use the tools in the course.
 *
 * @param stdClass $course
 * @param stdClass|null $cm
 * @param context $context
 * @param string $filearea
 * @param array $args
 * @param bool $forcedownload
 * @param array $options
 * @return bool False if there is no such file.
 */
function local_oksigeniaclasstools_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options = []) {
    $area = \local_oksigeniaclasstools\local\quizimages::AREA;
    if ($context->contextlevel != CONTEXT_COURSE || $filearea !== $area || count($args) < 2) {
        return false;
    }
    require_login($course, false);
    require_capability('local/oksigeniaclasstools:use', $context);
    $itemid = (int) array_shift($args);
    $name = array_pop($args);
    $file = get_file_storage()->get_file($context->id, 'local_oksigeniaclasstools', $filearea, $itemid, '/', $name);
    if (!$file || $file->is_directory()) {
        return false;
    }
    // A picture never changes under its name: it can be kept for a long time.
    send_stored_file($file, YEARSECS, 0, $forcedownload, $options);
}

/**
 * Shows tools, games or materials that came after the administrator chose what the site shows: an upgrade adds them
 * to that choice (the ones left out on purpose stay out). Nothing chosen yet: all are shown already.
 *
 * @param string $name tools, games or materials
 * @param string[] $keys The new ones.
 */
function local_oksigeniaclasstools_show_new(string $name, array $keys): void {
    $value = get_config('local_oksigeniaclasstools', $name);
    if ($value === false) {
        return;
    }
    $list = array_values(array_filter(explode(',', (string) $value), 'strlen'));
    set_config($name, implode(',', array_values(array_unique(array_merge($list, $keys)))), 'local_oksigeniaclasstools');
}
