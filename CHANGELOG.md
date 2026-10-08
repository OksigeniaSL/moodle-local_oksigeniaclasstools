# Changelog

## 0.16.0 (2026-10-17)

- **Live sessions, easier to join**: students enrolled in the course see a small notice with «Join» on the course
  pages while a session is open (setting «Notice for students», on), so they need not type the code or scan the QR.
  On the board, the steps to get in are written under the code (the notice, the QR, the address and the code; no
  account needed with the code, also for people outside Moodle). The choices of what to do and how they join are
  cards with an icon and a line about each one, instead of pills.
- **Timer**: while it runs (or is paused) and another tab is in front, a small timer in a corner shows the time left,
  pauses it, stops it or goes back to it. Its controls fit in the column: «Save» goes to the header of quick times,
  the five looks fit in one row and the traveller is a list. The racing car is a Formula 1 now.
- **Noise meter**: «Adjust to this class» listens a few seconds to the normal noise of the class and puts it in the
  green; the meter rises more slowly (a single bang does not turn it red) and the sensitivity reaches further.
- **Groups**: drag a group by its header to put it in another place (the numbers follow the order); «Clear the
  result» empties the screen.
- **Cuisenaire rods**: table size from 12 to 40 columns, and «Compare: two tables» side by side, each with its own
  numbers on or off.

## 0.15.0 (2026-10-16)

- **Anonymous with their account**, a third way of joining a live session: only the course's students get in, once
  each, but no user id is kept with the answers and the board shows no names. The device says clearly that the
  teacher does not see their name.
- **Critters**: whoever takes part without their name (anonymous, or with the code only) is a little creature drawn
  from their device's token, with a name made of an animal and a word in the teacher's language («Búho valiente»,
  «Brave owl», «Turbo-Bär»). The board shows the critters of those who are in; the device shows its own. Names in the
  nine content packs (`avatar`), with words that work with every animal.
- **Scratch to reveal**: a silver layer to scratch with a finger or the mouse (it uncovers by itself at about half,
  or with «Reveal»): the name in «Whose turn?», each group in «Groups», and the list dice (or all of them) in Dice.
- **Timer bar travellers**: besides the rocket, a racing car, a snail and a sailing boat travel the bar, with a fact
  under it before it starts; for older students, a phone battery that runs down and a retro loading bar of pixels;
  or just the bar. Each screen mode starts with its own (rocket, battery for Secondary, just the bar for Advanced).
- **Class goal**, in the Scoreboard tab: a jar that fills with marbles for the whole class up to a goal and its
  prize, with a celebration when it is full.
- **Countdown**, in the Clock tab: what the class is waiting for, its day and time, the days, hours, minutes and
  seconds left, and the school days in between.
- **Site settings**: the administrator chooses which tools, games and materials the board shows.
- The board's texts are written from JSON fragments in `tools/i18n/` (`python3 tools/i18n/merge.py`).

## 0.14.0 (2026-10-15)

- **Brainstorm**, a new kind of live session: everyone sends a word or two from their device (1, 2 or 3 answers
  each, which they can take back while it is open), with the question on their screen. On the board the answers
  become a live cloud where the same answer however it is written (capitals, accents, punctuation) counts as one and
  grows. The teacher taps answers to highlight them, joins answers that mean the same, hides any of them, and can
  check every answer before it shows («Check before showing»). Views: cloud, ranking (sorted by how many times or
  dragged by hand), and templates to drag the answers into — SWOT, urgent or important, for and against, a scale
  from 1 to 5. The result is saved as an image or sent to the class like a board. A question can be opened again or
  followed by a new one. Answers are kept like those of a vote (in the same table, one row each; nothing new to
  install).
- **Whiteboard**: more tools — highlighter (see-through, so what is under it still shows), straight line, arrow,
  rectangle, circle or oval, and text — plus redo (also Ctrl+Y) and yellow among the colours. The background is
  chosen in a small panel: plain, squared paper, handwriting lines, double lines (new), lined (new) or music staves,
  now as many as fit and spread over the board; its size can be made smaller or bigger (from 60 % to 250 %, and each
  screen mode starts with its own: bigger for Early years, smaller for Advanced), with a red margin line on the left
  like in the notebooks. Eraser, undo, download and send are icons now, so the bar fits in one row.
- «Send to the class» takes a picture from another tool too (`ClasstoolsWhiteboard.share`).

## 0.13.0 (2026-10-14)

- **Screen modes that show**: each mode has a look of its own, so the class sees at once which one is on.
  - Early years: a toy — bigger and rounder, sunny ground, chunky buttons that press in, each tab with its colour,
    keyboard rows in colours.
  - Primary: the look as it was.
  - Secondary: a notebook — flat cards, square corners, tabs underlined instead of filled, calmer weights.
  - Advanced: an instrument — dark top bar, faint graph-paper ground, the system typeface, light digits, thin lines.
- **Each mode starts with its own values**, and remembers what the teacher changes in it:
  - Hangman: very short words (Early years), primary school words, secondary school subject words, or demanding
    upper secondary and university words; the list says which. Word: four, five, six or seven letters. New lists in
    the nine content packs (`words.early`, `secondary`, `advanced`, `four`, `six`, `seven`).
  - Timer: the red disc for the youngest, the ring, or the bar (which in Secondary and Advanced shows the time left,
    thinner); quick times from 1–10 to 5–30 minutes; the last-10-seconds count on only for the younger ones.
  - Geoboard 5 × 5 with the little squares, 5 × 5, 7 × 7 measuring, 10 × 10 measuring. Number line to 10, to 20,
    −10 to 10, or quarters from −2 to 2 (new). Fraction wall: halves and quarters without numbers, the usual rows,
    every row with the ruler, decimals. Base 10 blocks up to the tens (new), the hundreds or the thousands.
- Settings that were saved before the modes (timer look and the last-10-seconds count) go to the mode in use.

## 0.12.0 (2026-10-13)

- **Content in the user's language**: the games and materials take their content from a pack per language
  (`app/content/`): alphabet and letters that count as another, on-screen keyboard (QWERTY, QWERTZ, AZERTY, with Ñ,
  Ä Ö Ü ß or Å Ä Ö as letters of their own), vowels and «Stop» letters, the words of Hangman and Word, every Pairs set
  (colours, numbers, opposites, elements, units, prefixes, formulas, laws, functions, derivatives, integrals,
  functional groups, constants, Greek letters), the time in words as said in each country's classrooms, and the
  example rosco and lock. Packs: English, Spanish (Spain and Mexico), German, French, Italian, Dutch, Swedish and
  Portuguese (Brazil); Moodle picks the user's language, its parent or base language, or English. A checker
  (`tools/content_check.js`) validates each pack. The Spanish example rosco is neutral now (no Teide).
- Clock: on a 12-hour clock, twelve reads as noon in every language («Midi et quart», not «Minuit et quart»).
- Traffic light: «More on the traffic light» with three switches, all off at first: waves from the light when it
  gets loud, a graph of the last minute over the three colour bands, and a face in the lit light.
- Word: the squares size themselves to the space left by the keyboard, so the last row no longer covers the message
  on short screens.

## 0.11.1 (2026-10-12)

- Live vote: it can close by itself after 10, 20 or 30 seconds, 1 or 2 minutes (or not at all, as before). The
  board and the devices show the time left, the last five seconds tick, and Moodle closes it at the second even if
  the board is late: no answer gets in after the time.

## 0.11.0 (2026-10-12)

- Materials, four new ones (each in a file of its own, added to the Materials bar):
  - **Number line**: 0–10, 0–20, 0–100, 0–1000 in tens, −10 to 10, tenths, halves, thirds, quarters or your own;
    taps draw the jumps as arcs («2 + 3 + 4 − 2 = 7»), and the numbers can be hidden and uncovered one by one.
  - **Fraction wall**: from the whole to twelfths, pieces coloured with a tap, equal amounts named
    («1/2 = 2/4 = 4/8»), fractions, decimals or percentages on the pieces, and a ruler that slides across.
  - **Geoboard**: 5×5, 7×7 or 10×10 pegs, bands stretched with taps and corners dragged to other pegs, area in
    little squares and perimeter.
  - **Base 10 blocks**: ones, tens, hundreds (and thousands), + and − or a tap on a block, ten swapped for one and
    one broken into ten, the number as the sum of its places («100 + 40 + 12 = 152»), which can be hidden.
- Live: **Hands up**, a vote counted on the board with + and − (also outside Moodle, where it is the only kind),
  with the usual answers or your own (2 to 5).
- Groups: **a role for each one** (spokesperson, secretary, materials manager, timekeeper, or your own, up to six),
  handed out fairly: each student gets first the role they have had least; «Other roles» hands them out again.

## 0.10.0 (2026-10-11)

- **Live sessions** (new tab «Live», inside a Moodle course):
  - A vote (A–D, yes or no, a traffic light of «I get it», 1 to 5) answered from tablets, Chromebooks or phones;
    while it is open the board only shows how many have answered, and the bars when it closes (also on the devices,
    if the teacher wants).
  - Team buzzers: each device presses for its team and the board shows who was first, with how much later the
    others pressed.
  - The teacher's phone as a remote: timer, «Whose turn?», previous and next tool and Present, on any tool.
  - Two ways in, chosen for each session: with the code or QR of the board (nobody logs in, no names) or with the
    students' Moodle accounts (only the course's students, with their names).
  - Devices join from a page of buttons only, ask every second and a half, and can be taken out by the teacher.
    The board warns when another live session is open on the site. Sessions end 15 minutes after the board is gone
    and are deleted the next day. A site setting turns them off.
- Groups: «Deal them out with suspense» — a card shuffles the names, stops on one, says its group and the name flies
  there, here and there until the last one (slower at the start and the end); «Place everyone now» skips it.
- Dice: a die can be a class list (with photos, leaving out who is missing) or one of the teacher's lists, alone or
  with other dice («Virginia – 6»), with a record of the turns and «No repeats» until everyone has come out.
- Timer: the bar is a rocket that flies to the finish flag, with a moving trail from green to yellow and red (just
  the bar in Secondary and Advanced).
- Screen modes: each one with its colour in the top bar (Early years yellow, Primary green, Secondary blue,
  Advanced red).
- Present also goes full screen, and leaving it leaves full screen; the pill to bring the tools back has a strip of
  its own and no longer covers the tool's switches.

## 0.9.2 (2026-10-10)

- Timer: the «Pulsar» look is now a neutron star like MiNuryana's (two turning beams, expanding rings, stars, the time
  in a capsule and a thin arc for the time left); it no longer shakes. The five looks wrap onto a second row instead
  of overflowing the card.
- The board shows the site's icon in the browser tab (the theme's, or the one set in Appearance), like the rest of
  Moodle.

## 0.9.1 (2026-10-10)

- Timer: a believable hourglass (wooden frame, glass bulbs, sand that falls and piles up) and a new «Pulsar» look (a
  core that shrinks with the time and sends out a wave every second). The «1 minute left» switch only shows for
  timers longer than two minutes, where it applies.

## 0.9.0 (2026-10-10)

- **Screen modes**: Early years, Primary, Secondary and Advanced (upper secondary and university).
  - One at a time, remembered for each course (also in Moodle, so it follows the teacher), changed from a button in
    the top bar.
  - The site setting «Screen mode by default», explained in the admin page, sets where courses start. The games'
    content («School levels») stays separate and can combine levels.
  - No mode removes a tool; the mode changes the look and how things start:
    - Early years: bigger, rounder, with the tangram guide lines on, 6 pairs, a clock at o'clock and lots of
      confetti, and only −1 and +1 on the scoreboard.
    - Secondary and Advanced: squarer and more sober.
    - Advanced: everything at full — 12 pairs of every level, a fast Simon, the clock minute by minute, and no
      confetti.
- **Timer**:
  - Four looks: ring, the red disc that shrinks towards twelve, a bar and an hourglass.
  - A warning when one minute is left, only in timers longer than two minutes (it can be switched off).
  - The last 10 seconds, for the class to count them aloud: every second the digits beat, the timer flashes and a tick
    sounds, higher in the last three (on by default; it can be switched off).
  - Up to two of the teacher's own times next to the usual ones, kept in Moodle.
- **Present**: the top bar steps aside so the tool fills the screen; a small button (or Escape) brings it back.
- **Phones**: the tabs go to the bottom, within reach of the thumb.


## 0.8.1 (2026-10-09)

- **Share the drawing board with a class**, for teachers who can add content to the course:
  - The board is saved in the course, in the section «Class boards», in one folder per class. If the class is a
    Moodle group, only that group sees the folder.
  - It can be saved as PNG, or as PDF made with Moodle's own PDF library.
  - Each student of the class gets a Moodle notification in their language, with a link.
- **The teacher plays too**: a switch, off by default, in «Whose turn» and «Groups».
  - The teacher who opens the board joins the class lists, with their photo, in every tool that uses them: picker,
    groups, wheel, Simon's turns, pairs with faces.
  - Their turns are not saved, and in fair picking they count as one more.
- Opened without a course (inside Moodle), the board has a «Back to home» button, which goes to each user's home
  page.


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
