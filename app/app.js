// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * The board: its tabs, the class lists and the tools that live in this file (timer, stopwatch, «Whose turn?»,
 * groups, noise meter, chance, work symbols, clock and QR code), and window.ClasstoolsCore, what every other file
 * of app/ uses.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const $ = (s) => document.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pad = (n) => String(n).padStart(2, '0');
    const randomInt = (n) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
    const shuffle = (v) => { for (let i = v.length - 1; i > 0; i--) { const j = randomInt(i + 1); [v[i], v[j]] = [v[j], v[i]]; } return v; };
    const escapeHtml = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

    // --- Texts: those of the language packs (inside Moodle, in each user's language; outside, strings.js).
    // Placeholders as in Moodle: {$a} and {$a->name}. A missing key shows as it is, so that it can be found.
    const STRINGS = Object.assign({}, window.CLASSTOOLS_STR || {}, (window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.str) || {});
    const t = (key, a) => {
        const s = STRINGS[key];
        if (s === undefined) { return key; }
        if (a === undefined) { return s; }
        return s.replace(/\{\$a(?:->(\w+))?\}/g, (m, k) => (k ? (a && a[k] !== undefined ? String(a[k]) : m) : String(a)));
    };
    // The fixed texts of the page: data-t (text), data-t-title, data-t-aria (aria-label) and data-t-placeholder.
    const translatePage = (root = document) => {
        $$('[data-t]', root).forEach((el) => { el.textContent = t(el.dataset.t); });
        [['tTitle', 'title'], ['tAria', 'aria-label'], ['tPlaceholder', 'placeholder']].forEach(([d, attr]) => {
            $$(`[data-${d.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}]`, root).forEach((el) => el.setAttribute(attr, t(el.dataset[d])));
        });
    };
    // The language: the user's inside Moodle; outside, that of the texts file.
    const LANGUAGE = ((window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.lang) || window.CLASSTOOLS_LANG || document.documentElement.lang || 'en').replace('_', '-');
    document.documentElement.lang = LANGUAGE;
    translatePage();

    // --- Browser storage: only conveniences; if it cannot save, everything still works in memory ---
    let storageWorks = true;
    try { localStorage.setItem('pizarra:prueba', '1'); localStorage.removeItem('pizarra:prueba'); } catch (e) { storageWorks = false; }
    // In a duel (duel.js) each half is a copy of the board in a frame, with a material only: it starts with what is
    // saved, but saves nothing, neither in the browser nor in Moodle, so as not to touch the teacher's things.
    const DUEL = (location.hash.match(/(?:^#|&)duelo=([a-z0-9]+)/) || [])[1] || '';
    if (DUEL) { document.documentElement.classList.add('duelo'); }
    // The practice board of a guided help (help.js, practice.js): it starts from scratch and reads or saves nothing of
    // the teacher.
    const PRACTICE = /(?:^#|&)practica(?:&|$)/.test(location.hash);
    const inMemory = {};
    const save = (k, v) => {
        if (DUEL || PRACTICE) { inMemory[k] = v; return; }
        try { localStorage.setItem('pizarra:' + k, JSON.stringify(v)); } catch (e) { storageWorks = false; }
    };
    const load = (k, d) => {
        if (PRACTICE) { return k in inMemory ? inMemory[k] : d; }
        if (DUEL && k in inMemory) { return inMemory[k]; }
        try { const v = localStorage.getItem('pizarra:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    };

    // --- Screen mode: one at a time (Early years, Primary, Secondary or Advanced), remembered per course. It changes
    // the look and the values the games start with; it takes no tool away. ---
    const SCREEN_MODES = ['early', 'primary', 'secondary', 'advanced'];
    const CLASS_DATA = window.CLASSTOOLS || null;
    const modeKey = 'modo-' + ((CLASS_DATA && CLASS_DATA.courseid) || 0);
    let mode = (() => {
        const inCourse = CLASS_DATA && CLASS_DATA.state && CLASS_DATA.state.settings && CLASS_DATA.state.settings.mode;
        const local = load(modeKey, null);
        const siteMode = window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.mode;
        return [local, inCourse, siteMode, 'primary'].find((m) => SCREEN_MODES.includes(m));
    })();
    document.documentElement.dataset.modo = mode;
    // Values that start differently in each mode: each mode starts from its own and remembers what the teacher changes
    // while in it. What was saved before there were modes (the old keys) moves once to the mode of that moment.
    const byMode = (baseKey, values, oldKeys = {}) => {
        const k = () => `${baseKey}-${mode}`;
        const oldPresent = Object.entries(oldKeys).filter(([, a]) => load(a, null) !== null);
        if (oldPresent.length && load(k(), null) === null) { save(k(), Object.fromEntries(oldPresent.map(([c, a]) => [c, load(a, null)]))); }
        oldPresent.forEach(([, a]) => { try { localStorage.removeItem('pizarra:' + a); } catch (e) { /* no storage */ } });
        return {
            get: () => Object.assign({}, values.primary, values[mode], load(k(), {})),
            set: (changes) => save(k(), Object.assign(load(k(), {}), changes)),
        };
    };

    // Names in capitals (for those learning to read): at first, on in Early years and off in the other modes; what
    // the teacher changes stays in that course. It only changes how they look: the saved names are not touched.
    const upperNames = byMode('nombres-mayus:' + ((window.CLASSTOOLS && window.CLASSTOOLS.courseid) || 0),
        { early: { on: true }, primary: { on: false }, secondary: { on: false }, advanced: { on: false } });
    const applyUpperNames = () => {
        document.documentElement.classList.toggle('nombres-mayus', !!upperNames.get().on);
        document.dispatchEvent(new CustomEvent('classtools:names'));
    };
    applyUpperNames();
    const toNameCase = (s) => (document.documentElement.classList.contains('nombres-mayus')
        ? String(s).toLocaleUpperCase(document.documentElement.lang || undefined) : s);

    // --- Icons, and notices for screen readers ---
    const setIcon = (el, n) => { el.dataset.icono = n; el.innerHTML = icono(n); };
    $$('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
    const announce = (t) => { const a = $('#anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 40); };
    // Changes the text of a button with an icon (its last <span>) without touching the icon.
    const relabel = (button, text, iconName) => {
        const spans = button.querySelectorAll(':scope > span');
        if (iconName) { setIcon(spans[0], iconName); }
        spans[spans.length - 1].textContent = text;
    };

    // --- Sound: all synthesised in the browser, no files ---
    let soundOn = load('sonido', true) !== false;
    let ctx = null, masterGain = null;
    const audio = () => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { return null; }
        if (!ctx) {
            ctx = new AC();
            masterGain = ctx.createGain(); masterGain.gain.value = 0.5;
            const comp = ctx.createDynamicsCompressor(); masterGain.connect(comp); comp.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') { ctx.resume(); }
        return ctx;
    };
    // The browser only plays sound after a gesture: the audio wakes up with the first touch.
    addEventListener('pointerdown', () => { if (soundOn) { audio(); } }, { capture: true });
    // A soft bell: a fundamental and three partials that fade sooner.
    const bell = (a, f, when, vol, dur) => {
        const t = a.currentTime + when;
        [[1, 1, dur], [2, 0.32, dur * 0.6], [3.01, 0.12, dur * 0.35], [4.2, 0.05, dur * 0.2]].forEach(([m, v, d]) => {
            const o = a.createOscillator(), g = a.createGain();
            o.type = 'sine'; o.frequency.value = f * m;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(vol * v, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + d);
            o.connect(g); g.connect(masterGain); o.start(t); o.stop(t + d + 0.05);
        });
    };
    const clickSound = (a, f, when = 0, vol = 0.12) => {
        const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        o.connect(g); g.connect(masterGain); o.start(t); o.stop(t + 0.06);
    };
    const SOUNDS = {
        fin: (a) => [0, 1.5].forEach((r) => [[783.99, 0], [1046.5, 0.22], [1318.51, 0.44]].forEach(([f, d]) => bell(a, f, r + d, 0.45, 2.2))),
        tic: (a) => clickSound(a, 1500),
        elegido: (a) => { bell(a, 880, 0, 0.35, 1.2); bell(a, 1318.51, 0.12, 0.35, 1.6); },
        dado: (a) => [0, 0.07, 0.15, 0.24, 0.36].forEach((d, i) => clickSound(a, 500 + i * 90, d, 0.18)),
        moneda: (a) => { bell(a, 2093, 0, 0.12, 0.5); bell(a, 2349.3, 1.25, 0.18, 0.9); },
        aviso: (a) => { bell(a, 659.25, 0, 0.3, 1.2); bell(a, 659.25, 0.4, 0.3, 1.5); },
        cuenta: (a) => clickSound(a, 1250, 0, 0.16),
        cuentaFinal: (a) => bell(a, 987.77, 0, 0.3, 0.35),
        agotada: (a) => { bell(a, 523.25, 0, 0.4, 1.4); bell(a, 392, 0.28, 0.4, 1.6); bell(a, 261.63, 0.56, 0.45, 2.4); },
    };
    const playSound = (n) => { if (!soundOn) { return; } const a = audio(); if (!a) { return; } try { SOUNDS[n](a); } catch (e) { /* no audio */ } };

    // --- Students' board (if the site opens it): only the tools without data of the class; the other tabs do not
    // even show. ---
    const ALLOWED_TOOLS = window.CLASSTOOLS && window.CLASSTOOLS.mode === 'student' && Array.isArray(window.CLASSTOOLS.tools) ? window.CLASSTOOLS.tools : null;
    if (ALLOWED_TOOLS) {
        document.documentElement.classList.add('modo-alumno');
        $$('.pestana').forEach((b) => { if (!ALLOWED_TOOLS.includes(b.dataset.h)) { b.remove(); } });
    }
    // --- The tools the school wants (the administrator chooses them); with none chosen, all of them. ---
    const SITE_TOOLS = window.CLASSTOOLS_SITE && Array.isArray(window.CLASSTOOLS_SITE.tools) && window.CLASSTOOLS_SITE.tools.length ? window.CLASSTOOLS_SITE.tools : null;
    if (SITE_TOOLS && $$('.pestana').some((b) => SITE_TOOLS.includes(b.dataset.h))) {
        $$('.pestana').forEach((b) => { if (!SITE_TOOLS.includes(b.dataset.h)) { b.remove(); $('#' + b.getAttribute('aria-controls')).hidden = true; } });
    }

    // --- Tabs ---
    const TOOLS = {};   // each tool may have entra() (enter) and sale() (leave)
    const tabs = $$('.pestana'), topBar = $('#barra'), tabStrip = $('#pestanas');
    let current = 'temporizador';
    // Split screen: two tools at once, one in each half. A half is chosen by touching it (it gets marked), and its
    // tool with the tabs; «current» is the one of the chosen half.
    const halves = { on: false, izq: 'temporizador', der: 'quien', foco: 'izq' };
    const visibleTools = () => (halves.on ? [halves.izq, halves.der] : [current]);
    const showTool = (h, withFocus = false) => {
        const shownBefore = visibleTools();
        if (halves.on) {
            // The tab of the other half: that half becomes the chosen one, changing nothing.
            const otherHalf = halves.foco === 'izq' ? 'der' : 'izq';
            if (halves[otherHalf] === h) { halves.foco = otherHalf; } else { halves[halves.foco] = h; }
            save('dividida', { izq: halves.izq, der: halves.der });
        }
        current = h;
        const shownNow = visibleTools();
        shownBefore.filter((x) => !shownNow.includes(x)).forEach((x) => { if (TOOLS[x] && TOOLS[x].sale) { TOOLS[x].sale(); } });
        paintTabs(withFocus);
        $$('.herramienta').forEach((s) => {
            const id = s.id.slice(2);
            s.hidden = !shownNow.includes(id);
            s.classList.toggle('mitad-izq', halves.on && id === halves.izq);
            s.classList.toggle('mitad-der', halves.on && id === halves.der);
            s.classList.toggle('con-foco', halves.on && id === current);
        });
        shownNow.filter((x) => !shownBefore.includes(x) || x === h).forEach((x) => { if (TOOLS[x] && TOOLS[x].entra) { TOOLS[x].entra(); } });
        badges();
        if (topBar.classList.contains('compacta')) { fitBar(); }
        document.dispatchEvent(new CustomEvent('classtools:tab', { detail: h }));
    };
    function paintTabs(withFocus) {
        const otherTool = halves.on ? halves[halves.foco === 'izq' ? 'der' : 'izq'] : '';
        tabs.forEach((b) => {
            const selected = b.dataset.h === current;
            b.setAttribute('aria-selected', String(selected));
            b.classList.toggle('en-la-otra', b.dataset.h === otherTool);
            b.tabIndex = selected ? 0 : -1;
            if (selected && withFocus) { b.focus(); }
            // On narrow screens the strip of tabs scrolls: the chosen one, always in sight.
            if (selected && tabStrip.scrollWidth > tabStrip.clientWidth) {
                tabStrip.scrollTo({ left: b.offsetLeft - (tabStrip.clientWidth - b.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
            }
        });
    }
    // Split and join. On splitting, the current tool goes to the left and the last one there was to the right
    // (or the timer); on joining, the one of the chosen half stays.
    const desk = $('#mesa'), bSplit = $('#b-dividir');
    const availableTools = () => tabs.filter((b) => b.isConnected).map((b) => b.dataset.h);
    const setSplit = (on) => {
        if (on === halves.on) { return; }
        const shownBefore = visibleTools();
        if (on) {
            const lastSplit = load('dividida', {}) || {};
            const otherTool = [lastSplit.der, lastSplit.izq, 'temporizador', 'quien'].find((x) => x && x !== current && availableTools().includes(x));
            Object.assign(halves, { on: true, izq: current, der: otherTool || availableTools().find((x) => x !== current), foco: 'izq' });
        } else { halves.on = false; }
        desk.classList.toggle('dividida', halves.on);
        $('#mesa-division').hidden = !halves.on;
        bSplit.setAttribute('aria-pressed', String(halves.on));
        save('dividida-on', halves.on);
        if (halves.on) { save('dividida', { izq: halves.izq, der: halves.der }); }
        // The ones that leave, leave; the ones that come in, enter (and are drawn again at their new size).
        const shownNow = visibleTools();
        shownBefore.filter((x) => !shownNow.includes(x)).forEach((x) => { if (TOOLS[x] && TOOLS[x].sale) { TOOLS[x].sale(); } });
        showTool(current);
        shownNow.filter((x) => !shownBefore.includes(x) && x !== current).forEach((x) => { if (TOOLS[x] && TOOLS[x].entra) { TOOLS[x].entra(); } });
        dispatchEvent(new Event('resize'));
    };
    bSplit.addEventListener('click', () => setSplit(!halves.on));
    $('#b-juntar').addEventListener('click', () => setSplit(false));
    $('#b-intercambiar').addEventListener('click', () => {
        [halves.izq, halves.der] = [halves.der, halves.izq];
        halves.foco = halves.foco === 'izq' ? 'der' : 'izq';
        showTool(current);
        dispatchEvent(new Event('resize'));
    });
    // Touching a half chooses it (its tab gets marked, and the remote and the keyboard go to it).
    desk.addEventListener('pointerdown', (e) => {
        const s = halves.on && e.target.closest('.herramienta');
        if (!s || s.id.slice(2) === current) { return; }
        halves.foco = s.id.slice(2) === halves.izq ? 'izq' : 'der';
        current = s.id.slice(2);
        paintTabs(false);
        $$('.herramienta').forEach((x) => x.classList.toggle('con-foco', x.id === 'h-' + current));
        document.dispatchEvent(new CustomEvent('classtools:tab', { detail: current }));
    }, true);
    tabs.forEach((b) => b.addEventListener('click', () => showTool(b.dataset.h)));
    $('#pestanas').addEventListener('keydown', (e) => {
        const i = tabs.findIndex((b) => b.dataset.h === current), n = tabs.length;
        const j = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
        if (j !== undefined) { e.preventDefault(); showTool(tabs[j].dataset.h, true); }
    });
    // If the tabs do not fit beside the name, the bar goes to two rows.
    // And if they do not fit in two rows either, the tabs that are not chosen keep only their icon (with the name
    // on hover), first in one row and, if needed, in two.
    tabs.forEach((b) => { b.title = b.textContent.trim(); });
    const fitBar = () => {
        const overflows = () => tabStrip.scrollWidth > tabStrip.clientWidth + 1;
        topBar.classList.remove('dos-filas', 'compacta', 'sin-nombres');
        if (overflows()) {
            topBar.classList.add('dos-filas');
            if (overflows()) {
                topBar.classList.replace('dos-filas', 'compacta');
                if (overflows()) { topBar.classList.add('dos-filas'); }
            }
        }
        // With their names, the buttons on top may not fit across: then, only with their icon.
        if (topBar.classList.contains('dos-filas') && topBar.scrollWidth > topBar.clientWidth + 1) { topBar.classList.add('sin-nombres'); }
    };
    addEventListener('resize', fitBar);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitBar); }
    // And again when the name or the buttons on top change size (the font arrives, the size of the board is added,
    // the course changes…).
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => fitBar()); [$('.marca'), $('.acciones')].filter(Boolean).forEach((x) => ro.observe(x)); }

    // --- Buttons of the bar: sound, another window, full screen ---
    const bSound = $('#b-sonido');
    const paintSound = () => {
        bSound.setAttribute('aria-pressed', String(soundOn));
        setIcon(bSound.querySelector('[data-icono]'), soundOn ? 'sonido' : 'mudo');
        bSound.title = soundOn ? t('bar_sound_on') : t('bar_sound_off');
    };
    bSound.addEventListener('click', () => { soundOn = !soundOn; save('sonido', soundOn); paintSound(); playSound('tic'); });
    // Inside Moodle the SCORM package runs in a frame that may block the microphone and full screen.
    const openWindow = () => window.open(location.href, '_blank', 'noopener');
    $('#b-ventana').hidden = !inFrame;
    $('#b-ventana').addEventListener('click', openWindow);
    const bFullscreen = $('#b-pantalla');
    bFullscreen.hidden = !document.fullscreenEnabled;
    bFullscreen.addEventListener('click', () => {
        if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
        else { document.documentElement.requestFullscreen().catch(() => {}); }
    });
    document.addEventListener('fullscreenchange', () => {
        const isFull = !!document.fullscreenElement;
        setIcon(bFullscreen.querySelector('[data-icono]'), isFull ? 'salir' : 'pantalla');
        bFullscreen.title = isFull ? t('bar_fullscreen_exit') : t('bar_fullscreen');
        bFullscreen.querySelector('.redondo-texto').textContent = bFullscreen.title;
        setTimeout(fitBar, 50);
    });

    // A button that repeats while held down (the + and − of the minutes).
    const repeatWhileHeld = (button, action) => {
        let t1 = 0, t2 = 0;
        const stopRepeat = () => { clearTimeout(t1); clearInterval(t2); };
        button.addEventListener('pointerdown', (e) => {
            if (e.button > 0) { return; }
            action(); stopRepeat();
            t1 = setTimeout(() => { t2 = setInterval(action, 90); }, 450);
        });
        ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach((ev) => button.addEventListener(ev, stopRepeat));
        button.addEventListener('click', (e) => { if (e.detail === 0) { action(); } });   // keyboard
    };

    // ===================================================================================================
    // 1. Timer
    // ===================================================================================================
    const tm = { total: 300000, resta: 300000, fin: 0, marcha: false, acabado: false, reloj: 0 };
    // In blocks (pomodoro): which part it is in (trabajo, work, or descanso, rest) and which block it is (from 0).
    const blocks = { on: false, fase: 'trabajo', i: 0 };
    let blockStatus = () => '';
    const tmDigits = $('#tm-cifras'), tmRing = $('#tm-anillo'), tmProgress = $('#tm-progreso');
    const formatSeconds = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`; };
    const MAX_TM = (99 * 60 + 59) * 1000;
    const tmPaint = () => {
        const txt = formatSeconds(Math.ceil(tm.resta / 1000));
        tmDigits.textContent = txt;
        tmDigits.classList.toggle('larga', txt.length > 5);
        const frac = tm.total ? Math.min(1, tm.resta / tm.total) : 0;
        tmProgress.style.strokeDashoffset = String(1000 * (1 - frac));
        tmProgress.style.opacity = frac > 0.002 ? '1' : '0';
        const touched = tm.marcha || tm.acabado || tm.resta < tm.total;
        tmRing.classList.toggle('ultimo', touched && tm.resta <= 10000);
        tmRing.classList.toggle('aviso', touched && tm.resta > 10000 && frac <= 0.25);
        tmRing.classList.toggle('en-marcha', tm.marcha);
        paintLook(frac);
        $('#tm-estado').textContent = tm.acabado ? t('fin_time') : (blocks.on ? blockStatus()
            : (tm.marcha ? t('tm_running') : tm.resta < tm.total ? t('tm_paused') : t('tm_ready')));
        tmRing.classList.toggle('descanso', blocks.on && blocks.fase === 'descanso' && !tm.acabado);
        badges();
        tmMini();
    };
    // With the timer running (or paused) and another tab in front: a small clock in a corner, to see it,
    // pause it or stop it without going back; touching it goes back to the timer.
    const mini = document.createElement('div');
    mini.className = 'tm-mini'; mini.hidden = true;
    mini.innerHTML = `<button type="button" class="tm-mini-ir" id="tm-mini-ir"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="tm-mini-pista" cx="18" cy="18" r="15"/>`
        + `<circle class="tm-mini-arco" id="tm-mini-arco" cx="18" cy="18" r="15" pathLength="100" transform="rotate(-90 18 18)"/></svg><strong id="tm-mini-cifras"></strong></button>`
        + `<button type="button" class="redondo suave" id="tm-mini-marcha"></button>`
        + `<button type="button" class="redondo suave" id="tm-mini-parar">${icono('reiniciar')}</button>`;
    document.body.append(mini);
    mini.querySelector('#tm-mini-ir').setAttribute('title', t('tm_mini_go'));
    mini.querySelector('#tm-mini-parar').setAttribute('title', t('gen_reset'));
    mini.querySelector('#tm-mini-parar').setAttribute('aria-label', t('gen_reset'));
    function tmMini() {
        const active = !tm.acabado && (tm.marcha || (tm.resta > 0 && tm.resta < tm.total));
        mini.hidden = !active || visibleTools().includes('temporizador');
        if (mini.hidden) { return; }
        mini.querySelector('#tm-mini-cifras').textContent = formatSeconds(Math.ceil(tm.resta / 1000));
        mini.querySelector('#tm-mini-arco').style.strokeDashoffset = String(100 * (1 - (tm.total ? tm.resta / tm.total : 0)));
        mini.classList.toggle('ultimo', tm.resta <= 10000);
        mini.classList.toggle('pausa', !tm.marcha);
        const b = mini.querySelector('#tm-mini-marcha'), label = tm.marcha ? t('gen_pause') : t('gen_resume');
        if (b.dataset.estado !== String(tm.marcha)) { b.innerHTML = icono(tm.marcha ? 'pausa' : 'empezar'); b.dataset.estado = String(tm.marcha); }
        b.title = label; b.setAttribute('aria-label', label);
    }
    mini.querySelector('#tm-mini-ir').addEventListener('click', () => showTool('temporizador'));
    mini.querySelector('#tm-mini-marcha').addEventListener('click', () => $('#tm-marcha').click());
    mini.querySelector('#tm-mini-parar').addEventListener('click', () => $('#tm-reiniciar').click());
    document.addEventListener('classtools:tab', () => tmMini());
    const tmButtons = () => {
        const b = $('#tm-marcha');
        if (tm.marcha) { relabel(b, t('gen_pause'), 'pausa'); b.className = 'boton grande amarillo ancho'; }
        else { relabel(b, tm.resta < tm.total && tm.resta > 0 ? t('gen_resume') : t('gen_start'), 'empezar'); b.className = 'boton grande verde ancho'; }
        b.disabled = !tm.marcha && tm.total <= 0;
    };
    const tmChips = () => $$('.chip[data-min], .chip[data-ms]').forEach((c) => c.classList.toggle('activo', (c.dataset.min ? Number(c.dataset.min) * 60000 : Number(c.dataset.ms)) === tm.total));

    // Look: the usual ring, the red disc that shrinks, a bar or an hourglass (for each
    // computer). The text is placed according to the drawing.
    const LOOKS = ['anillo', 'disco', 'barra', 'arena', 'pulsar'];
    // Each mode starts with its own: Early years with the shrinking red disc, Advanced with the sober bar; the
    // quick times, from shorter to longer; the count of the last 10 seconds, only for the young ones.
    const tmByMode = byMode('tm', {
        early: { aspecto: 'disco', rapidos: [1, 2, 3, 5, 10], final: true, viajero: 'cohete' },
        primary: { aspecto: 'anillo', rapidos: [1, 3, 5, 10, 15], final: true, viajero: 'cohete' },
        secondary: { aspecto: 'anillo', rapidos: [2, 5, 10, 15, 20], final: false, viajero: 'bateria' },
        advanced: { aspecto: 'barra', rapidos: [5, 10, 15, 20, 30], final: false, viajero: 'ninguno' },
    }, { aspecto: 'tm-aspecto', final: 'tm-final' });
    let look = LOOKS.includes(tmByMode.get().aspecto) ? tmByMode.get().aspecto : 'anillo';
    let traveller = tmByMode.get().viajero;
    const TEXT_POSITION = { anillo: [100, 104, 100, 148], disco: [100, 104, 100, 152], barra: [100, 78, 100, 178], arena: [145, 98, 145, 132], pulsar: [100, 164, 100, 30] };
    // The colour of the bar by what is left: green, yellow and, at the end, red.
    // (In HSL, so that bright lime and orange come in between, not muddy colours.)
    const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const GREEN = [142, 91, 26], YELLOW = [44, 96, 54], RED = [-5, 82, 44];
    const barColour = (f) => {
        const [h, s, l] = f > 0.5 ? mix(YELLOW, GREEN, (f - 0.5) * 2) : mix(RED, YELLOW, f * 2);
        return `hsl(${Math.round((h + 360) % 360)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    };
    // The bar according to its traveller (or without one).
    const TRAVELLERS = ['cohete', 'coche', 'caracol', 'barco', 'bateria', 'pixel', 'ninguno'];
    const drawBar = (v, by, bh, br) => {
        let stripes = '';
        for (let i = -3; i < 14; i++) { stripes += `<path d="M${12 + i * 14} 150L${24 + i * 14} 118h7L${19 + i * 14} 150Z"/>`; }
        let squares = '';
        for (let i = 0; i < 9; i++) { squares += `<rect x="${186 + (i % 3) * 4}" y="${100 + Math.floor(i / 3) * 4}" width="4" height="4" fill="${((i % 3) + Math.floor(i / 3)) % 2 ? '#fff' : '#1c1a19'}"/>`; }
        const finishLine = `<g class="tm-meta"><line x1="186" y1="99" x2="186" y2="152"/>${squares}<rect class="tm-meta-borde" x="186" y="100" width="12" height="12"/></g>`;
        const trail = `<defs><clipPath id="tmEstela"><rect class="tm-estela" x="12" y="${by}" width="0" height="${bh}" rx="${br}"/></clipPath></defs>`;
        const fact = '<text class="tm-dato" x="100" y="197" text-anchor="middle"></text>';
        if (v === 'cohete' || v === 'ninguno') {
            return trail + `<rect class="tm-pista-barra" x="12" y="${by}" width="170" height="${bh}" rx="${br}"/>`
                + `<g clip-path="url(#tmEstela)"><rect class="tm-barra" x="12" y="${by}" width="170" height="${bh}"/><g class="tm-rayas">${stripes}</g></g>`
                + (v === 'ninguno' ? '' : finishLine + '<g class="tm-viajero tm-cohete"><path class="tm-llama" d="M-17 -5Q-31 0 -17 5Z"/>'
                    + '<path class="tm-aleta" d="M-14 -6L-20 -14H-11L-5 -6ZM-14 6L-20 14H-11L-5 6Z"/>'
                    + '<path class="tm-casco" d="M-17 -7H5Q17 -7 22 0Q17 7 5 7H-17Z"/><circle class="tm-ventana" cx="4" cy="0" r="3.6"/></g>' + fact);
        }
        if (v === 'coche') {
            return '<rect class="tm-carretera" x="12" y="118" width="170" height="32" rx="6"/><line class="tm-raya" x1="16" y1="134" x2="180" y2="134"/>' + finishLine
                + '<g class="tm-viajero tm-coche"><g class="tm-velocidad"><line x1="-34" y1="-4" x2="-26" y2="-4"/><line x1="-37" y1="1" x2="-26" y2="1"/></g>'
                + '<image class="tm-f1" href="img/coche-f1.webp" x="-28" y="-14.5" width="56" height="23.7"/></g>' + fact;
        }
        if (v === 'caracol') {
            return trail + '<rect class="tm-suelo" x="10" y="141" width="180" height="9" rx="4.5"/>'
                + '<g clip-path="url(#tmEstela)"><rect class="tm-baba" x="12" y="137" width="170" height="5" rx="2.5"/></g>'
                + '<path class="tm-hoja" d="M190 141 Q177 128 188 112 Q202 124 190 141 Z"/><path class="tm-hoja-nervio" d="M190 140 Q188 127 188 114"/>'
                + '<g class="tm-viajero tm-caracol"><path class="tm-caracol-cuerpo" d="M-17 8 Q-19 3 -13 3 L8 3 Q13 3 14 -4 L15 -10 Q16 -12 17.5 -10 L17 -3 Q16.5 7 9 8 Z"/>'
                + '<path class="tm-antena" d="M14 -8 L12 -15 M16.5 -7 L19 -14"/><circle class="tm-ojito" cx="12" cy="-15.5" r="1.7"/><circle class="tm-ojito" cx="19" cy="-14.5" r="1.7"/>'
                + '<circle class="tm-concha" cx="-3" cy="-4" r="9"/><path class="tm-espiral" d="M-3 -4 a2 2 0 1 1 2 2 a4 4 0 1 1 -4 -4 a6.5 6.5 0 1 1 6.5 6.5"/></g>' + fact;
        }
        if (v === 'barco') {
            return '<rect class="tm-mar" x="10" y="129" width="180" height="21" rx="8"/>'
                + '<path class="tm-olas" d="M12 129 q5 -3.5 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0"/>'
                + '<ellipse class="tm-arena" cx="191" cy="130" rx="10" ry="4.5"/><path class="tm-palmera" d="M192 129 Q191 119 194 111"/>'
                + '<path class="tm-palma" d="M194 111 q-8 -2 -12 4 M194 111 q8 -3 11 3 M194 111 q-2 -7 -8 -9 M194 111 q4 -6 10 -6"/>'
                + '<g class="tm-viajero tm-barco"><g class="tm-mece"><path class="tm-casco-barco" d="M-15 2 L15 2 L10 9 L-10 9 Z"/><path class="tm-mastil" d="M0 2 V-18"/>'
                + '<path class="tm-vela" d="M1.5 -17 L13 0 L1.5 0 Z"/><path class="tm-foque" d="M-1.5 -14 L-11 0 L-1.5 0 Z"/></g></g>' + fact;
        }
        if (v === 'bateria') {
            let cells = '';
            for (let k = 1; k < 4; k++) { cells += `<line class="tm-celda" x1="${16 + 39 * k}" y1="118" x2="${16 + 39 * k}" y2="150"/>`; }
            return '<g class="tm-bateria-dibujo"><rect class="tm-bateria" x="12" y="114" width="164" height="40" rx="8"/><rect class="tm-borne" x="177" y="126" width="7" height="16" rx="2"/>'
                + `<rect class="tm-carga" x="16" y="118" width="156" height="32" rx="5"/>${cells}</g>`;
        }
        // Pixel: an old-style loading bar, in blocks.
        let pixelBlocks = '';
        for (let i = 0; i < 16; i++) { pixelBlocks += `<rect class="tm-bloque" x="${(13 + i * 10.625).toFixed(2)}" y="121" width="8.6" height="26"/>`; }
        return `<rect class="tm-pixel-marco" x="10" y="118" width="174" height="32"/>${pixelBlocks}`;
    };
    const paintLook = (frac) => {
        tmRing.dataset.aspecto = look;
        const [cx, cy, ex, ey] = TEXT_POSITION[look];
        tmDigits.setAttribute('x', cx); tmDigits.setAttribute('y', cy);
        $('#tm-estado').setAttribute('x', ex); $('#tm-estado').setAttribute('y', ey);
        const g = $('#tm-aspecto'), f = Math.max(0, Math.min(1, frac));
        if (look !== 'pulsar' && look !== 'barra') { g.dataset.hecho = ''; }
        if (look === 'disco') {
            // Like visual timers: the red disc is the time left and it shrinks towards twelve.
            const a = f * 2 * Math.PI, x = (100 - 82 * Math.sin(a)).toFixed(2), y = (100 - 82 * Math.cos(a)).toFixed(2);
            const sector = f >= 0.9999 ? '<circle class="tm-disco" cx="100" cy="100" r="82"/>'
                : (f > 0.0005 ? `<path class="tm-disco" d="M100 100L100 18A82 82 0 ${f > 0.5 ? 1 : 0} 0 ${x} ${y}Z"/>` : '');
            let ticks = '';
            for (let i = 0; i < 60; i += 5) { const r = i * 6 * Math.PI / 180; ticks += `<line x1="${(100 + 86 * Math.sin(r)).toFixed(1)}" y1="${(100 - 86 * Math.cos(r)).toFixed(1)}" x2="${(100 + (i % 15 ? 91 : 94) * Math.sin(r)).toFixed(1)}" y2="${(100 - (i % 15 ? 91 : 94) * Math.cos(r)).toFixed(1)}"/>`; }
            g.innerHTML = `<circle class="tm-cara" cx="100" cy="100" r="95"/>${sector}<g class="tm-marcas">${ticks}</g>`;
        } else if (look === 'barra') {
            // Something travels along the bar as time goes by, from the start to the finish (the usual rocket, a
            // racing car, a snail, a sailing boat), or the bar is what is left (a phone battery, an old video game
            // loading bar, or just the bar). It is drawn once; then only what moves is moved.
            const v = TRAVELLERS.includes(traveller) ? traveller : 'cohete';
            const [by, bh, br] = v === 'ninguno' ? (mode === 'advanced' ? [128, 12, 2] : (mode === 'secondary' ? [124, 20, 10] : [118, 32, 16]))
                : (v === 'bateria' ? [114, 40, 8] : [118, 32, v === 'pixel' ? 0 : 16]);
            const drawnKey = `barra-${v}-${bh}`;
            if (g.dataset.hecho !== drawnKey) { g.innerHTML = drawBar(v, by, bh, br); g.dataset.hecho = drawnKey; }
            const x = 29 + 135 * (1 - f);
            const setAttr = (sel, attr, val) => { const e = g.querySelector(sel); if (e) { e.setAttribute(attr, val); } };
            if (v === 'cohete') { setAttr('.tm-estela', 'width', (x - 8).toFixed(2)); g.querySelector('.tm-barra').style.fill = barColour(f); }
            if (v === 'caracol') { setAttr('.tm-estela', 'width', Math.max(0, x - 24).toFixed(2)); }
            if (v === 'ninguno') { setAttr('.tm-estela', 'width', (170 * f).toFixed(2)); g.querySelector('.tm-barra').style.fill = barColour(f); }
            if (v === 'bateria') {
                setAttr('.tm-carga', 'width', Math.max(0, 156 * f).toFixed(2));
                g.querySelector('.tm-carga').style.fill = barColour(f);
                g.querySelector('.tm-bateria-dibujo').classList.toggle('baja', f > 0 && f < 0.15);
            }
            if (v === 'pixel') {
                const n = Math.ceil(f * 16 - 1e-9), c = f > 0.5 ? '#35b24a' : (f > 0.2 ? '#f2b705' : '#e8432e');
                g.querySelectorAll('.tm-bloque').forEach((q, i) => { q.style.fill = i < n ? c : ''; q.classList.toggle('ultimo', i === n - 1 && f < 0.2); });
            }
            if (['cohete', 'coche', 'caracol', 'barco'].includes(v)) { setAttr('.tm-viajero', 'transform', `translate(${x.toFixed(2)} ${v === 'barco' ? 125 : 134})`); }
            // Before starting, a fact about the traveller: time is also measured in speeds.
            const factText = g.querySelector('.tm-dato');
            if (factText) { factText.textContent = !tm.marcha && tm.total > 0 && tm.resta === tm.total && factText.dataset.hay !== '0' ? t('tm_fact_' + v) : ''; }
        } else if (look === 'arena') {
            // A real hourglass: a wooden frame, glass bulbs and sand that falls and piles up. The
            // amount is that of the time (not the height): the glass narrows towards the neck.
            const hTop = 72 * Math.sqrt(f), yTop = 99 - hTop, k = 66 * (1 - Math.sqrt(f)), yb = 175 - k;
            const topSand = f > 0.0005 ? `<rect x="30" y="${yTop.toFixed(2)}" width="64" height="${(100 - yTop).toFixed(2)}" fill="url(#tmArena)" clip-path="url(#tmArriba)"/>` : '';
            const bottomSand = f < 0.9995 ? `<path d="M28 176V${(yb + k * 0.45).toFixed(2)}Q62 ${(yb - 6).toFixed(2)} 96 ${(yb + k * 0.45).toFixed(2)}V176Z" fill="url(#tmArena)" clip-path="url(#tmAbajo)"/>` : '';
            const stream = tm.marcha && f > 0.0005 ? `<line class="tm-chorro" x1="62" y1="99" x2="62" y2="${(yb + 2).toFixed(2)}"/>` : '';
            const topGlass = 'M36 24C36 60 58 86 59.5 99.5H64.5C66 86 88 60 88 24Z', bottomGlass = 'M59.5 100.5C58 114 36 140 36 176H88C88 140 66 114 64.5 100.5Z';
            g.innerHTML = '<defs><linearGradient id="tmArena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2cd78"/><stop offset="1" stop-color="#d79a31"/></linearGradient>'
                + `<clipPath id="tmArriba"><path d="${topGlass}"/></clipPath><clipPath id="tmAbajo"><path d="${bottomGlass}"/></clipPath></defs>`
                + `<path class="tm-cristal" d="${topGlass}"/><path class="tm-cristal" d="${bottomGlass}"/>${topSand}${bottomSand}${stream}`
                + '<path class="tm-brillo" d="M42 30C42 54 52 76 57 92M42 170C42 150 50 126 56 112"/>'
                + '<rect class="tm-madera" x="26" y="174" width="72" height="11" rx="4"/><rect class="tm-madera" x="26" y="15" width="72" height="11" rx="4"/>'
                + '<rect class="tm-madera" x="29" y="24" width="5" height="152" rx="2"/><rect class="tm-madera" x="90" y="24" width="5" height="152" rx="2"/>';
        } else if (look === 'pulsar') {
            // A pulsar: a neutron star with two rotating beams (one turn every 5 s),
            // expanding rings and a field of stars; the thin arc on the edge is the time left. It is drawn
            // once, and then only the beams turn and the arc moves on (so the waves do not start again).
            if (g.dataset.hecho !== 'pulsar') {
                let stars = '';
                for (let i = 0; i < 60; i++) {
                    const x = 4 + (Math.sin(i * 137.508) * 0.5 + 0.5) * 192, y = 4 + (Math.cos(i * 137.508) * 0.5 + 0.5) * 192;
                    if (Math.hypot(x - 100, y - 100) < 92) { stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + (i % 3) * 0.5).toFixed(1)}" fill="#fff" opacity="${(0.15 + (i % 7) * 0.1).toFixed(2)}"/>`; }
                }
                g.innerHTML = '<defs><radialGradient id="tmEspacio"><stop offset="0" stop-color="#0a1a33"/><stop offset="1" stop-color="#000510"/></radialGradient>'
                    + '<radialGradient id="tmNeutron"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#a5f3fc"/><stop offset=".75" stop-color="#0891b2"/><stop offset="1" stop-color="#0891b2" stop-opacity="0"/></radialGradient>'
                    + '<linearGradient id="tmHaz"><stop offset="0" stop-color="#22d3ee" stop-opacity="0"/><stop offset=".3" stop-color="#22d3ee" stop-opacity=".5"/><stop offset=".5" stop-color="#c8ffff"/><stop offset=".7" stop-color="#22d3ee" stop-opacity=".5"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient>'
                    + '<filter id="tmBrilla" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
                    + `<circle cx="100" cy="100" r="96" fill="url(#tmEspacio)"/>${stars}`
                    + [0, 1, 2].map((i) => `<circle class="tm-pulsar-onda" cx="100" cy="100" r="90" style="animation-delay:${(i * 1.17).toFixed(2)}s"/>`).join('')
                    + '<g class="tm-haces"><rect x="6" y="98.5" width="188" height="3" fill="url(#tmHaz)" filter="url(#tmBrilla)"/>'
                    + '</g>'
                    + '<circle cx="100" cy="100" r="13" fill="url(#tmNeutron)" filter="url(#tmBrilla)"/>'
                    + '<circle class="tm-pulsar-arco" cx="100" cy="100" r="94" pathLength="1000" transform="rotate(-90 100 100)"/>'
                    + '<rect class="tm-pulsar-capsula" x="52" y="148" width="96" height="30" rx="15"/>';
                g.dataset.hecho = 'pulsar';
            }
            const elapsed = Math.max(0, (tm.total - tm.resta) / 1000);
            g.querySelector('.tm-haces').setAttribute('transform', `rotate(${((elapsed * 72) % 360).toFixed(1)} 100 100)`);
            g.querySelector('.tm-pulsar-arco').style.strokeDashoffset = String(1000 * (1 - f));
        } else {
            g.innerHTML = '';
        }
    };
    // What travels along the bar: it only shows with the «Bar» look.
    $('#tm-viajeros').innerHTML = TRAVELLERS.map((k) => `<option value="${k}">${escapeHtml(t('tm_v_' + k))}</option>`).join('');
    const tmPaintTravellers = () => {
        $('#tm-viajeros-caja').hidden = look !== 'barra';
        $('#tm-viajeros').value = TRAVELLERS.includes(traveller) ? traveller : 'cohete';
    };
    $('#tm-viajeros').addEventListener('change', () => { traveller = $('#tm-viajeros').value; tmByMode.set({ viajero: traveller }); tmPaint(); });
    $$('#tm-aspectos button').forEach((b) => {
        b.setAttribute('aria-checked', String(b.dataset.v === look));
        b.addEventListener('click', () => {
            look = b.dataset.v; tmByMode.set({ aspecto: look });
            $$('#tm-aspectos button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
            tmPaintTravellers(); tmPaint();
        });
    });
    tmPaintTravellers();

    // A notice when 1 minute is left (only for times over 2 minutes: for short ones it makes no sense).
    let warnMinute = load('tm-avisar', true) !== false;
    $('#tm-avisar').checked = warnMinute;
    $('#tm-avisar').addEventListener('change', (e) => { warnMinute = e.target.checked; save('tm-avisar', warnMinute); });
    let noticeTimer = 0;
    // The last 10 seconds, to count them aloud: each second, a beat of the digits, a flash and a «tick» (higher
    // in the last three). It can be turned off; it comes on.
    let countdownOn = tmByMode.get().final !== false;
    $('#tm-final').checked = countdownOn;
    $('#tm-final').addEventListener('change', (e) => { countdownOn = e.target.checked; tmByMode.set({ final: countdownOn }); });
    const tmLastSeconds = () => {
        const s = Math.ceil(tm.resta / 1000);
        if (!countdownOn || s > 10 || s < 1 || s === tm.ultimoSegundo) { tm.ultimoSegundo = s; return; }
        tm.ultimoSegundo = s;
        tmRing.classList.remove('latido'); void tmRing.getBoundingClientRect(); tmRing.classList.add('latido');
        playSound(s <= 3 ? 'cuentaFinal' : 'cuenta');
    };
    const tmWarnMinute = () => {
        if (!warnMinute || tm.avisado || tm.total <= 120000 || tm.resta > 60000 || tm.resta <= 1500) { return; }
        tm.avisado = true;
        playSound('aviso');
        const p = $('#tm-poco');
        p.textContent = t('tm_one_left'); p.hidden = false;
        clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { p.hidden = true; }, 5000);
        announce(t('tm_one_left'));
    };

    // The teacher's times: one or two they use a lot, besides the usual ones. They are kept on this computer and,
    // inside a course, in Moodle (they follow the teacher to any computer).
    const courseSettings = Object.assign({}, (CLASS_DATA && CLASS_DATA.state && CLASS_DATA.state.settings) || {});
    const saveSettings = (changes) => { Object.assign(courseSettings, changes, { updated: Date.now() }); keepInMoodle('settings', courseSettings); };
    const validTime = (ms) => Number.isFinite(ms) && ms > 0 && ms <= MAX_TM;
    let favourites = (Array.isArray(courseSettings.favs) ? courseSettings.favs : load('tiempos-favoritos', [])).map(Number).filter(validTime).slice(0, 2);
    const timeLabel = (ms) => (ms % 60000 === 0 ? t('tm_min_short', ms / 60000) : formatSeconds(Math.round(ms / 1000)));
    const paintFavourites = () => {
        $('#tm-favoritos').innerHTML = favourites.map((ms) => `<span class="chip-fav"><button type="button" class="chip" data-ms="${ms}" title="${escapeHtml(t('tm_fav', timeLabel(ms)))}">${escapeHtml(timeLabel(ms))}</button>`
            + `<button type="button" class="chip-quita" data-quita="${ms}" aria-label="${escapeHtml(t('tm_fav_remove', timeLabel(ms)))}">${icono('cerrar')}</button></span>`).join('');
        const add = $('#tm-fav-add');
        const alreadyThere = favourites.includes(tm.total) || $$('.chip[data-min]').some((c) => Number(c.dataset.min) * 60000 === tm.total);
        add.hidden = tm.total <= 0 || alreadyThere;
        add.innerHTML = `${icono('mas')}<span>${escapeHtml(t('tm_fav_add', timeLabel(tm.total)))}</span>`;
        add.title = t('tm_fav_add_title');
        $('#tm-avisar-caja').hidden = tm.total <= 120000;   // for short times the notice makes no sense
        tmChips();
    };
    const saveFavourites = () => { save('tiempos-favoritos', favourites); saveSettings({ favs: favourites }); paintFavourites(); };
    $('#tm-fav-add').addEventListener('click', () => {
        if (!validTime(tm.total) || favourites.includes(tm.total)) { return; }
        favourites = favourites.concat(tm.total).slice(-2);
        saveFavourites(); playSound('tic');
    });
    $('#tm-favoritos').addEventListener('click', (e) => {
        const removeButton = e.target.closest('[data-quita]');
        if (removeButton) { favourites = favourites.filter((ms) => ms !== Number(removeButton.dataset.quita)); saveFavourites(); return; }
        const c = e.target.closest('[data-ms]');
        if (c) { tmSet(Number(c.dataset.ms)); }
    });
    // Sets a new time (stops the timer and leaves it ready).
    const tmSet = (ms) => {
        ms = Math.max(0, Math.min(MAX_TM, Math.round(ms / 1000) * 1000));
        clearInterval(tm.reloj);
        Object.assign(tm, { total: ms, resta: ms, marcha: false, acabado: false });
        $('#tm-min').value = Math.floor(ms / 60000);
        $('#tm-seg').value = Math.floor(ms / 1000) % 60;
        tm.avisado = false;
        paintFavourites(); tmButtons(); tmPaint();
    };
    const tmTick = () => {
        tm.resta = Math.max(0, tm.fin - Date.now());
        if (tm.resta <= 0) { tmFinish(); } else { tmWarnMinute(); tmPaint(); tmLastSeconds(); }
    };
    const tmStart = () => {
        if (tm.total <= 0) { return; }
        if (tm.resta <= 0) { tm.resta = tm.total; }
        if (soundOn) { audio(); }   // so that the bell at the end can sound
        Object.assign(tm, { acabado: false, marcha: true, fin: Date.now() + tm.resta });
        clearInterval(tm.reloj); tm.reloj = setInterval(tmTick, 100);
        tmButtons(); tmPaint();
        announce(t('tm_running_sr'));
    };
    const tmPause = () => {
        tm.resta = Math.max(0, tm.fin - Date.now()); tm.marcha = false; clearInterval(tm.reloj);
        tmButtons(); tmPaint();
        announce(t('tm_paused_sr'));
    };
    const tmReset = () => {
        if (blocks.on) { blocksFromStart(); return; }
        clearInterval(tm.reloj); Object.assign(tm, { marcha: false, acabado: false, avisado: false, resta: tm.total }); tmButtons(); tmPaint();
    };
    const tmToggle = () => { if (tm.marcha) { tmPause(); } else { tmStart(); } };
    const tmFinish = () => {
        if (blocks.on && blocksNext()) { return; }
        clearInterval(tm.reloj);
        // The teacher's sticker: a timer of a minute or more that reaches zero.
        if (tm.total >= 60000 && window.ClasstoolsCore.logro) { window.ClasstoolsCore.logro('guardatiempos'); }
        Object.assign(tm, { marcha: false, acabado: true, resta: 0 });
        tmButtons(); tmPaint();
        playSound('fin');
        const f = $('#fin-tiempo');
        f.hidden = false;
        f.classList.remove('destella'); void f.offsetWidth; f.classList.add('destella');
        $('#fin-vale').focus();
        announce(t('fin_time'));
    };
    const closeTimeUp = (again) => { $('#fin-tiempo').hidden = true; tmReset(); if (again) { tmStart(); } };
    $('#fin-vale').addEventListener('click', () => closeTimeUp(false));
    $('#fin-otra').addEventListener('click', () => closeTimeUp(true));
    $('#tm-marcha').addEventListener('click', tmToggle);
    $('#tm-reiniciar').addEventListener('click', tmReset);
    $('#tm-mas1').addEventListener('click', () => {
        if (tm.marcha) { tm.fin = Math.min(tm.fin + 60000, Date.now() + MAX_TM); tm.total = Math.min(MAX_TM, tm.total + 60000); tm.avisado = false; tmTick(); return; }
        if (tm.resta === tm.total) { tmSet(tm.total + 60000); return; }
        tm.resta = Math.min(MAX_TM, tm.resta + 60000); tm.total = Math.max(tm.total, tm.resta); tmButtons(); tmPaint();
    });
    // The quick times of the mode (five, from the shortest to the longest).
    const tmQuickTimes = () => {
        const r = tmByMode.get().rapidos;
        $$('.chip[data-min]').forEach((c, i) => { c.dataset.min = r[i] || c.dataset.min; c.textContent = t('tm_min_short', c.dataset.min); });
    };
    tmQuickTimes();
    // When the mode changes, the timer takes that mode's settings (if it is not running, the look shows at once).
    document.addEventListener('classtools:mode', () => {
        const v = tmByMode.get();
        look = LOOKS.includes(v.aspecto) ? v.aspecto : 'anillo';
        traveller = v.viajero;
        $$('#tm-aspectos button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === look)));
        tmPaintTravellers();
        countdownOn = v.final !== false; $('#tm-final').checked = countdownOn;
        tmQuickTimes(); tmChips(); paintFavourites(); tmPaint();
    });
    $$('.chip[data-min]').forEach((c) => c.addEventListener('click', () => tmSet(Number(c.dataset.min) * 60000)));
    $$('[data-ajusta]').forEach((b) => repeatWhileHeld(b, () => {
        const step = Number(b.dataset.paso) * (b.dataset.ajusta === 'min' ? 60000 : 1000);
        tmSet(Math.max(0, tm.total + step));
    }));
    const readFields = () => {
        const m = Math.max(0, Math.min(99, Math.floor(Number($('#tm-min').value) || 0)));
        const s = Math.max(0, Math.min(59, Math.floor(Number($('#tm-seg').value) || 0)));
        tmSet((m * 60 + s) * 1000);
    };
    ['#tm-min', '#tm-seg'].forEach((s) => {
        $(s).addEventListener('change', readFields);
        $(s).addEventListener('keydown', (e) => { if (e.key === 'Enter') { readFields(); } });
        $(s).addEventListener('focus', (e) => e.target.select());
    });

    // In work and rest blocks (a pomodoro for the class): a few work blocks with a rest between
    // each two. At the end of each part it sounds, a notice shows (in the rest, a tip: look far away, stretch, drink
    // water) and the next one starts by itself; after the last block, the usual end. Each mode starts with its
    // own (shorter for the young ones) and remembers what the teacher sets.
    const blocksByMode = byMode('tm-bloques', {
        early: { on: false, trabajo: 10, descanso: 3, n: 3 }, primary: { on: false, trabajo: 15, descanso: 5, n: 3 },
        secondary: { on: false, trabajo: 25, descanso: 5, n: 2 }, advanced: { on: false, trabajo: 25, descanso: 5, n: 4 },
    });
    const BLOCK_LIMITS = { trabajo: [5, 60], descanso: [1, 20], n: [2, 8] };
    const blockSettings = () => {
        const c = blocksByMode.get();
        return Object.fromEntries(Object.entries(BLOCK_LIMITS).map(([k, [a, b]]) => [k, Math.max(a, Math.min(b, Math.round(Number(c[k]) || a)))]));
    };
    blockStatus = () => {
        const c = blockSettings();
        return blocks.fase === 'descanso' ? t('bq_rest_now') : t('bq_work_n', { n: blocks.i + 1, of: c.n });
    };
    const paintBlocks = () => {
        const c = blockSettings();
        $$('#tm-tipo button').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.v === 'bloques') === blocks.on)));
        $('#tm-bloques-caja').hidden = !blocks.on;
        $('#tm-rapidos-caja').hidden = blocks.on; $('#tm-medida-caja').hidden = blocks.on;
        $('#bq-trabajo').textContent = t('tm_min_short', c.trabajo);
        $('#bq-descanso').textContent = t('tm_min_short', c.descanso);
        $('#bq-n').textContent = c.n;
        $('#bq-resumen').textContent = t('bq_summary', { n: c.n, work: c.trabajo, rest: c.descanso, total: c.n * c.trabajo + (c.n - 1) * c.descanso });
        $$('[data-bq]').forEach((b) => { const [a, z] = BLOCK_LIMITS[b.dataset.bq], v = c[b.dataset.bq]; b.disabled = Number(b.dataset.paso) < 0 ? v <= a : v >= z; });
    };
    // To the first work block, stopped.
    const blocksFromStart = () => { Object.assign(blocks, { fase: 'trabajo', i: 0 }); tmSet(blockSettings().trabajo * 60000); };
    // A part ends: if another is left, it starts by itself (and returns true).
    const blocksNext = () => {
        const c = blockSettings();
        if (blocks.fase === 'trabajo' && blocks.i >= c.n - 1) { return false; }
        if (blocks.fase === 'trabajo') { blocks.fase = 'descanso'; } else { blocks.fase = 'trabajo'; blocks.i++; }
        const isRest = blocks.fase === 'descanso';
        tmSet((isRest ? c.descanso : c.trabajo) * 60000);
        tmStart();
        playSound(isRest ? 'fin' : 'aviso');
        const notice = isRest ? t('bq_tip_' + (1 + Math.floor(Math.random() * 6))) : t('bq_back', { n: blocks.i + 1, of: c.n });
        const p = $('#tm-poco');
        p.textContent = notice; p.hidden = false;
        clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { p.hidden = true; }, 9000);
        announce(notice);
        return true;
    };
    let timeBeforeBlocks = tm.total;
    const setBlocks = (on) => {
        if (on === blocks.on) { return; }
        blocks.on = on; blocksByMode.set({ on });
        if (on) { timeBeforeBlocks = tm.total; blocksFromStart(); } else { tmSet(timeBeforeBlocks); }
        paintBlocks();
    };
    $('#tm-tipo').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { setBlocks(b.dataset.v === 'bloques'); } });
    $$('[data-bq]').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.bq, c = blockSettings(), [a, z] = BLOCK_LIMITS[k];
        blocksByMode.set({ [k]: Math.max(a, Math.min(z, c[k] + Number(b.dataset.paso) * (k === 'trabajo' ? 5 : 1))) });
        // Stopped and not started, it shows at once; running, it applies to the parts to come.
        if (!tm.marcha && tm.resta === tm.total) { blocksFromStart(); } else { tmPaint(); }
        paintBlocks();
    }));
    document.addEventListener('classtools:mode', () => {
        const on = !!blocksByMode.get().on;
        if (on !== blocks.on) { blocks.on = !on; setBlocks(on); } else { paintBlocks(); }
    });
    if (blocksByMode.get().on) { setBlocks(true); } else { paintBlocks(); }

    // ===================================================================================================
    // 2. Stopwatch
    // ===================================================================================================
    const cr = { acum: 0, desde: 0, marcha: false, reloj: 0, vueltas: [] };
    const crTime = () => cr.acum + (cr.marcha ? Date.now() - cr.desde : 0);
    const formatStopwatch = (ms) => { const s = Math.floor(ms / 1000); return { p: formatSeconds(s), d: s >= 3600 ? '' : ',' + (Math.floor(ms / 100) % 10) }; };
    const crPaint = () => {
        const t = crTime(), { p, d } = formatStopwatch(t);
        $('#cr-principal').textContent = p; $('#cr-decima').textContent = d;
        $('#cr-cifras').classList.toggle('horas', t >= 3600000);
        $('#cr-cifras').classList.toggle('corre', cr.marcha);
        badges();
    };
    const crButtons = () => {
        const b = $('#cr-marcha');
        if (cr.marcha) { relabel(b, t('gen_pause'), 'pausa'); b.className = 'boton grande amarillo'; }
        else { relabel(b, cr.acum ? t('gen_resume') : t('gen_start'), 'empezar'); b.className = 'boton grande verde'; }
        $('#cr-vuelta').disabled = !cr.marcha;
    };
    const crPaintLaps = () => {
        const hasLaps = cr.vueltas.length > 0;
        $('#cr-vueltas-caja').hidden = !hasLaps;
        $('#h-cronometro').classList.toggle('con-vueltas', hasLaps);
        $('#cr-vueltas').innerHTML = cr.vueltas.map((v, i) => ({ v, i })).reverse().map(({ v, i }) => {
            const p = formatStopwatch(v.parcial), a = formatStopwatch(v.total);
            return `<li><span class="n">${t('cr_lap_n', i + 1)}</span><span class="parcial">${p.p}${p.d}</span><span class="acum">${t('cr_lap_total', a.p + a.d)}</span></li>`;
        }).join('');
    };
    const crToggle = () => {
        if (cr.marcha) { cr.acum += Date.now() - cr.desde; cr.marcha = false; clearInterval(cr.reloj); }
        else { cr.desde = Date.now(); cr.marcha = true; cr.reloj = setInterval(crPaint, 100); }
        crButtons(); crPaint();
    };
    $('#cr-marcha').addEventListener('click', crToggle);
    $('#cr-vuelta').addEventListener('click', () => {
        const t = crTime(), previousTotal = cr.vueltas.length ? cr.vueltas[cr.vueltas.length - 1].total : 0;
        cr.vueltas.push({ total: t, parcial: t - previousTotal });
        crPaintLaps();
    });
    $('#cr-reiniciar').addEventListener('click', () => {
        clearInterval(cr.reloj); Object.assign(cr, { acum: 0, marcha: false, vueltas: [] });
        crButtons(); crPaint(); crPaintLaps();
    });

    // The tabs of the timer and the stopwatch show they are still running while another tool is in use.
    const badges = () => {
        const timerBadge = $('#ins-temporizador'), stopwatchBadge = $('#ins-cronometro');
        timerBadge.hidden = !(tm.marcha && !visibleTools().includes('temporizador'));
        if (!timerBadge.hidden) { timerBadge.textContent = formatSeconds(Math.ceil(tm.resta / 1000)); }
        stopwatchBadge.hidden = !(cr.marcha && !visibleTools().includes('cronometro'));
        if (!stopwatchBadge.hidden) { stopwatchBadge.textContent = formatSeconds(Math.floor(crTime() / 1000)); }
    };

    // ===================================================================================================
    // Class lists (used by «Whose turn?» and «Make groups»)
    // ===================================================================================================
    let ownLists = load('listas', []);
    if (!Array.isArray(ownLists)) { ownLists = []; }
    ownLists = ownLists.filter((l) => l && typeof l.id === 'string' && typeof l.nombre === 'string' && Array.isArray(l.alumnos))
        .map((l) => ({ id: l.id, nombre: l.nombre, alumnos: l.alumnos.filter((n) => typeof n === 'string' && n) }));
    // Lists that come from Moodle (the Class tools plugin): the students of the course and of each group, with their
    // photo. They are not kept in the browser: they are renewed each time the board opens from the course.
    const MOODLE = window.CLASSTOOLS && Array.isArray(window.CLASSTOOLS.lists) ? window.CLASSTOOLS : null;
    const courseLists = MOODLE ? MOODLE.lists.map((l) => {
        const seen = {}, photos = {}, ids = {}, timesPicked = {};
        const students = (l.students || []).filter((a) => a && a.n).map((a) => {
            seen[a.n] = (seen[a.n] || 0) + 1;
            const n = seen[a.n] > 1 ? `${a.n} (${seen[a.n]})` : a.n;
            if (a.f) { photos[n] = a.f; }
            if (a.i) { ids[n] = a.i; timesPicked[n] = a.v || 0; }
            return n;
        });
        return { id: 'aula-' + l.id, nombre: l.name, alumnos: students, fotos: photos, ids, veces: timesPicked, aula: true };
    }) : [];
    // The teacher plays too (if they turn it on): whoever has the board open joins the lists of the course, with
    // their photo. Their turns are not saved in Moodle, and in fair picking they count as one more, without jumping
    // the queue.
    const ME = MOODLE && MOODLE.me && MOODLE.me.n ? MOODLE.me : null;
    const meKey = 'conmigo-' + (MOODLE ? MOODLE.courseid : 0);
    let withMe = !!ME && load(meKey, false) === true;
    const putMe = () => {
        courseLists.forEach((l) => {
            if (l.yo) { l.alumnos = l.alumnos.filter((n) => n !== l.yo); delete l.fotos[l.yo]; delete l.veces[l.yo]; l.yo = null; }
            if (!withMe || !ME) { return; }
            const n = l.alumnos.includes(ME.n) ? t('q_me_name', ME.n) : ME.n;
            const vs = Object.values(l.veces);
            l.yo = n; l.alumnos = l.alumnos.concat(n); l.veces[n] = vs.length ? Math.min(...vs) : 0;
            if (ME.f) { l.fotos[n] = ME.f; }
        });
    };
    putMe();
    // If the Moodle session expires (a board on all morning), what is sent does not arrive: the board says so
    // instead of losing it silently, and what is pending stays on this computer.
    const NO_SESSION_ERRORS = ['requireloginerror', 'invalidsesskey', 'servicerequireslogin', 'sitemaintenance'];
    const isNoSession = (j) => !!(j && j.errorcode && NO_SESSION_ERRORS.includes(j.errorcode));
    const warnSession = () => {
        if (document.getElementById('aviso-sesion')) { return; }
        const a = document.createElement('div');
        a.className = 'aviso-sesion'; a.id = 'aviso-sesion'; a.setAttribute('role', 'alert');
        a.innerHTML = `<span>${icono('info')}</span><p><strong>${t('bar_session_title')}</strong> ${t('bar_session_text')}</p>`
            + `<button type="button" class="boton">${t('bar_session_login')}</button>`;
        a.querySelector('button').addEventListener('click', () => location.reload());
        document.body.append(a);
    };
    // What goes to Moodle: the turn of each pick, and the teams the teacher wants to save as course groups.
    const toMoodle = (url, fields) => fetch(url, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(Object.assign({ sesskey: MOODLE.sesskey, courseid: MOODLE.courseid }, fields)),
    }).then((r) => r.json()).then((j) => {
        if (isNoSession(j)) { warnSession(); }
        if (!j || !j.ok) { throw new Error((j && (j.error || j.message)) || 'error'); }
        return j;
    });
    // One more turn for that student in every list they are in (the whole course and their class).
    const addPick = (id) => courseLists.forEach((x) => { Object.keys(x.ids).forEach((n) => { if (x.ids[n] === id) { x.veces[n] = (x.veces[n] || 0) + 1; } }); });
    const allLists = () => courseLists.concat(ownLists);
    let activeListId = load('lista-activa', null);
    if (!allLists().some((l) => l.id === activeListId)) { activeListId = allLists().length ? allLists()[0].id : null; }
    // Opened from a course, it starts with the list of that course.
    if (courseLists.length && !courseLists.some((l) => l.id === activeListId)) { activeListId = courseLists[0].id; }
    let pickedOut = load('salidos', {});
    if (!pickedOut || typeof pickedOut !== 'object') { pickedOut = {}; }
    const saveLists = () => {
        save('listas', ownLists); save('lista-activa', activeListId); save('salidos', pickedOut);
        document.dispatchEvent(new CustomEvent('classtools:lists'));   // the other tools (Chance…) refresh their lists
    };
    // Who is missing today: noted per list and only for today (tomorrow everyone is back).
    const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    let absent = load('faltan', null);
    if (!absent || absent.dia !== today() || !absent.listas || typeof absent.listas !== 'object') { absent = { dia: today(), listas: {} }; }
    const absentFrom = (l) => {
        if (absent.dia !== today()) { absent = { dia: today(), listas: {} }; }
        return (absent.listas[l.id] || []).filter((n) => l.alumnos.includes(n));
    };
    const presentIn = (l) => { const f = absentFrom(l); return l.alumnos.filter((n) => !f.includes(n)); };
    // Faces: the photo from Moodle or, without one, the initials. Lists pasted by hand have no faces.
    const initialsOf = (n) => n.replace(/\s*\(\d+\)$/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
    const faceHtml = (l, n, cssClass) => {
        if (!l || !l.fotos) { return ''; }
        const f = l.fotos[n];
        return f ? `<img class="${cssClass}" src="${escapeHtml(f)}" alt="">`
            : `<span class="${cssClass} iniciales" aria-hidden="true">${escapeHtml(initialsOf(n))}</span>`;
    };
    const preloadPhotos = (l) => {
        if (!l || !l.fotos || l.precargada) { return; }
        l.precargada = true;
        Object.values(l.fotos).forEach((f) => { const i = new Image(); i.src = f; });
    };
    // Cleans what was pasted: one person per line, no numbers in front, no tabs and no repeats.
    const cleanNames = (text) => {
        const seen = {};
        return String(text || '').split(/\r?\n/)
            .map((l) => l.replace(/\t+/g, ' ').replace(/^\s*\d+\s*[.)\-:]\s*|^\s*\d+\s+/, '').replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .map((n) => { seen[n] = (seen[n] || 0) + 1; return seen[n] > 1 ? `${n} (${seen[n]})` : n; });
    };
    const paintSelects = () => {
        const option = (l) => `<option value="${escapeHtml(l.id)}">${escapeHtml(l.nombre)} (${l.alumnos.length})</option>`;
        const listOptions = !courseLists.length ? ownLists.map(option).join('')
            : `<optgroup label="${escapeHtml(MOODLE.course || t('q_this_course'))}">${courseLists.map(option).join('')}</optgroup>`
              + (ownLists.length ? `<optgroup label="${escapeHtml(t('q_your_lists'))}">${ownLists.map(option).join('')}</optgroup>` : '');
        const q = $('#q-lista');
        q.innerHTML = listOptions || `<option value="">${t('q_no_lists')}</option>`;
        q.disabled = !allLists().length;
        q.value = activeListId || '';
        const g = $('#g-lista'), previousValue = g.value;
        g.innerHTML = listOptions + `<option value="__pegar">${t('g_paste_now')}</option>`;
        g.value = allLists().some((l) => l.id === previousValue) || previousValue === '__pegar' ? previousValue : (activeListId || '__pegar');
        gListChanged();
    };

    // Editor (a dialog) to create, change or delete a list.
    const editor = $('#editor');
    let editingId = null, deleteTimer = 0;
    const editorCount = () => {
        const n = cleanNames($('#ed-alumnos').value).length;
        $('#ed-cuenta').textContent = n ? `(${n})` : '';
    };
    const openEditor = (id, text) => {
        const l = ownLists.find((x) => x.id === id);
        editingId = l ? l.id : null;
        $('#ed-titulo').textContent = l ? t('ed_edit_list') : t('ed_new_list');
        $('#ed-nombre').value = l ? l.nombre : '';
        $('#ed-alumnos').value = l ? l.alumnos.join('\n') : (text || '');
        $('#ed-borrar').hidden = !l;
        $('#ed-borrar').classList.remove('confirma'); relabel($('#ed-borrar'), t('ed_delete'));
        const note = $('#ed-nota');
        note.classList.remove('error');
        note.textContent = storageWorks ? t('ed_note_local') : t('ed_note_nostore');
        editorCount();
        if (editor.showModal) { editor.showModal(); } else { editor.setAttribute('open', ''); }
        $('#ed-nombre').focus();
    };
    const closeEditor = () => { if (editor.close) { editor.close(); } else { editor.removeAttribute('open'); } };
    $('#ed-alumnos').addEventListener('input', editorCount);
    $('#ed-cancelar').addEventListener('click', closeEditor);
    $('#ed-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const students = cleanNames($('#ed-alumnos').value);
        if (!students.length) {
            const note = $('#ed-nota'); note.textContent = t('ed_need_one'); note.classList.add('error');
            $('#ed-alumnos').focus(); return;
        }
        const listName = $('#ed-nombre').value.trim() || t('ed_default_name', ownLists.length + 1);
        let l = ownLists.find((x) => x.id === editingId);
        if (l) {
            Object.assign(l, { nombre: listName, alumnos: students });
            if (pickedOut[l.id]) { pickedOut[l.id] = pickedOut[l.id].filter((n) => students.includes(n)); }
        } else {
            l = { id: 'l' + Date.now().toString(36) + randomInt(1000), nombre: listName, alumnos: students };
            ownLists.push(l);
        }
        activeListId = l.id;
        saveLists();
        qLast = null;
        paintSelects(); pickerPaint();
        if (current === 'grupos') { $('#g-lista').value = l.id; gListChanged(); }
        closeEditor();
        announce(t('ed_saved', { name: listName, n: students.length }));
    });
    $('#ed-borrar').addEventListener('click', () => {
        const b = $('#ed-borrar');
        if (!b.classList.contains('confirma')) {
            b.classList.add('confirma'); relabel(b, t('ed_confirm_delete'));
            clearTimeout(deleteTimer);
            deleteTimer = setTimeout(() => { b.classList.remove('confirma'); relabel(b, t('ed_delete')); }, 4000);
            return;
        }
        ownLists = ownLists.filter((x) => x.id !== editingId);
        delete pickedOut[editingId];
        activeListId = allLists().length ? allLists()[0].id : null;
        qLast = null;
        saveLists(); paintSelects(); pickerPaint(); closeEditor();
        announce(t('ed_deleted'));
    });

    // ===================================================================================================
    // 3. Whose turn?
    // ===================================================================================================
    const qName = $('#q-nombre'), qBox = $('#q-caja'), qPhoto = $('#q-foto');
    $('#q-salidos').dataset.vacio = t('q_none_yet');   // what the list says while nobody has been picked
    let qNoRepeat = load('sin-repetir', true) !== false, qShuffling = false, qLast = null, qTimer = 0;
    // Scratch to reveal: the chosen name comes out covered (and blurred in the column of those already picked, until
    // uncovered).
    let qScratch = load('quien-rasca', false) === true, qCovered = null;
    $('#q-sinrepetir').checked = qNoRepeat;
    let qFair = load('justo', true) !== false;
    $('#q-justo').checked = qFair;
    const withPicks = (l) => !!(l && l.aula && MOODLE.pickurl);
    const pickerList = () => allLists().find((l) => l.id === activeListId) || null;
    // The face above the name (only in the lists from Moodle).
    const paintFace = (l, n) => {
        const hasFace = !!(l && l.fotos && n);
        qBox.classList.toggle('con-foto', hasFace);
        qPhoto.hidden = !hasFace;
        qPhoto.innerHTML = hasFace ? faceHtml(l, n, 'cara-grande') : '';
    };
    // With a face, the name only has the space left below it.
    const nameHeight = () => (qBox.classList.contains('con-foto') ? Math.max(40, qBox.clientHeight - qPhoto.offsetHeight - 12) : undefined);
    // Finds the largest font size at which the text fits in its box.
    const fitText = (el, box, text, height) => {
        const w = box.clientWidth, h = (height === undefined ? box.clientHeight : height) * 0.94;
        if (!w || !h) { return; }
        const savedText = el.textContent;
        if (text !== undefined) { el.textContent = text; }
        let lo = 14, hi = Math.max(16, Math.min(h * 0.82, w * 0.34));
        for (let i = 0; i < 9; i++) {
            const mid = (lo + hi) / 2;
            el.style.fontSize = mid + 'px';
            // It fits if no word sticks out at the sides and the whole is not taller than the height.
            if (el.scrollWidth <= el.clientWidth + 1 && el.offsetHeight <= h) { lo = mid; } else { hi = mid; }
        }
        el.style.fontSize = Math.floor(lo) + 'px';
        if (text !== undefined) { el.textContent = savedText; }
    };
    const qFit = () => {
        if (qName.classList.contains('aviso-vacio')) { qName.style.fontSize = ''; return; }
        if (!qShuffling) { fitText(qName, qBox, undefined, nameHeight()); }
    };
    const pickerPaint = () => {
        const l = pickerList();
        $('#q-editar').disabled = !l;
        $('#q-editar').hidden = !!(l && l.aula);   // the lists from Moodle renew themselves: they are not edited here
        $('#q-faltan').hidden = !l;
        $('#q-justo-caja').hidden = !withPicks(l);
        $('#q-participa').hidden = !withPicks(l);
        $('#q-elegir').hidden = !l;
        $('#q-crear').hidden = !!l;
        const withColumn = !!l && qNoRepeat;
        $('#q-salidos-caja').hidden = !withColumn;
        $('.quien-cuerpo').classList.toggle('sin-columna', !withColumn);
        if (!l) {
            paintFace(null);
            qName.className = 'nombre-grande aviso-vacio';
            qName.textContent = t('q_empty');
            $('#q-pie').textContent = t('q_empty_note');
            qFit(); return;
        }
        preloadPhotos(l);
        const presentNow = presentIn(l), absentCount = l.alumnos.length - presentNow.length;
        relabel($('#q-faltan'), absentCount ? t('q_absent_n', absentCount) : t('q_absent'));
        const s = (pickedOut[l.id] || []).filter((n) => presentNow.includes(n));
        $('#q-cuenta').textContent = t('q_count', { a: s.length, b: presentNow.length });
        $('#q-salidos').innerHTML = s.slice().reverse().map((n) => `<li${n === qCovered ? ' class="ct-tapado"' : ''}>${faceHtml(l, n, 'cara-mini')}<span>${escapeHtml(n)}</span></li>`).join('');
        $('#q-reset').disabled = !s.length || qShuffling;
        $('#q-lista').disabled = qShuffling;
        const remaining = qNoRepeat ? presentNow.length - s.length : presentNow.length;
        if (!qShuffling) {
            if (qLast) { qName.className = 'nombre-grande'; qName.textContent = qLast; }
            else { qName.className = 'nombre-grande espera'; qName.textContent = '?'; }
            paintFace(l, qLast);
            const countText = absentCount ? t('q_students_absent', { n: presentNow.length, m: absentCount }) : t('q_students', presentNow.length);
            $('#q-pie').textContent = !l.alumnos.length ? t('q_no_students')
                : !presentNow.length ? t('q_all_absent')
                : !remaining ? t('q_all_out')
                : qLast ? (qNoRepeat ? t('q_left', remaining) : countText)
                : t('q_ready', { count: countText, list: l.nombre });
        }
        $('#q-elegir').disabled = qShuffling || !remaining;
        qFit();
    };
    const pickStudent = () => {
        const l = pickerList();
        if (!l || qShuffling) { return; }
        const cover = qBox.querySelector('.ct-rasca');
        if (cover) { cover.remove(); qCovered = null; }
        const s = pickedOut[l.id] || [], presentNow = presentIn(l);
        const pool = qNoRepeat ? presentNow.filter((n) => !s.includes(n)) : presentNow.slice();
        if (!pool.length) { pickerPaint(); return; }
        // Fair picking (lists from Moodle): someone comes out among those picked fewest times these weeks.
        const fair = withPicks(l) && qFair;
        const fewest = fair ? Math.min(...pool.map((n) => l.veces[n] || 0)) : 0;
        const candidates = fair ? pool.filter((n) => (l.veces[n] || 0) === fewest) : pool;
        const chosen = candidates[randomInt(candidates.length)];
        const finishPick = () => {
            qShuffling = false; qLast = chosen;
            if (qNoRepeat) { const already = pickedOut[l.id] || []; pickedOut[l.id] = already.includes(chosen) ? already : already.concat(chosen); save('salidos', pickedOut); }
            if (withPicks(l) && l.ids[chosen]) {
                addPick(l.ids[chosen]);
                // The teacher's sticker: a few turns in the same class on the same day are a real use.
                const C = window.ClasstoolsCore, dayKey = 'turnos-' + l.id + '-' + new Date().toDateString();
                const picksToday = (Number(load(dayKey, 0)) || 0) + 1;
                save(dayKey, picksToday);
                if (C.logro && C.logros && picksToday >= C.logros.thr.picks) { C.logro('sacanombres'); }
                toMoodle(MOODLE.pickurl, { userid: l.ids[chosen] }).catch(() => { /* offline: that turn does not count, the pick goes on */ });
            } else if (l.yo === chosen) { l.veces[chosen] = (l.veces[chosen] || 0) + 1; }   // the teacher: only here
            const reveal = () => {
                qCovered = null;
                $$('#q-salidos .ct-tapado').forEach((li) => li.classList.remove('ct-tapado'));
                qName.className = 'nombre-grande elegido';
                playSound('elegido');
                announce(t('q_turn', chosen));
            };
            if (qScratch && window.ClasstoolsScratch) {
                qCovered = chosen;
                pickerPaint();
                window.ClasstoolsScratch.cover(qBox, { onReveal: reveal });
                playSound('tic');
                return;
            }
            pickerPaint();
            reveal();
        };
        if (reducedMotion() || pool.length < 2) { finishPick(); return; }
        // Shuffle: the names go by slower and slower (about two seconds) until they stop at the chosen one.
        qShuffling = true; $('#q-elegir').disabled = true;
        qName.className = 'nombre-grande barajando';
        paintFace(l, pool[0]);
        const longest = pool.reduce((a, b) => (b.length > a.length ? b : a), '');
        fitText(qName, qBox, longest, nameHeight());
        $('#q-pie').textContent = t('q_shuffling');
        let delay = 45, previousName = null;
        const spin = () => {
            let n;
            do { n = pool[randomInt(pool.length)]; } while (n === previousName);
            previousName = n; qName.textContent = n; paintFace(l, n); playSound('tic');
            delay *= 1.13;
            qTimer = setTimeout(delay > 300 ? finishPick : spin, delay > 300 ? 280 : delay);
        };
        spin();
    };
    $('#q-elegir').addEventListener('click', pickStudent);
    $('#q-crear').addEventListener('click', () => openEditor(null));
    $('#q-nueva').addEventListener('click', () => openEditor(null));
    $('#q-editar').addEventListener('click', () => openEditor(activeListId));
    $('#q-lista').addEventListener('change', (e) => { activeListId = e.target.value || null; qLast = null; save('lista-activa', activeListId); pickerPaint(); });
    $('#q-sinrepetir').addEventListener('change', (e) => { qNoRepeat = e.target.checked; save('sin-repetir', qNoRepeat); pickerPaint(); });
    $('#q-rasca').checked = qScratch;
    $('#q-rasca').addEventListener('change', (e) => { qScratch = e.target.checked; save('quien-rasca', qScratch); });
    $('#q-justo').addEventListener('change', (e) => { qFair = e.target.checked; save('justo', qFair); });
    // «The teacher plays too», in «Whose turn?» and in «Groups» (it is the same switch).
    ['#q-yo', '#g-yo'].forEach((sel) => {
        $(sel + '-caja').hidden = !ME;
        $(sel).checked = withMe;
        $(sel).addEventListener('change', (e) => {
            withMe = e.target.checked; save(meKey, withMe);
            $('#q-yo').checked = withMe; $('#g-yo').checked = withMe;
            putMe(); paintSelects(); pickerPaint();
            document.dispatchEvent(new CustomEvent('classtools:lists'));
        });
    });
    // Participation: how many times each one has been picked in the course (with any teacher), fewest first.
    const dParticipation = $('#participa');
    $('#q-participa').addEventListener('click', () => {
        const l = pickerList();
        if (!withPicks(l)) { return; }
        const rows = l.alumnos.slice().sort((a, b) => (l.veces[a] || 0) - (l.veces[b] || 0) || a.localeCompare(b, 'es'));
        const max = Math.max(1, ...rows.map((n) => l.veces[n] || 0));
        $('#p-titulo').textContent = `${t('q_participation')} · ${l.nombre}`;
        $('#p-nota').textContent = t('q_participation_note', MOODLE.days);
        $('#p-lista').innerHTML = rows.map((n) => {
            const v = l.veces[n] || 0;
            return `<li>${faceHtml(l, n, 'cara-mini')}<span class="p-nombre">${escapeHtml(n)}</span>`
                + `<span class="p-barra" aria-hidden="true"><span style="width:${Math.round(v / max * 100)}%"></span></span><span class="p-veces">${v}</span></li>`;
        }).join('');
        if (dParticipation.showModal) { dParticipation.showModal(); } else { dParticipation.setAttribute('open', ''); }
    });
    $('#q-reset').addEventListener('click', () => { const l = pickerList(); if (l) { pickedOut[l.id] = []; save('salidos', pickedOut); } qLast = null; pickerPaint(); });
    let qFrame = 0;
    if (window.ResizeObserver) { new ResizeObserver(() => { cancelAnimationFrame(qFrame); qFrame = requestAnimationFrame(qFit); }).observe(qBox); }
    TOOLS.quien = { entra: () => requestAnimationFrame(qFit), sale: () => { if (qShuffling) { clearTimeout(qTimer); qShuffling = false; pickerPaint(); } } };

    // Who is missing today? (a dialog): tap whoever has not come, and they are left out of picks and groups.
    const dAbsent = $('#faltan');
    let absentList = null;
    const absentTitle = () => { const n = absentFrom(absentList).length; $('#f-titulo').textContent = n ? t('q_absent_n', n) : t('q_absent'); };
    const openAbsent = (l) => {
        if (!l) { return; }
        absentList = l;
        const f = absentFrom(l);
        $('#f-rejilla').innerHTML = l.alumnos.map((n) => `<button type="button" class="alumno-f${l.fotos ? '' : ' sin-cara'}" aria-pressed="${f.includes(n)}" data-n="${escapeHtml(n)}">`
            + `${faceHtml(l, n, 'cara-media')}<span>${escapeHtml(n)}</span></button>`).join('');
        absentTitle();
        if (dAbsent.showModal) { dAbsent.showModal(); } else { dAbsent.setAttribute('open', ''); }
    };
    $('#f-rejilla').addEventListener('click', (e) => {
        const b = e.target.closest('.alumno-f');
        if (!b || !absentList) { return; }
        const n = b.dataset.n, f = absentFrom(absentList), isAbsent = !f.includes(n);
        absent.listas[absentList.id] = isAbsent ? f.concat(n) : f.filter((x) => x !== n);
        save('faltan', absent);
        b.setAttribute('aria-pressed', String(isAbsent));
        absentTitle();
    });
    $('#f-todos').addEventListener('click', () => {
        if (!absentList) { return; }
        absent.listas[absentList.id] = [];
        save('faltan', absent);
        $$('#f-rejilla .alumno-f').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        absentTitle();
    });
    dAbsent.addEventListener('close', () => {
        const n = absentFrom(absentList).length;
        pickerPaint(); gListChanged();
        announce(n ? t('q_absent_n_sr', n) : t('q_all_here'));
    });
    $('#q-faltan').addEventListener('click', () => openAbsent(pickerList()));

    // ===================================================================================================
    // 4. Make groups
    // ===================================================================================================
    const GROUP_COLOURS = [['#164281'], ['#ce1423'], ['#067e36'], ['#5b2fb8'], ['#fbbe17', true], ['#0e7c86'], ['#c2410c'], ['#0f2f5e']];
    let gMode = load('grupos-modo', 'num') === 'tam' ? 'tam' : 'num';
    let gN = Math.max(2, Math.min(15, Number(load('grupos-n', 4)) || 4));
    const gGrid = $('#g-rejilla');
    const gList = () => allLists().find((x) => x.id === $('#g-lista').value) || null;
    const gNames = () => {
        if ($('#g-lista').value === '__pegar') { return cleanNames($('#g-pegados').value); }
        const l = gList();
        return l ? presentIn(l) : [];
    };
    const gEmpty = (text) => { gGrid.classList.add('vacia'); gGrid.innerHTML = `<div class="vacio">${icono('grupos')}<p>${text}</p></div>`; };
    const gPaintMode = () => {
        $$('#g-modo button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.modo === gMode)));
        $('#g-n').textContent = gN;
        $('#g-n').setAttribute('aria-label', gMode === 'num' ? t('g_n_groups', gN) : t('g_n_size', gN));
    };
    const gReady = () => relabel($('#g-hacer'), t('g_make'), 'mezclar');
    let gToSave = null, gMade = null;   // gMade: the last groups made, with their list (the Scoreboard uses them)
    // Deal with suspense: instead of all coming out at once, a card shuffles the names, stops at one, says its
    // group and the name flies to its place, here and there, until the last one (the first and the last ones, slower).
    let gSuspense = load('grupos-emocion', false) === true;
    let gScratch = load('grupos-rasca', false) === true;   // scratch to reveal: each group, covered until scratched
    let gDealing = null;   // the deal in progress: { acaba } (finish) places everyone at once
    // A role for each one in their group, from a ready set of roles (group tasks, by subject, those of
    // reciprocal teaching for reading) or the teacher's own. Roles name the task, not the person. The share-out is
    // fair: each one first gets the role they have had least with that list (and, if even, whoever has had fewest
    // roles); the count is kept in the browser.
    let gWithRoles = load('grupos-roles', false) === true;
    const ROLE_SETS = {
        tasks: ['rl_spokesperson', 'rl_notes', 'rl_materials', 'rl_time'],
        music: ['rl_flute', 'rl_glockenspiel', 'rl_tambourine', 'rl_dance'],
        science: ['rl_measure', 'rl_record', 'rl_build', 'rl_photo'],
        reading: ['rl_predict', 'rl_question', 'rl_clarify', 'rl_summarise'],
    };
    const gOwnRoles = () => { const r = load('roles-nombres', null); return Array.isArray(r) && r.length ? r : null; };
    // Whoever had already written their roles keeps them.
    let gRoleSet = load('roles-juego', gOwnRoles() ? 'own' : 'tasks');
    if (gRoleSet !== 'own' && !ROLE_SETS[gRoleSet]) { gRoleSet = 'tasks'; }
    const BASE_ROLES = () => ROLE_SETS.tasks.map((k) => t(k));
    const ROLE_COLOURS = ['#164281', '#ce1423', '#067e36', '#5b2fb8', '#c2410c', '#0e7c86'];
    const gRoleNames = () => (gRoleSet === 'own' ? gOwnRoles() || BASE_ROLES() : ROLE_SETS[gRoleSet].map((k) => t(k)));
    const gNameOf = (li) => { const x = li.querySelector(':scope > span:not(.rol):not(.iniciales)'); return x ? x.textContent : ''; };
    const gGiveRoles = () => {
        $$('.grupo li .rol', gGrid).forEach((x) => x.remove());
        $('#g-rotar').hidden = !(gWithRoles && gMade);
        if (!gWithRoles || !gMade) { gFit(); return; }
        const roles = gRoleNames(), listKey = gMade.lista ? gMade.lista.id : '__pegar';
        const hist = load('roles-historial', {}), h = hist[listKey] || {};
        const timesHad = (n, r) => ((h[n] || {})[r] || 0);
        const total = (n) => Object.values(h[n] || {}).reduce((a, b) => a + b, 0);
        // What giving role r to n costs: the times they already had it (squared, to spread them) and a little for the
        // roles they have had in all. It starts at random and improves by swapping pairs until it cannot any more.
        const cost = (n, r) => 10 * timesHad(n, r) * timesHad(n, r) + total(n);
        $$('.grupo', gGrid).forEach((art, gi) => {
            const items = $$('li', art), people = shuffle((gMade.grupos[gi] || []).slice());
            const rs = shuffle(roles.slice()).slice(0, people.length);
            const holder = rs.map((_, i) => people[i]), leftOver = people.slice(rs.length);
            for (let improved = true, rounds = 0; improved && rounds < 50; rounds++) {
                improved = false;
                for (let i = 0; i < rs.length; i++) {
                    for (let j = i + 1; j < rs.length; j++) {
                        if (cost(holder[j], rs[i]) + cost(holder[i], rs[j]) < cost(holder[i], rs[i]) + cost(holder[j], rs[j])) {
                            [holder[i], holder[j]] = [holder[j], holder[i]]; improved = true;
                        }
                    }
                    for (let k = 0; k < leftOver.length; k++) {
                        if (cost(leftOver[k], rs[i]) < cost(holder[i], rs[i])) { [holder[i], leftOver[k]] = [leftOver[k], holder[i]]; improved = true; }
                    }
                }
            }
            rs.forEach((r, i) => {
                const n = holder[i];
                h[n] = h[n] || {}; h[n][r] = timesHad(n, r) + 1;
                const li = items.find((x) => gNameOf(x) === n);
                if (li) {
                    const b = document.createElement('span');
                    b.className = 'rol'; b.textContent = r; b.style.setProperty('--rc', ROLE_COLOURS[roles.indexOf(r) % ROLE_COLOURS.length]);
                    li.append(b);
                }
            });
        });
        hist[listKey] = h; save('roles-historial', hist);
        gFit();
    };
    function gListChanged() {
        const pasting = $('#g-lista').value === '__pegar', l = gList();
        $('#g-moodle').hidden = true; gToSave = null;
        $('#g-pegados').hidden = !pasting;
        $('#g-guardar').hidden = !pasting;
        $('#g-faltan').hidden = !l;
        if (l) { preloadPhotos(l); const absentCount = l.alumnos.length - presentIn(l).length; relabel($('#g-faltan'), absentCount ? t('q_absent_n', absentCount) : t('q_absent')); }
        $('#g-guardar').disabled = !cleanNames($('#g-pegados').value).length;
        gReady();
    }
    const gMake = () => {
        if (gDealing) { gDealing.acaba(); return; }
        const namesToSplit = gNames();
        if (namesToSplit.length < 2) {
            $('#g-resumen').textContent = t('g_need_two');
            gEmpty($('#g-lista').value === '__pegar' ? t('g_paste_hint') : t('g_list_empty'));
            return;
        }
        const b = shuffle(namesToSplit.slice()), lg = $('#g-lista').value === '__pegar' ? null : gList();
        const k = gMode === 'num' ? Math.min(gN, b.length) : Math.max(1, Math.round(b.length / gN));
        const groups = Array.from({ length: k }, () => []);
        b.forEach((n, i) => groups[i % k].push(n));
        const withScratch = gScratch && b.length > 1 && !!window.ClasstoolsScratch;
        const withSuspense = gSuspense && !withScratch && b.length > 1;
        gGrid.classList.remove('vacia');
        // With suspense, each name already takes its place, unseen: so the font size does not change as they come out.
        gGrid.innerHTML = groups.map((g, i) => {
            const [c, light] = GROUP_COLOURS[i % GROUP_COLOURS.length];
            const delayMs = reducedMotion() ? 0 : i * 60;
            return `<article class="grupo${light ? ' claro' : ''}" style="--c:${c}; animation-delay:${delayMs}ms" data-gi="${i}">
                <h3 title="${escapeHtml(t('g_drag_hint'))}"><span class="g-titulo">${t('g_group_n', i + 1)}</span> <small>${withSuspense ? 0 : g.length}</small></h3>
                <ul>${g.map((n, ni) => `<li${withSuspense ? ` class="por-salir" data-n="${ni}"` : ''}>${faceHtml(lg, n, 'cara-mini')}<span>${escapeHtml(n)}</span></li>`).join('')}</ul></article>`;
        }).join('');
        $('#g-resumen').textContent = '';
        $('#g-moodle').hidden = true; $('#g-rotar').hidden = true;
        gFit();
        const whenDone = () => {
            const sizes = groups.map((g) => g.length), mn = Math.min(...sizes), mx = Math.max(...sizes);
            $('#g-resumen').textContent = t(k === 1 ? 'g_summary_one' : 'g_summary_many', { n: b.length, k, size: mn === mx ? mn : t('g_sizes', { a: mn, b: mx }) });
            relabel($('#g-hacer'), t('gen_again'), 'otra');
            gMade = { lista: lg, grupos: groups };
            // The teacher's sticker: groups of a list of the course that stay two minutes on screen (or are saved).
            const C = window.ClasstoolsCore, madeNow = gMade;
            if (C.logro && C.logros && lg && lg.aula && b.length >= C.logros.thr.students) {
                setTimeout(() => { if (gMade === madeNow) { C.logro('repartequipos'); } }, 120000);
            }
            // Saving them as course groups: only when asked (by default nothing is created).
            gToSave = lg && lg.aula && MOODLE.groupsurl ? { lista: lg, grupos: groups } : null;
            $('#g-moodle').hidden = !gToSave; $('#g-moodle').disabled = false;
            $('#g-borrar').hidden = false;
            relabel($('#g-moodle'), t('g_save_course'), 'guardar');
            gGiveRoles();
            playSound(withSuspense ? 'elegido' : 'dado');
            announce(t('g_made', k));
        };
        if (withSuspense) { gDeal(groups, lg, whenDone); } else { whenDone(); }
        if (withScratch) { $$('.grupo ul', gGrid).forEach((ul) => window.ClasstoolsScratch.cover(ul, { onReveal: () => playSound('card') })); }
    };
    const gDeal = (groups, lg, whenDone) => {
        // Shuffled again, so they come out here and there and not group by group.
        const order = shuffle(groups.flatMap((g, gi) => g.map((n, ni) => ({ n, gi, ni }))));
        const arts = $$('.grupo', gGrid), filled = groups.map(() => 0);
        // Each group fills from top to bottom: the one who comes out takes the first free slot (their name was already
        // in the group, hidden in another slot, and they swap).
        const ownSlot = (x) => arts[x.gi].querySelector(`li[data-n="${x.ni}"]`);
        const nextSlot = (x) => $$('li', arts[x.gi])[filled[x.gi]];
        // Meanwhile the card takes the left panel (the groups stay in sight), with the button below.
        const card = document.createElement('div');
        card.className = 'g-bombo-carta'; card.setAttribute('aria-hidden', 'true');
        card.innerHTML = `<p class="g-bombo-ante">${escapeHtml(t('g_and_now'))}</p>
            <div class="g-bombo-cara"></div><p class="g-bombo-nombre"></p><p class="g-bombo-grupo"></p>`;
        $('#g-hacer').before(card);
        $('#h-grupos').classList.add('repartiendo');
        const cardName = card.querySelector('.g-bombo-nombre'), cardGroup = card.querySelector('.g-bombo-grupo'), cardFace = card.querySelector('.g-bombo-cara');
        const showName = (n) => { cardFace.innerHTML = n ? faceHtml(lg, n, 'cara-bombo') : ''; cardName.textContent = n || '…'; };
        let running = true;
        const place = (x) => {
            const li = nextSlot(x), ownLi = ownSlot(x);
            if (!li || !ownLi || !ownLi.classList.contains('por-salir')) { return; }
            if (li !== ownLi) { [li.innerHTML, ownLi.innerHTML] = [ownLi.innerHTML, li.innerHTML]; [li.dataset.n, ownLi.dataset.n] = [ownLi.dataset.n, li.dataset.n]; }
            li.classList.remove('por-salir');
            if (running && !reducedMotion()) { li.classList.add('sale'); arts[x.gi].classList.remove('recibe'); void arts[x.gi].offsetWidth; arts[x.gi].classList.add('recibe'); }
            arts[x.gi].querySelector('h3 small').textContent = ++filled[x.gi];
        };
        const finishDeal = () => {
            if (!running) { return; }
            running = false; gDealing = null;
            order.forEach(place);
            card.remove();
            $('#h-grupos').classList.remove('repartiendo');
            whenDone();
        };
        gDealing = { acaba: finishDeal };
        relabel($('#g-hacer'), t('g_place_all'), 'pasar');
        const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });
        // The name leaves the card and lands in its slot.
        const fly = (x, ms) => new Promise((r) => {
            const li = nextSlot(x), ownLi = ownSlot(x);
            if (reducedMotion() || !li || !ownLi || !li.animate) { r(); return; }
            const fromRect = cardName.getBoundingClientRect(), a = li.getBoundingClientRect();
            const ghost = document.createElement('div');
            ghost.className = 'g-vuela'; ghost.setAttribute('aria-hidden', 'true'); ghost.innerHTML = ownLi.innerHTML;
            Object.assign(ghost.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', fontSize: getComputedStyle(li).fontSize });
            document.body.append(ghost);
            const dx = fromRect.left + fromRect.width / 2 - (a.left + a.width / 2), dy = fromRect.top + fromRect.height / 2 - (a.top + a.height / 2);
            ghost.animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.4)`, opacity: 0.3 }, { transform: 'none', opacity: 1 }],
                { duration: ms, easing: 'cubic-bezier(.3, .7, .3, 1)' }).onfinish = () => { ghost.remove(); r(); };
        });
        const base = Math.max(750, Math.min(1700, 22000 / order.length));
        (async () => {
            for (let i = 0; i < order.length; i++) {
                const x = order[i], remaining = order.slice(i);
                const pace = base * (i < 2 ? 1.3 : (order.length - i <= 3 ? 1.7 : 1));
                card.classList.remove('elegida', 'con-grupo', 'claro');
                cardGroup.textContent = '';
                if (reducedMotion()) {
                    showName('');
                    await wait(pace * 0.4);
                } else {
                    // Shuffle: the names left, slower and slower.
                    const until = performance.now() + pace * 0.4;
                    for (let delayMs = 45; running && performance.now() < until; delayMs *= 1.18) {
                        showName(remaining[randomInt(remaining.length)].n); playSound('tic');
                        await wait(delayMs);
                    }
                }
                if (!running) { return; }
                showName(x.n); card.classList.add('elegida'); playSound('cuenta');
                await wait(pace * 0.2);
                if (!running) { return; }
                const [c, light] = GROUP_COLOURS[x.gi % GROUP_COLOURS.length];
                card.style.setProperty('--c', c); card.classList.toggle('claro', !!light); card.classList.add('con-grupo');
                cardGroup.textContent = t('g_group_n', x.gi + 1);
                announce(t('g_goes_to', { name: x.n, n: x.gi + 1 }));
                await wait(pace * 0.2);
                if (!running) { return; }
                await fly(x, Math.max(280, pace * 0.2));
                if (!running) { return; }
                place(x);
            }
            finishDeal();
        })();
    };
    // The font of the groups as big as fits without scrolling (on the board it is read from the back).
    const gFit = () => {
        if (gGrid.classList.contains('vacia') || getComputedStyle(gGrid).overflowY === 'visible' || !gGrid.clientHeight) { gGrid.style.fontSize = ''; return; }
        // From big to small: changing the font changes the number of columns, so a binary search will not do.
        let fs = 44;
        for (; fs > 12; fs -= 1) {
            gGrid.style.fontSize = fs + 'px';
            if (gGrid.scrollHeight <= gGrid.clientHeight + 1) { break; }
        }
        gGrid.style.fontSize = fs + 'px';
    };
    let gFrame = 0;
    if (window.ResizeObserver) { new ResizeObserver(() => { cancelAnimationFrame(gFrame); gFrame = requestAnimationFrame(gFit); }).observe(gGrid); }
    TOOLS.grupos = { entra: () => requestAnimationFrame(gFit) };
    $('#g-hacer').addEventListener('click', gMake);
    $('#g-roles').checked = gWithRoles;
    $('#g-roles-caja').hidden = !gWithRoles;
    $('#g-roles-texto').placeholder = BASE_ROLES().join('\n');
    $('#g-roles-texto').value = (load('roles-nombres', null) || []).join('\n');
    $('#g-roles-juego').value = gRoleSet;
    $('#g-roles-propios').hidden = gRoleSet !== 'own';
    $('#g-roles-juego').addEventListener('change', (e) => {
        gRoleSet = e.target.value; save('roles-juego', gRoleSet);
        $('#g-roles-propios').hidden = gRoleSet !== 'own';
        gGiveRoles();
    });
    $('#g-roles').addEventListener('change', (e) => { gWithRoles = e.target.checked; save('grupos-roles', gWithRoles); $('#g-roles-caja').hidden = !gWithRoles; gGiveRoles(); });
    $('#g-roles-texto').addEventListener('input', () => {
        const r = [...new Set($('#g-roles-texto').value.split(/\r?\n/).map((x) => x.trim().slice(0, 30)).filter(Boolean))].slice(0, 6);
        save('roles-nombres', r.length ? r : null);
    });
    $('#g-roles-texto').addEventListener('change', gGiveRoles);
    $('#g-rotar').addEventListener('click', () => { gGiveRoles(); playSound('dado'); announce(t('g_roles_done')); });
    // Clearing the result: the screen is blank again.
    $('#g-borrar').addEventListener('click', () => {
        gMade = null; gToSave = null;
        gEmpty(t('g_empty_start'));
        $('#g-resumen').textContent = '';
        ['#g-moodle', '#g-rotar', '#g-borrar'].forEach((s) => { $(s).hidden = true; });
        gReady();
    });
    // Reordering the groups by dragging their header: the others move aside and the numbers follow the order.
    let gDrag = null;
    gGrid.addEventListener('pointerdown', (e) => {
        const h = e.target.closest('.grupo h3');
        if (!h || !gMade || e.button > 0) { return; }
        gDrag = { art: h.closest('.grupo'), x: e.clientX, y: e.clientY, id: e.pointerId, moviendo: false };
    });
    gGrid.addEventListener('pointermove', (e) => {
        const a = gDrag;
        if (!a || e.pointerId !== a.id) { return; }
        if (!a.moviendo) {
            if (Math.hypot(e.clientX - a.x, e.clientY - a.y) < 8) { return; }
            a.moviendo = true; a.art.classList.add('moviendo');
            try { gGrid.setPointerCapture(e.pointerId); } catch (err) { /* goes on without capture */ }
        }
        e.preventDefault();
        const under = document.elementFromPoint(e.clientX, e.clientY);
        const target = under && under.closest('.grupo');
        if (!target || target === a.art || !gGrid.contains(target)) { return; }
        const arts = $$('.grupo', gGrid);
        gGrid.insertBefore(a.art, arts.indexOf(target) > arts.indexOf(a.art) ? target.nextSibling : target);
    });
    const gDrop = (e) => {
        const a = gDrag;
        if (!a || e.pointerId !== a.id) { return; }
        gDrag = null;
        if (!a.moviendo) { return; }
        a.art.classList.remove('moviendo');
        // The groups, in the new order (the same array: the Scoreboard and «Save as course groups» use it).
        const arts = $$('.grupo', gGrid), previousOrder = gMade.grupos.slice();
        gMade.grupos.length = 0;
        arts.forEach((art, i) => {
            gMade.grupos.push(previousOrder[Number(art.dataset.gi)]);
            art.dataset.gi = i;
            art.querySelector('.g-titulo').textContent = t('g_group_n', i + 1);
        });
        playSound('tic');
    };
    gGrid.addEventListener('pointerup', gDrop);
    gGrid.addEventListener('pointercancel', gDrop);
    $('#g-rasca').checked = gScratch;
    $('#g-rasca').addEventListener('change', (e) => { gScratch = e.target.checked; save('grupos-rasca', gScratch); });
    $('#g-emocion').checked = gSuspense;
    $('#g-emocion').addEventListener('change', (e) => { gSuspense = e.target.checked; save('grupos-emocion', gSuspense); });
    $('#g-lista').addEventListener('change', gListChanged);
    $('#g-pegados').addEventListener('input', () => { gReady(); $('#g-guardar').disabled = !cleanNames($('#g-pegados').value).length; });
    $('#g-guardar').addEventListener('click', () => openEditor(null, $('#g-pegados').value));
    $('#g-faltan').addEventListener('click', () => openAbsent(gList()));
    $('#g-moodle').addEventListener('click', () => {
        if (!gToSave) { return; }
        const { list, groups } = gToSave, b = $('#g-moodle');
        b.disabled = true; relabel(b, t('g_saving'));
        toMoodle(MOODLE.groupsurl, { listname: list.nombre, teams: JSON.stringify(groups.map((g) => g.map((n) => list.ids[n]).filter(Boolean))) })
            .then((j) => {
                relabel(b, t('g_saved'), 'hecho');
                if (window.ClasstoolsCore.logro) { window.ClasstoolsCore.logro('repartequipos'); }
                $('#g-resumen').textContent += ' ' + t('g_saved_as', j.grouping);
                announce(t('g_saved_announce', j.grouping));
            })
            .catch(() => { b.disabled = false; relabel(b, t('g_save_failed'), 'guardar'); });
    });
    $$('#g-modo button').forEach((b) => b.addEventListener('click', () => { gMode = b.dataset.modo; save('grupos-modo', gMode); gPaintMode(); gReady(); }));
    const gChangeN = (d) => { gN = Math.max(2, Math.min(15, gN + d)); save('grupos-n', gN); gPaintMode(); gReady(); };
    repeatWhileHeld($('#g-menos'), () => gChangeN(-1));
    repeatWhileHeld($('#g-mas'), () => gChangeN(1));
    gEmpty(t('g_empty_start'));

    // ===================================================================================================
    // 5. Noise meter: it only measures the microphone level; it records and sends nothing
    // ===================================================================================================
    const sm = { flujo: null, fuente: null, analizador: null, buf: null, rf: 0, suave: 0, zona: null, bajaDesde: 0, ultimoAria: -1,
        ultimo: 0, racha: 0, mejor: 0, paciencia: 100, agotada: false, pintado: '' };
    const MESSAGES = { verde: t('sm_green'), amarillo: t('sm_amber'), rojo: t('sm_red') };
    const LIGHT_LABELS = { verde: t('sm_light_green'), amarillo: t('sm_light_amber'), rojo: t('sm_light_red') };   // «Noise meter on …»
    const LEVEL_ORDER = { verde: 0, amarillo: 1, rojo: 2 };
    const micAllowed = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) { return false; }
        const policy = document.permissionsPolicy || document.featurePolicy;
        try { if (policy && policy.allowsFeature && !policy.allowsFeature('microphone')) { return false; } } catch (e) { /* no policy */ }
        return true;
    };
    const smNoMic = (reason) => {
        const windowHint = t('sm_mic_window');
        const reasonTexts = {
            marco: `<strong>${t('sm_mic_frame')}</strong> ${windowHint}`,
            permiso: inFrame ? `<strong>${t('sm_mic_denied_frame')}</strong> ${windowHint}`
                : `<strong>${t('sm_mic_denied')}</strong> ${t('sm_mic_denied_help')}`,
            ninguno: `<strong>${t('sm_mic_none')}</strong> ${t('sm_mic_none_help')}`,
            otro: `<strong>${t('sm_mic_unavailable')}</strong> ${inFrame ? windowHint : t('sm_mic_unavailable_help')}`,
            pendiente: inFrame ? `<strong>${t('sm_mic_pending_frame')}</strong> ${windowHint}`
                : `<strong>${t('sm_mic_pending')}</strong> ${t('sm_mic_pending_help')}`,
        };
        $('#s-sinmicro-texto').innerHTML = reasonTexts[reason] || reasonTexts.otro;
        $('#s-ventana').hidden = !inFrame;
        $('#s-sinmicro').hidden = false;
    };
    const smSetZone = (z) => {
        sm.zona = z;
        $$('#s-caja .luz').forEach((l) => l.classList.toggle('encendida', l.dataset.zona === z));
        $('#s-caja').classList.toggle('apagado', !z);
        $('#s-caja').setAttribute('aria-label', z ? LIGHT_LABELS[z] : t('sm_off'));
        const m = $('#s-mensaje');
        m.className = 'mensaje-ruido' + (z ? ' ' + z : '');
        m.textContent = z ? MESSAGES[z] : t('sm_off');
    };
    const smLoop = () => {
        sm.analizador.getFloatTimeDomainData(sm.buf);
        let sumSquares = 0;
        for (let i = 0; i < sm.buf.length; i++) { sumSquares += sm.buf[i] * sm.buf[i]; }
        const db = 20 * Math.log10(Math.sqrt(sumSquares / sm.buf.length) + 1e-9);
        // Measuring the usual noise of the class (Adjust): a few seconds of levels are kept.
        if (sm.midiendo) { sm.midiendo.push(db); }
        // The scale: adjusted to the class (the usual noise sits at a third, in green), or from about −62 dB (silence)
        // to −14 dB (a lot of noise). The sensitivity shifts it ±20 dB. Each microphone picks up differently: that is
        // why adjusting is best.
        const sens = Number($('#s-sensibilidad').value);
        const zeroDb = sm.base !== null ? sm.base - 16 : -62;
        const level = Math.max(0, Math.min(100, ((db - zeroDb + (sens - 5) * 4) / 48) * 100));
        // It rises slowly (a bang or a chair does not turn it red) and falls even more slowly.
        sm.suave += (level - sm.suave) * (level > sm.suave ? 0.06 : 0.04);
        const z = sm.suave >= 75 ? 'rojo' : sm.suave >= 50 ? 'amarillo' : 'verde';
        const now = performance.now();
        // It goes up a colour at once; to go down it has to stay 1.5 s below (so it does not flicker).
        if (!sm.zona || LEVEL_ORDER[z] > LEVEL_ORDER[sm.zona]) { smSetZone(z); sm.bajaDesde = 0; }
        else if (LEVEL_ORDER[z] < LEVEL_ORDER[sm.zona]) {
            if (!sm.bajaDesde) { sm.bajaDesde = now; } else if (now - sm.bajaDesde > 1500) { smSetZone(z); sm.bajaDesde = 0; }
        } else { sm.bajaDesde = 0; }
        $('#s-relleno').style.setProperty('--nivel', sm.suave.toFixed(1) + '%');
        // The light that is on breathes with the noise: it grows and glows more the louder they speak.
        $('#s-caja').style.setProperty('--vol', (sm.suave / 100).toFixed(3));
        const dt = sm.ultimo ? Math.min(0.25, (now - sm.ultimo) / 1000) : 0;
        sm.ultimo = now;
        // Calm streak: it only counts in green; yellow stops it and red sets it to zero.
        if (sm.zona === 'verde') { sm.racha += dt; } else if (sm.zona === 'rojo') { sm.racha = 0; }
        sm.mejor = Math.max(sm.mejor, sm.racha);
        // Patience: red uses it up in 12 s and yellow in a minute; in green it comes back whole in 45 s. A single
        // shout barely touches it; sustained noise does.
        const drain = sm.zona === 'rojo' ? 100 / 12 : sm.zona === 'amarillo' ? 100 / 60 : -100 / 45;
        sm.paciencia = Math.max(0, Math.min(100, sm.paciencia - drain * dt));
        if (sm.paciencia <= 0 && !sm.agotada) {
            sm.agotada = true;
            playSound('agotada');
            const box = $('#s-caja');
            box.classList.remove('tiembla'); void box.offsetWidth; box.classList.add('tiembla');
            announce(t('sm_patience_gone'));
        } else if (sm.agotada && sm.paciencia >= 50) { sm.agotada = false; }
        smPaintExtras();
        smWaves(now); smTrace(now);
        const rounded = Math.round(sm.suave / 5) * 5;
        if (rounded !== sm.ultimoAria) { sm.ultimoAria = rounded; $('#s-medidor').setAttribute('aria-valuenow', String(rounded)); }
        sm.rf = requestAnimationFrame(smLoop);
    };
    const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    const smPaintExtras = () => {
        const p = Math.round(sm.paciencia), stamp = `${Math.floor(sm.racha)}|${Math.floor(sm.mejor)}|${p}|${sm.agotada}`;
        if (stamp === sm.pintado) { return; }
        sm.pintado = stamp;
        $('#s-racha').textContent = mmss(sm.racha);
        $('#s-mejor').textContent = sm.mejor >= 60 && sm.mejor > sm.racha + 1 ? t('sm_best', mmss(sm.mejor)) : '';
        $('#s-paciencia-relleno').style.setProperty('--p', p + '%');
        $('#s-paciencia').classList.toggle('baja', p < 30);
        $('#s-paciencia').setAttribute('aria-valuenow', String(p));
        $('#s-paciencia-titulo').textContent = sm.agotada ? t('sm_patience_out') : t('sm_patience');
        $('#s-extra').classList.toggle('agotada', sm.agotada);
    };
    // Extras the teacher chooses (all off at first): waves that come out of the light when the noise rises, the
    // trace of the last minute and a face on the light that is on, for the young ones.
    const smOptions = Object.assign({ ondas: false, rastro: false, cara: false }, load('semaforo-extras', {}));
    const smPaintOptions = () => {
        $('#s-caja').classList.toggle('con-cara', smOptions.cara);
        $('#s-rastro-caja').hidden = !smOptions.rastro;
        ['ondas', 'rastro', 'cara'].forEach((k) => { $('#s-op-' + k).checked = smOptions[k]; });
    };
    ['ondas', 'rastro', 'cara'].forEach((k) => $('#s-op-' + k).addEventListener('change', (e) => {
        smOptions[k] = e.target.checked; save('semaforo-extras', smOptions); smPaintOptions(); if (k === 'rastro') { smTrace(0, true); }
    }));
    let smLastWave = 0;
    const smWaves = (now) => {
        if (!smOptions.ondas || reducedMotion() || !sm.zona) { return; }
        const vol = sm.suave / 100;
        // More noise, more waves: none when calm, one every 0.3 s with a lot of noise.
        if (vol < 0.35 || now - smLastWave < 1000 - vol * 700) { return; }
        smLastWave = now;
        const light = $(`#s-caja .luz[data-zona="${sm.zona}"]`), box = $('#s-ondas');
        const r = light.getBoundingClientRect(), b = box.getBoundingClientRect();
        const o = document.createElement('span');
        o.className = 'onda ' + sm.zona;
        Object.assign(o.style, { left: `${r.left - b.left + r.width / 2}px`, top: `${r.top - b.top + r.height / 2}px`, width: `${r.width}px`, height: `${r.width}px` });
        box.append(o);
        setTimeout(() => o.remove(), 1600);
    };
    // The last minute: the level every quarter of a second, with the bands of the three colours behind.
    const smHistory = [];
    let smLastPoint = 0;
    const smTrace = (now, force) => {
        if (!smOptions.rastro) { return; }
        if (!force) {
            if (now - smLastPoint < 250) { return; }
            smLastPoint = now; smHistory.push(sm.suave); if (smHistory.length > 240) { smHistory.shift(); }
        }
        const c = $('#s-rastro'), w = c.clientWidth, h = c.clientHeight, dpr = window.devicePixelRatio || 1;
        if (!w || !h) { return; }
        if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
        const x = c.getContext('2d');
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
        [[0, 50, 'rgba(18, 166, 80, .14)'], [50, 75, 'rgba(251, 190, 23, .2)'], [75, 100, 'rgba(236, 34, 51, .16)']].forEach(([a, b2, col]) => {
            x.fillStyle = col; x.fillRect(0, h - (b2 / 100) * h, w, ((b2 - a) / 100) * h);
        });
        if (smHistory.length < 2) { return; }
        x.beginPath();
        smHistory.forEach((v, i) => { const px = w - (smHistory.length - 1 - i) * (w / 239), py = h - (v / 100) * h; if (i) { x.lineTo(px, py); } else { x.moveTo(px, py); } });
        x.strokeStyle = '#164281'; x.lineWidth = 2.5; x.lineJoin = 'round'; x.stroke();
    };
    // Adjust to this class: a few seconds of its usual working noise become the green of the scale.
    sm.base = typeof load('ruido-base', null) === 'number' ? load('ruido-base', null) : null;
    sm.midiendo = null;
    const smCalibrate = async () => {
        const b = $('#s-ajustar'), note = $('#s-ajuste-nota');
        if (!sm.flujo) { await smStart(); }
        if (!sm.flujo) { return; }
        b.disabled = true;
        sm.midiendo = [];
        let secondsLeft = 4;
        note.textContent = t('sm_adjusting', secondsLeft);
        const countdown = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) { note.textContent = t('sm_adjusting', secondsLeft); return; }
            clearInterval(countdown);
            const v = (sm.midiendo || []).filter((x) => x > -120).sort((x, y) => x - y);
            sm.midiendo = null;
            b.disabled = false;
            if (v.length < 10) { note.textContent = t('sm_adjust_hint'); return; }
            sm.base = v[Math.floor(v.length * 0.6)];   // a little above the median: the usual level, without the silences
            save('ruido-base', sm.base);
            $('#s-sensibilidad').value = 5; save('sensibilidad', 5); paintSensitivity();
            sm.suave = 33;
            note.textContent = t('sm_adjusted');
            playSound('elegido');
        }, 1000);
    };
    $('#s-ajustar').addEventListener('click', smCalibrate);
    const smStop = () => {
        cancelAnimationFrame(sm.rf);
        if (sm.fuente) { try { sm.fuente.disconnect(); } catch (e) { /* it already was */ } }
        if (sm.flujo) { sm.flujo.getTracks().forEach((t) => t.stop()); }
        Object.assign(sm, { flujo: null, fuente: null, analizador: null, suave: 0, zona: null, bajaDesde: 0, ultimo: 0, racha: 0, paciencia: 100, agotada: false });
        smSetZone(null);
        $('#s-caja').style.setProperty('--vol', '0');
        smPaintExtras();
        $('#s-relleno').style.setProperty('--nivel', '0%');
        $('#s-medidor').setAttribute('aria-valuenow', '0');
        relabel($('#s-marcha'), t('sm_listen'), 'micro');
        $('#s-marcha').className = 'boton grande ancho';
    };
    const smStart = async () => {
        $('#s-sinmicro').hidden = true;
        if (!micAllowed()) { smNoMic(inFrame ? 'marco' : 'otro'); return; }
        const b = $('#s-marcha');
        b.disabled = true;
        $('#s-mensaje').textContent = t('sm_asking');
        // If the browser's question does not show or nobody answers it, after 5 s the board explains what to do.
        const pendingTimer = setTimeout(() => smNoMic('pendiente'), 5000);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
            clearTimeout(pendingTimer);
            $('#s-sinmicro').hidden = true;
            if (!visibleTools().includes('semaforo')) { stream.getTracks().forEach((t) => t.stop()); smSetZone(null); return; }
            const a = audio();
            if (!a) { throw new Error('sin audio'); }
            sm.flujo = stream;
            sm.fuente = a.createMediaStreamSource(stream);
            sm.analizador = a.createAnalyser();
            sm.analizador.fftSize = 2048;
            sm.buf = new Float32Array(sm.analizador.fftSize);
            sm.fuente.connect(sm.analizador);   // to the analyser and nowhere else: it is not heard and not saved
            relabel(b, t('sm_stop'), 'micro-no');
            b.className = 'boton grande suave ancho';
            smLoop();
        } catch (e) {
            clearTimeout(pendingTimer);
            smStop();
            const n = e && e.name;
            smNoMic(n === 'NotAllowedError' || n === 'SecurityError' ? 'permiso' : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'ninguno' : 'otro');
        } finally {
            b.disabled = false;
        }
    };
    $('#s-marcha').addEventListener('click', () => { if (sm.flujo) { smStop(); } else { smStart(); } });
    $('#s-ventana').addEventListener('click', openWindow);
    const paintSensitivity = () => {
        const v = Number($('#s-sensibilidad').value);
        $('#s-sens-valor').textContent = v <= 3 ? t('sm_sens_low') : v <= 7 ? t('sm_sens_medium') : t('sm_sens_high');
    };
    $('#s-sensibilidad').value = Math.max(1, Math.min(10, Number(load('sensibilidad', 5)) || 5));
    $('#s-sensibilidad').addEventListener('input', () => { paintSensitivity(); save('sensibilidad', Number($('#s-sensibilidad').value)); });
    smPaintOptions();
    paintSensitivity();
    TOOLS.semaforo = {
        // Inside a frame without permission, the board says so before they try.
        entra: () => { if (!sm.flujo && !micAllowed()) { smNoMic(inFrame ? 'marco' : 'otro'); } },
        sale: smStop,
    };


    // ===================================================================================================
    // Full-screen sign (Work symbols and the enlarged QR code)
    // ===================================================================================================
    const bigView = $('#gigante');
    let bigViewReturn = null;
    const openBigView = ({ color, cssClass, html, label }) => {
        bigView.style.setProperty('--c', color || 'var(--azul)');
        bigView.className = 'gigante' + (cssClass ? ' ' + cssClass : '');
        bigView.setAttribute('aria-label', label || t('gen_big_view'));
        $('#gigante-contenido').innerHTML = html;
        bigViewReturn = document.activeElement;
        bigView.hidden = false;
        $('#gigante-cerrar').focus();
    };
    const closeBigView = () => {
        bigView.hidden = true;
        if (bigViewReturn && bigViewReturn.focus) { bigViewReturn.focus(); }
    };
    bigView.addEventListener('click', closeBigView);

    // ===================================================================================================
    // 7. Work symbols
    // ===================================================================================================
    const WORK_SYMBOLS = [
        { nombre: t('asi_silence'), icono: 'silencio', color: '#ce1423' },
        { nombre: t('asi_quiet'), icono: 'bajo', color: '#fbbe17', claro: true },
        { nombre: t('asi_pairs'), icono: 'parejas', color: '#067e36' },
        { nombre: t('asi_group'), icono: 'grupos', color: '#5b2fb8' },
        { nombre: t('asi_hand'), icono: 'mano', color: '#164281' },
        { nombre: t('asi_listen'), icono: 'escucha', color: '#0e7c86' },
    ];
    $('#a-rejilla').innerHTML = WORK_SYMBOLS.map((m, i) =>
        `<button type="button" class="modo-trabajo${m.claro ? ' claro' : ''}" style="--c:${m.color}" data-i="${i}">${icono(m.icono)}<span class="palabra">${m.nombre}</span></button>`).join('');
    $$('.modo-trabajo').forEach((b) => b.addEventListener('click', () => {
        const m = WORK_SYMBOLS[Number(b.dataset.i)];
        openBigView({ color: m.color, clase: m.claro ? 'claro' : '', etiqueta: m.nombre, html: `${icono(m.icono)}<p class="palabra">${m.nombre}</p>` });
    }));

    // ===================================================================================================
    // 8. Clock (the time zone and language of the site inside Moodle; those of the computer outside)
    // ===================================================================================================
    (() => {
        let ticks = '';
        for (let i = 0; i < 60; i++) {
            const isHour = i % 5 === 0, r1 = isHour ? 80 : 85, a = (i * 6 * Math.PI) / 180;
            ticks += `<line class="${isHour ? 'marca-h' : 'marca-m'}" x1="${(100 + r1 * Math.sin(a)).toFixed(2)}" y1="${(100 - r1 * Math.cos(a)).toFixed(2)}" x2="${(100 + 89 * Math.sin(a)).toFixed(2)}" y2="${(100 - 89 * Math.cos(a)).toFixed(2)}"/>`;
        }
        for (let h = 1; h <= 12; h++) {
            const a = (h * 30 * Math.PI) / 180;
            ticks += `<text class="num-h" x="${(100 + 66 * Math.sin(a)).toFixed(2)}" y="${(100 - 66 * Math.cos(a)).toFixed(2)}" text-anchor="middle" dominant-baseline="central">${h}</text>`;
        }
        $('#r-marcas').innerHTML = ticks;
    })();
    const clockFormat = { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'long', day: 'numeric', month: 'long' };
    const SITE = window.CLASSTOOLS_SITE || {};
    const clockLanguage = LANGUAGE;
    let clockFormatter;
    try { clockFormatter = new Intl.DateTimeFormat(clockLanguage, Object.assign(SITE.tz ? { timeZone: SITE.tz } : {}, clockFormat)); }
    catch (e) { clockFormatter = new Intl.DateTimeFormat(undefined, clockFormat); }
    let rTimer = 0;
    const rPaint = () => {
        const p = {};
        clockFormatter.formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
        const h = Number(p.hour) % 24, m = Number(p.minute), s = Number(p.second);
        $('#r-hm').textContent = `${pad(h)}:${pad(m)}`;
        $('#r-s').textContent = `:${pad(s)}`;
        const dateText = /^es\b/.test(clockLanguage) ? `${p.weekday}, ${p.day} de ${p.month}` : `${p.weekday}, ${p.day} ${p.month}`;
        $('#r-fecha').textContent = dateText.charAt(0).toUpperCase() + dateText.slice(1);
        $('#r-ah').setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 100 100)`);
        $('#r-am').setAttribute('transform', `rotate(${(m + s / 60) * 6} 100 100)`);
        $('#r-as').setAttribute('transform', `rotate(${s * 6} 100 100)`);
    };
    const rTick = () => { rPaint(); rTimer = setTimeout(rTick, 1000 - (Date.now() % 1000) + 20); };
    TOOLS.reloj = { entra: rTick, sale: () => clearTimeout(rTimer) };

    // ===================================================================================================
    // 9. QR code: in qr.js
    // ===================================================================================================

    // ===================================================================================================
    // Keyboard: Escape closes what is on top; the space bar starts or stops (when not typing)
    // ===================================================================================================
    addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!$('#fin-tiempo').hidden) { e.preventDefault(); closeTimeUp(false); }
            else if (!bigView.hidden) { e.preventDefault(); closeBigView(); }
            return;
        }
        if (e.key !== ' ' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) { return; }
        if (!$('#fin-tiempo').hidden || !bigView.hidden || document.querySelector('dialog[open]')) { return; }
        if (e.target.closest && e.target.closest('button, input, textarea, select, a, [role="tab"]')) { return; }
        const action = { temporizador: tmToggle, cronometro: crToggle, quien: pickStudent }[current] || (TOOLS[current] && TOOLS[current].espacio);
        if (action) { e.preventDefault(); action(); }
    });

    // ===================================================================================================
    // Start: a 5-minute timer, ready; the SCO is marked complete on opening (there is no grade)
    // ===================================================================================================
    paintSound();
    gPaintMode();
    // Present: the top bar steps aside so the tool fills the screen; a small button brings it back
    // (so does Escape).
    (() => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'redondo'; b.id = 'b-presentar'; b.title = t('bar_present');
        b.innerHTML = `<span class="ico-caja">${icono('ampliar')}</span><span class="redondo-texto">${escapeHtml(t('bar_present'))}</span>`;
        $('.acciones').prepend(b);
        const exitButton = document.createElement('button');
        exitButton.type = 'button'; exitButton.className = 'salir-presentar'; exitButton.id = 'b-salir-presentar'; exitButton.hidden = true;
        exitButton.innerHTML = `${icono('salir')}<span>${escapeHtml(t('bar_present_exit'))}</span>`;
        document.body.append(exitButton);
        // It also goes full screen (if it was not already), and on leaving it exits full screen only if it entered it.
        // If full screen is left with the browser's Escape key, presenting ends too.
        let enteredFullscreen = false;
        const setPresenting = (isOn) => {
            document.documentElement.classList.toggle('presentando', isOn);
            exitButton.hidden = !isOn;
            if (isOn) { exitButton.focus({ preventScroll: true }); } else { b.focus({ preventScroll: true }); }
            if (isOn && document.fullscreenEnabled && !document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => { enteredFullscreen = true; }).catch(() => {});
            } else if (!isOn && enteredFullscreen) {
                enteredFullscreen = false;
                if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
            }
            dispatchEvent(new Event('resize'));
        };
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && enteredFullscreen) { enteredFullscreen = false; if (document.documentElement.classList.contains('presentando')) { setPresenting(false); } }
        });
        b.addEventListener('click', () => setPresenting(true));
        exitButton.addEventListener('click', () => setPresenting(false));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.documentElement.classList.contains('presentando') && !document.querySelector('dialog[open]')) { setPresenting(false); }
        });
    })();
    // The mode button, in the top bar, with its menu of four.
    (() => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'redondo'; b.id = 'b-modo'; b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false');
        $('.acciones').prepend(b);
        const paintModeButton = () => {
            b.title = `${t('bar_mode')}: ${t('mode_' + mode)}`;
            b.innerHTML = `<span class="modo-disco" data-m="${mode}">${icono('modo-' + mode)}</span><span class="redondo-texto">${escapeHtml(t('mode_' + mode))}</span>`;
        };
        const menu = document.createElement('div');
        menu.className = 'menu-modo'; menu.id = 'menu-modo'; menu.hidden = true; menu.setAttribute('role', 'menu');
        menu.innerHTML = `<p class="ante">${escapeHtml(t('bar_mode_title'))}</p>` + SCREEN_MODES.map((m) => `<button type="button" role="menuitemradio" data-modo="${m}">`
            + `<span class="modo-disco" data-m="${m}">${icono('modo-' + m)}</span><span><strong>${escapeHtml(t('mode_' + m))}</strong><small>${escapeHtml(t('mode_' + m + '_hint'))}</small></span></button>`).join('')
            + `<label class="interruptor menu-modo-mayus"><input type="checkbox" id="mm-mayus"><span><strong>${escapeHtml(t('bar_names_upper'))}</strong>`
            + `<small>${escapeHtml(t('bar_names_upper_hint'))}</small></span></label>`;
        document.body.append(menu);
        const closeMenu = () => { menu.hidden = true; b.setAttribute('aria-expanded', 'false'); };
        b.addEventListener('click', () => {
            if (!menu.hidden) { closeMenu(); return; }
            $$('button', menu).forEach((x) => x.setAttribute('aria-checked', String(x.dataset.modo === mode)));
            $('#mm-mayus').checked = !!upperNames.get().on;
            const r = b.getBoundingClientRect();
            menu.style.top = `${r.bottom + 8}px`;
            menu.style.right = `${Math.max(8, innerWidth - r.right)}px`;
            menu.hidden = false; b.setAttribute('aria-expanded', 'true');
            (menu.querySelector('[aria-checked="true"]') || menu.querySelector('button')).focus();
        });
        menu.addEventListener('click', (e) => {
            const x = e.target.closest('[data-modo]'); if (!x) { return; }
            mode = x.dataset.modo;
            document.documentElement.dataset.modo = mode;
            save(modeKey, mode);
            saveSettings({ mode: mode });
            paintModeButton(); closeMenu(); fitBar(); applyUpperNames();
            announce(`${t('bar_mode')}: ${t('mode_' + mode)}`);
            document.dispatchEvent(new CustomEvent('classtools:mode', { detail: mode }));
        });
        $('#mm-mayus').addEventListener('change', (e) => { upperNames.set({ on: e.target.checked }); applyUpperNames(); });
        document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target) && !b.contains(e.target)) { closeMenu(); } });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { e.stopPropagation(); closeMenu(); b.focus(); } }, true);
        paintModeButton();
    })();
    // What the teacher keeps in Moodle of each tool (scoreboard, letter wheels…), to go on from another computer.
    // It is sent after a short wait so as not to send every tap, and what is pending goes out when the page closes.
    const pending = {}, sendTimers = {};
    const send = (tool, keepalive) => {
        if (!MOODLE || !MOODLE.stateurl || !(tool in pending)) { return Promise.resolve(); }
        const payload = pending[tool]; delete pending[tool];
        return fetch(MOODLE.stateurl, {
            method: 'POST', credentials: 'same-origin', keepalive: !!keepalive, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ sesskey: MOODLE.sesskey, courseid: MOODLE.courseid, tool, data: JSON.stringify(payload) }),
        }).then((r) => r.json()).then((j) => {
            // No session: it stays pending (it goes out as soon as they log in again) and the board says so.
            if (isNoSession(j)) { if (!(tool in pending)) { pending[tool] = payload; } warnSession(); }
        }).catch(() => { /* offline: it stays in the browser */ });
    };
    const keepInMoodle = (tool, payload) => {
        if (!MOODLE || !MOODLE.stateurl || DUEL || PRACTICE) { return; }
        pending[tool] = payload;
        clearTimeout(sendTimers[tool]);
        sendTimers[tool] = setTimeout(() => send(tool), 1200);
    };
    addEventListener('pagehide', () => Object.keys(pending).forEach((t) => send(t, true)));
    // Someone of the class for another tool (to come to the board, to play on the score…): from the list chosen in
    // «Whose turn?», among those who came, with the fair picking of turns (it counts as one more) and not repeating
    // the last one. null if there is no list or nobody is left.
    let lastPickedOutside = null;
    const pickForTool = () => {
        const l = pickerList();
        if (!l) { return null; }
        let pool = presentIn(l);
        if (pool.length > 1 && lastPickedOutside) { pool = pool.filter((n) => n !== lastPickedOutside); }
        if (!pool.length) { return null; }
        const fair = withPicks(l) && qFair;
        const fewest = fair ? Math.min(...pool.map((n) => l.veces[n] || 0)) : 0;
        const candidates = fair ? pool.filter((n) => (l.veces[n] || 0) === fewest) : pool;
        const chosen = candidates[randomInt(candidates.length)];
        lastPickedOutside = chosen;
        if (withPicks(l) && l.ids[chosen]) {
            addPick(l.ids[chosen]);
            toMoodle(MOODLE.pickurl, { userid: l.ids[chosen] }).catch(() => { /* offline: that turn does not count */ });
        }
        return { name: chosen, list: l };
    };
    // ---------------------------------------------------------------------------------------------------
    // Games and materials by school level: in each screen mode the bar shows first what suits it, and the rest waits
    // in «Other levels» (a course for future teachers may want the rods in Advanced). Nothing is taken away, and what
    // is open always shows (decision of 11 October 2026).
    // ---------------------------------------------------------------------------------------------------
    const LEVELS_OF = {
        // Games.
        rosco: ['primary', 'secondary', 'advanced'], simon: ['early', 'primary', 'secondary'], eco: ['early', 'primary', 'secondary'],
        ahorcado: ['early', 'primary', 'secondary', 'advanced'], palabra: ['primary', 'secondary', 'advanced'],
        parejas: ['early', 'primary', 'secondary', 'advanced'], codigo: ['primary', 'secondary', 'advanced'],
        ordenar: ['primary', 'secondary', 'advanced'], clasificar: ['primary', 'secondary', 'advanced'],
        errores: ['primary', 'secondary', 'advanced'], quiensoy: ['primary', 'secondary', 'advanced'],
        // Materials.
        rods: ['early', 'primary'], tangram: ['early', 'primary', 'secondary'], line: ['primary', 'secondary', 'advanced'],
        fractions: ['primary', 'secondary'], geoboard: ['early', 'primary', 'secondary'], base10: ['primary', 'secondary'],
        balanza: ['early', 'primary', 'secondary'], plano: ['primary', 'secondary', 'advanced'], calc: ['primary', 'secondary', 'advanced'], score: ['early', 'primary', 'secondary', 'advanced'],
        tiempo: ['primary', 'secondary', 'advanced'], cuerpos: ['early', 'primary', 'secondary', 'advanced'],
    };
    const ofLevel = (id) => !LEVELS_OF[id] || LEVELS_OF[id].includes(mode);
    /**
     * Hides the buttons of other levels in a bar (a radio group whose buttons carry data-<attr>) and offers them in a
     * menu right after it. Called again whenever the bar is painted or the mode changes.
     *
     * @param {HTMLElement} bar
     * @param {string} attr «game» or «mode».
     */
    const otherLevels = (bar, attr) => {
        let more = bar.nextElementSibling && bar.nextElementSibling.classList.contains('ct-otros') ? bar.nextElementSibling : null;
        if (!more) {
            more = document.createElement('div');
            more.className = 'ct-otros';
            more.innerHTML = `<button type="button" class="ct-otros-boton" aria-haspopup="true" aria-expanded="false">`
                + `<span>${escapeHtml(t('levels_other'))}</span><span aria-hidden="true">▾</span></button>`
                + '<div class="ct-otros-menu" role="menu" hidden></div>';
            bar.after(more);
            const open = more.querySelector('.ct-otros-boton'), menu = more.querySelector('.ct-otros-menu');
            const close = () => { menu.hidden = true; open.setAttribute('aria-expanded', 'false'); };
            open.addEventListener('click', () => {
                const show = menu.hidden;
                menu.hidden = !show; open.setAttribute('aria-expanded', String(show));
                if (show && menu.querySelector('button')) { menu.querySelector('button').focus(); }
            });
            menu.addEventListener('click', (e) => {
                const x = e.target.closest('[data-pick]');
                if (!x) { return; }
                close();
                const b = bar.querySelector(`button[data-${attr}="${x.dataset.pick}"]`);
                if (b) { b.hidden = false; b.click(); b.focus(); }
            });
            document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !more.contains(e.target)) { close(); } });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); open.focus(); } });
        }
        const buttons = [...bar.querySelectorAll(`button[data-${attr}]`)];
        const away = buttons.filter((b) => !ofLevel(b.dataset[attr]) && b.getAttribute('aria-checked') !== 'true');
        buttons.forEach((b) => { b.hidden = away.includes(b); });
        more.hidden = !away.length;
        more.querySelector('.ct-otros-menu').innerHTML = away.map((b) => {
            const id = b.dataset[attr], levels = (LEVELS_OF[id] || []).map((m) => t('mode_' + m)).join(' · ');
            return `<button type="button" role="menuitem" data-pick="${escapeHtml(id)}"><strong>${escapeHtml(b.textContent)}</strong>`
                + `<small>${escapeHtml(levels)}</small></button>`;
        }).join('');
    };
    // API for the tools that live in other files (chance.js, scoreboard.js…): what the board shares.
    window.ClasstoolsCore = {
        $, $$, t, translate: translatePage, random: randomInt, shuffle, escape: escapeHtml, reducedMotion, save, load,
        play: playSound, sounds: SOUNDS, bell, click: clickSound, announce, icon: icono, setIcon,
        relabel, repeatWhileHeld, register: (tool, def) => { TOOLS[tool] = def; }, show: showTool,
        lists: allLists, present: presentIn, face: faceHtml, initials: initialsOf, preload: preloadPhotos, activeList: pickerList, duelo: DUEL, practica: PRACTICE,
        moodle: MOODLE, toMoodle, lastGroups: () => gMade, openBig: openBigView, closeBig: closeBigView,
        newList: () => openEditor(null), editList: (id) => openEditor(id),
        kept: (tool) => (MOODLE && MOODLE.state && MOODLE.state[tool]) || null, keep: keepInMoodle,
        audioContext: () => audio(), soundOn: () => soundOn, output: () => masterGain,
        mode: () => mode,   // early, primary, secondary or advanced; «classtools:mode» when it changes
        otherLevels,        // otherLevels(bar, attr): the games or materials of other levels, in a menu after the bar
        nameCase: toNameCase,  // nameCase(name) → the name as the board shows it (in capitals when «Names in capitals» is on)
        byMode,             // byMode(key, { early: {…}, primary: {…}, … }) → { get(), set(changes) }: values that start differently in each mode
        tabs: () => tabs.map((b) => b.dataset.h), current: () => current,
        pick: pickForTool,   // pick() → { name, list } or null: someone of the class, as in «Whose turn?»
    };
    // Opened from a course: the course in the title, and a button to go back to it.
    // The way back: to the course if opened from one; if not (inside Moodle, without a course), to each user's home.
    const backLink = MOODLE && MOODLE.back ? [MOODLE.back, t('bar_back')]
        : (window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.home ? [window.CLASSTOOLS_SITE.home, t('bar_home')] : null);
    if (backLink) {
        const v = document.createElement('a');
        v.className = 'redondo'; v.href = backLink[0]; v.title = backLink[1];
        v.innerHTML = `<span class="ico-caja">${icono('salir')}</span><span class="redondo-texto">${escapeHtml(backLink[1])}</span>`;
        $('.acciones').prepend(v);
    }
    if (MOODLE && MOODLE.course) {
        document.title = `${t('bar_title')} · ${MOODLE.course}`;
        // The course, under the name of the tools: with several classes a day (or a specialist who moves around), it
        // shows which one is open.
        const brand = $('.marca'), brandTexts = brand.lastElementChild, app = document.createElement('span');
        app.className = 'marca-app';
        app.append(...brandTexts.childNodes);
        // The course name leads to the course (like «Back to the course»), except on the practice board or in a duel.
        const linkToCourse = MOODLE.back && MOODLE.back !== '#' && !PRACTICE && !DUEL;
        const courseLabel = document.createElement(linkToCourse ? 'a' : 'span');
        courseLabel.className = 'marca-curso'; courseLabel.textContent = MOODLE.course; courseLabel.title = MOODLE.course;
        if (linkToCourse) { courseLabel.href = MOODLE.back; courseLabel.title = `${t('bar_back')}: ${MOODLE.course}`; }
        brandTexts.append(app, courseLabel);
        brand.classList.add('con-curso');
        fitBar();
    }
    paintSelects();
    pickerPaint();
    tmSet(5 * 60000);
    const hasTab = (h) => tabs.some((b) => b.dataset.h === h);
    showTool(courseLists.length && hasTab('quien') ? 'quien' : (hasTab('temporizador') ? 'temporizador' : tabs[0].dataset.h));
    // The split screen, if it was left so (on wide screens).
    if (!DUEL && load('dividida-on', false) && innerWidth >= 900 && availableTools().length > 1) { setSplit(true); }
    // A copy for a duel: only its material, as soon as everything has loaded.
    if (DUEL) {
        addEventListener('load', () => {
            if (hasTab('material')) { showTool('material'); }
            if (window.ClasstoolsMaterial) { window.ClasstoolsMaterial.showMode(DUEL); }
        });
    }
    fitBar();
    try { SCORM.iniciar(); SCORM.guardar({}, 100, true); } catch (e) { /* no Moodle */ }

    window.Pizarra = { tm, cr, sm, muestra: showTool, tmPon: tmSet, listas: () => ownLists, todas: allLists, limpiaNombres: cleanNames, elegir: pickStudent, abreFaltan: openAbsent };   // for the automated tests
})();
