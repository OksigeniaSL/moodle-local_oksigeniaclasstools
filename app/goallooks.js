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
    // A sandy path in a meadow, in a snake from the bottom left: squares numbered (in twos, fives… when each one is
    // worth more than a point), the tens a little stronger, the flag on the last one, and the critter of the class on
    // the square it has reached, with the number it stands on in a label at its feet.
    const camino = ({ points, target, seed, t }) => {
        const { per, cap } = stepsOf(target, 50);
        const at = Math.min(cap, Math.floor(points / per));
        const cols = Math.min(10, Math.max(4, Math.ceil(Math.sqrt(cap * 1.6)))), rows = Math.ceil(cap / cols);
        const x0 = 40, x1 = 312, y0 = 26, y1 = 226;
        const cw = (x1 - x0) / cols, ch = (y1 - y0) / rows, s = Math.min(cw, ch) * 0.84;
        const centre = (i) => {
            const r = Math.floor(i / cols), c = r % 2 ? cols - 1 - (i % cols) : i % cols;
            return [x0 + cw * (c + 0.5), y1 - ch * (r + 0.5)];
        };
        const start = [x0 - cw * 0.45 - 4, y1 - ch * 0.5];
        const COLOURS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fecdd3', '#e9d5ff'];
        const R = seeded('prado:' + seed), out = [];
        // The meadow, with tufts of grass where the path does not go.
        out.push('<rect class="ct-gl-prado" x="2" y="2" width="316" height="236" rx="16"/>');
        for (let i = 0; i < 14; i++) {
            const x = 10 + R() * 300, y = 12 + R() * 220, k = 0.8 + R() * 0.7;
            out.push(`<path class="ct-gl-hierba" d="M${f1(x)} ${f1(y)} q${f1(-1 * k)} ${f1(-5 * k)} ${f1(-4 * k)} ${f1(-7 * k)} M${f1(x)} ${f1(y)} q${f1(0.5 * k)} ${f1(-6 * k)} ${f1(1 * k)} ${f1(-9 * k)} M${f1(x)} ${f1(y)} q${f1(1.5 * k)} ${f1(-4 * k)} ${f1(5 * k)} ${f1(-6 * k)}"/>`);
        }
        const road = `M${f1(start[0])} ${f1(start[1])}${Array.from({ length: cap }, (_, i) => { const [x, y] = centre(i); return ` L${f1(x)} ${f1(y)}`; }).join('')}`;
        out.push(`<path class="ct-gl-senda-borde" d="${road}" style="stroke-width:${f1(s * 0.62)}px"/><path class="ct-gl-senda" d="${road}" style="stroke-width:${f1(s * 0.46)}px"/>`);
        // Where the path turns up to the next row, a chevron, so the order reads from the back of the class.
        for (let r = 0; r < rows - 1; r++) {
            const i = (r + 1) * cols - 1;
            if (i + 1 >= cap) { break; }
            const [x, ya] = centre(i), [, yb] = centre(i + 1), k = s / 24;
            out.push(`<path class="ct-gl-giro" d="M${f1(-4 * k)} ${f1(2.5 * k)} L0 ${f1(-2.5 * k)} L${f1(4 * k)} ${f1(2.5 * k)}" transform="translate(${f1(x)} ${f1((ya + yb) / 2)})"/>`);
        }
        out.push(`<circle class="ct-gl-salida" cx="${f1(start[0])}" cy="${f1(start[1])}" r="${f1(Math.min(14, s * 0.42))}"/>`
            + (at ? `<text class="ct-gl-num" x="${f1(start[0])}" y="${f1(start[1])}">0</text>` : ''));
        const label = (n) => Math.min(14, s * 0.42) * (String(n).length > 2 ? 0.86 : 1);
        for (let i = 0; i < cap; i++) {
            const [x, y] = centre(i), last = i === cap - 1, n = last ? target : (i + 1) * per, ten = n % 10 === 0, z = last ? s * 1.14 : s;
            // The colour goes in a style: a fill attribute would lose to the stylesheet.
            out.push(`<rect class="ct-gl-casilla${i < at ? ' hecha' : ''}${ten ? ' diez' : ''}${last ? ' meta' : ''}" x="${f1(x - z / 2)}" y="${f1(y - z / 2)}" width="${f1(z)}" height="${f1(z)}" rx="${f1(z * 0.18)}"`
                + `${i < at && !last ? ` style="fill:${COLOURS[i % COLOURS.length]}"` : ''}/>`);
            // The square the critter is on has its number in the critter's label.
            if (i === at - 1) { continue; }
            out.push(last ? `<text class="ct-gl-num meta" x="${f1(x)}" y="${f1(y - s * 0.16)}" style="font-size:${f1(s * 0.56)}px">★</text><text class="ct-gl-num" x="${f1(x)}" y="${f1(y + s * 0.3)}" style="font-size:${f1(s * 0.3)}px">${n}</text>`
                : `<text class="ct-gl-num${ten ? ' diez' : ''}" x="${f1(x)}" y="${f1(y)}" style="font-size:${f1(label(n) * (ten ? 1.12 : 1))}px">${n}</text>`);
        }
        // The flag on the last square.
        const [gx, gy] = centre(cap - 1), pole = gx + s * 0.4, top = gy - s * 1.18;
        out.push(`<path class="ct-gl-mastil" d="M${f1(pole)} ${f1(gy - s * 0.57)} V${f1(top)}"/>`
            + `<path class="ct-gl-bandera" d="M${f1(pole)} ${f1(top)} q${f1(s * 0.2)} ${f1(-s * 0.08)} ${f1(s * 0.42)} ${f1(s * 0.06)} q${f1(-s * 0.1)} ${f1(s * 0.1)} 0 ${f1(s * 0.24)} q${f1(-s * 0.22)} ${f1(-s * 0.12)} ${f1(-s * 0.42)} ${f1(-s * 0.06)} Z"/>`);
        // The critter, on its square, and the number it stands on (the square is under it).
        const [cx, cy] = at ? centre(at - 1) : start, size = s * 1.05;
        const C = window.ClasstoolsCritter;
        if (C) { out.push(C.svg('meta:' + seed).replace('<svg ', `<svg x="${f1(cx - size / 2)}" y="${f1(cy - size * 0.78)}" width="${f1(size)}" height="${f1(size)}" `)); }
        const here = at ? (at === cap ? target : at * per) : 0, bw = s * (String(here).length > 2 ? 0.78 : 0.6), bh = s * 0.36;
        out.push(`<rect class="ct-gl-aqui" x="${f1(cx - bw / 2)}" y="${f1(cy + s * 0.5 - bh * 0.55)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(bh / 2)}"/>`
            + `<text class="ct-gl-num aqui" x="${f1(cx)}" y="${f1(cy + s * 0.5 - bh * 0.05)}" style="font-size:${f1(bh * 0.72)}px">${here}</text>`);
        return { viewBox: '0 0 320 240', html: out.join(''), caption: per > 1 ? t('gl_skip', per) : '' };
    };

    // --- The plant that grows ---------------------------------------------------------------------------------------
    // From the seed in the soil to the fruit: germinates, seedling, grows, flowers and bears fruit. The pot is of glass,
    // so the seed and the roots are seen under the soil, and beside it the life cycle in a ring, with the stage the
    // class has got to marked (from the fruit, back to the seed).
    const STAGES = [[0, 'seed'], [0.05, 'germ'], [0.2, 'seedling'], [0.4, 'grows'], [0.75, 'flower'], [1, 'fruit']];
    // The small drawing of each stage, for the ring (centred on 0 0, some 24 units high).
    const MINI = {
        seed: '<ellipse class="ct-gl-semilla" cx="0" cy="2" rx="6.5" ry="4.5"/>',
        germ: '<ellipse class="ct-gl-semilla" cx="0" cy="6" rx="6" ry="4"/><path class="ct-gl-raiz" d="M0 9 q-1 4 1 8"/><path class="ct-gl-tallo fino" d="M0 3 q-1 -5 2 -9"/>',
        seedling: '<path class="ct-gl-tallo fino" d="M0 11 V-4"/><path class="ct-gl-hoja" d="M0 -3 q-6 -6 -10 -2 q5 3 10 2 Z M0 -3 q6 -6 10 -2 q-5 3 -10 2 Z"/>',
        grows: '<path class="ct-gl-tallo fino" d="M0 12 V-11"/><path class="ct-gl-hoja" d="M0 4 q-7 -5 -11 -1 q5 3 11 1 Z M0 -1 q7 -5 11 -1 q-5 3 -11 1 Z M0 -7 q-6 -5 -9 -1 q4 3 9 1 Z"/>',
        flower: '<path class="ct-gl-tallo fino" d="M0 12 V-3"/><path class="ct-gl-hoja" d="M0 6 q-7 -5 -10 -1 q5 3 10 1 Z"/>'
            + [0, 72, 144, 216, 288].map((a) => `<ellipse class="ct-gl-petalo" cx="0" cy="-10" rx="3.4" ry="5" transform="rotate(${a} 0 -5)"/>`).join('')
            + '<circle class="ct-gl-centro" cx="0" cy="-5" r="3"/>',
        fruit: '<path class="ct-gl-tallo fino" d="M0 -12 V-6"/><circle class="ct-gl-fruto" cx="0" cy="2" r="9"/><path class="ct-gl-caliz" d="M0 -7 l-5 -2 l3 3 l-4 2 l5 -1 l1 3 l1 -3 l5 1 l-4 -2 l3 -3 Z"/>',
    };
    const planta = ({ points, target, t }) => {
        const p = Math.min(1, points / target), k = STAGES.filter(([v]) => p >= v).length - 1, stage = STAGES[k][1];
        const soil = 184, px = 88, out = [];
        // The glass pot, and the soil seen through it.
        out.push('<clipPath id="gl-maceta"><path d="M36 180 H140 L128 232 H48 Z"/></clipPath>');
        out.push(`<g clip-path="url(#gl-maceta)"><rect class="ct-gl-tierra" x="24" y="${soil}" width="128" height="60"/>`
            + [[54, 200], [80, 214], [112, 196], [122, 220], [68, 226], [102, 228], [46, 214]].map(([x, y]) => `<circle class="ct-gl-grano" cx="${x}" cy="${y}" r="1.6"/>`).join('')
            + '</g>');
        if (stage === 'seed' || stage === 'germ') {
            out.push(`<ellipse class="ct-gl-semilla" cx="${px}" cy="${soil + 18}" rx="9" ry="6"/>`);
        }
        if (stage === 'germ') {
            out.push(`<path class="ct-gl-raiz" d="M${px} ${soil + 23} q-3 8 2 18"/><path class="ct-gl-tallo" d="M${px} ${soil + 13} q-4 -12 2 -24"/>`);
        }
        if (k >= 2) {
            // Roots under the soil (more with the plant), and the stem growing with the points.
            const top = soil - 10 - p * 136, deep = 18 + p * 26;
            out.push(`<path class="ct-gl-raiz" d="M${px} ${soil} q2 ${f1(deep * 0.5)} -2 ${f1(deep)} M${px} ${soil + 4} q-10 10 -20 ${f1(deep * 0.7)} M${px} ${soil + 4} q12 8 22 ${f1(deep * 0.65)}`
                + (k >= 3 ? ` M${px - 10} ${soil + 14} q-8 6 -10 16 M${px + 12} ${soil + 12} q8 6 8 16` : '') + '"/>');
            out.push(`<path class="ct-gl-tallo" d="M${px} ${soil} C ${px - 4} ${f1((soil + top) / 2)} ${px + 4} ${f1((soil + top) / 2)} ${px} ${f1(top)}"/>`);
            const leaf = (y, side, s) => `<path class="ct-gl-hoja" d="M${px} ${f1(y)} q${f1(side * 22 * s)} ${f1(-14 * s)} ${f1(side * 38 * s)} ${f1(-4 * s)} q${f1(-side * 16 * s)} ${f1(12 * s)} ${f1(-side * 38 * s)} ${f1(4 * s)} Z"/>`;
            // Leaves along the stem, more as it grows.
            const pairs = Math.max(1, Math.round(p * 5));
            for (let i = 0; i < pairs; i++) {
                const y = soil - 18 - ((soil - 18 - (top + 14)) * i) / Math.max(1, pairs - 1), s = 0.6 + 0.45 * (1 - i / Math.max(1, pairs));
                out.push(leaf(y, i % 2 ? 1 : -1, s), leaf(y - 6, i % 2 ? -1 : 1, s * 0.85));
            }
            if (stage === 'flower') {
                out.push(Array.from({ length: 7 }, (_, i) => `<ellipse class="ct-gl-petalo" cx="${px}" cy="${f1(top - 13)}" rx="7" ry="11" transform="rotate(${f1((i * 360) / 7)} ${px} ${f1(top)})"/>`).join('')
                    + `<circle class="ct-gl-centro" cx="${px}" cy="${f1(top)}" r="8"/>`);
            }
            if (stage === 'fruit') {
                out.push(`<circle class="ct-gl-fruto" cx="${px}" cy="${f1(top + 8)}" r="17"/>`
                    + `<path class="ct-gl-caliz" d="M${px} ${f1(top - 9)} l-9 -3 l5 5 l-7 4 l9 -2 l2 5 l2 -5 l9 2 l-7 -4 l5 -5 Z"/>`
                    + `<path class="ct-gl-brillo" d="M${px - 9} ${f1(top + 2)} q-3 6 0 12"/>`);
            }
        }
        // The glass over it all (the soil is seen through it), with its shine.
        out.push('<path class="ct-gl-vidrio" d="M36 180 H140 L128 232 H48 Z"/><rect class="ct-gl-vidrio borde" x="30" y="172" width="116" height="12" rx="5"/>'
            + '<path class="ct-gl-reflejo" d="M46 192 L54 224"/>');
        // The life cycle, in a ring: done, here and still to come, with the arrows going round.
        const rx = 236, ry = 116, rr = 58, node = 19;
        const at = (i) => { const a = -Math.PI / 2 + (i * Math.PI * 2) / 6; return [rx + rr * Math.cos(a), ry + rr * Math.sin(a)]; };
        out.push(`<circle class="ct-gl-ciclo" cx="${rx}" cy="${ry}" r="${rr}"/>`);
        for (let i = 0; i < 6; i++) {
            // An arrow head half way between this stage and the next, pointing round.
            const a = -Math.PI / 2 + ((i + 0.5) * Math.PI * 2) / 6, hx = rx + rr * Math.cos(a), hy = ry + rr * Math.sin(a), d = (a * 180) / Math.PI + 90;
            out.push(`<path class="ct-gl-flecha${i < k ? ' hecha' : ''}" d="M-4 -4.5 L3.5 0 L-4 4.5" transform="translate(${f1(hx)} ${f1(hy)}) rotate(${f1(d)})"/>`);
        }
        STAGES.forEach(([, id], i) => {
            const [x, y] = at(i), now = i === k;
            out.push(`<circle class="ct-gl-etapa${i < k ? ' hecha' : ''}${now ? ' ahora' : ''}" cx="${f1(x)}" cy="${f1(y)}" r="${now ? node + 3 : node}"/>`
                + `<g class="ct-gl-mini${i > k ? ' falta' : ''}" transform="translate(${f1(x)} ${f1(y)}) scale(${now ? 1.15 : 0.95})">${MINI[id]}</g>`);
        });
        return { viewBox: '0 0 320 240', html: out.join(''), caption: t('gl_plant_' + stage) };
    };

    // --- The rocket through the solar system --------------------------------------------------------------------------
    // The planets in their order (not to scale), and the rocket from the Earth to Neptune; on passing a planet, a fact.
    // The planet passed last is ringed, and the ones still to come are faint until the rocket gets there.
    const PLANETS = [['mercury', 4, '#b8b3a8'], ['venus', 6, '#e6c27a'], ['earth', 6.5, '#3b82c4'], ['mars', 5, '#c8553d'],
        ['jupiter', 13, '#d9a066'], ['saturn', 11, '#e8d28b'], ['uranus', 8, '#8fd3de'], ['neptune', 8, '#3f63c9']];
    const cohete = ({ points, target, seed, t }) => {
        const p = Math.min(1, points / target), R = seeded('estrellas:' + seed), line = 160, out = [];
        const xs = PLANETS.map((_, i) => 30 + i * 38.5);
        const from = xs[2], to = xs[7], x = from + p * (to - from), y = line - 40, rx = x - 14;
        // The last planet passed (from the Earth on).
        const last = PLANETS.reduce((n, _, i) => (i >= 2 && xs[i] <= x + 0.5 ? i : n), 2);
        // Everything inside the window of space (the Sun is only its edge).
        out.push('<clipPath id="gl-espacio"><rect width="320" height="240" rx="14"/></clipPath><g clip-path="url(#gl-espacio)">');
        out.push('<rect class="ct-gl-espacio" x="0" y="0" width="320" height="240" rx="14"/>');
        for (let i = 0; i < 46; i++) { out.push(`<circle class="ct-gl-estrella" cx="${f1(R() * 320)}" cy="${f1(R() * 240)}" r="${f1(0.4 + R() * 1.1)}"/>`); }
        out.push(`<circle class="ct-gl-sol" cx="-26" cy="${line}" r="44"/><text class="ct-gl-escala" x="310" y="16">${esc(t('gl_pl_scale'))}</text>`);
        out.push(`<path class="ct-gl-orbita" d="M18 ${line} H312"/>`);
        // The asteroid belt, between Mars and Jupiter.
        for (let i = 0; i < 9; i++) { out.push(`<circle class="ct-gl-asteroide" cx="${f1(xs[3] + 14 + R() * 10)}" cy="${f1(line - 16 + R() * 32)}" r="${f1(0.8 + R())}"/>`); }
        PLANETS.forEach(([id, r, colour], i) => {
            const cx = xs[i], far = i > last ? ' lejos' : '';
            out.push(`<g class="ct-gl-astro${far}">`);
            if (i === last && p < 1) { out.push(`<circle class="ct-gl-pl-aqui" cx="${cx}" cy="${line}" r="${r + 5}"/>`); }
            // Saturn's ring goes round it: the back half before the planet, the front half after.
            if (id === 'saturn') { out.push(`<path class="ct-gl-anillo" d="M${f1(cx - r * 1.8)} ${line} A${f1(r * 1.8)} ${f1(r * 0.5)} 0 0 1 ${f1(cx + r * 1.8)} ${line}"/>`); }
            out.push(`<circle cx="${cx}" cy="${line}" r="${r}" fill="${colour}"/>`);
            if (id === 'earth') { out.push(`<path class="ct-gl-continente" d="M${cx - 3.5} ${line - 3} q2 -2.5 4.5 -1 q1 2 -1 3 q-2 1 -1 3.5 q-2 0 -2.5 -2.5 Z M${cx + 2} ${line + 2} q2 -1 2.5 1 q-1 2 -3 1.5 Z"/>`); }
            if (id === 'jupiter') { out.push(`<path class="ct-gl-banda" d="M${cx - 12} ${line - 4} H${cx + 12} M${cx - 12.5} ${line + 3} H${cx + 12.5}"/><ellipse class="ct-gl-mancha" cx="${cx + 4}" cy="${line + 6.5}" rx="2.6" ry="1.6"/>`); }
            if (id === 'saturn') { out.push(`<path class="ct-gl-anillo" d="M${f1(cx - r * 1.8)} ${line} A${f1(r * 1.8)} ${f1(r * 0.5)} 0 0 0 ${f1(cx + r * 1.8)} ${line}"/>`); }
            out.push(`<text class="ct-gl-planeta${i === last && p < 1 ? ' aqui' : ''}" x="${cx}" y="${line + 24 + (i % 2) * 11}">${esc(t('gl_pl_' + id))}</text></g>`);
        });
        // The rocket, from the Earth outwards, with its trail.
        out.push(`<path class="ct-gl-estela" d="M${f1(from)} ${line - 10} Q${f1((from + rx) / 2)} ${y + 6} ${f1(rx - 20)} ${y}"/>`);
        out.push(`<g transform="translate(${f1(rx)} ${y}) rotate(90) scale(1.45)"><path class="ct-gl-fuego" d="M-3.5 11 Q0 24 3.5 11 Z"/><path class="ct-gl-fuego dentro" d="M-1.8 11 Q0 18 1.8 11 Z"/>`
            + '<path class="ct-gl-cohete" d="M0 -16 C7 -10 7 4 5 10 H-5 C-7 4 -7 -10 0 -16 Z"/><path class="ct-gl-punta" d="M0 -16 C3.5 -13 5 -10 5.6 -8 H-5.6 C-5 -10 -3.5 -13 0 -16 Z"/>'
            + '<circle class="ct-gl-ventana" cx="0" cy="-2" r="3"/><path class="ct-gl-aleta" d="M-5 4 L-10 13 L-5 10 Z M5 4 L10 13 L5 10 Z"/></g>');
        out.push('</g>');
        const passed = PLANETS[last][0];
        const caption = p >= 1 ? t('gl_pl_done') : passed === 'earth' ? t('gl_pl_start') : `${t('gl_pl_' + passed)}: ${t('gl_fact_' + passed)}`;
        return { viewBox: '0 0 320 240', html: out.join(''), caption };
    };

    // --- The song, note by note -------------------------------------------------------------------------------------------
    // A song of the score, written note by note on a staff as the points come (each note with its name); the ones
    // still to come, as faint circles. The time and the bar lines are there from the start (they say nothing of the
    // notes). In Early years and Primary the notes are in their colours of the glockenspiel, as the score shows them; at
    // every level the note just earned is in its colour, with a halo. At the goal, the board plays it.
    const BELLS = ['#e53935', '#f57c00', '#f9c80e', '#43a047', '#00acc1', '#3949ab', '#8e24aa'];   // as in the score (score.js)
    const songNotes = (song) => (song && song.notes ? song.notes.filter((n) => !n.r).slice(0, 32) : []);
    // The bar each note of songNotes() is in, counting the rests and the pickup as the score does.
    const barsOf = (song) => {
        const time = song.time || [4, 4], per = (time[0] * 16) / time[1];
        let c = song.pickup ? per - song.pickup : 0;
        const bars = [];
        song.notes.forEach((n) => { if (!n.r) { bars.push(Math.floor(c / per + 1e-9)); } c += n.t || 4; });
        return bars.slice(0, 32);
    };
    const cancion = ({ points, target, song, level, t }) => {
        const S = window.ClasstoolsScore, notes = songNotes(song), out = [], young = level === 'early' || level === 'primary';
        if (!notes.length) { return { viewBox: '0 0 320 240', html: '', caption: t('gl_no_song') }; }
        const shown = Math.min(notes.length, Math.floor((points / target) * notes.length + 1e-9));
        const perRow = Math.min(16, notes.length), rows = Math.ceil(notes.length / perRow), g = 9, bars = barsOf(song);
        const time = song.time || [4, 4], left = 64, right = 288;
        out.push(`<text class="ct-gl-titulo" x="160" y="22">${esc(song.title || '')}</text>`);
        for (let r = 0; r < rows; r++) {
            const base = 92 + r * 104;   // the bottom line (E4) of each staff
            for (let l = 0; l < 5; l++) { out.push(`<path class="ct-gl-linea" d="M16 ${base - l * g} H306"/>`); }
            out.push(`<text class="ct-gl-clave" x="18" y="${base + 2}">𝄞</text>`);
            if (r === 0) { out.push(`<text class="ct-gl-compas" x="48" y="${base - 2 * g - 1}">${time[0]}</text><text class="ct-gl-compas" x="48" y="${base - 1}">${time[1]}</text>`); }
            const row = notes.slice(r * perRow, (r + 1) * perRow), first = r * perRow;
            // Where each note goes: evenly, with a little more room where a bar line goes.
            const breaks = row.map((_, k) => (k && bars[first + k] !== bars[first + k - 1] ? 1 : 0));
            const unit = (right - left) / Math.max(1, perRow - 1 + 0.25 * breaks.reduce((a, b) => a + b, 0));
            let along = 0;
            const xs = row.map((_, k) => { along += k ? 1 + 0.25 * breaks[k] : 0; return left + along * unit; });
            row.forEach((n, k) => {
                const i = first + k, x = xs[k], y = base - (n.s - 30) * (g / 2);
                // The bar line before this note, when it starts a new bar.
                if (breaks[k]) { out.push(`<path class="ct-gl-barra" d="M${f1((xs[k - 1] + x) / 2)} ${base} V${base - 4 * g}"/>`); }
                if (i < shown) {
                    // Ledger lines below or above the staff (only for the notes written: they would tell the pitch).
                    for (let s = 28; s >= n.s; s -= 2) { out.push(`<path class="ct-gl-linea" d="M${f1(x - 8)} ${f1(base - (s - 30) * (g / 2))} H${f1(x + 8)}"/>`); }
                    for (let s = 40; s <= n.s; s += 2) { out.push(`<path class="ct-gl-linea" d="M${f1(x - 8)} ${f1(base - (s - 30) * (g / 2))} H${f1(x + 8)}"/>`); }
                    const open = n.t >= 8, up = n.s < 34, fresh = i === shown - 1 && shown < notes.length;
                    if (fresh) { out.push(`<circle class="ct-gl-halo" cx="${f1(x)}" cy="${f1(y)}" r="9"/>`); }
                    const bell = young || fresh ? BELLS[((n.s % 7) + 7) % 7] : '';
                    out.push(`<ellipse class="ct-gl-nota${open ? ' blanca' : ''}${bell ? ' color' : ''}" cx="${f1(x)}" cy="${f1(y)}" rx="5.2" ry="3.8" transform="rotate(-20 ${f1(x)} ${f1(y)})"`
                        + `${bell ? ` style="fill:${bell}"` : ''}/>`);
                    if (n.t < 16) { out.push(`<path class="ct-gl-plica" d="M${f1(up ? x + 4.8 : x - 4.8)} ${f1(y)} V${f1(up ? y - 26 : y + 26)}"/>`); }
                    if (n.a) { out.push(`<text class="ct-gl-alter" x="${f1(x - 11)}" y="${f1(y + 3)}">${n.a > 0 ? '♯' : '♭'}</text>`); }
                    out.push(`<text class="ct-gl-nombre${fresh ? ' nueva' : ''}" x="${f1(x)}" y="${base + 22}">${esc(S ? S.noteName(n.s) : '')}</text>`);
                } else {
                    out.push(`<circle class="ct-gl-falta" cx="${f1(x)}" cy="${f1(base - 2 * g)}" r="3.4"/>`);
                }
            });
            // The end of the staff: a double bar at the end of the song.
            if (r === rows - 1) { out.push(`<path class="ct-gl-barra" d="M301 ${base} V${base - 4 * g}"/><path class="ct-gl-barra fin" d="M304.5 ${base} V${base - 4 * g}"/>`); }
        }
        return { viewBox: `0 0 320 ${rows > 1 ? 240 : 140}`, html: out.join(''), caption: t('gl_notes', { n: shown, of: notes.length }) };
    };

    // --- The mosaic that uncovers a picture ----------------------------------------------------------------------------
    // A picture under as many tiles as steps, in rows and columns (the fraction uncovered is the fraction of the goal),
    // uncovered in an order of their own. A faint grid stays over the picture until the goal, so the pieces uncovered can
    // be counted.
    // Two pictures drawn here, or one of the teacher's (kept only in this browser).
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
        // The grid over the picture (seen only where it is uncovered; at the goal, the picture whole).
        const lines = shown >= cap ? '' : Array.from({ length: cols - 1 }, (_, c) => `M${f1((c + 1) * w)} 0 V240`).concat(Array.from({ length: rows - 1 }, (_, r) => `M0 ${f1((r + 1) * h)} H320`)).join(' ');
        const tiles = [];
        for (let i = 0; i < cap; i++) {
            if (open.has(i)) { continue; }
            const x = (i % cols) * w, y = Math.floor(i / cols) * h;
            // Each tile butts against the next (no gaps that let the picture through), with a light edge on top.
            tiles.push(`<rect class="ct-gl-pieza" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/>`
                + `<path class="ct-gl-pieza-luz" d="M${f1(x + 2)} ${f1(y + h - 2.5)} V${f1(y + 2)} H${f1(x + w - 2.5)}"/>`);
        }
        return { viewBox: '0 0 320 240', html: `<clipPath id="gl-marco"><rect width="320" height="240" rx="12"/></clipPath><g clip-path="url(#gl-marco)">${pic}`
            + `${lines ? `<path class="ct-gl-rejilla" d="${lines}"/>` : ''}${tiles.join('')}</g>`
            + '<rect class="ct-gl-marco" width="320" height="240" rx="12"/>', caption: t('gl_tiles', { n: shown, of: cap }), tiles: { cols, rows, cap, shown } };
    };

    window.ClasstoolsGoalLooks = { camino, planta, cohete, cancion, mosaico, songNotes, PICTURES: Object.keys(PICTURES), grid, stepsOf };
})();
