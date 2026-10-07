// Rosco (like the TV word game): a letter ring with a clue for each letter. The whole class plays one rosco, or
// two teams take turns, each with its own rosco and clock. The teacher marks right, wrong or «pasapalabra».
// Teachers write their own roscos; they are kept in the browser and, inside Moodle, for the teacher in the course.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore, games = window.ClasstoolsGames;
    if (!core || !games) { return; }
    const { $, $$, escape, save, load, play, icon, setIcon, announce } = core;

    const STR = {
        name: 'Rosco', rosco: 'Rosco', newRosco: 'Nuevo rosco', edit: 'Editar', who: '¿Quién juega?',
        wholeClass: 'Toda la clase', twoTeams: 'Dos equipos', secondRosco: 'Rosco del equipo 2', time: 'Tiempo de cada uno',
        noTime: 'Sin tiempo', minutes: (s) => (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`),
        start: 'Empezar', right: 'Acierto', wrong: 'Fallo', pass: 'Pasapalabra', pause: 'Pausa', resume: 'Seguir',
        finish: 'Terminar', keys: 'Teclas: Intro, acierto · Retroceso, fallo · Espacio, pasapalabra',
        starts: (l) => `Empieza por la ${l}`, contains: (l) => `Contiene la ${l}`, team: (n) => `Equipo ${n}`, class: 'La clase',
        timeUp: '¡Se acabó el tiempo!', finished: '¡Rosco terminado!', again: 'Volver a jugar', change: 'Cambiar de rosco',
        winner: (t) => `¡Gana ${t}!`, tie: '¡Empate!', okCount: (n) => `${n} ${n === 1 ? 'acierto' : 'aciertos'}`,
        badCount: (n) => `${n} ${n === 1 ? 'fallo' : 'fallos'}`, left: (n) => `${n} sin contestar`,
        editorNew: 'Nuevo rosco', editorEdit: 'Editar el rosco', editorCopy: 'Copia del rosco de ejemplo', roscoName: 'Nombre del rosco',
        letter: 'Letra', kind: 'Tipo', clue: 'Pista', answer: 'Respuesta', kindStarts: 'Empieza', kindContains: 'Contiene',
        editorNote: 'Deja vacías las letras que no quieras: el rosco se hace con las que tengan pista y respuesta.',
        save: 'Guardar', cancel: 'Cancelar', remove: 'Borrar el rosco', removeSure: '¿Seguro? Pulsa otra vez',
        needOne: 'Escribe al menos una letra con su pista y su respuesta.', copyOf: (n) => `${n} (copia)`,
        example: 'Rosco de ejemplo', answerIs: (a) => `Era «${a}»`,
    };
    const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    const EXAMPLE = {
        id: 'ejemplo', name: STR.example, items: [
            ['A', 's', 'Insecto que fabrica miel', 'Abeja'], ['B', 's', 'Vehículo de dos ruedas que se mueve con pedales', 'Bicicleta'],
            ['C', 's', 'Animal que lleva su casa a cuestas y deja un rastro brillante', 'Caracol'],
            ['D', 's', 'Reptil enorme que vivió hace millones de años', 'Dinosaurio'],
            ['E', 's', 'Animal con trompa que vive en África y en Asia', 'Elefante'],
            ['F', 's', 'Fruta roja y pequeña con las semillas por fuera', 'Fresa'], ['G', 's', 'Animal que maúlla', 'Gato'],
            ['H', 's', 'Agua congelada', 'Hielo'], ['I', 's', 'Porción de tierra rodeada de agua por todas partes', 'Isla'],
            ['J', 's', 'Animal con el cuello muy largo', 'Jirafa'], ['K', 's', 'Fruta de piel marrón y peluda, verde por dentro', 'Kiwi'],
            ['L', 's', 'Satélite natural de la Tierra', 'Luna'], ['M', 's', 'Gran masa de agua salada que rodea las islas', 'Mar'],
            ['N', 's', 'Agua helada que cae del cielo en copos blancos', 'Nieve'],
            ['Ñ', 'c', 'Animal pequeño de ocho patas que teje telas para cazar insectos', 'Araña'],
            ['O', 's', 'Estación del año en la que caen las hojas de los árboles', 'Otoño'],
            ['P', 's', 'Ave blanca y negra que vive en el Polo Sur y no vuela', 'Pingüino'],
            ['Q', 's', 'Alimento que se elabora con leche cuajada', 'Queso'], ['R', 's', 'Lo usamos para saber la hora', 'Reloj'],
            ['S', 's', 'Estrella que nos da luz y calor', 'Sol'], ['T', 's', 'El volcán más alto de España, en Tenerife', 'Teide'],
            ['U', 's', 'Fruta pequeña que crece en racimos', 'Uva'], ['V', 's', 'Montaña que puede expulsar lava', 'Volcán'],
            ['W', 's', 'Conexión a internet sin cables', 'Wifi'],
            ['X', 'c', 'Coche con conductor que nos lleva a donde le pidamos, pagando', 'Taxi'],
            ['Y', 's', 'Alimento hecho con leche que se toma con cuchara', 'Yogur'], ['Z', 's', 'Calzado que nos ponemos en los pies', 'Zapato'],
        ].map(([l, k, c, a]) => ({ l, k, c, a })),
    };
    const TIMES = [0, 120, 150, 180, 240, 300];

    // Own roscos: in the browser and, inside Moodle, for the teacher in the course (the newest one wins).
    let store = load('roscos', null);
    const kept = core.kept('roscos');
    if (kept && Array.isArray(kept.sets) && (!store || (kept.updated || 0) > (store.updated || 0))) { store = kept; }
    if (!store || !Array.isArray(store.sets)) { store = { sets: [] }; }
    const persist = () => { store.updated = Date.now(); save('roscos', store); core.keep('roscos', store); };
    const sets = () => [EXAMPLE].concat(store.sets);
    const setById = (id) => sets().find((s) => s.id === id) || EXAMPLE;
    const playable = (set) => set.items.filter((it) => it.c && it.a && LETTERS.includes(it.l)).sort((a, b) => LETTERS.indexOf(a.l) - LETTERS.indexOf(b.l));

    core.sounds.wrong = (a) => {
        const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.45);
        g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(g); g.connect(core.output()); o.start(t); o.stop(t + 0.55);
    };
    core.sounds.pass = (a) => { core.click(a, 900, 0, 0.1); core.click(a, 1200, 0.08, 0.1); };

    let panel = null, visible = false;
    const g = { teams: [], turn: 0, running: false, paused: false, revealing: false, timer: 0, last: 0 };

    const mount = (p) => {
        panel = p;
        panel.innerHTML = `
            <div class="ct-rosco">
                <div class="tarjeta ct-rosco-setup" id="ro-setup">
                    <label class="campo apilado"><span>${STR.rosco}</span><select id="ro-set"></select></label>
                    <div class="ct-row">
                        <button type="button" class="boton suave" id="ro-new"><span data-icono="nueva"></span>${STR.newRosco}</button>
                        <button type="button" class="boton suave" id="ro-edit"><span data-icono="editar"></span>${STR.edit}</button>
                    </div>
                    <p class="ante">${STR.who}</p>
                    <div class="segmentos" role="radiogroup" aria-label="${STR.who}" id="ro-who">
                        <button type="button" role="radio" aria-checked="true" data-who="class">${STR.wholeClass}</button>
                        <button type="button" role="radio" aria-checked="false" data-who="teams">${STR.twoTeams}</button>
                    </div>
                    <label class="campo apilado" id="ro-set2-box" hidden><span>${STR.secondRosco}</span><select id="ro-set2"></select></label>
                    <label class="campo apilado"><span>${STR.time}</span><select id="ro-time">${TIMES.map((t) => `<option value="${t}">${t ? STR.minutes(t) : STR.noTime}</option>`).join('')}</select></label>
                    <button type="button" class="boton grande" id="ro-start"><span data-icono="seguir"></span>${STR.start}</button>
                </div>
                <div class="ct-rosco-game" id="ro-game" hidden>
                    <div class="ct-rosco-ring-box"><div class="ct-rosco-ring" id="ro-ring">
                        <div class="ct-rosco-center">
                            <p class="ct-rosco-letter" id="ro-letter"></p>
                            <p class="ct-rosco-kind" id="ro-kind"></p>
                            <p class="ct-rosco-clue" id="ro-clue" aria-live="polite"></p>
                            <p class="ct-rosco-answer" id="ro-answer" aria-live="polite"></p>
                        </div>
                    </div></div>
                    <aside class="tarjeta ct-rosco-side">
                        <div class="ct-rosco-teams" id="ro-teams"></div>
                        <button type="button" class="boton grande verde ancho" id="ro-ok"><span data-icono="acierto"></span>${STR.right}</button>
                        <button type="button" class="boton grande ancho ct-red" id="ro-bad"><span data-icono="fallo"></span>${STR.wrong}</button>
                        <button type="button" class="boton grande amarillo ancho" id="ro-pass"><span data-icono="pasar"></span>${STR.pass}</button>
                        <div class="ct-row">
                            <button type="button" class="boton suave" id="ro-pause"><span data-icono="pausar"></span><span>${STR.pause}</span></button>
                            <button type="button" class="boton suave" id="ro-end"><span data-icono="cerrar"></span>${STR.finish}</button>
                        </div>
                        <p class="nota">${STR.keys}</p>
                    </aside>
                </div>
                <div class="tarjeta ct-rosco-result" id="ro-result" hidden></div>
            </div>`;
        const dialog = document.createElement('dialog');
        dialog.className = 'editor ct-rosco-editor'; dialog.id = 'ro-editor'; dialog.setAttribute('aria-labelledby', 'ro-ed-title');
        dialog.innerHTML = `
            <form method="dialog" id="ro-ed-form">
                <h2 id="ro-ed-title"></h2>
                <label class="campo apilado"><span>${STR.roscoName}</span><input type="text" id="ro-ed-name" maxlength="50" autocomplete="off"></label>
                <p class="nota">${STR.editorNote}</p>
                <div class="ct-rosco-table" role="table">
                    <div class="ct-rosco-row ct-head" role="row"><span role="columnheader">${STR.letter}</span><span role="columnheader">${STR.kind}</span><span role="columnheader">${STR.clue}</span><span role="columnheader">${STR.answer}</span></div>
                    ${LETTERS.map((l) => `<div class="ct-rosco-row" role="row" data-l="${l}"><strong role="cell">${l}</strong>
                        <select role="cell" aria-label="${STR.kind} ${l}"><option value="s">${STR.kindStarts}</option><option value="c">${STR.kindContains}</option></select>
                        <input role="cell" type="text" class="ct-clue" maxlength="160" aria-label="${STR.clue} ${l}">
                        <input role="cell" type="text" class="ct-answer" maxlength="40" aria-label="${STR.answer} ${l}"></div>`).join('')}
                </div>
                <p class="nota" id="ro-ed-note"></p>
                <div class="botonera">
                    <button type="submit" class="boton" value="save"><span data-icono="guardar"></span>${STR.save}</button>
                    <button type="button" class="boton suave" id="ro-ed-cancel">${STR.cancel}</button>
                    <button type="button" class="boton rojo-suave" id="ro-ed-remove"><span data-icono="borrar"></span><span>${STR.remove}</span></button>
                </div>
            </form>`;
        document.body.append(dialog);
        $$('[data-icono]', panel).forEach((el) => setIcon(el, el.dataset.icono));
        $$('[data-icono]', dialog).forEach((el) => setIcon(el, el.dataset.icono));
        wire();
        fillSets();
    };

    // --- Setup -----------------------------------------------------------------------------------------
    const who = () => ($('#ro-who [aria-checked="true"]') || {}).dataset?.who || 'class';
    const fillSets = () => {
        const opts = sets().map((s) => `<option value="${escape(s.id)}">${escape(s.name)} (${playable(s).length})</option>`).join('');
        ['#ro-set', '#ro-set2'].forEach((sel, i) => {
            const el = $(sel), before = el.value || load(i ? 'rosco-2' : 'rosco-1', 'ejemplo');
            el.innerHTML = opts;
            el.value = sets().some((s) => s.id === before) ? before : 'ejemplo';
        });
    };
    const showSetup = () => {
        stopClock(); g.running = false;
        $('#ro-setup').hidden = false; $('#ro-game').hidden = true; $('#ro-result').hidden = true;
    };

    // --- Editor ----------------------------------------------------------------------------------------
    let editing = null, removeTimer = 0;
    const openEditor = (set) => {
        const d = $('#ro-editor');
        const isExample = set && set.id === 'ejemplo';
        editing = set && !isExample ? set.id : null;
        $('#ro-ed-title').textContent = !set ? STR.editorNew : (isExample ? STR.editorCopy : STR.editorEdit);
        $('#ro-ed-name').value = !set ? '' : (isExample ? STR.copyOf(set.name) : set.name);
        $$('.ct-rosco-row[data-l]', d).forEach((row) => {
            const it = set ? set.items.find((x) => x.l === row.dataset.l) : null;
            row.querySelector('select').value = it ? it.k : 's';
            row.querySelector('.ct-clue').value = it ? it.c : '';
            row.querySelector('.ct-answer').value = it ? it.a : '';
        });
        $('#ro-ed-remove').hidden = !editing;
        $('#ro-ed-remove').classList.remove('confirma'); core.relabel($('#ro-ed-remove'), STR.remove);
        $('#ro-ed-note').textContent = ''; $('#ro-ed-note').classList.remove('error');
        if (d.showModal) { d.showModal(); } else { d.setAttribute('open', ''); }
        $('#ro-ed-name').focus();
    };
    const closeEditor = () => { const d = $('#ro-editor'); if (d.close) { d.close(); } else { d.removeAttribute('open'); } };

    // --- Game ------------------------------------------------------------------------------------------
    const newTeam = (name, set, seconds) => {
        const items = playable(set);
        return { name, set, items, status: Object.fromEntries(items.map((it) => [it.l, 'pending'])), pos: 0, time: seconds, ok: 0, bad: 0, done: false };
    };
    const team = () => g.teams[g.turn];
    const pending = (t) => t.items.filter((it) => t.status[it.l] === 'pending');
    const nextPending = (t, fromNext) => {
        const n = t.items.length;
        for (let k = fromNext ? 1 : 0; k <= n; k++) {
            const i = (t.pos + k) % n;
            if (t.status[t.items[i].l] === 'pending') { t.pos = i; return true; }
        }
        return false;
    };
    const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const timed = () => Number($('#ro-time').value) > 0;

    const paintRing = () => {
        const t = team(), ring = $('#ro-ring'), n = t.items.length;
        $$('.ct-rosco-dot', ring).forEach((d) => d.remove());
        t.items.forEach((it, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            const dot = document.createElement('span');
            dot.className = `ct-rosco-dot ct-${t.status[it.l]}${i === t.pos && g.running && !t.done ? ' ct-current' : ''}`;
            dot.style.left = `${50 + 44 * Math.cos(a)}%`; dot.style.top = `${50 + 44 * Math.sin(a)}%`;
            dot.textContent = it.l;
            ring.append(dot);
        });
        const it = t.items[t.pos];
        $('#ro-letter').textContent = it ? it.l : '';
        $('#ro-kind').textContent = it ? (it.k === 'c' ? STR.contains(it.l) : STR.starts(it.l)) : '';
        $('#ro-clue').textContent = it ? it.c : '';
        $('#ro-clue').classList.toggle('ct-long', !!it && it.c.length > 70);
    };
    const paintTeams = () => {
        $('#ro-teams').innerHTML = g.teams.map((t, i) => `<div class="ct-rosco-team${i === g.turn ? ' ct-active' : ''}${t.done ? ' ct-done' : ''}">
            <strong>${escape(t.name)}</strong>
            ${timed() ? `<span class="ct-rosco-time${t.time <= 10 ? ' ct-low' : ''}">${fmtTime(t.time)}</span>` : ''}
            <span class="ct-rosco-ok">${icon('acierto')} ${t.ok}</span><span class="ct-rosco-bad">${icon('fallo')} ${t.bad}</span></div>`).join('');
        const busy = g.revealing || !g.running || team().done;
        ['#ro-ok', '#ro-bad', '#ro-pass'].forEach((s) => { $(s).disabled = busy || g.paused; });
        core.relabel($('#ro-pause'), g.paused ? STR.resume : STR.pause, g.paused ? 'seguir' : 'pausar');
        $('#ro-pause').hidden = !timed();
    };
    const paint = () => { paintRing(); paintTeams(); };

    const stopClock = () => { clearInterval(g.timer); g.timer = 0; };
    const startClock = () => {
        stopClock();
        if (!timed()) { return; }
        g.last = performance.now();
        g.timer = setInterval(() => {
            const now = performance.now(), dt = (now - g.last) / 1000; g.last = now;
            if (!g.running || g.paused || g.revealing || !visible) { return; }
            const t = team();
            if (t.done) { return; }
            const before = Math.ceil(t.time);
            t.time = Math.max(0, t.time - dt);
            if (Math.ceil(t.time) !== before) { paintTeams(); if (t.time > 0 && t.time <= 5) { play('tic'); } }
            if (t.time <= 0) { t.done = true; play('fin'); announce(STR.timeUp); afterTurn(true); }
        }, 200);
    };
    const start = () => {
        const seconds = Number($('#ro-time').value);
        save('rosco-1', $('#ro-set').value); save('rosco-2', $('#ro-set2').value); save('rosco-tiempo', seconds); save('rosco-quien', who());
        const s1 = setById($('#ro-set').value);
        g.teams = who() === 'teams'
            ? [newTeam(STR.team(1), s1, seconds), newTeam(STR.team(2), setById($('#ro-set2').value), seconds)]
            : [newTeam(STR.class, s1, seconds)];
        if (!g.teams.every((t) => t.items.length)) { return; }
        g.turn = 0; g.running = true; g.paused = false; g.revealing = false;
        $('#ro-setup').hidden = true; $('#ro-result').hidden = true; $('#ro-game').hidden = false;
        $('#ro-answer').textContent = '';
        paint(); startClock();
        announce(`${team().name}. ${$('#ro-kind').textContent}. ${$('#ro-clue').textContent}`);
    };
    // After a wrong answer or «pasapalabra» (or when a team ends), the other team plays if it can.
    const afterTurn = (switchTeam) => {
        const t = team();
        if (!pending(t).length) { t.done = true; }
        if (switchTeam && g.teams.length > 1) {
            const other = g.teams[1 - g.turn];
            if (!other.done) { g.turn = 1 - g.turn; nextPending(team(), false); }
        }
        if (g.teams.every((x) => x.done)) { return finish(); }
        if (team().done) { g.turn = 1 - g.turn; nextPending(team(), false); }
        $('#ro-answer').textContent = '';
        paint();
        if (g.teams.length > 1 && switchTeam) { announce(`${team().name}. ${$('#ro-kind').textContent}. ${$('#ro-clue').textContent}`); }
    };
    const right = () => {
        if (!g.running || g.revealing || g.paused) { return; }
        const t = team(), it = t.items[t.pos];
        t.status[it.l] = 'ok'; t.ok++;
        play('elegido');
        $('#ro-answer').textContent = it.a; $('#ro-answer').className = 'ct-rosco-answer ct-ok';
        g.revealing = true; paint();
        setTimeout(() => { g.revealing = false; if (nextPending(t, true)) { afterTurn(false); } else { t.done = true; afterTurn(true); } }, 1100);
    };
    const wrong = () => {
        if (!g.running || g.revealing || g.paused) { return; }
        const t = team(), it = t.items[t.pos];
        t.status[it.l] = 'bad'; t.bad++;
        play('wrong');
        $('#ro-answer').textContent = STR.answerIs(it.a); $('#ro-answer').className = 'ct-rosco-answer ct-bad';
        announce(STR.answerIs(it.a));
        g.revealing = true; paint();
        setTimeout(() => { g.revealing = false; if (!nextPending(t, true)) { t.done = true; } afterTurn(true); }, 2200);
    };
    const pass = () => {
        if (!g.running || g.revealing || g.paused) { return; }
        const t = team();
        play('pass');
        nextPending(t, true);
        afterTurn(true);
    };
    const finish = () => {
        g.running = false; stopClock();
        const res = $('#ro-result');
        let headline = STR.finished;
        if (g.teams.length > 1) {
            const [a, b] = g.teams;
            headline = a.ok === b.ok && a.bad === b.bad ? STR.tie
                : STR.winner((a.ok > b.ok || (a.ok === b.ok && a.bad < b.bad)) ? a.name : b.name);
        }
        res.innerHTML = `<h2>${escape(headline)}</h2><div class="ct-rosco-final">${g.teams.map((t) => `<div class="ct-rosco-final-team">
            <strong>${escape(t.name)}</strong><span class="ct-big-ok">${STR.okCount(t.ok)}</span><span>${STR.badCount(t.bad)}</span><span>${STR.left(pending(t).length)}</span></div>`).join('')}</div>
            <div class="ct-row"><button type="button" class="boton grande" id="ro-again"><span data-icono="otra"></span>${STR.again}</button>
            <button type="button" class="boton suave" id="ro-change"><span data-icono="editar"></span>${STR.change}</button></div>`;
        $$('[data-icono]', res).forEach((el) => setIcon(el, el.dataset.icono));
        $('#ro-game').hidden = true; res.hidden = false;
        $('#ro-again').addEventListener('click', start);
        $('#ro-change').addEventListener('click', showSetup);
        play('fin'); announce(headline);
    };

    const wire = () => {
        $('#ro-who').addEventListener('click', (e) => {
            const b = e.target.closest('button[data-who]'); if (!b) { return; }
            $$('#ro-who button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
            $('#ro-set2-box').hidden = b.dataset.who !== 'teams';
        });
        $('#ro-new').addEventListener('click', () => openEditor(null));
        $('#ro-edit').addEventListener('click', () => openEditor(setById($('#ro-set').value)));
        $('#ro-start').addEventListener('click', start);
        $('#ro-ok').addEventListener('click', right);
        $('#ro-bad').addEventListener('click', wrong);
        $('#ro-pass').addEventListener('click', pass);
        $('#ro-pause').addEventListener('click', () => { g.paused = !g.paused; g.last = performance.now(); paintTeams(); });
        $('#ro-end').addEventListener('click', finish);
        $('#ro-ed-cancel').addEventListener('click', closeEditor);
        $('#ro-ed-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const items = $$('#ro-editor .ct-rosco-row[data-l]').map((row) => ({
                l: row.dataset.l, k: row.querySelector('select').value,
                c: row.querySelector('.ct-clue').value.trim(), a: row.querySelector('.ct-answer').value.trim(),
            })).filter((it) => it.c && it.a);
            if (!items.length) { const n = $('#ro-ed-note'); n.textContent = STR.needOne; n.classList.add('error'); return; }
            const name = $('#ro-ed-name').value.trim() || STR.newRosco;
            let set = store.sets.find((s) => s.id === editing);
            if (set) { Object.assign(set, { name, items }); } else {
                set = { id: 'r' + Date.now().toString(36) + core.random(1000), name, items };
                store.sets.push(set);
            }
            persist(); fillSets(); $('#ro-set').value = set.id; save('rosco-1', set.id);
            closeEditor(); announce(`${name}: ${items.length}`);
        });
        $('#ro-ed-remove').addEventListener('click', () => {
            const b = $('#ro-ed-remove');
            if (!b.classList.contains('confirma')) {
                b.classList.add('confirma'); core.relabel(b, STR.removeSure);
                clearTimeout(removeTimer); removeTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.remove); }, 4000);
                return;
            }
            store.sets = store.sets.filter((s) => s.id !== editing);
            persist(); fillSets(); closeEditor();
        });
        // Enter: right; Backspace: wrong (the space bar, «pasapalabra», comes from the board).
        document.addEventListener('keydown', (e) => {
            if (!visible || !g.running || e.repeat || e.ctrlKey || e.altKey || e.metaKey) { return; }
            if (document.querySelector('dialog[open]') || (e.target.closest && e.target.closest('input, textarea, select'))) { return; }
            if (e.key === 'Enter' && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); right(); }
            if (e.key === 'Backspace') { e.preventDefault(); wrong(); }
        });
        const w = load('rosco-quien', 'class');
        $$('#ro-who button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.who === w)));
        $('#ro-set2-box').hidden = w !== 'teams';
        $('#ro-time').value = String(TIMES.includes(Number(load('rosco-tiempo', 150))) ? load('rosco-tiempo', 150) : 150);
    };

    games.add({
        id: 'rosco', name: STR.name, mount,
        enter: () => { visible = true; fillSets(); },
        leave: () => { visible = false; },
        space: pass,
    });
    window.ClasstoolsRosco = { start, right, wrong, pass, finish, state: () => g };   // for automated tests
})();
