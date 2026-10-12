// The teacher's stickers («My stickers»), on the board and on «Which class?». On the board, the tools call
// core.logro(sticker) when a use is real (with the thresholds of the site): it is sent once per sticker, course and
// day, and when its level goes up the sticker comes in and «sticks» on the screen (a sober badge in the Advanced mode).
// On «Which class?», the album: the stickers got, with their level, and the gaps of the ones still to get, with how.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    // The stickers in the order of the album, each with its family (as in classes/local/logros.php).
    const FAMILY = {
        domamoviles: 'live', cuentavotos: 'live', atrapanubes: 'live', lanzapreguntas: 'live', tocatimbres: 'live',
        mandamas: 'live', cuentamanos: 'live', repartequipos: 'groups', sacanombres: 'picker', guardatiempos: 'timer',
        tocanotas: 'score', salvaglobos: 'hangman', cazaletras: 'rosco', tiradados: 'dice', cumplemetas: 'goal',
        pasalimpios: 'board', quitatelones: 'board', trazacirculos: 'board',
    };
    const ORDER = Object.keys(FAMILY);
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // The texts of a sticker, in the language of the page (t is the page's own function of strings).
    const texts = (cromo, level, t) => ({
        number: t('cr_number', { n: ORDER.indexOf(cromo) + 1, family: t('cr_fam_' + FAMILY[cromo]) }),
        name: t(`cr_${cromo}_name`), text: t(`cr_${cromo}_text`), level: t('cr_level_' + level), learned: t('cr_level_0'),
    });
    // The drawing: the sticker, or the badge in the Advanced mode.
    const draw = (cromo, level, t, sober) => {
        const C = window.ClasstoolsCromo;
        if (!C) { return ''; }
        return sober ? C.badge(cromo, level, texts(cromo, level, t)) : C.sticker(cromo, level, texts(cromo, level, t));
    };
    window.ClasstoolsLogros = { ORDER, FAMILY, texts, draw, esc };

    // --- On the board -------------------------------------------------------------------------------------------
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const AULA = core.moodle;
    // Not from a copy of a duel (duel.js): the board itself counts.
    const L = !core.duelo && AULA && AULA.mode === 'teacher' && AULA.logrosurl && AULA.logros ? AULA.logros : null;
    const thr = Object.assign({ devices: 5, picks: 5, students: 8 }, (L && L.thr) || {});
    const sent = {};
    const today = () => { const d = new Date(); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; };

    // The sticker that comes in: big, turning as it sticks, with what happened; a tap (or a few seconds) and it goes.
    const show = (cromo, level) => {
        const t = core.t, sober = core.mode && core.mode() === 'advanced';
        const layer = document.createElement('div');
        layer.className = 'ct-logro' + (sober ? ' ct-logro-sobrio' : '');
        layer.setAttribute('role', 'dialog');
        layer.setAttribute('aria-label', `${t(level === 1 ? 'cr_new' : 'cr_up')} ${t(`cr_${cromo}_name`)}`);
        layer.innerHTML = `<div class="ct-logro-in"><p class="ct-logro-titulo">${esc(t(level === 1 ? 'cr_new' : 'cr_up'))}</p>
            <div class="ct-logro-cromo">${draw(cromo, level, t, sober)}</div>
            <p class="ct-logro-nivel">${esc(t('cr_level_' + level))}</p></div>`;
        document.body.append(layer);
        if (core.play) { core.play('elegido'); }
        if (core.announce) { core.announce(`${t(level === 1 ? 'cr_new' : 'cr_up')} ${t(`cr_${cromo}_name`)}, ${t('cr_level_' + level)}`); }
        let gone = false;
        const close = () => { if (gone) { return; } gone = true; layer.classList.add('ct-logro-fuera'); setTimeout(() => layer.remove(), 400); };
        layer.addEventListener('click', close);
        setTimeout(close, 6500);
    };

    /**
     * A real use of a tool: once per sticker, course and day (the server keeps the same rule).
     *
     * @param {string} cromo
     */
    const logro = (cromo) => {
        if (!L || !FAMILY[cromo] || sent[cromo]) { return; }
        const key = `logro-${cromo}-${AULA.courseid}-${today()}`;
        sent[cromo] = true;
        if (core.load && core.load(key, false)) { return; }
        fetch(AULA.logrosurl, { method: 'POST', credentials: 'same-origin',
            body: new URLSearchParams({ courseid: AULA.courseid, sesskey: AULA.sesskey, cromo }) })
            .then((r) => r.json()).then((j) => {
                if (!j || j.off || j.error || j.errorcode) { return; }
                if (core.save) { core.save(key, true); }
                if (j.up) { show(cromo, j.level); }
            }).catch(() => { sent[cromo] = false; });
    };
    core.logro = logro;
    core.logros = { on: !!L, thr };
    window.ClasstoolsLogros.show = show;   // for automated tests
})();
