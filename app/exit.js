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
 * The exit ticket on the board, for a live session of kind «exit»: at the end of the lesson each student says how they
 * are getting on (four faces, from «not yet» to «could explain it») and answers one to three short questions from
 * their device. While it is open, the board shows only who has handed it in (the ticket to leave); once closed, how
 * the class is getting on, and the tickets in piles by how each student feels, so the teacher sees at a glance who
 * needs what in the next lesson. The answers do not show until the teacher asks for them (they are checked first, not
 * projected by surprise), names only on request, one at random without a name to talk about it, and a download to
 * read them calmly after class, since the session goes after a day.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { t, escape, save, load, play, announce, setIcon } = core;
    const F = window.ClasstoolsFaces;

    // Questions to choose from, by what they ask (the four kinds of exit slip prompts of Marzano, 2012).
    const SUGGEST = {
        lv_ex_g_understand: ['learned', 'doubt', 'confused', 'words', 'example', 'use'],
        lv_ex_g_self: ['effort', 'better'],
        lv_ex_g_lesson: ['activity', 'group'],
        lv_ex_g_teacher: ['teacher'],
    };
    const MAX = 3;
    const cfg = Object.assign({ feel: true, prompts: [t('lv_ex_p_learned'), t('lv_ex_p_doubt'), ''] }, load('salida', {}));
    cfg.prompts = Array.from({ length: MAX }, (_, i) => String((cfg.prompts || [])[i] || '').slice(0, 140));
    const keep = () => save('salida', cfg);

    let S = null, act = null, stage = null, phase = '', round = -1, editing = false;
    let showAnswers = false, names = false, group = load('salida-grupo', 'feel') === 'time' ? 'time' : 'feel';
    const hidden = new Set();
    const CONTENT = window.CLASSTOOLS_CONTENT || {};
    // The name on the board: theirs with their account, their critter's without it.
    const nameOf = (d, i) => {
        if (S.identity === 'moodle') { return d.name || t('lv_device_n', i + 1); }
        return window.ClasstoolsCritter && CONTENT.avatar ? window.ClasstoolsCritter.name(d.device, CONTENT.avatar) : t('lv_device_n', i + 1);
    };
    const critter = (device) => (S.identity !== 'moodle' && window.ClasstoolsCritter ? window.ClasstoolsCritter.svg(device) : '');
    const face = (level) => (F && level !== '' ? `<span class="ex-cara">${F.svg(level)}</span>` : '');
    const icons = (box) => box.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));

    // ---------------------------------------------------------------------------------------------------
    // The ticket: whether it asks how they are getting on, and its questions (kept in the browser)
    // ---------------------------------------------------------------------------------------------------
    const editor = () => {
        phase = 'editor';
        const options = `<option value="">${escape(t('lv_ex_ideas'))}</option>` + Object.entries(SUGGEST).map(([g, keys]) => `<optgroup label="${escape(t(g))}">`
            + keys.map((k) => `<option value="${escape(t('lv_ex_p_' + k))}">${escape(t('lv_ex_p_' + k))}</option>`).join('') + '</optgroup>').join('');
        stage.innerHTML = `<div class="ex-editor">
            <header class="ex-cabeza"><span class="ex-ico" aria-hidden="true">${core.icon('billete')}</span>
                <div><h3>${escape(t('lv_ex_title'))}</h3><p class="nota">${escape(t('lv_ex_lead'))}</p></div></header>
            <div class="ex-bloque">
                <label class="interruptor"><input type="checkbox" id="ex-feel"><span>${escape(t('lv_ex_feel_on'))}</span></label>
                <div class="ex-muestra" id="ex-sample">${F ? F.LEVELS.map((l) => `<span>${face(l)}<small>${escape(t('lv_ex_f' + l))}</small></span>`).join('') : ''}</div>
            </div>
            ${cfg.prompts.map((q, i) => `<div class="ex-bloque ex-pregunta">
                <label class="campo apilado"><span>${escape(t('lv_ex_q_n', i + 1))}</span>
                    <input type="text" id="ex-q${i}" maxlength="140" placeholder="${escape(t(i ? 'lv_ex_q_optional' : 'lv_ex_q_ph'))}"></label>
                <select data-i="${i}" aria-label="${escape(t('lv_ex_ideas'))}" title="${escape(t('lv_ex_ideas'))}">${options}</select></div>`).join('')}
            <p class="nota lv-error" id="ex-error" role="alert" hidden>${escape(t('lv_ex_nothing'))}</p>
            <div class="botonera centro lv-mandos">
                <button type="button" class="boton grande" id="ex-open"><span data-icono="empezar"></span><span>${escape(t('lv_ex_open'))}</span></button>
                <button type="button" class="boton suave" id="ex-back" hidden><span data-icono="anterior"></span><span>${escape(t('lv_ex_back'))}</span></button>
            </div>
            <p class="nota ex-primero" id="ex-first">${escape(t('lv_ex_first'))}</p>
        </div>`;
        icons(stage);
        const $ = (s) => stage.querySelector(s);
        $('#ex-feel').checked = !!cfg.feel;
        $('#ex-sample').classList.toggle('apagada', !cfg.feel);
        $('#ex-feel').addEventListener('change', () => { cfg.feel = $('#ex-feel').checked; keep(); $('#ex-sample').classList.toggle('apagada', !cfg.feel); });
        cfg.prompts.forEach((q, i) => {
            const input = $(`#ex-q${i}`);
            input.value = q;
            input.addEventListener('input', () => { cfg.prompts[i] = input.value; keep(); });
        });
        stage.querySelectorAll('select[data-i]').forEach((sel) => sel.addEventListener('change', () => {
            if (!sel.value) { return; }
            const input = $(`#ex-q${sel.dataset.i}`);
            // «Explain it in your own words: …» waits for what to explain.
            input.value = sel.value; cfg.prompts[sel.dataset.i] = sel.value; keep();
            sel.value = ''; input.focus(); input.setSelectionRange(input.value.length, input.value.length);
        }));
        const ready = !!S;
        $('#ex-open').hidden = !ready; $('#ex-first').hidden = ready;
        $('#ex-back').hidden = !(S && S.round);
        $('#ex-back').addEventListener('click', () => { editing = false; draw(true); });
        $('#ex-open').addEventListener('click', () => {
            const prompts = cfg.prompts.map((q) => q.trim()).filter(Boolean);
            if (!cfg.feel && !prompts.length) { $('#ex-error').hidden = false; return; }
            editing = false;
            act('open', { feel: cfg.feel ? 1 : 0, prompts: JSON.stringify(prompts) }); play('tic');
        });
    };

    // ---------------------------------------------------------------------------------------------------
    // Open: who has handed it in, and who has not yet
    // ---------------------------------------------------------------------------------------------------
    const progress = (fresh) => {
        if (fresh || phase !== 'open') {
            phase = 'open';
            stage.innerHTML = `<div class="lv-centro ex-abierto">
                    <p class="lv-ronda" id="ex-round"></p>
                    <p class="lv-grande" id="ex-count" aria-live="polite"></p>
                    <span class="lv-reloj-pista ex-pista"><i id="ex-bar"></i></span>
                    <div class="ex-quien"><p class="ante">${escape(t('lv_ex_in'))}</p><ul id="ex-done"></ul></div>
                    <div class="ex-quien ex-faltan"><p class="ante">${escape(t('lv_ex_missing'))}</p><ul id="ex-missing"></ul></div>
                    <p class="nota">${escape(t('lv_ex_door'))}</p>
                </div>
                <div class="botonera centro lv-mandos"><button type="button" class="boton grande amarillo" id="ex-close"><span data-icono="pausa"></span><span>${escape(t('lv_ex_close'))}</span></button></div>`;
            icons(stage);
            stage.querySelector('#ex-close').addEventListener('click', () => {
                // A real exit ticket for the sticker: handed in by as many as a live session needs.
                if (core.logro && core.logros && S.tickets.length >= core.logros.thr.devices) { core.logro('picabilletes'); }
                act('close'); play('cuenta');
            });
        }
        const $ = (s) => stage.querySelector(s);
        const done = new Set(S.tickets.map((x) => x.device));
        const all = S.devices.length, n = S.tickets.length;
        $('#ex-round').textContent = t('lv_ex_n', S.round);
        $('#ex-count').textContent = t('lv_ex_handed', { n, of: all });
        $('#ex-bar').style.width = `${all ? (100 * n / all).toFixed(1) : 0}%`;
        const chip = (d, i) => `<li>${critter(d.device)}<span>${escape(nameOf(d, i))}</span></li>`;
        const html = S.devices.map((d, i) => [d, i]).filter(([d]) => done.has(d.device)).map(([d, i]) => chip(d, i)).join('');
        const miss = S.devices.map((d, i) => [d, i]).filter(([d]) => !done.has(d.device)).map(([d, i]) => chip(d, i)).join('');
        if ($('#ex-done').dataset.html !== html) { $('#ex-done').innerHTML = html; $('#ex-done').dataset.html = html; }
        if ($('#ex-missing').dataset.html !== miss) { $('#ex-missing').innerHTML = miss; $('#ex-missing').dataset.html = miss; }
        $('#ex-missing').closest('.ex-quien').hidden = !miss;
    };

    // ---------------------------------------------------------------------------------------------------
    // Closed: how the class is getting on, and the tickets in piles
    // ---------------------------------------------------------------------------------------------------
    const visibleTickets = () => S.tickets.filter((x) => !hidden.has(x.device));
    const summary = (fresh) => {
        if (fresh || phase !== 'closed') {
            phase = 'closed';
            stage.innerHTML = `<div class="ex-resumen">
                    <p class="lv-ronda" id="ex-round"></p>
                    <div class="lv-barras ex-barras" id="ex-bars"></div>
                    <p class="ex-cuenta" id="ex-total"></p>
                    <p class="nota ex-velo" id="ex-veil">${escape(t('lv_ex_veil'))}</p>
                    <div class="ex-montones" id="ex-piles" hidden></div>
                    <div class="ex-azar" id="ex-random-card" hidden></div>
                </div>
                <div class="botonera centro lv-mandos">
                    <button type="button" class="boton" id="ex-show"><span data-icono="lista"></span><span></span></button>
                    <button type="button" class="boton suave" id="ex-random"><span data-icono="azar"></span><span>${escape(t('lv_ex_random'))}</span></button>
                    <select id="ex-group" aria-label="${escape(t('lv_ex_group'))}" title="${escape(t('lv_ex_group'))}">
                        <option value="feel">${escape(t('lv_ex_group_feel'))}</option><option value="time">${escape(t('lv_ex_group_time'))}</option></select>
                    <label class="interruptor" id="ex-names-box"><input type="checkbox" id="ex-names"><span>${escape(t('lv_ex_names'))}</span></label>
                    <button type="button" class="boton suave" id="ex-csv"><span data-icono="descargar"></span><span>${escape(t('lv_ex_download'))}</span></button>
                    <button type="button" class="boton suave" id="ex-reopen"><span data-icono="empezar"></span><span>${escape(t('lv_ex_reopen'))}</span></button>
                    <button type="button" class="boton suave" id="ex-new"><span data-icono="mas"></span><span>${escape(t('lv_ex_new'))}</span></button>
                </div>`;
            icons(stage);
            const $ = (s) => stage.querySelector(s);
            $('#ex-show').addEventListener('click', () => { showAnswers = !showAnswers; $('#ex-random-card').hidden = true; summary(false); });
            $('#ex-random').addEventListener('click', randomOne);
            $('#ex-group').value = group;
            $('#ex-group').addEventListener('change', () => { group = $('#ex-group').value; save('salida-grupo', group); summary(false); });
            $('#ex-names').checked = names;
            $('#ex-names').addEventListener('change', () => { names = $('#ex-names').checked; summary(false); });
            $('#ex-csv').addEventListener('click', download);
            $('#ex-reopen').addEventListener('click', () => { act('reopen'); play('tic'); });
            $('#ex-new').addEventListener('click', () => { editing = true; draw(true); });
            $('#ex-piles').addEventListener('click', (e) => {
                const b = e.target.closest('[data-hide]'); if (!b) { return; }
                hidden.add(b.dataset.hide); summary(false); announce(t('lv_ex_hidden'));
            });
        }
        const $ = (s) => stage.querySelector(s);
        const list = visibleTickets();
        $('#ex-round').textContent = t('lv_ex_n', S.round);
        // How they are getting on: a bar per face (only if it was asked).
        const bars = $('#ex-bars');
        bars.hidden = !S.feel || !F;
        if (S.feel && F) {
            const counts = F.LEVELS.map((l) => list.filter((x) => x.feel === l).length);
            const most = Math.max(1, ...counts);
            const html = F.LEVELS.map((l, i) => `<div class="lv-barra ex-barra"><span class="ex-nivel">${face(l)}<small>${escape(t('lv_ex_s' + l))}</small></span>`
                + `<span class="lv-pista"><i style="--c:${F.COLOURS[l][0]}; width:${(100 * counts[i] / most).toFixed(1)}%"></i></span><strong>${counts[i]}</strong></div>`).join('');
            if (bars.dataset.html !== html) { bars.innerHTML = html; bars.dataset.html = html; }
        }
        $('#ex-total').textContent = t(list.length === 1 ? 'lv_ex_total_one' : 'lv_ex_total_many', list.length);
        const texts = S.prompts.length > 0;
        $('#ex-show').hidden = !texts; $('#ex-random').hidden = !texts;
        core.relabel($('#ex-show'), t(showAnswers ? 'lv_ex_hide_answers' : 'lv_ex_show_answers'), showAnswers ? 'ocultar' : 'lista');
        $('#ex-veil').hidden = !texts || showAnswers;
        $('#ex-group').hidden = !showAnswers || !S.feel;
        $('#ex-names-box').hidden = !showAnswers || S.identity !== 'moodle';
        $('#ex-piles').hidden = !showAnswers || !texts;
        if (showAnswers && texts) { piles(list); }
    };
    // One ticket, as a card: its answers (with the question, small, when there are several) and, on request, the name.
    const card = (x) => `<li class="ex-tarjeta" style="--c:${F && x.feel !== '' ? F.COLOURS[x.feel][0] : '#9aa5b5'}">`
        + S.prompts.map((q, i) => (x.texts[i] ? `${S.prompts.length > 1 ? `<small>${escape(q)}</small>` : ''}<p>${escape(x.texts[i])}</p>` : '')).join('')
        + (names && S.identity === 'moodle' ? `<span class="ex-nombre">${escape(x.name)}</span>` : '')
        + `<button type="button" class="ex-quita" data-hide="${escape(x.device)}" aria-label="${escape(t('lv_ex_hide'))}" title="${escape(t('lv_ex_hide'))}">${core.icon('cerrar')}</button></li>`;
    const piles = (list) => {
        const box = stage.querySelector('#ex-piles');
        const withText = list.filter((x) => x.texts.some(Boolean));
        let html;
        if (group === 'feel' && S.feel && F) {
            // «Not yet» first: it is where the next lesson starts.
            const levels = ['0', '1', '2', '3', ''];
            html = levels.map((l) => {
                const own = withText.filter((x) => x.feel === l);
                if (!own.length && l === '') { return ''; }
                const head = l === '' ? `<span>${escape(t('lv_ex_s_none'))}</span>` : `${face(l)}<span>${escape(t('lv_ex_s' + l))}</span>`;
                return `<section class="ex-monton"><h4>${head}<b>${own.length}</b></h4><ul>${own.map(card).join('')}</ul></section>`;
            }).join('');
        } else {
            html = `<section class="ex-monton ex-uno"><ul>${withText.map(card).join('')}</ul></section>`;
        }
        if (!withText.length) { html = `<p class="nota">${escape(t('lv_ex_no_texts'))}</p>`; }
        if (box.dataset.html !== html) { box.innerHTML = html; box.dataset.html = html; }
    };
    // One at random, without a name, big: to read it aloud and talk about it.
    const randomOne = () => {
        const pool = visibleTickets().filter((x) => x.texts.some(Boolean));
        const box = stage.querySelector('#ex-random-card');
        if (!pool.length) { box.hidden = false; box.innerHTML = `<p class="nota">${escape(t('lv_ex_no_texts'))}</p>`; return; }
        const x = pool[Math.floor(Math.random() * pool.length)];
        box.innerHTML = `<div class="ex-azar-in">${S.prompts.map((q, i) => (x.texts[i] ? `<small>${escape(q)}</small><p>${escape(x.texts[i])}</p>` : '')).join('')}</div>
            <div class="botonera centro"><button type="button" class="boton" data-a="again"><span data-icono="azar"></span><span>${escape(t('lv_ex_random_again'))}</span></button>
            <button type="button" class="boton suave" data-a="close"><span data-icono="cerrar"></span><span>${escape(t('lv_ex_random_close'))}</span></button></div>`;
        icons(box);
        box.hidden = false;
        box.querySelector('[data-a="again"]').addEventListener('click', randomOne);
        box.querySelector('[data-a="close"]').addEventListener('click', () => { box.hidden = true; });
        play('elegido');
    };
    // The tickets as a spreadsheet, to read them calmly after class (the session goes after a day). With «;» where the
    // decimal separator is a comma, so the spreadsheet opens it in columns.
    const download = () => {
        const sep = (1.5).toLocaleString().includes(',') ? ';' : ',';
        const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const head = [t('lv_ex_csv_who')].concat(S.feel ? [t('lv_ex_feel_q')] : [], S.prompts);
        const rows = S.tickets.map((x) => {
            const i = S.devices.findIndex((d) => d.device === x.device);
            const who = S.identity === 'moodle' ? (x.name || t('lv_device_n', i + 1)) : nameOf(x, i);
            return [who].concat(S.feel ? [x.feel === '' ? '' : `${x.feel} · ${t('lv_ex_f' + x.feel)}`] : [], x.texts);
        });
        const csv = '﻿' + [head].concat(rows).map((r) => r.map(cell).join(sep)).join('\r\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const d = new Date();
        a.download = `${t('lv_ex_file')}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.csv`;
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };

    // ---------------------------------------------------------------------------------------------------
    // What live.js calls
    // ---------------------------------------------------------------------------------------------------
    const draw = (fresh) => {
        if (!S || !S.round || editing) { if (fresh || phase !== 'editor') { editor(); } return; }
        if (S.open) { progress(fresh); } else { summary(fresh); }
    };
    function paint(st, v, first, actFn) {
        stage = st; act = actFn; S = v;
        if (first) { phase = ''; editing = false; }
        if (v.round !== round) {
            // A new ticket: its answers hidden again, nothing put aside.
            round = v.round; showAnswers = false; hidden.clear(); names = false;
            if (v.round) { editing = false; }
            phase = '';
        }
        const was = phase;
        draw(first || !stage.querySelector('.ex-editor, .ex-abierto, .ex-resumen'));
        if (was === 'open' && phase === 'closed') { announce(t('lv_ex_closed')); }
    }
    // Before the session: the ticket can be prepared already.
    const setup = (st) => { stage = st; S = null; phase = ''; editor(); };
    window.ClasstoolsLiveExit = { paint, setup };
})();
