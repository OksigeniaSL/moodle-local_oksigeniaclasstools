// Scoreboard for the classroom board: 2 to 8 teams with big buttons, the leader crowned, and the teams made in
// «Hacer grupos» (with their faces) in one tap. It is kept in the browser for each course, so the contest can
// go on another day. UI strings live in STR (Spanish for now; i18n later).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-marcador');
    if (!core || !root) { return; }
    const { $, $$, escape, reducedMotion, save, load, play, setIcon, announce, icon } = core;

    const STR = {
        addTeam: 'Añadir equipo', fromGroups: 'Usar los grupos de «Hacer grupos»', reset: 'Poner a cero',
        resetSure: '¿Seguro? Pulsa otra vez', team: (n) => `Equipo ${n}`, group: (n) => `Grupo ${n}`,
        remove: 'Quitar este equipo', name: 'Nombre del equipo', color: 'Cambiar el color',
        points: (n) => `${n} ${n === 1 ? 'punto' : 'puntos'}`, leads: (t) => `Va primero: ${t}`, tie: 'Empate',
        noGroups: 'Haz antes los grupos en «Hacer grupos».',
    };
    const COLORS = ['#164281', '#ce1423', '#067e36', '#fbbe17', '#5b2fb8', '#0e7c86', '#c2410c', '#0f2f5e'];
    const STEPS = [-1, 1, 5, 10];
    const key = 'marcador' + (core.moodle ? ':' + core.moodle.courseid : '');
    const fresh = () => ({ teams: [0, 1].map((i) => ({ name: STR.team(i + 1), color: COLORS[i], score: 0, members: [] })) });
    let state = load(key, null);
    if (!state || !Array.isArray(state.teams) || state.teams.length < 1) { state = fresh(); }
    let leader = null, resetTimer = 0;

    core.sounds.point = (a) => core.bell(a, 1046.5, 0, 0.22, 0.6);
    core.sounds.minus = (a) => core.click(a, 300, 0, 0.12);
    core.sounds.lead = (a) => { core.bell(a, 783.99, 0, 0.3, 1); core.bell(a, 1174.66, 0.12, 0.3, 1.3); };

    root.innerHTML = `
        <div class="barra-herr ct-top">
            <button type="button" class="boton suave" id="sc-add"><span data-icono="mas"></span>${STR.addTeam}</button>
            <button type="button" class="boton suave" id="sc-groups"><span data-icono="grupos"></span>${STR.fromGroups}</button>
            <p class="nota" id="sc-note" aria-live="polite"></p>
            <button type="button" class="boton rojo-suave ct-push" id="sc-reset"><span data-icono="reiniciar"></span><span>${STR.reset}</span></button>
        </div>
        <div class="ct-teams" id="sc-teams"></div>`;
    $$('[data-icono]', root).forEach((el) => setIcon(el, el.dataset.icono));

    const persist = () => save(key, state);
    const best = () => {
        const max = Math.max(...state.teams.map((t) => t.score));
        const top = state.teams.map((t, i) => (t.score === max ? i : -1)).filter((i) => i >= 0);
        return max > 0 && top.length === 1 ? top[0] : null;
    };
    const membersHTML = (t) => {
        if (!t.members || !t.members.length) { return ''; }
        const list = core.lists().find((l) => l.id === t.listId) || null;
        return `<ul class="ct-members">${t.members.map((n) => `<li title="${escape(n)}">${list ? core.face(list, n, 'cara-mini') : ''}<span>${escape(n)}</span></li>`).join('')}</ul>`;
    };
    const paint = () => {
        const lead = best();
        const box = $('#sc-teams');
        box.dataset.n = state.teams.length;
        box.innerHTML = state.teams.map((t, i) => {
            const light = t.color === '#fbbe17';
            return `<article class="ct-team${light ? ' claro' : ''}${i === lead ? ' ct-lead' : ''}" style="--c:${t.color}" data-i="${i}">
                <header>
                    <button type="button" class="ct-color" title="${STR.color}" aria-label="${STR.color}"></button>
                    <input class="ct-team-name" value="${escape(t.name)}" maxlength="24" aria-label="${STR.name}">
                    ${i === lead ? `<span class="ct-crown" aria-hidden="true">${icon('corona')}</span>` : ''}
                    <button type="button" class="ct-x" title="${STR.remove}" aria-label="${STR.remove}"${state.teams.length < 3 ? ' hidden' : ''}>${icon('cerrar')}</button>
                </header>
                <output class="ct-score" aria-live="polite" aria-label="${escape(t.name)}: ${STR.points(t.score)}">${t.score}</output>
                ${membersHTML(t)}
                <div class="ct-steps">${STEPS.map((s) => `<button type="button" class="ct-step${s < 0 ? ' ct-minus' : ''}" data-step="${s}">${s > 0 ? '+' + s : '−' + Math.abs(s)}</button>`).join('')}</div>
            </article>`;
        }).join('');
        $('#sc-add').disabled = state.teams.length >= 8;
    };
    const bump = (i, step) => {
        const t = state.teams[i];
        t.score = Math.max(0, t.score + step);
        persist();
        const before = leader;
        leader = best();
        paint();
        const card = $(`#sc-teams .ct-team[data-i="${i}"]`);
        if (card && !reducedMotion()) { card.classList.remove('ct-bump'); void card.offsetWidth; card.classList.add(step > 0 ? 'ct-bump' : 'ct-drop'); }
        if (leader !== null && leader !== before) { play('lead'); announce(STR.leads(state.teams[leader].name)); }
        else { play(step > 0 ? 'point' : 'minus'); announce(`${t.name}: ${STR.points(t.score)}`); }
    };

    $('#sc-teams').addEventListener('click', (e) => {
        const card = e.target.closest('.ct-team');
        if (!card) { return; }
        const i = Number(card.dataset.i);
        const step = e.target.closest('.ct-step');
        if (step) { bump(i, Number(step.dataset.step)); return; }
        if (e.target.closest('.ct-color')) {
            const t = state.teams[i];
            t.color = COLORS[(COLORS.indexOf(t.color) + 1) % COLORS.length];
            persist(); paint(); return;
        }
        if (e.target.closest('.ct-x')) {
            state.teams.splice(i, 1); persist(); leader = best(); paint();
        }
    });
    $('#sc-teams').addEventListener('change', (e) => {
        const input = e.target.closest('.ct-team-name');
        if (!input) { return; }
        const i = Number(input.closest('.ct-team').dataset.i);
        state.teams[i].name = input.value.trim() || STR.team(i + 1);
        persist(); paint();
    });
    $('#sc-add').addEventListener('click', () => {
        if (state.teams.length >= 8) { return; }
        const used = state.teams.map((t) => t.color);
        state.teams.push({ name: STR.team(state.teams.length + 1), color: COLORS.find((c) => !used.includes(c)) || COLORS[0], score: 0, members: [] });
        persist(); paint();
    });
    $('#sc-groups').addEventListener('click', () => {
        const g = core.lastGroups();
        if (!g || !g.grupos || !g.grupos.length) { $('#sc-note').textContent = STR.noGroups; return; }
        $('#sc-note').textContent = '';
        state.teams = g.grupos.slice(0, 8).map((members, i) => ({
            name: STR.group(i + 1), color: COLORS[i % COLORS.length], score: 0, members: members.slice(), listId: g.lista ? g.lista.id : null,
        }));
        persist(); leader = null; paint();
        announce(`${state.teams.length} equipos`);
    });
    $('#sc-reset').addEventListener('click', () => {
        const b = $('#sc-reset');
        if (!b.classList.contains('confirma')) {
            b.classList.add('confirma'); core.relabel(b, STR.resetSure);
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.reset); }, 4000);
            return;
        }
        clearTimeout(resetTimer); b.classList.remove('confirma'); core.relabel(b, STR.reset);
        state.teams.forEach((t) => { t.score = 0; });
        persist(); leader = null; paint();
    });

    core.register('marcador', {
        entra: () => {
            $('#sc-groups').disabled = !core.lastGroups();
            $('#sc-note').textContent = '';
            paint();
        },
    });
    leader = best();
    paint();

    window.ClasstoolsScoreboard = { bump, state: () => state };   // for automated tests
})();
