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
 * The marks of the printed cards, and how a camera reads them: our own open design (docs/cards-markers.md). A mark is
 * a square of 6 × 6 cells: a black border one cell wide and 4 × 4 cells inside, black or white, that say which card it
 * is (1 to 60); it needs a white margin of at least one cell around it. Every card's code differs from every other, in
 * any of its four turns, in at least 4 cells, so a cell read wrong is still the right card, and its turn is never in
 * doubt. The turn of the mark in the picture is the answer: as printed, A is on top; turned a quarter clockwise, D;
 * half a turn, C; a quarter anticlockwise, B.
 * To read: grey levels, an adaptive threshold (dark against what is around), the dark patches, the outline of each
 * one reduced to four corners, the 6 × 6 cells sampled through the perspective of those corners, the border checked
 * (black, with white around), and the 16 cells inside compared with the codes in their four turns.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    // The codes of cards 1 to 60: bit r × 4 + c is the cell of row r and column c inside the border (from the top
    // left, as printed), 1 is black.
    const CODES = [38450, 65217, 10134, 18845, 11673, 8669, 8566, 20266, 59372, 24004, 6730, 34104, 43726, 57713, 40301,
        9467, 25620, 55857, 62409, 44215, 36704, 61877, 33174, 45256, 60518, 15480, 47243, 35295, 2605, 53146, 50322,
        28505, 52728, 49972, 63693, 11209, 30059, 31354, 37761, 54791, 40854, 4747, 48449, 33109, 15790, 51548, 43507,
        45447, 15657, 12569, 22280, 4464, 54391, 35819, 22590, 53664, 46287, 9001, 60873, 22841];
    const MAX = CODES.length;
    // A quarter turn clockwise of the 4 × 4 cells.
    const turn = (c) => {
        let out = 0;
        for (let r = 0; r < 4; r++) {
            for (let col = 0; col < 4; col++) {
                if ((c >> ((3 - col) * 4 + r)) & 1) { out |= 1 << (r * 4 + col); }
            }
        }
        return out;
    };
    // Every code in its four turns: [card, quarter turns clockwise, cells].
    const TABLE = [];
    CODES.forEach((c, i) => { let x = c; for (let k = 0; k < 4; k++) { TABLE.push([i + 1, k, x]); x = turn(x); } });
    const ANSWERS = ['A', 'D', 'C', 'B'];
    const bits = (x) => { let n = 0; while (x) { n += x & 1; x >>= 1; } return n; };

    /**
     * The mark of a card, to print: an SVG of 8 × 8 units (the mark and its white margin).
     *
     * @param {number} id 1 to 60.
     * @returns {string}
     */
    const svg = (id) => {
        const c = CODES[id - 1];
        if (c === undefined) { return ''; }
        let cells = '<rect x="1" y="1" width="6" height="6" fill="#000"/><rect x="2" y="2" width="4" height="4" fill="#fff"/>';
        for (let r = 0; r < 4; r++) {
            for (let col = 0; col < 4; col++) {
                if ((c >> (r * 4 + col)) & 1) { cells += `<rect x="${2 + col}" y="${2 + r}" width="1.02" height="1.02" fill="#000"/>`; }
            }
        }
        return `<svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="8" height="8" fill="#fff"/>${cells}</svg>`;
    };

    // --- Reading -----------------------------------------------------------------------------------------------
    // From the unit square to the four corners (top left, top right, bottom right, bottom left), with perspective.
    const warp = (p) => {
        const [x0, y0] = p[0], [x1, y1] = p[1], [x2, y2] = p[2], [x3, y3] = p[3];
        const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
        const den = dx1 * dy2 - dx2 * dy1;
        const g = den ? (dx3 * dy2 - dx2 * dy3) / den : 0, h = den ? (dx1 * dy3 - dx3 * dy1) / den : 0;
        const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
        return (u, v) => { const w = g * u + h * v + 1; return [(a * u + b * v + x0) / w, (d * u + e * v + y0) / w]; };
    };
    // The outline of a patch (the first and last dark pixel of each row and column) → its convex hull.
    const hull = (pts) => {
        pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lower = [], upper = [];
        for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) { lower.pop(); } lower.push(p); }
        for (let i = pts.length - 1; i >= 0; i--) {
            const p = pts[i];
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) { upper.pop(); }
            upper.push(p);
        }
        return lower.slice(0, -1).concat(upper.slice(0, -1));
    };
    const area = (poly) => { let s = 0; for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s) / 2; };
    // Four corners of the hull: the point farthest from the middle, the one farthest from it (the opposite corner),
    // and on each side of the diagonal between them, the one farthest from it.
    const four = (poly) => {
        const cx = poly.reduce((v, p) => v + p[0], 0) / poly.length, cy = poly.reduce((v, p) => v + p[1], 0) / poly.length;
        const far = (from) => poly.reduce((best, p) => (Math.hypot(p[0] - from[0], p[1] - from[1]) > Math.hypot(best[0] - from[0], best[1] - from[1]) ? p : best));
        const a = far([cx, cy]), c = far(a);
        let b = null, d = null, bd = 0, dd = 0;
        poly.forEach((p) => {
            const s = (c[0] - a[0]) * (p[1] - a[1]) - (c[1] - a[1]) * (p[0] - a[0]);
            if (s > bd) { bd = s; b = p; }
            if (-s > dd) { dd = -s; d = p; }
        });
        return b && d ? [a, b, c, d] : null;
    };
    // Finer corners: a straight line fitted to the outline along each side (away from the corners, which blur and the
    // threshold round off), and where the lines of two sides meet.
    const refine = (q, pts) => {
        const lines = [];
        for (let i = 0; i < 4; i++) {
            const a = q[i], b = q[(i + 1) % 4], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
            if (len < 4) { return q; }
            const nx = -dy / len, ny = dx / len, tol = Math.max(1.5, len * 0.08);
            const sel = pts.filter((p) => {
                const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (len * len);
                return t > 0.15 && t < 0.85 && Math.abs((p[0] - a[0]) * nx + (p[1] - a[1]) * ny) <= tol;
            });
            if (sel.length < 4) { return q; }
            const mx = sel.reduce((v, p) => v + p[0], 0) / sel.length, my = sel.reduce((v, p) => v + p[1], 0) / sel.length;
            let sxx = 0, sxy = 0, syy = 0;
            sel.forEach((p) => { const X = p[0] - mx, Y = p[1] - my; sxx += X * X; sxy += X * Y; syy += Y * Y; });
            const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
            lines.push([mx, my, Math.cos(ang), Math.sin(ang)]);
        }
        const out = [];
        for (let i = 0; i < 4; i++) {
            const [x1, y1, a1, b1] = lines[(i + 3) % 4], [x2, y2, a2, b2] = lines[i];
            const den = a1 * b2 - b1 * a2;
            if (Math.abs(den) < 1e-6) { return q; }
            const k = ((x2 - x1) * b2 - (y2 - y1) * a2) / den;
            out.push([x1 + k * a1, y1 + k * b1]);
        }
        const side = Math.sqrt(area(q));
        return out.every((p, i) => Math.hypot(p[0] - q[i][0], p[1] - q[i][1]) < side * 0.2) ? out : q;
    };
    // The corners in the order of the picture: the one nearest the top left first, then clockwise.
    const order = (q) => {
        const cx = q.reduce((s, p) => s + p[0], 0) / 4, cy = q.reduce((s, p) => s + p[1], 0) / 4;
        const s = q.slice().sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
        let first = 0;
        s.forEach((p, i) => { if (p[0] + p[1] < s[first][0] + s[first][1]) { first = i; } });
        return s.slice(first).concat(s.slice(0, first));
    };

    /**
     * The cards in a picture.
     *
     * @param {ImageData} img
     * @returns {Array<{id: number, answer: string, corners: number[][]}>}
     */
    const detect = (img) => {
        const W = img.width, H = img.height, px = img.data, n = W * H;
        const grey = new Uint8Array(n);
        for (let i = 0, j = 0; i < n; i++, j += 4) { grey[i] = (px[j] * 77 + px[j + 1] * 150 + px[j + 2] * 29) >> 8; }
        // Adaptive threshold: dark against the mean of a window around (an integral image makes each mean cheap).
        const S = new Uint32Array((W + 1) * (H + 1));
        for (let y = 0; y < H; y++) {
            let row = 0;
            for (let x = 0; x < W; x++) { row += grey[y * W + x]; S[(y + 1) * (W + 1) + x + 1] = S[y * (W + 1) + x + 1] + row; }
        }
        const r = Math.max(6, Math.round(Math.min(W, H) / 40));
        const global = S[H * (W + 1) + W] / n;
        const dark = new Uint8Array(n);
        for (let y = 0; y < H; y++) {
            const ya = Math.max(0, y - r), yb = Math.min(H, y + r + 1);
            for (let x = 0; x < W; x++) {
                const xa = Math.max(0, x - r), xb = Math.min(W, x + r + 1);
                const sum = S[yb * (W + 1) + xb] - S[ya * (W + 1) + xb] - S[yb * (W + 1) + xa] + S[ya * (W + 1) + xa];
                const mean = sum / ((xb - xa) * (yb - ya));
                // Dark against its surroundings, or very dark anyway (the inside of a big black border, seen close).
                dark[y * W + x] = grey[y * W + x] * 100 < mean * 85 || grey[y * W + x] * 100 < global * 45 ? 1 : 0;
            }
        }
        // The dark patches (4-connected), with their size and box.
        const label = new Int32Array(n), parent = [0];
        const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const i = y * W + x;
                if (!dark[i]) { continue; }
                const up = y ? label[i - W] : 0, left = x ? label[i - 1] : 0;
                if (!up && !left) { label[i] = parent.length; parent.push(parent.length); } else if (up && left) {
                    const a = find(up), b = find(left);
                    label[i] = Math.min(a, b);
                    if (a !== b) { parent[Math.max(a, b)] = Math.min(a, b); }
                } else { label[i] = up || left; }
            }
        }
        const box = new Map();
        for (let i = 0; i < n; i++) {
            if (!label[i]) { continue; }
            const l = find(label[i]);
            label[i] = l;
            const x = i % W, y = (i - x) / W;
            let b = box.get(l);
            if (!b) { b = { n: 0, x0: x, x1: x, y0: y, y1: y }; box.set(l, b); }
            b.n++;
            if (x < b.x0) { b.x0 = x; } if (x > b.x1) { b.x1 = x; } if (y > b.y1) { b.y1 = y; }
        }
        const at = (x, y) => {
            const xi = Math.round(x), yi = Math.round(y);
            return xi < 0 || yi < 0 || xi >= W || yi >= H ? -1 : grey[yi * W + xi];
        };
        const found = new Map();
        box.forEach((b, l) => {
            const w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1;
            if (b.n < 120 || w < 18 || h < 18 || w > W * 0.95 || h > H * 0.95 || w > 4 * h || h > 4 * w) { return; }
            // The outline: the first and last dark pixel of each row and of each column (their outer edges).
            const pts = [];
            const top = new Int32Array(w).fill(-1), bottom = new Int32Array(w).fill(-1);
            for (let y = b.y0; y <= b.y1; y++) {
                let a = -1, z = -1;
                for (let x = b.x0; x <= b.x1; x++) {
                    if (label[y * W + x] !== l) { continue; }
                    if (a < 0) { a = x; }
                    z = x;
                    if (top[x - b.x0] < 0) { top[x - b.x0] = y; }
                    bottom[x - b.x0] = y;
                }
                if (a >= 0) { pts.push([a, y + 0.5], [z + 1, y + 0.5]); }
            }
            for (let i = 0; i < w; i++) { if (top[i] >= 0) { pts.push([b.x0 + i + 0.5, top[i]], [b.x0 + i + 0.5, bottom[i] + 1]); } }
            const hp = hull(pts.slice());
            const q = hp.length >= 4 ? four(hp) : null;
            if (!q || area(q) < 0.85 * area(hp)) { return; }
            const corners = refine(order(q), pts);
            const map = warp(corners);
            // The mean grey of a cell (or of the margin outside it), from a few points near its centre.
            const cell = (row, col) => {
                let s = 0, k = 0;
                for (const du of [-0.18, 0, 0.18]) {
                    for (const dv of [-0.18, 0, 0.18]) {
                        const [x, y] = map((col + 0.5 + du) / 6, (row + 0.5 + dv) / 6);
                        const g = at(x, y);
                        if (g < 0) { return -1; }
                        s += g; k++;
                    }
                }
                return s / k;
            };
            const border = [], margin = [];
            for (let i = 0; i < 6; i++) { border.push(cell(0, i), cell(5, i), cell(i, 0), cell(i, 5)); }
            // The margin, half a cell out from the border (the middle of the white margin).
            for (let i = 1; i < 5; i++) { margin.push(cell(-1, i), cell(6, i), cell(i, -1), cell(i, 6)); }
            if (border.some((g) => g < 0) || margin.some((g) => g < 0)) { return; }
            const black = border.reduce((s, g) => s + g, 0) / border.length;
            const white = margin.reduce((s, g) => s + g, 0) / margin.length;
            if (white - black < 40) { return; }
            const mid = (black + white) / 2;
            if (border.filter((g) => g > mid).length > 2 || margin.filter((g) => g < mid).length > 2) { return; }
            let word = 0;
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) { if (cell(row + 1, col + 1) < mid) { word |= 1 << (row * 4 + col); } }
            }
            // The nearest code in any of its turns: one cell wrong at most.
            let best = null, bd = 99;
            for (const [id, k, x] of TABLE) { const d = bits(x ^ word); if (d < bd) { bd = d; best = [id, k]; } }
            if (!best || bd > 1) { return; }
            const [id, k] = best;
            const size = area(q);
            if (!found.has(id) || found.get(id).size < size) { found.set(id, { id, answer: ANSWERS[k], corners, size }); }
        });
        return [...found.values()].map(({ id, answer, corners }) => ({ id, answer, corners }));
    };

    window.ClasstoolsScanner = { CODES, MAX, svg, detect, turn };
})();
