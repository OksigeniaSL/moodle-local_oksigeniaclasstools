# Content packs

One file per language with the content of the games and materials: `window.CLASSTOOLS_CONTENT = {…}`. Moodle loads
the one of the user's language (`es_mx.js` for es_mx, then the base language, then `en.js`); outside Moodle the
board loads `es.js`. The interface texts are not here: they are the language strings (`lang/`).

Check a file with `node tools/content_check.js app/content/xx.js` (all of them without arguments).

| Key | What |
| --- | --- |
| `lang` | Moodle language code (`es`, `es_mx`, `en`, `de`, `fr`, `it`, `nl`, `sv`, `pt_br`). |
| `decimal` | Decimal mark (`,` or `.`). |
| `alphabet` | The letters of the language, in order, each one a letter of its own (Ñ in Spanish, Å Ä Ö in Swedish, Ä Ö Ü ß in German). Used by the rosco, the letter dice and cards, Stop, Hangman and Word. |
| `fold` | Letters that count as another one (`{ Á: 'A', Ç: 'C' }`), in capitals. Letters of the alphabet are never folded. |
| `keyboard` | On-screen keyboard rows, with every letter of the alphabet once (QWERTY, QWERTZ, AZERTY…). |
| `vowels` | Faces of the vowels die. |
| `stopOut` | Letters left out of «Stop» (hardly any word starts with them). |
| `words.early` | Hangman in the Early years mode: 40–60 very short, concrete words (3–6 letters) that children of 3–6 know and can picture: animals, food, toys, the body, home. |
| `words.long` | Hangman in the Primary mode: 40–60 words known by children of 8–12 (animals, nature, school, things). |
| `words.secondary` | Hangman in the Secondary mode: 40–60 words of 6 or more letters from the subjects of ages 12–16 (science, maths, language, history, geography, technology, art, music). |
| `words.advanced` | Hangman in the Advanced mode: 40–60 demanding words of 8 or more letters from upper secondary and university (sciences, humanities, philosophy, economics). |
| `words.four` | Word in the Early years mode: 40–60 easy words of exactly four letters once folded. |
| `words.five` | Word in the Primary mode: 40–60 words of exactly five letters once folded. |
| `words.six` | Word in the Secondary mode: 40–60 words of exactly six letters once folded. |
| `words.seven` | Word in the Advanced mode: 40–60 words of exactly seven letters once folded, of an educated adult vocabulary. |
| `avatar` | Names of the anonymous participants of a live session, made of an animal and a word: `{ order, join, animals, words }`. `order` is `aw` (animal then word: «Búho valiente») or `wa` (word then animal: «Brave owl»); `join` is what goes between them (`' '`, `'-'` or `''`). `animals`: 40–60 animals children like, singular, written as inside a sentence (the board puts the first letter in capitals); no animal used as an insult in the language. `words`: 30–50 positive words or short phrases that go with **every** animal without changing (in languages where adjectives agree in gender, use invariable ones or phrases like «de la suerte», «en patines»; or a compound pattern with `join: '-'`, like «Turbo-Bär»). |
| `colours` | 12 colour names, in this order: red, blue, green, yellow, purple, orange, pink, brown, black, white, grey, light blue. |
| `numbers` | 1 to 20 in words. |
| `opposites` | 16 pairs of opposites. |
| `elements` | Names of H, He, Li, C, N, O, F, Ne, Na, Mg, Al, Si, P, S, Cl, Ar, K, Ca, Fe, Cu, Zn, Ag, Sn, I, Au, Hg, Pb, U (28). |
| `units` | 15 pairs [quantity, SI unit «name (symbol)»]: length, mass, time, temperature, current, amount of substance, luminous intensity, force, energy, power, pressure, frequency, charge, voltage, resistance. |
| `prefixes` | 12 pairs [«name (symbol)», power of ten]: tera … pico. |
| `formulas` | 16 pairs [formula, name]: H₂O, CO₂, NaCl, NH₃, CH₄, H₂SO₄, HCl, NaOH, CaCO₃, O₃, C₆H₁₂O₆, HNO₃, CO, H₂O₂, C₂H₅OH, Fe₂O₃. |
| `laws` | 15 pairs [formula, name] (Newton's second law, mass–energy, Ohm, ideal gas, gravitation, Coulomb, photon energy, momentum, kinetic and potential energy, work, power, density, wave speed, Hooke). |
| `functions` | 12 labels, in this order: y = x², x³, √x, 1/x, sine, cosine, eˣ, ln x, \|x\|, 2x + 1, −x², x (with the usual sine notation of the language). |
| `derivatives` | 11 pairs [f(x), f′(x)]. |
| `integrals` | 12 pairs [integrand with dx, primitive + C]. |
| `groups` | 13 pairs [functional group, name] (alcohol, aldehyde, ketone, carboxylic acid, ester, ether, amine, amide, nitrile, nitro, alkene, alkyne, halide). |
| `constants` | 12 pairs [value with the language's decimal mark, name]. |
| `greek` | 13 pairs [letter, its name]: α β γ δ ε θ λ μ π ρ σ φ ω. |
| `clock(t)` | The time in words, as said in the classroom, for `t` minutes after midnight (0–1439), 12-hour, first letter in capital: «Las tres y cuarto», «Quarter past three», «Viertel nach drei». |
| `rosco` | One item per letter of the alphabet: [letter, `s` (starts with) or `c` (contains), clue, answer]. Clues for children of 8–12, neutral (no places or people of one country). |
| `lock` | The example lock, code 4127: `{ name, final, clues: [4 clues, one per digit, 4 then 1 then 2 then 7] }`. |

Word lists: capitals, only letters of the alphabet (no spaces, hyphens or apostrophes), no proper names, no repeated
words, and each Hangman word in one list only.

Content rules: neutral examples (nothing local, no politics, no current-affairs days); generic masculine where the
language has gender («alumno», not «alumno/a»); no emoji.
