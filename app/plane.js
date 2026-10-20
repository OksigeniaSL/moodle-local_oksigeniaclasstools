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
 * A coordinate plane, among the materials: the first quadrant (Primary) or all four (from Secondary). «Points»: a tap
 * on a crossing puts a point (A, B, C…) with its coordinates; they can stay apart, be joined in a line or a shape, or
 * be the ends of vectors with their components; the coordinates can be hidden to ask where a point is. «Battleship»:
 * a hidden fleet on the crossings, and teams calling coordinates in turns: water, hit or sunk (a hit shoots again).
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { escape, save, load, play, announce } = core;
    const t = core.t;
    const NS = 'http://www.w3.org/2000/svg';
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const JOINS = ['none', 'line', 'shape', 'vectors'];
    const FLEET = [4, 3, 3, 2, 2, 1, 1];
    const TEAMS = [1, 2, 3, 4];
    const TEAM_COLOURS = ['#164281', '#ce1423', '#067e36', '#5b2fb8'];

    const panel = core.material.add('plano', t('mt_plane'), `
        <aside class="tarjeta ct-side">
            <div class="segmentos" role="radiogroup" aria-label="${escape(t('mt_plane'))}" id="pl-kind">
                <button type="button" role="radio" aria-checked="false" data-v="points">${escape(t('pl_points'))}</button>
                <button type="button" role="radio" aria-checked="false" data-v="fleet">${escape(t('pl_fleet'))}</button>
            </div>
            <p class="ante">${escape(t('pl_quadrants'))}</p>
            <div class="segmentos" role="radiogroup" aria-label="${escape(t('pl_quadrants'))}" id="pl-quad">
                <button type="button" role="radio" aria-checked="false" data-v="1">${escape(t('pl_quad_one'))}</button>
                <button type="button" role="radio" aria-checked="false" data-v="4">${escape(t('pl_quad_four'))}</button>
            </div>
            <div class="ct-pl-box" id="pl-points-box">
                <label class="campo apilado"><span>${escape(t('pl_join'))}</span><select id="pl-join">
                    ${JOINS.map((j) => `<option value="${j}">${escape(t('pl_join_' + j))}</option>`).join('')}
                </select></label>
                <label class="campo apilado"><span>${escape(t('pl_type'))}</span>
                    <span class="ct-row"><input type="text" id="pl-xy" placeholder="(3, 2)" autocomplete="off" spellcheck="false">
                    <button type="button" class="boton suave" id="pl-add">${escape(t('pl_add'))}</button></span></label>
                <label class="interruptor"><input type="checkbox" id="pl-hide"><span>${escape(t('pl_hide'))}</span></label>
                <button type="button" class="boton suave" id="pl-empty"><span data-icono="limpiar"></span><span>${escape(t('pl_empty'))}</span></button>
                <p class="nota">${escape(t('pl_help'))}</p>
            </div>
            <div class="ct-pl-box" id="pl-fleet-box">
                <p class="ante">${escape(t('pl_teams'))}</p>
                <div class="segmentos" role="radiogroup" aria-label="${escape(t('pl_teams'))}" id="pl-teams">
                    ${TEAMS.map((n) => `<button type="button" role="radio" aria-checked="false" data-v="${n}">${n}</button>`).join('')}
                </div>
                <label class="campo apilado"><span>${escape(t('pl_call'))}</span>
                    <span class="ct-row"><input type="text" id="pl-shot" placeholder="(3, 2)" autocomplete="off" spellcheck="false">
                    <button type="button" class="boton suave" id="pl-fire">${escape(t('pl_fire'))}</button></span></label>
                <button type="button" class="boton" id="pl-new"><span data-icono="otra"></span><span>${escape(t('pl_new_fleet'))}</span></button>
                <label class="interruptor"><input type="checkbox" id="pl-show"><span>${escape(t('pl_show_fleet'))}</span></label>
                <p class="nota">${escape(t('pl_fleet_help'))}</p>
            </div>
        </aside>
        <div class="tarjeta ct-stage ct-pl-stage">
            <div class="ct-pl-top">
                <p class="total ct-pl-msg" id="pl-msg" aria-live="polite"></p>
                <div class="ct-pl-score" id="pl-score"></div>
            </div>
            <svg class="ct-pl" id="pl-svg" role="img" aria-label="${escape(t('mt_plane'))}"></svg>
            <p class="nota ct-pl-list" id="pl-list"></p>
        </div>`, () => paint());
    const $ = (s) => panel.querySelector(s);
    const $$ = (s) => [...panel.querySelectorAll(s)];

    // Each screen mode starts with its own plane: the first quadrant in Primary, all four from Secondary.
    const byMode = core.byMode ? core.byMode('plano-modo', {
        early: { quad: 1 }, primary: { quad: 1 }, secondary: { quad: 4 }, advanced: { quad: 4 },
    }) : { get: () => ({}), set: () => {} };
    const st = Object.assign({ kind: 'points', quad: 1, join: 'none', hide: false, points: [], teams: 2, fleet: null, show: false },
        load('plano', {}), byMode.get());
    const keep = () => save('plano', st);
    const range = () => (Number(st.quad) === 4 ? [-6, 6] : [0, 10]);
    const inside = (x, y) => { const [a, b] = range(); return x >= a && x <= b && y >= a && y <= b; };
    const key = (x, y) => `${x},${y}`;
    // «(3, −2)», with a real minus sign.
    const num = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));
    const xy = (x, y) => `(${num(x)}, ${num(y)})`;
    // «(3, -2)», «3,-2», «3 −2» or «3;2»: two whole numbers.
    const parseXY = (text) => {
        const m = String(text || '').replace(/[−–]/g, '-').match(/^\s*\(?\s*(-?\d+)\s*[,; ]\s*(-?\d+)\s*\)?\s*$/);
        return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
    };

    // A fleet hidden on the crossings, in straight lines, not touching each other (not even at a corner).
    const newFleet = () => {
        const [a, b] = range(), taken = new Set(), ships = [];
        for (const size of FLEET) {
            for (let tries = 0; tries < 500; tries++) {
                const across = Math.random() < 0.5;
                const x = a + Math.floor(Math.random() * (b - a + 1 - (across ? size - 1 : 0)));
                const y = a + Math.floor(Math.random() * (b - a + 1 - (across ? 0 : size - 1)));
                const cells = Array.from({ length: size }, (_, i) => (across ? [x + i, y] : [x, y + i]));
                const near = cells.some(([cx, cy]) => [-1, 0, 1].some((dx) => [-1, 0, 1].some((dy) => taken.has(key(cx + dx, cy + dy)))));
                if (near) { continue; }
                cells.forEach(([cx, cy]) => taken.add(key(cx, cy)));
                ships.push(cells);
                break;
            }
        }
        return { ships, shots: {}, turn: 0, hits: TEAMS.map(() => 0), sunk: TEAMS.map(() => 0), over: false, quad: st.quad };
    };
    const shipAt = (x, y) => (st.fleet ? st.fleet.ships.findIndex((s) => s.some(([a, b]) => a === x && b === y)) : -1);
    const isSunk = (i) => st.fleet.ships[i].every(([x, y]) => st.fleet.shots[key(x, y)]);
    if (!st.fleet || !Array.isArray(st.fleet.ships) || st.fleet.quad !== st.quad) { st.fleet = newFleet(); }
    if (!Array.isArray(st.points)) { st.points = []; }
    st.points = st.points.filter((p) => p && Number.isInteger(p.x) && Number.isInteger(p.y) && inside(p.x, p.y));

    const el = (name, attrs, text) => {
        const n = document.createElementNS(NS, name);
        Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
        if (text !== undefined) { n.textContent = text; }
        return n;
    };
    // The plane: y goes up, so it is drawn at −y. Each crossing has a round target to tap.
    function paint() {
        const fleet = st.kind === 'fleet';
        $$('#pl-kind button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === st.kind)));
        $$('#pl-quad button').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.v) === Number(st.quad))));
        $$('#pl-teams button').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.v) === Number(st.teams))));
        $('#pl-points-box').hidden = fleet;
        $('#pl-fleet-box').hidden = !fleet;
        $('#pl-join').value = st.join;
        $('#pl-hide').checked = !!st.hide;
        $('#pl-show').checked = !!st.show;
        const [a, b] = range(), svg = $('#pl-svg'), pad = 1.2;
        svg.setAttribute('viewBox', `${a - pad} ${-b - pad} ${b - a + 2 * pad} ${b - a + 2 * pad}`);
        svg.innerHTML = '';
        const g = (cls) => svg.appendChild(el('g', { class: cls }));
        const grid = g('ct-pl-grid');
        for (let i = a; i <= b; i++) {
            grid.appendChild(el('line', { x1: i, y1: -a, x2: i, y2: -b, class: i === 0 ? 'eje' : '' }));
            grid.appendChild(el('line', { x1: a, y1: -i, x2: b, y2: -i, class: i === 0 ? 'eje' : '' }));
        }
        const labels = g('ct-pl-labels');
        for (let i = a; i <= b; i++) {
            const y0 = a < 0 ? 0 : a, x0 = a < 0 ? 0 : a;
            if (i !== 0 || a === 0) { labels.appendChild(el('text', { x: i, y: -y0 + 0.62, 'text-anchor': 'middle' }, num(i))); }
            if (i !== 0) { labels.appendChild(el('text', { x: x0 - 0.3, y: -i + 0.14, 'text-anchor': 'end' }, num(i))); }
        }
        labels.appendChild(el('text', { x: b + 0.55, y: (a < 0 ? 0 : -a) + 0.14, class: 'eje-nombre' }, 'x'));
        labels.appendChild(el('text', { x: (a < 0 ? 0 : a) + 0.25, y: -b - 0.5, class: 'eje-nombre' }, 'y'));
        if (fleet) { paintFleet(g('ct-pl-fleet')); } else { paintPoints(g('ct-pl-points')); }
        // The targets go on top, one for each crossing.
        const targets = g('ct-pl-targets');
        for (let x = a; x <= b; x++) {
            for (let y = a; y <= b; y++) {
                targets.appendChild(el('circle', { cx: x, cy: -y, r: 0.42, 'data-x': x, 'data-y': y, tabindex: -1 }));
            }
        }
        paintText();
    }
    function paintPoints(layer) {
        const pts = st.points;
        if (pts.length > 1 && st.join !== 'none') {
            if (st.join === 'vectors') {
                pts.slice(1).forEach((p, i) => {
                    const q = pts[i], dx = p.x - q.x, dy = p.y - q.y, len = Math.hypot(dx, dy) || 1;
                    const ux = dx / len, uy = dy / len, tip = 0.35;
                    layer.appendChild(el('line', { x1: q.x, y1: -q.y, x2: p.x - ux * tip, y2: -(p.y - uy * tip), class: 'vector' }));
                    const hx = p.x - ux * tip, hy = p.y - uy * tip;
                    layer.appendChild(el('path', { class: 'punta', d: `M${p.x} ${-p.y}L${hx - uy * 0.2} ${-(hy + ux * 0.2)}L${hx + uy * 0.2} ${-(hy - ux * 0.2)}Z` }));
                    layer.appendChild(el('text', { x: (q.x + p.x) / 2 + uy * 0.45, y: -((q.y + p.y) / 2 - ux * 0.45), class: 'componentes', 'text-anchor': 'middle' }, xy(dx, dy)));
                });
            } else {
                const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${-p.y}`).join('') + (st.join === 'shape' && pts.length > 2 ? 'Z' : '');
                layer.appendChild(el('path', { d, class: st.join === 'shape' ? 'figura' : 'linea' }));
            }
        }
        pts.forEach((p, i) => {
            layer.appendChild(el('circle', { cx: p.x, cy: -p.y, r: 0.2, class: 'punto' }));
            const name = LETTERS[i % 26] + (i >= 26 ? Math.floor(i / 26) : '');
            layer.appendChild(el('text', { x: p.x + 0.25, y: -p.y - 0.25, class: 'nombre' }, st.hide ? name : name + xy(p.x, p.y)));
        });
    }
    function paintFleet(layer) {
        const f = st.fleet;
        f.ships.forEach((ship, i) => {
            const sunk = isSunk(i);
            if (!(sunk || st.show)) { return; }
            const [x1, y1] = ship[0], [x2, y2] = ship[ship.length - 1];
            layer.appendChild(el('rect', { x: Math.min(x1, x2) - 0.38, y: -Math.max(y1, y2) - 0.38, width: Math.abs(x2 - x1) + 0.76,
                height: Math.abs(y2 - y1) + 0.76, rx: 0.38, class: sunk ? 'barco hundido' : 'barco' }));
        });
        Object.entries(f.shots).forEach(([k, s]) => {
            const [x, y] = k.split(',').map(Number);
            if (s.hit) {
                layer.appendChild(el('circle', { cx: x, cy: -y, r: 0.3, class: 'tocado', style: `--c:${TEAM_COLOURS[s.team]}` }));
            } else {
                layer.appendChild(el('circle', { cx: x, cy: -y, r: 0.22, class: 'agua' }));
            }
        });
    }
    // The line above: whose turn and what the last shot was; the teams' hits; the points, as a list.
    function paintText() {
        const f = st.fleet;
        if (st.kind === 'fleet') {
            const left = f.ships.filter((s, i) => !isSunk(i)).length;
            $('#pl-msg').textContent = f.over ? t('pl_all_sunk') : (f.last || t('pl_turn', f.turn + 1));
            $('#pl-score').innerHTML = TEAMS.slice(0, st.teams).map((n, i) => `<span class="ct-pl-team${!f.over && i === f.turn ? ' activo' : ''}" style="--c:${TEAM_COLOURS[i]}">${escape(t('pl_team', n))} · ${f.hits[i]}</span>`).join('')
                + `<span class="ct-pl-left">${escape(t('pl_left', left))}</span>`;
            $('#pl-list').textContent = '';
        } else {
            $('#pl-msg').textContent = '';
            $('#pl-score').innerHTML = '';
            $('#pl-list').textContent = st.hide ? '' : st.points.map((p, i) => LETTERS[i % 26] + xy(p.x, p.y)).join('   ');
        }
    }

    const togglePoint = (x, y) => {
        const i = st.points.findIndex((p) => p.x === x && p.y === y);
        if (i >= 0) { st.points.splice(i, 1); } else if (st.points.length < 52) { st.points.push({ x, y }); }
        keep(); paint(); play('tic');
    };
    const fire = (x, y) => {
        const f = st.fleet;
        if (f.over || !inside(x, y)) { return; }
        if (f.shots[key(x, y)]) { f.last = t('pl_again', xy(x, y)); paintText(); play('wrong'); return; }
        const ship = shipAt(x, y), team = f.turn % st.teams;
        f.shots[key(x, y)] = { hit: ship >= 0, team };
        if (ship < 0) {
            f.last = t('pl_water', xy(x, y));
            f.turn = (team + 1) % st.teams;
            play('tic');
        } else {
            f.hits[team] += 1;
            const sunk = isSunk(ship);
            if (sunk) { f.sunk[team] += 1; }
            f.last = t(sunk ? 'pl_sunk' : 'pl_hit', xy(x, y));
            f.over = f.ships.every((s, i) => isSunk(i));
            play(f.over ? 'elegido' : (sunk ? 'fin' : 'card'));
        }
        announce(f.over ? t('pl_all_sunk') : f.last);
        keep(); paint();
    };

    $('#pl-svg').addEventListener('click', (e) => {
        const c = e.target.closest('circle[data-x]');
        if (!c) { return; }
        const x = Number(c.dataset.x), y = Number(c.dataset.y);
        if (st.kind === 'fleet') { fire(x, y); } else { togglePoint(x, y); }
    });
    const seg = (sel, fn) => $(sel).addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (b) { fn(b.dataset.v); keep(); paint(); play('tic'); } });
    seg('#pl-kind', (v) => { st.kind = v; });
    seg('#pl-quad', (v) => {
        st.quad = Number(v); byMode.set({ quad: st.quad });
        st.points = st.points.filter((p) => inside(p.x, p.y));
        st.fleet = newFleet();
    });
    seg('#pl-teams', (v) => { st.teams = Number(v); st.fleet.turn = st.fleet.turn % st.teams; });
    $('#pl-join').addEventListener('change', () => { st.join = JOINS.includes($('#pl-join').value) ? $('#pl-join').value : 'none'; keep(); paint(); });
    $('#pl-hide').addEventListener('change', () => { st.hide = $('#pl-hide').checked; keep(); paint(); });
    $('#pl-show').addEventListener('change', () => { st.show = $('#pl-show').checked; keep(); paint(); });
    $('#pl-empty').addEventListener('click', () => { st.points = []; keep(); paint(); });
    $('#pl-new').addEventListener('click', () => { st.fleet = newFleet(); st.show = false; keep(); paint(); play('card'); });
    const typed = (input, then) => {
        const p = parseXY($(input).value);
        if (!p || !inside(p.x, p.y)) {
            const [a, b] = range();
            $('#pl-msg').textContent = t('pl_bad', { a: num(a), b: num(b) }); play('wrong'); return;
        }
        $(input).value = '';
        then(p.x, p.y);
    };
    $('#pl-add').addEventListener('click', () => typed('#pl-xy', (x, y) => { if (!st.points.some((p) => p.x === x && p.y === y)) { togglePoint(x, y); } }));
    $('#pl-fire').addEventListener('click', () => typed('#pl-shot', fire));
    ['#pl-xy', '#pl-shot'].forEach((sel) => $(sel).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); $(sel === '#pl-xy' ? '#pl-add' : '#pl-fire').click(); }
    }));
    document.addEventListener('classtools:mode', () => {
        const v = byMode.get(), quad = Number(v.quad) === 4 ? 4 : 1;
        if (quad !== Number(st.quad)) { st.quad = quad; st.points = st.points.filter((p) => inside(p.x, p.y)); st.fleet = newFleet(); }
        keep(); paint();
    });
    paint();

    window.ClasstoolsPlane = { state: () => st, fire, parseXY, isSunk };   // for automated tests
})();
