// The class goal, in the Scoreboard tab: a jar that fills with a marble for each point the whole class earns, up to
// the goal the teacher sets and its prize («an afternoon of games»). Kept for each course in the browser and, inside
// Moodle, for the teacher in the course, like the scoreboard.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-marcador');
    const bar = root && root.querySelector('.barra-herr');
    if (!core || !root || !bar) { return; }
    const { t, escape, save, load, play, announce, setIcon, reducedMotion } = core;
    const $ = (s) => root.querySelector(s);
    const COLOURS = ['#ce1423', '#164281', '#067e36', '#fbbe17', '#5b2fb8', '#0e7c86', '#ea7317', '#d6336c'];

    const key = 'meta' + (core.moodle ? ':' + core.moodle.courseid : '');
    const fresh = () => ({ points: 0, target: 30, prize: '', on: false });
    let st = Object.assign(fresh(), load(key, {}));
    const kept = core.kept('goal');   // what Moodle has: wins if it is newer (saved from another computer)
    if (kept && typeof kept === 'object' && (kept.updated || 0) > (st.updated || 0)) { st = Object.assign(fresh(), kept); }
    st.target = Math.max(5, Math.min(500, Math.round(Number(st.target) || 30)));
    st.points = Math.max(0, Math.min(st.target, Math.round(Number(st.points) || 0)));
    st.prize = String(st.prize || '').slice(0, 80);
    const keep = () => { st.updated = Date.now(); save(key, st); core.keep('goal', st); };

    // Two things in the tab: the teams, or the goal of the whole class.
    const seg = document.createElement('div');
    seg.className = 'segmentos ct-goal-mode'; seg.setAttribute('role', 'radiogroup'); seg.setAttribute('aria-label', t('gl_what'));
    seg.innerHTML = ['teams', 'goal'].map((k) => `<button type="button" role="radio" aria-checked="false" data-v="${k}">${escape(t('gl_' + k))}</button>`).join('');
    bar.prepend(seg);
    const panel = document.createElement('div');
    panel.className = 'ct-goal';
    panel.innerHTML = `
        <aside class="tarjeta ct-side ct-goal-side">
            <label class="campo apilado"><span>${escape(t('gl_target'))}</span>
                <span class="giro grande-giro"><button type="button" class="redondo suave" id="gl-less" aria-label="${escape(t('g_less'))}"><span data-icono="menos"></span></button>
                <output id="gl-target"></output>
                <button type="button" class="redondo suave" id="gl-more" aria-label="${escape(t('g_more'))}"><span data-icono="mas"></span></button></span></label>
            <label class="campo apilado"><span>${escape(t('gl_prize'))}</span><input type="text" id="gl-prize" maxlength="80" placeholder="${escape(t('gl_prize_ph'))}"></label>
            <button type="button" class="boton rojo-suave" id="gl-reset"><span data-icono="reiniciar"></span><span>${escape(t('gl_reset'))}</span></button>
            <p class="nota">${escape(t('gl_help'))}</p>
        </aside>
        <div class="tarjeta ct-stage ct-goal-stage">
            <p class="ct-goal-prize" id="gl-prize-big"></p>
            <svg class="ct-goal-jar" id="gl-jar" viewBox="0 0 200 240" role="img"></svg>
            <p class="total" id="gl-count" aria-live="polite"></p>
            <div class="botonera centro" id="gl-steps"></div>
        </div>`;
    root.append(panel);
    panel.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));

    // The jar: its outline, and the marbles packed from the bottom up (as many as fit; with a big goal each marble is
    // worth more than one point).
    const JAR = 'M62 34 H138 V52 Q138 60 146 64 Q176 80 176 122 V196 Q176 226 146 226 H54 Q24 226 24 196 V122 Q24 80 54 64 Q62 60 62 52 Z';
    const inside = (x, y, r) => {
        if (y + r > 222 || y - r < 66) { return false; }
        const half = y > 120 ? 148 : 148 - ((120 - y) / 54) * 40;   // narrower towards the neck
        return x - r > 100 - half / 1.0 + 28 && x + r < 100 + half / 1.0 - 28;
    };
    const slots = (n) => {
        for (let r = 13; r >= 3; r -= 0.5) {
            const out = [];
            for (let row = 0, y = 222 - r; y - r >= 66; row++, y -= r * 1.75) {
                const off = row % 2 ? r : 0;
                const xs = [];
                for (let x = 28 + r + off; x + r <= 172; x += r * 2.02) { if (inside(x, y, r)) { xs.push(x); } }
                // From the middle outwards, so a row fills like marbles settling.
                xs.sort((a, b) => Math.abs(a - 100) - Math.abs(b - 100)).forEach((x) => out.push([x, y]));
            }
            if (out.length >= n) { return { r, at: out.slice(0, n) }; }
        }
        return { r: 3, at: [] };
    };
    let lastShown = -1;
    const paint = () => {
        const per = Math.max(1, Math.ceil(st.target / 120)), cap = Math.ceil(st.target / per), shown = Math.min(cap, Math.ceil(st.points / per));
        const { r, at } = slots(cap);
        const done = st.points >= st.target;
        $('#gl-jar').innerHTML = `<path class="ct-goal-glass" d="${JAR}"/>`
            + at.slice(0, shown).map(([x, y], i) => `<circle class="ct-goal-marble${i >= lastShown && lastShown >= 0 && !reducedMotion() ? ' nueva' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.92).toFixed(1)}" fill="${COLOURS[i % COLOURS.length]}"/>`).join('')
            + `<path class="ct-goal-shine" d="M44 120 Q44 92 60 80"/><rect class="ct-goal-lid" x="56" y="22" width="88" height="16" rx="6"/>`;
        $('#gl-jar').setAttribute('aria-label', t('gl_count', { n: st.points, of: st.target }));
        $('#gl-jar').classList.toggle('llena', done);
        lastShown = shown;
        $('#gl-count').textContent = done ? t('gl_done') : t('gl_count', { n: st.points, of: st.target });
        $('#gl-count').classList.toggle('ct-win', done);
        $('#gl-prize-big').textContent = st.prize ? t('gl_for', st.prize) : '';
        $('#gl-target').textContent = st.target;
        if (document.activeElement !== $('#gl-prize')) { $('#gl-prize').value = st.prize; }
        const steps = (core.mode ? core.mode() : 'primary') === 'early' ? [-1, 1] : [-1, 1, 5];
        const html = steps.map((s) => `<button type="button" class="boton ${s < 0 ? 'suave' : 'grande verde'}" data-s="${s}" aria-label="${escape(t(s < 0 ? 'gl_take' : 'gl_add', Math.abs(s)))}">${s < 0 ? '−' : '+'}${Math.abs(s)}</button>`).join('');
        if ($('#gl-steps').dataset.html !== html) { $('#gl-steps').innerHTML = html; $('#gl-steps').dataset.html = html; }
        $$('#gl-steps [data-s]').forEach((b) => { b.disabled = Number(b.dataset.s) < 0 ? st.points <= 0 : done; });
    };
    const $$ = (s) => root.querySelectorAll(s);
    $('#gl-steps').addEventListener('click', (e) => {
        const b = e.target.closest('[data-s]'); if (!b) { return; }
        const before = st.points;
        st.points = Math.max(0, Math.min(st.target, st.points + Number(b.dataset.s)));
        if (st.points === before) { return; }
        keep(); paint();
        if (st.points >= st.target && before < st.target) {
            play('lead');
            if (core.celebrate) { core.celebrate($('.ct-goal-stage'), { title: t('gl_done'), text: st.prize, glow: [$('#gl-jar')] }); }
            announce(t('gl_done'));
        } else { play(st.points > before ? 'point' : 'minus'); announce(t('gl_count', { n: st.points, of: st.target })); }
    });
    const setTarget = (d) => {
        const steps = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200, 300, 500];
        const i = steps.findIndex((x) => x >= st.target);
        st.target = steps[Math.max(0, Math.min(steps.length - 1, (i < 0 ? steps.length - 1 : i) + d))];
        st.points = Math.min(st.points, st.target);
        lastShown = -1; keep(); paint();
    };
    $('#gl-less').addEventListener('click', () => setTarget(-1));
    $('#gl-more').addEventListener('click', () => setTarget(1));
    $('#gl-prize').addEventListener('input', () => { st.prize = $('#gl-prize').value.slice(0, 80); keep(); paint(); });
    let resetTimer = 0;
    $('#gl-reset').addEventListener('click', () => {
        const b = $('#gl-reset');
        if (!b.classList.contains('confirma') && st.points) {
            b.classList.add('confirma'); core.relabel(b, t('gl_reset_sure'));
            clearTimeout(resetTimer); resetTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, t('gl_reset')); }, 4000);
            return;
        }
        clearTimeout(resetTimer); b.classList.remove('confirma'); core.relabel(b, t('gl_reset'));
        st.points = 0; lastShown = -1; keep(); paint();
    });
    const show = (on) => {
        st.on = on; save(key, st);
        root.classList.toggle('ct-goal-on', on);
        seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.v === 'goal') === on)));
        if (on) { lastShown = -1; paint(); }
    };
    seg.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { show(b.dataset.v === 'goal'); } });
    document.addEventListener('classtools:mode', () => { if (st.on) { paint(); } });
    show(!!st.on);

    window.ClasstoolsGoal = { state: () => st, paint, show };   // for automated tests
})();
