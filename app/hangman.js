// Hangman for the whole class, made friendly for primary school: instead of a hanged figure there are seven
// balloons, and each wrong letter spends one (it pops, or stays grey and deflated, as the teacher chooses; by default
// it stays from Secondary on). The word is typed hidden or picked at random from a list or a glossary of the course,
// and «Uncover a letter» gives one away for a balloon.
// In Early years it plays another game by default: the photo of a classmate, their name without its first letter
// and three big letters to choose from (the first name is the first written word children recognise).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games || !games.util) { return; }
    const { $, $$, escape, play, setIcon, announce, t, shuffle, random } = core;
    // The words, their letters and the keyboard come in the language of the words (the board's, or another one).
    const { wordSource, mode } = games.util;
    const { norm, isLetter, keyboard, keys, listOf } = games.util.words;

    const STR = {
        name: t('ah_name'), start: t('ga_new_word'), needWord: t('ah_need_word'),
        won: t('ah_won'), lost: (w) => t('ga_lost', w), left: (n) => t(n === 1 ? 'ah_left_one' : 'ah_left_many', n),
        reveal: t('ah_reveal'), pressStart: t('ga_press_new_word'), clue: (c) => t('ga_clue', c),
        kind: t('ah_kind'), kindWord: t('ah_kind_word'), kindInitial: t('ah_kind_initial'),
        spent: t('ah_spent'), spentGo: t('ah_spent_go'), spentStay: t('ah_spent_stay'),
        uncover: t('ah_uncover'), uncoverHint: t('ah_uncover_hint'),
        initialAsk: t('ah_initial_ask'), initialNext: t('ah_initial_next'), initialRight: (n) => t('ah_initial_right', n),
        initialNone: t('ah_initial_none'), initialStart: t('ah_initial_start'),
    };
    const BALLOONS = ['#ce1423', '#fbbe17', '#067e36', '#164281', '#5b2fb8', '#0e7c86', '#c2410c'];
    const source = wordSource('ah', { label: () => t('ah_builtin_' + mode()), words: () => listOf('hangman').words });
    // What each mode starts with: the first letter of a classmate's name in Early years, the whole word after it; spent
    // balloons go in the youngest modes and stay (grey) from Secondary on. The teacher's choice is kept per mode.
    const opts = core.byMode('ahorcado', {
        early: { kind: 'initial', spent: 'go' }, primary: { kind: 'word', spent: 'go' },
        secondary: { kind: 'word', spent: 'stay' }, advanced: { kind: 'word', spent: 'stay' },
    });
    const s = { word: '', target: '', guessed: new Set(), misses: 0, over: true };
    const ini = { name: '', list: null, letter: '', done: true, used: [] };
    let visible = false, kb = null;
    const kind = () => (opts.get().kind === 'initial' ? 'initial' : 'word');

    const mount = (panel) => {
        panel.innerHTML = `
            <div class="ct-word-game">
                <aside class="tarjeta ct-side">
                    <div class="ct-setup ct-setup-group">
                        <p class="ante">${STR.kind}</p>
                        <div class="segmentos ct-ah-kind" role="radiogroup" aria-label="${escape(STR.kind)}" id="ah-kind">
                            <button type="button" role="radio" aria-checked="false" data-v="word">${STR.kindWord}</button>
                            <button type="button" role="radio" aria-checked="false" data-v="initial">${STR.kindInitial}</button>
                        </div>
                        <div id="ah-word-box">
                            ${source.html}
                            <p class="ante">${STR.spent}</p>
                            <div class="segmentos" role="radiogroup" aria-label="${escape(STR.spent)}" id="ah-spent">
                                <button type="button" role="radio" aria-checked="false" data-v="go">${STR.spentGo}</button>
                                <button type="button" role="radio" aria-checked="false" data-v="stay">${STR.spentStay}</button>
                            </div>
                        </div>
                        <button type="button" class="boton grande" id="ah-start"><span data-icono="otra"></span><span>${STR.start}</span></button>
                    </div>
                    <button type="button" class="boton suave" id="ah-uncover" hidden title="${escape(STR.uncoverHint)}"><span data-icono="pista"></span><span>${STR.uncover}</span></button>
                    <button type="button" class="boton suave" id="ah-reveal" hidden><span data-icono="ocultar"></span>${STR.reveal}</button>
                    <p class="nota" id="ah-note"></p>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-ah-word" id="ah-word-stage">
                        <div class="ct-balloons" id="ah-balloons" aria-hidden="true"></div>
                        <p class="ct-word-clue" id="ah-clue"></p>
                        <div class="ct-slots" id="ah-slots" aria-live="polite"></div>
                    </div>
                    <div class="ct-ah-initial" id="ah-initial" hidden>
                        <div class="ct-ah-face" id="ah-face" aria-hidden="true"></div>
                        <div class="ct-slots" id="ah-name" aria-live="polite"></div>
                        <div class="ct-ah-choices" id="ah-choices"></div>
                    </div>
                    <p class="total espera" id="ah-msg" aria-live="polite">${STR.pressStart}</p>
                    <div id="ah-keys"></div>
                </div>
            </div>`;
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        source.wire();
        kb = keyboard($('#ah-keys'), guess);
        keys(() => visible && kind() === 'word', (k) => { if (isLetter(k)) { guess(k); } });
        // Another language of the words: its keyboard, and the word under way is left (its letters were of the other).
        document.addEventListener('classtools:wordlang', () => {
            kb = keyboard($('#ah-keys'), guess);
            if (!s.over) { s.over = true; games.playing('ahorcado', false); $('#ah-reveal').hidden = true; $('#ah-uncover').hidden = true; }
            $('#ah-slots').innerHTML = ''; $('#ah-clue').textContent = '';
            if (kind() === 'word') { const m = $('#ah-msg'); m.className = 'total espera'; m.textContent = STR.pressStart; }
        });
        const seg = (id, key) => $(id).addEventListener('click', (e) => {
            const b = e.target.closest('button[data-v]');
            if (!b) { return; }
            opts.set({ [key]: b.dataset.v });
            paintOptions();
        });
        seg('#ah-kind', 'kind');
        seg('#ah-spent', 'spent');
        document.addEventListener('classtools:mode', paintOptions);
        $('#ah-start').addEventListener('click', () => (kind() === 'initial' ? startInitial() : start()));
        $('#ah-reveal').addEventListener('click', () => end(false));
        $('#ah-uncover').addEventListener('click', uncover);
        $('#ah-choices').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { choose(b); } });
        paintOptions();
    };
    // The settings of the mode on screen, and the stage of the game chosen.
    function paintOptions() {
        const o = opts.get(), k = kind();
        $$('#ah-kind button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === k)));
        $$('#ah-spent button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === (o.spent === 'stay' ? 'stay' : 'go'))));
        $('#ah-word-box').hidden = k !== 'word';
        $('#ah-word-stage').hidden = k !== 'word';
        $('#ah-keys').hidden = k !== 'word';
        $('#ah-initial').hidden = k !== 'initial';
        core.relabel($('#ah-start'), k === 'initial' ? STR.initialStart : STR.start, 'otra');
        if (k === 'word') { paintBalloons(); }
        const m = $('#ah-msg');
        if ((k === 'word' && s.over) || (k === 'initial' && ini.done && !ini.name)) { m.className = 'total espera'; m.textContent = STR.pressStart; }
        $('#ah-uncover').hidden = k !== 'word' || s.over;
    }
    const paintBalloons = () => {
        const spent = opts.get().spent === 'stay' ? ' ct-spent' : ' ct-popped';
        $('#ah-balloons').innerHTML = BALLOONS.map((c, i) => `<span class="ct-balloon${i < s.misses ? spent : ''}" style="--c:${c}"></span>`).join('');
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
    const left = () => { const m = $('#ah-msg'); m.className = 'total'; m.textContent = STR.left(BALLOONS.length - s.misses); };
    const start = () => {
        const w = source.next((x) => norm(x).split('').some(isLetter) && x.length <= 24);
        if (!w) { $('#ah-note').textContent = STR.needWord; return; }
        $('#ah-note').textContent = '';
        source.clearTyped();
        s.word = w.trim(); s.target = norm(s.word); s.guessed = new Set(); s.misses = 0; s.over = false;
        kb.reset();
        games.playing('ahorcado', true);
        const clue = source.clue();
        $('#ah-clue').textContent = clue ? STR.clue(clue) : '';
        paintBalloons(); paintSlots(false); left();
        $('#ah-reveal').hidden = false;
        $('#ah-uncover').hidden = false;
        paintUncover();
    };
    const won = () => s.target.split('').filter(isLetter).every((c) => s.guessed.has(c));
    // «Uncover a letter» costs a balloon, so it is not offered when only one is left.
    const paintUncover = () => { $('#ah-uncover').disabled = s.over || BALLOONS.length - s.misses <= 1; };
    function uncover() {
        if (s.over || BALLOONS.length - s.misses <= 1) { return; }
        const hidden = [...new Set(s.target.split('').filter((c) => isLetter(c) && !s.guessed.has(c)))];
        if (!hidden.length) { return; }
        const k = hidden[random(hidden.length)];
        s.misses++;
        s.guessed.add(k);
        kb.mark(k, 'used'); kb.mark(k, 'correct');
        play('tic');
        paintBalloons(); paintSlots(false);
        if (won()) { end(true); return; }
        left(); paintUncover();
    }
    function guess(k) {
        if (s.over || s.guessed.has(k)) { return; }
        s.guessed.add(k);
        kb.mark(k, 'used');
        if (s.target.includes(k)) {
            kb.mark(k, 'correct');
            play('tic');
            paintSlots(false);
            if (won()) { end(true); return; }
        } else {
            kb.mark(k, 'absent');
            s.misses++;
            play('wrong');
            paintBalloons();
            if (s.misses >= BALLOONS.length) { end(false); return; }
        }
        left(); paintUncover();
    }
    const end = (win) => {
        if (s.over) { return; }
        s.over = true; games.playing('ahorcado', false);
        paintSlots(true);
        const m = $('#ah-msg'); m.className = 'total ' + (win ? 'ct-win' : 'ct-lose');
        m.textContent = win ? STR.won : STR.lost(s.word.toUpperCase());
        if (win && core.celebrate) { core.celebrate($('#ah-slots').closest('.ct-stage'), { title: STR.won, text: s.word.toUpperCase(), glow: [$('#ah-slots')], again: STR.start, onAgain: start }); }
        $('#ah-reveal').hidden = true;
        $('#ah-uncover').hidden = true;
        play(win ? 'fin' : 'wrong'); announce(m.textContent);
    };

    // ---------------------------------------------------------------------------------------------------
    // Early years: the first letter of a classmate's name. Their photo, the name without its first letter and three
    // big letters: the right one and two initials of other classmates (letters they know), or others of the alphabet.
    // ---------------------------------------------------------------------------------------------------
    const ownNorm = games.util.norm, ownLetter = games.util.isLetter;
    const ALPHABET = [...window.CLASSTOOLS_CONTENT.alphabet];
    const classList = () => {
        const active = core.activeList ? core.activeList() : null;
        return active && active.aula ? active : core.lists().find((l) => l.aula) || null;
    };
    const firstName = (name) => String(name).trim().split(/\s+/)[0] || '';
    function startInitial() {
        const list = classList(), names = list ? core.present(list).filter((n) => ownLetter(ownNorm(firstName(n)).charAt(0))) : [];
        if (!names.length) { $('#ah-note').textContent = STR.initialNone; return; }
        $('#ah-note').textContent = '';
        // Everyone comes out before anyone comes out again.
        if (ini.used.filter((n) => names.includes(n)).length >= names.length) { ini.used = []; }
        const fresh = names.filter((n) => !ini.used.includes(n));
        const name = fresh[random(fresh.length)];
        ini.used.push(name);
        const shown = core.nameCase ? core.nameCase(firstName(name)) : firstName(name);
        const letter = ownNorm(shown.charAt(0));
        const others = shuffle([...new Set(names.map((n) => ownNorm(firstName(n)).charAt(0)))].filter((c) => c !== letter && ownLetter(c)));
        const rest = shuffle(ALPHABET.filter((c) => c !== letter && !others.includes(c)));
        const choices = shuffle([letter, ...others.concat(rest).slice(0, 2)]);
        Object.assign(ini, { name, shown, list, letter, done: false });
        $('#ah-face').innerHTML = core.face ? core.face(list, name, 'cara-grande') : '';
        $('#ah-name').innerHTML = [...shown].map((ch, i) => (i === 0 ? '<span class="ct-slot"></span>'
            : `<span class="ct-slot ct-shown">${escape(ch)}</span>`)).join('');
        const lower = shown.charAt(0) !== shown.charAt(0).toUpperCase() || shown.slice(1) !== shown.slice(1).toUpperCase();
        $('#ah-choices').innerHTML = choices.map((c) => `<button type="button" class="ct-ah-choice" data-k="${escape(c)}">${escape(lower ? c : c.toUpperCase())}</button>`).join('');
        const m = $('#ah-msg'); m.className = 'total'; m.textContent = STR.initialAsk;
        core.relabel($('#ah-start'), STR.initialNext, 'otra');
        games.playing('ahorcado', true);
    }
    function choose(b) {
        if (ini.done || b.disabled) { return; }
        if (b.dataset.k !== ini.letter) {
            b.disabled = true; b.classList.add('ct-no');
            play('wrong');
            return;
        }
        ini.done = true;
        b.classList.add('ct-right');
        $$('#ah-choices button').forEach((x) => { x.disabled = true; });
        const first = $('#ah-name .ct-slot');
        first.textContent = ini.shown.charAt(0); first.classList.add('ct-shown');
        const m = $('#ah-msg'); m.className = 'total ct-win'; m.textContent = STR.initialRight(ini.shown);
        play('fin'); announce(m.textContent);
        games.playing('ahorcado', false);
    }

    games.add({
        id: 'ahorcado', name: STR.name, mount,
        enter: () => { visible = true; source.fill(); paintOptions(); },
        leave: () => { visible = false; },
        space: () => {
            if (kind() === 'initial') { if (ini.done) { startInitial(); } return; }
            if (s.over) { start(); }
        },
    });
    window.ClasstoolsHangman = { start, guess, uncover, startInitial, state: () => s, initial: () => ini };   // for automated tests
})();
