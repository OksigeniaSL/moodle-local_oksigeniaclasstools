// Hangman for the whole class, made friendly for primary school: instead of a hanged figure there are seven
// balloons, and each wrong letter pops one. The word is typed hidden or picked at random from a list.
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
        name: 'Ahorcado', start: 'Nueva palabra', builtin: 'Al azar: palabras de Primaria', needWord: 'Escribe la palabra o elige una lista.',
        won: '¡Muy bien! La han adivinado', lost: (w) => `¡Uy! Era «${w}»`, left: (n) => `${n} ${n === 1 ? 'globo' : 'globos'}`,
        reveal: 'Ver la palabra', pressStart: 'Elige la palabra y pulsa «Nueva palabra»', clue: (c) => `Pista: ${c}`,
    };
    const BALLOONS = ['#ce1423', '#fbbe17', '#067e36', '#164281', '#5b2fb8', '#0e7c86', '#c2410c'];
    const source = wordSource('ah', { label: STR.builtin, words: WORDS.primaria });
    const s = { word: '', target: '', guessed: new Set(), misses: 0, over: true };
    let visible = false, kb = null;

    const mount = (panel) => {
        panel.innerHTML = `
            <div class="ct-word-game">
                <aside class="tarjeta ct-side">
                    ${source.html}
                    <button type="button" class="boton grande" id="ah-start"><span data-icono="otra"></span>${STR.start}</button>
                    <button type="button" class="boton suave" id="ah-reveal" hidden><span data-icono="ocultar"></span>${STR.reveal}</button>
                    <p class="nota" id="ah-note"></p>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-balloons" id="ah-balloons" aria-hidden="true"></div>
                    <p class="ct-word-clue" id="ah-clue"></p>
                    <div class="ct-slots" id="ah-slots" aria-live="polite"></div>
                    <p class="total espera" id="ah-msg" aria-live="polite">${STR.pressStart}</p>
                    <div id="ah-keys"></div>
                </div>
            </div>`;
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        source.wire();
        kb = keyboard($('#ah-keys'), guess);
        keys(() => visible, (k) => { if (isLetter(k)) { guess(k); } });
        $('#ah-start').addEventListener('click', start);
        $('#ah-reveal').addEventListener('click', () => end(false));
        paintBalloons();
    };
    const paintBalloons = () => {
        $('#ah-balloons').innerHTML = BALLOONS.map((c, i) => `<span class="ct-balloon${i < s.misses ? ' ct-popped' : ''}" style="--c:${c}"></span>`).join('');
    };
    const paintSlots = (showAll) => {
        $('#ah-slots').innerHTML = s.word.split('').map((ch) => {
            const n = norm(ch);
            if (!isLetter(n)) { return `<span class="ct-slot ct-gap">${ch === ' ' ? '' : escape(ch)}</span>`; }
            const shown = showAll || s.guessed.has(n);
            return `<span class="ct-slot${shown ? ' ct-shown' : ''}${showAll && !s.guessed.has(n) ? ' ct-missed' : ''}">${shown ? escape(ch.toUpperCase()) : ''}</span>`;
        }).join('');
        const long = s.word.length > 10;
        $('#ah-slots').classList.toggle('ct-long', long);
    };
    const start = () => {
        const w = source.next((x) => norm(x).split('').some(isLetter) && x.length <= 24);
        if (!w) { $('#ah-note').textContent = STR.needWord; return; }
        $('#ah-note').textContent = '';
        source.clearTyped();
        s.word = w.trim(); s.target = norm(s.word); s.guessed = new Set(); s.misses = 0; s.over = false;
        kb.reset();
        const clue = source.clue();
        $('#ah-clue').textContent = clue ? STR.clue(clue) : '';
        paintBalloons(); paintSlots(false);
        const m = $('#ah-msg'); m.className = 'total'; m.textContent = STR.left(BALLOONS.length);
        $('#ah-reveal').hidden = false;
    };
    function guess(k) {
        if (s.over || s.guessed.has(k)) { return; }
        s.guessed.add(k);
        kb.mark(k, 'used');
        if (s.target.includes(k)) {
            kb.mark(k, 'correct');
            play('tic');
            paintSlots(false);
            if (s.target.split('').filter(isLetter).every((c) => s.guessed.has(c))) { end(true); return; }
        } else {
            kb.mark(k, 'absent');
            s.misses++;
            play('wrong');
            paintBalloons();
            if (s.misses >= BALLOONS.length) { end(false); return; }
        }
        const m = $('#ah-msg'); m.className = 'total'; m.textContent = STR.left(BALLOONS.length - s.misses);
    }
    const end = (won) => {
        if (s.over) { return; }
        s.over = true;
        paintSlots(true);
        const m = $('#ah-msg'); m.className = 'total ' + (won ? 'ct-win' : 'ct-lose');
        m.textContent = won ? STR.won : STR.lost(s.word.toUpperCase());
        $('#ah-reveal').hidden = true;
        play(won ? 'fin' : 'wrong'); announce(m.textContent);
    };

    games.add({
        id: 'ahorcado', name: STR.name, mount,
        enter: () => { visible = true; source.fill(); },
        leave: () => { visible = false; },
        space: () => { if (s.over) { start(); } },
    });
    window.ClasstoolsHangman = { start, guess, state: () => s };   // for automated tests
})();
