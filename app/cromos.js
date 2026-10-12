// Stickers for the teachers: one per tool, earned by practising its guided help and raised a level by using the tool
// with a class. Each one is a critter of the board (critter.js, always the same seed for the same tool) wearing the
// costume of its tool; the frame tells the level, as in a sticker album: learned, white, bronze, silver, gold and
// shiny. In the Superior screen mode, a sober badge instead. Everything is SVG drawn here; the texts come from outside
// (language strings), so a sticker is translated with the rest of the plugin.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const INK = '#1d2433';
    const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
    const S2 = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
    const GLOVE = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="0" rx="8" ry="6.5" fill="#fff" ${S}/>`
        + `<path d="M-3 -5 V-1 M1 -6 V-1 M5 -5 V-1" fill="none" ${S2}/></g>`;
    const WOOD = '#9a6334';
    // A stick with its ink outline.
    const stick = (d, colour = WOOD, w = 5) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 4}" stroke-linecap="round"/>`
        + `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round"/>`;
    const cloud = (x, y, k = 1) => `<path transform="translate(${x} ${y}) scale(${k})" d="M-14 6 Q-20 6 -20 0 Q-20 -7 -12 -7 Q-10 -15 -1 -14 Q6 -19 12 -12 Q20 -12 20 -3 Q22 6 14 6 Z" fill="#fff" ${S}/>`;

    // Each tool: its critter, its family (colour of the panel) and its costume, drawn in the critter's 100×100 space
    // (it may stick out of it). The icon is the costume alone, as white lines, for the badge of the Superior mode.
    const TOOLS = {
        domamoviles: {
            box: [13, -14, 123, 96],
            seed: 'cromo-560', family: 'live',
            costume: () => `
                <g transform="rotate(-9 50 22)">
                    <path d="M35 23 L37.5 -7 Q50 -10 62.5 -7 L65 23 Z" fill="#ce1423" ${S}/>
                    <path d="M36.6 12 L63.4 12 L64 19 L36 19 Z" fill="#fbbe17" ${S2}/>
                    <ellipse cx="50" cy="23" rx="23" ry="5.5" fill="#ce1423" ${S}/>
                </g>
                <ellipse cx="111" cy="50" rx="10" ry="23" fill="none" stroke="${INK}" stroke-width="9"/>
                <ellipse cx="111" cy="50" rx="10" ry="23" fill="none" stroke="#fbbe17" stroke-width="4" stroke-dasharray="7 5"/>
                <path d="M86 30 h-10 M88 38 h-14 M86 46 h-9" fill="none" ${S2} opacity=".7"/>
                <g transform="rotate(-28 104 46)"><rect x="96" y="34" width="16" height="26" rx="4" fill="${INK}"/>
                    <rect x="99" y="37.5" width="10" height="17" rx="1.5" fill="#8fd0ff"/><circle cx="104" cy="57" r="1.3" fill="#fff"/></g>`,
            icon: '<rect x="-14" y="-24" width="28" height="44" rx="7"/><path d="M-6 13 h12"/><ellipse cx="0" cy="-2" rx="30" ry="34" stroke-dasharray="9 7"/>',
        },
        cuentavotos: {
            box: [13, 8, 114, 96],
            seed: 'cromo-386', family: 'live',
            costume: () => `
                <path d="M19 37 Q50 23 81 37" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
                <path d="M19 37 Q50 23 81 37" fill="none" stroke="#067e36" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M27 36 Q50 27 73 36 L69 43 Q50 36 31 43 Z" fill="#2fb36a" fill-opacity=".55" ${S}/>
                <g transform="rotate(6 96 60)"><rect x="88" y="44" width="17" height="22" rx="2" fill="#fff" ${S}/>
                    <path d="M92 55 l3.5 4 l6 -8" fill="none" stroke="#067e36" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>
                <rect x="78" y="64" width="34" height="28" rx="4" fill="#164281" ${S}/>
                <path d="M86 64 h18" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
                <rect x="84" y="74" width="22" height="8" rx="2" fill="#fbbe17" ${S2}/>`,
            icon: '<rect x="-24" y="-2" width="48" height="30" rx="5"/><path d="M-12 -2 h24"/><path d="M-11 -30 h22 v24 h-22 z"/><path d="M-6 -18 l4 5 l8 -10"/>',
        },
        atrapanubes: {
            box: [-27, -22, 133, 96],
            seed: 'cromo-3015', family: 'live',
            costume: () => `
                ${stick('M80 84 L114 22')}
                <path d="M104 18 Q102 44 118 46 Q132 46 130 22" fill="#fff" fill-opacity=".55" ${S2}/>
                <path d="M107 26 Q117 34 128 28 M106 34 Q117 42 127 36 M112 20 Q113 36 117 46 M121 18 Q123 34 122 46" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".55"/>
                ${cloud(117, 32, 0.62)}
                <ellipse cx="117" cy="19" rx="14" ry="6" fill="none" stroke="${INK}" stroke-width="6"/>
                <ellipse cx="117" cy="19" rx="14" ry="6" fill="none" stroke="#fbbe17" stroke-width="2.5"/>
                ${GLOVE(80, 82, -20)}
                ${cloud(-14, 6, 0.55)}${cloud(12, -14, 0.4)}`,
            icon: '<path d="M-22 30 L12 -8"/><ellipse cx="18" cy="-18" rx="16" ry="9" transform="rotate(-25 18 -18)"/><path d="M4 -12 Q8 8 22 4 Q32 0 30 -22"/><path d="M-20 -26 q-6 0 -6 -6 q0 -7 8 -7 q2 -8 10 -7 q7 -4 11 3 q8 0 7 9 z"/>',
        },
        lanzapreguntas: {
            box: [-3, -18, 132, 101],
            seed: 'cromo-844', family: 'live',
            costume: () => `
                <path d="M30 70 Q56 -10 120 30" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="2 6" opacity=".5"/>
                ${stick('M4 100 L10 76 M10 76 L1 58 M10 76 L21 60', WOOD, 5)}
                <path d="M1 58 Q12 74 21 60" fill="none" stroke="#ce1423" stroke-width="2.5"/>
                ${GLOVE(12, 70, 10)}
                <g font-family="Nunito, system-ui, sans-serif" font-weight="900" stroke="${INK}" stroke-width="3" paint-order="stroke" stroke-linejoin="round">
                    <text x="62" y="10" font-size="26" fill="#ce1423" transform="rotate(14 62 10)">?</text>
                    <text x="92" y="14" font-size="32" fill="#fbbe17" transform="rotate(-10 92 14)">?</text>
                    <text x="114" y="44" font-size="22" fill="#2fb36a" transform="rotate(22 114 44)">?</text>
                </g>`,
            icon: '<path d="M-18 34 L-12 6 M-12 6 L-24 -14 M-12 6 L2 -12"/><path d="M-24 -14 Q-10 6 2 -12"/><path d="M12 -26 q0 -10 10 -10 q10 0 10 9 q0 7 -10 10 v6"/><circle cx="22" cy="0" r="1.5"/>',
        },
        tocatimbres: {
            box: [0, 8, 100, 99],
            seed: 'cromo-1816', family: 'live',
            costume: () => `
                <path d="M14 66 l-9 -4 M12 78 l-10 1 M86 66 l9 -4 M88 78 l10 1 M30 60 l-5 -8 M70 60 l5 -8" fill="none" stroke="#fbbe17" stroke-width="5" stroke-linecap="round"/>
                <path d="M14 66 l-9 -4 M12 78 l-10 1 M86 66 l9 -4 M88 78 l10 1 M30 60 l-5 -8 M70 60 l5 -8" fill="none" ${S2}/>
                <rect x="20" y="84" width="60" height="14" rx="5" fill="#3a4152" ${S}/>
                <path d="M28 86 Q28 66 50 66 Q72 66 72 86 Z" fill="#ce1423" ${S}/>
                <path d="M36 76 Q38 70 46 69" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".65"/>
                ${GLOVE(43, 67, -12)}${GLOVE(58, 66, 14)}`,
            icon: '<rect x="-30" y="12" width="60" height="16" rx="5"/><path d="M-22 12 Q-22 -16 0 -16 Q22 -16 22 12"/><path d="M-36 -10 l-9 -5 M36 -10 l9 -5 M-14 -26 l-5 -8 M14 -26 l5 -8"/>',
        },
        mandamas: {
            box: [13, -8, 122, 96],
            seed: 'cromo-614', family: 'live',
            costume: () => `
                <path d="M33 26 L30 2 L40 14 L50 -4 L60 14 L70 2 L67 26 Z" fill="#fbbe17" ${S}/>
                <circle cx="50" cy="16" r="3" fill="#ce1423" ${S2}/><circle cx="38.5" cy="20" r="2.2" fill="#164281"/><circle cx="61.5" cy="20" r="2.2" fill="#164281"/>
                <path d="M100 38 q8 -6 14 2 M104 30 q12 -9 22 4" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
                <g transform="rotate(-24 94 58)"><rect x="86" y="40" width="16" height="36" rx="5" fill="#2b2f3a" ${S}/>
                    <circle cx="94" cy="48" r="3" fill="#ce1423"/><circle cx="90.5" cy="56" r="1.8" fill="#fbbe17"/><circle cx="97.5" cy="56" r="1.8" fill="#2fb36a"/>
                    <circle cx="90.5" cy="62" r="1.8" fill="#8fd0ff"/><circle cx="97.5" cy="62" r="1.8" fill="#8fd0ff"/></g>
                ${GLOVE(88, 66, -24)}`,
            icon: '<path d="M-26 -8 L-20 -32 L-9 -18 L0 -36 L9 -18 L20 -32 L26 -8 Z"/><rect x="-10" y="2" width="20" height="34" rx="5"/><circle cx="0" cy="12" r="3"/><path d="M16 4 q8 -6 14 2"/>',
        },
        cuentamanos: {
            box: [-8, -4, 108, 100],
            seed: 'cromo-1251', family: 'live',
            costume: () => `
                <path d="M2 24 l-8 -6 M4 12 l-6 -9 M98 24 l8 -6 M96 12 l6 -9" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
                ${stick('M14 44 L8 22', '#f3c6a4', 4)}${stick('M86 44 L92 22', '#f3c6a4', 4)}
                ${GLOVE(8, 18, 160)}${GLOVE(92, 18, -160)}
                <rect x="34" y="78" width="32" height="20" rx="6" fill="#c9d3e0" ${S}/>
                <rect x="39" y="82" width="22" height="11" rx="2" fill="#1d2433"/>
                <text x="50" y="91" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="9" font-weight="700" fill="#7CFFB2">19</text>
                <rect x="45" y="72" width="10" height="7" rx="2" fill="#ce1423" ${S2}/>`,
            icon: '<path d="M-24 -22 V22 M-12 -22 V22 M0 -22 V22 M12 -22 V22 M-32 16 L22 -16"/>',
        },
        tocanotas: {
            box: [-6, -14, 112, 104],
            seed: 'cromo-1520', family: 'material',
            costume: () => `
                <g font-family="Nunito, system-ui, sans-serif" font-weight="900" stroke="${INK}" stroke-width="2.5" paint-order="stroke" stroke-linejoin="round">
                    <text x="72" y="8" font-size="22" fill="#5b2fb8" transform="rotate(12 72 8)">♪</text>
                    <text x="90" y="26" font-size="18" fill="#ce1423" transform="rotate(-10 90 26)">♫</text>
                    <text x="-4" y="14" font-size="18" fill="#067e36" transform="rotate(-14 -4 14)">♪</text></g>
                <rect x="10" y="84" width="80" height="16" rx="4" fill="#7a4a24" ${S}/>
                ${['#e53935', '#fb8c00', '#fbc02d', '#43a047', '#00acc1', '#3949ab', '#8e24aa'].map((c, i) => `<rect x="${14 + i * 10.6}" y="${80 - (i % 2)}" width="9" height="${18 - i}" rx="2" fill="${c}" stroke="${INK}" stroke-width="1.6"/>`).join('')}
                ${stick('M88 62 L104 40', '#c9d3e0', 3)}<circle cx="105" cy="38" r="5" fill="#ce1423" ${S2}/>
                ${GLOVE(86, 64, -30)}`,
            icon: '<rect x="-30" y="10" width="60" height="14" rx="3"/><path d="M-24 10 v12 M-14 10 v11 M-4 10 v10 M6 10 v9 M16 10 v8"/><path d="M8 -30 v24 a6 6 0 1 1 -6 -6 h6 M8 -30 l14 4 v6 l-14 -4"/>',
        },
        salvaglobos: {
            box: [-24, -30, 104, 96],
            seed: 'cromo-374', family: 'games',
            costume: () => `
                <path d="M84 70 Q60 40 -2 6 M84 70 Q66 30 18 -8 M84 70 Q74 34 40 -14 M84 70 Q82 40 66 -4" fill="none" stroke="${INK}" stroke-width="1.4"/>
                ${[[-6, -2, '#e53935'], [16, -16, '#fbc02d'], [40, -22, '#1e88e5'], [66, -12, '#43a047']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="13" fill="${c}" ${S}/><path d="M${x - 4} ${y - 6} q2 -4 6 -4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><path d="M${x - 2} ${y + 13} l2 3 l2 -3 z" fill="${c}" ${S2}/>`).join('')}
                ${GLOVE(84, 70, -20)}`,
            icon: '<ellipse cx="-14" cy="-14" rx="12" ry="14"/><ellipse cx="12" cy="-20" rx="12" ry="14"/><path d="M-14 0 Q-6 18 0 30 M12 -6 Q6 14 0 30"/>',
        },
        cazaletras: {
            box: [-22, -22, 122, 104],
            seed: 'cromo-1172', family: 'games',
            costume: () => `
                <circle cx="50" cy="48" r="64" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="3 7" opacity=".45"/>
                ${[['A', -150], ['B', -118], ['C', -86], ['D', -54], ['E', -22], ['Z', 170]].map(([l, a], i) => { const r = 64, x = 50 + r * Math.cos(a * Math.PI / 180), y = 48 + r * Math.sin(a * Math.PI / 180);
                    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${i === 0 ? '#fbbe17' : '#164281'}" ${S}/><text x="${x.toFixed(1)}" y="${(y + 4.5).toFixed(1)}" text-anchor="middle" font-family="Nunito, system-ui, sans-serif" font-weight="900" font-size="12" fill="${i === 0 ? INK : '#fff'}">${l}</text>`; }).join('')}
                ${GLOVE(10, 30, 140)}`,
            icon: '<circle cx="0" cy="0" r="28" stroke-dasharray="4 8"/><circle cx="-20" cy="-20" r="9"/><path d="M-23 -16 l3 -9 l3 9 M-21.5 -19 h3"/><circle cx="20" cy="-20" r="9"/><circle cx="28" cy="4" r="9"/>',
        },
        tiradados: {
            box: [-8, -10, 118, 98],
            seed: 'cromo-329', family: 'chance',
            costume: () => {
                const die = (x, y, r, n) => {
                    const P = { 1: [[0, 0]], 3: [[-5, -5], [0, 0], [5, 5]], 5: [[-5, -5], [5, -5], [0, 0], [-5, 5], [5, 5]], 6: [[-5, -6], [5, -6], [-5, 0], [5, 0], [-5, 6], [5, 6]] }[n];
                    return `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-11" y="-11" width="22" height="22" rx="5" fill="#fff" ${S}/>${P.map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.1" fill="${INK}"/>`).join('')}</g>`;
                };
                return `<path d="M70 70 q12 -10 18 -26 M78 82 q16 -6 26 -20 M64 58 q4 -14 14 -24" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".55"/>
                    ${die(98, 22, 18, 5)}${die(104, 58, -14, 3)}${die(0, 6, -20, 6)}${GLOVE(80, 76, -30)}`;
            },
            icon: '<rect x="-30" y="-14" width="28" height="28" rx="6" transform="rotate(-12 -16 0)"/><rect x="4" y="-8" width="28" height="28" rx="6" transform="rotate(14 18 6)"/><circle cx="-16" cy="0" r="2"/><circle cx="12" cy="0" r="2"/><circle cx="24" cy="12" r="2"/>',
        },
        cumplemetas: {
            box: [-6, -26, 116, 96],
            seed: 'cromo-788', family: 'score',
            costume: () => `
                ${stick('M88 86 L96 -12', '#c9d3e0', 3)}
                <path d="M96 -12 L126 -6 L124 16 L94 10 Z" fill="#fff" ${S}/>
                ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => ((r + c) % 2 ? '' : `<path d="M${96 + c * 10 - r * 0.4} ${-12 + c * 2 + r * 7.3} l10 2 l-0.4 7.3 l-10 -2 z" fill="${INK}"/>`)).join('')).join('')}
                ${GLOVE(88, 70, -10)}
                ${['#ce1423', '#fbbe17', '#067e36', '#164281', '#5b2fb8'].map((c, i) => `<rect x="${4 + i * 17}" y="${-14 + (i % 3) * 8}" width="5" height="9" rx="1" fill="${c}" transform="rotate(${i * 37 - 40} ${6 + i * 17} ${-10 + (i % 3) * 8})"/>`).join('')}`,
            icon: '<path d="M-20 34 L-12 -34"/><path d="M-12 -34 L26 -28 L23 -2 L-15 -8 Z"/><path d="M1 -31 l-2 13 l13 2 l2 -13 M-14 -21 l13 2 M10 -17 l13 2"/>',
        },
        pasalimpios: {
            box: [-10, -6, 120, 100],
            seed: 'cromo-716', family: 'board',
            costume: () => `
                <path d="M-4 36 L10 8 L24 36 Z" fill="none" stroke="#164281" stroke-width="2.5" stroke-dasharray="1 0" opacity=".35" transform="rotate(4 10 22)"/>
                <path d="M-6 38 L9 6 L25 38 Z" fill="none" stroke="#164281" stroke-width="3" stroke-linejoin="round"/>
                <path d="M30 22 l6 0" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M34 19 l3 3 l-3 3" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
                <circle cx="104" cy="16" r="13" fill="none" stroke="#ce1423" stroke-width="3"/>
                <g transform="translate(96 62) rotate(-38)"><rect x="-4" y="-22" width="8" height="34" rx="2" fill="#164281" ${S2}/><path d="M-4 12 L0 20 L4 12 Z" fill="#fbbe17" ${S2}/></g>
                ${GLOVE(88, 68, -30)}`,
            icon: '<path d="M-30 18 L-14 -18 L2 18 Z"/><circle cx="20" cy="0" r="14"/><path d="M-28 28 h56"/>',
        },
        quitatelones: {
            box: [-16, -16, 116, 100],
            seed: 'cromo-1001', family: 'board',
            costume: () => `
                <path d="M-14 -14 H114" stroke="#8a5a00" stroke-width="6" stroke-linecap="round"/>
                <path d="M-12 -12 Q-4 30 -10 74 L8 74 Q14 30 6 -12 Z" fill="#ce1423" ${S}/>
                <path d="M112 -12 Q104 30 110 74 L92 74 Q86 30 94 -12 Z" fill="#ce1423" ${S}/>
                <path d="M-6 0 Q-2 30 -4 70 M106 0 Q102 30 104 70" fill="none" stroke="#fff" stroke-width="1.6" opacity=".45"/>
                <path d="M6 30 q8 -4 12 2" fill="none" stroke="#fbbe17" stroke-width="3" stroke-linecap="round"/>
                ${GLOVE(10, 34, 70)}`,
            icon: '<path d="M-34 -30 H34"/><path d="M-32 -28 Q-26 0 -30 30 H-16 Q-12 0 -18 -28 M32 -28 Q26 0 30 30 H16 Q12 0 18 -28"/>',
        },
        trazacirculos: {
            box: [-6, -18, 118, 102],
            seed: 'cromo-1316', family: 'board',
            costume: () => `
                <circle cx="76" cy="66" r="34" fill="none" stroke="#164281" stroke-width="2.5" stroke-dasharray="190 30"/>
                <path d="M76 6 L66 66 M76 6 L104 52" stroke="#6b7684" stroke-width="5" stroke-linecap="round"/>
                <path d="M76 6 L66 66 M76 6 L104 52" fill="none" stroke="${INK}" stroke-width="1.4" opacity=".4"/>
                <circle cx="76" cy="6" r="6" fill="#164281" ${S2}/>
                <circle cx="66" cy="67" r="2.5" fill="${INK}"/><path d="M104 52 l4 10" stroke="#fbbe17" stroke-width="4" stroke-linecap="round"/>
                ${GLOVE(80, 10, 150)}`,
            icon: '<path d="M0 -34 L-14 26 M0 -34 L22 18"/><circle cx="0" cy="-34" r="5"/><path d="M-26 24 A30 30 0 0 0 26 26" stroke-dasharray="6 6"/>',
        },
        repartequipos: {
            box: [-34, 8, 134, 96],
            seed: 'cromo-1096', family: 'groups',
            costume: () => `
                ${stick('M6 70 L-4 14')}<path d="M-3 16 L-30 26 L0 36 Z" fill="#ce1423" ${S}/>
                ${stick('M94 70 L104 14')}<path d="M103 16 L130 26 L100 36 Z" fill="#164281" ${S}/>
                ${GLOVE(6, 70, 10)}${GLOVE(94, 70, -10)}
                <path d="M20 52 Q30 82 50 82 Q70 82 80 52" fill="none" stroke="${INK}" stroke-width="1.8"/>
                <g transform="rotate(-12 50 84)"><rect x="40" y="78" width="22" height="12" rx="6" fill="#c9d3e0" ${S}/>
                    <rect x="58" y="80" width="10" height="6" rx="2" fill="#c9d3e0" ${S2}/><circle cx="47" cy="84" r="2.5" fill="#ce1423"/></g>`,
            icon: '<path d="M-28 30 L-36 -30 M28 30 L36 -30"/><path d="M-35 -28 L-6 -18 L-33 -8 Z M35 -28 L6 -18 L33 -8 Z"/><rect x="-12" y="8" width="20" height="12" rx="6"/><path d="M8 11 h8"/>',
        },
        sacanombres: {
            box: [13, -8, 126, 106],
            seed: 'cromo-418', family: 'chance',
            costume: () => `
                <path d="M72 84 Q90 70 92 52 Q96 36 108 28" fill="none" stroke="#fbbe17" stroke-width="2.5" stroke-dasharray="1 5" stroke-linecap="round"/>
                <g transform="rotate(12 98 56)"><rect x="88" y="48" width="22" height="15" rx="2" fill="#fff" ${S2}/><path d="M92 54 h14 M92 58 h9" stroke="${INK}" stroke-width="1.6" opacity=".6"/></g>
                <g transform="rotate(-10 110 32)"><rect x="100" y="24" width="22" height="15" rx="2" fill="#fff" ${S2}/><path d="M104 30 h14 M104 34 h9" stroke="${INK}" stroke-width="1.6" opacity=".6"/></g>
                <g transform="rotate(18 94 8)"><rect x="84" y="0" width="22" height="15" rx="2" fill="#fff" ${S2}/><path d="M88 6 h14 M88 10 h9" stroke="${INK}" stroke-width="1.6" opacity=".6"/></g>
                <path d="M28 82 L32 102 Q50 106 68 102 L72 82 Z" fill="#2b2440" ${S}/>
                <path d="M30.5 92 L69.5 92 L68.6 97 L31.4 97 Z" fill="#5b2fb8"/>
                <ellipse cx="50" cy="82" rx="27" ry="6" fill="#2b2440" ${S}/>
                <path d="M118 52 l2 4 l4 1 l-4 1 l-2 4 l-2 -4 l-4 -1 l4 -1 z M80 -4 l1.5 3 l3 1 l-3 1 l-1.5 3 l-1.5 -3 l-3 -1 l3 -1 z" fill="#fbbe17"/>`,
            icon: '<path d="M-22 6 L-18 30 Q0 34 18 30 L22 6"/><ellipse cx="0" cy="6" rx="26" ry="6"/><rect x="-6" y="-34" width="22" height="15" rx="2" transform="rotate(14 5 -26)"/><rect x="-26" y="-22" width="20" height="13" rx="2" transform="rotate(-14 -16 -15)"/>',
        },
        guardatiempos: {
            box: [13, 4, 87, 100],
            seed: 'cromo-42', family: 'time',
            costume: () => `
                <path d="M38 61 Q38 72 50 77 Q62 72 62 61 Z" fill="#e8f4ff" ${S}/>
                <path d="M38 93 Q38 82 50 77 Q62 82 62 93 Z" fill="#e8f4ff" ${S}/>
                <path d="M43 66 Q50 70 57 66 Q55 72 50 75 Q45 72 43 66 Z" fill="#fbbe17"/>
                <path d="M50 77 V88" stroke="#fbbe17" stroke-width="1.6"/>
                <path d="M41 92 Q50 84 59 92 Z" fill="#fbbe17"/>
                <rect x="33" y="55" width="34" height="6" rx="2" fill="${WOOD}" ${S}/>
                <rect x="33" y="93" width="34" height="6" rx="2" fill="${WOOD}" ${S}/>
                <path d="M36 61 V93 M64 61 V93" stroke="${INK}" stroke-width="3"/>
                ${GLOVE(33, 77, 80)}${GLOVE(67, 77, -80)}`,
            icon: '<path d="M-20 -30 h40 M-20 30 h40"/><path d="M-16 -30 Q-16 -8 0 0 Q16 -8 16 -30 M-16 30 Q-16 8 0 0 Q16 8 16 30"/><path d="M-8 22 Q0 14 8 22 Z"/>',
        },
        picabilletes: {
            box: [-12, -4, 116, 96],
            seed: 'cromo-2044', family: 'live',
            costume: () => `
                <path d="M30 24 Q29 4 50 3 Q71 4 70 24 Z" fill="#164281" ${S}/>
                <rect x="29" y="16" width="42" height="8" rx="2" fill="#fbbe17" ${S2}/>
                <circle cx="50" cy="10" r="4" fill="#fbbe17" ${S2}/>
                <path d="M27 24 Q50 33 76 23 L74 30 Q50 38 26 30 Z" fill="${INK}"/>
                <g transform="rotate(-14 4 60)"><path d="M-10 50 H18 V70 H-10 Z" fill="#2fb36a" ${S}/>
                    <path d="M8 50 V70" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>
                    <circle cx="0" cy="60" r="3.6" fill="#fff" ${S2}/></g>
                ${GLOVE(8, 74, 10)}
                ${stick('M90 76 L100 46', '#9aa5b5', 4)}${stick('M98 79 L106 50', '#9aa5b5', 4)}
                <circle cx="103" cy="46" r="6" fill="#c9d3e0" ${S}/>
                ${GLOVE(94, 80, -20)}`,
            icon: '<rect x="-28" y="-16" width="56" height="32" rx="4"/><path d="M14 -16 v32" stroke-dasharray="4 4"/><circle cx="-6" cy="0" r="6"/>',
        },
        despliegacubos: {
            box: [8, -22, 124, 96],
            seed: 'cromo-2005', family: 'material',
            costume: () => `
                <path d="M50 -20 L68 -11 L50 -2 L32 -11 Z" fill="#8fe0e4" ${S}/>
                <path d="M32 -11 L50 -2 V20 L32 11 Z" fill="#2fa3ad" ${S}/>
                <path d="M68 -11 L50 -2 V20 L68 11 Z" fill="#0b6b74" ${S}/>
                ${[[96, 40], [86, 50], [96, 50], [106, 50], [116, 50], [96, 60]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="10" fill="#8fe0e4" ${S2}/>`).join('')}
                <path d="M96 40 L104 32 L114 32 L106 40 Z" fill="#c1e6e8" ${S2}/>
                ${GLOVE(98, 78, -10)}`,
            icon: '<path d="M0 -32 L28 -18 L0 -4 L-28 -18 Z M-28 -18 V18 L0 32 V-4 M28 -18 V18 L0 32"/>',
        },
    };
    // The panel of each family of tools (the colours of the board).
    const FAMILY = {
        live: { panel: '#dfe9f8', rays: '#cbdaf2', ink: '#164281' },
        groups: { panel: '#dff1e5', rays: '#c6e6d1', ink: '#067e36' },
        chance: { panel: '#ece4fb', rays: '#dccff7', ink: '#5b2fb8' },
        time: { panel: '#fff0cc', rays: '#ffe3a0', ink: '#8a5a00' },
        games: { panel: '#fde6e8', rays: '#f9cdd2', ink: '#b3121f' },
        material: { panel: '#ddf2f3', rays: '#c1e6e8', ink: '#0b6b74' },
        score: { panel: '#ffe9d9', rays: '#ffd3b5', ink: '#b23a0b' },
        board: { panel: '#e6ecf8', rays: '#d2ddf2', ink: '#0f2f5e' },
    };
    // The frame of each level: 0 learned (practised in its help: a light frame and a «learned» ribbon), 1 the colour of
    // its family, then bronze, silver, gold and, from level 5 on, shiny.
    const METAL = {
        0: ['#c9d3e0', '#ffffff', '#c9d3e0'],
        1: null,
        2: ['#8a4f22', '#e7ab78', '#8a4f22'],
        3: ['#7b8799', '#f4f7fb', '#7b8799'],
        4: ['#a87400', '#ffe08a', '#a87400'],
        5: ['#ff6fb1', '#ffe36e', '#5ee7c8', '#7aa8ff', '#c38bff'],
    };
    const PIP = { 1: null, 2: '#b8743f', 3: '#8e9aab', 4: '#d19a00', 5: '#d63fa0' };
    const LIGHT = { live: '#4f7fc4', groups: '#3fae6a', chance: '#8e6ae0', time: '#e2a21a', games: '#e8505c', material: '#2fa3ad', score: '#ea7a3c', board: '#3d5f99' };

    let uid = 0;
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const inner = (seed) => {
        const full = window.ClasstoolsCritter ? window.ClasstoolsCritter.svg(seed) : '';
        return full.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    };
    const gradient = (id, stops, angle = 35) => `<linearGradient id="${id}" gradientTransform="rotate(${angle} .5 .5)">`
        + stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('') + '</linearGradient>';
    // A line of text cut in two if it is long (the board's text, never in the drawing).
    const lines = (text, max) => {
        const words = String(text || '').split(/\s+/); const out = [''];
        words.forEach((w) => { const l = out[out.length - 1]; if (l && (l + ' ' + w).length > max && out.length < 2) { out.push(w); } else { out[out.length - 1] = l ? l + ' ' + w : w; } });
        return out;
    };

    // Where the critter and its costume go: as big as fits in the panel (what they take up, in the critter's space, is
    // the box of each tool), standing on the shadow.
    const fit = ([x0, y0, x1, y1]) => {
        const k = Math.min(232 / (x1 - x0), 214 / (y1 - y0), 1.8);
        return `translate(${(150 - ((x0 + x1) / 2) * k).toFixed(1)} ${(266 - y1 * k).toFixed(1)}) scale(${k.toFixed(3)})`;
    };

    // The level written on the top band; without the metal («Nivel 5» instead of «Nivel 5 · Brillo») if it does not fit
    // beside the number.
    const levelLabel = (texts) => {
        const level = String(texts.level || '').toUpperCase(), number = String(texts.number || '');
        return number.length + level.length > 30 ? level.split(' · ')[0] : level;
    };

    // The sticker: tool, level (0–5, more is shiny too) and its texts { number, name, text, level }.
    const sticker = (tool, level, texts = {}) => {
        const T = TOOLS[tool]; if (!T) { return ''; }
        const F = FAMILY[T.family], lv = Math.max(0, Math.min(5, level | 0)), id = 'cr' + (++uid);
        const shiny = lv >= 5;
        const rays = Array.from({ length: 16 }, (_, i) => {
            const a = (i * 22.5) * Math.PI / 180, b = (i * 22.5 + 11) * Math.PI / 180;
            return `M150 172 L${150 + 260 * Math.cos(a)} ${172 + 260 * Math.sin(a)} L${150 + 260 * Math.cos(b)} ${172 + 260 * Math.sin(b)} Z`;
        }).join(' ');
        // The level twice: as dots (seen at any size) and written on the top band; learned, as a ribbon on the corner.
        const pips = lv ? Array.from({ length: 5 }, (_, i) => `<circle cx="${226 + i * 11}" cy="68" r="4" fill="${i < lv ? (PIP[lv] || F.ink) : '#fff'}" stroke="${INK}" stroke-width="1.5"/>`).join('')
            : `<g clip-path="url(#${id}p)"><g transform="translate(246 82) rotate(45)"><rect x="-80" y="-12" width="160" height="24" fill="#ce1423" stroke="#fff" stroke-width="2"/>`
              + `<text x="0" y="4.5" text-anchor="middle" font-size="12" font-weight="900" letter-spacing="1" fill="#fff">${esc(String(texts.learned || 'Aprendido').toUpperCase())}</text></g></g>`;
        const sparkle = (x, y, r) => `<path d="M${x} ${y - r} Q${x + r * .18} ${y - r * .18} ${x + r} ${y} Q${x + r * .18} ${y + r * .18} ${x} ${y + r} Q${x - r * .18} ${y + r * .18} ${x - r} ${y} Q${x - r * .18} ${y - r * .18} ${x} ${y - r} Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
        const stars = shiny ? sparkle(52, 96, 11) + sparkle(250, 120, 8) + sparkle(64, 232, 7) + sparkle(238, 236, 10) + sparkle(150, 74, 6) : '';
        const sub = lines(texts.text, 34);
        return `<svg class="cr-cromo${shiny ? ' cr-brilla' : ''}" viewBox="0 0 300 400" role="img" aria-label="${esc(texts.name)}${texts.level ? ' · ' + esc(texts.level) : ''}" font-family="Nunito, system-ui, sans-serif">
            <defs>${gradient(id + 'm', METAL[lv] || [F.ink, LIGHT[T.family], F.ink], shiny ? 55 : 35)}
                <clipPath id="${id}c"><rect x="0" y="0" width="300" height="400" rx="24"/></clipPath>
                <clipPath id="${id}p"><rect x="22" y="50" width="256" height="244" rx="14"/></clipPath>
                <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
            </defs>
            <rect x="0" y="0" width="300" height="400" rx="24" fill="url(#${id}m)"/>
            <rect x="9" y="9" width="282" height="382" rx="17" fill="#fff"/>
            <text x="22" y="38" font-size="12.5" font-weight="900" letter-spacing="1.2" fill="${F.ink}">${esc(String(texts.number || '').toUpperCase())}</text>
            ${lv ? `<text x="278" y="38" text-anchor="end" font-size="11" font-weight="900" letter-spacing="1" fill="${PIP[lv] || F.ink}">${esc(levelLabel(texts))}</text>` : ''}
            <g clip-path="url(#${id}p)">
                <rect x="22" y="50" width="256" height="244" fill="${F.panel}"/>
                <path d="${rays}" fill="${F.rays}"/>
                ${shiny ? `<rect x="22" y="50" width="256" height="244" fill="url(#${id}m)" opacity=".28"/>` : ''}
                <ellipse cx="150" cy="268" rx="70" ry="10" fill="${INK}" opacity=".12"/>
                ${stars}
                <g transform="${fit(T.box)}">${inner(T.seed)}${T.costume()}</g>
            </g>
            <rect x="22" y="50" width="256" height="244" rx="14" fill="none" stroke="${INK}" stroke-opacity=".12" stroke-width="2"/>
            ${pips}
            <text x="150" y="336" text-anchor="middle" font-size="31" font-weight="900" fill="${INK}">${esc(texts.name)}</text>
            ${sub.map((l, i) => `<text x="150" y="${362 + i * 18}" text-anchor="middle" font-size="14" font-weight="700" fill="#55514d">${esc(l)}</text>`).join('')}
            ${shiny ? `<g clip-path="url(#${id}c)"><rect class="cr-destello" x="-160" y="-40" width="120" height="480" fill="url(#${id}s)" transform="skewX(-18)"/></g>` : ''}
        </svg>`;
    };

    // The badge of the Superior mode: the costume alone in white lines on dark blue, the ring in the metal of the level.
    const badge = (tool, level, texts = {}) => {
        const T = TOOLS[tool]; if (!T) { return ''; }
        const lv = Math.max(0, Math.min(5, level | 0)), id = 'cr' + (++uid);
        const metal = lv >= 5 ? ['#a87400', '#ffe08a', '#c9d3e0', '#ffe08a', '#a87400'] : (METAL[lv] || [FAMILY[T.family].ink, LIGHT[T.family], FAMILY[T.family].ink]);
        const roman = ['', 'I', 'II', 'III', 'IV', 'V'][lv];
        return `<svg class="cr-insignia" viewBox="0 0 240 280" role="img" aria-label="${esc(texts.name)}${texts.level ? ' · ' + esc(texts.level) : ''}" font-family="Nunito, system-ui, sans-serif">
            <defs>${gradient(id + 'm', metal, 35)}</defs>
            <circle cx="120" cy="116" r="108" fill="url(#${id}m)"/>
            <circle cx="120" cy="116" r="94" fill="#0f2f5e"/>
            <circle cx="120" cy="116" r="86" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.5"/>
            <g transform="translate(120 122) scale(1.35)" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${T.icon}</g>
            ${roman ? `<text x="120" y="52" text-anchor="middle" font-size="15" font-weight="800" letter-spacing="2" fill="#fff" fill-opacity=".85">${roman}</text>` : ''}
            <text x="120" y="258" text-anchor="middle" font-size="19" font-weight="800" letter-spacing="1.5" fill="#0f2f5e">${esc(String(texts.name || '').toUpperCase())}</text>
        </svg>`;
    };

    window.ClasstoolsCromo = { sticker, badge, TOOLS };
})();
