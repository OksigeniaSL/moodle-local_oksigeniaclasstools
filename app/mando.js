// The teacher's fixed remote, on the phone: the address with its key, without logging in. It shows the teacher's
// boards that are open (the course of each, nothing about the students); with more than one, it asks which one. On top,
// the buttons of the tool on the board (the groups: how many, «Make groups»; a game: «Right», «Wrong», «Pass»), as the
// board sends them; under «More orders», the ones for any tool: the timer, a pick, whose turn, presenting… It asks
// the site every two seconds which boards are open. «Read the cards» turns the phone into the reader of the printed
// cards: the camera, each card outlined in the colour of its answer, and the readings sent to the board (only the
// numbers of the cards and their answers: the names are on the board).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const R = window.CLASSTOOLS_REMOTE || {};
    const STR = R.str || {};
    const root = document.getElementById('jn');
    const t = (key, a) => { let s = STR[key] || key; if (a !== undefined) { s = s.split('{$a}').join(a); } return s; };
    const escape = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const buzz = () => { if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* no vibration */ } } };
    const head = () => `<header class="jn-cabeza"><span>${escape(R.site || '')}</span><strong>${escape(t('rm_title'))}</strong></header>`;
    const screen = (title, text = '', extra = '') => {
        root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-titulo">${escape(title)}</p>${text ? `<p class="jn-texto">${escape(text)}</p>` : ''}${extra}</div>`;
    };
    if (!R.k) { screen(t('rm_off_title'), t('rm_off_text')); return; }

    const COMMANDS = [['tm_toggle', 'lv_cmd_timer', 'grande'], ['tm_reset', 'lv_cmd_reset'], ['tm_plus', 'lv_cmd_plus'],
        ['pick', 'lv_cmd_pick'], ['turn', 'rm_cmd_turn'], ['next', 'rm_cmd_next'], ['present', 'lv_cmd_present'],
        ['tab_prev', 'lv_cmd_prev'], ['tab_next', 'lv_cmd_next'], ['live', 'rm_cmd_live'], ['relay', 'rm_cmd_relay'],
        ['curtain', 'rm_cmd_curtain'], ['reveal', 'rm_cmd_reveal']];
    const post = (action, extra = {}) => fetch(R.api, { method: 'POST', body: new URLSearchParams({ k: R.k, action, ...extra }) })
        .then((r) => r.json());
    let boards = [], course = Number(localStorage.getItem('mando-curso')) || 0, shown = '', timer = 0, failures = 0, last = '';
    const board = () => boards.find((b) => b.course === course) || boards[0] || null;

    const render = () => {
        if (scanning) { return; }
        const b = board();
        if (!b) { shown = ''; screen(t('rm_no_board_title'), t('rm_no_board_text'), '<div class="jn-espera" aria-hidden="true"><i></i><i></i><i></i></div>'); return; }
        course = b.course;
        // Painted again only when the boards, the one chosen or its tool change: a tap is not lost under the finger. The
        // buttons of the tool, only when they change.
        const mine = Array.isArray(b.here) ? b.here : [];
        const key = JSON.stringify([boards.map((x) => [x.course, x.name]), b.course, b.tool, b.tools, mine.length > 0]);
        if (key === shown) { paintHere(mine); return; }
        shown = key;
        const tools = b.tools || [], now = tools.find((x) => x[0] === b.tool);
        // Under «More orders», not what the tool already has on top (the timer's own, the curtain on the board).
        const dup = new Set(mine.flat().map((x) => x[0]).concat(b.tool === 'temporizador' ? ['tm_toggle', 'tm_reset', 'tm_plus'] : []));
        const general = `<div class="jn-mando">${COMMANDS.filter(([c]) => !dup.has(c)).map(([c, k, cls]) => `<button type="button" class="${mine.length ? '' : cls || ''}" data-cmd="${c}">${escape(t(k))}</button>`).join('')}</div>`;
        root.innerHTML = `${head()}
            ${boards.length > 1 ? `<div class="jn-tablas" role="radiogroup" aria-label="${escape(t('rm_which'))}">${boards.map((x) => `<button type="button" role="radio" aria-checked="${x.course === b.course}" data-course="${x.course}">${escape(x.name)}</button>`).join('')}</div>` : `<p class="jn-texto">${escape(b.name)}</p>`}
            ${now ? `<p class="jn-texto">${escape(t('rm_on_board', now[1]))}</p>` : ''}
            ${mine.length ? '<div class="jn-aqui" id="jn-aqui"></div>' : general}
            <p class="jn-texto" id="jn-hecho" aria-live="polite">${escape(last) || '&nbsp;'}</p>
            ${mine.length ? `<details class="jn-herramientas" id="jn-mas"><summary>${escape(t('rm_more'))}</summary>${general}</details>` : ''}
            ${window.ClasstoolsScanner ? `<button type="button" class="jn-boton jn-leer-boton" id="jn-leer">${escape(t('rm_scan'))}</button>` : ''}
            <details class="jn-herramientas" id="jn-clases"><summary>${escape(t('rm_course'))}</summary><p class="jn-texto">${escape(t('rm_course_hint'))}</p><div class="jn-mando" id="jn-clases-lista"></div></details>
            ${tools.length ? `<details class="jn-herramientas"><summary>${escape(t('rm_tools'))}</summary><div class="jn-mando">${tools.map(([id, name]) => `<button type="button" data-cmd="tool_${escape(id)}"${id === b.tool ? ' aria-current="true"' : ''}>${escape(name)}</button>`).join('')}</div></details>` : ''}`;
        paintHere(mine);
    };
    // The buttons of the tool on the board, in its rows: the main one wide, the one that is on marked, right and wrong in
    // their colours, a value between its two steps (then «−» and «+»), a line of text.
    function paintHere(rows) {
        const box = document.getElementById('jn-aqui'), key = JSON.stringify(rows);
        if (!box || box.dataset.key === key) { return; }
        box.dataset.key = key;
        box.innerHTML = rows.map((row) => {
            const steps = row.some((x) => x[2] === 'val');
            // As many in a line as fit: short names (1 min, +5), up to five; three of a game («Right», «Wrong», «Pass»).
            const n = steps ? row.length : row.every((x) => x[1].length <= 6) ? Math.min(row.length, 5)
                : row.length === 3 && row.every((x) => x[1].length <= 12) ? 3 : Math.min(row.length, 2);
            return `<div class="jn-mando jn-fila${steps ? ' jn-pasos' : ''}${n > 3 ? ' jn-cortos' : ''}" style="--n:${n}">${row.map(([cmd, name, how]) => {
                if (how === 'txt') { return `<p class="jn-linea">${escape(name)}</p>`; }
                if (how === 'val') { return `<output class="jn-valor">${escape(name)}</output>`; }
                const glyph = steps && (how === 'less' || how === 'more');
                return `<button type="button" class="${{ big: 'grande', yes: 'jn-si', no: 'jn-no' }[how] || ''}" data-cmd="${escape(cmd)}" data-name="${escape(name)}"${how === 'on' ? ' aria-pressed="true"' : ''}${glyph ? ` aria-label="${escape(name)}">${how === 'less' ? '−' : '+'}` : `>${escape(name)}`}</button>`;
            }).join('')}</div>`;
        }).join('');
    }
    // --- Reading the printed cards ----------------------------------------------------------------------------------
    let scanning = false, stream = null, loop = 0, sendTimer = 0;
    const seen = new Map(), pending = new Map();
    const COLOURS = { A: '#ce1423', B: '#164281', C: '#fbbe17', D: '#067e36' };
    const send = () => {
        clearTimeout(sendTimer);
        if (!scanning) { return; }
        const batch = [...pending.entries()].slice(0, 20);
        if (batch.length) {
            const cmd = 'cards_' + batch.map(([id, a]) => `${id}${a.toLowerCase()}`).join('');
            post('command', { cmd, course }).then((v) => {
                if (v && v.ok) { batch.forEach(([id, a]) => { if (pending.get(id) === a) { pending.delete(id); } }); }
                const note = document.getElementById('jn-leer-nota');
                if (note && v && v.why === 'closed') { note.textContent = t('rm_closed'); }
            }).catch(() => {});
        }
        sendTimer = setTimeout(send, 1000);
    };
    const stopScan = () => {
        scanning = false;
        clearTimeout(loop); clearTimeout(sendTimer);
        if (stream) { stream.getTracks().forEach((tr) => tr.stop()); stream = null; }
        shown = ''; render();
    };
    const startScan = () => {
        scanning = true;
        seen.clear(); pending.clear();
        root.innerHTML = `${head()}<div class="jn-leer">
            <div class="jn-camara"><video id="jn-video" playsinline muted></video><canvas id="jn-capa" aria-hidden="true"></canvas></div>
            <p class="jn-titulo" id="jn-leidas" aria-live="polite">${escape(t('rm_scan_count', 0))}</p>
            <p class="jn-texto" id="jn-leer-nota">${escape(t('rm_scan_hint'))}</p>
            <ol class="jn-ultimas" id="jn-ultimas"></ol>
            <button type="button" class="jn-boton suave" id="jn-leer-fin">${escape(t('rm_scan_back'))}</button></div>`;
        document.getElementById('jn-leer-fin').addEventListener('click', () => { buzz(); stopScan(); });
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { document.getElementById('jn-leer-nota').textContent = t('rm_scan_nocam'); return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
            .then((s) => {
                if (!scanning) { s.getTracks().forEach((tr) => tr.stop()); return; }
                stream = s;
                const video = document.getElementById('jn-video'), layer = document.getElementById('jn-capa');
                video.srcObject = s; video.play().catch(() => {});
                const work = document.createElement('canvas'), wctx = work.getContext('2d', { willReadFrequently: true });
                const tick = () => {
                    if (!scanning) { return; }
                    if (video.videoWidth) {
                        const k = Math.min(1, 1280 / video.videoWidth);
                        work.width = Math.round(video.videoWidth * k); work.height = Math.round(video.videoHeight * k);
                        wctx.drawImage(video, 0, 0, work.width, work.height);
                        const got = window.ClasstoolsScanner.detect(wctx.getImageData(0, 0, work.width, work.height));
                        // The cards read, outlined over the picture in the colour of their answer.
                        layer.width = video.clientWidth; layer.height = video.clientHeight;
                        const ctx = layer.getContext('2d'), f = Math.min(layer.width / work.width, layer.height / work.height);
                        const ox = (layer.width - work.width * f) / 2, oy = (layer.height - work.height * f) / 2;
                        ctx.clearRect(0, 0, layer.width, layer.height);
                        let fresh = false;
                        got.forEach(({ id, answer, corners }) => {
                            ctx.strokeStyle = COLOURS[answer]; ctx.lineWidth = 5; ctx.beginPath();
                            corners.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * f, oy + y * f) : ctx.moveTo(ox + x * f, oy + y * f)));
                            ctx.closePath(); ctx.stroke();
                            if (seen.get(id) !== answer) { seen.set(id, answer); pending.set(id, answer); fresh = true; }
                        });
                        if (fresh) {
                            buzz();
                            document.getElementById('jn-leidas').textContent = t('rm_scan_count', seen.size);
                            document.getElementById('jn-ultimas').innerHTML = [...seen.entries()].reverse().slice(0, 8)
                                .map(([id, a]) => `<li style="--c:${COLOURS[a]}"><b>${a}</b> ${escape(t('rm_scan_card', id))}</li>`).join('');
                        }
                    }
                    loop = setTimeout(tick, 200);
                };
                tick();
                send();
            })
            .catch(() => { const n = document.getElementById('jn-leer-nota'); if (n) { n.textContent = t('rm_scan_nocam'); } });
    };

    // Changing the class: the teacher's courses (asked for when the list is opened), and the board goes to the one
    // chosen; the phone follows it.
    root.addEventListener('toggle', (e) => {
        if (e.target.id !== 'jn-clases' || !e.target.open) { return; }
        const box = document.getElementById('jn-clases-lista');
        post('courses').then((v) => {
            const list = (v && v.courses) || [];
            box.innerHTML = list.filter((c) => c.id !== course).map((c) => `<button type="button" data-goto="${c.id}">${escape(c.name)}</button>`).join('')
                || `<p class="jn-texto">${escape(t('rm_course_none'))}</p>`;
        }).catch(() => { box.innerHTML = `<p class="jn-texto">${escape(t('lv_offline'))}</p>`; });
    }, true);
    root.addEventListener('click', (e) => {
        if (e.target.closest('#jn-leer')) { buzz(); startScan(); return; }
        const goto = e.target.closest('[data-goto]');
        if (goto) {
            buzz();
            const to = Number(goto.dataset.goto), name = goto.textContent;
            post('command', { cmd: `course_${to}`, course }).then((v) => {
                const done = document.getElementById('jn-hecho');
                if (v && v.ok) {
                    last = t('rm_course_going', name);
                    // The phone follows the board to its new course.
                    course = to; localStorage.setItem('mando-curso', String(to));
                } else { last = v && v.why === 'closed' ? t('rm_closed') : ''; }
                if (done) { done.textContent = last || ' '; }
            }).catch(() => {});
            return;
        }
        const pick = e.target.closest('[data-course]');
        if (pick) { course = Number(pick.dataset.course); localStorage.setItem('mando-curso', String(course)); shown = ''; render(); return; }
        const b = e.target.closest('[data-cmd]');
        if (!b) { return; }
        buzz();
        const cmd = b.dataset.cmd, label = b.dataset.name || (cmd.startsWith('tool_') ? b.textContent : t((COMMANDS.find((x) => x[0] === cmd) || [])[1] || ''));
        post('command', { cmd, course }).then((v) => {
            if (v && v.off) { stop(); screen(t('rm_off_title'), t('rm_off_text')); return; }
            last = v && v.ok ? `${label} · ${t('lv_sent')}` : (v && v.why === 'closed' ? t('rm_closed') : '');
            const done = document.getElementById('jn-hecho');
            if (done) { done.textContent = last || ' '; }
            // Closed, or that button is no longer on the board: what there is now. Sent: soon, to see how it was left.
            if (v && (v.why === 'closed' || v.why === 'gone')) { poll(); } else if (v && v.ok && timer !== -1) { clearTimeout(timer); timer = setTimeout(poll, 1200); }
        }).catch(() => { const done = document.getElementById('jn-hecho'); if (done) { done.textContent = t('lv_offline'); } });
    });

    const poll = () => {
        clearTimeout(timer);
        if (document.hidden) { return; }
        post('state').then((v) => {
            failures = 0;
            if (v && v.off) { stop(); screen(t('rm_off_title'), t('rm_off_text')); return; }
            boards = Array.isArray(v && v.boards) ? v.boards : [];
            render();
        }).catch(() => {
            failures++;
            if (failures === 3) { const n = document.createElement('p'); n.className = 'jn-aviso'; n.textContent = t('lv_offline'); root.append(n); shown = ''; }
        }).finally(() => { if (timer !== -1) { timer = setTimeout(poll, 2000); } });
    };
    function stop() { clearTimeout(timer); timer = -1; }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && timer !== -1) { poll(); } });
    screen(t('rm_title'));
    poll();
})();
