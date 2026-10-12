// «Which class?» (index.php without a course): the filters (a stage, a category and the search, together), the QR of
// the fixed remote, and «My stickers» (a strip of the best ones and the album, drawn with the art of the board).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const $ = (s) => document.querySelector(s);

    // --- The filters ---------------------------------------------------------------------------------------------
    const input = $('#ct-ch-buscar'), select = $('#ct-ch-categoria');
    let stage = '';
    const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const filter = () => {
        const q = input ? plain(input.value.trim()) : '', cat = select ? select.value : '';
        let shown = 0;
        document.querySelectorAll('.ct-ch-curso').forEach((card) => {
            const ok = (!q || plain(card.dataset.name).includes(q)) && (!cat || card.dataset.cat === cat) && (!stage || card.dataset.mode === stage);
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
})();
