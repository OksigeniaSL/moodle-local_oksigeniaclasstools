// The duel in the materials: the same material twice, one half for each of two students, with the same challenge
// (the rods, the number line, the fraction wall, the geoboard, the base 10 blocks and the balance scale). Each half is
// a copy of the board in a frame with only that material (and it saves nothing: app.js), so on a multi-touch panel
// each half takes its own fingers. Three ways: «At once» (both against the clock, who finishes first), «In turns»
// (one after the other, each with their own clock; for a projector or a screen of one touch) and «Compare» (two
// models side by side, without clocks). «At once» is the default only where the screen takes several touches.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-material');
    if (!core || !root || core.duelo || !core.material) { return; }
    const { t, escape, save, load, play, announce, setIcon } = core;
    const DUELS = ['rods', 'line', 'fractions', 'geoboard', 'base10', 'balanza'];
    const MODES = ['together', 'turns', 'compare'];
    const touches = (navigator.maxTouchPoints || 0) >= 2;

    // The button, next to «Whose turn?» in the bar of the materials.
    const bar = root.querySelector('.ct-top');
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'boton suave'; button.id = 'mt-duel'; button.hidden = true;
    button.innerHTML = `<span data-icono="columnas"></span><span>${escape(t('dl_button'))}</span>`;
    setIcon(button.querySelector('[data-icono]'), 'columnas');
    const turn = bar && bar.querySelector('#mt-turn');
    if (turn) { turn.before(button); } else if (bar) { bar.append(button); }
    const paintButton = () => { button.hidden = !DUELS.includes(core.material.current()); };
    root.addEventListener('click', (e) => { if (e.target.closest('#mt-mode')) { setTimeout(paintButton, 0); } });
    document.addEventListener('classtools:tab', paintButton);
    paintButton();

    // --- The duel ---------------------------------------------------------------------------------------------------
    let box = null, mode = MODES.includes(load('duelo-modo', '')) ? load('duelo-modo', '') : (touches ? 'together' : 'turns');
    // Each side: its clock (ms run, when it started) and whether it is done.
    const side = [{ ms: 0, from: 0, done: false }, { ms: 0, from: 0, done: false }];
    let running = false, tick = 0;
    const fmt = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')},${Math.floor((ms % 1000) / 100)}`; };
    const now = (i) => side[i].ms + (side[i].from ? performance.now() - side[i].from : 0);
    const name = (i) => (box.querySelector(`[data-name="${i}"]`).value.trim() || t('dl_side_n', i + 1));
    const paint = () => {
        if (!box) { return; }
        [0, 1].forEach((i) => {
            const lado = box.querySelector(`.ct-duelo-lado[data-side="${i}"]`);
            lado.querySelector('.ct-duelo-reloj').textContent = fmt(now(i));
            lado.querySelector('[data-done]').disabled = !side[i].from;
            lado.classList.toggle('esperando', mode === 'turns' && running && !side[i].from && !side[i].done);
            lado.classList.toggle('hecho', side[i].done);
        });
    };
    const stopSide = (i) => { if (side[i].from) { side[i].ms += performance.now() - side[i].from; side[i].from = 0; } };
    const result = () => {
        const [a, b] = [now(0), now(1)];
        const text = Math.abs(a - b) < 50 ? t('dl_tie') : t('dl_wins', { who: name(a < b ? 0 : 1), time: fmt(Math.min(a, b)), other: fmt(Math.max(a, b)) });
        box.querySelector('.ct-duelo-resultado').textContent = text;
        play('elegido'); announce(text);
        running = false; clearInterval(tick);
        core.relabel(box.querySelector('#dl-go'), t('dl_again'), 'reiniciar');
    };
    const start = () => {
        side.forEach((s) => Object.assign(s, { ms: 0, from: 0, done: false }));
        box.querySelector('.ct-duelo-resultado').textContent = '';
        running = true;
        const t0 = performance.now();
        side[0].from = t0;
        if (mode === 'together') { side[1].from = t0; }
        clearInterval(tick); tick = setInterval(paint, 100);
        core.relabel(box.querySelector('#dl-go'), t('dl_restart'), 'reiniciar');
        play('tic'); paint();
    };
    const done = (i) => {
        if (!running || !side[i].from) { return; }
        stopSide(i); side[i].done = true; play('tic');
        // In turns, the other one starts now.
        if (mode === 'turns' && !side[1 - i].done) { side[1 - i].from = performance.now(); }
        if (side[0].done && side[1].done) { result(); } else if (mode === 'together' && side[1 - i].done === false) {
            // At once: the first one done wins; the other may still finish, for their time.
            box.querySelector('.ct-duelo-resultado').textContent = t('dl_first', name(i));
        }
        paint();
    };
    const paintMode = () => {
        box.querySelectorAll('#dl-mode button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === mode)));
        box.classList.toggle('comparar', mode === 'compare');
        box.querySelector('#dl-go').hidden = mode === 'compare';
        box.querySelector('#dl-hint').textContent = t('dl_hint_' + mode);
    };
    // Two of the class, if there is a list: the fair draw of «Whose turn?».
    const pickTwo = () => {
        if (!core.pick) { return; }
        [0, 1].forEach((i) => { const p = core.pick(); if (p && p.name) { box.querySelector(`[data-name="${i}"]`).value = p.name; } });
        play('card');
    };
    const open = () => {
        const key = core.material.current();
        if (!DUELS.includes(key)) { return; }
        close();
        const src = `${location.pathname}${location.search}#duelo=${key}`;
        box = document.createElement('div');
        box.className = 'ct-duelo';
        box.innerHTML = `<div class="ct-duelo-cabeza">
                <input type="text" class="ct-duelo-reto" id="dl-reto" maxlength="120" placeholder="${escape(t('dl_challenge_ph'))}" aria-label="${escape(t('dl_challenge'))}">
                <div class="segmentos" role="radiogroup" aria-label="${escape(t('dl_mode'))}" id="dl-mode">${MODES.map((m) => `<button type="button" role="radio" data-v="${m}">${escape(t('dl_mode_' + m))}</button>`).join('')}</div>
                <button type="button" class="boton" id="dl-go"><span data-icono="empezar"></span><span>${escape(t('dl_start'))}</span></button>
                <button type="button" class="boton suave" id="dl-close"><span data-icono="cerrar"></span><span>${escape(t('dl_close'))}</span></button>
            </div>
            <p class="nota ct-duelo-pista" id="dl-hint"></p>
            <div class="ct-duelo-lados">${[0, 1].map((i) => `<div class="ct-duelo-lado" data-side="${i}">
                <iframe src="${escape(src)}" title="${escape(t('dl_side_n', i + 1))}"></iframe>
                <div class="ct-duelo-pie"><input type="text" class="ct-duelo-nombre" data-name="${i}" maxlength="40" placeholder="${escape(t('dl_side_n', i + 1))}" aria-label="${escape(t('dl_name'))}">
                    <span class="ct-duelo-reloj">0:00,0</span>
                    <button type="button" class="boton verde" data-done="${i}" disabled>${escape(t('dl_done'))}</button></div></div>`).join('')}</div>
            <div class="ct-duelo-final"><p class="ct-duelo-resultado" aria-live="polite"></p>
                <button type="button" class="boton suave" id="dl-two"><span data-icono="quien"></span><span>${escape(t('dl_pick_two'))}</span></button></div>`;
        box.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        root.append(box);
        box.querySelector('#dl-two').hidden = !core.pick || !(core.lists && core.lists().length);
        box.querySelector('#dl-mode').addEventListener('click', (e) => {
            const b = e.target.closest('[data-v]');
            if (!b) { return; }
            mode = b.dataset.v; save('duelo-modo', mode);
            running = false; clearInterval(tick); side.forEach((s) => Object.assign(s, { ms: 0, from: 0, done: false }));
            box.querySelector('.ct-duelo-resultado').textContent = '';
            core.relabel(box.querySelector('#dl-go'), t('dl_start'), 'empezar');
            paintMode(); paint();
        });
        box.querySelector('#dl-go').addEventListener('click', () => {
            // A new round: both copies start again from the beginning.
            if (running || side.some((s) => s.done)) { box.querySelectorAll('iframe').forEach((f) => { try { f.contentWindow.location.reload(); } catch (err) { /* not there */ } }); }
            start();
        });
        box.querySelector('#dl-close').addEventListener('click', close);
        box.querySelector('#dl-two').addEventListener('click', pickTwo);
        box.querySelectorAll('[data-done]').forEach((b) => b.addEventListener('click', () => done(Number(b.dataset.done))));
        paintMode(); paint();
        announce(t('dl_opened'));
    };
    function close() {
        running = false; clearInterval(tick);
        if (box) { box.remove(); box = null; }
    }
    button.addEventListener('click', open);
    // Leaving the materials closes it (the copies are not left running).
    document.addEventListener('classtools:tab', () => { if (box && root.hidden) { close(); } });

    window.ClasstoolsDuel = { open, close, done, state: () => ({ mode, running, side: side.map((s, i) => ({ ms: now(i), done: s.done })) }) };   // for automated tests
})();
