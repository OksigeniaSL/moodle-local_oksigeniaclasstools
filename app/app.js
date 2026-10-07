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

    // --- Almacén del navegador: solo comodidades; si no deja guardar, todo sigue funcionando en memoria ---
    let almacen = true;
    try { localStorage.setItem('pizarra:prueba', '1'); localStorage.removeItem('pizarra:prueba'); } catch (e) { almacen = false; }
    const guarda = (k, v) => { try { localStorage.setItem('pizarra:' + k, JSON.stringify(v)); } catch (e) { almacen = false; } };
    const lee = (k, d) => { try { const v = localStorage.getItem('pizarra:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };

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
    };
    const suena = (n) => { if (!sonido) { return; } const a = audio(); if (!a) { return; } try { SONIDOS[n](a); } catch (e) { /* sin audio */ } };

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
    };
    pestanas.forEach((b) => b.addEventListener('click', () => muestra(b.dataset.h)));
    $('#pestanas').addEventListener('keydown', (e) => {
        const i = pestanas.findIndex((b) => b.dataset.h === actual), n = pestanas.length;
        const j = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
        if (j !== undefined) { e.preventDefault(); muestra(pestanas[j].dataset.h, true); }
    });
    // Si las pestañas no caben junto al nombre, la barra pasa a dos filas.
    const ajustaBarra = () => {
        barra.classList.remove('dos-filas');
        if (tira.scrollWidth > tira.clientWidth + 1) { barra.classList.add('dos-filas'); }
    };
    addEventListener('resize', ajustaBarra);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(ajustaBarra); }

    // --- Botones de la barra: sonido, otra ventana, pantalla completa ---
    const bSonido = $('#b-sonido');
    const pintaSonido = () => {
        bSonido.setAttribute('aria-pressed', String(sonido));
        ponIcono(bSonido.querySelector('[data-icono]'), sonido ? 'sonido' : 'mudo');
        bSonido.title = sonido ? 'Sonido activado (pulsa para quitarlo)' : 'Sonido quitado (pulsa para activarlo)';
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
        bPantalla.title = dentro ? 'Salir de la pantalla completa' : 'Pantalla completa';
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
        $('#tm-estado').textContent = tm.acabado ? '¡Tiempo!' : tm.marcha ? 'En marcha' : tm.resta < tm.total ? 'En pausa' : 'Listo';
        insignias();
    };
    const tmBotones = () => {
        const b = $('#tm-marcha');
        if (tm.marcha) { rotula(b, 'Pausa', 'pausa'); b.className = 'boton grande amarillo ancho'; }
        else { rotula(b, tm.resta < tm.total && tm.resta > 0 ? 'Seguir' : 'Empezar', 'empezar'); b.className = 'boton grande verde ancho'; }
        b.disabled = !tm.marcha && tm.total <= 0;
    };
    const tmChips = () => $$('.chip').forEach((c) => c.classList.toggle('activo', Number(c.dataset.min) * 60000 === tm.total));
    // Pone un tiempo nuevo (para el temporizador y lo deja listo).
    const tmPon = (ms) => {
        ms = Math.max(0, Math.min(MAX_TM, Math.round(ms / 1000) * 1000));
        clearInterval(tm.reloj);
        Object.assign(tm, { total: ms, resta: ms, marcha: false, acabado: false });
        $('#tm-min').value = Math.floor(ms / 60000);
        $('#tm-seg').value = Math.floor(ms / 1000) % 60;
        tmChips(); tmBotones(); tmPinta();
    };
    const tmTic = () => {
        tm.resta = Math.max(0, tm.fin - Date.now());
        if (tm.resta <= 0) { tmTermina(); } else { tmPinta(); }
    };
    const tmEmpieza = () => {
        if (tm.total <= 0) { return; }
        if (tm.resta <= 0) { tm.resta = tm.total; }
        if (sonido) { audio(); }   // así la campana del final podrá sonar
        Object.assign(tm, { acabado: false, marcha: true, fin: Date.now() + tm.resta });
        clearInterval(tm.reloj); tm.reloj = setInterval(tmTic, 100);
        tmBotones(); tmPinta();
        anuncia('Temporizador en marcha');
    };
    const tmPausa = () => {
        tm.resta = Math.max(0, tm.fin - Date.now()); tm.marcha = false; clearInterval(tm.reloj);
        tmBotones(); tmPinta();
        anuncia('Temporizador en pausa');
    };
    const tmReinicia = () => { clearInterval(tm.reloj); Object.assign(tm, { marcha: false, acabado: false, resta: tm.total }); tmBotones(); tmPinta(); };
    const tmAlterna = () => { if (tm.marcha) { tmPausa(); } else { tmEmpieza(); } };
    const tmTermina = () => {
        clearInterval(tm.reloj);
        Object.assign(tm, { marcha: false, acabado: true, resta: 0 });
        tmBotones(); tmPinta();
        suena('fin');
        const f = $('#fin-tiempo');
        f.hidden = false;
        f.classList.remove('destella'); void f.offsetWidth; f.classList.add('destella');
        $('#fin-vale').focus();
        anuncia('¡Tiempo!');
    };
    const finCierra = (otra) => { $('#fin-tiempo').hidden = true; tmReinicia(); if (otra) { tmEmpieza(); } };
    $('#fin-vale').addEventListener('click', () => finCierra(false));
    $('#fin-otra').addEventListener('click', () => finCierra(true));
    $('#tm-marcha').addEventListener('click', tmAlterna);
    $('#tm-reiniciar').addEventListener('click', tmReinicia);
    $('#tm-mas1').addEventListener('click', () => {
        if (tm.marcha) { tm.fin = Math.min(tm.fin + 60000, Date.now() + MAX_TM); tm.total = Math.min(MAX_TM, tm.total + 60000); tmTic(); return; }
        if (tm.resta === tm.total) { tmPon(tm.total + 60000); return; }
        tm.resta = Math.min(MAX_TM, tm.resta + 60000); tm.total = Math.max(tm.total, tm.resta); tmBotones(); tmPinta();
    });
    $$('.chip').forEach((c) => c.addEventListener('click', () => tmPon(Number(c.dataset.min) * 60000)));
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
        if (cr.marcha) { rotula(b, 'Pausa', 'pausa'); b.className = 'boton grande amarillo'; }
        else { rotula(b, cr.acum ? 'Seguir' : 'Empezar', 'empezar'); b.className = 'boton grande verde'; }
        $('#cr-vuelta').disabled = !cr.marcha;
    };
    const crPintaVueltas = () => {
        const hay = cr.vueltas.length > 0;
        $('#cr-vueltas-caja').hidden = !hay;
        $('#h-cronometro').classList.toggle('con-vueltas', hay);
        $('#cr-vueltas').innerHTML = cr.vueltas.map((v, i) => ({ v, i })).reverse().map(({ v, i }) => {
            const p = fmtCr(v.parcial), a = fmtCr(v.total);
            return `<li><span class="n">Vuelta ${i + 1}</span><span class="parcial">${p.p}${p.d}</span><span class="acum">total ${a.p}${a.d}</span></li>`;
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
    // Envíos al aula: el turno de cada sorteo y los equipos que se quieran guardar como grupos del curso.
    const alAula = (url, datos) => fetch(url, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(Object.assign({ sesskey: AULA.sesskey, courseid: AULA.courseid }, datos)),
    }).then((r) => r.json()).then((j) => { if (!j || !j.ok) { throw new Error((j && (j.error || j.message)) || 'error'); } return j; });
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
            : `<optgroup label="${escapa(AULA.course || 'Este curso')}">${listasAula.map(op).join('')}</optgroup>`
              + (listas.length ? `<optgroup label="Tus listas">${listas.map(op).join('')}</optgroup>` : '');
        const q = $('#q-lista');
        q.innerHTML = opciones || '<option value="">(todavía no hay listas)</option>';
        q.disabled = !todas().length;
        q.value = listaActiva || '';
        const g = $('#g-lista'), antes = g.value;
        g.innerHTML = opciones + '<option value="__pegar">Pegar nombres ahora…</option>';
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
        $('#ed-titulo').textContent = l ? 'Editar la lista' : 'Nueva lista';
        $('#ed-nombre').value = l ? l.nombre : '';
        $('#ed-alumnos').value = l ? l.alumnos.join('\n') : (texto || '');
        $('#ed-borrar').hidden = !l;
        $('#ed-borrar').classList.remove('confirma'); rotula($('#ed-borrar'), 'Borrar la lista');
        const nota = $('#ed-nota');
        nota.classList.remove('error');
        nota.textContent = almacen ? 'Se guarda solo en este ordenador, en este navegador. No sale de aquí.'
            : 'Este navegador no deja guardar: la lista durará hasta que cierres la página.';
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
            const nota = $('#ed-nota'); nota.textContent = 'Pega al menos un nombre (uno por línea).'; nota.classList.add('error');
            $('#ed-alumnos').focus(); return;
        }
        const nombre = $('#ed-nombre').value.trim() || `Lista ${listas.length + 1}`;
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
        anuncia(`Lista «${nombre}» guardada con ${alumnos.length} alumnos`);
    });
    $('#ed-borrar').addEventListener('click', () => {
        const b = $('#ed-borrar');
        if (!b.classList.contains('confirma')) {
            b.classList.add('confirma'); rotula(b, '¿Seguro? Pulsa otra vez');
            clearTimeout(borrarTimer);
            borrarTimer = setTimeout(() => { b.classList.remove('confirma'); rotula(b, 'Borrar la lista'); }, 4000);
            return;
        }
        listas = listas.filter((x) => x.id !== editando);
        delete salidos[editando];
        listaActiva = todas().length ? todas()[0].id : null;
        qUltimo = null;
        guardaListas(); pintaSelects(); quienPinta(); cierraEditor();
        anuncia('Lista borrada');
    });

    // ===================================================================================================
    // 3. ¿A quién le toca?
    // ===================================================================================================
    const qNombre = $('#q-nombre'), qCaja = $('#q-caja'), qFoto = $('#q-foto');
    let qSinRepetir = lee('sin-repetir', true) !== false, qBarajando = false, qUltimo = null, qTimer = 0;
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
            qNombre.textContent = 'Pega la lista de tu clase para empezar';
            $('#q-pie').textContent = 'Cada lista se guarda solo en este ordenador.';
            qEncaja(); return;
        }
        precarga(l);
        const pres = presentes(l), nf = l.alumnos.length - pres.length;
        rotula($('#q-faltan'), nf ? `Faltan hoy: ${nf}` : '¿Quién falta hoy?');
        const s = (salidos[l.id] || []).filter((n) => pres.includes(n));
        $('#q-cuenta').textContent = `${s.length} de ${pres.length}`;
        $('#q-salidos').innerHTML = s.slice().reverse().map((n) => `<li>${cara(l, n, 'cara-mini')}<span>${escapa(n)}</span></li>`).join('');
        $('#q-reset').disabled = !s.length;
        const quedan = qSinRepetir ? pres.length - s.length : pres.length;
        if (!qBarajando) {
            if (qUltimo) { qNombre.className = 'nombre-grande'; qNombre.textContent = qUltimo; }
            else { qNombre.className = 'nombre-grande espera'; qNombre.textContent = '?'; }
            pintaCara(l, qUltimo);
            const hay = `${pres.length} alumnos${nf ? ` (faltan ${nf})` : ''}`;
            $('#q-pie').textContent = !quedan ? 'Ya han salido todos. Pulsa «Empezar de nuevo».'
                : qUltimo ? (qSinRepetir ? `Quedan ${quedan}` : hay)
                : `${hay} en «${l.nombre}». Pulsa «Elegir».`;
        }
        $('#q-elegir').disabled = qBarajando || !quedan;
        qEncaja();
    };
    const elegir = () => {
        const l = listaQ();
        if (!l || qBarajando) { return; }
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
            if (qSinRepetir) { salidos[l.id] = s.concat(elegido); guarda('salidos', salidos); }
            if (conTurnos(l) && l.ids[elegido]) {
                sumaTurno(l.ids[elegido]);
                alAula(AULA.pickurl, { userid: l.ids[elegido] }).catch(() => { /* sin conexión: ese turno no cuenta, el sorteo sigue */ });
            }
            quienPinta();
            qNombre.className = 'nombre-grande elegido';
            suena('elegido');
            anuncia(`Le toca a ${elegido}`);
        };
        if (reducido() || bolsa.length < 2) { acaba(); return; }
        // Barajado: los nombres pasan cada vez más despacio (unos dos segundos) hasta pararse en el elegido.
        qBarajando = true; $('#q-elegir').disabled = true;
        qNombre.className = 'nombre-grande barajando';
        pintaCara(l, bolsa[0]);
        const largo = bolsa.reduce((a, b) => (b.length > a.length ? b : a), '');
        encaja(qNombre, qCaja, largo, altoNombre());
        $('#q-pie').textContent = 'Barajando…';
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
    $('#q-justo').addEventListener('change', (e) => { qJusto = e.target.checked; guarda('justo', qJusto); });
    // Participación: cuántas veces le ha tocado a cada uno en el curso (con cualquier profesor), quien menos arriba.
    const dParticipa = $('#participa');
    $('#q-participa').addEventListener('click', () => {
        const l = listaQ();
        if (!conTurnos(l)) { return; }
        const filas = l.alumnos.slice().sort((a, b) => (l.veces[a] || 0) - (l.veces[b] || 0) || a.localeCompare(b, 'es'));
        const max = Math.max(1, ...filas.map((n) => l.veces[n] || 0));
        $('#p-titulo').textContent = `Participación · ${l.nombre}`;
        $('#p-nota').textContent = `Veces que le ha tocado a cada uno en los últimos ${AULA.days} días, con cualquier profesor de este curso. Arriba, quien menos.`;
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
    const fTitulo = () => { const n = faltanDe(fLista).length; $('#f-titulo').textContent = n ? `Faltan hoy: ${n}` : '¿Quién falta hoy?'; };
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
        anuncia(n ? `Faltan hoy ${n}` : 'Han venido todos');
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
        $('#g-n').setAttribute('aria-label', gModo === 'num' ? `${gN} grupos` : `${gN} alumnos por grupo`);
    };
    const gListo = () => rotula($('#g-hacer'), 'Hacer grupos', 'mezclar');
    let gUltimos = null, gHechos = null;   // gHechos: los últimos grupos hechos, con su lista (los usa el Marcador)
    function gCambiaLista() {
        const pegar = $('#g-lista').value === '__pegar', l = gLista();
        $('#g-moodle').hidden = true; gUltimos = null;
        $('#g-pegados').hidden = !pegar;
        $('#g-guardar').hidden = !pegar;
        $('#g-faltan').hidden = !l;
        if (l) { precarga(l); const nf = l.alumnos.length - presentes(l).length; rotula($('#g-faltan'), nf ? `Faltan hoy: ${nf}` : '¿Quién falta hoy?'); }
        $('#g-guardar').disabled = !limpiaNombres($('#g-pegados').value).length;
        gListo();
    }
    const gHacer = () => {
        const nombres = gNombres();
        if (nombres.length < 2) {
            $('#g-resumen').textContent = 'Hacen falta al menos dos nombres.';
            gVacio($('#g-lista').value === '__pegar' ? 'Pega los nombres de tu clase, uno por línea.' : 'Esa lista está vacía.');
            return;
        }
        const b = baraja(nombres.slice()), lg = $('#g-lista').value === '__pegar' ? null : gLista();
        const k = gModo === 'num' ? Math.min(gN, b.length) : Math.max(1, Math.round(b.length / gN));
        const grupos = Array.from({ length: k }, () => []);
        b.forEach((n, i) => grupos[i % k].push(n));
        gRejilla.classList.remove('vacia');
        gRejilla.innerHTML = grupos.map((g, i) => {
            const [c, claro] = COLORES[i % COLORES.length];
            const retraso = reducido() ? 0 : i * 60;
            return `<article class="grupo${claro ? ' claro' : ''}" style="--c:${c}; animation-delay:${retraso}ms">
                <h3>Grupo ${i + 1} <small>${g.length}</small></h3>
                <ul>${g.map((n) => `<li>${cara(lg, n, 'cara-mini')}<span>${escapa(n)}</span></li>`).join('')}</ul></article>`;
        }).join('');
        const tams = grupos.map((g) => g.length), mn = Math.min(...tams), mx = Math.max(...tams);
        $('#g-resumen').textContent = `${b.length} alumnos en ${k} ${k === 1 ? 'grupo' : 'grupos'} de ${mn === mx ? mn : `${mn} y ${mx}`}.`;
        gEncaja();
        rotula($('#g-hacer'), 'Otra vez', 'otra');
        gHechos = { lista: lg, grupos };
        // Guardarlos como grupos del curso: solo si se pulsa (por defecto no se crea nada).
        gUltimos = lg && lg.aula && AULA.groupsurl ? { lista: lg, grupos } : null;
        $('#g-moodle').hidden = !gUltimos; $('#g-moodle').disabled = false;
        rotula($('#g-moodle'), 'Guardar como grupos del curso', 'guardar');
        suena('dado');
        anuncia(`Hechos ${k} grupos`);
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
    $('#g-lista').addEventListener('change', gCambiaLista);
    $('#g-pegados').addEventListener('input', () => { gListo(); $('#g-guardar').disabled = !limpiaNombres($('#g-pegados').value).length; });
    $('#g-guardar').addEventListener('click', () => abreEditor(null, $('#g-pegados').value));
    $('#g-faltan').addEventListener('click', () => abreFaltan(gLista()));
    $('#g-moodle').addEventListener('click', () => {
        if (!gUltimos) { return; }
        const { lista, grupos } = gUltimos, b = $('#g-moodle');
        b.disabled = true; rotula(b, 'Guardando…');
        alAula(AULA.groupsurl, { listname: lista.nombre, teams: JSON.stringify(grupos.map((g) => g.map((n) => lista.ids[n]).filter(Boolean))) })
            .then((j) => {
                rotula(b, 'Guardados en el curso', 'hecho');
                $('#g-resumen').textContent += ` Guardados en el curso como «${j.grouping}».`;
                anuncia(`Guardados en el curso como ${j.grouping}`);
            })
            .catch(() => { b.disabled = false; rotula(b, 'No se han podido guardar. Otra vez', 'guardar'); });
    });
    $$('#g-modo button').forEach((b) => b.addEventListener('click', () => { gModo = b.dataset.modo; guarda('grupos-modo', gModo); gPintaModo(); gListo(); }));
    const gCambiaN = (d) => { gN = Math.max(2, Math.min(15, gN + d)); guarda('grupos-n', gN); gPintaModo(); gListo(); };
    repite($('#g-menos'), () => gCambiaN(-1));
    repite($('#g-mas'), () => gCambiaN(1));
    gVacio('Elige una lista (o pega los nombres) y pulsa «Hacer grupos».');

    // ===================================================================================================
    // 5. Semáforo de ruido: solo mide el volumen del micrófono; no graba ni envía nada
    // ===================================================================================================
    const sm = { flujo: null, fuente: null, analizador: null, buf: null, rf: 0, suave: 0, zona: null, bajaDesde: 0, ultimoAria: -1 };
    const MENSAJES = { verde: 'Muy bien', amarillo: 'Un poco más bajo', rojo: '¡Demasiado ruido!' };
    const ORDEN = { verde: 0, amarillo: 1, rojo: 2 };
    const microPermitido = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) { return false; }
        const pol = document.permissionsPolicy || document.featurePolicy;
        try { if (pol && pol.allowsFeature && !pol.allowsFeature('microphone')) { return false; } } catch (e) { /* sin política */ }
        return true;
    };
    const smSinMicro = (causa) => {
        const ventana = 'Ábrelo en otra ventana para usar el micrófono.';
        const textos = {
            marco: `<strong>Aquí dentro del aula virtual no se puede usar el micrófono.</strong> ${ventana}`,
            permiso: enMarco ? `<strong>No me dejan usar el micrófono aquí.</strong> ${ventana}`
                : '<strong>El navegador no me deja usar el micrófono.</strong> Pulsa el candado junto a la dirección, permite el micrófono y vuelve a intentarlo.',
            ninguno: '<strong>No encuentro ningún micrófono en este ordenador.</strong> Conecta uno o prueba en otro equipo.',
            otro: `<strong>El micrófono no está disponible.</strong> ${enMarco ? ventana : 'Comprueba que el ordenador tiene micrófono y que ningún otro programa lo está usando.'}`,
            pendiente: enMarco ? `<strong>¿No ves la pregunta para usar el micrófono?</strong> ${ventana}`
                : '<strong>El navegador te pregunta si me deja usar el micrófono.</strong> Pulsa «Permitir». Si no ves la pregunta, busca el icono del micrófono o del candado junto a la dirección.',
        };
        $('#s-sinmicro-texto').innerHTML = textos[causa] || textos.otro;
        $('#s-ventana').hidden = !enMarco;
        $('#s-sinmicro').hidden = false;
    };
    const smZona = (z) => {
        sm.zona = z;
        $$('#s-caja .luz').forEach((l) => l.classList.toggle('encendida', l.dataset.zona === z));
        $('#s-caja').classList.toggle('apagado', !z);
        $('#s-caja').setAttribute('aria-label', z ? `Semáforo en ${z}` : 'Semáforo apagado');
        const m = $('#s-mensaje');
        m.className = 'mensaje-ruido' + (z ? ' ' + z : '');
        m.textContent = z ? MENSAJES[z] : 'Semáforo apagado';
    };
    const smBucle = () => {
        sm.analizador.getFloatTimeDomainData(sm.buf);
        let suma = 0;
        for (let i = 0; i < sm.buf.length; i++) { suma += sm.buf[i] * sm.buf[i]; }
        const db = 20 * Math.log10(Math.sqrt(suma / sm.buf.length) + 1e-9);
        // De unos −62 dB (clase en silencio) a −14 dB (mucho jaleo); la sensibilidad corre la escala ±17 dB.
        const sens = Number($('#s-sensibilidad').value);
        const nivel = Math.max(0, Math.min(100, ((db + 62 + (sens - 5) * 3.5) / 48) * 100));
        sm.suave += (nivel - sm.suave) * (nivel > sm.suave ? 0.3 : 0.05);
        const z = sm.suave >= 75 ? 'rojo' : sm.suave >= 50 ? 'amarillo' : 'verde';
        const ahora = performance.now();
        // Sube de color al momento; para bajar tiene que estar 1,5 s por debajo (así no parpadea).
        if (!sm.zona || ORDEN[z] > ORDEN[sm.zona]) { smZona(z); sm.bajaDesde = 0; }
        else if (ORDEN[z] < ORDEN[sm.zona]) {
            if (!sm.bajaDesde) { sm.bajaDesde = ahora; } else if (ahora - sm.bajaDesde > 1500) { smZona(z); sm.bajaDesde = 0; }
        } else { sm.bajaDesde = 0; }
        $('#s-relleno').style.setProperty('--nivel', sm.suave.toFixed(1) + '%');
        const redondo = Math.round(sm.suave / 5) * 5;
        if (redondo !== sm.ultimoAria) { sm.ultimoAria = redondo; $('#s-medidor').setAttribute('aria-valuenow', String(redondo)); }
        sm.rf = requestAnimationFrame(smBucle);
    };
    const smApaga = () => {
        cancelAnimationFrame(sm.rf);
        if (sm.fuente) { try { sm.fuente.disconnect(); } catch (e) { /* ya estaba */ } }
        if (sm.flujo) { sm.flujo.getTracks().forEach((t) => t.stop()); }
        Object.assign(sm, { flujo: null, fuente: null, analizador: null, suave: 0, zona: null, bajaDesde: 0 });
        smZona(null);
        $('#s-relleno').style.setProperty('--nivel', '0%');
        $('#s-medidor').setAttribute('aria-valuenow', '0');
        rotula($('#s-marcha'), 'Escuchar la clase', 'micro');
        $('#s-marcha').className = 'boton grande ancho';
    };
    const smEmpieza = async () => {
        $('#s-sinmicro').hidden = true;
        if (!microPermitido()) { smSinMicro(enMarco ? 'marco' : 'otro'); return; }
        const b = $('#s-marcha');
        b.disabled = true;
        $('#s-mensaje').textContent = 'Pidiendo permiso…';
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
            rotula(b, 'Apagar el semáforo', 'micro-no');
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
        $('#s-sens-valor').textContent = v <= 3 ? 'baja' : v <= 7 ? 'media' : 'alta';
    };
    $('#s-sensibilidad').value = Math.max(1, Math.min(10, Number(lee('sensibilidad', 5)) || 5));
    $('#s-sensibilidad').addEventListener('input', () => { pintaSens(); guarda('sensibilidad', Number($('#s-sensibilidad').value)); });
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
        gigante.setAttribute('aria-label', etiqueta || 'Vista en grande');
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
        { nombre: 'Silencio', icono: 'silencio', color: '#ce1423' },
        { nombre: 'En voz baja', icono: 'bajo', color: '#fbbe17', claro: true },
        { nombre: 'Por parejas', icono: 'parejas', color: '#067e36' },
        { nombre: 'En grupo', icono: 'grupos', color: '#5b2fb8' },
        { nombre: 'Levanta la mano', icono: 'mano', color: '#164281' },
        { nombre: 'Escucha', icono: 'escucha', color: '#0e7c86' },
    ];
    $('#a-rejilla').innerHTML = MODOS.map((m, i) =>
        `<button type="button" class="modo-trabajo${m.claro ? ' claro' : ''}" style="--c:${m.color}" data-i="${i}">${icono(m.icono)}<span class="palabra">${m.nombre}</span></button>`).join('');
    $$('.modo-trabajo').forEach((b) => b.addEventListener('click', () => {
        const m = MODOS[Number(b.dataset.i)];
        abreGigante({ color: m.color, clase: m.claro ? 'claro' : '', etiqueta: m.nombre, html: `${icono(m.icono)}<p class="palabra">${m.nombre}</p>` });
    }));

    // ===================================================================================================
    // 8. Reloj (hora de Canarias con el reloj del propio ordenador)
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
    let fmtReloj;
    try { fmtReloj = new Intl.DateTimeFormat('es-ES', Object.assign({ timeZone: 'Atlantic/Canary' }, opciones)); }
    catch (e) { fmtReloj = new Intl.DateTimeFormat('es-ES', opciones); }
    let rTimer = 0;
    const rPinta = () => {
        const p = {};
        fmtReloj.formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
        const h = Number(p.hour) % 24, m = Number(p.minute), s = Number(p.second);
        $('#r-hm').textContent = `${pad(h)}:${pad(m)}`;
        $('#r-s').textContent = `:${pad(s)}`;
        const fecha = `${p.weekday}, ${p.day} de ${p.month}`;
        $('#r-fecha').textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
        $('#r-ah').setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 100 100)`);
        $('#r-am').setAttribute('transform', `rotate(${(m + s / 60) * 6} 100 100)`);
        $('#r-as').setAttribute('transform', `rotate(${s * 6} 100 100)`);
    };
    const rTic = () => { rPinta(); rTimer = setTimeout(rTic, 1000 - (Date.now() % 1000) + 20); };
    HERR.reloj = { entra: rTic, sale: () => clearTimeout(rTimer) };

    // ===================================================================================================
    // 9. Código QR (qrcode-generator de Kazuhiko Arase, MIT, en lib/)
    // ===================================================================================================
    const hayQR = typeof qrcode === 'function';
    if (hayQR && qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) { qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']; }
    const qrSvg = (texto, clase = '') => {
        const q = qrcode(0, 'M');
        q.addData(texto); q.make();
        const n = q.getModuleCount(), m = 4;
        let d = '';
        // Una tira por cada racha de módulos oscuros de la misma fila: pocos trazos y bordes nítidos.
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!q.isDark(r, c)) { continue; }
                let l = 1;
                while (c + l < n && q.isDark(r, c + l)) { l++; }
                d += `M${c + m} ${r + m}h${l}v1h-${l}z`;
                c += l - 1;
            }
        }
        return `<svg class="${clase}" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges" role="img" aria-label="Código QR de: ${escapa(texto)}"><rect width="100%" height="100%" fill="#fff"/><path fill="#1c1a19" d="${d}"/></svg>`;
    };
    const qrVisible = (t) => t.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    let qrTexto = '', qrTimer = 0;
    const qrPinta = () => {
        const t = $('#qr-texto').value.trim(), dibujo = $('#qr-dibujo');
        qrTexto = '';
        $('#qr-ver').textContent = '';
        $('#qr-ampliar').disabled = true;
        if (!t) { dibujo.innerHTML = `<div class="vacio">${icono('qr')}<p>Escribe o pega un enlace y aquí saldrá su código.</p></div>`; return; }
        if (!hayQR) { dibujo.innerHTML = '<div class="vacio"><p>No se ha podido cargar el generador de QR.</p></div>'; return; }
        try {
            dibujo.innerHTML = qrSvg(t);
            qrTexto = t;
            $('#qr-ver').textContent = qrVisible(t);
            $('#qr-ampliar').disabled = false;
        } catch (e) {
            dibujo.innerHTML = `<div class="vacio">${icono('qr')}<p>Es demasiado largo para un código QR. Acórtalo un poco.</p></div>`;
        }
    };
    $('#qr-texto').value = lee('qr', 'https://aula.nuryana.com');
    $('#qr-texto').addEventListener('input', () => { clearTimeout(qrTimer); qrTimer = setTimeout(() => { qrPinta(); guarda('qr', $('#qr-texto').value); }, 200); });
    $('#qr-borrar').addEventListener('click', () => { $('#qr-texto').value = ''; guarda('qr', ''); qrPinta(); $('#qr-texto').focus(); });
    $('#qr-ampliar').addEventListener('click', () => {
        if (!qrTexto) { return; }
        abreGigante({ clase: 'blanco', etiqueta: 'Código QR en grande', html: `${qrSvg(qrTexto, 'qr-grande')}<p class="qr-pie">${escapa(qrVisible(qrTexto))}</p>` });
    });
    qrPinta();

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
        if (!$('#fin-tiempo').hidden || !gigante.hidden || (editor.open)) { return; }
        if (e.target.closest && e.target.closest('button, input, textarea, select, a, [role="tab"]')) { return; }
        const accion = { temporizador: tmAlterna, cronometro: crAlterna, quien: elegir }[actual] || (HERR[actual] && HERR[actual].espacio);
        if (accion) { e.preventDefault(); accion(); }
    });

    // ===================================================================================================
    // Arranque: temporizador de 5 minutos listo; el SCO queda completado al abrirlo (no hay nota)
    // ===================================================================================================
    pintaSonido();
    gPintaModo();
    // API para las herramientas que van en ficheros aparte (chance.js, scoreboard.js…): lo común de la pantalla.
    window.ClasstoolsCore = {
        $, $$, random: azar, shuffle: baraja, escape: escapa, reducedMotion: reducido, save: guarda, load: lee,
        play: suena, sounds: SONIDOS, bell: campana, click: clic, announce: anuncia, icon: icono, setIcon: ponIcono,
        relabel: rotula, repeatWhileHeld: repite, register: (tool, def) => { HERR[tool] = def; }, show: muestra,
        lists: todas, present: presentes, face: cara, initials: iniciales, preload: precarga, activeList: listaQ,
        moodle: AULA, toMoodle: alAula, lastGroups: () => gHechos, openBig: abreGigante, closeBig: cierraGigante,
        newList: () => abreEditor(null), editList: (id) => abreEditor(id),
    };
    // Abierta desde un curso del aula: título con el curso y botón para volver a él.
    if (AULA && AULA.back) {
        const v = document.createElement('a');
        v.className = 'redondo'; v.href = AULA.back; v.title = 'Volver al curso';
        v.innerHTML = `<span>${icono('salir')}</span><span class="redondo-texto">Volver al curso</span>`;
        $('.acciones').prepend(v);
    }
    if (AULA && AULA.course) { document.title = `Herramientas de clase · ${AULA.course}`; }
    pintaSelects();
    quienPinta();
    tmPon(5 * 60000);
    muestra(listasAula.length ? 'quien' : 'temporizador');
    ajustaBarra();
    try { SCORM.iniciar(); SCORM.guardar({}, 100, true); } catch (e) { /* sin Moodle */ }

    window.Pizarra = { tm, cr, sm, muestra, tmPon, listas: () => listas, todas, limpiaNombres, elegir, abreFaltan };   // para las pruebas automáticas
})();
