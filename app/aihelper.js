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
 * «Prompt for your AI», for any editor of content (exercises, quiz questions, a rosco, words, pairs, a song): the topic, the
 * level and how many; a text to copy with the format and an example, to paste in any AI; and, when the site has an AI
 * the teacher can use (Moodle 4.5 and later), «Generate», which asks the server to send that same prompt and puts the
 * answer in the editor to check before saving. The first time, Moodle's AI policy.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { escape, t } = core;
    const AI = core.has && core.has('ai') ? core.moodle : null;
    // The web services ai_accept and ai_generate.
    const call = (action, extra = {}) => core.call('ai_' + action, { courseid: AI.courseid, ...extra });

    /**
     * The prompt of the kinds that are not exercises: what, for whom, on what, the format and an example. The server
     * builds the same one (classes/local/ai.php).
     *
     * @param {string} kind quiz, rosco, words or pairs.
     * @param {{n: number, level: string, topic: string, letters: string}} p
     * @return {string}
     */
    const prompt = (kind, p) => t('ai_prompt', {
        what: t('ai_what_' + kind, p.n), level: t('ex_ai_for_' + p.level), topic: p.topic || t('ex_ai_any'),
        rules: t('ai_rules_' + kind, p.letters || ''), example: t('ai_example_' + kind),
    });

    /**
     * A «Prompt for your AI» box for an editor.
     *
     * @param {Object} o
     * @param {function(): string} o.kind What is asked for (the type the server knows).
     * @param {function(Object): string} [o.prompt] The prompt for {n, level, topic, letters} (the common one if not).
     * @param {string[]} o.levels The levels it can be for.
     * @param {number[]} [o.counts] How many can be asked for (none: no choice).
     * @param {number} [o.count] How many at first.
     * @param {function(): string} [o.letters] The letters (for a rosco).
     * @param {{v: string, label: string}[]} [o.kinds] A choice of kinds (words or pairs).
     * @param {function(string): number} o.add Puts what the AI wrote in the editor; how many it took (0: none).
     * @param {function(number): string} [o.done] The message after adding them.
     * @param {function(): boolean} [o.ready] Whether the editor has what the prompt needs (the prompt waits until it does).
     * @param {string} [o.topicLabel] The name of the topic field (a song asks for its name).
     * @param {boolean} [o.noLevel] Without a choice of level (a song is the same for everyone).
     * @return {{el: HTMLElement, refresh: function(string=)}}
     */
    const box = (o) => {
        const el = document.createElement('details');
        el.className = 'ct-ex-ai ct-ai';
        const levels = o.levels.map((m) => `<option value="${m}">${escape(t('mode_' + m))}</option>`).join('');
        const counts = (o.counts || []).map((n) => `<option value="${n}"${n === o.count ? ' selected' : ''}>${n}</option>`).join('');
        el.innerHTML = `<summary>${escape(t('ex_ai'))}</summary>
            <p class="nota">${escape(t(AI ? 'ex_ai_hint_site' : 'ex_ai_hint'))}</p>
            <div class="ct-ex-ai-fields">
                ${o.kinds ? `<label class="campo apilado"><span>${escape(t('ai_for'))}</span><select class="ct-ai-kind">${o.kinds.map((k) => `<option value="${k.v}">${escape(k.label)}</option>`).join('')}</select></label>` : ''}
                <label class="campo apilado"><span>${escape(o.topicLabel || t('ex_ai_topic'))}</span><input type="text" class="ct-ai-topic" maxlength="120"></label>
                <label class="campo apilado"${o.noLevel ? ' hidden' : ''}><span>${escape(t('ex_ai_level'))}</span><select class="ct-ai-level">${levels}</select></label>
                ${counts ? `<label class="campo apilado"><span>${escape(t('ex_ai_count'))}</span><select class="ct-ai-n">${counts}</select></label>` : ''}
            </div>
            <textarea class="ct-ai-text" rows="7" readonly></textarea>
            <div class="botonera">${AI ? `<button type="button" class="boton ct-ai-go"><span data-icono="magia"></span><span>${escape(t('ex_ai_go'))}</span></button>` : ''}
                <button type="button" class="boton suave ct-ai-copy"><span data-icono="duplicar"></span><span>${escape(t('ex_ai_copy'))}</span></button>
                <span class="nota ct-ai-note" aria-live="polite"></span></div>
            ${AI ? `<div class="ct-ex-ai-policy ct-ai-policy" hidden><div class="ct-ai-policy-text"></div>
                <button type="button" class="boton ct-ai-accept"><span data-icono="hecho"></span><span>${escape(t('ex_ai_accept'))}</span></button></div>` : ''}`;
        el.querySelectorAll('[data-icono]').forEach((x) => core.setIcon(x, x.dataset.icono));
        const q = (s) => el.querySelector(s);
        const kind = () => (o.kinds ? q('.ct-ai-kind').value : o.kind());
        const params = () => ({
            n: Number(q('.ct-ai-n') ? q('.ct-ai-n').value : 1), level: q('.ct-ai-level').value,
            topic: q('.ct-ai-topic').value.trim(), letters: o.letters ? o.letters() : '',
        });
        const note = (text) => { q('.ct-ai-note').textContent = text; };
        const fill = () => {
            if (o.ready && !o.ready()) { return; }
            q('.ct-ai-text').value = o.prompt ? o.prompt(params(), kind()) : prompt(kind(), params());
            note('');
        };
        ['.ct-ai-topic', '.ct-ai-level', '.ct-ai-n', '.ct-ai-kind'].forEach((s) => {
            if (q(s)) { q(s).addEventListener('input', fill); q(s).addEventListener('change', fill); }
        });
        q('.ct-ai-copy').addEventListener('click', () => {
            const area = q('.ct-ai-text'), ok = () => note(t('ex_ai_copied'));
            const old = () => { area.select(); document.execCommand('copy'); ok(); };
            if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(area.value).then(ok, old); } else { old(); }
        });
        const generate = () => {
            const go = q('.ct-ai-go'), p = params();
            go.disabled = true;
            note(t('ex_ai_wait'));
            call('generate', { type: kind(), topic: p.topic, level: p.level, n: p.n, letters: p.letters })
                .then((j) => {
                    if (j && j.policy) {
                        q('.ct-ai-policy-text').innerHTML = j.policy;
                        q('.ct-ai-policy').hidden = false;
                        note('');
                        return;
                    }
                    if (!j || !j.ok) { note(t('ex_ai_error', (j && j.error) || '')); return; }
                    const found = o.add(j.text, kind());
                    note(found ? (o.done ? o.done(found) : t('ai_done', found)) : t('ex_ai_none'));
                })
                .catch(() => note(t('ex_ai_error', '')))
                .finally(() => { go.disabled = false; });
        };
        if (AI) {
            q('.ct-ai-go').addEventListener('click', generate);
            q('.ct-ai-accept').addEventListener('click', () => {
                call('accept').then(() => { q('.ct-ai-policy').hidden = true; generate(); }).catch(() => note(t('ex_ai_error', '')));
            });
        }
        // The level of the board, when it is one of the box's; otherwise the first after Early years.
        const refresh = (level) => {
            const want = level || (core.mode ? core.mode() : 'primary');
            q('.ct-ai-level').value = o.levels.includes(want) ? want : (o.levels.find((m) => m !== 'early') || o.levels[0]);
            fill();
        };
        refresh();
        return { el, refresh };
    };

    // The lists editor (of app.js): words for the word games, or pairs «a = b» for Pairs, added at the end of the list.
    const names = document.querySelector('#ed-alumnos');
    const field = names && names.closest('.campo');
    if (field) {
        const lists = box({
            levels: ['early', 'primary', 'secondary', 'advanced'], counts: [10, 20, 30], count: 20,
            kinds: [{ v: 'words', label: t('ai_kind_words') }, { v: 'pairs', label: t('ai_kind_pairs') }, { v: 'trios', label: t('ai_kind_trios') }],
            add: (text, kind) => {
                const lines = text.split(/\r?\n/).map((x) => x.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean)
                    .filter((x) => ({ pairs: /^[^=]+=[^=]+$/, trios: /^[^=]+=[^=]+=[^=]+$/ }[kind] || /^[^=]+$/).test(x));
                if (!lines.length) { return 0; }
                const now = names.value.trim();
                names.value = (now ? now + '\n' : '') + lines.join('\n');
                names.dispatchEvent(new Event('input'));
                return lines.length;
            },
        });
        field.before(lists.el);
        document.addEventListener('classtools:mode', () => lists.refresh());
    }

    window.ClasstoolsAI = { box, prompt, available: !!AI };
})();
