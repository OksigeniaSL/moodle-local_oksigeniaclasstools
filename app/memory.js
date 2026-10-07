// Find the pairs for the whole class: cards face down, turned two at a time. Shapes and colours, a colour and its
// name, a number and its name, a student's face and their name, or the teacher's lists («dog = perro» per line).
// The whole class plays, or two teams take turns (finding a pair keeps the turn).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games) { return; }
    const { $, $$, escape, play, setIcon, announce, random, shuffle, load, save } = core;

    const STR = {
        name: 'Parejas', what: 'Qué emparejar', pairs: 'Parejas', who: '¿Quién juega?', wholeClass: 'Toda la clase',
        twoTeams: 'Dos equipos', start: 'Repartir', shapes: 'Formas y colores', colors: 'Un color y su nombre',
        numbers: 'Un número y su nombre', faces: (n) => `Caras y nombres: ${n}`, own: 'Tus listas', builtin: 'Para empezar',
        team: (n) => `Equipo ${n}`, moves: (n) => `${n} ${n === 1 ? 'intento' : 'intentos'}`, found: (a, b) => `${a} de ${b} parejas`,
        done: (n) => `¡Todas! En ${n} intentos`, winner: (t) => `¡Gana ${t}!`, tie: '¡Empate!', few: 'Hacen falta al menos dos parejas.',
        pressStart: 'Elige qué emparejar y pulsa «Repartir»', turn: (t) => `Le toca a ${t}`,
    };
    const COLORS = [['Rojo', '#ce1423'], ['Azul', '#164281'], ['Verde', '#067e36'], ['Amarillo', '#fbbe17'], ['Morado', '#5b2fb8'],
        ['Naranja', '#ea7317'], ['Rosa', '#e85d9e'], ['Marrón', '#7b4a24'], ['Negro', '#1c1a19'], ['Blanco', '#ffffff'], ['Gris', '#8a94a3'], ['Celeste', '#5cc2ef']];
    const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'pentagon', 'cross'];
    const NUMBERS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce',
        'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
    const s = { cards: [], open: [], found: 0, pairs: 0, moves: 0, teams: [], turn: 0, busy: false, over: true };
    let visible = false;

    const mount = (panel) => {
        panel.innerHTML = `
            <div class="ct-memory">
                <aside class="tarjeta ct-side">
                    <label class="campo apilado"><span>${STR.what}</span><select id="me-src"></select></label>
                    <p class="ante">${STR.pairs}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${STR.pairs}" id="me-n">
                        ${[6, 8, 10, 12].map((n) => `<button type="button" role="radio" aria-checked="${n === 8}" data-n="${n}">${n}</button>`).join('')}
                    </div>
                    <p class="ante">${STR.who}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${STR.who}" id="me-who">
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
        $('#me-start').addEventListener('click', start);
        $('#me-grid').addEventListener('click', (e) => { const c = e.target.closest('.ct-mcard'); if (c) { flip(Number(c.dataset.i)); } });
        document.addEventListener('classtools:lists', fill);
        if (window.ResizeObserver) { new ResizeObserver(() => requestAnimationFrame(fit)).observe($('#me-grid')); }
        fill();
    };
    const fill = () => {
        const sel = $('#me-src'), before = sel.value || load('parejas-fuente', 'shapes');
        const lists = core.lists(), moodle = lists.filter((l) => l.aula), own = lists.filter((l) => !l.aula);
        sel.innerHTML = `<optgroup label="${STR.builtin}"><option value="shapes">${STR.shapes}</option><option value="colors">${STR.colors}</option><option value="numbers">${STR.numbers}</option></optgroup>`
            + (moodle.length ? `<optgroup label="Alumnos">${moodle.map((l) => `<option value="faces:${escape(l.id)}">${escape(STR.faces(l.nombre))}</option>`).join('')}</optgroup>` : '')
            + (own.length ? `<optgroup label="${STR.own}">${own.map((l) => `<option value="list:${escape(l.id)}">${escape(l.nombre)}</option>`).join('')}</optgroup>` : '');
        sel.value = [...sel.options].some((o) => o.value === before) ? before : 'shapes';
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
        const len = c.text.length;
        return `<span class="ct-mtext${c.big ? ' ct-big' : ''}${len > 12 ? ' ct-long' : ''}">${escape(c.text)}</span>`;
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
        $('#me-grid').innerHTML = s.cards.map((c, i) => `<button type="button" class="ct-mcard" data-i="${i}" aria-label="Carta ${i + 1}">
            <span class="ct-mface-in ct-mback"></span><span class="ct-mface-in ct-mfront">${faceHTML(c.half)}</span></button>`).join('');
        fit(); paintScore(); play('card');
        const m = $('#me-msg'); m.className = 'total'; m.textContent = s.teams.length ? STR.turn(s.teams[0].name) : STR.found(0, s.pairs);
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
    const paintScore = () => {
        $('#me-score').innerHTML = s.teams.length
            ? s.teams.map((t, i) => `<span class="ct-mteam${i === s.turn && !s.over ? ' ct-active' : ''}">${escape(t.name)} <strong>${t.score}</strong></span>`).join('')
            : `<span class="ct-mteam">${STR.found(s.found, s.pairs)} · ${STR.moves(s.moves)}</span>`;
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
            const m = $('#me-msg'); m.className = 'total'; m.textContent = s.teams.length ? STR.turn(s.teams[s.turn].name) : STR.found(s.found, s.pairs);
            return;
        }
        s.busy = true;
        setTimeout(() => {
            s.open.forEach((k) => { s.cards[k].state = 'down'; cardEl(k).classList.remove('ct-up'); });
            s.open = []; s.busy = false;
            if (s.teams.length) { s.turn = 1 - s.turn; }
            paintScore();
            const m = $('#me-msg'); m.className = 'total'; m.textContent = s.teams.length ? STR.turn(s.teams[s.turn].name) : STR.found(s.found, s.pairs);
        }, 1150);
        paintScore();
    }
    const finish = () => {
        s.over = true; paintScore();
        let text = STR.done(s.moves);
        if (s.teams.length) {
            const [a, b] = s.teams;
            text = a.score === b.score ? STR.tie : STR.winner(a.score > b.score ? a.name : b.name);
        }
        const m = $('#me-msg'); m.className = 'total ct-win'; m.textContent = text;
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
