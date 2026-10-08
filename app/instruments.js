// Instruments of the full board, laid over it: a ruler, the two set squares (the 45° one and the 30°-60° one), a
// protractor and a compass. They move by dragging them and turn from their round handle (snapping every 15°); the pen
// goes straight along their edges; the protractor has an arm that reads the angle, and the pen follows its arm and
// its base line too; the compass opens from its leg, turns from its top and draws circles and arcs from its pencil.
// And two things to show: the curtain, which covers the board and uncovers it from any side, and the spotlight, which
// leaves only a circle lit. Ideas from OpenBoard (GPL 3), written anew for the web.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, board = window.ClasstoolsWhiteboard;
    if (!core || !board || !board.kit) { return; }
    const kit = board.kit, { t, escape, setIcon } = core;
    const NS = 'http://www.w3.org/2000/svg';
    const CM = 0.6 / 31;   // the instruments' centimetre, in board units: the ruler has 30 of them
    const RULER = { L: 31 * CM, h: 0.075 };
    // The set squares: the two legs (the right angle at the corner), and where their handles go.
    const SQUARES = {
        square: { legs: [0.34, 0.34], turn: [0.224, -0.026], close: [0.022, -0.27], flip: [0.022, -0.075] },
        bevel: { legs: [0.4, 0.4 * Math.tan(Math.PI / 6)], turn: [0.264, -0.026], close: [0.02, -0.171], flip: [0.022, -0.075] },
    };
    const PROT = { R: 0.2, hole: 0.115, base: 0.03 };
    const LEG = 0.22;   // each leg of the compass
    const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
    const lang = document.documentElement.lang || undefined;

    // The buttons, in the second row of the full board.
    const KINDS = [['ruler', 'regla'], ['square', 'escuadra'], ['bevel', 'cartabon'], ['protractor', 'transportador'], ['compass', 'compas']];
    const SHOWS = [['curtain', 'cortina'], ['spot', 'foco']];
    kit.bar.innerHTML = [...KINDS, ...SHOWS].map(([k, icon], i) => `${i === KINDS.length ? '<span class="ct-wb-sep" aria-hidden="true"></span>' : ''}`
        + `<button type="button" class="boton suave ct-wb-redo" data-in="${k}" aria-pressed="false" aria-label="${escape(t('in_' + k))}" title="${escape(t('in_' + k))}"><span data-icono="${icon}"></span></button>`).join('');
    kit.bar.querySelectorAll('[data-icono]').forEach((e) => setIcon(e, e.dataset.icono));

    const el = (name, attrs = {}, parent = null) => {
        const e = document.createElementNS(NS, name);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        if (parent) { parent.append(e); }
        return e;
    };
    const svg = el('svg', { class: 'ct-wb-inst', 'aria-hidden': 'true' });
    const tip = el('text', { class: 'ct-in-tip' }, svg);   // the angle or the radius while it changes
    kit.stage.append(svg);
    const items = [];

    // From the instrument to the board and back (turned by a degrees, and mirrored if m is -1).
    const toBoard = (o, [lx, ly]) => {
        const c = Math.cos(rad(o.a)), s = Math.sin(rad(o.a)), x = lx * (o.m || 1);
        return [o.x + x * c - ly * s, o.y + x * s + ly * c];
    };
    const toLocal = (o, [bx, by]) => {
        const c = Math.cos(rad(o.a)), s = Math.sin(rad(o.a)), dx = bx - o.x, dy = by - o.y;
        return [(dx * c + dy * s) * (o.m || 1), -dx * s + dy * c];
    };

    // --- Drawing them ---------------------------------------------------------------------------------------
    const num = (n) => n.toFixed(5);
    const CROSS = 'M-.42 -.42L.42 .42M.42 -.42L-.42 .42';
    const TURN = 'M.5 0A.5 .5 0 1 1 0 -.5M0 -.5L-.05 -.82M0 -.5L.3 -.4';
    const FLIP = 'M-.6 0H.6M-.6 0L-.32 -.24M-.6 0L-.32 .24M.6 0L.32 -.24M.6 0L.32 .24';
    const knob = (g, act, [x, y], r, mark) => {
        const k = el('g', { class: `ct-in-knob ct-in-${act}`, 'data-act': act, transform: `translate(${num(x)} ${num(y)})` }, g);
        el('circle', { r }, k);
        if (mark) { el('path', { d: mark, transform: `scale(${r})` }, k); }
        return k;
    };
    const label = (g, x, y, text, size, m = 1, cls = 'ct-in-num') => {
        const h = el('g', { transform: `translate(${num(x)} ${num(y)}) scale(${m} 1)` }, g);
        el('text', { class: cls, 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, h).textContent = text;
    };
    const path = (pts) => `M${pts.map(([x, y]) => `${num(x)} ${num(y)}`).join('L')}Z`;
    const build = {
        ruler(o, g) {
            const { L, h } = RULER;
            el('rect', { class: 'ct-in-body', 'data-act': 'move', x: 0, y: 0, width: L, height: h, rx: 0.004 }, g);
            let d = '';
            for (let i = 0; i <= 300; i++) { d += `M${num(CM / 2 + (i * CM) / 10)} 0V${i % 10 === 0 ? 0.018 : (i % 5 === 0 ? 0.012 : 0.007)}`; }
            el('path', { class: 'ct-in-ticks', d }, g);
            for (let i = 0; i <= 30; i++) { label(g, CM / 2 + i * CM, 0.031, String(i), 0.0105); }
            knob(g, 'close', [0.03, 0.054], 0.011, CROSS);
            knob(g, 'turn', [L - 0.03, 0.054], 0.013, TURN);
        },
        square(o, g) {
            const sq = SQUARES[o.kind], [lx, ly] = sq.legs, c = Math.hypot(lx, ly), r = (lx + ly - c) / 2;
            // The see-through middle, like a real one (it can be drawn through).
            const inner = [[0, 0], [lx, 0], [0, -ly]].map(([x, y]) => [r + 0.42 * (x - r), -r + 0.42 * (y + r)]);
            el('path', { class: 'ct-in-body', 'data-act': 'move', 'fill-rule': 'evenodd', d: path([[0, 0], [lx, 0], [0, -ly]]) + path(inner) }, g);
            // Centimetres along the long leg, as far as there is room.
            const end = lx * (1 - 0.032 / ly);
            let d = '';
            for (let i = 0; 0.008 + (i * CM) / 10 < end; i++) { d += `M${num(0.008 + (i * CM) / 10)} 0V${-(i % 10 === 0 ? 0.014 : (i % 5 === 0 ? 0.009 : 0.005))}`; }
            el('path', { class: 'ct-in-ticks', d }, g);
            for (let i = 0; 0.008 + i * CM < end; i++) {
                const x = 0.008 + i * CM;
                if (Math.abs(x - sq.turn[0]) > 0.022) { label(g, x, -0.024, String(i), 0.009, o.m); }
            }
            knob(g, 'close', sq.close, 0.011, CROSS);
            knob(g, 'flip', sq.flip, 0.011, FLIP);
            knob(g, 'turn', sq.turn, 0.013, TURN);
        },
        protractor(o, g) {
            const { R, hole, base } = PROT;
            el('path', { class: 'ct-in-body', 'data-act': 'move', 'fill-rule': 'evenodd', d: `M${-R} ${base}L${-R} 0A${R} ${R} 0 0 1 ${R} 0L${R} ${base}Z M${-hole} 0A${hole} ${hole} 0 0 1 ${hole} 0Z` }, g);
            let d = `M-0.012 0H0.012M0 -0.012V${base * 0.6}M${-R} 0H${-hole}M${hole} 0H${R}`;
            for (let k = 0; k <= 180; k++) {
                const len = k % 10 === 0 ? 0.022 : (k % 5 === 0 ? 0.015 : 0.008), c = Math.cos(rad(k)), s = -Math.sin(rad(k));
                d += `M${num(R * c)} ${num(R * s)}L${num((R - len) * c)} ${num((R - len) * s)}`;
            }
            el('path', { class: 'ct-in-ticks', d }, g);
            for (let k = 0; k <= 180; k += 10) {
                const c = Math.cos(rad(k)), s = -Math.sin(rad(k));
                label(g, (R - 0.036) * c, (R - 0.036) * s, String(k), 0.0105);
                label(g, (R - 0.06) * c, (R - 0.06) * s, String(180 - k), 0.0082, 1, 'ct-in-num ct-in-num2');
            }
            // The arm that reads the angle.
            const c = Math.cos(rad(o.arm)), s = -Math.sin(rad(o.arm));
            el('path', { class: 'ct-in-armline', d: `M0 0L${num((R + 0.05) * c)} ${num((R + 0.05) * s)}` }, g);
            knob(g, 'arm', [(R + 0.036) * c, (R + 0.036) * s], 0.014);
            label(g, 0, -0.05, `${o.arm}°`, 0.03, 1, 'ct-in-read');
            knob(g, 'close', [-R + 0.03, base / 2], 0.011, CROSS);
            knob(g, 'turn', [R - 0.03, base / 2], 0.012, TURN);
        },
        compass(o, g) {
            // Seen from above: the needle where it stands, the pencil at its radius, and the top between them.
            const half = o.r / 2, h = Math.sqrt(Math.max(0, LEG * LEG - half * half)), c = Math.cos(rad(o.a)), s = Math.sin(rad(o.a));
            const tipAt = [o.r * c, o.r * s], top = [half * c + s * h, half * s - c * h];
            if (o.guide) { el('circle', { class: 'ct-in-guide', r: o.r }, g); }
            el('path', { class: 'ct-in-leg', d: `M0 0L${num(top[0])} ${num(top[1])}` }, g);
            el('path', { class: 'ct-in-leg ct-in-leg2', d: `M${num(top[0])} ${num(top[1])}L${num(tipAt[0])} ${num(tipAt[1])}` }, g);
            knob(g, 'needle', [0, 0], 0.013);
            el('circle', { class: 'ct-in-point', r: 0.003 }, g);
            knob(g, 'open', [top[0] + 0.72 * (tipAt[0] - top[0]), top[1] + 0.72 * (tipAt[1] - top[1])], 0.011);
            knob(g, 'pencil', tipAt, 0.015);
            knob(g, 'hinge', top, 0.017, TURN);
            knob(g, 'close', [top[0] + s * 0.042, top[1] - c * 0.042], 0.011, CROSS);
        },
    };
    build.bevel = build.square;
    // Where each turns around, and the edges the pen follows (n: outwards; mid: a line to draw on, not an edge).
    const pivot = (o) => {
        if (o.kind === 'ruler') { return [RULER.L / 2, RULER.h / 2]; }
        if (SQUARES[o.kind]) { const [lx, ly] = SQUARES[o.kind].legs; return [lx / 3, -ly / 3]; }
        return [0, 0];
    };
    const edges = (o) => {
        if (o.kind === 'ruler') { return [{ a: [0, 0], b: [RULER.L, 0], n: [0, -1] }, { a: [0, RULER.h], b: [RULER.L, RULER.h], n: [0, 1] }]; }
        if (SQUARES[o.kind]) {
            const [lx, ly] = SQUARES[o.kind].legs, c = Math.hypot(lx, ly);
            return [{ a: [0, 0], b: [lx, 0], n: [0, 1] }, { a: [0, 0], b: [0, -ly], n: [-1, 0] }, { a: [lx, 0], b: [0, -ly], n: [ly / c, -lx / c] }];
        }
        if (o.kind === 'protractor') {
            const { R, base } = PROT, len = R + 0.06;
            return [{ a: [-R, base], b: [R, base], n: [0, 1] }, { a: [-R, 0], b: [R, 0], mid: true },
                { a: [0, 0], b: [len * Math.cos(rad(o.arm)), -len * Math.sin(rad(o.arm))], mid: true }];
        }
        return [];
    };
    const place = (o) => {
        const [sx, sy] = kit.toScreen([o.x, o.y]), u = kit.unit();
        if (o.kind === 'compass') {
            o.g.replaceChildren(); build.compass(o, o.g);
            o.g.setAttribute('transform', `translate(${sx.toFixed(2)} ${sy.toFixed(2)}) scale(${u.toFixed(3)})`);
            return;
        }
        if (o.kind === 'protractor') { o.g.replaceChildren(); build.protractor(o, o.g); }
        o.g.setAttribute('transform', `translate(${sx.toFixed(2)} ${sy.toFixed(2)}) rotate(${o.a.toFixed(2)}) scale(${(u * (o.m || 1)).toFixed(3)} ${u.toFixed(3)})`);
    };
    const paintButtons = () => {
        kit.bar.querySelectorAll('[data-in]').forEach((b) => {
            const k = b.dataset.in;
            const on = k === 'curtain' ? !curtain.hidden : (k === 'spot' ? !spot.hidden : items.some((o) => o.kind === k));
            b.setAttribute('aria-pressed', String(on)); b.classList.toggle('activo', on);
        });
    };
    const create = (kind) => {
        // Each in a place of its own, around the middle of what is on screen.
        const [cx, cy] = kit.middle(), [ox, oy] = { ruler: [0, -0.1], square: [-0.24, 0.03], bevel: [-0.2, 0.06], protractor: [0.2, 0.04], compass: [0.3, 0.02] }[kind];
        const [mx, my] = [cx + ox, cy + oy];
        const o = { kind, x: mx, y: my, a: 0, m: 1 };
        if (kind === 'ruler') { o.x = mx - RULER.L / 2; o.y = my - RULER.h / 2; }
        if (SQUARES[kind]) { const [lx, ly] = SQUARES[kind].legs; o.x = mx - lx / 3; o.y = my + ly / 3; }
        if (kind === 'protractor') { o.y = my + PROT.R / 2; o.arm = 60; }
        if (kind === 'compass') { o.r = 0.12; o.x = mx - 0.06; o.y = my + 0.06; }
        o.g = el('g', { class: `ct-in ct-in-is-${kind}` });
        svg.insertBefore(o.g, tip);
        if (build[kind] && kind !== 'compass' && kind !== 'protractor') { build[kind](o, o.g); }
        items.push(o); place(o); paintButtons();
    };
    const remove = (o) => { o.g.remove(); items.splice(items.indexOf(o), 1); paintButtons(); };

    // --- Handling them --------------------------------------------------------------------------------------
    const here = (e) => { const r = kit.stage.getBoundingClientRect(); return kit.toBoard(e.clientX - r.left, e.clientY - r.top); };
    const showTip = (e, text) => {
        const r = kit.stage.getBoundingClientRect();
        tip.textContent = text;
        tip.setAttribute('x', Math.min(r.width - 70, e.clientX - r.left + 22)); tip.setAttribute('y', Math.max(24, e.clientY - r.top - 22));
        tip.classList.add('visto');
    };
    const cm = (r) => `${(r / CM).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm`;
    let drag = null;
    svg.addEventListener('pointerdown', (e) => {
        const h = e.target.closest('[data-act]');
        const o = h && items.find((x) => x.g === h.closest('.ct-in'));
        if (!o || e.button > 0) { return; }
        e.preventDefault(); e.stopPropagation();
        // (Captured by the layer, not the handle: the protractor and the compass are drawn again as they move.)
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* it still moves */ }
        svg.insertBefore(o.g, tip);   // on top of the others
        const p = here(e), act = h.dataset.act;
        drag = { o, act, id: e.pointerId, p0: p, x: o.x, y: o.y, a: o.a, moved: false };
        if (act === 'turn') { drag.pl = pivot(o); drag.pb = toBoard(o, drag.pl); }
        if (act === 'pencil') {
            o.guide = true; drag.s = kit.begin([o.x + o.r * Math.cos(rad(o.a)), o.y + o.r * Math.sin(rad(o.a))]);
            place(o); showTip(e, cm(o.r));
        }
        if (act === 'open') { o.guide = true; place(o); showTip(e, cm(o.r)); }
    });
    svg.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) { return; }
        const { o, act } = drag, p = here(e);
        if (Math.hypot(p[0] - drag.p0[0], p[1] - drag.p0[1]) * kit.unit() > 4) { drag.moved = true; }
        if (act === 'move' || act === 'needle') {
            o.x = drag.x + p[0] - drag.p0[0]; o.y = drag.y + p[1] - drag.p0[1];
        } else if (act === 'turn') {
            const [px, py] = drag.pb;
            let a = drag.a + deg(Math.atan2(p[1] - py, p[0] - px) - Math.atan2(drag.p0[1] - py, drag.p0[0] - px));
            const near = Math.round(a / 15) * 15;
            if (Math.abs(a - near) < 2.5) { a = near; }
            o.a = a;
            // Turning around its middle: the corner moves so the middle stays.
            const c = Math.cos(rad(a)), s = Math.sin(rad(a)), lx = drag.pl[0] * (o.m || 1), ly = drag.pl[1];
            o.x = px - (lx * c - ly * s); o.y = py - (lx * s + ly * c);
            // The angle as it is read (anticlockwise from the horizontal; a ruler, up to 180°).
            const shown = ((Math.round(-a) % 360) + 360) % 360;
            showTip(e, `${o.kind === 'ruler' ? shown % 180 : shown}°`);
        } else if (act === 'arm') {
            const q = toLocal(o, p);
            let a = Math.round(deg(Math.atan2(-q[1], q[0])));
            if (a < 0) { a = a < -90 ? 180 : 0; }
            o.arm = Math.max(0, Math.min(180, a));
        } else if (act === 'hinge') {
            o.a = deg(Math.atan2(p[1] - o.y, p[0] - o.x));
        } else if (act === 'open') {
            o.r = Math.max(0.01, Math.min(2 * LEG * 0.98, Math.hypot(p[0] - o.x, p[1] - o.y)));
            o.a = deg(Math.atan2(p[1] - o.y, p[0] - o.x));
            showTip(e, cm(o.r));
        } else if (act === 'pencil') {
            // The pencil follows the finger around the needle, a little at a time so the arc stays round.
            let to = deg(Math.atan2(p[1] - o.y, p[0] - o.x)), d = to - o.a;
            while (d > 180) { d -= 360; }
            while (d < -180) { d += 360; }
            to = o.a + d;
            const steps = Math.max(1, Math.ceil(Math.abs(d) / 2)), pts = [];
            for (let i = 1; i <= steps; i++) {
                const a = o.a + (d * i) / steps;
                pts.push([o.x + o.r * Math.cos(rad(a)), o.y + o.r * Math.sin(rad(a))]);
            }
            o.a = to;
            if (pts.length) { kit.extend(drag.s, pts); }
        }
        place(o);
    });
    const release = (e) => {
        if (!drag || e.pointerId !== drag.id) { return; }
        const { o, act, moved } = drag;
        drag = null;
        tip.classList.remove('visto');
        if (act === 'close' && !moved) { remove(o); return; }
        if (act === 'flip' && !moved) {
            // Turned over, around its middle.
            const pl = pivot(o), pb = toBoard(o, pl);
            o.m = -(o.m || 1);
            const c = Math.cos(rad(o.a)), s = Math.sin(rad(o.a)), lx = pl[0] * o.m, ly = pl[1];
            o.x = pb[0] - (lx * c - ly * s); o.y = pb[1] - (lx * s + ly * c);
            o.g.replaceChildren(); build[o.kind](o, o.g);
        }
        if (o.guide) { o.guide = false; }
        place(o);
    };
    svg.addEventListener('pointerup', (e) => {
        if (drag && drag.act === 'pencil' && e.pointerId === drag.id) { kit.end(drag.s); drag.s = null; }
        release(e);
    });
    svg.addEventListener('pointercancel', (e) => {
        if (drag && drag.act === 'pencil' && e.pointerId === drag.id) { kit.end(drag.s); drag.s = null; }
        release(e);
    });

    // The pen along an edge: the nearest edge just outside where the stroke starts. The protractor's base line and
    // arm meet at its centre: a stroke that starts there begins exactly on it and follows the one it heads along.
    const project = (c, p, gap) => {
        const q = toLocal(c.o, p), along = Math.max(0, Math.min(c.len, (q[0] - c.ed.a[0]) * c.ux + (q[1] - c.ed.a[1]) * c.uy));
        return toBoard(c.o, [c.ed.a[0] + c.ux * along + c.n[0] * gap, c.ed.a[1] + c.uy * along + c.n[1] * gap]);
    };
    kit.snapper((at, w) => {
        const tol = 26 / kit.unit(), near = [];
        items.forEach((item) => {
            const o = { ...item };
            edges(o).forEach((ed) => {
                const q = toLocal(o, at), dx = ed.b[0] - ed.a[0], dy = ed.b[1] - ed.a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
                const n = ed.n || [-uy, ux];
                const along = (q[0] - ed.a[0]) * ux + (q[1] - ed.a[1]) * uy, off = (q[0] - ed.a[0]) * n[0] + (q[1] - ed.a[1]) * n[1];
                if (along >= -tol && along <= len + tol && (ed.mid ? Math.abs(off) <= tol * 0.7 : off >= -0.006 && off <= tol)) {
                    near.push({ off: Math.abs(off), o, ed, ux, uy, n, len });
                }
            });
        });
        if (!near.length) { return null; }
        near.sort((a, b) => a.off - b.off);
        const lines = near.filter((c) => c.ed.mid && c.o === near[0].o);
        if (!near[0].ed.mid || lines.length < 2) { const c = near[0], gap = c.ed.mid ? 0 : w / 2; return (p) => project(c, p, gap); }
        const o = near[0].o, centre = toBoard(o, [0, 0]);
        const start = Math.hypot(at[0] - centre[0], at[1] - centre[1]) <= tol ? centre : project(near[0], at, 0);
        let chosen = null;
        return (p) => {
            if (!chosen) {
                if (Math.hypot(p[0] - at[0], p[1] - at[1]) * kit.unit() < 16) { return start; }
                // The line it heads along: the nearest to where the finger is now.
                chosen = lines.map((c) => {
                    const q = toLocal(o, p);
                    return [Math.abs((q[0] - c.ed.a[0]) * c.n[0] + (q[1] - c.ed.a[1]) * c.n[1]), c];
                }).sort((a, b) => a[0] - b[0])[0][1];
            }
            return project(chosen, p, 0);
        };
    });

    // --- The curtain ----------------------------------------------------------------------------------------
    // It covers the whole board; each side is pulled from its handle, and the curtain moves by dragging it.
    const curtain = document.createElement('div');
    curtain.className = 'ct-wb-cortina'; curtain.hidden = true;
    curtain.innerHTML = ['n', 's', 'w', 'e'].map((k) => `<span class="ct-cort-borde ${k}" data-edge="${k}"><i></i></span>`).join('')
        + `<button type="button" class="ct-wb-cerrar" aria-label="${escape(t('in_close'))}" title="${escape(t('in_close'))}"><span data-icono="cerrar"></span></button>`;
    kit.stage.append(curtain);
    let cv = { l: 0, t: 0, r: 1, b: 1 }, cdrag = null;
    const paintCurtain = () => Object.assign(curtain.style, { left: `${cv.l * 100}%`, top: `${cv.t * 100}%`, width: `${(cv.r - cv.l) * 100}%`, height: `${(cv.b - cv.t) * 100}%` });
    curtain.addEventListener('pointerdown', (e) => {
        if (e.button > 0 || e.target.closest('.ct-wb-cerrar')) { return; }
        e.preventDefault();
        try { curtain.setPointerCapture(e.pointerId); } catch (err) { /* it still moves */ }
        const edge = e.target.closest('[data-edge]');
        cdrag = { edge: edge ? edge.dataset.edge : 'move', x: e.clientX, y: e.clientY, from: { ...cv }, id: e.pointerId };
    });
    curtain.addEventListener('pointermove', (e) => {
        if (!cdrag || e.pointerId !== cdrag.id) { return; }
        const r = kit.stage.getBoundingClientRect(), dx = (e.clientX - cdrag.x) / r.width, dy = (e.clientY - cdrag.y) / r.height, f = cdrag.from, MIN = 0.04;
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
        if (cdrag.edge === 'n') { cv.t = clamp(f.t + dy, 0, f.b - MIN); }
        if (cdrag.edge === 's') { cv.b = clamp(f.b + dy, f.t + MIN, 1); }
        if (cdrag.edge === 'w') { cv.l = clamp(f.l + dx, 0, f.r - MIN); }
        if (cdrag.edge === 'e') { cv.r = clamp(f.r + dx, f.l + MIN, 1); }
        if (cdrag.edge === 'move') {
            const mx = clamp(dx, -f.l, 1 - f.r), my = clamp(dy, -f.t, 1 - f.b);
            cv = { l: f.l + mx, r: f.r + mx, t: f.t + my, b: f.b + my };
        }
        paintCurtain();
    });
    const curtainUp = (e) => { if (cdrag && e.pointerId === cdrag.id) { cdrag = null; } };
    curtain.addEventListener('pointerup', curtainUp);
    curtain.addEventListener('pointercancel', curtainUp);
    curtain.querySelector('.ct-wb-cerrar').addEventListener('click', () => { curtain.hidden = true; paintButtons(); });

    // --- The spotlight --------------------------------------------------------------------------------------
    // Everything dark but a circle. Dragging the dark moves it; its handle (or the wheel) makes it bigger or smaller.
    const spot = document.createElement('div');
    spot.className = 'ct-wb-foco'; spot.hidden = true;
    spot.innerHTML = `<div class="ct-foco-sombra"></div><div class="ct-foco-aro"></div><span class="ct-foco-tam" aria-hidden="true"></span>
        <button type="button" class="ct-wb-cerrar" aria-label="${escape(t('in_close'))}" title="${escape(t('in_close'))}"><span data-icono="cerrar"></span></button>`;
    kit.stage.append(spot);
    let sp = { x: 0.5, y: 0.45, r: 0.15 }, sdrag = null;
    const paintSpot = () => {
        if (spot.hidden) { return; }
        const W = kit.stage.clientWidth, H = kit.stage.clientHeight, cx = sp.x * W, cy = sp.y * H, R = sp.r * W;
        spot.querySelector('.ct-foco-sombra').style.clipPath = `path(evenodd, "M0 0H${W}V${H}H0Z M${cx - R} ${cy}A${R} ${R} 0 1 0 ${cx + R} ${cy}A${R} ${R} 0 1 0 ${cx - R} ${cy}Z")`;
        Object.assign(spot.querySelector('.ct-foco-aro').style, { left: `${cx - R}px`, top: `${cy - R}px`, width: `${2 * R}px`, height: `${2 * R}px` });
        Object.assign(spot.querySelector('.ct-foco-tam').style, { left: `${cx + R * 0.7071}px`, top: `${cy + R * 0.7071}px` });
        const close = spot.querySelector('.ct-wb-cerrar');
        Object.assign(close.style, { left: `${Math.min(W - 52, cx + R * 0.7071)}px`, top: `${Math.max(8, cy - R * 0.7071 - 44)}px` });
    };
    spot.addEventListener('pointerdown', (e) => {
        const what = e.target.closest('.ct-foco-sombra') ? 'move' : (e.target.closest('.ct-foco-tam') ? 'size' : '');
        if (!what || e.button > 0) { return; }
        e.preventDefault();
        try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* it still moves */ }
        sdrag = { what, x: e.clientX, y: e.clientY, from: { ...sp }, id: e.pointerId };
    });
    spot.addEventListener('pointermove', (e) => {
        if (!sdrag || e.pointerId !== sdrag.id) { return; }
        const r = kit.stage.getBoundingClientRect();
        if (sdrag.what === 'move') {
            sp.x = Math.max(0, Math.min(1, sdrag.from.x + (e.clientX - sdrag.x) / r.width));
            sp.y = Math.max(0, Math.min(1, sdrag.from.y + (e.clientY - sdrag.y) / r.height));
        } else {
            sp.r = Math.max(0.04, Math.min(0.6, Math.hypot(e.clientX - r.left - sp.x * r.width, e.clientY - r.top - sp.y * r.height) / r.width));
        }
        paintSpot();
    });
    const spotUp = (e) => { if (sdrag && e.pointerId === sdrag.id) { sdrag = null; } };
    spot.addEventListener('pointerup', spotUp);
    spot.addEventListener('pointercancel', spotUp);
    spot.addEventListener('wheel', (e) => {
        if (!e.target.closest('.ct-foco-sombra')) { return; }
        e.preventDefault(); e.stopPropagation();
        sp.r = Math.max(0.04, Math.min(0.6, sp.r * Math.exp(-e.deltaY * 0.0015)));
        paintSpot();
    }, { passive: false });
    spot.querySelector('.ct-wb-cerrar').addEventListener('click', () => { spot.hidden = true; paintButtons(); });
    [curtain, spot].forEach((x) => x.querySelectorAll('[data-icono]').forEach((e) => setIcon(e, e.dataset.icono)));

    // --- The buttons, and following the board ---------------------------------------------------------------
    kit.bar.addEventListener('click', (e) => {
        const b = e.target.closest('[data-in]');
        if (!b) { return; }
        const k = b.dataset.in;
        if (k === 'curtain') { cv = { l: 0, t: 0, r: 1, b: 1 }; curtain.hidden = !curtain.hidden; paintCurtain(); } else if (k === 'spot') {
            spot.hidden = !spot.hidden; paintSpot();
        } else {
            const there = items.find((o) => o.kind === k);
            if (there) { remove(there); } else { create(k); }
        }
        paintButtons();
    });
    kit.onView(() => { items.forEach(place); paintSpot(); });
    kit.onFull(() => {
        if (kit.full()) { return; }
        items.slice().forEach(remove);
        curtain.hidden = true; spot.hidden = true;
        paintButtons();
    });
    paintCurtain();
    paintButtons();

    // For automated tests.
    window.ClasstoolsInstruments = { items: () => items, create, remove, curtain: () => cv, spot: () => sp };
})();
