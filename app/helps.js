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
 * The steps of the guided helps (help.js plays them): for each help, what the pointer does on the practice board in
 * each watched step (with h, the hand of help.js), what is done at once before the first one (setup), and «Now you»:
 * what is ready before (prep) and the buttons the teacher presses (targets). Their captions, hints and what is typed
 * are language strings (hp_<help>_1…, hp_<help>_h1…). From the guided helps of the art direction
 * (kit/ayuda-guiada/piezas.js), with their own words for each language.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const t = (k) => (window.ClasstoolsCore ? window.ClasstoolsCore.t(k) : k);

    // --- What several helps do at once (from the art direction's pieces) ------------------------------------
    // Simon's word on its pads, pressed in order. The word is drawn at random, so its pads are read from the board's
    // hook for tests (ClasstoolsSimon.state().seq), in the frame of the practice board.
    async function pressWord(h, quick) {
        const pad = await h.until('#si-board .ct-pad');
        const simon = pad && pad.ownerDocument.defaultView.ClasstoolsSimon;
        if (!simon) { return; }
        // Once the board waits for the answer (a written word takes a moment to come up).
        for (let k = 0; k < 150 && !(simon.state().state === 'input' && simon.state().seq.length) && h.live(); k++) { await h.pause(100); }
        for (const i of simon.state().seq.slice()) { await h.press(`#si-board .ct-pad[data-i="${i}"]`, quick); }
    }
    // After a word is split: it comes out whole, and then the next one is written.
    async function nextWord(h) {
        await h.until('#si-show.ct-palabra');
        await h.until('#si-show:not(.ct-palabra)', 6000);
        await h.pause(300);
    }

    // A brainstorm session open with the class inside, at once.
    async function openIdeas(h) {
        await h.press('#t-envivo', true);
        await h.press('#lv-kind [data-v="ideas"]', true);
        await h.press('#lv-identity [data-v="anon"]', true);
        await h.press('#lv-start', true);
        await h.until('#id-q');
        await h.wait(900, true);
    }

    // The quiz year six wrote, as it would be pasted: one question per line, the right answer with an asterisk.
    const QUIZ_NAME = t('hp_concurso_name');
    const QUIZ_TEXT = t('hp_concurso_text');

    // A quiz ready to be set up, at once (the ranking only on the podium, so the help stays short).
    async function openQuiz(h) {
        await h.press('#t-envivo', true);
        await h.press('#lv-kind [data-v="quiz"]', true);
        await h.press('#lv-identity [data-v="anon"]', true);
        await h.until('#qz-new');
        await h.press('#qz-after', true);
    }

    // Buzzers chosen, at once (the teams and the session, in the help).
    async function openBuzz(h) {
        await h.press('#t-envivo', true);
        await h.press('#lv-kind [data-v="buzz"]', true);
        await h.press('#lv-identity [data-v="anon"]', true);
        await h.until('#lv-mas');
    }


    // The show of hands: the names of the pet and the question.
    const PET_NAMES = t('hp_manos_pets');
    const PET_QUESTION = t('hp_manos_q');
    const pet = (i) => PET_NAMES.split('\n')[i];
    async function openHands(h) {
        await h.press('#t-envivo', true);
        await h.press('#lv-kind [data-v="hands"]', true);
        await h.until('#lv-vote');
    }

    // The faces of the question die.
    const QUESTION_FACES = t('hp_dados_faces');

    // Shapes drawn by hand, a little wobbly (pixels from the top left of the board): the magic shapes tidy them up.
    const ROUGH_TRIANGLE = [[150, 250], [228, 52], [232, 50], [318, 242], [312, 246], [158, 251], [152, 248]];
    function roughCircle(cx, cy, r) {
        return Array.from({ length: 34 }, (_, i) => {
            const a = (i / 32) * Math.PI * 2 - Math.PI / 2, k = r * (1 + 0.06 * Math.sin(i * 1.7));
            return [cx + k * Math.cos(a), cy + k * Math.sin(a)];
        });
    }

    // Answers of an exercise already on the board (formulas, one under the other), for the curtain to cover.
    async function answersOnBoard(h) {
        await h.press('#t-pizarra', true);
        await h.press('#wb-full', true);
        await h.pause(1500);                                  // the full board lays itself out
        await h.press('#h-pizarra [data-v="formula"]', true);
        // Written from the bottom up: a formula takes room downwards from where it is put, so a tap below one would land
        // on it (and edit it), and a tap above never does.
        const rows = ['3/4 + 1/4 = 1', 'raíz(81) = 9', '2x + 1 = 11  ->  x = 5'];
        for (let i = rows.length - 1; i >= 0; i--) {
            const y = [0.04, 0.4, 0.64][i];                   // shares of the board (formulas grow with it); the fraction is tall
            await h.draw('#wb-ink', [[0.08, y], [0.08, y]], { quick: true });
            await h.type('#fx-src', rows[i], true);
            await h.press('#fx-ok', true);
        }
        await h.press('#h-pizarra [data-v="pen"]', true);
    }
    // The compass turns round its needle from its pencil: a circle (or most of one), wherever they are now.
    async function compassCircle(h, turns) {
        const n = await h.rect('.ct-in-is-compass [data-act="needle"]'), p = await h.rect('.ct-in-is-compass [data-act="pencil"]');
        const c = [n.left + n.width / 2, n.top + n.height / 2], s = [p.left + p.width / 2, p.top + p.height / 2];
        const r = Math.hypot(s[0] - c[0], s[1] - c[1]), a0 = Math.atan2(s[1] - c[1], s[0] - c[0]);
        const pts = Array.from({ length: 40 }, (_, i) => {
            const a = a0 - (i / 39) * Math.PI * 2 * turns;
            return [c[0] + r * Math.cos(a) - p.left, c[1] + r * Math.sin(a) - p.top];
        });
        await h.gesture('.ct-in-is-compass [data-act="pencil"]', pts, { px: true, every: 22, step: 8 });
    }
    // The fixed remote chosen in «Live», at once (turning it on, in the help).
    async function openFixedRemote(h) {
        await h.press('#t-envivo', true);
        await h.press('#lv-kind [data-v="remote"]', true);
        await h.until('[data-rm="on"]');
    }
    // A vote with the class inside, done at once.
    const voteOpen = async (h) => {
        await h.press('#t-envivo', true);
        await h.press('#lv-kind [data-v="vote"]', true);
        await h.press('#lv-identity [data-v="anon"]', true);
        await h.press('#lv-start', true);
        await h.until('#lv-question');
        await h.wait(900, true);
    };
    window.ClasstoolsHelps = {
        // «Live» · getting the class in. Scene: a parents' evening.
        entrar: {
            steps: [
                async (h) => { await h.wait(1200); await h.press('#t-envivo'); },
                async (h) => { await h.press('#lv-kind [data-v="vote"]'); await h.wait(2200); await h.press('#lv-identity [data-v="anon"]'); },
                async (h) => { await h.wait(400); await h.press('#lv-start'); await h.wait(900); await h.moveTo('#lv-qr'); },
                async (h) => { await h.moveTo('#lv-critters'); await h.wait(1500); await h.moveTo('#lv-count'); },
                async (h) => {
                    await h.type('#lv-question', t('hp_entrar_q'));
                    await h.press('#lv-open');
                    await h.wait(2600);
                    await h.press('#lv-open');   // closing it brings out the bars
                    await h.wait(1800);
                    await h.moveTo('#lv-bars');
                    await h.wait(1600);
                },
            ],
            practice: {
                prep: async (h) => { await h.press('#t-envivo', true); },
                targets: [
                    { sel: '#lv-kind [data-v="vote"]' },
                    { sel: '#lv-identity [data-v="anon"]' },
                    { sel: '#lv-start' },
                ],
                after: 2600,
            },
        },
        // «Live» · vote: predict before the experiment. The class is already in.
        votar: {
            quick: true,
            setup: voteOpen,
            steps: [
                async (h) => { await h.wait(600); await h.type('#lv-question', t('hp_votar_q')); },
                async (h) => { await h.choose('#lv-kind-vote', 'yesno'); await h.wait(1400); await h.press('#lv-open'); },
                async (h) => { await h.moveTo('#lv-progress'); await h.wait(2400); },
                async (h) => { await h.press('#lv-open'); await h.wait(1200); await h.moveTo('#lv-bars'); },
                async (h) => {
                    await h.wait(1400);
                    await h.press('#lv-open');   // «Another question»: a second round
                    await h.wait(2800);
                    await h.press('#lv-open');   // closed: the new bars
                    await h.wait(1200);
                    await h.moveTo('#lv-bars');
                    await h.wait(1200);
                },
            ],
            practice: {
                prep: async (h) => {
                    await voteOpen(h);
                    await h.type('#lv-question', t('hp_votar_q'), true);
                    await h.choose('#lv-kind-vote', 'yesno', true);
                },
                targets: [
                    { sel: '#lv-open' },
                    { sel: '#lv-open', delay: 3200 },
                ],
            },
        },
        // «En vivo» · brainstorm: the cloud of doubts at the end of the lesson. The class is already in.
        nube: {
            quick: true,
            setup: async (h) => { await openIdeas(h); },
            steps: [
                async (h) => { await h.wait(1400); await h.type('#id-q', t('hp_nube_q')); },
                async (h) => { await h.wait(1600); await h.press('#id-open'); await h.wait(1400); await h.moveTo('#id-pending'); },
                async (h) => {
                    await h.moveTo('label.interruptor:has(#id-review)');
                    await h.wait(2200);
                    await h.press('#id-pending [data-ok="0"][data-k="tengo hambre"]');
                },
                async (h) => {
                    await h.press('#id-pending > button[data-ok="1"]');
                    await h.wait(3000);
                    await h.moveTo('.id-palabra[data-k="denominador"]');
                },
                async (h) => {
                    await h.press('.id-palabra[data-k="fracciones equivalentes"]');
                    await h.press('.id-palabra[data-k="equivalentes"]');
                    await h.press('#id-merge');
                    await h.wait(1000);
                    await h.moveTo('#id-save');
                },
            ],
            practice: {
                prep: async (h) => { await openIdeas(h); await h.type('#id-q', t('hp_nube_q'), true); },
                targets: [
                    { sel: '#id-open' },
                    { sel: '#id-pending > button[data-ok="1"]', settle: true },
                ],
                after: 2600,
            },
        },
        // «En vivo» · quiz: year six wrote it for year four, played in teams.
        concurso: {
            quick: true,
            setup: async (h) => { await openQuiz(h); },
            steps: [
                async (h) => { await h.wait(1600); await h.moveTo('#lv-kind [data-v="quiz"]'); },
                async (h) => {
                    await h.press('#qz-new');
                    await h.type('#qz-name', QUIZ_NAME);
                    await h.press('details.qz-pegar > summary');
                    await h.wait(300);
                    // «Prompt for your AI»: opened, a topic, and the prompt it writes (already in the paste format).
                    await h.press('details.qz-pegar details.ct-ai > summary');
                    await h.type('details.qz-pegar .ct-ai-topic', t('hp_concurso_topic'));
                    await h.moveTo('details.qz-pegar .ct-ai-text');
                    await h.wait(1200);
                    await h.press('details.qz-pegar details.ct-ai > summary');
                    await h.type('#qz-paste', QUIZ_TEXT, true);   // pasted: all at once
                    await h.wait(1300);
                    await h.press('#qz-paste-go');
                    await h.wait(600);
                    await h.press('#qz-done');
                },
                async (h) => {
                    await h.press('#qz-teams [data-v="pick"]');
                    await h.wait(900);
                    await h.press('#lv-start');
                    await h.until('#qz-go');
                    await h.wait(600);
                    await h.moveTo('.lv-equipos');
                },
                async (h) => {
                    await h.press('#qz-go');
                    await h.moveTo('#qz-clock');
                    await h.wait(800);
                    await h.moveTo('.qz-contestado');
                    await h.until('.qz-reveal', 12000);
                    await h.wait(500);
                    await h.moveTo('.qz-tile.bien');
                },
                async (h) => {
                    await h.press('#qz-next');                     // «Next question»
                    await h.until('.qz-reveal', 12000);
                    await h.wait(900);
                    await h.press('#qz-next');                     // «See the podium»
                    await h.wait(2200);
                },
            ],
            practice: {
                prep: async (h) => {
                    await openQuiz(h);
                    await h.press('#qz-new', true);
                    await h.type('#qz-name', QUIZ_NAME, true);
                    await h.type('#qz-paste', QUIZ_TEXT, true);
                    await h.press('#qz-paste-go', true);
                    await h.press('#qz-done', true);
                    await h.press('#qz-teams [data-v="pick"]', true);
                    await h.press('#lv-start', true);
                    await h.until('#qz-go');
                    await h.wait(900, true);
                },
                targets: [
                    { sel: '#qz-go' },
                    { sel: '#qz-next', settle: true },
                ],
                after: 2600,
            },
        },
        // «En vivo» · buzzers: catch the mistake hidden in a text read aloud. Three teams.
        pulsadores: {
            quick: true,
            setup: async (h) => { await openBuzz(h); },
            steps: [
                async (h) => { await h.wait(2000); await h.moveTo('#lv-kind [data-v="buzz"]'); },
                async (h) => {
                    await h.wait(600);
                    await h.press('#lv-mas');                       // three teams
                    await h.wait(700);
                    await h.press('#lv-start');
                    await h.until('#lv-open');
                    await h.wait(1200);
                    await h.moveTo('#lv-teams');
                },
                async (h) => { await h.wait(400); await h.press('#lv-open'); await h.wait(600); await h.moveTo('#lv-winner'); },
                async (h) => {
                    await h.until('.lv-ganador', 8000);
                    await h.wait(700);
                    await h.moveTo('.lv-ganador');
                    await h.wait(1500);
                    await h.moveTo('#lv-presses');
                },
                async (h) => {
                    await h.press('#lv-open');                      // closed
                    await h.wait(1200);
                    await h.press('#lv-open');                      // «Another round»
                    await h.until('.lv-ganador', 8000);
                    await h.wait(900);
                    await h.moveTo('.lv-ganador');
                },
            ],
            practice: {
                prep: async (h) => {
                    await openBuzz(h);
                    await h.press('#lv-mas', true);
                    await h.press('#lv-start', true);
                    await h.until('#lv-open');
                    await h.wait(900, true);
                },
                targets: [
                    { sel: '#lv-open' },
                    { sel: '#lv-open', ready: '.lv-ganador' },
                ],
                after: 2200,
            },
        },
        // «En vivo» · a show of hands, without devices: the class pet gets its name at circle time.
        manos: {
            setup: async (h) => { await openHands(h); },
            steps: [
                async (h) => { await h.wait(1800); await h.moveTo('#lv-kind [data-v="hands"]'); },
                async (h) => {
                    await h.wait(600);
                    await h.choose('#lv-vote', 'custom');
                    await h.wait(500);
                    await h.type('#lv-custom', PET_NAMES);
                },
                async (h) => {
                    await h.type('#lv-hq', PET_QUESTION);
                    await h.tap(`#lv-hbars [data-o="${pet(0)}"][data-d="1"]`, 5, 170);
                },
                async (h) => {
                    await h.tap(`#lv-hbars [data-o="${pet(1)}"][data-d="1"]`, 9, 150);
                    await h.tap(`#lv-hbars [data-o="${pet(2)}"][data-d="1"]`, 6, 150);
                    await h.wait(400);
                    await h.tap(`#lv-hbars [data-o="${pet(2)}"][data-d="-1"]`, 1);   // one too many
                },
                async (h) => {
                    await h.moveTo('#lv-hbars .lv-barra:nth-child(2) .lv-pista');
                    await h.wait(1800);
                    await h.press('#lv-hreset');
                },
            ],
            practice: {
                prep: async (h) => {
                    await openHands(h);
                    await h.choose('#lv-vote', 'custom', true);
                    await h.type('#lv-custom', PET_NAMES, true);
                    await h.type('#lv-hq', PET_QUESTION, true);
                },
                targets: [
                    { sel: `#lv-hbars [data-o="${pet(2)}"][data-d="1"]` },
                    { sel: '#lv-hreset' },
                ],
                after: 2200,
            },
        },
        // «En vivo» · the exit ticket five minutes before break: who has handed it in, how the class is getting on, and
        // the doubts in piles (the 21 invented tickets of the practice board).
        salida: {
            steps: [
                async (h) => { await h.wait(1600); await h.press('#t-envivo'); await h.press('#lv-kind [data-v="exit"]'); },
                async (h) => {
                    await h.moveTo('#ex-feel');
                    await h.wait(1200);
                    await h.moveTo('#ex-q0');
                    await h.choose('select[data-i="1"]', t('lv_ex_p_doubt'));
                    await h.wait(800);
                },
                async (h) => {
                    await h.press('#lv-identity [data-v="anon"]', true);
                    await h.press('#lv-start');
                    await h.wait(1200);
                    await h.press('#ex-open');
                    await h.wait(1600);
                    // 21 of the 22 hand it in before it is closed (eight of them «halfway», as the voice says).
                    await h.until('#ex-done li:nth-child(21)', 15000);
                    await h.moveTo('#ex-count');
                    await h.wait(1200);
                    await h.moveTo('#ex-missing');
                },
                async (h) => { await h.wait(900); await h.press('#ex-close'); await h.wait(900); await h.moveTo('#ex-bars'); },
                async (h) => {
                    await h.press('#ex-show');
                    await h.wait(900);
                    await h.moveTo('#ex-piles .ex-monton:nth-child(2) h4');
                    await h.wait(2200);
                },
            ],
            practice: {
                prep: async (h) => {
                    await h.press('#t-envivo', true);
                    await h.press('#lv-kind [data-v="exit"]', true);
                    await h.press('#lv-identity [data-v="anon"]', true);
                    await h.press('#lv-start', true);
                    await h.until('#ex-open:not([hidden])');
                },
                targets: [
                    { sel: '#ex-open' },
                    { sel: '#ex-close', delay: 3000 },
                ],
                after: 2600,
            },
        },
        // Balance scale: 3x + 1 = x + 9 and «move the 1 over and subtract», the scene of the teacher's guide.
        balanza: {
            steps: [
                // The balance comes up as the voice gets to it, at the end of the line.
                async (h) => { await h.wait(4500); await h.press('#t-material'); await h.press('#mt-mode [data-mode="balanza"]'); },
                async (h) => {
                    await h.wait(800);
                    await h.press('#ba-kind [data-v="equation"]');
                    await h.type('#ba-eq', '3x + 1 = x + 9');
                    await h.press('#ba-put');
                    await h.wait(600);
                    await h.moveTo('#ba-text');
                },
                async (h) => {
                    // The 1 off the left pan only: the scale tips and the note says so; then a 1 off the right pan.
                    await h.press('#ba-l .ct-ba-u');
                    await h.wait(1200);
                    await h.moveTo('#ba-text');
                    await h.wait(1600);
                    await h.press('#ba-r .ct-ba-u');
                    await h.wait(900);
                },
                async (h) => { await h.wait(3200); await h.press('#ba-x'); await h.wait(900); await h.moveTo('#ba-text'); },
                async (h) => {
                    await h.wait(600);
                    await h.press('#ba-share');
                    await h.wait(1600);
                    // «Put» again: the same equation; opening the boxes shows a 4 in each (4 + 4 + 4 + 1 = 4 + 9).
                    await h.press('#ba-put');
                    await h.wait(500);
                    await h.press('#ba-reveal');
                    await h.wait(1000);
                    await h.moveTo('#ba-l');
                    await h.wait(700);
                    await h.moveTo('#ba-r');
                },
            ],
            practice: {
                // The same equation on the scale, at once.
                prep: async (h) => {
                    await h.press('#t-material', true);
                    await h.press('#mt-mode [data-mode="balanza"]', true);
                    await h.press('#ba-kind [data-v="equation"]', true);
                    await h.type('#ba-eq', '3x + 1 = x + 9', true);
                    await h.press('#ba-put', true);
                },
                targets: [{ sel: '#ba-one' }, { sel: '#ba-x' }, { sel: '#ba-share' }],
                after: 2600,
            },
        },
        // «My exercises»: the frog's life cycle written by the teacher in «Order», saved, played and checked.
        ejercicios: {
            steps: [
                async (h) => {
                    await h.wait(1400);
                    await h.press('#t-juegos');
                    await h.press('#ga-mode [data-game="ordenar"]');
                    await h.wait(600);
                    await h.moveTo('#ordenar-ex');   // «Example: The water cycle», the first of the list
                },
                async (h) => {
                    await h.press('#ordenar-edit');
                    await h.moveTo('#ex-ed-text');
                    await h.wait(1200);              // the empty box shows the examples as a model
                    await h.type('#ex-ed-text', t('hp_ejercicios_text'));
                },
                async (h) => {
                    await h.moveTo('#ex-ed-count');  // «1 exercise ready»: the format is right
                    await h.wait(1600);
                    await h.press('.ct-ex-editor .ct-ex-ai summary');
                    await h.type('.ct-ex-editor .ct-ai-topic', t('hp_ejercicios_topic'));
                    await h.wait(400);
                    await h.moveTo('.ct-ex-editor .ct-ai-text');
                    await h.wait(1200);
                    await h.press('.ct-ex-editor button[value="save"]');
                },
                async (h) => {
                    // Saved, the new one is chosen (the last of the list, after the examples of the level).
                    await h.moveTo('#ordenar-ex');
                    await h.press('#ordenar-start');
                    // Said by the class, a little wrong: the tadpole with legs before the tadpole.
                    for (const i of [0, 2, 1, 3]) { await h.press(`#ordenar-pool [data-i="${i}"]`); }
                    await h.press('#ordenar-check');
                    await h.moveTo('#ordenar-msg');   // «2 of 4 in their place»: the two wrong ones back in the pool
                    await h.wait(500);
                    await h.moveTo('#ordenar-why .ante');
                },
                async (h) => {
                    await h.wait(600);
                    await h.press('#ordenar-pool [data-i="1"]');
                    await h.press('#ordenar-pool [data-i="2"]');
                    await h.press('#ordenar-check');
                    await h.wait(1800);
                    for (const g of ['clasificar', 'errores', 'quiensoy']) { await h.moveTo(`#ga-mode [data-game="${g}"]`); await h.wait(250); }
                },
            ],
            practice: {
                // «My exercises» open and empty, to write one from scratch.
                prep: async (h) => {
                    await h.press('#t-juegos', true);
                    await h.press('#ga-mode [data-game="ordenar"]', true);
                    await h.press('#ordenar-edit', true);
                    await h.type('#ex-ed-text', '', true);
                },
                targets: [
                    { sel: '#ex-ed-text', event: 'input', auto: (h) => h.type('#ex-ed-text', t('hp_ejercicios_practice')) },
                    // «input» counts at the first letter: «Save» is ringed a moment later, so the typing ends first.
                    { sel: '.ct-ex-editor button[value="save"]', delay: 2500 },
                ],
                after: 2400,
            },
        },
        // «Hands up or cards»: the trick question of the kilo of straw, the cards printed, «In groups», two minutes to
        // convince, and the cards read by the camera (in the practice board, a class drawn with the real marks).
        tarjetas: {
            steps: [
                async (h) => {
                    await h.wait(1400);
                    await h.press('#t-envivo');
                    await h.press('#lv-kind [data-v="hands"]');
                    await h.type('#lv-hq', t('hp_tarjetas_q'));
                },
                async (h) => {
                    await h.press('#lv-hprint');
                    // The formats one after the other as the voice names them, and back to the one that is turned.
                    for (const f of ['rotate', 'four', 'light', 'yesno', 'rotate']) { await h.choose('#tc-format', f); }
                    await h.moveTo('#tc-for');
                    await h.press('#tc-print');
                    // The print, shown as a sheet over the practice board (practice.js): the cards of Lucía and Hugo.
                    await h.until('#pr-hoja-cerrar', 5000);
                    await h.wait(1600);
                },
                async (h) => {
                    await h.press('#pr-hoja-cerrar');
                    await h.press('#lv-hgroups');
                    await h.wait(500);
                    await h.moveTo('.tc-zona:nth-child(2)');   // B, the blue: the kilo of iron
                    await h.wait(900);
                },
                async (h) => {
                    await h.press('#tc-talk');
                    await h.moveTo('#tc-say');
                    await h.wait(1600);
                    await h.press('#tc-back');
                    await h.press('#lv-hscan');
                    // The practice camera sweeps the class in five seconds: the readings come as it goes.
                    await h.press('#tc-cam');
                    await h.moveTo('.tc-camara');
                    await h.wait(1500);
                },
                async (h) => {
                    await h.until('#tc-bars .lv-barra:nth-of-type(3)');
                    await h.wait(2400);
                    await h.moveTo('#tc-bars .lv-barra:nth-of-type(3)');   // C, the yellow
                    await h.wait(600);
                    await h.press('#tc-missing > summary');
                    await h.moveTo('#tc-missing-list');
                    await h.wait(1200);
                    await h.press('label.interruptor:has(#tc-names)');
                    await h.moveTo('#tc-bars .tc-quienes');
                    await h.wait(1600);
                },
            ],
            practice: {
                prep: async (h) => {
                    await openHands(h);
                    await h.type('#lv-hq', t('hp_tarjetas_q'), true);
                },
                targets: [{ sel: '#lv-hscan' }, { sel: '#tc-cam' }],
                after: 5200,
            },
        },
        // Calculator: the museum trip, (24 − 3) × 6 with brackets, estimating first, step by step, and the cube root.
        calculadora: {
            steps: [
                async (h) => {
                    await h.wait(1400);
                    await h.press('#t-material');
                    await h.press('#mt-mode [data-mode="calc"]');
                    await h.moveTo('#ca-result');
                },
                async (h) => {
                    for (const k of ['(', '2', '4', '−', '3', ')', '×', '6']) { await h.press(`#ca-keys [data-k="${k}"]`); }
                },
                async (h) => {
                    await h.press('label.interruptor:has(#ca-guess-on)');
                    await h.press('#ca-keys [data-k="equals"]');
                    await h.moveTo('#ca-result');                 // «?», in yellow
                    await h.wait(2200);
                    await h.press('#ca-reveal');
                },
                async (h) => {
                    await h.moveTo('label.interruptor:has(#ca-steps-on)');
                    await h.wait(500);
                    await h.moveTo('#ca-lines li:first-child .ca-hacer');   // underlined: what is done now
                    await h.wait(900);
                    await h.moveTo('#ca-lines li:nth-child(2) .ca-hecho');  // in green: what has just been worked out
                    await h.wait(900);
                    await h.moveTo('#ca-lines li:last-child');
                },
                async (h) => {
                    // Estimating off again, so the cube root comes out at once.
                    await h.press('label.interruptor:has(#ca-guess-on)', true);
                    await h.press('#ca-kind [data-v="sci"]');
                    await h.press('#ca-keys [data-k="second"]');
                    await h.moveTo('#ca-keys [data-k="sin("]');            // now sin⁻¹
                    await h.press('#ca-keys [data-k="√("]');               // now ∛
                    for (const k of ['2', '7', 'equals']) { await h.press(`#ca-keys [data-k="${k}"]`); }
                    await h.moveTo('#ca-result');
                },
            ],
            practice: {
                prep: async (h) => {
                    await h.press('#t-material', true);
                    await h.press('#mt-mode [data-mode="calc"]', true);
                    await h.press('label.interruptor:has(#ca-guess-on)', true);
                    for (const k of ['(', '2', '4', '−', '3', ')', '×', '6']) { await h.press(`#ca-keys [data-k="${k}"]`, true); }
                },
                targets: [{ sel: '#ca-keys [data-k="equals"]' }, { sel: '#ca-reveal', delay: 1600 }],
                after: 2600,
            },
        },
        // Simon with syllables, five minutes before reading: the word lit syllable by syllable, then written whole for
        // them to split it, and in capitals in Early years.
        silabas: {
            steps: [
                async (h) => {
                    await h.wait(1400);
                    await h.press('#t-juegos');
                    await h.press('#ga-mode [data-game="simon"]');
                    await h.moveTo('#si-kind');
                },
                async (h) => {
                    await h.choose('#si-kind', 'syllables');
                    await h.moveTo('#si-syl');                  // «Its syllables light up», the one there is at first
                    await h.wait(600);
                    await h.press('#si-start');
                    await h.until('#si-board.ct-locked');        // the syllables light up, and the word forms above them
                    await h.moveTo('#si-show');
                    await h.wait(900);
                },
                async (h) => {
                    await h.until('#si-board:not(.ct-locked)', 15000);   // the whole word has been shown: their turn
                    await pressWord(h);
                    await h.until('#si-show.ct-palabra');
                    await h.moveTo('#si-show');                 // the word, whole and in green, before the next one
                    await h.wait(300);
                },
                async (h) => {
                    // Back to the settings, «It is written and they split it» (the game starts again from two syllables).
                    await h.press('#ga-setup');
                    await h.choose('#si-syl', 'read');
                    await h.press('#si-start');
                    await h.pause(1000);
                    await pressWord(h);
                    // The second word of two syllables, split at once; then the first of three.
                    await nextWord(h);
                    await pressWord(h, true);
                    await nextWord(h);
                    await h.moveTo('#si-show');
                    await h.wait(1200);
                },
                async (h) => {
                    // Early years: the pads and the word in capitals at once.
                    await h.press('#b-modo');
                    await h.press('#menu-modo [data-modo="early"]');
                    await h.wait(900);
                    await h.moveTo('#si-show');
                    await h.wait(600);
                    await h.moveTo('#si-board .ct-pad[data-i="0"]');
                    await h.wait(1200);
                },
            ],
            practice: {
                prep: async (h) => {
                    await h.press('#t-juegos', true);
                    await h.press('#ga-mode [data-game="simon"]', true);
                    await h.choose('#si-kind', 'syllables', true);
                    await h.choose('#si-syl', 'read', true);
                },
                targets: [
                    { sel: '#si-start' },
                    // Done when the word comes out whole, in green (its transition ends on #si-show).
                    { sel: '#si-board', event: 'transitionend', on: '#si-show', delay: 1200, auto: (h) => pressWord(h) },
                ],
                after: 2400,
            },
        },
        // Score: the relay song, one note each on the board's glockenspiel.
        partitura: {
            steps: [
                async (h) => { await h.wait(1600); await h.press('#t-material'); await h.press('[data-mode="score"]'); },
                async (h) => { await h.choose('#sc-song', 'p:alegria'); await h.wait(800); await h.moveTo('#sc-song'); },
                async (h) => { await h.press('#sc-play'); await h.wait(3800); await h.press('#sc-play'); },
                async (h) => {
                    await h.press('[data-v="play"]');
                    for (let n = 0; n < 4; n++) { await h.wait(500); await h.press('.ct-sc-tecla.siguiente'); }
                },
                async (h) => { await h.press('[data-v="game"]'); await h.wait(1500); await h.press('.ct-sc-tecla[data-s="30"]'); await h.wait(1200); },
            ],
            practice: {
                prep: async (h) => {
                    await h.press('#t-material', true); await h.press('[data-mode="score"]', true);
                    await h.choose('#sc-song', 'p:alegria', true);
                },
                targets: [
                    { sel: '[data-v="play"]' },
                    { sel: '.ct-sc-tecla.siguiente', delay: 400 },
                ],
                after: 2200,
            },
        },
        // Hangman: a mystery word that opens a new topic.
        ahorcado: {
            steps: [
                async (h) => { await h.wait(1600); await h.press('#t-juegos'); await h.press('[data-game="ahorcado"]'); },
                async (h) => {
                    await h.choose('#ah-src', 'type');
                    await h.type('#ah-word', t('hp_ahorcado_word'));
                    await h.type('#ah-clue', t('hp_ahorcado_clue'));
                },
                async (h) => {
                    await h.press('#ah-start');
                    for (const k of ['E', 'S', 'O', 'A']) { await h.press(`[data-k="${k}"]`); }
                },
                async (h) => { for (const k of ['U', 'R']) { await h.press(`[data-k="${k}"]`); await h.wait(500); } },
                async (h) => {
                    await h.press('#ga-setup');                      // «Ajustes»: the settings come back
                    await h.wait(500);
                    await h.choose('#ah-src', 'builtin');
                    await h.wait(1200);
                },
            ],
            practice: {
                prep: async (h) => {
                    await h.press('#t-juegos', true); await h.press('[data-game="ahorcado"]', true);
                    await h.choose('#ah-src', 'type', true); await h.type('#ah-word', t('hp_ahorcado_word'), true);
                },
                targets: [
                    { sel: '#ah-start' },
                    { sel: '[data-k="E"]' },
                ],
                after: 2200,
            },
        },
        // Letter wheel: Friday revision, two teams with their clocks.
        rosco: {
            steps: [
                async (h) => { await h.wait(1600); await h.press('#t-juegos'); await h.press('[data-game="rosco"]'); },
                async (h) => { await h.press('[data-who="teams"]'); await h.choose('#ro-time', '150'); await h.press('#ro-start'); },
                async (h) => {
                    await h.wait(600); await h.press('#ro-ok');
                    await h.wait(1500); await h.press('#ro-bad');
                    await h.wait(2600);
                },
                async (h) => { await h.moveTo('#ro-teams .ct-active'); await h.wait(1600); await h.press('#ro-pass'); await h.wait(900); },
                async (h) => {
                    await h.press('#ro-end');                        // the result, and then «Cambiar de rosco»: the settings
                    await h.wait(1600);
                    await h.press('#ro-change');
                    await h.wait(500);
                    await h.moveTo('#ro-new');
                    await h.wait(900);
                },
            ],
            practice: {
                prep: async (h) => { await h.press('#t-juegos', true); await h.press('[data-game="rosco"]', true); },
                targets: [
                    { sel: '#ro-start' },
                    { sel: '#ro-ok', delay: 500 },
                ],
                after: 2400,
            },
        },
        // Dice: the question die after reading a story, with the class list as the other die.
        dados: {
            steps: [
                async (h) => { await h.wait(1600); await h.press('#t-azar'); await h.press('#h-azar [data-mode="dice"]'); },
                async (h) => {
                    await h.press('#h-azar [data-n="2"]');
                    await h.choose('#h-azar select[data-i="0"]', 'list:aula-g1');
                    await h.wait(500);
                    await h.choose('#h-azar select[data-i="1"]', 'custom');
                },
                async (h) => { await h.type('#di-custom', QUESTION_FACES); },
                async (h) => { await h.press('#di-roll'); await h.wait(2200); await h.moveTo('#h-azar .ct-dados, #h-azar .ct-dice, #di-roll'); },
                async (h) => {
                    await h.choose('#h-azar select[data-i="1"]', 'ops');
                    await h.wait(500); await h.press('#di-roll'); await h.wait(1400);
                    // «Many rolls»: only with dice of numbers; two of them, a thousand at once, and the chart against the expected.
                    await h.choose('#h-azar select[data-i="0"]', 'd6');
                    await h.choose('#h-azar select[data-i="1"]', 'd6');
                    await h.choose('#di-many', '1000');
                    await h.press('#di-many-go');
                    await h.moveTo('#di-freq');
                    await h.wait(1800);
                },
            ],
            practice: {
                prep: async (h) => { await h.press('#t-azar', true); await h.press('#h-azar [data-mode="dice"]', true); },
                targets: [
                    { sel: '#h-azar [data-n="3"]' },
                    { sel: '#di-roll' },
                ],
                after: 2600,
            },
        },
        // Whiteboard (full): magic shapes and formulas, for maths.
        pizarra: {
            steps: [
                async (h) => { await h.wait(1600); await h.press('#t-pizarra'); },
                async (h) => {
                    await h.press('#wb-full');
                    await h.wait(500);
                    await h.draw('#wb-ink', ROUGH_TRIANGLE, { px: true, hold: 900 });
                },
                async (h) => { await h.draw('#wb-ink', roughCircle(560, 150, 85), { px: true, hold: 900 }); },
                async (h) => {
                    await h.press('#h-pizarra [data-v="formula"]');
                    await h.draw('#wb-ink', [[880, 120], [880, 120]], { px: true, after: 500 });
                    await h.type('#fx-src', '(x^2 + 1)/2');
                    await h.wait(900);
                    await h.press('#fx-ok');
                },
                async (h) => {
                    await h.press('#h-pizarra [data-v="select"]');
                    await h.gesture('#wb-ink', [[190, 150], [330, 170]], { px: true, every: 16, step: 6 });
                },
            ],
            practice: {
                prep: async (h) => { await h.press('#t-pizarra', true); await h.press('#wb-full', true); },
                targets: [{ sel: '#wb-ink', event: 'pointerup',
                    auto: (h) => h.draw('#wb-ink', roughCircle(420, 150, 80), { px: true, hold: 900 }) }],
                after: 2200,
            },
        },
        // Whiteboard (full): the curtain and the spotlight to correct an exercise answer by answer.
        cortina: {
            setup: async (h) => { await answersOnBoard(h); },
            steps: [
                async (h) => { await h.wait(1200); await h.moveTo('#wb-ink'); },
                async (h) => { await h.press('#h-pizarra [data-in="curtain"]'); await h.wait(600); },
                async (h) => {
                    const H = (await h.rect('#wb-ink')).height;      // down to under each answer, whatever the size of the board
                    await h.drag('.ct-wb-cortina [data-edge="n"]', 0, Math.round(H * 0.37));
                    await h.wait(1300);
                    await h.drag('.ct-wb-cortina [data-edge="n"]', 0, Math.round(H * 0.24));
                    await h.wait(700);
                },
                async (h) => {
                    await h.press('.ct-wb-cortina .ct-wb-cerrar');
                    await h.press('#h-pizarra [data-in="spot"]');
                    await h.wait(500);
                    await h.drag('.ct-wb-foco .ct-foco-sombra', -260, -60, { at: [0.06, 0.5] });   // from the dark, not the lit hole
                    await h.wait(800);
                },
                async (h) => {
                    await h.press('.ct-wb-foco .ct-wb-cerrar');
                    await h.press('#h-pizarra [data-v="laser"]');
                    await h.draw('#wb-ink', [[120, 190], [260, 205], [380, 190], [300, 175], [200, 200]], { px: true, every: 22 });
                    await h.wait(900);
                },
            ],
            practice: {
                prep: async (h) => { await answersOnBoard(h); },
                targets: [
                    { sel: '#h-pizarra [data-in="curtain"]' },
                    { sel: '.ct-wb-cortina [data-edge="n"]', event: 'pointerup', on: '.ct-wb-cortina', delay: 400,
                        auto: (h) => h.drag('.ct-wb-cortina [data-edge="n"]', 0, 90) },
                ],
                after: 2200,
            },
        },
        // Whiteboard (full): ruler, protractor and compass, the real instruments of a geometry lesson.
        instrumentos: {
            setup: async (h) => { await h.press('#t-pizarra', true); await h.press('#wb-full', true); },
            steps: [
                async (h) => { await h.wait(1200); await h.moveTo('#h-pizarra [data-in="ruler"]'); },
                async (h) => {
                    await h.press('#h-pizarra [data-in="ruler"]');
                    await h.pause(1000);                              // the ruler comes in: measured once it is still
                    const ink = await h.rect('#wb-ink'), r = await h.rect('.ct-in-is-ruler [data-act="move"]');
                    const y = r.bottom - ink.top + 6;                // along its lower edge (the upper one can be at the top of the board)
                    await h.draw('#wb-ink', [[r.left - ink.left + 30, y], [r.left - ink.left + 360, y + 4]], { px: true, every: 16 });
                },
                async (h) => {
                    await h.press('.ct-in-is-ruler [data-act="close"]');
                    await h.press('#h-pizarra [data-in="protractor"]');
                    await h.wait(500);
                    await h.drag('.ct-in-is-protractor [data-act="arm"]', -230, 30);   // from 60° to about 120°
                    await h.wait(900);
                },
                async (h) => {
                    await h.press('.ct-in-is-protractor [data-act="close"]');
                    await h.press('#h-pizarra [data-in="compass"]');
                    await h.wait(500);
                    await h.drag('.ct-in-is-compass [data-act="open"]', -30, 0);
                    await compassCircle(h, 0.85);
                },
                async (h) => {
                    await h.press('#h-pizarra [data-in="ruler"]');
                    await h.wait(400);
                    await h.drag('.ct-in-is-ruler [data-act="turn"]', -20, -150);
                    await h.wait(800);
                },
            ],
            practice: {
                prep: async (h) => { await h.press('#t-pizarra', true); await h.press('#wb-full', true); },
                targets: [
                    { sel: '#h-pizarra [data-in="compass"]' },
                    { sel: '.ct-in-is-compass [data-act="pencil"]', event: 'pointerup', on: '.ct-wb-inst', delay: 400,
                        auto: (h) => compassCircle(h, 0.9) },
                ],
                after: 2200,
            },
        },
        // Scoreboard · the class goal: the rocket in Primary, the path in Early years and the mosaic in Secondary, then
        // the plant up to its fruit.
        meta: {
            steps: [
                async (h) => { await h.wait(1600); await h.press('#t-marcador'); await h.press('#h-marcador [data-v="goal"]'); },
                async (h) => { await h.moveTo('#gl-more'); await h.wait(600); await h.type('#gl-prize', t('hp_meta_prize')); },
                async (h) => {
                    // Eight points: the rocket passes Mars, and its fact comes out under it.
                    await h.tap('#h-marcador [data-s="1"]', 3, 450);
                    await h.wait(1200);
                    await h.press('#h-marcador [data-s="5"]');
                    await h.wait(700);
                    await h.moveTo('#gl-caption');
                },
                async (h) => {
                    // The same goal in Early years (the path) and in Secondary (the mosaic, with the fraction).
                    await h.wait(800);
                    await h.press('#b-modo'); await h.press('#menu-modo [data-modo="early"]');
                    await h.wait(3600);
                    await h.press('#b-modo'); await h.press('#menu-modo [data-modo="secondary"]');
                    await h.wait(900);
                    await h.moveTo('#gl-count');
                },
                async (h) => {
                    await h.press('#b-modo', true); await h.press('#menu-modo [data-modo="primary"]', true);
                    await h.choose('#gl-look', 'planta');
                    await h.wait(2600);
                    await h.tap('#h-marcador [data-s="5"]', 4, 380);
                    await h.tap('#h-marcador [data-s="1"]', 2, 450);
                    await h.wait(2400);
                },
            ],
            practice: {
                prep: async (h) => { await h.press('#t-marcador', true); await h.press('#h-marcador [data-v="goal"]', true); },
                targets: [{ sel: '#h-marcador [data-s="5"]' }],
                after: 2600,
            },
        },
        // «Live» · the fixed remote: the board in the pocket, going from table to table while the class works in groups.
        mando: {
            setup: async (h) => { await openFixedRemote(h); },
            steps: [
                async (h) => { await h.wait(1800); await h.press('[data-rm="on"]'); await h.until('.ct-rm .lv-qr'); },
                async (h) => {
                    await h.moveTo('.ct-rm .lv-qr');
                    await h.phone(true);
                    await h.until('movil:#jn-herr');
                    await h.wait(1800);
                    await h.moveTo('.ct-rm-ok', true);                // «Phone connected»
                    await h.moveTo('movil:#jn-herr');
                },
                async (h) => {
                    await h.press('movil:#jn-herr');
                    await h.press('movil:#jn-hoja [data-cmd="tool_temporizador"]');
                    // The phone shows the timer's own buttons once it hears the board is on it.
                    await h.until('movil:[data-cmd="x_go"]');
                    await h.wait(800);
                    await h.press('movil:[data-cmd="x_go"]');
                    await h.wait(1600);
                    await h.press('movil:[data-cmd="x_pl"]');
                    await h.wait(1500);
                    await h.moveTo('#tm-cifras');
                },
                async (h) => {
                    // The orders for any tool, under «More orders».
                    await h.press('movil:#jn-b-mas');
                    await h.press('movil:#jn-hoja [data-cmd="pick"]');
                    await h.wait(2600);
                    await h.moveTo('#q-nombre');
                    // The phone draws itself again for «Whose turn?»: «More orders» is opened once it has.
                    await h.pause(1800);
                    await h.press('movil:#jn-b-mas');
                    await h.press('movil:#jn-hoja [data-cmd="curtain"]');
                    await h.wait(2000);
                },
                async (h) => {
                    // The phone draws itself again once it hears the board is on another tool: only then is the list of
                    // classes opened, or it would close under the pointer.
                    await h.pause(1800);
                    await h.press('movil:#jn-b-clase');
                    await h.until('movil:#jn-clases-lista button');
                    await h.moveTo('movil:#jn-clases-lista');
                    await h.wait(2000);
                },
            ],
            practice: {
                prep: async (h) => {
                    await openFixedRemote(h);
                    await h.press('[data-rm="on"]', true);
                    await h.until('.ct-rm .lv-qr');
                    await h.press('#t-temporizador', true);
                    await h.phone(true, true);
                    await h.until('movil:[data-cmd="x_go"]');
                },
                targets: [{ sel: 'movil:[data-cmd="x_go"]' }, { sel: 'movil:#jn-b-mas' }, { sel: 'movil:#jn-hoja [data-cmd="pick"]' }],
                after: 3400,
            },
        },
    };
})();
