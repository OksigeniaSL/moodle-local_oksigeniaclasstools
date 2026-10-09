// Score, among the materials: a staff (treble or bass clef, 2/4 to 6/8, a tempo) where notes are written with a tap
// (whole, half, quarter, eighth and sixteenth notes, their rests, dots, sharps and flats) and played with sounds made
// in the browser (piano, glockenspiel, recorder; and a cat and a dog that sing the notes). A glockenspiel under it
// to play along: «Play with me» lights the next note and waits for it; the score's game asks which note it is.
// Traditional songs come with it, those of the teacher's country first and each with where it is from; a teacher's
// own songs are kept in the course and can be brought in as text (a simple format, or ABC), written by hand or with
// the prompt for an AI that it gives. For the youngest: big notes in the colours of the glockenspiel, their names
// under them, the rhythm in syllables (ta, ti-ti) and a little quaver that jumps from note to note.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { t, escape, save, load, play, announce } = core;
    const lang = (document.documentElement.lang || 'en').toLowerCase().replace('-', '_'), base = lang.split('_')[0];

    // --- Notes -----------------------------------------------------------------------------------------------
    // A note: s, its step on the staff (octave × 7 + letter; middle C is 28), a (−1 flat, 1 sharp), t, how long (in
    // sixteenths: 16 whole, 8 half, 4 quarter, 2 eighth, 1 sixteenth; half as much again with a dot) and r, a rest.
    const SOLFA = ['es', 'fr', 'it', 'pt', 'ca', 'gl', 'eu', 'ro'].includes(base);
    // The names of the notes: do re mi, C D E, or C D E … H as in German (where H is our B and B is B flat). Each
    // language has its own, and the teacher can choose another.
    const NAMESETS = { solfa: base === 'fr' ? ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'] : ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'],
        letters: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], german: ['C', 'D', 'E', 'F', 'G', 'A', 'H'] };
    const AUTO = SOLFA ? 'solfa' : (['de', 'nl', 'sv', 'da', 'no', 'fi'].includes(base) ? 'german' : 'letters');
    let naming = AUTO;
    const names = () => NAMESETS[naming];
    const COLOURS = ['#e53935', '#f57c00', '#f9c80e', '#43a047', '#00acc1', '#3949ab', '#8e24aa'];   // as on school glockenspiels
    const SEMI = [0, 2, 4, 5, 7, 9, 11];
    const letter = (s) => ((s % 7) + 7) % 7;
    const midi = (n) => 12 * (Math.floor(n.s / 7) + 1) + SEMI[letter(n.s)] + (n.a || 0);
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const nameOf = (n) => names()[letter(n.s)] + (n.a > 0 ? '♯' : (n.a < 0 ? '♭' : ''));
    const FIGS = [['r', 16], ['b', 8], ['n', 4], ['c', 2], ['s', 1]];
    const LEN = Object.fromEntries(FIGS);
    const SHAPES = new Map([[16, ['r', false]], [8, ['b', false]], [4, ['n', false]], [2, ['c', false]], [1, ['s', false]], [24, ['r', true]], [12, ['b', true]], [6, ['n', true]], [3, ['c', true]]]);
    // A length that is no single figure (from ABC) becomes several notes that are.
    const split = (ticks) => {
        const out = [];
        let left = Math.max(1, Math.round(ticks));
        [24, 16, 12, 8, 6, 4, 3, 2, 1].forEach((v) => { while (left >= v) { out.push(v); left -= v; } });
        return out;
    };
    // The clefs: the step of the bottom line and the range a note can be written in.
    const CLEFS = { sol: { bottom: 30, lo: 25, hi: 42 }, fa: { bottom: 18, lo: 12, hi: 31 } };

    // --- The text format -------------------------------------------------------------------------------------
    // Headers («Título: …», «Clave: sol», «Compás: 3/4», «Tempo: 100», «Anacrusa: n», «Origen: …», «Letra: …») and
    // the notes: names (do re mi or C D E, # sharp, b flat), the octave (do4 is middle C, do5 above; none, the 4th —
    // the 3rd with the bass clef), the length after a colon (r b n c s, or w h q e s, or 1 2 4 8 16; a dot for a dotted
    // note; none, as the note before) and «-» for a rest. «|» and «#» comments are for whoever reads it.
    const HEAD = {
        title: /^(t[ií]tulo|title|titre|titel|titolo|t)$/i, from: /^(origen|procedencia|pa[ií]s|origin|country|origine|herkunft|herkomst|ursprung|o)$/i,
        by: /^(autor|author|auteur|komponist|compositor|compositore|c)$/i, clef: /^(clave|clef|cl[ée]|schl[üu]ssel|chiave|sleutel|nyckel)$/i,
        time: /^(comp[aá]s|time|metre|meter|mesure|takt|misura|maat|m)$/i, tempo: /^(tempo|velocidad|bpm|vitesse|q)$/i,
        pickup: /^(anacrusa|pickup|anacrouse|auftakt|levare|opmaat)$/i, lyrics: /^(letra|lyrics|paroles|text|testo|tekst|w)$/i,
    };
    const NOTE_NAMES = { do: 0, ut: 0, re: 1, ré: 1, mi: 2, fa: 3, sol: 4, so: 4, la: 5, si: 6, ti: 6, c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6, h: 6 };
    const DUR = { r: 16, b: 8, n: 4, c: 2, s: 1, w: 16, h: 8, q: 4, e: 2, 1: 16, 2: 8, 4: 4, 8: 2, 16: 1 };
    const fail = (key, a) => { const e = new Error(t(key, a)); e.mine = true; throw e; };
    const clefOf = (v) => (/^(fa|f|bass|bajo|basse|ba[sß]|baixo|bas)$/i.test(String(v).trim()) ? 'fa' : 'sol');
    const timeOf = (v) => {
        const m = String(v).trim().match(/^(\d)\s*\/\s*(\d)$/);
        if (!m) { return /^c\|?$/i.test(String(v).trim()) ? [4, 4] : null; }
        const n = Number(m[1]), d = Number(m[2]);
        return n >= 2 && n <= 12 && [2, 4, 8].includes(d) ? [n, d] : null;
    };
    const readText = (text) => {
        const song = { title: '', from: '', by: '', clef: 'sol', time: [4, 4], tempo: 100, pickup: 0, notes: [], lyrics: '' };
        const lines = String(text).replace(/\r/g, '').split('\n');
        let last = 4;
        const body = [];
        lines.forEach((raw, i) => {
            const line = raw.replace(/(^|\s)(#|\/\/).*$/, '').trim();
            if (!line) { return; }
            const h = line.match(/^([A-Za-zÁÉÍÓÚáéíóúÜüßñ]+)\s*:\s*(.*)$/);
            const key = h && Object.keys(HEAD).find((k) => HEAD[k].test(h[1]));
            if (key) {
                const v = h[2].trim();
                if (key === 'clef') { song.clef = clefOf(v); } else if (key === 'time') { song.time = timeOf(v) || fail('sc_err_time', v); } else if (key === 'tempo') {
                    const n = Number((v.match(/\d+/) || [])[0]);
                    song.tempo = n >= 30 && n <= 240 ? n : fail('sc_err_tempo', v);
                } else if (key === 'pickup') { song.pickupText = v; } else { song[key] = v.slice(0, key === 'lyrics' ? 2000 : 80); }
                return;
            }
            body.push([line, i + 1]);
        });
        const octave0 = song.clef === 'fa' ? 3 : 4;
        const lengthOf = (d, dot, where) => {
            if (d === undefined || d === '') { return last; }
            const v = DUR[String(d).toLowerCase()];
            if (!v) { fail('sc_err_note', where); }
            return dot ? v * 1.5 : v;
        };
        body.forEach(([line, n]) => line.split(/[\s|]+/).filter(Boolean).forEach((tok) => {
            const where = `${tok} (${n})`;
            const rest = tok.match(/^(-|sil|silencio|z|rest|pausa|silence|pause)(?::([a-z0-9]+)(\.?))?$/i);
            if (rest) { last = lengthOf(rest[2], rest[3], where); song.notes.push({ s: 0, a: 0, t: last, r: true }); return; }
            const m = tok.match(/^(do|ut|re|ré|mi|fa|sol|so|la|si|ti|[a-h])(#|♯|b|♭)?(\d|'+|,+)?(?::([a-z0-9]+)(\.?))?$/i);
            if (!m) { fail('sc_err_note', where); }
            const l = NOTE_NAMES[m[1].toLowerCase()];
            let oct = octave0;
            if (m[3]) { oct = /\d/.test(m[3]) ? Number(m[3]) : octave0 + (m[3][0] === "'" ? m[3].length : -m[3].length); }
            last = lengthOf(m[4], m[5], where);
            song.notes.push({ s: oct * 7 + l, a: m[2] ? (/[#♯]/.test(m[2]) ? 1 : -1) : 0, t: last });
        }));
        if (song.pickupText) {
            const p = song.pickupText.match(/^([a-z0-9]+)(\.?)$/i);
            song.pickup = p && DUR[p[1].toLowerCase()] ? DUR[p[1].toLowerCase()] * (p[2] ? 1.5 : 1) : 0;
            delete song.pickupText;
        }
        if (!song.notes.length) { fail('sc_err_empty'); }
        song.notes.forEach((x) => { if (!SHAPES.has(x.t)) { x.t = split(x.t)[0]; } });
        return song;
    };
    // ABC (abcnotation.com), the part a school piano needs: the headers, the key, notes and rests with their lengths,
    // accidentals, broken rhythms (> <), the first note of chords and repeats; the rest is skipped.
    const KEYS = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6,
        Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, Dm: -1, Gm: -2, Cm: -3, Fm: -4 };
    const SHARPS = [3, 0, 4, 1, 5, 2, 6], FLATS = [6, 2, 5, 1, 4, 0, 3];
    const readAbc = (text) => {
        const song = { title: '', from: '', by: '', clef: 'sol', time: [4, 4], tempo: 100, pickup: 0, notes: [], lyrics: '' };
        let unit = null, key = 0, body = '';
        String(text).replace(/\r/g, '').split('\n').forEach((line) => {
            const h = line.match(/^([A-Za-z]):\s*(.*)$/);
            if (h && 'XTCMLQKOZNSRBPGHIW'.includes(h[1].toUpperCase()) && h[1] !== h[1].toLowerCase()) {
                const v = h[2].trim();
                if (h[1] === 'T' && !song.title) { song.title = v.slice(0, 80); }
                if (h[1] === 'C') { song.by = v.slice(0, 80); }
                if (h[1] === 'O') { song.from = v.slice(0, 80); }
                if (h[1] === 'M') { song.time = timeOf(v) || song.time; }
                if (h[1] === 'L') { const m = v.match(/(\d+)\s*\/\s*(\d+)/); if (m) { unit = (16 * Number(m[1])) / Number(m[2]); } }
                if (h[1] === 'Q') { const m = v.match(/(?:(\d+)\s*\/\s*(\d+)\s*=\s*)?(\d+)/); if (m) { song.tempo = Math.max(30, Math.min(240, Math.round(Number(m[3]) * (m[1] ? (4 * Number(m[1])) / Number(m[2]) : 1)))); } }
                if (h[1] === 'K') {
                    const k = v.match(/^([A-G][#b]?)(m(?:in)?)?/);
                    if (k) { key = KEYS[k[1] + (k[2] ? 'm' : '')] || 0; }
                    if (/clef\s*=\s*bass/i.test(v)) { song.clef = 'fa'; }
                }
                return;
            }
            if (/^%/.test(line) || /^[a-z]:/.test(line)) { return; }
            body += ` ${line}`;
        });
        if (unit === null) { unit = song.time[0] / song.time[1] < 0.75 ? 1 : 2; }
        const sig = Array(7).fill(0);
        (key > 0 ? SHARPS.slice(0, key) : FLATS.slice(0, -key)).forEach((l) => { sig[l] = key > 0 ? 1 : -1; });
        body = body.replace(/"[^"]*"/g, ' ').replace(/![^!]*!/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/\[[A-Za-z]:[^\]]*\]/g, ' ');
        const notes = [];
        let measure = {}, start = 0, i = 0, broken = 0;
        const re = /(\|:|:\||::|\|\]|\[\||\|\||\|[12]?|[<>]+|\[([^\]]*)\]|(\^{1,2}|_{1,2}|=)?([A-Ga-gzx])([,']*)(\d*)(\/*)(\d*))/g;
        let m;
        while ((m = re.exec(body)) !== null) {
            const tok = m[1];
            if (tok[0] === '|' || tok[0] === ':' || tok === '[|') {
                measure = {};
                if (tok.includes(':') && tok !== '|:') { notes.push(...notes.slice(start).map((x) => ({ ...x }))); }
                if (tok === '|:' || tok === '::') { start = notes.length; }
                continue;
            }
            if (tok[0] === '<' || tok[0] === '>') { broken = tok[0] === '>' ? tok.length : -tok.length; continue; }
            let acc = m[3], name = m[4], marks = m[5], num = m[6], slash = m[7], den = m[8];
            if (m[2] !== undefined) {
                const first = m[2].match(/(\^{1,2}|_{1,2}|=)?([A-Ga-g])([,']*)(\d*)(\/*)(\d*)/);
                if (!first) { continue; }
                [, acc, name, marks, num, slash, den] = first;
            }
            let len = unit * (num ? Number(num) : 1);
            if (slash) { len /= den ? Number(den) : Math.pow(2, slash.length); }
            if (broken) {
                const k = 1 - Math.pow(2, -Math.abs(broken));
                const prev = notes[notes.length - 1];
                if (prev) { const d = prev.t * k; prev.t += broken > 0 ? d : -d; len += broken > 0 ? -len * k : len * k; }
                broken = 0;
            }
            if (/[zx]/.test(name)) { notes.push({ s: 0, a: 0, t: len, r: true }); i++; continue; }
            const l = NOTE_NAMES[name.toLowerCase()];
            let oct = name === name.toUpperCase() ? 4 : 5;
            [...(marks || '')].forEach((c) => { oct += c === "'" ? 1 : -1; });
            const s = oct * 7 + l;
            let a = sig[l];
            if (acc) { a = acc[0] === '^' ? acc.length : (acc[0] === '_' ? -acc.length : 0); measure[s] = a; } else if (measure[s] !== undefined) { a = measure[s]; }
            notes.push({ s, a: Math.max(-1, Math.min(1, a)), t: len });
            i++;
        }
        void i;
        notes.forEach((x) => split(x.t).forEach((v) => song.notes.push({ ...x, t: v })));
        if (!song.notes.length) { fail('sc_err_empty'); }
        return song;
    };
    const isAbc = (text) => /^\s*X\s*:/m.test(text) && /^\s*K\s*:/m.test(text);
    const parseSong = (text) => (isAbc(text) ? readAbc(text) : readText(text));
    // And back, to download it (in the names of the language: do re mi or C D E).
    const writeText = (song) => {
        const durs = naming === 'solfa' ? ['r', 'b', 'n', 'c', 's'] : ['w', 'h', 'q', 'e', 's'];
        const lenText = (tk) => { const [f, dot] = SHAPES.get(tk) || ['n', false]; return durs[FIGS.findIndex(([k]) => k === f)] + (dot ? '.' : ''); };
        const head = [[t('sc_h_title'), song.title], [t('sc_h_from'), song.from], [t('sc_h_clef'), song.clef === 'fa' ? 'fa' : 'sol'],
            [t('sc_h_time'), song.time.join('/')], [t('sc_h_tempo'), song.tempo], [t('sc_h_pickup'), song.pickup ? lenText(song.pickup) : ''], [t('sc_h_lyrics'), song.lyrics]];
        const per = (song.time[0] * 16) / song.time[1];
        let inBar = song.pickup ? per - song.pickup : 0, prev = 0;
        const words = song.notes.map((n) => {
            let w = n.r ? '-' : names()[letter(n.s)].toLowerCase().replace('é', 'e') + (n.a > 0 ? '#' : (n.a < 0 ? 'b' : '')) + (Math.floor(n.s / 7) === (song.clef === 'fa' ? 3 : 4) ? '' : Math.floor(n.s / 7));
            if (n.t !== prev) { w += ':' + lenText(n.t); prev = n.t; }
            inBar += n.t;
            if (inBar >= per) { inBar = 0; w += ' |'; }
            return w;
        });
        return head.filter(([, v]) => v !== '' && v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n' + words.join(' ').replace(/\s*\|\s*$/, ' |') + '\n';
    };

    // --- The songs that come with it ---------------------------------------------------------------------------
    // Traditional or old enough to be everybody's. Those sung in many languages carry the title of each.
    const SONGS = [
        { id: 'estrellita', from: 'FR', titles: { es: 'Estrellita, ¿dónde estás?', en: 'Twinkle, Twinkle, Little Star', fr: 'Ah ! vous dirai-je, maman', de: 'Funkel, funkel, kleiner Stern', it: 'Brilla brilla la stellina', nl: 'Twinkel, twinkel, kleine ster', pt: 'Brilha, brilha, estrelinha', sv: 'Blinka lilla stjärna' },
            text: 'Compás: 4/4\nTempo: 100\ndo:n do sol sol | la la sol:b | fa:n fa mi mi | re re do:b | sol:n sol fa fa | mi mi re:b | sol:n sol fa fa | mi mi re:b | do:n do sol sol | la la sol:b | fa:n fa mi mi | re re do:r' },
        { id: 'martinillo', from: 'FR', titles: { es: 'Martinillo', en: 'Are You Sleeping, Brother John?', fr: 'Frère Jacques', de: 'Bruder Jakob', it: 'Fra Martino', nl: 'Vader Jacob', pt: 'Frei João', sv: 'Broder Jakob' },
            text: 'Compás: 4/4\nTempo: 112\ndo:n re mi do | do re mi do | mi fa sol:b | mi:n fa sol:b | sol:c la sol fa mi:n do | sol:c la sol fa mi:n do | do sol3 do:b | do:n sol3 do:b' },
        { id: 'clair', from: 'FR', titles: { fr: 'Au clair de la lune', es: 'Au clair de la lune' },
            text: 'Compás: 4/4\nTempo: 100\ndo:n do do re | mi:b re | do:n mi re re | do:r | do:n do do re | mi:b re | do:n mi re re | do:r | re:n re re re | la3:b la3 | re:n do si3 la3 | sol3:r | do:n do do re | mi:b re | do:n mi re re | do:r' },
        { id: 'alegria', from: 'DE', by: 'Beethoven', titles: { es: 'Himno de la alegría', en: 'Ode to Joy', fr: 'Ode à la joie', de: 'Ode an die Freude', it: 'Inno alla gioia', nl: 'Ode aan de vreugde', pt: 'Hino à alegria', sv: 'Ode till glädjen' },
            text: 'Compás: 4/4\nTempo: 104\nmi:n mi fa sol | sol fa mi re | do do re mi | mi:n. re:c re:b | mi:n mi fa sol | sol fa mi re | do do re mi | re:n. do:c do:b' },
        { id: 'entchen', from: 'DE', titles: { de: 'Alle meine Entchen', es: 'Alle meine Entchen' },
            text: 'Compás: 4/4\nTempo: 108\ndo:n re mi fa | sol:b sol | la:n la la la | sol:r | la:n la la la | sol:r | fa:n fa fa fa | mi:b mi | re:n re re re | do:r' },
        { id: 'haenschen', from: 'DE', titles: { de: 'Hänschen klein', es: 'Hänschen klein' },
            text: 'Compás: 4/4\nTempo: 112\nsol:n mi mi:b | fa:n re re:b | do:n re mi fa | sol sol sol:b | sol:n mi mi:b | fa:n re re:b | do:n mi sol sol | do:r | re:n re re re | re mi fa:b | mi:n mi mi mi | mi fa sol:b | sol:n mi mi:b | fa:n re re:b | do:n mi sol sol | do:r' },
        { id: 'noche', from: 'AT', by: 'Gruber', titles: { es: 'Noche de paz', en: 'Silent Night', fr: 'Douce nuit', de: 'Stille Nacht', it: 'Astro del ciel', nl: 'Stille nacht', pt: 'Noite feliz', sv: 'Stilla natt' },
            text: 'Compás: 3/4\nTempo: 72\nsol:n. la:c sol:n | mi:b. | sol:n. la:c sol:n | mi:b. | re5:b re5:n | si:b. | do5:b do5:n | sol:b. | la:b la:n | do5:n. si:c la:n | sol:n. la:c sol:n | mi:b. | la:b la:n | do5:n. si:c la:n | sol:n. la:c sol:n | mi:b. | re5:b re5:n | fa5:n. re5:c si:n | do5:b. | mi5:b. | do5:n sol mi | sol:n. fa:c re:n | do:b.' },
        { id: 'mary', from: 'US', titles: { en: 'Mary Had a Little Lamb', es: 'Mary Had a Little Lamb' },
            text: 'Compás: 4/4\nTempo: 112\nmi:n re do re | mi mi mi:b | re:n re re:b | mi:n sol sol:b | mi:n re do re | mi mi mi mi | re re mi re | do:r' },
        { id: 'macdonald', from: 'US', titles: { en: 'Old MacDonald Had a Farm', es: 'Old MacDonald Had a Farm' },
            text: 'Compás: 4/4\nTempo: 120\ndo:n do do sol3 | la3 la3 sol3:b | mi:n mi re re | do:b. sol3:n | do do do sol3 | la3 la3 sol3:b | mi:n mi re re | do:r' },
        { id: 'jingle', from: 'US', by: 'J. Pierpont', titles: { en: 'Jingle Bells', es: 'Cascabel', fr: 'Vive le vent', pt: 'Bate o sino', de: 'Jingle Bells', it: 'Jingle Bells' },
            text: 'Compás: 4/4\nTempo: 132\nmi:n mi mi:b | mi:n mi mi:b | mi:n sol do:n. re:c | mi:r | fa:n fa fa:n. fa:c | fa:n mi mi mi:c mi | mi:n re re mi | re:b sol | mi:n mi mi:b | mi:n mi mi:b | mi:n sol do:n. re:c | mi:r | fa:n fa fa fa | fa mi mi mi:c mi | sol:n sol fa re | do:r' },
        { id: 'cumple', from: 'US', titles: { es: 'Cumpleaños feliz', en: 'Happy Birthday to You', fr: 'Joyeux anniversaire', de: 'Zum Geburtstag viel Glück', it: 'Tanti auguri a te', pt: 'Parabéns a você', nl: 'Happy Birthday', sv: 'Happy Birthday' },
            text: 'Compás: 3/4\nTempo: 100\nAnacrusa: n\nsol3:c. sol3:s | la3:n sol3 do | si3:b sol3:c. sol3:s | la3:n sol3 re | do:b sol3:c. sol3:s | sol:n mi do | si3 la3 fa:c. fa:s | mi:n do re | do:b.' },
    ];
    // The country (or countries) of the teacher's language, whose songs go first.
    const HOME = { es: ['ES'], es_mx: ['MX'], en: ['GB', 'US'], fr: ['FR'], de: ['DE', 'AT', 'CH'], it: ['IT'], nl: ['NL', 'BE'], pt_br: ['BR'], pt: ['PT', 'BR'], sv: ['SE'], ca: ['ES'] };
    const home = HOME[lang] || HOME[base] || [];
    let regions = null;
    try { regions = new Intl.DisplayNames([lang.replace('_', '-'), 'en'], { type: 'region' }); } catch (err) { regions = null; }
    const placeName = (code) => (/^[A-Z]{2}$/.test(code) && regions ? regions.of(code) : code);
    const titleOf = (x) => (x.titles ? (x.titles[lang] || x.titles[base] || x.titles.en || Object.values(x.titles)[0]) : x.title) || t('sc_untitled');
    const builtIn = SONGS.map((x) => Object.assign(readText(x.text), { id: 'p:' + x.id, title: titleOf(x), from: x.from, by: x.by || '', mine: false }));

    // --- What is kept --------------------------------------------------------------------------------------
    const KEY = 'partituras' + (core.moodle ? ':' + core.moodle.courseid : '');
    let kept = load(KEY, null);
    const fromMoodle = core.kept('scores');
    if (fromMoodle && Array.isArray(fromMoodle.songs) && (fromMoodle.updated || 0) > ((kept && kept.updated) || 0)) { kept = fromMoodle; }
    const clean = (x) => ({ id: String(x.id || ''), title: String(x.title || '').slice(0, 80), from: String(x.from || '').slice(0, 80), by: String(x.by || '').slice(0, 80),
        clef: x.clef === 'fa' ? 'fa' : 'sol', time: timeOf((x.time || [4, 4]).join('/')) || [4, 4], tempo: Math.max(30, Math.min(240, Number(x.tempo) || 100)),
        pickup: SHAPES.has(Number(x.pickup)) ? Number(x.pickup) : 0, lyrics: String(x.lyrics || '').slice(0, 2000), mine: true,
        notes: (Array.isArray(x.notes) ? x.notes : []).slice(0, 600).filter((n) => n && SHAPES.has(Number(n.t))).map((n) => ({ s: Math.round(Number(n.s)) || 28, a: Math.max(-1, Math.min(1, Math.round(Number(n.a) || 0))), t: Number(n.t), r: !!n.r })) });
    const mine = (kept && Array.isArray(kept.songs) ? kept.songs : []).slice(0, 60).map(clean).filter((x) => x.id);
    const opt = Object.assign({ current: builtIn[0].id, voice: 'piano', names: null, colours: null, rhythm: false, metro: false, lyrics: true, naming: 'auto' }, load('partitura-opciones', {}));
    naming = NAMESETS[opt.naming] ? opt.naming : AUTO;
    const persist = () => {
        const data = { updated: Date.now(), songs: mine };
        save(KEY, data);
        if (JSON.stringify(data).length < 190000) { core.keep('scores', data); }
    };
    const keepOpt = () => save('partitura-opciones', opt);
    const all = () => mine.concat(builtIn);
    let song = all().find((x) => x.id === opt.current) || builtIn[0];
    const level = () => (core.mode ? core.mode() : 'primary');
    const young = () => ['early', 'primary'].includes(level());
    const showNames = () => (opt.names === null ? young() : opt.names);
    const showColours = () => (opt.colours === null ? young() : opt.colours);

    // --- Sounds --------------------------------------------------------------------------------------------
    let noise = null, bus = null;   // bus: where a song that is playing goes, so «Stop» silences what was already set
    const ac = () => (core.audioContext ? core.audioContext() : null);
    const dest = () => bus || (core.output && core.output()) || ac().destination;
    const env = (a, g, at, peak, hold, fall) => { g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + 0.01); g.gain.setTargetAtTime(0.0001, at + hold, fall); };
    const osc = (a, type, f, at, end, out, gain = 1) => {
        const o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.setValueAtTime(f, at); g.gain.value = gain;
        o.connect(g); g.connect(out); o.start(at); o.stop(end);
        return o;
    };
    const VOICES = {
        piano: (a, f, at, d) => {
            const g = a.createGain(); g.connect(dest()); env(a, g, at, 0.5, 0.05, Math.max(0.25, d * 0.6));
            [[1, 'triangle', 0.7], [2, 'sine', 0.25], [3, 'sine', 0.12], [4, 'sine', 0.05]].forEach(([k, type, v]) => osc(a, type, f * k, at, at + d + 1.5, g, v));
        },
        bells: (a, f, at, d) => {
            const g = a.createGain(); g.connect(dest()); env(a, g, at, 0.45, 0.02, 0.45 + d * 0.2);
            [[1, 1], [2.76, 0.32], [5.4, 0.12]].forEach(([k, v]) => osc(a, 'sine', f * 2 * k, at, at + d + 2, g, v));
        },
        flute: (a, f, at, d) => {
            const g = a.createGain(); g.connect(dest());
            g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.32, at + 0.06); g.gain.setValueAtTime(0.32, at + Math.max(0.07, d * 0.9)); g.gain.exponentialRampToValueAtTime(0.0001, at + d + 0.08);
            const o = osc(a, 'sine', f * 2, at, at + d + 0.1, g, 1); osc(a, 'sine', f * 4, at, at + d + 0.1, g, 0.08);
            const lfo = a.createOscillator(), depth = a.createGain(); lfo.frequency.value = 5; depth.gain.value = f * 0.012;
            lfo.connect(depth); depth.connect(o.frequency); lfo.start(at + 0.2); lfo.stop(at + d + 0.1);
            if (noise) { const n = a.createBufferSource(), bp = a.createBiquadFilter(), ng = a.createGain(); n.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 2; ng.gain.value = 0.05; n.connect(bp); bp.connect(ng); ng.connect(g); n.start(at); n.stop(at + d + 0.1); }
        },
        // A marimba: a round note that fades soon, with a quick bright overtone at the start.
        marimba: (a, f, at) => {
            const len = 0.9, g = a.createGain(), g2 = a.createGain();
            g.connect(dest()); g2.connect(dest());
            g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.55, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
            g2.gain.setValueAtTime(0.0001, at); g2.gain.exponentialRampToValueAtTime(0.16, at + 0.004); g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
            osc(a, 'sine', f, at, at + len + 0.05, g, 1);
            osc(a, 'sine', f * 4, at, at + 0.22, g2, 1);
        },
    };
    const tick = (a, at, strong) => { const g = a.createGain(); g.connect(dest()); env(a, g, at, strong ? 0.35 : 0.2, 0.005, 0.02); osc(a, 'square', strong ? 1800 : 1200, at, at + 0.06, g, 1); };
    const clap = (a, at) => {
        if (!noise) { return; }
        const n = a.createBufferSource(), hp = a.createBiquadFilter(), g = a.createGain();
        n.buffer = noise; hp.type = 'highpass'; hp.frequency.value = 1200; n.connect(hp); hp.connect(g); g.connect(dest());
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.5, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
        n.start(at); n.stop(at + 0.15);
    };
    const ready = () => {
        const a = ac();
        if (!a) { return null; }
        if (!noise) {
            noise = a.createBuffer(1, a.sampleRate, a.sampleRate);
            const d = noise.getChannelData(0);
            for (let i = 0; i < d.length; i++) { d[i] = Math.random() * 2 - 1; }
        }
        return a;
    };
    const sound = (n, at, dur) => {
        const a = ready();
        if (!a || n.r) { return; }
        try { VOICES[opt.voice] ? VOICES[opt.voice](a, hz(midi(n)), at === undefined ? a.currentTime : at, dur || 0.5) : VOICES.piano(a, hz(midi(n)), at || a.currentTime, dur || 0.5); } catch (err) { /* no sound */ }
    };

    // --- The screen ----------------------------------------------------------------------------------------
    const VOICE_KEYS = ['piano', 'bells', 'flute', 'marimba'];
    if (!VOICE_KEYS.includes(opt.voice)) { opt.voice = 'piano'; }   // the cat and the dog are gone
    const panel = core.material.add('score', t('mt_score'), `
        <aside class="tarjeta ct-side ct-sc-side">
            <label class="campo apilado"><span>${escape(t('sc_song'))}</span><select id="sc-song"></select></label>
            <p class="nota" id="sc-origin"></p>
            <div class="ct-row">
                <button type="button" class="boton suave" id="sc-new"><span data-icono="nueva"></span><span>${escape(t('sc_new'))}</span></button>
                <button type="button" class="boton suave" id="sc-import"><span data-icono="descargar"></span><span>${escape(t('sc_import'))}</span></button>
            </div>
            <div class="ct-row">
                <button type="button" class="boton rojo-suave" id="sc-delete" hidden><span data-icono="borrar"></span><span>${escape(t('sc_delete'))}</span></button>
                <button type="button" class="boton suave" id="sc-export"><span data-icono="guardar"></span><span>${escape(t('sc_export'))}</span></button>
            </div>
            <div class="ct-sc-ajustes">
                <label class="campo"><span>${escape(t('sc_clef'))}</span><select id="sc-clef"><option value="sol">${escape(t('sc_clef_sol'))}</option><option value="fa">${escape(t('sc_clef_fa'))}</option></select></label>
                <label class="campo"><span>${escape(t('sc_time'))}</span><select id="sc-time">${['2/4', '3/4', '4/4', '6/8'].map((v) => `<option value="${v}">${v}</option>`).join('')}</select></label>
                <label class="campo apilado"><span>${escape(t('sc_tempo'))} <output id="sc-tempo-v"></output></span><input type="range" id="sc-tempo" min="40" max="200" step="4"></label>
                <label class="campo"><span>${escape(t('sc_voice'))}</span><select id="sc-voice">${VOICE_KEYS.map((k) => `<option value="${k}">${escape(t('sc_v_' + k))}</option>`).join('')}</select></label>
                <label class="interruptor"><input type="checkbox" id="sc-names"><span>${escape(t('sc_names'))}</span></label>
                <label class="campo"><span>${escape(t('sc_naming'))}</span><select id="sc-naming">
                    <option value="auto">${escape(t('sc_naming_auto', NAMESETS[AUTO].slice(0, 3).join(' ')))}</option>
                    ${['solfa', 'letters', 'german'].map((k) => `<option value="${k}">${escape(t('sc_naming_' + k))}</option>`).join('')}</select></label>
                <label class="interruptor"><input type="checkbox" id="sc-colours"><span>${escape(t('sc_colours'))}</span></label>
                <label class="interruptor"><input type="checkbox" id="sc-rhythm"><span>${escape(t('sc_rhythm'))}</span></label>
                <label class="interruptor" id="sc-lyrics-box"><input type="checkbox" id="sc-lyrics"><span>${escape(t('sc_lyrics'))}</span></label>
                <label class="interruptor"><input type="checkbox" id="sc-metro"><span>${escape(t('sc_metro'))}</span></label>
            </div>
        </aside>
        <div class="tarjeta ct-stage ct-sc">
            <div class="ct-sc-barra">
                <div class="segmentos" role="radiogroup" aria-label="${escape(t('sc_mode'))}" id="sc-mode">
                    <button type="button" role="radio" data-v="write">${escape(t('sc_write'))}</button>
                    <button type="button" role="radio" data-v="play">${escape(t('sc_playalong'))}</button>
                    <button type="button" role="radio" data-v="game">${escape(t('sc_game'))}</button>
                </div>
                <div class="segmentos ct-sc-figuras" role="radiogroup" aria-label="${escape(t('sc_figure'))}" id="sc-figs"></div>
                <span class="ct-sc-mas" id="sc-more"></span>
                <span class="ct-push"></span>
                <button type="button" class="boton suave" id="sc-turn" hidden><span data-icono="quien"></span><span>${escape(t('turn_button'))}</span></button>
                <button type="button" class="boton verde" id="sc-play"><span data-icono="empezar"></span><span>${escape(t('sc_listen'))}</span></button>
            </div>
            <p class="ct-sc-aviso" id="sc-msg" aria-live="polite"></p>
            <div class="ct-sc-hoja" id="sc-sheet"></div>
            <div class="ct-sc-carillon" id="sc-keys"></div>
        </div>`, () => { paint(); });
    const $ = (s) => panel.querySelector(s);
    let mode = 'write', fig = 'n', rest = false, dot = false, sel = -1, cursor = -1, playing = null, next = 0, quiz = null;
    const undo = [];

    // --- Drawing it ------------------------------------------------------------------------------------------
    const GCLEF = 'm12.049 3.5296c0.305 3.1263-2.019 5.6563-4.0772 7.7014-0.9349 0.897-0.155 0.148-0.6437 0.594-0.1022-0.479-0.2986-1.731-0.2802-2.11 0.1304-2.6939 2.3198-6.5875 4.2381-8.0236 0.309 0.5767 0.563 0.6231 0.763 1.8382zm0.651 16.142c-1.232-0.906-2.85-1.144-4.3336-0.885-0.1913-1.255-0.3827-2.51-0.574-3.764 2.3506-2.329 4.9066-5.0322 5.0406-8.5394 0.059-2.232-0.276-4.6714-1.678-6.4836-1.7004 0.12823-2.8995 2.156-3.8019 3.4165-1.4889 2.6705-1.1414 5.9169-0.57 8.7965-0.8094 0.952-1.9296 1.743-2.7274 2.734-2.3561 2.308-4.4085 5.43-4.0046 8.878 0.18332 3.334 2.5894 6.434 5.8702 7.227 1.2457 0.315 2.5639 0.346 3.8241 0.099 0.2199 2.25 1.0266 4.629 0.0925 6.813-0.7007 1.598-2.7875 3.004-4.3325 2.192-0.5994-0.316-0.1137-0.051-0.478-0.252 1.0698-0.257 1.9996-1.036 2.26-1.565 0.8378-1.464-0.3998-3.639-2.1554-3.358-2.262 0.046-3.1904 3.14-1.7356 4.685 1.3468 1.52 3.833 1.312 5.4301 0.318 1.8125-1.18 2.0395-3.544 1.8325-5.562-0.07-0.678-0.403-2.67-0.444-3.387 0.697-0.249 0.209-0.059 1.193-0.449 2.66-1.053 4.357-4.259 3.594-7.122-0.318-1.469-1.044-2.914-2.302-3.792zm0.561 5.757c0.214 1.991-1.053 4.321-3.079 4.96-0.136-0.795-0.172-1.011-0.2626-1.475-0.4822-2.46-0.744-4.987-1.116-7.481 1.6246-0.168 3.4576 0.543 4.0226 2.184 0.244 0.577 0.343 1.197 0.435 1.812zm-5.1486 5.196c-2.5441 0.141-4.9995-1.595-5.6343-4.081-0.749-2.153-0.5283-4.63 0.8207-6.504 1.1151-1.702 2.6065-3.105 4.0286-4.543 0.183 1.127 0.366 2.254 0.549 3.382-2.9906 0.782-5.0046 4.725-3.215 7.451 0.5324 0.764 1.9765 2.223 2.7655 1.634-1.102-0.683-2.0033-1.859-1.8095-3.227-0.0821-1.282 1.3699-2.911 2.6513-3.198 0.4384 2.869 0.9413 6.073 1.3797 8.943-0.5054 0.1-1.0211 0.143-1.536 0.143z';
    const SYLL = { 16: 'ta-a-a-a', 12: 'ta-a-a', 8: 'ta-a', 6: 'ta-a', 4: 'ta', 3: 'ti', 2: 'ti', 1: 'ti' };
    let geo = null;   // where each note is, to find it with a tap
    const f1 = (n) => n.toFixed(1);
    function render() {
        const sheet = $('#sc-sheet');
        const width = Math.max(320, sheet.clientWidth - 8);
        const g = young() ? 15 : 12;   // the room between two lines
        const per = (song.time[0] * 16) / song.time[1], beat = song.time[1] === 8 && song.time[0] % 3 === 0 ? 6 : 16 / song.time[1];
        const clef = CLEFS[song.clef], names = showNames() && mode !== 'game', colours = showColours() && mode !== 'game', syll = opt.rhythm && mode !== 'game';
        const words = opt.lyrics && song.lyrics ? song.lyrics.split(/\s+|(?<=-)/).filter(Boolean) : [];
        const extra = (names ? 1.9 : 0) + (syll ? 1.9 : 0) + (words.length ? 1.9 : 0);
        const H = g * (11.2 + extra), clefW = g * 3.4, timeW = g * 2.6, left = g * 0.8, right = g * 1.2;
        const wOf = (n) => g * (2.3 + 1.15 * Math.log2(n.t)) + (n.a ? g * 1.1 : 0) + (SHAPES.get(n.t)[1] ? g * 0.7 : 0);
        // Notes in rows: a new row when the next does not fit; bar lines where each bar is full.
        const rows = [[]];
        const bars = [[]];
        let x = left + clefW + timeW, inBar = song.pickup ? per - song.pickup : 0;
        const items = song.notes.map((n, i) => {
            const w = wOf(n);
            if (x + w > width - right && rows[rows.length - 1].length) { rows.push([]); bars.push([]); x = left + clefW; }
            const item = { i, n, x: x + w * 0.42, w, row: rows.length - 1, at: inBar };
            rows[rows.length - 1].push(item);
            x += w; inBar += n.t;
            if (inBar >= per - 0.01 && i < song.notes.length - 1) { bars[bars.length - 1].push(x + g * 0.3); x += g * 1.2; inBar = 0; }
            return item;
        });
        let wi = 0;
        items.forEach((it) => { if (!it.n.r && words[wi] !== undefined) { it.word = words[wi]; } if (!it.n.r) { wi++; } });
        const out = [];
        const yOf = (row, s) => row * H + g * 5 + 4 * g - (s - clef.bottom) * (g / 2);
        // The line of the names (and the syllables and the lyrics under it): below the lowest note of each row.
        const under = rows.map((row, r) => Math.max(r * H + g * 10.6, ...row.filter((it) => !it.n.r).map((it) => yOf(r, it.n.s) + g * 1.9)));
        rows.forEach((row, r) => {
            const top = r * H + g * 5;
            for (let k = 0; k < 5; k++) { out.push(`<line class="sc-linea" x1="${left}" x2="${width - right}" y1="${f1(top + k * g)}" y2="${f1(top + k * g)}"/>`); }
            if (song.clef === 'sol') {
                out.push(`<path class="sc-clave" d="${GCLEF}" transform="translate(${f1(left + g * 0.2)} ${f1(top - g * 1.65)}) scale(${(g * 7.3 / 40.77).toFixed(4)})"/>`);
            } else {
                const fx = left + g * 0.4, fy = top + g;
                out.push(`<circle class="sc-clave" cx="${f1(fx + g * 0.45)}" cy="${f1(fy)}" r="${f1(g * 0.42)}"/><path class="sc-clave-trazo" style="stroke-width:${f1(g * 0.38)}" d="M${f1(fx + g * 0.3)} ${f1(fy)} C${f1(fx + g * 0.3)} ${f1(fy - g * 1.3)} ${f1(fx + g * 2.6)} ${f1(fy - g * 1.3)} ${f1(fx + g * 2.6)} ${f1(fy + g * 0.4)} C${f1(fx + g * 2.6)} ${f1(fy + g * 1.7)} ${f1(fx + g * 1.5)} ${f1(fy + g * 2.6)} ${f1(fx)} ${f1(fy + g * 3.1)}"/><circle class="sc-clave" cx="${f1(fx + g * 3.1)}" cy="${f1(fy - g * 0.5)}" r="${f1(g * 0.22)}"/><circle class="sc-clave" cx="${f1(fx + g * 3.1)}" cy="${f1(fy + g * 0.5)}" r="${f1(g * 0.22)}"/>`);
            }
            if (r === 0) {
                const tx = left + clefW + g * 0.9;
                out.push(`<text class="sc-compas" x="${f1(tx)}" y="${f1(top + g * 1.75)}" font-size="${f1(g * 2.3)}">${song.time[0]}</text><text class="sc-compas" x="${f1(tx)}" y="${f1(top + g * 3.75)}" font-size="${f1(g * 2.3)}">${song.time[1]}</text>`);
            }
            bars[r].forEach((bx) => out.push(`<line class="sc-barra" x1="${f1(bx)}" x2="${f1(bx)}" y1="${f1(top)}" y2="${f1(top + 4 * g)}"/>`));
            if (r === rows.length - 1 && row.length) {
                const ex = row[row.length - 1].x + row[row.length - 1].w * 0.58 + g * 0.6;
                out.push(`<line class="sc-barra" x1="${f1(ex)}" x2="${f1(ex)}" y1="${f1(top)}" y2="${f1(top + 4 * g)}"/><rect class="sc-fin" x="${f1(ex + g * 0.35)}" y="${f1(top)}" width="${f1(g * 0.45)}" height="${f1(4 * g)}"/>`);
            }
        });
        // Beams: quavers and semiquavers together inside one beat.
        const groups = [];
        let cur = [];
        const close = () => { if (cur.length > 1) { groups.push(cur); } cur = []; };
        items.forEach((it) => {
            const beamable = !it.n.r && it.n.t <= 3;
            if (!beamable) { close(); return; }
            if (cur.length && (cur[0].row !== it.row || Math.floor(cur[0].at / beat) !== Math.floor(it.at / beat))) { close(); }
            cur.push(it);
        });
        close();
        const inGroup = new Map();
        groups.forEach((gr) => gr.forEach((it) => inGroup.set(it, gr)));
        const middle = clef.bottom + 4;
        const stemUp = (it) => { const gr = inGroup.get(it); const ss = gr ? gr.map((x) => x.n.s) : [it.n.s]; return ss.reduce((a, b) => a + b, 0) / ss.length < middle; };
        const playingAt = playing ? playing.index : -1;
        const target = mode === 'play' ? next : (mode === 'game' && quiz ? -2 : -1);
        items.forEach((it) => {
            const n = it.n, top = it.row * H + g * 5, cx = it.x;
            const [f, dotted] = SHAPES.get(n.t);
            const on = it.i === playingAt || it.i === target;
            const cls = `sc-nota${it.i === sel ? ' elegida' : ''}${on ? ' sonando' : ''}`;
            if (it.i === sel) { out.push(`<rect class="sc-sel" x="${f1(cx - it.w * 0.42)}" y="${f1(top - g * 3)}" width="${f1(it.w)}" height="${f1(g * 10)}" rx="${f1(g * 0.5)}"/>`); }
            if (n.r) {
                const y = top;
                if (f === 'r') { out.push(`<rect class="sc-tinta" x="${f1(cx - g * 0.6)}" y="${f1(y + g)}" width="${f1(g * 1.2)}" height="${f1(g * 0.5)}"/>`); }
                if (f === 'b') { out.push(`<rect class="sc-tinta" x="${f1(cx - g * 0.6)}" y="${f1(y + g * 1.5)}" width="${f1(g * 1.2)}" height="${f1(g * 0.5)}"/>`); }
                if (f === 'n') { out.push(`<path class="sc-trazo" style="stroke-width:${f1(g * 0.34)}" d="M${f1(cx - g * 0.15)} ${f1(y + g * 0.55)} L${f1(cx + g * 0.45)} ${f1(y + g * 1.45)} L${f1(cx - g * 0.25)} ${f1(y + g * 2.25)} L${f1(cx + g * 0.45)} ${f1(y + g * 3.0)} Q${f1(cx - g * 0.6)} ${f1(y + g * 2.65)} ${f1(cx)} ${f1(y + g * 3.75)}"/>`); }
                if (f === 'c' || f === 's') {
                    [0, 1].slice(0, f === 's' ? 2 : 1).forEach((k) => out.push(`<circle class="sc-tinta" cx="${f1(cx - g * 0.3 - k * g * 0.25)}" cy="${f1(y + g * 1.5 + k * g)}" r="${f1(g * 0.26)}"/>`));
                    out.push(`<path class="sc-trazo" style="stroke-width:${f1(g * 0.16)}" d="M${f1(cx - g * 0.2)} ${f1(y + g * 1.65)} Q${f1(cx + g * 0.2)} ${f1(y + g * 1.6)} ${f1(cx + g * 0.5)} ${f1(y + g * 1.3)} L${f1(cx - g * 0.05)} ${f1(y + g * (f === 's' ? 3.8 : 3.2))}"/>`);
                }
                if (dotted) { out.push(`<circle class="sc-tinta" cx="${f1(cx + g * 0.9)}" cy="${f1(y + g * 1.5)}" r="${f1(g * 0.17)}"/>`); }
                if (syll) { out.push(`<text class="sc-silaba" x="${f1(cx)}" y="${f1(under[it.row] + (names ? g * 1.9 : 0))}">sh</text>`); }
                return;
            }
            const cy = yOf(it.row, n.s);
            // Ledger lines, above and below.
            for (let s = clef.bottom - 2; s >= n.s; s -= 2) { const y = yOf(it.row, s); out.push(`<line class="sc-linea" x1="${f1(cx - g * 1.05)}" x2="${f1(cx + g * 1.05)}" y1="${f1(y)}" y2="${f1(y)}"/>`); }
            for (let s = clef.bottom + 10; s <= n.s; s += 2) { const y = yOf(it.row, s); out.push(`<line class="sc-linea" x1="${f1(cx - g * 1.05)}" x2="${f1(cx + g * 1.05)}" y1="${f1(y)}" y2="${f1(y)}"/>`); }
            const fill = colours ? COLOURS[letter(n.s)] : '';
            const head = f === 'r' || f === 'b';
            out.push(`<g class="${cls}" data-i="${it.i}">`);
            if (n.a > 0) {
                const ax = cx - g * 1.6;
                out.push(`<path class="sc-trazo" style="stroke-width:${f1(g * 0.12)}" d="M${f1(ax - g * 0.2)} ${f1(cy - g * 1.1)} V${f1(cy + g * 1.2)} M${f1(ax + g * 0.2)} ${f1(cy - g * 1.2)} V${f1(cy + g * 1.1)}"/><path class="sc-trazo" style="stroke-width:${f1(g * 0.3)}" d="M${f1(ax - g * 0.45)} ${f1(cy - g * 0.25)} L${f1(ax + g * 0.45)} ${f1(cy - g * 0.5)} M${f1(ax - g * 0.45)} ${f1(cy + g * 0.5)} L${f1(ax + g * 0.45)} ${f1(cy + g * 0.25)}"/>`);
            } else if (n.a < 0) {
                const ax = cx - g * 1.6;
                out.push(`<path class="sc-trazo" style="stroke-width:${f1(g * 0.13)}" d="M${f1(ax - g * 0.3)} ${f1(cy - g * 1.7)} V${f1(cy + g * 0.5)} C${f1(ax + g * 0.6)} ${f1(cy)} ${f1(ax + g * 0.6)} ${f1(cy - g * 0.75)} ${f1(ax - g * 0.3)} ${f1(cy - g * 0.25)}"/>`);
            }
            if (f === 'r') {
                out.push(`<ellipse class="sc-cabeza hueca" cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(g * 0.72)}" ry="${f1(g * 0.48)}" style="stroke-width:${f1(g * 0.22)}${fill ? `;fill:${fill}` : ''}"/>`);
            } else {
                out.push(`<ellipse class="sc-cabeza${head ? ' hueca' : ''}" cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(g * 0.66)}" ry="${f1(g * 0.46)}" transform="rotate(-20 ${f1(cx)} ${f1(cy)})" style="${head ? `stroke-width:${f1(g * 0.2)};` : ''}${fill ? `fill:${fill}` : ''}"/>`);
                const up = stemUp(it), sx = up ? cx + g * 0.6 : cx - g * 0.6;
                const gr = inGroup.get(it);
                let end = up ? cy - g * 3.4 : cy + g * 3.4;
                if (gr) { const ys = gr.map((x) => yOf(x.row, x.n.s)); end = up ? Math.min(...ys) - g * 3.1 : Math.max(...ys) + g * 3.1; }
                out.push(`<line class="sc-plica" x1="${f1(sx)}" x2="${f1(sx)}" y1="${f1(cy)}" y2="${f1(end)}" style="stroke-width:${f1(g * 0.12)}"/>`);
                if (!gr && (f === 'c' || f === 's')) {
                    [0, 1].slice(0, f === 's' ? 2 : 1).forEach((k) => {
                        const y0 = end + (up ? k : -k) * g * 0.8, dir = up ? 1 : -1;
                        out.push(`<path class="sc-trazo" style="stroke-width:${f1(g * 0.24)}" d="M${f1(sx)} ${f1(y0)} C${f1(sx + g * 0.1)} ${f1(y0 + dir * g * 0.9)} ${f1(sx + g * 1.2)} ${f1(y0 + dir * g * 1.2)} ${f1(sx + g * 0.9)} ${f1(y0 + dir * g * 2.4)}"/>`);
                    });
                }
                it.stem = { x: sx, end, up };
            }
            if (dotted) { const dy = (n.s - clef.bottom) % 2 === 0 ? cy - g * 0.5 : cy; out.push(`<circle class="sc-tinta" cx="${f1(cx + g * 1.05)}" cy="${f1(dy)}" r="${f1(g * 0.17)}"/>`); }
            out.push('</g>');
            const base = under[it.row];
            if (names) { out.push(`<text class="sc-nombre" x="${f1(cx)}" y="${f1(base)}" style="${fill ? `fill:${fill}` : ''}">${escape(nameOf(n))}</text>`); }
            if (syll) { out.push(`<text class="sc-silaba" x="${f1(cx)}" y="${f1(base + (names ? g * 1.9 : 0))}">${SYLL[n.t]}</text>`); }
            if (it.word) { out.push(`<text class="sc-letra" x="${f1(cx)}" y="${f1(base + g * ((names ? 1.9 : 0) + (syll ? 1.9 : 0)))}">${escape(it.word)}</text>`); }
        });
        // The beams over their group.
        groups.forEach((gr) => {
            const up = gr[0].stem.up, end = gr[0].stem.end, x0 = gr[0].stem.x, x1 = gr[gr.length - 1].stem.x, th = g * 0.48;
            out.push(`<rect class="sc-tinta" x="${f1(x0 - g * 0.06)}" y="${f1(up ? end : end - th)}" width="${f1(x1 - x0 + g * 0.12)}" height="${f1(th)}"/>`);
            gr.forEach((it, k) => {
                if (it.n.t !== 1) { return; }
                const nx = gr[k + 1] && gr[k + 1].n.t === 1 ? gr[k + 1].stem.x : (gr[k - 1] && gr[k - 1].n.t === 1 ? null : it.stem.x + (k ? -g : g));
                if (nx === null) { return; }
                const a = Math.min(it.stem.x, nx), b = Math.max(it.stem.x, nx), y = up ? end + g * 0.75 : end - g * 0.75 - th;
                out.push(`<rect class="sc-tinta" x="${f1(a)}" y="${f1(y)}" width="${f1(b - a + g * 0.06)}" height="${f1(th)}"/>`);
            });
        });
        // The little quaver, over the note that sounds (or the one to play), for the youngest.
        const showAt = playingAt >= 0 ? playingAt : (mode === 'play' ? next : -1);
        if (young() && showAt >= 0 && items[showAt]) {
            const it = items[showAt], top = it.row * H + g * 5, my = Math.min(top - g * 2.2, (it.n.r ? top : yOf(it.row, it.n.s)) - g * 4.6);
            out.push(`<g class="sc-mascota" transform="translate(${f1(it.x)} ${f1(my)}) scale(${(g / 15).toFixed(3)})"><ellipse cx="0" cy="8" rx="11" ry="8.5" fill="#164281"/><circle cx="-4" cy="6" r="2.6" fill="#fff"/><circle cx="4" cy="6" r="2.6" fill="#fff"/><circle cx="-3.6" cy="6.4" r="1.3" fill="#1c1a19"/><circle cx="4.4" cy="6.4" r="1.3" fill="#1c1a19"/><path d="M-3 11 Q0 13.5 3 11" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M9.5 6 V-22 C15 -15 22 -12 18 -2" stroke="#164281" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>`);
        }
        const height = Math.max(1, rows.length) * H + g;
        sheet.innerHTML = `<svg class="ct-sc-svg" viewBox="0 0 ${f1(width)} ${f1(height)}" width="${f1(width)}" height="${f1(height)}" role="img" aria-label="${escape(song.title)}">${out.join('')}</svg>`;
        geo = { items, H, g, rows: rows.length, clef, width };
        if (showAt >= 0 && items[showAt]) {
            const top = items[showAt].row * H;
            if (top < sheet.scrollTop || top + H > sheet.scrollTop + sheet.clientHeight) { sheet.scrollTo({ top: Math.max(0, top - g), behavior: 'smooth' }); }
        }
    }

    // --- The glockenspiel ----------------------------------------------------------------------------------
    // Bars from the lowest note of the song to the highest (an octave at least), shorter as they go up, in the
    // colours of the notes; the sharps and flats in a row above if the song has them.
    const keysFor = () => {
        const ss = song.notes.filter((n) => !n.r).map((n) => n.s);
        const lo0 = song.clef === 'fa' ? 21 : 28;
        let lo = Math.min(lo0, ...ss), hi = Math.max(lo0 + 7, ...ss);
        if (hi - lo > 15) { lo = Math.max(lo, hi - 15); }
        return { lo, hi, chromatic: song.notes.some((n) => n.a) };
    };
    function paintKeys() {
        const { lo, hi, chromatic } = keysFor(), n = hi - lo + 1;
        const bars = [];
        for (let s = lo; s <= hi; s++) {
            const k = s - lo;
            bars.push(`<button type="button" class="ct-sc-tecla" data-s="${s}" data-a="0" style="--c:${COLOURS[letter(s)]};--h:${(100 - (k / Math.max(1, n - 1)) * 38).toFixed(0)}%" aria-label="${escape(nameOf({ s, a: 0 }))}"><span>${escape(names()[letter(s)])}</span></button>`);
        }
        const tops = chromatic ? [] : null;
        if (tops) {
            for (let s = lo; s < hi; s++) {
                const l = letter(s);
                tops.push(l === 2 || l === 6 ? '<span class="ct-sc-hueco"></span>' : `<button type="button" class="ct-sc-tecla negra" data-s="${s}" data-a="1" aria-label="${escape(nameOf({ s, a: 1 }))}"><span>${escape(names()[l])}♯</span></button>`);
            }
        }
        $('#sc-keys').innerHTML = (tops ? `<div class="ct-sc-cromaticas" style="--n:${n}">${tops.join('')}</div>` : '') + `<div class="ct-sc-naturales">${bars.join('')}</div>`;
    }
    const sameNote = (a, b) => midi(a) === midi(b);

    // --- Playing it ----------------------------------------------------------------------------------------
    const stop = () => {
        if (!playing) { return; }
        cancelAnimationFrame(playing.frame);
        playing.stopTimer && clearTimeout(playing.stopTimer);
        playing = null;
        if (bus) { try { bus.disconnect(); } catch (err) { /* already off */ } bus = null; }
        paintPlay(); render();
    };
    const listen = (from = 0) => {
        stop();
        const a = ready();
        if (!a) { return; }
        if (core.soundOn && !core.soundOn()) { $('#sc-msg').textContent = t('sc_muted'); }
        const q = 60 / song.tempo / 4;   // a sixteenth, in seconds
        const per = (song.time[0] * 16) / song.time[1], beat = song.time[1] === 8 && song.time[0] % 3 === 0 ? 6 : 16 / song.time[1];
        bus = a.createGain(); bus.connect((core.output && core.output()) || a.destination);
        const start = a.currentTime + 0.12, times = [];
        let at = 0;
        song.notes.slice(from).forEach((n, k) => {
            times.push({ index: from + k, at: start + at * q });
            if (!n.r) { sound(n, start + at * q, n.t * q * 0.95); }
            if (opt.rhythm && !n.r) { clap(a, start + at * q); }
            at += n.t;
        });
        if (opt.metro) {
            const first = song.pickup && !from ? per - song.pickup : 0;
            for (let k = 0; k * beat < at; k++) { tick(a, start + k * beat * q, (first + k * beat) % per === 0); }
        }
        playing = { index: -1, times, end: start + at * q };
        const follow = () => {
            if (!playing) { return; }
            const now = a.currentTime;
            let i = -1;
            playing.times.forEach((x) => { if (x.at <= now) { i = x.index; } });
            if (i !== playing.index) { playing.index = i; render(); }
            if (now >= playing.end + 1.5) { playing = null; bus = null; paintPlay(); render(); return; }
            if (now >= playing.end && playing.index !== -2) { playing.index = -2; render(); }
            playing.frame = requestAnimationFrame(follow);
        };
        playing.frame = requestAnimationFrame(follow);
        paintPlay();
    };
    function paintPlay() {
        const b = $('#sc-play');
        core.relabel(b, playing ? t('sc_stop') : t('sc_listen'), playing ? 'pausa' : 'empezar');
        b.classList.toggle('verde', !playing); b.classList.toggle('amarillo', !!playing);
    }

    // --- Writing --------------------------------------------------------------------------------------------
    const editable = () => {
        if (song.mine) { return song; }
        // A song that came with it is changed in a copy, among the teacher's.
        const copy = clean(Object.assign(JSON.parse(JSON.stringify(song)), { id: 'm' + Date.now().toString(36), title: t('sc_copy_of', song.title) }));
        mine.unshift(copy); song = copy; opt.current = copy.id; keepOpt(); paintSongs();
        return song;
    };
    const change = (fn) => {
        const s = editable();
        undo.push(JSON.stringify(s.notes)); if (undo.length > 100) { undo.shift(); }
        fn(s); persist(); paintTools(); render(); paintKeys();
    };
    const ticksNow = () => LEN[fig] * (dot && fig !== 'r' && fig !== 's' ? 1.5 : 1);
    // A new note goes after the one selected (or the last one written); then the next goes after it.
    const insert = (note) => change((s) => {
        const at = sel >= 0 ? sel + 1 : (cursor >= 0 ? Math.min(cursor, s.notes.length) : s.notes.length);
        s.notes.splice(at, 0, note);
        sel = -1; cursor = at + 1;
    });
    const stepAt = (y, row) => {
        const { H, g, clef } = geo, bottom = row * H + g * 9;
        return Math.max(clef.lo, Math.min(clef.hi, clef.bottom + Math.round((bottom - y) / (g / 2))));
    };
    let drag = null;
    $('#sc-sheet').addEventListener('pointerdown', (e) => {
        if (!geo || e.button > 0) { return; }
        const svg = $('#sc-sheet svg');
        if (!svg) { return; }
        const r = svg.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, row = Math.max(0, Math.min(geo.rows - 1, Math.floor(y / geo.H)));
        const hit = geo.items.find((it) => it.row === row && Math.abs(it.x - x) < it.w * 0.45);
        if (mode === 'play') { if (hit) { next = hit.i; render(); } return; }
        if (mode !== 'write') { return; }
        e.preventDefault();
        if (hit) {
            sel = hit.i; paintTools(); render();
            if (!hit.n.r) { sound(hit.n); drag = { i: hit.i, row, s: hit.n.s, id: e.pointerId, moved: false }; try { $('#sc-sheet').setPointerCapture(e.pointerId); } catch (err) { /* it still moves */ } }
            return;
        }
        const s = stepAt(y, row), note = rest ? { s: 0, a: 0, t: ticksNow(), r: true } : { s, a: 0, t: ticksNow() };
        if (!note.r) { sound(note); }
        insert(note);
    });
    $('#sc-sheet').addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) { return; }
        const svg = $('#sc-sheet svg'), r = svg.getBoundingClientRect(), s = stepAt(e.clientY - r.top, drag.row);
        if (s !== song.notes[drag.i].s) {
            if (!drag.moved) { undo.push(JSON.stringify(song.notes)); drag.moved = true; editable(); }
            song.notes[drag.i].s = s; song.notes[drag.i].a = 0;
            sound(song.notes[drag.i]); render();
        }
    });
    const dragEnd = (e) => { if (drag && e.pointerId === drag.id) { if (drag.moved) { persist(); paintKeys(); } drag = null; } };
    $('#sc-sheet').addEventListener('pointerup', dragEnd);
    $('#sc-sheet').addEventListener('pointercancel', dragEnd);

    // The glockenspiel: in «Write» it writes; in «Play with me», it is checked against the note that comes; in the
    // game, it is the answer.
    $('#sc-keys').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-s]');
        if (!b) { return; }
        e.preventDefault();
        const n = { s: Number(b.dataset.s), a: Number(b.dataset.a), t: ticksNow() };
        sound(n, undefined, 0.6);
        b.classList.remove('toca'); void b.offsetWidth; b.classList.add('toca');
        if (mode === 'write') { insert(rest ? { s: 0, a: 0, t: ticksNow(), r: true } : n); return; }
        if (mode === 'play') { playAlong(n, b); return; }
        if (mode === 'game') { answer(n, b); }
    });
    // «Play with me»: the next note lights; the right one goes on, a wrong one shakes the bar.
    const skipRests = () => { while (song.notes[next] && song.notes[next].r) { next++; } };
    function playAlong(n, b) {
        skipRests();
        const want = song.notes[next];
        if (!want) { return; }
        if (sameNote(n, want)) {
            next++; skipRests();
            if (next >= song.notes.length) {
                $('#sc-msg').textContent = t('sc_well_done');
                if (core.celebrate) { core.celebrate($('.ct-sc'), { title: t('sc_well_done'), text: song.title }); }
                announce(t('sc_well_done'));
                next = 0;
            }
            render(); lightNext();
        } else {
            b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal');
        }
    }
    const lightNext = () => {
        $$('.ct-sc-tecla').forEach((k) => k.classList.remove('siguiente'));
        if (mode !== 'play') { return; }
        skipRests();
        const want = song.notes[next];
        if (!want) { return; }
        const k = panel.querySelector(`.ct-sc-tecla[data-s="${want.s}"][data-a="${want.a > 0 ? 1 : 0}"]`) || panel.querySelector(`.ct-sc-tecla[data-s="${want.s}"]`);
        if (k) { k.classList.add('siguiente'); }
    };
    const $$ = (s) => panel.querySelectorAll(s);

    // The game «Which note is it?»: a note on its own on the staff; the glockenspiel answers. A streak counts the right
    // ones in a row; the youngest get notes from do to the next do, the older ones more (and the bass clef if chosen).
    const quizSong = () => ({ title: t('sc_game'), clef: song.clef, time: [4, 4], tempo: song.tempo, pickup: 0, lyrics: '', notes: quiz ? [{ s: quiz.s, a: 0, t: 16 }] : [], mine: false });
    let streak = 0;
    const newQuiz = () => {
        const c = CLEFS[song.clef], lo = young() ? (song.clef === 'fa' ? 21 : 28) : c.lo + 1, hi = young() ? lo + 7 : c.hi - 2;
        let s;
        do { s = lo + core.random(hi - lo + 1); } while (quiz && s === quiz.s && hi > lo);
        quiz = { s };
        render(); sound({ s, a: 0 });
    };
    function answer(n) {
        if (!quiz) { return; }
        if (letter(n.s) === letter(quiz.s) && !n.a) {
            streak++;
            $('#sc-msg').textContent = t('sc_game_right', { name: nameOf({ s: quiz.s, a: 0 }), n: streak });
            play('point');
            setTimeout(newQuiz, 700);
        } else {
            streak = 0;
            $('#sc-msg').textContent = t('sc_game_wrong', nameOf({ s: quiz.s, a: 0 }));
            play('minus');
        }
    }

    // --- Controls -------------------------------------------------------------------------------------------
    function paintSongs() {
        const groupsHtml = [];
        const opt1 = (x) => `<option value="${escape(x.id)}">${escape(x.title || t('sc_untitled'))}${x.mine || !x.from ? '' : ` · ${escape(placeName(x.from))}`}</option>`;
        if (mine.length) { groupsHtml.push(`<optgroup label="${escape(t('sc_mine'))}">${mine.map(opt1).join('')}</optgroup>`); }
        const near = builtIn.filter((x) => home.includes(x.from)), far = builtIn.filter((x) => !home.includes(x.from));
        if (near.length) { groupsHtml.push(`<optgroup label="${escape(t('sc_from_home', placeName(home[0])))}">${near.map(opt1).join('')}</optgroup>`); }
        groupsHtml.push(`<optgroup label="${escape(near.length ? t('sc_from_world') : t('sc_songs'))}">${far.map(opt1).join('')}</optgroup>`);
        $('#sc-song').innerHTML = groupsHtml.join('');
        $('#sc-song').value = song.id;
        const where = [song.from && placeName(song.from), song.by].filter(Boolean).join(' · ');
        $('#sc-origin').textContent = song.mine ? (where || t('sc_mine_note')) : t('sc_origin', where);
    }
    function paintTools() {
        $$('#sc-mode button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === mode)));
        const older = !young();
        const figs = FIGS.filter(([k]) => older || k !== 's');
        $('#sc-figs').hidden = mode !== 'write';
        $('#sc-figs').innerHTML = figs.map(([k, v]) => `<button type="button" role="radio" data-v="${k}" aria-checked="${k === fig}" title="${escape(t('sc_f_' + k))}" aria-label="${escape(t('sc_f_' + k))}">${figIcon(v)}</button>`).join('');
        const sn = sel >= 0 ? song.notes[sel] : null;
        $('#sc-more').innerHTML = mode === 'write' ? [
            `<button type="button" class="boton suave${rest ? ' activo' : ''}" data-x="rest" aria-pressed="${rest}" title="${escape(t('sc_rest'))}">${escape(t('sc_rest'))}</button>`,
            older ? `<button type="button" class="boton suave${dot ? ' activo' : ''}" data-x="dot" aria-pressed="${dot}" title="${escape(t('sc_dot'))}">${escape(t('sc_dot'))}</button>` : '',
            older && sn && !sn.r ? `<button type="button" class="boton suave" data-x="sharp" title="${escape(t('sc_sharp'))}">♯</button><button type="button" class="boton suave" data-x="flat" title="${escape(t('sc_flat'))}">♭</button>` : '',
            `<button type="button" class="boton suave" data-x="undo" title="${escape(t('wb_undo'))}" aria-label="${escape(t('wb_undo'))}" ${undo.length ? '' : 'disabled'}>${core.icon('deshacer')}</button>`,
            `<button type="button" class="boton suave" data-x="del" title="${escape(t('sc_delete'))}" aria-label="${escape(t('sc_delete'))}" ${sn ? '' : 'disabled'}>${core.icon('borrar')}</button>`,
            `<button type="button" class="boton rojo-suave" data-x="clear">${escape(t('sc_clear'))}</button>`,
        ].join('') : (mode === 'play' ? `<button type="button" class="boton suave" data-x="again">${core.icon('reiniciar')}<span>${escape(t('sc_again'))}</span></button>`
            : `<button type="button" class="boton suave" data-x="quiz">${core.icon('seguir')}<span>${escape(t('sc_game_next'))}</span></button>`);
        $('#sc-turn').hidden = mode === 'write' || !(core.lists && core.lists().length);
        $('#sc-clef').value = song.clef; $('#sc-time').value = song.time.join('/'); $('#sc-tempo').value = song.tempo;
        $('#sc-tempo-v').textContent = `${song.tempo} · ${t(song.tempo < 76 ? 'sc_slow' : (song.tempo < 120 ? 'sc_medium' : 'sc_fast'))}`;
        $('#sc-voice').value = opt.voice;
        $('#sc-naming').value = NAMESETS[opt.naming] ? opt.naming : 'auto';
        $('#sc-names').checked = showNames(); $('#sc-colours').checked = showColours(); $('#sc-rhythm').checked = !!opt.rhythm;
        $('#sc-metro').checked = !!opt.metro; $('#sc-lyrics').checked = !!opt.lyrics; $('#sc-lyrics-box').hidden = !song.lyrics;
        $('#sc-keys').hidden = false;
        panel.querySelector('.ct-sc').classList.toggle('pequenos', young());
    }
    // The figure on its button: a small note.
    const figIcon = (ticks) => {
        const hollow = ticks >= 8, stem = ticks < 16, flags = ticks === 2 ? 1 : (ticks === 1 ? 2 : 0);
        return `<svg viewBox="0 0 22 30" width="20" height="26" aria-hidden="true"><ellipse cx="8" cy="23" rx="6" ry="4.2" transform="rotate(-20 8 23)" fill="${hollow ? 'none' : 'currentColor'}" stroke="currentColor" stroke-width="2"/>${stem ? '<line x1="13.4" y1="22" x2="13.4" y2="3" stroke="currentColor" stroke-width="2"/>' : ''}${[0, 1].slice(0, flags).map((k) => `<path d="M13.4 ${3 + k * 6} C14 ${8 + k * 6} 20 ${9 + k * 6} 18 ${15 + k * 6}" stroke="currentColor" stroke-width="2.4" fill="none"/>`).join('')}</svg>`;
    };
    function paint() {
        $('#sc-delete').hidden = !song.mine;
        paintSongs(); paintTools(); paintKeys(); paintPlay();
        if (mode === 'game') { const real = song; song = Object.assign(quizSong(), { id: real.id }); render(); song = real; } else { render(); }
        lightNext();
    }
    // The game draws its one note in place of the song (and puts the song back after).
    const renderGame = () => { const real = song; song = Object.assign(quizSong(), { id: real.id }); render(); song = real; };
    $('#sc-mode').addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]');
        if (!b) { return; }
        stop();
        mode = b.dataset.v; sel = -1; cursor = -1; next = 0; $('#sc-msg').textContent = '';
        if (mode === 'game') { streak = 0; newQuizSafe(); }
        paintTools(); paintKeys();
        if (mode === 'game') { renderGame(); } else { render(); }
        lightNext();
    });
    const newQuizSafe = () => { newQuiz(); renderGame(); };
    $('#sc-figs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]');
        if (!b) { return; }
        fig = b.dataset.v;
        if (sel >= 0) { change((s) => { s.notes[sel].t = ticksNow(); }); } else { paintTools(); }
    });
    $('#sc-more').addEventListener('click', (e) => {
        const b = e.target.closest('[data-x]');
        if (!b) { return; }
        const x = b.dataset.x;
        if (x === 'rest') { rest = !rest; paintTools(); }
        if (x === 'dot') { dot = !dot; if (sel >= 0 && !song.notes[sel].r) { change((s) => { s.notes[sel].t = ticksNow(); }); } else { paintTools(); } }
        if (x === 'sharp' || x === 'flat') { change((s) => { const n = s.notes[sel]; n.a = n.a === (x === 'sharp' ? 1 : -1) ? 0 : (x === 'sharp' ? 1 : -1); sound(n); }); }
        if (x === 'undo' && undo.length) { const s = editable(); s.notes = JSON.parse(undo.pop()); sel = -1; persist(); paintTools(); render(); paintKeys(); }
        if (x === 'del' && sel >= 0) { change((s) => { s.notes.splice(sel, 1); cursor = sel; sel = -1; }); }
        if (x === 'clear') {
            if (!b.classList.contains('confirma')) { b.classList.add('confirma'); b.textContent = t('sc_clear_sure'); return; }
            change((s) => { s.notes = []; sel = -1; cursor = -1; });
        }
        if (x === 'again') { next = 0; $('#sc-msg').textContent = ''; render(); lightNext(); }
        if (x === 'quiz') { newQuizSafe(); }
    });
    $('#sc-play').addEventListener('click', () => {
        if (playing) { stop(); return; }
        if (mode === 'game') { if (quiz) { sound({ s: quiz.s, a: 0 }, undefined, 1); } return; }
        listen(mode === 'play' ? 0 : Math.max(0, sel));
    });
    $('#sc-turn').addEventListener('click', () => { if (core.turn) { core.turn($('.ct-sc'), { task: t(mode === 'game' ? 'turn_task_note' : 'turn_task_play') }); } });
    $('#sc-song').addEventListener('change', () => {
        stop();
        song = all().find((x) => x.id === $('#sc-song').value) || builtIn[0];
        opt.current = song.id; keepOpt(); sel = -1; cursor = -1; next = 0; undo.length = 0; $('#sc-msg').textContent = '';
        paint();
    });
    // Delete one of the teacher's songs: two taps, like «End the session».
    let sureDelete = 0;
    $('#sc-delete').addEventListener('click', () => {
        const b = $('#sc-delete');
        if (!song.mine) { return; }
        if (!sureDelete) {
            core.relabel(b, t('sc_delete_confirm'), 'borrar');
            sureDelete = setTimeout(() => { sureDelete = 0; core.relabel(b, t('sc_delete'), 'borrar'); }, 3000);
            return;
        }
        clearTimeout(sureDelete); sureDelete = 0; core.relabel(b, t('sc_delete'), 'borrar');
        stop();
        const i = mine.indexOf(song); if (i >= 0) { mine.splice(i, 1); }
        song = mine[0] || builtIn[0]; opt.current = song.id; keepOpt(); persist(); sel = -1; undo.length = 0;
        paint();
    });
    $('#sc-new').addEventListener('click', () => {
        stop();
        const s = clean({ id: 'm' + Date.now().toString(36), title: t('sc_new_name', mine.length + 1), clef: song.clef, time: song.time, tempo: song.tempo, notes: [] });
        mine.unshift(s); song = s; opt.current = s.id; keepOpt(); persist(); mode = 'write'; sel = -1; undo.length = 0;
        paint();
    });
    const setSong = (k, v) => { const s = editable(); s[k] = v; persist(); paint(); };
    $('#sc-clef').addEventListener('change', () => setSong('clef', $('#sc-clef').value));
    $('#sc-time').addEventListener('change', () => setSong('time', timeOf($('#sc-time').value)));
    $('#sc-tempo').addEventListener('input', () => {
        const v = Number($('#sc-tempo').value);
        if (song.mine) { song.tempo = v; persist(); } else { song.tempo = v; }   // the tempo of a song that came with it is not kept
        paintTools();
    });
    $('#sc-voice').addEventListener('change', () => { opt.voice = $('#sc-voice').value; keepOpt(); sound({ s: 32, a: 0 }); });
    $('#sc-naming').addEventListener('change', () => { opt.naming = $('#sc-naming').value; naming = NAMESETS[opt.naming] ? opt.naming : AUTO; keepOpt(); paint(); });
    [['names', 'names'], ['colours', 'colours'], ['rhythm', 'rhythm'], ['metro', 'metro'], ['lyrics', 'lyrics']].forEach(([id, k]) => $('#sc-' + id).addEventListener('change', () => {
        opt[k] = $('#sc-' + id).checked; keepOpt(); paint();
    }));

    // --- Bringing songs in, the prompt, and taking one out ----------------------------------------------------
    let dialog = null;
    const openDialog = (html, wire) => {
        if (!dialog) { dialog = document.createElement('dialog'); dialog.className = 'editor ct-sc-dialogo'; document.body.append(dialog); }
        dialog.innerHTML = html;
        wire(dialog);
        if (!dialog.open) { if (dialog.showModal) { dialog.showModal(); } else { dialog.setAttribute('open', ''); } }
    };
    const closeDialog = () => { if (dialog && dialog.open) { if (dialog.close) { dialog.close(); } else { dialog.removeAttribute('open'); } } };
    const take = (text, name) => {
        const s = clean(Object.assign(parseSong(text), { id: 'm' + Date.now().toString(36) }));
        if (!s.title) { s.title = String(name || '').replace(/\.[a-z0-9]+$/i, '').slice(0, 80) || t('sc_new_name', mine.length + 1); }
        mine.unshift(s); song = s; opt.current = s.id; keepOpt(); persist(); sel = -1; next = 0; undo.length = 0;
        paint();
        return s;
    };
    $('#sc-import').addEventListener('click', () => openImport());
    function openImport() { openDialog(`<form method="dialog" class="ct-sc-form"><h2>${escape(t('sc_import_title'))}</h2>
        <p class="nota">${escape(t('sc_import_hint'))}</p>
        <textarea id="sc-text" rows="9" spellcheck="false" placeholder="${escape(t('sc_import_ph'))}"></textarea>
        <div class="ct-row"><label class="boton suave ct-sc-archivo"><span data-icono="descargar"></span><span>${escape(t('sc_import_file'))}</span><input type="file" id="sc-file" accept=".txt,.abc,text/plain" hidden></label>
        <button type="button" class="boton suave" id="sc-to-prompt"><span data-icono="nube"></span><span>${escape(t('sc_prompt'))}</span></button></div>
        <p class="nota" id="sc-err" aria-live="polite"></p>
        <div class="botonera"><button type="submit" class="boton" id="sc-take">${escape(t('sc_import_go'))}</button><button type="button" class="boton suave" id="sc-cancel">${escape(t('wb_cancel'))}</button></div></form>`, (d) => {
        d.querySelectorAll('[data-icono]').forEach((el) => core.setIcon(el, el.dataset.icono));
        // The prompt for an AI, from here: it is how a song is written to bring it in.
        d.querySelector('#sc-to-prompt').addEventListener('click', () => openPrompt());
        let fileName = '';
        d.querySelector('#sc-cancel').addEventListener('click', closeDialog);
        d.querySelector('#sc-file').addEventListener('change', (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) { return; }
            fileName = f.name;
            f.text().then((txt) => { d.querySelector('#sc-text').value = txt.slice(0, 20000); });
        });
        d.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            try { take(d.querySelector('#sc-text').value, fileName); closeDialog(); play('card'); } catch (err) {
                d.querySelector('#sc-err').textContent = err.mine ? err.message : t('sc_err_empty');
            }
        });
    }); }
    // The prompt for an AI: the format, an example, and the song asked for.
    const promptFor = (title) => t('sc_prompt_text', title || t('sc_prompt_any'));
    function openPrompt() { openDialog(`<form method="dialog" class="ct-sc-form"><h2>${escape(t('sc_prompt_title'))}</h2>
        <p class="nota">${escape(t('sc_prompt_hint'))}</p>
        <label class="campo apilado"><span>${escape(t('sc_prompt_song'))}</span><input type="text" id="sc-ask" maxlength="80"></label>
        <textarea id="sc-prompt-text" rows="12" readonly></textarea>
        <p class="nota" id="sc-copied" aria-live="polite"></p>
        <div class="botonera"><button type="button" class="boton" id="sc-copy">${escape(t('sc_copy'))}</button><button type="button" class="boton suave" id="sc-done">${escape(t('qz_done'))}</button></div></form>`, (d) => {
        const area = d.querySelector('#sc-prompt-text'), ask = d.querySelector('#sc-ask');
        const fill = () => { area.value = promptFor(ask.value.trim()); };
        fill();
        ask.addEventListener('input', fill);
        d.querySelector('#sc-done').addEventListener('click', () => openImport());   // back to bringing the song in
        d.querySelector('#sc-copy').addEventListener('click', () => {
            const ok = () => { d.querySelector('#sc-copied').textContent = t('sc_copied'); };
            if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(area.value).then(ok, () => { area.select(); document.execCommand('copy'); ok(); }); } else { area.select(); document.execCommand('copy'); ok(); }
        });
    }); }
    $('#sc-export').addEventListener('click', () => {
        const blob = new Blob([writeText(song)], { type: 'text/plain;charset=utf-8' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = `${(song.title || 'partitura').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60)}.txt`;
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
    document.addEventListener('classtools:mode', () => { if (!panel.hidden) { paint(); } });
    if (window.ResizeObserver) { new ResizeObserver(() => { if (!panel.hidden) { if (mode === 'game') { renderGame(); } else { render(); } } }).observe($('#sc-sheet')); }
    paintSongs(); paintTools(); paintKeys(); paintPlay();

    window.ClasstoolsScore = { readText, readAbc, writeText, song: () => song, songs: () => all(), listen, stop, take, midi, state: () => ({ mode, sel, next, quiz, streak }) };   // for automated tests
})();
