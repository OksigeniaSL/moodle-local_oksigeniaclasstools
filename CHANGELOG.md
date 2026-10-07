# Changelog

## 0.5.0 (2026-10-07)

- Four more whole-class games:
  - **Hangman**, made friendly for primary school: seven balloons, and each wrong letter pops one.
  - **Word** (like Wordle): 5 to 8 tries, green, yellow and grey, coloured keyboard; any try of the right length
    counts.
  - **Pairs**: shapes and colours, a colour and its name, a number and its name, a student's face and their name, or
    the teacher's lists («dog = perro» per line); the whole class or two teams.
  - **Secret code**: an escape-room lock with clues revealed one by one, optional countdown and a final message;
    an example lock and an editor, kept in Moodle like the roscos.
- Word games share a Spanish on-screen keyboard (with Ñ), accent-insensitive letters and a hidden or random word.

## 0.4.1 (2026-10-07)

- Scripts and styles are requested with the plugin version in their address, so after an upgrade the browser does
  not mix old cached files with new ones (a stale `icons.js` broke the tabs).
- A missing icon is left blank instead of stopping the whole screen.

## 0.4.0 (2026-10-07)

- **Games** tab for the whole class: **Rosco** (letter ring with a clue per letter; the whole class or two teams
  with their own rosco and clock; right, wrong and «pasapalabra» with Enter, Backspace and the space bar; an
  example rosco and an editor for the teacher's own) and **Simon** (4 or 6 pads with notes, normal or fast; with a
  class list, a different student repeats the sequence each round, shown with their face, and the record is kept).
- **Kept in Moodle**: what each teacher keeps of each tool in each course (scoreboard, roscos) is saved in the new
  table `local_oksigeniaclasstools_state`, so it goes on from any computer. Covered by the privacy provider and
  removed with its course or user.
- Shorter tab labels so that all tabs fit at 1280 px.

## 0.3.0 (2026-10-07)

- **Chance** replaces «dice and coin»: a configurable wheel (class lists with faces, own lists, numbers; optionally
  removing what comes out), dice of 4, 6, 8, 10, 12 and 20 faces plus operations, directions, colours, vowels,
  letters and custom faces (number–operation–number dice show the result), coins with motifs (heads or tails,
  yes or no, true or false, teams, thumbs, even or odd, custom) and cards (letters, letters for the «Stop» game,
  numbers, class lists with faces, own lists; with or without repeating).
- **Scoreboard**: 2 to 8 teams with big buttons (−1, +1, +5, +10), the leader crowned, teams taken from the groups
  made on the board (with their faces), kept per course in the browser.
- The board's internal API (`window.ClasstoolsCore`) lets new tools live in their own files.

## 0.2.0 (2026-10-07)

- First release under the final component name `local_oksigeniaclasstools` (prototype: `local_miclase`).
- Lists per group and per enrolled cohort; whole course last.
- Fair picking with recorded picks, «Participation», «Save as course groups» (opt-in).
- Course bar and main menu links; full privacy provider.
