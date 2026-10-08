// «Whose turn?» from the other tools (the board, the score…): a card over the screen with someone of the class, their
// photo (or initials) and their name, after a short shuffle; chosen as in «Whose turn?» (from the list chosen there,
// those who came, with the fair turns of the course). «Another» chooses again.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.pick) { return; }
    const { t, escape, play, announce } = core;
    let open = null, timer = 0;
    /**
     * Shows the card over an element.
     * @param {HTMLElement} stage Where it goes (it covers it).
     * @param {{task?: string}} opts What the one chosen is to do («To the board!»).
     */
    core.turn = (stage, opts = {}) => {
        if (open) { open.remove(); }
        clearTimeout(timer);
        const layer = document.createElement('div');
        layer.className = 'ct-turno';
        layer.innerHTML = `<div class="ct-turno-tarjeta" role="dialog" aria-labelledby="ct-turno-nombre">
            <p class="ante">${escape(t('turn_title'))}</p>
            <div class="ct-turno-cara" aria-hidden="true"></div>
            <p class="ct-turno-nombre" id="ct-turno-nombre" aria-live="assertive"></p>
            <p class="ct-turno-tarea">${escape(opts.task || '')}</p>
            <div class="botonera"><button type="button" class="boton suave" data-a="other">${escape(t('turn_other'))}</button><button type="button" class="boton" data-a="ok">${escape(t('turn_ok'))}</button></div>
        </div>`;
        if (getComputedStyle(stage).position === 'static') { stage.style.position = 'relative'; }
        stage.append(layer);
        open = layer;
        const $ = (s) => layer.querySelector(s);
        const show = () => {
            const got = core.pick();
            if (!got) { $('.ct-turno-nombre').textContent = t('turn_none'); $('.ct-turno-cara').innerHTML = ''; return; }
            const names = core.present ? core.present(got.list) : [got.name];
            // A short shuffle, slower and slower, that stops on the one chosen.
            let k = 0;
            const steps = core.reducedMotion && core.reducedMotion() ? 0 : 9;
            const step = () => {
                const n = k < steps ? names[core.random(names.length)] : got.name;
                $('.ct-turno-nombre').textContent = n;
                $('.ct-turno-cara').innerHTML = core.face ? core.face(got.list, n, 'ct-turno-foto') : '';
                layer.classList.toggle('barajando', k < steps);
                if (k < steps) { k++; timer = setTimeout(step, 50 + k * k * 6); return; }
                play('elegido');
                announce(t('q_turn', got.name));
            };
            step();
        };
        layer.addEventListener('click', (e) => {
            const b = e.target.closest('[data-a]');
            if (b && b.dataset.a === 'other') { show(); }
            if ((b && b.dataset.a === 'ok') || e.target === layer) { clearTimeout(timer); layer.remove(); open = null; }
        });
        show();
    };
})();
