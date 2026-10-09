<p>Board tools for the classroom, with the course students already loaded and their photos. Teachers open them from any course (the link sits in the course bar, and in the main menu), put them on the classroom screen, and the whole class plays along.</p>
<h3>What's inside</h3>
<ul>
<li><strong>Name picker</strong> with each student's photo, no repeats until everyone has been picked, and fair picking: whoever has been picked least in the last weeks comes first, with any teacher of the course. «Participation» shows the counts.</li>
<li><strong>Who is missing today</strong>: absent students are left out of picks and groups for the day.</li>
<li><strong>Random groups</strong> with faces, which the teacher can save as course groups (a dated grouping, one group per team), only when they ask.</li>
<li><strong>Scoreboard</strong> for 2 to 8 teams, taking the groups just made, kept in Moodle so the contest goes on from any computer.</li>
<li><strong>Chance</strong>: configurable wheel, dice (4 to 20 faces, operations, directions, colours, letters, custom faces), coins with motifs and cards.</li>
<li><strong>Games</strong>: rosco, Simon, hangman (with balloons), word (like Wordle), pairs (built-in sets by school level, from animal shadows and clocks to chemical elements and graphs of functions, plus faces and names) and secret code (an escape-room lock with clues).</li>
<li><strong>Materials</strong> for touch boards: Cuisenaire rods, tangram, number line, fraction wall, geoboard, base-10 blocks, a calculator (basic or scientific) and a score with a glockenspiel: notes written with a tap, played with sounds made in the browser, «play with me», a note game, traditional songs of many countries, and songs brought in as text or ABC.</li>
<li><strong>Live sessions</strong>: the class joins from tablets or phones with a QR code or a code (no account needed) or with their Moodle account, by name or anonymous. Vote, team buzzers, the teacher's phone as a remote, a brainstorm that becomes a live word cloud or is sorted into templates, and a quiz with teams, pictures and questions from the course question bank.</li>
<li><strong>Noise meter</strong> (microphone level only; nothing is recorded or sent) with a light that breathes with the noise, a calm streak and a patience reserve.</li>
<li><strong>Drawing board</strong>, simple or full: backgrounds for each lesson (squared paper, handwriting lines, music staves, chalkboards), several fingers at once, pages kept in the course, a picture or a PDF as background, magic shapes, formulas, ruler, set squares, protractor and compass, curtain and spotlight. Shared with a class as a file in the course.</li>
<li><strong>Clock</strong>: learning to tell the time (five levels and two class games) and a countdown to an event.</li>
<li>Timer (also in work and rest blocks), stopwatch, class goal, work symbols and a QR code with styles, the site logo and PNG/SVG download.</li>
</ul>
<h3>From early years to university</h3>
<p>Each course picks one of four screen modes: Early years, Primary, Secondary or Advanced (upper secondary and university). The mode changes the look and how the tools start (bigger buttons and colours for the youngest, the full board and sober screens for the older ones), never which tools there are.</p>
<h3>Lists from the course</h3>
<p>One list per group and per cohort enrolled with cohort sync (a course with cohorts 5A to 5F gives six lists), and the whole course. Separate groups mode is respected.</p>
<h3>Configuration</h3>
<p>Under <em>Site administration → Plugins → Local plugins → Class tools (Oksigenia Classtools)</em>: how names are shown on the board, the days counted for fair picking, the school levels whose built-in sets are offered, whether students get a limited board (only tools without data of the class: no names, photos, picks or groups), and the link in the main menu. A user tour shows teachers where the tools are. Access is gated by the capability <code>local/oksigeniaclasstools:use</code> (teacher, non-editing teacher and manager by default); saving groups also needs <code>moodle/course:managegroups</code>.</p>
<h3>Privacy</h3>
<p>Four tables and one file area, all covered by the privacy provider: the picks (deleted once older than the days counted for fair picking), what each teacher keeps of each tool in each course, live sessions and their answers (deleted after a day; with the code only or anonymous, no user id is kept) and the pictures of quiz questions. No external services, no CDN, no tracking.</p>
<h3>Sponsorship</h3>
<p>The plugin is FOSS and stays FOSS. If your school depends on it, sponsor its development at <a href="https://oksigenia.com/en/open-source#sponsor">oksigenia.com/en/open-source</a>. Sponsorship gets you logo placement, priority issue triage and weight in the public roadmap.</p>
<h3>Installation and support</h3>
<p>Optional service for schools that want it installed, configured and kept up to date on their Moodle, with training for teachers. Details at <a href="https://oksigenia.com/en/services/moodle">oksigenia.com/en/services/moodle</a>.</p>
<h3>Requirements</h3>
<ul>
<li>Moodle 4.3 or later (the main-menu link from 4.4).</li>
<li>Tested on Moodle 4.3 to 5.3 and on the development branch: PHPUnit and Behat tests run on every branch in CI.</li>
<li>Any theme and any modern browser.</li>
</ul>
<h3>License</h3>
<p>GPL v3 or later. Bundled QR generator (MIT), Nunito font (SIL OFL 1.1), Font Awesome Free icons (CC BY 4.0) and PDF.js (Apache 2.0).</p>
