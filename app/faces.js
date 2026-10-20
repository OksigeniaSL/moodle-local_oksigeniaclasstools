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
 * The faces of «How are you getting on?» in an exit ticket, the same on the board and on the devices: from 0 (not yet)
 * to 3 (could explain it to someone), each with its colour. Not yet is not a sad face: it is a lesson that is still on
 * its way.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const LEVELS = ['3', '2', '1', '0'];
    // Colour of each level, and whether it needs dark text on it.
    const COLOURS = { 3: ['#067e36'], 2: ['#5f9e2f'], 1: ['#fbbe17', true], 0: ['#ea7317'] };
    const MOUTHS = {
        3: '<path d="M18 37 Q32 55 46 37 Z" fill="#1d2433"/>',
        2: '<path d="M20 39 Q32 49 44 39" fill="none" stroke="#1d2433" stroke-width="4" stroke-linecap="round"/>',
        1: '<path d="M21 43 Q26.5 38 32 43 T43 43" fill="none" stroke="#1d2433" stroke-width="4" stroke-linecap="round"/>',
        0: '<path d="M23 45 Q32 39 41 45" fill="none" stroke="#1d2433" stroke-width="4" stroke-linecap="round"/>',
    };
    /**
     * A face, as an SVG.
     *
     * @param {string|number} level 0 to 3.
     * @param {string} [title] What it says, for screen readers (without it, it is only drawing).
     * @returns {string}
     */
    const svg = (level, title = '') => {
        const l = String(level);
        if (!COLOURS[l]) { return ''; }
        const label = title ? ` role="img" aria-label="${String(title).replace(/[&<>"']/g, '')}"` : ' aria-hidden="true"';
        return `<svg class="ct-cara" viewBox="0 0 64 64"${label}><circle cx="32" cy="32" r="30" fill="${COLOURS[l][0]}"/>`
            + '<circle cx="22" cy="25" r="4" fill="#1d2433"/><circle cx="42" cy="25" r="4" fill="#1d2433"/>'
            + `${MOUTHS[l]}</svg>`;
    };
    window.ClasstoolsFaces = { LEVELS, COLOURS, svg };
})();
