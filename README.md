# Class tools for Moodle (Oksigenia Classtools)

[![License: GPLv3](https://img.shields.io/badge/license-GPLv3+-blue.svg)](LICENSE)
![Moodle](https://img.shields.io/badge/Moodle-4.5%2B-orange)
![Status](https://img.shields.io/badge/status-beta-yellow)
[![Sponsor](https://img.shields.io/badge/sponsor-Oksigenia-00d4ff)](https://oksigenia.com/en/open-source#sponsor)

Board tools for the classroom, **with the course students already loaded and their photos**. Open them from any
course, put them on the classroom screen and the whole class plays along: a name picker that is fair over the
weeks, random groups that can become course groups, a scoreboard, chance tools and whole-class games.

Local plugin (`local_oksigeniaclasstools`). It works with any theme and needs no external service: no CDN, no
tracking, no build step.

## What's inside

| Tool | What it does |
|---|---|
| Timer and stopwatch | Big, readable from the back of the room, with sound. |
| Name picker | Pick a student with their photo. No repeats until everyone has been picked, and **fair picking**: whoever has been picked least in the last weeks comes first (with any teacher of the course). «Participation» shows the counts. |
| Who is missing today | Tap absent students and they are left out of picks and groups for the day. |
| Groups | Random groups with faces. Optionally **saved as course groups** (only when the teacher asks). |
| Scoreboard | 2 to 8 teams, big buttons, the leader crowned. Takes the groups just made, and goes on from any computer. |
| Chance | Configurable wheel (students, own lists, numbers), dice (4 to 20 faces, operations, directions, colours, letters, custom), coins with motifs, and cards. |
| Games | Rosco (letter ring with clues; whole class or two teams), Simon (turns with the class list), Hangman (with balloons), Word (like Wordle), Pairs (shapes, colours, numbers, faces and names, own lists) and Secret code (escape-room lock with clues). |
| Also | Noise meter (microphone level only; nothing is recorded or sent), work symbols, clock and QR code. |

Lists come from the course: one per group and one per cohort enrolled with cohort sync, and the whole course. A
group and a cohort with the same students appear once. Separate groups mode is respected.

## Requirements

- Moodle 4.5 LTS or later (navigation hooks `primary_extend` and `secondary_extend`). Developed and tested on 5.3.
- PHP as required by your Moodle.
- Any theme. A modern browser.

## Install

### From ZIP

1. Download the latest release ZIP from the Releases page.
2. In Moodle: *Site administration → Plugins → Install plugins → Choose file* and pick the ZIP.
3. Confirm the install. Moodle creates two tables (picks and kept tools).

### From Git

```bash
cd /path/to/moodle/public/local/
git clone https://github.com/OksigeniaSL/moodle-local_oksigeniaclasstools.git oksigeniaclasstools
```

Then visit *Site administration → Notifications* to finish the install.

## Who decides what

**Site administrator** — *Site administration → Plugins → Local plugins → Class tools (Oksigenia Classtools)*:

| Setting | Default | Notes |
|---|---|---|
| Name on the board | First name and first surname | Or first name only, or full name. |
| Days counted for fair picking | 90 | Also the period shown in «Participation». |
| Link in the main menu | On | Inside each course the link is always in the course bar. |

**Roles** — capability `local/oksigeniaclasstools:use` (teacher, non-editing teacher and manager by default)
opens the tools with the students of a course. Saving teams as course groups also needs
`moodle/course:managegroups`.

**Teachers** — inside each tool: their own lists, roscos and locks, and the options of each game. Lists pasted by
hand and «who is missing today» stay in their browser; the scoreboard, roscos and locks are also kept in Moodle for
the teacher in the course, so they go on from any computer.

## Privacy

Two tables, both covered by the privacy provider (export and deletion) and removed with their course or user:

- `local_oksigeniaclasstools_picks`: each time a student is picked (course, student, teacher, time).
- `local_oksigeniaclasstools_state`: what each teacher keeps of each tool in each course.

## Status and roadmap

Beta, developed with a school in Tenerife as its test classroom. Before the first stable release:

- **Translations**: the board screen is in Spanish for now; its texts move to the language packs (English first,
  others through AMOS), and the alphabet and on-screen keyboard follow the user's language.
- **Site configuration**: which tools and games are shown, the default Hangman drawing, and site-wide lists, roscos
  and locks shared by all teachers. Built-in examples become neutral and per language.
- **Code**: the board scripts move to AMD modules, with `moodle-plugin-ci` (PHPUnit and Behat) in GitHub Actions.

## Development

The board screen lives in `app/` and is also packaged as a standalone SCORM 1.2 package. `./build.sh` builds the
installable ZIP in `dist/`. The component name `local_oksigeniaclasstools` never changes, so each release installs
over the previous one and keeps its data.

## License

GNU GPL v3 or later. © 2026 Oksigenia. Third-party parts are listed in `thirdpartylibs.xml`: the QR generator
(MIT), the Nunito font (SIL OFL 1.1, `app/fonts/OFL.txt`) and Font Awesome Free icons (CC BY 4.0).
