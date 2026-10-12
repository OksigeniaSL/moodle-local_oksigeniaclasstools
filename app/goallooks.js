// The looks of the class goal (goal.js), besides the jar of marbles: each one fills with the points of the whole class
// and teaches something on the way. The critter's path (counting, and counting in twos or fives with a big goal), the
// plant that grows (its life cycle), the rocket through the solar system (the order of the planets), the song note by
// note (reading music; at the goal it plays) and the mosaic that uncovers a picture (fractions and percentages). Each
// one is drawn in an SVG from how far the class has got.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const f1 = (x) => Number(x).toFixed(1);
    // A seeded random, so that the same goal always looks the same.
    const seeded = (seed) => {
        let a = [...String(seed)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 1779033703);
        return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    };
    // How many steps a goal is drawn with (a step may be worth more than one point when the goal is big).
    const stepsOf = (target, most) => { const per = Math.max(1, Math.ceil(target / most)); return { per, cap: Math.ceil(target / per) }; };

    // --- The critter's path ---------------------------------------------------------------------------------------
    // Squares in a snake from the bottom left, numbered (in twos, fives… when each one is worth more than a point), and
    // the critter of the class on the square it has reached; the last one, the goal.
    const camino = ({ points, target, seed, t }) => {
        const { per, cap } = stepsOf(target, 50);
        const at = Math.min(cap, Math.floor(points / per));
        const cols = Math.min(10, Math.max(4, Math.ceil(Math.sqrt(cap * 1.6)))), rows = Math.ceil(cap / cols);
        const x0 = 40, x1 = 312, y0 = 14, y1 = 226;
        const cw = (x1 - x0) / cols, ch = (y1 - y0) / rows, s = Math.min(cw, ch) * 0.84;
        const centre = (i) => {
            const r = Math.floor(i / cols), c = r % 2 ? cols - 1 - (i % cols) : i % cols;
            return [x0 + cw * (c + 0.5), y1 - ch * (r + 0.5)];
        };
        const start = [x0 - cw * 0.45 - 4, y1 - ch * 0.5];
        const COLOURS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fecdd3', '#e9d5ff'];
        const out = [];
        out.push(`<path class="ct-gl-senda" d="M${f1(start[0])} ${f1(start[1])}${Array.from({ length: cap }, (_, i) => { const [x, y] = centre(i); return ` L${f1(x)} ${f1(y)}`; }).join('')}"/>`);
        out.push(`<circle class="ct-gl-salida" cx="${f1(start[0])}" cy="${f1(start[1])}" r="${f1(Math.min(14, s * 0.42))}"/>`
            + `<text class="ct-gl-num" x="${f1(start[0])}" y="${f1(start[1])}">0</text>`);
        for (let i = 0; i < cap; i++) {
            const [x, y] = centre(i), last = i === cap - 1, n = last ? target : (i + 1) * per;
            out.push(`<rect class="ct-gl-casilla${i < at ? ' hecha' : ''}${last ? ' meta' : ''}" x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${f1(s)}" height="${f1(s)}" rx="${f1(s * 0.18)}"`
                + `${i < at && !last ? ` fill="${COLOURS[i % COLOURS.length]}"` : ''}/>`);
            out.push(last ? `<text class="ct-gl-num meta" x="${f1(x)}" y="${f1(y - s * 0.18)}">★</text><text class="ct-gl-num" x="${f1(x)}" y="${f1(y + s * 0.22)}" style="font-size:${f1(s * 0.3)}px">${n}</text>`
                : `<text class="ct-gl-num" x="${f1(x)}" y="${f1(y)}" style="font-size:${f1(Math.min(14, s * 0.42))}px">${n}</text>`);
        }
        // The critter, on its square.
        const [cx, cy] = at ? centre(at - 1) : start, size = s * 1.05;
        const C = window.ClasstoolsCritter;
        if (C) { out.push(C.svg('meta:' + seed).replace('<svg ', `<svg x="${f1(cx - size / 2)}" y="${f1(cy - size * 0.78)}" width="${f1(size)}" height="${f1(size)}" `)); }
        return { viewBox: '0 0 320 240', html: out.join(''), caption: per > 1 ? t('gl_skip', per) : '' };
    };

    // --- The plant that grows ---------------------------------------------------------------------------------------
    // From the seed in the soil to the fruit: germinates, seedling, grows, flowers and bears fruit, with its name.
    const STAGES = [[0, 'seed'], [0.05, 'germ'], [0.2, 'seedling'], [0.4, 'grows'], [0.75, 'flower'], [1, 'fruit']];
    const planta = ({ points, target, t }) => {
        const p = Math.min(1, points / target), stage = STAGES.filter(([k]) => p >= k).pop()[1];
        const soil = 196, out = [];
        out.push('<path class="ct-gl-maceta" d="M52 196 H148 L138 236 H62 Z"/><rect class="ct-gl-borde" x="46" y="186" width="108" height="14" rx="4"/>');
        out.push(`<ellipse class="ct-gl-tierra" cx="100" cy="${soil - 2}" rx="50" ry="6"/>`);
        if (stage === 'seed') {
            out.push(`<ellipse class="ct-gl-semilla" cx="100" cy="${soil + 10}" rx="9" ry="6"/>`);
        } else {
            // Roots under the soil, and the stem growing with the points.
            const top = soil - 10 - p * 132;
            out.push(`<path class="ct-gl-raiz" d="M100 ${soil} q-8 14 -18 22 M100 ${soil} q2 16 -2 30 M100 ${soil} q10 12 18 20"/>`);
            out.push(`<path class="ct-gl-tallo" d="M100 ${soil} C 96 ${f1((soil + top) / 2)} 104 ${f1((soil + top) / 2)} 100 ${f1(top)}"/>`);
            const leaf = (y, side, k) => `<path class="ct-gl-hoja" d="M100 ${f1(y)} q${side * 22 * k} ${-14 * k} ${side * 38 * k} ${-4 * k} q${-side * 16 * k} ${12 * k} ${-side * 38 * k} ${4 * k} Z"/>`;
            if (stage === 'germ') { out.push(leaf(top + 2, -1, 0.35), leaf(top + 2, 1, 0.35)); }
            if (stage !== 'germ') {
                // Leaves along the stem, more as it grows.
                const pairs = Math.max(1, Math.round(p * 5));
                for (let i = 0; i < pairs; i++) {
                    const y = soil - 18 - ((soil - 18 - (top + 14)) * i) / Math.max(1, pairs - 1 || 1), k = 0.55 + 0.45 * (i / Math.max(1, pairs));
                    out.push(leaf(y, i % 2 ? 1 : -1, k), leaf(y - 6, i % 2 ? -1 : 1, k * 0.85));
                }
            }
            if (stage === 'flower') {
                out.push(Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return `<ellipse class="ct-gl-petalo" cx="${f1(100 + Math.cos(a) * 11)}" cy="${f1(top + Math.sin(a) * 11)}" rx="9" ry="6" transform="rotate(${f1((a * 180) / Math.PI)} ${f1(100 + Math.cos(a) * 11)} ${f1(top + Math.sin(a) * 11)})"/>`; }).join('')
                    + `<circle class="ct-gl-centro" cx="100" cy="${f1(top)}" r="7"/>`);
            }
            if (stage === 'fruit') {
                out.push(`<circle class="ct-gl-fruto" cx="100" cy="${f1(top + 6)}" r="16"/><path class="ct-gl-rabito" d="M100 ${f1(top - 10)} q4 -6 10 -6"/>`
                    + `<path class="ct-gl-brillo" d="M92 ${f1(top - 2)} q-3 6 0 12"/>`);
            }
        }
        return { viewBox: '0 0 200 240', html: out.join(''), caption: t('gl_plant_' + stage) };
    };

    // --- The rocket through the solar system --------------------------------------------------------------------------
    // The planets in their order (not to scale), and the rocket from the Earth to Neptune; on passing a planet, a fact.
    const PLANETS = [['mercury', 4, '#b8b3a8'], ['venus', 6, '#e6c27a'], ['earth', 6.5, '#3b82c4'], ['mars', 5, '#c8553d'],
        ['jupiter', 13, '#d9a066'], ['saturn', 11, '#e8d28b'], ['uranus', 8, '#8fd3de'], ['neptune', 8, '#3f63c9']];
    const cohete = ({ points, target, seed, t }) => {
        const p = Math.min(1, points / target), R = seeded('estrellas:' + seed), line = 160, out = [];
        // Everything inside the window of space (the Sun is only its edge).
        out.push('<clipPath id="gl-espacio"><rect width="320" height="240" rx="14"/></clipPath><g clip-path="url(#gl-espacio)">');
        out.push('<rect class="ct-gl-espacio" x="0" y="0" width="320" height="240" rx="14"/>');
        for (let i = 0; i < 46; i++) { out.push(`<circle class="ct-gl-estrella" cx="${f1(R() * 320)}" cy="${f1(R() * 240)}" r="${f1(0.4 + R() * 1.1)}"/>`); }
        out.push(`<circle class="ct-gl-sol" cx="-26" cy="${line}" r="44"/><text class="ct-gl-escala" x="310" y="16">${esc(t('gl_pl_scale'))}</text>`);
        const xs = PLANETS.map((_, i) => 30 + i * 38.5);
        out.push(`<path class="ct-gl-orbita" d="M18 ${line} H312"/>`);
        // The asteroid belt, between Mars and Jupiter.
        for (let i = 0; i < 9; i++) { out.push(`<circle class="ct-gl-asteroide" cx="${f1(xs[3] + 14 + R() * 10)}" cy="${f1(line - 16 + R() * 32)}" r="${f1(0.8 + R())}"/>`); }
        PLANETS.forEach(([id, r, colour], i) => {
            if (id === 'saturn') { out.push(`<ellipse class="ct-gl-anillo" cx="${xs[i]}" cy="${line}" rx="${r * 1.8}" ry="${r * 0.5}"/>`); }
            out.push(`<circle cx="${xs[i]}" cy="${line}" r="${r}" fill="${colour}"/>`);
            out.push(`<text class="ct-gl-planeta" x="${xs[i]}" y="${line + 24 + (i % 2) * 11}">${esc(t('gl_pl_' + id))}</text>`);
        });
        // The rocket, from the Earth outwards, with its trail.
        const from = xs[2], to = xs[7], x = from + p * (to - from), y = line - 38;
        out.push(`<path class="ct-gl-estela" d="M${f1(from)} ${line - 10} Q${f1((from + x) / 2)} ${y + 6} ${f1(x - 14)} ${y}"/>`);
        out.push(`<g transform="translate(${f1(x)} ${y}) rotate(90)"><path class="ct-gl-cohete" d="M0 -16 C7 -10 7 4 5 10 H-5 C-7 4 -7 -10 0 -16 Z"/>`
            + '<circle class="ct-gl-ventana" cx="0" cy="-3" r="3"/><path class="ct-gl-aleta" d="M-5 6 L-10 14 L-5 11 Z M5 6 L10 14 L5 11 Z"/>'
            + '<path class="ct-gl-fuego" d="M-3 11 Q0 22 3 11 Z"/></g>');
        // The last planet passed, and its fact.
        const passed = PLANETS.map((pl, i) => [pl[0], xs[i]]).filter(([, px], i) => i >= 2 && px <= x + 0.5).pop();
        out.push('</g>');
        const caption = p >= 1 ? t('gl_pl_done') : passed[0] === 'earth' ? t('gl_pl_start') : `${t('gl_pl_' + passed[0])}: ${t('gl_fact_' + passed[0])}`;
        return { viewBox: '0 0 320 240', html: out.join(''), caption };
    };

    // --- The song, note by note -------------------------------------------------------------------------------------------
    // A song of the score, written note by note on a staff as the points come (each note with its name); the ones
    // still to come, as faint circles. At the goal, the board plays it.
    const songNotes = (song) => (song && song.notes ? song.notes.filter((n) => !n.r).slice(0, 32) : []);
    const cancion = ({ points, target, song, t }) => {
        const S = window.ClasstoolsScore, notes = songNotes(song), out = [];
        if (!notes.length) { return { viewBox: '0 0 320 240', html: '', caption: t('gl_no_song') }; }
        const shown = Math.min(notes.length, Math.floor((points / target) * notes.length + 1e-9));
        const perRow = Math.min(16, notes.length), rows = Math.ceil(notes.length / perRow), g = 9;
        out.push(`<text class="ct-gl-titulo" x="160" y="22">${esc(song.title || '')}</text>`);
        for (let r = 0; r < rows; r++) {
            const base = 92 + r * 104;   // the bottom line (E4) of each staff
            for (let l = 0; l < 5; l++) { out.push(`<path class="ct-gl-linea" d="M16 ${base - l * g} H306"/>`); }
            out.push(`<text class="ct-gl-clave" x="18" y="${base + 2}">𝄞</text>`);
            notes.slice(r * perRow, (r + 1) * perRow).forEach((n, k) => {
                const i = r * perRow + k, x = 52 + k * (250 / Math.max(1, perRow - 1 || 1)), y = base - (n.s - 30) * (g / 2);
                if (i < shown) {
                    // Ledger lines below or above the staff (only for the notes written: they would tell the pitch).
                    for (let s = 28; s >= n.s; s -= 2) { out.push(`<path class="ct-gl-linea" d="M${f1(x - 8)} ${f1(base - (s - 30) * (g / 2))} H${f1(x + 8)}"/>`); }
                    for (let s = 40; s <= n.s; s += 2) { out.push(`<path class="ct-gl-linea" d="M${f1(x - 8)} ${f1(base - (s - 30) * (g / 2))} H${f1(x + 8)}"/>`); }
                    const open = n.t >= 8, up = n.s < 34;
                    out.push(`<ellipse class="ct-gl-nota${open ? ' blanca' : ''}" cx="${f1(x)}" cy="${f1(y)}" rx="5.2" ry="3.8" transform="rotate(-20 ${f1(x)} ${f1(y)})"/>`);
                    if (n.t < 16) { out.push(`<path class="ct-gl-plica" d="M${f1(up ? x + 4.8 : x - 4.8)} ${f1(y)} V${f1(up ? y - 26 : y + 26)}"/>`); }
                    if (n.a) { out.push(`<text class="ct-gl-alter" x="${f1(x - 11)}" y="${f1(y + 3)}">${n.a > 0 ? '♯' : '♭'}</text>`); }
                    out.push(`<text class="ct-gl-nombre" x="${f1(x)}" y="${base + 22}">${esc(S ? S.noteName(n.s) : '')}</text>`);
                } else {
                    out.push(`<circle class="ct-gl-falta" cx="${f1(x)}" cy="${f1(base - 2 * g)}" r="3.4"/>`);
                }
            });
        }
        return { viewBox: `0 0 320 ${rows > 1 ? 240 : 140}`, html: out.join(''), caption: t('gl_notes', { n: shown, of: notes.length }) };
    };

    // --- The mosaic that uncovers a picture ----------------------------------------------------------------------------
    // A picture under as many tiles as steps, in rows and columns (the fraction uncovered is the fraction of the goal),
    // uncovered in an order of their own. Two pictures drawn here, or one of the teacher's (kept only in this browser).
    const grid = (n) => {
        let best = [n, 1];
        for (let r = 1; r <= n; r++) {
            if (n % r) { continue; }
            const c = n / r;
            if (c >= r && Math.abs(c / r - 4 / 3) < Math.abs(best[0] / best[1] - 4 / 3)) { best = [c, r]; }
        }
        return best;
    };
    const PICTURES = {
        paisaje: '<defs><linearGradient id="gl-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb36b"/><stop offset=".55" stop-color="#ff7e7e"/><stop offset="1" stop-color="#7b6cd9"/></linearGradient></defs>'
            + '<rect width="320" height="240" fill="url(#gl-cielo)"/><circle cx="214" cy="118" r="34" fill="#ffe6a3"/>'
            + '<path d="M0 150 L60 92 L104 136 L160 70 L222 140 L268 104 L320 146 V240 H0 Z" fill="#46327a"/>'
            + '<path d="M0 176 L44 150 L92 172 L150 140 L206 178 L262 152 L320 174 V240 H0 Z" fill="#2c2160"/>'
            + '<rect y="196" width="320" height="44" fill="#3b6fb6"/><path d="M40 208 H120 M150 218 H250 M70 228 H180" stroke="#9cc3f0" stroke-width="3" stroke-linecap="round"/>',
        mar: '<defs><linearGradient id="gl-agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd0e0"/><stop offset="1" stop-color="#0e4f8a"/></linearGradient></defs>'
            + '<rect width="320" height="240" fill="url(#gl-agua)"/><path d="M0 214 Q80 196 160 212 T320 206 V240 H0 Z" fill="#e9c98f"/>'
            + '<path d="M40 214 q-6 -40 6 -70 M52 214 q4 -34 -4 -60 M270 212 q-8 -44 4 -78 M282 212 q6 -30 -2 -54" stroke="#2f9e5b" stroke-width="5" fill="none" stroke-linecap="round"/>'
            + '<g transform="translate(130 110)"><path d="M0 0 q30 -26 62 0 q-32 26 -62 0 Z" fill="#ff8a3d"/><path d="M60 0 l20 -16 v32 Z" fill="#ff8a3d"/><circle cx="14" cy="-4" r="4" fill="#fff"/><circle cx="14" cy="-4" r="2" fill="#13294b"/><path d="M26 -14 v28 M40 -14 v28" stroke="#fff" stroke-width="4"/></g>'
            + '<g transform="translate(60 70) scale(.7)"><path d="M0 0 q30 -26 62 0 q-32 26 -62 0 Z" fill="#ffd23f"/><path d="M60 0 l20 -16 v32 Z" fill="#ffd23f"/><circle cx="14" cy="-4" r="4" fill="#13294b"/></g>'
            + '<g fill="#fff" opacity=".7"><circle cx="230" cy="80" r="5"/><circle cx="240" cy="62" r="3.5"/><circle cx="234" cy="46" r="2.5"/></g>'
            + '<path d="M232 196 l10 -14 l10 14 l-6 -2 l-4 8 l-4 -8 Z" fill="#e8546b"/>',
    };
    const mosaico = ({ points, target, seed, picture, image, t }) => {
        const { per, cap } = stepsOf(target, 120);
        const shown = Math.min(cap, Math.floor(points / per)), [cols, rows] = grid(cap), w = 320 / cols, h = 240 / rows;
        const R = seeded('mosaico:' + seed + ':' + cap), order = Array.from({ length: cap }, (_, i) => i);
        for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
        const open = new Set(order.slice(0, shown));
        const pic = picture === 'mia' && image ? `<image href="${esc(image)}" width="320" height="240" preserveAspectRatio="xMidYMid slice"/>` : (PICTURES[picture] || PICTURES.paisaje);
        const tiles = [];
        for (let i = 0; i < cap; i++) {
            if (open.has(i)) { continue; }
            const x = (i % cols) * w, y = Math.floor(i / cols) * h;
            tiles.push(`<rect class="ct-gl-pieza" x="${f1(x + 0.6)}" y="${f1(y + 0.6)}" width="${f1(w - 1.2)}" height="${f1(h - 1.2)}" rx="2"/>`);
        }
        return { viewBox: '0 0 320 240', html: `<clipPath id="gl-marco"><rect width="320" height="240" rx="12"/></clipPath><g clip-path="url(#gl-marco)">${pic}${tiles.join('')}</g>`
            + '<rect class="ct-gl-marco" width="320" height="240" rx="12"/>', caption: t('gl_tiles', { n: shown, of: cap }), tiles: { cols, rows, cap, shown } };
    };

    window.ClasstoolsGoalLooks = { camino, planta, cohete, cancion, mosaico, songNotes, PICTURES: Object.keys(PICTURES), grid, stepsOf };
})();
