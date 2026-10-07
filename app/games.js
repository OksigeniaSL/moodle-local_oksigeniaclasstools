// Whole-class games for the board. Each game lives in its own file and registers here with
// window.ClasstoolsGames.add({ id, name, mount(panel), enter(), leave(), space() }).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-juegos');
    if (!core || !root) { return; }
    const { $, $$, save, load } = core;

    root.innerHTML = `
        <div class="barra-herr ct-top"><div class="segmentos" role="radiogroup" aria-label="Juego" id="ga-mode"></div></div>
        <div class="ct-body" id="ga-body"></div>`;
    const games = [];
    let current = null, visible = false;

    const paintModes = () => {
        $('#ga-mode').innerHTML = games.map((g) => `<button type="button" role="radio" aria-checked="${g.id === current}" data-game="${g.id}">${g.name}</button>`).join('');
    };
    const show = (id, remember = true) => {
        const game = games.find((g) => g.id === id) || games[0];
        if (!game) { return; }
        const before = games.find((g) => g.id === current);
        if (before && before !== game && before.leave) { before.leave(); }
        current = game.id;
        if (remember) { save('juego', current); }
        $$('.ct-game', root).forEach((p) => { p.hidden = p.dataset.game !== current; });
        paintModes();
        if (visible && game.enter) { game.enter(); }
    };
    $('#ga-mode').addEventListener('click', (e) => { const b = e.target.closest('button[data-game]'); if (b) { show(b.dataset.game); } });

    // ---------------------------------------------------------------------------------------------------
    // Shared helpers for the word games: letters without accents (but Ñ is its own letter), a Spanish
    // on-screen keyboard and the secret word (typed hidden on the board, or picked at random from a list).
    // ---------------------------------------------------------------------------------------------------
    const ACCENTS = { 'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A', 'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E', 'Í': 'I', 'Ì': 'I', 'Ï': 'I',
        'Î': 'I', 'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O', 'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U', 'Ç': 'C' };
    const norm = (text) => String(text).toUpperCase().split('').map((c) => ACCENTS[c] || c).join('');
    const isLetter = (c) => /^[A-ZÑ]$/.test(c);
    const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
    const WORDS = {
        primaria: ['ELEFANTE', 'JIRAFA', 'MARIPOSA', 'COCODRILO', 'PINGÜINO', 'TORTUGA', 'DELFÍN', 'CANGURO', 'ARDILLA', 'CABALLO',
            'VOLCÁN', 'MONTAÑA', 'OCÉANO', 'PLANETA', 'ESTRELLA', 'ARCOÍRIS', 'TORMENTA', 'CASCADA', 'DESIERTO', 'BOSQUE',
            'PIZARRA', 'MOCHILA', 'CUADERNO', 'ORDENADOR', 'BIBLIOTECA', 'TIJERAS', 'CALENDARIO', 'DICCIONARIO', 'RECREO', 'LÁPIZ',
            'BICICLETA', 'HELICÓPTERO', 'SUBMARINO', 'TELESCOPIO', 'GUITARRA', 'TAMBOR', 'CHOCOLATE', 'NARANJA', 'PLÁTANO', 'SANDÍA',
            'ROBOT', 'ASTRONAUTA', 'CASTILLO', 'DINOSAURIO', 'PIRÁMIDE', 'BRÚJULA', 'FAROLA', 'PARAGUAS', 'TELARAÑA', 'MURCIÉLAGO'],
        cinco: ['ÁRBOL', 'LIBRO', 'MONTE', 'PLAYA', 'NUBES', 'VERDE', 'SILLA', 'LÁPIZ', 'RELOJ', 'FRESA', 'LIMÓN', 'BARCO', 'CIELO',
            'PLATO', 'CAMPO', 'ROBOT', 'MANGO', 'PIANO', 'TECLA', 'NIEVE', 'VOLAR', 'SALTO', 'PUNTO', 'TIGRE', 'CEBRA', 'PATIO',
            'AVIÓN', 'QUESO', 'LECHE', 'HUEVO', 'MAPAS', 'PERRO', 'GATOS', 'FLORES', 'RATÓN', 'BRAZO', 'DEDOS', 'CARTA', 'LLAVE', 'TORRE'],
    };
    WORDS.cinco = WORDS.cinco.filter((w) => norm(w).length === 5);
    const keyboard = (box, onKey, { enter = false } = {}) => {
        box.classList.add('ct-keyboard');
        box.innerHTML = KEY_ROWS.map((row, r) => `<div class="ct-krow">${r === 2 && enter ? '<button type="button" class="ct-key ct-wide" data-k="ENTER">Probar</button>' : ''}`
            + row.split('').map((k) => `<button type="button" class="ct-key" data-k="${k}">${k}</button>`).join('')
            + `${r === 2 && enter ? '<button type="button" class="ct-key ct-wide" data-k="BACK" aria-label="Borrar">⌫</button>' : ''}</div>`).join('');
        box.addEventListener('click', (e) => { const b = e.target.closest('.ct-key'); if (b && !b.disabled) { onKey(b.dataset.k); } });
        return {
            mark: (k, state) => {
                const b = box.querySelector(`.ct-key[data-k="${k}"]`);
                if (!b) { return; }
                const rank = { absent: 1, present: 2, correct: 3 };
                if ((rank[state] || 0) >= (rank[b.dataset.state] || 0)) { b.dataset.state = state; }
                if (state === 'used') { b.disabled = true; }
            },
            reset: () => box.querySelectorAll('.ct-key').forEach((b) => { delete b.dataset.state; b.disabled = false; }),
            lock: (on) => box.querySelectorAll('.ct-key').forEach((b) => { if (on) { b.dataset.locked = '1'; } else { delete b.dataset.locked; } }),
        };
    };
    // Physical keyboard for a game while it is shown: letters (with or without accents), Enter and Backspace.
    const keys = (isActive, onKey) => document.addEventListener('keydown', (e) => {
        if (!isActive() || e.repeat || e.ctrlKey || e.altKey || e.metaKey || document.querySelector('dialog[open]')) { return; }
        if (e.target.closest && e.target.closest('input, textarea, select')) { return; }
        if (e.key === 'Enter') { e.preventDefault(); onKey('ENTER'); return; }
        if (e.key === 'Backspace') { e.preventDefault(); onKey('BACK'); return; }
        const k = norm(e.key);
        if (k.length === 1 && isLetter(k)) { e.preventDefault(); onKey(k); }
    });
    // The secret word: typed hidden («Escribirla yo») or at random from built-in words or the teacher's lists.
    const wordSource = (prefix, builtin, { lengthHint } = {}) => {
        const html = `
            <label class="campo apilado"><span>Palabra</span><select id="${prefix}-src"></select></label>
            <label class="campo apilado" id="${prefix}-type-box"><span>Palabra secreta (no se ve)</span>
                <input type="password" id="${prefix}-word" autocomplete="off" spellcheck="false" maxlength="24"${lengthHint ? ` placeholder="${lengthHint}"` : ''}></label>
            <label class="campo apilado"><span>Pista (si quieres)</span><input type="text" id="${prefix}-clue" maxlength="90" autocomplete="off"></label>`;
        const fill = () => {
            const sel = $(`#${prefix}-src`), before = sel.value || load(prefix + '-fuente', 'builtin');
            const own = core.lists().filter((l) => !l.aula);
            sel.innerHTML = `<option value="type">Escribirla yo</option><option value="builtin">${builtin.label}</option>`
                + (own.length ? `<optgroup label="Al azar de tus listas">${own.map((l) => `<option value="list:${core.escape(l.id)}">${core.escape(l.nombre)}</option>`).join('')}</optgroup>` : '');
            sel.value = [...sel.options].some((o) => o.value === before) ? before : 'builtin';
            $(`#${prefix}-type-box`).hidden = sel.value !== 'type';
        };
        const pool = () => {
            const v = $(`#${prefix}-src`).value;
            if (v === 'builtin') { return builtin.words; }
            if (v.startsWith('list:')) { const l = core.lists().find((x) => x.id === v.slice(5)); return l ? l.alumnos : []; }
            return [];
        };
        // Words already used come out again only when all have come out.
        const used = {};
        const next = (accept = () => true) => {
            const v = $(`#${prefix}-src`).value;
            if (v === 'type') {
                const w = $(`#${prefix}-word`).value.trim();
                return accept(w) ? w : null;
            }
            const all = pool().filter(accept);
            if (!all.length) { return null; }
            used[v] = (used[v] || []).filter((w) => all.includes(w));
            if (used[v].length >= all.length) { used[v] = []; }
            const fresh = all.filter((w) => !used[v].includes(w));
            const w = fresh[core.random(fresh.length)];
            used[v].push(w);
            return w;
        };
        return {
            html, fill, next,
            wire: () => {
                $(`#${prefix}-src`).addEventListener('change', () => { save(prefix + '-fuente', $(`#${prefix}-src`).value); $(`#${prefix}-type-box`).hidden = $(`#${prefix}-src`).value !== 'type'; });
                document.addEventListener('classtools:lists', fill);
                fill();
            },
            clue: () => $(`#${prefix}-clue`).value.trim(),
            clearTyped: () => { $(`#${prefix}-word`).value = ''; },
        };
    };

    window.ClasstoolsGames = {
        util: { norm, isLetter, keyboard, keys, wordSource, WORDS },
        add(game) {
            const panel = document.createElement('div');
            panel.className = 'ct-game';
            panel.dataset.game = game.id;
            panel.hidden = true;
            $('#ga-body').append(panel);
            games.push(game);
            game.mount(panel);
            const wanted = load('juego', null);   // the game used last time, as soon as it is registered
            show(games.some((g) => g.id === wanted) ? wanted : (current || game.id), false);
        },
        show,
    };
    core.register('juegos', {
        entra: () => { visible = true; show(current); },
        sale: () => { visible = false; const g = games.find((x) => x.id === current); if (g && g.leave) { g.leave(); } },
        espacio: () => { const g = games.find((x) => x.id === current); if (g && g.space) { g.space(); } },
    });
})();
