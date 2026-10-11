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
 * The teacher's stickers («Mis logros»): one per tool, raised a level by real uses with a class (the board says when a
 * use is real, with the thresholds the administrator chooses). At most one use counts per sticker, course and day; the
 * level comes from the different days of use: 1, 3, 8, 20 and 50. Never a ranking between teachers.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class logros {
    /** The stickers, in the order of the album, each with its family (as in the art director's design). */
    const CROMOS = [
        'domamoviles' => 'live', 'cuentavotos' => 'live', 'atrapanubes' => 'live', 'lanzapreguntas' => 'live',
        'tocatimbres' => 'live', 'mandamas' => 'live', 'cuentamanos' => 'live', 'repartequipos' => 'groups',
        'sacanombres' => 'picker', 'guardatiempos' => 'timer', 'tocanotas' => 'score', 'salvaglobos' => 'hangman',
        'cazaletras' => 'rosco', 'tiradados' => 'dice', 'cumplemetas' => 'goal', 'pasalimpios' => 'board',
        'quitatelones' => 'board', 'trazacirculos' => 'board',
    ];

    /** Days of use for each level. */
    const LEVELS = [1 => 1, 2 => 3, 3 => 8, 4 => 20, 5 => 50];

    /** Different weeks of use for the prize of steadiness. */
    const WEEKS = 10;

    /**
     * Whether the stickers are on in this site.
     *
     * @return bool
     */
    public static function on(): bool {
        return get_config('local_oksigeniaclasstools', 'logros') !== '0';
    }

    /**
     * What makes a use real, as the administrator set it (with the defaults of the design).
     *
     * @return array devices (live sessions), picks (whose turn) and students (groups).
     */
    public static function thresholds(): array {
        $get = fn(string $name, int $default) => max(1, (int) (get_config('local_oksigeniaclasstools', $name) ?: $default));
        return [
            'devices' => $get('logros_devices', 5),
            'picks' => $get('logros_picks', 5),
            'students' => $get('logros_students', 8),
        ];
    }

    /**
     * The level of a number of days of use (0: none yet).
     *
     * @param int $days
     * @return int
     */
    public static function level(int $days): int {
        $level = 0;
        foreach (self::LEVELS as $n => $need) {
            if ($days >= $need) {
                $level = $n;
            }
        }
        return $level;
    }

    /**
     * The days of use of each sticker of a teacher (only the ones with any).
     *
     * @param int $userid
     * @return int[] sticker => days
     */
    public static function days(int $userid): array {
        global $DB;
        $rows = $DB->get_records_sql(
            'SELECT cromo, COUNT(DISTINCT day) AS days FROM {local_oksigeniaclasstools_uses} WHERE userid = ? GROUP BY cromo',
            [$userid]
        );
        return array_map(fn($r) => (int) $r->days, $rows);
    }

    /**
     * The different weeks with any use, for the prize of steadiness.
     *
     * @param int $userid
     * @return int
     */
    public static function weeks(int $userid): int {
        global $DB;
        return (int) $DB->count_records_sql(
            'SELECT COUNT(DISTINCT week) FROM {local_oksigeniaclasstools_uses} WHERE userid = ?',
            [$userid]
        );
    }

    /**
     * A real use, as the board says: kept once per sticker, course and day.
     *
     * @param int $userid
     * @param int $courseid
     * @param string $cromo
     * @param int|null $now For tests.
     * @return array cromo, days, level, and up when the level went up with this use.
     */
    public static function record(int $userid, int $courseid, string $cromo, ?int $now = null): array {
        global $DB;
        if (!isset(self::CROMOS[$cromo])) {
            throw new \moodle_exception('invalidparameter', 'debug');
        }
        $now = $now ?? time();
        $before = self::days($userid)[$cromo] ?? 0;
        $day = (int) userdate($now, '%Y%m%d', 99, false);
        $record = ['userid' => $userid, 'courseid' => $courseid, 'cromo' => $cromo, 'day' => $day];
        if (!$DB->record_exists('local_oksigeniaclasstools_uses', $record)) {
            try {
                $DB->insert_record('local_oksigeniaclasstools_uses', (object) ($record + [
                    'week' => (int) date('oW', $now), 'timecreated' => $now,
                ]));
            } catch (\dml_write_exception $e) {
                // The same use, sent twice at once: it is already there.
                unset($e);
            }
        }
        $days = self::days($userid)[$cromo] ?? 0;
        $level = self::level($days);
        return ['cromo' => $cromo, 'days' => $days, 'level' => $level, 'up' => $level > self::level($before)];
    }

    /**
     * The album of a teacher: each sticker with its level and days, and the weeks of use.
     *
     * @param int $userid
     * @return array cromos (cromo, family, days, level, next: days for the next level), got, weeks, weeksneeded
     */
    public static function album(int $userid): array {
        $days = self::days($userid);
        $cromos = [];
        foreach (self::CROMOS as $cromo => $family) {
            $d = $days[$cromo] ?? 0;
            $level = self::level($d);
            $cromos[] = ['cromo' => $cromo, 'family' => $family, 'days' => $d, 'level' => $level,
                'next' => self::LEVELS[$level + 1] ?? 0];
        }
        return ['cromos' => $cromos, 'got' => count(array_filter($cromos, fn($c) => $c['level'] > 0)),
            'weeks' => self::weeks($userid), 'weeksneeded' => self::WEEKS];
    }

    /**
     * Forgets the uses of a teacher (privacy), in a course or everywhere.
     *
     * @param int $userid
     * @param int|null $courseid
     */
    public static function delete(int $userid, ?int $courseid = null): void {
        global $DB;
        $where = ['userid' => $userid] + ($courseid ? ['courseid' => $courseid] : []);
        $DB->delete_records('local_oksigeniaclasstools_uses', $where);
    }
}
