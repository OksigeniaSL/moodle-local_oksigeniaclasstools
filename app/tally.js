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
 * How much each tool, game and material of the board is used: the times it is chosen and the seconds it is on screen
 * while someone works with it, sent to the course every couple of minutes and when the board is closed (tally_add).
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore, AULA = window.CLASSTOOLS;
    if (!core || !AULA || !core.has('tally') || !AULA.courseid || core.duelo) { return; }
    // Time counts while the page is seen and someone has touched the board (or sent an order from the phone) in the
    // last quarter of an hour: a board left open over the weekend is not a weekend of use.
    const STEP = 15, IDLE = 15 * 60000, EVERY = 120000;
    const parts = {};     // the game or the material shown inside its tab
    const pending = {};   // item → [times chosen, seconds]
    const keyOf = (tool) => (parts[tool] ? `${tool}/${parts[tool]}` : tool);
    let key = keyOf(core.current()), last = Date.now();
    const add = (k, opens, seconds) => { const p = pending[k] || (pending[k] = [0, 0]); p[0] += opens; p[1] += seconds; };
    const choose = (k) => { if (k !== key) { key = k; add(k, 1, 0); } };
    document.addEventListener('classtools:tab', (e) => choose(keyOf(e.detail)));
    document.addEventListener('classtools:part', (e) => {
        const { tool, part } = e.detail;
        if (parts[tool] === part) { return; }
        const before = parts[tool];
        parts[tool] = part;
        // The first one a tab shows when the board opens is not a choice; a change while the tab is on screen is.
        if (core.current() === tool) {
            if (before === undefined && key === tool) { key = keyOf(tool); } else { choose(keyOf(tool)); }
        }
    });
    const awake = () => { last = Date.now(); };
    ['pointerdown', 'keydown', 'wheel'].forEach((type) => addEventListener(type, awake, { capture: true, passive: true }));
    document.addEventListener('classtools:remote', awake);
    setInterval(() => {
        if (document.visibilityState === 'visible' && Date.now() - last < IDLE) { add(key, 0, STEP); }
    }, STEP * 1000);
    const send = () => {
        const items = Object.entries(pending).filter(([, p]) => p[0] || p[1]);
        Object.keys(pending).forEach((k) => { delete pending[k]; });
        if (!items.length) { return; }
        // The web service tally_add, through Moodle's AJAX service, as a beacon (it also goes when the page closes).
        const methodname = 'local_oksigeniaclasstools_tally_add';
        const url = `${AULA.ajax}?sesskey=${encodeURIComponent(AULA.sesskey || '')}&info=${methodname}`;
        const args = { courseid: AULA.courseid, items: items.map(([tool, [opens, seconds]]) => ({ tool, opens, seconds })) };
        const body = JSON.stringify([{ index: 0, methodname, args }]);
        try { if (navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))) { return; } } catch (e) { /* below */ }
        core.call('tally_add', args, { keepalive: true }).catch(() => {});
    };
    setInterval(send, EVERY);
    addEventListener('pagehide', send);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { send(); } });
    window.ClasstoolsTally = { send, item: () => key, pending: () => JSON.parse(JSON.stringify(pending)) };   // for automated tests
})();
