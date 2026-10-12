// Practice mode (#practica in the address): the board inside a guided help (help.js), with an invented class and a
// pretend Moodle. Nothing of the teacher's is read or saved (app.js keeps everything in memory), no real use counts for
// the stickers, and a live session works without a server: devices join and answer on a fixed rhythm, so a help always
// plays the same way. «#practica&rapido»: the class is already in when the session opens.
// From the prototype of the guided helps of the art direction (kit/ayuda-guiada/practica.js).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    if (!/(?:^#|&)practica(?:&|$)/.test(location.hash)) { return; }
    document.documentElement.classList.add('practica');
    const QUICK = /(?:^#|&)rapido(?:&|$)/.test(location.hash);
    const STR = Object.assign({}, window.CLASSTOOLS_STR || {}, (window.CLASSTOOLS_SITE && window.CLASSTOOLS_SITE.str) || {});

    // --- The class: invented names and faces drawn here (no real students) ---------------------------------------
    // The same class as the videos of the helps (the art direction's build-demo.mjs): the same names, and the same
    // faces from the same seeded random.
    const NAMES = ['Lucía Moreno', 'Hugo Serrano', 'Martina Castro', 'Mateo Delgado', 'Sofía Ramos', 'Leo Navarro',
        'Valeria Molina', 'Daniel Rubio', 'Paula Herrero', 'Álvaro Medina', 'Carmen Vidal', 'Marcos Cano',
        'Julia Prieto', 'Adrián Campos', 'Noa Garrido', 'Izan Cabrera', 'Olivia Pastor', 'Bruno Santana',
        'Alba Fuentes', 'Gael Lorenzo', 'Irene Mora', 'Enzo Vega', 'Vera Calvo', 'Nicolás León'];
    const LONG_HAIR = new Set(['Lucía', 'Martina', 'Sofía', 'Valeria', 'Paula', 'Carmen', 'Julia', 'Noa', 'Olivia', 'Alba', 'Irene', 'Vera']);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const SKINS = ['#f6d3b3', '#eec09a', '#d9a27a', '#b97d57', '#8d5a3b', '#f3c9a6'];
    const HAIRS = ['#2b1d16', '#4a2f22', '#6b4226', '#a0672f', '#d4a253', '#1c1c1c', '#7a3b1e'];
    const BACKS = ['#cfe0f7', '#fde7b0', '#cdeed8', '#f8d4d8', '#e3d8fb', '#d6f0f5', '#ffe0c7'];
    const SHIRTS = ['#164281', '#ce1423', '#067e36', '#5b2fb8', '#fbbe17', '#0e7c86', '#e05a2b'];
    const face = (first) => {
        const skin = pick(SKINS), hair = pick(HAIRS), back = pick(BACKS), shirt = pick(SHIRTS);
        const style = LONG_HAIR.has(first) ? pick(['long', 'bun', 'bob', 'curly']) : pick(['short', 'curly', 'side', 'short']);
        const behind = {
            long: `<path d="M52 92c0-34 20-54 48-54s48 20 48 54v58H52z" fill="${hair}"/>`,
            bob: `<path d="M54 96c0-34 19-52 46-52s46 18 46 52v28H54z" fill="${hair}"/>`,
            bun: `<circle cx="100" cy="40" r="17" fill="${hair}"/>`,
            curly: `<g fill="${hair}">${[[62, 78], [74, 58], [94, 48], [114, 50], [132, 62], [140, 84], [58, 100], [142, 104]]
                .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17"/>`).join('')}</g>`,
            short: '', side: '',
        }[style];
        const top = {
            long: `<path d="M60 92c4-26 20-40 40-40s38 14 41 40c-12-12-30-18-50-16-12 2-22 8-31 16z" fill="${hair}"/>`,
            bob: `<path d="M60 92c4-26 20-40 40-40s38 14 41 40c-14-14-36-20-81 0z" fill="${hair}"/>`,
            bun: `<path d="M61 90c3-25 19-39 39-39s37 14 40 39c-10-12-26-18-40-18s-30 6-39 18z" fill="${hair}"/>`,
            curly: '',
            short: `<path d="M61 88c2-24 18-38 39-38s37 14 39 38c-8-8-22-14-39-14s-31 6-39 14z" fill="${hair}"/>`,
            side: `<path d="M60 90c2-26 19-40 41-40 20 0 36 13 39 36-20-2-40-8-56-20-6 10-14 18-24 24z" fill="${hair}"/>`,
        }[style];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${back}"/>${behind}`
            + `<path d="M38 200c4-34 30-52 62-52s58 18 62 52z" fill="${shirt}"/><rect x="88" y="124" width="24" height="30" rx="10" fill="${skin}"/>`
            + `<ellipse cx="100" cy="98" rx="38" ry="42" fill="${skin}"/><circle cx="62" cy="102" r="7" fill="${skin}"/>`
            + `<circle cx="138" cy="102" r="7" fill="${skin}"/>${top}<circle cx="86" cy="100" r="4.2" fill="#2a1f1a"/>`
            + '<circle cx="114" cy="100" r="4.2" fill="#2a1f1a"/><circle cx="78" cy="114" r="6" fill="#f08a8a" opacity=".35"/>'
            + '<circle cx="122" cy="114" r="6" fill="#f08a8a" opacity=".35"/>'
            + '<path d="M88 118c6 7 18 7 24 0" stroke="#7a3b2e" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };
    const students = NAMES.map((n, i) => {
        const v = Math.floor(rnd() * 3);
        return { n, i: 100 + i, v, f: face(n.split(' ')[0]) };
    });
    const half = (k) => students.filter((_, i) => i % 2 === k);
    window.CLASSTOOLS = {
        course: STR.hp_practice_course || 'Practice class', back: '#', courseid: 1, mode: 'teacher', sesskey: 'practica', days: 90,
        lists: [
            { id: 'g1', name: STR.hp_practice_list || 'Class', students },
            { id: 'g2', name: STR.hp_practice_half_a || 'A', students: half(0) },
            { id: 'g3', name: STR.hp_practice_half_b || 'B', students: half(1) },
        ],
        me: { n: 'Marta Ibáñez', i: 1 }, state: {},
        pickurl: 'pick.php', stateurl: 'state.php', groupsurl: null, boardurl: null, liveurl: 'livehost.php',
        remoteurl: 'remote.php', remote: { on: false }, logrosurl: null, logros: null,
        bankurl: 'quizbank.php', glossaryurl: 'glossary.php', aiurl: null, quizimgurl: 'quizimage.php', quizimg: '',
    };

    // --- A live session that plays itself -----------------------------------------------------------------------
    const DEVICES = 22;
    const VOTES = { abcd: ['A', 'B', 'C', 'D'], yesno: ['yes', 'no'], light: ['green', 'yellow', 'red'], five: ['1', '2', '3', '4', '5'] };
    // How the class votes, one after another, round by round (the second round, after the experiment, changes).
    const PICKS = {
        abcd: ['AABACBADBACABADABCABAC', 'BBABBCBBBBDBBABBCBBBAB'],
        yesno: ['nnynnnnynnnnynnnnnynny', 'yyyynyyyyyyynyyyyyyyny'],
    };
    const LETTER = { y: 'yes', n: 'no' };
    // What the class writes in a brainstorm, device after device, question by question: the same word written in
    // different ways (it counts as one), two answers that mean the same (to join by hand) and one to hide.
    const IDEAS = [
        ['denominador', 'simplificar', 'Denominador', 'equivalentes', 'denominador', 'mcm', 'fracciones equivalentes',
            'denominador', 'tengo hambre', 'Simplificar', 'denominador!', 'dividir', 'equivalentes', 'DENOMINADOR',
            'simplificar', 'la recta numérica', 'denominador', 'mcm', 'fracciones equivalentes', 'simplificar',
            'Denominador', 'nada'],
        ['nada', 'simplificar', 'nada', 'mcm', 'nada', 'Nada', 'simplificar', 'nada', 'mcm', 'nada', 'nada', 'dividir',
            'nada', 'simplificar', 'nada', 'nada', 'nada', 'mcm', 'nada', 'nada', 'nada', 'nada'],
    ];
    // How the class answers a quiz, question by question (0 is A…); with teams, even devices in the first one.
    const QUIZ = ['1110101110111121101111', '2222220222202222222222'];
    // Who presses the buzzer, round by round: the device and how long after the buzzers opened (ms).
    const PRESSES = [
        [[7, 6000], [4, 6310], [12, 6580], [2, 6940], [19, 7200], [9, 7550]],
        [[5, 1200], [14, 1420], [7, 1760], [0, 2000], [17, 2350]],
    ];
    // An exit ticket after a lesson on invertebrates (from the art direction's practica.js): how each one is getting on
    // (0 «not yet» … 3 «could explain it»), the most important thing learned and a doubt left. Eight are «halfway», and
    // most of their doubts say the same.
    const TICKETS = [
        ['2', 'Los insectos tienen seis patas', 'Ninguna'],
        ['1', 'Que hay animales sin huesos', '¿Por qué la araña no es un insecto?'],
        ['3', 'Los insectos tienen seis patas y las arañas ocho', ''],
        ['1', 'Los invertebrados no tienen esqueleto por dentro', 'No entiendo por qué la araña no es un insecto'],
        ['2', 'El caracol es un molusco', '¿El caracol tiene huesos en la concha?'],
        ['0', 'Bichos', 'Todo'],
        ['1', 'Que casi todos los animales son invertebrados', '¿La araña es un insecto o no?'],
        ['2', 'Las mariposas tienen seis patas', ''],
        ['3', 'Insecto: seis patas, cabeza, tórax y abdomen', 'Ninguna'],
        ['1', 'Los insectos tienen antenas', 'Lo de las ocho patas de la araña'],
        ['2', 'La lombriz es un invertebrado', '¿El pulpo tiene huesos?'],
        ['1', 'Hay muchos tipos de invertebrados', '¿Por qué la araña no es un insecto si es un bicho?'],
        ['0', 'No me acuerdo', 'Qué es un invertebrado'],
        ['2', 'Las arañas son arácnidos', ''],
        ['1', 'Los invertebrados no tienen columna', 'No sé por qué la araña no es un insecto'],
        ['2', 'Los insectos tienen el cuerpo en tres partes', 'Ninguna'],
        ['3', 'La araña no es un insecto porque tiene ocho patas', ''],
        ['1', 'Las medusas son invertebrados', '¿Las arañas no son insectos?'],
        ['2', 'Hay invertebrados en el mar', '¿El cangrejo es un insecto?'],
        ['0', 'Los animales', 'No entiendo lo de vertebrado'],
        ['1', 'Las hormigas son insectos', '¿Y la araña?'],
    ];
    const st = { started: 0, kind: 'vote', identity: 'anon', vote: 'abcd', round: 0, open: false, openedAt: 0, closedAt: 0,
        joinMs: QUICK ? 15 : 380, voteMs: 260, q: '', max: 1, ideaMs: 150, ticketMs: 170, feel: true, prompts: [],
        teams: [], pick: false, mode: 'calm', top: 0, qs: {}, revealed: 0, answered: {}, answerMs: 120, joined: false, cmds: [], seq: 0 };

    const view = () => {
        const now = Date.now();
        const joined = st.started ? Math.min(DEVICES, Math.floor((now - st.started) / st.joinMs)) : 0;
        const v = {
            id: 7, code: 'K7Q2', kind: st.kind, identity: st.identity, round: st.round, open: st.open, left: 0, show: false,
            ended: !st.started, others: 0, notice: true, url: 'join.php?c=K7Q2',
            devices: Array.from({ length: joined }, (_, i) => ({ device: 'd' + (1000 + i * 37), name: st.identity === 'moodle' ? NAMES[i % NAMES.length] : '',
                team: (st.kind === 'quiz' || st.kind === 'buzz') && st.teams.length ? (i % st.teams.length) + 1 : 0 })),
        };
        const until = st.open ? now : st.closedAt;
        if (st.kind === 'vote') {
            const options = VOTES[st.vote] || VOTES.abcd;
            const n = st.round ? Math.min(joined, Math.floor((until - st.openedAt) / st.voteMs)) : 0;
            const results = {};
            options.forEach((o) => { results[o] = 0; });
            if (st.round) {
                const rounds = PICKS[st.vote] || PICKS.abcd;
                rounds[(st.round - 1) % rounds.length].slice(0, n).split('').forEach((p, i) => {
                    const c = LETTER[p] || p;
                    results[options.includes(c) ? c : options[i % options.length]]++;
                });
            }
            Object.assign(v, { vote: st.vote, options, results: st.round ? results : [] });
        }
        if (st.kind === 'remote') {
            v.devices = [];
            Object.assign(v, { joined: st.joined, cmds: st.cmds.slice(-10), seq: st.seq });
        }
        if (st.kind === 'buzz') {
            const got = st.round ? PRESSES[(st.round - 1) % PRESSES.length].filter(([i, at]) => i < joined && at <= until - st.openedAt) : [];
            v.teams = st.teams;
            v.presses = got.map(([i, at]) => ({ device: v.devices[i].device, name: v.devices[i].name, team: v.devices[i].team, after: at - got[0][1] }));
        }
        // The tickets come in one after another while it is open: 21 of the 22 devices.
        if (st.kind === 'exit') {
            const n = st.round ? Math.min(joined, TICKETS.length, Math.floor((until - st.openedAt) / st.ticketMs)) : 0;
            Object.assign(v, { feel: st.feel, prompts: st.prompts, tickets: TICKETS.slice(0, n).map(([feel, ...texts], i) => ({
                device: v.devices[i].device, name: v.devices[i].name, feel: st.feel ? feel : '', texts: st.prompts.map((_, k) => texts[k] || '') })) });
        }
        if (st.kind === 'quiz') {
            const upto = st.revealed === st.round ? st.round : st.round - 1;
            const answeredIn = (r) => (r === st.round && st.open ? Math.min(joined, Math.floor((now - st.openedAt) / st.answerMs)) : (st.answered[r] || 0));
            const pickOf = (r, i) => Number(QUIZ[(r - 1) % QUIZ.length][i] || 0);
            const scores = v.devices.map((d, i) => {
                let total = 0, hits = 0, last = 0, right = null;
                for (let r = 1; r <= upto; r++) {
                    if (i >= answeredIn(r) || !st.qs[r]) { continue; }
                    const ok = pickOf(r, i) === st.qs[r].c;
                    if (ok) { total += 1000; hits++; }
                    if (r === st.round) { last = ok ? 1000 : 0; right = ok; }
                }
                return { device: d.device, name: d.name, total, last, right, hits, team: d.team };
            });
            const n = st.round ? answeredIn(st.round) : 0, q = st.qs[st.round];
            Object.assign(v, {
                teams: st.teams, pick: st.pick, mode: st.mode, top: st.top, answered: n,
                revealed: !!st.round && st.revealed === st.round,
                left: st.open && q ? Math.max(0, Math.ceil(q.secs - (now - st.openedAt) / 1000)) : 0,
                counts: st.round && st.revealed === st.round && q ? q.o.map((_, k) => Array.from({ length: n }, (__, i) => pickOf(st.round, i)).filter((x) => x === k).length) : [],
                scores: scores.slice().sort((a, b) => b.total - a.total || b.hits - a.hits),
                teamscores: st.teams.map((name, k) => {
                    const members = scores.filter((x) => x.team === k + 1);
                    return { team: k + 1, name, members: members.length,
                        total: members.length ? Math.round(members.reduce((a, x) => a + x.total, 0) / members.length) : 0 };
                }).sort((a, b) => b.total - a.total),
                summary: Object.keys(st.qs).map(Number).sort((a, b) => a - b).map((r) => {
                    const m = answeredIn(r);
                    return { round: r, q: st.qs[r].q, answered: m, right: Array.from({ length: m }, (_, i) => pickOf(r, i)).filter((x) => x === st.qs[r].c).length };
                }),
            });
        }
        if (st.kind === 'ideas') {
            const list = st.round ? IDEAS[(st.round - 1) % IDEAS.length] : [];
            const n = st.round ? Math.min(joined, list.length, Math.floor((until - st.openedAt) / st.ideaMs)) : 0;
            Object.assign(v, { q: st.q, max: st.max });
            v.ideas = list.slice(0, n).map((text, i) => ({ id: i + 1, device: v.devices[i].device, name: v.devices[i].name, text,
                t: Math.floor((st.openedAt + i * st.ideaMs) / 1000) }));
        }
        return v;
    };
    // The fixed remote: this board and two more classes of the same teacher, an address that changes with «Change the
    // address», and the orders the practice phone (practicephone.js) leaves for the board.
    const rm = { on: false, n: 0, seq: 0, cmds: [], phone: false, tool: '', tools: [] };
    const rmUrl = () => `https://campus.example/local/oksigeniaclasstools/mando.php?k=${['Q7f2Lm9xTa4Rk8Vb3Nc6Wd1Ye5Hj0Pu2', 'Z3pK8sV1nM6qT4rB9wX2cY7fL5hJ0dG3'][rm.n % 2]}`;
    const CLASSES = () => [{ id: 1, name: STR.hp_practice_course || 'Practice class' }, { id: 2, name: STR.hp_practice_other1 || 'Class 3A' },
        { id: 3, name: STR.hp_practice_other2 || 'Class 2C' }];
    const remote = (body) => {
        const action = body.get('action');
        if (action === 'on') { Object.assign(rm, { on: true, seq: 0, cmds: [], phone: false }); }
        if (action === 'off') { rm.on = false; }
        if (action === 'rotate') { rm.n++; rm.phone = false; }
        if (action === 'poll') {
            rm.tool = body.get('tool') || '';
            rm.tools = (body.get('tools') || '').split(';').filter(Boolean).map((x) => x.split('|'));
            return { on: rm.on, seq: rm.seq, cmds: rm.cmds.slice(-10), phone: rm.phone };
        }
        return rm.on ? { on: true, url: rmUrl() } : { on: false };
    };
    const json = (data) => Promise.resolve(new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
    const parse = (s, d) => { try { return JSON.parse(s); } catch (e) { return d; } };
    const host = (body) => {
        const action = body.get('action');
        if (action === 'start') {
            Object.assign(st, { started: Date.now(), kind: body.get('kind') || 'vote', identity: body.get('identity') || 'anon',
                vote: body.get('vote') || 'abcd', round: 0, open: false, q: '', max: Number(body.get('max')) || 1,
                qs: {}, revealed: 0, answered: {}, joined: false, cmds: [], teams: [] });
            if (st.kind === 'quiz' || st.kind === 'buzz') {
                const teams = parse(body.get('teams') || '[]', []);
                Object.assign(st, { teams: Array.isArray(teams) ? teams : [], pick: body.get('pick') === '1',
                    mode: body.get('mode') || 'calm', top: Number(body.get('top')) || 0 });
            }
        } else if (action === 'open') {
            Object.assign(st, { round: st.round + 1, open: true, openedAt: Date.now() });
            if (body.get('vote')) { st.vote = body.get('vote'); }
            if (st.kind === 'ideas') { st.q = (body.get('q') || '').slice(0, 140); st.max = Number(body.get('max')) || st.max; }
            if (st.kind === 'exit') { st.feel = body.get('feel') !== '0'; st.prompts = parse(body.get('prompts') || '[]', []); }
            if (st.kind === 'quiz') {
                st.qs[st.round] = { q: body.get('q') || '', o: parse(body.get('options') || '[]', []), c: Number(body.get('correct')) || 0,
                    secs: Number(body.get('secs')) || 20 };
            }
        } else if (action === 'reopen') {
            // The answers go on arriving where they stopped.
            Object.assign(st, { open: true, openedAt: Date.now() - (st.closedAt - st.openedAt) });
        } else if (action === 'close' || action === 'reveal') {
            if (st.kind === 'quiz' && st.round) {
                st.answered[st.round] = Math.min(DEVICES, Math.floor((Date.now() - st.openedAt) / st.answerMs));
                if (action === 'reveal') { st.revealed = st.round; }
            }
            Object.assign(st, { open: false, closedAt: Date.now() });
        } else if (action === 'end') {
            st.started = 0;
        }
        return view();
    };
    const real = window.fetch.bind(window);
    window.fetch = (url, opts) => {
        const u = String(url);
        const body = new URLSearchParams(opts && opts.body && typeof opts.body !== 'object' ? String(opts.body)
            : (opts && opts.body instanceof URLSearchParams ? opts.body.toString() : ''));
        if (/livehost\.php/.test(u)) { return json(host(body)); }
        if (/remote\.php/.test(u)) { return json(remote(body)); }
        // Words, questions and pictures of the course: none in a practice class.
        if (/(quizbank|glossary)\.php/.test(u)) { return json({ ok: true, questions: [], words: [], items: [] }); }
        // Anything else that would reach Moodle (picks, kept tools…): accepted and forgotten.
        if (/\.php(\?|$)/.test(u)) { return json({ ok: true }); }
        return real(url, opts);
    };
    // For a help, and for the practice phone of a help about the remote: the session as it goes, and the phone's part.
    window.CLASSTOOLS_PRACTICE = {
        state: st,
        remoteView: () => ({ kind: 'remote', code: 'K7Q2', identity: 'moodle', joined: st.joined, ended: !st.started || st.kind !== 'remote' }),
        remoteJoin: () => { if (st.started && st.kind === 'remote') { st.joined = true; } },
        remoteCommand: (cmd) => { if (st.joined) { st.seq++; st.cmds.push({ seq: st.seq, cmd }); } },
        // For the fixed remote's page beside the board, as mandoapi.php would answer it. Going to another class is
        // not done (it would take the practice board to a real course).
        mando: {
            state: () => {
                if (!rm.on) { return { off: true }; }
                rm.phone = true;
                return { boards: [{ course: 1, name: CLASSES()[0].name, tool: rm.tool, tools: rm.tools }] };
            },
            command: (cmd) => {
                if (!rm.on) { return { off: true }; }
                if (!/^course_/.test(cmd)) { rm.seq++; rm.cmds.push({ seq: rm.seq, cmd, course: 1 }); }
                return { ok: true };
            },
            courses: () => ({ courses: CLASSES() }),
        },
    };
})();

// --- Printed cards («Hands up or cards»): printing and reading them, with no printer and no camera ----------------
// From the art direction's practica.js. The practice class already has its cards (printed for its list, 4.º B).
// «Print» shows the sheet over the board instead of the printer's dialog. «Read the cards» gets a camera that sees the
// class with the cards up, drawn here and panning slowly across the room: the board's own reader (scanner.js) reads
// that picture as it would read a real camera, so the outlines, the bars and «Still to read» are the real ones.
(() => {
    if (!/(?:^#|&)practica(?:&|$)/.test(location.hash)) { return; }
    // The list the cards were printed for, in the board's memory (nothing of the practice board is kept).
    addEventListener('load', () => {
        const core = window.ClasstoolsCore;
        if (core && !core.load('tarjetas-lista', '')) { core.save('tarjetas-lista', 'aula-g1'); }
    });

    // --- The print, as a sheet over the board -------------------------------------------------------------------
    const closeSheet = () => {
        const f = document.getElementById('ct-tarjetas-imprimir');
        if (f) { f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'; }
        ['pr-hoja', 'pr-hoja-cerrar'].forEach((id) => { const e = document.getElementById(id); if (e) { e.remove(); } });
    };
    const showSheet = (frame) => {
        closeSheet();
        // A page of the print (two cards, 280 mm) with a white edge, as large as fits.
        const k = Math.min(innerHeight * 0.92 / 1114, innerWidth * 0.9 / 850);
        const back = document.createElement('div');
        back.id = 'pr-hoja';
        back.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(15,31,56,.55)';
        back.addEventListener('click', closeSheet);
        frame.style.cssText = 'position:fixed;left:50%;top:50%;width:850px;height:1114px;border:28px solid #fff;box-sizing:border-box;z-index:2147483001;background:#fff;'
            + `box-shadow:0 12px 40px rgba(0,0,0,.45);transform:translate(-50%,-50%) scale(${k.toFixed(3)});visibility:visible`;
        const x = document.createElement('button');
        x.type = 'button'; x.id = 'pr-hoja-cerrar'; x.className = 'redondo';
        const core = window.ClasstoolsCore;
        x.setAttribute('aria-label', core ? core.t('gen_close') : 'Close');
        x.innerHTML = core ? core.icon('cerrar') : '×';
        x.style.cssText = `position:fixed;z-index:2147483002;left:calc(50% + ${Math.round(425 * k) + 12}px);top:calc(50% - ${Math.round(557 * k)}px)`;
        x.addEventListener('click', closeSheet);
        document.body.append(back, x);
    };
    // cards.js writes the page into a hidden frame and calls its print(): that print shows the sheet instead.
    new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.id === 'ct-tarjetas-imprimir' && n.contentWindow) { n.contentWindow.print = () => showSheet(n); }
    }))).observe(document.documentElement, { childList: true, subtree: true });

    // --- The camera: the class with their cards up ----------------------------------------------------------------
    // The answer of each card (card n is the n-th of the list), after «Two minutes to convince»: mostly C, yellow.
    // «-»: that card is not up (still to read).
    const ANSWERS = 'CBCCAC-CCBCCBC-CACCBC-CB';
    // As printed, A is on top; the card is turned so its answer is: B a quarter anticlockwise, C half, D a quarter clockwise.
    const TURN = { A: 0, B: -Math.PI / 2, C: Math.PI, D: Math.PI / 2 };
    const BANDS = [['A', '#ce1423', '#fff'], ['B', '#164281', '#fff'], ['C', '#fbbe17', '#1c1a19'], ['D', '#067e36', '#fff']];
    const SKINS = ['#f6d3b3', '#eec09a', '#d9a27a', '#b97d57', '#8d5a3b', '#f3c9a6'];
    const HAIRS = ['#2b1d16', '#4a2f22', '#6b4226', '#a0672f', '#d4a253', '#1c1c1c'];
    const SHIRTS = ['#4f86c6', '#e2725b', '#5cae7a', '#9a7bd1', '#e8b04a', '#4bb3bd'];
    // Three rows of eight, the back ones smaller; each row half a seat apart from the one in front.
    const SEATS = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
            SEATS.push({ x: 150 + c * 270 + (r % 2 ? 0 : 135), y: [205, 455, 715][r], s: [168, 190, 214][r], n: r * 8 + c });
        }
    }
    // The picture of the camera (4:3) and the room it pans across.
    const SCENE = 2460, W = 1200, H = 900;
    const drawCard = (g, id, s) => {
        const b = s * 20 / 135, u = (s - 2 * b) / 8, code = window.ClasstoolsScanner ? window.ClasstoolsScanner.CODES[id - 1] : 0;
        g.fillStyle = '#fff'; g.fillRect(-s / 2, -s / 2, s, s);
        // The bands, each with its letter upright when it is on top.
        const band = ([letter, colour, ink], k) => {
            g.save(); g.rotate(k * Math.PI / 2);   // A on top, B right, C bottom, D left
            g.fillStyle = colour; g.fillRect(-s / 2, -s / 2, s, b);
            g.fillStyle = ink; g.font = `900 ${Math.round(b * 0.8)}px Nunito, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(letter, 0, -s / 2 + b / 2 + 1);
            g.restore();
        };
        // The side bands go between the top and bottom ones: drawn first, then the top and bottom over them.
        band(BANDS[1], 1); band(BANDS[3], 3); band(BANDS[0], 0); band(BANDS[2], 2);
        // The mark, in the middle: a black border and its 4 × 4 cells (scanner.js, as printed).
        const o = -s / 2 + b;
        g.fillStyle = '#000'; g.fillRect(o + u, o + u, 6 * u, 6 * u);
        g.fillStyle = '#fff'; g.fillRect(o + 2 * u, o + 2 * u, 4 * u, 4 * u);
        g.fillStyle = '#000';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) { if ((code >> (r * 4 + c)) & 1) { g.fillRect(o + (2 + c) * u, o + (2 + r) * u, u + 0.5, u + 0.5); } }
        }
        g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.strokeRect(-s / 2, -s / 2, s, s);
    };
    const drawClass = (g, t) => {
        // The camera goes over the room as a hand would: still on the left, then the middle, then the right (about
        // five seconds), with a slight shake. Still, so the outlines the board draws stay on their cards.
        const at = [[0, 0], [1500, 0], [2300, 0.5], [3600, 0.5], [4400, 1]];
        let p = 1;
        for (let i = 1; i < at.length; i++) {
            if (t < at[i][0]) { const k = (t - at[i - 1][0]) / (at[i][0] - at[i - 1][0]); p = at[i - 1][1] + (at[i][1] - at[i - 1][1]) * k * k * (3 - 2 * k); break; }
        }
        const pan = (SCENE - W) * p;
        g.fillStyle = '#ece4d6'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#d9cbb3'; g.fillRect(0, H * 0.78, W, H * 0.22);
        g.save();
        g.translate(-pan, Math.sin(t / 420) * 2.5);
        SEATS.forEach(({ x, y, s, n }) => {
            const answer = ANSWERS[n], skin = SKINS[(n * 7) % SKINS.length], hair = HAIRS[(n * 5) % HAIRS.length];
            const up = answer && answer !== '-';
            // The student: shirt, head and hair; the card in front of the face, held by both hands.
            g.fillStyle = SHIRTS[(n * 3) % SHIRTS.length];
            g.beginPath(); g.ellipse(x, y + s * 0.62, s * 0.46, s * 0.4, 0, Math.PI, 0); g.fill();
            const hy = up ? y - s * 0.58 : y + s * 0.05;
            g.fillStyle = hair; g.beginPath(); g.arc(x, hy - s * 0.03, s * 0.25, 0, Math.PI * 2); g.fill();
            g.fillStyle = skin; g.beginPath(); g.arc(x, hy + s * 0.03, s * 0.22, 0, Math.PI * 2); g.fill();
            if (!up) { return; }
            const wobble = 0.07 * Math.sin(n * 2.3) + 0.025 * Math.sin(t / 650 + n);
            g.save(); g.translate(x, y); g.rotate(TURN[answer] + wobble);
            drawCard(g, n + 1, s);
            g.restore();
            g.fillStyle = skin;
            [-1, 1].forEach((side) => { g.beginPath(); g.arc(x + side * s * 0.47, y + s * 0.38, s * 0.09, 0, Math.PI * 2); g.fill(); });
        });
        g.restore();
    };
    const camera = () => {
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d'), t0 = performance.now(), stream = c.captureStream(15);
        const frame = () => {
            if (stream.getVideoTracks().every((tr) => tr.readyState === 'ended')) { return; }
            drawClass(g, performance.now() - t0);
            requestAnimationFrame(frame);
        };
        frame();
        return stream;
    };
    if (!navigator.mediaDevices) { try { Object.defineProperty(navigator, 'mediaDevices', { value: {} }); } catch (e) { /* none */ } }
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia = (want) => (want && want.video ? Promise.resolve(camera())
            : Promise.reject(new DOMException('No camera in the practice class', 'NotAllowedError')));
    }
    window.CLASSTOOLS_PRACTICE = Object.assign(window.CLASSTOOLS_PRACTICE || {}, { cards: { answers: ANSWERS, closeSheet } });
})();
