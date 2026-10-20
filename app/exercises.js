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
 * Exercises for Order, Sort (with Odd one out and Venn), Spot the mistakes and Who am I?: the plain text teachers
 * write, read into the JSON shared with Oksigenia Tesapé (docs/exercise-format.md). The game is chosen by the teacher
 * and never guessed from the text: parse(text, type) reads it as that game.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const TYPES = ['order', 'classify', 'errors', 'whoami'];
    const MARK = /\[([^\]|]*)\|([^\]|]*)(?:\|([^\]]*))?\]/g;
    const list = (text, sep) => text.split(sep).map((x) => x.trim()).filter(Boolean);

    // One exercise from a block of lines, or null if it does not make one.
    const block = (lines, type, mode) => {
        const ex = { type };
        const why = {};
        const rest = [];
        lines.forEach((line, i) => {
            if (i === 0 && line.startsWith('#')) { ex.title = line.slice(1).trim(); return; }
            if (line.startsWith('?')) {
                const at = line.indexOf(':');
                if (at > 1) { why[line.slice(1, at).trim()] = line.slice(at + 1).trim(); }
                return;
            }
            rest.push(line);
        });
        if (type === 'order') {
            if (rest.length < 2) { return null; }
            ex.items = rest;
        } else if (type === 'classify') {
            ex.mode = mode || 'sort';
            ex.groups = rest.filter((l) => l.indexOf(':') > 0).map((l) => {
                const at = l.indexOf(':'), items = l.slice(at + 1);
                return { name: l.slice(0, at).trim(), items: list(items, items.includes(';') ? ';' : ',') };
            }).filter((g) => g.name && g.items.length);
            if (ex.groups.length < 2) { return null; }
        } else if (type === 'errors') {
            const marks = [];
            ex.text = rest.join('\n').replace(MARK, (m, wrong, right, reason) => {
                const mark = { wrong: wrong.trim(), right: list(right, '/') };
                if (reason && reason.trim()) { mark.why = reason.trim(); }
                marks.push(mark);
                return `{${marks.length - 1}}`;
            });
            if (!marks.length || marks.some((m) => !m.wrong || !m.right.length)) { return null; }
            ex.marks = marks;
        } else if (type === 'whoami') {
            if (!rest.length || !rest[0].startsWith('=')) { return null; }
            const names = list(rest[0].slice(1), '/');
            if (!names.length || rest.length < 2) { return null; }
            ex.answer = names[0];
            if (names.length > 1) { ex.accept = names.slice(1); }
            ex.clues = rest.slice(1);
        }
        if (Object.keys(why).length && type !== 'errors') { ex.why = why; }
        return ex;
    };

    /**
     * The exercises of a text for a game: a blank line between them.
     *
     * @param {string} text
     * @param {string} type order, classify, errors or whoami.
     * @param {string} [mode] For classify: sort, odd or venn.
     * @return {Object[]}
     */
    const parse = (text, type, mode) => {
        if (!TYPES.includes(type)) { return []; }
        return String(text || '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n/)
            .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
            .filter((lines) => lines.length)
            .map((lines) => block(lines, type, mode))
            .filter(Boolean);
    };

    /**
     * An exercise as plain text again (to edit it, or to bring one in from JSON).
     *
     * @param {Object} ex
     * @return {string}
     */
    const toText = (ex) => {
        const out = [];
        if (ex.title) { out.push('# ' + ex.title); }
        if (ex.type === 'order') { out.push(...ex.items); }
        if (ex.type === 'classify') {
            ex.groups.forEach((g) => out.push(`${g.name}: ${g.items.join(g.items.some((x) => x.includes(',')) ? '; ' : ', ')}`));
        }
        if (ex.type === 'errors') {
            out.push(ex.text.replace(/\{(\d+)\}/g, (m, n) => {
                const k = ex.marks[Number(n)];
                return k ? `[${k.wrong}|${k.right.join('/')}${k.why ? '|' + k.why : ''}]` : m;
            }));
        }
        if (ex.type === 'whoami') { out.push('= ' + [ex.answer].concat(ex.accept || []).join(' / '), ...ex.clues); }
        Object.entries(ex.why || {}).forEach(([item, reason]) => out.push(`? ${item}: ${reason}`));
        return out.join('\n');
    };

    /**
     * An Odd one out round from a classify exercise: three items of one group and one of another, shuffled.
     *
     * @param {Object} ex
     * @param {function(number): number} random random(n) → 0…n−1.
     * @return {Object|null} { items, odd, group, oddGroup }
     */
    const oddRound = (ex, random) => {
        const big = ex.groups.filter((g) => g.items.length >= 3);
        if (!big.length || ex.groups.length < 2) { return null; }
        const group = big[random(big.length)];
        const others = ex.groups.filter((g) => g !== group);
        const oddGroup = others[random(others.length)];
        const pool = group.items.slice(), three = [];
        while (three.length < 3) { three.push(pool.splice(random(pool.length), 1)[0]); }
        const outside = oddGroup.items.filter((x) => !group.items.includes(x));
        if (!outside.length) { return null; }
        const odd = outside[random(outside.length)];
        const items = three.concat([odd]);
        for (let i = items.length - 1; i > 0; i--) { const j = random(i + 1); [items[i], items[j]] = [items[j], items[i]]; }
        return { items, odd, group: group.name, oddGroup: oddGroup.name };
    };

    window.ClasstoolsExercises = { parse, toText, oddRound, TYPES };
})();
