// Scratch to reveal: a silver layer over a result (who it is, the groups, a die) that is scratched away with a
// finger or the mouse, like a scratch card. Once about half of it is gone it uncovers by itself; «Reveal» does it at
// once (also from the keyboard).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const t = core ? core.t : (k) => k;

    /**
     * Covers an element. Returns { reveal(), done() }.
     * @param {HTMLElement} el What to cover (it gets position: relative if it had none).
     * @param {{label?: string, onReveal?: function}} opts The word on the layer, and what to do when it is uncovered.
     */
    const cover = (el, opts = {}) => {
        const old = el.querySelector(':scope > .ct-rasca');
        if (old) { old.remove(); }
        if (getComputedStyle(el).position === 'static') { el.classList.add('ct-rasca-sitio'); }
        const wrap = document.createElement('div');
        wrap.className = 'ct-rasca';
        wrap.style.borderRadius = getComputedStyle(el).borderRadius;
        const c = document.createElement('canvas');
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'ct-rasca-destapa'; b.textContent = t('rs_reveal');
        wrap.append(c, b);
        el.append(wrap);
        const r = el.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
        const W = Math.max(1, r.width), H = Math.max(1, r.height);
        c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
        const g = c.getContext('2d');
        g.scale(dpr, dpr);
        // The silver of a scratch card: a sheen across and fine specks.
        const sheen = g.createLinearGradient(0, 0, W, H);
        sheen.addColorStop(0, '#aeb6c1'); sheen.addColorStop(0.42, '#eef1f5'); sheen.addColorStop(0.58, '#c2c8d1'); sheen.addColorStop(1, '#a3abb7');
        g.fillStyle = sheen; g.fillRect(0, 0, W, H);
        for (let i = 0; i < (W * H) / 70; i++) {
            g.fillStyle = Math.random() < 0.5 ? 'rgba(255, 255, 255, .45)' : 'rgba(80, 92, 108, .18)';
            g.fillRect(Math.random() * W, Math.random() * H, 1.3, 1.3);
        }
        const size = Math.max(13, Math.min(W / 6.5, H / 3.4));
        g.font = `900 ${size}px Nunito, system-ui, sans-serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = 'rgba(62, 72, 88, .55)';
        g.fillText((opts.label || t('rs_scratch')).toLocaleUpperCase(), W / 2, H / 2);

        let done = false, down = false, last = null, moves = 0;
        const brush = Math.max(18, Math.min(W, H) * 0.16);
        const at = (e) => { const q = c.getBoundingClientRect(); return [(e.clientX - q.left) * (W / q.width), (e.clientY - q.top) * (H / q.height)]; };
        const scratch = (p) => {
            g.globalCompositeOperation = 'destination-out';
            g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = brush;
            g.beginPath();
            const [x0, y0] = last || [p[0] - 0.1, p[1]];
            g.moveTo(x0, y0); g.lineTo(p[0], p[1]); g.stroke();
            last = p;
        };
        // How much is gone, looking at one pixel in every few.
        const cleared = () => {
            const d = g.getImageData(0, 0, c.width, c.height).data;
            let gone = 0, seen = 0;
            for (let i = 3; i < d.length; i += 4 * 23) { seen++; if (d[i] < 100) { gone++; } }
            return seen ? gone / seen : 1;
        };
        const reveal = () => {
            if (done) { return; }
            done = true;
            wrap.classList.add('fuera');
            setTimeout(() => wrap.remove(), 450);
            if (opts.onReveal) { opts.onReveal(); }
        };
        c.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            down = true; last = null;
            try { c.setPointerCapture(e.pointerId); } catch (err) { /* it still scratches */ }
            scratch(at(e));
        });
        c.addEventListener('pointermove', (e) => {
            if (!down || done) { return; }
            scratch(at(e));
            if (++moves % 12 === 0 && cleared() > 0.55) { reveal(); }
        });
        const up = () => { if (down && !done && cleared() > 0.5) { reveal(); } down = false; last = null; };
        c.addEventListener('pointerup', up);
        c.addEventListener('pointercancel', up);
        b.addEventListener('click', reveal);
        return { reveal, done: () => done };
    };

    window.ClasstoolsScratch = { cover };
})();
