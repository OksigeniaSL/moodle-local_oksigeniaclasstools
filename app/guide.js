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
 * The teacher's guide: what a tool, game or material is for, what it works on, why (with its sources), how to take it
 * to class, what it gives at each school level and a scene from a class. A sheet at the side, for whatever is on
 * screen; or, expanded, a window in the middle with bigger letters to read it at ease (a tap outside closes it; the
 * way it was left is kept). The texts are language strings (gd_<id>_…), so they are translated with the rest of the plugin; lists are
 * one item per line, the levels «mode|text» and the sources «reference|address».
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const button = document.getElementById('b-guia');
    if (!core || !button) { return; }
    // Only for teachers: inside Moodle the site says whether the one who opens the board teaches (in this course, or in
    // any of theirs without a course); students never see it. Outside Moodle (the demo of the website), it shows.
    const site = window.CLASSTOOLS_SITE;
    if ((site && site.teacher === false) || (window.CLASSTOOLS && window.CLASSTOOLS.mode === 'student')) { button.hidden = true; return; }
    const { t, escape, icon } = core;

    // The guides there are, with the string of their name, in three groups for the index.
    const GROUPS = {
        gd_index_tools: {
            quien: 'tab_picker', grupos: 'tab_groups', semaforo: 'tab_noise', asi: 'tab_rules', reloj: 'tab_clock', envivo: 'tab_live',
            salida: 'lv_kind_exit', tarjetas: 'lv_kind_hands', azar: 'tab_chance', marcador: 'tab_scoreboard', pizarra: 'tab_board',
        },
        gd_index_games: {
            rosco: 'ro_name', simon: 'si_name', eco: 'ec_name', ahorcado: 'ah_name', palabra: 'wo_name', parejas: 'me_pairs', codigo: 'lock_name',
            ordenar: 'ord_name', clasificar: 'so_name', errores: 'er_name', quiensoy: 'wa_name',
        },
        gd_index_materials: {
            rods: 'mt_rods', tangram: 'mt_tangram', line: 'mt_line', fractions: 'mt_fractions', geoboard: 'mt_geoboard',
            base10: 'mt_base10', balanza: 'mt_balance', plano: 'mt_plane', tiempo: 'mt_timeline', cuerpos: 'mt_solids', calc: 'mt_calc',
            score: 'mt_score',
        },
    };
    const GUIDES = Object.assign({}, ...Object.values(GROUPS));
    const MODES = ['early', 'primary', 'secondary', 'advanced'];
    // Which guide: the tool on screen, or the game or material open in it (or, in «Live», the exit ticket and the
    // printed cards).
    const which = () => {
        const tool = core.current ? core.current() : '';
        if (tool === 'envivo' && core.liveKind && core.liveKind() === 'exit') { return 'salida'; }
        if (tool === 'envivo' && core.liveKind && core.liveKind() === 'hands') { return 'tarjetas'; }
        if (tool === 'juegos' && window.ClasstoolsGames && window.ClasstoolsGames.current) { return window.ClasstoolsGames.current(); }
        if (tool === 'material' && core.material && core.material.current) { return core.material.current(); }
        return tool;
    };
    const lines = (key) => t(key).split('\n').map((x) => x.trim()).filter(Boolean);

    const sheet = document.createElement('aside');
    sheet.className = 'ct-guia';
    sheet.hidden = true;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-labelledby', 'gd-title');
    document.body.append(sheet);
    let opener = null, shown = 'index';
    // Expanded: in the middle, over a dimmed board.
    let wide = !!core.load('guia-ancha', false);
    const shade = document.createElement('div');
    shade.className = 'ct-guia-fondo';
    shade.hidden = true;
    document.body.append(shade);
    const applyWide = () => {
        sheet.classList.toggle('ancha', wide);
        shade.hidden = sheet.hidden || !wide;
    };

    const section = (cls, ico, title, body) => `<section class="ct-guia-parte ${cls}"><h3><span class="ct-guia-ico" aria-hidden="true">${icon(ico)}</span>${escape(title)}</h3>${body}</section>`;
    // A tool without a guide of its own (or «All the guides») shows the index: every guide, by group, a tap away.
    const paint = (id = which()) => {
        shown = id;
        const title = GUIDES[id] ? t(GUIDES[id]) : t('gd_all');
        const size = t(wide ? 'gd_collapse' : 'gd_expand');
        const head = `<header class="ct-guia-cabeza"><div><p class="ante">${escape(t('gd_button'))}</p><h2 id="gd-title">${escape(title)}</h2></div>
            <div class="ct-guia-botones"><button type="button" class="redondo" data-a="wide" aria-pressed="${wide}" aria-label="${escape(size)}" title="${escape(size)}">${icon(wide ? 'salir' : 'pantalla')}</button>
            <button type="button" class="redondo" data-a="close" aria-label="${escape(t('gd_close'))}" title="${escape(t('gd_close'))}">${icon('cerrar')}</button></div></header>`;
        if (!GUIDES[id]) {
            sheet.innerHTML = head + `<p class="ct-guia-lead">${escape(t(id === 'index' ? 'gd_index_lead' : 'gd_none'))}</p>`
                + Object.entries(GROUPS).map(([group, guides]) => `<section class="ct-guia-parte ct-guia-indice"><h3>${escape(t(group))}</h3>
                    <div class="ct-guia-lista">${Object.entries(guides).map(([g, name]) => `<button type="button" class="boton suave" data-guide="${g}">${escape(t(name))}</button>`).join('')}</div></section>`).join('');
            return;
        }
        const k = (part) => `gd_${id}_${part}`;
        const mode = core.mode ? core.mode() : 'primary';
        const stages = lines(k('stages')).map((x) => x.split('|')).filter(([m, text]) => MODES.includes(m) && text)
            .map(([m, text]) => `<div class="ct-guia-etapa${m === mode ? ' ct-ahora' : ''}"><dt>${escape(t('mode_' + m))}</dt><dd>${escape(text.trim())}</dd></div>`).join('');
        const sources = lines(k('sources')).map((x) => {
            const [ref, url] = x.split('|').map((y) => y.trim());
            // Links open in a new tab, so Moodle is not lost.
            return `<li>${escape(ref)}${url ? ` <a href="${escape(url)}" target="_blank" rel="noopener">${escape(url.replace(/^https?:\/\//, ''))}</a>` : ''}</li>`;
        }).join('');
        // Its guided helps: the board shows how it is done, and then the teacher does it. The exit ticket and the
        // printed cards are part of «Live»: after their own helps, the ones of «Live».
        const parent = ['salida', 'tarjetas'].includes(id) ? core.help && core.help.of('envivo') : null;
        const helps = core.help ? [...new Set(core.help.of(id).concat(parent || []))] : [];
        const watch = helps.length ? section('ct-guia-ayudas', 'empezar', t('hp_watch'), `<div class="ct-guia-lista">${helps.map((h) => `<button type="button" class="boton" data-help="${h}">`
            + `<span aria-hidden="true">${icon('empezar')}</span><span>${escape(t(`hp_${h}_title`))}</span></button>`).join('')}</div>`) : '';
        sheet.innerHTML = head
            + `<p class="ct-guia-lead">${escape(t(k('what')))}</p>`
            + watch
            + section('ct-guia-trabaja', 'acierto', t('gd_works'), `<ul>${lines(k('works')).map((x) => `<li>${escape(x)}</li>`).join('')}</ul>`)
            + section('ct-guia-porque', 'aprender', t('gd_why'), lines(k('why')).map((x) => `<p>${escape(x)}</p>`).join(''))
            + section('ct-guia-como', 'lista', t('gd_how'), `<ol>${lines(k('how')).map((x) => `<li>${escape(x)}</li>`).join('')}</ol>`)
            + section('ct-guia-etapas', 'grupos', t('gd_stages'), `<dl>${stages}</dl>`)
            + section('ct-guia-escena', 'estrella', t('gd_scene'), lines(k('scene')).map((x) => `<p>${escape(x)}</p>`).join(''))
            + section('ct-guia-fuentes', 'info', t('gd_sources'), `<ul>${sources}</ul>`)
            + `<p class="ct-guia-pie"><button type="button" class="boton suave" data-a="index"><span aria-hidden="true">${icon('lista')}</span><span>${escape(t('gd_all'))}</span></button></p>`;
    };
    const close = () => {
        sheet.hidden = true;
        shade.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        if (opener && opener.focus) { opener.focus(); }
    };
    const open = () => {
        paint();
        sheet.hidden = false;
        applyWide();
        sheet.scrollTop = 0;
        button.setAttribute('aria-expanded', 'true');
        opener = document.activeElement;
        const c = sheet.querySelector('[data-a="close"]');
        if (c) { c.focus(); }
    };
    button.addEventListener('click', () => (sheet.hidden ? open() : close()));
    sheet.addEventListener('click', (e) => {
        if (e.target.closest('[data-a="close"]')) { close(); return; }
        if (e.target.closest('[data-a="wide"]')) {
            const at = sheet.scrollTop / Math.max(1, sheet.scrollHeight);
            wide = !wide;
            core.save('guia-ancha', wide);
            paint(shown); applyWide();
            sheet.scrollTop = at * sheet.scrollHeight;
            const b = sheet.querySelector('[data-a="wide"]');
            if (b) { b.focus(); }
            return;
        }
        const help = e.target.closest('[data-help]');
        if (help && core.help) { close(); core.help.open(help.dataset.help); return; }
        const other = e.target.closest('[data-guide], [data-a="index"]');
        if (!other) { return; }
        paint(other.dataset.guide || 'index');
        sheet.scrollTop = 0;
        const h = sheet.querySelector('h2');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { e.stopPropagation(); close(); } }, true);
    // A touch outside closes it (the board is the teacher's again).
    document.addEventListener('pointerdown', (e) => { if (!sheet.hidden && !sheet.contains(e.target) && !button.contains(e.target)) { close(); } });
    window.ClasstoolsGuide = { open, close, which, ids: () => Object.keys(GUIDES), wide: () => wide };   // for automated tests
})();
