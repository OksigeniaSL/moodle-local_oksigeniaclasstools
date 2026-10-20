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
 * The presentation tab: the Canva design in a link a teacher pastes, also behind a short link (canva.link), which the
 * board cannot follow by itself.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class presentation {
    /**
     * Whether the site shows the presentation tab (it starts off).
     *
     * @return bool
     */
    public static function on(): bool {
        $tools = get_config('local_oksigeniaclasstools', 'tools');
        return $tools !== false && in_array('presentacion', explode(',', $tools), true);
    }

    /**
     * The design in a link of Canva: its id and, when the link has it, its share token.
     *
     * @param string $url
     * @return array|null With id and token, or null if it is not a link to a design.
     */
    public static function design(string $url): ?array {
        if (!preg_match('~^https://(?:www\.)?canva\.com/design/([A-Za-z0-9_-]{8,})(?:/([A-Za-z0-9_-]{10,}))?~', $url, $m)) {
            return null;
        }
        return ['id' => $m[1], 'token' => $m[2] ?? ''];
    }

    /**
     * The code of a Canva short link («https://canva.link/abc123»), or null if it is not one.
     *
     * @param string $url
     * @return string|null
     */
    public static function short_code(string $url): ?string {
        return preg_match('~^(?:https?://)?canva\.link/([A-Za-z0-9]{4,40})/?$~', trim($url), $m) ? $m[1] : null;
    }

    /**
     * Where a Canva short link leads, asked to canva.link without following it (with the site's rules for outgoing
     * requests).
     *
     * @param string $url
     * @return array|null The design, as design() gives it, or null if it does not lead to one.
     */
    public static function resolve(string $url): ?array {
        global $CFG;
        require_once($CFG->libdir . '/filelib.php');
        $code = self::short_code($url);
        if ($code === null) {
            return null;
        }
        $curl = new \curl();
        $curl->head('https://canva.link/' . $code, ['CURLOPT_FOLLOWLOCATION' => 0, 'CURLOPT_TIMEOUT' => 10,
            'CURLOPT_CONNECTTIMEOUT' => 5]);
        return self::design((string) ($curl->get_info()['redirect_url'] ?? ''));
    }
}
