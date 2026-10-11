#!/usr/bin/env node
// Checks the board in a headless Chrome, outside Moodle: app/ is served as it is, with a pretend Moodle course and a
// pretend live server, and each check drives the real screen as a teacher would.
// Usage: node tools/browser_check.mjs [check …]   (Node 22 or later, Chrome or Chromium installed; no packages)
// CHROME=/path/to/chrome to choose the browser; SHOTS=<folder> to keep a picture of the screen where a check asks for
// one (await shot('name') in the check), to look at what it has checked.
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
window.CLASSTOOLS = { lists: [{ id: 1, name: 'Class 1', key: 'c1', students: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, n: 'Student ' + (i + 1) })) }],
    courseid: 1, mode: 'teacher', sesskey: 'x', days: {}, state: {}, liveurl: 'fake://live', glossaryurl: 'fake://glossary', bankurl: 'fake://bank',
    me: { id: 99, name: 'Teacher' } };
window.FAKE = { calls: [], polls: 0 };
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
        if (String(url).startsWith('fake://glossary')) {
            return json(a === 'list' ? { ok: true, glossaries: [{ id: 5, name: 'Science words', count: 3 }] }
                : { ok: true, words: GLOSSARY });
        }
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
};

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
    const file = normalize(join(APP, path));
    if (!file.startsWith(APP) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file));
});

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
    const chrome = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
        '--no-default-browser-check', '--disable-gpu', '--mute-audio', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
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
        for (const name of names) {
            const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
            const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
            await send('Runtime.enable', {}, sessionId);
            if (shots) { await send('Runtime.addBinding', { name: 'checkShot' }, sessionId); }
            await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
            await send('Page.enable', {}, sessionId);
            events.length = 0;
            await send('Page.navigate', { url: `${base}/check.html` }, sessionId);
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
