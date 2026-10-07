// A celebration for the whole class when something is done (a tangram figure, a game won, a lock opened): confetti
// over the stage, a glow on what was done and a big message on top, which stays until the teacher taps «Continue» (or
// «Again», if the tool offers it). With reduced motion there is only the message.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { t, escape, reducedMotion } = core;
    const COLOURS = ['#ce1423', '#fbbe17', '#067e36', '#164281', '#5b2fb8', '#ea7317', '#0e7c86', '#e85d9e'];
    let current = null;

    // How much confetti each screen mode gets: plenty for the youngest, none in «Advanced» (just the glow and message).
    const CONFETTI = { early: 220, primary: 160, secondary: 70, advanced: 0 };
    const confetti = (box, count) => {
        const canvas = document.createElement('canvas');
        canvas.className = 'ct-confetti';
        canvas.setAttribute('aria-hidden', 'true');
        box.append(canvas);
        const r = box.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        const W = r.width, H = r.height, size = Math.max(6, Math.min(W, H) / 60);
        // Two bursts from the lower corners, and a few pieces falling from the top.
        const parts = Array.from({ length: count }, (_, i) => {
            const fromLeft = i % 2 === 0, fall = i % 5 === 0;
            return {
                x: fall ? Math.random() * W : (fromLeft ? 0 : W), y: fall ? -20 : H * 0.85,
                vx: fall ? (Math.random() - 0.5) * 2 : (fromLeft ? 1 : -1) * (4 + Math.random() * 7),
                vy: fall ? 1 + Math.random() * 2 : -(9 + Math.random() * 9),
                w: size * (0.6 + Math.random()), h: size * (0.3 + Math.random() * 0.5),
                a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.3, c: COLOURS[i % COLOURS.length],
            };
        });
        const start = performance.now();
        const frame = (now) => {
            const time = now - start;
            ctx.clearRect(0, 0, W, H);
            ctx.globalAlpha = time > 2600 ? Math.max(0, 1 - (time - 2600) / 900) : 1;
            parts.forEach((p) => {
                p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
            });
            if (time < 3500 && canvas.isConnected) { requestAnimationFrame(frame); } else { canvas.remove(); }
        };
        requestAnimationFrame(frame);
    };

    /**
     * Celebrates inside a stage (an element with position: relative).
     *
     * @param {HTMLElement} stage Where the confetti and the message go.
     * @param {object} options title, text (optional), glow (elements that shine), again (label of a second button) and
     *     onAgain (what it does), onClose (when the message goes away).
     */
    core.celebrate = (stage, options = {}) => {
        if (!stage) { return; }
        if (current) { current.close(); }
        const { title = t('cel_done'), text = '', glow = [], again = '', onAgain = null, onClose = null } = options;
        const layer = document.createElement('div');
        layer.className = 'ct-celebra';
        layer.innerHTML = `<div class="ct-celebra-card" role="alertdialog" aria-live="assertive" aria-labelledby="ct-celebra-title">
                <p class="ct-celebra-title" id="ct-celebra-title">${escape(title)}</p>
                ${text ? `<p class="ct-celebra-text">${escape(text)}</p>` : ''}
                <div class="botonera centro">
                    ${again ? `<button type="button" class="boton grande ct-celebra-again">${escape(again)}</button>` : ''}
                    <button type="button" class="boton grande ${again ? 'suave' : ''} ct-celebra-close">${escape(t('cel_continue'))}</button>
                </div>
            </div>`;
        stage.append(layer);
        glow.forEach((el) => { if (el && el.classList) { el.classList.remove('ct-glow'); void el.getBoundingClientRect(); el.classList.add('ct-glow'); } });
        const count = CONFETTI[core.mode ? core.mode() : 'primary'] || 0;
        if (!reducedMotion() && count) { confetti(layer, count); }
        const close = () => {
            if (!layer.isConnected) { return; }
            layer.remove(); current = null;
            glow.forEach((el) => el && el.classList && el.classList.remove('ct-glow'));
            document.removeEventListener('keydown', onKey, true);
            if (onClose) { onClose(); }
        };
        const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(); } };
        document.addEventListener('keydown', onKey, true);
        layer.querySelector('.ct-celebra-close').addEventListener('click', close);
        const againButton = layer.querySelector('.ct-celebra-again');
        if (againButton) { againButton.addEventListener('click', () => { close(); if (onAgain) { onAgain(); } }); }
        (againButton || layer.querySelector('.ct-celebra-close')).focus({ preventScroll: true });
        current = { close };
        core.announce(text ? `${title} ${text}` : title);
        return current;
    };
})();
