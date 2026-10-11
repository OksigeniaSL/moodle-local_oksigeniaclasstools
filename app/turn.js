// «Whose turn?» from the other tools (the board, the score, the materials, the games…): a card over the screen with
// someone of the class, their photo (or initials) and their name, after a short shuffle; chosen as in «Whose turn?»
// (from the list chosen there, those who came, with the fair turns of the course). «Another» chooses again.
// Relays: with «Another every…», the card steps into a corner with a bar that empties, so the one chosen can use the
// screen, and when the time is up the next one is chosen by itself.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.pick) { return; }
    const { t, escape, play, announce, save, load } = core;
    const RELAYS = [0, 30, 60, 120, 180, 300];
    const relayLabel = (x) => (!x ? t('turn_relay_none')
        : (x < 60 ? t('turn_relay_s', x) : (x === 60 ? t('turn_relay_m1') : t('turn_relay_m', x / 60))));
    let open = null, timer = 0, ticker = 0;
    const stop = () => { clearTimeout(timer); clearInterval(ticker); };
    /**
     * Shows the card over an element.
     * @param {HTMLElement} stage Where it goes (it covers it).
     * @param {{task?: string}} opts What the one chosen is to do («To the board!»).
     */
    core.turn = (stage, opts = {}) => {
        if (open) { open.remove(); }
        stop();
        let relay = RELAYS.includes(Number(load('turno-relevo', 0))) ? Number(load('turno-relevo', 0)) : 0;
        let deadline = 0;
        const layer = document.createElement('div');
        layer.className = 'ct-turno';
        layer.innerHTML = `<div class="ct-turno-tarjeta" role="dialog" aria-labelledby="ct-turno-nombre">
            <p class="ante">${escape(t('turn_title'))}</p>
            <div class="ct-turno-cara" aria-hidden="true"></div>
            <p class="ct-turno-nombre" id="ct-turno-nombre" aria-live="assertive"></p>
            <p class="ct-turno-tarea">${escape(opts.task || '')}</p>
            <div class="ct-turno-relevo" aria-hidden="true"><i></i></div>
            <select class="ct-turno-cada" aria-label="${escape(t('turn_relay'))}">${RELAYS.map((x) => `<option value="${x}">${escape(relayLabel(x))}</option>`).join('')}</select>
            <div class="botonera"><button type="button" class="boton suave" data-a="other">${escape(t('turn_other'))}</button><button type="button" class="boton" data-a="ok">${escape(t('turn_ok'))}</button>
                <button type="button" class="boton suave ct-turno-parar" data-a="stop">${escape(t('turn_stop'))}</button></div>
        </div>`;
        if (getComputedStyle(stage).position === 'static') { stage.style.position = 'relative'; }
        stage.append(layer);
        open = layer;
        const $ = (s) => layer.querySelector(s);
        $('.ct-turno-cada').value = String(relay);
        const close = () => { stop(); layer.remove(); if (open === layer) { open = null; } };
        let show = null;
        // In a corner while the one chosen works, with the bar of the time left; the next one when it runs out (or
        // nothing more if the tool has been left).
        const corner = () => {
            layer.classList.add('ct-turno-mini');
            deadline = Date.now() + relay * 1000;
            clearInterval(ticker);
            ticker = setInterval(() => {
                if (!stage.isConnected || stage.offsetParent === null) { close(); return; }
                const left = Math.max(0, deadline - Date.now());
                $('.ct-turno-relevo i').style.width = `${(100 * left / (relay * 1000)).toFixed(1)}%`;
                if (!left) { clearInterval(ticker); play('cuenta'); show(); }
            }, 200);
        };
        show = () => {
            stop();
            layer.classList.remove('ct-turno-mini');
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
                // In a relay the name is seen big for a moment, then the card steps aside.
                if (relay) { timer = setTimeout(corner, 2500); }
            };
            step();
        };
        $('.ct-turno-cada').addEventListener('change', (e) => {
            relay = Number(e.target.value) || 0;
            save('turno-relevo', relay);
            layer.classList.toggle('ct-turno-relevos', !!relay);
        });
        layer.classList.toggle('ct-turno-relevos', !!relay);
        layer.addEventListener('click', (e) => {
            const b = e.target.closest('[data-a]'), mini = layer.classList.contains('ct-turno-mini');
            if (b && b.dataset.a === 'other') { show(); }
            if (b && b.dataset.a === 'stop') { close(); }
            if (b && b.dataset.a === 'ok') {
                if (relay && !mini) { stop(); corner(); } else { close(); }
            }
            if (e.target === layer && !mini) { close(); }
        });
        show();
    };
})();
