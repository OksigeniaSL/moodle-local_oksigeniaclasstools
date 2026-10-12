// The class goal, in the Scoreboard tab: a jar that fills with a marble for each point the whole class earns, up to
// the goal the teacher sets and its prize («an afternoon of games»); or, in other looks that teach something on the
// way (goallooks.js), the critter's path, a plant that grows, a rocket through the solar system, a song note by note or
// a mosaic that uncovers a picture. The count says it as each level learns it: «12 of 30», what is left, or the
// fraction and the percentage. Kept for each course in the browser and, inside Moodle, for the teacher in the course,
// like the scoreboard.
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
    const LOOKS = ['bote', 'camino', 'planta', 'cohete', 'cancion', 'mosaico'];
    // The look each level starts with (the teacher's choice is kept with the goal).
    const LOOK_OF = { early: 'camino', primary: 'cohete', secondary: 'mosaico', advanced: 'mosaico' };
    const mode = () => (core.mode ? core.mode() : 'primary');
    const look = () => (LOOKS.includes(st.look) ? st.look : LOOK_OF[mode()] || 'bote');
    const lang = document.documentElement.lang || 'en';

    const key = 'meta' + (core.moodle ? ':' + core.moodle.courseid : '');
    const fresh = () => ({ points: 0, target: 30, prize: '', on: false, look: '', song: '', pic: 'paisaje' });
    let st = Object.assign(fresh(), load(key, {}));
    // A goal begun before there were looks stays a jar.
    if (!st.look && st.points) { st.look = 'bote'; }
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
            <label class="campo apilado"><span>${escape(t('gl_look'))}</span><select id="gl-look">${LOOKS.map((k) => `<option value="${k}">${escape(t('gl_look_' + k))}</option>`).join('')}</select></label>
            <label class="campo apilado" id="gl-song-box" hidden><span>${escape(t('gl_song'))}</span><select id="gl-song"></select></label>
            <div id="gl-pic-box" hidden>
                <label class="campo apilado"><span>${escape(t('gl_picture'))}</span><select id="gl-pic">${['paisaje', 'mar', 'mia'].map((k) => `<option value="${k}">${escape(t('gl_pic_' + k))}</option>`).join('')}</select></label>
                <label class="boton suave" id="gl-file-box" hidden><span data-icono="imagen"></span><span>${escape(t('gl_pic_choose'))}</span><input type="file" id="gl-file" accept="image/*" hidden></label>
                <p class="nota" id="gl-file-note" hidden>${escape(t('gl_pic_note'))}</p>
            </div>
            <button type="button" class="boton rojo-suave" id="gl-reset"><span data-icono="reiniciar"></span><span>${escape(t('gl_reset'))}</span></button>
            <p class="nota">${escape(t('gl_help'))}</p>
        </aside>
        <div class="tarjeta ct-stage ct-goal-stage">
            <p class="ct-goal-prize" id="gl-prize-big"></p>
            <svg class="ct-goal-jar" id="gl-jar" viewBox="0 0 200 240" role="img"></svg>
            <p class="nota ct-goal-caption" id="gl-caption" aria-live="polite"></p>
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
    // The songs of the score that can be a goal (with a title and some notes), and the one chosen.
    const songs = () => (window.ClasstoolsScore ? window.ClasstoolsScore.songs() : []).filter((s) => s.title && s.notes && s.notes.filter((n) => !n.r).length >= 8);
    const song = () => { const all = songs(); return all.find((s) => s.title === st.song) || all[0] || null; };
    const imageKey = 'meta-imagen' + (core.moodle ? ':' + core.moodle.courseid : '');
    // The count as each level learns it: «12 of 30»; what is left; the fraction (simplified) and the percentage.
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const countText = () => {
        const n = st.points, of = st.target, m = mode();
        if (m === 'early') { return t('gl_count', { n, of }); }
        if (m === 'primary') { return t('gl_count_left', { n, of, left: of - n }); }
        const g = gcd(n, of) || 1;
        const frac = n && g > 1 ? `${n}/${of} = ${n / g}/${of / g}` : `${n}/${of}`;
        return t('gl_count_frac', { frac, pct: new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format((100 * n) / of) });
    };
    const paintOptions = () => {
        const l = look();
        $('#gl-look').value = l;
        $('#gl-song-box').hidden = l !== 'cancion';
        $('#gl-pic-box').hidden = l !== 'mosaico';
        if (l === 'cancion') {
            const all = songs(), s = song();
            $('#gl-song').innerHTML = all.map((x) => `<option>${escape(x.title)}</option>`).join('');
            if (s) { $('#gl-song').value = s.title; }
        }
        if (l === 'mosaico') {
            $('#gl-pic').value = ['paisaje', 'mar', 'mia'].includes(st.pic) ? st.pic : 'paisaje';
            $('#gl-file-box').hidden = $('#gl-file-note').hidden = st.pic !== 'mia';
        }
    };
    const paint = () => {
        const per = Math.max(1, Math.ceil(st.target / 120)), cap = Math.ceil(st.target / per), shown = Math.min(cap, Math.ceil(st.points / per));
        const done = st.points >= st.target, l = look(), L = window.ClasstoolsGoalLooks;
        paintOptions();
        $('#gl-jar').setAttribute('class', `ct-goal-jar ct-goal-${l}`);
        if (l !== 'bote' && L && L[l]) {
            const seed = core.moodle ? core.moodle.courseid : 0;
            const v = L[l]({ points: st.points, target: st.target, seed, song: song(), picture: st.pic, image: load(imageKey, ''), level: mode(), t });
            $('#gl-jar').setAttribute('viewBox', v.viewBox);
            $('#gl-jar').innerHTML = v.html;
            $('#gl-caption').textContent = v.caption || '';
        } else {
            const { r, at } = slots(cap);
            $('#gl-jar').setAttribute('viewBox', '0 0 200 240');
            $('#gl-caption').textContent = '';
            $('#gl-jar').innerHTML = `<path class="ct-goal-glass" d="${JAR}"/>`
                + at.slice(0, shown).map(([x, y], i) => `<circle class="ct-goal-marble${i >= lastShown && lastShown >= 0 && !reducedMotion() ? ' nueva' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.92).toFixed(1)}" fill="${COLOURS[i % COLOURS.length]}"/>`).join('')
                + `<path class="ct-goal-shine" d="M44 120 Q44 92 60 80"/><rect class="ct-goal-lid" x="56" y="22" width="88" height="16" rx="6"/>`;
        }
        $('#gl-jar').setAttribute('aria-label', `${t('gl_look_' + l)}: ${countText()}`);
        $('#gl-jar').classList.toggle('llena', done);
        lastShown = shown;
        $('#gl-count').textContent = done ? t('gl_done') : countText();
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
            // The goal of the class reached, for the teacher's sticker.
            if (core.logro) { core.logro('cumplemetas'); }
            play('lead');
            if (core.celebrate) { core.celebrate($('.ct-goal-stage'), { title: t('gl_done'), text: st.prize, glow: [$('#gl-jar')] }); }
            announce(t('gl_done'));
            // The song of the goal, whole, when it is the look.
            const s = look() === 'cancion' ? song() : null;
            if (s && window.ClasstoolsScore) { setTimeout(() => window.ClasstoolsScore.playNotes(s.notes, s.tempo || 100), 900); }
        } else { play(st.points > before ? 'point' : 'minus'); announce(countText()); }
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
    $('#gl-look').addEventListener('change', () => { st.look = $('#gl-look').value; lastShown = -1; keep(); paint(); play('card'); });
    $('#gl-song').addEventListener('change', () => { st.song = $('#gl-song').value; keep(); paint(); });
    $('#gl-pic').addEventListener('change', () => { st.pic = $('#gl-pic').value; keep(); paint(); if (st.pic === 'mia' && !load(imageKey, '')) { $('#gl-file').click(); } });
    // The teacher's picture: made smaller and kept only in this browser (it does not go to Moodle).
    $('#gl-file').addEventListener('change', () => {
        const file = $('#gl-file').files[0];
        if (!file) { return; }
        const img = new Image(), url = URL.createObjectURL(file);
        img.onload = () => {
            const k = Math.min(1, 640 / Math.max(img.width, img.height)), c = document.createElement('canvas');
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            save(imageKey, c.toDataURL('image/jpeg', 0.82));
            paint();
        };
        img.src = url;
    });
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
