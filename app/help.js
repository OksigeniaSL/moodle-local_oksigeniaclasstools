// Guided helps: the board shows how something is done on itself. A layer over the board with the practice board
// (practice.js) in a frame: a pointer does what the voice says, step by step, with captions; then «Now you» rings each
// button for the teacher to press it there, and the sticker of the tool, «Learned», is theirs. They open from the
// teacher's guide of each tool. The steps of each help are in helps.js (loaded when one opens); their captions and
// hints are language strings; the voice, clip by clip, in voice/<help>/<language>/NN.opus where there is one (without
// it, the captions alone). From the prototype of the art direction (kit/ayuda-guiada/ayuda.html).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    // Not inside the practice board itself, nor in a copy of a duel.
    if (!core || core.practica || core.duelo) { return; }
    const { t, escape } = core;
    // The helps there are: the guide (or guides) they are in, the sticker they give, and the languages with voice.
    const INDEX = {
        entrar: { guide: 'envivo', sticker: 'domamoviles', voice: ['es', 'en'] },
        votar: { guide: 'envivo', sticker: 'cuentavotos', voice: ['es', 'en'] },
        nube: { guide: 'envivo', sticker: 'atrapanubes', voice: ['es', 'en'] },
        mando: { guide: 'envivo', sticker: 'mandamas', voice: ['es', 'en'] },
        concurso: { guide: 'envivo', sticker: 'lanzapreguntas', voice: ['es', 'en'] },
        pulsadores: { guide: 'envivo', sticker: 'tocatimbres', voice: ['es', 'en'] },
        manos: { guide: ['envivo', 'tarjetas'], sticker: 'cuentamanos', voice: ['es', 'en'] },
        salida: { guide: 'salida', sticker: 'picabilletes', voice: ['es', 'en'] },
        balanza: { guide: 'balanza', sticker: 'despejaequis', voice: ['es', 'en'] },
        ejercicios: { guide: ['ordenar', 'clasificar', 'errores', 'quiensoy'], sticker: 'creajuegos', voice: ['es', 'en'] },
        tarjetas: { guide: 'tarjetas', sticker: 'alzatarjetas', voice: ['es', 'en'] },
        calculadora: { guide: 'calc', sticker: 'echacuentas', voice: ['es', 'en'] },
        silabas: { guide: 'simon', sticker: 'sigueluces', voice: ['es', 'en'] },
        partitura: { guide: 'score', sticker: 'tocanotas', voice: ['es', 'en'] },
        ahorcado: { guide: 'ahorcado', sticker: 'salvaglobos', voice: ['es', 'en'] },
        rosco: { guide: 'rosco', sticker: 'cazaletras', voice: ['es', 'en'] },
        dados: { guide: 'azar', sticker: 'tiradados', voice: ['es', 'en'] },
        pizarra: { guide: 'pizarra', sticker: 'pasalimpios', voice: ['es', 'en'] },
        cortina: { guide: 'pizarra', sticker: 'quitatelones', voice: ['es', 'en'] },
        instrumentos: { guide: 'pizarra', sticker: 'trazacirculos', voice: ['es', 'en'] },
        meta: { guide: 'marcador', sticker: 'cumplemetas', voice: ['es', 'en'] },
    };
    const VERSION = ((document.currentScript && document.currentScript.src) || '').split('?')[1] || '';
    const LANG = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    const OPUS = (() => { try { return !!new Audio().canPlayType('audio/ogg; codecs=opus'); } catch (e) { return false; } })();
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const AULA = core.moodle;
    const stickers = () => !!(AULA && AULA.mode === 'teacher' && AULA.logrosurl && AULA.logros && window.ClasstoolsLogros);

    // --- Loading the steps ---------------------------------------------------------------------------------------
    let loading = null;
    const load = () => {
        if (window.ClasstoolsHelps) { return Promise.resolve(window.ClasstoolsHelps); }
        if (!loading) {
            loading = new Promise((ok, fail) => {
                const s = document.createElement('script');
                s.src = 'helps.js' + (VERSION ? '?' + VERSION : '');
                s.onload = () => ok(window.ClasstoolsHelps);
                s.onerror = fail;
                document.head.append(s);
            });
        }
        return loading;
    };

    // --- The layer ---------------------------------------------------------------------------------------------------
    const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13L19.5 12z"/></svg>';
    const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="5" width="3.4" height="14" rx="1"/><rect x="13.6" y="5" width="3.4" height="14" rx="1"/></svg>';
    let box = null, frame = null, cur = null, ring = null, hint = null, phoneFrame = null;
    let ID = '', P = null, opts = {}, token = 0, i = 0, playing = false, fast = false, begun = false, done = false, had = false, voice = '';
    const vo = new Audio(), bed = new Audio();
    bed.loop = true;
    const $ = (s) => box.querySelector(s);
    const doc = () => frame && frame.contentDocument;
    // «movil:…» names something on the teacher's phone beside the board (a help about the remote); anything else, on
    // the practice board.
    const docOf = (sel) => (sel.indexOf('movil:') === 0 ? phoneFrame && phoneFrame.contentDocument : doc());
    const bare = (sel) => sel.replace(/^movil:/, '');
    const el = (sel) => { const d = docOf(sel); return d && d.querySelector(bare(sel)); };
    // Where something of the practice board (or of the phone, drawn smaller than it lays out) is on the screen.
    const center = (e) => {
        const f = e.ownerDocument.defaultView.frameElement || frame, b = e.getBoundingClientRect(), o = f.getBoundingClientRect();
        const k = f.offsetWidth ? o.width / f.offsetWidth : 1;
        const r = { left: o.left + b.left * k, top: o.top + b.top * k, width: b.width * k, height: b.height * k };
        r.right = r.left + r.width; r.bottom = r.top + r.height;
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
    };
    const steps = () => P.steps.length;
    const LAST = () => steps() + 1;                 // the watched steps, «Now you» and the end
    const caption = (k) => {
        if (k === LAST()) { return !stickers() ? t('hp_done') : had ? t(`hp_${ID}_again`) : t(`hp_${ID}_${k + 1}`); }
        return t(`hp_${ID}_${k + 1}`);
    };
    // The clip of a step: the last line of the script is the end for whoever already had the sticker.
    const clip = (k) => {
        if (!voice || (k === LAST() && !stickers())) { return ''; }
        return `voice/${ID}/${voice}/${String(k === LAST() && had ? steps() + 3 : k + 1).padStart(2, '0')}.opus`;
    };

    let bedTimer = 0;
    const fadeBed = (to, ms) => {
        clearInterval(bedTimer);
        const from = bed.volume, t0 = Date.now();
        bedTimer = setInterval(() => {
            const k = Math.min(1, (Date.now() - t0) / ms);
            bed.volume = Math.max(0, Math.min(1, from + (to - from) * k));
            if (k >= 1) { clearInterval(bedTimer); if (to === 0) { bed.pause(); } }
        }, 50);
    };
    const startBed = () => {
        if (!voice || fast) { return; }
        if (!bed.src) { bed.src = 'voice/fondo.opus'; bed.volume = 0; }
        const p = bed.play();
        if (p && p.catch) { p.catch(() => {}); }
        fadeBed(0.22, 1200);
    };

    // --- What a help can do on the board (the h of helps.js); «quick» skips the pointer's travel -----------------------
    function ripple(x, y) {
        const r = document.createElement('div');
        r.className = 'hp-onda'; r.style.left = x + 'px'; r.style.top = y + 'px';
        $('.hp-fx').append(r);
        setTimeout(() => r.remove(), 700);
    }
    const H = (my) => {
        const live = () => my === token;
        const wait = (ms, quick) => sleep(fast || quick ? 0 : ms);
        // What a step looks for; not found in time, the tests hear of it (opts.miss): a help that no longer finds its button
        // fails instead of going old without anyone noticing.
        const until = async (sel, ms = 8000) => {
            const t0 = Date.now();
            while (!el(sel) && Date.now() - t0 < ms) { await sleep(60); }
            if (!el(sel) && live() && opts.miss) { opts.miss(sel); }
            return el(sel);
        };
        const moveTo = async (sel, quick) => {
            const e = await until(sel);
            if (!e || !live()) { return null; }
            if (fast || quick) { return e; }
            // Out of sight (a panel that scrolls): brought into view first, as anyone would scroll to it.
            const r = e.getBoundingClientRect(), view = e.ownerDocument.defaultView;
            if (r.top < 0 || r.bottom > view.innerHeight) { e.scrollIntoView({ block: 'center', behavior: 'smooth' }); await sleep(600); }
            const c = center(e);
            cur.classList.remove('off');
            cur.style.left = (c.x - 4) + 'px'; cur.style.top = (c.y - 2) + 'px';
            await sleep(820);
            return e;
        };
        const press = async (sel, quick) => {
            const e = await moveTo(sel, quick);
            if (!e || !live()) { return; }
            if (!(fast || quick)) {
                const c = center(e);
                cur.classList.add('press'); ripple(c.x, c.y); await sleep(140); cur.classList.remove('press');
            }
            const x = el(sel) || e;   // the board may have drawn it again while the pointer travelled
            if (typeof x.click === 'function') { x.click(); } else {
                // A drawn handle (SVG): the finger goes down and up on it, and then the click.
                const w = x.ownerDocument.defaultView, b = x.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
                const o = { bubbles: true, cancelable: true, composed: true, pointerId: 42, pointerType: 'pen', isPrimary: true, clientX: cx, clientY: cy, button: 0 };
                x.dispatchEvent(new w.PointerEvent('pointerdown', Object.assign({ buttons: 1 }, o)));
                x.dispatchEvent(new w.PointerEvent('pointerup', Object.assign({ buttons: 0 }, o)));
                x.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, clientX: cx, clientY: cy }));
            }
            await wait(450, quick);
        };
        const type = async (sel, text, quick) => {
            const e = await moveTo(sel, quick);
            if (!e || !live()) { return; }
            e.focus();
            if (fast || quick) { e.value = text; e.dispatchEvent(new Event('input', { bubbles: true })); return; }
            e.value = '';   // typed in place of what was there
            for (const ch of text) {
                if (!live()) { return; }
                e.value += ch; e.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(text.length > 40 ? 28 : 55);
            }
        };
        const choose = async (sel, value, quick) => {
            const e = await moveTo(sel, quick);
            if (!e || !live()) { return; }
            if (!(fast || quick)) { const c = center(e); ripple(c.x, c.y); await sleep(250); }
            e.value = value; e.dispatchEvent(new Event('change', { bubbles: true }));
            await wait(400, quick);
        };
        // The same button pressed several times in a row: the pointer goes once and taps.
        const tap = async (sel, times, every = 200, quick) => {
            const first = await moveTo(sel, quick);
            if (!first || !live()) { return; }
            for (let n = 0; n < times; n++) {
                if (!live()) { return; }
                const e = el(sel) || first;
                if (!(fast || quick)) { const c = center(e); cur.classList.add('press'); ripple(c.x, c.y); await sleep(70); cur.classList.remove('press'); }
                e.click();
                await wait(every, quick);
            }
        };
        // A gesture with the finger, as a real one: pointer events from where it goes down, through the points (shares
        // of the box of sel, or pixels with o.px), to where it lifts, all to what captured the pointer if something did.
        const gesture = async (sel, pts, o = {}) => {
            const e = await until(sel);
            if (!e || !live() || !pts.length) { return; }
            const d = e.ownerDocument, w = d.defaultView, b = e.getBoundingClientRect();
            const Q = pts.map(([x, y]) => (o.px ? [b.left + x, b.top + y] : [b.left + x * b.width, b.top + y * b.height]));
            const target = d.elementFromPoint(Q[0][0], Q[0][1]) || e;
            const f = (w.frameElement || frame).getBoundingClientRect();
            const cursor = ([x, y]) => { cur.style.left = (f.left + x - 4) + 'px'; cur.style.top = (f.top + y - 2) + 'px'; };
            const proto = w.Element.prototype, capture = proto.setPointerCapture;
            let captured = null;
            proto.setPointerCapture = function (id) { if (id === 41) { captured = this; return undefined; } return capture.call(this, id); };
            const to = () => captured || (target.isConnected ? target : e);
            const fire = (kind, [x, y]) => to().dispatchEvent(new w.PointerEvent(kind, { bubbles: true, cancelable: true, composed: true,
                pointerId: 41, pointerType: 'pen', isPrimary: true, clientX: x, clientY: y, button: 0, buttons: kind === 'pointerup' ? 0 : 1,
                pressure: kind === 'pointerup' ? 0 : 0.5 }));
            if (!(fast || o.quick)) { cur.classList.remove('off'); cursor(Q[0]); await sleep(o.travel == null ? 700 : o.travel); cur.classList.add('press'); }
            fire('pointerdown', Q[0]);
            const every = fast || o.quick ? 0 : (o.every || 14), step = o.step || 7;
            for (let k = 1; k < Q.length; k++) {
                const [x0, y0] = Q[k - 1], [x1, y1] = Q[k], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
                for (let j = 1; j <= n; j++) {
                    if (!live()) { proto.setPointerCapture = capture; return; }
                    const q = [x0 + ((x1 - x0) * j) / n, y0 + ((y1 - y0) * j) / n];
                    fire('pointermove', q);
                    if (!(fast || o.quick)) { cursor(q); }
                    if (every) { await sleep(every); }
                }
            }
            if (o.hold) { await sleep(o.hold); }
            fire('pointerup', Q[Q.length - 1]);
            proto.setPointerCapture = capture;
            cur.classList.remove('press');
            await wait(o.after == null ? 350 : o.after, o.quick);
        };
        const drag = async (sel, dx, dy, o = {}) => {
            const e = await until(sel);
            if (!e) { return; }
            const b = e.getBoundingClientRect(), [fx, fy] = o.at || [0.5, 0.5];
            await gesture(sel, [[fx, fy], [fx + dx / Math.max(1, b.width), fy + dy / Math.max(1, b.height)]], Object.assign({ every: 16, step: 6 }, o));
        };
        const rect = async (sel) => { const e = await until(sel); return e ? e.getBoundingClientRect() : null; };
        const pause = (ms) => sleep(ms);
        // The teacher's phone beside the board, with the real page of the fixed remote (practicephone.js links it to
        // the practice board), or away.
        const phone = async (show, quick) => {
            const p = $('.hp-movil');
            if (!show) { p.classList.remove('on'); return; }
            await new Promise((ok) => { phoneFrame.addEventListener('load', ok, { once: true }); phoneFrame.src = `mando.html?hp=${Date.now()}#practica`; });
            p.classList.add('on');
            await wait(700, quick);
        };
        return { wait, pause, until, moveTo, press, type, choose, tap, draw: gesture, drag, gesture, rect, phone, live };
    };
    // Until what sel names has stayed put for longer than a poll of the board (1.5 s), or 8 s at most.
    const still = async (sel) => {
        let last = '', node = null, since = Date.now();
        const t0 = Date.now();
        while (Date.now() - t0 < 8000) {
            const e = el(sel), r = e && e.getBoundingClientRect(), now = r ? [r.left, r.top, r.width, r.height].map(Math.round).join() : '';
            if (now !== last || e !== node) { last = now; node = e; since = Date.now(); } else if (now && Date.now() - since > 1700) { return; }
            await sleep(100);
        }
    };
    // A fresh practice board (a new address, or the frame would only move to another fragment of the same page), and no
    // phone until a step brings it, linked to the new board.
    const loadBoard = () => new Promise((ok) => {
        if (box) { $('.hp-movil').classList.remove('on'); }
        frame.addEventListener('load', () => setTimeout(ok, fast ? 300 : 600), { once: true });
        const search = location.search.replace(/[?&]hp=\d+/, '');
        frame.src = `${location.pathname}${search ? search + '&' : '?'}hp=${Date.now()}#practica${P.quick ? '&rapido' : ''}`;
    });

    // --- «Now you» -----------------------------------------------------------------------------------------------------
    async function practice(my) {
        const h = H(my);
        cur.classList.add('off');
        $('.hp-turno').classList.add('on');
        await loadBoard();
        if (P.practice.prep) { await P.practice.prep(h); }
        await sleep(fast ? 0 : 1200);
        $('.hp-turno').classList.remove('on');
        $('#hp-skip').hidden = false;
        const targets = P.practice.targets;
        for (let k = 0; k < targets.length; k++) {
            if (!h.live()) { return; }
            const x = targets[k];
            if (x.delay) { await sleep(fast ? 0 : x.delay); }
            await h.until(x.sel);
            // What has to be on the board before this button makes sense (someone has pressed, the answers are in…).
            if (x.ready) { await h.until(x.ready, 20000); }
            // The button is still moving (answers arriving above it): ringed once it stays put.
            if (x.settle) { await still(x.sel); }
            // The ring and the hint follow the button if the board draws it again somewhere else.
            const place = () => {
                const e = el(x.sel);
                if (!e) { return; }
                const c = center(e), pad = 8, bar = $('.hp-barra').getBoundingClientRect().top;
                Object.assign(ring.style, { left: (c.r.left - pad) + 'px', top: (c.r.top - pad) + 'px', width: (c.r.width + pad * 2) + 'px', height: (c.r.height + pad * 2) + 'px' });
                const below = c.r.bottom + 18 + 80 < bar;
                hint.style.left = Math.max(12, Math.min(c.r.left, innerWidth - 380)) + 'px';
                hint.style.top = (below ? c.r.bottom + 18 : Math.max(12, c.r.top - 90)) + 'px';
            };
            place();
            const follow = setInterval(place, 200);
            ring.classList.add('on');
            hint.querySelector('small').textContent = t('hp_your_turn_n', { n: k + 1, all: targets.length });
            hint.querySelector('span').textContent = t(`hp_${ID}_h${k + 1}`);
            hint.classList.add('on');
            await new Promise((resolve) => {
                // What counts as done: a click on it, or another event (x.event), landing on it or on x.on.
                const d = docOf(x.sel), evt = x.event || 'click', on = bare(x.on || x.sel);
                const onDone = (ev) => { if (ev.target.closest && ev.target.closest(on)) { d.removeEventListener(evt, onDone, true); resolve(); } };
                d.addEventListener(evt, onDone, true);
                const stop = () => { if (!h.live()) { d.removeEventListener(evt, onDone, true); resolve(); } else { setTimeout(stop, 300); } };
                stop();
                if (opts.auto) { (async () => { await sleep(fast ? 50 : 1300); if (x.auto) { await x.auto(h); } else { await h.press(x.sel); } })(); }
            });
            clearInterval(follow);
            ring.classList.remove('on'); hint.classList.remove('on');
            await sleep(fast ? 0 : 400);
        }
        $('#hp-skip').hidden = true;
        if (h.live()) { practised = true; }
        await sleep(fast ? 0 : P.practice.after || 2000);
    }
    let practised = false;

    // --- The sticker: learned, and kept in Moodle --------------------------------------------------------------------
    function confetti() {
        const c = $('.hp-confeti'), r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
        c.width = r.width * d; c.height = r.height * d;
        const g = c.getContext('2d');
        g.scale(d, d);
        const cols = ['#ce1423', '#fbbe17', '#067e36', '#164281', '#5b2fb8', '#ea7317'];
        const ps = Array.from({ length: 170 }, (_, k) => ({ x: k % 2 ? r.width * 0.1 : r.width * 0.9, y: r.height, vx: (k % 2 ? 1 : -1) * (3 + Math.random() * 7),
            vy: -(9 + Math.random() * 9), s: 6 + Math.random() * 7, c: cols[k % cols.length], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4 }));
        const t0 = performance.now();
        (function tick(now) {
            g.clearRect(0, 0, r.width, r.height);
            ps.forEach((p) => {
                p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.a += p.va;
                g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
            });
            if (now - t0 < 3600 && box) { requestAnimationFrame(tick); } else { g.clearRect(0, 0, r.width, r.height); }
        })(t0);
    }
    const learn = (cromo) => {
        if (!stickers()) { return Promise.resolve(); }
        return fetch(AULA.logrosurl, { method: 'POST', credentials: 'same-origin',
            body: new URLSearchParams({ courseid: AULA.courseid, sesskey: AULA.sesskey, cromo, action: 'learn' }) })
            .then((r) => r.json()).then((j) => {
                if (j && j.learned) {
                    const L = AULA.logros;
                    L.learned = (L.learned || []).concat(cromo);
                }
            }).catch(() => {});
    };
    async function sticker() {
        const cromo = INDEX[ID].sticker;
        if (!stickers() || !practised) { await sleep(fast ? 0 : 1500); return; }
        const level = Math.max(0, Number((AULA.logros.levels || {})[cromo]) || 0);
        $('.hp-cromo').innerHTML = window.ClasstoolsLogros.draw(cromo, level, t, core.mode && core.mode() === 'advanced');
        await sleep(fast ? 0 : 300);
        $('.hp-premio').classList.add('on');
        confetti();
        learn(cromo);
        await sleep(fast ? 0 : 4800);
    }

    // --- The player ----------------------------------------------------------------------------------------------------
    const stepFn = (k) => (k < steps() ? (my) => P.steps[k](H(my)) : k === steps() ? practice : () => sticker());
    function paint() {
        const n = LAST() + 1;
        $('.hp-paso').textContent = !begun ? t('hp_guided') : i === steps() ? t('hp_step_you', { n: i + 1, all: n }) : t('hp_step', { n: i + 1, all: n });
        $('.hp-paso').classList.toggle('tu', i === steps());
        $('.hp-sub').textContent = begun ? caption(i) : '';
        [...$('.hp-puntos').children].forEach((d, k) => { d.classList.toggle('on', k === i && begun); d.classList.toggle('done', begun && (k < i || done)); });
        const play = $('#hp-play');
        play.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
        play.setAttribute('aria-label', t(playing ? 'hp_pause' : 'hp_play'));
        play.title = t(playing ? 'hp_pause' : 'hp_play');
    }
    const voiceDone = () => new Promise((r) => {
        if (vo.ended || !vo.src || vo.paused) { r(); return; }
        vo.addEventListener('ended', r, { once: true });
        vo.addEventListener('error', r, { once: true });
        vo.addEventListener('pause', r, { once: true });
    });
    // Without a voice, the time to read the caption.
    const reading = (k) => sleep(fast ? 0 : Math.max(2600, caption(k).length * 55));
    async function play(k) {
        const my = ++token;
        i = k; playing = true; fast = !!opts.fast; begun = true; done = false; paint();
        const src = fast ? '' : clip(k);
        let heard = Promise.resolve();
        if (src) {
            vo.src = src; vo.currentTime = 0;
            const p = vo.play();
            heard = new Promise((r) => {
                if (p && p.then) { p.then(() => voiceDone().then(r), () => reading(k).then(r)); } else { voiceDone().then(r); }
            });
        } else {
            vo.removeAttribute('src');
            heard = reading(k);
        }
        await Promise.all([heard, stepFn(k)(my)]);
        if (my !== token) { return; }
        await sleep(fast ? 0 : 600);
        if (my !== token) { return; }
        if (k < LAST()) { play(k + 1); return; }
        fadeBed(0, 2600);
        playing = false; done = true; cur.classList.add('off');
        paint();
        $('#hp-again').hidden = false;
        $('#hp-close').classList.add('fin');
        if (!opts.fast) { $('#hp-close').focus({ preventScroll: true }); }
    }
    // Jumping to a step: a fresh board, the steps before it done at once, then this one with its voice.
    async function jump(k) {
        const my = ++token;
        vo.pause();
        $('.hp-premio').classList.remove('on'); ring.classList.remove('on'); hint.classList.remove('on');
        $('#hp-again').hidden = true; $('#hp-skip').hidden = true; $('#hp-close').classList.remove('fin');
        if (k <= steps()) { practised = false; }
        fast = true;
        await loadBoard();
        if (P.setup) { await P.setup(H(my)); }
        for (let s = 0; s < Math.min(k, steps()); s++) { if (my !== token) { return; } await P.steps[s](H(my)); }
        fast = !!opts.fast;
        if (my === token) { play(k); }
    }

    const build = () => {
        box = document.createElement('div');
        box.className = 'hp';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', t(`hp_${ID}_title`));
        const n = LAST() + 1;
        box.innerHTML = `<div class="hp-escena">
                <iframe class="hp-pizarra" title="${escape(t('hp_practice_board'))}"></iframe>
                <div class="hp-movil" aria-hidden="true"><div class="hp-pantalla"><iframe class="hp-movil-marco" title="${escape(t('hp_practice_phone'))}"></iframe></div></div>
                <div class="hp-fx">
                    <div class="hp-anillo"></div>
                    <div class="hp-pista" aria-live="polite"><small></small><span></span></div>
                    <svg class="hp-cursor off" viewBox="0 0 34 40" aria-hidden="true"><path d="M3 2l26 18-12 2 7 13-5 3-7-13-9 8z" fill="#fff" stroke="#0f2f5e" stroke-width="2.4" stroke-linejoin="round"/></svg>
                    <div class="hp-turno"><div>${escape(t('hp_now_you'))}</div></div>
                </div>
                <div class="hp-premio"><div class="hp-cromo"></div></div>
                <canvas class="hp-confeti"></canvas>
                <button type="button" class="hp-puerta" id="hp-start"><span class="hp-disco">${ICON_PLAY}</span><b>${escape(t('hp_watch'))}</b>
                    <span>${escape(t(voice ? 'hp_watch_voice' : 'hp_watch_captions'))}</span></button>
            </div>
            <div class="hp-barra">
                <div><p class="hp-paso"></p><p class="hp-sub" aria-live="polite"></p></div>
                <div class="hp-mandos">
                    <div class="hp-botones">
                        <button type="button" id="hp-skip" class="hp-texto" hidden>${escape(t('hp_skip'))}</button>
                        <button type="button" id="hp-again" class="hp-texto" hidden>${escape(t('hp_again'))}</button>
                        <button type="button" id="hp-prev" aria-label="${escape(t('hp_prev'))}" title="${escape(t('hp_prev'))}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h2v14H7zM20 5v14L10 12z"/></svg></button>
                        <button type="button" id="hp-play"></button>
                        <button type="button" id="hp-next" aria-label="${escape(t('hp_next'))}" title="${escape(t('hp_next'))}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 5h2v14h-2zM4 5v14l10-7z"/></svg></button>
                        <button type="button" id="hp-cc" aria-pressed="true" aria-label="${escape(t('hp_captions'))}" title="${escape(t('hp_captions'))}">CC</button>
                        <button type="button" id="hp-close" aria-label="${escape(t('hp_close'))}" title="${escape(t('hp_close'))}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z"/></svg><span class="hp-cerrar-texto">${escape(t('hp_close_short'))}</span></button>
                    </div>
                    <div class="hp-puntos">${Array.from({ length: n }, (_, k) => `<i${k === steps() ? ' class="tu"' : ''}></i>`).join('')}</div>
                    <p class="hp-ficticio">${escape(t('hp_fictional'))}</p>
                </div>
            </div>`;
        document.body.append(box);
        frame = $('.hp-pizarra'); cur = $('.hp-cursor'); ring = $('.hp-anillo'); hint = $('.hp-pista'); phoneFrame = $('.hp-movil-marco');
        $('#hp-start').addEventListener('click', start);
        $('#hp-play').addEventListener('click', () => {
            if (playing) { playing = false; vo.pause(); fadeBed(0, 400); token++; paint(); } else { startBed(); jump(done ? 0 : i); }
        });
        $('#hp-prev').addEventListener('click', () => { startBed(); jump(Math.max(0, i - 1)); });
        $('#hp-next').addEventListener('click', () => { startBed(); jump(Math.min(LAST(), i + 1)); });
        $('#hp-again').addEventListener('click', () => { startBed(); jump(0); });
        $('#hp-skip').addEventListener('click', () => { practised = false; startBed(); jump(LAST()); });
        $('#hp-cc').addEventListener('click', () => {
            const on = $('.hp-sub').classList.toggle('off');
            $('#hp-cc').setAttribute('aria-pressed', String(!on));
        });
        $('#hp-close').addEventListener('click', close);
        // The board underneath does not hear the keys while the help is open; Escape closes it.
        document.addEventListener('keydown', keys, true);
        paint();
    };
    function keys(e) {
        if (!box) { return; }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
        if (!box.contains(e.target)) { e.stopPropagation(); }
    }
    async function start() {
        $('#hp-start').remove();
        startBed();
        fast = !!opts.fast;
        await loadBoard();
        if (P.setup) { const was = fast; fast = true; await P.setup(H(token)); fast = was; }
        play(0);
    }

    /**
     * Opens a help.
     *
     * @param {string} id
     * @param {{auto: boolean, fast: boolean, start: boolean, miss: Function}} o auto: «Now you» done by the pointer;
     *     fast: without waiting (for tests); start: without the gate; miss: told of what a step did not find.
     * @return {Promise}
     */
    const open = async (id, o = {}) => {
        if (!INDEX[id]) { return; }
        close();
        const all = await load();
        if (!all || !all[id]) { return; }
        ID = id; P = all[id]; opts = o; token = 0; i = 0; playing = false; begun = false; done = false; practised = false;
        const L = stickers() ? AULA.logros : null;
        had = !!(L && ((Number((L.levels || {})[INDEX[id].sticker]) || 0) > 0 || (L.learned || []).includes(INDEX[id].sticker)));
        voice = OPUS && INDEX[id].voice.includes(LANG) ? LANG : '';
        build();
        if (o.start) { await start(); } else { $('#hp-start').focus(); }
    };
    function close() {
        token++;
        vo.pause(); bed.pause(); clearInterval(bedTimer);
        document.removeEventListener('keydown', keys, true);
        if (box) { box.remove(); box = null; frame = null; }
    }
    // The helps of a guide (for the teacher's guide).
    const of = (guide) => Object.keys(INDEX).filter((id) => [].concat(INDEX[id].guide).includes(guide));

    core.help = { open, close, of };
    window.ClasstoolsHelp = { INDEX, open, close, of, state: () => ({ id: ID, step: i, playing, done, practised, had, voice }) };   // for automated tests
})();
