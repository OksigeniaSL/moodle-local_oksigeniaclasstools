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
    need('words', (v) => v && Array.isArray(v.long) && Array.isArray(v.five), 'long and five');
    if (C.words) {
        const longBad = C.words.long.filter((w) => w !== w.toUpperCase() || ![...norm(w)].every((c) => A.has(c)));
        if (longBad.length) { errors.push(`words.long not capitals/letters: ${longBad.join(', ')}`); }
        if (C.words.long.length < 40) { errors.push(`words.long: ${C.words.long.length} (40–60)`); }
        const fiveBad = C.words.five.filter((w) => [...norm(w)].length !== 5 || ![...norm(w)].every((c) => A.has(c)));
        if (fiveBad.length) { errors.push(`words.five not five letters: ${fiveBad.join(', ')}`); }
        if (C.words.five.length - fiveBad.length < 40) { errors.push(`words.five: ${C.words.five.length - fiveBad.length} valid (40–60)`); }
        const dup = (l) => l.filter((w, i) => l.indexOf(w) !== i);
        if (dup(C.words.long).length || dup(C.words.five).length) { warn.push(`repeated words: ${dup(C.words.long).concat(dup(C.words.five)).join(', ')}`); }
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
