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
 * Clap echo, among the games: the board counts four and claps a rhythm (one or two bars of ta, ti-ti… or harder,
 * with ta-a, a rest and ti-ri-ti-ri), and the class claps it back. Its echo can be tapped on a big drum on the board
 * (or with the space bar), and the board compares the taps with the rhythm, allowing for a slightly faster or slower
 * echo; or the teacher, listening, says «Well done!» or «Again». Then the rhythm shows written, each beat green or
 * red. A streak of echoes, and the record.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games) { return; }
    const { escape, save, load, play, announce, setIcon, t } = core;
    const M = () => window.ClasstoolsMusicQuiz;
    const S = () => window.ClasstoolsScore;
    const TEMPOS = { slow: 70, normal: 90 };
    const opt = Object.assign({ hard: false, bars: 1, speed: 'slow' }, load('eco', {}));
    const keepOpt = () => save('eco', opt);
    let panel = null, cells = [], state = 'idle', taps = [], waitTimer = 0, streak = 0, record = Number(load('eco-record', 0)) || 0;
    const $ = (s) => panel.querySelector(s);

    // The rhythm: its notes, the moments of its claps (in sixteenths) and the length of a sixteenth (ms).
    const notes = () => (M() ? M().rhythmNotes(cells) : []);
    const onsets = () => { let at = 0; const out = []; notes().forEach((n) => { if (!n.r) { out.push(at); } at += n.t; }); return out; };
    const sixteenth = () => (60 / TEMPOS[opt.speed] / 4) * 1000;
    const newRhythm = () => {
        cells = [];
        for (let b = 0; b < opt.bars; b++) { cells = cells.concat(M() ? M().bar(opt.hard) : ['ta', 'ta', 'ta', 'ta']); }
    };

    /**
     * Whether some taps are the echo of the rhythm: as many, and each near its place once the whole is stretched or
     * shrunk to the class's own speed (a fifth either way at most).
     *
     * @param {number[]} at The moments of the taps, in ms.
     * @return {{ok: boolean, marks: boolean[]}}
     */
    const judge = (at) => {
        const e = onsets(), q = sixteenth();
        if (at.length !== e.length) { return { ok: false, marks: e.map(() => false), count: true }; }
        if (e.length === 1) { return { ok: true, marks: [true] }; }
        const span = (e[e.length - 1] - e[0]) * q;
        const k = Math.max(0.8, Math.min(1.25, (at[at.length - 1] - at[0]) / span));
        const gaps = e.slice(1).map((x, i) => x - e[i]);
        const tol = Math.max(70, Math.min(220, 0.45 * Math.min(...gaps) * q * k));
        const marks = e.map((x, i) => Math.abs(at[i] - (at[0] + (x - e[0]) * q * k)) <= tol);
        return { ok: marks.every(Boolean), marks };
    };

    // The rhythm written, each beat with its mark once judged.
    const written = (marks) => {
        let n = 0;
        return `<div class="ct-eco-ritmo">${cells.map((c) => {
            const beats = M() ? M().CELLS[c].notes.filter(() => !M().CELLS[c].rest).length : 1;
            const own = marks ? marks.slice(n, n + beats) : [];
            n += beats;
            const cls = !marks ? '' : (own.every(Boolean) ? ' bien' : ' mal');
            return `<span class="ct-eco-celda${cls}">${escape(t('mq_syl_' + c))}</span>`;
        }).join('')}</div>`;
    };
    const msg = (text) => { $('#ec-msg').textContent = text; };
    const paintScore = () => { $('#ec-streak').textContent = t('ec_streak', streak); $('#ec-record').textContent = t('ec_record', record); };
    const busy = (on) => { ['#ec-listen', '#ec-again', '#ec-new'].forEach((s) => { $(s).disabled = on; }); };

    const listen = () => {
        if (!cells.length) { newRhythm(); }
        clearTimeout(waitTimer);
        state = 'playing'; taps = []; busy(true);
        $('#ec-written').innerHTML = '';
        msg(t('ec_msg_listen'));
        const ms = S() ? S().playNotes(notes(), TEMPOS[opt.speed], { clap: true, countIn: true }) : 0;
        // The pad pulses with each clap.
        const q = sixteenth(), lead = 16 * q + 150;
        onsets().forEach((x) => setTimeout(() => { const p = $('#ec-pad'); p.classList.remove('late'); void p.offsetWidth; p.classList.add('late'); }, lead + x * q));
        waitTimer = setTimeout(() => { state = 'waiting'; busy(false); msg(t('ec_msg_turn')); announce(t('ec_msg_turn')); }, Math.max(ms, 300));
    };
    const finish = (result) => {
        clearTimeout(waitTimer);
        state = 'done';
        if (result.ok) {
            streak++; if (streak > record) { record = streak; save('eco-record', record); }
            play('elegido'); msg(t('ec_msg_right'));
            if (core.logro && streak >= 3) { core.logro('tocanotas'); }
        } else {
            streak = 0; play('wrong');
            msg(result.count ? t('ec_msg_count', { want: onsets().length, got: taps.length }) : t('ec_msg_wrong'));
        }
        $('#ec-written').innerHTML = written(result.marks);
        paintScore();
        announce($('#ec-msg').textContent);
    };
    // A tap on the drum: the echo starts with the first one, and ends with as many as the rhythm has, or after a
    // silence of a bar and a half.
    const tap = () => {
        if (state !== 'waiting') { return; }
        const now = performance.now();
        taps.push(now);
        const p = $('#ec-pad'); p.classList.remove('toque'); void p.offsetWidth; p.classList.add('toque');
        play('tic');
        clearTimeout(waitTimer);
        if (taps.length >= onsets().length) { setTimeout(() => finish(judge(taps)), 150); return; }
        waitTimer = setTimeout(() => finish(judge(taps)), 24 * sixteenth());
    };

    const mount = (p) => {
        panel = p;
        panel.innerHTML = `<div class="ct-eco">
            <aside class="tarjeta ct-side">
                <p class="ante">${escape(t('ec_level'))}</p>
                <div class="segmentos" role="radiogroup" id="ec-hard">
                    <button type="button" role="radio" data-v="0">${escape(t('ec_easy'))}</button><button type="button" role="radio" data-v="1">${escape(t('ec_hard'))}</button></div>
                <p class="ante">${escape(t('ec_bars'))}</p>
                <div class="segmentos" role="radiogroup" id="ec-bars"><button type="button" role="radio" data-v="1">1</button><button type="button" role="radio" data-v="2">2</button></div>
                <p class="ante">${escape(t('ec_speed'))}</p>
                <div class="segmentos" role="radiogroup" id="ec-speed">
                    <button type="button" role="radio" data-v="slow">${escape(t('ec_slow'))}</button><button type="button" role="radio" data-v="normal">${escape(t('ec_normal'))}</button></div>
                <p class="ct-eco-marca"><span id="ec-streak"></span><span id="ec-record"></span></p>
                <p class="nota">${escape(t('ec_help'))}</p>
            </aside>
            <div class="tarjeta ct-stage ct-eco-stage">
                <p class="total" id="ec-msg" aria-live="polite"></p>
                <button type="button" class="ct-eco-pad" id="ec-pad" aria-label="${escape(t('ec_pad_label'))}">${escape(t('ec_pad'))}</button>
                <div id="ec-written"></div>
                <div class="botonera centro">
                    <button type="button" class="boton grande" id="ec-listen"><span data-icono="sonido"></span><span>${escape(t('ec_listen'))}</span></button>
                    <button type="button" class="boton suave" id="ec-again"><span data-icono="reiniciar"></span><span>${escape(t('ec_again'))}</span></button>
                    <button type="button" class="boton suave" id="ec-new"><span data-icono="otra"></span><span>${escape(t('ec_new'))}</span></button>
                </div>
                <div class="botonera centro ct-eco-profe"><span class="nota">${escape(t('ec_teacher'))}</span>
                    <button type="button" class="boton verde" id="ec-good"><span data-icono="hecho"></span><span>${escape(t('ec_good'))}</span></button></div>
            </div></div>`;
        panel.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        const seg = (id, value, set) => {
            panel.querySelectorAll(`${id} button`).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === String(value))));
            $(id).addEventListener('click', (e) => {
                const b = e.target.closest('[data-v]'); if (!b) { return; }
                set(b.dataset.v); keepOpt(); cells = []; state = 'idle'; streak = 0; paintScore();
                panel.querySelectorAll(`${id} button`).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
                $('#ec-written').innerHTML = ''; msg(t('ec_msg_start'));
            });
        };
        seg('#ec-hard', opt.hard ? 1 : 0, (v) => { opt.hard = v === '1'; });
        seg('#ec-bars', opt.bars, (v) => { opt.bars = Number(v) === 2 ? 2 : 1; });
        seg('#ec-speed', opt.speed, (v) => { opt.speed = TEMPOS[v] ? v : 'slow'; });
        $('#ec-listen').addEventListener('click', () => { if (state === 'done') { newRhythm(); } listen(); });
        $('#ec-again').addEventListener('click', listen);
        $('#ec-new').addEventListener('click', () => { newRhythm(); listen(); });
        $('#ec-pad').addEventListener('pointerdown', (e) => { e.preventDefault(); tap(); });
        $('#ec-pad').addEventListener('click', (e) => { if (e.detail === 0) { tap(); } });   // keyboard
        // The teacher listened to the claps: well done, with the rhythm written.
        $('#ec-good').addEventListener('click', () => { if (state === 'waiting' || state === 'done') { finish({ ok: true, marks: onsets().map(() => true) }); } });
        msg(t('ec_msg_start')); paintScore();
    };

    games.add({
        id: 'eco', name: t('ec_name'), mount,
        leave: () => { clearTimeout(waitTimer); if (state === 'waiting' || state === 'playing') { state = 'idle'; } },
        space: () => { if (state === 'waiting') { tap(); } else if (state !== 'playing') { if (state === 'done') { newRhythm(); } listen(); } },
    });
    window.ClasstoolsEcho = { judge, setRhythm: (c) => { cells = c.slice(); }, onsets, sixteenth, tap, listen, state: () => ({ state, streak, record, cells }) };   // for automated tests
})();
