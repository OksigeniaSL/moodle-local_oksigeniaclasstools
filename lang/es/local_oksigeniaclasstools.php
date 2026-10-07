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
 * Spanish strings for local_oksigeniaclasstools.
 *
 * @package    local_oksigeniaclasstools
 * @copyright  2026 Oksigenia <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['choose'] = '¿Con qué clase?';
$string['choose_desc'] = 'Elige el curso y se abren las herramientas con sus alumnos ya cargados.';
$string['days'] = 'Días que cuentan para el sorteo justo';
$string['days_desc'] = 'Al sortear salen antes los alumnos a los que menos les ha tocado en estos últimos días. También es el periodo que se ve en «Participación».';
$string['groupingname'] = '{$a->list} · equipos del {$a->when}';
$string['level_early'] = 'Infantil';
$string['level_higher'] = 'Universidad y superior';
$string['level_primary'] = 'Primaria';
$string['level_secondary'] = 'Secundaria';
$string['level_upper'] = 'Bachillerato';
$string['levels'] = 'Niveles del centro';
$string['levels_desc'] = 'Los niveles que se imparten en este centro. Los juegos ofrecen sus conjuntos de ejemplo (formas, sombras de animales, tablas de multiplicar, elementos químicos, gráficas de funciones…) solo de estos niveles, y el profesor puede acotarlos aún más en la pantalla.';
$string['menu'] = 'Enlace en el menú principal';
$string['menu_desc'] = 'Muestra las herramientas de clase en el menú de arriba a quien da clase en algún curso. Dentro de cada curso el enlace está siempre en su barra.';
$string['namestyle'] = 'Nombre en la pizarra';
$string['namestyle_desc'] = 'Cómo aparece cada alumno en «¿A quién le toca?» y en los grupos.';
$string['namestyle_first'] = 'Solo el nombre';
$string['namestyle_firstsurname'] = 'Nombre y primer apellido';
$string['namestyle_full'] = 'Nombre completo';
$string['navlabel'] = 'Herramientas de clase';
$string['nocourses'] = 'No das clase en ningún curso. Puedes usar las herramientas igualmente y pegar tus listas.';
$string['oksigeniaclasstools:use'] = 'Usar las herramientas de clase con los alumnos del curso';
$string['pluginname'] = 'Herramientas de clase (Oksigenia Classtools)';
$string['privacy:metadata:picks'] = 'Cada vez que sale un alumno en la pantalla, para que salgan antes los que menos han salido y se vea la participación. Se borran cuando son más antiguos que los días que cuentan para el sorteo justo.';
$string['privacy:metadata:picks:courseid'] = 'El curso en el que se hizo el sorteo.';
$string['privacy:metadata:picks:teacherid'] = 'El profesor que hizo el sorteo.';
$string['privacy:metadata:picks:timecreated'] = 'Cuándo le tocó.';
$string['privacy:metadata:picks:userid'] = 'El alumno al que le tocó.';
$string['privacy:metadata:state'] = 'Lo que cada profesor guarda de cada herramienta en cada curso (por ejemplo, el marcador o sus roscos), para seguir desde cualquier ordenador.';
$string['privacy:metadata:state:courseid'] = 'El curso.';
$string['privacy:metadata:state:data'] = 'Lo guardado (nombres de equipos, puntos, preguntas…).';
$string['privacy:metadata:state:timemodified'] = 'Cuándo se guardó por última vez.';
$string['privacy:metadata:state:tool'] = 'La herramienta.';
$string['privacy:metadata:state:userid'] = 'El profesor.';
$string['standalone'] = 'Abrir sin ningún curso';
$string['students'] = 'Abrir la pantalla a los alumnos';
$string['students_desc'] = 'Los alumnos tienen en cada curso un enlace a la pantalla, solo con las herramientas que no usan datos de la clase: los juegos (Simón, el tangram, las regletas…), la pizarra, el temporizador, el cronómetro, el reloj y el código QR. Nunca ven listas de nombres, fotos, turnos ni grupos, y no se guarda nada suyo en Moodle. Si está desactivado, solo los profesores ven las herramientas.';
$string['taskpurgepicks'] = 'Borrar los turnos antiguos';
$string['teamname'] = 'Equipo {$a->n} · {$a->list} · {$a->when}';
$string['tourdescription'] = 'Enseña a los profesores dónde están las herramientas de clase.';
$string['tourname'] = 'Herramientas de clase';
$string['tourstep1content'] = '<p>Para la pantalla de clase, con los alumnos de este curso y sus fotos: ¿a quién le toca?, grupos al azar, marcador, juegos para toda la clase, regletas y tangram, semáforo de ruido, temporizador y más.</p>';
$string['tourstep1title'] = 'Nuevo: Herramientas de clase';
$string['tourstep2content'] = '<p>Desde cualquier página, para abrirlas en cualquiera de tus cursos.</p>';
$string['tourstep2title'] = 'También en el menú de arriba';
$string['tourstep3content'] = '<p>Ábrelas a pantalla completa: todo funciona con el dedo. El marcador, tus roscos y tus candados te siguen a cualquier ordenador.</p>';
$string['tourstep3title'] = 'En la pizarra digital';
$string['wholeclass'] = 'Toda la clase';
$string['wholecourse'] = 'Todo el curso';
