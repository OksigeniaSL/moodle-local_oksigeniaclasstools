# Moving the board's UI texts to language packs — rules for every helper

Repository: /home/eraorahan/Downloads/Oksigenia/moodle-local_oksigeniaclasstools (Moodle plugin «Class tools»).
The classroom board is plain JavaScript in `app/`. Today its UI texts are Spanish literals in the code. They must
come from Moodle language packs instead, so a German or English site gets its own language.

## The API (already in place in app/app.js — do not change it)
- `t(key, a)` in app.js; every other file gets it as `core.t` (e.g. `const { t } = core;` or `core.t(...)`).
- Placeholders are Moodle's: `{$a}` for a single value, `{$a->name}` for an object property.
  `t('wo_letters', 5)` with «Palabra de {$a} letras»; `t('found', { a: 2, b: 8 })` with «{$a->a} de {$a->b} parejas».
- Plurals: two keys, `..._one` and `..._many`; code chooses: `t(n === 1 ? 'me_moves_one' : 'me_moves_many', n)`.
- Static texts in app/index.html: add `data-t="key"` to the element that holds ONLY the text. If the text is a bare
  text node next to an icon span (`<button><span data-icono="x"></span>Ampliar</button>`), wrap it:
  `<button><span data-icono="x"></span><span data-t="key">Ampliar</span></button>`. Attributes: `data-t-title`,
  `data-t-aria` (for aria-label) and `data-t-placeholder`. Keep the Spanish text in the HTML as it is (it is the
  fallback); app.js replaces it at start.

## Keys
- Lowercase `[a-z0-9_]`, starting with the area prefix given to you (e.g. `ro_` for the rosco). Short and clear in
  English: `ro_start`, `ro_tries_one`. In the JSON you write them WITHOUT the `app_` prefix (the language pack adds it).
- Reuse one key for the same text within your files; do not invent keys for texts that are not shown to people.

## What to translate and what not
- Translate every text people see or hear: labels, buttons, messages, titles, aria-labels, placeholders, notes,
  announcements (`announce(...)`), select options that are UI (e.g. «Sin tiempo», «Todos los niveles», preset NAMES).
- Do NOT translate content data: word lists, example roscos and locks, pair presets' DATA (element names, units,
  opposites, colour names used as pair content, number words, laws…), the tangram figure data. Leave them exactly as
  they are; put one comment above each such block: `// Content in Spanish: per-language content comes in a later step.`
- Do not touch: lang/*, app/app.js (unless it is in your list), app/styles.css, other helpers' files, PHP files.

## How to change the code
- Keep each file's `STR` object if it has one, but fill it from `t()`:
  `name: t('ro_name')`, `tries: (n) => t(n === 1 ? 'sc_tries_one' : 'sc_tries_many', n)`.
  Prefer this (it keeps the logic untouched) over scattering `t()` through the code.
- Inline literals elsewhere in your files: replace with `t('key')` / STR entries.
- Inside HTML attribute values built in template strings, wrap with the file's escape helper: `title="${escape(t('x'))}"`
  (or `escapa(...)` in app.js). Inside element text in innerHTML templates the current code inserts STR raw; keep that.
- No behaviour changes: same ids, classes, structure, logic. `node --check` must pass for every file you edit.

## Output
Write `/tmp/claude-1000/-home-eraorahan-Downloads-Nuryana/d3d0199c-a443-427c-b1c3-ea422947c319/scratchpad/i18n/<your-name>.json`:
```json
{ "ro_start": { "en": "Start", "es": "Empezar" }, ... }
```
- `es`: EXACTLY the Spanish text that is in the code today (same words, punctuation, «» quotes, ustedes forms).
- `en`: natural British English (Moodle's English uses «colour»), short like the Spanish; same placeholders.
- Keep `es` and `en` placeholders identical. Use «» → “” in English if quotes are needed.
Finally reply with: files changed, number of keys, and any text you deliberately left untranslated (and why).
