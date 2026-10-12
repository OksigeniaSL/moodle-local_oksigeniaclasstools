// The steps of the guided helps (help.js plays them): for each help, what the pointer does on the practice board in
// each watched step (with h, the hand of help.js), what is done at once before the first one (setup), and «Now you»:
// what is ready before (prep) and the buttons the teacher presses (targets). Their captions and hints are language
// strings (hp_<help>_1…, hp_<help>_h1…). From the guided helps of the art direction (kit/ayuda-guiada/piezas.js).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const t = (k) => (window.ClasstoolsCore ? window.ClasstoolsCore.t(k) : k);
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
    };
})();
