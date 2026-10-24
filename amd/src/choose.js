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
 * «Which class?» (index.php without a course): the filters (a stage, a category and the search, together), hiding a
 * course from here (only for this teacher, folded away at the end), the QR of the fixed remote, «My stickers» (a strip
 * of the best ones and the album, drawn with the art of the stickers) and the teachers' room (the colleagues who want
 * to be seen, with their critter and their stickers). The board's own drawing scripts (app/critter.js, cromos.js,
 * logros.js and lib/qrcode.js) are loaded before it, as the board loads them.
 *
 * @module     local_oksigeniaclasstools/choose
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Ajax from 'core/ajax';

/**
 * A web service of the board, without its «local_oksigeniaclasstools_».
 *
 * @param {string} name
 * @param {Object} args
 * @returns {Promise}
 */
const call = (name, args) => Ajax.call([{methodname: 'local_oksigeniaclasstools_' + name, args}])[0];

const $ = (s) => document.querySelector(s);

/**
 * Lower case and without accents, to search names.
 *
 * @param {string} s
 * @returns {string}
 */
const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * The filters (a stage, a category and the search, together) and hiding a course from here (a dining hall or a staff
 * room is not a class).
 */
const setUpFilters = () => {
    const input = $('#ct-ch-buscar');
    const select = $('#ct-ch-categoria');
    let stage = '';
    let showHidden = false;
    const filter = () => {
        const q = input ? plain(input.value.trim()) : '';
        const cat = select ? select.value : '';
        let shown = 0;
        document.querySelectorAll('.ct-ch-sitio').forEach((card) => {
            const ok = (!q || plain(card.dataset.name).includes(q)) && (!cat || card.dataset.cat === cat)
                && (!stage || card.dataset.mode === stage) && (showHidden || card.dataset.oculto !== '1');
            card.hidden = !ok;
            if (ok) {
                shown++;
            }
        });
        if ($('#ct-ch-nada')) {
            $('#ct-ch-nada').hidden = shown > 0;
        }
    };
    if (input) {
        input.addEventListener('input', filter);
    }
    if (select) {
        select.addEventListener('change', filter);
    }
    const buttons = document.querySelectorAll('.ct-ch-filtros button');
    buttons.forEach((b) => b.addEventListener('click', () => {
        stage = b.dataset.mode;
        buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        filter();
    }));

    const grid = $('.ct-ch-rejilla');
    const more = $('#ct-ch-verocultos');
    if (!grid || !more) {
        return;
    }
    const paintMore = () => {
        const n = document.querySelectorAll('.ct-ch-sitio[data-oculto="1"]').length;
        if (!n) {
            showHidden = false;
        }
        more.hidden = !n;
        more.textContent = `${showHidden ? more.dataset.hide : more.dataset.show} (${n})`;
        more.setAttribute('aria-pressed', String(showHidden));
        document.querySelectorAll('.ct-ch-sitio').forEach((card) => {
            const b = card.querySelector('.ct-ch-ocultar');
            const label = card.dataset.oculto === '1' ? b.dataset.show : b.dataset.hide;
            b.title = label;
            b.setAttribute('aria-label', `${label}: ${card.dataset.name}`);
        });
    };
    grid.addEventListener('click', (e) => {
        const b = e.target.closest('.ct-ch-ocultar');
        if (!b) {
            return;
        }
        const card = b.closest('.ct-ch-sitio');
        const hide = card.dataset.oculto !== '1';
        b.disabled = true;
        call('course_hide', {courseid: Number(card.dataset.id), hide})
            .then((j) => {
                if (j && j.ok) {
                    card.dataset.oculto = hide ? '1' : '0';
                    paintMore();
                    filter();
                }
                return j;
            })
            .catch(() => null)
            .finally(() => {
                b.disabled = false;
            });
    });
    more.addEventListener('click', () => {
        showHidden = !showHidden;
        paintMore();
        filter();
    });
    paintMore();
};

/**
 * The QR of the fixed remote.
 */
const paintRemote = () => {
    const qr = $('#ct-ch-qr');
    if (qr && window.qrcode) {
        const code = window.qrcode(0, 'M');
        code.addData(qr.dataset.url);
        code.make();
        qr.innerHTML = code.createSvgTag({cellSize: 4, margin: 0, scalable: true});
    }
};

/**
 * A text of «My stickers», with its values.
 *
 * @param {Object} strings
 * @param {string} key
 * @param {*} a
 * @returns {string}
 */
const text = (strings, key, a) => {
    let s = strings[key] || key;
    if (a && typeof a === 'object') {
        Object.keys(a).forEach((k) => {
            s = s.split(`{$a->${k}}`).join(a[k]);
        });
    } else if (a !== undefined) {
        s = s.split('{$a}').join(a);
    }
    return s;
};

/**
 * One sticker of the album: got (with its level and days), learned in its guided help, or a gap with how to get it.
 *
 * @param {Object} L The board's stickers (app/logros.js).
 * @param {Object} i
 * @param {Function} t
 * @returns {string}
 */
const albumSticker = (L, i, t) => {
    if (i.level > 0) {
        return `<figure class="ct-ch-cromo">${L.draw(i.cromo, i.level, t)}`
            + `<figcaption><strong>${L.esc(i.days)}</strong>${L.esc(i.next)}</figcaption></figure>`;
    }
    if (i.learned) {
        return `<figure class="ct-ch-cromo">${L.draw(i.cromo, 0, t)}`
            + `<figcaption><strong>${L.esc(t('cr_level_0'))}</strong>${L.esc(i.how)}</figcaption></figure>`;
    }
    return `<figure class="ct-ch-cromo ct-ch-hueco">${L.draw(i.cromo, 1, t)}`
        + `<figcaption><strong>${L.esc(t('cr_missing'))}</strong>${L.esc(i.how)}</figcaption></figure>`;
};

/**
 * One colleague in the teachers' room, by their name, with their critter and the stickers they got in the span
 * (never how many times).
 *
 * @param {Object} L The board's stickers (app/logros.js).
 * @param {Function} face
 * @param {Object} x
 * @param {Object} S The texts of the room.
 * @param {Function} t
 * @returns {string}
 */
const roomTeacher = (L, face, x, S, t) => {
    const stickers = x.stickers.length
        ? x.stickers.map((c) => `<span class="ct-ch-mini">${L.draw(c.cromo, c.level, t)}</span>`).join('')
        : `<span class="ct-ch-nota">${L.esc(S.none)}</span>`;
    const note = x.note ? `<span class="ct-ch-nota ct-ch-sala-mas">${L.esc(x.note)}</span>` : '';
    const you = x.me ? ` <small>(${L.esc(S.you)})</small>` : '';
    return `<li class="ct-ch-sala-profe${x.me ? ' yo' : ''}">${face(x.id)}`
        + `<span class="ct-ch-sala-nombre">${L.esc(x.name)}${you}</span>`
        + `<span class="ct-ch-sala-cromos">${stickers}${note}</span></li>`;
};

/**
 * «My stickers» (a strip of the best ones and the album) and the teachers' room.
 */
const setUpStickers = () => {
    const box = $('#ct-ch-logros');
    const L = window.ClasstoolsLogros;
    if (!box || !L) {
        return;
    }
    let A;
    try {
        A = JSON.parse(box.dataset.album);
    } catch (e) {
        return;
    }
    const t = (key, a) => text(A.str || {}, key, a);
    // Got: used for real with a class (a level), or learned in its guided help («Learned»).
    const got = A.items.filter((i) => i.level > 0 || i.learned).sort((a, b) => b.level - a.level);
    $('#ct-ch-tira').innerHTML = got.length
        ? got.slice(0, 4).map((i) => `<span class="ct-ch-mini">${L.draw(i.cromo, i.level, t)}</span>`).join('')
        : `<p class="ct-ch-nota">${L.esc(t('cr_none'))}</p>`;
    const dialog = $('#ct-ch-album');
    $('#ct-ch-abrir').addEventListener('click', () => {
        $('#ct-ch-semanas').textContent = A.weeks || '';
        $('#ct-ch-album-rejilla').innerHTML = A.items.map((i) => albumSticker(L, i, t)).join('');
        dialog.showModal();
    });
    $('#ct-ch-cerrar').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });

    const room = $('#ct-ch-sala');
    if (!room) {
        return;
    }
    let R;
    try {
        R = JSON.parse(room.dataset.sala);
    } catch (e) {
        R = {teachers: [], str: {}};
    }
    const C = window.ClasstoolsCritter;
    const S = R.str || {};
    const face = (id) => `<span class="ct-ch-sala-cara">${C ? C.svg('sala:' + id) : ''}</span>`;
    $('#ct-ch-sala-caras').innerHTML = R.teachers.slice(0, 6).map((x) => face(x.id)).join('');
    const roomDialog = $('#ct-ch-sala-dialogo');
    $('#ct-ch-sala-abrir').addEventListener('click', () => {
        $('#ct-ch-sala-lista').innerHTML = R.teachers.length
            ? R.teachers.map((x) => roomTeacher(L, face, x, S, t)).join('')
            : `<li class="ct-ch-sala-vacia">${L.esc(S.empty)}</li>`;
        roomDialog.showModal();
    });
    $('#ct-ch-sala-cerrar').addEventListener('click', () => roomDialog.close());
    roomDialog.addEventListener('click', (e) => {
        if (e.target === roomDialog) {
            roomDialog.close();
        }
    });
    // In or out of the room: kept in Moodle, and the page drawn again.
    $('#ct-ch-sala-yo').addEventListener('change', (e) => {
        const check = e.target;
        check.disabled = true;
        call('sala_join', {join: check.checked})
            .then(() => {
                window.location.reload();
                return true;
            })
            .catch(() => {
                check.checked = !check.checked;
                check.disabled = false;
            });
    });
};

/**
 * Sets up the page.
 */
export const init = () => {
    setUpFilters();
    paintRemote();
    setUpStickers();
};
