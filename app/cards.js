// Printed cards to answer without devices, for «Hands up or cards» in «Live»: one card that is turned so the answer
// is on top (A, B, C and D, each side in the colour of its answer on the board), four separate cards A, B, C and D,
// the traffic light, or yes and no; with the names of a class list or numbered. They are printed from the board (a
// page per student, two to a page for the card that is turned) and work on their own: the class raises them and the
// teacher reads the colours, talks, asks, counts with + and − or groups them. «In groups» shows each answer as a big
// area of its colour (the corner, the hoop, the table of that colour) with a timer to talk with someone of another
// colour.
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
    const cardsOf = (format, who) => {
        const name = `<p class="quien">${escape(who)}</p>`;
        if (format === 'rotate') {
            // Each side, upright when it is turned to the top: A on top, B on the right, C at the bottom, D on the left.
            return `<div class="girar">${band('A', 'arriba')}${band('B', 'derecha')}${band('C', 'abajo')}${band('D', 'izquierda')}
                <div class="centro">${name}<p class="pista">${escape(t('tc_turn'))}</p></div></div>`;
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
        .banda span { display: block; font-size: 26mm; line-height: 1; }
        .banda.arriba { top: 0; left: 0; right: 0; height: 32mm; }
        .banda.abajo { bottom: 0; left: 0; right: 0; height: 32mm; }
        .banda.abajo span { transform: rotate(180deg); }
        .banda.derecha { top: 32mm; right: 0; bottom: 32mm; width: 32mm; }
        .banda.derecha span { transform: rotate(90deg); }
        .banda.izquierda { top: 32mm; left: 0; bottom: 32mm; width: 32mm; }
        .banda.izquierda span { transform: rotate(-90deg); }
        .centro { position: absolute; top: 32mm; right: 32mm; bottom: 32mm; left: 32mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3mm; padding: 3mm; text-align: center; }
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
            for (let i = 0; i < people.length; i += 2) { pages.push(people.slice(i, i + 2).map((p) => cardsOf(format, p)).join('')); }
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

    window.ClasstoolsCards = { ask, print, groups, cardsOf };
})();
