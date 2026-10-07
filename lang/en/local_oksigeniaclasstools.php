<?php
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
 * English strings for local_oksigeniaclasstools.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['choose'] = 'Which class?';
$string['choose_desc'] = 'Pick a course and the tools open with its students already loaded.';
$string['days'] = 'Days counted for fair picking';
$string['days_desc'] = 'When picking, students who have been picked least in these last days come first. It is also the period shown in «Participation».';
$string['groupingname'] = '{$a->list} · teams of {$a->when}';
$string['level_early'] = 'Early years';
$string['level_higher'] = 'Higher education';
$string['level_primary'] = 'Primary';
$string['level_secondary'] = 'Secondary';
$string['level_upper'] = 'Upper secondary';
$string['levels'] = 'School levels';
$string['levels_desc'] = 'The levels taught at this school. The games offer their built-in sets (shapes, animal shadows, times tables, chemical elements, graphs of functions…) only for these levels, and teachers can narrow them further on the board.';
$string['menu'] = 'Link in the main menu';
$string['menu_desc'] = 'Shows the classroom tools in the top menu to anyone who teaches a course. Inside each course the link is always in the course bar.';
$string['namestyle'] = 'Name on the board';
$string['namestyle_desc'] = 'How each student is shown in the name picker and in groups.';
$string['namestyle_first'] = 'First name only';
$string['namestyle_firstsurname'] = 'First name and first surname';
$string['namestyle_full'] = 'Full name';
$string['navlabel'] = 'Class tools';
$string['nocourses'] = 'You do not teach in any course. You can still use the tools and paste your own lists.';
$string['oksigeniaclasstools:use'] = 'Use the classroom tools with the course students';
$string['pluginname'] = 'Class tools (Oksigenia Classtools)';
$string['privacy:metadata:picks'] = 'Each time a student is picked on the board, so that those picked least come first and participation can be seen. Picks are deleted once they are older than the days counted for fair picking.';
$string['privacy:metadata:picks:courseid'] = 'The course where the pick happened.';
$string['privacy:metadata:picks:teacherid'] = 'The teacher who made the pick.';
$string['privacy:metadata:picks:timecreated'] = 'When the student was picked.';
$string['privacy:metadata:picks:userid'] = 'The student who was picked.';
$string['privacy:metadata:state'] = 'What each teacher keeps of each tool in each course (for example the scoreboard or their roscos), to go on from any computer.';
$string['privacy:metadata:state:courseid'] = 'The course.';
$string['privacy:metadata:state:data'] = 'What is kept (team names, scores, questions…).';
$string['privacy:metadata:state:timemodified'] = 'When it was last saved.';
$string['privacy:metadata:state:tool'] = 'The tool.';
$string['privacy:metadata:state:userid'] = 'The teacher.';
$string['standalone'] = 'Open without a course';
$string['students'] = 'Open the board to students';
$string['students_desc'] = 'Students get a link to the board in each course, with only the tools that use no data of the class: the games (Simon, the tangram, the rods…), the drawing board, the timer, the stopwatch, the clock and the QR code. They never see lists of names, photos, picks or groups, and nothing of theirs is saved in Moodle. When it is off, only teachers see the tools.';
$string['taskpurgepicks'] = 'Delete old picks';
$string['teamname'] = 'Team {$a->n} · {$a->list} · {$a->when}';
$string['tourdescription'] = 'Shows teachers where the classroom tools are.';
$string['tourname'] = 'Class tools';
$string['tourstep1content'] = '<p>For the classroom screen, with the students of this course and their photos: whose turn it is, random groups, a scoreboard, games for the whole class, Cuisenaire rods and a tangram, a noise meter, a timer and more.</p>';
$string['tourstep1title'] = 'New: Class tools';
$string['tourstep2content'] = '<p>From any page, to open them in any of your courses.</p>';
$string['tourstep2title'] = 'Also in the main menu';
$string['tourstep3content'] = '<p>Open them in full screen: everything works with fingers. The scoreboard, your roscos and your locks follow you to any computer.</p>';
$string['tourstep3title'] = 'On the interactive whiteboard';
$string['wholeclass'] = 'Whole class';
$string['wholecourse'] = 'Whole course';
