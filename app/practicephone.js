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
 * The fixed remote's page (mando.html) as the phone of a guided help (#practica in its address, beside the practice
 * board of help.js): it talks to that board instead of Moodle, in the teacher's language, and keeps nothing.
 * From the prototype of the guided helps of the art direction (kit/ayuda-guiada/mandofijo.js).
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    if (!/(?:^#|&)practica(?:&|$)/.test(location.hash)) { return; }
    const top = window.parent !== window ? window.parent : null;
    const board = () => {
        const f = top && top.document.querySelector('.hp-pizarra');
        return f && f.contentWindow && f.contentWindow.CLASSTOOLS_PRACTICE;
    };
    // The texts of the board the help is in.
    const site = (top && top.CLASSTOOLS_SITE) || {}, all = Object.assign({}, (top && top.CLASSTOOLS_STR) || {}, site.str || {}), str = {};
    Object.keys(all).forEach((k) => { if (/^(lv|rm)_/.test(k)) { str[k] = all[k]; } });
    if (top) { document.documentElement.lang = top.document.documentElement.lang; }
    window.CLASSTOOLS_REMOTE = { k: 'practica', ajax: 'practice://nologin', site: '', str };
    // Nothing kept: the class chosen on this phone stays in memory.
    const kept = {};
    try {
        Object.defineProperty(window, 'localStorage', { configurable: true, value: {
            getItem: (k) => (k in kept ? kept[k] : null), setItem: (k, v) => { kept[k] = String(v); }, removeItem: (k) => { delete kept[k]; },
        } });
    } catch (e) { /* the phone may remember its class: only on this computer */ }
    const json = (data) => Promise.resolve(new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
    const real = window.fetch.bind(window);
    // The web services of the phone (mando.js), answered by the practice board by name.
    window.fetch = (url, opts) => {
        if (!String(url).startsWith('practice://nologin')) { return real(url, opts); }
        let call = {};
        try { [call] = JSON.parse(String(opts && opts.body)); } catch (e) { call = {}; }
        const name = String(call.methodname || ''), args = call.args || {}, m = board() && board().mando;
        let data;
        if (name.endsWith('_phone_command')) { data = m ? m.command(args.cmd) : { off: true }; }
        else if (name.endsWith('_phone_courses')) { data = m ? m.courses() : { off: true }; }
        else { data = { json: JSON.stringify(m ? m.state() : { boards: [] }) }; }
        return json([{ error: false, data }]);
    };
})();
