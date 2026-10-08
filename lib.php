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
    'parejas' => 'app_me_pairs', 'codigo' => 'app_lock_name',
];

/** The materials, with the string of their name. */
const LOCAL_OKSIGENIACLASSTOOLS_MATERIALS = [
    'rods' => 'app_mt_rods', 'tangram' => 'app_mt_tangram', 'line' => 'app_mt_line', 'fractions' => 'app_mt_fractions',
    'geoboard' => 'app_mt_geoboard', 'base10' => 'app_mt_base10', 'calc' => 'app_mt_calc',
    'score' => 'app_mt_score',
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
        $surname = preg_split('/\s+/', trim($user->lastname))[0] ?? '';
        return $namestyle === 'first' ? trim($user->firstname) : trim($user->firstname . ' ' . $surname);
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
        // Questions of the Moodle question bank for a quiz (multiple choice with one answer, true/false).
        'bankurl' => (new moodle_url('/local/oksigeniaclasstools/quizbank.php'))->out(false),
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
    // The screen mode a course starts in, until the teacher chooses another.
    $mode = get_config('local_oksigeniaclasstools', 'defaultmode');
    $mode = in_array($mode, LOCAL_OKSIGENIACLASSTOOLS_MODES, true) ? $mode : 'primary';
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
    $script = '<script>window.CLASSTOOLS_SITE = ' . json_encode(local_oksigeniaclasstools_site(), $flags) . ";</script>\n";
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
