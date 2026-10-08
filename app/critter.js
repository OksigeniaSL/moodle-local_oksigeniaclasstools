// Critters: a little creature drawn from a seed (always the same one for the same seed), and its name made of an
// animal and a word from the content pack («Búho valiente», «Brave owl»). Used for those who take part in a live
// session without their name: the board and their device show the same critter and the same name.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    // A seeded random generator (xmur3 to spread the seed, mulberry32 to draw from it).
    const xmur3 = (str) => {
        let h = 1779033703 ^ str.length;
        for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
        return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
    };
    const random = (seed) => {
        let a = xmur3(String(seed))();
        const next = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        return { f: next, i: (n) => Math.floor(next() * n), pick: (l) => l[Math.floor(next() * l.length)], between: (a1, b1) => a1 + next() * (b1 - a1) };
    };
    const HUES = [355, 18, 42, 96, 145, 178, 205, 228, 262, 300, 330];
    const hsl = (h, s, l) => `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;

    const svg = (seed, title = '') => {
        const R = random('critter:' + seed);
        const h = R.pick(HUES) + R.between(-8, 8);
        const body = hsl(h, R.between(62, 78), R.between(52, 60)), belly = hsl(h, 80, 82), line = hsl(h, 45, 22);
        const other = hsl(h + R.pick([150, 180, 210]), 75, 60);
        const shape = R.i(6), eyes = R.pick([2, 2, 2, 2, 1, 3]), look = R.pick(['round', 'round', 'round', 'happy', 'sleepy']);
        const top = R.i(7), mouth = R.i(6), extra = R.pick(['none', 'none', 'glasses', 'shades', 'bow', 'cap', 'headphones']);
        const spots = R.f() < 0.35, cheeks = R.f() < 0.5, feet = R.f() < 0.7;
        const p = [];
        const stroke = `stroke="${line}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
        // Top: antennae, ears, horns, a tuft, a sprout, or nothing.
        if (top === 0) { p.push(`<path d="M38 26 Q32 12 26 8 M62 26 Q68 12 74 8" fill="none" ${stroke}/><circle cx="26" cy="8" r="5" fill="${other}" ${stroke}/><circle cx="74" cy="8" r="5" fill="${other}" ${stroke}/>`); }
        if (top === 1) { p.push(`<circle cx="28" cy="24" r="10" fill="${body}" ${stroke}/><circle cx="72" cy="24" r="10" fill="${body}" ${stroke}/>`); }
        if (top === 2) { p.push(`<path d="M24 34 L28 10 L42 26 Z M76 34 L72 10 L58 26 Z" fill="${body}" ${stroke}/>`); }
        if (top === 3) { p.push(`<path d="M36 26 Q34 14 40 10 M50 22 Q50 8 54 4 M64 26 Q66 14 60 10" fill="none" ${stroke}/>`); }
        if (top === 4) { p.push(`<path d="M50 24 V12" ${stroke}/><path d="M50 13 Q40 4 34 10 Q42 16 50 13 Z M50 13 Q60 4 66 10 Q58 16 50 13 Z" fill="hsl(130 55% 50%)" ${stroke}/>`); }
        if (top === 5) { p.push(`<path d="M34 30 Q30 18 36 12 Q40 20 42 28 M66 30 Q70 18 64 12 Q60 20 58 28" fill="${other}" ${stroke}/>`); }
        // Feet, under the body.
        if (feet) { p.push(`<ellipse cx="36" cy="90" rx="9" ry="5" fill="${other}" ${stroke}/><ellipse cx="64" cy="90" rx="9" ry="5" fill="${other}" ${stroke}/>`); }
        // The body.
        const bodies = [
            '<ellipse cx="50" cy="56" rx="34" ry="32"', '<circle cx="50" cy="56" r="33"',
            '<path d="M50 20 C76 20 84 50 84 64 C84 82 68 90 50 90 C32 90 16 82 16 64 C16 50 24 20 50 20 Z"',
            '<rect x="17" y="24" width="66" height="64" rx="22"', '<path d="M50 22 C68 22 72 38 78 54 C86 74 72 90 50 90 C28 90 14 74 22 54 C28 38 32 22 50 22 Z"',
            '<path d="M18 56 C18 36 32 22 50 22 C68 22 82 36 82 56 V86 Q75 80 68 86 Q61 92 54 86 Q47 80 40 86 Q33 92 26 86 Q22 82 18 86 Z"',
        ];
        p.push(`${bodies[shape]} fill="${body}" ${stroke}/>`);
        p.push(`<ellipse cx="50" cy="70" rx="20" ry="14" fill="${belly}" opacity=".9"/>`);
        if (spots) { p.push(`<circle cx="28" cy="52" r="4" fill="${other}" opacity=".8"/><circle cx="74" cy="46" r="3" fill="${other}" opacity=".8"/><circle cx="70" cy="62" r="2.5" fill="${other}" opacity=".8"/>`); }
        // Eyes.
        const xs = eyes === 1 ? [50] : (eyes === 2 ? [38, 62] : [34, 50, 66]), r = eyes === 3 ? 6 : (eyes === 1 ? 11 : 8.5);
        const gx = R.between(-1.5, 1.5), gy = R.between(-1, 1.5);
        xs.forEach((x) => {
            if (look === 'happy') { p.push(`<path d="M${x - r * 0.8} 48 Q${x} ${48 - r * 1.1} ${x + r * 0.8} 48" fill="none" ${stroke}/>`); return; }
            p.push(`<circle cx="${x}" cy="46" r="${r}" fill="#fff" ${stroke}/><circle cx="${x + gx}" cy="${46 + gy}" r="${r * 0.48}" fill="${line}"/><circle cx="${x + gx + r * 0.2}" cy="${46 + gy - r * 0.22}" r="${r * 0.16}" fill="#fff"/>`);
            if (look === 'sleepy') { p.push(`<path d="M${x - r} 46 A${r} ${r} 0 0 1 ${x + r} 46 Z" fill="${body}" ${stroke}/>`); }
        });
        if (cheeks) { p.push(`<ellipse cx="27" cy="60" rx="5" ry="3" fill="hsl(350 85% 72%)" opacity=".7"/><ellipse cx="73" cy="60" rx="5" ry="3" fill="hsl(350 85% 72%)" opacity=".7"/>`); }
        // Mouth.
        const mouths = [
            `<path d="M40 64 Q50 72 60 64" fill="none" ${stroke}/>`,
            `<path d="M39 62 Q50 76 61 62 Z" fill="${line}" ${stroke}/><path d="M45 68 Q50 72 55 68" fill="hsl(350 80% 65%)"/>`,
            `<ellipse cx="50" cy="66" rx="4" ry="5" fill="${line}"/>`,
            `<path d="M40 63 Q45 68 50 63 Q55 68 60 63" fill="none" ${stroke}/>`,
            `<path d="M40 63 Q50 71 60 63" fill="none" ${stroke}/><rect x="46" y="65" width="8" height="5" rx="1" fill="#fff" stroke="${line}" stroke-width="1.5"/>`,
            `<path d="M42 64 H58" ${stroke}/><path d="M53 64 Q56 72 59 64" fill="hsl(350 80% 65%)" ${stroke}/>`,
        ];
        p.push(mouths[mouth]);
        // Something to wear.
        if (extra === 'glasses' && eyes === 2) { p.push(`<g fill="none" ${stroke}><circle cx="38" cy="46" r="11"/><circle cx="62" cy="46" r="11"/><path d="M49 46 H51"/></g>`); }
        if (extra === 'shades' && eyes === 2) { p.push(`<path d="M25 40 H75 V46 Q75 56 63 56 Q53 56 52 46 H48 Q47 56 37 56 Q25 56 25 46 Z" fill="${line}"/><path d="M30 43 L35 43" stroke="#fff" stroke-width="2" opacity=".6"/>`); }
        if (extra === 'bow') { p.push(`<path d="M50 84 L40 78 V90 Z M50 84 L60 78 V90 Z" fill="${other}" ${stroke}/><circle cx="50" cy="84" r="3" fill="${other}" ${stroke}/>`); }
        if (extra === 'cap') { p.push(`<path d="M26 32 Q28 14 50 14 Q72 14 74 32 Z" fill="${other}" ${stroke}/><path d="M66 30 H86 Q86 36 74 36" fill="${other}" ${stroke}/>`); }
        if (extra === 'headphones') { p.push(`<path d="M20 50 Q20 16 50 16 Q80 16 80 50" fill="none" ${stroke}/><rect x="13" y="44" width="11" height="18" rx="5" fill="${other}" ${stroke}/><rect x="76" y="44" width="11" height="18" rx="5" fill="${other}" ${stroke}/>`); }
        return `<svg class="ct-critter" viewBox="0 0 100 100" role="img" aria-label="${String(title).replace(/[&<>"]/g, '')}">${p.join('')}</svg>`;
    };

    // The name: an animal and a word of the pack, in the order of the language; the first letter in capitals.
    const name = (seed, pack) => {
        if (!pack || !pack.animals || !pack.words) { return ''; }
        const R = random('name:' + seed);
        const a = R.pick(pack.animals), w = R.pick(pack.words);
        const n = pack.order === 'wa' ? `${w}${pack.join}${a}` : `${a}${pack.join}${w}`;
        return n.charAt(0).toLocaleUpperCase() + n.slice(1);
    };

    window.ClasstoolsCritter = { svg, name };
})();
