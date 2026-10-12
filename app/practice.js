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
        remoteurl: null, remote: null, logrosurl: null, logros: null,
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
    const st = { started: 0, kind: 'vote', identity: 'anon', vote: 'abcd', round: 0, open: false, openedAt: 0, closedAt: 0,
        joinMs: QUICK ? 15 : 380, voteMs: 260, q: '', max: 1, ideaMs: 150, feel: true, prompts: [],
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
        if (st.kind === 'exit') {
            Object.assign(v, { feel: st.feel, prompts: st.prompts, tickets: [] });
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
    };
})();
