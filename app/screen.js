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
 * The screens of the classroom. Their size: the board fits the height too, and «−» and «+» in its bar make everything
 * smaller or bigger on that screen (each screen keeps its own). And touch panels: some keep a touch that has already
 * gone (a finger the screen thinks is still on it); from then on every tap is a second finger, which the browser does
 * not turn into a click, and a drag can be taken for a pinch. The board gives those taps their click itself, keeps a
 * long press from opening the browser's menus, and the page from being zoomed by a pinch (the board has its own
 * zoom). With #toques in the address, a test of the screen: each finger is a circle until the screen says it has left.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const CLICKABLE = 'button, [role="button"], [role="radio"], [role="tab"], [role="switch"], [role="checkbox"], a[href], summary, '
        + 'label, input[type="checkbox"], input[type="radio"]';
    const FIELD = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]';
    const near = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) <= 14;

    // --- The size of the board -------------------------------------------------------------------------------------
    // Smaller or bigger, kept on this screen (not in Moodle: each classroom's screen is different). The practice board
    // of a help uses it but does not change it.
    const core = window.ClasstoolsCore || {}, t = core.t || ((k, a) => (a === undefined ? k : `${k} ${a}`));
    const STEPS = [0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.4], KEY = 'classtools-zoom';
    const practice = /(?:^#|&)practica(?:&|$)/.test(location.hash);
    let zoom = 1;
    try { zoom = Number(localStorage.getItem(KEY)) || 1; } catch (e) { /* no storage: the normal size */ }
    if (!STEPS.includes(zoom)) { zoom = 1; }
    const setZoom = (z, keep) => {
        zoom = z;
        document.documentElement.style.setProperty('--zoom', String(z));
        if (keep && !practice) { try { localStorage.setItem(KEY, String(z)); } catch (e) { /* only for now */ } }
        const box = document.getElementById('ct-zoom');
        if (box) {
            box.querySelector('[data-z="0"]').textContent = `${Math.round(z * 100)} %`;
            box.querySelector('[data-z="-1"]').disabled = z === STEPS[0];
            box.querySelector('[data-z="1"]').disabled = z === STEPS[STEPS.length - 1];
        }
        // The tools that draw to the size of their place (the board, the wheel…) draw again.
        window.dispatchEvent(new Event('resize'));
    };
    const bar = document.querySelector('.barra .acciones');
    if (bar) {
        const box = document.createElement('div');
        box.className = 'ct-zoom'; box.id = 'ct-zoom';
        box.setAttribute('role', 'group'); box.setAttribute('aria-label', t('bar_zoom'));
        const button = (d, icon, label) => `<button type="button" data-z="${d}" title="${label}" aria-label="${label}">${icon ? core.icon(icon) : ''}</button>`;
        box.innerHTML = button(-1, 'lupa-menos', t('bar_zoom_out')) + button(0, '', t('bar_zoom_reset')) + button(1, 'lupa-mas', t('bar_zoom_in'));
        box.addEventListener('click', (e) => {
            const b = e.target.closest('[data-z]');
            if (!b) { return; }
            const d = Number(b.dataset.z), i = STEPS.indexOf(zoom);
            setZoom(d === 0 ? 1 : STEPS[Math.max(0, Math.min(STEPS.length - 1, i + d))], true);
        });
        bar.prepend(box);
    }
    setZoom(zoom, false);

    // --- A tap with a second finger --------------------------------------------------------------------------------
    // The touches the screen says are down, and the taps on a control that came as a second finger.
    const down = new Map(), taps = new Map();
    let given = null, lastType = 'mouse';
    document.addEventListener('pointerdown', (e) => {
        lastType = e.pointerType;
        if (e.pointerType !== 'touch') { return; }
        down.set(e.pointerId, { x: e.clientX, y: e.clientY, t: Date.now(), primary: e.isPrimary });
        const target = !e.isPrimary && e.target.closest ? e.target.closest(CLICKABLE) : null;
        if (target) { taps.set(e.pointerId, { target, x: e.clientX, y: e.clientY, t: Date.now() }); }
        show('down', e);
    }, true);
    const gone = (e) => { down.delete(e.pointerId); taps.delete(e.pointerId); show(e.type === 'pointercancel' ? 'cancel' : 'up', e); };
    document.addEventListener('pointerup', (e) => {
        const tap = taps.get(e.pointerId);
        gone(e);
        if (!tap || Date.now() - tap.t > 800 || !near(tap, { x: e.clientX, y: e.clientY })) { return; }
        const target = tap.target, under = document.elementFromPoint(e.clientX, e.clientY);
        if (!target.isConnected || target.disabled || !under || !target.contains(under)) { return; }
        // If the browser clicks after all, nothing more; if not, the board does.
        let clicked = false;
        const seen = (ev) => { if (target.contains(ev.target)) { clicked = true; } };
        document.addEventListener('click', seen, true);
        setTimeout(() => {
            document.removeEventListener('click', seen, true);
            if (clicked || !target.isConnected || target.disabled) { return; }
            given = { target, until: Date.now() + 500 };
            target.click();
            show('given', e);
        }, 90);
    }, true);
    document.addEventListener('pointercancel', gone, true);
    // A late click from the browser for a tap the board has already given: not twice.
    document.addEventListener('click', (e) => {
        if (!given || !e.isTrusted || Date.now() > given.until || !given.target.contains(e.target)) { return; }
        given = null;
        e.preventDefault(); e.stopImmediatePropagation();
    }, true);

    // --- A long press --------------------------------------------------------------------------------------------
    // With a finger, no menu of the browser (copy, save the picture…), except in what is written.
    document.addEventListener('contextmenu', (e) => {
        if ((lastType === 'touch' || lastType === 'pen') && !(e.target.closest && e.target.closest(FIELD))) { e.preventDefault(); }
    });

    // --- The test of the screen ----------------------------------------------------------------------------------
    let show = () => {};
    if (!/(?:^#|&)toques(?:&|$)/.test(location.hash)) { return; }
    const layer = document.createElement('div');
    layer.className = 'ct-toques';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `<div class="ct-toques-panel"><strong>${t('tq_title')}</strong><span data-n></span><small>${t('tq_hint')}</small><ol data-log></ol></div>`;
    const rings = new Map(), log = [];
    const paint = () => {
        layer.querySelector('[data-n]').textContent = t('tq_count', down.size);
        layer.querySelector('[data-log]').innerHTML = log.map((x) => `<li>${x}</li>`).join('');
        // A circle for each touch the screen thinks is down, where it last was.
        [...rings.keys()].filter((id) => !down.has(id)).forEach((id) => { rings.get(id).remove(); rings.delete(id); });
        down.forEach((p, id) => {
            if (!rings.has(id)) { const r = document.createElement('i'); layer.append(r); rings.set(id, r); }
            const r = rings.get(id);
            r.style.left = `${p.x}px`; r.style.top = `${p.y}px`;
            r.classList.toggle('viejo', Date.now() - p.t > 4000);
            r.textContent = p.primary ? '1' : '2';
        });
    };
    show = (what, e) => {
        const sign = { down: '↓', up: '↑', cancel: '✕', given: '✓' }[what];
        log.unshift(what === 'given' ? `${sign} ${t('tq_given')}` : `${sign} #${e.pointerId}${e.isPrimary ? '' : ' (2)'}`);
        log.length = Math.min(log.length, 8);
        paint();
    };
    document.addEventListener('pointermove', (e) => {
        const p = down.get(e.pointerId);
        if (p) { p.x = e.clientX; p.y = e.clientY; paint(); }
    }, true);
    setInterval(paint, 1000);
    const start = () => { document.body.append(layer); paint(); };
    if (document.body) { start(); } else { document.addEventListener('DOMContentLoaded', start); }
})();
