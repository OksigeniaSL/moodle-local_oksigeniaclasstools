# Herramientas de clase para Moodle (Oksigenia Classtools)

[![Licencia: GPLv3](https://img.shields.io/badge/licencia-GPLv3+-blue.svg)](LICENSE)
![Moodle](https://img.shields.io/badge/Moodle-4.3%2B-orange)
![Estado](https://img.shields.io/badge/estado-beta-yellow)
[![Patrocinio](https://img.shields.io/badge/patrocinio-Oksigenia-00d4ff)](https://oksigenia.com/en/open-source#sponsor)

Herramientas para la pizarra de clase, **con los alumnos del curso ya cargados y sus fotos**. Se abren desde
cualquier curso, se proyectan en la pantalla del aula y juega toda la clase: un «¿A quién le toca?» justo a lo largo
de las semanas, grupos al azar que pueden pasar a ser grupos del curso, un marcador, herramientas de azar y juegos
para toda la clase.

Plugin local (`local_oksigeniaclasstools`). Funciona con cualquier tema y no necesita servicios externos: sin CDN,
sin seguimiento y sin paso de compilación.

[Read in English](README.md)

## De Infantil a la universidad

Cada curso elige uno de los cuatro modos de la pantalla. El modo cambia el aspecto y cómo empiezan las herramientas
(botones y colores más grandes para los pequeños, la pizarra completa y pantallas sobrias para los mayores), nunca
qué herramientas hay.

Las capturas están en inglés. Los alumnos que aparecen no existen: los nombres son inventados y las fotos, generadas.

### Infantil

*Reception · Bears*: botones grandes, colores vivos y nada que leer.

| Temporizador con aspecto de disco, legible desde el fondo del aula | Partitura: «Twinkle, Twinkle, Little Star» en el carillón |
|---|---|
| ![Temporizador en modo Infantil](docs/screenshots/e1-timer.webp) | ![Partitura con una canción y el carillón](docs/screenshots/e2-score.webp) |
| **Tangram con líneas guía; las piezas encajan solas** | **Aprender la hora, moviendo las agujas con el dedo** |
| ![Tangram](docs/screenshots/e3-tangram.webp) | ![Aprender la hora](docs/screenshots/e4-clock.webp) |

### Primaria

*Year 5 · Science*: la lista de clase del curso, con fotos.

| «¿A quién le toca?», justo a lo largo de las semanas | Grupos al azar con un papel para cada uno |
|---|---|
| ![¿A quién le toca? con la foto del alumno](docs/screenshots/p1-picker.webp) | ![Grupos con papeles](docs/screenshots/p2-groups.webp) |
| **Concurso en vivo: la clase entra con un código QR, y las preguntas pueden llevar imagen** | **Muro de fracciones** |
| ![Concurso en vivo con imagen](docs/screenshots/p3-quiz.webp) | ![Muro de fracciones](docs/screenshots/p4-fractions.webp) |

### Secundaria

*Year 9 · Maths*: la pizarra completa y las respuestas de la propia clase.

| Pizarra completa: fórmulas, un triángulo mágico, regla y transportador | Lluvia de ideas: las respuestas forman una nube de palabras en directo | Calculadora científica con su historial |
|---|---|---|
| ![Pizarra completa con instrumentos](docs/screenshots/s1-board.webp) | ![Nube de palabras de una lluvia de ideas](docs/screenshots/s2-ideas.webp) | ![Calculadora científica](docs/screenshots/s3-calc.webp) |

### Superior

*Physics · Year 12* (Bachillerato y universidad): sobrio y sin confeti.

| Fórmulas escritas en una línea y dibujadas como en un libro | Votación desde los móviles, con los resultados en barras | Cuenta atrás para los exámenes, con los días lectivos que faltan |
|---|---|---|
| ![Fórmulas en la pizarra](docs/screenshots/a1-formulas.webp) | ![Votación en vivo](docs/screenshots/a2-vote.webp) | ![Cuenta atrás](docs/screenshots/a3-countdown.webp) |

## Qué trae

| Herramienta | Qué hace |
|---|---|
| Temporizador y cronómetro | Grandes, legibles desde el fondo del aula, con sonido y cinco aspectos. **Bloques de trabajo y descanso** (un pomodoro para la clase), aviso cuando queda un minuto, los diez últimos segundos para contarlos en voz alta, y un temporizador pequeño en una esquina mientras otra herramienta está delante. |
| ¿A quién le toca? | Sale un alumno con su foto. No se repite nadie hasta que han salido todos, y el **sorteo es justo**: primero sale quien menos ha salido en las últimas semanas (con cualquier profesor del curso). «Participación» enseña las cuentas; «Rasca y gana», si se quiere. El mismo sorteo manda a alguien **a la pizarra o al carillón** desde esas herramientas. |
| ¿Quién falta hoy? | Se tocan los alumnos ausentes y quedan fuera de los sorteos y los grupos ese día. |
| Grupos | Grupos al azar con caras, un papel para cada uno y cambios arrastrando. Si el profesor lo pide, **se guardan como grupos del curso**. |
| Marcador y meta de la clase | De 2 a 8 equipos, botones grandes y corona para el que va primero; o un bote que se llena de canicas hacia una meta de toda la clase. Se guarda en Moodle, así que sigue desde cualquier ordenador. |
| Azar | Ruleta configurable (alumnos, listas propias, números), dados (de 4 a 20 caras, operaciones, direcciones, colores, letras o caras propias), monedas con motivos y cartas. |
| Juegos | Rosco (rueda de letras con pistas; toda la clase o dos equipos), Simón (turnos con la lista de clase), Ahorcado (con globos), Palabra (como Wordle), Parejas (conjuntos por nivel educativo) y Código secreto (un candado de escape room con pistas). |
| Material | Regletas, tangram, recta numérica, muro de fracciones, geoplano, bloques de base 10, una **calculadora** (básica en Primaria, científica desde Secundaria) y una **partitura**: clave de sol o de fa, notas que se escriben con un toque y suenan con sonidos creados en el navegador (piano, carillón, flauta…), «Toca conmigo» en un carillón, un juego de notas, canciones tradicionales de muchos países y canciones traídas como texto o ABC (con una instrucción para una IA). |
| Pizarra | La **pizarra sencilla**: rotuladores, subrayador, formas, texto, borrador, deshacer, fondos (cuadrícula, pauta de escritura, pentagramas; blanco, verde o negro) y varios dedos a la vez. La **pizarra completa** añade páginas con miniaturas guardadas en el curso, una imagen o un PDF de fondo, seleccionar y mover lo dibujado, zoom, puntero láser, **formas mágicas** (un trazo tembloroso se convierte en una línea recta), **fórmulas** escritas en una línea y dibujadas como en un libro, y la **regla, la escuadra, el cartabón, el transportador y el compás**, el telón y el foco. Descarga en PNG, o **compartida con una clase** (se guarda en el curso y los alumnos reciben una notificación). |
| En vivo | La clase entra desde tabletas o móviles con un **código QR o un código** (sin cuenta, también gente de fuera de Moodle) o con su cuenta de Moodle, con nombre o de forma anónima. **Votación**, **pulsadores** por equipos, el móvil del profesor como **mando**, una **lluvia de ideas** (respuestas cortas que forman una nube de palabras en directo, u ordenadas en plantillas como DAFO o urgente/importante) y un **concurso** (una respuesta correcta o verdadero/falso, puntuación tranquila o rápida, equipos a partir de los grupos, una clasificación que no tiene por qué señalar a los últimos, imágenes, y preguntas escritas, pegadas o sacadas del banco de preguntas del curso). Los alumnos matriculados en el curso reciben un aviso con «Entrar». |
| Reloj | La hora actual, **aprender la hora** (agujas que se mueven con el dedo, cifras y palabras, cinco niveles y dos juegos de clase) y una **cuenta atrás** para un acontecimiento con los días lectivos que faltan. |
| Semáforo | Solo el nivel del micrófono (no se graba ni se envía nada). Una luz que respira con el ruido, una racha de calma, una reserva de paciencia que solo gasta el ruido sostenido y «Ajustar a esta clase». |
| Además | Símbolos de trabajo («Así trabajamos») y un código QR con estilos, el logo del sitio en el centro y descarga en PNG o SVG. |
| Modos de la pantalla | Infantil, Primaria, Secundaria o Superior: uno cada vez, por curso. Cambian el aspecto y los valores de partida (notas y colores más grandes para los pequeños, la pizarra completa para los mayores…), nunca qué herramientas hay. «Nombres en mayúsculas», en el mismo menú, pone en mayúsculas los nombres de los alumnos (encendido de serie en Infantil). |

Las listas salen del curso: una por grupo, una por cohorte matriculada con sincronización de cohortes, y el curso
entero. Un grupo y una cohorte con los mismos alumnos aparecen una sola vez. Se respeta el modo de grupos separados.

## Requisitos

- Moodle 4.3 o posterior, probado en 4.3, 5.2, 5.3 y 6.0dev. Desde la 4.4 los enlaces van en la barra del curso y
  en el menú principal (ganchos de navegación). En la 4.3 el enlace aparece en el menú «Más» del curso y no hay
  enlace en el menú principal: el administrador puede añadirlo como elemento de menú personalizado
  (`/local/oksigeniaclasstools/index.php`). Moodle 4.1 y 4.2 no admiten los nombres de tabla del plugin, que pasan
  de 28 caracteres.
- PHP, el que pida la versión de Moodle.
- Cualquier tema. Un navegador moderno.

## Instalación

### Desde un ZIP

1. Descargar el ZIP de la última versión en la página de Releases.
2. En Moodle: *Administración del sitio → Extensiones → Instalar plugins → Seleccionar un archivo* y elegir el ZIP.
3. Confirmar la instalación. Moodle crea cuatro tablas (sorteos, herramientas guardadas, sesiones en vivo y sus
   respuestas).

### Desde Git

```bash
cd /ruta/a/moodle/public/local/
git clone https://github.com/OksigeniaSL/moodle-local_oksigeniaclasstools.git oksigeniaclasstools
```

Después, *Administración del sitio → Notificaciones* para terminar la instalación.

## Quién decide qué

**Administrador del sitio**: *Administración del sitio → Extensiones → Plugins locales → Herramientas de clase
(Oksigenia Classtools)*.

| Ajuste | Por defecto | Notas |
|---|---|---|
| Nombre en la pizarra | Nombre y primer apellido | O solo el nombre, o el nombre completo. |
| Días que cuentan para el sorteo justo | 90 | También el periodo que enseña «Participación». |
| Modo de la pantalla por defecto | Primaria | Infantil, Primaria, Secundaria o Superior (Bachillerato y universidad). Uno cada vez; cada profesor lo cambia en su curso. |
| Niveles del centro | Todos | Infantil, Primaria, Secundaria, Bachillerato y estudios superiores: los conjuntos de ejemplo que ofrecen los juegos. |
| Herramientas, Juegos y Materiales | Todo | Qué herramientas, juegos y materiales aparecen en la pantalla. Los nuevos se añaden a la selección al actualizar el plugin. |
| Aviso a los alumnos | Activado | Mientras hay una sesión en vivo abierta, sus alumnos ven «Entrar» en las páginas del curso. |
| Abrir la pantalla a los alumnos | Desactivado | Los alumnos solo tienen las herramientas sin datos de la clase (juegos, material, pizarra, temporizador, reloj, QR): nunca nombres, fotos, sorteos ni grupos, y no se guarda nada suyo. |
| Enlace en el menú principal | Activado | Dentro de cada curso el enlace está siempre en la barra del curso. |

**Roles**: la capacidad `local/oksigeniaclasstools:use` (por defecto profesor, profesor sin permiso de edición y
gestor) abre las herramientas con los alumnos de un curso. Guardar equipos como grupos del curso necesita además
`moodle/course:managegroups`.

**Profesores**: dentro de cada herramienta, sus propias listas, roscos, candados, concursos, canciones y páginas de
la pizarra, y las opciones de cada juego. Las listas pegadas a mano y «¿Quién falta hoy?» se quedan en su navegador;
el marcador, los roscos, los candados, los concursos, las canciones y las páginas de la pizarra se guardan además en
Moodle para ese profesor en ese curso, así que siguen desde cualquier ordenador. Las imágenes y los PDF puestos en la
pizarra se quedan en el navegador donde se añadieron.

## Recorrido de usuario

Al instalar (o al actualizar a la 0.7.0) el plugin añade un recorrido de usuario para profesores. Sale una vez a cada
profesor, señala el enlace de la barra del curso y del menú principal, y cuenta qué hay dentro. Sus textos son
cadenas de idioma. Se puede editar o desactivar en *Administración del sitio → Apariencia → Recorridos de usuario*.

## Privacidad

Cuatro tablas y un área de archivos, todas cubiertas por el proveedor de privacidad (exportación y borrado) y que se
borran con su curso o su usuario:

- `local_oksigeniaclasstools_picks`: cada vez que sale un alumno (curso, alumno, profesor, hora). Se borra cada
  noche lo que pasa de los días que cuentan para el sorteo justo.
- `local_oksigeniaclasstools_state`: lo que guarda cada profesor de cada herramienta en cada curso.
- `local_oksigeniaclasstools_live` y `local_oksigeniaclasstools_livein`: las sesiones en vivo (quién las abrió y
  cuándo) y las respuestas de cada dispositivo. Solo con el código, un dispositivo es un identificador al azar;
  anónimo con cuenta, un identificador del que no se puede saber el usuario, y no se guarda ningún id de usuario; con
  nombre, el id del usuario. Se borran al cabo de un día.
- Las imágenes de las preguntas del concurso, en el curso y para el profesor que las puso; las que no usa ningún
  concurso se borran al día siguiente.

Sin servicios externos, sin CDN y sin seguimiento: todo lo que necesita la pantalla viene con el plugin.

## Estado y hoja de ruta

Beta, desarrollado con un colegio de Tenerife como aula de pruebas. Antes de la primera versión estable:

- **Idiomas**: los textos de la pantalla salen de los paquetes de idioma (inglés y español; los demás, a través de
  AMOS), y el contenido de serie (abecedario, teclado, palabras, conjuntos de parejas, la hora en palabras,
  ejemplos), de un paquete de contenido por idioma en `app/content/` (inglés, español, español de México, alemán,
  francés, italiano, neerlandés, sueco y portugués de Brasil). Lo siguiente: las cadenas de la interfaz de esos
  idiomas en AMOS.
- **Configuración del sitio**: qué herramientas y juegos se enseñan, el dibujo del ahorcado por defecto, y listas,
  roscos y candados del sitio compartidos por todos los profesores. Los ejemplos de serie pasan a ser neutros y por
  idioma.
- **Código**: los scripts de la pantalla pasan a módulos AMD. `moodle-plugin-ci` (PHPUnit y Behat en Moodle 4.3 a
  5.3) en GitHub Actions.

## Desarrollo

La pantalla vive en `app/` y también se empaqueta como paquete SCORM 1.2 independiente. `./build.sh` crea el ZIP
instalable en `dist/`. El nombre del componente, `local_oksigeniaclasstools`, no cambia nunca, así que cada versión
se instala sobre la anterior y conserva sus datos.

## Licencia

GNU GPL v3 o posterior. © 2026 Oksigenia. Las partes de terceros están en `thirdpartylibs.xml`: el generador de QR
(MIT), la tipografía Nunito (SIL OFL 1.1, `app/fonts/OFL.txt`), los iconos de Font Awesome Free (CC BY 4.0) y PDF.js
(Apache 2.0, que solo se carga para llevar un PDF a la pizarra). La clave de sol de la partitura es un dibujo de
dominio público de Wikimedia Commons; las canciones que trae son tradicionales o de dominio público. Las ideas de la
pizarra completa vienen de OpenBoard (GPL 3), escritas de nuevo.
