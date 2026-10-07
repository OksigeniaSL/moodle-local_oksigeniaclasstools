// Chance tools for the classroom board: wheel, dice, coin and cards.
// They can use the class lists (names and photos, leaving out who is missing today), the teacher's own lists
// (words, questions…) or built-in sets (numbers, letters). UI strings live in STR, from the language packs.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-azar');
    if (!core || !root) { return; }
    const { $, $$, t, random, shuffle, escape, reducedMotion, save, load, play, icon, setIcon, announce } = core;

    const STR = {
        modes: { wheel: t('ch_wheel'), dice: t('ch_dice'), coin: t('ch_coin'), cards: t('ch_cards') },
        what: t('ch_what'),
        source: t('ch_source'), deck: t('ch_deck'), students: t('ch_students'), ownlists: t('ch_ownlists'), builtin: t('ch_builtin'),
        numbers: (a, b) => t('ch_numbers', { a, b }), numbersPick: t('ch_numbers_pick'), from: t('ch_from'), to: t('ch_to'),
        letters: t('ch_letters_az'), lettersStop: t('ch_letters_stop'),
        newList: t('ch_new_list'), editList: t('ch_edit_list'),
        removePicked: t('ch_remove_picked'), putBack: t('ch_put_back'), noRepeat: t('ch_no_repeat'),
        spin: t('ch_spin'), roll: t('ch_roll'), toss: t('ch_toss'), draw: t('ch_draw'), reshuffle: t('ch_reshuffle'),
        empty: t('ch_empty'), lastOne: (x) => t('ch_last_one', x),
        onlyOne: (x) => t('ch_only_one', x), emptyDeck: t('ch_empty_deck'),
        noList: t('ch_no_list'), left: (n) => t('ch_left', n), result: (r) => t('ch_result', r),
        howMany: t('ch_how_many'), die: (i) => t('ch_die', i), total: (n) => t('ch_total', n),
        customFaces: t('ch_custom_faces'), customHint: t('ch_custom_hint'),
        motif: t('ch_motif'), other: t('ch_other'), side1: t('ch_side1'), side2: t('ch_side2'), resetTally: t('ch_reset_tally'),
        pressTo: (b) => t('ch_press_to', b), exclaim: (w) => t('ch_exclaim', w),
        dieKinds: t('ch_die_kinds'), allOut: t('ch_all_out'),
    };
    const PALETTE = [['#164281'], ['#ce1423'], ['#067e36'], ['#fbbe17', true], ['#5b2fb8'], ['#0e7c86'], ['#c2410c'], ['#0f2f5e']];
    // Letters and decimal mark of the user's language (window.CLASSTOOLS_CONTENT).
    const CONTENT = window.CLASSTOOLS_CONTENT;
    const LETTERS = [...CONTENT.alphabet];
    const STOP_OUT = [...CONTENT.stopOut];
    const fmt = (n) => String(n).replace('.', CONTENT.decimal);

    // Extra sounds for these tools.
    core.sounds.wheeltick = (a) => core.click(a, 1250, 0, 0.08);
    core.sounds.card = (a) => { core.click(a, 520, 0, 0.12); core.click(a, 760, 0.05, 0.1); };

    root.innerHTML = `
        <div class="barra-herr ct-top">
            <div class="segmentos" role="radiogroup" aria-label="${escape(STR.what)}" id="ch-mode">
                ${Object.entries(STR.modes).map(([k, v]) => `<button type="button" role="radio" aria-checked="false" data-mode="${k}">${v}</button>`).join('')}
            </div>
        </div>
        <div class="ct-body">
            <div class="ct-panel" data-panel="wheel" hidden>
                <aside class="tarjeta ct-side">
                    <label class="campo apilado"><span>${STR.source}</span><select id="wh-source"></select></label>
                    <div class="ct-range" id="wh-range" hidden>
                        <label class="campo"><span>${STR.from}</span><input type="number" id="wh-from" min="0" max="999" value="1"></label>
                        <label class="campo"><span>${STR.to}</span><input type="number" id="wh-to" min="1" max="999" value="10"></label>
                    </div>
                    <div class="ct-row">
                        <button type="button" class="boton suave" id="wh-new"><span data-icono="nueva"></span>${STR.newList}</button>
                        <button type="button" class="boton suave" id="wh-edit"><span data-icono="editar"></span>${STR.editList}</button>
                    </div>
                    <label class="interruptor"><input type="checkbox" id="wh-remove"><span>${STR.removePicked}</span></label>
                    <button type="button" class="boton suave" id="wh-reset" hidden><span data-icono="reiniciar"></span>${STR.putBack}</button>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-wheel-box" id="wh-box">
                        <canvas id="wh-canvas" aria-hidden="true"></canvas>
                        <span class="ct-pointer" aria-hidden="true"></span>
                        <button type="button" class="ct-spin" id="wh-spin">${STR.spin}</button>
                    </div>
                    <p class="total espera" id="wh-result" aria-live="polite"></p>
                </div>
            </div>
            <div class="ct-panel" data-panel="dice" hidden>
                <aside class="tarjeta ct-side">
                    <p class="ante">${STR.howMany}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(STR.howMany)}" id="di-count">
                        ${[1, 2, 3, 4].map((n) => `<button type="button" role="radio" aria-checked="false" data-n="${n}">${n}</button>`).join('')}
                    </div>
                    <div class="ct-dice-types" id="di-types"></div>
                    <label class="campo apilado" id="di-custom-box" hidden><span>${STR.customFaces}</span>
                        <textarea id="di-custom" rows="4" spellcheck="false" placeholder="${escape(STR.customHint)}"></textarea></label>
                    <label class="interruptor" id="di-norepeat-box" hidden><input type="checkbox" id="di-norepeat"><span>${STR.noRepeat}</span></label>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-dice" id="di-dice"></div>
                    <p class="total espera" id="di-total" aria-live="polite"></p>
                    <button type="button" class="boton grande" id="di-roll"><span data-icono="dado"></span>${STR.roll}</button>
                    <ol class="historial" id="di-history" hidden></ol>
                </div>
            </div>
            <div class="ct-panel" data-panel="coin" hidden>
                <aside class="tarjeta ct-side">
                    <label class="campo apilado"><span>${STR.motif}</span><select id="co-motif"></select></label>
                    <div class="ct-custom-sides" id="co-custom" hidden>
                        <label class="campo apilado"><span>${STR.side1}</span><input type="text" id="co-a" maxlength="24"></label>
                        <label class="campo apilado"><span>${STR.side2}</span><input type="text" id="co-b" maxlength="24"></label>
                    </div>
                    <p class="ct-tally" id="co-tally"></p>
                    <button type="button" class="boton suave" id="co-reset"><span data-icono="reiniciar"></span>${STR.resetTally}</button>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="moneda-caja"><div class="moneda" id="co-coin"><span class="cara-moneda anverso" id="co-front"></span><span class="cara-moneda reverso" id="co-back"></span></div></div>
                    <p class="total espera" id="co-result" aria-live="polite"></p>
                    <button type="button" class="boton grande" id="co-toss"><span data-icono="moneda"></span>${STR.toss}</button>
                    <ol class="historial" id="co-history"></ol>
                </div>
            </div>
            <div class="ct-panel" data-panel="cards" hidden>
                <aside class="tarjeta ct-side">
                    <label class="campo apilado"><span>${STR.deck}</span><select id="ca-source"></select></label>
                    <div class="ct-range" id="ca-range" hidden>
                        <label class="campo"><span>${STR.from}</span><input type="number" id="ca-from" min="0" max="999" value="1"></label>
                        <label class="campo"><span>${STR.to}</span><input type="number" id="ca-to" min="1" max="999" value="20"></label>
                    </div>
                    <div class="ct-row">
                        <button type="button" class="boton suave" id="ca-new"><span data-icono="nueva"></span>${STR.newList}</button>
                        <button type="button" class="boton suave" id="ca-edit"><span data-icono="editar"></span>${STR.editList}</button>
                    </div>
                    <label class="interruptor"><input type="checkbox" id="ca-norepeat" checked><span>${STR.noRepeat}</span></label>
                    <button type="button" class="boton suave" id="ca-reshuffle"><span data-icono="barajar"></span>${STR.reshuffle}</button>
                    <p class="nota" id="ca-left"></p>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-card-box"><div class="ct-card" id="ca-card"><div class="ct-card-face ct-card-back"><span>?</span></div><div class="ct-card-face ct-card-front" id="ca-front"></div></div></div>
                    <button type="button" class="boton grande" id="ca-draw"><span data-icono="cartas"></span>${STR.draw}</button>
                    <ol class="historial ct-card-history" id="ca-history"></ol>
                </div>
            </div>
        </div>`;
    $$('[data-icono]', root).forEach((el) => setIcon(el, el.dataset.icono));

    // ---------------------------------------------------------------------------------------------------
    // Sources shared by the wheel and the cards: class lists, own lists, numbers, letters.
    // ---------------------------------------------------------------------------------------------------
    const sourceOptions = (withLetters) => {
        const lists = core.lists();
        const moodle = lists.filter((l) => l.aula), own = lists.filter((l) => !l.aula);
        const opt = (l) => `<option value="list:${escape(l.id)}">${escape(l.nombre)} (${core.present(l).length})</option>`;
        return (moodle.length ? `<optgroup label="${escape(STR.students)}">${moodle.map(opt).join('')}</optgroup>` : '')
            + (own.length ? `<optgroup label="${escape(STR.ownlists)}">${own.map(opt).join('')}</optgroup>` : '')
            + `<optgroup label="${escape(STR.builtin)}"><option value="numbers">${STR.numbersPick}</option>`
            + (withLetters ? `<option value="letters">${STR.letters}</option><option value="stop">${STR.lettersStop}</option>` : '')
            + '</optgroup>';
    };
    // Items of a source: [{label, list}] (list is there when the item can show a face).
    const sourceItems = (value, from, to) => {
        if (value.startsWith('list:')) {
            const l = core.lists().find((x) => x.id === value.slice(5));
            return l ? core.present(l).map((n) => ({ label: n, list: l })) : [];
        }
        if (value === 'numbers') {
            const a = Math.max(0, Math.min(999, Number(from) || 0)), b = Math.max(a, Math.min(999, Number(to) || a));
            return Array.from({ length: Math.min(200, b - a + 1) }, (_, i) => ({ label: String(a + i) }));
        }
        if (value === 'letters') { return LETTERS.map((x) => ({ label: x })); }
        if (value === 'stop') { return LETTERS.filter((x) => !STOP_OUT.includes(x)).map((x) => ({ label: x })); }
        return [];
    };
    const fillSelect = (select, withLetters, stored) => {
        const before = select.value || stored;
        select.innerHTML = sourceOptions(withLetters);
        const values = [...select.options].map((o) => o.value);
        select.value = values.includes(before) ? before : values[0];
    };
    const editButton = (button, value) => { button.hidden = !(value.startsWith('list:') && !core.lists().find((l) => 'list:' + l.id === value && l.aula)); };

    // ---------------------------------------------------------------------------------------------------
    // Wheel
    // ---------------------------------------------------------------------------------------------------
    const wh = { canvas: $('#wh-canvas'), angle: -Math.PI / 2, spinning: false, removed: {}, images: {}, items: [] };
    const whKey = () => $('#wh-source').value === 'numbers' ? `numbers:${$('#wh-from').value}-${$('#wh-to').value}` : $('#wh-source').value;
    // On the wheel, students go by their first name (and the surname's initial when two share it): full names
    // do not fit in the segments. The result shows the full name.
    const shortNames = (items) => {
        const first = (it) => it.label.split(/\s+/)[0];
        const count = {};
        const student = (it) => it.list && it.list.aula;
        items.forEach((it) => { if (student(it)) { count[first(it)] = (count[first(it)] || 0) + 1; } });
        return items.map((it) => {
            if (!student(it)) { return it; }
            const parts = it.label.split(/\s+/);
            return { ...it, short: count[parts[0]] > 1 && parts[1] ? `${parts[0]} ${parts[1][0]}.` : parts[0] };
        });
    };
    const whItems = () => {
        const removed = wh.removed[whKey()] || [];
        return shortNames(sourceItems($('#wh-source').value, $('#wh-from').value, $('#wh-to').value).filter((it) => !removed.includes(it.label)));
    };
    const imageFor = (it) => {
        const url = it.list && it.list.fotos && it.list.fotos[it.label];
        if (!url) { return null; }
        if (!wh.images[url]) {
            const img = new Image();
            img.onload = () => whDraw();
            img.src = url;
            wh.images[url] = img;
        }
        return wh.images[url].complete && wh.images[url].naturalWidth ? wh.images[url] : null;
    };
    const segmentColor = (i, n) => {
        let k = i % PALETTE.length;
        if (n > 1 && i === n - 1 && k === 0) { k = 2; }   // the last segment must not repeat the first one's colour
        return PALETTE[k];
    };
    function whDraw() {
        const box = $('#wh-box'), c = wh.canvas, ctx = c.getContext('2d');
        const size = Math.max(120, Math.min(box.clientWidth, box.clientHeight));
        const dpr = window.devicePixelRatio || 1;
        if (c.width !== Math.round(size * dpr)) { c.width = c.height = Math.round(size * dpr); c.style.width = c.style.height = size + 'px'; }
        box.style.setProperty('--wsize', size + 'px');
        box.style.setProperty('--wtop', ((box.clientHeight - size) / 2) + 'px');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);
        const items = wh.items, n = items.length, r = size / 2 - 6, cx = size / 2, cy = size / 2;
        if (!n) {
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#e4ecf8'; ctx.fill();
            return;
        }
        const step = (Math.PI * 2) / n;
        const fontSize = Math.max(11, Math.min(r * 0.13, (r * step) * 0.42));
        items.forEach((it, i) => {
            const a0 = wh.angle + i * step, a1 = a0 + step, [color, light] = segmentColor(i, n);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
            ctx.fillStyle = color; ctx.fill();
            if (n > 1) { ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); }
            ctx.save();
            ctx.translate(cx, cy); ctx.rotate(a0 + step / 2);
            const img = n <= 16 ? imageFor(it) : null;
            const faceR = Math.min(r * 0.11, r * step * 0.32);
            let textEnd = r - 12;
            if (img) {
                const fx = r - faceR - 10;
                ctx.save(); ctx.beginPath(); ctx.arc(fx, 0, faceR, 0, Math.PI * 2); ctx.closePath();
                ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip();
                ctx.drawImage(img, fx - faceR, -faceR, faceR * 2, faceR * 2);
                ctx.restore();
                ctx.beginPath(); ctx.arc(fx, 0, faceR, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
                textEnd = fx - faceR - 8;
            }
            ctx.fillStyle = light ? '#1c1a19' : '#fff';
            ctx.font = `800 ${fontSize}px Nunito, system-ui, sans-serif`;
            ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
            const room = textEnd - r * 0.24;
            let text = it.short || it.label;
            if (ctx.measureText(text).width > room) {
                while (text.length > 1 && ctx.measureText(text + '…').width > room) { text = text.slice(0, -1); }
                text += '…';
            }
            ctx.fillText(text, textEnd, 0);
            ctx.restore();
        });
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
    }
    const whIndexAtPointer = () => {
        const n = wh.items.length, step = (Math.PI * 2) / n;
        const rel = (((-Math.PI / 2 - wh.angle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        return Math.floor(rel / step) % n;
    };
    const whRefresh = () => {
        const v = $('#wh-source').value;
        $('#wh-range').hidden = v !== 'numbers';
        editButton($('#wh-edit'), v);
        wh.items = whItems();
        const removed = (wh.removed[whKey()] || []).length;
        $('#wh-reset').hidden = !removed;
        $('#wh-spin').disabled = wh.items.length < 2 || wh.spinning;
        if (!wh.spinning) {
            const r = $('#wh-result'), only = wh.items.length === 1 ? wh.items[0].label : null;
            r.className = only ? 'total' : 'total espera';
            r.textContent = only ? (removed ? STR.lastOne(only) : STR.onlyOne(only))
                : (wh.items.length ? STR.pressTo(STR.spin) : (removed ? STR.empty : STR.noList));
        }
        whDraw();
    };
    const spin = () => {
        if (wh.spinning || wh.items.length < 2) { return; }
        const items = wh.items, n = items.length, step = (Math.PI * 2) / n;
        const winner = random(n), jitter = (random(1000) / 1000 - 0.5) * 0.7;
        // Final angle: the winner's segment (a bit off its middle) right under the pointer, after 5–7 full turns.
        let target = -Math.PI / 2 - (winner + 0.5 + jitter) * step;
        const turns = 5 + random(3);
        while (target < wh.angle + turns * Math.PI * 2) { target += Math.PI * 2; }
        const finish = () => {
            wh.spinning = false;
            const it = items[winner];
            $('#wh-result').className = 'total';
            $('#wh-result').textContent = it.label;
            play('elegido'); announce(STR.result(it.label));
            if ($('#wh-remove').checked) {
                const k = whKey();
                wh.removed[k] = (wh.removed[k] || []).concat(it.label);
                wh.items = whItems();
                $('#wh-reset').hidden = false;
                setTimeout(whDraw, 900);   // leave the winner visible a moment before it goes
                // When only one is left, there is nothing to spin: it is the last one.
                if (wh.items.length === 1) {
                    const last = wh.items[0].label;
                    setTimeout(() => { $('#wh-result').textContent = `${it.label} · ${STR.lastOne(last)}`; announce(STR.lastOne(last)); }, 1400);
                }
            }
            $('#wh-spin').disabled = wh.items.length < 2;
        };
        if (reducedMotion()) { wh.angle = target; whDraw(); finish(); return; }
        wh.spinning = true; $('#wh-spin').disabled = true;
        $('#wh-result').className = 'total espera'; $('#wh-result').textContent = '…';
        const start = wh.angle, dist = target - start, t0 = performance.now(), dur = 4200 + random(900);
        let last = whIndexAtPointer();
        const frame = (t) => {
            const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 4);
            wh.angle = start + dist * ease;
            whDraw();
            const now = whIndexAtPointer();
            if (now !== last) { last = now; play('wheeltick'); }
            if (p < 1) { requestAnimationFrame(frame); } else { wh.angle = target % (Math.PI * 2); finish(); }
        };
        requestAnimationFrame(frame);
    };
    $('#wh-spin').addEventListener('click', spin);
    $('#wh-source').addEventListener('change', () => { save('ruleta-fuente', $('#wh-source').value); whRefresh(); });
    ['#wh-from', '#wh-to'].forEach((s) => $(s).addEventListener('input', whRefresh));
    $('#wh-remove').addEventListener('change', () => save('ruleta-quitar', $('#wh-remove').checked));
    $('#wh-reset').addEventListener('click', () => { delete wh.removed[whKey()]; whRefresh(); });
    $('#wh-new').addEventListener('click', () => core.newList());
    $('#wh-edit').addEventListener('click', () => { const v = $('#wh-source').value; if (v.startsWith('list:')) { core.editList(v.slice(5)); } });
    $('#wh-remove').checked = load('ruleta-quitar', false) === true;
    if (window.ResizeObserver) { new ResizeObserver(() => requestAnimationFrame(whDraw)).observe($('#wh-box')); }

    // ---------------------------------------------------------------------------------------------------
    // Dice
    // ---------------------------------------------------------------------------------------------------
    const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
    const ARROWS4 = ['↑', '→', '↓', '←'], ARROWS8 = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    const COLORS = [[t('ch_red'), '#ce1423'], [t('ch_blue'), '#164281'], [t('ch_green'), '#067e36'], [t('ch_yellow'), '#fbbe17'], [t('ch_purple'), '#5b2fb8'], [t('ch_orange'), '#c2410c']];
    const DICE = {
        d6: { label: t('ch_d6'), faces: range(1, 6), pips: true },
        d4: { label: t('ch_d_sides', 4), faces: range(1, 4), shape: 'tri' },
        d8: { label: t('ch_d_sides', 8), faces: range(1, 8), shape: 'diamond' },
        d10: { label: t('ch_d_sides', 10), faces: range(1, 10), shape: 'pentagon' },
        d12: { label: t('ch_d_sides', 12), faces: range(1, 12), shape: 'pentagon' },
        d20: { label: t('ch_d_sides', 20), faces: range(1, 20), shape: 'hexagon' },
        ops: { label: t('ch_d_ops'), faces: ['+', '−', '×', '÷'] },
        ops2: { label: t('ch_d_add_sub'), faces: ['+', '−'] },
        dir4: { label: t('ch_d_arrows', 4), faces: ARROWS4 },
        dir8: { label: t('ch_d_arrows', 8), faces: ARROWS8 },
        colors: { label: t('ch_d_colours'), faces: COLORS.map((c) => c[0]) },
        vowels: { label: t('ch_d_vowels'), faces: [...CONTENT.vowels] },
        letters: { label: t('ch_d_letters'), faces: LETTERS },
        custom: { label: t('ch_d_custom'), faces: [] },
    };
    const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
    let diN = Math.max(1, Math.min(4, Number(load('dados-n', 2)) || 2));
    let diTypes = load('dados-tipos', ['d6', 'd6', 'd6', 'd6']);
    if (!Array.isArray(diTypes)) { diTypes = ['d6', 'd6', 'd6', 'd6']; }
    diTypes = [0, 1, 2, 3].map((i) => (DICE[diTypes[i]] || String(diTypes[i]).startsWith('list:') ? diTypes[i] : 'd6'));
    $('#di-custom').value = load('dados-personalizado', '');
    let diValues = [], diRolling = false, diHistory = [];
    const customFaces = () => $('#di-custom').value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 20);
    // A die can also be a list: the class (with photos, leaving out who is missing today) or one of the teacher's lists.
    // With «No repeats», everyone comes out once before anyone comes out again.
    const listOf = (type) => (String(type).startsWith('list:') ? core.lists().find((l) => 'list:' + l.id === type) || null : null);
    const isList = (type) => !!listOf(type);
    const typeLabel = (type) => (listOf(type) ? listOf(type).nombre : DICE[type].label);
    const facesOf = (type) => {
        if (isList(type)) { const names = core.present(listOf(type)); return names.length ? names : ['?']; }
        return type === 'custom' ? (customFaces().length ? customFaces() : ['?']) : DICE[type].faces;
    };
    const diOut = {};   // list type => names already out (with «No repeats»)
    const pickFrom = (type, taken) => {
        const faces = facesOf(type);
        if (!isList(type) || !$('#di-norepeat').checked || faces[0] === '?') { return faces[random(faces.length)]; }
        let left = faces.filter((n) => !(diOut[type] || []).includes(n) && !taken.includes(n));
        if (!left.length) { diOut[type] = []; left = faces.filter((n) => !taken.includes(n)); announce(STR.allOut); }
        const n = left.length ? left[random(left.length)] : faces[random(faces.length)];
        diOut[type] = (diOut[type] || []).concat(n);
        return n;
    };
    const diPaintCount = () => $$('#di-count button').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.n) === diN)));
    const diPaintTypes = () => {
        // A list that is gone (deleted, or this course has no longer that group) goes back to an ordinary die.
        diTypes = diTypes.map((ty) => (DICE[ty] || isList(ty) ? ty : 'd6'));
        const lists = core.lists().filter((l) => core.present(l).length);
        const moodle = lists.filter((l) => l.aula), own = lists.filter((l) => !l.aula);
        const options = (i) => {
            const opt = (value, label) => `<option value="${escape(value)}"${value === diTypes[i] ? ' selected' : ''}>${escape(label)}</option>`;
            const group = (label, ls) => (ls.length ? `<optgroup label="${escape(label)}">${ls.map((l) => opt('list:' + l.id, l.nombre)).join('')}</optgroup>` : '');
            return (lists.length ? `<optgroup label="${escape(STR.dieKinds)}">` : '') + Object.entries(DICE).map(([k, d]) => opt(k, d.label)).join('')
                + (lists.length ? '</optgroup>' : '') + group(STR.students, moodle) + group(STR.ownlists, own);
        };
        $('#di-types').innerHTML = Array.from({ length: diN }, (_, i) => `<label class="campo apilado"><span>${STR.die(i + 1)}</span>`
            + `<select data-i="${i}">${options(i)}</select></label>`).join('');
        const used = diTypes.slice(0, diN);
        $('#di-custom-box').hidden = !used.includes('custom');
        $('#di-norepeat-box').hidden = !used.some(isList);
        used.filter(isList).forEach((ty) => core.preload(listOf(ty)));
    };
    // On the die, the photo and the first name; the result below says the full name.
    const firstName = (n) => String(n).split(/\s+/)[0];
    const faceHTML = (type, v, i) => {
        if (isList(type)) {
            const l = listOf(type), photo = l.fotos && l.fotos[v], [color, light] = PALETTE[i];
            return `<div class="ct-die ct-die-name${photo ? ' con-foto' : ''}" style="--c:${color};--t:${light ? '#1c1a19' : '#fff'}">`
                + `${photo ? `<img src="${escape(photo)}" alt="">` : ''}<span>${escape(firstName(v))}</span></div>`;
        }
        if (DICE[type] && DICE[type].pips) {
            return `<div class="dado ct-die" style="--c:${PALETTE[i][0]}">${range(0, 8).map((j) => `<span class="punto${PIPS[v].includes(j) ? ' on' : ''}"></span>`).join('')}</div>`;
        }
        const shape = (DICE[type] && DICE[type].shape) || 'square';
        const color = type === 'colors' ? COLORS.find((c) => c[0] === v)[1] : (type === 'ops' || type === 'ops2' ? '#5b2fb8' : PALETTE[i][0]);
        const dark = color === '#fbbe17';
        const long = String(v).length > 3;
        return `<div class="ct-die ct-shape-${shape}${long ? ' ct-long' : ''}" style="--c:${color};--t:${dark ? '#1c1a19' : '#fff'}"><span>${escape(v)}</span></div>`;
    };
    const diPaint = (values) => {
        const box = $('#di-dice');
        box.dataset.n = values.length;
        box.innerHTML = values.map((v, i) => `<figure class="ct-die-wrap" aria-label="${escape(String(v))}">${faceHTML(diTypes[i], v, i)}`
            + `<figcaption>${escape(typeLabel(diTypes[i]))}</figcaption></figure>`).join('');
    };
    // Total for numeric dice; with «number, operation, number» (or more), the operation result.
    const diSummary = (values) => {
        const types = diTypes.slice(0, values.length);
        const numeric = (t) => !isList(t) && t !== 'custom' && DICE[t].faces.every((f) => typeof f === 'number');
        // Who and what they got: «Virginia – 6», «Virginia – 4 + 3 = 7».
        if (types.some(isList)) {
            const who = values.filter((_, i) => isList(types[i])), what = values.filter((_, i) => !isList(types[i]));
            const whatTypes = types.filter((ty) => !isList(ty));
            const rest = what.length > 1 && whatTypes.every(numeric) ? `${what.join(' + ')} = ${what.reduce((a, b) => a + b, 0)}` : what.join(' · ');
            return who.join(' · ') + (rest ? ` – ${rest}` : '');
        }
        if (types.every(numeric) && values.length > 1) { return STR.total(values.reduce((a, b) => a + b, 0)); }
        if (values.length >= 3 && values.length % 2 === 1 && types.every((t, i) => (i % 2 ? t === 'ops' || t === 'ops2' : numeric(t)))) {
            // Left to right, × and ÷ first, as in maths.
            const nums = values.filter((_, i) => i % 2 === 0), ops = values.filter((_, i) => i % 2 === 1);
            const n2 = [nums[0]], o2 = [];
            ops.forEach((op, i) => {
                if (op === '×') { n2[n2.length - 1] *= nums[i + 1]; } else if (op === '÷') { n2[n2.length - 1] /= nums[i + 1]; } else { o2.push(op); n2.push(nums[i + 1]); }
            });
            const res = o2.reduce((acc, op, i) => (op === '+' ? acc + n2[i + 1] : acc - n2[i + 1]), n2[0]);
            const shown = Math.round(res * 100) / 100;
            return `${values.join(' ')} = ${fmt(shown)}`;
        }
        return values.length === 1 ? STR.result(values[0]) : values.join(' · ');
    };
    const diSetTotal = () => {
        const t = $('#di-total');
        if (!diValues.length) { t.className = 'total espera'; t.textContent = STR.pressTo(STR.roll); return; }
        t.className = 'total'; t.textContent = diSummary(diValues);
    };
    const diResting = () => diTypes.slice(0, diN).map((t, i) => { const f = facesOf(t); return f[Math.min(f.length - 1, [5, 4, 3, 2][i] % f.length)]; });
    const diPaintHistory = () => {
        const h = $('#di-history');
        h.hidden = !diHistory.length;
        h.innerHTML = diHistory.map((x) => `<li>${escape(x)}</li>`).join('');
    };
    const diReset = () => { diValues = []; diHistory = []; diPaint(diResting()); diSetTotal(); diPaintHistory(); };
    const roll = () => {
        if (diRolling) { return; }
        const taken = [];
        const finals = diTypes.slice(0, diN).map((ty) => { const v = pickFrom(ty, taken); taken.push(v); return v; });
        const done = () => {
            diRolling = false; diValues = finals; diPaint(finals); diSetTotal();
            $('#di-roll').disabled = false;
            // With a list, a record of the turns: «Virginia – 6», «Pablo – 3»…
            if (diTypes.slice(0, diN).some(isList)) { diHistory = [diSummary(finals)].concat(diHistory).slice(0, 12); diPaintHistory(); }
            announce(diSummary(finals));
        };
        play('dado');
        if (reducedMotion()) { done(); return; }
        diRolling = true; $('#di-roll').disabled = true;
        let spins = 0;
        const turn = () => {
            diPaint(diTypes.slice(0, diN).map((t) => { const f = facesOf(t); return f[random(f.length)]; }));
            $$('#di-dice .ct-die').forEach((d) => d.classList.add('rueda'));
            if (++spins < 7) { setTimeout(turn, 75); } else { setTimeout(done, 75); }
        };
        turn();
    };
    $('#di-roll').addEventListener('click', roll);
    $$('#di-count button').forEach((b) => b.addEventListener('click', () => {
        diN = Number(b.dataset.n); save('dados-n', diN); diPaintCount(); diPaintTypes(); diReset();
    }));
    $('#di-types').addEventListener('change', (e) => {
        const s = e.target.closest('select'); if (!s) { return; }
        diTypes[Number(s.dataset.i)] = s.value; save('dados-tipos', diTypes);
        diPaintTypes(); diReset();
    });
    $('#di-norepeat').checked = load('dados-sinrepetir', true) !== false;
    $('#di-norepeat').addEventListener('change', () => { save('dados-sinrepetir', $('#di-norepeat').checked); Object.keys(diOut).forEach((k) => delete diOut[k]); });
    $('#di-custom').addEventListener('input', () => { save('dados-personalizado', $('#di-custom').value); diValues = []; diPaint(diResting()); diSetTotal(); });

    // ---------------------------------------------------------------------------------------------------
    // Coin
    // ---------------------------------------------------------------------------------------------------
    const MOTIFS = {
        heads: { label: t('ch_heads_tails'), a: t('ch_heads'), b: t('ch_tails') },
        yesno: { label: t('ch_yes_no'), a: t('ch_yes'), b: t('ch_no') },
        truefalse: { label: t('ch_true_false'), a: t('ch_true'), b: t('ch_false') },
        teams: { label: t('ch_red_blue'), a: t('ch_red'), b: t('ch_blue'), ca: '#ce1423', cb: '#164281' },
        thumbs: { label: t('ch_thumbs'), a: t('ch_good'), b: t('ch_bad'), ia: 'pulgararriba', ib: 'pulgarabajo' },
        evenodd: { label: t('ch_even_odd'), a: t('ch_even'), b: t('ch_odd') },
        custom: { label: STR.other, a: '', b: '' },
    };
    const co = { angle: 0, tossing: false, history: [], tally: [0, 0] };
    $('#co-motif').innerHTML = Object.entries(MOTIFS).map(([k, m]) => `<option value="${k}">${m.label}</option>`).join('');
    $('#co-motif').value = MOTIFS[load('moneda-motivo', 'heads')] ? load('moneda-motivo', 'heads') : 'heads';
    $('#co-a').value = load('moneda-a', ''); $('#co-b').value = load('moneda-b', '');
    const coSides = () => {
        const m = MOTIFS[$('#co-motif').value];
        if ($('#co-motif').value === 'custom') { return { ...m, a: $('#co-a').value.trim() || STR.side1, b: $('#co-b').value.trim() || STR.side2 }; }
        return m;
    };
    const coPaint = () => {
        const m = coSides(), f = $('#co-front'), b = $('#co-back');
        $('#co-custom').hidden = $('#co-motif').value !== 'custom';
        f.innerHTML = m.ia ? `${icon(m.ia, 'ico ct-coin-ico')}` : escape(m.a);
        b.innerHTML = m.ib ? `${icon(m.ib, 'ico ct-coin-ico')}` : escape(m.b);
        f.style.background = m.ca ? `radial-gradient(circle at 35% 30%, #ffffff55, ${m.ca} 55%)` : '';
        b.style.background = m.cb ? `radial-gradient(circle at 35% 30%, #ffffff55, ${m.cb} 55%)` : '';
        f.style.color = m.ca ? '#fff' : ''; b.style.color = m.cb ? '#fff' : '';
        f.classList.toggle('ct-long', m.a.length > 5); b.classList.toggle('ct-long', m.b.length > 5);
        $('#co-tally').innerHTML = `<strong>${escape(m.a)}</strong> ${co.tally[0]} · <strong>${escape(m.b)}</strong> ${co.tally[1]}`;
        $('#co-history').innerHTML = co.history.map((x) => `<li class="${x ? 'cruz' : ''}">${escape(x ? m.b : m.a)}</li>`).join('');
        if (!co.tossing && !co.history.length) { $('#co-result').className = 'total espera'; $('#co-result').textContent = STR.pressTo(STR.toss); }
    };
    const toss = () => {
        if (co.tossing) { return; }
        const side = random(2), coin = $('#co-coin'), turns = reducedMotion() ? 0 : 5;
        co.angle = Math.ceil((co.angle + 1) / 360) * 360 + 360 * turns + (side ? 180 : 0);
        const done = () => {
            co.tossing = false; $('#co-toss').disabled = false;
            co.tally[side]++; co.history.unshift(side); if (co.history.length > 12) { co.history.pop(); }
            const m = coSides(), word = side ? m.b : m.a;
            $('#co-result').className = 'total'; $('#co-result').textContent = STR.exclaim(word);
            coPaint(); announce(STR.result(word));
        };
        coin.style.transform = `rotateY(${co.angle}deg)`;
        play('moneda');
        if (reducedMotion()) { done(); return; }
        co.tossing = true; $('#co-toss').disabled = true;
        $('#co-result').className = 'total espera'; $('#co-result').textContent = '…';
        coin.classList.remove('salta'); void coin.offsetWidth; coin.classList.add('salta');
        setTimeout(done, 1300);
    };
    $('#co-toss').addEventListener('click', toss);
    $('#co-motif').addEventListener('change', () => { save('moneda-motivo', $('#co-motif').value); co.tally = [0, 0]; co.history = []; coPaint(); });
    ['#co-a', '#co-b'].forEach((s) => $(s).addEventListener('input', () => { save('moneda-a', $('#co-a').value); save('moneda-b', $('#co-b').value); coPaint(); }));
    $('#co-reset').addEventListener('click', () => { co.tally = [0, 0]; co.history = []; coPaint(); });

    // ---------------------------------------------------------------------------------------------------
    // Cards
    // ---------------------------------------------------------------------------------------------------
    const ca = { drawn: {}, history: [], flipping: false };
    const caKey = () => $('#ca-source').value === 'numbers' ? `numbers:${$('#ca-from').value}-${$('#ca-to').value}` : $('#ca-source').value;
    const caAll = () => sourceItems($('#ca-source').value, $('#ca-from').value, $('#ca-to').value);
    const caLeft = () => { const d = ca.drawn[caKey()] || []; return caAll().filter((it) => !d.includes(it.label)); };
    const caRefresh = () => {
        const v = $('#ca-source').value, noRepeat = $('#ca-norepeat').checked;
        $('#ca-range').hidden = v !== 'numbers';
        editButton($('#ca-edit'), v);
        const left = caLeft().length, all = caAll().length;
        $('#ca-left').textContent = all ? (noRepeat ? STR.left(left) : '') : STR.noList;
        $('#ca-draw').disabled = ca.flipping || !all || (noRepeat && !left);
        $('#ca-reshuffle').hidden = !noRepeat;
        $('#ca-history').innerHTML = ca.history.map((h) => `<li>${escape(h)}</li>`).join('');
    };
    const cardFront = (it) => {
        const face = it.list ? core.face(it.list, it.label, 'cara-grande') : '';
        const long = it.label.length > 3;
        return `${face ? `<div class="ct-card-photo">${face}</div>` : ''}<span class="ct-card-text${long ? ' ct-long' : ''}${face ? ' ct-with-photo' : ''}">${escape(it.label)}</span>`;
    };
    const drawCard = () => {
        if (ca.flipping) { return; }
        const noRepeat = $('#ca-norepeat').checked, pool = noRepeat ? caLeft() : caAll();
        if (!pool.length) { $('#ca-left').textContent = STR.emptyDeck; return; }
        const it = pool[random(pool.length)], card = $('#ca-card');
        const done = () => {
            ca.flipping = false;
            if (noRepeat) { const k = caKey(); ca.drawn[k] = (ca.drawn[k] || []).concat(it.label); }
            ca.history.unshift(it.label); if (ca.history.length > 14) { ca.history.pop(); }
            caRefresh(); play('elegido'); announce(STR.result(it.label));
        };
        play('card');
        if (reducedMotion()) { $('#ca-front').innerHTML = cardFront(it); card.classList.add('ct-flipped'); done(); return; }
        ca.flipping = true; $('#ca-draw').disabled = true;
        // Face down, change the card, then turn it over.
        card.classList.remove('ct-flipped');
        setTimeout(() => { $('#ca-front').innerHTML = cardFront(it); card.classList.add('ct-flipped'); setTimeout(done, 620); }, card.classList.contains('ct-was') ? 420 : 30);
        card.classList.add('ct-was');
    };
    $('#ca-draw').addEventListener('click', drawCard);
    $('#ca-source').addEventListener('change', () => { save('cartas-fuente', $('#ca-source').value); caRefresh(); });
    ['#ca-from', '#ca-to'].forEach((s) => $(s).addEventListener('input', caRefresh));
    $('#ca-norepeat').addEventListener('change', () => { save('cartas-sinrepetir', $('#ca-norepeat').checked); caRefresh(); });
    $('#ca-reshuffle').addEventListener('click', () => { delete ca.drawn[caKey()]; ca.history = []; $('#ca-card').classList.remove('ct-flipped', 'ct-was'); caRefresh(); });
    $('#ca-new').addEventListener('click', () => core.newList());
    $('#ca-edit').addEventListener('click', () => { const v = $('#ca-source').value; if (v.startsWith('list:')) { core.editList(v.slice(5)); } });
    $('#ca-norepeat').checked = load('cartas-sinrepetir', true) !== false;

    // ---------------------------------------------------------------------------------------------------
    // Modes, lists that change elsewhere, and the space bar
    // ---------------------------------------------------------------------------------------------------
    let mode = ['wheel', 'dice', 'coin', 'cards'].includes(load('azar-modo', 'wheel')) ? load('azar-modo', 'wheel') : 'wheel';
    const showMode = (m) => {
        mode = m; save('azar-modo', m);
        $$('#ch-mode button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === m)));
        $$('.ct-panel', root).forEach((p) => { p.hidden = p.dataset.panel !== m; });
        if (m === 'wheel') { requestAnimationFrame(whRefresh); }
    };
    $$('#ch-mode button').forEach((b) => b.addEventListener('click', () => showMode(b.dataset.mode)));
    const refreshSources = () => {
        fillSelect($('#wh-source'), false, load('ruleta-fuente', null)); fillSelect($('#ca-source'), true, load('cartas-fuente', 'letters'));
        whRefresh(); caRefresh();
        // The dice that are lists: the lists may have changed (a new one, or who is missing today).
        if (!diRolling) { diPaintTypes(); if (!diValues.length) { diPaint(diResting()); } }
    };
    document.addEventListener('classtools:lists', refreshSources);
    // «Who is missing today» changes the class lists too: refresh when coming back to this tool.
    core.register('azar', {
        entra: () => { refreshSources(); showMode(mode); },
        espacio: () => ({ wheel: spin, dice: roll, coin: toss, cards: drawCard }[mode])(),
    });
    diPaintCount(); diPaintTypes(); diPaint(diResting()); diSetTotal(); coPaint();
    refreshSources(); showMode(mode);

    window.ClasstoolsChance = { spin, roll, toss, drawCard, showMode };   // for automated tests
})();
