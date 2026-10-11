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
    aiurl: 'fake://ai',
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
        // The AI of the site, as ai.php gives it: the policy until it is accepted, then two exercises in a code fence
        // (the server takes the fences away; here they never come).
        if (String(url).startsWith('fake://ai')) {
            if (a === 'accept') { FAKE.aiAccepted = true; return json({ ok: true }); }
            if (!FAKE.aiAccepted) { return json({ ok: false, policy: '<p>The AI policy of the site.</p>' }); }
            return json({ ok: true, text: '# Volcano\\n= Volcano\\nI have a crater.\\nI erupt lava.\\n\\n# Island\\n= Island\\nI have water all around.\\nI am land.' });
        }
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
            const parts = sheet.querySelectorAll('.ct-guia-parte').length;
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
        if (ids.length < 25) { bad.push(`only ${ids.length} guides`); }
        return bad.length ? bad.join('; ') : '';
    },
    // Order: a wrong try sends cards back, then the right order wins.
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
        document.querySelector('#ex-ed-ai').open = true;
        const topic = document.querySelector('#ex-ai-topic');
        topic.value = 'Volcanoes';
        topic.dispatchEvent(new Event('input'));
        const level = document.querySelector('#ex-ai-level');
        level.value = 'secondary';
        level.dispatchEvent(new Event('change'));
        const text = document.querySelector('#ex-ai-text').value;
        const missing = ['Volcanoes', 'Secondary students', 'Write 5 exercises', '= ', '#'].filter((x) => !text.includes(x));
        if (missing.length) { return `the prompt lacks ${missing.join(', ')}: «${text}»`; }
        // Headless Chrome has no clipboard: a fake one, to see what the button copies.
        let clip = '';
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (x) => { clip = x; return Promise.resolve(); } } });
        document.querySelector('#ex-ai-copy').click();
        await sleep(300);
        if (clip !== text) { return 'the copy is not the prompt'; }
        await window.shot('exercises-prompt');
        const copied = document.querySelector('#ex-ai-copied').textContent;
        document.querySelector('.ct-ex-editor').close();
        if (!copied) { return 'no message after copying'; }
        // Generate with the AI of the site: the policy first, then the exercises in place of the examples.
        document.querySelector('#quiensoy-edit').click();
        await sleep(200);
        document.querySelector('#ex-ed-ai').open = true;
        document.querySelector('#ex-ai-go').click();
        await sleep(300);
        if (document.querySelector('#ex-ai-policy').hidden) { return 'no AI policy before the first use'; }
        document.querySelector('#ex-ai-accept').click();
        await sleep(400);
        const box = document.querySelector('#ex-ed-text').value;
        if (!/^# Volcano/.test(box) || !box.includes('# Island')) { return `the exercises of the AI are not in the box: «${box.slice(0, 80)}»`; }
        if (!/2/.test(document.querySelector('#ex-ai-copied').textContent)) { return `no count of what came: «${document.querySelector('#ex-ai-copied').textContent}»`; }
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
