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
 * Tests for the Canva links of the presentation tab.
 *
 * @package    local_oksigeniaclasstools
 * @category   test
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @covers     \local_oksigeniaclasstools\local\presentation
 */
#[\PHPUnit\Framework\Attributes\CoversClass(presentation::class)]
final class presentation_test extends \advanced_testcase {
    public function test_design_in_canva_links(): void {
        $this->assertSame(['id' => 'DAHXQxCQhek', 'token' => '1UbXOZJcfKeW6ikUy4ezMA'], presentation::design(
            'https://www.canva.com/design/DAHXQxCQhek/1UbXOZJcfKeW6ikUy4ezMA/edit?utm_content=DAHXQxCQhek&utm_source=sharebutton'));
        $this->assertSame(['id' => 'DAHXQxCQhek', 'token' => ''],
            presentation::design('https://www.canva.com/design/DAHXQxCQhek/view'));
        $this->assertNull(presentation::design('https://example.org/design/DAHXQxCQhek/1UbXOZJcfKeW6ikUy4ezMA/edit'));
        $this->assertNull(presentation::design('http://www.canva.com/design/DAHXQxCQhek/1UbXOZJcfKeW6ikUy4ezMA/edit'));
    }

    public function test_short_links(): void {
        $this->assertSame('qvhj4cg4im8136q', presentation::short_code('https://canva.link/qvhj4cg4im8136q'));
        $this->assertSame('qvhj4cg4im8136q', presentation::short_code(' canva.link/qvhj4cg4im8136q/ '));
        $this->assertNull(presentation::short_code('https://canva.link/qvhj4cg4im8136q?x=1'));
        $this->assertNull(presentation::short_code('https://evil.example/canva.link/abc123'));
        // Nothing is asked for a link that is not short.
        $this->assertNull(presentation::resolve('https://example.org/abc123'));
    }

    public function test_on_only_when_the_administrator_chooses_it(): void {
        $this->resetAfterTest();
        unset_config('tools', 'local_oksigeniaclasstools');
        $this->assertFalse(presentation::on());
        set_config('tools', 'temporizador,pizarra', 'local_oksigeniaclasstools');
        $this->assertFalse(presentation::on());
        set_config('tools', 'temporizador,pizarra,presentacion', 'local_oksigeniaclasstools');
        $this->assertTrue(presentation::on());
    }
}
