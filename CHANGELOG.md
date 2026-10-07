# Changelog

## 0.8.0 (2026-10-09)

- **Languages**:
  - The board's texts come from the language packs: about 570 strings, in English and Spanish. Each teacher sees the
    board in their language; the time zone and the clock follow the site.
  - Outside Moodle (the SCORM package), `app/strings.js` carries the texts. `tools/strings.py` writes it from a
    language pack, and a test checks it is in step with the English pack.
  - Built-in content (word lists, examples, pair sets) is still in Spanish; it becomes per language next.
- **Moodle 4.3 and 4.4**: the plugin now installs from Moodle 4.3. Where there are no navigation hooks, the link goes
  in the course navigation. The course chooser works with Bootstrap 4 and 5. Moodle 4.1 and 4.2 are not possible:
  their table names are limited to 28 characters.
- **Tangram**:
  - 18 figures: the 5 pictures and the 13 convex shapes of the tangram (square, triangle, rectangle, parallelogram,
    trapezium, two right trapeziums, two pentagons and four hexagons). All were found and solved by exhaustive search.
  - Guide lines can be switched on and off (off by default).
  - When a figure is done: confetti, a glow and a big message with «Another shape».
- **Celebrations** also when Pairs, Word and Hangman are won and when the lock opens.
- Continuous integration from Moodle 4.3.


## 0.7.0 (2026-10-08)

- **Drawing board** (new tab): pens in six colours and three thicknesses, an eraser, undo (also Ctrl+Z), clearing
  with confirmation, and backgrounds: plain, squared paper, handwriting lines and music staves. Several fingers can draw
  at once on a touch board. The drawing can be downloaded as a PNG.
- **Learning to tell the time**, in the Clock tab:
  - The hands are dragged with a finger, and the minute hand takes the hour hand along.
  - The time is shown in digits and in words («las tres y cuarto»); each can be hidden, and digits can be 12 or 24
    hours.
  - Five levels: o'clock, half past, quarters, five minutes, any minute.
  - Two whole-class games: «What time is it?» and «Set the time», where the board checks the answer.
- **Open the board to students** (site setting, off by default). Students get a link in each course with only the
  tools that use no data of the class: games, materials, drawing board, timer, stopwatch, clock and QR. They never see
  names, photos, picks or groups, and nothing of theirs is saved.
- **User tour for teachers**, added on install or upgrade. It shows once per teacher, points at the link in the
  course bar and in the main menu, and says what is inside. Its texts are language strings.
- **Higher education** level in Pairs: integrals, functional groups, physical constants, Greek letters.
- Games step their settings aside while being played («Ajustes» brings them back; they return when the game ends).
  Pairs shows one counter instead of two.
- The tab bar keeps fitting as tools are added. If the tabs do not fit in two rows, the ones not chosen show only
  their icon, with the name on hover.
- Fixes:
  - Roscos, locks and the QR text are kept per course, so one course no longer overwrites another's.
  - The wheel no longer shortens the teacher's own phrases to their first word.
  - Group, cohort and course names with «&» no longer show «&amp;».
  - The clock uses the site's time zone and language.
  - When the Moodle session expires, the board says so instead of losing picks and saved state silently; what is
    pending stays and is sent again.
  - The space bar never acts behind an open dialog.
  - The picker can no longer change lists in the middle of a shuffle, and says when a list is empty or everyone is
    absent.
  - Separate groups: only the teacher's own groups, nothing if they are in none, and picks and teams only with their
    members. Visible groups: all groups.
  - Saving kept state is safe with two tabs, and only for the tools that keep something.
  - Saving teams as groups is all or nothing, with names that always fit.
  - Old picks are deleted every night (older than the days counted for fair picking).
  - The scoreboard no longer wipes a team name being typed when a point is added.
  - Pages scroll on phones over the materials.
  - The tangram is kept after reloading and its silhouette shows better on projectors.
  - The lock's code is hidden while typed.
  - The PNG of a QR code never fails because of the logo.
- Board browsers without container queries (Android WebView before 105) get sizes from the screen instead of zero.
  Better contrast for small grey text and for the letters that are not in the word. 44 px touch areas for the small
  round buttons.
- Capability `local/oksigeniaclasstools:use` is now of type write (its endpoints save picks and state).


## 0.6.0 (2026-10-07)

- **Materials** tab:
  - **Cuisenaire rods**: a staircase from 1 to 10 and a table with a grid. Drag a rod out, or tap it to place it.
    Tap a rod twice to turn it, and drag it back to the staircase to remove it. Numbers can be shown or hidden.
  - **Tangram**: free play or seven silhouettes (square, triangle, house, boat, fish, cat, sailing boat). Each
    silhouette was solved beforehand, so all of them can be made with the seven pieces. Pieces are turned 45° at a
    time and can be flipped. They snap to each other and to the silhouette. The board says when the figure is done,
    and a hint shows where each piece goes.
  - Everything works with fingers on touch boards (pointer events, own double-tap detection) as well as with a mouse
    or the keyboard.
- **Pairs**: built-in sets by school level.
  - Early years: shapes, colours, animal shadows, dots and numbers, capital and small letters.
  - Primary: numbers in words, times tables, clocks, fractions, opposites.
  - Secondary: chemical elements, quantities and units, SI prefixes, equations.
  - Upper secondary: chemical formulas, physics laws, graphs of functions, derivatives.
  - New site setting **School levels** chooses which levels are offered, and teachers can narrow them on the board
    (remembered per course).
- **Noise meter**:
  - The lit light breathes with the noise: it grows and glows more the louder the class is.
  - **Calm streak**: time in green, paused in yellow and reset in red.
  - **Patience**: a reserve that sustained noise uses up and calm refills. A single shout barely touches it. When it
    runs out, the light shakes and a bell sounds.


## 0.5.2 (2026-10-07)

- **QR code**, nicer but still readable: square, rounded (joined) or dot modules; square, rounded or round corners;
  colours that keep strong contrast on white, and a different colour for the corners if wanted; the site's icon in
  the middle (or an image of the teacher's), with the highest error correction and the middle kept clear. Download as
  PNG (1200 px) or SVG, with the logo inside. The code is now centred, and inside a course it starts with the course
  address.
- **Wheel**: with «remove the one that comes out», the last one left is announced instead of spinning for it.
- **Secret code**: the lock opens by itself when the code is complete, so there is no «Open» key; once it is open
  (or the time is up), «Erase» becomes «Again» and starts a new round. Smaller lock on short screens.

## 0.5.1 (2026-10-07)

- **Automated tests**: PHPUnit covers the lists of a course (groups, cohorts, saved teams, separate groups, name
  styles), picks, kept tools, saving teams as groups, the clean-up when a course or user is deleted, the links in
  the course bar and the main menu, and the privacy provider. Behat checks that teachers find the tools in the
  course bar and students do not. GitHub Actions runs `moodle-plugin-ci` on Moodle 4.5 to 5.3 and main.
- The logic behind picks, kept tools and saved teams moved to classes (`classes/local/`); the AJAX scripts only
  check access and call them.
- Code follows the Moodle coding style (codechecker with no warnings).

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
