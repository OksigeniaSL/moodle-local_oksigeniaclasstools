// Simon for the whole class: coloured pads with their own notes; the sequence grows each round. With a class
// list, a different student repeats it each round (shown big with their face). A mistake does not send everyone back
// to one: the same sequence is played again for the next one (or for the class), unless the teacher chooses to start
// from the beginning, as in the classic game. The record is kept.
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
        colors: [t('si_green'), t('si_red'), t('si_yellow'), t('si_blue'), t('si_purple'), t('si_orange')],
    };
    // Classic Simon notes (green, red, yellow, blue) and two more for six pads.
    const PADS = [['#067e36', 164.81], ['#ce1423', 440], ['#fbbe17', 277.18], ['#164281', 329.63], ['#5b2fb8', 392], ['#c2410c', 220]];
    let panel = null, visible = false;
    const s = { seq: [], input: 0, state: 'idle', record: 0, recordWho: '', order: [], turn: -1, timers: [] };

    const tone = (i, ms) => {
        const a = core.audioContext && core.audioContext();
        if (!a || !core.soundOn()) { return; }
        const t = a.currentTime, o = a.createOscillator(), gn = a.createGain();
        o.type = 'triangle'; o.frequency.value = PADS[i][1];
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
                    <p class="ante">${STR.pads}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(STR.pads)}" id="si-pads">
                        <button type="button" role="radio" aria-checked="true" data-n="4">4</button>
                        <button type="button" role="radio" aria-checked="false" data-n="6">6</button>
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
                    <div class="ct-simon-board" id="si-board"></div>
                    <p class="total espera" id="si-msg" aria-live="polite"></p>
                </div>
            </div>`;
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        wire();
    };

    const nPads = () => Number(($('#si-pads [aria-checked="true"]') || { dataset: { n: 4 } }).dataset.n);
    const fast = () => ($('#si-speed [aria-checked="true"]') || { dataset: {} }).dataset.v === 'fast';
    const resetOnFail = () => ($('#si-onfail [aria-checked="true"]') || { dataset: {} }).dataset.v === 'reset';
    const paintBoard = () => {
        const n = nPads();
        $('#si-board').dataset.n = n;
        $('#si-board').innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" class="ct-pad" style="--c:${PADS[i][0]}" data-i="${i}" aria-label="${escape(STR.colors[i])} (${i + 1})"></button>`).join('');
    };
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
    const setMsg = (text, waiting) => { const m = $('#si-msg'); m.textContent = text; m.className = waiting ? 'total espera' : 'total'; };

    // The board plays the sequence; then it is the class's (or the student's) turn.
    const playSequence = () => {
        s.state = 'showing';
        $('#si-board').classList.add('ct-locked');
        setMsg(`${STR.round(s.seq.length)} · ${STR.watch}`);
        const base = fast() ? 420 : 620, step = Math.max(220, base - s.seq.length * 18);
        s.seq.forEach((i, k) => later(() => flash(i, step * 0.72), 500 + k * step));
        later(() => {
            s.state = 'input'; s.input = 0;
            $('#si-board').classList.remove('ct-locked');
            setMsg(`${STR.round(s.seq.length)} · ${STR.yourTurn}`);
        }, 500 + s.seq.length * step);
    };
    // grow: false plays the same sequence again (after a mistake), for the next one or for the class.
    const nextRound = (grow = true) => {
        const l = list();
        if (l) { s.turn = (s.turn + 1) % s.order.length; paintWho(); announce(STR.next(whoName())); }
        if (grow || !s.seq.length) { s.seq.push(random(nPads())); }
        later(playSequence, 700);
    };
    const start = () => {
        clearTimers();
        save('simon-turnos', $('#si-turns').value);
        const l = list();
        s.order = l ? shuffle(core.present(l).slice()) : [];
        s.turn = -1; s.seq = [];
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
            if (list()) { s.seq = []; later(nextRound, 1800); } else { games.playing('simon', false); }
            return;
        }
        later(() => { if (!list()) { setMsg(STR.same); } nextRound(false); }, 1800);
    };
    const press = (i) => {
        if (s.state !== 'input') { return; }
        flash(i, 260);
        if (s.seq[s.input] !== i) { fail(); return; }
        s.input++;
        if (s.input === s.seq.length) {
            s.state = 'idle';
            if (s.seq.length > s.record) { s.record = s.seq.length; s.recordWho = whoName(); paintWho(); }
            later(nextRound, 600);
        }
    };

    const wire = () => {
        const seg = (id, after) => $(id).addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b) { return; }
            $$(`${id} button`).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
            after();
        });
        seg('#si-pads', () => { save('simon-colores', nPads()); clearTimers(); s.state = 'idle'; s.seq = []; paintBoard(); setMsg(STR.pressStart, true); core.relabel($('#si-start'), STR.start, 'seguir'); });
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
        const n = Number(load('simon-colores', 4)) === 6 ? '6' : '4';
        $$('#si-pads button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.n === n)));
        const saved = load('simon-rapido', null), f = saved === null ? (core.mode ? core.mode() : 'primary') === 'advanced' : saved === true;
        $$('#si-speed button').forEach((x) => x.setAttribute('aria-checked', String((x.dataset.v === 'fast') === f)));
        const onFail = load('simon-fallo', 'repeat') === 'reset' ? 'reset' : 'repeat';
        $$('#si-onfail button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === onFail)));
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
