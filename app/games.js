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
    const { $, $$, save, load, t, escape } = core;

    root.innerHTML = `
        <div class="barra-herr ct-top"><div class="segmentos" role="radiogroup" aria-label="${escape(t('ga_game'))}" id="ga-mode"></div>
            <div class="ct-push ct-top-botones">
                <button type="button" class="boton suave" id="ga-turn" hidden><span data-icono="quien"></span><span>${escape(t('turn_button'))}</span></button>
                <button type="button" class="boton suave" id="ga-setup" hidden><span data-icono="editar"></span>${t('ga_settings')}</button></div></div>
        <div class="ct-body" id="ga-body"></div>`;
    const games = [];
    let current = null, visible = false;

    const paintModes = () => {
        $('#ga-mode').innerHTML = games.map((g) => `<button type="button" role="radio" aria-checked="${g.id === current}" data-game="${g.id}">${g.name}</button>`).join('');
        if (core.otherLevels) { core.otherLevels($('#ga-mode'), 'game'); }
    };
    document.addEventListener('classtools:mode', () => paintModes());
    const show = (id, remember = true) => {
        const game = games.find((g) => g.id === id) || games[0];
        if (!game) { return; }
        const before = games.find((g) => g.id === current);
        if (before && before !== game && before.leave) { before.leave(); }
        current = game.id;
        if (remember) { save('juego', current); }
        $$('.ct-game', root).forEach((p) => { p.hidden = p.dataset.game !== current; });
        paintModes(); paintSetup();
        if (visible && game.enter) { game.enter(); }
    };
    $('#ga-mode').addEventListener('click', (e) => { const b = e.target.closest('button[data-game]'); if (b) { show(b.dataset.game); } });
    // While a game is being played its settings step aside, so the class sees the game; «Ajustes» brings them back,
    // and they come back by themselves when the game ends.
    const panelOf = (id) => $(`.ct-game[data-game="${id}"]`, root);
    const paintSetup = () => { const p = current && panelOf(current); $('#ga-setup').hidden = !(p && p.classList.contains('ct-playing')); };
    const playing = (id, on) => { const p = panelOf(id); if (p) { p.classList.toggle('ct-playing', !!on); } paintSetup(); };
    $('#ga-setup').addEventListener('click', () => playing(current, false));
    core.setIcon($('#ga-setup [data-icono]'), 'editar');
    // «Whose turn?» for any game, with a class list: who comes to the board.
    const paintTurn = () => { $('#ga-turn').hidden = !(core.turn && core.lists && core.lists().length); };
    $('#ga-turn').addEventListener('click', () => core.turn($('#ga-body'), { task: t('turn_task_board') }));
    core.setIcon($('#ga-turn [data-icono]'), 'quien');

    // ---------------------------------------------------------------------------------------------------
    // Shared helpers for the word games: letters without accents (but the letters of the language stay, like Ñ or
    // Å), the on-screen keyboard of the language and the secret word (typed hidden on the board, or picked at random
    // from a list). Everything that depends on the language comes in a content pack (window.CLASSTOOLS_CONTENT).
    // ---------------------------------------------------------------------------------------------------
    // The built-in words follow the screen mode: Hangman from very short words (Early years) to demanding ones
    // (Advanced); Word from four letters to seven. A pack without the list of a mode falls back to the Primary one.
    const LISTS = {
        hangman: { early: 'early', primary: 'long', secondary: 'secondary', advanced: 'advanced' },
        word: { early: 'four', primary: 'five', secondary: 'six', advanced: 'seven' },
    };
    const LETTERS = { four: 4, five: 5, six: 6, seven: 7 };
    const mode = () => (core.mode ? core.mode() : 'primary');
    // The helpers for a content pack, read when they are used: get() says which pack.
    const helpers = (get) => {
        let seen = null, alphabet = null;
        const letters = () => { const c = get(); if (c !== seen) { seen = c; alphabet = new Set([...c.alphabet]); } return alphabet; };
        // Each character: a letter of the alphabet as it is (ß stays ß), otherwise in capitals and folded (Á → A).
        const norm = (text) => [...String(text)].map((c) => {
            if (letters().has(c)) { return c; }
            const u = c.toUpperCase();
            return letters().has(u) ? u : (get().fold[u] || u);
        }).join('');
        const isLetter = (c) => letters().has(c);
        const listOf = (game) => {
            const words = get().words;
            const key = Array.isArray(words[LISTS[game][mode()]]) ? LISTS[game][mode()] : LISTS[game].primary;
            const all = words[key] || [];
            return { key, words: LETTERS[key] ? all.filter((w) => [...norm(w)].length === LETTERS[key]) : all, letters: LETTERS[key] || 0 };
        };
        // Drawn again when the language of the words changes, so its click goes in once (onclick).
        const keyboard = (box, onKey, { enter = false } = {}) => {
            box.classList.add('ct-keyboard');
            box.innerHTML = get().keyboard.map((row, r) => `<div class="ct-krow">${r === 2 && enter ? `<button type="button" class="ct-key ct-wide" data-k="ENTER">${t('ga_try')}</button>` : ''}`
                + row.split('').map((k) => `<button type="button" class="ct-key" data-k="${k}">${k}</button>`).join('')
                + `${r === 2 && enter ? `<button type="button" class="ct-key ct-wide" data-k="BACK" aria-label="${escape(t('ga_delete'))}">⌫</button>` : ''}</div>`).join('');
            box.onclick = (e) => { const b = e.target.closest('.ct-key'); if (b && !b.disabled) { onKey(b.dataset.k); } };
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
        return { norm, isLetter, listOf, keyboard, keys };
    };
    const OWN = window.CLASSTOOLS_CONTENT;
    const { norm, isLetter, listOf, keyboard, keys } = helpers(() => OWN);

    // The language of the words of Hangman and Word: the board's own, or another pack for a language class (a teacher
    // of English with the board in Spanish). Loaded when chosen: content/xx.js sets window.CLASSTOOLS_CONTENT, so the
    // board's own pack is put back afterwards. Kept per course.
    const PACKS = ['en', 'es', 'es_mx', 'fr', 'de', 'it', 'pt_br', 'nl', 'sv'];
    const packs = { [OWN.lang]: OWN };
    let wordPack = OWN, loading = Promise.resolve();
    const words = helpers(() => wordPack);
    const WORDS_KEY = 'palabras-idioma-' + (core.moodle && core.moodle.courseid ? core.moodle.courseid : 0);
    const langName = (code) => {
        try {
            const tag = code.replace('_', '-'), n = new Intl.DisplayNames([tag], { type: 'language' }).of(tag);
            return n.charAt(0).toUpperCase() + n.slice(1);
        } catch (e) { return code; }
    };
    const loadPack = (code) => {
        if (packs[code]) { return Promise.resolve(packs[code]); }
        loading = loading.then(() => new Promise((done) => {
            const own = window.CLASSTOOLS_CONTENT, el = document.createElement('script');
            const src = (document.querySelector('script[src*="content/"]') || {}).src || '';
            el.src = `content/${code}.js${src.includes('?') ? src.slice(src.indexOf('?')) : ''}`;
            el.onload = el.onerror = () => {
                const got = window.CLASSTOOLS_CONTENT;
                window.CLASSTOOLS_CONTENT = own;
                el.remove();
                if (got && got !== own && got.lang === code) { packs[code] = got; }
                done(packs[code] || null);
            };
            document.head.append(el);
        }));
        return loading;
    };
    const useWordLang = (code) => loadPack(code).then((pack) => {
        wordPack = pack || OWN;
        document.dispatchEvent(new CustomEvent('classtools:wordlang', { detail: wordPack.lang }));
    });
    const savedLang = load(WORDS_KEY, OWN.lang);
    if (savedLang !== OWN.lang && PACKS.includes(savedLang)) { useWordLang(savedLang); }

    // The glossaries of the course (inside Moodle) as a source of words: the list is asked once, and the words of a
    // glossary when it is chosen. Each word comes with a clue from its definition.
    const AULA = core.moodle;
    const glossaryCall = (action, extra = {}) => fetch(AULA.glossaryurl, { method: 'POST', credentials: 'same-origin',
        body: new URLSearchParams({ courseid: AULA.courseid, sesskey: AULA.sesskey, action, ...extra }) })
        .then((r) => r.json()).then((j) => { if (!j || !j.ok) { throw new Error((j && (j.errorcode || j.error)) || 'error'); } return j; });
    let glossaries = null;
    const glossaryWords = {};
    const askGlossaries = () => {
        if (glossaries || !AULA || !AULA.glossaryurl) { return; }
        glossaries = [];
        glossaryCall('list').then((j) => {
            glossaries = j.glossaries || [];
            if (glossaries.length) { document.dispatchEvent(new CustomEvent('classtools:glossaries')); }
        }).catch(() => { /* No glossaries: the other sources stay. */ });
    };
    const loadGlossary = (id) => {
        if (!glossaryWords[id]) {
            glossaryWords[id] = glossaryCall('words', { glossaryid: id })
                .then((j) => { glossaryWords[id] = j.words || []; return glossaryWords[id]; })
                .catch(() => { delete glossaryWords[id]; return []; });
        }
        return Promise.resolve(glossaryWords[id]);
    };
    const glossaryOf = (id) => (Array.isArray(glossaryWords[id]) ? glossaryWords[id] : []);

    // The secret word: typed hidden («Escribirla yo») or at random from built-in words, the teacher's lists or a
    // glossary of the course.
    const wordSource = (prefix, builtin, { lengthHint } = {}) => {
        const html = `
            <label class="campo apilado"><span>${t('ga_words_lang')}</span><select id="${prefix}-lang">
                ${[OWN.lang, ...PACKS.filter((c) => c !== OWN.lang)].map((c) => `<option value="${c}">${escape(langName(c))}</option>`).join('')}</select></label>
            <label class="campo apilado"><span>${t('ga_word')}</span><select id="${prefix}-src"></select></label>
            <label class="campo apilado" id="${prefix}-type-box"><span>${t('ga_secret_word')}</span>
                <input type="password" id="${prefix}-word" autocomplete="off" spellcheck="false" maxlength="24"${lengthHint ? ` placeholder="${escape(lengthHint)}"` : ''}></label>
            <label class="campo apilado"><span>${t('ga_clue_optional')}</span><input type="text" id="${prefix}-clue" maxlength="90" autocomplete="off"></label>`;
        const fill = () => {
            const sel = $(`#${prefix}-src`), before = sel.value || load(prefix + '-fuente', 'builtin');
            const own = core.lists().filter((l) => !l.aula);
            sel.innerHTML = `<option value="type">${t('ga_type_it')}</option><option value="builtin">${escape(builtin.label())}</option>`
                + (own.length ? `<optgroup label="${escape(t('ga_from_lists'))}">${own.map((l) => `<option value="list:${core.escape(l.id)}">${core.escape(l.nombre)}</option>`).join('')}</optgroup>` : '')
                + (glossaries && glossaries.length ? `<optgroup label="${escape(t('ga_from_glossary'))}">${glossaries.map((g) => `<option value="glos:${g.id}">${escape(g.name)} (${g.count})</option>`).join('')}</optgroup>` : '');
            sel.value = [...sel.options].some((o) => o.value === before) ? before : 'builtin';
            $(`#${prefix}-type-box`).hidden = sel.value !== 'type';
            if (sel.value.startsWith('glos:')) { loadGlossary(sel.value.slice(5)); }
        };
        const pool = () => {
            const v = $(`#${prefix}-src`).value;
            if (v === 'builtin') { return builtin.words(); }
            if (v.startsWith('list:')) { const l = core.lists().find((x) => x.id === v.slice(5)); return l ? l.alumnos : []; }
            if (v.startsWith('glos:')) { return glossaryOf(v.slice(5)).map((x) => x.w); }
            return [];
        };
        let lastClue = '';   // the clue of a glossary word
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
            lastClue = v.startsWith('glos:') ? (glossaryOf(v.slice(5)).find((x) => x.w === w) || {}).c || '' : '';
            return w;
        };
        return {
            html, fill, next,
            wire: () => {
                $(`#${prefix}-src`).addEventListener('change', () => {
                    const v = $(`#${prefix}-src`).value;
                    save(prefix + '-fuente', v); $(`#${prefix}-type-box`).hidden = v !== 'type';
                    if (v.startsWith('glos:')) { loadGlossary(v.slice(5)); }
                });
                document.addEventListener('classtools:glossaries', fill);
                askGlossaries();
                $(`#${prefix}-lang`).value = wordPack.lang;
                $(`#${prefix}-lang`).addEventListener('change', () => { save(WORDS_KEY, $(`#${prefix}-lang`).value); useWordLang($(`#${prefix}-lang`).value); });
                document.addEventListener('classtools:wordlang', () => { $(`#${prefix}-lang`).value = wordPack.lang; fill(); });
                document.addEventListener('classtools:lists', fill);
                document.addEventListener('classtools:mode', fill);
                fill();
            },
            clue: () => $(`#${prefix}-clue`).value.trim() || lastClue,
            clearTyped: () => { $(`#${prefix}-word`).value = ''; },
        };
    };

    window.ClasstoolsGames = {
        // words: the same helpers for the language of the words (Hangman, Word); «classtools:wordlang» when it changes.
        // glossaries: the glossaries of the course (list(), ask(), load(id) → promise, words(id) once loaded).
        util: { norm, isLetter, keyboard, keys, wordSource, listOf, mode, words,
            glossaries: { list: () => glossaries || [], ask: askGlossaries, load: loadGlossary, words: glossaryOf } },
        add(game) {
            // Only the games the site wants (the administrator chooses them; none chosen: all).
            const site = window.CLASSTOOLS_SITE && Array.isArray(window.CLASSTOOLS_SITE.games) && window.CLASSTOOLS_SITE.games.length ? window.CLASSTOOLS_SITE.games : null;
            if (site && !site.includes(game.id)) { return; }
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
        show, playing,
    };
    core.register('juegos', {
        entra: () => { visible = true; show(current); paintTurn(); },
        sale: () => { visible = false; const g = games.find((x) => x.id === current); if (g && g.leave) { g.leave(); } },
        espacio: () => { const g = games.find((x) => x.id === current); if (g && g.space) { g.space(); } },
    });
})();
