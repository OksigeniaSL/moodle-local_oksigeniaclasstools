// QR code for the board, nicer but still readable: module shape (squares, rounded, dots), eye shape (squares,
// rounded, circles), colours that keep strong contrast on white, and a logo in the middle (the site's, or an image
// of the teacher's). With a logo the code uses the highest error correction and keeps the middle clear. It can be
// shown big and downloaded as PNG or SVG. Generated here, offline (qrcode-generator, MIT, in lib/).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-qr');
    if (!core || !root) { return; }
    const { $, $$, t, escape, save, load, icon, setIcon, announce } = core;
    const siteLogo = (window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.logo) || null;   // only inside Moodle
    const course = (window.CLASSTOOLS && window.CLASSTOOLS.back) || '';

    const STR = {
        text: t('qr_text'), placeholder: t('qr_placeholder'), modules: t('qr_modules'), eyes: t('qr_eyes'),
        moduleStyles: { square: t('qr_modules_square'), rounded: t('qr_modules_rounded'), dots: t('qr_circles') },
        eyeStyles: { square: t('qr_eyes_square'), rounded: t('qr_eyes_rounded'), circle: t('qr_circles') },
        color: t('qr_colour'), eyeColor: t('qr_eye_colour'), same: t('qr_same'), logo: t('qr_logo'), none: t('qr_no_logo'),
        site: t('qr_site_logo'), mine: t('qr_my_image'), choose: t('qr_choose'), big: t('qr_enlarge'), png: t('qr_png'),
        svg: t('qr_svg'), erase: t('qr_erase'), note: t('qr_note'),
        empty: t('qr_empty'), tooLong: t('qr_too_long'),
        noLib: t('qr_no_lib'), bigImage: t('qr_big_image'),
        label: (x) => t('qr_label', x), saved: (f) => t('qr_saved', f),
    };
    // Dark colours only: QR readers need strong contrast with the white background (all of them ≥ 4.5:1).
    const COLORS = [[t('qr_black'), '#1c1a19'], [t('qr_blue'), '#164281'], [t('qr_green'), '#067e36'], [t('qr_red'), '#b3121f'],
        [t('qr_purple'), '#5b2fb8'], [t('qr_teal'), '#0b6670'], [t('qr_terracotta'), '#a8380b']];
    const hasLib = typeof qrcode === 'function';
    if (hasLib && qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) { qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']; }

    const defaults = { modules: 'rounded', eyes: 'rounded', color: '#164281', eyeColor: 'same', logo: siteLogo ? 'site' : 'none' };
    let opt = Object.assign({}, defaults, load('qr-estilo', {}));
    if (opt.logo === 'site' && !siteLogo) { opt.logo = 'none'; }
    let ownLogo = load('qr-logo', null);   // data URL of the teacher's own image (small)
    let logoData = null;                   // the logo as a data URL, so that downloads carry it inside
    let text = '', timer = 0;

    const swatches = (withSame) => (withSame ? `<button type="button" role="radio" class="ct-swatch ct-same" data-v="same" aria-label="${escape(STR.same)}">${STR.same}</button>` : '')
        + COLORS.map(([label, c]) => `<button type="button" role="radio" class="ct-swatch" data-v="${c}" style="--c:${c}" aria-label="${escape(label)}" title="${escape(label)}"></button>`).join('');
    root.innerHTML = `
        <div class="tarjeta qr-ajustes">
            <label class="campo apilado" for="qr-texto"><span>${STR.text}</span></label>
            <textarea id="qr-texto" rows="2" maxlength="1200" spellcheck="false" placeholder="${escape(STR.placeholder)}"></textarea>
            <div class="botonera">
                <button type="button" class="boton" id="qr-ampliar"><span data-icono="ampliar"></span>${STR.big}</button>
                <button type="button" class="boton suave" id="qr-png"><span data-icono="guardar"></span>${STR.png}</button>
                <button type="button" class="boton suave" id="qr-svg"><span data-icono="guardar"></span>${STR.svg}</button>
                <button type="button" class="boton suave" id="qr-borrar"><span data-icono="borrar"></span>${STR.erase}</button>
            </div>
            <p class="ante">${STR.modules}</p>
            <div class="segmentos" role="radiogroup" aria-label="${escape(STR.modules)}" id="qr-modules">${Object.entries(STR.moduleStyles).map(([k, v]) => `<button type="button" role="radio" aria-checked="false" data-v="${k}">${v}</button>`).join('')}</div>
            <p class="ante">${STR.eyes}</p>
            <div class="segmentos" role="radiogroup" aria-label="${escape(STR.eyes)}" id="qr-eyes">${Object.entries(STR.eyeStyles).map(([k, v]) => `<button type="button" role="radio" aria-checked="false" data-v="${k}">${v}</button>`).join('')}</div>
            <p class="ante">${STR.color}</p>
            <div class="ct-swatches" role="radiogroup" aria-label="${escape(STR.color)}" id="qr-color">${swatches(false)}</div>
            <p class="ante">${STR.eyeColor}</p>
            <div class="ct-swatches" role="radiogroup" aria-label="${escape(STR.eyeColor)}" id="qr-eyecolor">${swatches(true)}</div>
            <label class="campo apilado"><span>${STR.logo}</span><select id="qr-logo">
                <option value="none">${STR.none}</option>${siteLogo ? `<option value="site">${STR.site}</option>` : ''}<option value="mine">${STR.mine}</option></select></label>
            <div class="ct-row" id="qr-mine-box" hidden>
                <label class="boton suave ct-file"><span data-icono="nueva"></span>${STR.choose}<input type="file" id="qr-file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden></label>
            </div>
            <p class="nota" id="qr-nota">${STR.note}</p>
        </div>
        <div class="tarjeta qr-lienzo">
            <div class="qr-dibujo" id="qr-dibujo"></div>
            <p class="qr-ver" id="qr-ver"></p>
        </div>`;
    $$('[data-icono]', root).forEach((el) => setIcon(el, el.dataset.icono));

    // --- Drawing -------------------------------------------------------------------------------------------
    const QUIET = 4;   // white margin, in modules (the standard asks for 4)
    const eyePath = (x, y, style) => {
        // Ring of 7×7 with a 5×5 hole (even-odd), as a path.
        if (style === 'circle') {
            const cx = x + 3.5, cy = y + 3.5;
            const ring = (r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
            return ring(3.5) + ring(2.5);
        }
        const rr = (x0, y0, s, r) => (r ? `M${x0 + r} ${y0}h${s - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${s - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(s - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(s - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`
            : `M${x0} ${y0}h${s}v${s}h${-s}z`);
        return style === 'rounded' ? rr(x, y, 7, 2) + rr(x + 1, y + 1, 5, 1.3) : rr(x, y, 7, 0) + rr(x + 1, y + 1, 5, 0);
    };
    const eyeCenter = (x, y, style) => {
        if (style === 'circle') { return `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5"/>`; }
        return `<rect x="${x + 2}" y="${y + 2}" width="3" height="3"${style === 'rounded' ? ' rx="0.8"' : ''}/>`;
    };
    const build = (value, logoHref) => {
        const q = qrcode(0, logoHref ? 'H' : 'M');
        q.addData(value); q.make();
        const n = q.getModuleCount(), size = n + 2 * QUIET;
        const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
        // The middle that the logo covers (with a margin of one module), kept clear: about a fifth of the side.
        let hole = null;
        if (logoHref) {
            let side = Math.floor(n * 0.22);
            if (side % 2 !== n % 2) { side++; }
            const start = (n - side) / 2;
            hole = { start, end: start + side, side };
        }
        const inHole = (r, c) => !!hole && r >= hole.start - 1 && r < hole.end + 1 && c >= hole.start - 1 && c < hole.end + 1;
        // Rounded modules join their neighbours: a corner is only rounded where neither side touches another
        // module, so the code looks like smooth strokes and still reads as squares. All in one path, without seams.
        const dark = (r, c) => r >= 0 && c >= 0 && r < n && c < n && q.isDark(r, c) && !finder(r, c) && !inHole(r, c);
        const R = 0.5;
        const cell = (x, y, tl, tr, br, bl) => `M${x + (tl ? R : 0)} ${y}H${x + 1 - (tr ? R : 0)}${tr ? `A${R} ${R} 0 0 1 ${x + 1} ${y + R}` : ''}`
            + `V${y + 1 - (br ? R : 0)}${br ? `A${R} ${R} 0 0 1 ${x + 1 - R} ${y + 1}` : ''}H${x + (bl ? R : 0)}${bl ? `A${R} ${R} 0 0 1 ${x} ${y + 1 - R}` : ''}`
            + `V${y + (tl ? R : 0)}${tl ? `A${R} ${R} 0 0 1 ${x + R} ${y}` : ''}Z`;
        let path = '', dots = '';
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!dark(r, c)) { continue; }
                const x = c + QUIET, y = r + QUIET;
                if (opt.modules === 'dots') {
                    dots += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.45"/>`;
                } else if (opt.modules === 'rounded') {
                    const up = dark(r - 1, c), down = dark(r + 1, c), left = dark(r, c - 1), right = dark(r, c + 1);
                    path += cell(x, y, !up && !left, !up && !right, !down && !right, !down && !left);
                } else {
                    path += `M${x} ${y}h1v1h-1z`;
                }
            }
        }
        const eyeColor = opt.eyeColor === 'same' ? opt.color : opt.eyeColor;
        const eyes = [[QUIET, QUIET], [QUIET + n - 7, QUIET], [QUIET, QUIET + n - 7]];
        const body = opt.modules === 'dots' ? dots : `<path d="${path}"/>`;
        let logo = '';
        if (hole) {
            const x = QUIET + hole.start, pad = 0.6;
            logo = `<rect x="${x - pad}" y="${x - pad}" width="${hole.side + 2 * pad}" height="${hole.side + 2 * pad}" rx="${hole.side * 0.18}" fill="#fff"/>`
                + `<image href="${escape(logoHref)}" xlink:href="${escape(logoHref)}" x="${x}" y="${x}" width="${hole.side}" height="${hole.side}" preserveAspectRatio="xMidYMid meet"/>`;
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escape(STR.label(value))}"${opt.modules === 'square' ? ' shape-rendering="crispEdges"' : ''}>`
            + `<rect width="${size}" height="${size}" fill="#fff"/>`
            + `<g fill="${opt.color}">${body}</g>`
            + `<g fill="${eyeColor}">${eyes.map(([x, y]) => `<path fill-rule="evenodd" d="${eyePath(x, y, opt.eyes)}"/>${eyeCenter(x, y, opt.eyes)}`).join('')}</g>`
            + logo + '</svg>';
    };
    const visible = (t) => t.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    const logoHref = () => (opt.logo === 'none' ? null : logoData);

    const paint = () => {
        const t = $('#qr-texto').value.trim(), box = $('#qr-dibujo');
        text = '';
        $('#qr-ver').textContent = '';
        ['#qr-ampliar', '#qr-png', '#qr-svg'].forEach((s) => { $(s).disabled = true; });
        if (!t) { box.innerHTML = `<div class="vacio">${icon('qr')}<p>${STR.empty}</p></div>`; return; }
        if (!hasLib) { box.innerHTML = `<div class="vacio"><p>${STR.noLib}</p></div>`; return; }
        try {
            box.innerHTML = build(t, logoHref());
            text = t;
            $('#qr-ver').textContent = visible(t);
            ['#qr-ampliar', '#qr-png', '#qr-svg'].forEach((s) => { $(s).disabled = false; });
        } catch (e) {
            box.innerHTML = `<div class="vacio">${icon('qr')}<p>${STR.tooLong}</p></div>`;
        }
    };
    // The logo as a data URL (same origin for the site's), so that the downloaded files carry it.
    const loadLogo = () => {
        logoData = null;
        if (opt.logo === 'mine') { logoData = ownLogo; paint(); return; }
        if (opt.logo !== 'site' || !siteLogo) { paint(); return; }
        paint();
        fetch(siteLogo, { credentials: 'same-origin' }).then((r) => r.blob()).then((b) => new Promise((ok) => {
            const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b);
        })).then((data) => { logoData = data; paint(); }).catch(() => { logoData = siteLogo; paint(); });
    };

    // --- Downloads -------------------------------------------------------------------------------------------
    const fileName = (ext) => 'qr-' + (visible(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'codigo') + '.' + ext;
    const download = (blob, name) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name;
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        announce(STR.saved(name));
    };
    const downloadSvg = () => { if (text) { download(new Blob([build(text, logoHref())], { type: 'image/svg+xml' }), fileName('svg')); } };
    const downloadPng = () => {
        if (!text) { return; }
        const img = new Image(), px = 1200;
        img.onload = () => {
            const c = document.createElement('canvas'); c.width = c.height = px;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, px, px);
            ctx.drawImage(img, 0, 0, px, px);
            try { c.toBlob((b) => { if (b) { download(b, fileName('png')); } }, 'image/png'); } catch (e) { downloadSvg(); }
        };
        // A logo from outside the page (if it could not be read) would block the PNG: then it goes without it.
        const logo = logoHref();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(build(text, logo && logo.startsWith('data:') ? logo : null));
    };

    // --- Controls ------------------------------------------------------------------------------------------
    const persist = () => save('qr-estilo', opt);
    const paintControls = () => {
        $$('#qr-modules button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.modules)));
        $$('#qr-eyes button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.eyes)));
        $$('#qr-color .ct-swatch').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.color)));
        $$('#qr-eyecolor .ct-swatch').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.eyeColor)));
        $('#qr-logo').value = opt.logo;
        $('#qr-mine-box').hidden = opt.logo !== 'mine';
    };
    const choice = (id, key) => $(id).addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]'); if (!b) { return; }
        opt[key] = b.dataset.v; persist(); paintControls(); paint();
    });
    choice('#qr-modules', 'modules'); choice('#qr-eyes', 'eyes'); choice('#qr-color', 'color'); choice('#qr-eyecolor', 'eyeColor');
    $('#qr-logo').addEventListener('change', () => { opt.logo = $('#qr-logo').value; persist(); paintControls(); loadLogo(); });
    $('#qr-file').addEventListener('change', () => {
        const f = $('#qr-file').files[0];
        if (!f) { return; }
        if (f.size > 300 * 1024) { $('#qr-nota').textContent = STR.bigImage; return; }
        const fr = new FileReader();
        fr.onload = () => { ownLogo = fr.result; save('qr-logo', ownLogo); $('#qr-nota').textContent = STR.note; loadLogo(); };
        fr.readAsDataURL(f);
    });
    const textKey = 'qr' + ((window.CLASSTOOLS && window.CLASSTOOLS.courseid) ? ':' + window.CLASSTOOLS.courseid : '');
    $('#qr-texto').value = load(textKey, course);   // inside a course, its address to start with
    $('#qr-texto').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { paint(); save(textKey, $('#qr-texto').value); }, 200); });
    $('#qr-borrar').addEventListener('click', () => { $('#qr-texto').value = ''; save(textKey, ''); paint(); $('#qr-texto').focus(); });
    $('#qr-ampliar').addEventListener('click', () => {
        if (!text) { return; }
        core.openBig({ clase: 'blanco', etiqueta: STR.label(text), html: build(text, logoHref()).replace('<svg ', '<svg class="qr-grande" ') + `<p class="qr-pie">${escape(visible(text))}</p>` });
    });
    $('#qr-png').addEventListener('click', downloadPng);
    $('#qr-svg').addEventListener('click', downloadSvg);
    paintControls();
    loadLogo();

    window.ClasstoolsQr = { build, state: () => ({ opt, text }) };   // for automated tests
})();
