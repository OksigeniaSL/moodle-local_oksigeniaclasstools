// The steps of the guided helps (help.js plays them): for each help, what the pointer does on the practice board in
// each watched step (with h, the hand of help.js), what is done at once before the first one (setup), and «Now you»:
// what is ready before (prep) and the buttons the teacher presses (targets). Their captions, hints and what is typed
// are language strings (hp_<help>_1…, hp_<help>_h1…). From the guided helps of the art direction
// (kit/ayuda-guiada/piezas.js), with their own words for each language.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const t = (k) => (window.ClasstoolsCore ? window.ClasstoolsCore.t(k) : k);

    // --- What several helps do at once (from the art direction's pieces) ------------------------------------
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
        // Rosco: Friday revision, two teams with their clocks.
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
                    await h.wait(500); await h.press('#di-roll'); await h.wait(1800);
                    await h.choose('#h-azar select[data-i="1"]', 'dir8');
                    await h.wait(500); await h.press('#di-roll'); await h.wait(1600);
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
    };
})();
