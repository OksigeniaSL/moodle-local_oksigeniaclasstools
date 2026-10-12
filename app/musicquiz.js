// Music questions for the live quiz (quiz.js): sets that make themselves, and the board plays each question when it
// opens (and again on request). «Which song is it?»: the beginning of a song of the score, and four titles.
// «Rhythm dictation»: a bar of claps, and four rhythms written with the syllables used in class (ta, ti-ti, ta-a…).
// «Melody dictation»: a few notes that start on do (C), and four ways of writing them. Each question keeps what it
// plays, so a set can be kept, edited and played again like any other.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { t, shuffle, random } = core;
    const KINDS = ['song', 'rhythm', 'melody'];
    const score = () => window.ClasstoolsScore || null;
    const DO = 28;   // middle C on the staff of the score

    // --- Which song is it? ---------------------------------------------------------------------------------------
    // The first two bars or so (8 to 12 notes), of songs that have a title.
    const beginning = (song) => {
        const per = (song.time[0] * 16) / song.time[1];
        const out = [];
        let at = 0;
        for (const n of song.notes) { if (at >= per * 2 + (song.pickup || 0) && out.length >= 8) { break; } out.push({ s: n.s, a: n.a || 0, t: n.t, r: !!n.r }); at += n.t; }
        return out.slice(0, 14);
    };
    const songQuestions = (n) => {
        const S = score();
        const songs = S ? S.songs().filter((x) => x.title && x.notes && x.notes.length >= 8) : [];
        if (songs.length < 4) { return []; }
        return shuffle(songs.slice()).slice(0, n).map((song) => {
            const others = shuffle(songs.filter((x) => x.title !== song.title)).slice(0, 3).map((x) => x.title);
            const o = shuffle([song.title, ...others]);
            return { q: t('mq_q_song'), o, c: o.indexOf(song.title), music: { notes: beginning(song), tempo: song.tempo || 100 } };
        });
    };

    // --- Rhythm dictation ----------------------------------------------------------------------------------------
    // The cells, in sixteenths, with their syllables: easy (ta, ti-ti) or harder (also ta-a, a rest, ti-ri-ti-ri).
    const CELLS = {
        ta: { notes: [4], easy: true }, titi: { notes: [2, 2], easy: true },
        taa: { notes: [8] }, rest: { notes: [4], rest: true }, tiri: { notes: [1, 1, 1, 1] },
    };
    const cellLen = (c) => CELLS[c].notes.reduce((a, b) => a + b, 0);
    const rhythmText = (cells) => cells.map((c) => t('mq_syl_' + c)).join(' · ');
    const rhythmNotes = (cells) => cells.flatMap((c) => CELLS[c].notes.map((len) => ({ s: DO, a: 0, t: len, r: !!CELLS[c].rest })));
    const bar = (hard) => {
        const pool = Object.keys(CELLS).filter((c) => hard || CELLS[c].easy);
        const out = [];
        let left = 16;
        while (left > 0) {
            const fit = pool.filter((c) => cellLen(c) <= left);
            const c = fit[random(fit.length)];
            out.push(c); left -= cellLen(c);
        }
        return out;
    };
    // Another bar like it with one cell changed for another of the same length.
    const twin = (cells, hard) => {
        const pool = Object.keys(CELLS).filter((c) => hard || CELLS[c].easy);
        const i = random(cells.length), len = cellLen(cells[i]);
        const same = pool.filter((c) => c !== cells[i] && cellLen(c) === len);
        if (same.length) { const out = cells.slice(); out[i] = same[random(same.length)]; return out; }
        return bar(hard);
    };
    const rhythmQuestions = (n, hard) => Array.from({ length: n }, () => {
        const right = bar(hard), texts = new Set([rhythmText(right)]);
        for (let k = 0; k < 40 && texts.size < 4; k++) { texts.add(rhythmText(twin(right, hard))); }
        for (let k = 0; k < 40 && texts.size < 4; k++) { texts.add(rhythmText(bar(hard))); }
        const o = shuffle([...texts]);
        return { q: t('mq_q_rhythm'), o, c: o.indexOf(rhythmText(right)), music: { notes: rhythmNotes(right), tempo: 90, clap: true } };
    });

    // --- Melody dictation --------------------------------------------------------------------------------------------
    // From do: four notes up to sol (easy) or five up to la (harder), by steps of a note or two.
    const melody = (hard) => {
        const top = hard ? 5 : 4, out = [0];
        while (out.length < (hard ? 5 : 4)) {
            const last = out[out.length - 1], moves = [-2, -1, 1, 2].filter((d) => last + d >= 0 && last + d <= top);
            out.push(last + moves[random(moves.length)]);
        }
        return out;
    };
    const melodyText = (m) => m.map((d) => (score() ? score().noteName(DO + d) : ['C', 'D', 'E', 'F', 'G', 'A'][d])).join(' ');
    const melodyQuestions = (n, hard) => Array.from({ length: n }, () => {
        const right = melody(hard), texts = new Set([melodyText(right)]);
        for (let k = 0; k < 60 && texts.size < 4; k++) {
            // One note (not the first) a step up or down.
            const m = right.slice(), i = 1 + random(m.length - 1), d = random(2) ? 1 : -1;
            if (m[i] + d >= 0 && m[i] + d <= (hard ? 5 : 4)) { m[i] += d; texts.add(melodyText(m)); }
        }
        for (let k = 0; k < 40 && texts.size < 4; k++) { texts.add(melodyText(melody(hard))); }
        const o = shuffle([...texts]);
        return { q: t('mq_q_melody', melodyText([0])), o, c: o.indexOf(melodyText(right)),
            music: { notes: right.map((d) => ({ s: DO + d, a: 0, t: 4 })), tempo: 80 } };
    });

    /**
     * A set of music questions.
     *
     * @param {string} kind song, rhythm or melody.
     * @param {number} n How many.
     * @param {boolean} hard
     * @return {{id: string, name: string, questions: Array}|null} null if it cannot be made (fewer than four songs).
     */
    const make = (kind, n, hard) => {
        const qs = ({ song: songQuestions, rhythm: rhythmQuestions, melody: melodyQuestions })[kind](n, hard)
            .filter((q) => q.o.length >= 2 && q.c >= 0);
        if (!qs.length) { return null; }
        // Time to listen and then to answer.
        qs.forEach((q) => { q.secs = Math.min(120, 20 + Math.ceil(duration(q.music) / 1000)); });
        return { id: 'm' + Date.now().toString(36), name: t('mq_set_' + kind), questions: qs };
    };
    const duration = (m) => m.notes.reduce((a, x) => a + x.t, 0) * (60 / (m.tempo || 96) / 4) * 1000;
    /**
     * Plays what a question has to be heard.
     *
     * @param {{notes: Array, tempo: number, clap: boolean}} music
     * @return {number} How long it lasts, in milliseconds.
     */
    const play = (music) => (score() && music && music.notes ? score().playNotes(music.notes, music.tempo, { clap: !!music.clap }) : 0);

    window.ClasstoolsMusicQuiz = { KINDS, make, play, rhythmText, melodyText };
})();
