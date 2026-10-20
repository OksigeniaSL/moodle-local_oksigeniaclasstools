#!/usr/bin/env node
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
 * Checks the board in a headless Chrome, outside Moodle: app/ is served as it is, with a pretend Moodle course and a
 * pretend live server, and each check drives the real screen as a teacher would.
 * Usage: node tools/browser_check.mjs [check …]   (Node 22 or later, Chrome or Chromium installed; no packages)
 * CHROME=/path/to/chrome to choose the browser; SHOTS=<folder> to keep a picture of the screen where a check asks for
 * one (await shot('name') in the check), to look at what it has checked.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');

// What the page gets before the board: a course with a class, and a live server that answers like livehost.php
// (start, state, open, close, end) for a vote, keeping what the board sent.
const FAKE = `
window.CLASSTOOLS = { lists: [{ id: 1, name: 'Class 1', key: 'c1', students: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, n: 'Student ' + (i + 1) })) },
    { id: 2, name: 'Split A', key: 'c2', students: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, n: 'Student ' + (i + 1) })) }],
    courseid: 1, mode: 'teacher', sesskey: 'x', days: {}, state: {}, liveurl: 'fake://live', glossaryurl: 'fake://glossary', bankurl: 'fake://bank',
    aiurl: 'fake://ai', remoteurl: 'fake://remote', remote: { on: false },
    logrosurl: 'fake://logros', logros: { thr: { devices: 5, picks: 5, students: 8 }, levels: {} }, salaurl: 'fake://sala',
    tallyurl: 'fake://tally', me: { id: 99, name: 'Teacher' } };
window.FAKE = { calls: [], polls: 0, beacons: [] };
// What the board sends with sendBeacon (what it has been used for), kept instead of sent.
navigator.sendBeacon = (url, body) => { window.FAKE.beacons.push({ url, ...Object.fromEntries(body) }); return true; };
const BANK_PAIRS = [['frog', 'amphibian'], ['cat', 'mammal'], ['bee', 'insect']];
const GLOSSARY = [{ w: 'Photosynthesis', c: 'How plants make their food with light.' }, { w: 'Cell', c: 'The smallest unit of life.' },
    { w: 'Atom', c: 'The smallest part of an element.' }];
// A picture of the screen, when the checks run with SHOTS.
window.shot = (name) => new Promise((done) => { if (!window.checkShot) { done(); return; } window.shotDone = done; window.checkShot(name); });
(() => {
    const VOTES = { abcd: ['A', 'B', 'C', 'D'], yesno: ['yes', 'no'], light: ['green', 'yellow', 'red'], five: ['1', '2', '3', '4', '5'] };
    let S = null;
    const view = () => ({ id: 7, code: 'TEST42', kind: 'vote', identity: 'anon', ended: S.ended, round: S.round, open: S.open, show: false,
        others: 0, notice: false, seq: 0, url: 'https://example.org/local/oksigeniaclasstools/join.php?c=TEST42', devices: [],
        vote: S.vote, options: VOTES[S.vote], results: Object.fromEntries(VOTES[S.vote].map((o) => [o, 0])) });
    const real = window.fetch;
    window.fetch = (url, opts) => {
        if (!String(url).startsWith('fake://')) { return real(url, opts); }
        const p = new URLSearchParams(opts && opts.body), a = p.get('action');
        FAKE.calls.push(Object.fromEntries(p));
        const json = (x) => Promise.resolve(new Response(JSON.stringify(x), { headers: { 'Content-Type': 'application/json' } }));
        // The question bank, as quizbank.php gives it: one category with a matching question.
        if (String(url).startsWith('fake://bank')) {
            return json(a === 'categories' ? { categories: p.get('kind') === 'pairs' ? [{ id: 9, name: 'Course · Animals', count: 1 }] : [] }
                : { pairs: BANK_PAIRS, skipped: 0 });
        }
        // A glossary of the course, as glossary.php gives it.
        // The AI of the site, as ai.php gives it: the policy until it is accepted, then two exercises in a code fence
        // (the server takes the fences away; here they never come).
        if (String(url).startsWith('fake://ai')) {
            if (a === 'accept') { FAKE.aiAccepted = true; return json({ ok: true }); }
            if (!FAKE.aiAccepted) { return json({ ok: false, policy: '<p>The AI policy of the site.</p>' }); }
            const TEXTS = {
                whoami: '# Volcano\\n= Volcano\\nI have a crater.\\nI erupt lava.\\n\\n# Island\\n= Island\\nI have water all around.\\nI am land.',
                quiz: 'Largest planet? | *Jupiter | Mars | Venus\\nThe sky is blue | T',
                rosco: 'A | Fruit of Newton | apple\\nB | It makes honey | bee\\nC | Man\\'s best friend | dog\\nX | It pulls a plough | ox',
                words: '1. volcano\\n- glacier\\nplateau',
                pairs: 'France = Paris\\nItaly = Rome\\nnot a pair',
                song: 'Title: Frere Jacques\\nOrigin: France\\nClef: treble\\nTime: 4/4\\nTempo: 100\\nC:q D E C | C D E C | E F G:h',
            };
            return json({ ok: true, text: TEXTS[p.get('type')] || '' });
        }
        // The fixed remote, as remote.php gives it: on and off, a new address, and the orders queued in FAKE.remoteCmds.
        if (String(url).startsWith('fake://remote')) {
            const R = FAKE.remote || (FAKE.remote = { on: false, n: 1, seq: 0 });
            const status = () => (R.on ? { on: true, url: 'https://example.org/local/oksigeniaclasstools/mando.php?k=key' + R.n } : { on: false });
            if (a === 'on' || a === 'off') { R.on = a === 'on'; return json(status()); }
            if (a === 'rotate') { R.n++; return json(status()); }
            if (a === 'poll') {
                if (!R.on) { return json({ on: false }); }
                const since = Number(p.get('since')), cmds = (FAKE.remoteCmds || []).filter((c) => c.seq > since);
                R.seq = Math.max(R.seq, ...cmds.map((c) => c.seq));
                return json({ on: true, seq: R.seq, cmds, phone: !!FAKE.remoteCmds });
            }
            return json(status());
        }
        // The teachers' room, as sala.php gives it: the teacher comes in or leaves, and the room as they see it.
        if (String(url).startsWith('fake://sala')) {
            if (a === 'join') { FAKE.salaIn = p.get('join') === '1'; }
            const me = { id: 99, name: 'Teacher', me: true, stickers: [], note: 'And 1 learned in a guided help, only in «My stickers».' };
            return json({ joined: !!FAKE.salaIn, count: '', span: 'It counts the last 12 weeks.', others: 'And 9 more colleagues play with their classes.',
                teachers: [{ id: 7, name: 'Ana Ruiz', me: false, stickers: [{ cromo: 'tiradados', level: 2 }] }].concat(FAKE.salaIn ? [me] : []),
                str: { title: "Teachers' room", intro: 'Who else plays with their class.', you: 'you', none: 'No stickers in this time', empty: 'Nobody yet',
                    join: 'Appear in the room', join_note: 'Only your critter, your name and your stickers.', close: 'Close' } });
        }
        // The teacher's stickers, as logros.php gives it: the first use of a sticker is its level 1.
        if (String(url).startsWith('fake://logros')) {
            if (a === 'learn') { return json({ cromo: p.get('cromo'), learned: true, before: false }); }
            return json({ cromo: p.get('cromo'), days: 1, level: 1, up: true });
        }
        // The phone of the fixed remote, as mandoapi.php gives it: two open boards.
        if (String(url).startsWith('fake://mando')) {
            if (a === 'command') { return json(p.get('cmd') === 'x_old' ? { ok: false, why: 'gone' } : { ok: true }); }
            if (a === 'courses') { return json({ courses: [{ id: 1, name: 'One' }, { id: 7, name: 'Language 5' }, { id: 8, name: 'Maths 6' }] }); }
            // The first board is on «Groups», with its buttons; the second, on the clock, has none.
            const here = [[['x_md0', 'No. of groups', 'on'], ['x_md1', 'Students per group', '']],
                [['x_le', 'One fewer', 'less'], ['', '4 groups', 'val'], ['x_mr', 'One more', 'more']], [['x_go', 'Make groups', 'big']],
                [['', 'Starts with A: a fruit', 'txt']], [['x_old', 'Gone', '']],
                [['', 'Options', 'cap']], [['x_o1', 'Deal them out with suspense', 'chk'], ['x_o2', 'Scratch to reveal', 'chkon']],
                [['', 'Look', 'cap'], ['x_o3x0', 'Ring', 'opton'], ['x_o3x1', 'Disc', 'opt'], ['x_o3x2', 'Bar', 'opt'], ['x_o3x3', 'Sand', 'opt'], ['x_o3x4', 'Pulsar', 'opt']],
                [['', 'Who is playing?', 'cap'], ['x_o4x0', 'Whole class', 'opton'], ['x_o4x1', 'Two teams', 'opt']]];
            return json({ boards: [{ course: 1, name: 'One', tool: 'grupos', tools: [['grupos', 'Groups'], ['reloj', 'Clock']], here },
                { course: 2, name: 'Two', tool: 'reloj', tools: [['reloj', 'Clock']], here: [] }] });
        }
        // A Canva short link, as presentation.php follows it.
        if (String(url).startsWith('fake://presentation')) {
            return json(String(p.get('url')).includes('canva.link/abc123xyz') ? { ok: true, id: 'DAexample01', token: 'faketoken-faketoken' } : { ok: false });
        }
        if (String(url).startsWith('fake://glossary')) {
            return json(a === 'list' ? { ok: true, glossaries: [{ id: 5, name: 'Science words', count: 3 }] }
                : { ok: true, words: GLOSSARY });
        }
        // A check may bring a live server of its own (another kind of session, or the device's side).
        if (FAKE.live && ['fake://live', 'fake://join'].some((x) => String(url).startsWith(x))) { return json(FAKE.live(Object.fromEntries(p))); }
        if (a === 'start') { S = { vote: VOTES[p.get('vote')] ? p.get('vote') : 'abcd', round: 0, open: false, ended: false }; }
        else if (a === 'state') { FAKE.polls++; }
        else if (a === 'open') { if (VOTES[p.get('vote')]) { S.vote = p.get('vote'); } S.open = true; S.round++; }
        else if (a === 'close') { S.open = false; }
        else if (a === 'end') { S.ended = true; }
        return Promise.resolve(new Response(JSON.stringify(S ? view() : { ended: true, devices: [] }), { headers: { 'Content-Type': 'application/json' } }));
    };
})();
`;

// Each check runs in the page and returns what went wrong, or nothing.
const CHECKS = {
    // The type of answers the teacher picks between two rounds stays picked while the board keeps asking the server,
    // and it is the one the vote opens with.
    'vote-type': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const until = async (s) => { for (let i = 0; i < 100 && !document.querySelector(s); i++) { await sleep(50); } return document.querySelector(s); };
        (await until('#t-envivo')).click();
        (await until('#lv-kind [data-v="vote"]')).click();
        document.querySelector('#lv-identity [data-v="anon"]').click();
        document.querySelector('#lv-vote').value = 'abcd';
        document.querySelector('#lv-start').click();
        const select = await until('#lv-kind-vote');
        if (!select) { return 'the vote did not start'; }
        await sleep(300);
        select.value = 'yesno';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        const polls = window.FAKE.polls;
        await sleep(3600);
        if (window.FAKE.polls < polls + 2) { return 'the board did not ask the server while waiting'; }
        if (select.value !== 'yesno') { return `the type of answers went back to «${select.value}» while the board asked the server`; }
        document.querySelector('#lv-open').click();
        await sleep(300);
        const open = window.FAKE.calls.filter((c) => c.action === 'open').pop();
        if (!open || open.vote !== 'yesno') { return `the vote opened with «${open ? open.vote : 'nothing'}»`; }
        return '';
    },
    // A popped balloon of the hangman is gone also where there are no animations (Advanced mode, reduced motion).
    'balloon-popped': async () => {
        const box = document.createElement('div');
        box.className = 'ct-balloons';
        box.innerHTML = '<span class="ct-balloon ct-popped" style="--c:#ce1423"></span>';
        document.body.append(box);
        const root = document.documentElement, before = root.dataset.modo;
        root.dataset.modo = 'advanced';
        await new Promise((r) => setTimeout(r, 100));
        const { opacity, transform } = getComputedStyle(box.firstChild);
        if (before === undefined) { delete root.dataset.modo; } else { root.dataset.modo = before; }
        box.remove();
        return opacity !== '0' && transform !== 'matrix(0, 0, 0, 0, 0, 0)'
            ? `a popped balloon is still seen in Advanced mode (opacity ${opacity}, ${transform})` : '';
    },
    // Groups: a ready set of roles (music) is the one handed out.
    'group-roles': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-grupos').click();
        await sleep(300);
        const roles = document.querySelector('#g-roles');
        if (!roles.checked) { roles.click(); }
        const set = document.querySelector('#g-roles-juego');
        set.value = 'music';
        set.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('#g-hacer').click();
        await sleep(1500);
        const given = [...document.querySelectorAll('.grupo li .rol')].map((x) => x.textContent);
        const music = ['Flute', 'Glockenspiel', 'Tambourine', 'Choreography'];
        if (!given.length) { return 'no roles were handed out'; }
        document.querySelector('#g-roles-caja').open = true;
        await window.shot('group-roles');
        const other = given.filter((r) => !music.includes(r));
        return other.length ? `roles outside the music set: ${other.join(', ')}` : '';
    },
    // Materials: «Whose turn?» chooses someone and, with a relay, steps into a corner with its bar running.
    // Touch screens that keep a touch that has gone: a tap that comes as a second finger still presses the button (once),
    // a tap with the first finger is not pressed twice, and «Clear all» takes the instruments away too.
    'touch-second-finger': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const tap = async (el, primary, id) => {
            const r = el.getBoundingClientRect(), o = { bubbles: true, cancelable: true, composed: true, pointerId: id, pointerType: 'touch', isPrimary: primary, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
            el.dispatchEvent(new PointerEvent('pointerdown', o));
            await sleep(40);
            el.dispatchEvent(new PointerEvent('pointerup', o));
        };
        q('#t-cronometro').click();
        await sleep(200);
        let clicks = 0;
        const count = () => { clicks++; };
        q('#cr-marcha').addEventListener('click', count);
        // A second finger: no click from the browser, the board gives it.
        await tap(q('#cr-marcha'), false, 7);
        await sleep(250);
        if (clicks !== 1) { return `second finger: ${clicks} clicks`; }
        // A second finger whose click the browser does send: not twice.
        await tap(q('#cr-marcha'), false, 8);
        q('#cr-marcha').click();
        await sleep(250);
        if (clicks !== 2) { return `second finger with its own click: ${clicks} clicks`; }
        // The first finger: the browser's click only (none here, as these taps are not real).
        await tap(q('#cr-marcha'), true, 9);
        await sleep(250);
        q('#cr-marcha').removeEventListener('click', count);
        if (clicks !== 2) { return `first finger: ${clicks} clicks`; }
        if (getComputedStyle(document.body).touchAction !== 'pan-x pan-y') { return `the page can be zoomed with a pinch: ${getComputedStyle(document.body).touchAction}`; }
        // The size of the board on this screen: smaller, kept, and back to normal.
        const size = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
        const normal = size();
        q('#ct-zoom [data-z="-1"]').click();
        if (Math.abs(size() / normal - 0.9) > 0.01 || localStorage.getItem('classtools-zoom') !== '0.9') { return `smaller: ${size()} of ${normal}, kept ${localStorage.getItem('classtools-zoom')}`; }
        if (q('#ct-zoom [data-z="0"]').textContent.trim() !== '90 %') { return `the size shown: ${q('#ct-zoom [data-z="0"]').textContent}`; }
        q('#ct-zoom [data-z="0"]').click();
        if (size() !== normal || localStorage.getItem('classtools-zoom') !== '1') { return 'the normal size did not come back'; }
        q('#cr-reiniciar').click();
        // «Clear all» with only instruments on the board, and with a stroke and instruments.
        q('#t-pizarra').click();
        // A busy machine may take a moment to set the board up.
        for (let i = 0; i < 100 && !(window.ClasstoolsWhiteboard && window.ClasstoolsInstruments); i++) { await sleep(50); }
        const W = window.ClasstoolsWhiteboard, I = window.ClasstoolsInstruments;
        if (!W.full()) { W.setFull(true, false); await sleep(200); }
        I.create('ruler'); I.create('compass');
        q('#wb-clear').click();
        if (I.items().length) { return 'clear all left the instruments (an empty page)'; }
        I.create('protractor');
        W.strokes().push({ c: '#000', w: 0.004, e: false, p: [[0.1, 0.1], [0.2, 0.2]] });
        q('#wb-clear').click();
        if (!I.items().length) { return 'the instruments went before «Sure?»'; }
        q('#wb-clear').click();
        if (I.items().length || W.strokes().length) { return 'clear all left the instruments or the stroke'; }
        W.setFull(false, false);
        return '';
    },
    // The bar never wider than the screen: with a long course name (and the size of the board), the buttons on top
    // lose their names before going out of sight.
    'bar-fits': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const bar = document.querySelector('#barra'), marca = document.querySelector('.marca');
        const before = marca.innerHTML;
        marca.insertAdjacentHTML('beforeend', '<span data-prueba style="display:inline-block;width:34rem">A very long name of a course for the test</span>');
        // And buttons with longer names, as in other languages.
        document.querySelector('.acciones').insertAdjacentHTML('beforeend', '<button type="button" class="redondo" data-prueba><span data-icono="info"></span><span class="redondo-texto">A button with a very long name for the test</span></button><button type="button" class="redondo" data-prueba><span data-icono="info"></span><span class="redondo-texto">And another button with a long name</span></button>');
        await sleep(400);
        const wide = bar.scrollWidth, room = bar.clientWidth, cls = bar.className;
        marca.innerHTML = before;
        document.querySelectorAll('.acciones [data-prueba]').forEach((x) => x.remove());
        await sleep(300);
        if (wide > room + 1) { return `the bar is ${wide} px wide in ${room} (${cls})`; }
        return bar.scrollWidth > bar.clientWidth + 1 ? 'the bar is too wide again' : '';
    },
    'turn-relay': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-material').click();
        await sleep(300);
        const button = document.querySelector('#mt-turn');
        if (!button || button.hidden) { return 'no «Whose turn?» in the materials'; }
        button.click();
        await sleep(200);
        const layer = document.querySelector('#h-material .ct-turno');
        if (!layer) { return 'no card'; }
        const every = layer.querySelector('.ct-turno-cada');
        every.value = '30';
        every.dispatchEvent(new Event('change', { bubbles: true }));
        layer.querySelector('[data-a="other"]').click();
        // The shuffle (about 2 s) and the name seen big (2.5 s), then the corner.
        await sleep(6000);
        const name = layer.querySelector('.ct-turno-nombre').textContent;
        if (!/^Student \d+$/.test(name)) { return `the card says «${name}»`; }
        if (!layer.classList.contains('ct-turno-mini')) { return 'the card did not step into the corner'; }
        const bar = parseFloat(layer.querySelector('.ct-turno-relevo i').style.width);
        if (!(bar > 0 && bar < 100)) { return `the bar of the relay is at ${bar}%`; }
        if (getComputedStyle(layer).pointerEvents !== 'none') { return 'the card in the corner still covers the material'; }
        await window.shot('turn-relay-corner');
        layer.querySelector('[data-a="stop"]').click();
        every.value = '0';
        return document.querySelector('#h-material .ct-turno') ? '«Stop» did not close the card' : '';
    },
    // Clock: the learning clock with Roman numerals, and back to digits.
    'clock-roman': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-reloj').click();
        await sleep(200);
        document.querySelector('#cl-mode [data-v="learn"]').click();
        await sleep(200);
        const box = document.querySelector('#cl-o-roman');
        if (!box) { return 'no Roman numerals switch'; }
        if (!box.checked) { box.click(); }
        await sleep(200);
        const nums = () => [...document.querySelectorAll('#cl-face .cl-num')].map((x) => x.textContent).join(' ');
        if (nums() !== 'I II III IV V VI VII VIII IX X XI XII') { return `the dial reads «${nums()}»`; }
        await window.shot('clock-roman');
        box.click();
        await sleep(200);
        return nums() === '1 2 3 4 5 6 7 8 9 10 11 12' ? '' : `back to digits, the dial reads «${nums()}»`;
    },
    // Simon: a mistake in round 2 plays round 2 again, not round 1.
    // Simon variants: numbers with a rule (what is shown is not what is pressed), arrows backwards, notes on nine pads.
    'simon-variants': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const S = () => window.ClasstoolsSimon.state();
        const waitInput = async (len) => { for (let i = 0; i < 120; i++) { if (S().state === 'input' && S().seq.length === len) { return true; } await sleep(100); } return false; };
        q('#t-juegos').click();
        await sleep(200);
        q('#ga-mode [data-game="simon"]').click();
        await sleep(200);
        const turns = q('#si-turns');
        turns.value = turns.options[0].value;
        turns.dispatchEvent(new Event('change', { bubbles: true }));
        const pick = (sel, v) => { q(sel).value = v; q(sel).dispatchEvent(new Event('change', { bubbles: true })); };
        try {
            pick('#si-kind', 'numbers');
            pick('#si-rule', 'ten');
            q('#si-order [data-v="same"]').click();
            if (q('#si-board').children.length !== 9 || q('#si-board .ct-pad[data-i="6"]').textContent !== '7' || q('#si-rule-box').hidden) { return 'numbers: not nine pads 1 to 9 with the rule'; }
            // While it plays, the number shown is 10 minus the one to press.
            let seen = '';
            const watch = new MutationObserver(() => { if (q('#si-show').classList.contains('ct-lit')) { seen = q('#si-show').textContent; } });
            watch.observe(q('#si-show'), { attributes: true, childList: true, characterData: true, subtree: true });
            q('#si-start').click();
            if (!await waitInput(1)) { return 'numbers: no turn to answer'; }
            watch.disconnect();
            const answer = S().seq[0] + 1;
            if (Number(seen) !== 10 - answer) { return `numbers: shown ${seen} for ${answer}`; }
            window.ClasstoolsSimon.press(S().seq[0]);
            if (!await waitInput(2)) { return 'numbers: a right answer did not go on'; }
            await window.shot('simon-numbers');
            // Arrows, backwards: four pads in a cross; the second round is pressed last first.
            pick('#si-kind', 'arrows');
            q('#si-order [data-v="reverse"]').click();
            if (q('#si-board').children.length !== 4 || !q('#si-board .ct-pad svg') || !q('#si-pads-box').hidden) { return 'arrows: not four arrows'; }
            q('#si-start').click();
            if (!await waitInput(1)) { return 'arrows: no turn'; }
            window.ClasstoolsSimon.press(S().seq[0]);
            if (!await waitInput(2)) { return 'arrows: round 1 did not go on'; }
            const seq = S().seq.slice();
            window.ClasstoolsSimon.press(seq[1]);
            window.ClasstoolsSimon.press(seq[0]);
            if (!await waitInput(3)) { return `backwards was not taken: ${seq}`; }
            await window.shot('simon-arrows');
            // Notes on nine pads: named, and not lit while the board plays.
            pick('#si-kind', 'notes');
            q('#si-pads [data-n="9"]').click();
            const names = [...q('#si-board').children].map((b) => b.textContent);
            if (names.length !== 9 || names[0] !== 'C' || names[8] !== 'high D') { return `notes: ${names.join(',')}`; }
            let lit = false;
            const watch2 = new MutationObserver(() => { if (q('#si-board .ct-lit')) { lit = true; } });
            watch2.observe(q('#si-board'), { attributes: true, subtree: true });
            q('#si-start').click();
            if (!await waitInput(1)) { return 'notes: no turn'; }
            watch2.disconnect();
            if (lit) { return 'notes: a pad was lit while the board played'; }
        } finally {
            pick('#si-kind', 'colors');
            q('#si-order [data-v="same"]').click();
            q('#si-pads [data-n="4"]').click();
        }
        return '';
    },
    'simon-repeat': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const msg = () => document.querySelector('#si-msg').textContent;
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="simon"]').click();
        await sleep(200);
        const turns = document.querySelector('#si-turns');
        turns.value = turns.options[0].value;
        turns.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('#si-onfail [data-v="repeat"]').click();
        // What the board shows: each pad lit while the board plays the sequence (presses light them too).
        let shown = [];
        const board = document.querySelector('#si-board');
        new MutationObserver((ms) => ms.forEach((m) => {
            const lit = m.target.classList.contains('ct-lit') && !(m.oldValue || '').includes('ct-lit');
            if (lit && board.classList.contains('ct-locked')) { shown.push(Number(m.target.dataset.i)); }
        })).observe(board, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
        const asked = (n) => msg().includes(`Round ${n}`) && /Your turn/.test(msg());
        const waitTurn = async (n) => { for (let i = 0; i < 100 && !asked(n); i++) { await sleep(100); } return asked(n); };
        const press = (i) => document.querySelector(`#si-board .ct-pad[data-i="${i}"]`).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
        document.querySelector('#si-start').click();
        if (!(await waitTurn(1))) { return `round 1 never asked: «${msg()}»`; }
        const first = shown.slice(); shown = [];
        first.forEach(press);
        if (!(await waitTurn(2))) { return `after round 1 the board says «${msg()}»`; }
        const second = shown.slice(); shown = [];
        press((second[0] + 1) % 4);
        await sleep(500);
        if (!(await waitTurn(2))) { return `after a mistake in round 2 the board says «${msg()}»`; }
        return shown.length === 2 && shown.join() === second.join() ? '' : `the sequence played again was ${shown.join()} instead of ${second.join()}`;
    },
    // Levels: in Advanced, the materials and games of other levels wait in «Other levels», and one picked there opens.
    'levels-filter': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const setMode = async (m) => {
            document.querySelector('#b-modo').click();
            await sleep(200);
            document.querySelector(`#menu-modo [data-modo="${m}"]`).click();
            await sleep(300);
        };
        const hiddenIn = (bar, attr) => [...document.querySelectorAll(`${bar} button[data-${attr}]`)].filter((b) => b.hidden).map((b) => b.dataset[attr]);
        try {
            await setMode('advanced');
            document.querySelector('#t-material').click();
            await sleep(300);
            const current = document.querySelector('#mt-mode [aria-checked="true"]').dataset.mode;
            const away = hiddenIn('#mt-mode', 'mode');
            for (const id of ['base10', 'fractions', 'geoboard']) {
                if (id !== current && !away.includes(id)) { return `«${id}» is not among the other levels in Advanced (hidden: ${away.join(', ')})`; }
            }
            if (away.includes('calc') || away.includes('score')) { return `a material of Advanced is hidden: ${away.join(', ')}`; }
            const more = document.querySelector('#h-material .ct-otros');
            if (!more || more.hidden) { return 'no «Other levels» in the materials'; }
            more.querySelector('.ct-otros-boton').click();
            await sleep(200);
            await window.shot('levels-menu');
            more.querySelector('[data-pick="base10"]').click();
            await sleep(400);
            const picked = document.querySelector('#mt-mode [data-mode="base10"]');
            if (picked.hidden || picked.getAttribute('aria-checked') !== 'true') { return 'base 10 blocks did not open from «Other levels»'; }
            if (!document.querySelector('.ct-panel[data-panel="base10"]').offsetParent) { return 'the panel of the base 10 blocks is not shown'; }
            document.querySelector('#t-juegos').click();
            await sleep(300);
            const games = hiddenIn('#ga-mode', 'game'), currentGame = document.querySelector('#ga-mode [aria-checked="true"]').dataset.game;
            if (currentGame !== 'simon' && !games.includes('simon')) { return `Simon is not among the other levels in Advanced (hidden: ${games.join(', ')})`; }
            await setMode('primary');
            const back = hiddenIn('#ga-mode', 'game');
            return back.length ? `in Primary some games are still hidden: ${back.join(', ')}` : '';
        } finally {
            if (document.documentElement.dataset.modo !== 'primary') { await setMode('primary'); }
        }
    },
    // Words in another language: Hangman in French gets the French keyboard, Word follows, the board keeps its own.
    'words-language': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="ahorcado"]').click();
        await sleep(200);
        const own = window.CLASSTOOLS_CONTENT.lang;
        const lang = document.querySelector('#ah-lang');
        if (!lang) { return 'no «Language of the words» in Hangman'; }
        try {
            lang.value = 'fr';
            lang.dispatchEvent(new Event('change', { bubbles: true }));
            for (let i = 0; i < 40 && !document.querySelector('#ah-keys .ct-key[data-k="A"]:first-child'); i++) { await sleep(100); }
            await sleep(300);
            const row = [...document.querySelectorAll('#ah-keys .ct-krow:first-child .ct-key')].map((b) => b.dataset.k).join('');
            if (row !== 'AZERTYUIOP') { return `the first row of the keyboard is «${row}» in French`; }
            if (window.CLASSTOOLS_CONTENT.lang !== own) { return `the board's own content became «${window.CLASSTOOLS_CONTENT.lang}»`; }
            const wo = document.querySelector('#wo-lang');
            if (wo && wo.value !== 'fr') { return `Word did not follow: «${wo.value}»`; }
            document.querySelector('#ah-src').value = 'builtin';
            document.querySelector('#ah-src').dispatchEvent(new Event('change', { bubbles: true }));
            document.querySelector('#ah-start').click();
            await sleep(300);
            await window.shot('words-language');
            return '';
        } finally {
            lang.value = own;
            lang.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(300);
        }
    },
    // Hangman with a glossary of the course: its word, and its definition as the clue.
    'glossary-words': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="ahorcado"]').click();
        await sleep(300);
        const src = document.querySelector('#ah-src');
        if (![...src.options].some((o) => o.value === 'glos:5')) { return 'the glossary is not among the sources'; }
        src.value = 'glos:5';
        src.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(300);
        document.querySelector('#ah-start').click();
        await sleep(300);
        const slots = document.querySelectorAll('#ah-slots .ct-slot').length, clue = document.querySelector('#ah-clue').textContent;
        const entry = GLOSSARY.find((x) => clue.includes(x.c));
        if (!entry) { return `the clue is «${clue}»`; }
        return slots === entry.w.length ? '' : `the word has ${slots} letters for «${entry.w}»`;
    },
    // Pairs with the matching questions of the question bank.
    // Pairs: trios of a number (dots, figure, word), a glance at the start, and the class against the tries.
    'pairs-variants': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const pick = (sel, v) => { q(sel).value = v; q(sel).dispatchEvent(new Event('change', { bubbles: true })); };
        q('#t-juegos').click();
        await sleep(200);
        q('#ga-mode [data-game="parejas"]').click();
        await sleep(300);
        pick('#me-level', 'all');
        pick('#me-src', 'dots');
        if (q('#me-trios-box').hidden) { return 'no trios for the dots'; }
        q('#me-trios').checked = true;
        q('#me-trios').dispatchEvent(new Event('change'));
        q('#me-n [data-n="6"]').click();
        q('#me-who [data-who="class"]').click();
        pick('#me-peek', '0');
        q('#me-start').click();
        await sleep(200);
        const M = window.ClasstoolsMemory, S = M.state();
        if (S.cards.length !== 18 || S.size !== 3) { return `${S.cards.length} cards for 6 trios`; }
        const of = (k) => S.cards.map((c, i) => (c.pair === k ? i : -1)).filter((i) => i >= 0);
        of(0).forEach((i) => M.flip(i));
        if (S.found !== 1) { return 'a trio was not found'; }
        // Two of different trios end the try at once.
        M.flip(of(1)[0]); M.flip(of(2)[0]);
        if (!S.busy || S.moves !== 2) { return 'two cards of different trios did not end the try'; }
        await sleep(1300);
        await window.shot('pairs-trios');
        // A glance: all up, then down.
        pick('#me-src', 'numbers');
        if (!q('#me-trios-box').hidden) { return 'trios offered for a set without them'; }
        pick('#me-peek', '3');
        q('#me-start').click();
        await sleep(300);
        if (document.querySelectorAll('#me-grid .ct-up').length !== M.state().cards.length || !M.state().busy) { return 'not all face up in the glance'; }
        await sleep(3200);
        if (document.querySelectorAll('#me-grid .ct-up').length || M.state().busy) { return 'the glance did not end'; }
        // Against the tries: twice as many as pairs, and out of them, the rest shows.
        pick('#me-peek', '0');
        q('#me-who [data-who="limit"]').click();
        q('#me-start').click();
        await sleep(200);
        const L = M.state();
        if (!/12 tries left/.test(q('#me-msg').textContent)) { return `tries: «${q('#me-msg').textContent}»`; }
        L.tries = 1;
        const a = L.cards.findIndex((c) => c.pair === 0), b = L.cards.findIndex((c) => c.pair === 1);
        M.flip(a); M.flip(b);
        await sleep(1300);
        if (!L.over || !/Out of tries: 0 of 6/.test(q('#me-msg').textContent)) { return `not lost: «${q('#me-msg').textContent}»`; }
        q('#me-who [data-who="class"]').click();
        return '';
    },
    'bank-pairs': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="parejas"]').click();
        await sleep(300);
        const src = document.querySelector('#me-src');
        if (![...src.options].some((o) => o.value === 'bank:9')) { return 'the question bank is not among the sets of pairs'; }
        src.value = 'bank:9';
        src.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(300);
        document.querySelector('#me-start').click();
        await sleep(400);
        const texts = [...document.querySelectorAll('#me-grid .ct-mfront')].map((x) => x.textContent.trim()).sort();
        return texts.join('|') === BANK_PAIRS.flat().sort().join('|') ? '' : `the cards are ${texts.join(', ')}`;
    },
    // Pairs with a glossary of the course: each concept with its definition.
    'glossary-pairs': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="parejas"]').click();
        await sleep(300);
        const src = document.querySelector('#me-src');
        if (![...src.options].some((o) => o.value === 'glos:5')) { return 'the glossary is not among the sets of pairs'; }
        src.value = 'glos:5';
        src.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(300);
        document.querySelector('#me-start').click();
        await sleep(400);
        const texts = [...document.querySelectorAll('#me-grid .ct-mfront')].map((x) => x.textContent.trim()).sort();
        const want = GLOSSARY.flatMap((x) => [x.w, x.c]).sort();
        return texts.join('|') === want.join('|') ? '' : `the cards are ${texts.join(', ')}`;
    },
    // Hangman in Early years: a classmate's photo, the name without its first letter and three letters to choose from.
    'hangman-initial': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const setMode = async (m) => {
            document.querySelector('#b-modo').click();
            await sleep(200);
            document.querySelector(`#menu-modo [data-modo="${m}"]`).click();
            await sleep(300);
        };
        try {
            await setMode('early');
            document.querySelector('#t-juegos').click();
            await sleep(200);
            document.querySelector('#ga-mode [data-game="ahorcado"]').click();
            await sleep(300);
            if (document.querySelector('#ah-kind [aria-checked="true"]').dataset.v !== 'initial') { return 'Early years does not start with the first letter of a name'; }
            document.querySelector('#ah-start').click();
            await sleep(300);
            const ini = window.ClasstoolsHangman.initial();
            const choices = [...document.querySelectorAll('#ah-choices [data-k]')];
            if (choices.length !== 3) { return `${choices.length} letters to choose from`; }
            if (!choices.some((b) => b.dataset.k === ini.letter)) { return `the right letter «${ini.letter}» is not among them`; }
            const first = document.querySelector('#ah-name .ct-slot');
            if (first.textContent) { return 'the first letter is already shown'; }
            if (!document.querySelector('#ah-face').innerHTML) { return 'no face of the classmate'; }
            const wrong = choices.find((b) => b.dataset.k !== ini.letter);
            wrong.click();
            if (!wrong.disabled) { return 'a wrong letter is not put aside'; }
            choices.find((b) => b.dataset.k === ini.letter).click();
            await sleep(200);
            await window.shot('hangman-initial');
            if (!first.textContent) { return 'the right letter did not fill the name'; }
            return /^Yes!/.test(document.querySelector('#ah-msg').textContent) ? '' : `the board says «${document.querySelector('#ah-msg').textContent}»`;
        } finally {
            await setMode('primary');
        }
    },
    // Hangman in Secondary: spent balloons stay grey, and «Uncover a letter» costs one.
    'hangman-uncover': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const setMode = async (m) => {
            document.querySelector('#b-modo').click();
            await sleep(200);
            document.querySelector(`#menu-modo [data-modo="${m}"]`).click();
            await sleep(300);
        };
        try {
            await setMode('secondary');
            document.querySelector('#t-juegos').click();
            await sleep(200);
            document.querySelector('#ga-mode [data-game="ahorcado"]').click();
            await sleep(300);
            if (document.querySelector('#ah-spent [aria-checked="true"]').dataset.v !== 'stay') { return 'in Secondary spent balloons do not stay by default'; }
            document.querySelector('#ah-src').value = 'builtin';
            document.querySelector('#ah-src').dispatchEvent(new Event('change', { bubbles: true }));
            document.querySelector('#ah-start').click();
            await sleep(300);
            const uncover = document.querySelector('#ah-uncover');
            if (uncover.hidden || uncover.disabled) { return 'no «Uncover a letter» while playing'; }
            const before = document.querySelectorAll('#ah-slots .ct-slot.ct-shown').length;
            uncover.click();
            await sleep(200);
            const after = document.querySelectorAll('#ah-slots .ct-slot.ct-shown').length;
            if (after <= before) { return 'no letter was uncovered'; }
            const key = document.querySelector('#ah-keys .ct-key[data-state="correct"]');
            if (!key || getComputedStyle(key).backgroundColor !== 'rgb(6, 126, 54)') { return 'the uncovered letter is not green on the keyboard'; }
            const spent = document.querySelectorAll('#ah-balloons .ct-spent').length, popped = document.querySelectorAll('#ah-balloons .ct-popped').length;
            await window.shot('hangman-uncover');
            return spent === 1 && popped === 0 ? '' : `${spent} grey balloons and ${popped} popped`;
        } finally {
            await setMode('primary');
        }
    },
    // Teacher's guide: the guide of what is on screen (the rods, Simon, «Whose turn?»), with all its parts and sources.
    'teacher-guide': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const open = async () => { document.querySelector('#b-guia').click(); await sleep(250); return document.querySelector('.ct-guia'); };
        const close = async () => { document.querySelector('.ct-guia [data-a="close"]').click(); await sleep(150); };
        const check = (sheet, name) => {
            if (!sheet || sheet.hidden) { return `no guide for ${name}`; }
            // Six parts, and one more with the guided helps of the tool when it has any.
            const parts = sheet.querySelectorAll('.ct-guia-parte').length - (sheet.querySelector('.ct-guia-ayudas') ? 1 : 0);
            if (parts !== 6) { return `${parts} parts in the guide of ${name}`; }
            if (sheet.querySelectorAll('.ct-guia-etapa').length !== 4) { return `the guide of ${name} does not have the four levels`; }
            if (!sheet.querySelector('.ct-guia-fuentes li')) { return `the guide of ${name} has no sources`; }
            if (/gd_/.test(sheet.textContent)) { return `a missing string in the guide of ${name}`; }
            return '';
        };
        document.querySelector('#t-material').click();
        await sleep(200);
        document.querySelector('#mt-mode [data-mode="rods"]').click();
        await sleep(200);
        let sheet = await open();
        let bad = check(sheet, 'the rods');
        if (bad) { return bad; }
        if (!sheet.querySelector('.ct-guia-etapa.ct-ahora')) { return 'the level of the screen is not marked'; }
        await window.shot('teacher-guide');
        sheet.scrollTop = sheet.scrollHeight;
        await sleep(100);
        await window.shot('teacher-guide-end');
        await close();
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="simon"]').click();
        await sleep(200);
        sheet = await open();
        bad = check(sheet, 'Simon');
        if (bad) { return bad; }
        await close();
        document.querySelector('#t-quien').click();
        await sleep(200);
        sheet = await open();
        bad = check(sheet, 'Whose turn?');
        if (bad) { return bad; }
        const link = sheet.querySelector('.ct-guia-fuentes a');
        if (!link || link.target !== '_blank') { return 'the links of the sources do not open in a new tab'; }
        await close();
        document.querySelector('#t-qr').click();
        await sleep(200);
        sheet = await open();
        // Without a guide of its own: the index, and a tap on one opens it; from a guide, back to the index.
        const listed = sheet.querySelectorAll('.ct-guia-indice [data-guide]').length;
        if (listed !== window.ClasstoolsGuide.ids().length) { return `the index lists ${listed} guides`; }
        sheet.querySelector('[data-guide="balanza"]').click();
        await sleep(100);
        if (sheet.querySelector('#gd-title').textContent !== 'Balance scale' || !sheet.querySelector('.ct-guia-trabaja')) { return 'a guide of the index does not open'; }
        sheet.querySelector('[data-a="index"]').click();
        await sleep(100);
        if (sheet.querySelector('#gd-title').textContent !== 'All the guides') { return 'no way back to the index'; }
        await window.shot('guide-index');
        return '';
    },
    // Every guide has all its parts, valid levels and sources, in the language of the board.
    'guides-complete': async () => {
        const { t } = window.ClasstoolsCore;
        const ids = window.ClasstoolsGuide.ids(), bad = [];
        for (const id of ids) {
            for (const part of ['what', 'works', 'why', 'how', 'stages', 'scene', 'sources']) {
                const key = `gd_${id}_${part}`;
                if (t(key) === key) { bad.push(key); }
            }
            const levels = t(`gd_${id}_stages`).split('\n').map((x) => x.split('|')[0]);
            if (!levels.every((m) => ['early', 'primary', 'secondary', 'advanced'].includes(m))) { bad.push(`${id}: levels ${levels.join(',')}`); }
        }
        if (ids.length < 29) { bad.push(`only ${ids.length} guides`); }
        return bad.length ? bad.join('; ') : '';
    },
    // Order: a wrong try sends cards back, then the right order wins.
    // «My exercises»: the box opens empty with the examples as a model; what is saved below the examples (as an older
    // editor let) does not list them twice, and the new exercise stays chosen; before starting, the hint says «Start».
    'exercises-own': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-juegos').click();
        await sleep(200);
        q('#ga-mode [data-game="ordenar"]').click();
        await sleep(200);
        if (!/Start/.test(q('#ordenar-msg').textContent)) { return `hint before starting: ${q('#ordenar-msg').textContent}`; }
        const examples = q('#ordenar-ex').options.length;
        q('#ordenar-edit').click();
        await sleep(200);
        const area = q('#ex-ed-text');
        if (area.value || !area.placeholder.includes('#')) { return `the box opened with «${area.value.slice(0, 40)}», model «${area.placeholder.slice(0, 40)}»`; }
        area.value = area.placeholder + '\n\n# The frog\nEgg\nTadpole\nFrog';
        q('.ct-ex-editor [value="save"]').click();
        await sleep(300);
        const sel = q('#ordenar-ex');
        if (sel.options.length !== examples + 1) { return `${sel.options.length} exercises after saving one (${examples} examples)`; }
        if (sel.selectedIndex !== examples || !/frog/.test(sel.options[sel.selectedIndex].textContent)) { return `chosen after saving: ${sel.options[sel.selectedIndex].textContent}`; }
        // Back as it was.
        q('#ordenar-edit').click();
        await sleep(200);
        q('#ex-ed-text').value = '';
        q('.ct-ex-editor [value="save"]').click();
        await sleep(200);
        return q('#ordenar-ex').options.length === examples ? '' : 'the own exercise did not go';
    },
    'order-game': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="ordenar"]').click();
        await sleep(200);
        document.querySelector('#ordenar-start').click();
        await sleep(200);
        const g = window.ClasstoolsExGames.order, items = g.ex.items;
        const tap = (text) => [...document.querySelectorAll('#ordenar-pool [data-i]')].find((b) => b.textContent === text).click();
        [...items].reverse().forEach(tap);
        await sleep(100);
        document.querySelector('#ordenar-check').click();
        await sleep(200);
        if (g.over) { return 'a reversed order was taken as right'; }
        const back = document.querySelectorAll('#ordenar-pool [data-i]').length;
        if (!back) { return 'no card went back after a wrong try'; }
        items.filter((x, k) => !g.fixed[k]).forEach(tap);
        await sleep(100);
        document.querySelector('#ordenar-check').click();
        await sleep(300);
        await window.shot('order-game');
        return g.over && /order/i.test(document.querySelector('#ordenar-msg').textContent) ? '' : `not finished: «${document.querySelector('#ordenar-msg').textContent}»`;
    },
    // My exercises: the prompt for the teacher's AI carries the game, the topic, the level, the format and an example.
    'exercises-prompt': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="quiensoy"]').click();
        await sleep(200);
        document.querySelector('#quiensoy-edit').click();
        await sleep(200);
        const box = (x) => document.querySelector('#ex-ed-ai ' + x);
        box('details').open = true;
        const topic = box('.ct-ai-topic');
        topic.value = 'Volcanoes';
        topic.dispatchEvent(new Event('input'));
        const level = box('.ct-ai-level');
        level.value = 'secondary';
        level.dispatchEvent(new Event('change'));
        const text = box('.ct-ai-text').value;
        const missing = ['Volcanoes', 'Secondary students', 'Write 5 exercises', '= ', '#'].filter((x) => !text.includes(x));
        if (missing.length) { return `the prompt lacks ${missing.join(', ')}: «${text}»`; }
        // Headless Chrome has no clipboard: a fake one, to see what the button copies.
        let clip = '';
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (x) => { clip = x; return Promise.resolve(); } } });
        box('.ct-ai-copy').click();
        await sleep(300);
        if (clip !== text) { return 'the copy is not the prompt'; }
        await window.shot('exercises-prompt');
        const copied = box('.ct-ai-note').textContent;
        document.querySelector('.ct-ex-editor').close();
        if (!copied) { return 'no message after copying'; }
        // Generate with the AI of the site: the policy first, then the exercises in place of the examples.
        document.querySelector('#quiensoy-edit').click();
        await sleep(200);
        box('details').open = true;
        box('.ct-ai-go').click();
        await sleep(300);
        if (box('.ct-ai-policy').hidden) { return 'no AI policy before the first use'; }
        box('.ct-ai-accept').click();
        await sleep(400);
        const area = document.querySelector('#ex-ed-text').value;
        if (!/^# Volcano/.test(area) || !area.includes('# Island')) { return `the exercises of the AI are not in the box: «${area.slice(0, 80)}»`; }
        if (!/2/.test(box('.ct-ai-note').textContent)) { return `no count of what came: «${box('.ct-ai-note').textContent}»`; }
        const sent = FAKE.calls.filter((c) => c.action === 'generate').pop();
        if (!sent || sent.type !== 'whoami' || sent.topic !== 'Volcanoes' || sent.n !== '5') { return `the request was ${JSON.stringify(sent)}`; }
        await window.shot('exercises-generate');
        document.querySelector('.ct-ex-editor').close();
        // The examples follow the level of the board.
        const titles = () => [...document.querySelectorAll('#quiensoy-ex option')].map((o) => o.textContent).join(' ');
        const setMode = async (m) => {
            document.querySelector('#b-modo').click();
            await sleep(200);
            document.querySelector(`#menu-modo [data-modo="${m}"]`).click();
            await sleep(300);
        };
        const before = titles();
        try {
            await setMode('advanced');
            const after = titles();
            if (after === before || !/Physics/.test(after)) { return `the examples did not change with the level: «${after}»`; }
        } finally {
            await setMode('primary');
        }
        return '';
    },
    // The AI box elsewhere: a rosco filled in by letter, words and pairs added to a list, quiz questions to paste.
    'ai-everywhere': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        // Generate; the first time, the AI policy is accepted.
        const go = async (root) => {
            root.querySelector('details.ct-ai').open = true;
            root.querySelector('.ct-ai-go').click();
            await sleep(300);
            if (!root.querySelector('.ct-ai-policy').hidden) { root.querySelector('.ct-ai-accept').click(); await sleep(400); }
        };
        q('#t-juegos').click();
        await sleep(200);
        q('#ga-mode [data-game="rosco"]').click();
        await sleep(200);
        q('#ro-new').click();
        await sleep(200);
        const ro = q('#ro-editor');
        if (!/these letters: A, B, C/.test(ro.querySelector('.ct-ai-text').value)) { return 'the rosco prompt has no letters'; }
        await go(ro);
        const row = (l) => ro.querySelector(`.ct-rosco-row[data-l="${l}"]`);
        if (row('A').querySelector('.ct-answer').value !== 'apple' || row('X').querySelector('select').value !== 'c') { return 'the rosco lines did not go to their letters'; }
        if (row('C').querySelector('.ct-answer').value) { return 'a line whose answer lacks its letter was taken'; }
        if (!/3/.test(ro.querySelector('.ct-ai-note').textContent)) { return `rosco: «${ro.querySelector('.ct-ai-note').textContent}»`; }
        ro.close();
        // The lists editor: words without numbering, then pairs.
        window.ClasstoolsCore.newList();
        await sleep(200);
        const ed = q('#editor');
        await go(ed);
        if (q('#ed-alumnos').value !== 'volcano\nglacier\nplateau') { return `words: «${q('#ed-alumnos').value}»`; }
        const kind = ed.querySelector('.ct-ai-kind');
        kind.value = 'pairs';
        kind.dispatchEvent(new Event('change'));
        if (!/pairs/.test(ed.querySelector('.ct-ai-text').value)) { return 'the pairs prompt is not asked for'; }
        ed.querySelector('.ct-ai-go').click();
        await sleep(300);
        if (!q('#ed-alumnos').value.endsWith('France = Paris\nItaly = Rome')) { return `pairs: «${q('#ed-alumnos').value}»`; }
        q('#ed-cancelar').click();
        // The quiz: questions to the box of pasted ones.
        q('#t-envivo').click();
        await sleep(200);
        q('#lv-kind [data-v="quiz"]').click();
        await sleep(200);
        q('#qz-edit').click();
        await sleep(300);
        const qz = q('.qz-editor');
        qz.querySelector('details.qz-pegar').open = true;
        await go(qz);
        if (!/Largest planet/.test(qz.querySelector('#qz-paste').value) || !/2/.test(qz.querySelector('.ct-ai-note').textContent)) { return 'the quiz questions are not in the paste box'; }
        await window.shot('ai-quiz');
        qz.closest('dialog').close();
        return '';
    },
    // The fixed remote on the board: turned on (QR and address), a new address on the second tap, an order run.
    'remote-fixed': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-envivo').click();
        await sleep(200);
        q('#lv-kind [data-v="remote"]').click();
        await sleep(200);
        const on = q('#lv-rm [data-rm="on"]');
        if (!on) { return 'no button to turn the fixed remote on'; }
        on.click();
        await sleep(300);
        if (!/mando\.php\?k=key1/.test(q('#lv-rm .ct-rm-url').textContent) || !q('#lv-rm .lv-qr svg')) { return 'no address or QR when on'; }
        q('#lv-rm [data-rm="rotate"]').click();
        await sleep(200);
        if (!/key1/.test(q('#lv-rm .ct-rm-url').textContent)) { return 'the address changed on the first tap'; }
        q('#lv-rm [data-rm="rotate"]').click();
        await sleep(300);
        if (!/key2/.test(q('#lv-rm .ct-rm-url').textContent)) { return 'no new address on the second tap'; }
        // An order from the phone: to the clock.
        await sleep(1800);
        FAKE.remoteCmds = [{ seq: 1, cmd: 'tool_reloj' }];
        for (let i = 0; i < 40 && window.ClasstoolsCore.current() !== 'reloj'; i++) { await sleep(100); }
        if (window.ClasstoolsCore.current() !== 'reloj') { return 'the order of the phone was not run'; }
        const sent = FAKE.calls.filter((c) => c.action === 'poll').pop();
        if (!/quien\|/.test(sent.tools || '')) { return `the board does not say its tools: ${sent.tools}`; }
        q('#t-envivo').click();
        await sleep(300);
        if (!/connected/.test(q('#lv-rm').textContent)) { return 'the phone is not shown as connected'; }
        await window.shot('remote-fixed');
        q('#lv-rm [data-rm="off"]').click();
        await sleep(300);
        return q('#lv-rm [data-rm="on"]') ? '' : 'it did not turn off';
    },
    // The fixed remote on the phone: two open boards to choose from, the orders and the tools for the chosen one.
    'remote-phone': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        for (let i = 0; i < 30 && !q('[data-course]'); i++) { await sleep(100); }
        const boards = [...document.querySelectorAll('[data-course]')].map((b) => b.textContent);
        if (boards.join(',') !== 'One,Two') { return `boards: ${boards}`; }
        q('[data-course="2"]').click();
        await sleep(100);
        q('[data-cmd="pick"]').click();
        await sleep(200);
        let sent = FAKE.calls.filter((c) => c.action === 'command').pop();
        if (!sent || sent.course !== '2' || sent.cmd !== 'pick' || sent.k !== 'key1') { return `sent ${JSON.stringify(sent)}`; }
        q('[data-course="1"]').click();
        await sleep(100);
        // The buttons of the tool on that board first: the main one wide, the one that is on, the steps around their
        // value, a line of text; the orders for any tool, under «More orders».
        const rows = [...document.querySelectorAll('#jn-aqui .jn-fila')].map((r) => [...r.children].map((x) => x.textContent).join('/'));
        if (rows.join(' | ') !== 'No. of groups/Students per group | −/4 groups/+ | Make groups | Starts with A: a fruit | Gone | Deal them out with suspense/Scratch to reveal | Who is playing?/Whole class/Two teams') { return `tool rows: ${rows.join(' | ')}`; }
        // The options: the switches, a long choice as a list, a short one as buttons, each with its name.
        if (q('[data-cmd="x_o1"]').getAttribute('aria-checked') !== 'false' || q('[data-cmd="x_o2"]').getAttribute('aria-checked') !== 'true') { return 'the switches are not as on the board'; }
        const look = q('#jn-aqui select[data-sel]');
        if (!look || look.value !== 'x_o3x0' || look.options.length !== 5 || !/Look/.test(look.closest('label').textContent)) { return 'the long choice is not a list'; }
        q('[data-cmd="x_o1"]').click();
        await sleep(200);
        sent = FAKE.calls.filter((c) => c.action === 'command').pop();
        if (sent.cmd !== 'x_o1' || q('[data-cmd="x_o1"]').getAttribute('aria-checked') !== 'true') { return 'the switch did not go, or did not show it at once'; }
        // On and off look different at a glance: the whole button changes colour.
        const colour = (sel) => getComputedStyle(q(sel)).backgroundColor;
        if (colour('[data-cmd="x_o1"]') !== colour('[data-cmd="x_go"]') || colour('[data-cmd="x_o1"]') === colour('[data-cmd="x_mr"]')) { return `a switch on is not green: ${colour('[data-cmd="x_o1"]')}`; }
        q('[data-cmd="x_o2"]').click();
        await sleep(200);
        if (colour('[data-cmd="x_o2"]') !== colour('[data-cmd="x_mr"]')) { return `a switch off does not look like a plain button: ${colour('[data-cmd="x_o2"]')}`; }
        q('[data-cmd="x_o4x1"]').click();
        await sleep(200);
        if (q('[data-cmd="x_o4x1"]').getAttribute('aria-pressed') !== 'true' || q('[data-cmd="x_o4x0"]').getAttribute('aria-pressed') !== 'false') { return 'the option chosen does not show at once'; }
        look.value = 'x_o3x3';
        look.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(200);
        sent = FAKE.calls.filter((c) => c.action === 'command').pop();
        if (sent.cmd !== 'x_o3x3') { return `the list sent ${JSON.stringify(sent)}`; }
        // Until the board says so, the phone keeps what was touched (the pretend board never changes).
        await sleep(2200);
        if (q('[data-cmd="x_o1"]').getAttribute('aria-checked') !== 'true') { return 'the switch went back before the board could say'; }
        if (!q('[data-cmd="x_go"].grande') || q('[data-cmd="x_md0"]').getAttribute('aria-pressed') !== 'true' || q('[data-cmd="x_mr"]').getAttribute('aria-label') !== 'One more') { return 'the tool buttons do not look as they should'; }
        // The orders for any tool, in the sheet of «More orders».
        if (q('#jn-aqui [data-cmd="pick"]')) { return 'the orders for any tool are among the tool\'s own'; }
        q('#jn-b-mas').click();
        if (q('#jn-hoja').hidden || !q('#jn-hoja [data-cmd="pick"]')) { return 'no sheet of «More orders»'; }
        q('#jn-hoja [data-cerrar]').click();
        if (!q('#jn-hoja').hidden) { return 'the sheet did not close'; }
        // The tool on the board, with its icon; the main button with the board's icon; the student's button.
        if (!/Groups/.test(q('#jn-herr').textContent) || !q('#jn-herr svg') || q('#jn-b-alumno').hidden) { return 'no tool on top, or no button for a student'; }
        q('[data-cmd="x_mr"]').click();
        await sleep(200);
        sent = FAKE.calls.filter((c) => c.action === 'command').pop();
        if (sent.cmd !== 'x_mr' || sent.course !== '1' || !/One more/.test(q('#jn-hecho').textContent)) { return `tool button sent ${JSON.stringify(sent)}`; }
        // A button the board no longer has: the phone asks again what there is.
        const asked = FAKE.calls.filter((c) => c.action === 'state').length;
        q('[data-cmd="x_old"]').click();
        await sleep(300);
        if (FAKE.calls.filter((c) => c.action === 'state').length <= asked) { return 'it did not ask again after a button that is gone'; }
        q('#jn-herr').click();
        if (q('#jn-hoja [aria-current="true"]').dataset.cmd !== 'tool_grupos') { return 'the tool on the board is not marked'; }
        q('#jn-hoja [data-cmd="tool_reloj"]').click();
        if (!q('#jn-hoja').hidden) { return 'the sheet of tools stayed open'; }
        await sleep(200);
        sent = FAKE.calls.filter((c) => c.action === 'command').pop();
        if (sent.cmd !== 'tool_reloj' || sent.course !== '1') { return `tool sent ${JSON.stringify(sent)}`; }
        if (!/sent/.test(q('#jn-hecho').textContent)) { return 'no word that it was sent'; }
        // New orders on the phone.
        q('#jn-b-mas').click();
        for (const cmd of ['live', 'relay', 'curtain', 'reveal']) { if (!q(`#jn-hoja [data-cmd="${cmd}"]`)) { return `no button for ${cmd}`; } }
        q('#jn-hoja [data-cerrar]').click();
        // A student presses: only the main button, which rests after a press; leaving is holding.
        q('#jn-b-alumno').click();
        await sleep(100);
        const kidButton = q('#jn-nino #jn-nino-boton');
        if (!kidButton || kidButton.dataset.cmd !== 'x_go' || !/Make groups/.test(kidButton.textContent)) { return 'no main button for a student'; }
        kidButton.click();
        await sleep(200);
        sent = FAKE.calls.filter((c) => c.action === 'command').pop();
        if (sent.cmd !== 'x_go') { return `the student's press sent ${JSON.stringify(sent)}`; }
        if (!q('#jn-nino-boton').disabled || !q('#jn-nino .jn-confeti i')) { return 'the button does not rest after a press'; }
        await window.shot('remote-kid');
        q('#jn-nino-salir').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        await sleep(300);
        document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        await sleep(1100);
        if (!q('#jn-nino')) { return 'a short press left the student\'s screen'; }
        q('#jn-nino-salir').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        await sleep(1400);
        if (q('#jn-nino')) { return 'holding did not leave the student\'s screen'; }
        // Changing the class: the teacher's other courses, and the board goes to the one chosen.
        q('[data-course="1"]').click();
        await sleep(100);
        q('#jn-b-clase').click();
        for (let i = 0; i < 30 && !q('[data-goto]'); i++) { await sleep(100); }
        const others = [...document.querySelectorAll('[data-goto]')].map((b) => b.textContent);
        if (others.join(',') !== 'Language 5,Maths 6') { return `courses: ${others}`; }
        q('[data-goto="8"]').click();
        await sleep(200);
        sent = FAKE.calls.filter((c) => c.action === 'command').pop();
        if (sent.cmd !== 'course_8' || sent.course !== '1') { return `course sent ${JSON.stringify(sent)}`; }
        if (!/Maths 6/.test(q('#jn-hecho').textContent)) { return 'no word of the new class'; }
        await window.shot('remote-phone');
        return '';
    },
    // Sort: every card into its box; then Venn with its zones; then the odd one out.
    'sort-game': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="clasificar"]').click();
        await sleep(200);
        const g = window.ClasstoolsExGames.sort;
        const play = async (mode) => {
            document.querySelector(`#clasificar-mode [data-v="${mode}"]`).click();
            await sleep(100);
            document.querySelector('#clasificar-start').click();
            await sleep(200);
        };
        const zoneOf = (item) => {
            const groups = g.ex.groups;
            if (g.mode === 'venn') { const a = groups[0].items.includes(item), b = groups[1].items.includes(item); return a && b ? 'ab' : (a ? 'a' : 'b'); }
            return String(groups.findIndex((x) => x.items.includes(item)));
        };
        for (const mode of ['sort', 'venn']) {
            await play(mode);
            for (const item of g.items.slice()) {
                [...document.querySelectorAll('#clasificar-pool [data-item]')].find((b) => b.dataset.item === item).click();
                document.querySelector(`#clasificar-boxes [data-zone="${zoneOf(item)}"]`).click();
            }
            await sleep(100);
            if (mode === 'venn') { await window.shot('sort-venn'); }
            document.querySelector('#clasificar-check').click();
            await sleep(300);
            if (!g.over) { return `${mode}: not finished («${document.querySelector('#clasificar-msg').textContent}»)`; }
        }
        await play('odd');
        const cards = [...document.querySelectorAll('#clasificar-pool [data-item]')];
        if (cards.length !== 4) { return `${cards.length} cards in the odd one out`; }
        cards.find((b) => b.dataset.item !== g.round.odd).click();
        if (g.over) { return 'a wrong odd one out ended the round'; }
        cards.find((b) => b.dataset.item === g.round.odd).click();
        await sleep(200);
        await window.shot('sort-odd');
        return g.over ? '' : 'the odd one out did not end the round';
    },
    // Spot the mistakes: a right word shakes; each mistake, found and then corrected.
    'errors-game': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="errores"]').click();
        await sleep(200);
        document.querySelector('#errores-start').click();
        await sleep(200);
        const g = window.ClasstoolsExGames.errors;
        document.querySelector('#errores-text [data-w]:not([data-mark])').click();
        if (g.found.some(Boolean)) { return 'a right word counted as a mistake'; }
        for (let n = 0; n < g.ex.marks.length; n++) {
            document.querySelector(`#errores-text [data-mark="${n}"]`).click();
            await sleep(50);
            if (n === 0) { await window.shot('errors-found'); }
            document.querySelector(`#errores-text [data-mark="${n}"]`).click();
            await sleep(50);
        }
        await sleep(200);
        await window.shot('errors-game');
        return g.over ? '' : `not finished: «${document.querySelector('#errores-msg').textContent}»`;
    },
    // Who am I?: each clue lowers the points; «Got it!» gives what it is worth.
    'whoami-game': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-juegos').click();
        await sleep(200);
        document.querySelector('#ga-mode [data-game="quiensoy"]').click();
        await sleep(200);
        document.querySelector('#quiensoy-start').click();
        await sleep(200);
        document.querySelector('#quiensoy-clue').click();
        document.querySelector('#quiensoy-clue').click();
        await sleep(100);
        if (document.querySelectorAll('#quiensoy-clues li').length !== 3) { return 'the clues do not come out one by one'; }
        if (!/60/.test(document.querySelector('#quiensoy-msg').textContent)) { return `three clues are worth «${document.querySelector('#quiensoy-msg').textContent}»`; }
        await window.shot('whoami-clues');
        document.querySelector('#quiensoy-right').click();
        await sleep(300);
        const card = document.querySelector('#quiensoy-card').textContent, msg = document.querySelector('#quiensoy-msg').textContent;
        return card === 'Marie Curie' && /60/.test(msg) ? '' : `the end says «${card}» and «${msg}»`;
    },
    // Dice: a thousand throws of two dice give the eleven sums, with the line of what is expected.
    // The teacher's stickers: «Many throws» is a real use of the dice; its sticker comes in, once a day.
    'stickers': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        Object.keys(localStorage).filter((k) => k.includes('logro-')).forEach((k) => localStorage.removeItem(k));
        q('#t-azar').click();
        await sleep(200);
        q('#ch-mode [data-mode="dice"]').click();
        await sleep(200);
        q('#di-many').value = '100';
        q('#di-many-go').click();
        await sleep(400);
        const sent = FAKE.calls.filter((c) => c.cromo);
        if (sent.length !== 1 || sent[0].cromo !== 'tiradados') { return `sent ${JSON.stringify(sent)}`; }
        const layer = q('.ct-logro');
        if (!layer || !layer.querySelector('svg.cr-cromo') || !/sticker/i.test(layer.textContent)) { return 'the sticker did not come in'; }
        await sleep(700);
        await window.shot('sticker');
        layer.click();
        await sleep(500);
        q('#di-many-go').click();
        await sleep(300);
        if (FAKE.calls.filter((c) => c.cromo).length !== 1) { return 'the same sticker was sent twice in a day'; }
        // A level up shows its sticker too.
        window.ClasstoolsLogros.show('cumplemetas', 3);
        return q('.ct-logro svg') ? '' : 'no drawing for a level up';
    },
    'dice-frequencies': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-azar').click();
        await sleep(200);
        document.querySelector('#ch-mode [data-mode="dice"]').click();
        await sleep(200);
        document.querySelector('#di-count [data-n="2"]').click();
        await sleep(100);
        document.querySelector('#di-many').value = '1000';
        document.querySelector('#di-many-go').click();
        await sleep(400);
        const cols = [...document.querySelectorAll('#di-freq .ct-freq-col')];
        if (cols.length !== 11) { return `${cols.length} columns for two dice`; }
        const total = cols.reduce((a, c) => a + Number(c.querySelector('.ct-freq-n').textContent), 0);
        if (total !== 1000) { return `${total} throws counted`; }
        if (cols[0].querySelector('.ct-freq-k').textContent !== '2' || cols[10].querySelector('.ct-freq-k').textContent !== '12') { return 'the sums do not go from 2 to 12'; }
        await window.shot('dice-frequencies');
        document.querySelector('#di-count [data-n="1"]').click();
        await sleep(200);
        if (!document.querySelector('#di-freq').hidden) { return 'the chart of two dice stayed with one'; }
        return '';
    },
    // Base blocks in base 5: 69 is 2 × 25 + 3 × 5 + 4, «234 in base 5», and five ones swap for one block of 5.
    // Number line: intervals written three ways, an end opened with a tap, one at random hidden; the frog of Early years.
    'number-line-intervals': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="line"]').click();
        await sleep(200);
        q('#nl-preset').value = 'negative';
        q('#nl-preset').dispatchEvent(new Event('change'));
        q('#nl-kind [data-v="intervals"]').click();
        await sleep(100);
        const show = async (text) => { q('#nl-iv').value = text; q('#nl-iv-put').click(); await sleep(60); return q('#nl-sum').textContent.replace(/\s+/g, ' '); };
        const want = {
            '[-2, 3)': '[−2, 3) · −2 ≤ x < 3',
            '|x - 1| < 2': '(−1, 3) · −1 < x < 3 · |x − 1| < 2',
            'x >= 4': '[4, +∞) · x ≥ 4',
            '|x| > 3': '(−∞, −3) ∪ (3, +∞) · x < −3 or x > 3 · |x| > 3',
            '-1 < x <= 4': '(−1, 4] · −1 < x ≤ 4',
        };
        for (const [text, out] of Object.entries(want)) {
            const got = await show(text);
            if (got !== out) { return `«${text}» gives «${got}», not «${out}»`; }
        }
        await show('[-2, 3)');
        // A tap on the end at −2 opens it.
        const ends = [...document.querySelectorAll('#nl-svg .ct-nl-end')];
        const r = ends[0].getBoundingClientRect();
        q('#nl-svg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
        await sleep(80);
        if (!q('#nl-sum').textContent.startsWith('(−2, 3)')) { return `the end did not open: «${q('#nl-sum').textContent}»`; }
        await window.shot('number-line-interval');
        const N = window.ClasstoolsNumberLine;
        if (N.parseIntervals('[3, 1]') || N.parseIntervals('x = 2') || N.parseIntervals('(-2,5; 3]')[0].a !== -2.5) { return 'bad intervals taken, or decimals misread'; }
        q('#nl-iv-hide').click();
        q('#nl-iv-random').click();
        await sleep(80);
        if (!/How is it written/.test(q('#nl-sum').textContent)) { return `the notation of a random one is not hidden: «${q('#nl-sum').textContent}»`; }
        q('#nl-sum').click();
        await sleep(80);
        if (!/[[(]/.test(q('#nl-sum').textContent)) { return 'the hidden notation does not show'; }
        q('#nl-iv-hide').click();
        // Early years: jumps, with a frog.
        const setMode = async (m) => { q('#b-modo').click(); await sleep(200); q(`#menu-modo [data-modo="${m}"]`).click(); await sleep(300); };
        try {
            await setMode('early');
            q('#nl-kind [data-v="jumps"]').click();
            await sleep(100);
            const svg = q('#nl-svg').getBoundingClientRect();
            q('#nl-svg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: svg.left + svg.width * 0.3, clientY: svg.top + svg.height * 0.6 }));
            await sleep(100);
            if (!q('#nl-svg .ct-nl-frog')) { return 'no frog in Early years'; }
            await window.shot('number-line-frog');
        } finally {
            await setMode('primary');
        }
        return '';
    },
    // Coordinate plane: points in four quadrants joined as vectors, then a whole game of battleship by two teams.
    'coordinate-plane': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="plano"]').click();
        await sleep(200);
        q('#pl-kind [data-v="points"]').click();
        q('#pl-quad [data-v="4"]').click();
        q('#pl-empty').click();
        for (const text of ['(3, 2)', '-2,4', '(−2, −3)']) { q('#pl-xy').value = text; q('#pl-add').click(); }
        await sleep(100);
        if (q('#pl-list').textContent.replace(/\s+/g, ' ') !== 'A(3, 2) B(−2, 4) C(−2, −3)') { return `points: «${q('#pl-list').textContent}»`; }
        q('#pl-join').value = 'vectors';
        q('#pl-join').dispatchEvent(new Event('change'));
        await sleep(100);
        const parts = [...document.querySelectorAll('#pl-svg .componentes')].map((x) => x.textContent);
        if (parts.join(' ') !== '(−5, 2) (0, −7)') { return `vectors: ${parts.join(' ')}`; }
        // Tapping a point takes it away.
        q('#pl-svg circle[data-x="-2"][data-y="-3"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await sleep(100);
        if (window.ClasstoolsPlane.state().points.length !== 2) { return 'a tapped point did not go away'; }
        await window.shot('plane-vectors');
        q('#pl-kind [data-v="fleet"]').click();
        q('#pl-teams [data-v="2"]').click();
        q('#pl-new').click();
        await sleep(100);
        const P = window.ClasstoolsPlane, f = () => P.state().fleet;
        const ships = f().ships, onShip = new Set(ships.flat().map(([x, y]) => `${x},${y}`));
        let water = null;
        for (let x = -6; x <= 6 && !water; x++) { for (let y = -6; y <= 6; y++) { if (!onShip.has(`${x},${y}`)) { water = [x, y]; break; } } }
        P.fire(...water);
        if (f().turn !== 1 || !/water/.test(q('#pl-msg').textContent)) { return `water: turn ${f().turn}, «${q('#pl-msg').textContent}»`; }
        P.fire(...water);
        if (!/already/.test(q('#pl-msg').textContent)) { return 'a point called twice is not noticed'; }
        ships[0].forEach(([x, y]) => P.fire(x, y));
        if (!P.isSunk(0) || f().hits[1] !== ships[0].length || f().turn !== 1) { return 'a hit does not keep the turn, or the ship is not sunk'; }
        await sleep(100);
        await window.shot('plane-fleet');
        ships.slice(1).forEach((s) => s.forEach(([x, y]) => P.fire(x, y)));
        if (!f().over || !/sunk/.test(q('#pl-msg').textContent)) { return `not over: «${q('#pl-msg').textContent}»`; }
        if (ships.length !== 7) { return `${ships.length} ships`; }
        return '';
    },
    // Balance scale: weights compared, then an equation worked out taking the same off both pans.
    'balance-scale': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="balanza"]').click();
        await sleep(200);
        q('#ba-kind [data-v="compare"]').click();
        if (!q('#ba-numbers').checked) { q('#ba-numbers').click(); }
        q('#ba-empty').click();
        q('#ba-add [data-side="l"] [data-add="5"]').click();
        q('#ba-add [data-side="r"] [data-add="2"]').click();
        q('#ba-add [data-side="r"] [data-add="2"]').click();
        await sleep(100);
        if (q('#ba-text').textContent !== '5 > 4') { return `compare: «${q('#ba-text').textContent}»`; }
        if (!/^-/.test(q('#ba-beam').style.getPropertyValue('--a'))) { return `the beam does not lean left: ${q('#ba-beam').style.getPropertyValue('--a')}`; }
        q('#ba-add [data-side="r"] [data-add="1"]').click();
        await sleep(100);
        if (q('#ba-text').textContent !== '5 = 5' || q('#ba-beam').style.getPropertyValue('--a') !== '0deg') { return 'equal weights do not balance'; }
        await sleep(800);
        await window.shot('balance-compare');
        q('#ba-kind [data-v="equation"]').click();
        q('#ba-eq').value = '2x + 3 = 11';
        q('#ba-put').click();
        await sleep(100);
        if (q('#ba-text').textContent !== '2x + 3 = 11') { return `equation: «${q('#ba-text').textContent}»`; }
        // A one off the left pan only: it tips; undone.
        q('#ba-l .ct-ba-u').click();
        await sleep(100);
        if (q('#ba-text').textContent !== '2x + 2 < 11' || !q('#ba-note').textContent) { return `one pan only: «${q('#ba-text').textContent}»`; }
        await sleep(800);
        await window.shot('balance-tipped');
        q('#ba-undo').click();
        for (let i = 0; i < 3; i++) { q('#ba-one').click(); }
        await sleep(100);
        if (q('#ba-text').textContent !== '2x = 8') { return `after taking 3 off each: «${q('#ba-text').textContent}»`; }
        q('#ba-share').click();
        await sleep(900);
        await window.shot('balance-equation');
        const st = window.ClasstoolsBalance;
        if (q('#ba-text').textContent !== 'x = 4' || !st.solved() || !/4/.test(q('#ba-note').textContent)) { return `not worked out: «${q('#ba-text').textContent}» «${q('#ba-note').textContent}»`; }
        // Worked out, the box stays closed: «Open the boxes» is the check at the end.
        if (q('.ct-ba-x').textContent !== 'x') { return `the box opened by itself: ${q('.ct-ba-x').textContent}`; }
        q('#ba-reveal').click();
        if (q('.ct-ba-x').textContent !== '4') { return `opened: ${q('.ct-ba-x').textContent}`; }
        if (st.parse('3x = 7') || st.parse('x + 5 = 2') || !st.parse('4x + 1 = 2x + 9')) { return 'equations without a whole positive solution are taken, or good ones refused'; }
        return '';
    },
    'base-blocks': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#t-material').click();
        await sleep(200);
        document.querySelector('#mt-mode [data-mode="base10"]').click();
        await sleep(200);
        const base = document.querySelector('#b10-base');
        base.value = '5';
        base.dispatchEvent(new Event('change', { bubbles: true }));
        const cols = document.querySelector('#b10-cols');
        cols.value = '3';
        cols.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('#b10-number').value = '69';
        document.querySelector('#b10-put').click();
        await sleep(300);
        const st = window.ClasstoolsBase10.state(), sum = document.querySelector('#b10-sum').textContent;
        if (st.n.slice(0, 3).join() !== '4,3,2') { return `69 in base 5 gave ${st.n.join()}`; }
        if (!sum.includes('234') || !sum.includes('5')) { return `the sum says «${sum}»`; }
        for (let i = 0; i < 1; i++) { document.querySelector('[data-more="0"]').click(); await sleep(50); }
        const group = document.querySelector('#b10-mat [data-group="0"]');
        if (!group) { return 'no swap with five ones'; }
        await window.shot('base-blocks');
        group.click();
        await sleep(500);
        const after = window.ClasstoolsBase10.state().n.slice(0, 3).join();
        base.value = '10';
        base.dispatchEvent(new Event('change', { bubbles: true }));
        return after === '0,4,2' ? '' : `after the swap: ${after}`;
    },
    // QR: the colours of the corners line up as the colours above them, with «Same» on a line of its own.
    'qr-swatches': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const tab = document.querySelector('#t-qr');
        if (!tab) { return 'no QR tab'; }
        tab.click();
        await sleep(300);
        const tops = (sel) => [...new Set([...document.querySelectorAll(`${sel} .ct-swatch:not(.ct-same)`)].map((b) => Math.round(b.getBoundingClientRect().top)))];
        const colours = tops('#qr-color'), corners = tops('#qr-eyecolor');
        if (colours.length !== 1) { return `the colours take ${colours.length} lines`; }
        if (corners.length !== 1) { return `the colours of the corners take ${corners.length} lines`; }
        await window.shot('qr-swatches');
        return '';
    },
    // The exit ticket on the board: prepared before the session, opened with its questions, who has handed it in while
    // it is open, and once closed the faces of the class, the answers hidden until asked for, in piles by face, one
    // at random, taken off the screen, and the download.
    'exit-ticket': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        const until = async (s) => { for (let i = 0; i < 100 && !q(s); i++) { await sleep(50); } return q(s); };
        const devices = ['a', 'b', 'c', 'd'].map((x) => ({ device: x.repeat(32), name: '', team: 0 }));
        const L = { round: 0, open: false, feel: true, prompts: [], tickets: [], ended: false };
        window.FAKE.live = (c) => {
            if (c.action === 'open') { L.round++; L.open = true; L.feel = c.feel === '1'; L.prompts = JSON.parse(c.prompts); L.tickets = []; }
            if (c.action === 'close') { L.open = false; }
            if (c.action === 'reopen') { L.open = true; }
            if (c.action === 'end') { L.ended = true; }
            return { id: 8, code: 'EXIT42', kind: 'exit', identity: 'anon', round: L.round, open: L.open, left: 0, show: false, ended: L.ended,
                others: 0, notice: false, url: 'https://example.org/local/oksigeniaclasstools/join.php?c=EXIT42', devices,
                feel: L.feel, prompts: L.prompts, tickets: L.tickets };
        };
        (await until('#t-envivo')).click();
        (await until('#lv-kind [data-v="exit"]')).click();
        const first = await until('#ex-q0');
        if (!first) { return 'no editor for the ticket before the session'; }
        if (!q('#ex-open').hidden || q('#ex-first').hidden) { return 'the ticket can be opened before the session'; }
        if (window.ClasstoolsGuide.which() !== 'salida') { return `the guide is «${window.ClasstoolsGuide.which()}»`; }
        // A question from the ideas, another written, the third empty.
        const pick = q('#lv-stage select[data-i="1"]');
        pick.value = pick.querySelector('optgroup option:nth-child(2)').value;
        pick.dispatchEvent(new Event('change'));
        if (q('#ex-q1').value !== pick.querySelector('optgroup option:nth-child(2)').value) { return 'the idea did not reach the question'; }
        q('#ex-q0').value = 'What is a fraction?'; q('#ex-q0').dispatchEvent(new Event('input'));
        q('#ex-q2').value = ''; q('#ex-q2').dispatchEvent(new Event('input'));
        await sleep(600);
        await window.shot('exit-editor');
        q('#lv-start').click();
        (await until('#ex-open:not([hidden])')).click();
        const opened = window.FAKE.calls.filter((c) => c.action === 'open').pop();
        if (!opened || opened.feel !== '1' || JSON.parse(opened.prompts).length !== 2) { return `opened with ${JSON.stringify(opened)}`; }
        if (!await until('#ex-count')) { return 'no count while it is open'; }
        L.tickets = [{ device: devices[0].device, name: '', feel: '0', texts: ['Parts of a whole', 'Why 2/4 = 1/2?'], t: 1 }];
        await sleep(1800);
        if (!/1/.test(q('#ex-count').textContent) || !q('#ex-done li')) { return `count: ${q('#ex-count').textContent}`; }
        if (q('#ex-missing').children.length !== 3) { return `missing: ${q('#ex-missing').children.length}`; }
        if (document.querySelector('.ex-tarjeta')) { return 'answers on screen while it is open'; }
        await window.shot('exit-open');
        L.tickets.push({ device: devices[1].device, name: '', feel: '3', texts: ['A part', ''], t: 2 },
            { device: devices[2].device, name: '', feel: '0', texts: ['', 'Equivalent ones'], t: 3 },
            { device: devices[3].device, name: '', feel: '2', texts: ['', ''], t: 4 });
        q('#ex-close').click();
        await until('#ex-bars .lv-barra');
        const counts = [...document.querySelectorAll('#ex-bars .lv-barra strong')].map((x) => x.textContent).join(',');
        if (counts !== '1,1,0,2') { return `faces counted ${counts}`; }
        if (q('#ex-veil').hidden || !q('#ex-piles').hidden) { return 'the answers show before asking for them'; }
        await window.shot('exit-closed');
        q('#ex-show').click();
        const piles = [...document.querySelectorAll('.ex-monton')].map((m) => m.querySelectorAll('.ex-tarjeta').length).join(',');
        if (piles !== '2,0,0,1') { return `piles ${piles}`; }
        await window.shot('exit-piles');
        q('#ex-random').click();
        if (q('#ex-random-card').hidden || !q('.ex-azar-in p')) { return 'nothing at random'; }
        await window.shot('exit-random');
        q('#ex-random-card [data-a="close"]').click();
        q('.ex-monton .ex-quita').click();
        if (document.querySelectorAll('.ex-tarjeta').length !== 2) { return 'a card taken off the screen is still there'; }
        let csv = '';
        const make = URL.createObjectURL;
        URL.createObjectURL = (b) => { b.text().then((x) => { csv = x; }); return make.call(URL, b); };
        q('#ex-csv').click();
        await sleep(200);
        URL.createObjectURL = make;
        const lines = csv.replace('\ufeff', '').split('\r\n');
        if (lines.length !== 5 || !lines[0].includes('What is a fraction?') || !lines[1].includes('Why 2/4 = 1/2?')) { return `download: ${csv}`; }
        q('#ex-new').click();
        if (!await until('#ex-q0') || q('#ex-q0').value !== 'What is a fraction?' || q('#ex-back').hidden) { return 'another ticket does not start from the last one'; }
        return '';
    },
    // The exit ticket on a student's device: faces and questions, handed in, the ticket to show, changed, and closed.
    'exit-device': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        const until = async (s) => { for (let i = 0; i < 100 && !q(s); i++) { await sleep(50); } return q(s); };
        const D = window.FAKE.device;
        if (!await until('.jn-cara-op')) { return 'no faces'; }
        if (document.querySelectorAll('.jn-cara-op').length !== 4 || document.querySelectorAll('.jn-ex-q textarea').length !== 2) { return 'the ticket is not complete'; }
        q('.jn-ex button[type="submit"]').click();
        if (q('#jn-ex-empty').hidden) { return 'an empty ticket was handed in'; }
        q('.jn-cara-op[data-feel="1"]').click();
        const box = document.querySelectorAll('.jn-ex-q textarea');
        box[0].value = 'Fractions are parts'; box[0].dispatchEvent(new Event('input'));
        await window.shot('exit-device-form');
        await sleep(1700);   // a poll in between does not lose what is written
        if (document.querySelectorAll('.jn-ex-q textarea')[0].value !== 'Fractions are parts') { return 'the text was lost'; }
        q('.jn-ex button[type="submit"]').click();
        if (!await until('.jn-billete')) { return 'no ticket after handing it in'; }
        if (D.mine.feel !== '1' || D.mine.texts[0] !== 'Fractions are parts' || D.mine.texts[1] !== '') { return `sent ${JSON.stringify(D.mine)}`; }
        await window.shot('exit-device-sent');
        q('#jn-ex-change').click();
        if (!q('.jn-cara-op[data-feel="1"].mia') || document.querySelectorAll('.jn-ex-q textarea')[0].value !== 'Fractions are parts') { return 'changing it starts empty'; }
        D.open = false;
        for (let i = 0; i < 60 && !q('.jn-centro .jn-billete'); i++) { await sleep(100); }
        if (!q('.jn-centro .jn-billete')) { return 'no ticket once closed'; }
        return '';
    },
    // Simon with syllables: the pads have the word's syllables and others, the word is the sequence, it shows whole
    // when it is done, the words get longer, and «it is written» shows it at once for them to split it (backwards too).
    'simon-syllables': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const S = () => window.ClasstoolsSimon.state();
        const waitInput = async () => { for (let i = 0; i < 150; i++) { if (S().state === 'input') { return true; } await sleep(100); } return false; };
        const pick = (sel, v) => { q(sel).value = v; q(sel).dispatchEvent(new Event('change', { bubbles: true })); };
        q('#t-juegos').click();
        await sleep(200);
        q('#ga-mode [data-game="simon"]').click();
        await sleep(200);
        pick('#si-turns', '');
        if (![...q('#si-kind').options].some((o) => o.value === 'syllables')) { return 'no syllables with the Spanish content'; }
        pick('#si-kind', 'syllables');
        pick('#si-syl', 'watch');
        q('#si-order [data-v="same"]').click();
        q('#si-onfail [data-v="repeat"]').click();
        if (q('#si-syl-box').hidden || q('#si-pads-box').hidden) { return 'the options of syllables do not show'; }
        q('#si-start').click();
        const done = [];
        for (let w = 0; w < 3; w++) {
            if (!await waitInput()) { return `no turn for word ${w + 1}`; }
            const st = S();
            const pads = [...document.querySelectorAll('#si-board .ct-pad')].map((p) => p.textContent);
            if (!st.word.every((x) => pads.includes(x))) { return `the pads ${pads} lack syllables of ${st.word.join('-')}`; }
            if (new Set(pads).size !== pads.length || ![4, 6, 9].includes(pads.length)) { return `pads: ${pads}`; }
            if (w === 0) { await window.shot('simon-syllables'); }
            st.seq.slice().forEach((i) => window.ClasstoolsSimon.press(i));
            await sleep(150);
            if (q('#si-show').textContent !== st.word.join('')) { return `the word shown is «${q('#si-show').textContent}»`; }
            done.push(st.word.length);
            await sleep(900);
        }
        if (done.join() !== '2,2,3') { return `word lengths ${done}`; }
        // Written, backwards.
        q('#si-order [data-v="reverse"]').click();
        pick('#si-syl', 'read');
        q('#si-start').click();
        if (!await waitInput()) { return 'no turn when it is written'; }
        const st = S();
        if (q('#si-show').textContent !== st.word.join('')) { return `written: «${q('#si-show').textContent}»`; }
        await window.shot('simon-syllables-read');
        st.seq.slice().reverse().forEach((i) => window.ClasstoolsSimon.press(i));
        await sleep(150);
        if (S().words !== 1) { return 'backwards did not count'; }
        q('#si-order [data-v="same"]').click();
        pick('#si-syl', 'watch');
        pick('#si-kind', 'colors');
        return '';
    },
    // Printed cards: from «Hands up or cards», the dialog with the class lists, the page of the card that is turned
    // (two to a page, a name on each, the four sides) and of the sets, and each answer to its place with the talk timer.
    'printed-cards': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        const until = async (s) => { for (let i = 0; i < 100 && !q(s); i++) { await sleep(50); } return q(s); };
        (await until('#t-envivo')).click();
        (await until('#lv-kind [data-v="hands"]')).click();
        if (window.ClasstoolsGuide.which() !== 'tarjetas') { return `the guide is «${window.ClasstoolsGuide.which()}»`; }
        (await until('#lv-hprint')).click();
        const dialog = await until('#tc-dialogo[open]');
        if (!dialog) { return 'no dialog to print'; }
        const fors = [...q('#tc-for').options].map((o) => o.value);
        if (!fors[0] || fors[fors.length - 1] !== '') { return `for: ${fors}`; }
        dialog.close();
        const C = window.ClasstoolsCards;
        const names = window.CLASSTOOLS.lists[0].students.map((x) => x.n);
        const show = async (format, name) => {
            const frame = document.createElement('iframe');
            frame.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99;background:#fff;border:0';
            frame.srcdoc = C.print(format, names, true);
            document.body.append(frame);
            await sleep(500);
            const doc = frame.contentDocument;
            const out = { pages: doc.querySelectorAll('.pagina').length, cards: doc.querySelectorAll('.girar, .carta').length, text: doc.body.textContent };
            await window.shot(name);
            frame.remove();
            return out;
        };
        const rotate = await show('rotate', 'cards-rotate');
        if (rotate.pages !== 4 || rotate.cards !== 8 || !rotate.text.includes(names[7])) { return `turned card: ${JSON.stringify({ ...rotate, text: '' })}`; }
        const four = await show('four', 'cards-four');
        if (four.pages !== 8 || four.cards !== 32) { return `four cards: ${JSON.stringify({ ...four, text: '' })}`; }
        // In groups: four places with their hands, and the timer.
        q('#lv-vote').value = 'abcd'; q('#lv-vote').dispatchEvent(new Event('change'));
        q('#lv-hbars [data-o="B"][data-d="1"]').click();
        q('#lv-hgroups').click();
        if (document.querySelectorAll('.tc-zona').length !== 4 || !/1/.test(document.querySelectorAll('.tc-zona')[1].textContent)) { return 'no groups'; }
        q('#tc-talk').click();
        await sleep(400);
        if (!/1:5\d|2:00/.test(q('#tc-say').textContent)) { return `timer: ${q('#tc-say').textContent}`; }
        await window.shot('cards-groups');
        q('#tc-back').click();
        if (!q('#lv-hbars')) { return 'no way back to counting'; }
        return '';
    },
    // The marks of the cards read from a picture: several cards at once, turned to each answer, tilted, small and big,
    // with blur and noise, on a cluttered background; and nothing read where there is no card.
    'card-scanner': async () => {
        const S = window.ClasstoolsScanner;
        const canvas = document.createElement('canvas');
        canvas.width = 1280; canvas.height = 720;
        const ctx = canvas.getContext('2d');
        // A card as printed (135 units: bands of 20, the mark with its margin in the middle 95), turned and tilted.
        const card = (id, x, y, size, quarter, tilt, skew = 0) => {
            const u = size / 135;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((quarter * 90 + tilt) * Math.PI / 180);
            ctx.transform(1, 0, skew, 1, 0, 0);
            ctx.scale(u, u);
            ctx.translate(-67.5, -67.5);
            ctx.fillStyle = '#ce1423'; ctx.fillRect(0, 0, 135, 20);
            ctx.fillStyle = '#fbbe17'; ctx.fillRect(0, 115, 135, 20);
            ctx.fillStyle = '#164281'; ctx.fillRect(115, 20, 20, 95);
            ctx.fillStyle = '#067e36'; ctx.fillRect(0, 20, 20, 95);
            ctx.fillStyle = '#fff'; ctx.fillRect(20, 20, 95, 95);
            const c = 95 / 8, code = S.CODES[id - 1];
            ctx.fillStyle = '#111';
            ctx.fillRect(20 + c, 20 + c, 6 * c, 6 * c);
            ctx.fillStyle = '#fff';
            ctx.fillRect(20 + 2 * c, 20 + 2 * c, 4 * c, 4 * c);
            ctx.fillStyle = '#111';
            for (let r = 0; r < 4; r++) { for (let col = 0; col < 4; col++) { if ((code >> (r * 4 + col)) & 1) { ctx.fillRect(20 + (2 + col) * c, 20 + (2 + r) * c, c + 0.3, c + 0.3); } } }
            ctx.restore();
        };
        const scene = (cards, blur) => {
            ctx.filter = 'none';
            ctx.fillStyle = '#8a8f99'; ctx.fillRect(0, 0, 1280, 720);
            // Clutter: stripes, blocks and letters, as a classroom has.
            for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 2 ? '#2b2b2b' : '#d8d2c4'; ctx.fillRect((i * 97) % 1280, (i * 53) % 720, 20 + (i * 13) % 90, 10 + (i * 7) % 60); }
            ctx.fillStyle = '#222'; ctx.font = '48px sans-serif'; ctx.fillText('ABCD 1234 Mesa', 40, 690);
            cards.forEach((k) => card(...k));
            const img = ctx.getImageData(0, 0, 1280, 720);
            if (blur) {
                ctx.filter = 'blur(1.2px)'; ctx.drawImage(canvas, 0, 0); ctx.filter = 'none';
                const b = ctx.getImageData(0, 0, 1280, 720);
                for (let i = 0; i < b.data.length; i += 4) { const nz = ((i * 2654435761) % 41) - 20; for (let j = 0; j < 3; j++) { b.data[i + j] = Math.max(0, Math.min(255, b.data[i + j] + nz)); } }
                return b;
            }
            return img;
        };
        const ANS = ['A', 'D', 'C', 'B'];
        const cases = [
            [[1, 200, 200, 230, 0, 0], [17, 520, 200, 200, 1, 8], [33, 840, 220, 180, 2, -10], [60, 1120, 220, 160, 3, 5]],
            [[5, 180, 520, 110, 0, 14, 0.15], [9, 420, 520, 90, 1, -12], [28, 640, 520, 80, 2, 0, -0.2], [44, 860, 520, 70, 3, 10], [12, 1080, 520, 300, 1, -3]],
            // Small and tilted: marks of about 24 pixels (cells of 4), up to 35 degrees.
            [[2, 150, 150, 45, 0, 35], [3, 350, 150, 45, 1, -20], [4, 550, 150, 55, 2, 30], [6, 750, 150, 55, 3, -35], [7, 950, 150, 65, 0, 20]],
            // The whole class at once: the 60 cards, each turned its own way.
            Array.from({ length: 60 }, (_, i) => [i + 1, 64 + (i % 10) * 128, 60 + Math.floor(i / 10) * 120, 100, i % 4, ((i * 7) % 21) - 10]),
        ];
        for (const [i, cards] of cases.entries()) {
            for (const blur of [false, true]) {
                const got = S.detect(scene(cards, blur));
                const want = cards.map(([id, , , , q]) => `${id}${ANS[q]}`).sort().join(' ');
                const have = got.map((g) => `${g.id}${g.answer}`).sort().join(' ');
                if (have !== want) { return `scene ${i + 1}${blur ? ' blurred' : ''}: read «${have}», expected «${want}»`; }
            }
        }
        if (S.detect(scene([], true)).length) { return 'a card read where there is none'; }
        document.body.append(canvas);
        canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99';
        scene(cases[1], true);
        await window.shot('card-scanner');
        canvas.remove();
        return '';
    },
    // The new orders of the phone on the board: the curtain and uncovering, the relay of «Whose turn?», opening and
    // closing what is on in «Live», and the panel saying what came last.
    'remote-orders': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const R = window.ClasstoolsRemote, I = () => window.ClasstoolsInstruments;
        R.run('curtain');
        await sleep(300);
        if (window.ClasstoolsCore.current() !== 'pizarra' || !I().curtainShown()) { return 'the curtain did not come out'; }
        R.run('reveal'); R.run('reveal');
        if (Math.abs(I().curtain().t - 0.25) > 1e-9) { return `uncovered to ${I().curtain().t}`; }
        R.run('curtain');
        if (I().curtainShown()) { return 'the curtain did not go'; }
        // The relay: on as last chosen (or every minute), and off.
        q('#t-material').click();
        await sleep(300);
        q('#mt-turn').click();
        await sleep(200);
        // (Another check may have left a relay on: the order turns it off, and on again as it was.)
        const every = q('#h-material .ct-turno-cada');
        if (every.value !== '0') { R.run('relay'); }
        if (every.value !== '0') { return `relay off: ${every.value}`; }
        R.run('relay');
        if (every.value === '0') { return 'the relay did not come on'; }
        // Open and close a show of hands has nothing to open; a vote of the live session is not open here either:
        // the order does nothing without its button, and nothing breaks.
        R.run('live');
        // The panel of the fixed remote says the last order.
        q('#t-envivo').click();
        await sleep(200);
        q('#lv-kind [data-v="remote"]').click();
        await sleep(200);
        q('#lv-rm [data-rm="on"]').click();
        await sleep(300);
        R.run('tab_next');
        await sleep(100);
        q('#t-envivo').click();
        await sleep(200);
        if (!/Next|next/.test(q('#lv-rm .ct-rm-ultima').textContent)) { return `last order: ${q('#lv-rm .ct-rm-ultima').textContent}`; }
        await window.shot('remote-orders');
        q('#lv-rm [data-rm="off"]').click();
        return '';
    },
    // The board tells the phone the buttons of the tool on screen, as they are now, and runs them: the groups (how
    // many, «Make groups», then «Again»), and the alphabet wheel with its letter and the answer for the teacher.
    'remote-here': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const core = window.ClasstoolsCore;
        // What the board said in its last poll on a tool, once it says it.
        const said = async (tool, test) => {
            for (let i = 0; i < 60; i++) {
                const p = FAKE.calls.filter((c) => c.action === 'poll' && c.tool === tool).pop();
                const rows = p ? JSON.parse(p.here || '[]') : [];
                if (p && test(rows)) { return rows; }
                await sleep(100);
            }
            const p = FAKE.calls.filter((c) => c.action === 'poll').pop();
            return p ? `${p.tool}: ${p.here}` : 'no poll';
        };
        const order = (cmd) => {
            const n = Math.max(FAKE.remote ? FAKE.remote.seq : 0, ...(FAKE.remoteCmds || []).map((c) => c.seq)) + 1;
            FAKE.remoteCmds = [...(FAKE.remoteCmds || []), { seq: n, cmd }];
        };
        q('#t-envivo').click();
        await sleep(200);
        q('#lv-kind [data-v="remote"]').click();
        await sleep(200);
        if (q('#lv-rm [data-rm="on"]')) { q('#lv-rm [data-rm="on"]').click(); }
        await sleep(300);
        FAKE.remoteCmds = [];
        const flat = (rows) => (Array.isArray(rows) ? rows.flat() : []);
        // «Whose turn?»: «Scratch to reveal» turned on and off from the phone, and the phone told each time.
        core.show('quien');
        let rows = await said('quien', (r) => flat(r).some((x) => /Scratch/.test(x[1]) && x[2] === 'chk'));
        if (!Array.isArray(rows)) { return `whose turn, scratch: ${rows}`; }
        const scratch = flat(rows).find((x) => /Scratch/.test(x[1]))[0];
        for (const want of [true, false]) {
            order(scratch);
            for (let i = 0; i < 40 && q('#q-rasca').checked !== want; i++) { await sleep(100); }
            if (q('#q-rasca').checked !== want) { return `scratch from the phone: ${q('#q-rasca').checked}`; }
            rows = await said('quien', (r) => flat(r).some((x) => x[0] === scratch && x[2] === (want ? 'chkon' : 'chk')));
            if (!Array.isArray(rows)) { return `the phone was not told scratch is ${want ? 'on' : 'off'}: ${rows}`; }
        }
        core.show('grupos');
        rows = await said('grupos', (r) => flat(r).some((x) => x[0] === 'x_go'));
        if (!Array.isArray(rows)) { return `groups: ${rows}`; }
        // Which class first, before the buttons; and changed from the phone.
        if (rows[0].map((x) => x[1]).join('/') !== 'Students/Class 1 (8)/Split A (4)' || rows[0][1][2] !== 'opton') { return `groups, which class: ${JSON.stringify(rows[0])}`; }
        order(rows[0][2][0]);
        for (let i = 0; i < 40 && !/Split A/.test(q('#g-lista').selectedOptions[0].textContent); i++) { await sleep(100); }
        if (!/Split A/.test(q('#g-lista').selectedOptions[0].textContent)) { return 'the class chosen on the phone did not change the groups'; }
        q('#g-lista').value = q('#g-lista').options[0].value;
        q('#g-lista').dispatchEvent(new Event('change', { bubbles: true }));
        rows = await said('grupos', (r) => r[0] && r[0][1] && r[0][1][2] === 'opton');
        const go = flat(rows).find((x) => x[0] === 'x_go'), n = flat(rows).find((x) => x[2] === 'val');
        if (go[2] !== 'big' || !/Make groups/.test(go[1]) || !n || !flat(rows).some((x) => x[0] === 'x_mr' && x[2] === 'more')) { return `groups: ${JSON.stringify(rows)}`; }
        if (!flat(rows).some((x) => x[0].startsWith('x_md') && x[2] === 'on')) { return `no mode on: ${JSON.stringify(rows)}`; }
        const before = q('#g-n').textContent;
        order('x_mr');
        for (let i = 0; i < 40 && q('#g-n').textContent === before; i++) { await sleep(100); }
        if (q('#g-n').textContent === before) { return 'the step from the phone did not change the groups'; }
        order('x_go');
        rows = await said('grupos', (r) => flat(r).some((x) => x[0] === 'x_go' && /Again/.test(x[1])));
        if (!Array.isArray(rows)) { return `after making the groups: ${rows}`; }
        // Its options: «Deal them out with suspense», a switch, turned on from the phone.
        const suspense = flat(rows).find((x) => /suspense/.test(x[1]));
        if (!suspense || suspense[2] !== 'chk' || !flat(rows).some((x) => x[2] === 'cap' && x[1] === 'Options')) { return `groups options: ${JSON.stringify(rows)}`; }
        order(suspense[0]);
        for (let i = 0; i < 40 && !q('#g-emocion').checked; i++) { await sleep(100); }
        if (!q('#g-emocion').checked) { return 'the switch from the phone did not change the board'; }
        rows = await said('grupos', (r) => flat(r).some((x) => x[0] === suspense[0] && x[2] === 'chkon'));
        if (!Array.isArray(rows)) { return `the switch on the phone: ${rows}`; }
        q('#g-emocion').click();
        // A choice of a list: the look of the timer.
        core.show('temporizador');
        rows = await said('temporizador', (r) => flat(r).some((x) => x[2] === 'opt' && /Sand/.test(x[1])));
        if (!Array.isArray(rows)) { return `timer options: ${rows}`; }
        const lookBefore = q('#tm-aspectos [aria-checked="true"]');
        order(flat(rows).find((x) => /Sand/.test(x[1]))[0]);
        for (let i = 0; i < 40 && !/Sand|Arena/.test((q('#tm-aspectos [aria-checked="true"]') || {}).textContent || ''); i++) { await sleep(100); }
        if (!/Sand|Arena/.test((q('#tm-aspectos [aria-checked="true"]') || {}).textContent || '')) { return 'the look chosen on the phone did not change the timer'; }
        if (lookBefore) { lookBefore.click(); }
        // A slider with its steps: the sensitivity of the noise meter.
        core.show('semaforo');
        rows = await said('semaforo', (r) => flat(r).some((x) => x[2] === 'val'));
        if (!Array.isArray(rows)) { return `noise meter options: ${rows}`; }
        const sens = q('#s-sensibilidad').value;
        order(flat(rows).find((x) => x[2] === 'more' && x[0].startsWith('x_o'))[0]);
        for (let i = 0; i < 40 && q('#s-sensibilidad').value === sens; i++) { await sleep(100); }
        if (Number(q('#s-sensibilidad').value) !== Number(sens) + 1) { return `sensitivity ${sens} → ${q('#s-sensibilidad').value}`; }
        order(flat(rows).find((x) => x[2] === 'less' && x[0].startsWith('x_o'))[0]);
        // The wheel: the letter and its clue, and the answer, only for the teacher; «Right» from the phone.
        core.show('juegos');
        q('#ga-mode [data-game="rosco"]').click();
        await sleep(300);
        rows = await said('juegos', (r) => flat(r).some((x) => x[0].startsWith('x_go') && /Start/.test(x[1])));
        if (!Array.isArray(rows)) { return `wheel: ${rows}`; }
        order(flat(rows).find((x) => x[0].startsWith('x_go'))[0]);
        rows = await said('juegos', (r) => flat(r).some((x) => x[0] === 'x_ok'));
        if (!Array.isArray(rows)) { return `wheel started: ${rows}`; }
        const it = window.ClasstoolsRosco.state().teams[0].items[window.ClasstoolsRosco.state().teams[0].pos];
        const lines = flat(rows).filter((x) => x[2] === 'txt').map((x) => x[1]);
        if (lines.length !== 2 || lines[1] !== `Answer: ${it.a}`) { return `wheel lines: ${JSON.stringify(lines)}`; }
        order('x_ok');
        for (let i = 0; i < 40 && !window.ClasstoolsRosco.state().teams[0].ok; i++) { await sleep(100); }
        if (window.ClasstoolsRosco.state().teams[0].ok !== 1) { return '«Right» from the phone did not count'; }
        window.ClasstoolsRosco.finish();
        // A tool without buttons for the phone: nothing.
        core.show('qr');
        rows = await said('qr', (r) => r.length === 0);
        if (!Array.isArray(rows)) { return `qr: ${rows}`; }
        q('#t-envivo').click();
        await sleep(200);
        q('#lv-rm [data-rm="off"]').click();
        return '';
    },
    // Reading the cards on the board with its camera (the picture of four cards that Chrome plays as a camera), and
    // what the phone sends.
    'card-reading': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        const until = async (s) => { for (let i = 0; i < 100 && !q(s); i++) { await sleep(50); } return q(s); };
        (await until('#t-envivo')).click();
        (await until('#lv-kind [data-v="hands"]')).click();
        // Cards printed numbered, 60 of them (the camera has cards 3, 14, 27 and 45).
        window.ClasstoolsCore.save('tarjetas-lista', '');
        window.ClasstoolsCore.save('tarjetas-cuantas', 60);
        (await until('#lv-hscan')).click();
        (await until('#tc-cam')).click();
        const C = window.ClasstoolsCards, want = '14D 27C 3A 45B';
        let have = '';
        for (let i = 0; i < 60; i++) {
            have = [...C.read().entries()].map(([id, a]) => `${id}${a}`).sort().join(' ');
            if (have === want) { break; }
            await sleep(200);
        }
        if (have !== want) { return `the camera read «${have}», expected «${want}»`; }
        await sleep(300);
        await window.shot('card-reading');
        // The phone sends more (the camera here stopped): they add up, and a card read again with another answer changes.
        q('#tc-cam').click();
        C.fromPhone('cards_7b3c');
        await sleep(100);
        if (C.read().get(7) !== 'B' || C.read().get(3) !== 'C') { return 'the phone readings did not count'; }
        if (!/5/.test(q('#tc-count').textContent)) { return `count: ${q('#tc-count').textContent}`; }
        // Back to the question: what the cards said is its hands, in the bars and «In groups».
        q('#tc-back').click();
        await sleep(100);
        const bars = [...document.querySelectorAll('#lv-hbars .lv-tally strong')].map((x) => x.textContent).join(' ');
        if (bars !== '0 2 2 1') { return `bars after reading the cards: ${bars}`; }
        q('#lv-hgroups').click();
        await sleep(100);
        const zones = [...document.querySelectorAll('.tc-zona span')].map((x) => x.textContent).join(' ');
        if (zones !== '2 2 1') { return `groups after reading the cards: ${zones}`; }
        q('#tc-back').click();
        (await until('#lv-hscan')).click();
        await until('#tc-new');
        q('#tc-new').click();
        if (C.read().size) { return 'another question did not clear the readings'; }
        return '';
    },
    // The phone reads the cards (the picture of four cards as its camera) and sends their numbers and answers.
    'remote-cards': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        for (let i = 0; i < 60 && !q('#jn-leer'); i++) { await sleep(100); }
        if (!q('#jn-leer')) { return 'no button to read the cards'; }
        q('#jn-leer').click();
        let sent = '';
        for (let i = 0; i < 80; i++) {
            sent = window.FAKE.calls.filter((c) => c.action === 'command' && c.cmd.startsWith('cards_')).map((c) => c.cmd.slice(6)).join('');
            if (['3a', '14d', '27c', '45b'].every((x) => new RegExp(`(^|[a-d])${x}`).test(sent))) { break; }
            await sleep(200);
        }
        if (!['3a', '14d', '27c', '45b'].every((x) => new RegExp(`(^|[a-d])${x}`).test(sent))) { return `sent «${sent}»`; }
        await window.shot('remote-cards');
        q('#jn-leer-fin').click();
        await sleep(200);
        return q('.jn-mando') ? '' : 'no way back to the remote';
    },
    // The score asks the AI of the site for a song: the prompt with the name, «Generate» (the policy first), and the
    // song on the score.
    'score-ai': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="score"]').click();
        await sleep(300);
        q('#sc-import').click();
        await sleep(200);
        q('#sc-to-prompt').click();
        await sleep(200);
        const box = q('.ct-sc-dialogo details.ct-ai');
        if (!box || !box.open) { return 'no AI box in the dialog of the score'; }
        const topic = box.querySelector('.ct-ai-topic');
        topic.value = 'Frere Jacques'; topic.dispatchEvent(new Event('input'));
        if (!/«Frere Jacques»|"Frere Jacques"/.test(box.querySelector('.ct-ai-text').value)) { return 'the prompt does not ask for the song'; }
        if (!box.querySelector('.ct-ai-level').closest('label').hidden) { return 'a level is asked for a song'; }
        box.querySelector('.ct-ai-go').click();
        await sleep(300);
        if (!box.querySelector('.ct-ai-policy').hidden) { box.querySelector('.ct-ai-accept').click(); await sleep(400); }
        const sent = window.FAKE.calls.filter((c) => c.action === 'generate').pop();
        if (!sent || sent.type !== 'song' || sent.topic !== 'Frere Jacques') { return `asked ${JSON.stringify(sent)}`; }
        const song = window.ClasstoolsScore.song();
        if (song.title !== 'Frere Jacques' || song.notes.length !== 11) { return `the score has «${song.title}», ${song.notes.length} notes`; }
        // A melody that starts with C is music, not the composer of ABC («C:»); «C: Someone» still is the composer.
        const read = window.ClasstoolsScore.readText('Title: X\nC: Mozart\nC:q C G G | A A G:h');
        if (read.by !== 'Mozart' || read.notes.length !== 7) { return `C lines: by «${read.by}», ${read.notes.length} notes`; }
        if (q('.ct-sc-dialogo') && q('.ct-sc-dialogo').open) { return 'the dialog stayed open'; }
        return '';
    },
    // Two tools at once: the board split in two halves, the half chosen by touching it and its tool with the tabs,
    // swapping sides, the tab of the other half only choosing it, and back to one tool.
    'split-screen': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const shown = () => [...document.querySelectorAll('.herramienta:not([hidden])')].map((s) => s.id.slice(2) + (s.classList.contains('mitad-izq') ? '<' : '>')).sort().join(' ');
        const C = window.ClasstoolsCore;
        q('#t-juegos').click();
        await sleep(200);
        q('#b-dividir').click();
        await sleep(300);
        if (!q('#mesa').classList.contains('dividida') || shown() !== 'juegos< temporizador>') { return `split: ${shown()}`; }
        if (C.current() !== 'juegos' || !q('#t-temporizador').classList.contains('en-la-otra')) { return 'the other half is not marked'; }
        // The tab changes the half chosen; touching the other half chooses it.
        q('#t-material').click();
        await sleep(200);
        if (shown() !== 'material< temporizador>') { return `left changed: ${shown()}`; }
        q('#h-temporizador').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        if (C.current() !== 'temporizador') { return 'touching the right half did not choose it'; }
        q('#t-semaforo').click();
        await sleep(200);
        if (shown() !== 'material< semaforo>') { return `right changed: ${shown()}`; }
        // The tab of the other half only chooses it.
        q('#t-material').click();
        if (shown() !== 'material< semaforo>' || C.current() !== 'material') { return `other tab: ${shown()} ${C.current()}`; }
        q('#b-intercambiar').click();
        await sleep(200);
        if (shown() !== 'material> semaforo<') { return `swap: ${shown()}`; }
        // A game next to the timer, for the picture.
        q('#t-juegos').click();
        await sleep(200);
        q('#ga-mode [data-game="simon"]').click();
        q('#h-semaforo').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        q('#t-temporizador').click();
        await sleep(500);
        await window.shot('split-screen');
        // Other pairs, for the pictures: each tool in its half.
        for (const [left, right] of [['pizarra', 'material'], ['quien', 'semaforo'], ['envivo', 'marcador'], ['grupos', 'reloj'],
            ['cronometro', 'azar'], ['asi', 'qr'], ['juegos', 'material']]) {
            if (left === 'juegos') { q('#ga-mode [data-game="rosco"]').click(); q('#mt-mode [data-mode="calc"]').click(); }
            q('.mesa .mitad-izq').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            q(`#t-${left}`).click();
            q('.mesa .mitad-der').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            q(`#t-${right}`).click();
            await sleep(500);
            if (shown() !== [`${left}<`, `${right}>`].sort().join(' ')) { return `${left} and ${right}: ${shown()}`; }
            await window.shot(`split-${left}-${right}`);
        }
        // The 3D shapes in a half.
        q('#mt-mode [data-mode="cuerpos"]').click();
        await sleep(400);
        if (!q('#sd-svg polygon')) { return 'no 3D shape in a half'; }
        await window.shot('split-solids');
        q('#b-juntar').click();
        await sleep(200);
        if (q('#mesa').classList.contains('dividida') || shown().split(' ').length !== 1) { return `joined: ${shown()}`; }
        return '';
    },
    // The duel: the same material in two frames that show only it and save nothing, in turns with a clock each and who
    // wins, and to compare without clocks.
    'duel': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="fractions"]').click();
        await sleep(200);
        if (q('#mt-duel').hidden) { return 'no duel for the fraction wall'; }
        q('#mt-mode [data-mode="calc"]').click();
        await sleep(100);
        if (!q('#mt-duel').hidden) { return 'a duel offered for the calculator'; }
        q('#mt-mode [data-mode="fractions"]').click();
        await sleep(100);
        q('#mt-duel').click();
        const frames = [...document.querySelectorAll('.ct-duelo iframe')];
        if (frames.length !== 2) { return `${frames.length} frames`; }
        const ready = (f) => { try { const w = f.contentWindow; return w.document.documentElement.classList.contains('duelo') && w.ClasstoolsCore && w.ClasstoolsCore.material.current() === 'fractions' && !w.document.querySelector('#h-material').hidden; } catch (e) { return false; } };
        for (let i = 0; i < 100 && !frames.every(ready); i++) { await sleep(100); }
        if (!frames.every(ready)) { return 'the copies did not show the fraction wall alone'; }
        // A copy saves nothing.
        frames[0].contentWindow.ClasstoolsCore.save('prueba-duelo', 1);
        if (localStorage.getItem('pizarra:prueba-duelo') !== null) { return 'a copy wrote in the browser'; }
        const D = window.ClasstoolsDuel;
        q('#dl-mode [data-v="turns"]').click();
        q('#dl-go').click();
        await sleep(300);
        if (!q('.ct-duelo-lado[data-side="1"]').classList.contains('esperando')) { return 'the second side is not waiting its turn'; }
        D.done(0);
        await sleep(400);
        if (q('.ct-duelo-lado[data-side="1"]').classList.contains('esperando') || !D.state().side[0].done) { return 'the second side did not start'; }
        D.done(1);
        if (!/wins|tie/i.test(q('.ct-duelo-resultado').textContent)) { return `result: «${q('.ct-duelo-resultado').textContent}»`; }
        await window.shot('duel');
        q('#dl-mode [data-v="compare"]').click();
        if (getComputedStyle(q('.ct-duelo-reloj')).display !== 'none') { return 'clocks when comparing'; }
        q('#dl-close').click();
        return q('.ct-duelo') ? 'the duel did not close' : '';
    },
    // The timeline: the dates as written, the examples of each level, the marks that follow the zoom (days, years,
    // millions of years), hiding the dates and showing one with a tap, and a timeline of one's own.
    'timeline': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="tiempo"]').click();
        await sleep(300);
        const T = window.ClasstoolsTimeline;
        const d = (s) => { const r = T.dateOf(s); return r ? `${Math.floor(r.t)}·${r.show}` : 'null'; };
        const cases = [['1492', /^1492·1492$/], ['753 BC', /^-753·753 BC$/], ['-753', /^-753·753 BC$/], ['66 Ma', /^-659\d{5}·66 Ma ago$/],
            ['4,5 Ga', /^-449\d{7}·4,500 Ma ago$/], ['300 ka', /^-29\d{4}·300,000 years ago$/], ['1969-07-20', /^1969·(20 Jul 1969|Jul 20, 1969)$/], ['nonsense', /^null$/]];
        for (const [s, re] of cases) { if (!re.test(d(s))) { return `date «${s}»: ${d(s)}`; } }
        const tl = T.parse('My story\n1936-1939 | A war\n1969-07-20 | The Moon\n476 – 1492 | Middle Ages\nnot a line | x');
        if (tl.title !== 'My story' || tl.items.length !== 3 || tl.items[0].b === undefined || tl.bad.join() !== '5') { return `parse: ${JSON.stringify(tl)}`; }
        // The example of Primary: the history of flight.
        if (!/flight/i.test(q('#tl-which').selectedOptions[0].textContent) || T.current().items.length !== 5) { return 'not the history of flight'; }
        T.setView(1969.5, 1969.6);
        if (!T.ticks().some((k) => /Jul/.test(k.text))) { return `days and months: ${T.ticks().map((k) => k.text).join(' ')}`; }
        T.setView(-5e9, 2026);
        if (!T.ticks().some((k) => /Ma ago/.test(k.text))) { return `millions of years: ${T.ticks().map((k) => k.text).join(' ')}`; }
        T.fit();
        // Hiding the dates: only the names, until one is tapped.
        q('#tl-hide').click();
        const label = () => [...document.querySelectorAll('#tl-svg .ct-tl-hecho text')].map((x) => x.textContent).join(' | ');
        if (/1969/.test(label())) { return 'the dates show while hidden'; }
        T.pick(4);
        if (!/1969/.test(label()) || !/Moon/.test(q('#tl-info').textContent)) { return 'a tap did not show its date'; }
        q('#tl-hide').click();
        await window.shot('timeline');
        // The history of the Earth, and a timeline of one's own.
        const which = q('#tl-which');
        which.value = 'ex:earth'; which.dispatchEvent(new Event('change'));
        await sleep(200);
        if (T.current().items.length !== 7) { return `earth: ${T.current().items.length}`; }
        await window.shot('timeline-earth');
        q('#tl-new').click();
        await sleep(200);
        q('#tl-text').value = 'Mine\n2020 | One\n2021 | Two';
        q('.ct-tl-dialogo form').dispatchEvent(new Event('submit', { cancelable: true }));
        await sleep(200);
        if (T.current().title !== 'Mine' || which.selectedOptions[0].textContent !== 'Mine') { return 'the own timeline was not kept'; }
        return '';
    },
    // The 3D shapes: the faces, edges and vertices of each one (and Euler's count), their nets flat and without faces
    // on top of each other, all the nets of the cube, the octahedron and the tetrahedron, counting one by one, a painted
    // face, and the views.
    'solids': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="cuerpos"]').click();
        await sleep(300);
        const D = window.ClasstoolsSolids;
        const want = { cubo: [6, 12, 8], ortoedro: [6, 12, 8], prisma3: [5, 9, 6], prisma5: [7, 15, 10], prisma6: [8, 18, 12],
            piramide3: [4, 6, 4], piramide4: [5, 8, 5], piramide5: [6, 10, 6], piramide6: [7, 12, 7], tetraedro: [4, 6, 4],
            hexaedro: [6, 12, 8], octaedro: [8, 12, 6], dodecaedro: [12, 30, 20], icosaedro: [20, 30, 12] };
        for (const key of Object.keys(D.SOLIDS)) {
            const s = D.build(key);
            if (want[key] && [s.f.length, s.edges.length, s.v.length].join() !== want[key].join()) { return `${key}: ${s.f.length}, ${s.edges.length}, ${s.v.length}`; }
            if (key === 'esfera') { if (s.net) { return 'a net for the sphere'; } continue; }
            if (!s.net) { return `${key}: no net`; }
            if (D.overlaps(D.flatOf(s, s.net))) { return `${key}: its net falls on itself`; }
            // Flat when open: every corner on the floor; the shape when closed.
            const open = D.moves(s, s.net, 1), shut = D.moves(s, s.net, 0);
            const high = Math.max(...s.f.flatMap((f, i) => f.map((k) => { const m = open[i], v = s.v[k]; return Math.abs(m.r[3] * v[0] + m.r[4] * v[1] + m.r[5] * v[2] + m.p[1]); })));
            if (high > 1e-6) { return `${key}: the open net is not flat (${high})`; }
            if (shut.some((m) => m.p.some((x) => Math.abs(x) > 1e-9))) { return `${key}: not closed`; }
            if (Math.min(...s.v.map((v) => v[1])) < -1e-9) { return `${key}: below the floor`; }
        }
        const counts = { cubo: 11, octaedro: 11, tetraedro: 2 };
        for (const [key, n] of Object.entries(counts)) { const all = D.allNets(D.build(key)); if (!all || all.length !== n) { return `${key}: ${all && all.length} nets`; } }
        // The cube: its elements, counted one by one.
        q('#sd-which').value = 'cubo'; q('#sd-which').dispatchEvent(new Event('change'));
        await sleep(100);
        if (!/Cube: 6 faces, 12 edges and 8 vertices/.test(q('#sd-sum').textContent)) { return `sum: «${q('#sd-sum').textContent}»`; }
        D.startCount('edges');
        await sleep(1200);
        if (!(D.state().count && D.state().count.k >= 1 && D.state().count.k < 12)) { return `counting: ${JSON.stringify(D.state().count)}`; }
        D.startCount('edges');
        if (D.state().count.k !== 12 || q('#sd-sum').textContent !== '12 edges' || document.querySelectorAll('#sd-svg .ct-sd-num').length !== 12) { return 'all at once'; }
        await window.shot('solids-count');
        // A painted face keeps its colour in the net.
        D.choose('cubo');
        D.paintFace(0);
        const red = () => [...document.querySelectorAll('#sd-svg polygon[data-f="0"]')].some((x) => /rgb\((2[0-5]\d|1[6-9]\d),\s*\d{1,2},/.test(x.getAttribute('fill')));
        D.setOpen(1);
        if (!red()) { return 'the painted face lost its colour'; }
        await window.shot('solids-net');
        D.setOpen(0.5);
        await window.shot('solids-half');
        // Another net: the classic one is the first of the eleven.
        D.setOpen(0);
        D.otherNet();
        if (!/2 of 11/.test(q('#sd-net').textContent)) { return `another net: «${q('#sd-net').textContent}»`; }
        // The views: without perspective.
        D.choose('prisma5');
        D.setView('front');
        await sleep(1100);
        if (D.state().cam.persp !== 0 || Math.abs(D.state().cam.pitch) > 1e-6) { return `front view: ${JSON.stringify(D.state().cam)}`; }
        D.setView('3d');
        await sleep(1000);
        D.choose('cilindro');
        q('#sd-see').click();
        await window.shot('solids-cylinder');
        q('#sd-see').click();
        D.choose('icosaedro');
        D.setOpen(1);
        await window.shot('solids-icosahedron');
        D.choose('esfera');
        if (!q('#sd-fold').disabled || !/cannot be unfolded/.test(q('#sd-net').textContent)) { return 'the sphere unfolds'; }
        D.choose('cubo');
        return '';
    },
    // The guided helps: in the guide of «Live», each one plays whole on the practice board (with an invented class and
    // a pretend Moodle, nothing of the teacher's touched), «Now you» done by the pointer, and the sticker learned.
    'helps': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const kept = () => Object.keys(localStorage).filter((k) => k.startsWith('pizarra:')).sort().join();
        q('#t-envivo').click();
        await sleep(300);
        const before = kept();
        // In the guide of «Live» (whatever is open in it), its helps.
        q('#b-guia').click();
        await sleep(200);
        q('.ct-guia [data-a="index"]').click();
        q('.ct-guia [data-guide="envivo"]').click();
        await sleep(100);
        const buttons = [...document.querySelectorAll('.ct-guia [data-help]')].map((b) => b.dataset.help).join();
        if (buttons !== 'entrar,votar,nube,mando,concurso,pulsadores,manos') { return `helps in the guide: ${buttons}`; }
        // In the guides of the exit ticket and of the printed cards too, after their own.
        for (const [guide, want] of [['salida', 'salida,entrar,votar,nube,mando,concurso,pulsadores,manos'], ['tarjetas', 'manos,tarjetas,entrar,votar,nube,mando,concurso,pulsadores']]) {
            q('.ct-guia [data-a="index"]').click();
            q(`.ct-guia [data-guide="${guide}"]`).click();
            await sleep(100);
            const got = [...document.querySelectorAll('.ct-guia [data-help]')].map((b) => b.dataset.help).join();
            if (got !== want) { return `helps in the guide of ${guide}: ${got}`; }
        }
        q('.ct-guia [data-a="index"]').click();
        q('.ct-guia [data-guide="envivo"]').click();
        await sleep(100);
        q('.ct-guia [data-help="entrar"]').click();
        await sleep(300);
        if (!q('.hp') || !q('.ct-guia').hidden) { return 'the help did not open from the guide'; }
        const H = window.ClasstoolsHelp;
        H.close();
        // A watched step, at its own pace, for the picture.
        await H.open('entrar', { start: true });
        await sleep(9000);
        const frame = q('.hp-pizarra');
        const inner = frame.contentDocument;
        if (!/#practica/.test(frame.contentWindow.location.hash) || !inner.documentElement.classList.contains('practica')) { return 'not the practice board'; }
        if (!/Lucía Moreno|Bruno Santana/.test(JSON.stringify(frame.contentWindow.CLASSTOOLS.lists))) { return 'not the invented class'; }
        await window.shot('help-step');
        H.close();
        for (const id of Object.keys(H.INDEX)) {
            window.FAKE.calls.length = 0;
            const missed = [];
            await H.open(id, { start: true, auto: true, fast: true, miss: (sel) => missed.push(sel) });
            for (let i = 0; i < 900 && !H.state().done; i++) { await sleep(100); }
            const st = H.state();
            if (missed.length) { return `${id}: not found ${missed.join(', ')}`; }
            if (!st.done || !st.practised) { return `${id}: ${JSON.stringify(st)}`; }
            if (!q('.hp-premio.on svg')) { return `${id}: no sticker`; }
            if (!q('#hp-close.fin')) { return `${id}: the close button does not stand out at the end`; }
            if (!window.FAKE.calls.some((c) => c.action === 'learn' && c.cromo === H.INDEX[id].sticker)) { return `${id}: the sticker was not learned`; }
            if (id === 'votar') { await window.shot('help-sticker'); }
            H.close();
        }
        if (kept() !== before) { return 'the practice board touched what the teacher keeps'; }
        // Learned: the end says so the next time.
        await H.open('entrar', { start: false });
        if (!H.state().had) { return 'the learned sticker was not known'; }
        H.close();
        return q('.hp') ? 'the help did not close' : '';
    },
    // The teachers' room from the board: a discreet button (only its icon), the room with its colleagues, and coming in.
    'sala-board': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const b = q('#b-sala');
        if (!b || b.hidden) { return 'no button'; }
        if (getComputedStyle(b.querySelector('.redondo-texto')).display !== 'none') { return 'the button is not discreet'; }
        b.click();
        await sleep(300);
        const d = window.ClasstoolsSala.dialog();
        if (!d || !d.open || d.querySelectorAll('.ct-sala-profe').length !== 1 || !d.querySelector('.ct-sala-cromo svg')) { return 'the room did not open'; }
        d.querySelector('#sl-yo').click();
        await sleep(300);
        if (d.querySelectorAll('.ct-sala-profe').length !== 2 || !d.querySelector('.ct-sala-profe.yo') || !d.querySelector('#sl-yo').checked) { return 'coming in did not show the teacher'; }
        // What their album has and the room leaves out, said on their row only.
        const mas = d.querySelectorAll('.ct-sala-mas');
        if (mas.length !== 1 || !mas[0].closest('.yo') || !/guided help/.test(mas[0].textContent)) { return `the note of the own row: ${mas.length}`; }
        await window.shot('sala-board');
        d.close();
        return '';
    },
    // What the board has been used for: each tab, game and material chosen counts once, and it is sent with the course.
    'tally': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const T = window.ClasstoolsTally;
        if (!T) { return 'no tally'; }
        T.send();
        window.FAKE.beacons.length = 0;
        q('#t-pizarra').click();
        await sleep(100);
        q('#t-juegos').click();
        await sleep(200);
        const first = q('#ga-mode [aria-checked="true"]').dataset.game;
        if (T.item() !== `juegos/${first}`) { return `the games tab counted as «${T.item()}»`; }
        const other = [...document.querySelectorAll('#ga-mode button[data-game]')].find((b) => !b.hidden && b.dataset.game !== first).dataset.game;
        q(`#ga-mode [data-game="${other}"]`).click();
        await sleep(200);
        q('#t-material').click();
        await sleep(200);
        const material = q('#mt-mode [aria-checked="true"]').dataset.mode;
        q('#t-pizarra').click();
        await sleep(100);
        T.send();
        const sent = window.FAKE.beacons.pop();
        if (!sent || sent.url !== 'fake://tally' || sent.courseid !== '1' || sent.sesskey !== 'x') { return `sent: ${JSON.stringify(sent)}`; }
        const data = JSON.parse(sent.data), opens = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v[0]]));
        const want = { pizarra: 2, [`juegos/${first}`]: 1, [`juegos/${other}`]: 1, [`material/${material}`]: 1 };
        if (JSON.stringify(Object.entries(opens).sort()) !== JSON.stringify(Object.entries(want).sort())) { return `counted ${JSON.stringify(opens)}`; }
        // Nothing new: nothing sent.
        T.send();
        return window.FAKE.beacons.length ? 'it sent nothing new' : '';
    },
    // The board of a student, when the site opens it to them: only the tools without data of the class, and nothing of
    // the class anywhere (no lists, no «Whose turn?», no faces), going through every tool, game and material, in Primary
    // and in Early years (where some games use the photos of the class).
    'student-view': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const tabs = () => [...document.querySelectorAll('nav [id^="t-"], [id^="t-"].pestana')].filter((b) => !b.hidden && b.offsetParent !== null).map((b) => b.id.slice(2));
        const shown = [...new Set(tabs())].sort().join();
        if (shown !== 'azar,cronometro,juegos,material,pizarra,qr,reloj,temporizador') { return `tabs: ${shown}`; }
        for (const id of ['b-guia', 'b-sala']) { const b = q('#' + id); if (b && !b.hidden && b.offsetParent !== null) { return `${id} shows`; } }
        // The name of the course leads to the course.
        const course = q('a.marca-curso');
        if (!course || course.getAttribute('href') !== 'course.html' || course.textContent !== 'Science') { return 'the name of the course does not lead to it'; }
        const leak = () => {
            if (document.querySelector('option[value^="list:"]')) { return 'a class list to choose'; }
            const turn = q('#mt-turn');
            if (turn && !turn.hidden && turn.offsetParent !== null) { return '«Whose turn?» in the materials'; }
            if ([...document.querySelectorAll('img')].some((i) => /pluginfile|user\/pix/.test(i.src))) { return 'a photo of someone'; }
            return '';
        };
        for (const mode of ['primary', 'early']) {
            q('#b-modo').click();
            q(`#menu-modo [data-modo="${mode}"]`).click();
            await sleep(200);
            for (const tab of ['temporizador', 'cronometro', 'azar', 'juegos', 'material', 'pizarra', 'reloj', 'qr']) {
                q('#t-' + tab).click();
                await sleep(150);
                if (tab === 'juegos') { for (const b of document.querySelectorAll('[data-game]')) { b.click(); await sleep(120); const l = leak(); if (l) { return `${mode}, game ${b.dataset.game}: ${l}`; } } }
                if (tab === 'material') { for (const b of document.querySelectorAll('#h-material [data-mode]')) { b.click(); await sleep(120); const l = leak(); if (l) { return `${mode}, material ${b.dataset.mode}: ${l}`; } } }
                const l = leak();
                if (l) { return `${mode}, ${tab}: ${l}`; }
            }
        }
        q('#t-juegos').click();
        const hangman = q('[data-game="ahorcado"]');
        if (hangman) { hangman.click(); }
        await sleep(300);
        // Without the class, the hangman of Early years is the whole word, with nothing to choose about names.
        if (q('#ah-kind') && !q('#ah-kind').hidden) { return 'the hangman offers the names of the class'; }
        await window.shot('student-early-hangman');
        return '';
    },
    // The class goal in its looks: each one drawn half way and at the goal, the count as each level learns it, the
    // mosaic with as many tiles uncovered as the fraction of the goal, and the song that plays at the goal.
    'goal-looks': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#b-modo').click(); q('#menu-modo [data-modo="primary"]').click();
        q('#t-marcador').click();
        await sleep(200);
        q('.ct-goal-mode [data-v="goal"]').click();
        await sleep(200);
        const G = window.ClasstoolsGoal, st = G.state();
        const set = (n) => { st.points = n; G.paint(); };
        const pick = (look) => { q('#gl-look').value = look; q('#gl-look').dispatchEvent(new Event('change')); };
        st.target = 30;
        for (const look of ['bote', 'camino', 'planta', 'cohete', 'cancion', 'mosaico']) {
            pick(look);
            set(18);
            await sleep(150);
            if (!q('#gl-jar').innerHTML) { return `${look}: nothing drawn`; }
            await window.shot('goal-' + look);
        }
        // The mosaic: 18 of 30 tiles uncovered, so 12 covered.
        if (document.querySelectorAll('#gl-jar .ct-gl-pieza').length !== 12) { return `mosaic tiles: ${document.querySelectorAll('#gl-jar .ct-gl-pieza').length}`; }
        // The count in Primary, and the fraction in Secondary.
        if (!/18 of 30 · 12 to go/.test(q('#gl-count').textContent)) { return `count in Primary: ${q('#gl-count').textContent}`; }
        q('#b-modo').click(); q('#menu-modo [data-modo="secondary"]').click();
        await sleep(150);
        if (!/18\/30 = 3\/5 · 60%/.test(q('#gl-count').textContent)) { return `count in Secondary: ${q('#gl-count').textContent}`; }
        // The rocket and the plant at the goal, and the song that plays.
        pick('cohete'); set(30);
        if (!/Neptune/.test(q('#gl-caption').textContent)) { return `rocket at the goal: ${q('#gl-caption').textContent}`; }
        pick('planta');
        if (!/fruit/.test(q('#gl-caption').textContent)) { return `plant at the goal: ${q('#gl-caption').textContent}`; }
        await window.shot('goal-planta-fruto');
        pick('cancion'); set(29);
        let played = 0;
        const S = window.ClasstoolsScore, real = S.playNotes;
        S.playNotes = (...a) => { played++; return 0; };
        q('#gl-steps [data-s="1"]').click();
        await sleep(1300);
        S.playNotes = real;
        if (!played) { return 'the song did not play at the goal'; }
        q('#b-modo').click(); q('#menu-modo [data-modo="primary"]').click();
        pick('bote'); set(0);
        return '';
    },
    // The presentation of Canva: any link of a design, or its HTML embed code, gives the embed address; other links
    // say why not; it opens in a frame, stays in the recent ones of the course, and leaves them when removed. A policy
    // of the page keeps the frame from loading anything from Canva.
    'presentation': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        const csp = document.createElement('meta');
        csp.httpEquiv = 'Content-Security-Policy'; csp.content = "frame-src 'none'";
        document.head.append(csp);
        const P = window.ClasstoolsPresentation;
        if (!P || !q('#t-presentacion')) { return 'no presentation tab'; }
        const D = 'https://www.canva.com/design/DAGhbGUMnnI/gZyl0pFu9hrdUYmKXUictg/';
        const cases = [
            [D + 'view?utm_content=DAGhbGUMnnI&utm_campaign=designshare&utm_medium=embeds&utm_source=link', D + 'view?embed'],
            ['https://www.canva.com/design/DAGhbGUMnnI/abcdefghijklmnopqrstuv/edit?utm_source=sharebutton',
                'https://www.canva.com/design/DAGhbGUMnnI/abcdefghijklmnopqrstuv/view?embed'],
            [`<div style="position: relative"><iframe loading="lazy" src="${D}view?embed" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe></div>`
                + `<a href="${D}view?utm_content=DAGhbGUMnnI" target="_blank" rel="noopener">Volcanoes</a>`, D + 'view?embed'],
            ['canva.com/design/DAGhbGUMnnI/view', 'https://www.canva.com/design/DAGhbGUMnnI/view?embed'],
        ];
        for (const [text, want] of cases) {
            const d = P.parse(text), got = d && P.embedUrl(d);
            if (got !== want) { return `embed of ${text.slice(0, 60)}: ${got}`; }
        }
        if (P.parse('https://example.org/design/DAGhbGUMnnI') || P.parse('https://canva.link/abc123xyz')) { return 'a link that is not of a design passed'; }
        q('#t-presentacion').click();
        await sleep(150);
        const type = (link, name = '') => { q('#pr-enlace').value = link; q('#pr-nombre').value = name; q('#pr-abrir').click(); };
        type('https://canva.link/abc123xyz');
        if (q('#pr-error').hidden || !/short links only open inside Moodle/.test(q('#pr-error').textContent)) { return `short link: ${q('#pr-error').textContent}`; }
        type('https://example.org/slides');
        if (q('#pr-error').hidden || !/Canva/.test(q('#pr-error').textContent) || !q('#pr-vista').hidden) { return 'a link of another site opened'; }
        type(cases[0][0], 'Volcanoes');
        await sleep(150);
        const frame = q('#pr-marco iframe');
        if (q('#pr-vista').hidden || !frame || frame.src !== D + 'view?embed') { return `frame: ${frame && frame.src}`; }
        if (frame.title !== 'Volcanoes' || q('#pr-titulo').textContent !== 'Volcanoes') { return `name: ${frame.title}`; }
        if (q('#pr-canva').href !== D + 'view') { return `open in Canva: ${q('#pr-canva').href}`; }
        if (!q('#pr-error').hidden) { return 'the error stayed after a good link'; }
        await window.shot('presentation-open');
        // «Whose turn?» over the slide, and writing on it: two strokes, one undone, and none when it is turned off.
        if (q('#pr-turno').hidden) { return 'no «Whose turn?» on the presentation'; }
        q('#pr-turno').click();
        await sleep(2600);
        if (!q('#pr-marco .ct-turno') || !/Student \d/.test(q('#pr-marco .ct-turno-nombre').textContent)) {
            return `whose turn over the slide: ${q('#pr-marco .ct-turno-nombre') && q('#pr-marco .ct-turno-nombre').textContent}`;
        }
        await window.shot('presentation-turn');
        q('#pr-marco .ct-turno [data-a="ok"]').click();
        q('#pr-escribir').click();
        const sheet = q('#pr-lamina');
        if (sheet.hidden || q('#pr-paleta').hidden) { return 'the sheet to write on did not show'; }
        const b = sheet.getBoundingClientRect();
        const ev = (type, x, y) => sheet.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, clientX: b.left + x * b.width, clientY: b.top + y * b.height }));
        ev('pointerdown', .2, .2); ev('pointermove', .4, .3); ev('pointermove', .6, .5); ev('pointerup', .6, .5);
        q('#pr-paleta [data-c="#164281"]').click();
        ev('pointerdown', .3, .7); ev('pointermove', .7, .72); ev('pointerup', .7, .72);
        if (P.strokes() !== 2) { return `strokes: ${P.strokes()}`; }
        await window.shot('presentation-write');
        q('#pr-deshacer').click();
        if (P.strokes() !== 1) { return `undo: ${P.strokes()}`; }
        q('#pr-escribir').click();
        if (!sheet.hidden || P.strokes() !== 0) { return 'turned off, but what was written stayed'; }
        q('#pr-otra').click();
        await sleep(100);
        if (q('#pr-marco iframe') || q('#pr-elige').hidden || q('#pr-recientes').hidden) { return 'back to the list of presentations'; }
        if (P.state().items.length !== 1 || P.state().last !== null) { return `kept: ${JSON.stringify(P.state())}`; }
        // The same design again, without a name: it keeps its name and stays once.
        type(cases[1][0]);
        await sleep(100);
        if (P.state().items.length !== 1 || q('#pr-titulo').textContent !== 'Volcanoes') { return `again: ${JSON.stringify(P.state().items)}`; }
        q('#pr-otra').click();
        await sleep(100);
        await window.shot('presentation-list');
        q('#pr-lista [data-id]').click();
        await sleep(100);
        if (q('#pr-vista').hidden) { return 'a recent one did not open'; }
        q('#pr-otra').click();
        q('#pr-lista [data-quitar]').click();
        if (P.state().items.length || !q('#pr-recientes').hidden) { return 'removed, but still there'; }
        // Inside Moodle, a short link goes through the server, which says where it leads; one that leads nowhere says so.
        window.CLASSTOOLS.presentationurl = 'fake://presentation';
        type('https://canva.link/nothing99');
        await sleep(150);
        if (q('#pr-error').hidden || !/could not be followed/.test(q('#pr-error').textContent)) { return `short link that leads nowhere: ${q('#pr-error').textContent}`; }
        type(' canva.link/abc123xyz ', 'Robots');
        await sleep(150);
        const asked = FAKE.calls.find((c) => c.url === 'canva.link/abc123xyz');
        if (!asked || q('#pr-vista').hidden || q('#pr-marco iframe').src !== 'https://www.canva.com/design/DAexample01/faketoken-faketoken/view?embed') {
            return `short link through Moodle: ${JSON.stringify(asked)} ${q('#pr-marco iframe') && q('#pr-marco iframe').src}`;
        }
        q('#pr-otra').click();
        q('#pr-lista [data-quitar]').click();
        delete window.CLASSTOOLS.presentationurl;
        csp.remove();
        return '';
    },
    // The teacher's guide expanded: in the middle and inside the screen, with bigger letters; a tap outside closes it,
    // it opens again as it was left, and it goes back to the side.
    'guide-wide': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-quien').click();
        await sleep(150);
        q('#b-guia').click();
        await sleep(200);
        const sheet = q('.ct-guia');
        const size = () => parseFloat(getComputedStyle(sheet.querySelector('.ct-guia-parte li')).fontSize);
        const narrow = size();
        sheet.querySelector('[data-a="wide"]').click();
        await sleep(350);
        const r = sheet.getBoundingClientRect();
        if (!sheet.classList.contains('ancha') || q('.ct-guia-fondo').hidden) { return 'not expanded'; }
        if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) { return `outside the screen: ${JSON.stringify(r)}`; }
        if (Math.abs((r.left + r.right) / 2 - innerWidth / 2) > 2) { return 'not in the middle'; }
        if (!(size() > narrow)) { return `letters not bigger: ${narrow} → ${size()}`; }
        await window.shot('guide-wide');
        // A tap on the dimmed board closes it; it opens again expanded.
        q('.ct-guia-fondo').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        await sleep(100);
        if (!sheet.hidden || !q('.ct-guia-fondo').hidden) { return 'a tap outside did not close it'; }
        q('#b-guia').click();
        await sleep(200);
        if (!sheet.classList.contains('ancha')) { return 'not kept expanded'; }
        sheet.querySelector('[data-a="wide"]').click();
        await sleep(200);
        if (sheet.classList.contains('ancha') || !q('.ct-guia-fondo').hidden) { return 'not back to the side'; }
        sheet.querySelector('[data-a="close"]').click();
        return '';
    },
    // The round buttons of the top bar with only their icon (as on a narrow screen): each icon in the middle of its
    // circle.
    'bar-icons-centred': async () => {
        // On one row, as on a wide screen, and on two with the buttons left with only their icon because their names
        // do not fit (with two and room, the buttons carry their texts on purpose). Measured at once, before the bar
        // fits itself again.
        const barra = document.getElementById('barra'), was = barra.className;
        const measure = (mode) => [...document.querySelectorAll('.acciones .redondo')].filter((b) => !b.hidden && b.offsetParent !== null).map((b) => {
            const r = b.getBoundingClientRect(), i = b.querySelector('svg');
            if (!i) { return ''; }
            const k = i.getBoundingClientRect();
            const dx = (k.left + k.right) / 2 - (r.left + r.right) / 2, dy = (k.top + k.bottom) / 2 - (r.top + r.bottom) / 2;
            return Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5 ? `${mode} ${b.id || b.className}: ${dx.toFixed(1)}, ${dy.toFixed(1)}` : '';
        }).filter(Boolean);
        barra.classList.remove('dos-filas', 'sin-nombres');
        document.head.insertAdjacentHTML('beforeend', '<style id="solo-iconos">.acciones .redondo-texto { display: none !important; }</style>');
        const one = measure('one row');
        document.getElementById('solo-iconos').remove();
        barra.classList.add('dos-filas', 'sin-nombres');
        const two = measure('two rows');
        barra.className = was;
        return [...one, ...two].join(' | ');
    },
    // Music questions for the quiz: sets that make themselves (which song, rhythm and melody dictations), four
    // different answers with the right one among them, and what each one plays.
    'music-quiz': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-envivo').click();
        await sleep(200);
        q('#lv-kind [data-v="quiz"]').click();
        await sleep(200);
        if (!q('#qz-music')) { return 'no music button'; }
        const M = window.ClasstoolsMusicQuiz;
        for (const [kind, hard] of [['song', false], ['rhythm', false], ['rhythm', true], ['melody', false], ['melody', true]]) {
            const set = M.make(kind, 8, hard);
            if (!set || set.questions.length !== 8) { return `${kind}: ${set ? set.questions.length : 'none'}`; }
            for (const x of set.questions) {
                if (new Set(x.o).size !== x.o.length || x.o.length !== 4 || x.c < 0 || x.c > 3) { return `${kind} options: ${JSON.stringify(x.o)} ${x.c}`; }
                if (!x.music || !x.music.notes.length) { return `${kind}: nothing to play`; }
                if (kind === 'rhythm' && x.music.notes.reduce((a, n) => a + n.t, 0) !== 16) { return 'a rhythm that is not one bar of four'; }
            }
            if (kind === 'melody' && !set.questions.every((x) => /^do /.test(x.o[x.c]) || /^C /.test(x.o[x.c]))) { return 'a melody that does not start on do'; }
        }
        if (!(M.play(M.make('melody', 1, false).questions[0].music) > 0)) { return 'nothing played'; }
        // From the dialog: the set goes with the others and is chosen.
        q('#qz-music').click();
        await sleep(200);
        q('#mq-kind [data-v="rhythm"]').click();
        q('form.qz-musica').dispatchEvent(new Event('submit', { cancelable: true }));
        await sleep(300);
        const chosen = q('#qz-set').selectedOptions[0].textContent;
        if (!/Music: rhythm dictation \(8\)/.test(chosen)) { return `set chosen: ${chosen}`; }
        await window.shot('music-quiz');
        return '';
    },
    // Clap echo: the taps judged against the rhythm (as many, each near its place, at the class's own speed), and a
    // whole round: the board claps, the echo is tapped on the drum, and the rhythm shows written in green.
    'echo-game': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (x) => document.querySelector(x);
        q('#t-juegos').click();
        await sleep(200);
        q('#ga-mode [data-game="eco"]').click();
        await sleep(200);
        const E = window.ClasstoolsEcho;
        E.setRhythm(['ta', 'titi', 'ta', 'ta']);
        const e = E.onsets(), s = E.sixteenth();
        if (e.join() !== '0,4,6,8,12') { return `onsets ${e}`; }
        const at = (k, shift = []) => e.map((x, i) => 1000 + x * s * k + (shift[i] || 0));
        if (!E.judge(at(1)).ok) { return 'an exact echo was not right'; }
        if (!E.judge(at(0.9)).ok || !E.judge(at(1.12)).ok) { return 'a slightly faster or slower echo was not right'; }
        const off = E.judge(at(1, [0, 0, 0, s * 2.2, 0]));
        if (off.ok || off.marks.join() !== 'true,true,true,false,true') { return `a late tap: ${JSON.stringify(off)}`; }
        if (!E.judge(at(1).slice(0, 4)).count) { return 'a missing tap was not counted'; }
        // A whole round.
        E.listen();
        for (let i = 0; i < 120 && E.state().state !== 'waiting'; i++) { await sleep(100); }
        if (E.state().state !== 'waiting') { return 'the class never got its turn'; }
        const t0 = performance.now();
        for (const x of e) { const wait = t0 + x * s - performance.now(); if (wait > 0) { await sleep(wait); } E.tap(); }
        for (let i = 0; i < 30 && E.state().state !== 'done'; i++) { await sleep(100); }
        if (E.state().state !== 'done' || E.state().streak !== 1) { return `after the echo: ${JSON.stringify(E.state())}`; }
        if (document.querySelectorAll('#ec-written .ct-eco-celda.bien').length !== 4) { return 'the rhythm is not written in green'; }
        await window.shot('echo');
        return '';
    },
    // The calculator: the order of operations, the decimal sign, the strip of results, and both keyboards.
    'calculator': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const q = (s) => document.querySelector(s);
        q('#t-material').click();
        await sleep(200);
        q('#mt-mode [data-mode="calc"]').click();
        await sleep(200);
        const C = window.ClasstoolsCalculator;
        const cases = [['2+3×4', 14], ['(2+3)×4', 20], ['2^3^2', 512], ['−2^2', -4], ['10÷4', 2.5], ['50%', 0.5], ['5!', 120], ['2π', 2 * Math.PI]];
        for (const [e, want] of cases) {
            const got = C.evaluate(e);
            if (Math.abs(got - want) > 1e-9) { return `${e} gave ${got}`; }
        }
        // Step by step: one level of the order of operations at a time, the ones of the same level together.
        const plain = (e) => C.steps(e).map((l) => { const d = document.createElement('div'); d.innerHTML = l.replace(/<sup>/g, '^'); return d.textContent; }).join(' | ');
        const STEPS = [['2+3×4', '2 + 3 × 4 | 2 + 12 | 14'], ['2×3+4×5', '2 × 3 + 4 × 5 | 6 + 20 | 26'],
            ['(2+3)×(4−1)', '(2 + 3) × (4 − 1) | 5 × 3 | 15'], ['−2^2+1', '−2^2 + 1 | −4 + 1 | −3'], ['10−4−3', '10 − 4 − 3 | 6 − 3 | 3'],
            ['2×(−3)', '2 × (−3) | −6'], ['√(9)+2^3', '√(9) + 2^3 | 3 + 8 | 11'], ['√(1+3)×2', '√(1 + 3) × 2 | √(4) × 2 | 2 × 2 | 4']];
        for (const [e, want] of STEPS) { if (plain(e) !== want) { return `steps of ${e}: ${plain(e)}`; } }
        q('#ca-kind [data-v="basic"]').click();
        if (!q('#ca-steps-on').checked) { q('#ca-steps-on').click(); }
        for (const k of ['1', '2', '+', '3', '×', '4', '−', '(', '5', '−', '1', ')', 'equals']) { C.press(k); }
        if (C.state().tape[0].v !== 20) { return `the strip has ${C.state().tape[0].v}`; }
        if (q('#ca-sheet').hidden || q('#ca-lines').children.length !== 5) { return `steps on screen: ${q('#ca-lines').children.length}`; }
        await sleep(300);
        await window.shot('calc-steps');
        // A key brings the keys back.
        C.press('clear');
        if (!q('#ca-sheet').hidden || q('#ca-keys').hidden) { return 'the keys did not come back'; }
        // Estimating: the result stays hidden until «=» again, and only then goes to the strip.
        q('#ca-guess-on').click();
        const before = C.state().tape.length;
        for (const k of ['2', '5', '×', '4', 'equals']) { C.press(k); }
        if (!C.state().hidden || q('#ca-result').textContent !== '?' || C.state().tape.length !== before) { return 'the result was not hidden'; }
        await sleep(300);
        await window.shot('calc-guess');
        C.press('equals');
        if (C.state().hidden || C.state().tape[0].v !== 100) { return 'the result did not show'; }
        q('#ca-guess-on').click();
        await sleep(300);
        await window.shot('calc-basic');
        // The scientific one, with «2nd» for the inverse.
        q('#ca-kind [data-v="sci"]').click();
        for (const k of ['clear', 'second', 'sin(', '1', ')', 'equals']) { C.press(k); }
        if (C.state().tape[0].v !== 90) { return `sin⁻¹(1) gave ${C.state().tape[0].v}`; }
        for (const k of ['clear', '√(', '2', ')', '×', 'sin(', '4', '5', ')', '+', '2', '×10^', '3', 'equals']) { C.press(k); }
        if (Math.abs(C.state().tape[0].v - 2001) > 1e-9) { return `√2 × sin 45 + 2×10³ gave ${C.state().tape[0].v}`; }
        C.press('second');
        await sleep(300);
        await window.shot('calc-sci');
        return '';
    },
};

// Checks that run on another page than the board.
const PAGES = { 'remote-phone': '/phone.html', 'remote-cards': '/phone.html', 'exit-device': '/device.html', 'student-view': '/student.html' };

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.woff2': 'font/woff2', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/check.html') {
        // The board's own page, with the pretend course and server before its scripts.
        const html = readFileSync(join(APP, 'index.html'), 'utf8').replace('<script src="strings.js"></script>', '<script src="/fake.js"></script>\n<script src="strings.js"></script>');
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); return;
    }
    if (path === '/fake.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(FAKE); return; }
    if (path === '/student.html') {
        // The board as Moodle gives it to a student when the site opens it to them (local_oksigeniaclasstools_student_data):
        // no lists, no addresses of the course, only the tools without data of the class.
        const config = '<script src="/fake.js"></script>\n<script>window.CLASSTOOLS_SITE = { teacher: false };'
            + 'window.CLASSTOOLS = { course: "Science", back: "course.html", lists: [], courseid: 1, mode: "student",'
            + ' tools: ["temporizador", "cronometro", "azar", "juegos", "material", "pizarra", "reloj", "qr"] };</script>\n';
        const html = readFileSync(join(APP, 'index.html'), 'utf8').replace('<script src="icons.js">', config + '<script src="icons.js">');
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); return;
    }
    if (path === '/phone.html') {
        // The phone of the fixed remote, with its key, its texts (from the English pack) and the pretend server.
        const config = '<script src="/fake.js"></script>\n<script src="strings.js"></script>\n'
            + '<script>window.CLASSTOOLS_REMOTE = { k: "key1", api: "fake://mando", site: "Site", str: window.CLASSTOOLS_STR };</script>\n';
        const html = readFileSync(join(APP, 'mando.html'), 'utf8').replace('<script src="mando.js">', config + '<script src="mando.js">');
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); return;
    }
    if (path === '/device.html') {
        // A student's device in an exit ticket, with the code only: the texts of the English pack and a pretend server.
        const config = '<script src="/fake.js"></script>\n<script src="strings.js"></script>\n<script>'
            + 'window.FAKE.device = { open: true, mine: null };'
            + 'window.FAKE.live = (c) => { const D = window.FAKE.device;'
            + ' if (c.action === "ticket") { D.mine = { feel: c.feel, texts: JSON.parse(c.texts), t: 1 }; }'
            + ' return { kind: "exit", round: 1, open: D.open, left: 0, ended: false, kicked: false, identity: "anon", seed: "a".repeat(32),'
            + ' joined: true, team: 0, feel: true, prompts: ["What did you learn?", "A question you still have"], length: 200, mine: D.mine }; };'
            + 'window.CLASSTOOLS_JOIN = { code: "EXIT42", found: true, kind: "exit", identity: "anon", api: "fake://join", sesskey: "",'
            + ' page: "join.php", site: "Site", str: window.CLASSTOOLS_STR };</script>\n';
        const html = readFileSync(join(APP, 'join.html'), 'utf8').replace('<script src="faces.js">', config + '<script src="faces.js">');
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); return;
    }
    const file = normalize(join(APP, path));
    if (!file.startsWith(APP) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file));
});

// A camera for the checks: a still picture of four printed cards held up, each turned to another answer (cards 3, 14,
// 27 and 45: A, D, C and B), as a Y4M video that Chrome plays as its camera.
const CAMERA_CARDS = [[3, 0], [14, 1], [27, 2], [45, 3]];
const cameraVideo = (file) => {
    const W = 1280, H = 720, Y = new Uint8Array(W * H).fill(140);
    for (let i = 0; i < 30; i++) { const x0 = (i * 211) % W, y0 = (i * 97) % H; for (let y = y0; y < Math.min(H, y0 + 30); y++) { for (let x = x0; x < Math.min(W, x0 + 60); x++) { Y[y * W + x] = i % 2 ? 40 : 220; } } }
    const scanner = readFileSync(join(APP, 'scanner.js'), 'utf8');
    const codes = JSON.parse(`[${scanner.match(/const CODES = \[([^\]]+)\]/)[1]}]`);
    // A card as printed (135 units) at x0, y0, turned k quarters clockwise.
    const card = (id, x0, y0, size, k) => {
        const code = codes[id - 1], c = 95 / 8;
        for (let iy = 0; iy < size; iy++) {
            for (let ix = 0; ix < size; ix++) {
                let x = (ix + 0.5) * 135 / size, y = (iy + 0.5) * 135 / size;
                for (let r = 0; r < k; r++) { [x, y] = [y, 135 - x]; }
                let v = 255;
                if (y < 20) { v = 77; } else if (y >= 115) { v = 189; } else if (x < 20) { v = 81; } else if (x >= 115) { v = 60; } else {
                    const cx = Math.floor((x - 20) / c), cy = Math.floor((y - 20) / c);
                    if (cx >= 1 && cx <= 6 && cy >= 1 && cy <= 6) {
                        const inside = cx >= 2 && cx <= 5 && cy >= 2 && cy <= 5;
                        v = !inside || (code >> ((cy - 2) * 4 + (cx - 2))) & 1 ? 20 : 255;
                    }
                }
                Y[(y0 + iy) * W + x0 + ix] = v;
            }
        }
    };
    CAMERA_CARDS.forEach(([id, k], i) => card(id, 80 + i * 300, 220, 220, k));
    const frame = Buffer.concat([Buffer.from('FRAME\n'), Buffer.from(Y), Buffer.alloc(W * H / 2, 128)]);
    writeFileSync(file, Buffer.concat([Buffer.from(`YUV4MPEG2 W${W} H${H} F5:1 Ip A1:1 C420jpeg\n`), frame, frame]));
};

const chromePath = () => process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);

async function main() {
    const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CHECKS);
    const unknown = names.filter((n) => !CHECKS[n]);
    if (unknown.length) { console.error(`Unknown check: ${unknown.join(', ')}. Checks: ${Object.keys(CHECKS).join(', ')}`); process.exit(2); }
    const bin = chromePath();
    if (!bin) { console.error('No Chrome found: set CHROME'); process.exit(2); }
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const base = `http://127.0.0.1:${server.address().port}`;
    const profile = mkdtempSync(join(tmpdir(), 'ct-check-'));
    const video = join(profile, 'camera.y4m');
    cameraVideo(video);
    const chrome = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
        '--no-default-browser-check', '--disable-gpu', '--mute-audio', '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${video}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let failed = 0;
    try {
        const wsUrl = await new Promise((ok, ko) => {
            let err = '';
            const t = setTimeout(() => ko(new Error('Chrome did not start')), 20000);
            chrome.stderr.on('data', (d) => { err += d; const m = err.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); ok(m[1]); } });
            chrome.on('exit', () => ko(new Error('Chrome exited: ' + err.slice(-400))));
        });
        const ws = new WebSocket(wsUrl);
        await new Promise((ok, ko) => { ws.onopen = ok; ws.onerror = ko; });
        let id = 0; const waiting = new Map(), events = [];
        const send = (method, params = {}, sessionId) => new Promise((ok, ko) => { const n = ++id; waiting.set(n, [ok, ko]); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });
        const shots = process.env.SHOTS;
        if (shots) { mkdirSync(shots, { recursive: true }); }
        const takeShot = async (sessionId, name) => {
            const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
            writeFileSync(join(shots, `${name.replace(/[^a-z0-9-]/gi, '_')}.png`), Buffer.from(data, 'base64'));
            await send('Runtime.evaluate', { expression: 'window.shotDone && window.shotDone()' }, sessionId);
        };
        ws.onmessage = (m) => {
            const msg = JSON.parse(m.data);
            if (msg.id && waiting.has(msg.id)) { const [ok, ko] = waiting.get(msg.id); waiting.delete(msg.id); if (msg.error) { ko(new Error(msg.error.message)); } else { ok(msg.result); } }
            else if (msg.method === 'Runtime.bindingCalled' && msg.params.name === 'checkShot') { takeShot(msg.sessionId, msg.params.payload).catch((e) => console.error(e.message)); }
            else if (msg.method) { events.push(msg); }
        };
        // Nothing a check downloads (the spreadsheet of the exit ticket, a PNG of the QR…) lands in the Downloads folder.
        await send('Browser.setDownloadBehavior', { behavior: 'deny' });
        for (const name of names) {
            const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
            const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
            await send('Runtime.enable', {}, sessionId);
            if (shots) { await send('Runtime.addBinding', { name: 'checkShot' }, sessionId); }
            await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
            await send('Page.enable', {}, sessionId);
            events.length = 0;
            await send('Page.navigate', { url: `${base}${PAGES[name] || '/check.html'}` }, sessionId);
            for (let i = 0; i < 200 && !events.some((e) => e.method === 'Page.loadEventFired' && e.sessionId === sessionId); i++) { await new Promise((r) => setTimeout(r, 50)); }
            const r = await send('Runtime.evaluate', { expression: `(${CHECKS[name].toString()})()`, awaitPromise: true, returnByValue: true }, sessionId);
            const problem = r.exceptionDetails ? (r.exceptionDetails.exception?.description || r.exceptionDetails.text) : r.result.value;
            // Errors of the page itself fail the check too.
            const errors = events.filter((e) => e.sessionId === sessionId && e.method === 'Runtime.exceptionThrown')
                .map((e) => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
            if (problem || errors.length) { failed++; console.log(`FAIL ${name}: ${problem || 'errors in the page'}`); } else { console.log(`ok   ${name}`); }
            if (errors.length) { console.log(`     page errors: ${[...new Set(errors)].join(' | ')}`); }
            await send('Target.closeTarget', { targetId });
        }
        // Closed from inside, so that Chrome stops its helpers and lets go of its profile.
        await Promise.race([send('Browser.close').catch(() => {}), new Promise((r) => setTimeout(r, 3000))]);
        ws.close();
    } finally {
        const gone = new Promise((r) => { if (chrome.exitCode !== null || chrome.signalCode) { r(); } else { chrome.once('exit', r); } });
        await Promise.race([gone, new Promise((r) => setTimeout(r, 3000))]);
        if (chrome.exitCode === null && !chrome.signalCode) { chrome.kill('SIGKILL'); await gone; }
        server.close();
        // Chrome's helpers may still be writing their profile for a moment.
        rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    }
    process.exit(failed ? 1 : 0);
}
main().catch((e) => { console.error(e.message); process.exit(2); });
