// The teacher's guide: what a tool, game or material is for, what it works on, why (with its sources), how to take it
// to class, what it gives at each school level and a scene from a class. A sheet at the side, for whatever is on
// screen. The texts are language strings (gd_<id>_…), so they are translated with the rest of the plugin; lists are
// one item per line, the levels «mode|text» and the sources «reference|address».
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
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

    // The guides there are, with the string of their name.
    const GUIDES = {
        // Tools.
        quien: 'tab_picker', grupos: 'tab_groups', semaforo: 'tab_noise', asi: 'tab_rules', reloj: 'tab_clock', envivo: 'tab_live',
        // Games.
        rosco: 'ro_name', simon: 'si_name', ahorcado: 'ah_name', palabra: 'wo_name', parejas: 'me_pairs', codigo: 'lock_name',
        // Materials.
        rods: 'mt_rods', tangram: 'mt_tangram', line: 'mt_line', fractions: 'mt_fractions', geoboard: 'mt_geoboard',
        base10: 'mt_base10', score: 'mt_score',
    };
    const MODES = ['early', 'primary', 'secondary', 'advanced'];
    // Which guide: the tool on screen, or the game or material open in it.
    const which = () => {
        const tool = core.current ? core.current() : '';
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
    let opener = null;

    const section = (cls, ico, title, body) => `<section class="ct-guia-parte ${cls}"><h3><span class="ct-guia-ico" aria-hidden="true">${icon(ico)}</span>${escape(title)}</h3>${body}</section>`;
    const paint = () => {
        const id = which(), title = GUIDES[id] ? t(GUIDES[id]) : '';
        const head = `<header class="ct-guia-cabeza"><div><p class="ante">${escape(t('gd_button'))}</p><h2 id="gd-title">${escape(title || t('gd_button'))}</h2></div>
            <button type="button" class="redondo" data-a="close" aria-label="${escape(t('gd_close'))}" title="${escape(t('gd_close'))}">${icon('cerrar')}</button></header>`;
        if (!GUIDES[id]) {
            sheet.innerHTML = head + `<p class="ct-guia-lead">${escape(t('gd_none'))}</p>`;
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
        sheet.innerHTML = head
            + `<p class="ct-guia-lead">${escape(t(k('what')))}</p>`
            + section('ct-guia-trabaja', 'acierto', t('gd_works'), `<ul>${lines(k('works')).map((x) => `<li>${escape(x)}</li>`).join('')}</ul>`)
            + section('ct-guia-porque', 'aprender', t('gd_why'), lines(k('why')).map((x) => `<p>${escape(x)}</p>`).join(''))
            + section('ct-guia-como', 'lista', t('gd_how'), `<ol>${lines(k('how')).map((x) => `<li>${escape(x)}</li>`).join('')}</ol>`)
            + section('ct-guia-etapas', 'grupos', t('gd_stages'), `<dl>${stages}</dl>`)
            + section('ct-guia-escena', 'estrella', t('gd_scene'), lines(k('scene')).map((x) => `<p>${escape(x)}</p>`).join(''))
            + section('ct-guia-fuentes', 'info', t('gd_sources'), `<ul>${sources}</ul>`);
    };
    const close = () => {
        sheet.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        if (opener && opener.focus) { opener.focus(); }
    };
    const open = () => {
        paint();
        sheet.hidden = false;
        sheet.scrollTop = 0;
        button.setAttribute('aria-expanded', 'true');
        opener = document.activeElement;
        const c = sheet.querySelector('[data-a="close"]');
        if (c) { c.focus(); }
    };
    button.addEventListener('click', () => (sheet.hidden ? open() : close()));
    sheet.addEventListener('click', (e) => { if (e.target.closest('[data-a="close"]')) { close(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { e.stopPropagation(); close(); } }, true);
    // A touch outside closes it (the board is the teacher's again).
    document.addEventListener('pointerdown', (e) => { if (!sheet.hidden && !sheet.contains(e.target) && !button.contains(e.target)) { close(); } });
    window.ClasstoolsGuide = { open, close, which, ids: () => Object.keys(GUIDES) };   // for automated tests
})();
