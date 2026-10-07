// Find the pairs for the whole class: cards face down, turned two at a time. Built-in sets by school level (from
// shapes and animal shadows to chemical elements and graphs of functions), a student's face and their name, or the
// teacher's lists («dog = perro» per line). The whole class plays, or two teams take turns (finding a pair keeps
// the turn).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games) { return; }
    const { $, $$, t, escape, play, setIcon, announce, random, shuffle, load, save } = core;

    const STR = {
        name: t('me_pairs'), what: t('me_what'), pairs: t('me_pairs'), who: t('me_who'), wholeClass: t('me_whole_class'),
        twoTeams: t('me_two_teams'), start: t('me_start'), shapes: t('me_set_shapes'), colors: t('me_set_colours'),
        numbers: t('me_set_numbers'), faces: (n) => t('me_faces', n), own: t('me_own'), students: t('me_students'),
        level: t('me_level'), allLevels: t('me_all_levels'),
        team: (n) => t('me_team', n), moves: (n) => t(n === 1 ? 'me_moves_one' : 'me_moves_many', n), found: (a, b) => t('me_found', { a, b }),
        done: (n) => t('me_done', n), winner: (n) => t('me_winner', n), tie: t('me_tie'), few: t('me_few'),
        pressStart: t('me_press_start'), turn: (n) => t('me_turn', n), card: (n) => t('me_card', n),
    };
    // Content in Spanish: per-language content comes in a later step.
    const COLORS = [['Rojo', '#ce1423'], ['Azul', '#164281'], ['Verde', '#067e36'], ['Amarillo', '#fbbe17'], ['Morado', '#5b2fb8'],
        ['Naranja', '#ea7317'], ['Rosa', '#e85d9e'], ['Marrón', '#7b4a24'], ['Negro', '#1c1a19'], ['Blanco', '#ffffff'], ['Gris', '#8a94a3'], ['Celeste', '#5cc2ef']];
    const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'pentagon', 'cross'];
    // Content in Spanish: per-language content comes in a later step.
    const NUMBERS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce',
        'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];

    // ---------------------------------------------------------------------------------------------------------
    // Built-in sets by school level. The administrator chooses the levels of the school (all of them outside
    // Moodle) and the teacher can narrow them in the panel. Each set gives up to n pairs: [half, half].
    // ---------------------------------------------------------------------------------------------------------
    const LEVELS = [['early', t('me_level_early')], ['primary', t('me_level_primary')], ['secondary', t('me_level_secondary')],
        ['upper', t('me_level_upper')], ['higher', t('me_level_higher')]];
    const site = window.CLASSTOOLS_SITE || {};
    const levels = LEVELS.filter(([k]) => !Array.isArray(site.levels) || site.levels.includes(k));
    const courseKey = 'parejas-nivel-' + ((window.CLASSTOOLS && window.CLASSTOOLS.courseid) || 0);
    const pick = (list, n) => shuffle(list.slice()).slice(0, n);
    // Up to n pairs from a generator, without repeating the key (so that no two cards of different pairs match).
    const unique = (n, make) => {
        const seen = new Set(), out = [];
        for (let i = 0; out.length < n && i < 600; i++) { const [key, pair] = make(); if (!seen.has(key)) { seen.add(key); out.push(pair); } }
        return out;
    };
    const svg = (view, body) => `<svg viewBox="${view}" aria-hidden="true">${body}</svg>`;
    const tenFrame = (k) => svg('0 0 100 56', Array.from({ length: 10 }, (_, i) => {
        const x = 12 + (i % 5) * 19, y = 18 + Math.floor(i / 5) * 20;
        return `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="3" fill="none" stroke="#c3cedc" stroke-width="1.5"/>`
            + (i < k ? `<circle cx="${x}" cy="${y}" r="6.5" fill="#ce1423"/>` : '');
    }).join(''));
    const clock = (h, m) => {
        const hand = (deg, len) => { const r = deg * Math.PI / 180; return `${(50 + len * Math.sin(r)).toFixed(1)} ${(50 - len * Math.cos(r)).toFixed(1)}`; };
        const ticks = Array.from({ length: 12 }, (_, i) => `<path d="M${hand(i * 30, 40)}L${hand(i * 30, i % 3 ? 36 : 32)}" stroke="#164281" stroke-width="${i % 3 ? 2 : 3.5}" stroke-linecap="round"/>`).join('');
        return svg('0 0 100 100', `<circle cx="50" cy="50" r="46" fill="#fff" stroke="#164281" stroke-width="4"/>${ticks}`
            + `<path d="M50 50L${hand(((h % 12) + m / 60) * 30, 22)}" stroke="#1c1a19" stroke-width="6.5" stroke-linecap="round"/>`
            + `<path d="M50 50L${hand(m * 6, 33)}" stroke="#ce1423" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="50" r="4.5" fill="#1c1a19"/>`);
    };
    const pie = (a, b) => svg('0 0 100 100', Array.from({ length: b }, (_, i) => {
        const p = (t) => `${(50 + 44 * Math.sin(t * 2 * Math.PI)).toFixed(2)} ${(50 - 44 * Math.cos(t * 2 * Math.PI)).toFixed(2)}`;
        return `<path d="M50 50L${p(i / b)}A44 44 0 0 1 ${p((i + 1) / b)}Z" fill="${i < a ? '#fbbe17' : '#fff'}" stroke="#164281" stroke-width="3" stroke-linejoin="round"/>`;
    }).join(''));
    const fraction = (a, b) => `<span class="ct-frac"><span>${a}</span><span>${b}</span></span>`;
    const graph = (f) => {
        let d = '', pen = false;
        for (let i = 0; i <= 200; i++) {
            const x = -3.2 + i * 6.4 / 200, y = f(x);
            if (!Number.isFinite(y) || Math.abs(y) > 3.4) { pen = false; continue; }
            d += `${pen ? 'L' : 'M'}${(50 + x * 14).toFixed(1)} ${(50 - y * 14).toFixed(1)}`; pen = true;
        }
        return svg('0 0 100 100', '<path d="M4 50H96M50 4V96" stroke="#c3cedc" stroke-width="1.5"/>'
            + `<path d="${d}" fill="none" stroke="#164281" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
    };
    const ANIMALS = [['an-cat', '#e07a1f'], ['an-dog', '#7b4a24'], ['an-fish', '#1f7fd6'], ['an-horse', '#8a5a2b'], ['an-frog', '#2f9e44'],
        ['an-crow', '#5b2fb8'], ['an-hippo', '#6c7a91'], ['an-spider', '#c2185b'], ['an-otter', '#a0522d'], ['an-kiwi', '#8d6e3f'],
        ['an-dove', '#3d84c6'], ['an-cow', '#d6336c'], ['an-shrimp', '#f06c4f'], ['an-bug', '#ce1423']];
    // Content in Spanish: per-language content comes in a later step.
    const OPPOSITES = [['alto', 'bajo'], ['grande', 'pequeño'], ['frío', 'caliente'], ['día', 'noche'], ['abrir', 'cerrar'], ['rápido', 'lento'],
        ['lleno', 'vacío'], ['arriba', 'abajo'], ['dentro', 'fuera'], ['mucho', 'poco'], ['nuevo', 'viejo'], ['claro', 'oscuro'],
        ['ganar', 'perder'], ['entrar', 'salir'], ['duro', 'blando'], ['limpio', 'sucio']];
    const ELEMENTS = [['H', 'Hidrógeno'], ['He', 'Helio'], ['Li', 'Litio'], ['C', 'Carbono'], ['N', 'Nitrógeno'], ['O', 'Oxígeno'], ['F', 'Flúor'],
        ['Ne', 'Neón'], ['Na', 'Sodio'], ['Mg', 'Magnesio'], ['Al', 'Aluminio'], ['Si', 'Silicio'], ['P', 'Fósforo'], ['S', 'Azufre'],
        ['Cl', 'Cloro'], ['Ar', 'Argón'], ['K', 'Potasio'], ['Ca', 'Calcio'], ['Fe', 'Hierro'], ['Cu', 'Cobre'], ['Zn', 'Cinc'], ['Ag', 'Plata'],
        ['Sn', 'Estaño'], ['I', 'Yodo'], ['Au', 'Oro'], ['Hg', 'Mercurio'], ['Pb', 'Plomo'], ['U', 'Uranio']];
    const UNITS = [['Longitud', 'metro (m)'], ['Masa', 'kilogramo (kg)'], ['Tiempo', 'segundo (s)'], ['Temperatura', 'kelvin (K)'],
        ['Intensidad de corriente', 'amperio (A)'], ['Cantidad de sustancia', 'mol (mol)'], ['Intensidad luminosa', 'candela (cd)'],
        ['Fuerza', 'newton (N)'], ['Energía', 'julio (J)'], ['Potencia', 'vatio (W)'], ['Presión', 'pascal (Pa)'], ['Frecuencia', 'hercio (Hz)'],
        ['Carga eléctrica', 'culombio (C)'], ['Tensión eléctrica', 'voltio (V)'], ['Resistencia eléctrica', 'ohmio (Ω)']];
    const PREFIXES = [['tera (T)', '10¹²'], ['giga (G)', '10⁹'], ['mega (M)', '10⁶'], ['kilo (k)', '10³'], ['hecto (h)', '10²'], ['deca (da)', '10¹'],
        ['deci (d)', '10⁻¹'], ['centi (c)', '10⁻²'], ['mili (m)', '10⁻³'], ['micro (µ)', '10⁻⁶'], ['nano (n)', '10⁻⁹'], ['pico (p)', '10⁻¹²']];
    const FORMULAS = [['H₂O', 'Agua'], ['CO₂', 'Dióxido de carbono'], ['NaCl', 'Cloruro de sodio'], ['NH₃', 'Amoníaco'], ['CH₄', 'Metano'],
        ['H₂SO₄', 'Ácido sulfúrico'], ['HCl', 'Ácido clorhídrico'], ['NaOH', 'Hidróxido de sodio'], ['CaCO₃', 'Carbonato de calcio'],
        ['O₃', 'Ozono'], ['C₆H₁₂O₆', 'Glucosa'], ['HNO₃', 'Ácido nítrico'], ['CO', 'Monóxido de carbono'], ['H₂O₂', 'Peróxido de hidrógeno'],
        ['C₂H₅OH', 'Etanol'], ['Fe₂O₃', 'Óxido de hierro(III)']];
    const LAWS = [['F = m·a', 'Segunda ley de Newton'], ['E = m·c²', 'Equivalencia masa-energía'], ['V = I·R', 'Ley de Ohm'],
        ['p·V = n·R·T', 'Gases ideales'], ['F = G·m₁·m₂/r²', 'Gravitación universal'], ['F = k·q₁·q₂/r²', 'Ley de Coulomb'],
        ['E = h·f', 'Energía de un fotón'], ['p = m·v', 'Cantidad de movimiento'], ['Ec = ½·m·v²', 'Energía cinética'],
        ['Ep = m·g·h', 'Energía potencial gravitatoria'], ['W = F·d', 'Trabajo'], ['P = W/t', 'Potencia'], ['ρ = m/V', 'Densidad'],
        ['v = λ·f', 'Velocidad de una onda'], ['F = −k·x', 'Ley de Hooke']];
    const FUNCTIONS = [['y = x²', (x) => x * x], ['y = x³', (x) => x ** 3], ['y = √x', Math.sqrt], ['y = 1/x', (x) => 1 / x],
        ['y = sen x', Math.sin], ['y = cos x', Math.cos], ['y = eˣ', Math.exp], ['y = ln x', Math.log], ['y = |x|', Math.abs],
        ['y = 2x + 1', (x) => 2 * x + 1], ['y = −x²', (x) => -x * x], ['y = x', (x) => x]];
    const DERIVATIVES = [['x²', '2x'], ['x³', '3x²'], ['sen x', 'cos x'], ['cos x', '−sen x'], ['ln x', '1/x'], ['√x', '1 / (2√x)'],
        ['1/x', '−1/x²'], ['tg x', '1 / cos² x'], ['5x', '5'], ['e²ˣ', '2e²ˣ'], ['x⁴', '4x³']];
    const INTEGRALS = [['x dx', 'x²/2 + C'], ['1/x dx', 'ln|x| + C'], ['eˣ dx', 'eˣ + C'], ['cos x dx', 'sen x + C'],
        ['sen x dx', '−cos x + C'], ['3x² dx', 'x³ + C'], ['1/(1 + x²) dx', 'arctg x + C'], ['1/√(1 − x²) dx', 'arcsen x + C'],
        ['1/cos² x dx', 'tg x + C'], ['aˣ dx', 'aˣ/ln a + C'], ['k dx', 'kx + C'], ['1/(2√x) dx', '√x + C']];
    const GROUPS = [['–OH', 'Alcohol'], ['–CHO', 'Aldehído'], ['–CO–', 'Cetona'], ['–COOH', 'Ácido carboxílico'], ['–COO–', 'Éster'],
        ['–O–', 'Éter'], ['–NH₂', 'Amina'], ['–CONH₂', 'Amida'], ['–C≡N', 'Nitrilo'], ['–NO₂', 'Nitroderivado'],
        ['C=C', 'Alqueno'], ['C≡C', 'Alquino'], ['–X (F, Cl, Br, I)', 'Haluro']];
    const CONSTANTS = [['c = 3,00·10⁸ m/s', 'Velocidad de la luz'], ['h = 6,63·10⁻³⁴ J·s', 'Constante de Planck'],
        ['G = 6,67·10⁻¹¹ N·m²/kg²', 'Gravitación universal'], ['e = 1,60·10⁻¹⁹ C', 'Carga elemental'],
        ['NA = 6,02·10²³ mol⁻¹', 'Número de Avogadro'], ['R = 8,31 J/(mol·K)', 'Constante de los gases'],
        ['k = 1,38·10⁻²³ J/K', 'Constante de Boltzmann'], ['g = 9,81 m/s²', 'Gravedad en la Tierra'],
        ['mₑ = 9,11·10⁻³¹ kg', 'Masa del electrón'], ['mₚ = 1,67·10⁻²⁷ kg', 'Masa del protón'],
        ['ε₀ = 8,85·10⁻¹² F/m', 'Permitividad del vacío'], ['μ₀ = 4π·10⁻⁷ T·m/A', 'Permeabilidad del vacío']];
    const GREEK = [['α', 'alfa'], ['β', 'beta'], ['γ', 'gamma'], ['δ', 'delta'], ['ε', 'épsilon'], ['θ', 'theta'], ['λ', 'lambda'],
        ['μ', 'mu'], ['π', 'pi'], ['ρ', 'rho'], ['σ', 'sigma'], ['φ', 'fi'], ['ω', 'omega']];
    const LETTER_PAIRS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    const text = (t, big) => ({ text: t, big: !!big });
    const PRESETS = {
        early: [
            { id: 'shapes', name: STR.shapes },
            { id: 'colors', name: STR.colors },
            { id: 'animals', name: t('me_set_animals'), make: (n) => pick(ANIMALS, n).map(([i, c]) => [{ icon: i, color: c }, { icon: i, color: '#2b2d33', shadow: true }]) },
            { id: 'dots', name: t('me_set_dots'), make: (n) => pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], n).map((k) => [{ html: tenFrame(k) }, text(String(k), true)]) },
            { id: 'letters', name: t('me_set_letters'), make: (n) => pick(LETTER_PAIRS, n).map((l) => [text(l, true), text(l.toLowerCase(), true)]) },
        ],
        primary: [
            { id: 'numbers', name: STR.numbers },
            { id: 'times', name: t('me_set_times'), make: (n) => unique(n, () => { const a = 2 + random(8), b = 2 + random(8); return [a * b, [text(`${a} × ${b}`), text(String(a * b), true)]]; }) },
            { id: 'clock', name: t('me_set_clock'), make: (n) => unique(n, () => { const h = 1 + random(12), m = [0, 15, 30, 45][random(4)], t = `${h}:${String(m).padStart(2, '0')}`; return [t, [{ html: clock(h, m) }, text(t, true)]]; }) },
            { id: 'fractions', name: t('me_set_fractions'), make: (n) => pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8]], n).map(([a, b]) => [{ html: pie(a, b) }, { html: fraction(a, b) }]) },
            { id: 'opposites', name: t('me_set_opposites'), make: (n) => pick(OPPOSITES, n).map(([a, b]) => [text(a), text(b)]) },
        ],
        secondary: [
            { id: 'elements', name: t('me_set_elements'), make: (n) => pick(ELEMENTS, n).map(([a, b]) => [text(a, true), text(b)]) },
            { id: 'units', name: t('me_set_units'), make: (n) => pick(UNITS, n).map(([a, b]) => [text(a), text(b)]) },
            { id: 'prefixes', name: t('me_set_prefixes'), make: (n) => pick(PREFIXES, n).map(([a, b]) => [text(a), text(b)]) },
            { id: 'equations', name: t('me_set_equations'), make: (n) => unique(n, () => {
                const x = 1 + random(12), a = 2 + random(8), b = 1 + random(20), plus = random(2) === 0;
                return [x, [text(`${a}x ${plus ? '+' : '−'} ${b} = ${plus ? a * x + b : a * x - b}`), text(`x = ${x}`)]];
            }) },
        ],
        upper: [
            { id: 'formulas', name: t('me_set_formulas'), make: (n) => pick(FORMULAS, n).map(([a, b]) => [text(a), text(b)]) },
            { id: 'laws', name: t('me_set_laws'), make: (n) => pick(LAWS, n).map(([a, b]) => [text(a), text(b)]) },
            { id: 'graphs', name: t('me_set_graphs'), make: (n) => pick(FUNCTIONS, n).map(([a, f]) => [{ html: graph(f) }, text(a)]) },
            { id: 'derivatives', name: t('me_set_derivatives'), make: (n) => pick(DERIVATIVES, n).map(([a, b]) => [text(`f(x) = ${a}`), text(`f′(x) = ${b}`)]) },
        ],
        higher: [
            { id: 'integrals', name: t('me_set_integrals'), make: (n) => pick(INTEGRALS, n).map(([a, b]) => [text(`∫ ${a}`), text(b)]) },
            { id: 'fgroups', name: t('me_set_fgroups'), make: (n) => pick(GROUPS, n).map(([a, b]) => [text(a, true), text(b)]) },
            { id: 'constants', name: t('me_set_constants'), make: (n) => pick(CONSTANTS, n).map(([a, b]) => [text(a), text(b)]) },
            { id: 'greek', name: t('me_set_greek'), make: (n) => pick(GREEK, n).map(([a, b]) => [text(a, true), text(b)]) },
        ],
    };
    const preset = (id) => Object.values(PRESETS).flat().find((p) => p.id === id);
    const s = { cards: [], open: [], found: 0, pairs: 0, moves: 0, teams: [], turn: 0, busy: false, over: true };
    let visible = false;

    const mount = (panel) => {
        panel.innerHTML = `
            <div class="ct-memory ct-collapsible">
                <aside class="tarjeta ct-side ct-setup">
                    <label class="campo apilado" id="me-level-box"><span>${STR.level}</span><select id="me-level"></select></label>
                    <label class="campo apilado"><span>${STR.what}</span><select id="me-src"></select></label>
                    <p class="ante">${STR.pairs}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(STR.pairs)}" id="me-n">
                        ${[6, 8, 10, 12].map((n) => `<button type="button" role="radio" aria-checked="${n === 8}" data-n="${n}">${n}</button>`).join('')}
                    </div>
                    <p class="ante">${STR.who}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${escape(STR.who)}" id="me-who">
                        <button type="button" role="radio" aria-checked="true" data-who="class">${STR.wholeClass}</button>
                        <button type="button" role="radio" aria-checked="false" data-who="teams">${STR.twoTeams}</button>
                    </div>
                    <button type="button" class="boton grande" id="me-start"><span data-icono="barajar"></span>${STR.start}</button>
                    <p class="nota" id="me-note"></p>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-memory-score" id="me-score"></div>
                    <div class="ct-memory-grid" id="me-grid"></div>
                    <p class="total espera" id="me-msg" aria-live="polite">${STR.pressStart}</p>
                </div>
            </div>`;
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        const seg = (id) => $(id).addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b) { return; }
            $$(`${id} button`).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        });
        seg('#me-n'); seg('#me-who');
        $('#me-src').addEventListener('change', () => save('parejas-fuente', $('#me-src').value));
        $('#me-level').addEventListener('change', () => { save(courseKey, $('#me-level').value); fill(); });
        $('#me-start').addEventListener('click', start);
        $('#me-grid').addEventListener('click', (e) => { const c = e.target.closest('.ct-mcard'); if (c) { flip(Number(c.dataset.i)); } });
        document.addEventListener('classtools:lists', fill);
        if (window.ResizeObserver) { new ResizeObserver(() => requestAnimationFrame(fit)).observe($('#me-grid')); }
        fill();
    };
    const fill = () => {
        const lv = $('#me-level'), chosen = lv.value || load(courseKey, 'all');
        lv.innerHTML = `<option value="all">${STR.allLevels}</option>` + levels.map(([k, name]) => `<option value="${k}">${name}</option>`).join('');
        lv.value = levels.some(([k]) => k === chosen) ? chosen : 'all';
        $('#me-level-box').hidden = levels.length < 2;
        const sel = $('#me-src'), before = sel.value || load('parejas-fuente', 'shapes');
        const lists = core.lists(), moodle = lists.filter((l) => l.aula), own = lists.filter((l) => !l.aula);
        sel.innerHTML = levels.filter(([k]) => lv.value === 'all' || lv.value === k)
            .map(([k, name]) => `<optgroup label="${escape(name)}">${PRESETS[k].map((pr) => `<option value="${pr.id}">${escape(pr.name)}</option>`).join('')}</optgroup>`).join('')
            + (moodle.length ? `<optgroup label="${escape(STR.students)}">${moodle.map((l) => `<option value="faces:${escape(l.id)}">${escape(STR.faces(l.nombre))}</option>`).join('')}</optgroup>` : '')
            + (own.length ? `<optgroup label="${escape(STR.own)}">${own.map((l) => `<option value="list:${escape(l.id)}">${escape(l.nombre)}</option>`).join('')}</optgroup>` : '');
        const values = [...sel.options].map((o) => o.value);
        sel.value = values.includes(before) ? before : (values[0] || '');
    };
    // The two halves of each pair for the chosen set.
    const pairsFor = (value, n) => {
        if (value === 'shapes') {
            const combos = shuffle(SHAPES.flatMap((sh) => COLORS.slice(0, 8).map((c) => [sh, c[1]])));
            const chosen = [], usedShape = {}, usedColor = {};
            combos.forEach((c) => { if (chosen.length < n && (usedShape[c[0]] || 0) < 2 && (usedColor[c[1]] || 0) < 2) { chosen.push(c); usedShape[c[0]] = (usedShape[c[0]] || 0) + 1; usedColor[c[1]] = (usedColor[c[1]] || 0) + 1; } });
            return chosen.map(([shape, color]) => [{ shape, color }, { shape, color }]);
        }
        if (value === 'colors') { return shuffle(COLORS.slice()).slice(0, n).map(([name, color]) => [{ swatch: color }, { text: name }]); }
        if (value === 'numbers') { return shuffle(NUMBERS.map((w, i) => [i + 1, w])).slice(0, n).map(([d, w]) => [{ text: String(d), big: true }, { text: w }]); }
        const pr = preset(value);
        if (pr && pr.make) { return pr.make(n); }
        if (value.startsWith('faces:')) {
            const l = core.lists().find((x) => x.id === value.slice(6));
            return l ? shuffle(core.present(l).slice()).slice(0, n).map((name) => [{ face: { list: l, name } }, { text: name }]) : [];
        }
        if (value.startsWith('list:')) {
            const l = core.lists().find((x) => x.id === value.slice(5));
            return l ? shuffle(l.alumnos.slice()).slice(0, n).map((line) => {
                const [a, b] = line.split('=').map((x) => x.trim());
                return b ? [{ text: a }, { text: b }] : [{ text: a }, { text: a }];
            }) : [];
        }
        return [];
    };
    const faceHTML = (c) => {
        if (c.shape) { return `<span class="ct-mshape ct-sh-${c.shape}" style="--c:${c.color}"></span>`; }
        if (c.swatch) { return `<span class="ct-mswatch" style="--c:${c.swatch}"></span>`; }
        if (c.face) { return `<span class="ct-mface">${core.face(c.face.list, c.face.name, 'cara-grande')}</span>`; }
        if (c.icon) { return `<span class="ct-micon${c.shadow ? ' ct-shadow' : ''}" style="--c:${c.color}">${core.icon(c.icon, 'ct-micon-svg')}</span>`; }
        if (c.html) { return `<span class="ct-mhtml">${c.html}</span>`; }   // built here, never from users
        const len = c.text.length;
        return `<span class="ct-mtext${c.big && len < 4 ? ' ct-big' : ''}${len > 22 ? ' ct-xlong' : len > 12 ? ' ct-long' : len > 7 ? ' ct-mid' : ''}">${escape(c.text)}</span>`;
    };
    const who = () => ($('#me-who [aria-checked="true"]') || { dataset: { who: 'class' } }).dataset.who;
    const start = () => {
        const n = Number(($('#me-n [aria-checked="true"]') || { dataset: { n: 8 } }).dataset.n);
        const pairs = pairsFor($('#me-src').value, n);
        if (pairs.length < 2) { $('#me-note').textContent = STR.few; return; }
        $('#me-note').textContent = '';
        s.cards = shuffle(pairs.flatMap((p, k) => p.map((half) => ({ pair: k, half, state: 'down' }))));
        s.open = []; s.found = 0; s.pairs = pairs.length; s.moves = 0; s.busy = false; s.over = false; s.turn = 0;
        s.teams = who() === 'teams' ? [{ name: STR.team(1), score: 0 }, { name: STR.team(2), score: 0 }] : [];
        $('#me-grid').innerHTML = s.cards.map((c, i) => `<button type="button" class="ct-mcard" data-i="${i}" aria-label="${escape(STR.card(i + 1))}">
            <span class="ct-mface-in ct-mback"></span><span class="ct-mface-in ct-mfront">${faceHTML(c.half)}</span></button>`).join('');
        games.playing('parejas', true);
        fit(); paintScore(); play('card');
        const m = $('#me-msg'); m.className = 'total'; m.textContent = s.teams.length ? STR.turn(s.teams[0].name) : progress();
    };
    // Card size so that all of them fit in the board without scrolling.
    const fit = () => {
        const grid = $('#me-grid'), n = s.cards.length;
        if (!n) { return; }
        const w = grid.clientWidth, h = grid.clientHeight, gap = 10;
        let best = { size: 0, cols: 1 };
        for (let cols = 2; cols <= n; cols++) {
            const rows = Math.ceil(n / cols);
            const size = Math.min((w - gap * (cols - 1)) / cols, ((h - gap * (rows - 1)) / rows) * 0.8);
            if (size > best.size) { best = { size, cols }; }
        }
        grid.style.setProperty('--cols', best.cols);
        grid.style.setProperty('--cw', Math.floor(best.size) + 'px');
    };
    const progress = () => `${STR.found(s.found, s.pairs)} · ${STR.moves(s.moves)}`;
    const paintScore = () => {
        $('#me-score').innerHTML = s.teams.length
            ? s.teams.map((t, i) => `<span class="ct-mteam${i === s.turn && !s.over ? ' ct-active' : ''}">${escape(t.name)} <strong>${t.score}</strong></span>`).join('')
            : '';   // the whole class: the big message below already says how it goes
        $('#me-score').hidden = !s.teams.length;
    };
    const cardEl = (i) => $(`#me-grid .ct-mcard[data-i="${i}"]`);
    function flip(i) {
        const c = s.cards[i];
        if (s.over || s.busy || !c || c.state !== 'down') { return; }
        c.state = 'up'; cardEl(i).classList.add('ct-up'); play('tic');
        s.open.push(i);
        if (s.open.length < 2) { return; }
        s.moves++;
        const [a, b] = s.open.map((k) => s.cards[k]);
        if (a.pair === b.pair) {
            s.open.forEach((k) => { s.cards[k].state = 'found'; cardEl(k).classList.add('ct-found'); });
            s.open = []; s.found++;
            if (s.teams.length) { s.teams[s.turn].score++; }
            play('elegido');
            if (s.found === s.pairs) { finish(); return; }
            paintScore();
            const m = $('#me-msg'); m.className = 'total'; m.textContent = s.teams.length ? STR.turn(s.teams[s.turn].name) : progress();
            return;
        }
        s.busy = true;
        setTimeout(() => {
            s.open.forEach((k) => { s.cards[k].state = 'down'; cardEl(k).classList.remove('ct-up'); });
            s.open = []; s.busy = false;
            if (s.teams.length) { s.turn = 1 - s.turn; }
            paintScore();
            const m = $('#me-msg'); m.className = 'total'; m.textContent = s.teams.length ? STR.turn(s.teams[s.turn].name) : progress();
        }, 1150);
        paintScore();
    }
    const finish = () => {
        s.over = true; paintScore(); games.playing('parejas', false);
        let text = STR.done(s.moves);
        if (s.teams.length) {
            const [a, b] = s.teams;
            text = a.score === b.score ? STR.tie : STR.winner(a.score > b.score ? a.name : b.name);
        }
        const m = $('#me-msg'); m.className = 'total ct-win'; m.textContent = text;
        if (core.celebrate) { core.celebrate($('#me-grid').closest('.ct-stage'), { title: text, glow: [$('#me-grid')], again: STR.start, onAgain: start }); }
        play('fin'); announce(text);
    };

    games.add({
        id: 'parejas', name: STR.name, mount,
        enter: () => { visible = true; fill(); requestAnimationFrame(fit); },
        leave: () => { visible = false; },
        space: () => { if (s.over) { start(); } },
    });
    window.ClasstoolsMemory = { start, flip, state: () => s };   // for automated tests
})();
