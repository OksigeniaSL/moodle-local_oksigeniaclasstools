// The teachers' room on the board, a discreet button of the top bar: the colleagues who want to be seen, with their
// critter and their stickers in the span the site counts, how many more play, and whether one is in (the same room as
// on «Which class?», asked to sala.php when it opens).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const button = document.getElementById('b-sala');
    if (!core || !button) { return; }
    const AULA = core.moodle;
    // Only for the teacher, in a course, with the room on; not in the practice board of a help or a copy of a duel.
    if (!AULA || AULA.mode !== 'teacher' || !AULA.salaurl || core.practica || core.duelo) { return; }
    const { escape, setIcon } = core;
    const L = window.ClasstoolsLogros, C = window.ClasstoolsCritter;
    button.hidden = false;

    let dialog = null, R = null;
    const ask = (extra = {}) => fetch(AULA.salaurl, { method: 'POST', credentials: 'same-origin',
        body: new URLSearchParams(Object.assign({ sesskey: AULA.sesskey, action: 'room' }, extra)) }).then((r) => r.json());
    const face = (id) => `<span class="ct-sala-cara" aria-hidden="true">${C ? C.svg('sala:' + id) : ''}</span>`;
    const paint = () => {
        const S = R.str || {};
        dialog.innerHTML = `<div class="ct-sala-cab"><div><h2 id="sl-titulo">${escape(S.title)}</h2>
                <p class="nota">${escape(S.intro)}</p><p class="ct-sala-tiempo">${escape(R.span)}</p></div>
                <button type="button" class="redondo" id="sl-cerrar" aria-label="${escape(S.close)}" title="${escape(S.close)}"><span data-icono="cerrar"></span></button></div>
            <ul class="ct-sala-lista">${R.teachers.length ? R.teachers.map((x) => `<li class="ct-sala-profe${x.me ? ' yo' : ''}">${face(x.id)}
                <span class="ct-sala-nombre">${escape(x.name)}${x.me ? ` <small>(${escape(S.you)})</small>` : ''}</span>
                <span class="ct-sala-cromos">${x.stickers.length && L ? x.stickers.map((c) => `<span class="ct-sala-cromo">${L.draw(c.cromo, c.level, core.t)}</span>`).join('')
                    : `<span class="nota">${escape(S.none)}</span>`}${x.note ? `<span class="nota ct-sala-mas">${escape(x.note)}</span>` : ''}</span></li>`).join('')
                : `<li class="nota">${escape(S.empty)}</li>`}</ul>
            ${R.others ? `<p class="ct-sala-otros">${escape(R.others)}</p>` : ''}
            <div class="ct-sala-pie"><label class="interruptor"><input type="checkbox" id="sl-yo"${R.joined ? ' checked' : ''}><span>${escape(S.join)}</span></label>
                <p class="nota">${escape(S.join_note)}</p></div>`;
        dialog.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        dialog.querySelector('#sl-cerrar').addEventListener('click', () => dialog.close());
        dialog.querySelector('#sl-yo').addEventListener('change', (e) => {
            const box = e.target;
            box.disabled = true;
            ask({ action: 'join', join: box.checked ? '1' : '0' }).then((j) => {
                if (!j || j.error || j.errorcode || j.off) { throw new Error('sala'); }
                R = j; paint();
            }).catch(() => { box.checked = !box.checked; box.disabled = false; });
        });
    };
    button.addEventListener('click', () => {
        ask().then((j) => {
            if (!j || j.error || j.errorcode || j.off) { button.hidden = true; return; }
            R = j;
            if (!dialog) {
                dialog = document.createElement('dialog');
                dialog.className = 'editor ct-sala';
                dialog.setAttribute('aria-labelledby', 'sl-titulo');
                dialog.addEventListener('click', (e) => { if (e.target === dialog) { dialog.close(); } });
                document.body.append(dialog);
            }
            paint();
            dialog.showModal();
        }).catch(() => {});
    });

    window.ClasstoolsSala = { open: () => button.click(), dialog: () => dialog };   // for automated tests
})();
