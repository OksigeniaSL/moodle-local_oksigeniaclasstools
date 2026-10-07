// Learning to tell the time, in the Clock tab: a big clock whose hands are dragged with a finger (the minute hand
// takes the hour hand along), the time in digits and in words (each can be hidden), 12 or 24 hours, and two games
// for the whole class: «What time is it?» (a time appears on the clock) and «Set the time» (the class moves the hands
// and the board checks). Levels: o'clock, half past, quarters, five minutes, any minute.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-reloj');
    if (!core || !root) { return; }
    const { $, $$, t, escape, save, load, play, setIcon, announce, random } = core;

    const STR = {
        modes: { now: t('cl_now'), learn: t('cl_learn') }, mode: t('cl_mode'),
        level: t('cl_level'), levels: { h: t('cl_level_h'), half: t('cl_level_half'), quarter: t('cl_level_quarter'), five: t('cl_level_five'), minute: t('cl_level_minute') },
        digital: t('cl_digital'), words: t('cl_words'), h24: t('cl_h24'), minutes: t('cl_minutes'),
        ask: t('cl_ask'), set: t('cl_set'), check: t('cl_check'), reveal: t('cl_reveal'),
        setThis: (x) => t('cl_set_this', x), right: t('cl_right'), wrong: t('cl_wrong'), dragHint: t('cl_drag_hint'),
        clock: t('cl_clock'),
    };
    const STEP = { h: 60, half: 30, quarter: 15, five: 5, minute: 1 };
    const pad = (n) => String(n).padStart(2, '0');
    // The time in words comes with the content of the user's language («Las tres y cuarto», «Quarter past three»).
    // On a 12-hour clock the twelve is read as noon: in languages that say it («Midi», «Meio-dia», «Mezzogiorno»),
    // «Midnight and a quarter» would not match the 12:15 on the screen.
    const inWords = (t) => {
        if (opt.h24) { return window.CLASSTOOLS_CONTENT.clock(t); }
        const d = t % 720;
        return window.CLASSTOOLS_CONTENT.clock(d < 60 ? d + 720 : d);
    };

    const MODE_LEVEL = { early: 'h', primary: 'quarter', secondary: 'five', advanced: 'minute' };
    const opt = Object.assign({ mode: 'now', level: MODE_LEVEL[(core.mode ? core.mode() : 'primary')] || 'quarter', digital: true, words: true, h24: false, minutes: true }, load('reloj-aprender', {}));
    if (!STR.levels[opt.level]) { opt.level = 'quarter'; }
    const st = { t: 3 * 60 + 15, hidden: false, target: null, drag: null };

    // The bar on top and the learning panel; the clock of now stays as it was.
    const bar = document.createElement('div');
    bar.className = 'barra-herr ct-top ct-cl-bar';
    bar.innerHTML = `<div class="segmentos" role="radiogroup" aria-label="${escape(STR.mode)}" id="cl-mode">
        ${Object.entries(STR.modes).map(([k, v]) => `<button type="button" role="radio" aria-checked="false" data-v="${k}">${v}</button>`).join('')}</div>`;
    const panel = document.createElement('div');
    panel.className = 'ct-cl-learn';
    panel.hidden = true;
    let face = '';
    for (let i = 0; i < 60; i++) {
        const big = i % 5 === 0, a = (i * 6 * Math.PI) / 180, r1 = big ? 80 : 85;
        face += `<line class="${big ? 'cl-mk-h' : 'cl-mk-m'}" x1="${(100 + r1 * Math.sin(a)).toFixed(2)}" y1="${(100 - r1 * Math.cos(a)).toFixed(2)}" x2="${(100 + 89 * Math.sin(a)).toFixed(2)}" y2="${(100 - 89 * Math.cos(a)).toFixed(2)}"/>`;
    }
    for (let h = 1; h <= 12; h++) {
        const a = (h * 30 * Math.PI) / 180;
        face += `<text class="cl-num" x="${(100 + 66 * Math.sin(a)).toFixed(2)}" y="${(100 - 66 * Math.cos(a)).toFixed(2)}">${h}</text>`;
        face += `<text class="cl-min" x="${(100 + 99 * Math.sin(a)).toFixed(2)}" y="${(100 - 99 * Math.cos(a)).toFixed(2)}">${pad((h * 5) % 60)}</text>`;
    }
    panel.innerHTML = `
        <div class="ct-cl-face">
            <svg viewBox="-12 -12 224 224" id="cl-svg" role="img" aria-label="${escape(STR.clock)}">
                <circle class="cl-bg" cx="100" cy="100" r="94"/>
                <g id="cl-face">${face}</g>
                <g class="cl-hand cl-hand-h" id="cl-h"><line x1="100" y1="112" x2="100" y2="54"/><line class="cl-hit" x1="100" y1="100" x2="100" y2="50"/><circle class="cl-tip" cx="100" cy="54" r="7"/></g>
                <g class="cl-hand cl-hand-m" id="cl-m"><line x1="100" y1="116" x2="100" y2="24"/><line class="cl-hit" x1="100" y1="100" x2="100" y2="20"/><circle class="cl-tip" cx="100" cy="24" r="7"/></g>
                <circle class="cl-axis" cx="100" cy="100" r="6"/>
            </svg>
        </div>
        <div class="tarjeta ct-cl-side">
            <p class="ct-cl-digital" id="cl-digital" aria-live="polite"></p>
            <p class="ct-cl-words" id="cl-words"></p>
            <p class="ct-cl-msg" id="cl-msg" aria-live="polite"></p>
            <div class="ct-row">
                <button type="button" class="boton grande" id="cl-ask"><span data-icono="reloj-pregunta"></span>${STR.ask}</button>
                <button type="button" class="boton grande suave" id="cl-set"><span data-icono="aprender"></span>${STR.set}</button>
            </div>
            <div class="ct-row">
                <button type="button" class="boton" id="cl-reveal" hidden><span data-icono="ocultar"></span>${STR.reveal}</button>
                <button type="button" class="boton verde" id="cl-check" hidden><span data-icono="comprobar"></span>${STR.check}</button>
            </div>
            <label class="campo apilado"><span>${STR.level}</span><select id="cl-level">${Object.entries(STR.levels).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
            <label class="interruptor"><input type="checkbox" id="cl-o-digital"><span>${STR.digital}</span></label>
            <label class="interruptor"><input type="checkbox" id="cl-o-words"><span>${STR.words}</span></label>
            <label class="interruptor"><input type="checkbox" id="cl-o-minutes"><span>${STR.minutes}</span></label>
            <label class="interruptor"><input type="checkbox" id="cl-o-h24"><span>${STR.h24}</span></label>
            <p class="nota">${STR.dragHint}</p>
        </div>`;
    root.prepend(bar);
    root.append(panel);
    $$('[data-icono]', panel).forEach((e) => setIcon(e, e.dataset.icono));

    // --- Painting ---------------------------------------------------------------------------------------------
    const digital = (t) => {
        const h = Math.floor(t / 60) % 24, m = t % 60;
        return opt.h24 ? `${h}:${pad(m)}` : `${((h + 11) % 12) + 1}:${pad(m)}`;
    };
    const paint = () => {
        const t = st.t;
        $('#cl-h').setAttribute('transform', `rotate(${((t / 60) % 12) * 30} 100 100)`);
        $('#cl-m').setAttribute('transform', `rotate(${(t % 60) * 6} 100 100)`);
        $('#cl-svg').classList.toggle('cl-sin-minutos', !opt.minutes);
        const hide = st.hidden;
        $('#cl-digital').textContent = opt.digital ? (hide ? '?' : digital(t)) : '';
        $('#cl-digital').hidden = !opt.digital;
        $('#cl-words').textContent = opt.words && !hide ? inWords(t) : '';
        $('#cl-words').hidden = !opt.words;
        $('#cl-reveal').hidden = !hide;
        $('#cl-check').hidden = st.target === null;
    };
    const paintControls = () => {
        $$('#cl-mode button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.mode)));
        root.classList.toggle('ct-cl-learning', opt.mode === 'learn');
        panel.hidden = opt.mode !== 'learn';
        $('#cl-level').value = opt.level;
        $('#cl-o-digital').checked = opt.digital; $('#cl-o-words').checked = opt.words;
        $('#cl-o-minutes').checked = opt.minutes; $('#cl-o-h24').checked = opt.h24;
    };
    const persist = () => save('reloj-aprender', opt);
    const msg = (text, kind) => { const m = $('#cl-msg'); m.className = 'ct-cl-msg' + (kind ? ' ' + kind : ''); m.textContent = text; };

    // --- Games ------------------------------------------------------------------------------------------------
    const randomTime = () => {
        const step = STEP[opt.level], h = opt.h24 ? random(24) : 1 + random(12);
        return (h * 60 + random(60 / step) * step) % 1440;
    };
    $('#cl-ask').addEventListener('click', () => {
        st.target = null; st.t = randomTime(); st.hidden = true;
        msg(STR.ask); paint(); play('card'); announce(STR.ask);
    });
    $('#cl-reveal').addEventListener('click', () => { st.hidden = false; msg(''); paint(); play('elegido'); announce(inWords(st.t)); });
    $('#cl-set').addEventListener('click', () => {
        do { st.target = randomTime(); } while (st.target % 720 === st.t % 720);
        st.hidden = true;
        const said = opt.words ? inWords(st.target) : digital(st.target);
        msg(STR.setThis(opt.words && opt.digital ? `${inWords(st.target)} (${digital(st.target)})` : said));
        paint(); play('card'); announce(STR.setThis(said));
    });
    $('#cl-check').addEventListener('click', () => {
        if (st.target === null) { return; }
        // The hands cannot tell morning from afternoon: any of the two is right.
        if (st.t % 720 === st.target % 720) {
            st.t = st.target; st.target = null; st.hidden = false;
            msg(STR.right, 'ct-win'); paint(); play('fin'); announce(STR.right);
        } else {
            msg(STR.wrong, 'ct-lose'); play('wrong'); announce(STR.wrong);
        }
    });

    // --- Dragging the hands: the nearest hand to the finger moves; the minute hand takes the hour hand along. ---
    const angleOf = (e) => {
        const svg = $('#cl-svg'), p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
        const q = p.matrixTransform(svg.getScreenCTM().inverse());
        return (Math.atan2(q.x - 100, 100 - q.y) * 180 / Math.PI + 360) % 360;
    };
    const diff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
    $('#cl-svg').addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const a = angleOf(e), hourA = ((st.t / 60) % 12) * 30, minA = (st.t % 60) * 6;
        const which = e.target.closest('#cl-h') ? 'h' : e.target.closest('#cl-m') ? 'm' : (diff(a, hourA) < diff(a, minA) ? 'h' : 'm');
        st.drag = which;
        $('#cl-svg').setPointerCapture(e.pointerId);
        $('#cl-svg').classList.add('cl-dragging-' + which);
        move(e);
    });
    const move = (e) => {
        if (!st.drag) { return; }
        const a = angleOf(e), step = STEP[opt.level];
        if (st.drag === 'm') {
            const old = st.t % 60;
            let m = Math.round(a / 6 / step) * step % 60;
            if (step === 60) { m = 0; }
            let d = m - old;
            if (d < -30) { d += 60; } else if (d > 30) { d -= 60; }
            if (!d) { return; }
            st.t = (st.t + d + 1440) % 1440;
        } else {
            const half = st.t >= 720 ? 720 : 0, m = st.t % 60;
            const h = Math.floor(((a - (m / 60) * 30 + 360) % 360 + 15) / 30) % 12;
            const next = half + h * 60 + m;
            if (next === st.t) { return; }
            st.t = next;
        }
        // Moving the hands freely shows their time; while setting a given time, the answer stays hidden.
        st.hidden = st.target !== null;
        paint(); play('tic');
    };
    $('#cl-svg').addEventListener('pointermove', move);
    const stop = () => { st.drag = null; $('#cl-svg').classList.remove('cl-dragging-h', 'cl-dragging-m'); };
    $('#cl-svg').addEventListener('pointerup', stop);
    $('#cl-svg').addEventListener('pointercancel', stop);

    // --- Controls ---------------------------------------------------------------------------------------------
    $('#cl-mode').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.mode = b.dataset.v; persist(); paintControls(); paint(); } });
    $('#cl-level').addEventListener('change', () => {
        opt.level = $('#cl-level').value; persist();
        const step = STEP[opt.level]; st.t = Math.round(st.t / step) * step % 1440; paint();
    });
    [['digital', '#cl-o-digital'], ['words', '#cl-o-words'], ['minutes', '#cl-o-minutes'], ['h24', '#cl-o-h24']].forEach(([k, sel]) => {
        $(sel).addEventListener('change', () => { opt[k] = $(sel).checked; persist(); paint(); });
    });
    // A new screen mode: the clock starts at that mode's level.
    document.addEventListener('classtools:mode', () => {
        opt.level = MODE_LEVEL[(core.mode ? core.mode() : 'primary')] || opt.level; persist();
        const step = STEP[opt.level]; st.t = Math.round(st.t / step) * step % 1440;
        paintControls(); paint();
    });
    paintControls(); paint();

    window.ClasstoolsClockLearn = { state: () => st, inWords, opt: () => opt };   // for automated tests
})();
