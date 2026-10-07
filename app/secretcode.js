// Secret code (an escape-room lock on the board): the teacher prepares a code and clues that are revealed one by
// one; the class proposes codes and, when they get it right, the lock opens (with a final message if there is
// one). Optional countdown. Teachers' locks are kept in the browser and, inside Moodle, for the teacher in the course.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games || !games.util) { return; }
    const { $, $$, escape, play, setIcon, announce, save, load } = core;
    const { norm, isLetter, keyboard } = games.util;

    const STR = {
        name: 'Código secreto', lock: 'Candado', newLock: 'Nuevo candado', edit: 'Editar', time: 'Tiempo', noTime: 'Sin tiempo',
        minutes: (m) => `${m} min`, start: 'Empezar', clues: 'Pistas', nextClue: 'Ver la siguiente pista', noMoreClues: 'No hay más pistas',
        erase: 'Borrar', again: 'Otra vez', tries: (n) => `${n} ${n === 1 ? 'intento' : 'intentos'}`, wrong: '¡No es ese código!',
        opened: '¡Abierto!', timeUp: '¡Se acabó el tiempo!', pressStart: 'Elige el candado y pulsa «Empezar»',
        editorNew: 'Nuevo candado', editorEdit: 'Editar el candado', editorCopy: 'Copia del candado de ejemplo', lockName: 'Nombre del candado',
        code: 'Código (de 2 a 8 números o letras)', cluesLabel: 'Pistas, una por línea (se enseñan en este orden)',
        finalMsg: 'Mensaje al abrirlo (si quieres)', save: 'Guardar', cancel: 'Cancelar', remove: 'Borrar el candado',
        removeSure: '¿Seguro? Pulsa otra vez', badCode: 'El código tiene que tener de 2 a 8 números o letras.', copyOf: (n) => `${n} (copia)`,
        example: 'Candado de ejemplo',
    };
    const EXAMPLE = {
        id: 'ejemplo', name: STR.example, code: '4127', final: '¡Bien hecho! Han abierto el candado entre todos.',
        clues: ['El primer número son las patas que tiene un gato.', 'El segundo, los dedos de una mano menos cuatro.',
            'El tercero, los ojos que tiene una persona.', 'El cuarto, los días que tiene una semana.'],
    };
    // Per course, like Moodle keeps them (the old global key only seeds a course that has nothing yet).
    const storeKey = 'candados' + (core.moodle ? ':' + core.moodle.courseid : '');
    let store = load(storeKey, null) || (core.moodle && !core.kept('candados') ? load('candados', null) : null);
    const kept = core.kept('candados');
    if (kept && Array.isArray(kept.locks) && (!store || (kept.updated || 0) > (store.updated || 0))) { store = kept; }
    if (!store || !Array.isArray(store.locks)) { store = { locks: [] }; }
    const persist = () => { store.updated = Date.now(); save(storeKey, store); core.keep('candados', store); };
    const locks = () => [EXAMPLE].concat(store.locks);
    const lockById = (id) => locks().find((l) => l.id === id) || EXAMPLE;
    const cleanCode = (c) => norm(c).replace(/[^0-9A-ZÑ]/g, '');

    const s = { lock: null, code: '', typed: '', shown: 0, tries: 0, time: 0, over: true, timer: 0, last: 0 };
    let visible = false, kb = null, editing = null, removeTimer = 0;

    const mount = (panel) => {
        panel.innerHTML = `
            <div class="ct-secret">
                <aside class="tarjeta ct-side">
                    <div class="ct-setup ct-setup-group">
                    <label class="campo apilado"><span>${STR.lock}</span><select id="sc2-lock"></select></label>
                    <div class="ct-row">
                        <button type="button" class="boton suave" id="sc2-new"><span data-icono="nueva"></span>${STR.newLock}</button>
                        <button type="button" class="boton suave" id="sc2-edit"><span data-icono="editar"></span>${STR.edit}</button>
                    </div>
                    <label class="campo apilado"><span>${STR.time}</span><select id="sc2-time">${[0, 5, 10, 15, 20, 30].map((m) => `<option value="${m}">${m ? STR.minutes(m) : STR.noTime}</option>`).join('')}</select></label>
                    <button type="button" class="boton grande" id="sc2-start"><span data-icono="seguir"></span>${STR.start}</button>
                    </div>
                    <div class="ct-clues" id="sc2-clues-box" hidden>
                        <p class="ante">${STR.clues}</p>
                        <ol class="ct-clue-list" id="sc2-clues"></ol>
                        <button type="button" class="boton suave ancho" id="sc2-next"><span data-icono="info"></span><span>${STR.nextClue}</span></button>
                    </div>
                </aside>
                <div class="tarjeta ct-stage">
                    <div class="ct-secret-top"><span class="ct-secret-time" id="sc2-clock"></span><span class="nota" id="sc2-tries"></span></div>
                    <div class="ct-lock" id="sc2-lockart" aria-hidden="true"><span class="ct-shackle"></span><span class="ct-lockbody"><span class="ct-keyhole"></span></span></div>
                    <div class="ct-code" id="sc2-code" aria-live="polite"></div>
                    <p class="total espera" id="sc2-msg" aria-live="polite">${STR.pressStart}</p>
                    <div class="ct-pad-wrap" id="sc2-pad"></div>
                </div>
            </div>`;
        const dialog = document.createElement('dialog');
        dialog.className = 'editor'; dialog.id = 'sc2-editor'; dialog.setAttribute('aria-labelledby', 'sc2-ed-title');
        dialog.innerHTML = `
            <form method="dialog" id="sc2-ed-form">
                <h2 id="sc2-ed-title"></h2>
                <label class="campo apilado"><span>${STR.lockName}</span><input type="text" id="sc2-ed-name" maxlength="50" autocomplete="off"></label>
                <label class="campo apilado"><span>${STR.code}</span><input type="password" id="sc2-ed-code" maxlength="8" autocomplete="off" spellcheck="false"></label>
                <label class="campo apilado"><span>${STR.cluesLabel}</span><textarea id="sc2-ed-clues" rows="6"></textarea></label>
                <label class="campo apilado"><span>${STR.finalMsg}</span><input type="text" id="sc2-ed-final" maxlength="140" autocomplete="off"></label>
                <p class="nota" id="sc2-ed-note"></p>
                <div class="botonera">
                    <button type="submit" class="boton" value="save"><span data-icono="guardar"></span>${STR.save}</button>
                    <button type="button" class="boton suave" id="sc2-ed-cancel">${STR.cancel}</button>
                    <button type="button" class="boton rojo-suave" id="sc2-ed-remove"><span data-icono="borrar"></span><span>${STR.remove}</span></button>
                </div>
            </form>`;
        document.body.append(dialog);
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        $$('[data-icono]', dialog).forEach((el) => setIcon(el, el.dataset.icono));
        wire();
        fillLocks();
    };
    const fillLocks = () => {
        const sel = $('#sc2-lock'), before = sel.value || load('candado', 'ejemplo');
        sel.innerHTML = locks().map((l) => `<option value="${escape(l.id)}">${escape(l.name)}</option>`).join('');
        sel.value = locks().some((l) => l.id === before) ? before : 'ejemplo';
    };
    const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    const paintPad = () => {
        const letters = s.code.split('').some((c) => isLetter(c));
        const pad = $('#sc2-pad');
        pad.innerHTML = letters ? '<div id="sc2-kb"></div>'
            : `<div class="ct-numpad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'BACK', '0'].map((k) => `<button type="button" class="ct-key${k.length > 1 ? ' ct-wide' : ''}" data-k="${k}">${k === 'BACK' ? STR.erase : k}</button>`).join('')}</div>`;
        if (letters) {
            kb = keyboard($('#sc2-kb'), press);   // the lock opens by itself when the code is complete
            $('#sc2-kb').insertAdjacentHTML('beforeend', `<div class="ct-krow">${'1234567890'.split('').map((d) => `<button type="button" class="ct-key" data-k="${d}">${d}</button>`).join('')}`
                + `<button type="button" class="ct-key ct-wide" data-k="BACK">${STR.erase}</button></div>`);
        }
    };
    // When the round is over (opened or out of time) the pad goes quiet and «Borrar» becomes «Otra vez».
    const paintOver = () => {
        $('#sc2-pad').classList.toggle('ct-done', s.over);
        $$('#sc2-pad [data-k="BACK"]').forEach((b) => { b.textContent = s.over ? STR.again : STR.erase; b.classList.toggle('ct-again', s.over); });
    };
    const paintCode = () => {
        $('#sc2-code').innerHTML = s.code.split('').map((_, i) => `<span class="ct-code-slot${s.typed[i] ? ' ct-typed' : ''}">${escape(s.typed[i] || '')}</span>`).join('');
    };
    const paintClues = () => {
        const clues = s.lock ? s.lock.clues : [];
        $('#sc2-clues-box').hidden = !clues.length || s.over && !s.code;
        $('#sc2-clues').innerHTML = clues.slice(0, s.shown).map((c) => `<li>${escape(c)}</li>`).join('');
        $('#sc2-next').disabled = s.shown >= clues.length || s.over;
        core.relabel($('#sc2-next'), s.shown >= clues.length ? STR.noMoreClues : STR.nextClue);
    };
    const tick = () => {
        const now = performance.now(), dt = (now - s.last) / 1000; s.last = now;
        if (s.over || !visible) { return; }
        s.time = Math.max(0, s.time - dt);
        $('#sc2-clock').textContent = fmt(s.time);
        $('#sc2-clock').classList.toggle('ct-low', s.time <= 30);
        if (s.time <= 0) { s.over = true; clearInterval(s.timer); paintOver(); games.playing('codigo', false); play('wrong'); const m = $('#sc2-msg'); m.className = 'total ct-lose'; m.textContent = STR.timeUp; announce(STR.timeUp); }
    };
    const start = () => {
        s.lock = lockById($('#sc2-lock').value); save('candado', s.lock.id);
        s.code = cleanCode(s.lock.code); s.typed = ''; s.shown = 0; s.tries = 0; s.over = false;
        const minutes = Number($('#sc2-time').value); save('candado-tiempo', minutes);
        clearInterval(s.timer);
        s.time = minutes * 60;
        $('#sc2-clock').textContent = minutes ? fmt(s.time) : '';
        if (minutes) { s.last = performance.now(); s.timer = setInterval(tick, 250); }
        $('#sc2-lockart').classList.remove('ct-open', 'ct-shake');
        $('#sc2-tries').textContent = '';
        paintPad(); paintCode(); paintClues(); paintOver();
        games.playing('codigo', true);
        const m = $('#sc2-msg'); m.className = 'total'; m.textContent = '';
    };
    function press(k) {
        if (!s.code) { return; }
        if (s.over) { if (k === 'BACK') { start(); } return; }
        if (k === 'BACK') { s.typed = s.typed.slice(0, -1); paintCode(); return; }
        if (k === 'ENTER') { tryOpen(); return; }
        if (s.typed.length < s.code.length && /^[0-9A-ZÑ]$/.test(k)) {
            s.typed += k; paintCode(); play('tic');
            if (s.typed.length === s.code.length) { setTimeout(tryOpen, 250); }
        }
    }
    const tryOpen = () => {
        if (s.over || s.typed.length < s.code.length) { return; }
        s.tries++;
        $('#sc2-tries').textContent = STR.tries(s.tries);
        const art = $('#sc2-lockart');
        if (s.typed === s.code) {
            s.over = true; clearInterval(s.timer); games.playing('codigo', false);
            art.classList.add('ct-open');
            const m = $('#sc2-msg'); m.className = 'total ct-win'; m.textContent = s.lock.final || STR.opened;
            paintClues(); paintOver(); play('fin'); announce(STR.opened + ' ' + (s.lock.final || ''));
            return;
        }
        art.classList.remove('ct-shake'); void art.offsetWidth; art.classList.add('ct-shake');
        play('wrong');
        const m = $('#sc2-msg'); m.className = 'total ct-lose'; m.textContent = STR.wrong; announce(STR.wrong);
        setTimeout(() => { s.typed = ''; paintCode(); if (!s.over) { m.className = 'total'; m.textContent = ''; } }, 900);
    };
    const openEditor = (lock) => {
        const d = $('#sc2-editor'), isExample = lock && lock.id === 'ejemplo';
        editing = lock && !isExample ? lock.id : null;
        $('#sc2-ed-title').textContent = !lock ? STR.editorNew : (isExample ? STR.editorCopy : STR.editorEdit);
        $('#sc2-ed-name').value = !lock ? '' : (isExample ? STR.copyOf(lock.name) : lock.name);
        $('#sc2-ed-code').value = lock ? lock.code : '';
        $('#sc2-ed-clues').value = lock ? lock.clues.join('\n') : '';
        $('#sc2-ed-final').value = lock ? (lock.final || '') : '';
        $('#sc2-ed-remove').hidden = !editing;
        $('#sc2-ed-remove').classList.remove('confirma'); core.relabel($('#sc2-ed-remove'), STR.remove);
        $('#sc2-ed-note').textContent = ''; $('#sc2-ed-note').classList.remove('error');
        if (d.showModal) { d.showModal(); } else { d.setAttribute('open', ''); }
        $('#sc2-ed-name').focus();
    };
    const closeEditor = () => { const d = $('#sc2-editor'); if (d.close) { d.close(); } else { d.removeAttribute('open'); } };
    const wire = () => {
        $('#sc2-new').addEventListener('click', () => openEditor(null));
        $('#sc2-edit').addEventListener('click', () => openEditor(lockById($('#sc2-lock').value)));
        $('#sc2-start').addEventListener('click', start);
        $('#sc2-next').addEventListener('click', () => { if (s.lock && s.shown < s.lock.clues.length) { s.shown++; paintClues(); play('card'); announce(s.lock.clues[s.shown - 1]); } });
        // The number pad (the letter keyboard has its own listener).
        $('#sc2-pad').addEventListener('click', (e) => { const b = e.target.closest('.ct-numpad .ct-key'); if (b) { press(b.dataset.k); } });
        $('#sc2-ed-cancel').addEventListener('click', closeEditor);
        $('#sc2-ed-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const code = cleanCode($('#sc2-ed-code').value);
            if (code.length < 2 || code.length > 8) { const n = $('#sc2-ed-note'); n.textContent = STR.badCode; n.classList.add('error'); return; }
            const lock = { name: $('#sc2-ed-name').value.trim() || STR.newLock, code,
                clues: $('#sc2-ed-clues').value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean), final: $('#sc2-ed-final').value.trim() };
            let existing = store.locks.find((l) => l.id === editing);
            if (existing) { Object.assign(existing, lock); } else { existing = { id: 'k' + Date.now().toString(36) + core.random(1000), ...lock }; store.locks.push(existing); }
            persist(); fillLocks(); $('#sc2-lock').value = existing.id; save('candado', existing.id); closeEditor();
        });
        $('#sc2-ed-remove').addEventListener('click', () => {
            const b = $('#sc2-ed-remove');
            if (!b.classList.contains('confirma')) {
                b.classList.add('confirma'); core.relabel(b, STR.removeSure);
                clearTimeout(removeTimer); removeTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.remove); }, 4000);
                return;
            }
            store.locks = store.locks.filter((l) => l.id !== editing); persist(); fillLocks(); closeEditor();
        });
        document.addEventListener('keydown', (e) => {
            if (!visible || s.over || e.repeat || e.ctrlKey || e.altKey || e.metaKey || document.querySelector('dialog[open]')) { return; }
            if (e.target.closest && e.target.closest('input, textarea, select')) { return; }
            if (e.key === 'Enter') { e.preventDefault(); press('ENTER'); return; }
            if (e.key === 'Backspace') { e.preventDefault(); press('BACK'); return; }
            const k = norm(e.key);
            if (k.length === 1 && /^[0-9A-ZÑ]$/.test(k)) { e.preventDefault(); press(k); }
        });
        const t = Number(load('candado-tiempo', 0));
        $('#sc2-time').value = String([0, 5, 10, 15, 20, 30].includes(t) ? t : 0);
    };

    games.add({
        id: 'codigo', name: STR.name, mount,
        enter: () => { visible = true; fillLocks(); s.last = performance.now(); },
        leave: () => { visible = false; },
        space: () => { if (s.over) { start(); } },
    });
    window.ClasstoolsSecret = { start, press, state: () => s };   // for automated tests
})();
