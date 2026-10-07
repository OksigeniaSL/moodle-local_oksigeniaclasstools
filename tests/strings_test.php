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

namespace local_oksigeniaclasstools;

/**
 * The board's texts outside Moodle (app/strings.js) must match the English language pack: tools/strings.py writes
 * the file (build.sh runs it), and this test catches a pack changed without running it.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @coversNothing
 */
#[\PHPUnit\Framework\Attributes\CoversNothing]
final class strings_test extends \advanced_testcase {
    public function test_strings_js_matches_the_english_pack(): void {
        global $CFG;
        $js = file_get_contents($CFG->dirroot . '/local/oksigeniaclasstools/app/strings.js');
        $this->assertSame(1, preg_match('/window\.CLASSTOOLS_STR = (\{.*\});\s*$/s', $js, $m));
        $file = json_decode($m[1], true);
        $pack = [];
        foreach (get_string_manager()->load_component_strings('local_oksigeniaclasstools', 'en') as $key => $text) {
            if (strpos($key, 'app_') === 0) {
                $pack[substr($key, 4)] = $text;
            }
        }
        ksort($pack);
        ksort($file);
        $this->assertSame($pack, $file);
    }
}
