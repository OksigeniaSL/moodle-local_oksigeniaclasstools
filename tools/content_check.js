#!/usr/bin/env node
// Checks the content packs of the board (app/content/*.js): keys, sizes, letters and the time in words.
// Usage: node tools/content_check.js [app/content/xx.js …]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const files = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(path.join(__dirname, '../app/content')).filter((f) => f.endsWith('.js')).map((f) => path.join(__dirname, '../app/content', f));
let bad = 0;
for (const file of files) {
    const errors = [], warn = [], box = { window: {} };
    try { vm.runInNewContext(fs.readFileSync(file, 'utf8'), box); } catch (e) { console.log(`${file}: does not load: ${e.message}`); bad++; continue; }
    const C = box.window.CLASSTOOLS_CONTENT;
    if (!C) { console.log(`${file}: no window.CLASSTOOLS_CONTENT`); bad++; continue; }
    const need = (k, test, what) => { if (!(k in C)) { errors.push(`missing ${k}`); } else if (!test(C[k])) { errors.push(`${k}: ${what}`); } };
    const pairs = (n) => (v) => Array.isArray(v) && v.length === n && v.every((p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'string' && x.trim()));
    const list = (n) => (v) => Array.isArray(v) && v.length === n && v.every((x) => typeof x === 'string' && x.trim());
    need('lang', (v) => typeof v === 'string' && path.basename(file, '.js') === v, 'must be the file name');
    need('decimal', (v) => v === ',' || v === '.', ', or .');
    need('alphabet', (v) => typeof v === 'string' && new Set([...v]).size === [...v].length && [...v].every((c) => c === c.toUpperCase() || c === 'ß'), 'unique capital letters');
    const A = new Set([...(C.alphabet || '')]);
    need('fold', (v) => v && typeof v === 'object' && Object.entries(v).every(([k, x]) => !A.has(k) && [...x].every((c) => A.has(c))), 'folded letters must not be in the alphabet and must fold to letters of it');
    need('keyboard', (v) => Array.isArray(v) && v.length === 3 && (() => { const keys = [...v.join('')]; return keys.length === A.size && keys.every((k) => A.has(k)); })(), 'three rows with every letter once');
    need('vowels', (v) => typeof v === 'string' && [...v].every((c) => A.has(c)), 'letters of the alphabet');
    need('stopOut', (v) => typeof v === 'string' && [...v].every((c) => A.has(c)), 'letters of the alphabet');
    const norm = (w) => [...w].map((c) => { if (A.has(c)) { return c; } const u = c.toUpperCase(); return A.has(u) ? u : ((C.fold || {})[u] || u); }).join('');
    // Word lists by screen mode: Hangman (early, long = primary, secondary, advanced) and Word (four, five, six, seven
    // letters once folded, for early, primary, secondary and advanced).
    const LISTS = {
        early: [(n) => n >= 3 && n <= 6, '3–6 letters'], long: [(n) => n >= 4, '4 or more letters'],
        secondary: [(n) => n >= 6, '6 or more letters'], advanced: [(n) => n >= 8, '8 or more letters'],
        four: [(n) => n === 4, 'exactly 4 letters'], five: [(n) => n === 5, 'exactly 5 letters'],
        six: [(n) => n === 6, 'exactly 6 letters'], seven: [(n) => n === 7, 'exactly 7 letters'],
    };
    need('words', (v) => v && Object.keys(LISTS).every((k) => Array.isArray(v[k])), Object.keys(LISTS).join(', '));
    if (C.words) {
        const seen = {};
        Object.entries(LISTS).forEach(([k, [ok, what]]) => {
            const l = C.words[k];
            if (!Array.isArray(l)) { return; }
            const badOnes = l.filter((w) => typeof w !== 'string' || w !== w.toUpperCase() || ![...norm(w)].every((c) => A.has(c)) || !ok([...norm(w)].length));
            if (badOnes.length) { errors.push(`words.${k} (capitals, letters only, ${what}): ${badOnes.join(', ')}`); }
            const good = l.length - badOnes.length;
            if (good < 40 || l.length > 60) { errors.push(`words.${k}: ${good} valid of ${l.length} (40–60)`); }
            const dup = l.filter((w, i) => l.indexOf(w) !== i);
            if (dup.length) { warn.push(`words.${k} repeated: ${dup.join(', ')}`); }
            l.forEach((w) => { (seen[w] = seen[w] || []).push(k); });
        });
        const hang = ['early', 'long', 'secondary', 'advanced'];
        const twice = Object.entries(seen).filter(([, ks]) => ks.filter((k) => hang.includes(k)).length > 1).map(([w]) => w);
        if (twice.length) { warn.push(`in two Hangman lists: ${twice.join(', ')}`); }
    }
    // Names of the anonymous participants of a live session: an animal and a word that goes with any animal.
    need('avatar', (v) => v && ['aw', 'wa'].includes(v.order) && [' ', '-', ''].includes(v.join) && Array.isArray(v.animals) && Array.isArray(v.words),
        'order aw or wa, join, animals and words');
    if (C.avatar && Array.isArray(C.avatar.animals) && Array.isArray(C.avatar.words)) {
        const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
        [['animals', 40, 60], ['words', 30, 50]].forEach(([k, lo, hi]) => {
            const l = C.avatar[k];
            if (l.length < lo || l.length > hi) { errors.push(`avatar.${k}: ${l.length} (${lo}–${hi})`); }
            const bad = l.filter((w) => typeof w !== 'string' || !w.trim() || w !== w.trim() || emoji.test(w));
            if (bad.length) { errors.push(`avatar.${k}: ${bad.join(', ')}`); }
            const dup = l.filter((w, i) => l.indexOf(w) !== i);
            if (dup.length) { errors.push(`avatar.${k} repeated: ${dup.join(', ')}`); }
        });
    }
    need('colours', list(12), '12 names'); need('numbers', list(20), '20 words'); need('opposites', pairs(16), '16 pairs');
    need('elements', list(28), '28 names'); need('units', pairs(15), '15 pairs'); need('prefixes', pairs(12), '12 pairs');
    need('formulas', pairs(16), '16 pairs'); need('laws', pairs(15), '15 pairs'); need('functions', list(12), '12 labels');
    need('derivatives', pairs(11), '11 pairs'); need('integrals', pairs(12), '12 pairs'); need('groups', pairs(13), '13 pairs');
    need('constants', pairs(12), '12 pairs'); need('greek', pairs(13), '13 pairs');
    need('clock', (v) => typeof v === 'function', 'a function');
    if (typeof C.clock === 'function') {
        for (let t = 0; t < 1440; t++) {
            const s = C.clock(t);
            if (typeof s !== 'string' || !s.trim() || s !== s.trim() || s[0] !== s[0].toUpperCase() || /undefined|NaN|\s\s/.test(s)) { errors.push(`clock(${t}) = «${s}»`); break; }
        }
    }
    need('rosco', (v) => Array.isArray(v) && v.length >= Math.min(20, A.size), 'items');
    if (Array.isArray(C.rosco)) {
        C.rosco.forEach(([l, k, c, a]) => {
            if (!A.has(l)) { errors.push(`rosco: ${l} is not a letter of the alphabet`); return; }
            const n = norm(a);
            if (k === 's' && !n.startsWith(l)) { errors.push(`rosco ${l}: «${a}» does not start with ${l}`); }
            if (k === 'c' && !n.includes(l)) { errors.push(`rosco ${l}: «${a}» does not contain ${l}`); }
            if (!['s', 'c'].includes(k) || !c || !c.trim()) { errors.push(`rosco ${l}: kind or clue`); }
        });
        const missing = [...A].filter((l) => !C.rosco.some((it) => it[0] === l));
        if (missing.length) { warn.push(`rosco without: ${missing.join(' ')}`); }
    }
    need('lock', (v) => v && v.name && v.final && Array.isArray(v.clues) && v.clues.length === 4, 'name, final and 4 clues');
    console.log(`${path.basename(file)}: ${errors.length ? 'ERRORS' : 'ok'}${warn.length ? ' (' + warn.join('; ') + ')' : ''}`);
    errors.forEach((e) => console.log('  - ' + e));
    if (errors.length) { bad++; }
}
process.exit(bad ? 1 : 0);
