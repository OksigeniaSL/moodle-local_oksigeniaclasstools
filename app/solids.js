// 3D shapes, among the materials: prisms, pyramids, round solids and the regular polyhedra, drawn by the board itself
// (no 3D library: a little geometry and an SVG). They turn with a finger, the mouse or the arrow keys, and come closer
// with the wheel or two fingers. «Unfold» opens a shape into its net, slowly, and «Fold» closes it again (the slider
// stops it halfway); «Another net» goes through all the nets of the small ones (the cube has 11) and makes new ones for
// the big ones. The board counts the faces, the edges or the vertices one by one, with their numbers; a tap paints a
// face, and its colour stays in the net; «See through» shows the hidden edges dashed; and the views from the front,
// from above and from a side are drawn without perspective.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { escape, play, announce } = core;
    const t = core.t;
    const PHI = (1 + Math.sqrt(5)) / 2;

    // --- A little vector geometry ------------------------------------------------------------------------------------
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const unit = (a) => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
    const mean = (ps) => mul(ps.reduce(add, [0, 0, 0]), 1 / ps.length);
    // Turns (3 × 3, by rows) and moves (a turn and then a shift).
    const mv = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
    const mm = (a, b) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]));
    // About the axis d (a unit vector), a radians, by the right hand.
    const turn = (d, a) => {
        const [x, y, z] = d, c = Math.cos(a), s = Math.sin(a), k = 1 - c;
        return [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k];
    };
    const ID = { r: [1, 0, 0, 0, 1, 0, 0, 0, 1], p: [0, 0, 0] };
    const apply = (m, v) => add(mv(m.r, v), m.p);
    const then = (a, b) => ({ r: mm(a.r, b.r), p: add(mv(a.r, b.p), a.p) });   // b first, then a
    const hinge = (p, d, a) => { const r = turn(d, a); return { r, p: sub(p, mv(r, p)) }; };   // about a line through p
    // The normal of a polygon (Newell's way): outwards when its corners go counter-clockwise seen from outside.
    const normalOf = (pts) => {
        const n = [0, 0, 0];
        pts.forEach((a, i) => {
            const b = pts[(i + 1) % pts.length];
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
        });
        return unit(n);
    };

    // --- The shapes ------------------------------------------------------------------------------------------------
    // Each one: its corners, its faces (lists of corners) and the role of each face: «base», «side», «regular» or
    // «smooth» (the little faces of a curved surface, whose edges are not drawn).
    const polygon = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => [r * Math.cos(a0 + (2 * Math.PI * i) / n), r * Math.sin(a0 + (2 * Math.PI * i) / n)]);
    const prism = (base, h, smooth) => {
        const n = base.length;
        const v = base.map(([x, z]) => [x, 0, z]).concat(base.map(([x, z]) => [x, h, z]));
        const f = [base.map((_, i) => i), base.map((_, i) => i + n)], roles = ['base', 'base'];
        base.forEach((_, i) => { const j = (i + 1) % n; f.push([i, j, j + n, i + n]); roles.push(smooth ? 'smooth' : 'side'); });
        return { v, f, roles };
    };
    const pyramid = (base, h, smooth) => {
        const n = base.length;
        const v = base.map(([x, z]) => [x, 0, z]).concat([[0, h, 0]]);
        const f = [base.map((_, i) => i)], roles = ['base'];
        base.forEach((_, i) => { f.push([i, (i + 1) % n, n]); roles.push(smooth ? 'smooth' : 'side'); });
        return { v, f, roles };
    };
    const sphere = () => {
        const LAT = 12, LON = 24, v = [[0, 1, 0]], f = [];
        for (let i = 1; i < LAT; i++) {
            const a = (Math.PI * i) / LAT;
            for (let j = 0; j < LON; j++) { const b = (2 * Math.PI * j) / LON; v.push([Math.sin(a) * Math.cos(b), Math.cos(a), Math.sin(a) * Math.sin(b)]); }
        }
        v.push([0, -1, 0]);
        const at = (i, j) => 1 + (i - 1) * LON + (j % LON);
        for (let j = 0; j < LON; j++) {
            f.push([0, at(1, j), at(1, j + 1)]);
            for (let i = 1; i < LAT - 1; i++) { f.push([at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]); }
            f.push([at(LAT - 1, j), v.length - 1, at(LAT - 1, j + 1)]);
        }
        return { v, f, roles: f.map(() => 'smooth') };
    };
    // The faces of a convex polyhedron from its corners: the planes that leave all the corners on one side.
    const hull = (pts) => {
        const c = mean(pts), faces = [], seen = new Set();
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                for (let k = j + 1; k < pts.length; k++) {
                    let n = cross(sub(pts[j], pts[i]), sub(pts[k], pts[i]));
                    if (Math.hypot(n[0], n[1], n[2]) < 1e-9) { continue; }
                    n = unit(n);
                    if (dot(n, sub(c, pts[i])) > 0) { n = mul(n, -1); }
                    const d = dot(n, pts[i]);
                    if (pts.some((p) => dot(n, p) > d + 1e-6)) { continue; }
                    const on = pts.map((_, m) => m).filter((m) => Math.abs(dot(n, pts[m]) - d) < 1e-6);
                    if (seen.has(on.join())) { continue; }
                    seen.add(on.join());
                    const fc = mean(on.map((m) => pts[m])), e1 = unit(sub(pts[on[0]], fc)), e2 = cross(n, e1);
                    const angle = (m) => { const q = sub(pts[m], fc); return Math.atan2(dot(q, e2), dot(q, e1)); };
                    faces.push(on.sort((a, b) => angle(a) - angle(b)));
                }
            }
        }
        return faces;
    };
    const signs = (a) => a.reduce((out, x) => out.flatMap((p) => (x === 0 ? [[...p, 0]] : [[...p, x], [...p, -x]])), [[]]);
    const regular = (pts) => { const f = hull(pts); return { v: pts, f, roles: f.map(() => 'regular') }; };
    const cube = (roles) => { const s = prism(polygon(4, Math.SQRT1_2, Math.PI / 4), 1); if (roles) { s.roles = s.roles.map(() => roles); } return s; };
    // The net of each one: «band» (the side faces in a strip, the bases on both sides of it), «star» (all around the
    // base) or «flowers» (the dodecahedron: two flowers of five joined by a petal). The axis, for the band: what goes
    // round it is the strip.
    const SOLIDS = {
        cubo: { group: 'prisms', make: () => cube(), net: 'band', early: true },
        ortoedro: { group: 'prisms', make: () => prism([[-0.8, -0.45], [0.8, -0.45], [0.8, 0.45], [-0.8, 0.45]], 1.1), net: 'band', early: true },
        prisma3: { group: 'prisms', make: () => prism(polygon(3, 0.7, Math.PI / 2), 1.4), net: 'band' },
        prisma5: { group: 'prisms', make: () => prism(polygon(5, 0.75, Math.PI / 2), 1.2), net: 'band' },
        prisma6: { group: 'prisms', make: () => prism(polygon(6, 0.7), 1.2), net: 'band' },
        piramide3: { group: 'pyramids', make: () => pyramid(polygon(3, 0.8, Math.PI / 2), 1.3), net: 'star' },
        piramide4: { group: 'pyramids', make: () => pyramid(polygon(4, 0.85, Math.PI / 4), 1.2), net: 'star', early: true },
        piramide5: { group: 'pyramids', make: () => pyramid(polygon(5, 0.8, Math.PI / 2), 1.3), net: 'star' },
        piramide6: { group: 'pyramids', make: () => pyramid(polygon(6, 0.8), 1.3), net: 'star' },
        cilindro: { group: 'round', make: () => prism(polygon(40, 0.6), 1.4, true), net: 'band', round: 'cylinder', early: true },
        cono: { group: 'round', make: () => pyramid(polygon(40, 0.7), 1.4, true), net: 'band', round: 'cone', early: true },
        esfera: { group: 'round', make: sphere, round: 'sphere', early: true },
        tetraedro: { group: 'regular', make: () => regular([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]), net: 'star' },
        hexaedro: { group: 'regular', make: () => cube('regular'), net: 'band' },
        octaedro: { group: 'regular', make: () => regular([...signs([1, 0, 0]), ...signs([0, 1, 0]), ...signs([0, 0, 1])]), net: 'band', axis: unit([1, 1, 1]) },
        dodecaedro: { group: 'regular', make: () => regular([...signs([1, 1, 1]), ...signs([0, 1 / PHI, PHI]), ...signs([1 / PHI, PHI, 0]), ...signs([PHI, 0, 1 / PHI])]), net: 'flowers' },
        icosaedro: { group: 'regular', make: () => regular([...signs([0, 1, PHI]), ...signs([1, PHI, 0]), ...signs([PHI, 0, 1])]), net: 'band', axis: unit([0, 1, PHI]) },
    };
    const GROUPS = ['prisms', 'pyramids', 'round', 'regular'];

    // A shape ready to be drawn: its faces outwards, its edges (and which faces each one joins), its net and, standing
    // on the face that stays still when it unfolds, its size brought to one.
    const build = (key) => {
        const spec = SOLIDS[key], raw = spec.make();
        const c0 = mean(raw.v);
        const s = { key, spec, v: raw.v, roles: raw.roles };
        s.f = raw.f.map((f) => (dot(normalOf(f.map((i) => raw.v[i])), sub(mean(f.map((i) => raw.v[i])), c0)) < 0 ? f.slice().reverse() : f));
        s.n = s.f.map((f) => normalOf(f.map((i) => s.v[i])));
        const byPair = new Map();
        s.f.forEach((f, fi) => f.forEach((a, k) => {
            const b = f[(k + 1) % f.length], id = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (!byPair.has(id)) { byPair.set(id, { a: Math.min(a, b), b: Math.max(a, b), faces: [] }); }
            byPair.get(id).faces.push(fi);
        }));
        s.edges = [...byPair.values()];
        s.edges.forEach((e, k) => { e.k = k; e.real = !(s.roles[e.faces[0]] === 'smooth' && s.roles[e.faces[1]] === 'smooth'); });
        s.fe = s.f.map((f) => f.map((a, k) => { const b = f[(k + 1) % f.length]; return byPair.get(a < b ? `${a}-${b}` : `${b}-${a}`).k; }));
        s.adj = s.f.map(() => []);
        s.edges.forEach((e) => { const [p, q] = e.faces; s.adj[p].push({ f: q, e: e.k }); s.adj[q].push({ f: p, e: e.k }); });
        let net = spec.net ? classic(s) : null;
        // Standing on the root of its net (or as it is, the sphere), in the middle, and with a size of one.
        const down = [0, -1, 0], nr = net ? s.n[net.root] : down, cosA = dot(nr, down);
        const r = cosA > 1 - 1e-9 ? ID.r : (cosA < -1 + 1e-9 ? turn([1, 0, 0], Math.PI) : turn(unit(cross(nr, down)), Math.acos(cosA)));
        s.v = s.v.map((p) => mv(r, p));
        const ys = s.v.map((p) => p[1]), lo = [0, 2].map((j) => Math.min(...s.v.map((p) => p[j]))), hi = [0, 2].map((j) => Math.max(...s.v.map((p) => p[j])));
        const base = [(lo[0] + hi[0]) / 2, Math.min(...ys), (lo[1] + hi[1]) / 2];
        s.v = s.v.map((p) => sub(p, base));
        const mid = [0, (Math.max(...ys) - Math.min(...ys)) / 2, 0], size = Math.max(...s.v.map((p) => Math.hypot(...sub(p, mid))));
        s.v = s.v.map((p) => mul(p, 1 / size));
        s.n = s.f.map((f) => normalOf(f.map((i) => s.v[i])));
        if (net) { net = prepare(s, net); }
        s.net = net;
        return s;
    };

    // --- Nets ------------------------------------------------------------------------------------------------------
    // A net is a tree of the faces: each hangs from its parent by the edge they share, and the root stays still.
    const tree = (s, root, links) => {
        const parent = s.f.map(() => -1), via = s.f.map(() => -1);
        for (const [f, p] of links) {
            const x = s.adj[f].find((y) => y.f === p);
            if (!x || parent[f] >= 0) { return null; }
            parent[f] = p; via[f] = x.e;
        }
        return { root, parent, via };
    };
    const bandNet = (s) => {
        const A = s.spec.axis || [0, 1, 0], c = mean(s.v);
        const caps = [], band = [];
        s.f.forEach((_, i) => ((s.roles[i] === 'base' || (s.roles[i] === 'regular' && Math.abs(dot(s.n[i], A)) > 0.5)) ? caps : band).push(i));
        const e1 = unit(cross(A, Math.abs(A[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1])), e2 = cross(A, e1);
        const az = (i) => { const q = sub(mean(s.f[i].map((k) => s.v[k])), c); return Math.atan2(dot(q, e2), dot(q, e1)); };
        band.sort((a, b) => az(a) - az(b));
        const m = band.length, touches = (a, b) => s.adj[a].some((x) => x.f === b);
        if (m < 3 || !band.every((f, i) => touches(f, band[(i + 1) % m]))) { return null; }
        const down = caps.find((i) => dot(s.n[i], A) < -0.99);
        // The middle of the strip: a face of the band next to the bottom (if something is at the bottom).
        const start = down === undefined ? 0 : Math.max(0, band.findIndex((f) => touches(f, down)));
        const C = band.slice(start).concat(band.slice(0, start)), half = Math.floor((m - 1) / 2);
        const links = [], dist = new Map([[C[0], 0]]);
        for (let i = 1; i <= half; i++) { links.push([C[i], C[i - 1]]); dist.set(C[i], i); }
        for (let i = m - 1; i > half; i--) { links.push([C[i], C[(i + 1) % m]]); dist.set(C[i], m - i); }
        if (down !== undefined) { links.push([C[0], down]); }
        for (const x of caps.filter((y) => y !== down)) {
            const near = s.adj[x].filter((y) => dist.has(y.f)).sort((a, b) => dist.get(a.f) - dist.get(b.f))[0];
            if (!near) { return null; }
            links.push([x, near.f]);
        }
        return tree(s, down === undefined ? C[0] : down, links);
    };
    const lowest = (s) => s.n.reduce((best, n, i) => (n[1] < s.n[best][1] ? i : best), 0);
    const starNet = (s) => {
        const root = s.roles.includes('base') ? s.roles.indexOf('base') : lowest(s);
        return tree(s, root, s.f.map((_, i) => i).filter((i) => i !== root).map((i) => [i, root]));
    };
    const flowersNet = (s) => {
        const top = 0, bottom = s.n.findIndex((n) => dot(n, s.n[top]) < -0.99);
        if (bottom < 0) { return null; }
        const ring = (x) => s.adj[x].map((y) => y.f), low = ring(bottom), high = ring(top);
        const d = low[0], u = high.find((h) => s.adj[h].some((y) => y.f === d));
        if (u === undefined) { return null; }
        return tree(s, bottom, low.map((x) => [x, bottom]).concat([[u, d], [top, u]], high.filter((h) => h !== u).map((h) => [h, top])));
    };
    // From the root, each face hangs from the first one reached: for when the others cannot be made.
    const spread = (s, root, edges) => {
        const parent = s.f.map(() => -1), via = s.f.map(() => -1), seen = new Set([root]), queue = [root];
        const ok = edges ? new Set(edges) : null;
        while (queue.length) {
            const f = queue.shift();
            s.adj[f].forEach((x) => { if (!seen.has(x.f) && (!ok || ok.has(x.e))) { seen.add(x.f); parent[x.f] = f; via[x.f] = x.e; queue.push(x.f); } });
        }
        return seen.size === s.f.length ? { root, parent, via } : null;
    };
    const classic = (s) => {
        const make = { band: bandNet, star: starNet, flowers: flowersNet }[s.spec.net];
        const net = make ? make(s) : null;
        if (net && !overlaps(flatOf(s, prepare(s, net)))) { return net; }
        return spread(s, net ? net.root : lowest(s));
    };
    // How each face turns about its hinge: by the angle between its normal and its parent's, outwards.
    function prepare(s, net) {
        const kids = s.f.map(() => []);
        net.parent.forEach((p, f) => { if (p >= 0) { kids[p].push(f); } });
        const order = [net.root];
        for (let i = 0; i < order.length; i++) { order.push(...kids[order[i]]); }
        const angle = s.f.map(() => 0), axis = s.f.map(() => null);
        net.parent.forEach((p, f) => {
            if (p < 0) { return; }
            const e = s.edges[net.via[f]], a = s.v[e.a], d = unit(sub(s.v[e.b], a));
            const th = Math.acos(Math.max(-1, Math.min(1, dot(s.n[f], s.n[p]))));
            const sign = dot(mv(turn(d, th), s.n[f]), s.n[p]) >= dot(mv(turn(d, -th), s.n[f]), s.n[p]) ? 1 : -1;
            angle[f] = sign * th; axis[f] = { a, d };
        });
        return { root: net.root, parent: net.parent, via: net.via, order, angle, axis };
    }
    // Where each face is, open by k (0: the shape; 1: the net, flat).
    const moves = (s, net, k) => {
        const m = s.f.map(() => ID);
        if (net) { net.order.forEach((f) => { const p = net.parent[f]; if (p >= 0) { m[f] = then(m[p], hinge(net.axis[f].a, net.axis[f].d, k * net.angle[f])); } }); }
        return m;
    };
    // The net, flat: each face a polygon in the plane of the root.
    const flatOf = (s, net) => {
        const m = moves(s, net, 1), r = s.f[net.root], n = s.n[net.root], o = s.v[r[0]], e1 = unit(sub(s.v[r[1]], o)), e2 = cross(n, e1);
        return s.f.map((f, i) => f.map((k) => { const p = sub(apply(m[i], s.v[k]), o); return [dot(p, e1), dot(p, e2)]; }));
    };
    // Whether two faces of a flat net fall on each other (each a little smaller, so that touching is not falling).
    const overlaps = (polys) => {
        const small = polys.map((p) => {
            const cx = p.reduce((a, q) => a + q[0], 0) / p.length, cy = p.reduce((a, q) => a + q[1], 0) / p.length;
            return p.map(([x, y]) => [cx + (x - cx) * 0.97, cy + (y - cy) * 0.97]);
        });
        const apart = (a, b) => [a, b].some((P) => P.some((p, i) => {
            const q = P[(i + 1) % P.length], nx = q[1] - p[1], ny = p[0] - q[0];
            const pa = a.map(([x, y]) => x * nx + y * ny), pb = b.map(([x, y]) => x * nx + y * ny);
            return Math.max(...pa) <= Math.min(...pb) + 1e-9 || Math.max(...pb) <= Math.min(...pa) + 1e-9;
        }));
        for (let i = 0; i < small.length; i++) {
            for (let j = i + 1; j < small.length; j++) { if (!apart(small[i], small[j])) { return true; } }
        }
        return false;
    };
    // What a flat net looks like whichever way it is turned or flipped: the distances between its faces and corners.
    const signature = (polys) => {
        const cs = polys.map((p) => [p.reduce((a, q) => a + q[0], 0) / p.length, p.reduce((a, q) => a + q[1], 0) / p.length, p.length]);
        const corners = [];
        polys.flat().forEach(([x, y]) => { if (!corners.some((q) => Math.hypot(q[0] - x, q[1] - y) < 1e-6)) { corners.push([x, y]); } });
        const out = [];
        cs.forEach((a, i) => cs.slice(i + 1).forEach((b) => out.push(`${Math.min(a[2], b[2])}${Math.max(a[2], b[2])}:${Math.round(Math.hypot(a[0] - b[0], a[1] - b[1]) * 1000)}`)));
        corners.forEach((a, i) => corners.slice(i + 1).forEach((b) => out.push(Math.round(Math.hypot(a[0] - b[0], a[1] - b[1]) * 1000))));
        return out.sort().join(' ');
    };
    // All the nets of a small shape (from every tree of its faces, those that do not fall on themselves, each shape of
    // net once), the classic one first; null for the big ones.
    const allNets = (s) => {
        const F = s.f.length, E = s.edges.length;
        if (!s.net || E > 15) { return null; }
        const out = [], seen = new Set(), chosen = [];
        const consider = (edges) => {
            const net = spread(s, s.net.root, edges);
            if (!net) { return; }
            const ready = prepare(s, net), flat = flatOf(s, ready);
            if (overlaps(flat)) { return; }
            const sig = signature(flat);
            if (!seen.has(sig)) { seen.add(sig); out.push(Object.assign(ready, { sig })); }
        };
        const find = (par, x) => { while (par[x] !== x) { x = par[x]; } return x; };
        const walk = (k, par) => {
            if (chosen.length === F - 1) { consider(chosen); return; }
            if (E - k < F - 1 - chosen.length) { return; }
            const e = s.edges[k], a = find(par, e.faces[0]), b = find(par, e.faces[1]);
            if (a !== b) { const p2 = par.slice(); p2[a] = b; chosen.push(k); walk(k + 1, p2); chosen.pop(); }
            walk(k + 1, par);
        };
        walk(0, s.f.map((_, i) => i));
        const sig = signature(flatOf(s, s.net)), i = out.findIndex((x) => x.sig === sig);
        if (i >= 0) { out.splice(i, 1); }
        out.unshift(Object.assign(s.net, { sig }));
        return out;
    };
    // Another net of a big shape: from a tree of its faces made at random, one that does not fall on itself.
    const randomNet = (s, seen) => {
        for (let tries = 0; tries < 300; tries++) {
            const order = core.shuffle ? core.shuffle(s.edges.map((e) => e.k)) : s.edges.map((e) => e.k).sort(() => Math.random() - 0.5);
            const par = s.f.map((_, i) => i), find = (x) => { while (par[x] !== x) { x = par[x]; } return x; }, edges = [];
            order.forEach((k) => { const [p, q] = s.edges[k].faces, a = find(p), b = find(q); if (a !== b) { par[a] = b; edges.push(k); } });
            const net = spread(s, s.net.root, edges);
            if (!net) { continue; }
            const ready = prepare(s, net), flat = flatOf(s, ready);
            if (overlaps(flat)) { continue; }
            const sig = signature(flat);
            if (!seen.has(sig)) { return Object.assign(ready, { sig }); }
        }
        return null;
    };

    // --- The panel ---------------------------------------------------------------------------------------------------
    const VIEWS = { '3d': null, front: [0, 0], top: [0, Math.PI / 2], side: [Math.PI / 2, 0] };
    const panel = core.material.add('cuerpos', t('mt_solids'), `
        <aside class="tarjeta ct-side">
            <label class="campo apilado"><span>${escape(t('sd_which'))}</span><select id="sd-which"></select></label>
            <div class="ct-row">
                <button type="button" class="boton" id="sd-fold"><span data-icono="ampliar"></span><span>${escape(t('sd_unfold'))}</span></button>
                <button type="button" class="boton suave" id="sd-other"><span data-icono="otra"></span><span>${escape(t('sd_other_net'))}</span></button>
            </div>
            <label class="campo apilado" id="sd-open-box"><span>${escape(t('sd_open'))}</span><input type="range" id="sd-open" min="0" max="100" step="1" value="0"></label>
            <p class="nota" id="sd-net"></p>
            <div id="sd-count-box">
                <p class="ante">${escape(t('sd_count'))}</p>
                <div class="ct-row" id="sd-counts">${['faces', 'edges', 'vertices'].map((k) => `<button type="button" class="boton suave" data-count="${k}">${escape(t('sd_count_' + k))}</button>`).join('')}</div>
            </div>
            <p class="ante">${escape(t('sd_view'))}</p>
            <div class="segmentos ct-sd-vistas" role="radiogroup" id="sd-view" aria-label="${escape(t('sd_view'))}">${Object.keys(VIEWS).map((v) => `<button type="button" role="radio" data-v="${v}">${escape(t('sd_view_' + v))}</button>`).join('')}</div>
            <label class="interruptor"><input type="checkbox" id="sd-see"><span>${escape(t('sd_see'))}</span></label>
            <label class="interruptor"><input type="checkbox" id="sd-spin"><span>${escape(t('sd_spin'))}</span></label>
            <label class="interruptor"><input type="checkbox" id="sd-elements"><span>${escape(t('sd_elements'))}</span></label>
            <button type="button" class="boton suave" id="sd-clear" hidden><span data-icono="limpiar"></span><span>${escape(t('sd_clear'))}</span></button>
            <p class="nota">${escape(t('sd_help'))}</p>
        </aside>
        <div class="tarjeta ct-stage ct-sd-stage">
            <p class="total ct-sd-sum" id="sd-sum" aria-live="polite"></p>
            <p class="nota ct-sd-euler" id="sd-euler" hidden></p>
            <svg class="ct-sd" id="sd-svg" tabindex="0" role="application" aria-label="${escape(t('sd_label'))}"></svg>
        </div>`, () => { paint(); kick(); });
    const $ = (s) => panel.querySelector(s);
    const svg = $('#sd-svg');

    // Each screen mode starts with its own shape (and the count of its elements but in Infantil), and remembers what
    // the teacher changes in it.
    const byMode = core.byMode ? core.byMode('cuerpos-modo', {
        early: { solid: 'cubo', elements: false }, primary: { solid: 'cubo', elements: true },
        secondary: { solid: 'prisma5', elements: true }, advanced: { solid: 'icosaedro', elements: true },
    }) : { get: () => ({}), set: () => {} };
    const st = Object.assign({ solid: 'cubo', elements: true, see: false, spin: false }, core.load('cuerpos', {}), byMode.get());
    const keep = () => core.save('cuerpos', st);
    const level = () => (core.mode ? core.mode() : 'primary');
    const offered = () => Object.keys(SOLIDS).filter((k) => level() !== 'early' || SOLIDS[k].early);
    if (!SOLIDS[st.solid]) { st.solid = 'cubo'; }

    let model = null, net = null, nets = null;   // the shape, its net on show and the nets it has (for «Another net»)
    let open = 0, opening = false;               // 0: the shape; 1: its net
    const cam = { yaw: -0.6, pitch: 0.42, persp: 0.2, zoom: 1 };
    let view = '3d', count = null;
    const painted = {};                           // the colours of the faces, by shape
    const tw = { open: null, cam: null };         // what is moving
    const ROLE = { base: '#f4a62a', side: '#3f86d6', smooth: '#3f86d6', regular: '#20a386' };
    const PAINT = ['#ce1423', '#f2c200', '#067e36', '#164281', '#ea7317', '#8e44ad'];
    const LIGHT = unit([-0.45, 0.65, 0.62]);

    // --- Drawing -----------------------------------------------------------------------------------------------------
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const shade = (hex, k) => `rgb(${rgb(hex).map((x) => Math.round(Math.min(255, x * k + Math.max(0, k - 1) * 140))).join(',')})`;
    const colour = (i) => { const p = (painted[st.solid] || {})[i]; return p === undefined ? ROLE[model.roles[i]] : PAINT[p]; };
    // Where everything is now: each face's corners, the middle and the size of the whole.
    const scene = () => {
        const m = moves(model, net, open);
        const pts = model.f.map((f, i) => f.map((k) => apply(m[i], model.v[k])));
        const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        pts.forEach((p) => p.forEach((q) => { for (let j = 0; j < 3; j++) { lo[j] = Math.min(lo[j], q[j]); hi[j] = Math.max(hi[j], q[j]); } }));
        const c = mul(add(lo, hi), 0.5);
        let R = 0;
        pts.forEach((p) => p.forEach((q) => { R = Math.max(R, Math.hypot(...sub(q, c))); }));
        return { m, pts, c, R: R || 1 };
    };
    function paint() {
        if (!model) { return; }
        const box = svg.getBoundingClientRect(), W = Math.max(60, box.width), H = Math.max(60, box.height);
        svg.setAttribute('viewBox', `0 0 ${Math.round(W)} ${Math.round(H)}`);
        const { m, pts, c, R } = scene();
        const scale = ((0.42 * Math.min(W, H)) / R) * cam.zoom;
        const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
        const rot = (q) => { const x1 = q[0] * cy + q[2] * sy, z1 = -q[0] * sy + q[2] * cy; return [x1, q[1] * cp - z1 * sp, q[1] * sp + z1 * cp]; };
        const toCam = (q) => rot(sub(q, c));
        const eye = cam.persp > 0.001 ? [0, 0, R / cam.persp] : null;
        const flatXY = (q) => { const k = eye ? 1 / (1 - (q[2] * cam.persp) / R) : 1; return [W / 2 + q[0] * scale * k, H / 2 - q[1] * scale * k]; };
        const xy = (q) => flatXY(toCam(q)).map((x) => x.toFixed(1)).join(',');
        const faces = model.f.map((f, i) => {
            const P = pts[i].map(toCam), n = rot(mv(m[i].r, model.n[i])), ctr = mean(P);
            const front = eye ? dot(n, sub(eye, ctr)) > 0 : n[2] > 0;
            return { i, P, n, z: ctr[2], front };
        });
        const closed = open < 0.001, see = st.see || !!count;
        let list;
        if (closed && !see) { list = faces.filter((x) => x.front); } else if (closed) { list = faces.filter((x) => !x.front).concat(faces.filter((x) => x.front)); } else { list = faces.slice().sort((a, b) => a.z - b.z); }
        const counted = count ? new Set(count.items.slice(0, count.k)) : new Set();
        const out = [];
        list.forEach((x) => {
            const lit = Math.max(0, (x.front ? 1 : -1) * dot(x.n, LIGHT)), k = (0.62 + 0.5 * lit) * (x.front ? 1 : 0.9);
            const fill = shade(colour(x.i), k), smooth = model.roles[x.i] === 'smooth';
            const S = x.P.map((q) => flatXY(q).map((v) => v.toFixed(1)).join(','));
            const mark = count && count.kind === 'faces' && counted.has(x.i) ? ' contada' : '';
            out.push(`<polygon data-f="${x.i}" class="ct-sd-cara${mark}" points="${S.join(' ')}" fill="${fill}"${see ? ' fill-opacity=".4"' : ''}${smooth && !see ? ` stroke="${fill}" stroke-width="1"` : ''}/>`);
            const d = model.fe[x.i].map((e, k) => (model.edges[e].real ? `M${S[k]}L${S[(k + 1) % S.length]}` : '')).join('');
            if (d) { out.push(`<path d="${d}" class="ct-sd-arista${x.front || !see ? '' : ' oculta'}"/>`); }
        });
        // The outline of a curved surface: where it turns from the front to the back.
        if (closed) {
            const front = faces.map((x) => x.front);
            const d = model.edges.filter((e) => !e.real && front[e.faces[0]] !== front[e.faces[1]]).map((e) => `M${xy(model.v[e.a])}L${xy(model.v[e.b])}`).join('');
            if (d) { out.push(`<path d="${d}" class="ct-sd-arista"/>`); }
        }
        // What has been counted, with its numbers.
        if (count) {
            const label = (q, n) => { const [x, y] = flatXY(toCam(q)); out.push(`<circle class="ct-sd-marca" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"/><text class="ct-sd-num" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${n}</text>`); };
            count.items.slice(0, count.k).forEach((it, n) => {
                if (count.kind === 'faces') { label(mean(model.f[it].map((k) => model.v[k])), n + 1); }
                if (count.kind === 'edges') {
                    const e = model.edges[it];
                    out.push(`<path d="M${xy(model.v[e.a])}L${xy(model.v[e.b])}" class="ct-sd-arista contada"/>`);
                    label(mul(add(model.v[e.a], model.v[e.b]), 0.5), n + 1);
                }
                if (count.kind === 'vertices') { label(model.v[it], n + 1); }
            });
        }
        svg.innerHTML = out.join('');
        paintText();
    }
    const elements = () => ({ f: model.f.length, e: model.edges.length, v: model.v.length });
    const paintText = () => {
        const name = t('sd_n_' + st.solid), round = model.spec.round;
        let text = name;
        if (count) {
            text = count.k < count.items.length ? `${t('sd_count_' + count.kind)}: ${count.k}` : t('sd_counted_' + count.kind, count.items.length);
        } else if (st.elements) {
            text = `${name}: ${round ? t('sd_round_' + round) : t('sd_elements_n', elements())}`;
        }
        if ($('#sd-sum').textContent !== text) { $('#sd-sum').textContent = text; }
        const euler = $('#sd-euler'), e = elements();
        euler.hidden = !st.elements || !!round || !['secondary', 'advanced'].includes(level());
        if (!euler.hidden) { euler.textContent = t('sd_euler', `${e.f} + ${e.v} − ${e.e} = ${e.f + e.v - e.e}`); }
    };

    // --- Moving ------------------------------------------------------------------------------------------------------
    let raf = 0, last = 0, dragging = false;
    const ease = (k) => k * k * (3 - 2 * k);
    const visible = () => !panel.hidden && panel.offsetParent !== null && !document.hidden;
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    function frame(now) {
        raf = 0;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        if (tw.open) {
            const k = ease(Math.min(1, (now - tw.open.t0) / tw.open.dur));
            open = tw.open.from + (tw.open.to - tw.open.from) * k;
            if (k >= 1) { const done = tw.open.done; tw.open = null; if (done) { done(); } }
            $('#sd-open').value = String(Math.round(open * 100));
        }
        if (tw.cam) {
            const k = ease(Math.min(1, (now - tw.cam.t0) / tw.cam.dur));
            Object.keys(tw.cam.to).forEach((p) => { cam[p] = tw.cam.from[p] + (tw.cam.to[p] - tw.cam.from[p]) * k; });
            if (k >= 1) { tw.cam = null; }
        }
        const spin = st.spin && !dragging && view === '3d' && !count;
        if (spin) { cam.yaw += dt * 0.4; }
        if (!visible()) { return; }
        paint();
        if ((tw.open || tw.cam || spin) && !raf) { raf = requestAnimationFrame(frame); }
    }
    // A finger or a key turns it: what was turning by itself stops (but not the change of perspective).
    const stopTurning = () => {
        if (!tw.cam) { return; }
        delete tw.cam.to.yaw; delete tw.cam.to.pitch;
        if (!Object.keys(tw.cam.to).length) { tw.cam = null; }
    };
    const camTo = (to, dur = 900) => {
        const from = {};
        Object.keys(to).forEach((p) => { from[p] = cam[p]; });
        tw.cam = { from, to, t0: performance.now(), dur };
        kick();
    };
    const openTo = (goal, done, speed = 1) => {
        const dur = (2400 * Math.abs(goal - open)) / speed;
        if (dur < 30) { open = goal; $('#sd-open').value = String(Math.round(open * 100)); paint(); if (done) { done(); } return; }
        tw.open = { from: open, to: goal, t0: performance.now(), dur, done };
        kick();
    };
    // Seen from above when it is open, its net lying along the screen.
    const netYaw = () => {
        const m = moves(model, net, 1);
        const cs = model.f.map((f, i) => mean(f.map((k) => apply(m[i], model.v[k]))));
        const o = mean(cs);
        let xx = 0, zz = 0, xz = 0;
        cs.forEach((q) => { const x = q[0] - o[0], z = q[2] - o[2]; xx += x * x; zz += z * z; xz += x * z; });
        let goal = 0.5 * Math.atan2(2 * xz, xx - zz);
        while (goal - cam.yaw > Math.PI / 2) { goal -= Math.PI; }
        while (goal - cam.yaw < -Math.PI / 2) { goal += Math.PI; }
        return goal;
    };
    const paintFold = () => {
        const can = !!net;
        core.relabel($('#sd-fold'), t(opening ? 'sd_fold' : 'sd_unfold'), opening ? 'juntar' : 'ampliar');
        $('#sd-fold').disabled = !can;
        $('#sd-open').disabled = !can;
        $('#sd-other').hidden = !can || !!model.spec.round;
        $('#sd-count-box').hidden = !!model.spec.round;
        const info = $('#sd-net');
        info.textContent = !can ? t('sd_no_net') : (nets && nets.all && opening ? t('sd_net_n', { n: nets.list.indexOf(net) + 1, all: nets.list.length }) : '');
        info.hidden = !info.textContent;
    };
    const unfold = () => {
        if (!net) { return; }
        stopCount();
        opening = true; paintFold();
        if (view !== '3d' && view !== 'top') { view = 'top'; controls(); }
        openTo(1);
        camTo({ yaw: netYaw(), pitch: Math.PI / 2 - 0.001 });
    };
    const fold = (done, speed) => {
        opening = false; paintFold();
        openTo(0, done, speed);
        if (view === '3d') { camTo({ pitch: 0.42 }); }
    };
    // Another net: closed again (quickly) if it was open, and opened with the new one.
    const otherNet = () => {
        if (!net || model.spec.round) { return; }
        if (!nets) { const all = allNets(model); nets = all ? { all: true, list: all } : { all: false, list: [net] }; }
        let next;
        if (nets.all) {
            next = nets.list[(Math.max(0, nets.list.indexOf(net)) + 1) % nets.list.length];
        } else {
            next = randomNet(model, new Set(nets.list.map((x) => x.sig || signature(flatOf(model, x)))));
            if (next) { nets.list.push(next); } else { next = nets.list[(nets.list.indexOf(net) + 1) % nets.list.length]; }
        }
        stopCount();
        const show = () => { net = next; unfold(); };
        if (open > 0.001) { fold(show, 2.5); } else { show(); }
        play('card');
    };

    // --- Counting ------------------------------------------------------------------------------------------------------
    // In rings from the bottom up, and round each ring.
    const ordered = (kind) => {
        const at = (it) => (kind === 'faces' ? mean(model.f[it].map((k) => model.v[k])) : kind === 'edges' ? mul(add(model.v[model.edges[it].a], model.v[model.edges[it].b]), 0.5) : model.v[it]);
        const n = kind === 'faces' ? model.f.length : kind === 'edges' ? model.edges.length : model.v.length;
        const key = (it) => { const q = at(it); return [Math.round(q[1] * 20), Math.atan2(q[2], q[0])]; };
        return Array.from({ length: n }, (_, i) => i).sort((a, b) => { const p = key(a), q = key(b); return p[0] - q[0] || p[1] - q[1]; });
    };
    function stopCount() { if (count) { clearInterval(count.timer); count = null; } }
    const endCount = () => {
        clearInterval(count.timer);
        count.k = count.items.length;
        play('elegido');
        paint();
        announce(t('sd_counted_' + count.kind, count.items.length));
    };
    const startCount = (kind) => {
        if (!model || model.spec.round) { return; }
        // Again while it counts: all at once.
        if (count && count.kind === kind && count.k < count.items.length) { endCount(); return; }
        stopCount();
        const go = () => {
            count = { kind, items: ordered(kind), k: 0 };
            count.timer = setInterval(() => {
                count.k++;
                play('tic');
                if (count.k >= count.items.length) { endCount(); } else { paint(); }
            }, kind === 'faces' ? 700 : 520);
            paint();
        };
        if (open > 0.001 || opening) { fold(go, 2); } else { go(); }
    };

    // --- Choosing and touching ---------------------------------------------------------------------------------------
    const fillWhich = () => {
        const keys = offered();
        if (!keys.includes(st.solid)) { st.solid = keys[0]; }
        $('#sd-which').innerHTML = GROUPS.map((g) => {
            const here = keys.filter((k) => SOLIDS[k].group === g);
            return here.length ? `<optgroup label="${escape(t('sd_group_' + g))}">${here.map((k) => `<option value="${k}">${escape(t('sd_n_' + k))}</option>`).join('')}</optgroup>` : '';
        }).join('');
        $('#sd-which').value = st.solid;
    };
    const choose = (key) => {
        if (!SOLIDS[key]) { return; }
        stopCount();
        tw.open = null;
        st.solid = key; keep();
        if ($('#sd-which').value !== key) { $('#sd-which').value = key; }
        model = build(key); net = model.net; nets = null;
        open = 0; opening = false;
        $('#sd-open').value = '0';
        if (view === '3d') { cam.pitch = 0.42; }
        paintFold(); paintClear(); paint(); kick();
    };
    const paintClear = () => { $('#sd-clear').hidden = !Object.keys(painted[st.solid] || {}).length; };
    const paintFace = (i) => {
        const p = painted[st.solid] || (painted[st.solid] = {});
        const now = p[i] === undefined ? 0 : p[i] + 1;
        if (now >= PAINT.length) { delete p[i]; } else { p[i] = now; }
        play('tic'); paintClear(); paint();
    };
    const setView = (v) => {
        view = VIEWS[v] === undefined ? '3d' : v;
        panel.querySelectorAll('#sd-view button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === view)));
        if (VIEWS[view]) {
            let yaw = VIEWS[view][0];
            while (yaw - cam.yaw > Math.PI) { yaw -= 2 * Math.PI; }
            while (yaw - cam.yaw < -Math.PI) { yaw += 2 * Math.PI; }
            camTo({ yaw, pitch: VIEWS[view][1], persp: 0 });
        } else {
            camTo({ persp: 0.2, pitch: opening ? cam.pitch : 0.42 });
        }
    };
    const controls = () => {
        $('#sd-see').checked = !!st.see; $('#sd-spin').checked = !!st.spin; $('#sd-elements').checked = !!st.elements;
        panel.querySelectorAll('#sd-view button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === view)));
    };

    $('#sd-which').addEventListener('change', () => { byMode.set({ solid: $('#sd-which').value }); choose($('#sd-which').value); play('card'); });
    $('#sd-fold').addEventListener('click', () => { if (opening) { fold(); } else { unfold(); } });
    $('#sd-open').addEventListener('input', () => {
        tw.open = null; stopCount();
        open = Number($('#sd-open').value) / 100;
        if ((open > 0.5) !== opening) { opening = open > 0.5; paintFold(); }
        paint();
    });
    $('#sd-other').addEventListener('click', otherNet);
    $('#sd-counts').addEventListener('click', (e) => { const b = e.target.closest('[data-count]'); if (b) { startCount(b.dataset.count); } });
    $('#sd-view').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { setView(b.dataset.v); } });
    $('#sd-see').addEventListener('change', () => { st.see = $('#sd-see').checked; keep(); paint(); });
    $('#sd-spin').addEventListener('change', () => { st.spin = $('#sd-spin').checked; keep(); kick(); });
    $('#sd-elements').addEventListener('change', () => { st.elements = $('#sd-elements').checked; byMode.set({ elements: st.elements }); keep(); paint(); });
    $('#sd-clear').addEventListener('click', () => { delete painted[st.solid]; paintClear(); paint(); });

    // A finger or the mouse turns it (and a tap paints a face); two fingers or the wheel bring it closer.
    const fingers = new Map();
    let press = null, pinch = null;
    const leaveView = () => { if (view !== '3d') { view = '3d'; controls(); camTo({ persp: 0.2 }, 400); } };
    svg.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        svg.focus({ preventScroll: true });
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* not there */ }
        fingers.set(e.pointerId, [e.clientX, e.clientY]);
        if (fingers.size === 1) {
            const f = e.target.closest && e.target.closest('[data-f]');
            press = { x: e.clientX, y: e.clientY, moved: false, face: f ? Number(f.dataset.f) : -1 };
            dragging = true;
        } else if (fingers.size === 2) {
            const [a, b] = [...fingers.values()];
            pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, zoom: cam.zoom };
            press = null;
        }
    });
    svg.addEventListener('pointermove', (e) => {
        if (!fingers.has(e.pointerId)) { return; }
        const before = fingers.get(e.pointerId);
        fingers.set(e.pointerId, [e.clientX, e.clientY]);
        if (pinch && fingers.size === 2) {
            const [a, b] = [...fingers.values()];
            cam.zoom = Math.max(0.4, Math.min(3, (pinch.zoom * Math.hypot(a[0] - b[0], a[1] - b[1])) / pinch.d));
            paint();
            return;
        }
        if (!press) { return; }
        if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 6) { return; }
        press.moved = true;
        stopTurning();
        leaveView();
        cam.yaw += (e.clientX - before[0]) * 0.01;
        cam.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cam.pitch + (e.clientY - before[1]) * 0.01));
        paint();
    });
    const up = (e) => {
        fingers.delete(e.pointerId);
        if (fingers.size < 2) { pinch = null; }
        if (press && !press.moved && press.face >= 0 && e.type === 'pointerup') { paintFace(press.face); }
        if (!fingers.size) { press = null; dragging = false; kick(); }
    };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        cam.zoom = Math.max(0.4, Math.min(3, cam.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
        paint();
    }, { passive: false });
    svg.addEventListener('keydown', (e) => {
        const step = 0.15;
        const keys = { ArrowLeft: () => { cam.yaw -= step; }, ArrowRight: () => { cam.yaw += step; },
            ArrowUp: () => { cam.pitch = Math.max(-Math.PI / 2, cam.pitch - step); }, ArrowDown: () => { cam.pitch = Math.min(Math.PI / 2, cam.pitch + step); },
            '+': () => { cam.zoom = Math.min(3, cam.zoom * 1.1); }, '-': () => { cam.zoom = Math.max(0.4, cam.zoom / 1.1); } };
        if (!keys[e.key]) { return; }
        e.preventDefault();
        if (e.key.startsWith('Arrow')) { stopTurning(); leaveView(); }
        keys[e.key]();
        paint();
    });
    document.addEventListener('classtools:mode', () => {
        const v = byMode.get();
        if (v.elements !== undefined) { st.elements = !!v.elements; }
        st.solid = SOLIDS[v.solid] ? v.solid : st.solid;
        fillWhich(); controls();
        choose(st.solid);
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { kick(); } });

    fillWhich(); controls();
    choose(st.solid);

    window.ClasstoolsSolids = {   // for automated tests
        SOLIDS, build, allNets, randomNet, flatOf, overlaps, signature, moves, choose, startCount, otherNet, setView, paintFace,
        unfold, fold, elements: () => elements(), model: () => model, net: () => net, nets: () => nets,
        setOpen: (k) => { tw.open = null; open = k; opening = k > 0.5; $('#sd-open').value = String(Math.round(k * 100)); paintFold(); paint(); },
        state: () => ({ open, opening, view, cam: Object.assign({}, cam), count: count && { kind: count.kind, k: count.k, n: count.items.length } }),
    };
})();
