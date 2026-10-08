// Herramientas de clase: nueve herramientas para la pantalla de clase (temporizador, cronómetro, ¿a quién
// le toca?, grupos, semáforo de ruido, dado y moneda, así trabajamos, reloj y código QR). Todo funciona sin
// conexión dentro del paquete; las listas de clase se guardan solo en el navegador de ese ordenador.
'use strict';
(() => {
    const $ = (s) => document.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pad = (n) => String(n).padStart(2, '0');
    const azar = (n) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
    const baraja = (v) => { for (let i = v.length - 1; i > 0; i--) { const j = azar(i + 1); [v[i], v[j]] = [v[j], v[i]]; } return v; };
    const escapa = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const enMarco = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

    // --- Textos: los de los paquetes de idioma (dentro de Moodle, en el idioma de cada usuario; fuera, strings.js).
    // Marcadores al estilo de Moodle: {$a} y {$a->nombre}. Una clave que falte se ve tal cual, para encontrarla.
    const TEXTOS = Object.assign({}, window.CLASSTOOLS_STR || {}, (window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.str) || {});
    const t = (clave, a) => {
        const s = TEXTOS[clave];
        if (s === undefined) { return clave; }
        if (a === undefined) { return s; }
        return s.replace(/\{\$a(?:->(\w+))?\}/g, (m, k) => (k ? (a && a[k] !== undefined ? String(a[k]) : m) : String(a)));
    };
    // Lo fijo de la página: data-t (texto), data-t-title, data-t-aria (aria-label) y data-t-placeholder.
    const traduce = (raiz = document) => {
        $$('[data-t]', raiz).forEach((el) => { el.textContent = t(el.dataset.t); });
        [['tTitle', 'title'], ['tAria', 'aria-label'], ['tPlaceholder', 'placeholder']].forEach(([d, attr]) => {
            $$(`[data-${d.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}]`, raiz).forEach((el) => el.setAttribute(attr, t(el.dataset[d])));
        });
    };
    // El idioma: el del usuario dentro de Moodle; fuera, el del fichero de textos.
    const IDIOMA = ((window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.lang) || window.CLASSTOOLS_LANG || document.documentElement.lang || 'en').replace('_', '-');
    document.documentElement.lang = IDIOMA;
    traduce();

    // --- Almacén del navegador: solo comodidades; si no deja guardar, todo sigue funcionando en memoria ---
    let almacen = true;
    try { localStorage.setItem('pizarra:prueba', '1'); localStorage.removeItem('pizarra:prueba'); } catch (e) { almacen = false; }
    const guarda = (k, v) => { try { localStorage.setItem('pizarra:' + k, JSON.stringify(v)); } catch (e) { almacen = false; } };
    const lee = (k, d) => { try { const v = localStorage.getItem('pizarra:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };

    // --- Modo de la pantalla: uno cada vez (Infantil, Primaria, Secundaria o Superior) y recordado por curso. Cambia
    // el aspecto y los valores con los que empiezan los juegos; no quita ninguna herramienta. ---
    const PANTALLAS = ['early', 'primary', 'secondary', 'advanced'];
    const CLASE = window.CLASSTOOLS || null;
    const claveModo = 'modo-' + ((CLASE && CLASE.courseid) || 0);
    let modo = (() => {
        const enCurso = CLASE && CLASE.state && CLASE.state.settings && CLASE.state.settings.mode;
        const local = lee(claveModo, null);
        const sitio = window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.mode;
        return [local, enCurso, sitio, 'primary'].find((m) => PANTALLAS.includes(m));
    })();
    document.documentElement.dataset.modo = modo;
    // Valores que empiezan distinto en cada modo: cada modo parte de los suyos y recuerda lo que el profesor cambie
    // estando en él. Lo guardado antes de haber modos (las claves antiguas) pasa una sola vez al modo de entonces.
    const porModo = (clave, valores, antiguas = {}) => {
        const k = () => `${clave}-${modo}`;
        const hay = Object.entries(antiguas).filter(([, a]) => lee(a, null) !== null);
        if (hay.length && lee(k(), null) === null) { guarda(k(), Object.fromEntries(hay.map(([c, a]) => [c, lee(a, null)]))); }
        hay.forEach(([, a]) => { try { localStorage.removeItem('pizarra:' + a); } catch (e) { /* sin almacén */ } });
        return {
            get: () => Object.assign({}, valores.primary, valores[modo], lee(k(), {})),
            set: (cambios) => guarda(k(), Object.assign(lee(k(), {}), cambios)),
        };
    };

    // --- Iconos y avisos para lectores de pantalla ---
    const ponIcono = (el, n) => { el.dataset.icono = n; el.innerHTML = icono(n); };
    $$('[data-icono]').forEach((el) => ponIcono(el, el.dataset.icono));
    const anuncia = (t) => { const a = $('#anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 40); };
    // Cambia el texto de un botón con icono (el último <span>) sin tocar el icono.
    const rotula = (boton, texto, ico) => {
        const spans = boton.querySelectorAll(':scope > span');
        if (ico) { ponIcono(spans[0], ico); }
        spans[spans.length - 1].textContent = texto;
    };

    // --- Sonido: todo sintetizado en el navegador, sin ficheros ---
    let sonido = lee('sonido', true) !== false;
    let ctx = null, maestro = null;
    const audio = () => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { return null; }
        if (!ctx) {
            ctx = new AC();
            maestro = ctx.createGain(); maestro.gain.value = 0.5;
            const comp = ctx.createDynamicsCompressor(); maestro.connect(comp); comp.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') { ctx.resume(); }
        return ctx;
    };
    // El navegador solo deja sonar después de un gesto: despertamos el audio con el primer toque.
    addEventListener('pointerdown', () => { if (sonido) { audio(); } }, { capture: true });
    // Una campana suave: fundamental y tres parciales que se apagan antes.
    const campana = (a, f, cuando, vol, dur) => {
        const t = a.currentTime + cuando;
        [[1, 1, dur], [2, 0.32, dur * 0.6], [3.01, 0.12, dur * 0.35], [4.2, 0.05, dur * 0.2]].forEach(([m, v, d]) => {
            const o = a.createOscillator(), g = a.createGain();
            o.type = 'sine'; o.frequency.value = f * m;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(vol * v, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + d);
            o.connect(g); g.connect(maestro); o.start(t); o.stop(t + d + 0.05);
        });
    };
    const clic = (a, f, cuando = 0, vol = 0.12) => {
        const t = a.currentTime + cuando, o = a.createOscillator(), g = a.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        o.connect(g); g.connect(maestro); o.start(t); o.stop(t + 0.06);
    };
    const SONIDOS = {
        fin: (a) => [0, 1.5].forEach((r) => [[783.99, 0], [1046.5, 0.22], [1318.51, 0.44]].forEach(([f, d]) => campana(a, f, r + d, 0.45, 2.2))),
        tic: (a) => clic(a, 1500),
        elegido: (a) => { campana(a, 880, 0, 0.35, 1.2); campana(a, 1318.51, 0.12, 0.35, 1.6); },
        dado: (a) => [0, 0.07, 0.15, 0.24, 0.36].forEach((d, i) => clic(a, 500 + i * 90, d, 0.18)),
        moneda: (a) => { campana(a, 2093, 0, 0.12, 0.5); campana(a, 2349.3, 1.25, 0.18, 0.9); },
        aviso: (a) => { campana(a, 659.25, 0, 0.3, 1.2); campana(a, 659.25, 0.4, 0.3, 1.5); },
        cuenta: (a) => clic(a, 1250, 0, 0.16),
        cuentaFinal: (a) => campana(a, 987.77, 0, 0.3, 0.35),
        agotada: (a) => { campana(a, 523.25, 0, 0.4, 1.4); campana(a, 392, 0.28, 0.4, 1.6); campana(a, 261.63, 0.56, 0.45, 2.4); },
    };
    const suena = (n) => { if (!sonido) { return; } const a = audio(); if (!a) { return; } try { SONIDOS[n](a); } catch (e) { /* sin audio */ } };

    // --- Pantalla de alumnos (si el sitio la abre): solo las herramientas sin datos de la clase; las demás pestañas
    // ni siquiera aparecen. ---
    const PERMITIDAS = window.CLASSTOOLS && window.CLASSTOOLS.mode === 'student' && Array.isArray(window.CLASSTOOLS.tools) ? window.CLASSTOOLS.tools : null;
    if (PERMITIDAS) {
        document.documentElement.classList.add('modo-alumno');
        $$('.pestana').forEach((b) => { if (!PERMITIDAS.includes(b.dataset.h)) { b.remove(); } });
    }
    // --- Las herramientas que el centro quiere (lo elige el administrador); sin ninguna, todas. ---
    const DEL_CENTRO = window.CLASSTOOLS_SITE && Array.isArray(window.CLASSTOOLS_SITE.tools) && window.CLASSTOOLS_SITE.tools.length ? window.CLASSTOOLS_SITE.tools : null;
    if (DEL_CENTRO && $$('.pestana').some((b) => DEL_CENTRO.includes(b.dataset.h))) {
        $$('.pestana').forEach((b) => { if (!DEL_CENTRO.includes(b.dataset.h)) { b.remove(); $('#' + b.getAttribute('aria-controls')).hidden = true; } });
    }

    // --- Pestañas ---
    const HERR = {};   // cada herramienta puede tener entra() y sale()
    const pestanas = $$('.pestana'), barra = $('#barra'), tira = $('#pestanas');
    let actual = 'temporizador';
    const muestra = (h, foco = false) => {
        if (h !== actual && HERR[actual] && HERR[actual].sale) { HERR[actual].sale(); }
        actual = h;
        pestanas.forEach((b) => {
            const si = b.dataset.h === h;
            b.setAttribute('aria-selected', String(si));
            b.tabIndex = si ? 0 : -1;
            if (si && foco) { b.focus(); }
            // En pantallas estrechas la tira de pestañas se desplaza: la elegida, siempre a la vista.
            if (si && tira.scrollWidth > tira.clientWidth) {
                tira.scrollTo({ left: b.offsetLeft - (tira.clientWidth - b.offsetWidth) / 2, behavior: reducido() ? 'auto' : 'smooth' });
            }
        });
        $$('.herramienta').forEach((s) => { s.hidden = s.id !== 'h-' + h; });
        if (HERR[h] && HERR[h].entra) { HERR[h].entra(); }
        insignias();
        if (barra.classList.contains('compacta')) { ajustaBarra(); }
        document.dispatchEvent(new CustomEvent('classtools:tab', { detail: h }));
    };
    pestanas.forEach((b) => b.addEventListener('click', () => muestra(b.dataset.h)));
    $('#pestanas').addEventListener('keydown', (e) => {
        const i = pestanas.findIndex((b) => b.dataset.h === actual), n = pestanas.length;
        const j = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
        if (j !== undefined) { e.preventDefault(); muestra(pestanas[j].dataset.h, true); }
    });
    // Si las pestañas no caben junto al nombre, la barra pasa a dos filas.
    // Y si tampoco caben en dos filas, las pestañas que no están elegidas se quedan solo con su icono (con el nombre
    // al pasar por encima), primero en una fila y, si hace falta, en dos.
    pestanas.forEach((b) => { b.title = b.textContent.trim(); });
    const ajustaBarra = () => {
        const sobra = () => tira.scrollWidth > tira.clientWidth + 1;
        barra.classList.remove('dos-filas', 'compacta');
        if (!sobra()) { return; }
        barra.classList.add('dos-filas');
        if (!sobra()) { return; }
        barra.classList.replace('dos-filas', 'compacta');
        if (!sobra()) { return; }
        barra.classList.add('dos-filas');
    };
    addEventListener('resize', ajustaBarra);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(ajustaBarra); }

    // --- Botones de la barra: sonido, otra ventana, pantalla completa ---
    const bSonido = $('#b-sonido');
    const pintaSonido = () => {
        bSonido.setAttribute('aria-pressed', String(sonido));
        ponIcono(bSonido.querySelector('[data-icono]'), sonido ? 'sonido' : 'mudo');
        bSonido.title = sonido ? t('bar_sound_on') : t('bar_sound_off');
    };
    bSonido.addEventListener('click', () => { sonido = !sonido; guarda('sonido', sonido); pintaSonido(); suena('tic'); });
    // Dentro del aula virtual el SCORM va en un marco que puede bloquear el micrófono y la pantalla completa.
    const abreVentana = () => window.open(location.href, '_blank', 'noopener');
    $('#b-ventana').hidden = !enMarco;
    $('#b-ventana').addEventListener('click', abreVentana);
    const bPantalla = $('#b-pantalla');
    bPantalla.hidden = !document.fullscreenEnabled;
    bPantalla.addEventListener('click', () => {
        if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
        else { document.documentElement.requestFullscreen().catch(() => {}); }
    });
    document.addEventListener('fullscreenchange', () => {
        const dentro = !!document.fullscreenElement;
        ponIcono(bPantalla.querySelector('[data-icono]'), dentro ? 'salir' : 'pantalla');
        bPantalla.title = dentro ? t('bar_fullscreen_exit') : t('bar_fullscreen');
        bPantalla.querySelector('.redondo-texto').textContent = bPantalla.title;
        setTimeout(ajustaBarra, 50);
    });

    // Botón que repite mientras se mantiene pulsado (los + y − de los minutos).
    const repite = (boton, accion) => {
        let t1 = 0, t2 = 0;
        const para = () => { clearTimeout(t1); clearInterval(t2); };
        boton.addEventListener('pointerdown', (e) => {
            if (e.button > 0) { return; }
            accion(); para();
            t1 = setTimeout(() => { t2 = setInterval(accion, 90); }, 450);
        });
        ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach((ev) => boton.addEventListener(ev, para));
        boton.addEventListener('click', (e) => { if (e.detail === 0) { accion(); } });   // teclado
    };

    // ===================================================================================================
    // 1. Temporizador
    // ===================================================================================================
    const tm = { total: 300000, resta: 300000, fin: 0, marcha: false, acabado: false, reloj: 0 };
    // Por bloques (pomodoro): en qué parte va (trabajo o descanso) y qué bloque es (desde 0).
    const bq = { on: false, fase: 'trabajo', i: 0 };
    let bqEstado = () => '';
    const tmCifras = $('#tm-cifras'), tmAnillo = $('#tm-anillo'), tmProgreso = $('#tm-progreso');
    const fmtSeg = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`; };
    const MAX_TM = (99 * 60 + 59) * 1000;
    const tmPinta = () => {
        const txt = fmtSeg(Math.ceil(tm.resta / 1000));
        tmCifras.textContent = txt;
        tmCifras.classList.toggle('larga', txt.length > 5);
        const frac = tm.total ? Math.min(1, tm.resta / tm.total) : 0;
        tmProgreso.style.strokeDashoffset = String(1000 * (1 - frac));
        tmProgreso.style.opacity = frac > 0.002 ? '1' : '0';
        const tocado = tm.marcha || tm.acabado || tm.resta < tm.total;
        tmAnillo.classList.toggle('ultimo', tocado && tm.resta <= 10000);
        tmAnillo.classList.toggle('aviso', tocado && tm.resta > 10000 && frac <= 0.25);
        tmAnillo.classList.toggle('en-marcha', tm.marcha);
        pintaAspecto(frac);
        $('#tm-estado').textContent = tm.acabado ? t('fin_time') : (bq.on ? bqEstado()
            : (tm.marcha ? t('tm_running') : tm.resta < tm.total ? t('tm_paused') : t('tm_ready')));
        tmAnillo.classList.toggle('descanso', bq.on && bq.fase === 'descanso' && !tm.acabado);
        insignias();
        tmMini();
    };
    // Con el temporizador en marcha (o en pausa) y otra pestaña delante: un reloj pequeño en una esquina, para verlo,
    // pausarlo o pararlo sin volver; tocándolo, se vuelve al temporizador.
    const mini = document.createElement('div');
    mini.className = 'tm-mini'; mini.hidden = true;
    mini.innerHTML = `<button type="button" class="tm-mini-ir" id="tm-mini-ir"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="tm-mini-pista" cx="18" cy="18" r="15"/>`
        + `<circle class="tm-mini-arco" id="tm-mini-arco" cx="18" cy="18" r="15" pathLength="100" transform="rotate(-90 18 18)"/></svg><strong id="tm-mini-cifras"></strong></button>`
        + `<button type="button" class="redondo suave" id="tm-mini-marcha"></button>`
        + `<button type="button" class="redondo suave" id="tm-mini-parar">${icono('reiniciar')}</button>`;
    document.body.append(mini);
    mini.querySelector('#tm-mini-ir').setAttribute('title', t('tm_mini_go'));
    mini.querySelector('#tm-mini-parar').setAttribute('title', t('gen_reset'));
    mini.querySelector('#tm-mini-parar').setAttribute('aria-label', t('gen_reset'));
    function tmMini() {
        const activo = !tm.acabado && (tm.marcha || (tm.resta > 0 && tm.resta < tm.total));
        mini.hidden = !activo || actual === 'temporizador';
        if (mini.hidden) { return; }
        mini.querySelector('#tm-mini-cifras').textContent = fmtSeg(Math.ceil(tm.resta / 1000));
        mini.querySelector('#tm-mini-arco').style.strokeDashoffset = String(100 * (1 - (tm.total ? tm.resta / tm.total : 0)));
        mini.classList.toggle('ultimo', tm.resta <= 10000);
        mini.classList.toggle('pausa', !tm.marcha);
        const b = mini.querySelector('#tm-mini-marcha'), etiqueta = tm.marcha ? t('gen_pause') : t('gen_resume');
        if (b.dataset.estado !== String(tm.marcha)) { b.innerHTML = icono(tm.marcha ? 'pausa' : 'empezar'); b.dataset.estado = String(tm.marcha); }
        b.title = etiqueta; b.setAttribute('aria-label', etiqueta);
    }
    mini.querySelector('#tm-mini-ir').addEventListener('click', () => muestra('temporizador'));
    mini.querySelector('#tm-mini-marcha').addEventListener('click', () => $('#tm-marcha').click());
    mini.querySelector('#tm-mini-parar').addEventListener('click', () => $('#tm-reiniciar').click());
    document.addEventListener('classtools:tab', () => tmMini());
    const tmBotones = () => {
        const b = $('#tm-marcha');
        if (tm.marcha) { rotula(b, t('gen_pause'), 'pausa'); b.className = 'boton grande amarillo ancho'; }
        else { rotula(b, tm.resta < tm.total && tm.resta > 0 ? t('gen_resume') : t('gen_start'), 'empezar'); b.className = 'boton grande verde ancho'; }
        b.disabled = !tm.marcha && tm.total <= 0;
    };
    const tmChips = () => $$('.chip[data-min], .chip[data-ms]').forEach((c) => c.classList.toggle('activo', (c.dataset.min ? Number(c.dataset.min) * 60000 : Number(c.dataset.ms)) === tm.total));

    // Aspecto: el anillo de siempre, el disco rojo que se va comiendo, una barra o un reloj de arena (para cada
    // ordenador). El texto se coloca según el dibujo.
    const ASPECTOS = ['anillo', 'disco', 'barra', 'arena', 'pulsar'];
    // Cada modo empieza con lo suyo: Infantil con el disco rojo que se va comiendo, Superior con la barra sobria; los
    // tiempos rápidos, de más cortos a más largos; la cuenta de los últimos 10 segundos, solo con los pequeños.
    const tmModo = porModo('tm', {
        early: { aspecto: 'disco', rapidos: [1, 2, 3, 5, 10], final: true, viajero: 'cohete' },
        primary: { aspecto: 'anillo', rapidos: [1, 3, 5, 10, 15], final: true, viajero: 'cohete' },
        secondary: { aspecto: 'anillo', rapidos: [2, 5, 10, 15, 20], final: false, viajero: 'bateria' },
        advanced: { aspecto: 'barra', rapidos: [5, 10, 15, 20, 30], final: false, viajero: 'ninguno' },
    }, { aspecto: 'tm-aspecto', final: 'tm-final' });
    let aspecto = ASPECTOS.includes(tmModo.get().aspecto) ? tmModo.get().aspecto : 'anillo';
    let viajero = tmModo.get().viajero;
    const POSICION = { anillo: [100, 104, 100, 148], disco: [100, 104, 100, 152], barra: [100, 78, 100, 178], arena: [145, 98, 145, 132], pulsar: [100, 164, 100, 30] };
    // El color de la barra según lo que queda: verde, amarillo y, al final, rojo.
    // (En HSL, para que entre medias salgan lima y naranja vivos y no colores sucios.)
    const mezcla = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const VERDE = [142, 91, 26], AMARILLO = [44, 96, 54], ROJO = [-5, 82, 44];
    const colorBarra = (f) => {
        const [h, s, l] = f > 0.5 ? mezcla(AMARILLO, VERDE, (f - 0.5) * 2) : mezcla(ROJO, AMARILLO, f * 2);
        return `hsl(${Math.round((h + 360) % 360)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    };
    // La barra según su viajero (o sin él).
    const VIAJEROS = ['cohete', 'coche', 'caracol', 'barco', 'bateria', 'pixel', 'ninguno'];
    const dibujaBarra = (v, by, bh, br) => {
        let rayas = '';
        for (let i = -3; i < 14; i++) { rayas += `<path d="M${12 + i * 14} 150L${24 + i * 14} 118h7L${19 + i * 14} 150Z"/>`; }
        let cuadros = '';
        for (let i = 0; i < 9; i++) { cuadros += `<rect x="${186 + (i % 3) * 4}" y="${100 + Math.floor(i / 3) * 4}" width="4" height="4" fill="${((i % 3) + Math.floor(i / 3)) % 2 ? '#fff' : '#1c1a19'}"/>`; }
        const meta = `<g class="tm-meta"><line x1="186" y1="99" x2="186" y2="152"/>${cuadros}<rect class="tm-meta-borde" x="186" y="100" width="12" height="12"/></g>`;
        const estela = `<defs><clipPath id="tmEstela"><rect class="tm-estela" x="12" y="${by}" width="0" height="${bh}" rx="${br}"/></clipPath></defs>`;
        const dato = '<text class="tm-dato" x="100" y="197" text-anchor="middle"></text>';
        if (v === 'cohete' || v === 'ninguno') {
            return estela + `<rect class="tm-pista-barra" x="12" y="${by}" width="170" height="${bh}" rx="${br}"/>`
                + `<g clip-path="url(#tmEstela)"><rect class="tm-barra" x="12" y="${by}" width="170" height="${bh}"/><g class="tm-rayas">${rayas}</g></g>`
                + (v === 'ninguno' ? '' : meta + '<g class="tm-viajero tm-cohete"><path class="tm-llama" d="M-17 -5Q-31 0 -17 5Z"/>'
                    + '<path class="tm-aleta" d="M-14 -6L-20 -14H-11L-5 -6ZM-14 6L-20 14H-11L-5 6Z"/>'
                    + '<path class="tm-casco" d="M-17 -7H5Q17 -7 22 0Q17 7 5 7H-17Z"/><circle class="tm-ventana" cx="4" cy="0" r="3.6"/></g>' + dato);
        }
        if (v === 'coche') {
            return '<rect class="tm-carretera" x="12" y="118" width="170" height="32" rx="6"/><line class="tm-raya" x1="16" y1="134" x2="180" y2="134"/>' + meta
                + '<g class="tm-viajero tm-coche"><g class="tm-velocidad"><line x1="-34" y1="-4" x2="-26" y2="-4"/><line x1="-37" y1="1" x2="-26" y2="1"/></g>'
                + '<path class="tm-f1-aleron" d="M-25 -12 H-15 V-8.5 H-25 Z M-20 -8.5 V-3"/>'
                + '<path class="tm-f1-cuerpo" d="M-21 3.5 V-2.5 L-13 -3.5 L-7 -7 L1 -7 L4 -4 L13 -2 L21 1 L23 3.5 Z"/>'
                + '<path class="tm-f1-franja" d="M-12 0 H10"/><circle class="tm-f1-casco" cx="-2.5" cy="-7.6" r="2.7"/><path class="tm-f1-visera" d="M-1.6 -8.6 H0.6"/>'
                + '<path class="tm-f1-halo" d="M-6 -8.5 Q-1 -12 4 -6.5"/><path class="tm-f1-aleron" d="M14 3.8 H25.5 V6 H14 Z"/>'
                + '<circle class="tm-rueda" cx="-14" cy="4.2" r="5"/><circle class="tm-rueda" cx="13.5" cy="4.6" r="4.2"/>'
                + '<circle class="tm-llanta" cx="-14" cy="4.2" r="1.8"/><circle class="tm-llanta" cx="13.5" cy="4.6" r="1.5"/></g>' + dato;
        }
        if (v === 'caracol') {
            return estela + '<rect class="tm-suelo" x="10" y="141" width="180" height="9" rx="4.5"/>'
                + '<g clip-path="url(#tmEstela)"><rect class="tm-baba" x="12" y="137" width="170" height="5" rx="2.5"/></g>'
                + '<path class="tm-hoja" d="M190 141 Q177 128 188 112 Q202 124 190 141 Z"/><path class="tm-hoja-nervio" d="M190 140 Q188 127 188 114"/>'
                + '<g class="tm-viajero tm-caracol"><path class="tm-caracol-cuerpo" d="M-17 8 Q-19 3 -13 3 L8 3 Q13 3 14 -4 L15 -10 Q16 -12 17.5 -10 L17 -3 Q16.5 7 9 8 Z"/>'
                + '<path class="tm-antena" d="M14 -8 L12 -15 M16.5 -7 L19 -14"/><circle class="tm-ojito" cx="12" cy="-15.5" r="1.7"/><circle class="tm-ojito" cx="19" cy="-14.5" r="1.7"/>'
                + '<circle class="tm-concha" cx="-3" cy="-4" r="9"/><path class="tm-espiral" d="M-3 -4 a2 2 0 1 1 2 2 a4 4 0 1 1 -4 -4 a6.5 6.5 0 1 1 6.5 6.5"/></g>' + dato;
        }
        if (v === 'barco') {
            return '<rect class="tm-mar" x="10" y="129" width="180" height="21" rx="8"/>'
                + '<path class="tm-olas" d="M12 129 q5 -3.5 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0"/>'
                + '<ellipse class="tm-arena" cx="191" cy="130" rx="10" ry="4.5"/><path class="tm-palmera" d="M192 129 Q191 119 194 111"/>'
                + '<path class="tm-palma" d="M194 111 q-8 -2 -12 4 M194 111 q8 -3 11 3 M194 111 q-2 -7 -8 -9 M194 111 q4 -6 10 -6"/>'
                + '<g class="tm-viajero tm-barco"><g class="tm-mece"><path class="tm-casco-barco" d="M-15 2 L15 2 L10 9 L-10 9 Z"/><path class="tm-mastil" d="M0 2 V-18"/>'
                + '<path class="tm-vela" d="M1.5 -17 L13 0 L1.5 0 Z"/><path class="tm-foque" d="M-1.5 -14 L-11 0 L-1.5 0 Z"/></g></g>' + dato;
        }
        if (v === 'bateria') {
            let celdas = '';
            for (let k = 1; k < 4; k++) { celdas += `<line class="tm-celda" x1="${16 + 39 * k}" y1="118" x2="${16 + 39 * k}" y2="150"/>`; }
            return '<g class="tm-bateria-dibujo"><rect class="tm-bateria" x="12" y="114" width="164" height="40" rx="8"/><rect class="tm-borne" x="177" y="126" width="7" height="16" rx="2"/>'
                + `<rect class="tm-carga" x="16" y="118" width="156" height="32" rx="5"/>${celdas}</g>`;
        }
        // Píxel: una barra de carga de las de antes, a bloques.
        let bloques = '';
        for (let i = 0; i < 16; i++) { bloques += `<rect class="tm-bloque" x="${(13 + i * 10.625).toFixed(2)}" y="121" width="8.6" height="26"/>`; }
        return `<rect class="tm-pixel-marco" x="10" y="118" width="174" height="32"/>${bloques}`;
    };
    const pintaAspecto = (frac) => {
        tmAnillo.dataset.aspecto = aspecto;
        const [cx, cy, ex, ey] = POSICION[aspecto];
        tmCifras.setAttribute('x', cx); tmCifras.setAttribute('y', cy);
        $('#tm-estado').setAttribute('x', ex); $('#tm-estado').setAttribute('y', ey);
        const g = $('#tm-aspecto'), f = Math.max(0, Math.min(1, frac));
        if (aspecto !== 'pulsar' && aspecto !== 'barra') { g.dataset.hecho = ''; }
        if (aspecto === 'disco') {
            // Como los temporizadores visuales: el disco rojo es el tiempo que queda y mengua hacia las doce.
            const a = f * 2 * Math.PI, x = (100 - 82 * Math.sin(a)).toFixed(2), y = (100 - 82 * Math.cos(a)).toFixed(2);
            const sector = f >= 0.9999 ? '<circle class="tm-disco" cx="100" cy="100" r="82"/>'
                : (f > 0.0005 ? `<path class="tm-disco" d="M100 100L100 18A82 82 0 ${f > 0.5 ? 1 : 0} 0 ${x} ${y}Z"/>` : '');
            let marcas = '';
            for (let i = 0; i < 60; i += 5) { const r = i * 6 * Math.PI / 180; marcas += `<line x1="${(100 + 86 * Math.sin(r)).toFixed(1)}" y1="${(100 - 86 * Math.cos(r)).toFixed(1)}" x2="${(100 + (i % 15 ? 91 : 94) * Math.sin(r)).toFixed(1)}" y2="${(100 - (i % 15 ? 91 : 94) * Math.cos(r)).toFixed(1)}"/>`; }
            g.innerHTML = `<circle class="tm-cara" cx="100" cy="100" r="95"/>${sector}<g class="tm-marcas">${marcas}</g>`;
        } else if (aspecto === 'barra') {
            // Algo recorre la barra mientras pasa el tiempo, de la salida a la meta (el cohete de siempre, un coche de
            // carreras, un caracol, un velero), o la barra es lo que queda (la batería de un móvil, una barra de carga de
            // videojuego antiguo, o solo la barra). Se dibuja una vez; luego solo se mueve lo que se mueve.
            const v = VIAJEROS.includes(viajero) ? viajero : 'cohete';
            const [by, bh, br] = v === 'ninguno' ? (modo === 'advanced' ? [128, 12, 2] : (modo === 'secondary' ? [124, 20, 10] : [118, 32, 16]))
                : (v === 'bateria' ? [114, 40, 8] : [118, 32, v === 'pixel' ? 0 : 16]);
            const clave = `barra-${v}-${bh}`;
            if (g.dataset.hecho !== clave) { g.innerHTML = dibujaBarra(v, by, bh, br); g.dataset.hecho = clave; }
            const x = 29 + 135 * (1 - f);
            const pon = (sel, attr, val) => { const e = g.querySelector(sel); if (e) { e.setAttribute(attr, val); } };
            if (v === 'cohete') { pon('.tm-estela', 'width', (x - 8).toFixed(2)); g.querySelector('.tm-barra').style.fill = colorBarra(f); }
            if (v === 'caracol') { pon('.tm-estela', 'width', Math.max(0, x - 24).toFixed(2)); }
            if (v === 'ninguno') { pon('.tm-estela', 'width', (170 * f).toFixed(2)); g.querySelector('.tm-barra').style.fill = colorBarra(f); }
            if (v === 'bateria') {
                pon('.tm-carga', 'width', Math.max(0, 156 * f).toFixed(2));
                g.querySelector('.tm-carga').style.fill = colorBarra(f);
                g.querySelector('.tm-bateria-dibujo').classList.toggle('baja', f > 0 && f < 0.15);
            }
            if (v === 'pixel') {
                const n = Math.ceil(f * 16 - 1e-9), c = f > 0.5 ? '#35b24a' : (f > 0.2 ? '#f2b705' : '#e8432e');
                g.querySelectorAll('.tm-bloque').forEach((q, i) => { q.style.fill = i < n ? c : ''; q.classList.toggle('ultimo', i === n - 1 && f < 0.2); });
            }
            if (['cohete', 'coche', 'caracol', 'barco'].includes(v)) { pon('.tm-viajero', 'transform', `translate(${x.toFixed(2)} ${v === 'barco' ? 125 : 134})`); }
            // Antes de empezar, un dato del viajero: el tiempo también se mide en velocidades.
            const dato = g.querySelector('.tm-dato');
            if (dato) { dato.textContent = !tm.marcha && tm.total > 0 && tm.resta === tm.total && dato.dataset.hay !== '0' ? t('tm_fact_' + v) : ''; }
        } else if (aspecto === 'arena') {
            // Un reloj de arena de verdad: marco de madera, ampollas de cristal y arena que baja y se amontona. La
            // cantidad es la del tiempo (no la altura): el cristal se estrecha hacia el cuello.
            const hTop = 72 * Math.sqrt(f), yTop = 99 - hTop, k = 66 * (1 - Math.sqrt(f)), yb = 175 - k;
            const arriba = f > 0.0005 ? `<rect x="30" y="${yTop.toFixed(2)}" width="64" height="${(100 - yTop).toFixed(2)}" fill="url(#tmArena)" clip-path="url(#tmArriba)"/>` : '';
            const abajo = f < 0.9995 ? `<path d="M28 176V${(yb + k * 0.45).toFixed(2)}Q62 ${(yb - 6).toFixed(2)} 96 ${(yb + k * 0.45).toFixed(2)}V176Z" fill="url(#tmArena)" clip-path="url(#tmAbajo)"/>` : '';
            const chorro = tm.marcha && f > 0.0005 ? `<line class="tm-chorro" x1="62" y1="99" x2="62" y2="${(yb + 2).toFixed(2)}"/>` : '';
            const vidrioArriba = 'M36 24C36 60 58 86 59.5 99.5H64.5C66 86 88 60 88 24Z', vidrioAbajo = 'M59.5 100.5C58 114 36 140 36 176H88C88 140 66 114 64.5 100.5Z';
            g.innerHTML = '<defs><linearGradient id="tmArena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2cd78"/><stop offset="1" stop-color="#d79a31"/></linearGradient>'
                + `<clipPath id="tmArriba"><path d="${vidrioArriba}"/></clipPath><clipPath id="tmAbajo"><path d="${vidrioAbajo}"/></clipPath></defs>`
                + `<path class="tm-cristal" d="${vidrioArriba}"/><path class="tm-cristal" d="${vidrioAbajo}"/>${arriba}${abajo}${chorro}`
                + '<path class="tm-brillo" d="M42 30C42 54 52 76 57 92M42 170C42 150 50 126 56 112"/>'
                + '<rect class="tm-madera" x="26" y="174" width="72" height="11" rx="4"/><rect class="tm-madera" x="26" y="15" width="72" height="11" rx="4"/>'
                + '<rect class="tm-madera" x="29" y="24" width="5" height="152" rx="2"/><rect class="tm-madera" x="90" y="24" width="5" height="152" rx="2"/>';
        } else if (aspecto === 'pulsar') {
            // Un púlsar, como el de MiNuryana: estrella de neutrones con dos haces que giran (una vuelta cada 5 s),
            // anillos que se expanden y un campo de estrellas; el arco fino del borde es el tiempo que queda. Se dibuja
            // una vez y luego solo giran los haces y avanza el arco (así las ondas no vuelven a empezar).
            if (g.dataset.hecho !== 'pulsar') {
                let estrellas = '';
                for (let i = 0; i < 60; i++) {
                    const x = 4 + (Math.sin(i * 137.508) * 0.5 + 0.5) * 192, y = 4 + (Math.cos(i * 137.508) * 0.5 + 0.5) * 192;
                    if (Math.hypot(x - 100, y - 100) < 92) { estrellas += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + (i % 3) * 0.5).toFixed(1)}" fill="#fff" opacity="${(0.15 + (i % 7) * 0.1).toFixed(2)}"/>`; }
                }
                g.innerHTML = '<defs><radialGradient id="tmEspacio"><stop offset="0" stop-color="#0a1a33"/><stop offset="1" stop-color="#000510"/></radialGradient>'
                    + '<radialGradient id="tmNeutron"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#a5f3fc"/><stop offset=".75" stop-color="#0891b2"/><stop offset="1" stop-color="#0891b2" stop-opacity="0"/></radialGradient>'
                    + '<linearGradient id="tmHaz"><stop offset="0" stop-color="#22d3ee" stop-opacity="0"/><stop offset=".3" stop-color="#22d3ee" stop-opacity=".5"/><stop offset=".5" stop-color="#c8ffff"/><stop offset=".7" stop-color="#22d3ee" stop-opacity=".5"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient>'
                    + '<filter id="tmBrilla" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
                    + `<circle cx="100" cy="100" r="96" fill="url(#tmEspacio)"/>${estrellas}`
                    + [0, 1, 2].map((i) => `<circle class="tm-pulsar-onda" cx="100" cy="100" r="90" style="animation-delay:${(i * 1.17).toFixed(2)}s"/>`).join('')
                    + '<g class="tm-haces"><rect x="6" y="98.5" width="188" height="3" fill="url(#tmHaz)" filter="url(#tmBrilla)"/>'
                    + '</g>'
                    + '<circle cx="100" cy="100" r="13" fill="url(#tmNeutron)" filter="url(#tmBrilla)"/>'
                    + '<circle class="tm-pulsar-arco" cx="100" cy="100" r="94" pathLength="1000" transform="rotate(-90 100 100)"/>'
                    + '<rect class="tm-pulsar-capsula" x="52" y="148" width="96" height="30" rx="15"/>';
                g.dataset.hecho = 'pulsar';
            }
            const pasado = Math.max(0, (tm.total - tm.resta) / 1000);
            g.querySelector('.tm-haces').setAttribute('transform', `rotate(${((pasado * 72) % 360).toFixed(1)} 100 100)`);
            g.querySelector('.tm-pulsar-arco').style.strokeDashoffset = String(1000 * (1 - f));
        } else {
            g.innerHTML = '';
        }
    };
    // Qué recorre la barra: solo se ve con el aspecto «Barra».
    $('#tm-viajeros').innerHTML = VIAJEROS.map((k) => `<option value="${k}">${escapa(t('tm_v_' + k))}</option>`).join('');
    const tmPintaViajeros = () => {
        $('#tm-viajeros-caja').hidden = aspecto !== 'barra';
        $('#tm-viajeros').value = VIAJEROS.includes(viajero) ? viajero : 'cohete';
    };
    $('#tm-viajeros').addEventListener('change', () => { viajero = $('#tm-viajeros').value; tmModo.set({ viajero }); tmPinta(); });
    $$('#tm-aspectos button').forEach((b) => {
        b.setAttribute('aria-checked', String(b.dataset.v === aspecto));
        b.addEventListener('click', () => {
            aspecto = b.dataset.v; tmModo.set({ aspecto });
            $$('#tm-aspectos button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
            tmPintaViajeros(); tmPinta();
        });
    });
    tmPintaViajeros();

    // Aviso cuando queda 1 minuto (solo en tiempos de más de 2 minutos: en los cortos no tiene sentido).
    let avisar = lee('tm-avisar', true) !== false;
    $('#tm-avisar').checked = avisar;
    $('#tm-avisar').addEventListener('change', (e) => { avisar = e.target.checked; guarda('tm-avisar', avisar); });
    let pocoTimer = 0;
    // Los últimos 10 segundos, para cantarlos: cada segundo, un latido de las cifras, un destello y un «tic» (más agudo
    // en los tres últimos). Se puede apagar; viene encendido.
    let finalAnimado = tmModo.get().final !== false;
    $('#tm-final').checked = finalAnimado;
    $('#tm-final').addEventListener('change', (e) => { finalAnimado = e.target.checked; tmModo.set({ final: finalAnimado }); });
    const tmCuentaFinal = () => {
        const s = Math.ceil(tm.resta / 1000);
        if (!finalAnimado || s > 10 || s < 1 || s === tm.ultimoSegundo) { tm.ultimoSegundo = s; return; }
        tm.ultimoSegundo = s;
        tmAnillo.classList.remove('latido'); void tmAnillo.getBoundingClientRect(); tmAnillo.classList.add('latido');
        suena(s <= 3 ? 'cuentaFinal' : 'cuenta');
    };
    const tmAvisaPoco = () => {
        if (!avisar || tm.avisado || tm.total <= 120000 || tm.resta > 60000 || tm.resta <= 1500) { return; }
        tm.avisado = true;
        suena('aviso');
        const p = $('#tm-poco');
        p.textContent = t('tm_one_left'); p.hidden = false;
        clearTimeout(pocoTimer); pocoTimer = setTimeout(() => { p.hidden = true; }, 5000);
        anuncia(t('tm_one_left'));
    };

    // Los tiempos del profesor: uno o dos que use mucho, además de los de siempre. Se guardan en este ordenador y,
    // dentro de un curso, en Moodle (le siguen a cualquier ordenador).
    const ajustesCurso = Object.assign({}, (CLASE && CLASE.state && CLASE.state.settings) || {});
    const guardaAjustes = (cambios) => { Object.assign(ajustesCurso, cambios, { updated: Date.now() }); guardaEnAula('settings', ajustesCurso); };
    const valido = (ms) => Number.isFinite(ms) && ms > 0 && ms <= MAX_TM;
    let favoritos = (Array.isArray(ajustesCurso.favs) ? ajustesCurso.favs : lee('tiempos-favoritos', [])).map(Number).filter(valido).slice(0, 2);
    const etiquetaTiempo = (ms) => (ms % 60000 === 0 ? t('tm_min_short', ms / 60000) : fmtSeg(Math.round(ms / 1000)));
    const pintaFavoritos = () => {
        $('#tm-favoritos').innerHTML = favoritos.map((ms) => `<span class="chip-fav"><button type="button" class="chip" data-ms="${ms}" title="${escapa(t('tm_fav', etiquetaTiempo(ms)))}">${escapa(etiquetaTiempo(ms))}</button>`
            + `<button type="button" class="chip-quita" data-quita="${ms}" aria-label="${escapa(t('tm_fav_remove', etiquetaTiempo(ms)))}">${icono('cerrar')}</button></span>`).join('');
        const add = $('#tm-fav-add');
        const yaEsta = favoritos.includes(tm.total) || $$('.chip[data-min]').some((c) => Number(c.dataset.min) * 60000 === tm.total);
        add.hidden = tm.total <= 0 || yaEsta;
        add.innerHTML = `${icono('mas')}<span>${escapa(t('tm_fav_add', etiquetaTiempo(tm.total)))}</span>`;
        add.title = t('tm_fav_add_title');
        $('#tm-avisar-caja').hidden = tm.total <= 120000;   // en tiempos cortos el aviso no tiene sentido
        tmChips();
    };
    const guardaFavoritos = () => { guarda('tiempos-favoritos', favoritos); guardaAjustes({ favs: favoritos }); pintaFavoritos(); };
    $('#tm-fav-add').addEventListener('click', () => {
        if (!valido(tm.total) || favoritos.includes(tm.total)) { return; }
        favoritos = favoritos.concat(tm.total).slice(-2);
        guardaFavoritos(); suena('tic');
    });
    $('#tm-favoritos').addEventListener('click', (e) => {
        const quita = e.target.closest('[data-quita]');
        if (quita) { favoritos = favoritos.filter((ms) => ms !== Number(quita.dataset.quita)); guardaFavoritos(); return; }
        const c = e.target.closest('[data-ms]');
        if (c) { tmPon(Number(c.dataset.ms)); }
    });
    // Pone un tiempo nuevo (para el temporizador y lo deja listo).
    const tmPon = (ms) => {
        ms = Math.max(0, Math.min(MAX_TM, Math.round(ms / 1000) * 1000));
        clearInterval(tm.reloj);
        Object.assign(tm, { total: ms, resta: ms, marcha: false, acabado: false });
        $('#tm-min').value = Math.floor(ms / 60000);
        $('#tm-seg').value = Math.floor(ms / 1000) % 60;
        tm.avisado = false;
        pintaFavoritos(); tmBotones(); tmPinta();
    };
    const tmTic = () => {
        tm.resta = Math.max(0, tm.fin - Date.now());
        if (tm.resta <= 0) { tmTermina(); } else { tmAvisaPoco(); tmPinta(); tmCuentaFinal(); }
    };
    const tmEmpieza = () => {
        if (tm.total <= 0) { return; }
        if (tm.resta <= 0) { tm.resta = tm.total; }
        if (sonido) { audio(); }   // así la campana del final podrá sonar
        Object.assign(tm, { acabado: false, marcha: true, fin: Date.now() + tm.resta });
        clearInterval(tm.reloj); tm.reloj = setInterval(tmTic, 100);
        tmBotones(); tmPinta();
        anuncia(t('tm_running_sr'));
    };
    const tmPausa = () => {
        tm.resta = Math.max(0, tm.fin - Date.now()); tm.marcha = false; clearInterval(tm.reloj);
        tmBotones(); tmPinta();
        anuncia(t('tm_paused_sr'));
    };
    const tmReinicia = () => {
        if (bq.on) { bqDeCero(); return; }
        clearInterval(tm.reloj); Object.assign(tm, { marcha: false, acabado: false, avisado: false, resta: tm.total }); tmBotones(); tmPinta();
    };
    const tmAlterna = () => { if (tm.marcha) { tmPausa(); } else { tmEmpieza(); } };
    const tmTermina = () => {
        if (bq.on && bqSigue()) { return; }
        clearInterval(tm.reloj);
        Object.assign(tm, { marcha: false, acabado: true, resta: 0 });
        tmBotones(); tmPinta();
        suena('fin');
        const f = $('#fin-tiempo');
        f.hidden = false;
        f.classList.remove('destella'); void f.offsetWidth; f.classList.add('destella');
        $('#fin-vale').focus();
        anuncia(t('fin_time'));
    };
    const finCierra = (otra) => { $('#fin-tiempo').hidden = true; tmReinicia(); if (otra) { tmEmpieza(); } };
    $('#fin-vale').addEventListener('click', () => finCierra(false));
    $('#fin-otra').addEventListener('click', () => finCierra(true));
    $('#tm-marcha').addEventListener('click', tmAlterna);
    $('#tm-reiniciar').addEventListener('click', tmReinicia);
    $('#tm-mas1').addEventListener('click', () => {
        if (tm.marcha) { tm.fin = Math.min(tm.fin + 60000, Date.now() + MAX_TM); tm.total = Math.min(MAX_TM, tm.total + 60000); tm.avisado = false; tmTic(); return; }
        if (tm.resta === tm.total) { tmPon(tm.total + 60000); return; }
        tm.resta = Math.min(MAX_TM, tm.resta + 60000); tm.total = Math.max(tm.total, tm.resta); tmBotones(); tmPinta();
    });
    // Los tiempos rápidos del modo (cinco, de los más cortos a los más largos).
    const tmRapidos = () => {
        const r = tmModo.get().rapidos;
        $$('.chip[data-min]').forEach((c, i) => { c.dataset.min = r[i] || c.dataset.min; c.textContent = t('tm_min_short', c.dataset.min); });
    };
    tmRapidos();
    // Al cambiar de modo, el temporizador toma lo de ese modo (si no está en marcha, el aspecto se ve ya).
    document.addEventListener('classtools:mode', () => {
        const v = tmModo.get();
        aspecto = ASPECTOS.includes(v.aspecto) ? v.aspecto : 'anillo';
        viajero = v.viajero;
        $$('#tm-aspectos button').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === aspecto)));
        tmPintaViajeros();
        finalAnimado = v.final !== false; $('#tm-final').checked = finalAnimado;
        tmRapidos(); tmChips(); pintaFavoritos(); tmPinta();
    });
    $$('.chip[data-min]').forEach((c) => c.addEventListener('click', () => tmPon(Number(c.dataset.min) * 60000)));
    $$('[data-ajusta]').forEach((b) => repite(b, () => {
        const paso = Number(b.dataset.paso) * (b.dataset.ajusta === 'min' ? 60000 : 1000);
        tmPon(Math.max(0, tm.total + paso));
    }));
    const leeCampos = () => {
        const m = Math.max(0, Math.min(99, Math.floor(Number($('#tm-min').value) || 0)));
        const s = Math.max(0, Math.min(59, Math.floor(Number($('#tm-seg').value) || 0)));
        tmPon((m * 60 + s) * 1000);
    };
    ['#tm-min', '#tm-seg'].forEach((s) => {
        $(s).addEventListener('change', leeCampos);
        $(s).addEventListener('keydown', (e) => { if (e.key === 'Enter') { leeCampos(); } });
        $(s).addEventListener('focus', (e) => e.target.select());
    });

    // Por bloques de trabajo y descanso (un pomodoro para la clase): unos bloques de trabajo con un descanso entre
    // cada dos. Al acabar cada parte suena, sale un aviso (en el descanso, un consejo: mirar lejos, estirarse, beber
    // agua) y empieza la siguiente sola; al acabar el último bloque, el final de siempre. Cada modo empieza con los
    // suyos (más cortos para los pequeños) y recuerda lo que ponga el profesor.
    const bqModo = porModo('tm-bloques', {
        early: { on: false, trabajo: 10, descanso: 3, n: 3 }, primary: { on: false, trabajo: 15, descanso: 5, n: 3 },
        secondary: { on: false, trabajo: 25, descanso: 5, n: 2 }, advanced: { on: false, trabajo: 25, descanso: 5, n: 4 },
    });
    const BQ_LIMITES = { trabajo: [5, 60], descanso: [1, 20], n: [2, 8] };
    const bqConf = () => {
        const c = bqModo.get();
        return Object.fromEntries(Object.entries(BQ_LIMITES).map(([k, [a, b]]) => [k, Math.max(a, Math.min(b, Math.round(Number(c[k]) || a)))]));
    };
    bqEstado = () => {
        const c = bqConf();
        return bq.fase === 'descanso' ? t('bq_rest_now') : t('bq_work_n', { n: bq.i + 1, of: c.n });
    };
    const bqPinta = () => {
        const c = bqConf();
        $$('#tm-tipo button').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.v === 'bloques') === bq.on)));
        $('#tm-bloques-caja').hidden = !bq.on;
        $('#tm-rapidos-caja').hidden = bq.on; $('#tm-medida-caja').hidden = bq.on;
        $('#bq-trabajo').textContent = t('tm_min_short', c.trabajo);
        $('#bq-descanso').textContent = t('tm_min_short', c.descanso);
        $('#bq-n').textContent = c.n;
        $('#bq-resumen').textContent = t('bq_summary', { n: c.n, work: c.trabajo, rest: c.descanso, total: c.n * c.trabajo + (c.n - 1) * c.descanso });
        $$('[data-bq]').forEach((b) => { const [a, z] = BQ_LIMITES[b.dataset.bq], v = c[b.dataset.bq]; b.disabled = Number(b.dataset.paso) < 0 ? v <= a : v >= z; });
    };
    // Al primer bloque de trabajo, parado.
    const bqDeCero = () => { Object.assign(bq, { fase: 'trabajo', i: 0 }); tmPon(bqConf().trabajo * 60000); };
    // Acaba una parte: si queda otra, empieza sola (y devuelve true).
    const bqSigue = () => {
        const c = bqConf();
        if (bq.fase === 'trabajo' && bq.i >= c.n - 1) { return false; }
        if (bq.fase === 'trabajo') { bq.fase = 'descanso'; } else { bq.fase = 'trabajo'; bq.i++; }
        const descanso = bq.fase === 'descanso';
        tmPon((descanso ? c.descanso : c.trabajo) * 60000);
        tmEmpieza();
        suena(descanso ? 'fin' : 'aviso');
        const aviso = descanso ? t('bq_tip_' + (1 + Math.floor(Math.random() * 6))) : t('bq_back', { n: bq.i + 1, of: c.n });
        const p = $('#tm-poco');
        p.textContent = aviso; p.hidden = false;
        clearTimeout(pocoTimer); pocoTimer = setTimeout(() => { p.hidden = true; }, 9000);
        anuncia(aviso);
        return true;
    };
    let bqAntes = tm.total;
    const bqPon = (on) => {
        if (on === bq.on) { return; }
        bq.on = on; bqModo.set({ on });
        if (on) { bqAntes = tm.total; bqDeCero(); } else { tmPon(bqAntes); }
        bqPinta();
    };
    $('#tm-tipo').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { bqPon(b.dataset.v === 'bloques'); } });
    $$('[data-bq]').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.bq, c = bqConf(), [a, z] = BQ_LIMITES[k];
        bqModo.set({ [k]: Math.max(a, Math.min(z, c[k] + Number(b.dataset.paso) * (k === 'trabajo' ? 5 : 1))) });
        // Parado y sin empezar, se ve ya; en marcha, vale para las partes que vienen.
        if (!tm.marcha && tm.resta === tm.total) { bqDeCero(); } else { tmPinta(); }
        bqPinta();
    }));
    document.addEventListener('classtools:mode', () => {
        const on = !!bqModo.get().on;
        if (on !== bq.on) { bq.on = !on; bqPon(on); } else { bqPinta(); }
    });
    if (bqModo.get().on) { bqPon(true); } else { bqPinta(); }

    // ===================================================================================================
    // 2. Cronómetro
    // ===================================================================================================
    const cr = { acum: 0, desde: 0, marcha: false, reloj: 0, vueltas: [] };
    const crTiempo = () => cr.acum + (cr.marcha ? Date.now() - cr.desde : 0);
    const fmtCr = (ms) => { const s = Math.floor(ms / 1000); return { p: fmtSeg(s), d: s >= 3600 ? '' : ',' + (Math.floor(ms / 100) % 10) }; };
    const crPinta = () => {
        const t = crTiempo(), { p, d } = fmtCr(t);
        $('#cr-principal').textContent = p; $('#cr-decima').textContent = d;
        $('#cr-cifras').classList.toggle('horas', t >= 3600000);
        $('#cr-cifras').classList.toggle('corre', cr.marcha);
        insignias();
    };
    const crBotones = () => {
        const b = $('#cr-marcha');
        if (cr.marcha) { rotula(b, t('gen_pause'), 'pausa'); b.className = 'boton grande amarillo'; }
        else { rotula(b, cr.acum ? t('gen_resume') : t('gen_start'), 'empezar'); b.className = 'boton grande verde'; }
        $('#cr-vuelta').disabled = !cr.marcha;
    };
    const crPintaVueltas = () => {
        const hay = cr.vueltas.length > 0;
        $('#cr-vueltas-caja').hidden = !hay;
        $('#h-cronometro').classList.toggle('con-vueltas', hay);
        $('#cr-vueltas').innerHTML = cr.vueltas.map((v, i) => ({ v, i })).reverse().map(({ v, i }) => {
            const p = fmtCr(v.parcial), a = fmtCr(v.total);
            return `<li><span class="n">${t('cr_lap_n', i + 1)}</span><span class="parcial">${p.p}${p.d}</span><span class="acum">${t('cr_lap_total', a.p + a.d)}</span></li>`;
        }).join('');
    };
    const crAlterna = () => {
        if (cr.marcha) { cr.acum += Date.now() - cr.desde; cr.marcha = false; clearInterval(cr.reloj); }
        else { cr.desde = Date.now(); cr.marcha = true; cr.reloj = setInterval(crPinta, 100); }
        crBotones(); crPinta();
    };
    $('#cr-marcha').addEventListener('click', crAlterna);
    $('#cr-vuelta').addEventListener('click', () => {
        const t = crTiempo(), antes = cr.vueltas.length ? cr.vueltas[cr.vueltas.length - 1].total : 0;
        cr.vueltas.push({ total: t, parcial: t - antes });
        crPintaVueltas();
    });
    $('#cr-reiniciar').addEventListener('click', () => {
        clearInterval(cr.reloj); Object.assign(cr, { acum: 0, marcha: false, vueltas: [] });
        crBotones(); crPinta(); crPintaVueltas();
    });

    // Las pestañas del temporizador y del cronómetro avisan si siguen en marcha mientras usas otra herramienta.
    const insignias = () => {
        const it = $('#ins-temporizador'), ic = $('#ins-cronometro');
        it.hidden = !(tm.marcha && actual !== 'temporizador');
        if (!it.hidden) { it.textContent = fmtSeg(Math.ceil(tm.resta / 1000)); }
        ic.hidden = !(cr.marcha && actual !== 'cronometro');
        if (!ic.hidden) { ic.textContent = fmtSeg(Math.floor(crTiempo() / 1000)); }
    };

    // ===================================================================================================
    // Listas de clase (las usan «¿A quién le toca?» y «Hacer grupos»)
    // ===================================================================================================
    let listas = lee('listas', []);
    if (!Array.isArray(listas)) { listas = []; }
    listas = listas.filter((l) => l && typeof l.id === 'string' && typeof l.nombre === 'string' && Array.isArray(l.alumnos))
        .map((l) => ({ id: l.id, nombre: l.nombre, alumnos: l.alumnos.filter((n) => typeof n === 'string' && n) }));
    // Listas que llegan del aula (plugin «Herramientas de clase» de Moodle): los alumnos del curso y de cada
    // grupo, con su foto. No se guardan en el navegador: se renuevan cada vez que se abre desde el curso.
    const AULA = window.CLASSTOOLS && Array.isArray(window.CLASSTOOLS.lists) ? window.CLASSTOOLS : null;
    const listasAula = AULA ? AULA.lists.map((l) => {
        const vistos = {}, fotos = {}, ids = {}, veces = {};
        const alumnos = (l.students || []).filter((a) => a && a.n).map((a) => {
            vistos[a.n] = (vistos[a.n] || 0) + 1;
            const n = vistos[a.n] > 1 ? `${a.n} (${vistos[a.n]})` : a.n;
            if (a.f) { fotos[n] = a.f; }
            if (a.i) { ids[n] = a.i; veces[n] = a.v || 0; }
            return n;
        });
        return { id: 'aula-' + l.id, nombre: l.name, alumnos, fotos, ids, veces, aula: true };
    }) : [];
    // El profe también juega (si lo enciende): quien tiene la pantalla abierta entra en las listas del curso, con su
    // foto. Sus turnos no se guardan en Moodle, y en el sorteo justo cuenta como uno más, sin colarse el primero.
    const YO = AULA && AULA.me && AULA.me.n ? AULA.me : null;
    const claveYo = 'conmigo-' + (AULA ? AULA.courseid : 0);
    let conmigo = !!YO && lee(claveYo, false) === true;
    const ponYo = () => {
        listasAula.forEach((l) => {
            if (l.yo) { l.alumnos = l.alumnos.filter((n) => n !== l.yo); delete l.fotos[l.yo]; delete l.veces[l.yo]; l.yo = null; }
            if (!conmigo || !YO) { return; }
            const n = l.alumnos.includes(YO.n) ? t('q_me_name', YO.n) : YO.n;
            const vs = Object.values(l.veces);
            l.yo = n; l.alumnos = l.alumnos.concat(n); l.veces[n] = vs.length ? Math.min(...vs) : 0;
            if (YO.f) { l.fotos[n] = YO.f; }
        });
    };
    ponYo();
    // Si la sesión del aula virtual caduca (una pantalla encendida toda la mañana), lo que se envía no llega: se avisa
    // en vez de perderlo en silencio, y lo pendiente sigue en este ordenador.
    const SIN_SESION = ['requireloginerror', 'invalidsesskey', 'servicerequireslogin', 'sitemaintenance'];
    const sinSesion = (j) => !!(j && j.errorcode && SIN_SESION.includes(j.errorcode));
    const avisaSesion = () => {
        if (document.getElementById('aviso-sesion')) { return; }
        const a = document.createElement('div');
        a.className = 'aviso-sesion'; a.id = 'aviso-sesion'; a.setAttribute('role', 'alert');
        a.innerHTML = `<span>${icono('info')}</span><p><strong>${t('bar_session_title')}</strong> ${t('bar_session_text')}</p>`
            + `<button type="button" class="boton">${t('bar_session_login')}</button>`;
        a.querySelector('button').addEventListener('click', () => location.reload());
        document.body.append(a);
    };
    // Envíos al aula: el turno de cada sorteo y los equipos que se quieran guardar como grupos del curso.
    const alAula = (url, datos) => fetch(url, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(Object.assign({ sesskey: AULA.sesskey, courseid: AULA.courseid }, datos)),
    }).then((r) => r.json()).then((j) => {
        if (sinSesion(j)) { avisaSesion(); }
        if (!j || !j.ok) { throw new Error((j && (j.error || j.message)) || 'error'); }
        return j;
    });
    // Un turno más para ese alumno en todas las listas en las que está (el curso entero y su clase).
    const sumaTurno = (id) => listasAula.forEach((x) => { Object.keys(x.ids).forEach((n) => { if (x.ids[n] === id) { x.veces[n] = (x.veces[n] || 0) + 1; } }); });
    const todas = () => listasAula.concat(listas);
    let listaActiva = lee('lista-activa', null);
    if (!todas().some((l) => l.id === listaActiva)) { listaActiva = todas().length ? todas()[0].id : null; }
    // Abierta desde un curso, empieza por la lista de ese curso.
    if (listasAula.length && !listasAula.some((l) => l.id === listaActiva)) { listaActiva = listasAula[0].id; }
    let salidos = lee('salidos', {});
    if (!salidos || typeof salidos !== 'object') { salidos = {}; }
    const guardaListas = () => {
        guarda('listas', listas); guarda('lista-activa', listaActiva); guarda('salidos', salidos);
        document.dispatchEvent(new CustomEvent('classtools:lists'));   // las demás herramientas (Azar…) refrescan sus listas
    };
    // Quién falta hoy: se apunta por lista y solo vale para hoy (mañana vuelven todos).
    const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    let faltan = lee('faltan', null);
    if (!faltan || faltan.dia !== hoy() || !faltan.listas || typeof faltan.listas !== 'object') { faltan = { dia: hoy(), listas: {} }; }
    const faltanDe = (l) => {
        if (faltan.dia !== hoy()) { faltan = { dia: hoy(), listas: {} }; }
        return (faltan.listas[l.id] || []).filter((n) => l.alumnos.includes(n));
    };
    const presentes = (l) => { const f = faltanDe(l); return l.alumnos.filter((n) => !f.includes(n)); };
    // Caras: la foto del aula o, si no tiene, sus iniciales. Las listas pegadas a mano no llevan cara.
    const iniciales = (n) => n.replace(/\s*\(\d+\)$/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
    const cara = (l, n, clase) => {
        if (!l || !l.fotos) { return ''; }
        const f = l.fotos[n];
        return f ? `<img class="${clase}" src="${escapa(f)}" alt="">`
            : `<span class="${clase} iniciales" aria-hidden="true">${escapa(iniciales(n))}</span>`;
    };
    const precarga = (l) => {
        if (!l || !l.fotos || l.precargada) { return; }
        l.precargada = true;
        Object.values(l.fotos).forEach((f) => { const i = new Image(); i.src = f; });
    };
    // Limpia lo pegado: una persona por línea, sin números delante, sin tabuladores ni repetidos.
    const limpiaNombres = (texto) => {
        const vistos = {};
        return String(texto || '').split(/\r?\n/)
            .map((l) => l.replace(/\t+/g, ' ').replace(/^\s*\d+\s*[.)\-:]\s*|^\s*\d+\s+/, '').replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .map((n) => { vistos[n] = (vistos[n] || 0) + 1; return vistos[n] > 1 ? `${n} (${vistos[n]})` : n; });
    };
    const pintaSelects = () => {
        const op = (l) => `<option value="${escapa(l.id)}">${escapa(l.nombre)} (${l.alumnos.length})</option>`;
        const opciones = !listasAula.length ? listas.map(op).join('')
            : `<optgroup label="${escapa(AULA.course || t('q_this_course'))}">${listasAula.map(op).join('')}</optgroup>`
              + (listas.length ? `<optgroup label="${escapa(t('q_your_lists'))}">${listas.map(op).join('')}</optgroup>` : '');
        const q = $('#q-lista');
        q.innerHTML = opciones || `<option value="">${t('q_no_lists')}</option>`;
        q.disabled = !todas().length;
        q.value = listaActiva || '';
        const g = $('#g-lista'), antes = g.value;
        g.innerHTML = opciones + `<option value="__pegar">${t('g_paste_now')}</option>`;
        g.value = todas().some((l) => l.id === antes) || antes === '__pegar' ? antes : (listaActiva || '__pegar');
        gCambiaLista();
    };

    // Editor (ventana) para crear, cambiar o borrar una lista.
    const editor = $('#editor');
    let editando = null, borrarTimer = 0;
    const edCuenta = () => {
        const n = limpiaNombres($('#ed-alumnos').value).length;
        $('#ed-cuenta').textContent = n ? `(${n})` : '';
    };
    const abreEditor = (id, texto) => {
        const l = listas.find((x) => x.id === id);
        editando = l ? l.id : null;
        $('#ed-titulo').textContent = l ? t('ed_edit_list') : t('ed_new_list');
        $('#ed-nombre').value = l ? l.nombre : '';
        $('#ed-alumnos').value = l ? l.alumnos.join('\n') : (texto || '');
        $('#ed-borrar').hidden = !l;
        $('#ed-borrar').classList.remove('confirma'); rotula($('#ed-borrar'), t('ed_delete'));
        const nota = $('#ed-nota');
        nota.classList.remove('error');
        nota.textContent = almacen ? t('ed_note_local') : t('ed_note_nostore');
        edCuenta();
        if (editor.showModal) { editor.showModal(); } else { editor.setAttribute('open', ''); }
        $('#ed-nombre').focus();
    };
    const cierraEditor = () => { if (editor.close) { editor.close(); } else { editor.removeAttribute('open'); } };
    $('#ed-alumnos').addEventListener('input', edCuenta);
    $('#ed-cancelar').addEventListener('click', cierraEditor);
    $('#ed-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const alumnos = limpiaNombres($('#ed-alumnos').value);
        if (!alumnos.length) {
            const nota = $('#ed-nota'); nota.textContent = t('ed_need_one'); nota.classList.add('error');
            $('#ed-alumnos').focus(); return;
        }
        const nombre = $('#ed-nombre').value.trim() || t('ed_default_name', listas.length + 1);
        let l = listas.find((x) => x.id === editando);
        if (l) {
            Object.assign(l, { nombre, alumnos });
            if (salidos[l.id]) { salidos[l.id] = salidos[l.id].filter((n) => alumnos.includes(n)); }
        } else {
            l = { id: 'l' + Date.now().toString(36) + azar(1000), nombre, alumnos };
            listas.push(l);
        }
        listaActiva = l.id;
        guardaListas();
        qUltimo = null;
        pintaSelects(); quienPinta();
        if (actual === 'grupos') { $('#g-lista').value = l.id; gCambiaLista(); }
        cierraEditor();
        anuncia(t('ed_saved', { name: nombre, n: alumnos.length }));
    });
    $('#ed-borrar').addEventListener('click', () => {
        const b = $('#ed-borrar');
        if (!b.classList.contains('confirma')) {
            b.classList.add('confirma'); rotula(b, t('ed_confirm_delete'));
            clearTimeout(borrarTimer);
            borrarTimer = setTimeout(() => { b.classList.remove('confirma'); rotula(b, t('ed_delete')); }, 4000);
            return;
        }
        listas = listas.filter((x) => x.id !== editando);
        delete salidos[editando];
        listaActiva = todas().length ? todas()[0].id : null;
        qUltimo = null;
        guardaListas(); pintaSelects(); quienPinta(); cierraEditor();
        anuncia(t('ed_deleted'));
    });

    // ===================================================================================================
    // 3. ¿A quién le toca?
    // ===================================================================================================
    const qNombre = $('#q-nombre'), qCaja = $('#q-caja'), qFoto = $('#q-foto');
    let qSinRepetir = lee('sin-repetir', true) !== false, qBarajando = false, qUltimo = null, qTimer = 0;
    // Rasca y gana: el nombre elegido sale tapado (y en la columna de los que ya salieron, borroso hasta destaparlo).
    let qRasca = lee('quien-rasca', false) === true, qTapado = null;
    $('#q-sinrepetir').checked = qSinRepetir;
    let qJusto = lee('justo', true) !== false;
    $('#q-justo').checked = qJusto;
    const conTurnos = (l) => !!(l && l.aula && AULA.pickurl);
    const listaQ = () => todas().find((l) => l.id === listaActiva) || null;
    // La cara encima del nombre (solo en las listas del aula).
    const pintaCara = (l, n) => {
        const con = !!(l && l.fotos && n);
        qCaja.classList.toggle('con-foto', con);
        qFoto.hidden = !con;
        qFoto.innerHTML = con ? cara(l, n, 'cara-grande') : '';
    };
    // Con cara, el nombre solo tiene el hueco que queda debajo.
    const altoNombre = () => (qCaja.classList.contains('con-foto') ? Math.max(40, qCaja.clientHeight - qFoto.offsetHeight - 12) : undefined);
    // Busca el tamaño de letra más grande con el que el texto cabe en su caja.
    const encaja = (el, caja, texto, alto) => {
        const w = caja.clientWidth, h = (alto === undefined ? caja.clientHeight : alto) * 0.94;
        if (!w || !h) { return; }
        const guardado = el.textContent;
        if (texto !== undefined) { el.textContent = texto; }
        let lo = 14, hi = Math.max(16, Math.min(h * 0.82, w * 0.34));
        for (let i = 0; i < 9; i++) {
            const mid = (lo + hi) / 2;
            el.style.fontSize = mid + 'px';
            // Cabe si ninguna palabra se sale por los lados y el total no pasa del alto.
            if (el.scrollWidth <= el.clientWidth + 1 && el.offsetHeight <= h) { lo = mid; } else { hi = mid; }
        }
        el.style.fontSize = Math.floor(lo) + 'px';
        if (texto !== undefined) { el.textContent = guardado; }
    };
    const qEncaja = () => {
        if (qNombre.classList.contains('aviso-vacio')) { qNombre.style.fontSize = ''; return; }
        if (!qBarajando) { encaja(qNombre, qCaja, undefined, altoNombre()); }
    };
    const quienPinta = () => {
        const l = listaQ();
        $('#q-editar').disabled = !l;
        $('#q-editar').hidden = !!(l && l.aula);   // las del aula se renuevan solas: no se editan aquí
        $('#q-faltan').hidden = !l;
        $('#q-justo-caja').hidden = !conTurnos(l);
        $('#q-participa').hidden = !conTurnos(l);
        $('#q-elegir').hidden = !l;
        $('#q-crear').hidden = !!l;
        const conColumna = !!l && qSinRepetir;
        $('#q-salidos-caja').hidden = !conColumna;
        $('.quien-cuerpo').classList.toggle('sin-columna', !conColumna);
        if (!l) {
            pintaCara(null);
            qNombre.className = 'nombre-grande aviso-vacio';
            qNombre.textContent = t('q_empty');
            $('#q-pie').textContent = t('q_empty_note');
            qEncaja(); return;
        }
        precarga(l);
        const pres = presentes(l), nf = l.alumnos.length - pres.length;
        rotula($('#q-faltan'), nf ? t('q_absent_n', nf) : t('q_absent'));
        const s = (salidos[l.id] || []).filter((n) => pres.includes(n));
        $('#q-cuenta').textContent = t('q_count', { a: s.length, b: pres.length });
        $('#q-salidos').innerHTML = s.slice().reverse().map((n) => `<li${n === qTapado ? ' class="ct-tapado"' : ''}>${cara(l, n, 'cara-mini')}<span>${escapa(n)}</span></li>`).join('');
        $('#q-reset').disabled = !s.length || qBarajando;
        $('#q-lista').disabled = qBarajando;
        const quedan = qSinRepetir ? pres.length - s.length : pres.length;
        if (!qBarajando) {
            if (qUltimo) { qNombre.className = 'nombre-grande'; qNombre.textContent = qUltimo; }
            else { qNombre.className = 'nombre-grande espera'; qNombre.textContent = '?'; }
            pintaCara(l, qUltimo);
            const hay = nf ? t('q_students_absent', { n: pres.length, m: nf }) : t('q_students', pres.length);
            $('#q-pie').textContent = !l.alumnos.length ? t('q_no_students')
                : !pres.length ? t('q_all_absent')
                : !quedan ? t('q_all_out')
                : qUltimo ? (qSinRepetir ? t('q_left', quedan) : hay)
                : t('q_ready', { count: hay, list: l.nombre });
        }
        $('#q-elegir').disabled = qBarajando || !quedan;
        qEncaja();
    };
    const elegir = () => {
        const l = listaQ();
        if (!l || qBarajando) { return; }
        const tapa = qCaja.querySelector('.ct-rasca');
        if (tapa) { tapa.remove(); qTapado = null; }
        const s = salidos[l.id] || [], pres = presentes(l);
        const bolsa = qSinRepetir ? pres.filter((n) => !s.includes(n)) : pres.slice();
        if (!bolsa.length) { quienPinta(); return; }
        // Sorteo justo (listas del aula): sale alguien de entre los que menos veces han salido estas semanas.
        const justo = conTurnos(l) && qJusto;
        const minimo = justo ? Math.min(...bolsa.map((n) => l.veces[n] || 0)) : 0;
        const candidatos = justo ? bolsa.filter((n) => (l.veces[n] || 0) === minimo) : bolsa;
        const elegido = candidatos[azar(candidatos.length)];
        const acaba = () => {
            qBarajando = false; qUltimo = elegido;
            if (qSinRepetir) { const ya = salidos[l.id] || []; salidos[l.id] = ya.includes(elegido) ? ya : ya.concat(elegido); guarda('salidos', salidos); }
            if (conTurnos(l) && l.ids[elegido]) {
                sumaTurno(l.ids[elegido]);
                alAula(AULA.pickurl, { userid: l.ids[elegido] }).catch(() => { /* sin conexión: ese turno no cuenta, el sorteo sigue */ });
            } else if (l.yo === elegido) { l.veces[elegido] = (l.veces[elegido] || 0) + 1; }   // el profe: solo aquí
            const destapa = () => {
                qTapado = null;
                $$('#q-salidos .ct-tapado').forEach((li) => li.classList.remove('ct-tapado'));
                qNombre.className = 'nombre-grande elegido';
                suena('elegido');
                anuncia(t('q_turn', elegido));
            };
            if (qRasca && window.ClasstoolsScratch) {
                qTapado = elegido;
                quienPinta();
                window.ClasstoolsScratch.cover(qCaja, { onReveal: destapa });
                suena('tic');
                return;
            }
            quienPinta();
            destapa();
        };
        if (reducido() || bolsa.length < 2) { acaba(); return; }
        // Barajado: los nombres pasan cada vez más despacio (unos dos segundos) hasta pararse en el elegido.
        qBarajando = true; $('#q-elegir').disabled = true;
        qNombre.className = 'nombre-grande barajando';
        pintaCara(l, bolsa[0]);
        const largo = bolsa.reduce((a, b) => (b.length > a.length ? b : a), '');
        encaja(qNombre, qCaja, largo, altoNombre());
        $('#q-pie').textContent = t('q_shuffling');
        let paso = 45, previo = null;
        const gira = () => {
            let n;
            do { n = bolsa[azar(bolsa.length)]; } while (n === previo);
            previo = n; qNombre.textContent = n; pintaCara(l, n); suena('tic');
            paso *= 1.13;
            qTimer = setTimeout(paso > 300 ? acaba : gira, paso > 300 ? 280 : paso);
        };
        gira();
    };
    $('#q-elegir').addEventListener('click', elegir);
    $('#q-crear').addEventListener('click', () => abreEditor(null));
    $('#q-nueva').addEventListener('click', () => abreEditor(null));
    $('#q-editar').addEventListener('click', () => abreEditor(listaActiva));
    $('#q-lista').addEventListener('change', (e) => { listaActiva = e.target.value || null; qUltimo = null; guarda('lista-activa', listaActiva); quienPinta(); });
    $('#q-sinrepetir').addEventListener('change', (e) => { qSinRepetir = e.target.checked; guarda('sin-repetir', qSinRepetir); quienPinta(); });
    $('#q-rasca').checked = qRasca;
    $('#q-rasca').addEventListener('change', (e) => { qRasca = e.target.checked; guarda('quien-rasca', qRasca); });
    $('#q-justo').addEventListener('change', (e) => { qJusto = e.target.checked; guarda('justo', qJusto); });
    // «El profe también juega», en «¿A quién le toca?» y en «Grupos» (es el mismo interruptor).
    ['#q-yo', '#g-yo'].forEach((sel) => {
        $(sel + '-caja').hidden = !YO;
        $(sel).checked = conmigo;
        $(sel).addEventListener('change', (e) => {
            conmigo = e.target.checked; guarda(claveYo, conmigo);
            $('#q-yo').checked = conmigo; $('#g-yo').checked = conmigo;
            ponYo(); pintaSelects(); quienPinta();
            document.dispatchEvent(new CustomEvent('classtools:lists'));
        });
    });
    // Participación: cuántas veces le ha tocado a cada uno en el curso (con cualquier profesor), quien menos arriba.
    const dParticipa = $('#participa');
    $('#q-participa').addEventListener('click', () => {
        const l = listaQ();
        if (!conTurnos(l)) { return; }
        const filas = l.alumnos.slice().sort((a, b) => (l.veces[a] || 0) - (l.veces[b] || 0) || a.localeCompare(b, 'es'));
        const max = Math.max(1, ...filas.map((n) => l.veces[n] || 0));
        $('#p-titulo').textContent = `${t('q_participation')} · ${l.nombre}`;
        $('#p-nota').textContent = t('q_participation_note', AULA.days);
        $('#p-lista').innerHTML = filas.map((n) => {
            const v = l.veces[n] || 0;
            return `<li>${cara(l, n, 'cara-mini')}<span class="p-nombre">${escapa(n)}</span>`
                + `<span class="p-barra" aria-hidden="true"><span style="width:${Math.round(v / max * 100)}%"></span></span><span class="p-veces">${v}</span></li>`;
        }).join('');
        if (dParticipa.showModal) { dParticipa.showModal(); } else { dParticipa.setAttribute('open', ''); }
    });
    $('#q-reset').addEventListener('click', () => { const l = listaQ(); if (l) { salidos[l.id] = []; guarda('salidos', salidos); } qUltimo = null; quienPinta(); });
    let qMarco = 0;
    if (window.ResizeObserver) { new ResizeObserver(() => { cancelAnimationFrame(qMarco); qMarco = requestAnimationFrame(qEncaja); }).observe(qCaja); }
    HERR.quien = { entra: () => requestAnimationFrame(qEncaja), sale: () => { if (qBarajando) { clearTimeout(qTimer); qBarajando = false; quienPinta(); } } };

    // ¿Quién falta hoy? (ventana): se toca a quien no ha venido y ya no sale ni entra en los grupos.
    const dFaltan = $('#faltan');
    let fLista = null;
    const fTitulo = () => { const n = faltanDe(fLista).length; $('#f-titulo').textContent = n ? t('q_absent_n', n) : t('q_absent'); };
    const abreFaltan = (l) => {
        if (!l) { return; }
        fLista = l;
        const f = faltanDe(l);
        $('#f-rejilla').innerHTML = l.alumnos.map((n) => `<button type="button" class="alumno-f${l.fotos ? '' : ' sin-cara'}" aria-pressed="${f.includes(n)}" data-n="${escapa(n)}">`
            + `${cara(l, n, 'cara-media')}<span>${escapa(n)}</span></button>`).join('');
        fTitulo();
        if (dFaltan.showModal) { dFaltan.showModal(); } else { dFaltan.setAttribute('open', ''); }
    };
    $('#f-rejilla').addEventListener('click', (e) => {
        const b = e.target.closest('.alumno-f');
        if (!b || !fLista) { return; }
        const n = b.dataset.n, f = faltanDe(fLista), falta = !f.includes(n);
        faltan.listas[fLista.id] = falta ? f.concat(n) : f.filter((x) => x !== n);
        guarda('faltan', faltan);
        b.setAttribute('aria-pressed', String(falta));
        fTitulo();
    });
    $('#f-todos').addEventListener('click', () => {
        if (!fLista) { return; }
        faltan.listas[fLista.id] = [];
        guarda('faltan', faltan);
        $$('#f-rejilla .alumno-f').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        fTitulo();
    });
    dFaltan.addEventListener('close', () => {
        const n = faltanDe(fLista).length;
        quienPinta(); gCambiaLista();
        anuncia(n ? t('q_absent_n_sr', n) : t('q_all_here'));
    });
    $('#q-faltan').addEventListener('click', () => abreFaltan(listaQ()));

    // ===================================================================================================
    // 4. Hacer grupos
    // ===================================================================================================
    const COLORES = [['#164281'], ['#ce1423'], ['#067e36'], ['#5b2fb8'], ['#fbbe17', true], ['#0e7c86'], ['#c2410c'], ['#0f2f5e']];
    let gModo = lee('grupos-modo', 'num') === 'tam' ? 'tam' : 'num';
    let gN = Math.max(2, Math.min(15, Number(lee('grupos-n', 4)) || 4));
    const gRejilla = $('#g-rejilla');
    const gLista = () => todas().find((x) => x.id === $('#g-lista').value) || null;
    const gNombres = () => {
        if ($('#g-lista').value === '__pegar') { return limpiaNombres($('#g-pegados').value); }
        const l = gLista();
        return l ? presentes(l) : [];
    };
    const gVacio = (texto) => { gRejilla.classList.add('vacia'); gRejilla.innerHTML = `<div class="vacio">${icono('grupos')}<p>${texto}</p></div>`; };
    const gPintaModo = () => {
        $$('#g-modo button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.modo === gModo)));
        $('#g-n').textContent = gN;
        $('#g-n').setAttribute('aria-label', gModo === 'num' ? t('g_n_groups', gN) : t('g_n_size', gN));
    };
    const gListo = () => rotula($('#g-hacer'), t('g_make'), 'mezclar');
    let gUltimos = null, gHechos = null;   // gHechos: los últimos grupos hechos, con su lista (los usa el Marcador)
    // Repartir con emoción: en vez de salir todos de golpe, una tarjeta baraja los nombres, se para en uno, dice su
    // grupo y el nombre vuela a su sitio, aquí y allá, hasta el último (los primeros y los últimos, más despacio).
    let gEmocion = lee('grupos-emocion', false) === true;
    let gRasca = lee('grupos-rasca', false) === true;   // rasca y gana: cada grupo, tapado hasta que lo rascan
    let gReparto = null;   // el reparto en marcha: { acaba } los coloca a todos ya
    // Un rol para cada uno dentro de su grupo (portavoz, secretario…), que el profesor puede cambiar. El reparto es
    // justo: a cada uno le toca antes el rol que menos ha tenido con esa lista (y, a igualdad, quien menos roles ha
    // tenido); el recuento se guarda en el navegador.
    let gRoles = lee('grupos-roles', false) === true;
    const ROLES_BASE = () => [t('rl_spokesperson'), t('rl_secretary'), t('rl_materials'), t('rl_time')];
    const ROL_COLORES = ['#164281', '#ce1423', '#067e36', '#5b2fb8', '#c2410c', '#0e7c86'];
    const gListaRoles = () => { const r = lee('roles-nombres', null); return Array.isArray(r) && r.length ? r : ROLES_BASE(); };
    const gNombreLi = (li) => { const x = li.querySelector(':scope > span:not(.rol):not(.iniciales)'); return x ? x.textContent : ''; };
    const gPonRoles = () => {
        $$('.grupo li .rol', gRejilla).forEach((x) => x.remove());
        $('#g-rotar').hidden = !(gRoles && gHechos);
        if (!gRoles || !gHechos) { gEncaja(); return; }
        const roles = gListaRoles(), clave = gHechos.lista ? gHechos.lista.id : '__pegar';
        const hist = lee('roles-historial', {}), h = hist[clave] || {};
        const veces = (n, r) => ((h[n] || {})[r] || 0);
        const total = (n) => Object.values(h[n] || {}).reduce((a, b) => a + b, 0);
        // Lo que cuesta dar el rol r a n: las veces que ya lo tuvo (al cuadrado, para repartirlos) y un poco por los
        // roles que ya tuvo en total. Se empieza al azar y se mejora cambiando parejas hasta que no se puede más.
        const coste = (n, r) => 10 * veces(n, r) * veces(n, r) + total(n);
        $$('.grupo', gRejilla).forEach((art, gi) => {
            const lis = $$('li', art), gente = baraja((gHechos.grupos[gi] || []).slice());
            const rs = baraja(roles.slice()).slice(0, gente.length);
            const quien = rs.map((_, i) => gente[i]), fuera = gente.slice(rs.length);
            for (let mejora = true, vueltas = 0; mejora && vueltas < 50; vueltas++) {
                mejora = false;
                for (let i = 0; i < rs.length; i++) {
                    for (let j = i + 1; j < rs.length; j++) {
                        if (coste(quien[j], rs[i]) + coste(quien[i], rs[j]) < coste(quien[i], rs[i]) + coste(quien[j], rs[j])) {
                            [quien[i], quien[j]] = [quien[j], quien[i]]; mejora = true;
                        }
                    }
                    for (let k = 0; k < fuera.length; k++) {
                        if (coste(fuera[k], rs[i]) < coste(quien[i], rs[i])) { [quien[i], fuera[k]] = [fuera[k], quien[i]]; mejora = true; }
                    }
                }
            }
            rs.forEach((r, i) => {
                const n = quien[i];
                h[n] = h[n] || {}; h[n][r] = veces(n, r) + 1;
                const li = lis.find((x) => gNombreLi(x) === n);
                if (li) {
                    const b = document.createElement('span');
                    b.className = 'rol'; b.textContent = r; b.style.setProperty('--rc', ROL_COLORES[roles.indexOf(r) % ROL_COLORES.length]);
                    li.append(b);
                }
            });
        });
        hist[clave] = h; guarda('roles-historial', hist);
        gEncaja();
    };
    function gCambiaLista() {
        const pegar = $('#g-lista').value === '__pegar', l = gLista();
        $('#g-moodle').hidden = true; gUltimos = null;
        $('#g-pegados').hidden = !pegar;
        $('#g-guardar').hidden = !pegar;
        $('#g-faltan').hidden = !l;
        if (l) { precarga(l); const nf = l.alumnos.length - presentes(l).length; rotula($('#g-faltan'), nf ? t('q_absent_n', nf) : t('q_absent')); }
        $('#g-guardar').disabled = !limpiaNombres($('#g-pegados').value).length;
        gListo();
    }
    const gHacer = () => {
        if (gReparto) { gReparto.acaba(); return; }
        const nombres = gNombres();
        if (nombres.length < 2) {
            $('#g-resumen').textContent = t('g_need_two');
            gVacio($('#g-lista').value === '__pegar' ? t('g_paste_hint') : t('g_list_empty'));
            return;
        }
        const b = baraja(nombres.slice()), lg = $('#g-lista').value === '__pegar' ? null : gLista();
        const k = gModo === 'num' ? Math.min(gN, b.length) : Math.max(1, Math.round(b.length / gN));
        const grupos = Array.from({ length: k }, () => []);
        b.forEach((n, i) => grupos[i % k].push(n));
        const rasca = gRasca && b.length > 1 && !!window.ClasstoolsScratch;
        const emocion = gEmocion && !rasca && b.length > 1;
        gRejilla.classList.remove('vacia');
        // Con emoción, cada nombre ocupa ya su sitio pero sin verse: así la letra no cambia mientras van saliendo.
        gRejilla.innerHTML = grupos.map((g, i) => {
            const [c, claro] = COLORES[i % COLORES.length];
            const retraso = reducido() ? 0 : i * 60;
            return `<article class="grupo${claro ? ' claro' : ''}" style="--c:${c}; animation-delay:${retraso}ms" data-gi="${i}">
                <h3 title="${escapa(t('g_drag_hint'))}"><span class="g-titulo">${t('g_group_n', i + 1)}</span> <small>${emocion ? 0 : g.length}</small></h3>
                <ul>${g.map((n, ni) => `<li${emocion ? ` class="por-salir" data-n="${ni}"` : ''}>${cara(lg, n, 'cara-mini')}<span>${escapa(n)}</span></li>`).join('')}</ul></article>`;
        }).join('');
        $('#g-resumen').textContent = '';
        $('#g-moodle').hidden = true; $('#g-rotar').hidden = true;
        gEncaja();
        const listo = () => {
            const tams = grupos.map((g) => g.length), mn = Math.min(...tams), mx = Math.max(...tams);
            $('#g-resumen').textContent = t(k === 1 ? 'g_summary_one' : 'g_summary_many', { n: b.length, k, size: mn === mx ? mn : t('g_sizes', { a: mn, b: mx }) });
            rotula($('#g-hacer'), t('gen_again'), 'otra');
            gHechos = { lista: lg, grupos };
            // Guardarlos como grupos del curso: solo si se pulsa (por defecto no se crea nada).
            gUltimos = lg && lg.aula && AULA.groupsurl ? { lista: lg, grupos } : null;
            $('#g-moodle').hidden = !gUltimos; $('#g-moodle').disabled = false;
            $('#g-borrar').hidden = false;
            rotula($('#g-moodle'), t('g_save_course'), 'guardar');
            gPonRoles();
            suena(emocion ? 'elegido' : 'dado');
            anuncia(t('g_made', k));
        };
        if (emocion) { gReparte(grupos, lg, listo); } else { listo(); }
        if (rasca) { $$('.grupo ul', gRejilla).forEach((ul) => window.ClasstoolsScratch.cover(ul, { onReveal: () => suena('card') })); }
    };
    const gReparte = (grupos, lg, listo) => {
        // Otra vez barajados, para que salgan aquí y allá y no grupo por grupo.
        const turnos = baraja(grupos.flatMap((g, gi) => g.map((n, ni) => ({ n, gi, ni }))));
        const arts = $$('.grupo', gRejilla), cuenta = grupos.map(() => 0);
        // Cada grupo se llena de arriba abajo: el que sale ocupa el primer hueco libre (su nombre ya estaba en el grupo,
        // escondido en otro hueco, y se cambian).
        const suyo = (x) => arts[x.gi].querySelector(`li[data-n="${x.ni}"]`);
        const hueco = (x) => $$('li', arts[x.gi])[cuenta[x.gi]];
        // La tarjeta ocupa el panel de la izquierda mientras tanto (los grupos quedan a la vista), con el botón debajo.
        const carta = document.createElement('div');
        carta.className = 'g-bombo-carta'; carta.setAttribute('aria-hidden', 'true');
        carta.innerHTML = `<p class="g-bombo-ante">${escapa(t('g_and_now'))}</p>
            <div class="g-bombo-cara"></div><p class="g-bombo-nombre"></p><p class="g-bombo-grupo"></p>`;
        $('#g-hacer').before(carta);
        $('#h-grupos').classList.add('repartiendo');
        const nombre = carta.querySelector('.g-bombo-nombre'), grupo = carta.querySelector('.g-bombo-grupo'), foto = carta.querySelector('.g-bombo-cara');
        const muestra = (n) => { foto.innerHTML = n ? cara(lg, n, 'cara-bombo') : ''; nombre.textContent = n || '…'; };
        let vivo = true;
        const coloca = (x) => {
            const li = hueco(x), suyoLi = suyo(x);
            if (!li || !suyoLi || !suyoLi.classList.contains('por-salir')) { return; }
            if (li !== suyoLi) { [li.innerHTML, suyoLi.innerHTML] = [suyoLi.innerHTML, li.innerHTML]; [li.dataset.n, suyoLi.dataset.n] = [suyoLi.dataset.n, li.dataset.n]; }
            li.classList.remove('por-salir');
            if (vivo && !reducido()) { li.classList.add('sale'); arts[x.gi].classList.remove('recibe'); void arts[x.gi].offsetWidth; arts[x.gi].classList.add('recibe'); }
            arts[x.gi].querySelector('h3 small').textContent = ++cuenta[x.gi];
        };
        const acaba = () => {
            if (!vivo) { return; }
            vivo = false; gReparto = null;
            turnos.forEach(coloca);
            carta.remove();
            $('#h-grupos').classList.remove('repartiendo');
            listo();
        };
        gReparto = { acaba };
        rotula($('#g-hacer'), t('g_place_all'), 'pasar');
        const pausa = (ms) => new Promise((r) => { setTimeout(r, ms); });
        // El nombre sale de la tarjeta y aterriza en su hueco.
        const vuela = (x, ms) => new Promise((r) => {
            const li = hueco(x), suyoLi = suyo(x);
            if (reducido() || !li || !suyoLi || !li.animate) { r(); return; }
            const de = nombre.getBoundingClientRect(), a = li.getBoundingClientRect();
            const fantasma = document.createElement('div');
            fantasma.className = 'g-vuela'; fantasma.setAttribute('aria-hidden', 'true'); fantasma.innerHTML = suyoLi.innerHTML;
            Object.assign(fantasma.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', fontSize: getComputedStyle(li).fontSize });
            document.body.append(fantasma);
            const dx = de.left + de.width / 2 - (a.left + a.width / 2), dy = de.top + de.height / 2 - (a.top + a.height / 2);
            fantasma.animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.4)`, opacity: 0.3 }, { transform: 'none', opacity: 1 }],
                { duration: ms, easing: 'cubic-bezier(.3, .7, .3, 1)' }).onfinish = () => { fantasma.remove(); r(); };
        });
        const base = Math.max(750, Math.min(1700, 22000 / turnos.length));
        (async () => {
            for (let i = 0; i < turnos.length; i++) {
                const x = turnos[i], quedan = turnos.slice(i);
                const ritmo = base * (i < 2 ? 1.3 : (turnos.length - i <= 3 ? 1.7 : 1));
                carta.classList.remove('elegida', 'con-grupo', 'claro');
                grupo.textContent = '';
                if (reducido()) {
                    muestra('');
                    await pausa(ritmo * 0.4);
                } else {
                    // Barajar: los nombres que quedan, cada vez más despacio.
                    const fin = performance.now() + ritmo * 0.4;
                    for (let espera = 45; vivo && performance.now() < fin; espera *= 1.18) {
                        muestra(quedan[azar(quedan.length)].n); suena('tic');
                        await pausa(espera);
                    }
                }
                if (!vivo) { return; }
                muestra(x.n); carta.classList.add('elegida'); suena('cuenta');
                await pausa(ritmo * 0.2);
                if (!vivo) { return; }
                const [c, claro] = COLORES[x.gi % COLORES.length];
                carta.style.setProperty('--c', c); carta.classList.toggle('claro', !!claro); carta.classList.add('con-grupo');
                grupo.textContent = t('g_group_n', x.gi + 1);
                anuncia(t('g_goes_to', { name: x.n, n: x.gi + 1 }));
                await pausa(ritmo * 0.2);
                if (!vivo) { return; }
                await vuela(x, Math.max(280, ritmo * 0.2));
                if (!vivo) { return; }
                coloca(x);
            }
            acaba();
        })();
    };
    // Letra de los grupos tan grande como quepa sin desplazar (en la pizarra se lee desde el fondo).
    const gEncaja = () => {
        if (gRejilla.classList.contains('vacia') || getComputedStyle(gRejilla).overflowY === 'visible' || !gRejilla.clientHeight) { gRejilla.style.fontSize = ''; return; }
        // De grande a pequeña: al cambiar la letra cambia el número de columnas, así que no vale una búsqueda binaria.
        let fs = 44;
        for (; fs > 12; fs -= 1) {
            gRejilla.style.fontSize = fs + 'px';
            if (gRejilla.scrollHeight <= gRejilla.clientHeight + 1) { break; }
        }
        gRejilla.style.fontSize = fs + 'px';
    };
    let gMarco = 0;
    if (window.ResizeObserver) { new ResizeObserver(() => { cancelAnimationFrame(gMarco); gMarco = requestAnimationFrame(gEncaja); }).observe(gRejilla); }
    HERR.grupos = { entra: () => requestAnimationFrame(gEncaja) };
    $('#g-hacer').addEventListener('click', gHacer);
    $('#g-roles').checked = gRoles;
    $('#g-roles-caja').hidden = !gRoles;
    $('#g-roles-texto').placeholder = ROLES_BASE().join('\n');
    $('#g-roles-texto').value = (lee('roles-nombres', null) || []).join('\n');
    $('#g-roles').addEventListener('change', (e) => { gRoles = e.target.checked; guarda('grupos-roles', gRoles); $('#g-roles-caja').hidden = !gRoles; gPonRoles(); });
    $('#g-roles-texto').addEventListener('input', () => {
        const r = [...new Set($('#g-roles-texto').value.split(/\r?\n/).map((x) => x.trim().slice(0, 30)).filter(Boolean))].slice(0, 6);
        guarda('roles-nombres', r.length ? r : null);
    });
    $('#g-roles-texto').addEventListener('change', gPonRoles);
    $('#g-rotar').addEventListener('click', () => { gPonRoles(); suena('dado'); anuncia(t('g_roles_done')); });
    // Borrar el resultado: la pantalla vuelve a estar en blanco.
    $('#g-borrar').addEventListener('click', () => {
        gHechos = null; gUltimos = null;
        gVacio(t('g_empty_start'));
        $('#g-resumen').textContent = '';
        ['#g-moodle', '#g-rotar', '#g-borrar'].forEach((s) => { $(s).hidden = true; });
        gListo();
    });
    // Cambiar el orden de los grupos arrastrando su cabecera: los demás se apartan y los números se ponen por orden.
    let gArrastre = null;
    gRejilla.addEventListener('pointerdown', (e) => {
        const h = e.target.closest('.grupo h3');
        if (!h || !gHechos || e.button > 0) { return; }
        gArrastre = { art: h.closest('.grupo'), x: e.clientX, y: e.clientY, id: e.pointerId, moviendo: false };
    });
    gRejilla.addEventListener('pointermove', (e) => {
        const a = gArrastre;
        if (!a || e.pointerId !== a.id) { return; }
        if (!a.moviendo) {
            if (Math.hypot(e.clientX - a.x, e.clientY - a.y) < 8) { return; }
            a.moviendo = true; a.art.classList.add('moviendo');
            try { gRejilla.setPointerCapture(e.pointerId); } catch (err) { /* sigue sin captura */ }
        }
        e.preventDefault();
        const bajo = document.elementFromPoint(e.clientX, e.clientY);
        const otro = bajo && bajo.closest('.grupo');
        if (!otro || otro === a.art || !gRejilla.contains(otro)) { return; }
        const arts = $$('.grupo', gRejilla);
        gRejilla.insertBefore(a.art, arts.indexOf(otro) > arts.indexOf(a.art) ? otro.nextSibling : otro);
    });
    const gSuelta = (e) => {
        const a = gArrastre;
        if (!a || e.pointerId !== a.id) { return; }
        gArrastre = null;
        if (!a.moviendo) { return; }
        a.art.classList.remove('moviendo');
        // Los grupos, en el orden nuevo (el mismo array: lo usan el Marcador y «Guardar como grupos del curso»).
        const arts = $$('.grupo', gRejilla), antes = gHechos.grupos.slice();
        gHechos.grupos.length = 0;
        arts.forEach((art, i) => {
            gHechos.grupos.push(antes[Number(art.dataset.gi)]);
            art.dataset.gi = i;
            art.querySelector('.g-titulo').textContent = t('g_group_n', i + 1);
        });
        suena('tic');
    };
    gRejilla.addEventListener('pointerup', gSuelta);
    gRejilla.addEventListener('pointercancel', gSuelta);
    $('#g-rasca').checked = gRasca;
    $('#g-rasca').addEventListener('change', (e) => { gRasca = e.target.checked; guarda('grupos-rasca', gRasca); });
    $('#g-emocion').checked = gEmocion;
    $('#g-emocion').addEventListener('change', (e) => { gEmocion = e.target.checked; guarda('grupos-emocion', gEmocion); });
    $('#g-lista').addEventListener('change', gCambiaLista);
    $('#g-pegados').addEventListener('input', () => { gListo(); $('#g-guardar').disabled = !limpiaNombres($('#g-pegados').value).length; });
    $('#g-guardar').addEventListener('click', () => abreEditor(null, $('#g-pegados').value));
    $('#g-faltan').addEventListener('click', () => abreFaltan(gLista()));
    $('#g-moodle').addEventListener('click', () => {
        if (!gUltimos) { return; }
        const { lista, grupos } = gUltimos, b = $('#g-moodle');
        b.disabled = true; rotula(b, t('g_saving'));
        alAula(AULA.groupsurl, { listname: lista.nombre, teams: JSON.stringify(grupos.map((g) => g.map((n) => lista.ids[n]).filter(Boolean))) })
            .then((j) => {
                rotula(b, t('g_saved'), 'hecho');
                $('#g-resumen').textContent += ' ' + t('g_saved_as', j.grouping);
                anuncia(t('g_saved_announce', j.grouping));
            })
            .catch(() => { b.disabled = false; rotula(b, t('g_save_failed'), 'guardar'); });
    });
    $$('#g-modo button').forEach((b) => b.addEventListener('click', () => { gModo = b.dataset.modo; guarda('grupos-modo', gModo); gPintaModo(); gListo(); }));
    const gCambiaN = (d) => { gN = Math.max(2, Math.min(15, gN + d)); guarda('grupos-n', gN); gPintaModo(); gListo(); };
    repite($('#g-menos'), () => gCambiaN(-1));
    repite($('#g-mas'), () => gCambiaN(1));
    gVacio(t('g_empty_start'));

    // ===================================================================================================
    // 5. Semáforo de ruido: solo mide el volumen del micrófono; no graba ni envía nada
    // ===================================================================================================
    const sm = { flujo: null, fuente: null, analizador: null, buf: null, rf: 0, suave: 0, zona: null, bajaDesde: 0, ultimoAria: -1,
        ultimo: 0, racha: 0, mejor: 0, paciencia: 100, agotada: false, pintado: '' };
    const MENSAJES = { verde: t('sm_green'), amarillo: t('sm_amber'), rojo: t('sm_red') };
    const EN_ZONA = { verde: t('sm_light_green'), amarillo: t('sm_light_amber'), rojo: t('sm_light_red') };   // «Semáforo en …»
    const ORDEN = { verde: 0, amarillo: 1, rojo: 2 };
    const microPermitido = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) { return false; }
        const pol = document.permissionsPolicy || document.featurePolicy;
        try { if (pol && pol.allowsFeature && !pol.allowsFeature('microphone')) { return false; } } catch (e) { /* sin política */ }
        return true;
    };
    const smSinMicro = (causa) => {
        const ventana = t('sm_mic_window');
        const textos = {
            marco: `<strong>${t('sm_mic_frame')}</strong> ${ventana}`,
            permiso: enMarco ? `<strong>${t('sm_mic_denied_frame')}</strong> ${ventana}`
                : `<strong>${t('sm_mic_denied')}</strong> ${t('sm_mic_denied_help')}`,
            ninguno: `<strong>${t('sm_mic_none')}</strong> ${t('sm_mic_none_help')}`,
            otro: `<strong>${t('sm_mic_unavailable')}</strong> ${enMarco ? ventana : t('sm_mic_unavailable_help')}`,
            pendiente: enMarco ? `<strong>${t('sm_mic_pending_frame')}</strong> ${ventana}`
                : `<strong>${t('sm_mic_pending')}</strong> ${t('sm_mic_pending_help')}`,
        };
        $('#s-sinmicro-texto').innerHTML = textos[causa] || textos.otro;
        $('#s-ventana').hidden = !enMarco;
        $('#s-sinmicro').hidden = false;
    };
    const smZona = (z) => {
        sm.zona = z;
        $$('#s-caja .luz').forEach((l) => l.classList.toggle('encendida', l.dataset.zona === z));
        $('#s-caja').classList.toggle('apagado', !z);
        $('#s-caja').setAttribute('aria-label', z ? EN_ZONA[z] : t('sm_off'));
        const m = $('#s-mensaje');
        m.className = 'mensaje-ruido' + (z ? ' ' + z : '');
        m.textContent = z ? MENSAJES[z] : t('sm_off');
    };
    const smBucle = () => {
        sm.analizador.getFloatTimeDomainData(sm.buf);
        let suma = 0;
        for (let i = 0; i < sm.buf.length; i++) { suma += sm.buf[i] * sm.buf[i]; }
        const db = 20 * Math.log10(Math.sqrt(suma / sm.buf.length) + 1e-9);
        // Midiendo el ruido normal de la clase (Ajustar): se guardan unos segundos de niveles.
        if (sm.midiendo) { sm.midiendo.push(db); }
        // La escala: ajustada a la clase (lo normal queda en un tercio, en verde), o de unos −62 dB (silencio) a −14 dB
        // (mucho jaleo). La sensibilidad la corre ±20 dB. Cada micrófono capta distinto: por eso ajustar es lo mejor.
        const sens = Number($('#s-sensibilidad').value);
        const cero = sm.base !== null ? sm.base - 16 : -62;
        const nivel = Math.max(0, Math.min(100, ((db - cero + (sens - 5) * 4) / 48) * 100));
        // Sube despacio (un golpe o una silla no lo ponen en rojo) y baja más despacio aún.
        sm.suave += (nivel - sm.suave) * (nivel > sm.suave ? 0.06 : 0.04);
        const z = sm.suave >= 75 ? 'rojo' : sm.suave >= 50 ? 'amarillo' : 'verde';
        const ahora = performance.now();
        // Sube de color al momento; para bajar tiene que estar 1,5 s por debajo (así no parpadea).
        if (!sm.zona || ORDEN[z] > ORDEN[sm.zona]) { smZona(z); sm.bajaDesde = 0; }
        else if (ORDEN[z] < ORDEN[sm.zona]) {
            if (!sm.bajaDesde) { sm.bajaDesde = ahora; } else if (ahora - sm.bajaDesde > 1500) { smZona(z); sm.bajaDesde = 0; }
        } else { sm.bajaDesde = 0; }
        $('#s-relleno').style.setProperty('--nivel', sm.suave.toFixed(1) + '%');
        // La luz encendida respira con el ruido: crece y brilla más cuanto más alto hablan.
        $('#s-caja').style.setProperty('--vol', (sm.suave / 100).toFixed(3));
        const dt = sm.ultimo ? Math.min(0.25, (ahora - sm.ultimo) / 1000) : 0;
        sm.ultimo = ahora;
        // Racha en calma: solo cuenta en verde; el amarillo la para y el rojo la pone a cero.
        if (sm.zona === 'verde') { sm.racha += dt; } else if (sm.zona === 'rojo') { sm.racha = 0; }
        sm.mejor = Math.max(sm.mejor, sm.racha);
        // Paciencia: el rojo la gasta en 12 s y el amarillo en un minuto; en verde vuelve entera en 45 s. Un grito
        // suelto apenas la toca; el jaleo seguido, sí.
        const gasto = sm.zona === 'rojo' ? 100 / 12 : sm.zona === 'amarillo' ? 100 / 60 : -100 / 45;
        sm.paciencia = Math.max(0, Math.min(100, sm.paciencia - gasto * dt));
        if (sm.paciencia <= 0 && !sm.agotada) {
            sm.agotada = true;
            suena('agotada');
            const caja = $('#s-caja');
            caja.classList.remove('tiembla'); void caja.offsetWidth; caja.classList.add('tiembla');
            anuncia(t('sm_patience_gone'));
        } else if (sm.agotada && sm.paciencia >= 50) { sm.agotada = false; }
        smPintaExtra();
        smOndas(ahora); smRastro(ahora);
        const redondo = Math.round(sm.suave / 5) * 5;
        if (redondo !== sm.ultimoAria) { sm.ultimoAria = redondo; $('#s-medidor').setAttribute('aria-valuenow', String(redondo)); }
        sm.rf = requestAnimationFrame(smBucle);
    };
    const reloj = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    const smPintaExtra = () => {
        const p = Math.round(sm.paciencia), clave = `${Math.floor(sm.racha)}|${Math.floor(sm.mejor)}|${p}|${sm.agotada}`;
        if (clave === sm.pintado) { return; }
        sm.pintado = clave;
        $('#s-racha').textContent = reloj(sm.racha);
        $('#s-mejor').textContent = sm.mejor >= 60 && sm.mejor > sm.racha + 1 ? t('sm_best', reloj(sm.mejor)) : '';
        $('#s-paciencia-relleno').style.setProperty('--p', p + '%');
        $('#s-paciencia').classList.toggle('baja', p < 30);
        $('#s-paciencia').setAttribute('aria-valuenow', String(p));
        $('#s-paciencia-titulo').textContent = sm.agotada ? t('sm_patience_out') : t('sm_patience');
        $('#s-extra').classList.toggle('agotada', sm.agotada);
    };
    // Extras que el profesor elige (todos apagados al principio): ondas que salen de la luz cuando sube el ruido, el
    // rastro del último minuto y una cara en la luz encendida para los pequeños.
    const smOp = Object.assign({ ondas: false, rastro: false, cara: false }, lee('semaforo-extras', {}));
    const smPintaOp = () => {
        $('#s-caja').classList.toggle('con-cara', smOp.cara);
        $('#s-rastro-caja').hidden = !smOp.rastro;
        ['ondas', 'rastro', 'cara'].forEach((k) => { $('#s-op-' + k).checked = smOp[k]; });
    };
    ['ondas', 'rastro', 'cara'].forEach((k) => $('#s-op-' + k).addEventListener('change', (e) => {
        smOp[k] = e.target.checked; guarda('semaforo-extras', smOp); smPintaOp(); if (k === 'rastro') { smRastro(0, true); }
    }));
    let smUltimaOnda = 0;
    const smOndas = (ahora) => {
        if (!smOp.ondas || reducido() || !sm.zona) { return; }
        const vol = sm.suave / 100;
        // Más ruido, más ondas: ninguna en calma, una cada 0,3 s con mucho jaleo.
        if (vol < 0.35 || ahora - smUltimaOnda < 1000 - vol * 700) { return; }
        smUltimaOnda = ahora;
        const luz = $(`#s-caja .luz[data-zona="${sm.zona}"]`), caja = $('#s-ondas');
        const r = luz.getBoundingClientRect(), b = caja.getBoundingClientRect();
        const o = document.createElement('span');
        o.className = 'onda ' + sm.zona;
        Object.assign(o.style, { left: `${r.left - b.left + r.width / 2}px`, top: `${r.top - b.top + r.height / 2}px`, width: `${r.width}px`, height: `${r.width}px` });
        caja.append(o);
        setTimeout(() => o.remove(), 1600);
    };
    // El último minuto: el nivel cada cuarto de segundo, con las franjas de los tres colores detrás.
    const smHist = [];
    let smUltimoPunto = 0;
    const smRastro = (ahora, forzar) => {
        if (!smOp.rastro) { return; }
        if (!forzar) {
            if (ahora - smUltimoPunto < 250) { return; }
            smUltimoPunto = ahora; smHist.push(sm.suave); if (smHist.length > 240) { smHist.shift(); }
        }
        const c = $('#s-rastro'), w = c.clientWidth, h = c.clientHeight, dpr = window.devicePixelRatio || 1;
        if (!w || !h) { return; }
        if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
        const x = c.getContext('2d');
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
        [[0, 50, 'rgba(18, 166, 80, .14)'], [50, 75, 'rgba(251, 190, 23, .2)'], [75, 100, 'rgba(236, 34, 51, .16)']].forEach(([a, b2, col]) => {
            x.fillStyle = col; x.fillRect(0, h - (b2 / 100) * h, w, ((b2 - a) / 100) * h);
        });
        if (smHist.length < 2) { return; }
        x.beginPath();
        smHist.forEach((v, i) => { const px = w - (smHist.length - 1 - i) * (w / 239), py = h - (v / 100) * h; if (i) { x.lineTo(px, py); } else { x.moveTo(px, py); } });
        x.strokeStyle = '#164281'; x.lineWidth = 2.5; x.lineJoin = 'round'; x.stroke();
    };
    // Ajustar a esta clase: unos segundos de su ruido normal de trabajo pasan a ser el verde de la escala.
    sm.base = typeof lee('ruido-base', null) === 'number' ? lee('ruido-base', null) : null;
    sm.midiendo = null;
    const smAjusta = async () => {
        const b = $('#s-ajustar'), nota = $('#s-ajuste-nota');
        if (!sm.flujo) { await smEmpieza(); }
        if (!sm.flujo) { return; }
        b.disabled = true;
        sm.midiendo = [];
        let quedan = 4;
        nota.textContent = t('sm_adjusting', quedan);
        const cuenta = setInterval(() => {
            quedan--;
            if (quedan > 0) { nota.textContent = t('sm_adjusting', quedan); return; }
            clearInterval(cuenta);
            const v = (sm.midiendo || []).filter((x) => x > -120).sort((x, y) => x - y);
            sm.midiendo = null;
            b.disabled = false;
            if (v.length < 10) { nota.textContent = t('sm_adjust_hint'); return; }
            sm.base = v[Math.floor(v.length * 0.6)];   // algo por encima de la mediana: lo normal, sin los silencios
            guarda('ruido-base', sm.base);
            $('#s-sensibilidad').value = 5; guarda('sensibilidad', 5); pintaSens();
            sm.suave = 33;
            nota.textContent = t('sm_adjusted');
            suena('elegido');
        }, 1000);
    };
    $('#s-ajustar').addEventListener('click', smAjusta);
    const smApaga = () => {
        cancelAnimationFrame(sm.rf);
        if (sm.fuente) { try { sm.fuente.disconnect(); } catch (e) { /* ya estaba */ } }
        if (sm.flujo) { sm.flujo.getTracks().forEach((t) => t.stop()); }
        Object.assign(sm, { flujo: null, fuente: null, analizador: null, suave: 0, zona: null, bajaDesde: 0, ultimo: 0, racha: 0, paciencia: 100, agotada: false });
        smZona(null);
        $('#s-caja').style.setProperty('--vol', '0');
        smPintaExtra();
        $('#s-relleno').style.setProperty('--nivel', '0%');
        $('#s-medidor').setAttribute('aria-valuenow', '0');
        rotula($('#s-marcha'), t('sm_listen'), 'micro');
        $('#s-marcha').className = 'boton grande ancho';
    };
    const smEmpieza = async () => {
        $('#s-sinmicro').hidden = true;
        if (!microPermitido()) { smSinMicro(enMarco ? 'marco' : 'otro'); return; }
        const b = $('#s-marcha');
        b.disabled = true;
        $('#s-mensaje').textContent = t('sm_asking');
        // Si la pregunta del navegador no aparece o nadie la contesta, a los 5 s explicamos qué hacer.
        const espera = setTimeout(() => smSinMicro('pendiente'), 5000);
        try {
            const flujo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
            clearTimeout(espera);
            $('#s-sinmicro').hidden = true;
            if (actual !== 'semaforo') { flujo.getTracks().forEach((t) => t.stop()); smZona(null); return; }
            const a = audio();
            if (!a) { throw new Error('sin audio'); }
            sm.flujo = flujo;
            sm.fuente = a.createMediaStreamSource(flujo);
            sm.analizador = a.createAnalyser();
            sm.analizador.fftSize = 2048;
            sm.buf = new Float32Array(sm.analizador.fftSize);
            sm.fuente.connect(sm.analizador);   // al analizador y a ningún sitio más: no se oye ni se guarda
            rotula(b, t('sm_stop'), 'micro-no');
            b.className = 'boton grande suave ancho';
            smBucle();
        } catch (e) {
            clearTimeout(espera);
            smApaga();
            const n = e && e.name;
            smSinMicro(n === 'NotAllowedError' || n === 'SecurityError' ? 'permiso' : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'ninguno' : 'otro');
        } finally {
            b.disabled = false;
        }
    };
    $('#s-marcha').addEventListener('click', () => { if (sm.flujo) { smApaga(); } else { smEmpieza(); } });
    $('#s-ventana').addEventListener('click', abreVentana);
    const pintaSens = () => {
        const v = Number($('#s-sensibilidad').value);
        $('#s-sens-valor').textContent = v <= 3 ? t('sm_sens_low') : v <= 7 ? t('sm_sens_medium') : t('sm_sens_high');
    };
    $('#s-sensibilidad').value = Math.max(1, Math.min(10, Number(lee('sensibilidad', 5)) || 5));
    $('#s-sensibilidad').addEventListener('input', () => { pintaSens(); guarda('sensibilidad', Number($('#s-sensibilidad').value)); });
    smPintaOp();
    pintaSens();
    HERR.semaforo = {
        // Dentro de un marco sin permiso lo decimos antes de que lo intenten.
        entra: () => { if (!sm.flujo && !microPermitido()) { smSinMicro(enMarco ? 'marco' : 'otro'); } },
        sale: smApaga,
    };


    // ===================================================================================================
    // Cartel a toda pantalla (Así trabajamos y el QR ampliado)
    // ===================================================================================================
    const gigante = $('#gigante');
    let giganteVuelta = null;
    const abreGigante = ({ color, clase, html, etiqueta }) => {
        gigante.style.setProperty('--c', color || 'var(--azul)');
        gigante.className = 'gigante' + (clase ? ' ' + clase : '');
        gigante.setAttribute('aria-label', etiqueta || t('gen_big_view'));
        $('#gigante-contenido').innerHTML = html;
        giganteVuelta = document.activeElement;
        gigante.hidden = false;
        $('#gigante-cerrar').focus();
    };
    const cierraGigante = () => {
        gigante.hidden = true;
        if (giganteVuelta && giganteVuelta.focus) { giganteVuelta.focus(); }
    };
    gigante.addEventListener('click', cierraGigante);

    // ===================================================================================================
    // 7. Así trabajamos
    // ===================================================================================================
    const MODOS = [
        { nombre: t('asi_silence'), icono: 'silencio', color: '#ce1423' },
        { nombre: t('asi_quiet'), icono: 'bajo', color: '#fbbe17', claro: true },
        { nombre: t('asi_pairs'), icono: 'parejas', color: '#067e36' },
        { nombre: t('asi_group'), icono: 'grupos', color: '#5b2fb8' },
        { nombre: t('asi_hand'), icono: 'mano', color: '#164281' },
        { nombre: t('asi_listen'), icono: 'escucha', color: '#0e7c86' },
    ];
    $('#a-rejilla').innerHTML = MODOS.map((m, i) =>
        `<button type="button" class="modo-trabajo${m.claro ? ' claro' : ''}" style="--c:${m.color}" data-i="${i}">${icono(m.icono)}<span class="palabra">${m.nombre}</span></button>`).join('');
    $$('.modo-trabajo').forEach((b) => b.addEventListener('click', () => {
        const m = MODOS[Number(b.dataset.i)];
        abreGigante({ color: m.color, clase: m.claro ? 'claro' : '', etiqueta: m.nombre, html: `${icono(m.icono)}<p class="palabra">${m.nombre}</p>` });
    }));

    // ===================================================================================================
    // 8. Reloj (la zona horaria y el idioma del sitio, dentro de Moodle; los del ordenador, fuera)
    // ===================================================================================================
    (() => {
        let marcas = '';
        for (let i = 0; i < 60; i++) {
            const hora = i % 5 === 0, r1 = hora ? 80 : 85, a = (i * 6 * Math.PI) / 180;
            marcas += `<line class="${hora ? 'marca-h' : 'marca-m'}" x1="${(100 + r1 * Math.sin(a)).toFixed(2)}" y1="${(100 - r1 * Math.cos(a)).toFixed(2)}" x2="${(100 + 89 * Math.sin(a)).toFixed(2)}" y2="${(100 - 89 * Math.cos(a)).toFixed(2)}"/>`;
        }
        for (let h = 1; h <= 12; h++) {
            const a = (h * 30 * Math.PI) / 180;
            marcas += `<text class="num-h" x="${(100 + 66 * Math.sin(a)).toFixed(2)}" y="${(100 - 66 * Math.cos(a)).toFixed(2)}" text-anchor="middle" dominant-baseline="central">${h}</text>`;
        }
        $('#r-marcas').innerHTML = marcas;
    })();
    const opciones = { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'long', day: 'numeric', month: 'long' };
    const SITIO = window.CLASSTOOLS_SITE || {};
    const idioma = IDIOMA;
    let fmtReloj;
    try { fmtReloj = new Intl.DateTimeFormat(idioma, Object.assign(SITIO.tz ? { timeZone: SITIO.tz } : {}, opciones)); }
    catch (e) { fmtReloj = new Intl.DateTimeFormat(undefined, opciones); }
    let rTimer = 0;
    const rPinta = () => {
        const p = {};
        fmtReloj.formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
        const h = Number(p.hour) % 24, m = Number(p.minute), s = Number(p.second);
        $('#r-hm').textContent = `${pad(h)}:${pad(m)}`;
        $('#r-s').textContent = `:${pad(s)}`;
        const fecha = /^es\b/.test(idioma) ? `${p.weekday}, ${p.day} de ${p.month}` : `${p.weekday}, ${p.day} ${p.month}`;
        $('#r-fecha').textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
        $('#r-ah').setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 100 100)`);
        $('#r-am').setAttribute('transform', `rotate(${(m + s / 60) * 6} 100 100)`);
        $('#r-as').setAttribute('transform', `rotate(${s * 6} 100 100)`);
    };
    const rTic = () => { rPinta(); rTimer = setTimeout(rTic, 1000 - (Date.now() % 1000) + 20); };
    HERR.reloj = { entra: rTic, sale: () => clearTimeout(rTimer) };

    // ===================================================================================================
    // 9. Código QR: en qr.js
    // ===================================================================================================

    // ===================================================================================================
    // Teclado: Escape cierra lo que esté encima; la barra espaciadora arranca o para (si no estás escribiendo)
    // ===================================================================================================
    addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!$('#fin-tiempo').hidden) { e.preventDefault(); finCierra(false); }
            else if (!gigante.hidden) { e.preventDefault(); cierraGigante(); }
            return;
        }
        if (e.key !== ' ' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) { return; }
        if (!$('#fin-tiempo').hidden || !gigante.hidden || document.querySelector('dialog[open]')) { return; }
        if (e.target.closest && e.target.closest('button, input, textarea, select, a, [role="tab"]')) { return; }
        const accion = { temporizador: tmAlterna, cronometro: crAlterna, quien: elegir }[actual] || (HERR[actual] && HERR[actual].espacio);
        if (accion) { e.preventDefault(); accion(); }
    });

    // ===================================================================================================
    // Arranque: temporizador de 5 minutos listo; el SCO queda completado al abrirlo (no hay nota)
    // ===================================================================================================
    pintaSonido();
    gPintaModo();
    // Presentar: la barra de arriba se aparta para que la herramienta ocupe la pantalla; un botón pequeño la devuelve
    // (también Escape).
    (() => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'redondo'; b.id = 'b-presentar'; b.title = t('bar_present');
        b.innerHTML = `<span>${icono('ampliar')}</span><span class="redondo-texto">${escapa(t('bar_present'))}</span>`;
        $('.acciones').prepend(b);
        const sale = document.createElement('button');
        sale.type = 'button'; sale.className = 'salir-presentar'; sale.id = 'b-salir-presentar'; sale.hidden = true;
        sale.innerHTML = `${icono('salir')}<span>${escapa(t('bar_present_exit'))}</span>`;
        document.body.append(sale);
        // También pone la pantalla completa (si no lo estaba ya), y al salir la quita solo si la puso él. Si se sale de
        // la pantalla completa con la tecla Escape del navegador, se sale también de presentar.
        let puse = false;
        const pon = (si) => {
            document.documentElement.classList.toggle('presentando', si);
            sale.hidden = !si;
            if (si) { sale.focus({ preventScroll: true }); } else { b.focus({ preventScroll: true }); }
            if (si && document.fullscreenEnabled && !document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => { puse = true; }).catch(() => {});
            } else if (!si && puse) {
                puse = false;
                if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
            }
            dispatchEvent(new Event('resize'));
        };
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && puse) { puse = false; if (document.documentElement.classList.contains('presentando')) { pon(false); } }
        });
        b.addEventListener('click', () => pon(true));
        sale.addEventListener('click', () => pon(false));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.documentElement.classList.contains('presentando') && !document.querySelector('dialog[open]')) { pon(false); }
        });
    })();
    // El botón del modo, en la barra de arriba, con su menú de cuatro.
    (() => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'redondo'; b.id = 'b-modo'; b.setAttribute('aria-haspopup', 'true'); b.setAttribute('aria-expanded', 'false');
        $('.acciones').prepend(b);
        const pinta = () => {
            b.title = `${t('bar_mode')}: ${t('mode_' + modo)}`;
            b.innerHTML = `<span class="modo-disco" data-m="${modo}">${icono('modo-' + modo)}</span><span class="redondo-texto">${escapa(t('mode_' + modo))}</span>`;
        };
        const menu = document.createElement('div');
        menu.className = 'menu-modo'; menu.id = 'menu-modo'; menu.hidden = true; menu.setAttribute('role', 'menu');
        menu.innerHTML = `<p class="ante">${escapa(t('bar_mode_title'))}</p>` + PANTALLAS.map((m) => `<button type="button" role="menuitemradio" data-modo="${m}">`
            + `<span class="modo-disco" data-m="${m}">${icono('modo-' + m)}</span><span><strong>${escapa(t('mode_' + m))}</strong><small>${escapa(t('mode_' + m + '_hint'))}</small></span></button>`).join('');
        document.body.append(menu);
        const cierra = () => { menu.hidden = true; b.setAttribute('aria-expanded', 'false'); };
        b.addEventListener('click', () => {
            if (!menu.hidden) { cierra(); return; }
            $$('button', menu).forEach((x) => x.setAttribute('aria-checked', String(x.dataset.modo === modo)));
            const r = b.getBoundingClientRect();
            menu.style.top = `${r.bottom + 8}px`;
            menu.style.right = `${Math.max(8, innerWidth - r.right)}px`;
            menu.hidden = false; b.setAttribute('aria-expanded', 'true');
            (menu.querySelector('[aria-checked="true"]') || menu.querySelector('button')).focus();
        });
        menu.addEventListener('click', (e) => {
            const x = e.target.closest('[data-modo]'); if (!x) { return; }
            modo = x.dataset.modo;
            document.documentElement.dataset.modo = modo;
            guarda(claveModo, modo);
            guardaAjustes({ mode: modo });
            pinta(); cierra(); ajustaBarra();
            anuncia(`${t('bar_mode')}: ${t('mode_' + modo)}`);
            document.dispatchEvent(new CustomEvent('classtools:mode', { detail: modo }));
        });
        document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target) && !b.contains(e.target)) { cierra(); } });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { e.stopPropagation(); cierra(); b.focus(); } }, true);
        pinta();
    })();
    // Lo que el profesor guarda en el aula de cada herramienta (marcador, roscos…), para seguir desde otro ordenador.
    // Se envía con un poco de espera para no mandar cada toque, y lo pendiente sale al cerrar la página.
    const pendientes = {}, esperas = {};
    const envia = (tool, keepalive) => {
        if (!AULA || !AULA.stateurl || !(tool in pendientes)) { return Promise.resolve(); }
        const datos = pendientes[tool]; delete pendientes[tool];
        return fetch(AULA.stateurl, {
            method: 'POST', credentials: 'same-origin', keepalive: !!keepalive, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ sesskey: AULA.sesskey, courseid: AULA.courseid, tool, data: JSON.stringify(datos) }),
        }).then((r) => r.json()).then((j) => {
            // Sin sesión: se queda pendiente (sale en cuanto vuelvan a entrar) y se avisa.
            if (sinSesion(j)) { if (!(tool in pendientes)) { pendientes[tool] = datos; } avisaSesion(); }
        }).catch(() => { /* sin conexión: queda en el navegador */ });
    };
    const guardaEnAula = (tool, datos) => {
        if (!AULA || !AULA.stateurl) { return; }
        pendientes[tool] = datos;
        clearTimeout(esperas[tool]);
        esperas[tool] = setTimeout(() => envia(tool), 1200);
    };
    addEventListener('pagehide', () => Object.keys(pendientes).forEach((t) => envia(t, true)));
    // Alguien de la clase para otra herramienta (salir a la pizarra, tocar en la partitura…): de la lista elegida en
    // «¿A quién le toca?», de los que han venido, con el sorteo justo de los turnos (cuenta como uno más) y sin repetir
    // al último. null si no hay lista o no queda nadie.
    let ultimoFuera = null;
    const eligeFuera = () => {
        const l = listaQ();
        if (!l) { return null; }
        let bolsa = presentes(l);
        if (bolsa.length > 1 && ultimoFuera) { bolsa = bolsa.filter((n) => n !== ultimoFuera); }
        if (!bolsa.length) { return null; }
        const justo = conTurnos(l) && qJusto;
        const minimo = justo ? Math.min(...bolsa.map((n) => l.veces[n] || 0)) : 0;
        const candidatos = justo ? bolsa.filter((n) => (l.veces[n] || 0) === minimo) : bolsa;
        const elegido = candidatos[azar(candidatos.length)];
        ultimoFuera = elegido;
        if (conTurnos(l) && l.ids[elegido]) {
            sumaTurno(l.ids[elegido]);
            alAula(AULA.pickurl, { userid: l.ids[elegido] }).catch(() => { /* sin conexión: ese turno no cuenta */ });
        }
        return { name: elegido, list: l };
    };
    // API para las herramientas que van en ficheros aparte (chance.js, scoreboard.js…): lo común de la pantalla.
    window.ClasstoolsCore = {
        $, $$, t, translate: traduce, random: azar, shuffle: baraja, escape: escapa, reducedMotion: reducido, save: guarda, load: lee,
        play: suena, sounds: SONIDOS, bell: campana, click: clic, announce: anuncia, icon: icono, setIcon: ponIcono,
        relabel: rotula, repeatWhileHeld: repite, register: (tool, def) => { HERR[tool] = def; }, show: muestra,
        lists: todas, present: presentes, face: cara, initials: iniciales, preload: precarga, activeList: listaQ,
        moodle: AULA, toMoodle: alAula, lastGroups: () => gHechos, openBig: abreGigante, closeBig: cierraGigante,
        newList: () => abreEditor(null), editList: (id) => abreEditor(id),
        kept: (tool) => (AULA && AULA.state && AULA.state[tool]) || null, keep: guardaEnAula,
        audioContext: () => audio(), soundOn: () => sonido, output: () => maestro,
        mode: () => modo,   // early, primary, secondary or advanced; «classtools:mode» when it changes
        byMode: porModo,    // byMode(key, { early: {…}, primary: {…}, … }) → { get(), set(changes) }: values that start differently in each mode
        tabs: () => pestanas.map((b) => b.dataset.h), current: () => actual,
        pick: eligeFuera,   // pick() → { name, list } o null: alguien de la clase, como en «¿A quién le toca?»
    };
    // Abierta desde un curso del aula: título con el curso y botón para volver a él.
    // La vuelta: al curso si se abrió desde uno; si no (dentro de Moodle, sin curso), al inicio de cada usuario.
    const vuelta = AULA && AULA.back ? [AULA.back, t('bar_back')]
        : (window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.home ? [window.CLASSTOOLS_SITE.home, t('bar_home')] : null);
    if (vuelta) {
        const v = document.createElement('a');
        v.className = 'redondo'; v.href = vuelta[0]; v.title = vuelta[1];
        v.innerHTML = `<span>${icono('salir')}</span><span class="redondo-texto">${escapa(vuelta[1])}</span>`;
        $('.acciones').prepend(v);
    }
    if (AULA && AULA.course) {
        document.title = `${t('bar_title')} · ${AULA.course}`;
        // El curso, bajo el nombre de las herramientas: con varias clases al día (o un especialista que rota), que se
        // vea en cuál está abierta.
        const marca = $('.marca'), textos = marca.lastElementChild, app = document.createElement('span');
        app.className = 'marca-app';
        app.append(...textos.childNodes);
        const curso = document.createElement('span');
        curso.className = 'marca-curso'; curso.textContent = AULA.course; curso.title = AULA.course;
        textos.append(app, curso);
        marca.classList.add('con-curso');
        ajustaBarra();
    }
    pintaSelects();
    quienPinta();
    tmPon(5 * 60000);
    const hay = (h) => pestanas.some((b) => b.dataset.h === h);
    muestra(listasAula.length && hay('quien') ? 'quien' : (hay('temporizador') ? 'temporizador' : pestanas[0].dataset.h));
    ajustaBarra();
    try { SCORM.iniciar(); SCORM.guardar({}, 100, true); } catch (e) { /* sin Moodle */ }

    window.Pizarra = { tm, cr, sm, muestra, tmPon, listas: () => listas, todas, limpiaNombres, elegir, abreFaltan };   // para las pruebas automáticas
})();
