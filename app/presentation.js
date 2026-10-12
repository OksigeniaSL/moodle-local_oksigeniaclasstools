// Presentation: a Canva presentation inside the board, with the other tools at hand (the split screen, the small
// timer). The teacher pastes the embed link of the design (Share → Embed in Canva), any other link of it or its HTML
// embed code; the board keeps the last ones of the course. Nothing comes from Canva until one is opened, and a site
// shows this tab only when its administrator turns it on.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-presentacion');
    if (!core || !root) { return; }
    const { $, t, escape, save, load, setIcon, announce } = core;
    const STR = {
        link: t('pr_link'), placeholder: t('pr_placeholder'), name: t('pr_name'), open: t('pr_open'), where: t('pr_where'),
        steps: [t('pr_step1'), t('pr_step2'), t('pr_step3')], note: t('pr_note'), bad: t('pr_bad'), short: t('pr_short'),
        recent: t('pr_recent'), remove: t('pr_remove'), inCanva: t('pr_in_canva'), other: t('pr_other'), blank: t('pr_blank'),
        untitled: t('pr_untitled'), opened: (x) => t('pr_opened', x),
    };
    const MAX = 12;

    // A Canva design in whatever was pasted: its embed, view or edit link, or the HTML embed code. The second part of
    // the path, when there is one, is the design's share token. → { id, token } or null.
    const parse = (text) => {
        const m = String(text || '').match(/canva\.com\/design\/([A-Za-z0-9_-]{8,})(?:\/([A-Za-z0-9_-]{10,}))?/);
        return m ? { id: m[1], token: m[2] || '' } : null;
    };
    const base = (d) => `https://www.canva.com/design/${d.id}/${d.token ? d.token + '/' : ''}`;
    const embedUrl = (d) => base(d) + 'view?embed';

    // The presentations of this course: in the browser and, inside Moodle, for the teacher in the course (the newest
    // one wins).
    const storeKey = 'presentaciones' + (core.moodle ? ':' + core.moodle.courseid : '');
    let store = load(storeKey, null);
    const kept = core.kept('presentaciones');
    if (kept && Array.isArray(kept.items) && (!store || (kept.updated || 0) > (store.updated || 0))) { store = kept; }
    if (!store || !Array.isArray(store.items)) { store = { items: [], last: null }; }
    const persist = () => { store.updated = Date.now(); save(storeKey, store); core.keep('presentaciones', store); };

    root.innerHTML = `
        <div class="pr-elige" id="pr-elige">
            <div class="tarjeta pr-pegar">
                <label class="campo apilado" for="pr-enlace"><span>${escape(STR.link)}</span></label>
                <input type="text" inputmode="url" id="pr-enlace" maxlength="2000" autocomplete="off" spellcheck="false" placeholder="${escape(STR.placeholder)}">
                <label class="campo apilado" for="pr-nombre"><span>${escape(STR.name)}</span></label>
                <input type="text" id="pr-nombre" maxlength="60" autocomplete="off">
                <div class="botonera"><button type="button" class="boton" id="pr-abrir"><span data-icono="empezar"></span>${escape(STR.open)}</button></div>
                <p class="pr-error" id="pr-error" role="alert" hidden></p>
                <details class="pr-como"><summary>${escape(STR.where)}</summary>
                    <ol>${STR.steps.map((s) => `<li>${escape(s)}</li>`).join('')}</ol></details>
                <p class="nota">${escape(STR.note)}</p>
            </div>
            <div class="tarjeta pr-recientes" id="pr-recientes" hidden>
                <p class="ante">${escape(STR.recent)}</p>
                <ul id="pr-lista"></ul>
            </div>
        </div>
        <div class="pr-vista" id="pr-vista" hidden>
            <div class="pr-barra">
                <strong class="pr-titulo" id="pr-titulo"></strong>
                <a class="boton suave" id="pr-canva" target="_blank" rel="noopener noreferrer"><span data-icono="ventana"></span>${escape(STR.inCanva)}</a>
                <button type="button" class="boton suave" id="pr-otra"><span data-icono="lista"></span>${escape(STR.other)}</button>
            </div>
            <div class="pr-marco" id="pr-marco"></div>
            <p class="nota pr-pista">${escape(STR.blank)}</p>
        </div>`;
    root.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));

    const showError = (text) => { const e = $('#pr-error'); e.textContent = text || ''; e.hidden = !text; };
    const paintList = () => {
        $('#pr-recientes').hidden = !store.items.length;
        $('#pr-lista').innerHTML = store.items.map((it) => `<li>
                <button type="button" class="pr-item" data-id="${escape(it.id)}"><span data-icono="presentacion"></span><span>${escape(it.name)}</span></button>
                <button type="button" class="redondo suave pr-quitar" data-quitar="${escape(it.id)}" aria-label="${escape(STR.remove + ': ' + it.name)}" title="${escape(STR.remove)}"><span data-icono="cerrar"></span></button>
            </li>`).join('');
        $('#pr-lista').querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
    };
    // The frame is made again for each presentation (a new address in the same frame would add to the page history).
    const show = (it) => {
        const marco = $('#pr-marco');
        marco.textContent = '';
        const frame = document.createElement('iframe');
        frame.id = 'pr-iframe';
        frame.title = it.name;
        frame.allow = 'fullscreen';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.src = embedUrl(it);
        marco.append(frame);
        $('#pr-titulo').textContent = it.name;
        $('#pr-canva').href = base(it) + 'view';
        $('#pr-elige').hidden = true;
        $('#pr-vista').hidden = false;
        announce(STR.opened(it.name));
    };
    const open = (it) => {
        store.items = [it].concat(store.items.filter((x) => x.id !== it.id)).slice(0, MAX);
        store.last = it.id;
        persist();
        show(it);
    };
    const back = () => {
        $('#pr-marco').textContent = '';
        $('#pr-vista').hidden = true;
        $('#pr-elige').hidden = false;
        store.last = null;
        persist();
        paintList();
        $('#pr-enlace').focus();
    };

    $('#pr-abrir').addEventListener('click', () => {
        const text = $('#pr-enlace').value.trim(), d = parse(text);
        if (!d) { showError(/canva\.link\//i.test(text) ? STR.short : STR.bad); return; }
        showError('');
        const before = store.items.find((x) => x.id === d.id);
        const name = $('#pr-nombre').value.trim() || (before && before.name) || STR.untitled;
        open({ id: d.id, token: d.token || (before && before.token) || '', name, at: Date.now() });
        $('#pr-enlace').value = ''; $('#pr-nombre').value = '';
    });
    $('#pr-enlace').addEventListener('keydown', (e) => { if (e.key === 'Enter') { $('#pr-abrir').click(); } });
    $('#pr-nombre').addEventListener('keydown', (e) => { if (e.key === 'Enter') { $('#pr-abrir').click(); } });
    $('#pr-lista').addEventListener('click', (e) => {
        const item = e.target.closest('[data-id]'), gone = e.target.closest('[data-quitar]');
        if (gone) {
            store.items = store.items.filter((x) => x.id !== gone.dataset.quitar);
            persist();
            paintList();
            return;
        }
        if (item) {
            const it = store.items.find((x) => x.id === item.dataset.id);
            if (it) { open(Object.assign({}, it, { at: Date.now() })); }
        }
    });
    $('#pr-otra').addEventListener('click', back);

    // The one that was open opens again when the tab is shown (it loads from Canva only then).
    let started = false;
    core.register('presentacion', {
        entra: () => {
            if (started) { return; }
            started = true;
            const last = store.last && store.items.find((x) => x.id === store.last);
            if (last) { show(last); } else { paintList(); }
        },
    });
    paintList();

    window.ClasstoolsPresentation = { parse, embedUrl, state: () => store };   // for automated tests
})();
