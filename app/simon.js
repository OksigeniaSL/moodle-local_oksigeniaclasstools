// Simon for the whole class: coloured pads with their own notes; the sequence grows each round. With a class
// list, a different student repeats it each round (shown big with their face). A mistake does not send everyone back
// to one: the same sequence is played again for the next one (or for the class), unless the teacher chooses to start
// from the beginning, as in the classic game. The record is kept.
// Variants: the sequence repeated backwards; 4, 6 or 9 pads; and what the pads show: colours, arrows (all alike, so the
// direction is read and not the colour), numbers with a rule (a 3 is shown and, with «add 1», the 4 is pressed),
// notes without colour (only heard, the pads named Do, Re, Mi…) or syllables: the pads show the syllables of a word
// and some more, the sequence is the word (lit syllable by syllable, or written whole for them to split it), and the
// words get longer, from two syllables to five (only in languages whose content pack has the words split).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games) { return; }
    const { $, $$, escape, save, load, play, setIcon, announce, random, shuffle, t } = core;

    const STR = {
        name: t('si_name'), pads: t('si_pads'), speed: t('si_speed'), normal: t('si_normal'), fast: t('si_fast'), turns: t('si_turns'),
        everyone: t('ga_whole_class'), start: t('ga_start'), again: t('si_again'), watch: t('si_watch'), yourTurn: t('si_your_turn'),
        round: (n) => t('si_round', n), record: (n, who) => (who ? t('si_record_who', { n, who }) : t('si_record', n)), fail: t('si_fail'),
        failWho: (w) => t('si_fail_who', w), next: (w) => t('si_next', w), pressStart: t('si_press_start'),
        onFail: t('si_on_fail'), failRepeat: t('si_fail_repeat'), failReset: t('si_fail_reset'), same: t('si_same_again'),
        colors: [t('si_green'), t('si_red'), t('si_yellow'), t('si_blue'), t('si_purple'), t('si_orange'), t('si_teal'), t('si_pink'), t('si_brown')],
        arrows: [t('si_up'), t('si_right'), t('si_down'), t('si_left')],
        notes: t('si_note_names').split(','), listen: t('si_listen'),
    };
    // Classic Simon notes (green, red, yellow, blue) and more for six and nine pads.
    const PADS = [['#067e36', 164.81], ['#ce1423', 440], ['#fbbe17', 277.18], ['#164281', 329.63], ['#5b2fb8', 392], ['#c2410c', 220],
        ['#0e7c86', 196], ['#be185d', 246.94], ['#8a5a2b', 349.23]];
    // Notes without colour: Do, Re, Mi, Fa, Sol, La, Si, high Do and high Re; four pads take Do-Mi-Sol-Do, six the
    // pentatonic Do-Re-Mi-Sol-La-Do.
    const NOTE_FREQ = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33];
    const NOTES_OF = { 4: [0, 2, 4, 7], 6: [0, 1, 2, 4, 5, 7], 9: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
    // Numbers: pad i is the number i + 1; each rule gives the number shown for the one to press, and which can be.
    const RULES = {
        plus1: { shown: (n) => n - 1, answers: [2, 3, 4, 5, 6, 7, 8, 9] },
        minus1: { shown: (n) => n + 1, answers: [1, 2, 3, 4, 5, 6, 7, 8] },
        ten: { shown: (n) => 10 - n, answers: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        double: { shown: (n) => n / 2, answers: [2, 4, 6, 8] },
    };
    // Words split into syllables, from the content pack of the language.
    const CONTENT = window.CLASSTOOLS_CONTENT || {};
    const WORDS = (Array.isArray(CONTENT.syllables) ? CONTENT.syllables : []).map((w) => String(w).split('-')).filter((w) => w.length >= 2 && w.length <= 5);
    const ALL_SYLLABLES = [...new Set(WORDS.flat())];
    const KINDS = ['colors', 'arrows', 'numbers', 'notes'].concat(WORDS.length ? ['syllables'] : []);
    const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 9h-5v9H9v-9H4z"/></svg>';
    let panel = null, visible = false;
    const s = { seq: [], input: 0, state: 'idle', record: 0, recordWho: '', order: [], turn: -1, timers: [], word: [], pads: [], words: 0 };

    const tone = (i, ms) => {
        const a = core.audioContext && core.audioContext();
        if (!a || !core.soundOn()) { return; }
        const t = a.currentTime, o = a.createOscillator(), gn = a.createGain();
        o.type = 'triangle'; o.frequency.value = kind() === 'notes' ? NOTE_FREQ[NOTES_OF[nPads()][i]] : PADS[i % PADS.length][1];
        gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
        gn.gain.setValueAtTime(0.35, t + ms / 1000 - 0.05); gn.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
        o.connect(gn); gn.connect(core.output()); o.start(t); o.stop(t + ms / 1000 + 0.05);
    };

    const mount = (p) => {
        panel = p;
        panel.innerHTML = `
            <div class="ct-simon">
                <aside class="tarjeta ct-side">
                    <div class="ct-setup ct-setup-group">
                    <label class="campo apilado"><span>${escape(t('si_kind'))}</span><select id="si-kind">
                        ${KINDS.map((k) => `<option value="${k}">${escape(t('si_kind_' + k))}</option>`).join('')}
                    </select></label>
                    <label class="campo apilado" id="si-syl-box"><span>${escape(t('si_syl_mode'))}</span><select id="si-syl">
                        <option value="watch">${escape(t('si_syl_watch'))}</option><option value="read">${escape(t('si_syl_read'))}</option>
                    </select></label>
                    <label class="campo apilado" id="si-rule-box"><span>${escape(t('si_rule'))}</span><select id="si-rule">
                        ${Object.keys(RULES).map((k) => `<option value="${k}">${escape(t('si_rule_' + k))}</option>`).join('')}
                    </select></label>
                    <div id="si-pads-box">
                    <p class="ante">${STR.pads}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(STR.pads)}" id="si-pads">
                        <button type="button" role="radio" aria-checked="true" data-n="4">4</button>
                        <button type="button" role="radio" aria-checked="false" data-n="6">6</button>
                        <button type="button" role="radio" aria-checked="false" data-n="9">9</button>
                    </div>
                    </div>
                    <p class="ante">${escape(t('si_order'))}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(t('si_order'))}" id="si-order">
                        <button type="button" role="radio" aria-checked="true" data-v="same">${escape(t('si_order_same'))}</button>
                        <button type="button" role="radio" aria-checked="false" data-v="reverse">${escape(t('si_order_reverse'))}</button>
                    </div>
                    <p class="ante">${STR.speed}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(STR.speed)}" id="si-speed">
                        <button type="button" role="radio" aria-checked="true" data-v="normal">${STR.normal}</button>
                        <button type="button" role="radio" aria-checked="false" data-v="fast">${STR.fast}</button>
                    </div>
                    <label class="campo apilado"><span>${STR.turns}</span><select id="si-turns"></select></label>
                    <p class="ante">${STR.onFail}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(STR.onFail)}" id="si-onfail">
                        <button type="button" role="radio" aria-checked="true" data-v="repeat">${STR.failRepeat}</button>
                        <button type="button" role="radio" aria-checked="false" data-v="reset">${STR.failReset}</button>
                    </div>
                    </div>
                    <button type="button" class="boton grande" id="si-start"><span data-icono="seguir"></span><span>${STR.start}</span></button>
                    <p class="ct-simon-record" id="si-record"></p>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-simon-who" id="si-who"></div>
                    <div class="ct-simon-show" id="si-show" hidden></div>
                    <div class="ct-simon-board" id="si-board"></div>
                    <p class="total espera" id="si-msg" aria-live="polite"></p>
                </div>
            </div>`;
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        wire();
    };

    const kind = () => ($('#si-kind') && KINDS.includes($('#si-kind').value) ? $('#si-kind').value : 'colors');
    const readWord = () => kind() === 'syllables' && $('#si-syl').value === 'read';
    // In the Infantil mode, the syllables in capitals (as they start reading).
    const caps = (x) => ((core.mode ? core.mode() : 'primary') === 'early' ? x.toLocaleUpperCase((CONTENT.lang || 'en').replace('_', '-')) : x);
    const rule = () => RULES[$('#si-rule') && $('#si-rule').value] || RULES.plus1;
    const reverse = () => ($('#si-order [aria-checked="true"]') || { dataset: {} }).dataset.v === 'reverse';
    // Arrows are always four, numbers nine (1 to 9); colours and notes take the pads chosen; syllables at least those,
    // and more if the word has more different syllables.
    const chosenPads = () => Number(($('#si-pads [aria-checked="true"]') || { dataset: { n: 4 } }).dataset.n);
    const nPads = () => {
        if (kind() === 'arrows') { return 4; }
        if (kind() === 'numbers') { return 9; }
        if (kind() === 'syllables' && s.pads.length) { return s.pads.length; }
        return chosenPads();
    };
    const fast = () => ($('#si-speed [aria-checked="true"]') || { dataset: {} }).dataset.v === 'fast';
    const resetOnFail = () => ($('#si-onfail [aria-checked="true"]') || { dataset: {} }).dataset.v === 'reset';
    const syllable = (i) => caps(s.pads[i] || '');
    const padLabel = (i) => ({ arrows: STR.arrows[i], numbers: String(i + 1), notes: STR.notes[NOTES_OF[nPads()][i]], syllables: syllable(i) }[kind()]
        || `${STR.colors[i]} (${i + 1})`);
    const padInside = (i) => ({ arrows: ARROW, numbers: String(i + 1), notes: escape(STR.notes[NOTES_OF[nPads()][i]]), syllables: escape(syllable(i)) }[kind()] || '');
    const paintBoard = () => {
        const n = nPads(), k = kind();
        $('#si-board').dataset.n = n;
        $('#si-board').dataset.kind = k;
        const colour = (i) => (k === 'colors' || k === 'syllables' ? PADS[i % PADS.length][0] : 'var(--azul)');
        // The yellow pad with dark letters.
        const light = (i) => (k === 'syllables' && i % PADS.length === 2 ? ' claro' : '');
        $('#si-board').innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" class="ct-pad${light(i)}" style="--c:${colour(i)}" data-i="${i}" aria-label="${escape(padLabel(i))}">${padInside(i)}</button>`).join('');
        $('#si-pads-box').hidden = k === 'arrows' || k === 'numbers';
        $('#si-rule-box').hidden = k !== 'numbers';
        $('#si-syl-box').hidden = k !== 'syllables';
        $('#si-show').hidden = k !== 'numbers' && k !== 'syllables';
        $('#si-show').textContent = k === 'numbers' ? $('#si-rule').selectedOptions[0].textContent : '';
        $('#si-show').dataset.rule = '1';
    };
    // Syllables: a word of the length of this point of the game (two words of each length, from two syllables to
    // five), its syllables and others on the pads, and the word as the sequence.
    const newWord = () => {
        const len = Math.min(5, 2 + Math.floor(s.words / 2));
        let pool = WORDS.filter((w) => w.length === len && w.join('') !== s.word.join(''));
        if (!pool.length) { pool = WORDS.filter((w) => w.length <= len); }
        const word = pool[random(pool.length)];
        const own = [...new Set(word)];
        const size = [4, 6, 9].find((x) => x >= Math.max(chosenPads(), own.length)) || 9;
        const others = shuffle(ALL_SYLLABLES.filter((x) => !own.includes(x))).slice(0, size - own.length);
        s.word = word;
        s.pads = shuffle(own.concat(others));
        s.seq = word.map((x) => s.pads.indexOf(x));
        paintBoard();
    };
    // The next of the sequence: any pad, or (with numbers) one of the answers the rule can give.
    const nextItem = () => (kind() === 'numbers' ? rule().answers[random(rule().answers.length)] - 1 : random(nPads()));
    const fillTurns = () => {
        const sel = $('#si-turns'), before = sel.value || load('simon-turnos', '');
        sel.innerHTML = `<option value="">${STR.everyone}</option>` + core.lists().map((l) => `<option value="${escape(l.id)}">${escape(l.nombre)} (${core.present(l).length})</option>`).join('');
        sel.value = [...sel.options].some((o) => o.value === before) ? before : '';
    };
    const list = () => core.lists().find((l) => l.id === $('#si-turns').value) || null;
    const whoName = () => (s.turn >= 0 && s.order[s.turn]) || '';
    const paintWho = () => {
        const l = list(), w = whoName();
        $('#si-who').innerHTML = l && w ? `${core.face(l, w, 'cara-media') || ''}<span>${escape(w)}</span>` : '';
        $('#si-record').textContent = s.record ? STR.record(s.record, s.recordWho) : '';
    };
    const clearTimers = () => { s.timers.forEach(clearTimeout); s.timers = []; };
    const later = (fn, ms) => { s.timers.push(setTimeout(fn, ms)); };
    const flash = (i, ms) => {
        const pad = $(`#si-board .ct-pad[data-i="${i}"]`);
        if (!pad) { return; }
        pad.classList.add('ct-lit'); tone(i, ms);
        later(() => pad.classList.remove('ct-lit'), ms);
    };
    // How the board shows one of the sequence: the pad lit; with numbers, the number to transform, big; with notes,
    // only its sound.
    const show = (i, ms) => {
        if (kind() === 'notes') { tone(i, ms); return; }
        if (kind() === 'syllables') {
            // The word grows on the board as its syllables light up.
            const box = $('#si-show'), k = s.seq.indexOf(i, Number(box.dataset.k || 0));
            box.dataset.k = String(k + 1);
            box.textContent = caps(s.word.slice(0, k + 1).join(''));
            flash(i, ms);
            return;
        }
        if (kind() === 'numbers') {
            const box = $('#si-show');
            delete box.dataset.rule;
            box.textContent = String(rule().shown(i + 1)); box.classList.add('ct-lit'); play('tic');
            later(() => { box.classList.remove('ct-lit'); box.textContent = ''; }, ms);
            return;
        }
        flash(i, ms);
    };
    // Round n, or word n with syllables.
    const roundText = () => (kind() === 'syllables' ? t('si_word_n', s.words + 1) : STR.round(s.seq.length));
    const setMsg = (text, waiting) => { const m = $('#si-msg'); m.textContent = text; m.className = waiting ? 'total espera' : 'total'; };

    // The board plays the sequence; then it is the class's (or the student's) turn.
    const playSequence = () => {
        if (kind() === 'syllables') {
            const box = $('#si-show');
            box.textContent = ''; box.dataset.k = '0'; delete box.dataset.rule; box.classList.remove('ct-palabra');
            // Read and split it: the word is written, and they press its syllables.
            if (readWord()) {
                box.textContent = caps(s.word.join(''));
                s.state = 'input'; s.input = 0;
                $('#si-board').classList.remove('ct-locked');
                setMsg(`${roundText()} · ${reverse() ? t('si_syl_split_reverse') : t('si_syl_split')}`);
                return;
            }
        }
        s.state = 'showing';
        $('#si-board').classList.add('ct-locked');
        setMsg(`${roundText()} · ${kind() === 'notes' ? STR.listen : STR.watch}`);
        // Numbers need a moment to be worked out: a slower pace.
        const base = (fast() ? 420 : 620) + (kind() === 'numbers' ? 500 : 0), step = Math.max(220, base - s.seq.length * 18);
        s.seq.forEach((i, k) => later(() => show(i, step * 0.72), 500 + k * step));
        later(() => {
            s.state = 'input'; s.input = 0;
            $('#si-board').classList.remove('ct-locked');
            if (kind() === 'syllables') { $('#si-show').textContent = ''; }
            if (kind() === 'numbers') { $('#si-show').textContent = $('#si-rule').selectedOptions[0].textContent; $('#si-show').dataset.rule = '1'; }
            setMsg(`${roundText()} · ${reverse() ? t('si_your_turn_reverse') : STR.yourTurn}`);
        }, 500 + s.seq.length * step);
    };
    // grow: false plays the same sequence again (after a mistake), for the next one or for the class.
    const nextRound = (grow = true) => {
        const l = list();
        if (l) { s.turn = (s.turn + 1) % s.order.length; paintWho(); announce(STR.next(whoName())); }
        if (kind() === 'syllables') {
            if (grow || !s.seq.length) { newWord(); }
        } else if (grow || !s.seq.length) { s.seq.push(nextItem()); }
        later(playSequence, 700);
    };
    const start = () => {
        clearTimers();
        save('simon-turnos', $('#si-turns').value);
        const l = list();
        s.order = l ? shuffle(core.present(l).slice()) : [];
        s.turn = -1; s.seq = []; s.words = 0; s.word = []; s.pads = [];
        if (l && !s.order.length) { return; }
        paintBoard(); paintWho();
        games.playing('simon', true);
        core.relabel($('#si-start'), STR.again, 'otra');
        nextRound();
    };
    const fail = () => {
        s.state = 'idle';
        play('wrong');
        $$('#si-board .ct-pad').forEach((p) => p.classList.add('ct-wrong'));
        later(() => $$('#si-board .ct-pad').forEach((p) => p.classList.remove('ct-wrong')), 700);
        const reached = s.seq.length - 1, w = whoName();
        if (reached > s.record) { s.record = reached; s.recordWho = w; }
        paintWho();
        setMsg(w ? STR.failWho(w) : STR.fail);
        announce(w ? STR.failWho(w) : STR.fail);
        // From the beginning (the classic game): with turns the next one starts at one; without, «Otra vez» (the
        // settings come back). Otherwise the same sequence again, for the next one or for the whole class.
        if (resetOnFail()) {
            s.words = 0;
            if (list()) { s.seq = []; later(nextRound, 1800); } else { games.playing('simon', false); }
            return;
        }
        later(() => { if (!list()) { setMsg(STR.same); } nextRound(false); }, 1800);
    };
    const press = (i) => {
        if (s.state !== 'input') { return; }
        flash(i, 260);
        // Backwards: the last one first.
        if (s.seq[reverse() ? s.seq.length - 1 - s.input : s.input] !== i) { fail(); return; }
        s.input++;
        if (s.input === s.seq.length) {
            s.state = 'idle';
            if (s.seq.length > s.record) { s.record = s.seq.length; s.recordWho = whoName(); paintWho(); }
            if (kind() === 'syllables') {
                // The whole word, big, before the next one.
                const box = $('#si-show');
                box.textContent = caps(s.word.join('')); box.classList.add('ct-palabra');
                play('elegido'); announce(s.word.join(''));
                s.words++;
                later(nextRound, 1600);
                return;
            }
            later(nextRound, 600);
        }
    };

    const wire = () => {
        const seg = (id, after) => $(id).addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b) { return; }
            $$(`${id} button`).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
            after();
        });
        // A change of what the pads are starts the game again.
        const restart = () => {
            clearTimers(); s.state = 'idle'; s.seq = []; s.word = []; s.pads = []; s.words = 0;
            if (kind() === 'syllables') { newWord(); s.seq = []; }
            paintBoard(); $('#si-show').classList.remove('ct-palabra');
            setMsg(STR.pressStart, true); core.relabel($('#si-start'), STR.start, 'seguir');
        };
        seg('#si-pads', () => { save('simon-colores', nPads()); restart(); });
        seg('#si-order', () => save('simon-orden', reverse() ? 'reverse' : 'same'));
        $('#si-kind').addEventListener('change', () => { save('simon-que', kind()); restart(); });
        $('#si-rule').addEventListener('change', () => { save('simon-regla', $('#si-rule').value); restart(); });
        $('#si-syl').addEventListener('change', () => { save('simon-silabas', $('#si-syl').value); restart(); });
        seg('#si-speed', () => save('simon-rapido', fast()));
        seg('#si-onfail', () => save('simon-fallo', resetOnFail() ? 'reset' : 'repeat'));
        $('#si-turns').addEventListener('change', () => { save('simon-turnos', $('#si-turns').value); s.order = []; s.turn = -1; paintWho(); });
        $('#si-start').addEventListener('click', start);
        $('#si-board').addEventListener('pointerdown', (e) => { const p = e.target.closest('.ct-pad'); if (p) { e.preventDefault(); press(Number(p.dataset.i)); } });
        $('#si-board').addEventListener('click', (e) => { const p = e.target.closest('.ct-pad'); if (p && e.detail === 0) { press(Number(p.dataset.i)); } });   // keyboard
        document.addEventListener('keydown', (e) => {
            if (!visible || e.repeat || e.ctrlKey || e.altKey || e.metaKey || document.querySelector('dialog[open]')) { return; }
            if (e.target.closest && e.target.closest('input, textarea, select')) { return; }
            const k = Number(e.key);
            if (k >= 1 && k <= nPads()) { e.preventDefault(); press(k - 1); }
        });
        $('#si-kind').value = KINDS.includes(load('simon-que', 'colors')) ? load('simon-que', 'colors') : 'colors';
        $('#si-syl').value = load('simon-silabas', 'watch') === 'read' ? 'read' : 'watch';
        $('#si-rule').value = RULES[load('simon-regla', 'plus1')] ? load('simon-regla', 'plus1') : 'plus1';
        const order = load('simon-orden', 'same') === 'reverse' ? 'reverse' : 'same';
        $$('#si-order button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === order)));
        const n = String([4, 6, 9].includes(Number(load('simon-colores', 4))) ? Number(load('simon-colores', 4)) : 4);
        $$('#si-pads button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.n === n)));
        const saved = load('simon-rapido', null), f = saved === null ? (core.mode ? core.mode() : 'primary') === 'advanced' : saved === true;
        $$('#si-speed button').forEach((x) => x.setAttribute('aria-checked', String((x.dataset.v === 'fast') === f)));
        const onFail = load('simon-fallo', 'repeat') === 'reset' ? 'reset' : 'repeat';
        $$('#si-onfail button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === onFail)));
        if (kind() === 'syllables') { newWord(); s.seq = []; }
        paintBoard(); setMsg(STR.pressStart, true);
    };

    games.add({
        id: 'simon', name: STR.name, mount,
        enter: () => { visible = true; fillTurns(); paintWho(); },
        leave: () => { visible = false; clearTimers(); if (s.state !== 'idle') { s.state = 'idle'; setMsg(STR.pressStart, true); core.relabel($('#si-start'), STR.start, 'seguir'); } },
        space: () => { if (s.state === 'idle') { start(); } },
    });
    window.ClasstoolsSimon = { start, press, state: () => s };   // for automated tests
})();
