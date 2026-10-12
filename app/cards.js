// Printed cards to answer without devices, for «Hands up or cards» in «Live»: one card that is turned so the answer
// is on top (A, B, C and D, each side in the colour of its answer on the board, and in the middle its mark, which a
// camera can read: scanner.js), four separate cards A, B, C and D,
// the traffic light, or yes and no; with the names of a class list or numbered. They are printed from the board (a
// page per student, two to a page for the card that is turned) and work on their own: the class raises them and the
// teacher reads the colours, talks, asks, counts with + and − or groups them. «In groups» shows each answer as a big
// area of its colour (the corner, the hoop, the table of that colour) with a timer to talk with someone of another
// colour. «Read the cards» reads the marks with the camera of the board's computer, or takes what the teacher's phone
// reads (the fixed remote sends only card numbers and letters): the answers in bars, who is still to be read, and,
// on request, who answered what.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { t, escape, save, load, play, announce, setIcon } = core;

    // The colours of the answers, as on the board and the devices (the light ones, with dark letters).
    const COLOURS = {
        A: ['#ce1423'], B: ['#164281'], C: ['#fbbe17', true], D: ['#067e36'],
        yes: ['#067e36'], no: ['#ce1423'], green: ['#067e36'], yellow: ['#fbbe17', true], red: ['#ce1423'],
    };
    const FORMATS = { rotate: ['A', 'B', 'C', 'D'], four: ['A', 'B', 'C', 'D'], light: ['green', 'yellow', 'red'], yesno: ['yes', 'no'] };
    const label = (v) => (['yes', 'no', 'green', 'yellow', 'red'].includes(v) ? t('lv_' + v) : v);

    // --- Printing -------------------------------------------------------------------------------------------------
    // The cards of one student (or one number): HTML for the print page.
    const band = (v, side) => {
        const [c, light] = COLOURS[v];
        return `<div class="banda ${side}" style="background:${c};color:${light ? '#1c1a19' : '#fff'}"><span>${escape(v)}</span></div>`;
    };
    const cardsOf = (format, who, number = 0) => {
        const name = `<p class="quien">${escape(who)}</p>`;
        if (format === 'rotate') {
            // Each side, upright when it is turned to the top: A on top, B on the right, C at the bottom, D on the left;
            // the name and the number of the card in a corner, and the mark in the middle, with its white margin.
            const S = window.ClasstoolsScanner;
            const mark = S && number >= 1 && number <= S.MAX ? S.svg(number) : '';
            return `<div class="girar">${band('A', 'arriba')}${band('B', 'derecha')}${band('C', 'abajo')}${band('D', 'izquierda')}
                <p class="esquina">${escape(who)}${mark ? ` · ${number}` : ''}</p>
                <div class="centro">${mark || `${name}<p class="pista">${escape(t('tc_turn'))}</p>`}</div></div>`;
        }
        return `<div class="juego ${format}">${FORMATS[format].map((v) => {
            const [c, light] = COLOURS[v];
            const big = format === 'four' ? escape(v) : escape(label(v));
            return `<div class="carta" style="background:${c};color:${light ? '#1c1a19' : '#fff'}"><span class="grande">${big}</span>${name}</div>`;
        }).join('')}</div>`;
    };
    const STYLE = (font) => `
        @font-face { font-family: "Nunito"; font-weight: 200 1000; src: url("${font}") format("woff2-variations"); }
        @page { size: A4 portrait; margin: 8mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; font-family: "Nunito", system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .pagina { display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 280mm; page-break-after: always; break-after: page; }
        .pagina:last-child { page-break-after: auto; break-after: auto; }
        .girar { position: relative; width: 135mm; height: 135mm; border: .3mm dashed #9aa5b5; }
        .banda { position: absolute; display: flex; align-items: center; justify-content: center; font-weight: 1000; }
        .banda span { display: block; font-size: 16mm; line-height: 1; }
        .banda.arriba { top: 0; left: 0; right: 0; height: 20mm; }
        .banda.abajo { bottom: 0; left: 0; right: 0; height: 20mm; }
        .banda.abajo span { transform: rotate(180deg); }
        .banda.derecha { top: 20mm; right: 0; bottom: 20mm; width: 20mm; }
        .banda.derecha span { transform: rotate(90deg); }
        .banda.izquierda { top: 20mm; left: 0; bottom: 20mm; width: 20mm; }
        .banda.izquierda span { transform: rotate(-90deg); }
        .esquina { position: absolute; top: 1.5mm; left: 3mm; max-width: 45mm; margin: 0; overflow: hidden; color: #fff; font-size: 3.2mm; font-weight: 800; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis; }
        .centro { position: absolute; top: 20mm; right: 20mm; bottom: 20mm; left: 20mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3mm; text-align: center; }
        .centro svg { display: block; width: 100%; height: 100%; }
        .quien { margin: 0; color: #1c1a19; font-size: 5mm; font-weight: 900; line-height: 1.15; overflow-wrap: anywhere; }
        .pista { margin: 0; color: #55514d; font-size: 3.2mm; font-weight: 700; }
        .juego { display: grid; gap: 4mm; width: 194mm; height: 280mm; }
        .juego.four { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .juego.light { grid-template-rows: repeat(3, 1fr); }
        .juego.yesno { grid-template-rows: repeat(2, 1fr); }
        .carta { position: relative; display: flex; align-items: center; justify-content: center; border: .3mm dashed #9aa5b5; border-radius: 4mm; font-weight: 1000; }
        .carta .grande { font-size: 60mm; line-height: 1; }
        .juego.four .carta .grande { font-size: 90mm; }
        .juego.light .carta .grande, .juego.yesno .carta .grande { font-size: 20mm; }
        .carta .quien { position: absolute; right: 4mm; bottom: 3mm; color: inherit; font-size: 4mm; opacity: .85; }`;
    // The page, in a frame of the board that prints itself (no new window to be blocked); «dry» only gives the page.
    const print = (format, people, dry = false) => {
        const font = new URL('fonts/nunito-latin-wght-normal.woff2', document.baseURI).href;
        const pages = [];
        if (format === 'rotate') {
            for (let i = 0; i < people.length; i += 2) { pages.push(people.slice(i, i + 2).map((p, j) => cardsOf(format, p, i + j + 1)).join('')); }
        } else { people.forEach((p) => pages.push(cardsOf(format, p))); }
        const html = `<!doctype html><html lang="${escape(document.documentElement.lang || 'en')}"><head><meta charset="utf-8"><title>${escape(t('tc_title'))}</title>`
            + `<style>${STYLE(font)}</style></head><body>${pages.map((p) => `<section class="pagina">${p}</section>`).join('')}</body></html>`;
        if (dry) { return html; }
        const old = document.getElementById('ct-tarjetas-imprimir');
        if (old) { old.remove(); }
        const frame = document.createElement('iframe');
        frame.id = 'ct-tarjetas-imprimir';
        frame.setAttribute('aria-hidden', 'true');
        frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
        document.body.append(frame);
        const doc = frame.contentWindow.document;
        doc.open(); doc.write(html); doc.close();
        const go = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) { /* the browser said no */ } };
        // The letter first, so the cards print with it.
        (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 150));
        return html;
    };

    // The dialog: which cards, for whom.
    let dialog = null;
    const ask = () => {
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.className = 'editor';
            dialog.id = 'tc-dialogo';
            dialog.setAttribute('aria-labelledby', 'tc-titulo');
            dialog.innerHTML = `<form method="dialog">
                <h2 id="tc-titulo">${escape(t('tc_title'))}</h2>
                <label class="campo apilado"><span>${escape(t('tc_format'))}</span><select id="tc-format">
                    ${Object.keys(FORMATS).map((f) => `<option value="${f}">${escape(t('tc_f_' + f))}</option>`).join('')}</select></label>
                <label class="campo apilado"><span>${escape(t('tc_for'))}</span><select id="tc-for"></select></label>
                <label class="campo apilado" id="tc-count-box"><span>${escape(t('tc_count'))}</span><input type="number" id="tc-count" min="1" max="60" value="25"></label>
                <p class="nota" id="tc-note"></p>
                <div class="botonera">
                    <button type="button" class="boton" id="tc-print"><span data-icono="cartas"></span><span>${escape(t('tc_print'))}</span></button>
                    <button type="submit" class="boton suave" value="cancel">${escape(t('gen_cancel'))}</button>
                </div></form>`;
            document.body.append(dialog);
            dialog.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
            const $ = (s) => dialog.querySelector(s);
            const note = () => {
                $('#tc-count-box').hidden = $('#tc-for').value !== '';
                $('#tc-note').textContent = t($('#tc-format').value === 'rotate' ? 'tc_note_rotate' : 'tc_note_set');
            };
            $('#tc-format').addEventListener('change', () => { save('tarjetas-formato', $('#tc-format').value); note(); });
            $('#tc-for').addEventListener('change', note);
            $('#tc-print').addEventListener('click', () => {
                const list = core.lists().find((l) => l.id === $('#tc-for').value);
                const n = Math.max(1, Math.min(60, Number($('#tc-count').value) || 25));
                const people = list ? list.alumnos.slice() : Array.from({ length: n }, (_, i) => t('tc_card_n', i + 1));
                // The cards are read with this list (card n is its n-th student).
                save('tarjetas-lista', list ? list.id : '');
                save('tarjetas-cuantas', people.length);
                print($('#tc-format').value, people);
                dialog.close();
                announce(t('tc_printing'));
            });
            dialog.note = note;
        }
        const $ = (s) => dialog.querySelector(s);
        const lists = core.lists ? core.lists() : [];
        const active = core.activeList ? core.activeList() : null;
        $('#tc-for').innerHTML = lists.map((l) => `<option value="${escape(l.id)}">${escape(l.nombre)} (${l.alumnos.length})</option>`).join('')
            + `<option value="">${escape(t('tc_numbered'))}</option>`;
        $('#tc-for').value = active ? active.id : (lists[0] ? lists[0].id : '');
        $('#tc-format').value = FORMATS[load('tarjetas-formato', 'rotate')] ? load('tarjetas-formato', 'rotate') : 'rotate';
        dialog.note();
        dialog.showModal();
    };

    // --- In groups --------------------------------------------------------------------------------------------------
    // Each answer as a big area of its colour, with the hands counted, and a timer to talk with someone of another
    // colour before answering again.
    let talkTimer = 0;
    const groups = (stage, options, colourOf, counts, back) => {
        clearInterval(talkTimer);
        stage.innerHTML = `<div class="tc-grupos" data-n="${options.length}">${options.map((o, i) => {
            const [c, light] = colourOf(o, i);
            return `<div class="tc-zona${light ? ' claro' : ''}" style="--c:${c}"><strong>${escape(label(o))}</strong>${counts[i] ? `<span>${counts[i]}</span>` : ''}</div>`;
        }).join('')}</div>
            <p class="tc-consigna" id="tc-say">${escape(t('tc_groups_lead'))}</p>
            <div class="botonera centro lv-mandos">
                <button type="button" class="boton grande" id="tc-talk"><span data-icono="reloj"></span><span>${escape(t('tc_talk'))}</span></button>
                <button type="button" class="boton suave" id="tc-back"><span data-icono="anterior"></span><span>${escape(t('tc_back'))}</span></button>
            </div>`;
        stage.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        stage.querySelector('#tc-back').addEventListener('click', () => { clearInterval(talkTimer); back(); });
        stage.querySelector('#tc-talk').addEventListener('click', () => {
            // Two minutes to talk with someone of another colour, and then they answer again.
            clearInterval(talkTimer);
            const say = stage.querySelector('#tc-say');
            const end = Date.now() + 120000;
            play('tic');
            announce(t('tc_talk_now'));
            const tick = () => {
                const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
                say.textContent = `${t('tc_talk_now')} ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
                if (!left) { clearInterval(talkTimer); say.textContent = t('tc_talk_done'); play('cuentaFinal'); announce(t('tc_talk_done')); }
            };
            tick();
            talkTimer = setInterval(tick, 250);
        });
    };

    // --- Reading the cards -----------------------------------------------------------------------------------------
    // What has been read for the current question: card → answer (the last reading of each card counts).
    const read = new Map();
    // view: the reading area; its buttons are below it, in the same stage (box).
    let cam = null, loop = 0, view = null, box = null, names = false;
    const people = () => {
        const list = (core.lists ? core.lists() : []).find((l) => l.id === load('tarjetas-lista', ''));
        if (list) { return list.alumnos.slice(0, window.ClasstoolsScanner ? window.ClasstoolsScanner.MAX : 60); }
        const n = Math.max(1, Math.min(60, Number(load('tarjetas-cuantas', 25)) || 25));
        return Array.from({ length: n }, (_, i) => t('tc_card_n', i + 1));
    };
    const ABCD = ['A', 'B', 'C', 'D'];
    const paintRead = () => {
        if (!view || !view.isConnected) { return; }
        const all = people(), $ = (q) => view.querySelector(q);
        const counts = ABCD.map((a) => [...read.values()].filter((x) => x === a).length);
        const most = Math.max(1, ...counts);
        $('#tc-bars').innerHTML = ABCD.map((a, i) => {
            const [c, light] = COLOURS[a];
            const who = names ? [...read.entries()].filter(([, x]) => x === a).map(([id]) => all[id - 1] || t('tc_card_n', id)) : [];
            return `<div class="lv-barra"><span class="lv-op${light ? ' claro' : ''}" style="--c:${c}">${a}</span>`
                + `<span class="lv-pista"><i style="--c:${c}; width:${(100 * counts[i] / most).toFixed(1)}%"></i></span><strong>${counts[i]}</strong></div>`
                + (who.length ? `<p class="tc-quienes">${who.map(escape).join(', ')}</p>` : '');
        }).join('');
        const done = read.size;
        $('#tc-count').textContent = t('tc_scan_count', { n: done, of: all.length });
        const missing = all.map((p, i) => [p, i + 1]).filter(([, id]) => !read.has(id)).map(([p]) => p);
        $('#tc-missing').hidden = !missing.length || !read.size;
        $('#tc-missing-list').textContent = missing.join(', ');
    };
    // Readings: from the camera here or from the phone. A card beyond the list is not one of this class.
    const take = (list) => {
        let changed = false;
        const most = people().length;
        list.forEach(({ id, answer }) => { if (id <= most && read.get(id) !== answer) { read.set(id, answer); changed = true; } });
        if (changed) { play('tic'); paintRead(); }
        return changed;
    };
    const stopCam = () => {
        clearTimeout(loop); loop = 0;
        if (cam) { cam.getTracks().forEach((tr) => tr.stop()); cam = null; }
        if (view && view.isConnected) {
            view.querySelector('#tc-video').srcObject = null;
            view.querySelector('.tc-camara').classList.remove('encendida');
            core.relabel(box.querySelector('#tc-cam'), t('tc_scan_cam'), 'pantalla');
        }
    };
    const startCam = () => {
        const S = window.ClasstoolsScanner;
        if (!S || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { view.querySelector('#tc-nocam').hidden = false; return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
            .then((stream) => {
                if (!view || !view.isConnected) { stream.getTracks().forEach((tr) => tr.stop()); return; }
                cam = stream;
                const video = view.querySelector('#tc-video');
                video.srcObject = stream;
                video.play().catch(() => {});
                view.querySelector('.tc-camara').classList.add('encendida');
                view.querySelector('#tc-nocam').hidden = true;
                core.relabel(box.querySelector('#tc-cam'), t('tc_scan_stop'), 'pausa');
                const work = document.createElement('canvas'), wctx = work.getContext('2d', { willReadFrequently: true });
                const tick = () => {
                    if (!cam || !view || !view.isConnected) { stopCam(); return; }
                    if (video.videoWidth) {
                        const k = Math.min(1, 1280 / video.videoWidth);
                        work.width = Math.round(video.videoWidth * k); work.height = Math.round(video.videoHeight * k);
                        wctx.drawImage(video, 0, 0, work.width, work.height);
                        const got = S.detect(wctx.getImageData(0, 0, work.width, work.height));
                        take(got);
                        outline(got, work.width, work.height);
                    }
                    loop = setTimeout(tick, 150);
                };
                tick();
            })
            .catch(() => { view.querySelector('#tc-nocam').hidden = false; });
    };
    // The cards read in the picture, outlined in the colour of their answer, with their number.
    const outline = (got, w, h) => {
        const layer = view.querySelector('#tc-layer'), video = view.querySelector('#tc-video');
        layer.width = video.clientWidth; layer.height = video.clientHeight;
        const ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, layer.width, layer.height);
        // The picture fits the box keeping its shape (object-fit: contain).
        const k = Math.min(layer.width / w, layer.height / h), ox = (layer.width - w * k) / 2, oy = (layer.height - h * k) / 2;
        got.forEach(({ id, answer, corners }) => {
            ctx.strokeStyle = COLOURS[answer][0]; ctx.lineWidth = 4;
            ctx.beginPath();
            corners.forEach(([x, y], i) => { const X = ox + x * k, Y = oy + y * k; if (i) { ctx.lineTo(X, Y); } else { ctx.moveTo(X, Y); } });
            ctx.closePath(); ctx.stroke();
            ctx.fillStyle = COLOURS[answer][0]; ctx.font = 'bold 18px Nunito, sans-serif';
            ctx.fillText(`${id} ${answer}`, ox + corners[0][0] * k, oy + corners[0][1] * k - 6);
        });
    };
    const scan = (stage, back) => {
        clearInterval(talkTimer);
        stage.innerHTML = `<div class="tc-leer">
                <div class="tc-camara"><video id="tc-video" playsinline muted></video><canvas id="tc-layer" aria-hidden="true"></canvas>
                    <p class="nota" id="tc-nocam" hidden>${escape(t('tc_scan_nocam'))}</p>
                    <p class="nota tc-pista">${escape(t('tc_scan_hint'))}</p></div>
                <div class="tc-lecturas">
                    <p class="lv-grande" id="tc-count" aria-live="polite"></p>
                    <div class="lv-barras" id="tc-bars"></div>
                    <details id="tc-missing" hidden><summary>${escape(t('tc_scan_missing'))}</summary><p id="tc-missing-list"></p></details>
                    <label class="interruptor"><input type="checkbox" id="tc-names"><span>${escape(t('tc_scan_names'))}</span></label>
                </div>
            </div>
            <div class="botonera centro lv-mandos">
                <button type="button" class="boton" id="tc-cam"><span data-icono="pantalla"></span><span>${escape(t('tc_scan_cam'))}</span></button>
                <button type="button" class="boton suave" id="tc-new"><span data-icono="reiniciar"></span><span>${escape(t('tc_scan_new'))}</span></button>
                <button type="button" class="boton suave" id="tc-back"><span data-icono="anterior"></span><span>${escape(t('tc_back'))}</span></button>
            </div>
            <p class="nota centro">${escape(t('tc_scan_phone'))}</p>`;
        view = stage.querySelector('.tc-leer'); box = stage;
        stage.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        const $ = (q) => stage.querySelector(q);
        $('#tc-names').checked = names;
        $('#tc-names').addEventListener('change', () => { names = $('#tc-names').checked; paintRead(); });
        $('#tc-cam').addEventListener('click', () => { if (cam) { stopCam(); } else { startCam(); } });
        $('#tc-new').addEventListener('click', () => { read.clear(); paintRead(); play('tic'); });
        $('#tc-back').addEventListener('click', () => { stopCam(); view = null; back(); });
        paintRead();
    };
    // From the phone: «cards_7a12c…» (card number and answer, many at once).
    const fromPhone = (cmd) => {
        const list = [...String(cmd).slice(6).matchAll(/([0-9]{1,2})([abcd])/g)].map((m) => ({ id: Number(m[1]), answer: m[2].toUpperCase() }));
        if (!list.length) { return; }
        if ((!view || !view.isConnected) && core.liveOpenScan) { core.liveOpenScan(); }
        take(list);
    };

    window.ClasstoolsCards = { ask, print, groups, cardsOf, scan, take, fromPhone, read: () => new Map(read) };
})();
