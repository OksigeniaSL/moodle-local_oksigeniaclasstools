<p>Board tools for the classroom, with the course students already loaded and their photos. Teachers open them from any course (the link sits in the course bar, and in the main menu), put them on the classroom screen, and the whole class plays along. Try it without installing anything: <a href="https://oksigenia.com/demo/classtools/">public demo</a>.</p>
<h3>What's inside</h3>
<ul>
<li><strong>Name picker</strong> with each student's photo, no repeats until everyone has been picked, and fair picking: whoever has been picked least in the last weeks comes first, with any teacher of the course. «Participation» shows the counts. <strong>Who is missing today</strong> leaves absent students out of picks and groups for the day.</li>
<li><strong>Groups</strong>: random groups with faces and a role for each one, which the teacher can save as course groups, only when they ask.</li>
<li><strong>Timer and stopwatch</strong>, big and readable from the back of the room, with work and rest blocks and a small timer in a corner while another tool is in front.</li>
<li><strong>Scoreboard and class goal</strong>: 2 to 8 teams, or a goal of the whole class as a jar of marbles, a path, a plant that grows, a rocket through the solar system or a mosaic. Kept in Moodle, so it goes on from any computer.</li>
<li><strong>Chance</strong>: configurable wheel, dice (many throws at once, with a chart of the results), coins and cards.</li>
<li><strong>Games</strong>: alphabet wheel, Simon, clap echo, hangman, word (like Wordle), pairs (built-in sets by school level, the course glossaries or the question bank) and secret code; and four exercise games, Order, Sort, Spot the mistakes and Who am I?, with examples for each level and the teacher's own exercises.</li>
<li><strong>Materials</strong> for touch boards: Cuisenaire rods, tangram, number line, fraction wall, geoboard, base blocks, a balance scale, a coordinate plane, a timeline from days to the age of the Earth, 3D shapes that turn and unfold into their nets, a calculator (basic or scientific) and a score with a glockenspiel and other instruments. Six of them also as a <strong>duel</strong>, two students with the same challenge.</li>
<li><strong>Drawing board</strong>, simple or full: backgrounds for each lesson, several fingers at once, pages kept in the course, a picture or a PDF as background, magic shapes, formulas, ruler, set squares, protractor and compass, curtain and spotlight. It can be shared with a class as a file in the course.</li>
<li><strong>Live sessions</strong>: the class joins from tablets or phones with a QR code or a code (no account needed) or with their Moodle account, by name or anonymous. Vote, team buzzers, a brainstorm that becomes a live word cloud, a quiz with teams, pictures and questions from the course question bank (also music: which song is it, rhythm and melody dictation), and an exit ticket at the end of the lesson. Without devices: hands up or <strong>printed cards</strong>, counted by hand or read with the camera of the board's computer or of the teacher's phone.</li>
<li><strong>The teacher's phone as a remote</strong>, also from a fixed address, with the buttons of the tool on the board and a big button a child can press.</li>
<li><strong>Two tools at once</strong>, each in one half of the screen.</li>
<li><strong>Clock</strong> (learning to tell the time, and a countdown to an event), <strong>noise meter</strong> (microphone level only; nothing is recorded or sent), work symbols and a QR code with styles.</li>
<li><strong>Presentation</strong> (optional, off by default): a Canva presentation inside the board, with «Whose turn?» and a clear sheet to write on it.</li>
</ul>
<h3>For teachers</h3>
<ul>
<li><strong>Teacher's guide</strong> of what is on screen: what it is for, why (with its sources), how to take it to class and what it gives at each school level.</li>
<li><strong>Guided helps</strong> with voice and captions on a practice board with an invented class, and then «Now you».</li>
<li><strong>My stickers</strong>: each tool has a sticker, earned by using it for real with a class, with levels by days of use. Only each teacher sees theirs. An optional <strong>teachers' room</strong> shows the colleagues who choose to appear, never with counts or rankings.</li>
<li>From Moodle 4.5, the <strong>AI of the site</strong> can write quiz questions, alphabet wheels, words, pairs, exercises, songs and timelines, for the teacher to check before saving.</li>
</ul>
<h3>From early years to university</h3>
<p>Each course picks one of four screen modes: Early years, Primary, Secondary or Advanced (upper secondary and university). The mode changes the look and how the tools start (bigger buttons and colours for the youngest, the full board and sober screens for the older ones) and puts first what suits the level; the rest stays one tap away.</p>
<h3>Lists from the course</h3>
<p>One list per group and per cohort enrolled with cohort sync, and the whole course. Separate groups mode is respected.</p>
<h3>Configuration</h3>
<p>Under Site administration → Plugins → Local plugins → Class tools (Oksigenia Classtools): how names are shown on the board, the days counted for fair picking, the default screen mode (also by category), the school levels whose built-in sets are offered, which tools, games and materials the site shows, whether students get a limited board (only tools without data of the class), live sessions, stickers and the teachers' room, and the link in the main menu. Under Site administration → Reports → Use of the boards, the administrator sees how many times each tool, game and material was chosen and for how long, by students and by teachers. A user tour shows teachers where the tools are. Access is gated by the capability local/oksigeniaclasstools:use (teacher, non-editing teacher and manager by default); saving groups also needs moodle/course:managegroups.</p>
<h3>Privacy</h3>
<p>All tables with personal data are covered by the privacy provider (export and deletion) and removed with their course or user: the picks (deleted once older than the days counted for fair picking), what each teacher keeps of each tool in each course, the live sessions and their answers (deleted after a day; with the code only or anonymous, no user id is kept), the teacher's stickers, the fixed remote and the pictures of quiz questions. The use of the boards is counted per course and day, with no user. No external services, no CDN, no tracking; the optional presentation loads from canva.com only when the administrator turns it on.</p>
<h3>Languages</h3>
<p>Interface in English and Spanish, other languages through AMOS. The built-in content (alphabet, words, pair sets, the time in words) comes in nine languages, and the guided helps have voice in English and Spanish.</p>
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
