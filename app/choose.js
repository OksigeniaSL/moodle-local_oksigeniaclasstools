// «Which class?» (index.php without a course): the filters (a stage, a category and the search, together), hiding a
// course from here (only for this teacher, folded away at the end), the QR of the fixed remote, «My stickers» (a strip of the best ones and the album, drawn with the art of the board) and the
// teachers' room (the colleagues who want to be seen, with their critter and their stickers).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const $ = (s) => document.querySelector(s);

    // --- The filters ---------------------------------------------------------------------------------------------
    const input = $('#ct-ch-buscar'), select = $('#ct-ch-categoria');
    let stage = '', showHidden = false;
    const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const filter = () => {
        const q = input ? plain(input.value.trim()) : '', cat = select ? select.value : '';
        let shown = 0;
        document.querySelectorAll('.ct-ch-sitio').forEach((card) => {
            const ok = (!q || plain(card.dataset.name).includes(q)) && (!cat || card.dataset.cat === cat) && (!stage || card.dataset.mode === stage)
                && (showHidden || card.dataset.oculto !== '1');
            card.hidden = !ok;
            if (ok) { shown++; }
        });
        if ($('#ct-ch-nada')) { $('#ct-ch-nada').hidden = shown > 0; }
    };
    if (input) { input.addEventListener('input', filter); }
    if (select) { select.addEventListener('change', filter); }
    const buttons = document.querySelectorAll('.ct-ch-filtros button');
    buttons.forEach((b) => b.addEventListener('click', () => {
        stage = b.dataset.mode;
        buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        filter();
    }));

    // --- Hiding a course from here (a dining hall or a staff room is not a class) -------------------------------------
    const grid = $('.ct-ch-rejilla'), more = $('#ct-ch-verocultos');
    const paintMore = () => {
        const n = document.querySelectorAll('.ct-ch-sitio[data-oculto="1"]').length;
        if (!n) { showHidden = false; }
        more.hidden = !n;
        more.textContent = `${showHidden ? more.dataset.hide : more.dataset.show} (${n})`;
        more.setAttribute('aria-pressed', String(showHidden));
        document.querySelectorAll('.ct-ch-sitio').forEach((card) => {
            const b = card.querySelector('.ct-ch-ocultar'), label = card.dataset.oculto === '1' ? b.dataset.show : b.dataset.hide;
            b.title = label;
            b.setAttribute('aria-label', `${label}: ${card.dataset.name}`);
        });
    };
    if (grid && more) {
        grid.addEventListener('click', (e) => {
            const b = e.target.closest('.ct-ch-ocultar');
            if (!b) { return; }
            const card = b.closest('.ct-ch-sitio'), hide = card.dataset.oculto !== '1';
            b.disabled = true;
            fetch(grid.dataset.hideurl, { method: 'POST', credentials: 'same-origin',
                body: new URLSearchParams({ sesskey: grid.dataset.sesskey, courseid: card.dataset.id, hide: hide ? '1' : '0' }) })
                .then((r) => r.json()).then((j) => {
                    if (!j || !j.ok) { return; }
                    card.dataset.oculto = hide ? '1' : '0';
                    paintMore();
                    filter();
                }).catch(() => {}).finally(() => { b.disabled = false; });
        });
        more.addEventListener('click', () => { showHidden = !showHidden; paintMore(); filter(); });
        paintMore();
    }

    // --- The QR of the fixed remote ------------------------------------------------------------------------------
    const qr = $('#ct-ch-qr');
    if (qr && window.qrcode) {
        const code = window.qrcode(0, 'M');
        code.addData(qr.dataset.url);
        code.make();
        qr.innerHTML = code.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    }

    // --- My stickers ---------------------------------------------------------------------------------------------
    const box = $('#ct-ch-logros'), L = window.ClasstoolsLogros;
    if (!box || !L) { return; }
    let A;
    try { A = JSON.parse(box.dataset.album); } catch (e) { return; }
    const t = (key, a) => {
        let s = (A.str || {})[key] || key;
        if (a && typeof a === 'object') { Object.keys(a).forEach((k) => { s = s.split(`{$a->${k}}`).join(a[k]); }); } else if (a !== undefined) { s = s.split('{$a}').join(a); }
        return s;
    };
    // Got: used for real with a class (a level), or learned in its guided help («Learned»).
    const got = A.items.filter((i) => i.level > 0 || i.learned).sort((a, b) => b.level - a.level);
    $('#ct-ch-tira').innerHTML = got.length
        ? got.slice(0, 4).map((i) => `<span class="ct-ch-mini">${L.draw(i.cromo, i.level, t)}</span>`).join('')
        : `<p class="ct-ch-nota">${L.esc(t('cr_none'))}</p>`;
    // The album: every sticker, the ones got with their level and days, and the gaps with how to get them.
    const dialog = $('#ct-ch-album');
    const paintAlbum = () => {
        $('#ct-ch-semanas').textContent = A.weeks || '';
        $('#ct-ch-album-rejilla').innerHTML = A.items.map((i) => {
            if (i.level > 0) { return `<figure class="ct-ch-cromo">${L.draw(i.cromo, i.level, t)}<figcaption><strong>${L.esc(i.days)}</strong>${L.esc(i.next)}</figcaption></figure>`; }
            if (i.learned) { return `<figure class="ct-ch-cromo">${L.draw(i.cromo, 0, t)}<figcaption><strong>${L.esc(t('cr_level_0'))}</strong>${L.esc(i.how)}</figcaption></figure>`; }
            return `<figure class="ct-ch-cromo ct-ch-hueco">${L.draw(i.cromo, 1, t)}<figcaption><strong>${L.esc(t('cr_missing'))}</strong>${L.esc(i.how)}</figcaption></figure>`;
        }).join('');
    };
    $('#ct-ch-abrir').addEventListener('click', () => { paintAlbum(); dialog.showModal(); });
    $('#ct-ch-cerrar').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) { dialog.close(); } });

    // --- The teachers' room --------------------------------------------------------------------------------------
    const room = $('#ct-ch-sala');
    if (!room) { return; }
    let R;
    try { R = JSON.parse(room.dataset.sala); } catch (e) { R = { teachers: [], str: {} }; }
    const C = window.ClasstoolsCritter, S = R.str || {};
    const face = (id) => `<span class="ct-ch-sala-cara">${C ? C.svg('sala:' + id) : ''}</span>`;
    $('#ct-ch-sala-caras').innerHTML = R.teachers.slice(0, 6).map((x) => face(x.id)).join('');
    const roomDialog = $('#ct-ch-sala-dialogo');
    // Each one by their name, with their critter and the stickers they got in the span (never how many times).
    const paintRoom = () => {
        $('#ct-ch-sala-lista').innerHTML = R.teachers.length ? R.teachers.map((x) => `<li class="ct-ch-sala-profe${x.me ? ' yo' : ''}">${face(x.id)}
            <span class="ct-ch-sala-nombre">${L.esc(x.name)}${x.me ? ` <small>(${L.esc(S.you)})</small>` : ''}</span>
            <span class="ct-ch-sala-cromos">${x.stickers.length ? x.stickers.map((c) => `<span class="ct-ch-mini">${L.draw(c.cromo, c.level, t)}</span>`).join('')
                : `<span class="ct-ch-nota">${L.esc(S.none)}</span>`}${x.note ? `<span class="ct-ch-nota ct-ch-sala-mas">${L.esc(x.note)}</span>` : ''}</span></li>`).join('')
            : `<li class="ct-ch-sala-vacia">${L.esc(S.empty)}</li>`;
    };
    $('#ct-ch-sala-abrir').addEventListener('click', () => { paintRoom(); roomDialog.showModal(); });
    $('#ct-ch-sala-cerrar').addEventListener('click', () => roomDialog.close());
    roomDialog.addEventListener('click', (e) => { if (e.target === roomDialog) { roomDialog.close(); } });
    // In or out of the room: kept in Moodle, and the page drawn again.
    $('#ct-ch-sala-yo').addEventListener('change', (e) => {
        const box = e.target;
        box.disabled = true;
        fetch(room.dataset.url, { method: 'POST', credentials: 'same-origin', body: new URLSearchParams({ sesskey: room.dataset.sesskey, join: box.checked ? '1' : '0' }) })
            .then((r) => r.json()).then((j) => { if (j && !j.error && !j.errorcode) { location.reload(); } else { throw new Error('sala'); } })
            .catch(() => { box.checked = !box.checked; box.disabled = false; });
    });
})();
