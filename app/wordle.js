// Guess the word (like Wordle) for the whole class: six tries; green if the letter is in its place, yellow if it
// is in the word but somewhere else, grey if it is not. The class proposes, the teacher types. There is no
// dictionary: any try with the right number of letters counts.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games || !games.util) { return; }
    const { $, $$, escape, play, setIcon, announce } = core;
    const { norm, isLetter, keyboard, keys, wordSource, WORDS } = games.util;

    const STR = {
        name: 'Palabra', start: 'Nueva palabra', builtin: 'Al azar: palabras de 5 letras', tries: 'Intentos',
        needWord: 'La palabra tiene que tener de 3 a 8 letras, sin espacios.', pressStart: 'Elige la palabra y pulsa «Nueva palabra»',
        letters: (n) => `Palabra de ${n} letras`, short: (n) => `Faltan letras: tiene ${n}`, won: (n) => `¡Muy bien! Al ${n}.º intento`,
        lost: (w) => `¡Uy! Era «${w}»`, clue: (c) => `Pista: ${c}`, hint: 'de 3 a 8 letras',
    };
    const source = wordSource('wo', { label: STR.builtin, words: WORDS.cinco }, { lengthHint: STR.hint });
    const s = { word: '', target: '', rows: [], current: '', over: true, maxRows: 6 };
    let visible = false, kb = null;
    const valid = (w) => { const n = norm(w.trim()); return n.length >= 3 && n.length <= 8 && n.split('').every(isLetter); };

    const mount = (panel) => {
        panel.innerHTML = `
            <div class="ct-word-game ct-collapsible">
                <aside class="tarjeta ct-side ct-setup">
                    ${source.html}
                    <label class="campo apilado"><span>${STR.tries}</span><select id="wo-rows">${[5, 6, 7, 8].map((n) => `<option value="${n}"${n === 6 ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
                    <button type="button" class="boton grande" id="wo-start"><span data-icono="otra"></span>${STR.start}</button>
                    <p class="nota" id="wo-note"></p>
                </aside>
                <div class="tarjeta ct-stage">
                    <p class="ct-word-clue" id="wo-clue"></p>
                    <div class="ct-wordle" id="wo-grid" aria-live="polite"></div>
                    <p class="total espera" id="wo-msg" aria-live="polite">${STR.pressStart}</p>
                    <div id="wo-keys"></div>
                </div>
            </div>`;
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        source.wire();
        kb = keyboard($('#wo-keys'), type, { enter: true });
        keys(() => visible, type);
        $('#wo-start').addEventListener('click', start);
    };
    // Colours of a try, with repeated letters counted as in the real game.
    const score = (tryWord) => {
        const t = s.target.split(''), g = tryWord.split(''), res = Array(g.length).fill('absent'), left = {};
        t.forEach((c, i) => { if (g[i] === c) { res[i] = 'correct'; } else { left[c] = (left[c] || 0) + 1; } });
        g.forEach((c, i) => { if (res[i] !== 'correct' && left[c]) { res[i] = 'present'; left[c]--; } });
        return res;
    };
    const paint = () => {
        const n = s.target.length;
        $('#wo-grid').style.setProperty('--cols', n);
        $('#wo-grid').innerHTML = Array.from({ length: s.maxRows }, (_, r) => {
            const row = s.rows[r];
            const letters = row ? row.word.split('') : (r === s.rows.length ? s.current.split('') : []);
            return `<div class="ct-wrow${r === s.rows.length && !s.over ? ' ct-now' : ''}">${Array.from({ length: n }, (_, i) =>
                `<span class="ct-wcell${row ? ' ct-' + row.res[i] : (letters[i] ? ' ct-typed' : '')}" style="--d:${i * 90}ms">${escape(letters[i] || '')}</span>`).join('')}</div>`;
        }).join('');
    };
    const start = () => {
        s.maxRows = Number($('#wo-rows').value);
        const w = source.next(valid);
        if (!w) { $('#wo-note').textContent = STR.needWord; return; }
        $('#wo-note').textContent = '';
        source.clearTyped();
        s.word = w.trim().toUpperCase(); s.target = norm(s.word); s.rows = []; s.current = ''; s.over = false;
        kb.reset();
        games.playing('palabra', true);
        const clue = source.clue();
        $('#wo-clue').textContent = clue ? STR.clue(clue) : '';
        paint();
        const m = $('#wo-msg'); m.className = 'total'; m.textContent = STR.letters(s.target.length);
    };
    function type(k) {
        if (s.over) { return; }
        const n = s.target.length;
        if (k === 'BACK') { s.current = s.current.slice(0, -1); paint(); return; }
        if (k === 'ENTER') {
            if (s.current.length < n) { const m = $('#wo-msg'); m.className = 'total'; m.textContent = STR.short(n); play('minus'); return; }
            const res = score(s.current);
            s.rows.push({ word: s.current, res });
            s.current.split('').forEach((c, i) => kb.mark(c, res[i]));
            const won = res.every((x) => x === 'correct');
            s.current = '';
            if (won || s.rows.length >= s.maxRows) {
                s.over = true; paint(); games.playing('palabra', false);
                const m = $('#wo-msg'); m.className = 'total ' + (won ? 'ct-win' : 'ct-lose');
                m.textContent = won ? STR.won(s.rows.length) : STR.lost(s.word);
                play(won ? 'fin' : 'wrong'); announce(m.textContent);
                return;
            }
            paint(); play('card');
            const m = $('#wo-msg'); m.className = 'total'; m.textContent = STR.letters(n);
            return;
        }
        if (isLetter(k) && s.current.length < n) { s.current += k; paint(); play('tic'); }
    }

    games.add({
        id: 'palabra', name: STR.name, mount,
        enter: () => { visible = true; source.fill(); },
        leave: () => { visible = false; },
        space: () => { if (s.over) { start(); } },
    });
    window.ClasstoolsWordle = { start, type, state: () => s };   // for automated tests
})();
