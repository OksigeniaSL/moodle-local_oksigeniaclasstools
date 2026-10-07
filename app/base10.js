// Base-ten blocks, among the materials: a place-value mat with ones, tens, hundreds (and thousands), blocks added
// and taken away with + and − (or a tap on a block), ten of a kind swapped for one of the next column and one broken
// into ten, and the number below as the sum of its places («100 + 30 + 12 = 142»), which can be hidden.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { escape, save, load, play, announce, reducedMotion } = core;
    const t = core.t;
    // The columns, from the ones up, in the colours of the classroom blocks (ones green, tens blue, hundreds red…).
    const PLACES = [
        { key: 'u', value: 1, colour: '#067e36' },
        { key: 't', value: 10, colour: '#164281' },
        { key: 'h', value: 100, colour: '#ce1423' },
        { key: 'th', value: 1000, colour: '#5b2fb8' },
    ];
    const MAX = 20;
    const name = (p) => t('b10_' + p.key);

    const panel = core.material.add('base10', t('mt_base10'), `
        <aside class="tarjeta ct-side">
            <label class="campo apilado"><span>${escape(t('b10_upto'))}</span><select id="b10-cols">
                <option value="2">${escape(t('b10_t'))}</option><option value="3">${escape(t('b10_h'))}</option><option value="4">${escape(t('b10_th'))}</option>
            </select></label>
            <label class="campo apilado"><span>${escape(t('b10_build'))}</span>
                <span class="ct-row"><input type="number" id="b10-number" min="0" max="9999" inputmode="numeric">
                <button type="button" class="boton suave" id="b10-put">${escape(t('b10_put'))}</button></span></label>
            <label class="interruptor"><input type="checkbox" id="b10-hide"><span>${escape(t('b10_hide'))}</span></label>
            <button type="button" class="boton suave" id="b10-empty"><span data-icono="limpiar"></span>${escape(t('b10_empty'))}</button>
            <p class="nota">${escape(t('b10_help'))}</p>
        </aside>
        <div class="tarjeta ct-stage ct-b10-stage">
            <div class="ct-b10" id="b10-mat"></div>
            <button type="button" class="total ct-b10-sum" id="b10-sum" aria-live="polite"></button>
        </div>`, () => paint());
    const $ = (s) => panel.querySelector(s);

    // Each screen mode starts with its own mat (up to the tens for the youngest, the hundreds in Primary, the thousands
    // from Secondary) and remembers what the teacher changes in it.
    const byMode = core.byMode ? core.byMode('base10-modo', {
        early: { cols: 2 }, primary: { cols: 3 }, secondary: { cols: 4 }, advanced: { cols: 4 },
    }) : { get: () => ({}), set: () => {} };
    const st = Object.assign({ cols: 3, n: [3, 2, 1, 0], hide: false }, load('base10', {}), byMode.get());
    const columns = (c) => ([2, 3, 4].includes(Number(c)) ? Number(c) : 3);
    st.cols = columns(st.cols);
    st.n = PLACES.map((_, i) => Math.max(0, Math.min(MAX, Number((st.n || [])[i]) || 0)));
    let revealed = false, fresh = {};   // the total uncovered (when hidden); blocks just added, to pop in
    const keep = () => save('base10', st);

    // One block of each kind, drawn with CSS (the thousand, a cube in perspective).
    const block = (i) => (i === 3
        ? '<svg class="ct-b10-cube" viewBox="0 0 120 120" aria-hidden="true"><path class="top" d="M10 35L45 10H110L75 35Z"/><path class="side" d="M75 35L110 10V85L75 110Z"/><path class="front" d="M10 35H75V110H10Z"/></svg>'
        : '');
    function paint() {
        const mat = $('#b10-mat'), used = PLACES.slice(0, st.cols);
        mat.style.setProperty('--cols', st.cols);
        mat.innerHTML = used.slice().reverse().map((p) => {
            const i = PLACES.indexOf(p), n = st.n[i], top = i === st.cols - 1;
            const blocks = Array.from({ length: n }, (_, k) => `<button type="button" class="ct-b10-b b${i}${fresh[i] && k >= n - fresh[i] ? ' nuevo' : ''}" data-i="${i}" aria-label="${escape(t('b10_take', name(p)))}">${block(i)}</button>`).join('');
            return `<section class="ct-b10-col" style="--c:${p.colour}">
                <h3>${escape(name(p))}</h3>
                <div class="ct-b10-area b${i}">${blocks}</div>
                <div class="ct-b10-pie">
                    <button type="button" class="redondo suave" data-less="${i}" aria-label="${escape(t('b10_less', name(p)))}"${n ? '' : ' disabled'}>${core.icon('menos')}</button>
                    <output aria-label="${escape(name(p))}">${n}</output>
                    <button type="button" class="redondo suave" data-more="${i}" aria-label="${escape(t('b10_more', name(p)))}"${n < MAX ? '' : ' disabled'}>${core.icon('mas')}</button>
                </div>
                <div class="ct-b10-cambios">
                    ${!top && n >= 10 ? `<button type="button" class="boton suave" data-group="${i}">${escape(t('b10_group', name(PLACES[i + 1])))}</button>` : ''}
                    ${i > 0 && n > 0 && st.n[i - 1] <= MAX - 10 ? `<button type="button" class="boton suave" data-break="${i}">${escape(t('b10_break', name(PLACES[i - 1])))}</button>` : ''}
                </div>
            </section>`;
        }).join('');
        fresh = {};
        fit();
        sum();
    }
    // The blocks as large as they fit: the same size in every column, so that a ten is as long as ten ones.
    const fit = () => {
        const mat = $('#b10-mat'), areas = [...mat.querySelectorAll('.ct-b10-area')];
        if (!areas.length || !areas[0].clientHeight) { return; }
        for (let u = 26; u >= 4; u -= 1) {
            mat.style.setProperty('--u', u + 'px');
            if (areas.every((a) => a.scrollHeight <= a.clientHeight + 1 && a.scrollWidth <= a.clientWidth + 1)) { return; }
        }
    };
    // The number, as the sum of its places: «100 + 30 + 5 = 135».
    const total = () => PLACES.slice(0, st.cols).reduce((a, p, i) => a + st.n[i] * p.value, 0);
    const sum = () => {
        const box = $('#b10-sum'), v = total();
        const parts = PLACES.slice(0, st.cols).map((p, i) => st.n[i] * p.value).filter(Boolean).reverse();
        box.disabled = !st.hide;
        if (st.hide && !revealed) { box.className = 'total ct-b10-sum oculto'; box.textContent = t('b10_guess'); return; }
        box.className = 'total ct-b10-sum';
        box.textContent = parts.length > 1 ? `${parts.join(' + ')} = ${v}` : String(v);
    };
    const set = (i, n) => {
        const before = st.n[i];
        st.n[i] = Math.max(0, Math.min(MAX, n));
        if (st.n[i] > before) { fresh[i] = st.n[i] - before; }
        revealed = false; keep(); paint();
    };

    $('#b10-mat').addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b || b.disabled) { return; }
        if (b.dataset.more !== undefined) { set(Number(b.dataset.more), st.n[b.dataset.more] + 1); play('tic'); return; }
        if (b.dataset.less !== undefined || b.dataset.i !== undefined) {
            const i = Number(b.dataset.less !== undefined ? b.dataset.less : b.dataset.i);
            set(i, st.n[i] - 1); play('tic'); return;
        }
        // Ten for one, and one for ten: the ones that go shrink away and the new ones pop in.
        const swap = (from, to, fromBy, toBy) => {
            const go = () => { st.n[from] -= fromBy; st.n[to] += toBy; fresh[to] = toBy; revealed = false; keep(); paint(); play('card'); };
            const leaving = [...$('#b10-mat').querySelectorAll(`.ct-b10-b[data-i="${from}"]`)].slice(-fromBy);
            if (reducedMotion() || !leaving.length) { go(); return; }
            leaving.forEach((x) => x.classList.add('se-va'));
            setTimeout(go, 320);
        };
        if (b.dataset.group !== undefined) {
            const i = Number(b.dataset.group);
            swap(i, i + 1, 10, 1);
            announce(t('b10_grouped', { a: name(PLACES[i]), b: name(PLACES[i + 1]) }));
        } else if (b.dataset.break !== undefined) {
            const i = Number(b.dataset.break);
            swap(i, i - 1, 1, 10);
            announce(t('b10_broken', { a: name(PLACES[i]), b: name(PLACES[i - 1]) }));
        }
    });
    $('#b10-sum').addEventListener('click', () => { if (st.hide) { revealed = !revealed; sum(); play(revealed ? 'elegido' : 'tic'); } });
    $('#b10-put').addEventListener('click', () => {
        const v = Math.max(0, Math.min(10 ** st.cols - 1, Math.floor(Number($('#b10-number').value) || 0)));
        st.n = PLACES.map((p, i) => (i < st.cols ? Math.floor(v / p.value) % 10 : 0));
        fresh = { 0: st.n[0], 1: st.n[1], 2: st.n[2], 3: st.n[3] };
        revealed = false; keep(); paint(); play('card');
    });
    $('#b10-number').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#b10-put').click(); } });
    // Fewer columns: the blocks of the columns that go away are emptied.
    const setColumns = (c) => { st.cols = columns(c); st.n = st.n.map((x, i) => (i < st.cols ? x : 0)); };
    $('#b10-cols').addEventListener('change', () => { setColumns($('#b10-cols').value); byMode.set({ cols: st.cols }); keep(); paint(); });
    $('#b10-hide').addEventListener('change', () => { st.hide = $('#b10-hide').checked; revealed = false; byMode.set({ hide: st.hide }); keep(); sum(); });
    document.addEventListener('classtools:mode', () => {
        const v = byMode.get();
        setColumns(v.cols); st.hide = !!v.hide; revealed = false;
        $('#b10-cols').value = String(st.cols); $('#b10-hide').checked = st.hide;
        keep(); paint();
    });
    $('#b10-empty').addEventListener('click', () => { st.n = [0, 0, 0, 0]; revealed = false; keep(); paint(); });
    $('#b10-cols').value = String(st.cols); $('#b10-hide').checked = st.hide;
    if (window.ResizeObserver) { new ResizeObserver(() => requestAnimationFrame(fit)).observe($('#b10-mat')); }
    paint();

    window.ClasstoolsBase10 = { state: () => st, total, paint };   // for automated tests
})();
