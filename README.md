# Class tools (Oksigenia Classtools)

Classroom board tools for Moodle with **the course students already loaded, with their photos**: timer,
stopwatch, name picker, random groups, noise meter, dice and coin, work symbols, clock and QR code. Made to be
shown big on the classroom board.

- **Where:** in each course bar, right after «Course», and in the main menu, only for teachers
  (`local/oksigeniaclasstools:use`: teacher, non-editing teacher and manager). Without a course,
  `/local/oksigeniaclasstools/` lists the teacher's courses and can open the tools without a list.
- **Lists:** one per group and one per cohort enrolled with cohort sync (a course with cohorts 5A to 5F gives six
  lists), sorted, and the whole course last. A group and a cohort with the same members or name appear once; groups
  without students are skipped. Separate groups mode is respected. Large profile photo or initials.
- **Who is missing today:** tap absent students and they are left out of picks and groups that day (browser only).
- **Fair picking:** each pick is recorded (course, student, teacher, time). «Least picked first» picks among the
  students picked least in the last N days (setting, 90 by default), with any teacher of the course.
  «Participation» shows those counts.
- **Save teams:** after making groups, «Save as course groups» (only when pressed; nothing is created by default,
  and only with `moodle/course:managegroups`) creates a dated grouping with one group per team. Those groups are not
  offered as lists afterwards.
- **Privacy:** full provider (exports and deletes picks). Picks are removed with their course or user.

## Development

The board screen lives in `app/` and is also packaged as a standalone SCORM 1.2 package. `./build.sh` builds the
installable zip in `dist/`. Requires Moodle 4.5 or later (navigation hooks `primary_extend` and `secondary_extend`).

The component name `local_oksigeniaclasstools` never changes, so each new release installs over the previous one
and keeps its data.

## Licence

GNU GPL v3 or later. © 2026 Oksigenia.
