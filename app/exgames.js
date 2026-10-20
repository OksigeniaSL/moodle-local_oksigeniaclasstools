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
 * Four whole-class games on the shared exercise format (exercises.js, docs/exercise-format.md): Order, Sort (also as
 * Odd one out and Venn), Spot the mistakes and Who am I? Everything is done with taps, for the board: a card and then
 * its place. Each game brings an example, and teachers write their own exercises as plain text («My exercises»); they
 * are kept in the browser and, inside Moodle, for the teacher in the course. A wrong answer brings its «why», if the
 * exercise has one.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames, X = window.ClasstoolsExercises;
    if (!core || !games || !X) { return; }
    const { $, $$, t, escape, play, setIcon, announce, save, load, shuffle, random } = core;

    // The teacher's exercises, one text per game, per course like Moodle keeps them.
    const storeKey = 'ejercicios' + (core.moodle ? ':' + core.moodle.courseid : '');
    let store = load(storeKey, null);
    const kept = core.kept ? core.kept('ejercicios') : null;
    if (kept && typeof kept === 'object' && (!store || (kept.updated || 0) > (store.updated || 0))) { store = kept; }
    if (!store || typeof store !== 'object') { store = {}; }
    const persist = () => { store.updated = Date.now(); save(storeKey, store); if (core.keep) { core.keep('ejercicios', store); } };
    // The examples of the game for the level of the board (in its language) first, then the teacher's. These games
    // start in Primary: Early years gets Primary's.
    const exampleText = (type, level) => {
        const l = level || (core.mode ? core.mode() : 'primary');
        return t(`ex_example_${type}_${['secondary', 'advanced'].includes(l) ? l : 'primary'}`);
    };
    // The examples, then the teacher's own (without those that are an example as it was: saved by an editor that once
    // opened with the examples in it).
    const exercisesOf = (type, mode) => {
        const examples = X.parse(exampleText(type), type, mode).map((e) => Object.assign(e, { example: true }));
        const seen = new Set(examples.map((e) => X.toText(e)));
        return examples.concat(X.parse(store[type] || '', type, mode).filter((e) => !seen.has(X.toText(e))));
    };
    const labelOf = (e, i) => {
        const name = e.title || t('ex_untitled', i + 1);
        return e.example ? t('ex_example', name) : name;
    };
    const why = (e, item) => (e.why && e.why[item]) || '';
    // Boxes on the board for Sort: more do not fit with the cards.
    const MAX_GROUPS = 6;
    // The levels of these games, for the prompt of the teacher's AI.
    const AI_LEVELS = ['primary', 'secondary', 'advanced'];

    // «My exercises»: one dialog for the four games, with the format of the game on screen.
    const dialog = document.createElement('dialog');
    dialog.className = 'editor ct-ex-editor';
    dialog.setAttribute('aria-labelledby', 'ex-ed-title');
    dialog.innerHTML = `<form method="dialog">
        <h2 id="ex-ed-title"></h2>
        <p class="nota" id="ex-ed-help"></p>
        <div id="ex-ed-ai"></div>
        <label class="campo apilado"><span>${escape(t('ex_text'))}</span><textarea id="ex-ed-text" rows="12" spellcheck="true"></textarea></label>
        <p class="nota" id="ex-ed-count" aria-live="polite"></p>
        <div class="botonera"><button type="submit" class="boton" value="save"><span data-icono="guardar"></span>${escape(t('ex_save'))}</button>
            <button type="button" class="boton suave" data-a="cancel">${escape(t('ex_cancel'))}</button></div>
    </form>`;
    document.body.append(dialog);
    $$('[data-icono]', dialog).forEach((el) => setIcon(el, el.dataset.icono));
    let editing = null;
    const countText = () => {
        const n = X.parse($('#ex-ed-text').value, editing.type).length;
        $('#ex-ed-count').textContent = n === 0 ? t('ex_count_none') : (n === 1 ? t('ex_count_one') : t('ex_count', n));
    };
    $('#ex-ed-text').addEventListener('input', countText);
    // The prompt for the teacher's AI: the game, the topic, the level, the rules of the format and the first example of
    // that level. What the AI writes (pasted, or from «Generate») goes in the box, in place of the examples if that is
    // what it had, to check before saving.
    const ai = window.ClasstoolsAI ? window.ClasstoolsAI.box({
        kind: () => editing.type, ready: () => !!editing,
        levels: AI_LEVELS, counts: [3, 5, 8, 10], count: 5,
        prompt: (p) => {
            const type = editing.type, example = X.parse(exampleText(type, p.level), type)[0];
            return t('ex_ai_prompt', {
                n: p.n, game: editing.name, topic: p.topic || t('ex_ai_any'), level: t('ex_ai_for_' + p.level),
                rules: `${t('ex_help_' + type)} ${t('ex_format')}`, example: example ? X.toText(example) : '',
            });
        },
        add: (text) => {
            const type = editing.type, found = X.parse(text, type).length;
            if (!found) { return 0; }
            const area = $('#ex-ed-text'), now = area.value.trim();
            area.value = (now ? now + '\n\n' : '') + text;
            countText();
            return found;
        },
        done: (n) => t('ex_ai_done', n),
    }) : null;
    if (ai) { $('#ex-ed-ai').append(ai.el); }
    dialog.querySelector('[data-a="cancel"]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
        if (dialog.returnValue === 'save' && editing) {
            store[editing.type] = $('#ex-ed-text').value;
            persist();
            editing.done();
        }
        dialog.returnValue = '';
    });
    const edit = (type, name, done) => {
        editing = { type, done, name };
        $('#ex-ed-title').textContent = t('ex_edit_title', name);
        $('#ex-ed-help').textContent = `${t('ex_help_' + type)} ${t('ex_format')}`;
        // Empty for a first exercise, with the examples as a model to follow (not copied into the teacher's own).
        $('#ex-ed-text').value = store[type] || '';
        $('#ex-ed-text').placeholder = exampleText(type);
        if (ai) { ai.refresh(); }
        countText();
        dialog.showModal();
    };

    /**
     * A game on the format: the choice of exercise and «My exercises» in its side, its own stage.
     *
     * @param {Object} def id, type, name, modes (optional), stage(panel), start(exercise, mode), controls (html).
     */
    const make = (def) => {
        const p = def.id;
        let visible = false, current = null;
        const mode = () => (def.modes ? ($(`#${p}-mode [aria-checked="true"]`) || { dataset: { v: def.modes[0] } }).dataset.v : undefined);
        const fill = () => {
            const sel = $(`#${p}-ex`), before = sel.value || load(p + '-ejercicio', '0');
            const all = exercisesOf(def.type, mode());
            sel.innerHTML = all.map((e, i) => `<option value="${i}">${escape(labelOf(e, i))}</option>`).join('');
            sel.value = all[Number(before)] ? before : '0';
        };
        const chosen = () => exercisesOf(def.type, mode())[Number($(`#${p}-ex`).value)] || null;
        def.api = {
            note: (text) => { $(`#${p}-note`).textContent = text || ''; },
            msg: (text, cls) => { const m = $(`#${p}-msg`); m.className = 'total' + (cls ? ' ' + cls : ''); m.textContent = text; },
            why: (lines) => {
                const box = $(`#${p}-why`);
                box.hidden = !lines.length;
                box.innerHTML = lines.length ? `<p class="ante">${escape(t('ex_why'))}</p>${lines.map(([item, text]) => `<p><strong>${escape(item)}</strong>: ${escape(text)}</p>`).join('')}` : '';
            },
            playing: (on) => games.playing(p, on),
            stage: () => $(`#${p}-stage`),
            visible: () => visible,
            next: () => { const sel = $(`#${p}-ex`); sel.value = String((Number(sel.value) + 1) % sel.options.length); save(p + '-ejercicio', sel.value); start(); },
        };
        const start = () => {
            current = chosen();
            if (!current) { def.api.note(t('ex_count_none')); return; }
            def.api.note('');
            def.api.why([]);
            save(p + '-ejercicio', $(`#${p}-ex`).value);
            def.start(current, mode());
            // One of the teacher's own, not an example: the sticker of «My exercises».
            if (!current.example && core.logro) { core.logro('creajuegos'); }
        };
        games.add({
            id: p, name: t(def.name),
            mount: (panel) => {
                panel.innerHTML = `
                    <div class="ct-word-game ct-ex">
                        <aside class="tarjeta ct-side">
                            <div class="ct-setup ct-setup-group">
                                ${def.modes ? `<p class="ante">${escape(t('so_mode'))}</p><div class="segmentos ct-ex-modes" role="radiogroup" aria-label="${escape(t('so_mode'))}" id="${p}-mode">
                                    ${def.modes.map((m, i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-v="${m}">${escape(t('so_' + m))}</button>`).join('')}</div>` : ''}
                                <label class="campo apilado"><span>${escape(t('ex_exercise'))}</span><select id="${p}-ex"></select></label>
                                <button type="button" class="boton suave" id="${p}-edit"><span data-icono="editar"></span><span>${escape(t('ex_mine'))}</span></button>
                                <button type="button" class="boton grande" id="${p}-start"><span data-icono="seguir"></span><span>${escape(t('ga_start'))}</span></button>
                            </div>
                            ${def.controls || ''}
                            <div class="ct-ex-why" id="${p}-why" hidden></div>
                            <p class="nota" id="${p}-note"></p>
                        </aside>
                        <div class="tarjeta ct-stage ct-ex-stage" id="${p}-stage"></div>
                    </div>`;
                $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
                def.stage($(`#${p}-stage`));
                $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
                $(`#${p}-start`).addEventListener('click', start);
                // After saving, the newest exercise (the last of the list) stays chosen.
                $(`#${p}-edit`).addEventListener('click', () => edit(def.type, t(def.name), () => {
                    fill();
                    const sel = $(`#${p}-ex`);
                    if (sel.options.length) { sel.value = String(sel.options.length - 1); save(p + '-ejercicio', sel.value); }
                }));
                $(`#${p}-ex`).addEventListener('change', () => save(p + '-ejercicio', $(`#${p}-ex`).value));
                document.addEventListener('classtools:mode', fill);
                if (def.modes) {
                    const saved = load(p + '-modo', def.modes[0]);
                    $$(`#${p}-mode button`).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === saved)));
                    $(`#${p}-mode`).addEventListener('click', (e) => {
                        const b = e.target.closest('button[data-v]');
                        if (!b) { return; }
                        $$(`#${p}-mode button`).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
                        save(p + '-modo', b.dataset.v);
                        fill();
                    });
                }
                if (def.wire) { def.wire(); }
                fill();
            },
            enter: () => { visible = true; fill(); },
            leave: () => { visible = false; },
            space: () => { if (def.space) { def.space(); } else { start(); } },
        });
        return def;
    };
    const celebrate = (stage, title) => { if (core.celebrate) { core.celebrate(stage, { title }); } play('fin'); announce(title); };

    // ---------------------------------------------------------------------------------------------------
    // Order: the cards, shuffled; each tap puts one in the next empty place (a tap on a placed card takes it back).
    // «Check» keeps the right ones and sends the others back with their why.
    // ---------------------------------------------------------------------------------------------------
    const ord = { ex: null, pool: [], slots: [], fixed: [], over: true };
    const order = make({
        id: 'ordenar', type: 'order', name: 'ord_name',
        controls: `<button type="button" class="boton grande verde" id="ordenar-check" hidden><span data-icono="comprobar"></span><span>${escape(t('ex_check'))}</span></button>`,
        stage: (stage) => {
            stage.innerHTML = `<p class="ct-word-clue" id="ordenar-title"></p><ol class="ct-ord-slots" id="ordenar-slots"></ol>
                <div class="ct-ex-pool" id="ordenar-pool"></div><p class="total espera" id="ordenar-msg">${escape(t('ex_press_start'))}</p>`;
        },
        wire: () => {
            $('#ordenar-pool').addEventListener('click', (e) => {
                const c = e.target.closest('[data-i]');
                if (!c || ord.over) { return; }
                const at = ord.slots.indexOf(null);
                if (at < 0) { return; }
                ord.slots[at] = Number(c.dataset.i); ord.pool = ord.pool.filter((x) => x !== Number(c.dataset.i));
                play('tic'); paintOrder();
            });
            $('#ordenar-slots').addEventListener('click', (e) => {
                const li = e.target.closest('[data-k]');
                if (!li || ord.over) { return; }
                const k = Number(li.dataset.k);
                if (ord.slots[k] === null || ord.fixed[k]) { return; }
                ord.pool.push(ord.slots[k]); ord.slots[k] = null;
                paintOrder();
            });
            $('#ordenar-check').addEventListener('click', checkOrder);
        },
        start: (ex) => {
            const n = ex.items.length;
            let mix = shuffle(ex.items.map((_, i) => i));
            if (mix.every((x, i) => x === i)) { mix = mix.slice(1).concat(mix[0]); }
            Object.assign(ord, { ex, pool: mix, slots: Array(n).fill(null), fixed: Array(n).fill(false), over: false });
            $('#ordenar-title').textContent = ex.title || '';
            order.api.msg(t('ord_place'));
            order.api.playing(true);
            paintOrder();
        },
    });
    function paintOrder() {
        const ex = ord.ex;
        $('#ordenar-slots').innerHTML = ord.slots.map((i, k) => `<li data-k="${k}" class="${i === null ? 'ct-empty' : ''}${ord.fixed[k] ? ' ct-right' : ''}">`
            + `<span class="ct-ord-n">${k + 1}</span>${i === null ? '' : `<span class="ct-ex-card">${escape(ex.items[i])}</span>`}</li>`).join('');
        $('#ordenar-pool').innerHTML = ord.pool.map((i) => `<button type="button" class="ct-ex-card" data-i="${i}">${escape(ex.items[i])}</button>`).join('');
        $('#ordenar-check').hidden = ord.over || ord.slots.includes(null);
    }
    function checkOrder() {
        const wrong = [];
        ord.slots.forEach((i, k) => {
            if (i === k) { ord.fixed[k] = true; return; }
            wrong.push(ord.ex.items[i]); ord.pool.push(i); ord.slots[k] = null;
        });
        const right = ord.fixed.filter(Boolean).length, n = ord.slots.length;
        order.api.why(wrong.map((item) => [item, why(ord.ex, item)]).filter(([, w]) => w));
        if (right === n) {
            ord.over = true; order.api.playing(false);
            order.api.msg(t('ord_done'), 'ct-win'); celebrate(order.api.stage(), t('ord_done'));
        } else {
            order.api.msg(t('ord_right', { n: right, of: n })); play('wrong');
        }
        paintOrder();
    }

    // ---------------------------------------------------------------------------------------------------
    // Sort: a card is tapped, then its box (in Venn, its zone: one group, the other, or both). Odd one out: four
    // cards, three of a group and one of another.
    // ---------------------------------------------------------------------------------------------------
    const so = { ex: null, mode: 'sort', items: [], place: {}, fixed: {}, sel: null, round: null, over: true };
    const sort = make({
        id: 'clasificar', type: 'classify', name: 'so_name', modes: ['sort', 'odd', 'venn'],
        controls: `<button type="button" class="boton grande verde" id="clasificar-check" hidden><span data-icono="comprobar"></span><span>${escape(t('ex_check'))}</span></button>
            <button type="button" class="boton suave" id="clasificar-again" hidden><span data-icono="otra"></span><span>${escape(t('so_another'))}</span></button>`,
        stage: (stage) => {
            stage.innerHTML = `<p class="ct-word-clue" id="clasificar-title"></p><div class="ct-so-boxes" id="clasificar-boxes"></div>
                <div class="ct-ex-pool" id="clasificar-pool"></div><p class="total espera" id="clasificar-msg">${escape(t('ex_press_start'))}</p>`;
        },
        wire: () => {
            $('#clasificar-pool').addEventListener('click', (e) => {
                const c = e.target.closest('[data-item]');
                if (!c || so.over) { return; }
                if (so.mode === 'odd') { pickOdd(c); return; }
                so.sel = so.sel === c.dataset.item ? null : c.dataset.item;
                paintSort();
            });
            $('#clasificar-boxes').addEventListener('click', (e) => {
                if (so.over || so.mode === 'odd') { return; }
                const inBox = e.target.closest('[data-item]'), box = e.target.closest('[data-zone]');
                if (inBox && !so.sel) {
                    if (so.fixed[inBox.dataset.item]) { return; }
                    delete so.place[inBox.dataset.item]; paintSort(); return;
                }
                if (!box || !so.sel) { return; }
                so.place[so.sel] = box.dataset.zone; so.sel = null;
                play('tic'); paintSort();
            });
            $('#clasificar-check').addEventListener('click', checkSort);
            $('#clasificar-again').addEventListener('click', () => sort.start(so.ex, 'odd'));
        },
        start: (ex, mode) => {
            Object.assign(so, { ex, mode, place: {}, fixed: {}, sel: null, over: false, round: null });
            $('#clasificar-title').textContent = ex.title || '';
            $('#clasificar-again').hidden = true;
            if (mode === 'odd') {
                so.round = X.oddRound(ex, random);
                if (!so.round) { sort.api.note(t('so_need_groups')); so.over = true; return; }
                so.items = so.round.items;
                sort.api.msg(t('so_odd_ask'));
            } else {
                const groups = mode === 'venn' ? ex.groups.slice(0, 2) : ex.groups.slice(0, MAX_GROUPS);
                so.items = shuffle([...new Set(groups.flatMap((g) => g.items))]);
                sort.api.msg(t('so_pick'));
            }
            sort.api.playing(true);
            paintSort();
        },
        space: () => { if (so.mode === 'odd' && so.over && so.ex) { sort.start(so.ex, 'odd'); } },
    });
    // Where an item belongs: the group (sort), or the zone of the Venn (a, b or ab).
    const zonesOf = (item) => {
        const g = so.ex.groups;
        if (so.mode === 'venn') {
            const a = g[0].items.includes(item), b = g[1].items.includes(item);
            return [a && b ? 'ab' : (a ? 'a' : 'b')];
        }
        return g.slice(0, MAX_GROUPS).map((x, i) => (x.items.includes(item) ? String(i) : null)).filter((x) => x !== null);
    };
    function paintSort() {
        const card = (item) => `<button type="button" class="ct-ex-card${so.sel === item ? ' ct-sel' : ''}${so.fixed[item] ? ' ct-right' : ''}" data-item="${escape(item)}">${escape(item)}</button>`;
        const inZone = (z) => so.items.filter((x) => so.place[x] === z).map(card).join('');
        if (so.mode === 'odd') {
            $('#clasificar-boxes').innerHTML = '';
            $('#clasificar-pool').innerHTML = so.items.map((x) => `<button type="button" class="ct-ex-card ct-big${so.over && x === so.round.odd ? ' ct-right' : ''}" data-item="${escape(x)}">${escape(x)}</button>`).join('');
        } else if (so.mode === 'venn') {
            const [a, b] = so.ex.groups;
            $('#clasificar-boxes').innerHTML = `<div class="ct-venn"><div class="ct-venn-zone ct-venn-a" data-zone="a"><p class="ante">${escape(a.name)}</p>${inZone('a')}</div>`
                + `<div class="ct-venn-zone ct-venn-ab" data-zone="ab"><p class="ante">${escape(t('so_both'))}</p>${inZone('ab')}</div>`
                + `<div class="ct-venn-zone ct-venn-b" data-zone="b"><p class="ante">${escape(b.name)}</p>${inZone('b')}</div></div>`;
            $('#clasificar-pool').innerHTML = so.items.filter((x) => !so.place[x]).map(card).join('');
        } else {
            $('#clasificar-boxes').innerHTML = so.ex.groups.slice(0, MAX_GROUPS).map((g, i) => `<div class="ct-so-box" data-zone="${i}"><p class="ante">${escape(g.name)}</p>${inZone(String(i))}</div>`).join('');
            $('#clasificar-pool').innerHTML = so.items.filter((x) => !so.place[x]).map(card).join('');
        }
        $('#clasificar-boxes').classList.toggle('ct-picking', !!so.sel);
        $('#clasificar-check').hidden = so.over || so.mode === 'odd' || so.items.some((x) => !so.place[x]);
    }
    function checkSort() {
        const wrong = [];
        so.items.forEach((x) => {
            if (zonesOf(x).includes(so.place[x])) { so.fixed[x] = true; } else { wrong.push(x); delete so.place[x]; }
        });
        sort.api.why(wrong.map((x) => [x, why(so.ex, x)]).filter(([, w]) => w));
        const right = Object.keys(so.fixed).length;
        if (!wrong.length) {
            so.over = true; sort.api.playing(false);
            sort.api.msg(t('so_done'), 'ct-win'); celebrate(sort.api.stage(), t('so_done'));
        } else {
            sort.api.msg(t('so_right', { n: right, of: so.items.length })); play('wrong');
        }
        paintSort();
    }
    function pickOdd(c) {
        if (c.dataset.item !== so.round.odd) {
            c.disabled = true; c.classList.add('ct-no'); play('wrong');
            return;
        }
        so.over = true; sort.api.playing(false);
        const text = t('so_odd_right', { odd: so.round.odd, oddgroup: so.round.oddGroup, group: so.round.group });
        sort.api.msg(text, 'ct-win');
        const w = why(so.ex, so.round.odd);
        sort.api.why(w ? [[so.round.odd, w]] : []);
        $('#clasificar-again').hidden = false;
        play('fin'); announce(text);
        paintSort();
    }

    // ---------------------------------------------------------------------------------------------------
    // Spot the mistakes: the text, every word can be tapped. A mistake tapped once is marked; tapped again, it shows
    // its correction (and its why). A word that is right just shakes.
    // ---------------------------------------------------------------------------------------------------
    const er = { ex: null, found: [], shown: [], over: true };
    const errs = make({
        id: 'errores', type: 'errors', name: 'er_name',
        controls: `<button type="button" class="boton suave" id="errores-show" hidden><span data-icono="ocultar"></span><span>${escape(t('er_show'))}</span></button>`,
        stage: (stage) => {
            stage.innerHTML = `<p class="ct-word-clue" id="errores-title"></p><div class="ct-er-text" id="errores-text"></div>
                <p class="total espera" id="errores-msg">${escape(t('ex_press_start'))}</p>`;
        },
        wire: () => {
            $('#errores-text').addEventListener('click', (e) => {
                const w = e.target.closest('[data-w]');
                if (!w || er.over && !w.dataset.mark) { return; }
                if (w.dataset.mark === undefined) { w.classList.remove('ct-no'); void w.offsetWidth; w.classList.add('ct-no'); play('wrong'); return; }
                const n = Number(w.dataset.mark);
                if (!er.found[n]) { er.found[n] = true; play('tic'); } else if (!er.shown[n]) { er.shown[n] = true; }
                paintErrors();
            });
            $('#errores-show').addEventListener('click', () => { er.found = er.found.map(() => true); er.shown = er.shown.map(() => true); paintErrors(); });
        },
        start: (ex) => {
            Object.assign(er, { ex, found: ex.marks.map(() => false), shown: ex.marks.map(() => false), over: false });
            $('#errores-title').textContent = ex.title || '';
            errs.api.playing(true);
            paintErrors();
        },
    });
    function paintErrors() {
        const ex = er.ex;
        // Words can be tapped; spaces and punctuation alone stay as text, stuck to the word before them.
        const words = (text) => text.split(/(\s+)/).map((x) => {
            if (/^\s+$/.test(x)) { return x.replace(/\n/g, '<br>'); }
            return /[\p{L}\p{N}]/u.test(x) ? `<span class="ct-er-w" data-w>${escape(x)}</span>` : escape(x);
        }).join('');
        $('#errores-text').innerHTML = ex.text.split(/(\{\d+\})/).map((part) => {
            const m = part.match(/^\{(\d+)\}$/);
            if (!m) { return words(part); }
            const n = Number(m[1]), k = ex.marks[n];
            if (!k) { return ''; }
            return `<span class="ct-er-w ct-er-mark${er.found[n] ? ' ct-found' : ''}" data-w data-mark="${n}"><span class="ct-er-wrong">${escape(k.wrong)}</span>`
                + `${er.shown[n] ? `<span class="ct-er-right">${escape(k.right.join(' / '))}</span>` : ''}</span>`;
        }).join('');
        const found = er.found.filter(Boolean).length, n = ex.marks.length;
        errs.api.why(ex.marks.map((k, i) => (er.shown[i] && k.why ? [k.wrong, k.why] : null)).filter(Boolean));
        $('#errores-show').hidden = er.over;
        if (found === n && er.shown.every(Boolean)) {
            if (!er.over) { er.over = true; errs.api.playing(false); celebrate(errs.api.stage(), t('er_done')); }
            errs.api.msg(t('er_done'), 'ct-win');
            $('#errores-show').hidden = true;
        } else {
            errs.api.msg(found && er.found.some((f, i) => f && !er.shown[i]) ? t('er_again') : (found ? t('er_found', { n: found, of: n }) : t('er_tap')));
        }
    }

    // ---------------------------------------------------------------------------------------------------
    // Who am I? The clues come out one by one, the hardest first; the answer is worth less with each clue (100, 80,
    // 60, 40, 20). The class answers aloud and the teacher says if it is right.
    // ---------------------------------------------------------------------------------------------------
    const wa = { ex: null, shown: 0, over: true };
    const worth = () => Math.max(20, 100 - 20 * (wa.shown - 1));
    const who = make({
        id: 'quiensoy', type: 'whoami', name: 'wa_name',
        controls: `<div class="ct-ex-play" id="quiensoy-play" hidden>
            <button type="button" class="boton grande" id="quiensoy-clue"><span data-icono="pista"></span><span>${escape(t('wa_clue'))}</span></button>
            <button type="button" class="boton grande verde" id="quiensoy-right"><span data-icono="acierto"></span><span>${escape(t('wa_right'))}</span></button>
            <button type="button" class="boton suave" id="quiensoy-show"><span data-icono="ocultar"></span><span>${escape(t('wa_show'))}</span></button></div>
            <button type="button" class="boton suave" id="quiensoy-next" hidden><span data-icono="otra"></span><span>${escape(t('wa_next'))}</span></button>`,
        stage: (stage) => {
            stage.innerHTML = `<div class="ct-wa-card" id="quiensoy-card">?</div><ol class="ct-wa-clues" id="quiensoy-clues"></ol>
                <p class="total espera" id="quiensoy-msg">${escape(t('ex_press_start'))}</p>`;
        },
        wire: () => {
            $('#quiensoy-clue').addEventListener('click', () => { if (!wa.over && wa.shown < wa.ex.clues.length) { wa.shown++; play('tic'); paintWho(); } });
            $('#quiensoy-right').addEventListener('click', () => endWho(true));
            $('#quiensoy-show').addEventListener('click', () => endWho(false));
            $('#quiensoy-next').addEventListener('click', () => who.api.next());
        },
        start: (ex) => {
            Object.assign(wa, { ex, shown: 1, over: false });
            $('#quiensoy-card').textContent = '?';
            $('#quiensoy-card').classList.remove('ct-right');
            $('#quiensoy-play').hidden = false; $('#quiensoy-next').hidden = true;
            who.api.playing(true);
            paintWho();
        },
        space: () => { if (wa.ex && !wa.over && wa.shown < wa.ex.clues.length) { wa.shown++; paintWho(); } },
    });
    function paintWho() {
        $('#quiensoy-clues').innerHTML = wa.ex.clues.slice(0, wa.shown).map((c) => `<li>${escape(c)}</li>`).join('');
        const more = wa.shown < wa.ex.clues.length;
        $('#quiensoy-clue').disabled = !more || wa.over;
        core.relabel($('#quiensoy-clue'), more ? t('wa_clue') : t('wa_no_more'), 'pista');
        if (!wa.over) { who.api.msg(t('wa_worth', worth())); }
    }
    function endWho(right) {
        if (wa.over) { return; }
        wa.over = true; who.api.playing(false);
        wa.shown = right ? wa.shown : wa.ex.clues.length;
        $('#quiensoy-card').textContent = wa.ex.answer;
        $('#quiensoy-card').classList.toggle('ct-right', right);
        $('#quiensoy-play').hidden = true; $('#quiensoy-next').hidden = false;
        paintWho();
        if (right) {
            const pts = t('wa_points', Math.max(20, 100 - 20 * (wa.shown - 1)));
            who.api.msg(pts, 'ct-win'); celebrate(who.api.stage(), pts);
        } else {
            who.api.msg(t('wa_was', wa.ex.answer), 'ct-lose'); announce(t('wa_was', wa.ex.answer));
        }
    }

    window.ClasstoolsExGames = { order: ord, sort: so, errors: er, who: wa };   // for automated tests
})();
