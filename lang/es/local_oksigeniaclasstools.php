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

$string['ai'] = 'Ejercicios con la IA del sitio';
$string['ai_desc'] = 'Si el sitio tiene un proveedor de IA que genera texto (desde Moodle 4.5), los profesores pueden pedirle ejercicios para Ordenar, Clasificar, Caza de errores y ¿Quién soy? desde «Mis ejercicios». El plugin monta el prompt con el juego, el tema y la etapa; Moodle muestra su política de IA antes del primer uso y guarda un registro de cada petición. Los ejercicios se añaden al cuadro para que el profesor los revise antes de guardar.';
$string['ai_unavailable'] = 'La IA del sitio no está disponible en este curso.';
$string['app_ah_builtin_advanced'] = 'Al azar: palabras de Bachillerato y universidad';
$string['app_ah_builtin_early'] = 'Al azar: palabras de Infantil';
$string['app_ah_builtin_primary'] = 'Al azar: palabras de Primaria';
$string['app_ah_builtin_secondary'] = 'Al azar: palabras de Secundaria';
$string['app_ah_initial_ask'] = '¿Con qué letra empieza?';
$string['app_ah_initial_next'] = 'Otro nombre';
$string['app_ah_initial_none'] = 'Este juego necesita una lista de la clase del curso, con los nombres de la clase.';
$string['app_ah_initial_right'] = '¡Sí! {$a}';
$string['app_ah_initial_start'] = 'Un nombre';
$string['app_ah_kind'] = '¿A qué jugamos?';
$string['app_ah_kind_initial'] = 'Primera letra de un nombre';
$string['app_ah_kind_word'] = 'La palabra entera';
$string['app_ah_left_many'] = '{$a} globos';
$string['app_ah_left_one'] = '{$a} globo';
$string['app_ah_name'] = 'Ahorcado';
$string['app_ah_need_word'] = 'Escribe la palabra o elige una lista.';
$string['app_ah_reveal'] = 'Ver la palabra';
$string['app_ah_spent'] = 'Globos gastados';
$string['app_ah_spent_go'] = 'Se van';
$string['app_ah_spent_stay'] = 'Se quedan';
$string['app_ah_uncover'] = 'Destapar una letra';
$string['app_ah_uncover_hint'] = 'Cuesta un globo';
$string['app_ah_won'] = '¡Muy bien! La han adivinado';
$string['app_ai_done'] = 'Listo: {$a} añadidos. Revísalos antes de guardar.';
$string['app_ai_done_quiz'] = 'Listo: {$a} preguntas en el cuadro. Pulsa «Añadirlas» para ponerlas en el concurso.';
$string['app_ai_done_rosco'] = 'Listo: {$a} letras rellenadas. Revísalas antes de guardar.';
$string['app_ai_example_pairs'] = 'Francia = París
Italia = Roma
Portugal = Lisboa';
$string['app_ai_example_quiz'] = '¿Cuál es el planeta más grande del sistema solar? | *Júpiter | Saturno | Neptuno | La Tierra
El agua pura hierve a 100 °C al nivel del mar | V
La ballena es un pez | F';
$string['app_ai_example_rosco'] = 'A | Insecto que fabrica miel | abeja
B | Embarcación que flota y navega | barco
Ñ | Estación del año en la que caen las hojas | otoño';
$string['app_ai_example_timeline'] = '476 – 1492 | Edad Media
1492 | Colón llega a América
1969-07-20 | Llegada a la Luna';
$string['app_ai_example_trios'] = 'Francia = París = francés
Italia = Roma = italiano
Portugal = Lisboa = portugués';
$string['app_ai_example_words'] = 'volcán
glaciar
meseta';
$string['app_ai_for'] = 'Para';
$string['app_ai_kind_pairs'] = 'Parejas «a = b» (Parejas)';
$string['app_ai_kind_trios'] = 'Tríos «a = b = c» (Parejas)';
$string['app_ai_kind_words'] = 'Palabras (ahorcado, palabra, código)';
$string['app_ai_prompt'] = 'Escribe {$a->what} para {$a->level}, sobre «{$a->topic}».

Formato (texto plano, sin nada más): {$a->rules}

Ejemplo:
{$a->example}

Contesta solo con eso, en el idioma de este texto, sin explicaciones ni formato Markdown. Comprueba que todo lo que escribas sea correcto.';
$string['app_ai_rules_pairs'] = 'Una pareja por línea: las dos partes separadas por =, cada una de pocas palabras.';
$string['app_ai_rules_quiz'] = 'Una pregunta por línea: la pregunta y después de dos a cuatro respuestas separadas por |, con * delante de la única correcta. Para verdadero o falso, la afirmación, | y V o F.';
$string['app_ai_rules_rosco'] = 'Una línea por letra, para estas letras: {$a}. En cada línea, la letra, la pista y la respuesta, separadas por |. La respuesta empieza por esa letra o, si no hay una palabra adecuada, la contiene.';
$string['app_ai_rules_timeline'] = 'Una línea por hecho: «fecha | nombre», o por periodo: «fecha – fecha | nombre». Fechas: un año (1492), un año antes de Cristo (753 a. C.), una fecha completa (1969-07-20) o millones de años (66 Ma). Solo fechas seguras, nada inventado.';
$string['app_ai_rules_trios'] = 'Un trío por línea: tres cosas que van juntas, separadas por =, cada una de pocas palabras.';
$string['app_ai_rules_words'] = 'Una palabra por línea, sin artículos, números ni explicaciones.';
$string['app_ai_what_pairs'] = '{$a} parejas';
$string['app_ai_what_quiz'] = '{$a} preguntas de concurso';
$string['app_ai_what_rosco'] = 'un rosco, con una pista para cada letra';
$string['app_ai_what_timeline'] = '{$a} hechos o periodos para una línea del tiempo';
$string['app_ai_what_trios'] = '{$a} tríos';
$string['app_ai_what_words'] = '{$a} palabras';
$string['app_asi_group'] = 'En grupo';
$string['app_asi_hand'] = 'Levanta la mano';
$string['app_asi_hint'] = 'Toca uno para mostrarlo en grande. Para volver, toca la pantalla otra vez.';
$string['app_asi_listen'] = 'Escucha';
$string['app_asi_pairs'] = 'Por parejas';
$string['app_asi_quiet'] = 'En voz baja';
$string['app_asi_silence'] = 'Silencio';
$string['app_b10_base'] = 'Base';
$string['app_b10_base_n'] = 'Base {$a}';
$string['app_b10_blocks_of'] = 'Bloques de {$a}';
$string['app_b10_break_n'] = 'Romper en {$a} →';
$string['app_b10_broken'] = '1 en {$a->a} → 10 en {$a->b}';
$string['app_b10_build'] = 'Construir un número';
$string['app_b10_empty'] = 'Vaciar';
$string['app_b10_group_n'] = 'Cambiar {$a} por 1 ←';
$string['app_b10_grouped'] = '10 en {$a->a} → 1 en {$a->b}';
$string['app_b10_guess'] = '¿Qué número es? Toca para verlo';
$string['app_b10_h'] = 'Centenas';
$string['app_b10_help'] = 'Pon y quita bloques con + y −, o toca un bloque para quitarlo. Con tantos iguales como la base (diez en base 10), cámbialos por uno de la columna siguiente; uno se puede romper en otros tantos.';
$string['app_b10_hide'] = 'Esconder el número';
$string['app_b10_in_base'] = '{$a->n} en base {$a->b}';
$string['app_b10_less'] = '{$a}: uno menos';
$string['app_b10_more'] = '{$a}: uno más';
$string['app_b10_put'] = 'Poner';
$string['app_b10_t'] = 'Decenas';
$string['app_b10_take'] = '{$a}: quitar uno';
$string['app_b10_th'] = 'Millares';
$string['app_b10_u'] = 'Unidades';
$string['app_b10_upto'] = 'Hasta';
$string['app_ba_add_left'] = 'Poner {$a} en el plato izquierdo';
$string['app_ba_add_right'] = 'Poner {$a} en el plato derecho';
$string['app_ba_bad'] = 'Escríbela como 2x + 3 = 11, con números enteros y una solución que la balanza pueda enseñar: un número entero mayor que cero.';
$string['app_ba_both_one'] = 'Quitar 1 de cada plato';
$string['app_ba_both_x'] = 'Quitar una caja de cada plato';
$string['app_ba_compare'] = 'Comparar';
$string['app_ba_empty'] = 'Vaciar los platos';
$string['app_ba_equation'] = 'Ecuaciones';
$string['app_ba_help'] = 'Pon pesas en cada plato con los botones de abajo y toca una pesa para quitarla. La balanza se inclina hacia el lado que pesa más.';
$string['app_ba_help_eq'] = 'Cada caja pesa x. Lo que se quita de un plato se quita del otro, o la balanza se inclina: quita lo mismo de los dos hasta que quede una caja sola.';
$string['app_ba_hide'] = 'Cerrar las cajas';
$string['app_ba_new'] = 'Ecuación nueva';
$string['app_ba_numbers'] = 'Pesas con números';
$string['app_ba_put'] = 'Poner';
$string['app_ba_reveal'] = 'Abrir las cajas';
$string['app_ba_share'] = 'Repartir los dos platos entre {$a}';
$string['app_ba_share_any'] = 'Repartir los dos platos';
$string['app_ba_solved'] = 'x = {$a}, sin romper el equilibrio.';
$string['app_ba_take_box'] = 'Quitar una caja';
$string['app_ba_take_one'] = 'Quitar una pesa de 1';
$string['app_ba_take_weight'] = 'Quitar la pesa de {$a}';
$string['app_ba_unbalanced'] = 'Desequilibrada: haz lo mismo en el otro plato.';
$string['app_ba_undo'] = 'Deshacer';
$string['app_ba_write'] = 'O escribe una';
$string['app_bar_back'] = 'Volver al curso';
$string['app_bar_brand_lead'] = 'Herramientas';
$string['app_bar_brand_strong'] = 'de clase';
$string['app_bar_fullscreen'] = 'Pantalla completa';
$string['app_bar_fullscreen_exit'] = 'Salir de la pantalla completa';
$string['app_bar_home'] = 'Volver al inicio';
$string['app_bar_mode'] = 'Modo';
$string['app_bar_mode_title'] = 'Modo de la pantalla (uno cada vez)';
$string['app_bar_names_upper'] = 'Nombres en mayúsculas';
$string['app_bar_names_upper_hint'] = 'Para quien aprende a leer: viene encendido en Infantil. Solo en esta pantalla; las fichas no cambian.';
$string['app_bar_present'] = 'Presentar';
$string['app_bar_present_exit'] = 'Ver las herramientas';
$string['app_bar_session_login'] = 'Volver a entrar';
$string['app_bar_session_text'] = 'la sesión del aula virtual ha caducado. Lo de ahora sigue en este ordenador.';
$string['app_bar_session_title'] = 'No se está guardando en el curso:';
$string['app_bar_sound'] = 'Sonido';
$string['app_bar_sound_off'] = 'Sonido quitado (pulsa para activarlo)';
$string['app_bar_sound_on'] = 'Sonido activado (pulsa para quitarlo)';
$string['app_bar_split'] = 'Dos herramientas a la vez';
$string['app_bar_title'] = 'Herramientas de clase';
$string['app_bar_tools'] = 'Herramientas';
$string['app_bar_window'] = 'Abrir en otra ventana';
$string['app_bq_back'] = 'A trabajar: bloque {$a->n} de {$a->of}';
$string['app_bq_blocks'] = 'Por bloques';
$string['app_bq_count'] = 'Bloques';
$string['app_bq_kind'] = 'Cómo cuenta';
$string['app_bq_one'] = 'Una cuenta';
$string['app_bq_rest'] = 'Descanso';
$string['app_bq_rest_now'] = 'Descanso';
$string['app_bq_summary'] = '{$a->n} bloques de {$a->work} min con descansos de {$a->rest}: {$a->total} min en total. Cada parte empieza sola.';
$string['app_bq_tip_1'] = 'Descanso: mirar por la ventana, a lo lejos, un rato.';
$string['app_bq_tip_2'] = 'Descanso: levantarse y estirarse.';
$string['app_bq_tip_3'] = 'Descanso: beber un poco de agua.';
$string['app_bq_tip_4'] = 'Descanso: tres respiraciones hondas, despacio.';
$string['app_bq_tip_5'] = 'Descanso: mover los hombros y el cuello con suavidad.';
$string['app_bq_tip_6'] = 'Descanso: cerrar los ojos un momento.';
$string['app_bq_title'] = 'Trabajo y descanso';
$string['app_bq_work'] = 'Trabajo';
$string['app_bq_work_n'] = 'Trabajo {$a->n} de {$a->of}';
$string['app_ca_ans'] = 'Ans';
$string['app_ca_basic'] = 'Básica';
$string['app_ca_error'] = 'No se puede calcular';
$string['app_ca_guess'] = 'Estimar antes';
$string['app_ca_guess_now'] = '¿Cuánto dará? Estímenlo y luego lo vemos.';
$string['app_ca_keys'] = 'Teclado';
$string['app_ca_kind'] = 'Tipo de calculadora';
$string['app_ca_reveal'] = 'Ver el resultado';
$string['app_ca_sci'] = 'Científica';
$string['app_ca_steps'] = 'Paso a paso';
$string['app_ca_tape'] = 'Resultados';
$string['app_ca_tape_clear'] = 'Borrar los resultados';
$string['app_ca_tape_empty'] = 'Cada resultado se queda aquí; tocándolo se vuelve a usar.';
$string['app_ca_undefined'] = 'No está definido';
$string['app_ca_use'] = 'Usar este resultado';
$string['app_cd_day'] = 'Día';
$string['app_cd_day_one'] = 'día';
$string['app_cd_days'] = 'días';
$string['app_cd_here'] = '¡Ya ha llegado!';
$string['app_cd_hint'] = 'Elige qué esperamos, el día y la hora.';
$string['app_cd_hour_one'] = 'hora';
$string['app_cd_hours'] = 'horas';
$string['app_cd_left'] = 'Faltan';
$string['app_cd_minute_one'] = 'minuto';
$string['app_cd_minutes'] = 'minutos';
$string['app_cd_school_many'] = '{$a} días de clase entre medias';
$string['app_cd_school_one'] = '1 día de clase entre medias';
$string['app_cd_second_one'] = 'segundo';
$string['app_cd_seconds'] = 'segundos';
$string['app_cd_time'] = 'Hora';
$string['app_cd_what'] = '¿Qué esperamos?';
$string['app_cd_what_ph'] = 'La excursión';
$string['app_cel_continue'] = 'Seguir';
$string['app_cel_done'] = '¡Conseguido!';
$string['app_ch_all_out'] = 'Ya han salido todos: empezamos otra vuelta.';
$string['app_ch_bad'] = 'Mal';
$string['app_ch_blue'] = 'Azul';
$string['app_ch_builtin'] = 'Otras';
$string['app_ch_cards'] = 'Cartas';
$string['app_ch_coin'] = 'Moneda';
$string['app_ch_custom_faces'] = 'Caras del dado personalizado, una por línea';
$string['app_ch_custom_hint'] = 'Por ejemplo: «verbo en pasado»';
$string['app_ch_d6'] = 'De 6 (puntos)';
$string['app_ch_d_add_sub'] = 'Sumar o restar (+ −)';
$string['app_ch_d_arrows'] = 'Dirección ({$a} flechas)';
$string['app_ch_d_colours'] = 'Colores';
$string['app_ch_d_custom'] = 'Personalizado';
$string['app_ch_d_letters'] = 'Letras';
$string['app_ch_d_ops'] = 'Operaciones (+ − × ÷)';
$string['app_ch_d_sides'] = 'De {$a}';
$string['app_ch_d_vowels'] = 'Vocales';
$string['app_ch_deck'] = 'Mazo';
$string['app_ch_dice'] = 'Dados';
$string['app_ch_die'] = 'Dado {$a}';
$string['app_ch_die_kinds'] = 'Dados';
$string['app_ch_draw'] = 'Sacar carta';
$string['app_ch_edit_list'] = 'Editar';
$string['app_ch_empty'] = 'No quedan casillas. Pulsa «Volver a ponerlas todas».';
$string['app_ch_empty_deck'] = 'No quedan cartas. Pulsa «Barajar de nuevo».';
$string['app_ch_even'] = 'Par';
$string['app_ch_even_odd'] = 'Par o impar';
$string['app_ch_exclaim'] = '¡{$a}!';
$string['app_ch_false'] = 'Falso';
$string['app_ch_freq_one'] = '{$a} tiradas · cada barra, cuántas veces; la línea, lo esperado';
$string['app_ch_freq_sum'] = '{$a} tiradas · la suma de los dados; la línea, lo esperado';
$string['app_ch_from'] = 'Del';
$string['app_ch_good'] = 'Bien';
$string['app_ch_green'] = 'Verde';
$string['app_ch_heads'] = 'Cara';
$string['app_ch_heads_tails'] = 'Cara o cruz';
$string['app_ch_how_many'] = '¿Cuántos dados?';
$string['app_ch_last_one'] = 'Solo queda «{$a}»: es el último';
$string['app_ch_left'] = 'Quedan {$a}';
$string['app_ch_letters_az'] = 'Letras (A–Z)';
$string['app_ch_letters_stop'] = 'Letras para el «Stop» (sin K, Ñ, Q, W, X, Y)';
$string['app_ch_many'] = 'Muchas tiradas';
$string['app_ch_many_clear'] = 'Borrar el gráfico';
$string['app_ch_many_go'] = 'Tirar';
$string['app_ch_many_n'] = '{$a} tiradas';
$string['app_ch_many_numbers'] = 'Solo con dados de números.';
$string['app_ch_motif'] = 'Motivo';
$string['app_ch_new_list'] = 'Nueva lista';
$string['app_ch_no'] = 'No';
$string['app_ch_no_list'] = 'Esa lista está vacía.';
$string['app_ch_no_repeat'] = 'Sin repetir';
$string['app_ch_numbers'] = 'Números del {$a->a} al {$a->b}';
$string['app_ch_numbers_pick'] = 'Números…';
$string['app_ch_odd'] = 'Impar';
$string['app_ch_only_one'] = 'Solo hay una casilla: «{$a}»';
$string['app_ch_orange'] = 'Naranja';
$string['app_ch_other'] = 'Otra';
$string['app_ch_ownlists'] = 'Tus listas';
$string['app_ch_press_to'] = 'Pulsa «{$a}»';
$string['app_ch_purple'] = 'Morado';
$string['app_ch_put_back'] = 'Volver a ponerlas todas';
$string['app_ch_red'] = 'Rojo';
$string['app_ch_red_blue'] = 'Equipo rojo o azul';
$string['app_ch_remove_picked'] = 'Quitar la que sale';
$string['app_ch_reset_tally'] = 'Poner a cero';
$string['app_ch_reshuffle'] = 'Barajar de nuevo';
$string['app_ch_result'] = 'Ha salido: {$a}';
$string['app_ch_roll'] = 'Tirar';
$string['app_ch_side1'] = 'Una cara';
$string['app_ch_side2'] = 'La otra';
$string['app_ch_source'] = 'Casillas';
$string['app_ch_spin'] = 'Girar';
$string['app_ch_students'] = 'Alumnos';
$string['app_ch_tails'] = 'Cruz';
$string['app_ch_thumbs'] = 'Pulgar arriba o abajo';
$string['app_ch_to'] = 'al';
$string['app_ch_toss'] = 'Lanzar';
$string['app_ch_total'] = 'Total: {$a}';
$string['app_ch_true'] = 'Verdadero';
$string['app_ch_true_false'] = 'Verdadero o falso';
$string['app_ch_what'] = '¿Qué usamos?';
$string['app_ch_wheel'] = 'Ruleta';
$string['app_ch_yellow'] = 'Amarillo';
$string['app_ch_yes'] = 'Sí';
$string['app_ch_yes_no'] = 'Sí o no';
$string['app_cl_ask'] = '¿Qué hora es?';
$string['app_cl_check'] = 'Comprobar';
$string['app_cl_clock'] = 'Reloj para aprender la hora';
$string['app_cl_countdown'] = 'Cuenta atrás';
$string['app_cl_digital'] = 'Ver la hora digital';
$string['app_cl_drag_hint'] = 'Mueve las agujas con el dedo o el ratón';
$string['app_cl_h24'] = '24 horas';
$string['app_cl_learn'] = 'Aprender la hora';
$string['app_cl_level'] = 'Nivel';
$string['app_cl_level_five'] = 'De 5 en 5 minutos';
$string['app_cl_level_h'] = 'En punto';
$string['app_cl_level_half'] = 'Y media';
$string['app_cl_level_minute'] = 'Minuto a minuto';
$string['app_cl_level_quarter'] = 'Y cuarto y menos cuarto';
$string['app_cl_minutes'] = 'Ver los minutos';
$string['app_cl_mode'] = 'Reloj';
$string['app_cl_now'] = 'Hora actual';
$string['app_cl_reveal'] = 'Ver la respuesta';
$string['app_cl_right'] = '¡Muy bien! Es esa hora';
$string['app_cl_roman'] = 'Números romanos';
$string['app_cl_set'] = 'Pon la hora';
$string['app_cl_set_this'] = 'Pon: {$a}';
$string['app_cl_words'] = 'Ver en palabras';
$string['app_cl_wrong'] = 'Todavía no: mira bien las agujas';
$string['app_cr_album'] = 'Mis logros';
$string['app_cr_atrapanubes_how'] = 'Cierra una lluvia de ideas con {$a} respuestas o más.';
$string['app_cr_atrapanubes_name'] = 'Atrapanubes';
$string['app_cr_atrapanubes_text'] = 'Caza ideas antes de que se las lleve el viento.';
$string['app_cr_cazaletras_how'] = 'Termina un rosco.';
$string['app_cr_cazaletras_name'] = 'Cazaletras';
$string['app_cr_cazaletras_text'] = 'De la A a la Z, sin pasar palabra.';
$string['app_cr_close'] = 'Cerrar';
$string['app_cr_cuentamanos_how'] = 'Cuenta {$a} manos o más en una pregunta a mano alzada.';
$string['app_cr_cuentamanos_name'] = 'Cuentamanos';
$string['app_cr_cuentamanos_text'] = 'No se le escapa ni una mano.';
$string['app_cr_cuentavotos_how'] = 'Cierra una votación con {$a} dispositivos o más, y que vote la mayoría.';
$string['app_cr_cuentavotos_name'] = 'Cuentavotos';
$string['app_cr_cuentavotos_text'] = 'Cuenta votos más rápido que su sombra.';
$string['app_cr_cumplemetas_how'] = 'Llena el bote de la meta de la clase.';
$string['app_cr_cumplemetas_name'] = 'Cumplemetas';
$string['app_cr_cumplemetas_text'] = 'Con su clase, llega a todas las metas.';
$string['app_cr_day'] = '1 día de uso';
$string['app_cr_days'] = '{$a} días de uso';
$string['app_cr_domamoviles_how'] = 'Que entren {$a} dispositivos o más en una sesión «En vivo».';
$string['app_cr_domamoviles_name'] = 'Domamóviles';
$string['app_cr_domamoviles_text'] = 'Ningún móvil se le resiste.';
$string['app_cr_fam_board'] = 'Pizarra';
$string['app_cr_fam_dice'] = 'Dados';
$string['app_cr_fam_goal'] = 'Meta de la clase';
$string['app_cr_fam_groups'] = 'Grupos';
$string['app_cr_fam_hangman'] = 'Ahorcado';
$string['app_cr_fam_live'] = 'En vivo';
$string['app_cr_fam_picker'] = '¿A quién le toca?';
$string['app_cr_fam_rosco'] = 'Rosco';
$string['app_cr_fam_score'] = 'Partitura';
$string['app_cr_fam_timer'] = 'Temporizador';
$string['app_cr_got'] = '{$a->got} de {$a->all} cromos';
$string['app_cr_guardatiempos_how'] = 'Deja que un temporizador de un minuto o más llegue a cero.';
$string['app_cr_guardatiempos_name'] = 'Guardatiempos';
$string['app_cr_guardatiempos_text'] = 'El tiempo no se le escapa.';
$string['app_cr_intro'] = 'Cada herramienta tiene su cromo: se consigue usándola de verdad con la clase, y sube de nivel con los días de uso.';
$string['app_cr_lanzapreguntas_how'] = 'Haz 3 preguntas de concurso con {$a} dispositivos o más.';
$string['app_cr_lanzapreguntas_name'] = 'Lanzapreguntas';
$string['app_cr_lanzapreguntas_text'] = 'Puntería fina: cada duda, al blanco.';
$string['app_cr_lap'] = 'Vuelta';
$string['app_cr_lap_n'] = 'Vuelta {$a}';
$string['app_cr_lap_total'] = 'total {$a}';
$string['app_cr_laps'] = 'Vueltas';
$string['app_cr_level_0'] = 'Aprendido';
$string['app_cr_level_1'] = 'Nivel 1';
$string['app_cr_level_2'] = 'Nivel 2 · Bronce';
$string['app_cr_level_3'] = 'Nivel 3 · Plata';
$string['app_cr_level_4'] = 'Nivel 4 · Oro';
$string['app_cr_level_5'] = 'Nivel 5 · Brillo';
$string['app_cr_mandamas_how'] = 'Maneja la pizarra con el móvil: 5 órdenes en un día.';
$string['app_cr_mandamas_name'] = 'Mandamás';
$string['app_cr_mandamas_text'] = 'Manda en la pizarra desde cualquier rincón.';
$string['app_cr_missing'] = 'Por conseguir';
$string['app_cr_new'] = '¡Cromo nuevo!';
$string['app_cr_next'] = 'Siguiente nivel a los {$a} días';
$string['app_cr_none'] = 'Aún no hay cromos: usa cualquier herramienta con tu clase y empezarán a llegar.';
$string['app_cr_number'] = 'Nº {$a->n} · {$a->family}';
$string['app_cr_open'] = 'Ver el álbum';
$string['app_cr_pasalimpios_how'] = 'Deja que la pizarra enderece una forma («formas mágicas»).';
$string['app_cr_pasalimpios_name'] = 'Pasalimpios';
$string['app_cr_pasalimpios_text'] = 'Lo que dibuja, sale a la primera.';
$string['app_cr_quitatelones_how'] = 'Usa el telón o el foco en la pizarra.';
$string['app_cr_quitatelones_name'] = 'Quitatelones';
$string['app_cr_quitatelones_text'] = 'Nadie ve la respuesta antes de tiempo.';
$string['app_cr_repartequipos_how'] = 'Haz grupos con una lista del curso de {$a} alumnos o más y déjalos dos minutos en pantalla, o guárdalos.';
$string['app_cr_repartequipos_name'] = 'Repartequipos';
$string['app_cr_repartequipos_text'] = 'Hace equipos sin que nadie proteste.';
$string['app_cr_sacanombres_how'] = 'Saca {$a} turnos en una misma clase con «¿A quién le toca?».';
$string['app_cr_sacanombres_name'] = 'Sacanombres';
$string['app_cr_sacanombres_text'] = 'Saca nombres de la chistera, sin trampa ni cartón.';
$string['app_cr_salvaglobos_how'] = 'Termina una partida de ahorcado.';
$string['app_cr_salvaglobos_name'] = 'Salvaglobos';
$string['app_cr_salvaglobos_text'] = 'Ni un globo explota en sus manos.';
$string['app_cr_tiradados_how'] = 'Tira los dados 10 veces o usa «Muchas tiradas».';
$string['app_cr_tiradados_name'] = 'Tiradados';
$string['app_cr_tiradados_text'] = 'La suerte le sale de cara.';
$string['app_cr_tocanotas_how'] = 'Toca una canción entera en la partitura.';
$string['app_cr_tocanotas_name'] = 'Tocanotas';
$string['app_cr_tocanotas_text'] = 'Canta afinado y toca en su sitio.';
$string['app_cr_tocatimbres_how'] = 'Juega 3 rondas de pulsadores con {$a} dispositivos o más.';
$string['app_cr_tocatimbres_name'] = 'Tocatimbres';
$string['app_cr_tocatimbres_text'] = 'Nadie llega antes al timbre.';
$string['app_cr_top'] = '¡Nivel máximo!';
$string['app_cr_trazacirculos_how'] = 'Usa la regla, la escuadra, el cartabón, el transportador o el compás.';
$string['app_cr_trazacirculos_name'] = 'Trazacírculos';
$string['app_cr_trazacirculos_text'] = 'Su compás nunca se tuerce.';
$string['app_cr_up'] = '¡Sube de nivel!';
$string['app_cr_weeks'] = 'Semanas con la pizarra: {$a->n} de {$a->of}';
$string['app_cr_weeks_done'] = '{$a} semanas con la pizarra: ¡constancia!';
$string['app_dl_again'] = 'Otra ronda';
$string['app_dl_button'] = 'Duelo';
$string['app_dl_challenge'] = 'El reto';
$string['app_dl_challenge_ph'] = 'El reto, el mismo para los dos (por ejemplo: forma 3/4)';
$string['app_dl_close'] = 'Cerrar el duelo';
$string['app_dl_done'] = '¡Hecho!';
$string['app_dl_first'] = '¡{$a} ha acabado primero!';
$string['app_dl_hint_compare'] = 'Dos modelos uno al lado del otro, para mirarlos juntos y hablar de ellos.';
$string['app_dl_hint_together'] = 'Los dos a la vez, cada uno en su mitad (en una pantalla multitáctil): gana el primero que pulse «¡Hecho!».';
$string['app_dl_hint_turns'] = 'Uno detrás de otro, cada uno con su reloj (para un proyector o una pantalla de un solo toque): gana el más rápido.';
$string['app_dl_mode'] = 'Cómo juegan';
$string['app_dl_mode_compare'] = 'Comparar';
$string['app_dl_mode_together'] = 'A la vez';
$string['app_dl_mode_turns'] = 'Por turnos';
$string['app_dl_name'] = 'Quién juega en este lado';
$string['app_dl_opened'] = 'Duelo: el mismo material en dos mitades.';
$string['app_dl_pick_two'] = 'Elegir a dos';
$string['app_dl_restart'] = 'Empezar de nuevo';
$string['app_dl_side_n'] = 'Lado {$a}';
$string['app_dl_start'] = 'Empezar';
$string['app_dl_tie'] = '¡Empate!';
$string['app_dl_wins'] = 'Gana {$a->who}: {$a->time} (el otro, {$a->other})';
$string['app_ec_again'] = 'Otra vez';
$string['app_ec_bars'] = 'Compases';
$string['app_ec_easy'] = 'Fáciles';
$string['app_ec_good'] = '¡Bien!';
$string['app_ec_hard'] = 'Más difíciles';
$string['app_ec_help'] = 'La pizarra cuenta cuatro y da palmas a un ritmo; la clase lo devuelve con palmas. Alguien puede tocar el eco en el tambor (o con la barra espaciadora) y la pizarra dice si coincide; o escuchas tú y decides.';
$string['app_ec_level'] = 'Ritmos';
$string['app_ec_listen'] = 'Escuchar';
$string['app_ec_msg_count'] = 'Los toques no coinciden: sonaron {$a->want} palmas y hubo {$a->got} toques.';
$string['app_ec_msg_listen'] = '¡Escuchen!';
$string['app_ec_msg_right'] = '¡Eco perfecto!';
$string['app_ec_msg_start'] = 'Pulsa «Escuchar»: la pizarra da palmas y luego le toca a la clase.';
$string['app_ec_msg_turn'] = 'Ahora ustedes: palmas, o toques en el tambor.';
$string['app_ec_msg_wrong'] = 'Casi: mira dónde se escapó.';
$string['app_ec_name'] = 'Eco de palmas';
$string['app_ec_new'] = 'Otro ritmo';
$string['app_ec_normal'] = 'Normal';
$string['app_ec_pad'] = '¡Pom!';
$string['app_ec_pad_label'] = 'Toca aquí el ritmo';
$string['app_ec_record'] = 'Récord: {$a}';
$string['app_ec_slow'] = 'Lenta';
$string['app_ec_speed'] = 'Velocidad';
$string['app_ec_streak'] = 'Seguidos: {$a}';
$string['app_ec_teacher'] = 'Si dan palmas sin el tambor, decides tú:';
$string['app_ed_confirm_delete'] = '¿Seguro? Pulsa otra vez';
$string['app_ed_default_name'] = 'Lista {$a}';
$string['app_ed_delete'] = 'Borrar la lista';
$string['app_ed_deleted'] = 'Lista borrada';
$string['app_ed_edit_list'] = 'Editar la lista';
$string['app_ed_name'] = 'Nombre de la lista';
$string['app_ed_name_placeholder'] = 'Por ejemplo: 5º A';
$string['app_ed_need_one'] = 'Pega al menos un nombre (uno por línea).';
$string['app_ed_new_list'] = 'Nueva lista';
$string['app_ed_note_local'] = 'Se guarda solo en este ordenador, en este navegador. No sale de aquí.';
$string['app_ed_note_nostore'] = 'Este navegador no deja guardar: la lista durará hasta que cierres la página.';
$string['app_ed_paste_placeholder'] = 'Pega aquí la lista de tu clase
(se puede copiar de una hoja de cálculo)';
$string['app_ed_saved'] = 'Lista «{$a->name}» guardada con {$a->n} alumnos';
$string['app_ed_students'] = 'Alumnos (o palabras, preguntas…), uno por línea';
$string['app_er_again'] = 'Vuelve a tocarlo para ver la corrección';
$string['app_er_done'] = '¡Todos los errores encontrados!';
$string['app_er_found'] = '{$a->n} de {$a->of} errores encontrados';
$string['app_er_name'] = 'Caza de errores';
$string['app_er_show'] = 'Ver los que faltan';
$string['app_er_tap'] = 'Toca los errores';
$string['app_ex_ai'] = 'Prompt para tu IA';
$string['app_ex_ai_accept'] = 'Aceptar y seguir';
$string['app_ex_ai_any'] = 'un tema que elijas tú';
$string['app_ex_ai_copied'] = 'Copiado: pégalo en tu IA.';
$string['app_ex_ai_copy'] = 'Copiar';
$string['app_ex_ai_count'] = 'Cuántos';
$string['app_ex_ai_done'] = 'Añadidos {$a} ejercicios abajo: revísalos antes de guardar.';
$string['app_ex_ai_error'] = 'La IA del aula virtual no ha podido contestar. {$a}';
$string['app_ex_ai_for_advanced'] = 'alumnos de Bachillerato o etapas superiores (desde los 16 años)';
$string['app_ex_ai_for_early'] = 'niños de Infantil (de 3 a 6 años)';
$string['app_ex_ai_for_primary'] = 'alumnos de Primaria (de 6 a 12 años)';
$string['app_ex_ai_for_secondary'] = 'alumnos de Secundaria (de 12 a 16 años)';
$string['app_ex_ai_go'] = 'Generar';
$string['app_ex_ai_hint'] = 'Escribe el tema, copia el texto, pégalo en tu IA y pega lo que conteste en el cuadro de abajo.';
$string['app_ex_ai_hint_site'] = 'Escribe el tema y genéralos aquí con la IA del aula virtual, o copia el texto para tu propia IA.';
$string['app_ex_ai_level'] = 'Etapa';
$string['app_ex_ai_none'] = 'La IA no ha contestado con ejercicios en el formato. Prueba otra vez o cambia el tema.';
$string['app_ex_ai_prompt'] = 'Escribe {$a->n} ejercicios del juego «{$a->game}» para {$a->level}, sobre «{$a->topic}».

Formato (texto plano, sin nada más): {$a->rules} Separa un ejercicio de otro con una línea en blanco, y empieza cada uno con su título en una línea que comience por #.

Ejemplo:
{$a->example}

Contesta solo con los ejercicios, en el idioma de este texto, sin explicaciones ni formato Markdown. Comprueba que todo lo que escribas sea correcto.';
$string['app_ex_ai_topic'] = 'Tema';
$string['app_ex_ai_wait'] = 'La IA los está escribiendo; puede tardar un minuto.';
$string['app_ex_cancel'] = 'Cancelar';
$string['app_ex_check'] = 'Comprobar';
$string['app_ex_count'] = '{$a} ejercicios listos';
$string['app_ex_count_none'] = 'Aún ningún ejercicio: revisa el formato';
$string['app_ex_count_one'] = '1 ejercicio listo';
$string['app_ex_edit_title'] = '{$a}: mis ejercicios';
$string['app_ex_example'] = 'Ejemplo: {$a}';
$string['app_ex_example_classify_advanced'] = '# Biomoléculas
Glúcidos: glucosa, almidón, celulosa, glucógeno
Lípidos: colesterol, triglicéridos, fosfolípidos, ceras
Proteínas: hemoglobina, colágeno, insulina, queratina
Ácidos nucleicos: ADN, ARN mensajero, ARN de transferencia, ARN ribosómico
? colesterol: es un lípido, aunque no tenga ácidos grasos

# Enlace químico
Iónico: NaCl, KBr, CaO, MgCl₂
Covalente: H₂O, CO₂, CH₄, NH₃
Metálico: Fe, Cu, Al, Au

# Funciones pares e impares
Pares: x², cos x, |x|
Impares: x³, sen x, 1/x
Ni pares ni impares: eˣ, ln x, x + 1
? |x|: f(−x) = f(x), como en x²

# Oraciones compuestas
Coordinadas: Estudia y trabaja; Quería ir, pero llovía; ¿Vienes o te quedas?
Subordinadas sustantivas: Me dijo que vendría; Es necesario que estudies; No sé si vendrá
Subordinadas de relativo: El libro que me prestaste es bueno; Esa es la casa donde nací; Los alumnos que aprobaron salieron antes
Subordinadas adverbiales: Si llueve, no saldremos; Cuando llegues, avísame; Lo hizo para que aprendieras

# Funciones (para Venn)
Crecientes en todo ℝ: x³, eˣ, 2x + 1
Impares: x³, sen x, 1/x
? x³: es impar y crece siempre';
$string['app_ex_example_classify_primary'] = '# Vertebrados
Mamíferos: perro, ballena, murciélago, caballo
Aves: pingüino, gallina, avestruz, águila
Reptiles: tortuga, serpiente, lagarto
? murciélago: vuela, pero tiene pelo y sus crías toman leche
? pingüino: no vuela, pero tiene plumas y pone huevos

# Clases de palabras
Sustantivos: mesa, perro, alegría, ciudad
Adjetivos: alto, verde, feliz, rápido
Verbos: correr, pensar, escribir, saltar

# Estados de la materia
Sólido: hielo, piedra, madera
Líquido: agua, aceite, leche
Gas: vapor de agua, aire, oxígeno

# Números (para Venn)
Pares: 2, 4, 6, 8, 10, 12
Múltiplos de 3: 3, 6, 9, 12, 15
? 6: es par y múltiplo de 3

# Ángulos
Agudos: 30°, 45°, 60°, 89°
Rectos: 90°
Obtusos: 100°, 120°, 150°';
$string['app_ex_example_classify_secondary'] = '# Rocas
Ígneas: granito, basalto, piedra pómez, obsidiana
Sedimentarias: caliza, arenisca, conglomerado, carbón
Metamórficas: mármol, pizarra, cuarcita, gneis
? mármol: es caliza transformada por la presión y el calor

# Los cinco reinos
Animales: medusa, esponja, lombriz, pulpo
Plantas: helecho, musgo, pino, trigo
Hongos: champiñón, levadura, moho del pan
Protoctistas: ameba, paramecio, alga verde
Moneras: bacteria, cianobacteria, lactobacilo
? esponja: es un animal, aunque viva fija en el fondo
? levadura: es un hongo de una sola célula

# Cambios físicos y químicos
Físicos: fundir hielo, romper un vaso, disolver azúcar en agua, evaporar agua
Químicos: quemar papel, oxidarse un clavo, cocinar un huevo, agriarse la leche
? disolver azúcar en agua: el azúcar sigue siendo azúcar; si se evapora el agua, vuelve a aparecer

# Palabras según su sílaba tónica
Agudas: canción, reloj, café, papel
Llanas: árbol, mesa, lápiz, cárcel
Esdrújulas: música, pájaro, teléfono, último
Sobresdrújulas: dígamelo, cuéntaselo, explícaselo

# Números (el conjunto más pequeño)
Naturales: 3; 17; 100
Enteros negativos: −4; −12; −1
Racionales no enteros: 1/2; 0,75; −2,5
Irracionales: √2; π; √5
? 0,75: es 3/4, una fracción

# Divisibilidad (para Venn)
Múltiplos de 4: 4, 8, 12, 16, 20, 24
Múltiplos de 6: 6, 12, 18, 24, 30
? 12: es múltiplo de 4 y de 6, como todos los múltiplos de 12';
$string['app_ex_example_errors_advanced'] = '# El ADN
El ADN es una doble hélice cuyas bases se emparejan así: la adenina con la [citosina|timina] y la guanina con [el uracilo|la citosina|el uracilo solo aparece en el ARN]. Watson y Crick publicaron su estructura en [1963|1953].

# El pH
A 25 °C, una disolución neutra tiene un pH de [0|7], y una disolución con pH 3 es [básica|ácida].

# Literatura española
[La Celestina|El Lazarillo de Tormes] es la primera novela picaresca, y Garcilaso de la Vega escribió en el [Barroco|Renacimiento].

# Derivadas
La derivada de sen x es [−cos x|cos x], y la derivada de eˣ es [x·eˣ⁻¹|eˣ|la exponencial es su propia derivada].

# La Constitución
La Constitución española vigente es de [1987|1978], y se aprobó en referéndum el 6 de [noviembre|diciembre].

# Newton
Según la segunda ley de Newton, la fuerza es igual a la masa por la [velocidad|aceleración], y se mide en [julios|newtons|el julio mide la energía y el trabajo].';
$string['app_ex_example_errors_primary'] = '# Colón
Colón llegó a América en [1942|1492|en 1492, no en 1942] con tres [barcos|carabelas/naves]: la Pinta, la Niña y la [Santa Lucía|Santa María].

# Ortografía
Ayer [hiba|iba] al colegio cuando [bi|vi] un pájaro [echo|hecho|«hecho», con h, es del verbo hacer] de papel.

# Figuras
Un triángulo tiene [cuatro|tres] lados y sus ángulos suman [360|180|los ángulos de un triángulo suman 180 grados] grados.

# Las plantas
Las plantas fabrican su alimento con la luz de la [luna|sol] en un proceso llamado [respiración|fotosíntesis].

# Capitales
Madrid es la capital de [Portugal|España] y está en el centro de la [isla|península] ibérica.';
$string['app_ex_example_errors_secondary'] = '# La célula
En la célula, el ADN se guarda en el [ribosoma|núcleo], la energía se obtiene en las [vacuolas|mitocondrias] y, en las plantas, la fotosíntesis se hace en los [lisosomas|cloroplastos].

# Ortografía
Me [haz|has] dicho que no [valla|vaya|«vaya» es del verbo ir; «valla» es una cerca] a la fiesta, pero [haber|a ver] quién me lo impide.

# Pitágoras
En un triángulo [equilátero|rectángulo], la hipotenusa al cuadrado es igual a la [resta|suma] de los catetos al cuadrado: si los catetos miden 3 y 4, la hipotenusa mide [7|5|√(9 + 16) = 5].

# La Revolución francesa
La Revolución francesa empezó en [1798|1789] con la toma de la [Moncloa|Bastilla], y terminó con la llegada al poder de [Luis XIV|Napoleón Bonaparte].

# Luz y sonido
La luz viaja en el vacío a unos [300 000 km/h|300 000 km/s|300 000 kilómetros por segundo, no por hora], y el sonido, en cambio, no puede viajar por el [aire|vacío|el sonido necesita un medio, como el aire o el agua].

# Ríos
El río más largo de la península ibérica es el [Ebro|Tajo], que desemboca en el océano Atlántico en [Oporto|Lisboa|en Oporto desemboca el Duero].';
$string['app_ex_example_order_advanced'] = '# La síntesis de proteínas (eucariotas)
Transcripción del ADN a ARN mensajero
Maduración del ARN mensajero
Salida del ARN mensajero al citoplasma
Traducción en el ribosoma
Plegamiento de la proteína

# La respiración celular
Glucólisis
Descarboxilación oxidativa del piruvato
Ciclo de Krebs
Cadena respiratoria y fosforilación oxidativa

# Ondas electromagnéticas, de menor a mayor frecuencia
Ondas de radio
Microondas
Infrarrojo
Luz visible
Ultravioleta
Rayos X
Rayos gamma

# Movimientos artísticos
Renacimiento
Barroco
Neoclasicismo
Romanticismo
Realismo
Impresionismo
Cubismo

# La Segunda República y la Guerra Civil
Proclamación de la Segunda República
Bienio reformista
Bienio radical-cedista
Victoria del Frente Popular
Golpe de Estado y comienzo de la Guerra Civil';
$string['app_ex_example_order_primary'] = '# El ciclo del agua
Evaporación
Condensación
Precipitación
Acumulación
? Condensación: el vapor de agua se enfría y forma gotas

# Las fases de la Luna
Luna nueva
Cuarto creciente
Luna llena
Cuarto menguante

# De la semilla a la planta
Semilla
Germinación
Plántula
Planta adulta
Flor
Fruto

# Los planetas desde el Sol
Mercurio
Venus
Tierra
Marte
Júpiter
Saturno
Urano
Neptuno

# Las edades de la Historia
Prehistoria
Edad Antigua
Edad Media
Edad Moderna
Edad Contemporánea

# Resolver un problema
Leer el enunciado
Anotar los datos
Pensar qué operación hacer
Calcular
Comprobar el resultado';
$string['app_ex_example_order_secondary'] = '# Capas de la Tierra, de fuera hacia dentro
Corteza
Manto
Núcleo externo
Núcleo interno

# Niveles de organización de los seres vivos
Átomo
Molécula
Célula
Tejido
Órgano
Aparato o sistema
Organismo

# La mitosis
Profase
Metafase
Anafase
Telofase
? Metafase: los cromosomas se colocan en el centro de la célula

# La Revolución francesa (1789-1799)
Toma de la Bastilla
Declaración de los Derechos del Hombre y del Ciudadano
Proclamación de la República
Ejecución de Luis XVI
Golpe de Estado de Napoleón

# Prioridad de las operaciones
Paréntesis
Potencias y raíces
Multiplicaciones y divisiones
Sumas y restas';
$string['app_ex_example_whoami_advanced'] = '# Biología
= El ribosoma / ribosoma
No tengo membrana.
Estoy formado por ARN y proteínas.
Estoy libre en el citoplasma o pegado al retículo endoplasmático rugoso.
Traduzco el ARN mensajero en proteínas.

# Física
= Albert Einstein / Einstein
Nací en Ulm en 1879.
Trabajé en la oficina de patentes de Berna.
Me dieron el premio Nobel por explicar el efecto fotoeléctrico.
Formulé la teoría de la relatividad.

# Historia
= Napoleón Bonaparte / Napoleón / Bonaparte
Nací en Córcega en 1769.
Di un golpe de Estado en 1799.
Mis tropas ocuparon España y en 1808 empezó la guerra de la Independencia.
Me coroné emperador de los franceses y perdí en Waterloo.

# Filosofía
= Platón
Fundé la Academia en Atenas.
Aristóteles fue mi alumno.
Fui discípulo de Sócrates.
Escribí La República, con el mito de la caverna.

# Economía
= Adam Smith / Smith
Nací en Escocia en 1723.
Expliqué la división del trabajo con una fábrica de alfileres.
Hablé de la mano invisible del mercado.
Escribí La riqueza de las naciones.

# Literatura
= Federico García Lorca / García Lorca / Lorca
Nací en Fuente Vaqueros, en Granada, en 1898.
Dirigí la compañía de teatro La Barraca.
Formé parte de la Generación del 27.
Escribí Romancero gitano y La casa de Bernarda Alba.';
$string['app_ex_example_whoami_primary'] = '# Ciencia
= Marie Curie / Curie
Nací en Varsovia en 1867.
Gané dos premios Nobel, en dos ciencias distintas.
Descubrí el polonio y el radio.
Estudié la radiactividad con Pierre, mi marido.

# Animales
= El delfín / delfín
Vivo en el mar, pero no soy un pez.
Respiro aire y tengo que subir a la superficie.
Me oriento con ecos.
Soy un mamífero muy listo y juguetón.

# Geografía
= El Everest / Everest
Estoy en Asia, entre dos países.
Estoy en el Himalaya.
Mido más de 8800 metros.
Soy la montaña más alta del mundo.

# Arte
= Leonardo da Vinci / Leonardo
Nací en Italia en 1452.
Dibujé máquinas voladoras siglos antes que los aviones.
Pinté La última cena.
Pinté la Gioconda.

# Literatura
= Miguel de Cervantes / Cervantes
Fui soldado y en una batalla perdí el movimiento de una mano.
Estuve cinco años cautivo en Argel.
Escribí novelas, teatro y poesía en el Siglo de Oro.
Escribí Don Quijote de la Mancha.';
$string['app_ex_example_whoami_secondary'] = '# Historia
= Carlos I / Carlos V / Carlos
Nací en Gante en el año 1500.
Me retiré al monasterio de Yuste.
Fui emperador del Sacro Imperio Romano Germánico.
Fui nieto de los Reyes Católicos y rey de España.

# Ciencia
= Isaac Newton / Newton
Nací en Inglaterra en el siglo XVII.
Fui profesor en Cambridge y presidente de la Royal Society.
Descompuse la luz blanca con un prisma.
Formulé la ley de la gravitación universal y tres leyes del movimiento.

# Química
= El oxígeno / oxígeno / O
Mi número atómico es 8.
Soy casi la mitad de la masa de la corteza terrestre.
Soy cerca del 21 % del aire.
Sin mí no hay combustión, y los seres vivos me respiran.

# Geografía
= El Nilo / Nilo
Desemboco en el mar Mediterráneo formando un delta.
Una de mis fuentes está en la región de los Grandes Lagos de África.
Paso por Sudán y por Egipto.
Cerca de mí se construyeron las pirámides de Guiza.

# Arte
= Diego Velázquez / Velázquez
Nací en Sevilla en 1599.
Fui pintor de la corte de Felipe IV.
Pinté La rendición de Breda.
Pinté Las Meninas.

# Matemáticas
= Pitágoras
Nací en la isla de Samos.
Fundé una escuela en Crotona, en el sur de Italia.
Para mi escuela, todo era número.
Un teorema sobre triángulos rectángulos lleva mi nombre.';
$string['app_ex_exercise'] = 'Ejercicio';
$string['app_ex_format'] = 'Una línea que empieza por # es el título, y una que empieza por ? explica un elemento: «? elemento: porqué».';
$string['app_ex_help_classify'] = '«Grupo: elemento, elemento, elemento», un grupo por línea (con ; en lugar de , si los elementos llevan comas). Un elemento en dos grupos va en su intersección (Venn).';
$string['app_ex_help_errors'] = 'El texto, con cada error así: [lo que pone|lo correcto], varias correcciones con /, y el porqué como tercera parte: [1942|1492|no en 1942].';
$string['app_ex_help_order'] = 'Los elementos en su orden correcto, uno por línea.';
$string['app_ex_help_whoami'] = '«= respuesta» en la primera línea (otras respuestas válidas tras /) y debajo las pistas, de la más difícil a la más fácil.';
$string['app_ex_mine'] = 'Mis ejercicios';
$string['app_ex_save'] = 'Guardar';
$string['app_ex_text'] = 'Tus ejercicios, con una línea en blanco entre uno y otro';
$string['app_ex_untitled'] = 'Ejercicio {$a}';
$string['app_ex_why'] = 'Por qué';
$string['app_fin_ok'] = 'Vale';
$string['app_fin_time'] = '¡Tiempo!';
$string['app_fw_compare'] = 'Colorea lo mismo en otra fila';
$string['app_fw_help'] = 'Toca las piezas para colorearlas: el mismo ancho es la misma cantidad. La regla se mueve desde su asa roja.';
$string['app_fw_l_decimal'] = 'Decimales';
$string['app_fw_l_fraction'] = 'Fracciones';
$string['app_fw_l_none'] = 'Nada';
$string['app_fw_l_percent'] = 'Porcentajes';
$string['app_fw_labels'] = 'En las piezas';
$string['app_fw_rows'] = 'Filas';
$string['app_fw_ruler'] = 'Regla para comparar';
$string['app_fw_start'] = 'Colorea algunas piezas';
$string['app_fx_all'] = 'Todos los símbolos';
$string['app_fx_delete'] = 'Borrar';
$string['app_fx_hint'] = 'Escríbela en una línea: 3/4, x^2, raíz(2), {x + y = 3; x − y = 1}; química con ce(2H2 + O2 -> 2H2O). Tab salta al siguiente hueco □.';
$string['app_fx_n_root'] = 'raíz';
$string['app_fx_n_sin'] = 'sen';
$string['app_fx_n_sqrt'] = 'raíz';
$string['app_fx_n_unit'] = 'ud';
$string['app_fx_p_abs'] = 'Valor absoluto';
$string['app_fx_p_box'] = 'Hueco para rellenar';
$string['app_fx_p_chem'] = 'Molécula o ion: ce(H2SO4), ce(Fe^3+)';
$string['app_fx_p_equilibrium'] = 'Equilibrio: ce(N2 + 3H2 <=> 2NH3)';
$string['app_fx_p_frac'] = 'Fracción';
$string['app_fx_p_index'] = 'Subíndice';
$string['app_fx_p_int'] = 'Integral';
$string['app_fx_p_lim'] = 'Límite';
$string['app_fx_p_mixed'] = 'Número mixto';
$string['app_fx_p_paren'] = 'Paréntesis';
$string['app_fx_p_power'] = 'Potencia';
$string['app_fx_p_reaction'] = 'Reacción: ce(2H2 + O2 -> 2H2O)';
$string['app_fx_p_root'] = 'Raíz de índice n';
$string['app_fx_p_sqrt'] = 'Raíz cuadrada';
$string['app_fx_p_square'] = 'Al cuadrado';
$string['app_fx_p_sum'] = 'Sumatorio';
$string['app_fx_p_sys'] = 'Sistema de ecuaciones';
$string['app_fx_p_units'] = 'Unidades, en letra recta: ud(m/s^2)';
$string['app_fx_p_vec'] = 'Vector';
$string['app_fx_ph'] = 'Por ejemplo: 3/4 + 1/2 = □';
$string['app_fx_put'] = 'Ponerla en la pizarra';
$string['app_fx_save'] = 'Guardar los cambios';
$string['app_fx_title'] = 'Fórmula';
$string['app_g_and_now'] = 'Y ahora…';
$string['app_g_clear'] = 'Borrar resultado';
$string['app_g_drag_hint'] = 'Arrastra para cambiar el orden';
$string['app_g_empty_start'] = 'Elige una lista (o pega los nombres) y pulsa «Hacer grupos».';
$string['app_g_goes_to'] = '{$a->name}: grupo {$a->n}';
$string['app_g_group_n'] = 'Grupo {$a}';
$string['app_g_how'] = '¿Cómo los repartimos?';
$string['app_g_less'] = 'Uno menos';
$string['app_g_list_empty'] = 'Esa lista está vacía.';
$string['app_g_made'] = 'Hechos {$a} grupos';
$string['app_g_make'] = 'Hacer grupos';
$string['app_g_mode_num'] = 'Nº de grupos';
$string['app_g_mode_size'] = 'Alumnos por grupo';
$string['app_g_more'] = 'Uno más';
$string['app_g_n_groups'] = '{$a} grupos';
$string['app_g_n_size'] = '{$a} alumnos por grupo';
$string['app_g_need_two'] = 'Hacen falta al menos dos nombres.';
$string['app_g_paste_hint'] = 'Pega los nombres de tu clase, uno por línea.';
$string['app_g_paste_now'] = 'Pegar nombres ahora…';
$string['app_g_paste_placeholder'] = 'Pega aquí los nombres, uno por línea';
$string['app_g_pasted_aria'] = 'Nombres pegados, uno por línea';
$string['app_g_place_all'] = 'Colocarlos a todos ya';
$string['app_g_roles'] = 'Un rol para cada uno';
$string['app_g_roles_done'] = 'Roles repartidos';
$string['app_g_roles_edit'] = 'Cambiar los roles';
$string['app_g_roles_hint'] = 'Uno por línea (hasta 6).';
$string['app_g_roles_list'] = 'Roles, uno por línea';
$string['app_g_roles_rotate'] = 'Otros roles';
$string['app_g_roles_set'] = 'Juego de roles';
$string['app_g_roles_set_music'] = 'Música';
$string['app_g_roles_set_own'] = 'Los míos';
$string['app_g_roles_set_reading'] = 'Lectura';
$string['app_g_roles_set_science'] = 'Ciencias';
$string['app_g_roles_set_tasks'] = 'Tareas del grupo';
$string['app_g_save_course'] = 'Guardar como grupos del curso';
$string['app_g_save_failed'] = 'No se han podido guardar. Otra vez';
$string['app_g_save_list'] = 'Guardar como lista';
$string['app_g_saved'] = 'Guardados en el curso';
$string['app_g_saved_announce'] = 'Guardados en el curso como {$a}';
$string['app_g_saved_as'] = 'Guardados en el curso como «{$a}».';
$string['app_g_saving'] = 'Guardando…';
$string['app_g_sizes'] = '{$a->a} y {$a->b}';
$string['app_g_students'] = 'Alumnos';
$string['app_g_summary_many'] = '{$a->n} alumnos en {$a->k} grupos de {$a->size}.';
$string['app_g_summary_one'] = '{$a->n} alumnos en {$a->k} grupo de {$a->size}.';
$string['app_g_suspense'] = 'Repartir con emoción';
$string['app_ga_clue'] = 'Pista: {$a}';
$string['app_ga_clue_optional'] = 'Pista (si quieres)';
$string['app_ga_delete'] = 'Borrar';
$string['app_ga_from_glossary'] = 'Glosarios del curso';
$string['app_ga_from_lists'] = 'Al azar de tus listas';
$string['app_ga_game'] = 'Juego';
$string['app_ga_lost'] = '¡Uy! Era «{$a}»';
$string['app_ga_new_word'] = 'Nueva palabra';
$string['app_ga_press_new_word'] = 'Elige la palabra y pulsa «Nueva palabra»';
$string['app_ga_secret_word'] = 'Palabra secreta (no se ve)';
$string['app_ga_settings'] = 'Ajustes';
$string['app_ga_start'] = 'Empezar';
$string['app_ga_try'] = 'Probar';
$string['app_ga_type_it'] = 'Escribirla yo';
$string['app_ga_whole_class'] = 'Toda la clase';
$string['app_ga_word'] = 'Palabra';
$string['app_ga_words_lang'] = 'Idioma de las palabras';
$string['app_gb_area_perimeter'] = 'Área: {$a->area} cuadraditos · Perímetro: {$a->perimeter}';
$string['app_gb_close'] = 'Toca el primer clavo para cerrar la figura';
$string['app_gb_drag'] = 'Arrastra una esquina para cambiar la figura';
$string['app_gb_help'] = 'Toca clavos para estirar una goma: el primer clavo otra vez cierra la figura, y el último otra vez la deja como línea. Arrastra una esquina para llevarla a otro clavo.';
$string['app_gb_length'] = 'Longitud: {$a}';
$string['app_gb_measure'] = 'Área y perímetro';
$string['app_gb_n_by_n'] = '{$a} × {$a}';
$string['app_gb_next'] = 'Toca el siguiente clavo';
$string['app_gb_size'] = 'Clavos';
$string['app_gb_squares'] = 'Ver los cuadraditos';
$string['app_gb_start'] = 'Toca un clavo para empezar una goma';
$string['app_gd_ahorcado_how'] = 'Escribe la palabra tú (se escribe oculta), usa las de la pizarra o toma un glosario del curso.
Una pista ayuda a los pequeños y hace pensar a los mayores.
«Destapar una letra» cuesta un globo: úsalo cuando se atasquen.
Con «Idioma de las palabras», en inglés o en francés, con su teclado.
En Infantil, «Primera letra de un nombre» necesita una lista de la clase.';
$string['app_gd_ahorcado_scene'] = 'En la asamblea de Infantil sale la foto de Pablo y debajo «_ABLO». Tres letras grandes: P, M y S. Pablo grita la suya antes que nadie; la siguiente es María, y la clase ya busca la M.';
$string['app_gd_ahorcado_sources'] = 'Ferreiro, E. y Teberosky, A. (1979). Los sistemas de escritura en el desarrollo del niño. Siglo XXI.';
$string['app_gd_ahorcado_stages'] = 'early|La primera letra del nombre de un compañero, con su foto.
primary|Palabras del tema y ortografía; globos que se van.
secondary|Vocabulario de la materia desde el glosario; globos que se quedan.
advanced|Terminología y lenguas extranjeras, con el idioma de las palabras.';
$string['app_gd_ahorcado_what'] = 'Adivinar una palabra letra a letra antes de que se gasten los globos; en Infantil, la primera letra del nombre de un compañero.';
$string['app_gd_ahorcado_why'] = 'En Infantil, el juego usa los nombres de la clase porque el nombre propio es, para el niño, la primera forma escrita estable y con significado (Ferreiro y Teberosky, 1979).
Los globos que se van, en lugar de una figura ahorcada, le quitan el castigo a la imagen clásica.';
$string['app_gd_ahorcado_works'] = 'Ortografía y vocabulario: qué letras tiene una palabra y en qué orden.
Pensar qué letras son más probables (primero las vocales, luego las más frecuentes).
En Infantil, reconocer la primera letra de los nombres de la clase.
Con un glosario del curso, el vocabulario de la materia con su definición como pista.';
$string['app_gd_all'] = 'Todas las guías';
$string['app_gd_asi_how'] = 'Enséñalos al principio de curso, uno a uno, explicando qué se hace con cada uno.
Pon el cartel antes de empezar cada actividad, no cuando ya hay ruido.
Reconoce en voz alta cuando la clase lo cumple.';
$string['app_gd_asi_scene'] = 'Después del trabajo en grupo, la maestra toca «Escucha» y el cartel llena la pantalla. Los grupos se giran hacia la pizarra antes de que ella diga nada: lo practicaron la primera semana.';
$string['app_gd_asi_sources'] = 'Simonsen, B., Fairbanks, S., Briesch, A., Myers, D. y Sugai, G. (2008). Evidence-based practices in classroom management: Considerations for research to practice. Education and Treatment of Children, 31(3), 351–380.|https://doi.org/10.1353/etc.0.0007';
$string['app_gd_asi_stages'] = 'early|Pocos carteles y siempre los mismos, cada uno con su gesto.
primary|En cada cambio de actividad.
secondary|Al empezar el trabajo en grupo o individual.
advanced|En talleres y laboratorios.';
$string['app_gd_asi_what'] = 'Carteles a pantalla completa con la forma de trabajar del momento: silencio, en voz baja, por parejas, en grupo, levanta la mano, escucha.';
$string['app_gd_asi_why'] = 'Una revisión de prácticas de gestión del aula con apoyo empírico señala como clave exponer, enseñar, repasar y reforzar las expectativas de la clase, y dar estructura con rutinas bien definidas (Simonsen y otros, 2008). El cartel deja a la vista la expectativa del momento.';
$string['app_gd_asi_works'] = 'Que la clase sepa qué se espera en cada momento.
Cambios más rápidos entre actividades.
Menos órdenes de viva voz.';
$string['app_gd_azar_how'] = 'Para sortear, la ruleta con la lista de la clase, sin repetir hasta que salgan todos.
Antes de tirar, que apuesten qué suma saldrá más con dos dados y por qué.
«Muchas tiradas»: diez, luego cien, luego mil; que comparen la gráfica con lo esperado.
Los dados de operaciones para el cálculo mental: tirar y operar.
Las cartas y las monedas para juegos de probabilidad sencillos (cara o cruz, el palo de una carta).';
$string['app_gd_azar_scene'] = 'En segundo de ESO, la clase apuesta: con dos dados, ¿saldrá más el 7 o el 12? Hay votos para los dos. Con diez tiradas gana el 12 por casualidad y hay protestas; con mil, la barra del 7 es unas seis veces la del 12, como dice la gráfica de lo esperado.';
$string['app_gd_azar_sources'] = 'Konold, C. (1989). Informal conceptions of probability. Cognition and Instruction, 6(1), 59–98.|https://srri.umass.edu/publications/konold-1989icp';
$string['app_gd_azar_stages'] = 'early|Contar los puntos del dado y sortear quién empieza.
primary|Sumas con dados, cálculo mental y qué es más probable.
secondary|Frecuencias y probabilidad: la ley de los grandes números con muchas tiradas.
advanced|Distribuciones de probabilidad (la suma de dos dados) y simulación.';
$string['app_gd_azar_what'] = 'Ruleta, dados, monedas y cartas para sortear y para jugar, y muchas tiradas de golpe con su gráfica de frecuencias.';
$string['app_gd_azar_why'] = 'Ante el azar, mucha gente intenta adivinar qué saldrá en la próxima tirada, como si cada una tuviera una respuesta correcta: Konold (1989) lo llamó el enfoque del resultado. La probabilidad habla de lo que pasa a la larga, no de una tirada.
«Muchas tiradas» lo enseña a la vista: con diez tiradas las barras van a saltos, y con mil se acercan a lo que deberían; con dos dados, la suma 7 sale más que el 2 o el 12.';
$string['app_gd_azar_works'] = 'Sortear con justicia: turnos, grupos, quién empieza.
Operaciones con dados: sumar, restar o multiplicar lo que sale.
Probabilidad: qué es más probable y por qué.
Frecuencias: lo que sale en muchas tiradas frente a lo que debería salir.
La diferencia entre lo que pasa una vez y lo que pasa a la larga.';
$string['app_gd_balanza_how'] = '«Comparar»: que digan hacia dónde se inclinará antes de poner la pesa.
Sin números (Infantil), solo cubos: qué plato pesa más y cuántos hay que añadir para igualarlos.
Con números: varias formas de equilibrar 10 (5 + 5, 5 + 2 + 2 + 1…).
«Ecuaciones»: una nueva o la que escriban; que digan qué quitarían de los dos platos antes de tocar nada.
Quitar algo de un solo plato, a propósito: la balanza se inclina y la ecuación pasa a ser una desigualdad.
«Abrir las cajas» al final, para comprobar el valor de x.
«Duelo»: el mismo material en dos mitades para dos alumnos con el mismo reto; a la vez en una pantalla multitáctil, por turnos con un reloj cada uno con proyector, o «Comparar» para poner dos modelos uno al lado del otro.';
$string['app_gd_balanza_scene'] = 'En segundo de ESO, la profesora escribe 3x + 1 = x + 9. Una alumna quiere «pasar el 1 restando». Quita una pesa de un solo plato y la balanza se inclina; la clase ve que hay que quitarla también del otro, y después una caja de cada lado: «pasar restando» deja de ser una regla para aprender de memoria.';
$string['app_gd_balanza_sources'] = 'Otten, M., Van den Heuvel-Panhuizen, M. y Veldhuis, M. (2019). The balance model for teaching linear equations: a systematic literature review. International Journal of STEM Education, 6, 30.|https://doi.org/10.1186/s40594-019-0183-2
Vlassis, J. (2002). The balance model: Hindrance or support for the solving of linear equations with one unknown. Educational Studies in Mathematics, 49(3), 341–359.|https://doi.org/10.1023/A:1020229023965';
$string['app_gd_balanza_stages'] = 'early|Comparar con cubos: más, menos e igual.
primary|Los signos >, < e =, descomponer números y, al final de la etapa, ecuaciones sencillas como x + 3 = 8.
secondary|Ecuaciones de primer grado con la incógnita en un lado o en los dos (3x + 2 = x + 10).';
$string['app_gd_balanza_what'] = 'Una balanza de dos platos: compara pesos en Infantil y Primaria y, desde Secundaria, representa ecuaciones con cajas de peso desconocido.';
$string['app_gd_balanza_why'] = 'En una ecuación, el igual dice que los dos lados valen lo mismo; en la balanza, eso se ve: si se quita algo de un plato y no del otro, se inclina. Por eso es uno de los modelos más usados para enseñar a resolver ecuaciones.
Una revisión de 34 estudios (Otten, Van den Heuvel-Panhuizen y Veldhuis, 2019) lo encuentra muy extendido como apoyo para resolver ecuaciones, pero sin un patrón claro en sus resultados: es una herramienta más compleja de lo que parece, y conviene usarla con intención, no como truco. Vlassis (2002) analiza los argumentos de quienes la defienden y de quienes la rechazan.
Tiene un límite que conviene decir en clase: no hay pesas negativas, así que las ecuaciones con números negativos necesitan otro modelo.';
$string['app_gd_balanza_works'] = 'Comparar cantidades: más, menos, igual, y los signos >, < e =.
La suma como peso: 5 pesa lo mismo que 2 + 2 + 1.
El signo igual como equilibrio entre dos lados, no como «aquí va el resultado».
Resolver ecuaciones de primer grado haciendo lo mismo en los dos lados: quitar y repartir.
Las desigualdades: lo que se ve cuando la balanza se inclina (2x + 2 < 11).';
$string['app_gd_base10_how'] = '«Construir un número»: que lo formen con bloques y lo lean como suma de sus partes.
Con diez en una columna, «Cambiar 10 por 1» los agrupa; «Romper en 10» hace lo contrario.
«Esconder el número» y «¿Qué número es?» para leerlo solo con los bloques.
Para restar llevando, que rompan una decena antes de quitar: lo mismo que en el papel.
En otra base, los cambios son de ese número de bloques, y el número sale también escrito en esa base («234 en base 5»).
«Duelo»: el mismo material en dos mitades para dos alumnos con el mismo reto; a la vez en una pantalla multitáctil, por turnos con un reloj cada uno con proyector, o «Comparar» para poner dos modelos uno al lado del otro.';
$string['app_gd_base10_scene'] = 'En tercero, el maestro pide 52 menos 17. Un alumno dice que no se puede quitar 7 de 2. Rompe una decena en diez unidades con un toque, quita siete, y la clase ve qué significa «llevarse una» en la resta antes de escribirla.';
$string['app_gd_base10_sources'] = 'Dienes, Z. P. (1960). Building Up Mathematics. Hutchinson Educational.';
$string['app_gd_base10_stages'] = 'early|De vez en cuando: contar unidades y ver que diez forman una barra.
primary|Valor de posición, sumas y restas llevando.
secondary|Otras bases: binario y hexadecimal en Tecnología; y para quien aún no domina el valor de posición.
advanced|En Magisterio, para enseñar el sistema de numeración decimal.';
$string['app_gd_base10_what'] = 'Unidades, decenas, centenas y millares en una tabla de valores: el número que forman, por partes.';
$string['app_gd_base10_why'] = 'Cambiar diez por uno (agrupar) y uno por diez (romper) es lo que hay detrás de «llevarse una» en las cuentas: con los bloques se hace a la vista antes de hacerlo en el papel.
Zoltan Dienes, que expuso su teoría de cómo se aprenden las matemáticas en Building Up Mathematics (1960), dio a conocer los bloques multibase para enseñar el valor de posición: la misma idea en base 2, 5 o 16 enseña que el diez es solo una elección.';
$string['app_gd_base10_works'] = 'El valor de posición: el 3 de 30 no vale lo mismo que el de 300.
Agrupar diez de una clase en una de la siguiente, y romper una en diez.
Sumar y restar llevando, sabiendo el porqué de cada paso.
Leer y escribir números como suma de sus partes («100 + 30 + 12 = 142»).
Otras bases (2, 5, 16…): el valor de posición sin el diez, para Tecnología y para entender el sistema.';
$string['app_gd_button'] = 'Guía docente';
$string['app_gd_calc_how'] = 'Con «Estimar antes», el resultado sale como «?» hasta que pulses otra vez «=» o «Ver el resultado»: primero estiman y luego comprueban.
Con «Paso a paso», una operación combinada se resuelve línea a línea: lo que toca hacer va subrayado y lo que se acaba de calcular, en verde. Pregúntales qué va después antes de enseñarlo.
Para comprobar una cuenta hecha en el cuaderno, línea a línea con los pasos.
Patrones: multiplicar varias veces por 10, dividir entre 3, ver los decimales que se repiten.
En Secundaria, la científica para potencias, raíces, trigonometría y notación científica; «2nd» da las funciones inversas.';
$string['app_gd_calc_scene'] = 'En sexto, el maestro pregunta cuánto es 1 entre 3. Alguien dice 0,3. Lo teclean y salen treses hasta el final de la pantalla: la clase ve que el decimal no se acaba, y de ahí sale la idea de decimal periódico.';
$string['app_gd_calc_sources'] = 'Ellington, A. J. (2003). A meta-analysis of the effects of calculators on students\' achievement and attitude levels in precollege mathematics classes. Journal for Research in Mathematics Education, 34(5), 433–463.';
$string['app_gd_calc_stages'] = 'primary|Operaciones combinadas paso a paso, con y sin paréntesis; estimar antes de calcular; comprobar cuentas.
secondary|La científica: potencias, raíces, notación científica; la jerarquía con potencias y números negativos.
advanced|Funciones, trigonometría en grados o radianes, y logaritmos.';
$string['app_gd_calc_what'] = 'Una calculadora grande en la pizarra: básica en Primaria y científica desde Secundaria. «Paso a paso» enseña cómo se resuelve una operación combinada, y «Estimar antes» oculta el resultado hasta que la clase diga cuánto dará.';
$string['app_gd_calc_why'] = 'Un metaanálisis de 54 estudios (Ellington, 2003) encontró que, cuando la calculadora se usaba también en los exámenes, mejoraban las destrezas de operar y de resolver problemas, y también la actitud hacia las matemáticas.
Proyectada, todos ven las mismas teclas y el mismo resultado, y se puede pensar en voz alta qué teclear antes de hacerlo.';
$string['app_gd_calc_works'] = 'Comprobar los resultados del cálculo escrito o mental.
La jerarquía de las operaciones: paréntesis, potencias, × y ÷, + y −, paso a paso.
Estimar antes de calcular.
Explorar patrones: qué pasa al multiplicar por 10, por 0,1…
Centrarse en el problema cuando las cuentas son largas.
La científica: potencias, raíces, funciones y notación científica.';
$string['app_gd_clasificar_how'] = '«Clasificar»: una tarjeta y después su caja; al comprobar, las mal puestas vuelven.
«El intruso»: cuatro tarjetas, tres de un grupo y una de otro; que digan por qué sobra antes de tocarla.
«Venn»: dos grupos que comparten elementos, como los múltiplos de 4 y los de 6.
En «Mis ejercicios», un grupo por línea («Grupo: elemento, elemento»); los ejemplos de cada etapa sirven de modelo.';
$string['app_gd_clasificar_scene'] = 'En segundo de ESO, el intruso enseña caliza, arenisca, mármol y carbón. Una alumna dice que sobra el carbón porque no es una piedra. Toca el mármol cuando la clase le recuerda cómo se forma: es una roca metamórfica, y las otras tres son sedimentarias.';
$string['app_gd_clasificar_sources'] = 'Inhelder, B. y Piaget, J. (1964). The Early Growth of Logic in the Child: Classification and Seriation. London: Routledge & Kegan Paul.
Metcalfe, J. (2017). Learning from errors. Annual Review of Psychology, 68, 465–489.|https://doi.org/10.1146/annurev-psych-010416-044022';
$string['app_gd_clasificar_stages'] = 'primary|Animales, clases de palabras, estados de la materia, ángulos.
secondary|Rocas, los cinco reinos, cambios físicos y químicos, conjuntos de números.
advanced|Biomoléculas, enlaces químicos, funciones pares e impares, tipos de oraciones.';
$string['app_gd_clasificar_what'] = 'Tarjetas que se reparten en grupos; también como «El intruso» (tres de un grupo y una de otro) y como diagrama de Venn (un grupo, el otro o los dos).';
$string['app_gd_clasificar_why'] = 'Clasificar es agrupar por lo que las cosas tienen en común, y la inclusión de clases (todo perro es un mamífero, pero no al revés) es una de las bases del razonamiento lógico que estudiaron Inhelder y Piaget (1964).
Cada error devuelve la tarjeta con su porqué, si lo tiene: los errores corregidos enseguida ayudan a aprender (Metcalfe, 2017).
En el diagrama de Venn, la zona del medio obliga a mirar dos criterios a la vez.';
$string['app_gd_clasificar_works'] = 'Clasificar según un criterio y decir cuál es.
Los casos que engañan: el murciélago vuela, pero es un mamífero.
En el intruso, encontrar lo que no encaja y por qué.
En el diagrama de Venn, ver que un elemento puede ser de dos clases a la vez.';
$string['app_gd_close'] = 'Cerrar la guía';
$string['app_gd_codigo_how'] = 'Escribe el código (de 2 a 8 números o letras) y una pista por línea; se enseñan una a una.
Una cuenta atrás añade emoción; sin ella, hay más calma para pensar.
En grupos, cada grupo resuelve una pista y aporta su cifra.
Al abrirlo, un mensaje final (el siguiente paso, la tarea).';
$string['app_gd_codigo_scene'] = 'Última clase del trimestre en segundo de ESO: cuatro pistas, una por grupo, cada una con un problema de proporcionalidad. Cuando el cuarto grupo dicta su cifra y el candado se abre, el mensaje dice dónde está la ficha de repaso del examen.';
$string['app_gd_codigo_sources'] = 'Veldkamp, A., van de Grint, L., Knippels, M.-C. P. J. y van Joolingen, W. R. (2020). Escape education: A systematic review on escape rooms in education. Educational Research Review, 31, 100364.|https://doi.org/10.1016/j.edurev.2020.100364';
$string['app_gd_codigo_stages'] = 'primary|Pistas de cálculo y de lectura; el candado de ejemplo para empezar.
secondary|Problemas de la materia en cadena, por grupos.
advanced|Casos prácticos y repaso antes de un examen.';
$string['app_gd_codigo_what'] = 'Un candado con un código que se abre resolviendo pistas, como en un escape room, con cuenta atrás si se quiere.';
$string['app_gd_codigo_why'] = 'Una revisión de 39 experiencias de escape room en educación encontró que a la gran mayoría de los estudiantes les gustaron, que los docentes los vieron muy implicados y que sirven para practicar el trabajo en equipo. En cambio, casi no hay pruebas de que con ellos se aprendan contenidos nuevos (Veldkamp y otros, 2020). Mejor usarlo para repasar y aplicar lo ya trabajado.';
$string['app_gd_codigo_works'] = 'Resolver problemas en cadena: cada pista da una cifra.
Trabajar en equipo y comunicarse.
Repasar cualquier materia en forma de reto.';
$string['app_gd_collapse'] = 'Volver al lateral';
$string['app_gd_cuerpos_how'] = 'Elige un cuerpo; arrastra para girarlo, y la rueda o dos dedos lo acercan.
«Desplegar» lo abre despacio en su desarrollo y lo enseña desde arriba; «Plegar» lo cierra. «Abrirlo poco a poco» lo para a medias, para preguntar qué cara irá dónde.
«Otro desarrollo»: en los cuerpos pequeños, todos sus desarrollos uno a uno (el cubo tiene 11); en los grandes, uno nuevo cada vez.
Toca una cara para pintarla: pinta dos caras opuestas del cubo y despliégalo para ver dónde quedan.
«Contar»: la pizarra numera las caras, las aristas o los vértices uno a uno; con otro toque, todos a la vez.
«Transparente» deja ver las aristas ocultas, en discontinua. «De frente», «Desde arriba» y «De lado» dan las vistas sin perspectiva.';
$string['app_gd_cuerpos_scene'] = 'En quinto, la maestra pinta de rojo la cara de arriba del cubo, le da la vuelta y pinta de amarillo la de abajo. Lo abre hasta la mitad y pregunta dónde quedará la amarilla en el desarrollo. Votan a mano alzada, y la clase se divide.
Lo despliega: la roja y la amarilla quedan a los dos lados del mismo cuadrado, una arriba y otra abajo de la cruz. Luego pasan por los once desarrollos y, antes de abrir cada uno, la clase señala dónde caerá la roja.';
$string['app_gd_cuerpos_sources'] = 'Euler, L. (1758). Elementa doctrinae solidorum. Novi Commentarii academiae scientiarum Petropolitanae, 4, 109–140 (E230).|https://scholarlycommons.pacific.edu/euler-works/230/
Uttal, D. H., Meadow, N. G., Tipton, E., Hand, L. L., Alden, A. R., Warren, C. y Newcombe, N. S. (2013). The malleability of spatial skills: A meta-analysis of training studies. Psychological Bulletin, 139(2), 352–402.|https://doi.org/10.1037/a0028446';
$string['app_gd_cuerpos_stages'] = 'early|El cubo, la esfera, el cilindro, el cono, la pirámide y el ortoedro: reconocerlos, girarlos y buscar en clase objetos con su forma.
primary|Prismas y pirámides con sus elementos; cuerpos redondos; desarrollos.
secondary|Poliedros regulares, la fórmula de Euler y las vistas de un cuerpo.
advanced|Las vistas (alzado, planta y perfil) en Dibujo Técnico, y los desarrollos de los poliedros.';
$string['app_gd_cuerpos_what'] = 'Cuerpos geométricos que se giran con el dedo y se despliegan en su desarrollo: prismas, pirámides, cuerpos redondos y los poliedros regulares. La pizarra cuenta sus caras, aristas y vértices.';
$string['app_gd_cuerpos_why'] = 'Las habilidades espaciales se pueden entrenar: en un metaanálisis de 217 estudios, Uttal y colaboradores (2013) encontraron una mejora media de casi media desviación típica frente a los grupos de control, que se mantenía con el tiempo y pasaba a tareas espaciales que no se habían entrenado. Sugieren que una enseñanza rica en lo espacial puede aumentar la participación en matemáticas, ciencias e ingeniería.
En un poliedro convexo, caras + vértices − aristas = 2. Euler lo enunció en un trabajo escrito en 1750 y publicado en 1758; contar los tres elementos en varios cuerpos es una forma de descubrirlo.';
$string['app_gd_cuerpos_works'] = 'Reconocer y nombrar cuerpos: prismas, pirámides, cilindro, cono y esfera.
Sus elementos: caras, aristas y vértices; bases y caras laterales.
Los desarrollos: qué figura plana se pliega en cada cuerpo.
Las vistas de frente, desde arriba y de lado.
En Secundaria, los poliedros regulares y la fórmula de Euler.';
$string['app_gd_eco_how'] = '«Escuchar»: la pizarra cuenta cuatro y da palmas al ritmo, y el tambor late con cada palmada.
La clase lo devuelve con palmas, todos a la vez o por turnos con «¿A quién le toca?».
Para comprobarlo, alguien toca el eco en el tambor (o con la barra espaciadora); o escuchas tú y pulsas «¡Bien!».
Después sale el ritmo escrito: que la clase lo lea en voz alta con sus sílabas (ta, ti-ti…) antes de pasar a otro.
«Otra vez» repite el mismo; «Otro ritmo», uno nuevo; dos compases y «Más difíciles», para quienes ya lo dominan.';
$string['app_gd_eco_scene'] = 'En segundo, antes de sacar las flautas, la maestra pone el eco en lento. La clase devuelve las palmas a la vez, y luego Lucía lo toca en el tambor: verde entero. «Leemos el ritmo»: ta, ti-ti, ta, ta. Con el tercero seguido, salen las flautas.';
$string['app_gd_eco_sources'] = 'TeacherVision. Teaching rhythms through echo (recurso para docentes).|https://teachervision.com/music/teaching-rhythms-through-echo';
$string['app_gd_eco_stages'] = 'early|Un compás de ta y ti-ti, lento, todos a la vez con palmas, y tú decides con «¡Bien!».
primary|Por turnos en el tambor; leer el ritmo escrito con sus sílabas.
secondary|Dos compases, más difíciles y a velocidad normal, como calentamiento antes de tocar.';
$string['app_gd_eco_what'] = 'La pizarra cuenta cuatro y da palmas a un ritmo de uno o dos compases, y la clase lo devuelve. El eco se puede tocar en un tambor de la pizarra, que lo compara con el ritmo, o lo juzgas tú escuchando; después sale el ritmo escrito con ta y ti-ti.';
$string['app_gd_eco_why'] = 'El eco es la forma más directa de aprender un ritmo: se escucha, se guarda y se devuelve, sin partitura. La cuenta de cuatro antes de cada ritmo da el pulso, y los dos niveles (ta y ti-ti, o también ta-a, silencio y ti-ri-ti-ri) y la velocidad permiten ajustar la dificultad.
El tambor de la pizarra mide el eco con margen para que la clase lo lleve un poco más rápido o más lento, porque lo que se busca es el ritmo, no la velocidad exacta; al final, el ritmo escrito marca en verde lo que coincidió y en rojo lo que se escapó.';
$string['app_gd_eco_works'] = 'Escuchar con atención y guardar un ritmo en la memoria.
Llevar el pulso y reproducir duraciones: negras, corcheas, blancas, semicorcheas y silencios.
Poner nombre a lo que se oye con las sílabas de ritmo.
Esperar el turno y escuchar a los demás.';
$string['app_gd_envivo_how'] = 'Abre la sesión: entran con el QR o el código, con su usuario del Aula virtual o sin él.
Votación: haz la pregunta, abre, espera, cierra y salen las barras; «Otra pregunta» para la segunda ronda.
Para la instrucción entre iguales: votan, lo discuten en parejas un par de minutos y vuelven a votar.
Lluvia de ideas: una o dos palabras cada uno; revísalas antes de mostrarlas si hace falta.
Sin tabletas: «A mano alzada», y cuentas tú con + y −.
Mando fijo, en tu móvil y sin entrar en el Aula virtual: el temporizador, elegir a alguien, ir a una herramienta, abrir o cerrar la votación o el billete, la cortina («Destapar un poco» va bajándola), los relevos, leer las tarjetas y «Cambiar de clase», que lleva la pizarra abierta a otro de tus cursos. Se apaga solo tras las horas sin usarlo que fije el centro.
Concurso de música: «Música» hace las preguntas solas (¿qué canción es?, dictado rítmico con ta y ti-ti, o dictado melódico desde do) y la pizarra toca cada una al abrirla; «Otra vez» la repite.';
$string['app_gd_envivo_scene'] = 'Antes del experimento, la clase de cuarto vota si el huevo flota en agua con sal: casi todos dicen que no. Hacen el experimento y repiten la pregunta con «Otra pregunta»; las barras cambian, y empieza la mejor parte: explicar por qué.';
$string['app_gd_envivo_sources'] = 'Crouch, C. H. y Mazur, E. (2001). Peer Instruction: Ten years of experience and results. American Journal of Physics, 69(9), 970–977.|https://doi.org/10.1119/1.1374249
White, R. T. y Gunstone, R. F. (1992). Probing Understanding. Falmer Press.';
$string['app_gd_envivo_stages'] = 'early|A mano alzada en la asamblea, para decidir juntos.
primary|Votaciones de A a D, sí o no, o el semáforo para ver quién lo ha entendido.
secondary|Instrucción entre iguales, lluvia de ideas y concurso por equipos.
advanced|Votaciones de concepto en clases grandes, y lluvia de ideas en seminarios.';
$string['app_gd_envivo_what'] = 'Sesiones con los móviles o tabletas de la clase: votación, lluvia de ideas, concurso, pulsadores, el móvil del docente como mando y, sin tabletas, a mano alzada.';
$string['app_gd_envivo_why'] = 'En la instrucción entre iguales (Peer Instruction), los estudiantes contestan una pregunta de concepto, la discuten con un compañero y vuelven a contestar; diez años de experiencia en cursos de Física de la Universidad de Harvard mostraron mejor dominio del razonamiento conceptual y de la resolución de problemas (Crouch y Mazur, 2001).
Votar antes y después de un experimento sigue la técnica predecir, observar, explicar, tal como la describen White y Gunstone (1992).';
$string['app_gd_envivo_works'] = 'Que contesten todos a la vez, no solo uno.
Ver de un vistazo qué ha entendido la clase.
Opinar sin dejarse llevar por los demás: la votación oculta las barras mientras está abierta.
Participar con su nombre o sin él.';
$string['app_gd_errores_how'] = 'Elige un ejemplo o escribe un texto en «Mis ejercicios» con cada error así: [lo que pone|lo correcto|porqué].
Que la clase diga cuántos errores cree que hay antes de empezar.
Un toque marca la palabra; el segundo, la corrección: así se puede discutir antes de verla.
También sirven frases de redacciones de la clase, sin nombres.';
$string['app_gd_errores_scene'] = 'En primero de Bachillerato, el texto dice que la derivada de sen x es −cos x. Un alumno la marca, pero duda de la corrección. Antes del segundo toque, la profesora pide que lo comprueben con la definición en la pizarra; cuando sale cos x, ya lo han deducido ellos.';
$string['app_gd_errores_sources'] = 'Metcalfe, J. (2017). Learning from errors. Annual Review of Psychology, 68, 465–489.|https://doi.org/10.1146/annurev-psych-010416-044022';
$string['app_gd_errores_stages'] = 'primary|Ortografía básica, datos de Ciencias y de Geografía.
secondary|Ortografía (haber y a ver, vaya y valla), fechas de Historia, Física y Matemáticas.
advanced|Conceptos de Biología, Química y Literatura, derivadas y fechas clave.';
$string['app_gd_errores_what'] = 'Un texto con errores escondidos: se toca la palabra que está mal, se marca, y otro toque enseña la corrección y su porqué.';
$string['app_gd_errores_why'] = 'Metcalfe (2017) revisa la investigación sobre aprender de los errores: equivocarse y recibir enseguida la corrección ayuda a aprender, en contra de la costumbre de evitar el error a toda costa. Aquí el error está en el texto, y la corrección llega con un toque, con su porqué.
Buscar errores pide leer despacio y comparar con lo que se sabe, y cada hallazgo se puede discutir en clase antes de descubrir la corrección.';
$string['app_gd_errores_works'] = 'Leer con atención y con espíritu crítico.
Ortografía y gramática en contexto.
Datos de cualquier materia: fechas, cifras, conceptos.
Corregir explicando el porqué.';
$string['app_gd_expand'] = 'Ampliar: leerla en grande';
$string['app_gd_fractions_how'] = 'Que coloreen piezas de una fila y busquen lo mismo en otra: el muro dice qué partes son iguales («1/2 = 2/4 = 3/6»).
La regla para comparar recorre el muro y alinea las filas.
En las piezas: fracciones, decimales, porcentajes o nada, para que razonen solo con el tamaño.
Pregunta primero y comprueba después: «¿Qué es más, dos tercios o tres cuartos?».
«Duelo»: el mismo material en dos mitades para dos alumnos con el mismo reto; a la vez en una pantalla multitáctil, por turnos con un reloj cada uno con proyector, o «Comparar» para poner dos modelos uno al lado del otro.';
$string['app_gd_fractions_scene'] = 'En sexto, la profesora pregunta qué es más, dos tercios o tres cuartos. La clase se divide. Una alumna colorea dos tercios, otra tres cuartos, y la regla para comparar zanja el debate: tres cuartos llega un poco más lejos.';
$string['app_gd_fractions_sources'] = 'Siegler, R. y otros (2010). Developing effective fractions instruction for kindergarten through 8th grade (NCEE 2010-4039). Institute of Education Sciences.|https://ies.ed.gov/ncee/wwc/PracticeGuide/15';
$string['app_gd_fractions_stages'] = 'early|Mitades y enteros con piezas de colores, sin números.
primary|Fracciones sencillas, equivalentes y su comparación.
secondary|Equivalentes, decimales y porcentajes; sumar fracciones viéndolas.
advanced|En Magisterio, para mostrar el modelo de medida de las fracciones.';
$string['app_gd_fractions_what'] = 'Una barra entera y, debajo, la misma barra en medios, tercios, cuartos…: las fracciones se comparan de un vistazo.';
$string['app_gd_fractions_why'] = 'La guía práctica del Institute of Education Sciences de Estados Unidos sobre las fracciones recomienda ayudar a ver que las fracciones son números, con actividades de medida y con la recta numérica (Siegler y otros, 2010). En el muro, cada pieza es una longitud: lo que mide se compara poniendo una fila junto a otra, como en la recta.';
$string['app_gd_fractions_works'] = 'Qué es una fracción: partes iguales de un mismo entero.
Comparar: un tercio es menos que un medio, aunque 3 sea más que 2.
Fracciones equivalentes: 1/2 = 2/4 = 3/6.
Fracción, decimal y porcentaje de una misma cantidad.';
$string['app_gd_geoboard_how'] = 'Toca clavos para estirar una goma; toca el primero para cerrar la figura.
Arrastra una esquina a otro clavo para cambiar la figura.
«Área y perímetro» da las medidas, y «Ver los cuadraditos» ayuda a contarlas.
Retos: «Haz un rectángulo de área 6», «¿Cuántos triángulos distintos de área 2 hay?».
Más clavos para figuras grandes; menos para los pequeños.
«Duelo»: el mismo material en dos mitades para dos alumnos con el mismo reto; a la vez en una pantalla multitáctil, por turnos con un reloj cada uno con proyector, o «Comparar» para poner dos modelos uno al lado del otro.';
$string['app_gd_geoboard_scene'] = 'En segundo de ESO, el profesor pide figuras de área 4. Salen cuadrados, rectángulos y un triángulo raro. En cada una cuentan los clavos de dentro y los del borde, y la clase descubre la regla antes de que nadie diga su nombre: Pick.';
$string['app_gd_geoboard_sources'] = 'Gattegno, C. (1954). The Gattegno geoboards. Bulletin of the Association for Teaching Aids in Mathematics, 3.|https://roslyn-young.fr/biblios/bibliography-of-gattegno-s-work
Pick, G. (1899). Geometrisches zur Zahlenlehre. Lotos, 47, 311–319.|https://mathshistory.st-andrews.ac.uk/Biographies/Pick/';
$string['app_gd_geoboard_stages'] = 'early|Estirar gomas, hacer figuras y nombrarlas.
primary|Polígonos, área contando cuadraditos y perímetro.
secondary|Áreas de triángulos y polígonos irregulares; el teorema de Pick.
advanced|En Magisterio, para enseñar geometría con material manipulativo.';
$string['app_gd_geoboard_what'] = 'Un tablero de clavos donde se estiran gomas: figuras, áreas y perímetros que se ven y se cuentan.';
$string['app_gd_geoboard_why'] = 'El geoplano lo dio a conocer el educador matemático Caleb Gattegno, que lo describió en 1954.
En un polígono con las esquinas en los clavos y sin agujeros, el área es el número de clavos de dentro más la mitad de los del borde, menos uno: es el teorema de Pick (Pick, 1899). En el geoplano se comprueba con el área que da el tablero.';
$string['app_gd_geoboard_works'] = 'Construir y reconocer polígonos.
El área contando cuadraditos, y el perímetro.
Simetrías y figuras iguales.
En Secundaria, el teorema de Pick.';
$string['app_gd_grupos_how'] = '«¿Quién falta hoy?» antes de hacer los grupos.
Número de grupos, o alumnos por grupo.
«Un rol para cada uno» y, en «Cambiar los roles», el juego de roles: tareas del grupo, Música, Ciencias, Lectura o los tuyos.
«Otros roles» los vuelve a repartir; el reparto tiene en cuenta los roles que ya tuvo cada uno.
«Guardar como grupos del curso» los deja en el Aula virtual para tareas y foros.';
$string['app_gd_grupos_scene'] = 'En el laboratorio de segundo de ESO faltan dos alumnos. El profesor marca quién falta, pide grupos de cuatro y el juego de roles de Ciencias: medir, anotar, montar, fotografiar. Nadie elige con quién va, y nadie se queda sin tarea.';
$string['app_gd_grupos_sources'] = 'Johnson, D. W. y Johnson, R. T. (2009). An educational psychology success story: Social interdependence theory and cooperative learning. Educational Researcher, 38(5), 365–379.|https://doi.org/10.3102/0013189X09339057
Palincsar, A. S. y Brown, A. L. (1984). Reciprocal teaching of comprehension-fostering and comprehension-monitoring activities. Cognition and Instruction, 1(2), 117–175.|https://doi.org/10.1207/s1532690xci0102_1';
$string['app_gd_grupos_stages'] = 'early|Parejas y grupos pequeños; roles sencillos como repartir el material.
primary|Equipos de trabajo con roles que cambian cada semana.
secondary|Grupos de proyecto con roles de la materia, guardados en el curso.
advanced|Seminarios y trabajos en grupo, guardados como grupos del curso.';
$string['app_gd_grupos_what'] = 'Grupos al azar con la lista de la clase, sin los que faltan, con un rol para cada uno si se quiere.';
$string['app_gd_grupos_why'] = 'Según la revisión de David y Roger Johnson sobre el aprendizaje cooperativo, la cooperación funciona cuando hay interdependencia positiva (el grupo necesita a todos) y responsabilidad individual (el trabajo de cada uno cuenta y se le devuelve), además de interacción, habilidades sociales y reflexión del grupo sobre cómo ha trabajado (Johnson y Johnson, 2009). Los roles ayudan a las dos cosas: cada uno tiene una tarea que el grupo necesita.
El juego de roles de Lectura usa los cuatro papeles de la enseñanza recíproca: predecir, preguntar, aclarar y resumir. Palincsar y Brown (1984) la estudiaron con alumnos de 12 y 13 años con dificultades de comprensión lectora, con buenos resultados en muestras pequeñas.';
$string['app_gd_grupos_works'] = 'Trabajar con compañeros distintos, no siempre los mismos.
Repartir responsabilidades con roles.
Grupos justos y rápidos, sin discutir quién va con quién.';
$string['app_gd_how'] = 'Cómo llevarlo a clase';
$string['app_gd_index_games'] = 'Juegos';
$string['app_gd_index_lead'] = 'Cada guía cuenta para qué sirve la herramienta, cómo llevarla a clase y qué da en cada etapa, con sus fuentes.';
$string['app_gd_index_materials'] = 'Material';
$string['app_gd_index_tools'] = 'Herramientas';
$string['app_gd_line_how'] = 'Elige el tramo: «Del 0 al 10», «Del −10 al 10», cuartos, tercios, décimas… o «A mi manera».
Un toque en la recta empieza en un punto; cada toque después es un salto, dibujado con su arco y su cuenta.
Esconde los números y pregunta dónde cae uno antes de descubrirlo.
Para restar, saltos hacia atrás; para los negativos, cruzar el cero.
En Infantil, salta una rana: el mismo salto, con algo que mirar.
«Intervalos»: escribe [−2, 3), x ≥ 1 o |x − 1| < 2 y sale dibujado y escrito de las otras maneras; un toque en un extremo lo abre o lo cierra. «Uno al azar» con la notación escondida, para que la escriban ellos.
«Duelo»: el mismo material en dos mitades para dos alumnos con el mismo reto; a la vez en una pantalla multitáctil, por turnos con un reloj cada uno con proyector, o «Comparar» para poner dos modelos uno al lado del otro.';
$string['app_gd_line_scene'] = 'En quinto, el maestro elige «Cuartos, del 0 al 2», esconde los números y pregunta dónde va tres cuartos. Algunos lo ponen después del 1, porque tres y cuatro les parecen números grandes. Al descubrirlo, la recta les enseña que tres cuartos ni siquiera llega a 1.';
$string['app_gd_line_sources'] = 'Siegler, R. S. y Ramani, G. B. (2008). Playing linear numerical board games promotes low-income children\'s numerical development. Developmental Science, 11(5), 655–661.|https://doi.org/10.1111/j.1467-7687.2008.00714.x
Siegler, R. y otros (2010). Developing effective fractions instruction for kindergarten through 8th grade (NCEE 2010-4039). Institute of Education Sciences.|https://ies.ed.gov/ncee/wwc/PracticeGuide/15';
$string['app_gd_line_stages'] = 'early|Del 0 al 10: contar saltos de uno en uno y ver qué número está más lejos.
primary|Sumas y restas como saltos, decimales y fracciones sencillas.
secondary|Negativos, fracciones equivalentes y operaciones con fracciones; intervalos y desigualdades.
advanced|Intervalos, inecuaciones y valor absoluto; en Magisterio, para enseñar el uso de la recta en Primaria.';
$string['app_gd_line_what'] = 'Una recta con los números en orden, donde se marcan saltos: enteros, negativos, decimales o fracciones; y, desde Secundaria, intervalos.';
$string['app_gd_line_why'] = 'En un estudio con niños de preescolar de familias con pocos recursos, cuatro sesiones de quince minutos con un juego de tablero de números del 1 al 10 en línea igualaron su forma de situar números en una recta con la de sus compañeros; el mismo juego con colores en lugar de números no tuvo efecto (Siegler y Ramani, 2008).
Para las fracciones, la guía práctica del Institute of Education Sciences de Estados Unidos recomienda la recta numérica como herramienta central desde los primeros cursos, para que se vea que las fracciones son números (Siegler y otros, 2010).';
$string['app_gd_line_works'] = 'El orden de los números y la distancia entre ellos: cuál es mayor y por cuánto.
Sumar y restar como saltos («2 + 3 + 4 = 9»).
Los negativos, a la izquierda del cero.
Fracciones y decimales como números con su sitio en la recta.
Estimar dónde cae un número antes de comprobarlo.
Intervalos, desigualdades y valor absoluto: la misma parte de la recta escrita de tres maneras.';
$string['app_gd_marcador_how'] = 'Por equipos: un toque suma, el otro resta; la corona señala al que va primero.
La meta de la clase: elige su aspecto (cada etapa empieza con uno), la meta y el premio; cada punto la acerca. En Primaria la cuenta dice cuánto falta; en Secundaria, la fracción y el porcentaje.
El cohete da un dato de cada planeta al pasarlo; la canción suena entera al llegar; el mosaico puede destapar una imagen tuya (se queda en ese navegador).
Se guarda en el curso: sigue al día siguiente desde cualquier ordenador.
Con el concurso en vivo o con los juegos, para llevar los puntos de varias rondas.';
$string['app_gd_marcador_scene'] = 'En tercero de Primaria, el bote de la clase tiene una meta: una sesión de juegos el viernes. Cada vez que la clase se queda en silencio en menos de diez segundos, cae una canica. El jueves faltan tres, y son los propios alumnos los que se piden silencio.';
$string['app_gd_marcador_sources'] = 'Barrish, H. H., Saunders, M. y Wolf, M. M. (1969). Good behavior game: effects of individual contingencies for group consequences on disruptive behavior in a classroom. Journal of Applied Behavior Analysis, 2(2), 119–124.|https://doi.org/10.1901/jaba.1969.2-119
Little, S. G., Akin-Little, A. y O\'Neill, K. (2015). Group contingency interventions with children—1980-2010: A meta-analysis. Behavior Modification, 39(2), 322–341.|https://doi.org/10.1177/0145445514554393';
$string['app_gd_marcador_stages'] = 'early|El camino del bichito: contar casillas hasta la meta; o el bote de canicas.
primary|El cohete o la planta, con lo que falta; equipos en los juegos y una meta semanal.
secondary|El mosaico, con la fracción y el porcentaje; concursos por equipos y retos largos.
advanced|Debates y competiciones por equipos; el mosaico con el porcentaje.';
$string['app_gd_marcador_what'] = 'Un marcador de 2 a 8 equipos con botones grandes, o una meta de toda la clase: un bote de canicas, o un aspecto que enseña algo mientras se llena (el camino del bichito, una planta que crece, un cohete por el sistema solar, una canción nota a nota o un mosaico que destapa una imagen).';
$string['app_gd_marcador_why'] = 'Dividir la clase en equipos con un marcador a la vista se ha usado también para el comportamiento: en el Good Behavior Game (Barrish, Saunders y Wolf, 1969), una clase de cuarto se dividió en dos equipos y cada interrupción sumaba una marca a su equipo; las conductas disruptivas bajaron mucho mientras duró el juego.
La meta de la clase es una contingencia de grupo interdependiente: el premio es para todos cuando la clase entera llega a la meta, y nadie queda señalado. En un metaanálisis de 50 estudios con escolares, Little, Akin-Little y O\'Neill (2015) encontraron que las contingencias de grupo, también de este tipo (35 de los estudios), funcionan con conductas muy distintas.';
$string['app_gd_marcador_works'] = 'Jugar en equipo y llevar la cuenta a la vista.
Sumar puntos y comparar: cuánto le falta a cada equipo.
Una meta común: toda la clase empuja hacia lo mismo.
Normas de clase con una consecuencia de grupo.
Contar, la serie numérica y contar de 2 en 2 o de 5 en 5 (el camino); el ciclo de vida de una planta, el orden de los planetas y leer música.
Fracciones y porcentajes (el mosaico, y la cuenta en Secundaria).';
$string['app_gd_none'] = 'Esta herramienta no tiene guía propia. Estas son las guías que hay:';
$string['app_gd_ordenar_how'] = 'Elige un ejemplo de la etapa o escribe los tuyos en «Mis ejercicios»: un elemento por línea, en su orden.
Una línea «? elemento: porqué» explica por qué va ahí; sale cuando alguien lo pone mal.
Que un alumno toque las tarjetas mientras la clase dice en voz alta qué viene después.
«Prompt para tu IA» prepara ejercicios de cualquier tema; revísalos antes de guardarlos.';
$string['app_gd_ordenar_scene'] = 'En cuarto de Primaria, el ejercicio es el ciclo del agua. Un alumno pone la condensación antes que la evaporación. Al comprobar, la tarjeta vuelve y sale su porqué: el vapor se enfría y forma gotas. La clase discute qué tiene que pasar antes de que haya vapor, y él la coloca bien en el segundo intento.';
$string['app_gd_ordenar_sources'] = 'Inhelder, B. y Piaget, J. (1964). The Early Growth of Logic in the Child: Classification and Seriation. London: Routledge & Kegan Paul.
Metcalfe, J. (2017). Learning from errors. Annual Review of Psychology, 68, 465–489.|https://doi.org/10.1146/annurev-psych-010416-044022';
$string['app_gd_ordenar_stages'] = 'primary|Ciclos de la naturaleza, los pasos para resolver un problema, las edades de la Historia.
secondary|Procesos de Ciencias (la mitosis, las capas de la Tierra), cronologías y la prioridad de las operaciones.
advanced|Procesos largos: la síntesis de proteínas, la respiración celular, los movimientos artísticos.';
$string['app_gd_ordenar_what'] = 'Tarjetas que se ponen en su orden con toques: los pasos de un proceso, las fases de un ciclo, épocas, tamaños…';
$string['app_gd_ordenar_why'] = 'Ordenar es seriar: colocar elementos según una relación, como antes y después o más y menos. Inhelder y Piaget estudiaron con más de dos mil niños cómo se construyen la seriación y la clasificación, dos bases del razonamiento lógico (Inhelder y Piaget, 1964).
Al comprobar, las tarjetas bien puestas se quedan y las demás vuelven, con su porqué si el ejercicio lo tiene: equivocarse y recibir enseguida la corrección ayuda a aprender (Metcalfe, 2017).';
$string['app_gd_ordenar_works'] = 'Secuenciar: qué va antes y qué después, y por qué.
Los procesos de cualquier materia: el ciclo del agua, la mitosis, la síntesis de proteínas.
La cronología: épocas y acontecimientos en su orden.
Explicar un orden en voz alta, no solo acertarlo.';
$string['app_gd_palabra_how'] = 'La clase propone y el docente escribe: un intento, un debate.
Antes de cada intento, que digan qué letras ya saben y cuáles han descartado.
Elige el número de intentos (de 5 a 8) según la edad.
No hay diccionario: vale cualquier palabra con el número justo de letras.';
$string['app_gd_palabra_scene'] = 'En una clase de Inglés de tercero de ESO, la palabra está en inglés y la pista es «a planet». Al tercer intento tienen _A_S; alguien propone MARS y la fila se pone verde.';
$string['app_gd_palabra_sources'] = 'Wordle (Wikipedia, en inglés).|https://en.wikipedia.org/wiki/Wordle';
$string['app_gd_palabra_stages'] = 'primary|Palabras de cinco letras, con pista.
secondary|Seis letras, vocabulario de la materia.
advanced|Siete letras, o en otro idioma con su teclado.';
$string['app_gd_palabra_what'] = 'Adivinar una palabra en seis intentos: verde si la letra está en su sitio, amarillo si está en otro, gris si no está.';
$string['app_gd_palabra_why'] = 'El juego lo creó Josh Wardle y se hizo muy popular desde su publicación en octubre de 2021. Cada intento da información que hay que combinar con la de los anteriores: un ejercicio de deducción con palabras.';
$string['app_gd_palabra_works'] = 'Ortografía: qué palabras existen con esas letras.
Razonar con pistas: descartar letras y posiciones.
Vocabulario de la materia, de un glosario del curso o en otro idioma.
Debatir en grupo antes de cada intento.';
$string['app_gd_parejas_how'] = 'Elige un juego por nivel, o las caras y nombres de la clase, tus listas («dog = perro»), un glosario o las preguntas de emparejamiento del curso.
Toda la clase o dos equipos: encontrar una pareja da otro turno.
Antes de girar la segunda carta, que la clase diga qué espera encontrar.
Pocas parejas para empezar; más cuando dominen el contenido.';
$string['app_gd_parejas_scene'] = 'Primer día de curso en quinto: el maestro abre Parejas con las caras y los nombres de la clase. Cada acierto empareja una foto con su nombre, y al acabar la partida todos saben cómo se llaman los dos nuevos.';
$string['app_gd_parejas_sources'] = 'Roediger, H. L. y Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.|https://doi.org/10.1111/j.1467-9280.2006.01693.x';
$string['app_gd_parejas_stages'] = 'early|Formas, colores, sombras de animales y números, con pocas parejas.
primary|Palabra y dibujo, operaciones y resultados, caras y nombres de la clase.
secondary|Concepto y definición, fórmulas y nombres, idiomas.
advanced|Derivadas, elementos químicos, autores y obras: lo que se repasa del banco de preguntas.';
$string['app_gd_parejas_what'] = 'Cartas boca abajo que se levantan de dos en dos para encontrar las parejas: iguales o relacionadas.';
$string['app_gd_parejas_why'] = 'Cuando las parejas no son iguales sino relacionadas (concepto y definición, palabra y traducción), hay que recordar el contenido para reconocerlas: es una forma de práctica de recuperación, y recordar lo aprendido, en lugar de releerlo, ayuda a retenerlo (Roediger y Karpicke, 2006).';
$string['app_gd_parejas_works'] = 'Memoria visual y atención: dónde estaba cada carta.
Relacionar ideas: palabra y dibujo, concepto y definición, número y cantidad.
Vocabulario de la materia, del glosario o del banco de preguntas del curso.
Turnos y equipos.';
$string['app_gd_pizarra_how'] = 'Para una explicación, la pizarra sencilla y sus fondos (cuadrícula, pauta, pentagrama).
Que un alumno salga a dibujar lo que ha entendido: un esquema, un ciclo, un mapa.
Las fórmulas se escriben en una línea y se dibujan como en un libro.
Geometría: regla, escuadra, cartabón, transportador y compás.
El telón tapa la pizarra y la descubre poco a poco; el foco ilumina una parte.';
$string['app_gd_pizarra_scene'] = 'En quinto, la maestra explica el ciclo del agua y luego pide a un alumno que lo dibuje sin mirar el libro. Le salen el sol, el mar y la lluvia, pero no las nubes; la clase se da cuenta de que falta la condensación, y él la añade con flechas.';
$string['app_gd_pizarra_sources'] = 'Fiorella, L. y Mayer, R. E. (2015). Learning as a Generative Activity: Eight Learning Strategies that Promote Understanding. Cambridge University Press.';
$string['app_gd_pizarra_stages'] = 'early|Dibujar con el dedo y trazar letras en la pauta.
primary|Esquemas, problemas paso a paso y geometría con regla.
secondary|Fórmulas, geometría con instrumentos y páginas guardadas.
advanced|Fórmulas y diagramas, con las páginas guardadas en el curso.';
$string['app_gd_pizarra_what'] = 'Una pizarra sencilla para escribir y dibujar con el dedo, y una completa con páginas, fondos, fórmulas, regla, compás y transportador.';
$string['app_gd_pizarra_why'] = 'Dibujar lo que se aprende es una de las ocho estrategias de aprendizaje generativo que reúnen Fiorella y Mayer (2015): al convertir un texto o una explicación en un dibujo, el alumno tiene que seleccionar lo importante y organizarlo.
La pizarra completa guarda sus páginas en el curso, así que el dibujo de un alumno puede retomarse otro día.';
$string['app_gd_pizarra_works'] = 'Explicar dibujando: esquemas, diagramas, procesos.
Resolver a la vista, paso a paso.
Geometría con instrumentos: medir, trazar, construir.
Que los alumnos salgan a dibujar lo que entienden.';
$string['app_gd_plano_how'] = '«Puntos»: que dicten las coordenadas de un punto y se toque, o al revés: se pone un punto y dicen dónde está.
«Esconder las coordenadas»: los puntos solo con su letra, para preguntar dónde está cada uno.
«Formando una figura»: un polígono por sus vértices, y después moverlo sumando lo mismo a todas las x.
«Como vectores»: cada flecha con sus componentes, de A a B y de B a C.
«Hundir la flota»: de uno a cuatro equipos, cada uno dice un punto en su turno; quien toca vuelve a disparar. «Enseñar la flota» al final.';
$string['app_gd_plano_scene'] = 'En primero de ESO, dos equipos juegan a Hundir la flota en los cuatro cuadrantes. Uno grita «¡menos tres, dos!» y señala hacia arriba a la izquierda; el profesor lo toca: agua. El otro equipo, que ya tenía un tocado en (−3, 1), dispara a (−3, 0) y hunde el barco: en diez minutos han dicho cuarenta pares, en orden y con su signo.';
$string['app_gd_plano_sources'] = 'Descartes, R. (1637). La Géométrie. Apéndice del Discours de la méthode. Leiden: Ian Maire.';
$string['app_gd_plano_stages'] = 'primary|El primer cuadrante: situar puntos y jugar a Hundir la flota.
secondary|Los cuatro cuadrantes, figuras, simetrías y traslaciones, y vectores.
advanced|Vectores y sus componentes, como apoyo para la geometría analítica.';
$string['app_gd_plano_what'] = 'Una cuadrícula con los ejes x e y: el primer cuadrante (de 0 a 10) o los cuatro (de −6 a 6). Puntos con sus coordenadas, figuras y vectores, y Hundir la flota por equipos.';
$string['app_gd_plano_why'] = 'Con un par de números, cada punto del plano queda situado: es la idea de la geometría analítica, que nace con La Géométrie de Descartes (1637); por eso las coordenadas se llaman cartesianas.
El orden del par importa: (3, 2) y (2, 3) son puntos distintos, y en Hundir la flota un par al revés es un disparo perdido, así que se nota enseguida.
En los cuatro cuadrantes, el signo dice la dirección: a la izquierda del eje y, o por debajo del eje x.';
$string['app_gd_plano_works'] = 'Situar y leer puntos por sus coordenadas: primero la x y después la y.
Los números negativos, en los cuatro cuadrantes.
Figuras a partir de sus vértices: polígonos, simetrías y traslaciones.
Vectores y sus componentes: cuánto se avanza en x y cuánto en y.
Hundir la flota: decir el par en orden y razonar dónde disparar después de un tocado.';
$string['app_gd_quien_how'] = 'Haz la pregunta a toda la clase antes de elegir: así la piensan todos.
Cuenta hasta tres o cuatro en silencio y entonces pulsa.
Si quien sale no lo sabe, elige a un compañero que le ayude y luego lo dice con sus palabras.
Activa «Primero los que menos» para que en unas semanas hayan hablado todos.
Con «¿Quién falta hoy?», los ausentes no salen.';
$string['app_gd_quien_scene'] = 'Se corrigen los problemas de ayer. La maestra lee el enunciado, cuenta hasta cuatro en silencio y pulsa: sale Lucía, que llevaba dos semanas sin salir porque «Primero los que menos» está activado. Como cualquiera podía salir, todos tenían su respuesta preparada en el cuaderno.';
$string['app_gd_quien_sources'] = 'Dallimore, E. J., Hertenstein, J. H. y Platt, M. B. (2013). Impact of cold-calling on student voluntary participation. Journal of Management Education, 37(3), 305–341.|https://doi.org/10.1177/1052562912446067
Rowe, M. B. (1986). Wait time: Slowing down may be a way of speeding up! Journal of Teacher Education, 37(1), 43–50.
Lemov, D. (2021). Teach Like a Champion 3.0. Jossey-Bass.';
$string['app_gd_quien_stages'] = 'early|Para repartir encargos y turnos en la asamblea, con la foto en grande.
primary|Para corregir en voz alta o elegir quién sale a la pizarra.
secondary|Para preguntas de repaso, después de pensarlas un minuto en parejas.
advanced|Para elegir quién expone o defiende una respuesta en un seminario.';
$string['app_gd_quien_what'] = 'Elegir al azar a quién le toca contestar, con turnos justos, para que participe toda la clase y no siempre los mismos.';
$string['app_gd_quien_why'] = 'Preguntar a quien no ha levantado la mano es lo que Doug Lemov llama «llamada en frío» (cold call): como cualquiera puede salir, todos preparan la respuesta. En un estudio con estudiantes universitarios, en las clases donde se hacía a menudo más estudiantes contestaban por su cuenta y se sentían más a gusto participando (Dallimore, Hertenstein y Platt, 2013).
Unos segundos de silencio después de la pregunta dan respuestas más largas y mejor razonadas: Mary Budd Rowe vio que los docentes esperan, de media, menos de un segundo (Rowe, 1986).';
$string['app_gd_quien_works'] = 'Que piense toda la clase: cualquiera puede salir.
Turnos repartidos: «Primero los que menos» saca antes a quien menos ha salido en el curso.
Ver qué ha entendido cada uno, no solo quien levanta la mano.
Hablar delante de los demás poco a poco, con preguntas a su alcance.';
$string['app_gd_quiensoy_how'] = 'Elige un ejemplo de la etapa o escribe los tuyos en «Mis ejercicios»: «= respuesta» en la primera línea y debajo las pistas.
Por equipos: quien acierta con menos pistas se lleva más puntos.
Que sean los alumnos quienes escriban las pistas de un personaje o un concepto del tema: elegir qué pista va primero también es repasar.
«Prompt para tu IA» prepara personajes y conceptos de cualquier tema.';
$string['app_gd_quiensoy_scene'] = 'En tercero de ESO, al acabar el tema de la célula, cada equipo escribe en «Mis ejercicios» las pistas de un orgánulo para el otro equipo. El de las mitocondrias empieza por «Tengo mi propio ADN»; nadie acierta hasta la tercera pista, y la discusión sobre por qué tienen ADN repasa medio tema.';
$string['app_gd_quiensoy_sources'] = 'Roediger, H. L. y Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.|https://www.jstor.org/stable/40064526';
$string['app_gd_quiensoy_stages'] = 'primary|Animales, lugares y personajes conocidos.
secondary|Personajes de Historia, Ciencia y Arte, elementos químicos, lugares.
advanced|Conceptos y autores: orgánulos, filósofos, economistas, escritores.';
$string['app_gd_quiensoy_what'] = 'Pistas de una en una, de la más difícil a la más fácil, hasta que alguien adivina quién o qué es; cuantas menos pistas, más vale la respuesta.';
$string['app_gd_quiensoy_why'] = 'Adivinar a partir de pistas obliga a recuperar de la memoria lo que se sabe. Roediger y Karpicke (2006) vieron que recordar lo estudiado lo fija más a largo plazo que volver a leerlo, aunque al principio volver a leer parezca dar mejor resultado.
Las pistas van de la más difícil a la más fácil para que todos tengan su momento: quien sabe más acierta antes, y los demás llegan con las últimas.';
$string['app_gd_quiensoy_works'] = 'Recordar lo aprendido a partir de pistas.
Relacionar datos con una persona, un lugar, un animal o un concepto.
Arriesgar una respuesta y razonarla.
Repasar cualquier materia al final de un tema.';
$string['app_gd_reloj_how'] = 'Elige el nivel: en punto, y media, y cuarto y menos cuarto, de 5 en 5 minutos o minuto a minuto.
«¿Qué hora es?»: aparece una hora en el reloj y la clase la lee.
«Pon la hora»: la clase mueve las agujas hasta la hora que se pide.
Esconde la hora en cifras o en palabras para que lean solo las agujas.
«Números romanos», para relojes como los de los edificios.';
$string['app_gd_reloj_scene'] = 'En segundo, el maestro activa los números romanos y pone las cuatro y cuarto. «Es como el reloj del ayuntamiento», dice alguien. La clase lee la hora sin cifras y, de paso, aprende que IV es cuatro.';
$string['app_gd_reloj_sources'] = 'Real Decreto 157/2022, de 1 de marzo, por el que se establecen la ordenación y las enseñanzas mínimas de la Educación Primaria. BOE-A-2022-3296.|https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296
Department for Education (2013). National curriculum in England: mathematics programmes of study.|https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study';
$string['app_gd_reloj_stages'] = 'early|En punto, con la aguja de las horas: cuándo comemos, cuándo salimos.
primary|De la media hora al minuto, y los números romanos.
secondary|El reloj de 24 horas y calcular cuánto dura algo.
advanced|Pocas veces; en Magisterio, para enseñar a leer la hora.';
$string['app_gd_reloj_what'] = 'Un reloj de agujas que se mueven con el dedo, con la hora en cifras y en palabras, para aprender a leer la hora.';
$string['app_gd_reloj_why'] = 'Leer la hora es un contenido de Primaria: el currículo español incluye la medida del tiempo con el reloj analógico y el digital (Real Decreto 157/2022, Matemáticas). En Inglaterra se lee la hora de cinco en cinco minutos en el segundo curso y, en el tercero, en un reloj de agujas con números romanos del I al XII (Department for Education, 2013).';
$string['app_gd_reloj_works'] = 'Leer la hora en un reloj de agujas: en punto, y media, y cuarto y menos cuarto, de cinco en cinco, minuto a minuto.
Relacionar el reloj de agujas con la hora digital y con la hora dicha en palabras.
Números romanos en la esfera.
12 y 24 horas.';
$string['app_gd_rods_how'] = 'Empieza con juego libre: escaleras, trenes y «alfombras» de regletas del mismo largo.
Pide todas las formas de hacer un número con dos regletas: la alfombra del diez reúne sus descomposiciones.
Tapa los números («Ver los números» apagado) para que razonen con las longitudes.
Con «Comparar: dos mesas», dos alumnos resuelven el mismo reto de dos formas distintas.
Mesa con pocas columnas para los pequeños; con muchas, para multiplicar y para las fracciones.
«Duelo»: el mismo material en dos mitades para dos alumnos con el mismo reto; a la vez en una pantalla multitáctil, por turnos con un reloj cada uno con proyector, o «Comparar» para poner dos modelos uno al lado del otro.';
$string['app_gd_rods_scene'] = 'En segundo de Primaria, la maestra apaga «Ver los números» y pide: «Hagan la naranja con dos regletas». Sale una pareja tras otra con una solución distinta, hasta que la alfombra del diez está completa. Entonces alguien se da cuenta de que las soluciones van de dos en dos: blanca y azul, azul y blanca.';
$string['app_gd_rods_sources'] = 'Cuisenaire, G. (1952). Les nombres en couleurs. Thuin.
Cuisenaire, G. y Gattegno, C. (1971). Initiation aux nombres en couleurs. Delachaux et Niestlé.';
$string['app_gd_rods_stages'] = 'early|Juego libre, ordenar de la más corta a la más larga y comparar.
primary|Descomponer, sumar y restar, dobles y mitades, tablas y fracciones.
secondary|Fracciones equivalentes, proporciones y letras en lugar de regletas como primer álgebra (si r es la roja, r + r es la de cuatro).
advanced|En Magisterio, para enseñar su uso a los futuros maestros.';
$string['app_gd_rods_what'] = 'Diez barras de colores de 1 a 10 unidades de largo: los números se ven y se tocan como longitudes.';
$string['app_gd_rods_why'] = 'Las regletas las ideó Georges Cuisenaire, maestro en Thuin (Bélgica), que publicó su método en 1952 con el título Les nombres en couleurs. Desde 1953, el educador matemático Caleb Gattegno las dio a conocer en todo el mundo.
Cada número es una longitud y cada longitud tiene su color: las relaciones entre números se ven antes de escribirlas, y se comprueban poniendo una regleta junto a otra.';
$string['app_gd_rods_works'] = 'Comparar y ordenar: más largo, más corto, igual.
Componer y descomponer un número («¿con qué dos regletas se hace la naranja?»).
Relaciones entre números: el doble, la mitad, uno más.
Sumar, restar, multiplicar y dividir con las manos.
Fracciones y proporciones: la de dos es la mitad de la de cuatro.';
$string['app_gd_rosco_how'] = 'Escribe tu rosco con las palabras del tema, o copia el de ejemplo y adáptalo.
Toda la clase contra el reloj, o dos equipos, cada uno con su rosco y su tiempo.
Tú marcas acierto, fallo o «Pasapalabra».
Úsalo para repasar al acabar un tema, no para presentarlo.';
$string['app_gd_rosco_scene'] = 'Viernes de repaso en primero de ESO: dos equipos, un rosco de Ciencias cada uno. La «F» de fotosíntesis cae al primer intento; la «X» de xilema se queda en pasapalabra hasta el final, y el lunes es la palabra que todos recuerdan.';
$string['app_gd_rosco_sources'] = 'Roediger, H. L. y Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.|https://doi.org/10.1111/j.1467-9280.2006.01693.x';
$string['app_gd_rosco_stages'] = 'primary|Vocabulario del tema y ortografía, con pistas sencillas.
secondary|Repaso de conceptos de cualquier materia antes del examen.
advanced|La terminología de la asignatura, también en otros idiomas.';
$string['app_gd_rosco_what'] = 'Una rueda de letras con una pista para cada una, como en el concurso de televisión: la clase adivina palabras.';
$string['app_gd_rosco_why'] = 'Intentar recordar algo ayuda a retenerlo mejor que volver a estudiarlo: en un experimento con estudiantes universitarios, quienes hicieron una prueba de recuerdo recordaban más una semana después que quienes releyeron el texto, aunque estos se sentían más seguros (Roediger y Karpicke, 2006). El rosco convierte esa práctica de recuperación en un juego.';
$string['app_gd_rosco_works'] = 'Vocabulario de cualquier materia, con su definición.
Recordar sin mirar: cada pista obliga a sacar la palabra de la memoria.
Ortografía: la palabra empieza por esa letra o la contiene.
Trabajo en equipo, con dos equipos y su reloj.';
$string['app_gd_salida_how'] = 'Prepara el billete: elige si pregunta «¿Cómo lo llevas?» y escribe hasta tres preguntas cortas, o elígelas de «Ideas». Mejor una o dos: tiene que caber en tres a cinco minutos.
Abre la sesión unos minutos antes de acabar; entran con el QR o el código. Con su usuario del Aula virtual sabrás quién necesita qué; sin nombre, suelen contestar con más franqueza.
Abre el billete. La pizarra solo muestra quién lo ha entregado; al salir, cada alumno enseña su pantalla verde.
Cierra el billete y salen las caras de la clase. Las respuestas no se ven hasta que pulses «Ver las respuestas»: revísalas antes de proyectarlas, y quita de la pantalla lo que no deba verse.
Los montones (Todavía no, A medias, Lo entiendo, Lo explicaría) dicen por dónde empezar: repasar con todos, grupos pequeños con un experto en cada uno, o seguir adelante.
«Una al azar» muestra una respuesta sin nombre, grande, para comentarla con la clase.
«Descargar» guarda los billetes en una hoja de cálculo: la sesión se borra al día siguiente.
Sin dispositivos: el mismo billete en una ficha o un pósit, o las cuatro caras en la puerta para que cada uno pegue un gomet o ponga su pinza en la suya al salir; cuéntalas con «A mano alzada o con tarjetas».';
$string['app_gd_salida_scene'] = 'Viernes, cinco minutos antes del recreo: la clase de quinto hace el billete sobre fracciones equivalentes. Al cerrarlo hay nueve caras en «A medias», y casi todas las dudas dicen lo mismo: no ven por qué 2/4 es igual que 1/2.
El lunes la clase empieza con el muro de fracciones, y los cuatro que lo explicarían hacen de expertos, uno en cada mesa.';
$string['app_gd_salida_sources'] = 'Black, P. y Wiliam, D. (1998). Assessment and classroom learning. Assessment in Education: Principles, Policy & Practice, 5(1), 7–74.|https://doi.org/10.1080/0969595980050102
Marzano, R. J. (2012). The many uses of exit slips. Educational Leadership, 70(2).|https://ascd.org/el/articles/the-many-uses-of-exit-slips
Wiliam, D. (2011). Embedded Formative Assessment. Solution Tree Press.
Northwest Educational Service District 189 (s. f.). Exit Pass. Formative Assessment Techniques (ficha adaptada de Wiliam, 2011).|https://www.nwesd.org/wp-content/uploads/2013/08/EL_Exit_Pass_kdj.pdf';
$string['app_gd_salida_stages'] = 'early|Solo las caras, y a mano: al salir, cada uno pone su pinza o un gomet en la cara que toca, y lo comentas con ellos en la asamblea del día siguiente.
primary|Las caras y una pregunta: «Lo más importante que he aprendido hoy» o «Una duda que me queda». Con su usuario, para hacer los grupos del día siguiente.
secondary|Una pregunta de comprensión («Explícalo con tus palabras», «Pon un ejemplo») y otra sobre cómo han trabajado; la descarga, para planificar.
advanced|La duda que más les ha costado y qué cambiarían de la sesión; sin nombre, para que sean francos.';
$string['app_gd_salida_what'] = 'Al acabar la clase, cada alumno dice desde su móvil o tableta cómo lo lleva (cuatro caras) y contesta de una a tres preguntas cortas. Mientras el billete está abierto, ves quién lo ha entregado; al cerrarlo, cómo va la clase y los billetes en montones, para preparar la clase siguiente.';
$string['app_gd_salida_why'] = 'El billete de salida es una técnica de evaluación formativa: recoger, mientras se enseña, pruebas de lo que han aprendido para ajustar la enseñanza. En su revisión de la investigación, Black y Wiliam (1998) concluyen que varios estudios muestran pruebas firmes de que reforzar la información frecuente que reciben los alumnos sobre su aprendizaje produce mejoras sustanciales.
Marzano (2012) distingue cuatro tipos de preguntas para el billete: las que dan datos de lo que han entendido (puntuarse de 0 a 3, o «¿qué es lo que más te ha confundido de hoy?»), las que les hacen analizar su propio esfuerzo, las que valoran una forma de trabajar de la clase y las que abren una comunicación con el profesor. Las caras de Classtools adaptan su escala de 0 a 3, y las ideas de preguntas siguen esos cuatro tipos.
Lo que importa es qué se hace después. Si casi toda la clase tiene la misma duda, Marzano propone volver a explicarlo al día siguiente; si las dudas son distintas, grupos pequeños, con los alumnos que lo han entendido como expertos en cada uno.
Wiliam (2011) lo recoge como «pase de salida»: de tres a cinco minutos antes de un descanso, en los que el docente lee los pases y decide qué cambiar. Una ficha basada en su libro recoge estas variantes: agrupar a los alumnos según lo que muestran sus respuestas, devolverles un comentario escrito, o leer en voz alta respuestas sin nombre para empezar un debate.';
$string['app_gd_salida_works'] = 'Saber, antes de la clase siguiente, qué ha entendido cada uno y qué no.
Que contesten todos, también los que nunca levantan la mano.
Pensar en lo que han aprendido y en cómo han trabajado.
Una vía para decirte lo que no dirían en voz alta.';
$string['app_gd_scene'] = 'En clase';
$string['app_gd_score_how'] = 'Elige una canción o escribe una con toques en el pentagrama.
«Toca conmigo»: sale un alumno al carillón y la pantalla enciende la nota que toca.
«¿Qué nota es?»: suena una nota y la clase la busca; se cuenta la racha.
Con «¿A quién le toca?», cada alumno toca una nota de la canción, a relevos.';
$string['app_gd_score_scene'] = 'En segundo, la canción a relevos: cada alumno sale al carillón y toca una nota de «Martinillo» con «Toca conmigo». Cuando la canción suena entera, tocada entre todos, piden repetirla.';
$string['app_gd_score_sources'] = 'Orff Schulwerk (Wikipedia, en inglés).|https://en.wikipedia.org/wiki/Orff_Schulwerk';
$string['app_gd_score_stages'] = 'early|Escuchar, tocar el carillón libremente, agudo y grave.
primary|Leer notas y figuras, y tocar canciones sencillas.
secondary|Compases, alteraciones y dictados de notas.
advanced|En Magisterio musical, para preparar canciones para el aula.';
$string['app_gd_score_what'] = 'Un pentagrama donde se escriben notas con un toque y suenan, con un carillón debajo para tocar.';
$string['app_gd_score_why'] = 'El carillón es uno de los instrumentos de láminas que el Orff-Schulwerk, de Carl Orff y Gunild Keetman, adaptó para la música escolar, junto a xilófonos y metalófonos. En la pantalla, la nota escrita, su sonido y su lámina se ven a la vez.';
$string['app_gd_score_works'] = 'Leer notas en el pentagrama y su duración.
Escuchar y reconocer notas («¿Qué nota es?»).
Tocar una melodía con «Toca conmigo», que enciende la nota siguiente.
Ritmo y compás: 2/4, 3/4, 4/4, 6/8.';
$string['app_gd_semaforo_how'] = '«Ajustar a esta clase» con la clase trabajando a un volumen que te parezca bien: ese será el verde.
Explica antes qué significa cada color y qué se hace en rojo.
«Una cara en la luz» para los pequeños.
Úsalo en el trabajo en grupo, no cuando lo que toca es hablar en voz alta.';
$string['app_gd_semaforo_scene'] = 'En el rato de rincones de Infantil, la luz se pone amarilla y la cara deja de sonreír. Nadie dice nada: una niña se lleva el dedo a los labios, la luz vuelve al verde y la clase lo celebra en voz baja.';
$string['app_gd_semaforo_sources'] = 'Berglund, B., Lindvall, T. y Schwela, D. H. (Eds.) (1999). Guidelines for Community Noise. Organización Mundial de la Salud.|https://www.who.int/publications/i/item/a68672
Shield, B. M. y Dockrell, J. E. (2008). The effects of environmental and classroom noise on the academic attainments of primary school children. Journal of the Acoustical Society of America, 123(1), 133–144.|https://doi.org/10.1121/1.2812596';
$string['app_gd_semaforo_stages'] = 'early|Con la cara en la luz, en el rato de rincones.
primary|Trabajo en parejas y en grupo.
secondary|Trabajo en grupo y en el laboratorio.
advanced|Pocas veces; en aulas abiertas o espacios de estudio.';
$string['app_gd_semaforo_what'] = 'Un semáforo que escucha el ruido de la clase y se pone verde, amarillo o rojo: el volumen se ve sin tener que levantar la voz.';
$string['app_gd_semaforo_why'] = 'La Organización Mundial de la Salud recomienda que el ruido de fondo de un aula no supere los 35 dB durante las clases, para que se entienda bien lo que se dice (Berglund, Lindvall y Schwela, 1999). En escuelas de Primaria de Londres, el ruido del aula se relacionó con peores resultados en las pruebas nacionales, también descontando factores sociales (Shield y Dockrell, 2008).
El semáforo no mide decibelios exactos: compara con el ruido normal de tu clase, que se ajusta con «Ajustar a esta clase». No graba ni envía nada; solo mide el volumen.';
$string['app_gd_semaforo_works'] = 'Ser conscientes del volumen al trabajar en grupo.
Que la clase se regule sola, sin que el docente tenga que pedir silencio.
Comparar el ruido de distintas actividades.';
$string['app_gd_simon_how'] = 'Con la lista de la clase sale un alumno distinto en cada ronda; los demás pueden decir los colores en voz baja mientras suenan.
Al fallar, la misma secuencia suena para el siguiente: nadie vuelve a empezar de cero. «Desde el principio» deja el juego clásico.
Seis colores y la velocidad rápida son más reto para los mayores.
Dos o tres rondas bastan como pausa activa entre dos tareas.
«Al revés»: la secuencia se repite del final al principio, así que hay que darle la vuelta antes de pulsar.
«Los pulsadores llevan»: flechas (las cuatro iguales, para leer la dirección y no el color), números con una regla (sale un 3 y, con «Lo que falta para 10», se pulsa el 7) o notas sin colores (solo suenan; los pulsadores dicen Do, Re, Mi…).
Nueve pulsadores, para los que ya dominan seis.
«Sílabas de una palabra»: los pulsadores llevan las sílabas de la palabra y otras; con «Se encienden sus sílabas» la palabra se va formando arriba mientras se encienden, y con «Se escribe y la separan» aparece entera y la clase pulsa sus sílabas en orden. Al acertar, sale la palabra grande. Empiezan con dos sílabas y crecen hasta cinco. Al revés, la palabra se dice del final al principio («pato», «topa»). En Infantil, las sílabas salen en mayúsculas.';
$string['app_gd_simon_scene'] = 'La clase de tercero vuelve del recreo con muchas ganas de hablar. El maestro abre Simón con la lista: en cada ronda sale uno y los demás dicen los colores en voz baja. Hugo falla en la séptima; la secuencia vuelve a sonar para Martina, que la completa entre aplausos. Tres rondas después, empiezan la lectura.';
$string['app_gd_simon_sources'] = 'Melby-Lervåg, M. y Hulme, C. (2013). Is working memory training effective? A meta-analytic review. Developmental Psychology, 49(2), 270–291.|https://doi.org/10.1037/a0028228
Martínez, N. y Goikoetxea, E. (2020). Los predictores de la lectura y escritura de palabras varían en función de la estructura silábica en español. Psicología Educativa, 26(1), 37–48.|https://doi.org/10.5093/psed2019a20';
$string['app_gd_simon_stages'] = 'early|Cuatro colores y velocidad normal, nombrando los colores en voz alta; las sílabas de palabras de dos y tres sílabas, dando una palmada por sílaba.
primary|Seis colores, por turnos con la lista de la clase; números con una regla para el cálculo mental; en 1.º y 2.º, sílabas: «Se escribe y la separan».
secondary|Velocidad rápida, al revés o con flechas, como reto de la clase para batir su récord; notas sin colores en Música.
advanced|Para dinámicas de grupo o para mostrar en Psicología qué es la memoria de trabajo.';
$string['app_gd_simon_what'] = 'Repetir una secuencia que crece en cada ronda (colores y sonidos, flechas, números con una regla, notas o las sílabas de una palabra): un juego de atención y memoria para toda la clase.';
$string['app_gd_simon_why'] = 'Simón pide retener una secuencia y repetirla en orden, como las tareas con las que se mide la memoria de trabajo. Conviene saber que entrenar esa memoria mejora las tareas parecidas, pero no se ha visto que mejore otras capacidades como la lectura o el cálculo (Melby-Lervåg y Hulme, 2013).
Por eso se juega por lo que es: un rato corto de atención compartida, turnos y escucha.
Con sílabas, el juego trabaja la conciencia silábica. Martínez y Goikoetxea (2020) siguieron a 47 niños de habla española desde Infantil hasta 2.º de Primaria: recogen que en español los niños identifican las sílabas con más facilidad que los fonemas, y encontraron que el conocimiento de las letras predecía la lectura y la escritura de palabras de sílabas simples, mientras que en las de sílabas complejas (como «bla» o «tren») pesaba la conciencia fonológica.';
$string['app_gd_simon_works'] = 'Atención mantenida: mirar y escuchar hasta el final.
Recordar una secuencia en orden, con lo que se ve y lo que se oye.
Esperar el turno y escuchar a los demás.
Jugar en equipo: la clase ayuda a quien sale.
Con sílabas: separar una palabra en sus sílabas y juntarlas para leerla.';
$string['app_gd_sources'] = 'Fuentes';
$string['app_gd_stages'] = 'Por etapas';
$string['app_gd_tangram_how'] = 'Empieza con las siluetas sencillas (Casa, Barco) y deja los polígonos para después.
Una pieza se gira con dos toques; antes de moverla, que digan qué pieza buscan y por qué.
Si se atascan, la pista enseña dónde va una pieza.
Para fracciones: «¿Qué parte del cuadrado es este triángulo?», y que lo comprueben poniendo piezas encima.
Con «¿A quién le toca?», sale un alumno distinto para cada pieza.';
$string['app_gd_tangram_scene'] = 'En cuarto, la maestra pone la silueta del gato y pregunta qué ocupa más sitio, el gato o el barco. La mitad de la clase dice que el gato. Lo construyen con las siete piezas, luego el barco con las mismas siete, y se hace el silencio: miden lo mismo.';
$string['app_gd_tangram_sources'] = 'Slocum, J. y otros (2003). The Tangram Book: The Story of the Chinese Puzzle with over 2000 Puzzles to Solve. Sterling.';
$string['app_gd_tangram_stages'] = 'early|Siluetas sencillas, nombrando el triángulo y el cuadrado.
primary|Figuras más difíciles, polígonos, simetrías y la fracción de cada pieza.
secondary|Áreas y fracciones del cuadrado; demostrar que todas las figuras miden lo mismo.
advanced|En Magisterio, para diseñar actividades de geometría con material manipulativo.';
$string['app_gd_tangram_what'] = 'Siete piezas que, juntas, forman un cuadrado: con ellas se construyen figuras y siluetas.';
$string['app_gd_tangram_why'] = 'El tangram es un rompecabezas chino conocido desde hacia 1800; los libros más antiguos que se conservan son de 1813 (Slocum, 2003).
Todas sus figuras se hacen con las mismas siete piezas, así que todas tienen la misma área: una forma de ver que el área se conserva aunque cambie la figura.';
$string['app_gd_tangram_works'] = 'Ver y girar formas en la cabeza: la orientación espacial.
Nombrar figuras: triángulos, cuadrado, romboide.
Áreas sin fórmulas: con las mismas siete piezas, todas las figuras miden lo mismo.
Fracciones del cuadrado: cada triángulo pequeño es su dieciseisava parte.
Perseverar: probar, girar y volver a probar.';
$string['app_gd_tarjetas_how'] = 'Imprímelas con «Imprimir tarjetas»: con los nombres de una lista o numeradas. La que se gira sale dos por hoja; las demás, una hoja por alumno. Plastificadas, duran el curso.
Pregunta, deja tiempo para pensar en silencio y, a la señal («tres, dos, uno, ¡arriba!»), todos a la vez: así nadie mira lo que levanta el de al lado.
Sin móvil: lees los colores de un vistazo; si quieres los números en la pizarra, cuéntalos con + y −.
Conversa antes de dar la respuesta: «Los del azul, ¿por qué?». Que alguien de cada color explique la suya.
«Por grupos»: cada uno al sitio de su color (el rincón, el aro o la mesa de ese color); dentro, que lo hablen; luego «Dos minutos para convencer» a alguien de otro color, y se vota otra vez.
Instrucción entre iguales: votan, lo discuten en parejas con alguien que eligió otra cosa y vuelven a votar (Crouch y Mazur, 2001).
Por mesas: cada mesa cuenta sus colores y te lo dice; así cuentan ellos.
Uno a uno: pasa por las mesas y pregunta o anota; con 12 a 30 alumnos no lleva mucho rato.
Con la cámara: «Leer las tarjetas», con la del ordenador de la pizarra o con el móvil («Leer las tarjetas» en el mando fijo), apuntando a las tarjetas levantadas o pasando por las mesas. Cada una se recuadra en su color y la pizarra cuenta, dice quién falta por leer y, solo si lo pides, quién ha contestado qué. Las imágenes no salen del dispositivo: a la pizarra solo llegan números de tarjeta y letras. Se leen con la lista para la que se imprimieron: si la lista cambia, vuelve a imprimirlas.
Con un móvil viejo o sin cámara, todo lo demás funciona igual: la tarjeta no necesita el móvil. Una foto de la clase con las tarjetas levantadas sirve de registro para mirarlo después.
El semáforo mientras trabajan: la tarjeta encima de la mesa, en rojo si necesitan ayuda; vas primero a las rojas.
Sí y no, para verdadero o falso rápido; las cuatro tarjetas sueltas, para quien todavía se confunde al girarla.';
$string['app_gd_tarjetas_scene'] = 'En segundo, la maestra pregunta qué pesa más: A, un kilo de paja; B, un kilo de hierro; C, pesan lo mismo. Las tarjetas suben a la vez y hay mucho azul. «Por grupos»: los del azul al aro azul, los del rojo al rojo, los del amarillo al amarillo. En cada aro hablan un minuto, y luego cada uno busca a alguien de otro color para convencerlo.
Al volver a votar hay mucho más amarillo. Los que siguen en azul explican por qué, y la balanza de la clase resuelve la discusión.';
$string['app_gd_tarjetas_sources'] = 'Narayan, J. S., Heward, W. L., Gardner, R., Courson, F. H. y Omness, C. K. (1990). Using response cards to increase student participation in an elementary classroom. Journal of Applied Behavior Analysis, 23(4), 483–490.|https://doi.org/10.1901/jaba.1990.23-483
Gardner, R., Heward, W. L. y Grossi, T. A. (1994). Effects of response cards on student participation and academic achievement: A systematic replication with inner-city students during whole-class science instruction. Journal of Applied Behavior Analysis, 27(1), 63–71.|https://doi.org/10.1901/jaba.1994.27-63
Lasry, N. (2008). Clickers or flashcards: Is there really a difference? The Physics Teacher, 46(4), 242–244.|https://doi.org/10.1119/1.2895678
Wiliam, D. (2011). Embedded Formative Assessment. Solution Tree Press.
Northwest Educational Service District 189 (s. f.). ABCD Cards. Formative Assessment Techniques (ficha adaptada de Wiliam, 2011).|https://www.nwesd.org/wp-content/uploads/2013/08/EL_ABCD_Cards_kdj.pdf
Crouch, C. H. y Mazur, E. (2001). Peer Instruction: Ten years of experience and results. American Journal of Physics, 69(9), 970–977.|https://doi.org/10.1119/1.1374249';
$string['app_gd_tarjetas_stages'] = 'early|Sí y no, o el semáforo, y moverse: los de la tarjeta roja, al aro rojo; luego se cuenta entre todos cuántos hay en cada aro.
primary|La que se gira o las cuatro tarjetas con preguntas de opción; por grupos y a convencer al de otro color; el semáforo mientras trabajan.
secondary|Preguntas de concepto con un error frecuente entre las opciones: votar, discutir en parejas y volver a votar.
advanced|Instrucción entre iguales en grupos grandes sin dispositivos: las tarjetas sirven igual que los mandos.';
$string['app_gd_tarjetas_what'] = 'Votar sin dispositivos: a mano alzada o con tarjetas impresas (una que se gira con A, B, C y D, cuatro tarjetas sueltas, el semáforo, o sí y no). La pizarra imprime las tarjetas con los nombres de la clase, ayuda a contar y a hacer grupos por respuestas. No hace falta móvil: la tarjeta funciona sola; si quieres, la que se gira se puede leer con la cámara del ordenador o del móvil.';
$string['app_gd_tarjetas_why'] = 'Cuando cada alumno contesta con una tarjeta en lugar de levantar la mano para que responda uno, contestan todos. En una clase de cuarto de Primaria, Narayan, Heward, Gardner, Courson y Omness (1990) vieron que con tarjetas de respuesta la participación era mucho mayor que levantando la mano, que la mayoría sacaba mejores notas en los controles diarios, y que 19 de los 20 alumnos las preferían. En una réplica en una clase de Ciencias de quinto, Gardner, Heward y Grossi (1994) contaron catorce veces más respuestas, y los 22 alumnos sacaron mejores notas en lo trabajado con tarjetas.
Lo que cuenta no es la tecnología: en Física, con instrucción entre iguales, Lasry (2008) comparó mandos electrónicos con tarjetas de papel y no encontró que los mandos dieran ventaja en lo aprendido; su valor está sobre todo en registrar los datos.
Las tarjetas A, B, C y D son una de las técnicas de Wiliam (2011): una pregunta con hasta cuatro opciones, tiempo para pensar y, a una señal, todos levantan su respuesta. Si una opción es un error frecuente, se ve enseguida quién lo tiene; y en las preguntas de opinión, escuchar a quien defiende otra respuesta lleva a algunos a cambiar de idea.';
$string['app_gd_tarjetas_works'] = 'Que contesten todos a la vez, no solo quien levanta la mano.
Ver de un vistazo qué ha entendido la clase y quién necesita ayuda.
Explicar por qué: cada respuesta tiene quien la defienda.
Moverse y agruparse por respuestas.
Trabajar «desenchufado», con el material en la mano.';
$string['app_gd_tiempo_how'] = 'Elige un ejemplo o crea tu línea: una línea por hecho («1492 | Colón llega a América») o por periodo («476 – 1492 | Edad Media»).
«Ver todo» encaja la línea; arrastra para moverte y acerca con la rueda, dos dedos o la lupa: las marcas pasan de días a años, siglos o millones de años.
«Esconder las fechas»: la clase ordena los hechos antes de verlas; al tocar uno, sale su fecha.
Para notar la duración, compara periodos («¿cuántas Edades Medias caben en la Edad Antigua?») o busca dónde queda Homo sapiens en la historia de la Tierra.
La IA del Aula virtual o tu propia IA pueden proponer hechos de un tema: revisa las fechas antes de usarlas.';
$string['app_gd_tiempo_scene'] = 'En sexto, la maestra abre la historia de la Tierra con las fechas escondidas y pregunta qué fue antes, los dinosaurios o las primeras personas. Lo saben enseguida.
Luego toca «Ver todo» y busca Homo sapiens: hay que acercar mucho la línea para verlo separado del «Hoy». La clase se queda callada un momento.';
$string['app_gd_tiempo_sources'] = 'Pagès, J. y Santisteban, A. (2010). La enseñanza y el aprendizaje del tiempo histórico en la educación primaria. Cadernos CEDES, 30(82), 281–309.|https://doi.org/10.1590/S0101-32622010000300002
Cheek (2010). Factors underlying students\' conceptions of deep time: An exploratory study. Tesis doctoral, Durham University.|https://etheses.durham.ac.uk/277/
Comisión Internacional de Estratigrafía. Tabla Cronoestratigráfica Internacional (las edades de las eras del ejemplo).|https://stratigraphy.org/chart';
$string['app_gd_tiempo_stages'] = 'primary|Una vida o un curso, con meses y años; la historia del vuelo; antes y después de Cristo.
secondary|Las edades de la Historia y lo que pasaba a la vez en otros sitios; los periodos de un tema.
advanced|La historia de la Tierra, con sus eras, y la escala del tiempo profundo.';
$string['app_gd_tiempo_what'] = 'Una línea del tiempo que se acerca y se aleja, de días a la edad de la Tierra: hechos (un punto) y periodos (una barra), con ejemplos para cada etapa y líneas propias, escritas o pedidas a una IA.';
$string['app_gd_tiempo_why'] = 'El tiempo histórico es un concepto complejo: Pagès y Santisteban (2010) proponen enseñarlo en Primaria con un modelo que va más allá de memorizar fechas, para que la historia ayude a entender el presente a partir del pasado.
Con el tiempo profundo, el orden suele estar claro y lo difícil es la duración: en entrevistas a 35 estudiantes, Cheek (2010) encontró que ordenar los grandes hechos de la historia de la Tierra no les costaba y medir el tiempo que pasa entre ellos sí, también por la dificultad de las cifras de miles y de millones. Acercar y alejar la línea hace visibles esas distancias.';
$string['app_gd_tiempo_works'] = 'Ordenar hechos en el tiempo y ver lo que pasa a la vez.
La duración: cuánto separa un hecho de otro, y lo largos que son unos periodos frente a otros.
Las escalas: los meses de una vida, los siglos de la Historia, los millones de años de la Tierra.
Antes y después de Cristo, y «hace millones de años».';
$string['app_gd_why'] = 'Por qué';
$string['app_gd_works'] = 'Qué trabaja';
$string['app_gen_again'] = 'Otra vez';
$string['app_gen_big_view'] = 'Vista en grande';
$string['app_gen_cancel'] = 'Cancelar';
$string['app_gen_close'] = 'Cerrar';
$string['app_gen_done'] = 'Listo';
$string['app_gen_pause'] = 'Pausa';
$string['app_gen_reset'] = 'Reiniciar';
$string['app_gen_resume'] = 'Seguir';
$string['app_gen_save'] = 'Guardar';
$string['app_gen_start'] = 'Empezar';
$string['app_gl_add'] = 'Sumar {$a}';
$string['app_gl_count'] = '{$a->n} de {$a->of}';
$string['app_gl_count_frac'] = '{$a->frac} · {$a->pct} %';
$string['app_gl_count_left'] = '{$a->n} de {$a->of} · faltan {$a->left}';
$string['app_gl_done'] = '¡Lo conseguimos!';
$string['app_gl_fact_jupiter'] = 'el planeta más grande del sistema solar';
$string['app_gl_fact_mars'] = 'el planeta rojo';
$string['app_gl_fact_neptune'] = 'el más lejano del Sol';
$string['app_gl_fact_saturn'] = 'el de los anillos más vistosos';
$string['app_gl_fact_uranus'] = 'gira tumbado de lado';
$string['app_gl_for'] = 'Para: {$a}';
$string['app_gl_goal'] = 'Meta de la clase';
$string['app_gl_help'] = 'Toda la clase gana canicas a la vez; cuando el bote se llena, llega el premio.';
$string['app_gl_look'] = 'Aspecto';
$string['app_gl_look_bote'] = 'Bote de canicas';
$string['app_gl_look_camino'] = 'Camino del bichito';
$string['app_gl_look_cancion'] = 'Canción nota a nota';
$string['app_gl_look_cohete'] = 'Cohete por el sistema solar';
$string['app_gl_look_mosaico'] = 'Mosaico que se destapa';
$string['app_gl_look_planta'] = 'Planta que crece';
$string['app_gl_no_song'] = 'No hay canciones en la Partitura';
$string['app_gl_notes'] = '{$a->n} de {$a->of} notas';
$string['app_gl_pic_choose'] = 'Elegir la imagen';
$string['app_gl_pic_mar'] = 'Fondo del mar';
$string['app_gl_pic_mia'] = 'Una imagen mía';
$string['app_gl_pic_note'] = 'Tu imagen se queda solo en este navegador.';
$string['app_gl_pic_paisaje'] = 'Atardecer en la montaña';
$string['app_gl_picture'] = 'Imagen';
$string['app_gl_pl_done'] = '¡Hemos llegado a Neptuno, el planeta más lejano del Sol!';
$string['app_gl_pl_earth'] = 'Tierra';
$string['app_gl_pl_jupiter'] = 'Júpiter';
$string['app_gl_pl_mars'] = 'Marte';
$string['app_gl_pl_mercury'] = 'Mercurio';
$string['app_gl_pl_neptune'] = 'Neptuno';
$string['app_gl_pl_saturn'] = 'Saturno';
$string['app_gl_pl_scale'] = 'Sin escala';
$string['app_gl_pl_start'] = 'Despegamos de la Tierra';
$string['app_gl_pl_uranus'] = 'Urano';
$string['app_gl_pl_venus'] = 'Venus';
$string['app_gl_plant_flower'] = 'Florece';
$string['app_gl_plant_fruit'] = 'Da fruto';
$string['app_gl_plant_germ'] = 'Germina';
$string['app_gl_plant_grows'] = 'Crece';
$string['app_gl_plant_seed'] = 'Semilla';
$string['app_gl_plant_seedling'] = 'Plántula';
$string['app_gl_prize'] = 'Premio';
$string['app_gl_prize_ph'] = 'Una tarde de juegos';
$string['app_gl_reset'] = 'Empezar de nuevo';
$string['app_gl_reset_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_gl_skip'] = 'Contamos de {$a} en {$a}';
$string['app_gl_song'] = 'Canción';
$string['app_gl_take'] = 'Quitar {$a}';
$string['app_gl_target'] = 'Meta';
$string['app_gl_teams'] = 'Equipos';
$string['app_gl_tiles'] = 'Se ven {$a->n} de {$a->of} piezas';
$string['app_gl_what'] = 'Qué contamos';
$string['app_hp_again'] = 'Otra vez';
$string['app_hp_ahorcado_1'] = 'Para abrir el tema nuevo, una palabra misteriosa: si la adivinan, ya saben de qué va la clase.';
$string['app_hp_ahorcado_2'] = 'En «Juegos», «Ahorcado», elige «Escribirla yo» y escribe la palabra, que nadie ve. Si quieres, una pista.';
$string['app_hp_ahorcado_3'] = 'Pulsa «Nueva palabra» y ve tocando en el teclado las letras que dice la clase.';
$string['app_hp_ahorcado_4'] = 'En vez de un ahorcado, siete globos: cada fallo explota uno.';
$string['app_hp_ahorcado_5'] = '¿Sin palabra a mano? «Al azar» trae palabras de cada etapa.';
$string['app_hp_ahorcado_6'] = 'Ahora tú: pulsa «Nueva palabra» y prueba una letra en el teclado.';
$string['app_hp_ahorcado_7'] = '¡Lo tienes! Este bichito es tuyo: Salvaglobos.';
$string['app_hp_ahorcado_again'] = '¡Bien hecho! Ya tenías a Salvaglobos.';
$string['app_hp_ahorcado_clue'] = 'Lo que vamos a estudiar hoy';
$string['app_hp_ahorcado_h1'] = 'Pulsa «Nueva palabra»';
$string['app_hp_ahorcado_h2'] = 'Prueba la E';
$string['app_hp_ahorcado_title'] = 'Ahorcado: la palabra que abre el tema';
$string['app_hp_ahorcado_word'] = 'ECOSISTEMA';
$string['app_hp_captions'] = 'Subtítulos';
$string['app_hp_close'] = 'Cerrar la ayuda';
$string['app_hp_concurso_1'] = 'Los de sexto han escrito un concurso sobre volcanes para los de cuarto. Hoy lo juega cuarto, por equipos.';
$string['app_hp_concurso_2'] = 'En «Concurso», pulsa «Nuevo juego» y «Pegar varias preguntas o pedírselas a una IA»: una por línea, con un asterisco delante de la buena. El «Prompt para tu IA» ya lleva ese formato.';
$string['app_hp_concurso_3'] = 'En «Equipos», «Eligen ellos», y abre la sesión: cada uno escoge su equipo al entrar.';
$string['app_hp_concurso_4'] = 'Pulsa «Empezar el concurso». Corre el tiempo y, cuando han contestado todos, se destapa la buena con cuántos eligieron cada respuesta.';
$string['app_hp_concurso_5'] = '«Siguiente pregunta» y, al final, el podio por equipos. La próxima vez, cuarto escribe el concurso de sexto.';
$string['app_hp_concurso_6'] = 'Ahora tú: pulsa «Empezar el concurso» y, cuando se destape la buena, «Siguiente pregunta».';
$string['app_hp_concurso_7'] = '¡Lo tienes! Este bichito es tuyo: Lanzapreguntas.';
$string['app_hp_concurso_again'] = '¡Bien hecho! Ya tenías a Lanzapreguntas.';
$string['app_hp_concurso_h1'] = 'Pulsa «Empezar el concurso»';
$string['app_hp_concurso_h2'] = 'Ya se ha destapado: «Siguiente pregunta»';
$string['app_hp_concurso_name'] = 'Volcanes (de 6.º)';
$string['app_hp_concurso_text'] = '¿Cómo se llama la roca fundida cuando sale del volcán? | Magma | *Lava | Ceniza
¿En qué isla está el Teide? | Gran Canaria | Lanzarote | *Tenerife';
$string['app_hp_concurso_title'] = 'Concurso: lo escriben ellos';
$string['app_hp_concurso_topic'] = 'Volcanes';
$string['app_hp_cortina_1'] = 'Corriges el ejercicio en voz alta con la clase: las respuestas ya están en la pizarra, pero tapadas.';
$string['app_hp_cortina_2'] = 'En la «Pizarra completa», la «Cortina» tapa la pizarra entera.';
$string['app_hp_cortina_3'] = 'Arrastra su borde y destapa la primera respuesta; cuando la hayan dicho, la siguiente.';
$string['app_hp_cortina_4'] = 'Con el «Foco», solo queda iluminado un círculo: lo que importa, y nada más.';
$string['app_hp_cortina_5'] = 'Y con el «Puntero láser», señalas sin dejar marca.';
$string['app_hp_cortina_6'] = 'Ahora tú: abre la «Cortina» y destápala arrastrando su borde.';
$string['app_hp_cortina_7'] = '¡Lo tienes! Este bichito es tuyo: Quitatelones.';
$string['app_hp_cortina_again'] = '¡Bien hecho! Ya tenías a Quitatelones.';
$string['app_hp_cortina_h1'] = 'Abre la «Cortina»';
$string['app_hp_cortina_h2'] = 'Arrastra el borde hacia abajo';
$string['app_hp_cortina_title'] = 'Cortina y foco';
$string['app_hp_dados_1'] = 'Después de leer un cuento, dos dados: uno dice quién contesta y el otro, qué pregunta.';
$string['app_hp_dados_2'] = 'En «Azar», «Dados», elige dos: el primero, la lista de la clase; el segundo, «Personalizado».';
$string['app_hp_dados_3'] = 'Escribe las caras, una por línea: ¿quién?, ¿dónde?, ¿cuándo?, ¿por qué?…';
$string['app_hp_dados_4'] = 'Pulsa «Tirar»: sale un nombre y una pregunta, y a contestar.';
$string['app_hp_dados_5'] = 'Hay dados de operaciones, de flechas, de letras o de colores. Y con los de números, «Muchas tiradas»: mil de golpe, y el siete sale mucho más que el doce.';
$string['app_hp_dados_6'] = 'Ahora tú: pon tres dados y pulsa «Tirar».';
$string['app_hp_dados_7'] = '¡Lo tienes! Este bichito es tuyo: Tiradados.';
$string['app_hp_dados_again'] = '¡Bien hecho! Ya tenías a Tiradados.';
$string['app_hp_dados_faces'] = '¿Quién?
¿Dónde?
¿Cuándo?
¿Por qué?
¿Qué pasó?
¿Cómo acaba?';
$string['app_hp_dados_h1'] = 'Pon tres dados';
$string['app_hp_dados_h2'] = 'Y ahora «Tirar»';
$string['app_hp_dados_title'] = 'Dados: el dado de las preguntas';
$string['app_hp_done'] = '¡Bien hecho!';
$string['app_hp_entrar_1'] = '«En vivo» abre la pizarra a los móviles. Lo vemos en una reunión de familias.';
$string['app_hp_entrar_2'] = 'Elige «Votación» y, en «¿Cómo entran?», «Con el código»: no hace falta cuenta, así que también pueden entrar las familias.';
$string['app_hp_entrar_3'] = 'Pulsa «Abrir la sesión». En la pizarra aparecen el QR y un código de cuatro letras.';
$string['app_hp_entrar_4'] = 'Cada móvil que entra es un bichito con su nombre. Nadie sabe quién vota qué.';
$string['app_hp_entrar_5'] = 'Ya están dentro. Pregunta lo que quieras: por ejemplo, ¿adónde vamos de excursión?';
$string['app_hp_entrar_6'] = 'Ahora tú: elige «Votación», luego «Con el código», y pulsa «Abrir la sesión».';
$string['app_hp_entrar_7'] = '¡Lo tienes! Este bichito es tuyo: Domamóviles.';
$string['app_hp_entrar_again'] = '¡Bien hecho! Ya tenías a Domamóviles.';
$string['app_hp_entrar_h1'] = 'Pulsa «Votación»';
$string['app_hp_entrar_h2'] = 'Ahora «Con el código»';
$string['app_hp_entrar_h3'] = 'Y «Abrir la sesión»';
$string['app_hp_entrar_q'] = '¿Adónde vamos de excursión?';
$string['app_hp_entrar_title'] = 'Que entre la clase';
$string['app_hp_fictional'] = 'Clase de práctica · datos ficticios';
$string['app_hp_guided'] = 'Ayuda guiada';
$string['app_hp_instrumentos_1'] = 'Geometría en la pizarra, con los instrumentos de verdad: regla, transportador y compás.';
$string['app_hp_instrumentos_2'] = 'En la «Pizarra completa», saca la «Regla»: el rotulador, pegado a su borde, traza recto.';
$string['app_hp_instrumentos_3'] = 'Con el «Transportador», mueve su brazo y lee el ángulo.';
$string['app_hp_instrumentos_4'] = 'El «Compás»: ábrelo hasta la medida y gira desde el lápiz para trazar la circunferencia.';
$string['app_hp_instrumentos_5'] = 'Cada instrumento se mueve arrastrándolo y gira desde su asa.';
$string['app_hp_instrumentos_6'] = 'Ahora tú: saca el «Compás» y traza una circunferencia girando desde el lápiz.';
$string['app_hp_instrumentos_7'] = '¡Lo tienes! Este bichito es tuyo: Trazacírculos.';
$string['app_hp_instrumentos_again'] = '¡Bien hecho! Ya tenías a Trazacírculos.';
$string['app_hp_instrumentos_h1'] = 'Saca el «Compás»';
$string['app_hp_instrumentos_h2'] = 'Gira desde el lápiz';
$string['app_hp_instrumentos_title'] = 'Regla, transportador y compás';
$string['app_hp_manos_1'] = 'En la asamblea de Infantil, la clase elige el nombre de su mascota. Sin pantallas: levantan la mano y tú cuentas.';
$string['app_hp_manos_2'] = 'Elige «A mano alzada o con tarjetas» y, en «Respuestas», «Mis respuestas»: escribe los nombres, uno por línea.';
$string['app_hp_manos_3'] = 'Escribe la pregunta y cuenta las manos de cada nombre con «+».';
$string['app_hp_manos_4'] = 'Las barras crecen mientras cuentas; si se te escapa una de más, «−».';
$string['app_hp_manos_5'] = 'Gana Pelusa. Para la siguiente pregunta, «Poner a cero».';
$string['app_hp_manos_6'] = 'Ahora tú: cuenta una mano más para Canela y luego pulsa «Poner a cero».';
$string['app_hp_manos_7'] = '¡Lo tienes! Este bichito es tuyo: Cuentamanos.';
$string['app_hp_manos_again'] = '¡Bien hecho! Ya tenías a Cuentamanos.';
$string['app_hp_manos_h1'] = 'Una mano más para Canela';
$string['app_hp_manos_h2'] = 'Y ahora «Poner a cero»';
$string['app_hp_manos_pets'] = 'Lola
Pelusa
Canela';
$string['app_hp_manos_q'] = '¿Cómo se llama nuestra mascota?';
$string['app_hp_manos_title'] = 'A mano alzada: la mascota de la clase';
$string['app_hp_next'] = 'Paso siguiente';
$string['app_hp_now_you'] = 'Ahora tú';
$string['app_hp_nube_1'] = 'Al acabar la clase de fracciones, una pregunta: ¿qué no ha quedado claro? Lo que más se repita, se repasa mañana.';
$string['app_hp_nube_2'] = 'En «Lluvia de ideas», escribe la pregunta y pulsa «Abrir las respuestas»: cada uno contesta con una palabra desde su móvil.';
$string['app_hp_nube_3'] = 'Con «Revisar antes de mostrar», las respuestas te llegan antes a ti: lo que no toca, lo ocultas.';
$string['app_hp_nube_4'] = 'Pulsa «Mostrar todas». Escrita como sea, la misma palabra cuenta como una y crece: denominador, ocho veces.';
$string['app_hp_nube_5'] = 'Si dos dicen lo mismo con otras palabras, tócalas y pulsa «Juntar». Con «Guardar imagen», mañana la tienes.';
$string['app_hp_nube_6'] = 'Ahora tú: pulsa «Abrir las respuestas» y, cuando lleguen, «Mostrar todas».';
$string['app_hp_nube_7'] = '¡Lo tienes! Este bichito es tuyo: Atrapanubes.';
$string['app_hp_nube_again'] = '¡Bien hecho! Ya tenías a Atrapanubes.';
$string['app_hp_nube_h1'] = 'Pulsa «Abrir las respuestas»';
$string['app_hp_nube_h2'] = 'Ya han llegado: «Mostrar todas»';
$string['app_hp_nube_q'] = '¿Qué no ha quedado claro?';
$string['app_hp_nube_title'] = 'Lluvia de ideas: la nube de dudas';
$string['app_hp_partitura_1'] = 'Hoy, la canción a relevos: cada alumno sale a la pizarra y toca una nota en el carillón.';
$string['app_hp_partitura_2'] = 'En «Material», «Partitura», elige una canción: vienen canciones populares de muchos países, y cada una dice de dónde es.';
$string['app_hp_partitura_3'] = 'Pulsa «Escuchar»: suena la melodía y las notas se iluminan, con su nombre y su color.';
$string['app_hp_partitura_4'] = 'Con «Toca conmigo», el carillón enciende la nota siguiente y espera: sale alguien, la toca, y le toca al siguiente.';
$string['app_hp_partitura_5'] = 'Y para repasar las notas, «¿Qué nota es?»: suena una y la clase la adivina.';
$string['app_hp_partitura_6'] = 'Ahora tú: pulsa «Toca conmigo» y toca en el carillón la nota que se enciende.';
$string['app_hp_partitura_7'] = '¡Lo tienes! Este bichito es tuyo: Tocanotas.';
$string['app_hp_partitura_again'] = '¡Bien hecho! Ya tenías a Tocanotas.';
$string['app_hp_partitura_h1'] = 'Pulsa «Toca conmigo»';
$string['app_hp_partitura_h2'] = 'Toca la nota que se enciende';
$string['app_hp_partitura_title'] = 'Partitura: la canción a relevos';
$string['app_hp_pause'] = 'Pausa';
$string['app_hp_pizarra_1'] = 'En matemáticas dibujas a mano alzada, y la pizarra lo pasa a limpio.';
$string['app_hp_pizarra_2'] = 'En la «Pizarra completa», dibuja un triángulo a mano y deja el dedo quieto al final: queda perfecto.';
$string['app_hp_pizarra_3'] = 'Lo mismo con un círculo: a mano, un momento quieto, y círculo perfecto.';
$string['app_hp_pizarra_4'] = 'Con «Fórmula», la escribes como se dice: x al cuadrado más uno, partido por dos. Y sale como en el libro.';
$string['app_hp_pizarra_5'] = 'Con «Seleccionar», cualquier cosa se mueve o cambia de tamaño.';
$string['app_hp_pizarra_6'] = 'Ahora tú: dibuja un círculo a mano y deja el dedo quieto al final.';
$string['app_hp_pizarra_7'] = '¡Lo tienes! Este bichito es tuyo: Pasalimpios.';
$string['app_hp_pizarra_again'] = '¡Bien hecho! Ya tenías a Pasalimpios.';
$string['app_hp_pizarra_h1'] = 'Dibuja un círculo a mano y deja el dedo quieto al final';
$string['app_hp_pizarra_title'] = 'Formas mágicas y fórmulas';
$string['app_hp_play'] = 'Reproducir';
$string['app_hp_practice_board'] = 'Pizarra de práctica';
$string['app_hp_practice_course'] = '4.º B · Ciencias';
$string['app_hp_practice_half_a'] = 'Desdoble A';
$string['app_hp_practice_half_b'] = 'Desdoble B';
$string['app_hp_practice_list'] = '4.º B';
$string['app_hp_prev'] = 'Paso anterior';
$string['app_hp_pulsadores_1'] = 'Lees en voz alta un texto con un error escondido: «Colón llegó a América en 1942». El primer equipo que lo pilla, pulsa.';
$string['app_hp_pulsadores_2'] = 'En «Pulsadores», elige cuántos equipos y abre la sesión: cada uno se apunta a su equipo al entrar.';
$string['app_hp_pulsadores_3'] = 'Pulsa «Abrir los pulsadores» y empieza a leer. Desde ese momento, cada móvil es el pulsador de su equipo.';
$string['app_hp_pulsadores_4'] = 'El primero sale en grande, con quién ha pulsado; los demás, con las centésimas que han tardado.';
$string['app_hp_pulsadores_5'] = '«Cerrar los pulsadores», contesta ese equipo y, con «Otra ronda», a por el siguiente error.';
$string['app_hp_pulsadores_6'] = 'Ahora tú: pulsa «Abrir los pulsadores» y, cuando alguien pulse, «Cerrar los pulsadores».';
$string['app_hp_pulsadores_7'] = '¡Lo tienes! Este bichito es tuyo: Tocatimbres.';
$string['app_hp_pulsadores_again'] = '¡Bien hecho! Ya tenías a Tocatimbres.';
$string['app_hp_pulsadores_h1'] = 'Pulsa «Abrir los pulsadores»';
$string['app_hp_pulsadores_h2'] = 'Ya han pulsado: «Cerrar los pulsadores»';
$string['app_hp_pulsadores_title'] = 'Pulsadores: cazar el error';
$string['app_hp_rosco_1'] = 'Viernes de repaso: dos equipos, cada uno con su rosco y su reloj.';
$string['app_hp_rosco_2'] = 'En «Juegos», «Rosco», elige «Dos equipos» y el tiempo, y pulsa «Empezar».';
$string['app_hp_rosco_3'] = 'Lees la pista y marcas «Acierto», «Fallo» o «Pasapalabra». Con un acierto sigue el mismo equipo; si no, le toca al otro.';
$string['app_hp_rosco_4'] = 'Cada reloj solo corre en el turno de su equipo.';
$string['app_hp_rosco_5'] = 'Con «Nuevo rosco» escribes el tuyo con las palabras del tema, y se queda guardado.';
$string['app_hp_rosco_6'] = 'Ahora tú: pulsa «Empezar» y marca la primera respuesta como «Acierto».';
$string['app_hp_rosco_7'] = '¡Lo tienes! Este bichito es tuyo: Cazaletras.';
$string['app_hp_rosco_again'] = '¡Bien hecho! Ya tenías a Cazaletras.';
$string['app_hp_rosco_h1'] = 'Pulsa «Empezar»';
$string['app_hp_rosco_h2'] = 'Y marca «Acierto»';
$string['app_hp_rosco_title'] = 'Rosco: viernes de repaso';
$string['app_hp_skip'] = 'Saltar';
$string['app_hp_step'] = 'Paso {$a->n} / {$a->all}';
$string['app_hp_step_you'] = 'Ahora tú · paso {$a->n} / {$a->all}';
$string['app_hp_votar_1'] = 'Antes del experimento, la pregunta: ¿el huevo flota en agua con sal?';
$string['app_hp_votar_2'] = 'Elige «Sí o no» y pulsa «Abrir la votación». Cada uno vota desde su móvil.';
$string['app_hp_votar_3'] = 'Mientras votan, solo se ve cuántos han contestado: así nadie se deja llevar por lo que votan los demás.';
$string['app_hp_votar_4'] = 'Pulsa «Cerrar la votación» y salen las barras: casi todos creen que no flota.';
$string['app_hp_votar_5'] = 'Ahora, el experimento. Después, «Otra pregunta» con la misma pregunta: las barras han cambiado.';
$string['app_hp_votar_6'] = 'Ahora tú: pulsa «Abrir la votación» y, cuando hayan votado, «Cerrar la votación».';
$string['app_hp_votar_7'] = '¡Lo tienes! Este bichito es tuyo: Cuentavotos.';
$string['app_hp_votar_again'] = '¡Bien hecho! Ya tenías a Cuentavotos.';
$string['app_hp_votar_h1'] = 'Pulsa «Abrir la votación»';
$string['app_hp_votar_h2'] = 'Ya han votado: «Cerrar la votación»';
$string['app_hp_votar_q'] = '¿El huevo flota en agua con sal?';
$string['app_hp_votar_title'] = 'Votación: predecir antes de experimentar';
$string['app_hp_watch'] = 'Ver cómo funciona';
$string['app_hp_watch_captions'] = 'con subtítulos · y al final, pruébalo tú';
$string['app_hp_watch_voice'] = 'con voz · y al final, pruébalo tú';
$string['app_hp_your_turn_n'] = 'Te toca · {$a->n} de {$a->all}';
$string['app_id_accept'] = 'Mostrar «{$a}»';
$string['app_id_check_first'] = 'Hay respuestas esperando revisión debajo.';
$string['app_id_close'] = 'Cerrar las respuestas';
$string['app_id_count'] = '{$a->n} respuestas · {$a->who} de {$a->of} dispositivos';
$string['app_id_default_name'] = 'Lluvia de ideas {$a}';
$string['app_id_empty'] = 'Todavía no hay respuestas.';
$string['app_id_file'] = 'lluvia-de-ideas';
$string['app_id_hidden'] = 'Ocultas: {$a}';
$string['app_id_hide'] = 'Ocultar';
$string['app_id_max'] = 'Respuestas por persona';
$string['app_id_max_many'] = '{$a} respuestas cada uno';
$string['app_id_max_one'] = '1 respuesta cada uno';
$string['app_id_merge'] = 'Juntar';
$string['app_id_new'] = 'Nueva pregunta';
$string['app_id_open'] = 'Abrir las respuestas';
$string['app_id_pending'] = 'Por revisar: {$a}';
$string['app_id_question_ph'] = 'La pregunta o el tema (lo ven los dispositivos)';
$string['app_id_reject'] = 'Ocultar «{$a}»';
$string['app_id_reopen'] = 'Volver a abrir';
$string['app_id_restore'] = 'Toca una para volver a mostrarla';
$string['app_id_review'] = 'Revisar antes de mostrar';
$string['app_id_save'] = 'Guardar imagen';
$string['app_id_saved'] = 'Imagen guardada';
$string['app_id_scale_high'] = 'mucho';
$string['app_id_scale_low'] = 'nada';
$string['app_id_selected_many'] = '{$a} elegidas';
$string['app_id_selected_one'] = '1 elegida';
$string['app_id_send'] = 'Enviar a la clase';
$string['app_id_show_all'] = 'Mostrar todas';
$string['app_id_sort'] = 'Ordenar por veces';
$string['app_id_star'] = 'Destacar';
$string['app_id_tray'] = 'Arrastra cada respuesta a su casilla';
$string['app_id_tray_empty'] = 'Todas colocadas. Arrastra una aquí para sacarla.';
$string['app_id_unselect'] = 'Listo';
$string['app_id_unstar'] = 'Quitar el destacado';
$string['app_id_v_cloud'] = 'Nube';
$string['app_id_v_eisen'] = 'Urgente o importante';
$string['app_id_v_list'] = 'Lista';
$string['app_id_v_procon'] = 'A favor y en contra';
$string['app_id_v_scale'] = 'Escala del 1 al 5';
$string['app_id_v_swot'] = 'DAFO';
$string['app_id_view'] = 'Vista';
$string['app_id_wait_open'] = 'Escribe la pregunta y abre las respuestas.';
$string['app_id_z_con'] = 'En contra';
$string['app_id_z_ni'] = 'Importante, no urgente';
$string['app_id_z_nn'] = 'Ni urgente ni importante';
$string['app_id_z_o'] = 'Oportunidades';
$string['app_id_z_pro'] = 'A favor';
$string['app_id_z_s'] = 'Fortalezas';
$string['app_id_z_t'] = 'Amenazas';
$string['app_id_z_ui'] = 'Urgente e importante';
$string['app_id_z_un'] = 'Urgente, no importante';
$string['app_id_z_w'] = 'Debilidades';
$string['app_in_bevel'] = 'Cartabón';
$string['app_in_close'] = 'Quitar';
$string['app_in_compass'] = 'Compás';
$string['app_in_curtain'] = 'Cortina: tapar la pizarra y destaparla poco a poco';
$string['app_in_protractor'] = 'Transportador';
$string['app_in_ruler'] = 'Regla';
$string['app_in_spot'] = 'Foco';
$string['app_in_square'] = 'Escuadra';
$string['app_iv_ask'] = '¿Cómo se escribe? (toca para verlo)';
$string['app_iv_bad'] = 'Escríbelo como [−2, 3), x ≥ 1, −1 < x ≤ 4 o |x − 1| < 2';
$string['app_iv_help'] = 'Escríbelo o saca uno al azar. Un toque en un extremo lo abre o lo cierra: el extremo relleno entra y el hueco no.';
$string['app_iv_hide'] = 'Esconder cómo se escribe';
$string['app_iv_or'] = 'o';
$string['app_iv_put'] = 'Dibujar';
$string['app_iv_random'] = 'Uno al azar';
$string['app_iv_write'] = 'Un intervalo, una desigualdad o un valor absoluto';
$string['app_levels_other'] = 'Otros niveles';
$string['app_lock_again'] = 'Otra vez';
$string['app_lock_bad_code'] = 'El código tiene que tener de 2 a 8 números o letras.';
$string['app_lock_cancel'] = 'Cancelar';
$string['app_lock_clues'] = 'Pistas';
$string['app_lock_clues_label'] = 'Pistas, una por línea (se enseñan en este orden)';
$string['app_lock_code'] = 'Código (de 2 a 8 números o letras)';
$string['app_lock_copy_of'] = '{$a} (copia)';
$string['app_lock_edit'] = 'Editar';
$string['app_lock_editor_copy'] = 'Copia del candado de ejemplo';
$string['app_lock_editor_edit'] = 'Editar el candado';
$string['app_lock_erase'] = 'Borrar';
$string['app_lock_final_msg'] = 'Mensaje al abrirlo (si quieres)';
$string['app_lock_lock'] = 'Candado';
$string['app_lock_lock_name'] = 'Nombre del candado';
$string['app_lock_minutes'] = '{$a} min';
$string['app_lock_name'] = 'Código secreto';
$string['app_lock_new'] = 'Nuevo candado';
$string['app_lock_next_clue'] = 'Ver la siguiente pista';
$string['app_lock_no_more_clues'] = 'No hay más pistas';
$string['app_lock_no_time'] = 'Sin tiempo';
$string['app_lock_opened'] = '¡Abierto!';
$string['app_lock_press_start'] = 'Elige el candado y pulsa «Empezar»';
$string['app_lock_remove'] = 'Borrar el candado';
$string['app_lock_remove_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_lock_save'] = 'Guardar';
$string['app_lock_start'] = 'Empezar';
$string['app_lock_time'] = 'Tiempo';
$string['app_lock_time_up'] = '¡Se acabó el tiempo!';
$string['app_lock_tries_many'] = '{$a} intentos';
$string['app_lock_tries_one'] = '{$a} intento';
$string['app_lock_wrong'] = '¡No es ese código!';
$string['app_lv_after'] = '+{$a} s';
$string['app_lv_again'] = 'Otra pregunta';
$string['app_lv_anon'] = 'Con el código';
$string['app_lv_anon_hint'] = 'Nadie inicia sesión y no sale ningún nombre: cada dispositivo es un bichito con nombre.';
$string['app_lv_anon_short'] = 'Sin cuenta: entra cualquiera, también de fuera';
$string['app_lv_answered'] = 'Han contestado {$a->n} de {$a->of}';
$string['app_lv_answers'] = 'Respuestas';
$string['app_lv_bye'] = 'Se acabó la sesión. ¡Gracias!';
$string['app_lv_change'] = 'Puedes cambiarla hasta que se cierre.';
$string['app_lv_change_team'] = 'Cambiar de equipo';
$string['app_lv_choose'] = 'Elige tu respuesta.';
$string['app_lv_close_round'] = 'Cerrar los pulsadores';
$string['app_lv_close_vote'] = 'Cerrar la votación';
$string['app_lv_closed'] = 'Votación cerrada';
$string['app_lv_closes_in'] = 'Se cierra en {$a}';
$string['app_lv_cmd_next'] = 'Herramienta siguiente';
$string['app_lv_cmd_pick'] = '¿A quién le toca?';
$string['app_lv_cmd_plus'] = '+1 minuto';
$string['app_lv_cmd_present'] = 'Presentar';
$string['app_lv_cmd_prev'] = 'Herramienta anterior';
$string['app_lv_cmd_reset'] = 'Reiniciar el temporizador';
$string['app_lv_cmd_timer'] = 'Temporizador: empezar o pausa';
$string['app_lv_code'] = 'Código';
$string['app_lv_copied'] = 'Copiado';
$string['app_lv_copy'] = 'Copiar la dirección';
$string['app_lv_custom'] = 'Respuestas, una por línea (de 2 a 5)';
$string['app_lv_custom_ph'] = 'Rojo
Azul
Verde';
$string['app_lv_device_n'] = 'Dispositivo {$a}';
$string['app_lv_devices'] = 'Quién está dentro';
$string['app_lv_end'] = 'Terminar la sesión';
$string['app_lv_end_confirm'] = 'Pulsa otra vez para terminarla';
$string['app_lv_ended'] = 'Sesión terminada';
$string['app_lv_enter'] = 'Entrar';
$string['app_lv_ex_back'] = 'Volver al resumen';
$string['app_lv_ex_change'] = 'Cambiarlo';
$string['app_lv_ex_close'] = 'Cerrar el billete';
$string['app_lv_ex_closed'] = 'Billete cerrado';
$string['app_lv_ex_csv_who'] = 'Quién';
$string['app_lv_ex_door'] = 'Al salir, cada uno enseña su billete: la pantalla verde de su dispositivo.';
$string['app_lv_ex_download'] = 'Descargar';
$string['app_lv_ex_empty'] = 'Elige una cara o escribe algo antes.';
$string['app_lv_ex_f0'] = 'Todavía no lo entiendo';
$string['app_lv_ex_f1'] = 'Lo entiendo a medias';
$string['app_lv_ex_f2'] = 'Lo entiendo';
$string['app_lv_ex_f3'] = 'Lo podría explicar a otro';
$string['app_lv_ex_feel_on'] = 'Preguntar «¿Cómo lo llevas?» (cuatro caras)';
$string['app_lv_ex_feel_q'] = '¿Cómo lo llevas?';
$string['app_lv_ex_file'] = 'billete-de-salida';
$string['app_lv_ex_first'] = 'Prepáralo ya; abre la sesión (a la izquierda) unos minutos antes de acabar, y luego el billete.';
$string['app_lv_ex_g_lesson'] = 'Cómo ha ido la clase';
$string['app_lv_ex_g_self'] = 'Cómo han trabajado';
$string['app_lv_ex_g_teacher'] = 'Para el profesor';
$string['app_lv_ex_g_understand'] = 'Qué han entendido';
$string['app_lv_ex_group'] = 'Cómo ordenar los billetes';
$string['app_lv_ex_group_feel'] = 'En montones, por cómo lo llevan';
$string['app_lv_ex_group_time'] = 'Por orden de entrega';
$string['app_lv_ex_handed'] = 'Lo han entregado {$a->n} de {$a->of}';
$string['app_lv_ex_hidden'] = 'Quitado de la pantalla.';
$string['app_lv_ex_hide'] = 'Quitarlo de la pantalla';
$string['app_lv_ex_hide_answers'] = 'Ocultar las respuestas';
$string['app_lv_ex_ideas'] = 'Ideas…';
$string['app_lv_ex_in'] = 'Han entregado';
$string['app_lv_ex_lead'] = 'Al acabar la clase, cada alumno dice cómo lo lleva y contesta de una a tres preguntas cortas. De tres a cinco minutos; te dice por dónde empezar la clase siguiente.';
$string['app_lv_ex_missing'] = 'Sin entregar';
$string['app_lv_ex_n'] = 'Billete {$a}';
$string['app_lv_ex_names'] = 'Con nombres';
$string['app_lv_ex_new'] = 'Otro billete';
$string['app_lv_ex_no_texts'] = 'No hay respuestas escritas.';
$string['app_lv_ex_none'] = 'No has entregado el billete.';
$string['app_lv_ex_nothing'] = 'El billete necesita las caras o al menos una pregunta.';
$string['app_lv_ex_open'] = 'Abrir el billete';
$string['app_lv_ex_p_activity'] = '¿Qué actividad de hoy te ha ayudado más a aprender?';
$string['app_lv_ex_p_better'] = '¿Qué podrías haber hecho para aprender mejor?';
$string['app_lv_ex_p_confused'] = 'Lo que más me ha costado entender hoy';
$string['app_lv_ex_p_doubt'] = 'Una duda que me queda';
$string['app_lv_ex_p_effort'] = '¿Cuánto te has esforzado hoy? ¿Por qué?';
$string['app_lv_ex_p_example'] = 'Pon un ejemplo de lo que hemos visto hoy';
$string['app_lv_ex_p_group'] = '¿Te ha ayudado el trabajo en grupo a entenderlo? ¿Qué cambiarías?';
$string['app_lv_ex_p_learned'] = 'Lo más importante que he aprendido hoy';
$string['app_lv_ex_p_teacher'] = '¿Qué podría hacer yo para que lo entiendas mejor?';
$string['app_lv_ex_p_use'] = '¿Dónde lo usarías fuera de clase?';
$string['app_lv_ex_p_words'] = 'Explícalo con tus palabras: ';
$string['app_lv_ex_ph'] = 'Una o dos frases';
$string['app_lv_ex_q_n'] = 'Pregunta {$a}';
$string['app_lv_ex_q_optional'] = 'Opcional';
$string['app_lv_ex_q_ph'] = 'Escríbela o elige una de «Ideas»';
$string['app_lv_ex_random'] = 'Una al azar';
$string['app_lv_ex_random_again'] = 'Otra';
$string['app_lv_ex_random_close'] = 'Cerrar';
$string['app_lv_ex_reopen'] = 'Reabrir';
$string['app_lv_ex_s0'] = 'Todavía no';
$string['app_lv_ex_s1'] = 'A medias';
$string['app_lv_ex_s2'] = 'Lo entiendo';
$string['app_lv_ex_s3'] = 'Lo explicaría';
$string['app_lv_ex_s_none'] = 'Sin cara';
$string['app_lv_ex_send'] = 'Entregar';
$string['app_lv_ex_send_again'] = 'Entregar de nuevo';
$string['app_lv_ex_sent'] = 'Billete entregado';
$string['app_lv_ex_sent_text'] = 'Enséñalo al salir. Puedes cambiarlo mientras esté abierto.';
$string['app_lv_ex_show_answers'] = 'Ver las respuestas';
$string['app_lv_ex_title'] = 'Billete de salida';
$string['app_lv_ex_total_many'] = '{$a} billetes';
$string['app_lv_ex_total_one'] = '{$a} billete';
$string['app_lv_ex_veil'] = 'Las respuestas no se ven hasta que pulses «Ver las respuestas»: revísalas antes de proyectarlas.';
$string['app_lv_ex_wait'] = 'Mira la pizarra: ya viene el billete.';
$string['app_lv_failed'] = 'El sitio no contesta. Lo intento otra vez…';
$string['app_lv_first'] = '¡{$a} ha pulsado primero!';
$string['app_lv_full'] = 'La sesión está llena.';
$string['app_lv_go'] = '¡Ya!';
$string['app_lv_green'] = 'Lo entiendo';
$string['app_lv_hand_less'] = '{$a}: una mano menos';
$string['app_lv_hand_more'] = '{$a}: una mano más';
$string['app_lv_hands_many'] = '{$a} manos';
$string['app_lv_hands_one'] = '{$a} mano';
$string['app_lv_hands_reset'] = 'Poner a cero';
$string['app_lv_hidden'] = 'Anónimo con su usuario';
$string['app_lv_hidden_hint'] = 'Entran solo los alumnos de este curso, una vez cada uno, pero nadie ve quién ha contestado qué: cada uno es un bichito con nombre.';
$string['app_lv_hidden_short'] = 'Solo alumnos del curso, sin nombres: bichitos';
$string['app_lv_how'] = '¿Cómo entran?';
$string['app_lv_idea_done'] = 'Enviado. ¡Mira la pizarra!';
$string['app_lv_idea_left_many'] = 'Puedes enviar {$a} más';
$string['app_lv_idea_left_one'] = 'Puedes enviar 1 más';
$string['app_lv_idea_ph'] = 'Una o dos palabras';
$string['app_lv_idea_remove'] = 'Quitar «{$a}»';
$string['app_lv_idea_send'] = 'Enviar';
$string['app_lv_idea_yours'] = 'Tus respuestas';
$string['app_lv_in_many'] = '{$a} dispositivos dentro';
$string['app_lv_in_one'] = '{$a} dispositivo dentro';
$string['app_lv_intro_buzz'] = 'Cada tableta pulsa por su equipo: la pizarra enseña quién fue el primero, por centésimas.';
$string['app_lv_intro_hands'] = 'Cuenta con + y − las manos levantadas de cada respuesta.';
$string['app_lv_intro_ideas'] = 'Cada uno escribe una o dos palabras desde su dispositivo. La pizarra hace con ellas una nube viva que puedes destacar, juntar, ordenar y llevar a una plantilla.';
$string['app_lv_intro_quiz'] = 'Preguntas con una respuesta buena: contestan desde las tabletas, la pizarra la destapa y cuenta los puntos.';
$string['app_lv_intro_remote'] = 'Tu móvil como mando: arranca el temporizador, elige a un alumno o cambia de herramienta desde cualquier sitio del aula.';
$string['app_lv_intro_vote'] = 'La clase contesta desde sus tabletas u ordenadores, y la pizarra cuenta los votos.';
$string['app_lv_join_title'] = 'Entra en la clase';
$string['app_lv_joined'] = 'Ya estás dentro.';
$string['app_lv_kick'] = 'Sacar a {$a} de la sesión';
$string['app_lv_kicked'] = 'El profe ha sacado este dispositivo de la sesión.';
$string['app_lv_kind_buzz'] = 'Pulsadores';
$string['app_lv_kind_exit'] = 'Billete de salida';
$string['app_lv_kind_hands'] = 'A mano alzada o con tarjetas';
$string['app_lv_kind_ideas'] = 'Lluvia de ideas';
$string['app_lv_kind_quiz'] = 'Concurso';
$string['app_lv_kind_remote'] = 'Mando';
$string['app_lv_kind_vote'] = 'Votación';
$string['app_lv_left'] = 'Quedan {$a}';
$string['app_lv_limit'] = 'Cierre automático';
$string['app_lv_limit_m'] = 'Se cierra a los {$a} minutos';
$string['app_lv_limit_m1'] = 'Se cierra al minuto';
$string['app_lv_limit_none'] = 'Sin límite de tiempo';
$string['app_lv_limit_s'] = 'Se cierra a los {$a} segundos';
$string['app_lv_moodle'] = 'Con su usuario';
$string['app_lv_moodle_hint'] = 'Entran los alumnos de este curso con su usuario, y la pizarra enseña sus nombres.';
$string['app_lv_moodle_short'] = 'Solo alumnos del curso; se ven sus nombres';
$string['app_lv_next_round'] = 'Otra ronda';
$string['app_lv_no'] = 'No';
$string['app_lv_no_session'] = 'No hay ninguna sesión abierta con ese código.';
$string['app_lv_nobody'] = 'Nadie ha pulsado todavía…';
$string['app_lv_offline'] = 'Sin conexión. Lo intento otra vez…';
$string['app_lv_open_round'] = 'Abrir los pulsadores';
$string['app_lv_open_vote'] = 'Abrir la votación';
$string['app_lv_opened'] = 'Sesión abierta. El código es {$a}.';
$string['app_lv_others_many'] = 'Hay otras {$a} sesiones en vivo abiertas en el sitio: las respuestas pueden tardar un poco más.';
$string['app_lv_others_one'] = 'Hay otra sesión en vivo abierta en el sitio: las respuestas pueden tardar un poco más.';
$string['app_lv_pick_team'] = '¿Cuál es tu equipo?';
$string['app_lv_place_1'] = '¡El primero!';
$string['app_lv_place_n'] = 'El {$a}.º';
$string['app_lv_question_n'] = 'Pregunta {$a}';
$string['app_lv_question_ph'] = 'Pregunta (opcional)';
$string['app_lv_quiz_none'] = 'No contestaste';
$string['app_lv_quiz_rank'] = 'Puesto {$a}';
$string['app_lv_quiz_right'] = '¡Correcto!';
$string['app_lv_quiz_sent'] = '¡Respuesta enviada!';
$string['app_lv_quiz_teamrank'] = 'Tu equipo: puesto {$a}';
$string['app_lv_quiz_time'] = 'Se acabó el tiempo';
$string['app_lv_quiz_total'] = 'Llevas {$a} puntos';
$string['app_lv_quiz_wait'] = 'Espera a la primera pregunta';
$string['app_lv_quiz_wait_reveal'] = 'Mira la pizarra';
$string['app_lv_quiz_was'] = 'La buena era';
$string['app_lv_quiz_wrong'] = 'No era esa';
$string['app_lv_quiz_yours'] = 'Tu respuesta';
$string['app_lv_red'] = 'No lo entiendo';
$string['app_lv_remote_help'] = 'Funciona en cualquier herramienta, también al presentar.';
$string['app_lv_remote_hint'] = 'Luego abre la dirección o el QR en tu móvil, con tu usuario.';
$string['app_lv_remote_ok'] = 'Móvil conectado';
$string['app_lv_remote_title'] = 'Mando de la pizarra';
$string['app_lv_remote_waiting'] = 'Esperando a tu móvil…';
$string['app_lv_sent'] = 'enviado';
$string['app_lv_short_buzz'] = 'Por equipos: ¿quién pulsa antes?';
$string['app_lv_short_exit'] = 'Al acabar la clase: cómo lo llevan y qué han aprendido';
$string['app_lv_short_hands'] = 'Sin dispositivos: manos o tarjetas impresas, y cuentas tú';
$string['app_lv_short_ideas'] = 'Escriben una o dos palabras: una nube viva';
$string['app_lv_short_quiz'] = 'Preguntas con puntos, cada uno o por equipos';
$string['app_lv_short_remote'] = 'Tu móvil maneja la pizarra';
$string['app_lv_short_vote'] = 'Contestan A, B, C, D, sí o no desde su tableta';
$string['app_lv_show'] = 'Enseñar los resultados en las tabletas';
$string['app_lv_start'] = 'Abrir la sesión';
$string['app_lv_step_anon'] = 'No necesitan cuenta.';
$string['app_lv_step_login'] = 'Si les pide entrar, con su usuario del aula.';
$string['app_lv_step_notice'] = 'En el curso les sale un aviso con «Entrar».';
$string['app_lv_step_qr'] = 'O escanean el QR con la tableta.';
$string['app_lv_step_url'] = 'O abren {$a} (ya lleva el código; tócalo para copiarlo).';
$string['app_lv_team_n'] = 'Equipo {$a}';
$string['app_lv_teams'] = 'Equipos';
$string['app_lv_type_code'] = 'Escribe el código de la pizarra';
$string['app_lv_v_abcd'] = 'A, B, C, D';
$string['app_lv_v_custom'] = 'Mis respuestas';
$string['app_lv_v_five'] = 'Del 1 al 5';
$string['app_lv_v_light'] = 'Semáforo: lo entiendo, más o menos, no lo entiendo';
$string['app_lv_v_yesno'] = 'Sí o no';
$string['app_lv_votes_many'] = '{$a} votos';
$string['app_lv_votes_one'] = '{$a} voto';
$string['app_lv_wait_open'] = 'Cuando estén todos dentro, abre la votación.';
$string['app_lv_wait_question'] = 'Mira la pizarra: ya viene la pregunta.';
$string['app_lv_wait_round'] = 'Preparados…';
$string['app_lv_wait_round_board'] = 'Cuando los equipos estén listos, abre los pulsadores.';
$string['app_lv_what'] = '¿Qué hacemos?';
$string['app_lv_yellow'] = 'Más o menos';
$string['app_lv_yes'] = 'Sí';
$string['app_lv_you_anon'] = 'Participas sin cuenta: nadie ve tu nombre.';
$string['app_lv_you_hidden'] = 'Participas de forma anónima: tu profesor no ve tu nombre.';
$string['app_lv_your_answer'] = 'Tu respuesta: {$a}';
$string['app_me_all_levels'] = 'Todos los niveles';
$string['app_me_card'] = 'Carta {$a}';
$string['app_me_done'] = '¡Todas! En {$a} intentos';
$string['app_me_faces'] = 'Caras y nombres: {$a}';
$string['app_me_few'] = 'Hacen falta al menos dos parejas.';
$string['app_me_found'] = '{$a->a} de {$a->b} parejas';
$string['app_me_found_trios'] = '{$a->a} de {$a->b} tríos';
$string['app_me_from_bank'] = 'Banco de preguntas (emparejamiento)';
$string['app_me_level'] = 'Nivel';
$string['app_me_level_early'] = 'Infantil';
$string['app_me_level_higher'] = 'Universidad y superior';
$string['app_me_level_primary'] = 'Primaria';
$string['app_me_level_secondary'] = 'Secundaria';
$string['app_me_level_upper'] = 'Bachillerato';
$string['app_me_limit'] = 'Contra los intentos';
$string['app_me_lost'] = 'Se acabaron los intentos: {$a->a} de {$a->b} encontradas';
$string['app_me_moves_many'] = '{$a} intentos';
$string['app_me_moves_one'] = '{$a} intento';
$string['app_me_own'] = 'Tus listas';
$string['app_me_pairs'] = 'Parejas';
$string['app_me_peek'] = 'Un vistazo al empezar';
$string['app_me_peek_none'] = 'No';
$string['app_me_peek_s'] = '{$a} segundos';
$string['app_me_peeking'] = 'Mírenlas bien…';
$string['app_me_press_start'] = 'Elige qué emparejar y pulsa «Repartir»';
$string['app_me_set_animals'] = 'Un animal y su sombra';
$string['app_me_set_clock'] = 'La hora: reloj y digital';
$string['app_me_set_colours'] = 'Un color y su nombre';
$string['app_me_set_constants'] = 'Constantes físicas';
$string['app_me_set_derivatives'] = 'Derivadas';
$string['app_me_set_dots'] = 'Puntos y números';
$string['app_me_set_elements'] = 'Elementos químicos: símbolo y nombre';
$string['app_me_set_equations'] = 'Ecuaciones y su solución';
$string['app_me_set_fgroups'] = 'Grupos funcionales';
$string['app_me_set_formulas'] = 'Fórmulas químicas';
$string['app_me_set_fractions'] = 'Fracciones';
$string['app_me_set_graphs'] = 'Funciones y sus gráficas';
$string['app_me_set_greek'] = 'Letras griegas';
$string['app_me_set_integrals'] = 'Integrales inmediatas';
$string['app_me_set_laws'] = 'Leyes de la física';
$string['app_me_set_letters'] = 'Mayúscula y minúscula';
$string['app_me_set_numbers'] = 'Un número y su nombre';
$string['app_me_set_opposites'] = 'Contrarios';
$string['app_me_set_prefixes'] = 'Prefijos y potencias de 10';
$string['app_me_set_shapes'] = 'Formas y colores';
$string['app_me_set_times'] = 'Tablas de multiplicar';
$string['app_me_set_units'] = 'Magnitudes y unidades';
$string['app_me_start'] = 'Repartir';
$string['app_me_students'] = 'Alumnos';
$string['app_me_team'] = 'Equipo {$a}';
$string['app_me_tie'] = '¡Empate!';
$string['app_me_tries_left'] = 'Quedan {$a} intentos';
$string['app_me_tries_one'] = 'Queda 1 intento';
$string['app_me_trios'] = 'Tríos: tres cartas que van juntas';
$string['app_me_turn'] = 'Le toca a {$a}';
$string['app_me_two_teams'] = 'Dos equipos';
$string['app_me_what'] = 'Qué emparejar';
$string['app_me_who'] = '¿Quién juega?';
$string['app_me_whole_class'] = 'Toda la clase';
$string['app_me_winner'] = '¡Gana {$a}!';
$string['app_mode_advanced'] = 'Superior';
$string['app_mode_advanced_hint'] = 'Bachillerato y universidad: todo a tope';
$string['app_mode_early'] = 'Infantil';
$string['app_mode_early_hint'] = 'De 3 a 6 años: más grande y con más ayudas';
$string['app_mode_primary'] = 'Primaria';
$string['app_mode_primary_hint'] = 'De 6 a 12 años';
$string['app_mode_secondary'] = 'Secundaria';
$string['app_mode_secondary_hint'] = 'De 12 a 16 años: más sobrio';
$string['app_mq_button'] = 'Música';
$string['app_mq_count'] = 'Cuántas preguntas';
$string['app_mq_hard'] = 'Más difícil';
$string['app_mq_hint'] = 'Las preguntas se hacen solas; al abrir cada una, la pizarra la toca, y «Otra vez» la repite. El concurso se queda con los demás, para editarlo o jugarlo otra vez.';
$string['app_mq_kind_melody'] = 'Dictado melódico';
$string['app_mq_kind_rhythm'] = 'Dictado rítmico';
$string['app_mq_kind_song'] = '¿Qué canción es?';
$string['app_mq_make'] = 'Crear el concurso';
$string['app_mq_no_songs'] = 'La partitura necesita al menos cuatro canciones con título.';
$string['app_mq_q_melody'] = '¿Qué notas han sonado? (empieza en {$a})';
$string['app_mq_q_rhythm'] = '¿Qué ritmo ha sonado?';
$string['app_mq_q_song'] = '¿Qué canción es?';
$string['app_mq_replay'] = 'Otra vez';
$string['app_mq_set_melody'] = 'Música: dictado melódico';
$string['app_mq_set_rhythm'] = 'Música: dictado rítmico';
$string['app_mq_set_song'] = 'Música: ¿qué canción es?';
$string['app_mq_syl_rest'] = 'silencio';
$string['app_mq_syl_ta'] = 'ta';
$string['app_mq_syl_taa'] = 'ta-a';
$string['app_mq_syl_tiri'] = 'ti-ri-ti-ri';
$string['app_mq_syl_titi'] = 'ti-ti';
$string['app_mq_title'] = 'Preguntas de música';
$string['app_mq_what_melody'] = 'Unas notas que empiezan en do, y cuatro maneras de escribirlas.';
$string['app_mq_what_rhythm'] = 'Un compás de palmas, y cuatro ritmos escritos con ta, ti-ti, ta-a, ti-ri-ti-ri y el silencio.';
$string['app_mq_what_song'] = 'El principio de una canción de la partitura, y cuatro títulos para elegir.';
$string['app_mt_balance'] = 'Balanza';
$string['app_mt_base10'] = 'Bloques de base 10';
$string['app_mt_calc'] = 'Calculadora';
$string['app_mt_clear'] = 'Quitar todas';
$string['app_mt_clear_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_mt_cols'] = '{$a} columnas';
$string['app_mt_done'] = '¡Conseguido!';
$string['app_mt_fig_boat'] = 'Barco';
$string['app_mt_fig_cat'] = 'Gato';
$string['app_mt_fig_done'] = 'Han hecho «{$a}» con las siete piezas.';
$string['app_mt_fig_fish'] = 'Pez';
$string['app_mt_fig_hexagon'] = 'Hexágono {$a}';
$string['app_mt_fig_house'] = 'Casa';
$string['app_mt_fig_pentagon'] = 'Pentágono {$a}';
$string['app_mt_fig_rectangle'] = 'Rectángulo';
$string['app_mt_fig_rhomboid'] = 'Romboide';
$string['app_mt_fig_right_trapezium'] = 'Trapecio rectángulo {$a}';
$string['app_mt_fig_sailboat'] = 'Velero';
$string['app_mt_fig_square'] = 'Cuadrado';
$string['app_mt_fig_trapezium'] = 'Trapecio';
$string['app_mt_fig_triangle'] = 'Triángulo';
$string['app_mt_figure'] = 'Figura';
$string['app_mt_flip'] = 'Voltear';
$string['app_mt_fractions'] = 'Muro de fracciones';
$string['app_mt_free'] = 'Libre, sin figura';
$string['app_mt_geoboard'] = 'Geoplano';
$string['app_mt_group_figures'] = 'Dibujos';
$string['app_mt_group_shapes'] = 'Formas geométricas';
$string['app_mt_guides'] = 'Líneas guía';
$string['app_mt_line'] = 'Recta numérica';
$string['app_mt_next_figure'] = 'Otra figura';
$string['app_mt_numbers'] = 'Ver los números';
$string['app_mt_numbers_a'] = 'Números en la mesa A';
$string['app_mt_numbers_b'] = 'Números en la mesa B';
$string['app_mt_piece'] = 'Pieza del tangram';
$string['app_mt_plane'] = 'Plano de coordenadas';
$string['app_mt_reset'] = 'Colocar de nuevo';
$string['app_mt_rod'] = 'Regleta del {$a}';
$string['app_mt_rods'] = 'Regletas';
$string['app_mt_rods_help'] = 'Arrastra regletas de la escalera a la mesa. Para girar una, tócala dos veces. Para quitarla, devuélvela a la escalera.';
$string['app_mt_score'] = 'Partitura';
$string['app_mt_size'] = 'Tamaño de la mesa';
$string['app_mt_solids'] = 'Cuerpos geométricos';
$string['app_mt_tangram'] = 'Tangram';
$string['app_mt_tangram_help'] = 'Arrastra las piezas. Para girar una, tócala dos veces o pulsa «Girar». El paralelogramo se voltea con «Voltear». Las piezas se imantan al acercarlas.';
$string['app_mt_timeline'] = 'Línea del tiempo';
$string['app_mt_turn'] = 'Girar';
$string['app_mt_two'] = 'Comparar: dos mesas';
$string['app_mt_what'] = 'Material';
$string['app_nl_clear'] = 'Borrar';
$string['app_nl_help'] = 'Toca un punto para empezar y luego donde cae cada salto. Toca otra vez el punto para empezar en otro sitio.';
$string['app_nl_help_hidden'] = 'Toca un número escondido para descubrirlo (y otra vez para esconderlo). Los saltos funcionan igual.';
$string['app_nl_hide'] = 'Esconder los números';
$string['app_nl_kind_intervals'] = 'Intervalos';
$string['app_nl_kind_jumps'] = 'Saltos';
$string['app_nl_now_jump'] = 'Ahora toca donde cae el salto';
$string['app_nl_numbers'] = 'Números';
$string['app_nl_p_custom'] = 'A mi manera';
$string['app_nl_p_halves'] = 'Medios, del 0 al 3';
$string['app_nl_p_negative'] = 'Del −10 al 10';
$string['app_nl_p_negquarters'] = 'Cuartos, del −2 al 2';
$string['app_nl_p_quarters'] = 'Cuartos, del 0 al 2';
$string['app_nl_p_tenths'] = 'Décimas, del 0 al 1';
$string['app_nl_p_thirds'] = 'Tercios, del 0 al 2';
$string['app_nl_p_to10'] = 'Del 0 al 10';
$string['app_nl_p_to100'] = 'Del 0 al 100';
$string['app_nl_p_to1000'] = 'Del 0 al 1000, de 10 en 10';
$string['app_nl_p_to20'] = 'Del 0 al 20';
$string['app_nl_start'] = 'Toca la recta donde empezamos';
$string['app_nl_starts'] = 'Empezamos en el {$a}';
$string['app_nl_step'] = 'De … en …';
$string['app_nl_undo'] = 'Deshacer';
$string['app_ord_done'] = '¡Todo en orden!';
$string['app_ord_name'] = 'Ordenar';
$string['app_ord_place'] = 'Toca las tarjetas en su orden';
$string['app_ord_right'] = '{$a->n} de {$a->of} en su sitio';
$string['app_pl_add'] = 'Poner';
$string['app_pl_again'] = '{$a} ya se había dicho';
$string['app_pl_all_sunk'] = 'Toda la flota hundida';
$string['app_pl_bad'] = 'Dos números enteros entre {$a->a} y {$a->b}, como (3, 2)';
$string['app_pl_call'] = 'El punto que dicen';
$string['app_pl_empty'] = 'Borrar los puntos';
$string['app_pl_fire'] = 'Disparar';
$string['app_pl_fleet'] = 'Hundir la flota';
$string['app_pl_fleet_help'] = 'Hay una flota de siete barcos escondida en los cruces. Cada equipo, en su turno, dice un punto, y se toca o se escribe: agua, tocado o hundido. Quien toca vuelve a disparar.';
$string['app_pl_help'] = 'Toca un cruce para poner un punto (A, B, C…) y tócalo otra vez para quitarlo, o escribe sus coordenadas: primero la x, en horizontal, y después la y, en vertical.';
$string['app_pl_hide'] = 'Esconder las coordenadas';
$string['app_pl_hit'] = '{$a}: ¡tocado! Otro disparo';
$string['app_pl_join'] = 'Los puntos';
$string['app_pl_join_line'] = 'Unidos en una línea';
$string['app_pl_join_none'] = 'Sueltos';
$string['app_pl_join_shape'] = 'Formando una figura';
$string['app_pl_join_vectors'] = 'Como vectores, uno tras otro';
$string['app_pl_left'] = 'Barcos a flote: {$a}';
$string['app_pl_new_fleet'] = 'Flota nueva';
$string['app_pl_points'] = 'Puntos';
$string['app_pl_quad_four'] = 'Los cuatro';
$string['app_pl_quad_one'] = 'El primero';
$string['app_pl_quadrants'] = 'Cuadrantes';
$string['app_pl_show_fleet'] = 'Enseñar la flota';
$string['app_pl_sunk'] = '{$a}: ¡tocado y hundido! Otro disparo';
$string['app_pl_team'] = 'Equipo {$a}';
$string['app_pl_teams'] = 'Equipos';
$string['app_pl_turn'] = 'Turno del equipo {$a}';
$string['app_pl_type'] = 'Poner un punto';
$string['app_pl_water'] = '{$a}: agua';
$string['app_q_absent'] = '¿Quién falta hoy?';
$string['app_q_absent_n'] = 'Faltan hoy: {$a}';
$string['app_q_absent_n_sr'] = 'Faltan hoy {$a}';
$string['app_q_absent_note'] = 'Toca a quien no ha venido: ese día no le toca ni entra en los grupos. Mañana vuelven todos.';
$string['app_q_all_absent'] = 'Hoy faltan todos los de esta lista.';
$string['app_q_all_here'] = 'Han venido todos';
$string['app_q_all_out'] = 'Ya han salido todos. Pulsa «Empezar de nuevo».';
$string['app_q_already'] = 'Ya han salido';
$string['app_q_count'] = '{$a->a} de {$a->b}';
$string['app_q_create_list'] = 'Crear una lista';
$string['app_q_edit'] = 'Editar';
$string['app_q_empty'] = 'Pega la lista de tu clase para empezar';
$string['app_q_empty_note'] = 'Cada lista se guarda solo en este ordenador.';
$string['app_q_fair'] = 'Primero los que menos';
$string['app_q_fair_hint'] = 'Sale alguien de entre los que menos veces han salido estas semanas';
$string['app_q_left'] = 'Quedan {$a}';
$string['app_q_list'] = 'Lista';
$string['app_q_me_name'] = '{$a} (profe)';
$string['app_q_no_lists'] = '(todavía no hay listas)';
$string['app_q_no_repeat'] = 'Sin repetir';
$string['app_q_no_students'] = 'Esta lista no tiene alumnos.';
$string['app_q_none_yet'] = 'Todavía nadie.';
$string['app_q_participation'] = 'Participación';
$string['app_q_participation_note'] = 'Veces que le ha tocado a cada uno en los últimos {$a} días, con cualquier profesor de este curso. Arriba, quien menos.';
$string['app_q_pick'] = 'Elegir';
$string['app_q_ready'] = '{$a->count} en «{$a->list}». Pulsa «Elegir».';
$string['app_q_restart'] = 'Empezar de nuevo';
$string['app_q_shuffling'] = 'Barajando…';
$string['app_q_students'] = '{$a} alumnos';
$string['app_q_students_absent'] = '{$a->n} alumnos (faltan {$a->m})';
$string['app_q_this_course'] = 'Este curso';
$string['app_q_turn'] = 'Le toca a {$a}';
$string['app_q_with_me'] = 'El profe también juega';
$string['app_q_your_lists'] = 'Tus listas';
$string['app_qr_big_image'] = 'Esa imagen es muy grande: elige una de menos de 300 KB.';
$string['app_qr_black'] = 'Negro';
$string['app_qr_blue'] = 'Azul';
$string['app_qr_choose'] = 'Elegir imagen';
$string['app_qr_circles'] = 'Círculos';
$string['app_qr_colour'] = 'Color';
$string['app_qr_empty'] = 'Escribe o pega un enlace y aquí saldrá su código.';
$string['app_qr_enlarge'] = 'Ampliar';
$string['app_qr_erase'] = 'Borrar';
$string['app_qr_eye_colour'] = 'Color de las esquinas';
$string['app_qr_eyes'] = 'Esquinas';
$string['app_qr_eyes_rounded'] = 'Redondeadas';
$string['app_qr_eyes_square'] = 'Cuadradas';
$string['app_qr_green'] = 'Verde';
$string['app_qr_label'] = 'Código QR de: {$a}';
$string['app_qr_logo'] = 'Logo en el centro';
$string['app_qr_modules'] = 'Puntos';
$string['app_qr_modules_rounded'] = 'Redondeados';
$string['app_qr_modules_square'] = 'Cuadrados';
$string['app_qr_my_image'] = 'Una imagen mía';
$string['app_qr_no_lib'] = 'No se ha podido cargar el generador de QR.';
$string['app_qr_no_logo'] = 'Sin logo';
$string['app_qr_note'] = 'El código se crea aquí mismo, sin conexión. Con logo, el código lleva más corrección de errores para que se siga leyendo.';
$string['app_qr_placeholder'] = 'Pega aquí un enlace o escribe un texto';
$string['app_qr_png'] = 'Descargar PNG';
$string['app_qr_purple'] = 'Morado';
$string['app_qr_red'] = 'Rojo';
$string['app_qr_same'] = 'Igual';
$string['app_qr_saved'] = 'Descargado: {$a}';
$string['app_qr_site_logo'] = 'El del sitio';
$string['app_qr_svg'] = 'Descargar SVG';
$string['app_qr_teal'] = 'Petróleo';
$string['app_qr_terracotta'] = 'Teja';
$string['app_qr_text'] = 'Texto o enlace';
$string['app_qr_too_long'] = 'Es demasiado largo para un código QR. Acórtalo un poco.';
$string['app_qz_add_q'] = 'Añadir la pregunta';
$string['app_qz_after'] = 'Después de cada pregunta';
$string['app_qz_and_more'] = 'y {$a} más';
$string['app_qz_answer'] = 'Respuesta';
$string['app_qz_answer_optional'] = 'Respuesta (si quieres)';
$string['app_qz_bank'] = 'Del banco de preguntas';
$string['app_qz_bank_add'] = 'Añadir las marcadas al juego';
$string['app_qz_bank_category'] = 'Categoría';
$string['app_qz_bank_empty'] = 'Este curso no tiene bancos con preguntas que puedas usar.';
$string['app_qz_bank_error'] = 'No se ha podido leer el banco de preguntas.';
$string['app_qz_bank_loading'] = 'Buscando…';
$string['app_qz_bank_none'] = 'Ninguna pregunta de esta categoría sirve (opción múltiple con una respuesta, o verdadero/falso).';
$string['app_qz_bank_skipped'] = 'Quedan fuera {$a}: varias respuestas buenas, más de cuatro respuestas o sin texto.';
$string['app_qz_bank_title'] = 'Preguntas del banco de preguntas';
$string['app_qz_by_student'] = 'Por alumno';
$string['app_qz_del_q'] = 'Borrar la pregunta';
$string['app_qz_del_set'] = 'Borrar este juego';
$string['app_qz_del_set_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_qz_devtext'] = 'La pregunta y sus respuestas en las tabletas';
$string['app_qz_done'] = 'Listo';
$string['app_qz_edit'] = 'Editar las preguntas';
$string['app_qz_edit_q'] = 'Editar la pregunta';
$string['app_qz_edit_title'] = 'Preguntas del juego';
$string['app_qz_empty'] = 'Elige un juego con preguntas, o escribe uno.';
$string['app_qz_end'] = 'Podio al final';
$string['app_qz_ex_o1'] = 'Siete|Cinco|Diez|Seis';
$string['app_qz_ex_o2'] = 'Verdadero|Falso';
$string['app_qz_ex_o3'] = 'Delfín|Tiburón|Trucha';
$string['app_qz_ex_q1'] = '¿Cuántos días tiene una semana?';
$string['app_qz_ex_q2'] = 'El agua se congela a 0 °C.';
$string['app_qz_ex_q3'] = '¿Cuál es un mamífero?';
$string['app_qz_example'] = 'Ejemplo';
$string['app_qz_false'] = 'Falso';
$string['app_qz_first'] = 'Primer puesto';
$string['app_qz_first_tie'] = 'Empate en el primer puesto';
$string['app_qz_hits'] = 'Aciertos';
$string['app_qz_img'] = 'Esta pregunta tiene imagen';
$string['app_qz_img_add'] = 'Añadir imagen';
$string['app_qz_img_change'] = 'Cambiar la imagen';
$string['app_qz_img_del'] = 'Quitar la imagen';
$string['app_qz_img_error'] = 'No se pudo guardar la imagen: prueba con otra (PNG o JPG).';
$string['app_qz_img_hint'] = 'O pégala (Ctrl+V). Sale en la pizarra, junto a las respuestas.';
$string['app_qz_img_sending'] = 'Guardando la imagen…';
$string['app_qz_kind_choice'] = 'De 2 a 4 respuestas';
$string['app_qz_kind_tf'] = 'Verdadero o falso';
$string['app_qz_lobby'] = '{$a->n} preguntas · {$a->m} dentro';
$string['app_qz_mode_calm'] = 'Tranquilo';
$string['app_qz_mode_fast'] = 'Rápido';
$string['app_qz_mode_hint_calm'] = 'Tranquilo: cada acierto vale 1000 puntos, llegue cuando llegue.';
$string['app_qz_mode_hint_fast'] = 'Rápido: un acierto vale de 500 a 1000 puntos, más cuanto antes llegue.';
$string['app_qz_need'] = 'Escribe la pregunta y al menos dos respuestas, y marca la buena.';
$string['app_qz_new'] = 'Nuevo juego';
$string['app_qz_new_name'] = 'Juego {$a}';
$string['app_qz_next'] = 'Siguiente pregunta';
$string['app_qz_nteams'] = 'Equipos';
$string['app_qz_paste'] = 'Pegar varias preguntas o pedírselas a una IA';
$string['app_qz_paste_go'] = 'Añadirlas';
$string['app_qz_paste_hint'] = 'Una por línea: la pregunta y luego las respuestas separadas por |, con * delante de la buena. Para verdadero o falso, V o F después de la pregunta.';
$string['app_qz_paste_none'] = 'No se ha podido leer ninguna pregunta: revisa las | y el *.';
$string['app_qz_paste_ph'] = '¿Capital de Italia? | *Roma | Milán | Nápoles
El Sol es una estrella | V';
$string['app_qz_podium'] = 'Podio';
$string['app_qz_points'] = 'Modo';
$string['app_qz_points_col'] = 'Puntos';
$string['app_qz_q_n'] = 'Pregunta {$a->n} de {$a->of}';
$string['app_qz_q_ph'] = 'La pregunta';
$string['app_qz_question'] = 'Pregunta';
$string['app_qz_ranking'] = 'Clasificación';
$string['app_qz_ready'] = '{$a} preguntas. Abre la sesión cuando estén listos.';
$string['app_qz_results'] = 'Resultados';
$string['app_qz_results_note'] = 'Esto solo lo ves tú; no va al calificador.';
$string['app_qz_reveal'] = 'Destapar la respuesta';
$string['app_qz_right'] = 'La buena';
$string['app_qz_right_col'] = 'Aciertos';
$string['app_qz_save_q'] = 'Guardar la pregunta';
$string['app_qz_secs'] = 'Tiempo por pregunta';
$string['app_qz_secs_default'] = 'El del concurso';
$string['app_qz_secs_n'] = '{$a} segundos';
$string['app_qz_set'] = 'Juego de preguntas';
$string['app_qz_set_name'] = 'Nombre del juego';
$string['app_qz_start'] = 'Empezar el concurso';
$string['app_qz_student'] = 'Alumno';
$string['app_qz_teams'] = 'Equipos';
$string['app_qz_teams_groups'] = 'Los {$a} grupos hechos';
$string['app_qz_teams_groups_hint'] = 'Los grupos de «Grupos» son los equipos; quien no está en ninguno elige en la tableta.';
$string['app_qz_teams_none'] = 'Cada uno';
$string['app_qz_teams_none_hint'] = 'Cada uno juega por su cuenta.';
$string['app_qz_teams_pick'] = 'Eligen ellos';
$string['app_qz_teams_pick_hint'] = 'Cada uno elige equipo en la tableta; los equipos cuentan su media.';
$string['app_qz_tie_n'] = '{$a} empatados';
$string['app_qz_to_podium'] = 'Ver el podio';
$string['app_qz_to_ranking'] = 'Ver la clasificación';
$string['app_qz_to_results'] = 'Ver los resultados';
$string['app_qz_top'] = 'Enseñar';
$string['app_qz_top_all'] = 'A todos';
$string['app_qz_top_n'] = 'Solo los {$a} primeros';
$string['app_qz_true'] = 'Verdadero';
$string['app_rl_build'] = 'Montar';
$string['app_rl_clarify'] = 'Aclarar';
$string['app_rl_dance'] = 'Coreografía';
$string['app_rl_flute'] = 'Flauta';
$string['app_rl_glockenspiel'] = 'Carillón';
$string['app_rl_materials'] = 'Material';
$string['app_rl_measure'] = 'Medir';
$string['app_rl_notes'] = 'Apuntes';
$string['app_rl_photo'] = 'Fotografiar';
$string['app_rl_predict'] = 'Predecir';
$string['app_rl_question'] = 'Preguntar';
$string['app_rl_record'] = 'Anotar';
$string['app_rl_spokesperson'] = 'Portavoz';
$string['app_rl_summarise'] = 'Resumir';
$string['app_rl_tambourine'] = 'Pandero';
$string['app_rl_time'] = 'Tiempo';
$string['app_rm_closed'] = 'Esa pizarra ya no está abierta.';
$string['app_rm_cmd_curtain'] = 'Cortina';
$string['app_rm_cmd_live'] = 'Abrir o cerrar (En vivo)';
$string['app_rm_cmd_next'] = 'Siguiente pregunta';
$string['app_rm_cmd_relay'] = 'Relevos sí o no';
$string['app_rm_cmd_reveal'] = 'Destapar un poco';
$string['app_rm_cmd_turn'] = 'Elegir a alguien aquí';
$string['app_rm_copied'] = 'Dirección copiada.';
$string['app_rm_copy'] = 'Copiar la dirección';
$string['app_rm_course'] = 'Cambiar de clase';
$string['app_rm_course_going'] = 'La pizarra pasa a {$a}';
$string['app_rm_course_hint'] = 'La pizarra abierta pasa a la clase que elijas.';
$string['app_rm_course_none'] = 'No tienes otra clase con la pizarra.';
$string['app_rm_how'] = 'Escanea el código con el móvil y guárdalo en su pantalla de inicio: la dirección es siempre la misma.';
$string['app_rm_intro'] = 'Una dirección para tu móvil que no cambia y no pide entrar en el aula virtual: ábrela, por ejemplo, desde la pantalla de inicio del móvil, y maneja la pizarra que tengas abierta.';
$string['app_rm_last'] = 'Última orden: {$a}';
$string['app_rm_no_board_text'] = 'Abre la pizarra en el ordenador, en un curso: aparece aquí sola.';
$string['app_rm_no_board_title'] = 'No hay ninguna pizarra abierta';
$string['app_rm_off_text'] = 'Se ha apagado o su dirección ha cambiado. En la pizarra, en «En vivo» y «Mando», está la dirección de ahora.';
$string['app_rm_off_title'] = 'Este mando no está encendido';
$string['app_rm_on_board'] = 'En la pizarra: {$a}';
$string['app_rm_or_session'] = 'También está el mando con código («Abrir la sesión»), que pide entrar con tu usuario en el móvil.';
$string['app_rm_phone_in'] = 'móvil conectado';
$string['app_rm_phone_waiting'] = 'esperando al móvil';
$string['app_rm_rotate'] = 'Cambiar la dirección';
$string['app_rm_rotate_sure'] = 'La anterior dejará de valer. Pulsa otra vez';
$string['app_rm_scan'] = 'Leer las tarjetas';
$string['app_rm_scan_back'] = 'Volver al mando';
$string['app_rm_scan_card'] = 'tarjeta {$a}';
$string['app_rm_scan_count'] = 'Tarjetas leídas: {$a}';
$string['app_rm_scan_hint'] = 'Apunta a las tarjetas levantadas: cada una se recuadra en el color de su respuesta y pasa a la pizarra.';
$string['app_rm_scan_nocam'] = 'No se puede usar la cámara: dale permiso en el navegador.';
$string['app_rm_title'] = 'Mando fijo';
$string['app_rm_tools'] = 'Ir a una herramienta';
$string['app_rm_turn_off'] = 'Apagar';
$string['app_rm_turn_on'] = 'Encender el mando fijo';
$string['app_rm_waiting_orders'] = 'Esperando órdenes del móvil';
$string['app_rm_warning'] = 'Quien tenga esta dirección puede manejar tu pizarra mientras esté abierta, aunque no ve nada de los alumnos. Si la has compartido sin querer, cámbiala.';
$string['app_rm_which'] = 'Qué pizarra';
$string['app_ro_again'] = 'Volver a jugar';
$string['app_ro_answer'] = 'Respuesta';
$string['app_ro_answer_was'] = 'Era «{$a}»';
$string['app_ro_bad_many'] = '{$a} fallos';
$string['app_ro_bad_one'] = '{$a} fallo';
$string['app_ro_cancel'] = 'Cancelar';
$string['app_ro_change'] = 'Cambiar de rosco';
$string['app_ro_class'] = 'La clase';
$string['app_ro_clue'] = 'Pista';
$string['app_ro_contains'] = 'Contiene la {$a}';
$string['app_ro_copy_example'] = 'Copia del rosco de ejemplo';
$string['app_ro_copy_of'] = '{$a} (copia)';
$string['app_ro_edit'] = 'Editar';
$string['app_ro_edit_title'] = 'Editar el rosco';
$string['app_ro_editor_note'] = 'Deja vacías las letras que no quieras: el rosco se hace con las que tengan pista y respuesta.';
$string['app_ro_example'] = 'Rosco de ejemplo';
$string['app_ro_finish'] = 'Terminar';
$string['app_ro_finished'] = '¡Rosco terminado!';
$string['app_ro_keys'] = 'Teclas: Intro, acierto · Retroceso, fallo · Espacio, pasapalabra';
$string['app_ro_kind'] = 'Tipo';
$string['app_ro_kind_contains'] = 'Contiene';
$string['app_ro_kind_starts'] = 'Empieza';
$string['app_ro_left'] = '{$a} sin contestar';
$string['app_ro_letter'] = 'Letra';
$string['app_ro_min'] = '{$a} min';
$string['app_ro_min_sec'] = '{$a->m} min {$a->s} s';
$string['app_ro_name'] = 'Rosco';
$string['app_ro_need_one'] = 'Escribe al menos una letra con su pista y su respuesta.';
$string['app_ro_new'] = 'Nuevo rosco';
$string['app_ro_no_time'] = 'Sin tiempo';
$string['app_ro_ok_many'] = '{$a} aciertos';
$string['app_ro_ok_one'] = '{$a} acierto';
$string['app_ro_pass'] = 'Pasapalabra';
$string['app_ro_pause'] = 'Pausa';
$string['app_ro_remove'] = 'Borrar el rosco';
$string['app_ro_remove_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_ro_resume'] = 'Seguir';
$string['app_ro_right'] = 'Acierto';
$string['app_ro_save'] = 'Guardar';
$string['app_ro_second'] = 'Rosco del equipo 2';
$string['app_ro_starts'] = 'Empieza por la {$a}';
$string['app_ro_team'] = 'Equipo {$a}';
$string['app_ro_tie'] = '¡Empate!';
$string['app_ro_time'] = 'Tiempo de cada uno';
$string['app_ro_time_up'] = '¡Se acabó el tiempo!';
$string['app_ro_two_teams'] = 'Dos equipos';
$string['app_ro_wheel_name'] = 'Nombre del rosco';
$string['app_ro_who'] = '¿Quién juega?';
$string['app_ro_winner'] = '¡Gana {$a}!';
$string['app_ro_wrong'] = 'Fallo';
$string['app_rs_dice_wait'] = 'Rasca para ver qué ha salido';
$string['app_rs_reveal'] = 'Destapar';
$string['app_rs_scratch'] = 'Rasca';
$string['app_rs_toggle'] = 'Rasca y gana';
$string['app_sc_add_team'] = 'Añadir equipo';
$string['app_sc_again'] = 'Desde el principio';
$string['app_sc_ai_done'] = 'La canción ya está en la partitura: escúchala y revísala antes de tocarla en clase.';
$string['app_sc_clear'] = 'Borrar todo';
$string['app_sc_clear_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_sc_clef'] = 'Clave';
$string['app_sc_clef_fa'] = 'Fa';
$string['app_sc_clef_sol'] = 'Sol';
$string['app_sc_colour'] = 'Cambiar el color';
$string['app_sc_colours'] = 'Colores del carillón';
$string['app_sc_copied'] = 'Copiado: pégalo en tu IA.';
$string['app_sc_copy'] = 'Copiar';
$string['app_sc_copy_of'] = '{$a} (copia)';
$string['app_sc_delete'] = 'Borrar esta canción';
$string['app_sc_delete_confirm'] = 'Toca otra vez para borrarla';
$string['app_sc_dot'] = 'Puntillo';
$string['app_sc_err_empty'] = 'No hay notas que tocar.';
$string['app_sc_err_note'] = '«{$a}» no es una nota: como do, re4, sol:b, fa#:c, o - para un silencio.';
$string['app_sc_err_tempo'] = 'El tempo «{$a}» no se entiende: un número de 30 a 240.';
$string['app_sc_err_time'] = 'El compás «{$a}» no se entiende: usa 2/4, 3/4, 4/4 o 6/8.';
$string['app_sc_export'] = 'Descargar';
$string['app_sc_f_b'] = 'Blanca';
$string['app_sc_f_c'] = 'Corchea';
$string['app_sc_f_n'] = 'Negra';
$string['app_sc_f_r'] = 'Redonda';
$string['app_sc_f_s'] = 'Semicorchea';
$string['app_sc_fast'] = 'rápido';
$string['app_sc_figure'] = 'Figura';
$string['app_sc_flat'] = 'Bemol';
$string['app_sc_from_groups'] = 'Usar los equipos de «Grupos»';
$string['app_sc_from_home'] = 'De {$a}';
$string['app_sc_from_world'] = 'De otros países';
$string['app_sc_game'] = '¿Qué nota es?';
$string['app_sc_game_next'] = 'Otra nota';
$string['app_sc_game_right'] = '¡{$a->name}! Racha: {$a->n}';
$string['app_sc_game_wrong'] = 'Era {$a}';
$string['app_sc_group'] = 'Grupo {$a}';
$string['app_sc_h_clef'] = 'Clave';
$string['app_sc_h_from'] = 'Origen';
$string['app_sc_h_lyrics'] = 'Letra';
$string['app_sc_h_pickup'] = 'Anacrusa';
$string['app_sc_h_tempo'] = 'Tempo';
$string['app_sc_h_time'] = 'Compás';
$string['app_sc_h_title'] = 'Título';
$string['app_sc_import'] = 'Abrir';
$string['app_sc_import_file'] = 'Abrir un archivo';
$string['app_sc_import_go'] = 'Traerla';
$string['app_sc_import_hint'] = 'Pega el texto de una canción o abre un archivo .txt o .abc: escrito a mano, hecho con el prompt para tu IA o en formato ABC (abcnotation.com).';
$string['app_sc_import_ph'] = 'Título: Estrellita
Compás: 4/4
Tempo: 100
do:n do sol sol | la la sol:b';
$string['app_sc_import_title'] = 'Traer una canción';
$string['app_sc_leads'] = 'Va primero: {$a}';
$string['app_sc_listen'] = 'Escuchar';
$string['app_sc_lyrics'] = 'Letra';
$string['app_sc_medium'] = 'andante';
$string['app_sc_metro'] = 'Metrónomo';
$string['app_sc_mine'] = 'Mis canciones';
$string['app_sc_mine_note'] = 'Una de tus canciones, guardada en este curso.';
$string['app_sc_mode'] = 'Qué hacemos';
$string['app_sc_muted'] = 'El sonido está apagado: actívalo con el altavoz de arriba.';
$string['app_sc_name'] = 'Nombre del equipo';
$string['app_sc_names'] = 'Nombres de las notas';
$string['app_sc_naming'] = 'Notación';
$string['app_sc_naming_auto'] = 'Según el idioma ({$a})';
$string['app_sc_naming_german'] = 'C D E … H (alemana)';
$string['app_sc_naming_letters'] = 'C D E (anglosajona)';
$string['app_sc_naming_solfa'] = 'do re mi';
$string['app_sc_new'] = 'Nueva';
$string['app_sc_new_name'] = 'Canción {$a}';
$string['app_sc_no_groups'] = 'Haz antes los equipos en la pestaña «Grupos».';
$string['app_sc_origin'] = 'Procedencia: {$a}';
$string['app_sc_playalong'] = 'Toca conmigo';
$string['app_sc_points_many'] = '{$a} puntos';
$string['app_sc_points_one'] = '{$a} punto';
$string['app_sc_prompt'] = 'Prompt para tu IA';
$string['app_sc_prompt_any'] = 'la canción que quieras';
$string['app_sc_prompt_hint'] = 'Escribe el nombre de la canción. Con la IA de tu Moodle, «Generar» la trae directamente a la partitura; con tu propia IA, copia el texto, pégalo allí y trae lo que conteste con «Abrir».';
$string['app_sc_prompt_song'] = 'Canción';
$string['app_sc_prompt_text'] = 'Escribe la melodía de «{$a}» en el formato de texto de Class tools, para que suene en el carillón del colegio.

Reglas:
1. Empieza con estas líneas (las que hagan falta):
Título: el nombre de la canción
Origen: el país o el autor
Clave: sol (o fa, si es grave)
Compás: 2/4, 3/4, 4/4 o 6/8
Tempo: negras por minuto (por ejemplo, 100)
Anacrusa: lo que duran las notas antes del primer compás, solo si las hay (n, c…)
2. Después, solo la melodía, a una voz, con las notas separadas por espacios y | entre compases.
3. Notas: do re mi fa sol la si. El do central es do4: do5 es una octava más arriba y sol3 una más abajo; sin número, la octava 4. Sostenido con # (fa#), bemol con b (sib).
4. La duración, después de dos puntos, en todas las notas: r redonda, b blanca, n negra, c corchea, s semicorchea; con un punto detrás, con puntillo (sol:n.). Cada compás tiene que sumar lo que dice el compás.
5. Un silencio es - con su duración (-:n).
6. Sin acordes, tresillos, ligaduras ni repeticiones: todo seguido.

Ejemplo:
Título: Estrellita
Origen: Francia
Clave: sol
Compás: 4/4
Tempo: 100
do:n do:n sol:n sol:n | la:n la:n sol:b | fa:n fa:n mi:n mi:n | re:n re:n do:b

Responde solo con el texto, sin explicaciones.';
$string['app_sc_prompt_title'] = 'Una canción con tu IA';
$string['app_sc_remove'] = 'Quitar este equipo';
$string['app_sc_reset'] = 'Poner a cero';
$string['app_sc_reset_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_sc_rest'] = 'Silencio';
$string['app_sc_rhythm'] = 'Ritmo en sílabas (ta, ti-ti) y palmas';
$string['app_sc_sharp'] = 'Sostenido';
$string['app_sc_slow'] = 'lento';
$string['app_sc_song'] = 'Canción';
$string['app_sc_songs'] = 'Canciones';
$string['app_sc_stop'] = 'Parar';
$string['app_sc_team'] = 'Equipo {$a}';
$string['app_sc_teams_many'] = '{$a} equipos';
$string['app_sc_teams_one'] = '{$a} equipo';
$string['app_sc_tempo'] = 'Tempo';
$string['app_sc_tie'] = 'Empate';
$string['app_sc_time'] = 'Compás';
$string['app_sc_untitled'] = 'Sin título';
$string['app_sc_v_bells'] = 'Carillón';
$string['app_sc_v_flute'] = 'Flauta dulce';
$string['app_sc_v_marimba'] = 'Marimba';
$string['app_sc_v_piano'] = 'Piano';
$string['app_sc_voice'] = 'Sonido';
$string['app_sc_well_done'] = '¡Muy bien!';
$string['app_sc_write'] = 'Escribir';
$string['app_sd_clear'] = 'Quitar los colores';
$string['app_sd_count'] = 'Contar';
$string['app_sd_count_edges'] = 'Aristas';
$string['app_sd_count_faces'] = 'Caras';
$string['app_sd_count_vertices'] = 'Vértices';
$string['app_sd_counted_edges'] = '{$a} aristas';
$string['app_sd_counted_faces'] = '{$a} caras';
$string['app_sd_counted_vertices'] = '{$a} vértices';
$string['app_sd_elements'] = 'Caras, aristas y vértices';
$string['app_sd_elements_n'] = '{$a->f} caras, {$a->e} aristas y {$a->v} vértices';
$string['app_sd_euler'] = 'Caras + vértices − aristas: {$a}';
$string['app_sd_fold'] = 'Plegar';
$string['app_sd_group_prisms'] = 'Prismas';
$string['app_sd_group_pyramids'] = 'Pirámides';
$string['app_sd_group_regular'] = 'Poliedros regulares';
$string['app_sd_group_round'] = 'Cuerpos redondos';
$string['app_sd_help'] = 'Arrastra para girarlo; la rueda o dos dedos lo acercan. Toca una cara para pintarla: el color se queda al desplegarlo.';
$string['app_sd_label'] = 'Cuerpo geométrico: arrastra o usa las flechas para girarlo';
$string['app_sd_n_cilindro'] = 'Cilindro';
$string['app_sd_n_cono'] = 'Cono';
$string['app_sd_n_cubo'] = 'Cubo';
$string['app_sd_n_dodecaedro'] = 'Dodecaedro';
$string['app_sd_n_esfera'] = 'Esfera';
$string['app_sd_n_hexaedro'] = 'Cubo (hexaedro)';
$string['app_sd_n_icosaedro'] = 'Icosaedro';
$string['app_sd_n_octaedro'] = 'Octaedro';
$string['app_sd_n_ortoedro'] = 'Ortoedro';
$string['app_sd_n_piramide3'] = 'Pirámide triangular';
$string['app_sd_n_piramide4'] = 'Pirámide cuadrangular';
$string['app_sd_n_piramide5'] = 'Pirámide pentagonal';
$string['app_sd_n_piramide6'] = 'Pirámide hexagonal';
$string['app_sd_n_prisma3'] = 'Prisma triangular';
$string['app_sd_n_prisma5'] = 'Prisma pentagonal';
$string['app_sd_n_prisma6'] = 'Prisma hexagonal';
$string['app_sd_n_tetraedro'] = 'Tetraedro';
$string['app_sd_net_n'] = 'Desarrollo {$a->n} de {$a->all}';
$string['app_sd_no_net'] = 'La esfera no se puede desplegar en un plano.';
$string['app_sd_open'] = 'Abrirlo poco a poco';
$string['app_sd_other_net'] = 'Otro desarrollo';
$string['app_sd_round_cone'] = 'una base plana (un círculo), una superficie curva y un vértice';
$string['app_sd_round_cylinder'] = 'dos bases planas (círculos) y una superficie curva';
$string['app_sd_round_sphere'] = 'una sola superficie curva';
$string['app_sd_see'] = 'Transparente';
$string['app_sd_spin'] = 'Girar solo';
$string['app_sd_unfold'] = 'Desplegar';
$string['app_sd_view'] = 'Vista';
$string['app_sd_view_3d'] = '3D';
$string['app_sd_view_front'] = 'De frente';
$string['app_sd_view_side'] = 'De lado';
$string['app_sd_view_top'] = 'Desde arriba';
$string['app_sd_which'] = 'Cuerpo';
$string['app_si_again'] = 'Otra vez';
$string['app_si_blue'] = 'Azul';
$string['app_si_brown'] = 'Marrón';
$string['app_si_down'] = 'Abajo';
$string['app_si_fail'] = '¡Uy! Fallo';
$string['app_si_fail_repeat'] = 'Se repite';
$string['app_si_fail_reset'] = 'Desde el principio';
$string['app_si_fail_who'] = '¡Uy! {$a} ha fallado';
$string['app_si_fast'] = 'Rápida';
$string['app_si_green'] = 'Verde';
$string['app_si_kind'] = 'Los pulsadores llevan';
$string['app_si_kind_arrows'] = 'Flechas';
$string['app_si_kind_colors'] = 'Colores';
$string['app_si_kind_notes'] = 'Notas, sin colores';
$string['app_si_kind_numbers'] = 'Números, con una regla';
$string['app_si_kind_syllables'] = 'Sílabas de una palabra';
$string['app_si_left'] = 'Izquierda';
$string['app_si_listen'] = '¡Escuchen!';
$string['app_si_name'] = 'Simón';
$string['app_si_next'] = 'Le toca a {$a}';
$string['app_si_normal'] = 'Normal';
$string['app_si_note_names'] = 'Do,Re,Mi,Fa,Sol,La,Si,Do agudo,Re agudo';
$string['app_si_on_fail'] = 'Al fallar';
$string['app_si_orange'] = 'Naranja';
$string['app_si_order'] = 'Se repite';
$string['app_si_order_reverse'] = 'Al revés';
$string['app_si_order_same'] = 'En orden';
$string['app_si_pads'] = 'Pulsadores';
$string['app_si_pink'] = 'Rosa';
$string['app_si_press_start'] = 'Pulsa «Empezar»';
$string['app_si_purple'] = 'Morado';
$string['app_si_record'] = 'Récord: {$a}';
$string['app_si_record_who'] = 'Récord: {$a->n} ({$a->who})';
$string['app_si_red'] = 'Rojo';
$string['app_si_right'] = 'Derecha';
$string['app_si_round'] = 'Ronda {$a}';
$string['app_si_rule'] = 'La regla';
$string['app_si_rule_double'] = 'El doble';
$string['app_si_rule_minus1'] = 'Restar 1';
$string['app_si_rule_plus1'] = 'Sumar 1';
$string['app_si_rule_ten'] = 'Lo que falta para 10';
$string['app_si_same_again'] = 'Otra vez la misma';
$string['app_si_speed'] = 'Velocidad';
$string['app_si_syl_mode'] = 'La palabra';
$string['app_si_syl_read'] = 'Se escribe y la separan';
$string['app_si_syl_split'] = '¡Pulsen sus sílabas en orden!';
$string['app_si_syl_split_reverse'] = '¡Pulsen sus sílabas al revés!';
$string['app_si_syl_watch'] = 'Se encienden sus sílabas';
$string['app_si_teal'] = 'Turquesa';
$string['app_si_turns'] = 'Turnos';
$string['app_si_up'] = 'Arriba';
$string['app_si_watch'] = '¡Miren!';
$string['app_si_word_n'] = 'Palabra {$a}';
$string['app_si_yellow'] = 'Amarillo';
$string['app_si_your_turn'] = '¡Ahora tú!';
$string['app_si_your_turn_reverse'] = '¡Ahora tú, al revés!';
$string['app_sl_button'] = 'Sala de profes';
$string['app_sm_adjust'] = 'Ajustar a esta clase';
$string['app_sm_adjust_hint'] = 'Con la clase trabajando a un volumen que vale, pulsa: lo de ahora quedará en verde.';
$string['app_sm_adjusted'] = 'Ajustado: ese ruido es ahora el verde. La sensibilidad lo sube o lo baja.';
$string['app_sm_adjusting'] = 'Escuchando… {$a}';
$string['app_sm_amber'] = 'Un poco más bajo';
$string['app_sm_asking'] = 'Pidiendo permiso…';
$string['app_sm_best'] = 'Mejor: {$a}';
$string['app_sm_extras'] = 'Más cosas en el semáforo';
$string['app_sm_face'] = 'Una cara en la luz';
$string['app_sm_green'] = 'Muy bien';
$string['app_sm_level'] = 'Nivel de ruido';
$string['app_sm_light_amber'] = 'Semáforo en amarillo';
$string['app_sm_light_green'] = 'Semáforo en verde';
$string['app_sm_light_red'] = 'Semáforo en rojo';
$string['app_sm_listen'] = 'Escuchar la clase';
$string['app_sm_mic_denied'] = 'El navegador no me deja usar el micrófono.';
$string['app_sm_mic_denied_frame'] = 'No me dejan usar el micrófono aquí.';
$string['app_sm_mic_denied_help'] = 'Pulsa el candado junto a la dirección, permite el micrófono y vuelve a intentarlo.';
$string['app_sm_mic_frame'] = 'Aquí dentro del aula virtual no se puede usar el micrófono.';
$string['app_sm_mic_none'] = 'No encuentro ningún micrófono en este ordenador.';
$string['app_sm_mic_none_help'] = 'Conecta uno o prueba en otro equipo.';
$string['app_sm_mic_pending'] = 'El navegador te pregunta si me deja usar el micrófono.';
$string['app_sm_mic_pending_frame'] = '¿No ves la pregunta para usar el micrófono?';
$string['app_sm_mic_pending_help'] = 'Pulsa «Permitir». Si no ves la pregunta, busca el icono del micrófono o del candado junto a la dirección.';
$string['app_sm_mic_unavailable'] = 'El micrófono no está disponible.';
$string['app_sm_mic_unavailable_help'] = 'Comprueba que el ordenador tiene micrófono y que ningún otro programa lo está usando.';
$string['app_sm_mic_window'] = 'Ábrelo en otra ventana para usar el micrófono.';
$string['app_sm_off'] = 'Semáforo apagado';
$string['app_sm_patience'] = 'Paciencia';
$string['app_sm_patience_aria'] = 'Paciencia de la clase';
$string['app_sm_patience_gone'] = 'Se acabó la paciencia';
$string['app_sm_patience_note'] = 'Se gasta con el ruido que dura y vuelve con la calma.';
$string['app_sm_patience_out'] = '¡Se acabó la paciencia!';
$string['app_sm_privacy'] = 'El sonido no se graba ni se envía a ningún sitio: solo se mide el volumen, aquí, en este ordenador.';
$string['app_sm_red'] = '¡Demasiado ruido!';
$string['app_sm_scale_lower'] = 'Más bajo';
$string['app_sm_scale_ok'] = 'Bien';
$string['app_sm_scale_too'] = 'Demasiado';
$string['app_sm_sens_high'] = 'alta';
$string['app_sm_sens_low'] = 'baja';
$string['app_sm_sens_medium'] = 'media';
$string['app_sm_sensitivity'] = 'Sensibilidad';
$string['app_sm_stop'] = 'Apagar el semáforo';
$string['app_sm_streak'] = 'Racha en calma';
$string['app_sm_trail'] = 'El último minuto';
$string['app_sm_waves'] = 'Ondas cuando sube';
$string['app_so_another'] = 'Otra ronda';
$string['app_so_both'] = 'En los dos';
$string['app_so_done'] = '¡Todo clasificado!';
$string['app_so_mode'] = 'Jugar a';
$string['app_so_name'] = 'Clasificar';
$string['app_so_need_groups'] = 'Este ejercicio necesita dos grupos, uno de ellos con tres elementos o más.';
$string['app_so_odd'] = 'El intruso';
$string['app_so_odd_ask'] = '¿Cuál es el intruso?';
$string['app_so_odd_right'] = '«{$a->odd}» es de «{$a->oddgroup}»; los demás son de «{$a->group}».';
$string['app_so_pick'] = 'Toca una tarjeta y luego su caja';
$string['app_so_right'] = '{$a->n} de {$a->of} en su sitio';
$string['app_so_sort'] = 'Clasificar';
$string['app_so_venn'] = 'Venn';
$string['app_split_close'] = 'Una sola herramienta';
$string['app_split_swap'] = 'Cambiar de lado';
$string['app_tab_board'] = 'Pizarra';
$string['app_tab_chance'] = 'Azar';
$string['app_tab_clock'] = 'Reloj';
$string['app_tab_games'] = 'Juegos';
$string['app_tab_groups'] = 'Grupos';
$string['app_tab_live'] = 'En vivo';
$string['app_tab_materials'] = 'Material';
$string['app_tab_noise'] = 'Semáforo';
$string['app_tab_picker'] = '¿A quién le toca?';
$string['app_tab_qr'] = 'QR';
$string['app_tab_rules'] = 'Así trabajamos';
$string['app_tab_scoreboard'] = 'Marcador';
$string['app_tab_stopwatch'] = 'Cronómetro';
$string['app_tab_timer'] = 'Temporizador';
$string['app_tc_back'] = 'Volver a contar';
$string['app_tc_card_n'] = 'Tarjeta {$a}';
$string['app_tc_count'] = 'Cuántas';
$string['app_tc_f_four'] = 'Cuatro tarjetas: A, B, C y D';
$string['app_tc_f_light'] = 'Semáforo: verde, amarillo y rojo';
$string['app_tc_f_rotate'] = 'Una tarjeta que se gira: A, B, C y D';
$string['app_tc_f_yesno'] = 'Sí y no';
$string['app_tc_for'] = 'Para';
$string['app_tc_format'] = 'Qué tarjetas';
$string['app_tc_groups'] = 'Por grupos';
$string['app_tc_groups_lead'] = 'Cada uno, al sitio de su color: hablen de por qué.';
$string['app_tc_note_rotate'] = 'Dos tarjetas por página. Cada uno gira la tarjeta para que su respuesta quede arriba. Plastificadas, duran todo el curso.';
$string['app_tc_note_set'] = 'Una página por alumno, para recortar. Plastificadas, duran todo el curso.';
$string['app_tc_numbered'] = 'Numeradas, sin nombres';
$string['app_tc_print'] = 'Imprimir';
$string['app_tc_print_cards'] = 'Imprimir tarjetas';
$string['app_tc_printing'] = 'Las tarjetas están listas para imprimir.';
$string['app_tc_scan'] = 'Leer las tarjetas';
$string['app_tc_scan_cam'] = 'Usar la cámara de este equipo';
$string['app_tc_scan_count'] = 'Leídas: {$a->n} de {$a->of}';
$string['app_tc_scan_hint'] = 'Apunta la cámara a las tarjetas levantadas: cada una se recuadra en el color de su respuesta.';
$string['app_tc_scan_missing'] = 'Faltan por leer';
$string['app_tc_scan_names'] = 'Quién ha contestado qué';
$string['app_tc_scan_new'] = 'Otra pregunta';
$string['app_tc_scan_nocam'] = 'No se puede usar la cámara: dale permiso en el navegador, o léelas con el móvil.';
$string['app_tc_scan_phone'] = 'También con el móvil: «Leer las tarjetas» en el mando fijo («En vivo» › «Mando»). Las tarjetas se leen con la lista para la que se imprimieron.';
$string['app_tc_scan_stop'] = 'Parar la cámara';
$string['app_tc_talk'] = 'Dos minutos para convencer';
$string['app_tc_talk_done'] = '¡Tiempo! Levanten otra vez las tarjetas.';
$string['app_tc_talk_now'] = 'Hablen con alguien de otro color:';
$string['app_tc_title'] = 'Tarjetas para votar';
$string['app_tc_turn'] = 'Gira la tarjeta: tu respuesta, arriba.';
$string['app_tl_ago_ma'] = 'hace {$a} Ma';
$string['app_tl_ago_years'] = 'hace {$a} años';
$string['app_tl_bad_lines'] = 'Líneas que no se entienden: {$a}';
$string['app_tl_bc'] = '{$a} a. C.';
$string['app_tl_delete'] = 'Borrar la línea';
$string['app_tl_delete_sure'] = '¿Seguro? Toca otra vez';
$string['app_tl_edit'] = 'Editar';
$string['app_tl_empty'] = 'Esta línea todavía no tiene fechas';
$string['app_tl_err_empty'] = 'Hace falta al menos una línea con «fecha | nombre».';
$string['app_tl_ex_ages'] = 'Las edades de la Historia
3200 a. C. – 476 | Edad Antigua
476 – 1492 | Edad Media
1492 – 1789 | Edad Moderna
1789 – hoy | Edad Contemporánea
3200 a. C. | Aparece la escritura en Mesopotamia: termina la Prehistoria
476 | Cae el Imperio romano de Occidente
1492 | Colón llega a América
1789 | Revolución francesa';
$string['app_tl_ex_earth'] = 'Historia de la Tierra
4540 Ma | Se forma la Tierra
4540 Ma – 538,8 Ma | Precámbrico
538,8 Ma – 251,9 Ma | Paleozoico
251,9 Ma – 66 Ma | Mesozoico
66 Ma – hoy | Cenozoico
66 Ma | Extinción de los dinosaurios (salvo las aves)
300 ka | Aparece Homo sapiens';
$string['app_tl_ex_flight'] = 'Historia del vuelo
1783-11-21 | Primeras personas que vuelan, en un globo de los hermanos Montgolfier
1903-12-17 | Primer vuelo en avión (los hermanos Wright)
1927-05-21 | Lindbergh cruza el Atlántico sin escalas
1961-04-12 | Gagarin, primera persona en el espacio
1969-07-20 | Llegada a la Luna';
$string['app_tl_examples'] = 'Ejemplos';
$string['app_tl_fit'] = 'Ver todo';
$string['app_tl_format'] = 'Una línea por hecho: «fecha | nombre». Un periodo: «fecha – fecha | nombre». Fechas: 1969-07-20, 1492, 753 a. C., 66 Ma (millones de años), 300 ka (miles de años), hoy. La primera línea, sin «|», es el título.';
$string['app_tl_help'] = 'Arrastra para moverte; la rueda, dos dedos o la lupa acercan y alejan. Toca un hecho o un periodo para verlo en grande.';
$string['app_tl_hide'] = 'Esconder las fechas';
$string['app_tl_mine'] = 'Las mías';
$string['app_tl_new'] = 'Nueva línea';
$string['app_tl_text_ph'] = 'Historia del vuelo
1903-12-17 | Primer vuelo en avión
1969-07-20 | Llegada a la Luna';
$string['app_tl_today'] = 'Hoy';
$string['app_tl_untitled'] = 'Sin título';
$string['app_tl_which'] = 'Línea';
$string['app_tl_zoom_in'] = 'Acercar';
$string['app_tl_zoom_out'] = 'Alejar';
$string['app_tm_custom'] = 'A tu medida';
$string['app_tm_fact_barco'] = 'Un velero navega a unos 15 km/h.';
$string['app_tm_fact_caracol'] = 'Un caracol recorre unos 50 metros en una hora.';
$string['app_tm_fact_coche'] = 'Un coche de carreras pasa de 300 km/h.';
$string['app_tm_fact_cohete'] = 'Un cohete sube a más de 28 000 km/h.';
$string['app_tm_fav'] = 'Tu tiempo: {$a}';
$string['app_tm_fav_add'] = 'Guardar {$a}';
$string['app_tm_fav_add_title'] = 'Guardar este tiempo entre los tuyos (hasta dos)';
$string['app_tm_fav_remove'] = 'Quitar {$a} de tus tiempos';
$string['app_tm_final'] = 'Animar los últimos 10 segundos';
$string['app_tm_look'] = 'Aspecto';
$string['app_tm_look_bar'] = 'Barra';
$string['app_tm_look_disc'] = 'Disco';
$string['app_tm_look_pulsar'] = 'Púlsar';
$string['app_tm_look_ring'] = 'Anillo';
$string['app_tm_look_sand'] = 'Arena';
$string['app_tm_min_less'] = 'Un minuto menos';
$string['app_tm_min_more'] = 'Un minuto más';
$string['app_tm_min_short'] = '{$a} min';
$string['app_tm_mini_go'] = 'Volver al temporizador';
$string['app_tm_minutes'] = 'Minutos';
$string['app_tm_one_left'] = 'Queda 1 minuto';
$string['app_tm_paused'] = 'En pausa';
$string['app_tm_paused_sr'] = 'Temporizador en pausa';
$string['app_tm_plus_one'] = '1 minuto';
$string['app_tm_quick'] = 'Tiempos rápidos';
$string['app_tm_ready'] = 'Listo';
$string['app_tm_running'] = 'En marcha';
$string['app_tm_running_sr'] = 'Temporizador en marcha';
$string['app_tm_sec_less'] = 'Cinco segundos menos';
$string['app_tm_sec_more'] = 'Cinco segundos más';
$string['app_tm_seconds'] = 'Segundos';
$string['app_tm_traveller'] = 'Qué recorre la barra';
$string['app_tm_v_barco'] = 'Velero';
$string['app_tm_v_bateria'] = 'Batería';
$string['app_tm_v_caracol'] = 'Caracol';
$string['app_tm_v_coche'] = 'Coche de carreras';
$string['app_tm_v_cohete'] = 'Cohete';
$string['app_tm_v_ninguno'] = 'Solo la barra';
$string['app_tm_v_pixel'] = 'Píxeles';
$string['app_tm_warn'] = 'Avisar cuando quede 1 minuto';
$string['app_turn_button'] = '¿A quién le toca?';
$string['app_turn_none'] = 'Elige antes una lista en «¿A quién le toca?».';
$string['app_turn_ok'] = 'Vale';
$string['app_turn_other'] = 'Otro';
$string['app_turn_relay'] = 'Relevos';
$string['app_turn_relay_m'] = 'Otro cada {$a} minutos';
$string['app_turn_relay_m1'] = 'Otro cada minuto';
$string['app_turn_relay_none'] = 'Solo esta vez';
$string['app_turn_relay_s'] = 'Otro cada {$a} segundos';
$string['app_turn_stop'] = 'Parar';
$string['app_turn_task_board'] = '¡A la pizarra!';
$string['app_turn_task_note'] = '¿Qué nota es?';
$string['app_turn_task_play'] = '¡Al carillón!';
$string['app_turn_title'] = 'Le toca a…';
$string['app_wa_clue'] = 'Otra pista';
$string['app_wa_name'] = '¿Quién soy?';
$string['app_wa_next'] = 'Otro';
$string['app_wa_no_more'] = 'No hay más pistas';
$string['app_wa_points'] = '¡{$a} puntos!';
$string['app_wa_right'] = '¡Acertado!';
$string['app_wa_show'] = 'Ver la respuesta';
$string['app_wa_was'] = 'Era {$a}';
$string['app_wa_worth'] = 'Vale {$a} puntos';
$string['app_wb_background'] = 'Fondo';
$string['app_wb_bg_bigger'] = 'Más grande';
$string['app_wb_bg_blank'] = 'Blanco';
$string['app_wb_bg_double'] = 'Doble pauta';
$string['app_wb_bg_grid'] = 'Cuadrícula';
$string['app_wb_bg_lines'] = 'Pauta';
$string['app_wb_bg_ruled'] = 'Una raya';
$string['app_wb_bg_size'] = 'Tamaño';
$string['app_wb_bg_smaller'] = 'Más pequeño';
$string['app_wb_bg_staff'] = 'Pentagrama';
$string['app_wb_black'] = 'Negro';
$string['app_wb_blue'] = 'Azul';
$string['app_wb_board'] = 'Pizarra para dibujar';
$string['app_wb_cancel'] = 'Cancelar';
$string['app_wb_clear'] = 'Borrar todo';
$string['app_wb_clear_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_wb_colour'] = 'Color';
$string['app_wb_default_name'] = 'Pizarra {$a}';
$string['app_wb_del_page'] = 'Borrar la página';
$string['app_wb_del_page_sure'] = '¿Seguro? Pulsa otra vez';
$string['app_wb_download'] = 'Descargar';
$string['app_wb_dup_page'] = 'Duplicar';
$string['app_wb_eraser'] = 'Goma';
$string['app_wb_file'] = 'pizarra';
$string['app_wb_fit'] = 'La imagen a lo ancho de la pantalla';
$string['app_wb_full'] = 'Pizarra completa: páginas, instrumentos, imagen o PDF';
$string['app_wb_green'] = 'Verde';
$string['app_wb_image'] = 'Imagen o PDF de fondo';
$string['app_wb_image_missing'] = 'La imagen está en el navegador donde se puso';
$string['app_wb_image_remove'] = 'Quitar la imagen';
$string['app_wb_import_error'] = 'Ese archivo no se puede abrir: prueba con una imagen (PNG, JPG) o un PDF.';
$string['app_wb_importing'] = 'Trayendo la página {$a->n} de {$a->of}…';
$string['app_wb_magic'] = 'Formas mágicas: deja el dedo quieto al final de un trazo y se convierte en línea, círculo, triángulo o rectángulo';
$string['app_wb_margin'] = 'Margen';
$string['app_wb_more'] = 'Pizarra completa';
$string['app_wb_new_page'] = 'Página nueva';
$string['app_wb_next'] = 'Página siguiente';
$string['app_wb_orange'] = 'Naranja';
$string['app_wb_page_of'] = 'Página {$a->n} de {$a->of}';
$string['app_wb_pages'] = 'Páginas';
$string['app_wb_pdf_many'] = 'Solo caben las primeras {$a} páginas.';
$string['app_wb_prev'] = 'Página anterior';
$string['app_wb_purple'] = 'Morado';
$string['app_wb_red'] = 'Rojo';
$string['app_wb_redo'] = 'Rehacer';
$string['app_wb_saved'] = 'Descargado: {$a}';
$string['app_wb_sel_copy'] = 'Copiar';
$string['app_wb_sel_delete'] = 'Borrar';
$string['app_wb_send'] = 'Enviar a la clase';
$string['app_wb_send_empty'] = 'La pizarra está vacía.';
$string['app_wb_send_error'] = 'No se ha podido guardar: {$a}';
$string['app_wb_send_for'] = 'Para';
$string['app_wb_send_format'] = 'Formato';
$string['app_wb_send_go'] = 'Guardar y avisar';
$string['app_wb_send_name'] = 'Nombre';
$string['app_wb_send_note'] = 'Se guarda en el curso, en la sección «Pizarras de clase», en una carpeta para esa clase, y sus alumnos reciben un aviso.';
$string['app_wb_send_note_cohort'] = 'Esta clase no es un grupo de Moodle: su carpeta la puede ver todo el curso; el aviso solo llega a sus alumnos.';
$string['app_wb_send_title'] = 'Guardar en el curso y avisar a la clase';
$string['app_wb_sending'] = 'Guardando…';
$string['app_wb_sent'] = 'Guardada en «{$a->folder}». Avisados: {$a->n}.';
$string['app_wb_sent_open'] = 'Abrir la carpeta';
$string['app_wb_sf_black'] = 'Negra';
$string['app_wb_sf_green'] = 'Verde';
$string['app_wb_sf_white'] = 'Blanca';
$string['app_wb_size'] = 'Grosor';
$string['app_wb_size_l'] = 'Grueso';
$string['app_wb_size_m'] = 'Medio';
$string['app_wb_size_s'] = 'Fino';
$string['app_wb_surface'] = 'Pizarra';
$string['app_wb_t_arrow'] = 'Flecha';
$string['app_wb_t_ellipse'] = 'Círculo u óvalo';
$string['app_wb_t_formula'] = 'Fórmula: fracciones, potencias, raíces…';
$string['app_wb_t_hand'] = 'Moverse por la página';
$string['app_wb_t_hl'] = 'Fluorescente';
$string['app_wb_t_laser'] = 'Puntero láser';
$string['app_wb_t_line'] = 'Línea recta';
$string['app_wb_t_pen'] = 'Rotulador';
$string['app_wb_t_rect'] = 'Rectángulo';
$string['app_wb_t_select'] = 'Seleccionar, mover y cambiar de tamaño';
$string['app_wb_t_text'] = 'Texto';
$string['app_wb_text_ph'] = 'Escribe y pulsa Intro';
$string['app_wb_too_big'] = 'Estas páginas ocupan demasiado para guardarlas en el curso: se quedan en este navegador.';
$string['app_wb_tool'] = 'Herramienta';
$string['app_wb_undo'] = 'Deshacer';
$string['app_wb_yellow'] = 'Amarillo';
$string['app_wb_zoom_in'] = 'Acercar';
$string['app_wb_zoom_out'] = 'Alejar';
$string['app_wb_zoom_reset'] = 'Volver a la página entera';
$string['app_wo_builtin'] = 'Al azar: palabras de {$a} letras';
$string['app_wo_hint'] = 'de 3 a 8 letras';
$string['app_wo_letters'] = 'Palabra de {$a} letras';
$string['app_wo_name'] = 'Palabra';
$string['app_wo_need_word'] = 'La palabra tiene que tener de 3 a 8 letras, sin espacios.';
$string['app_wo_short'] = 'Faltan letras: tiene {$a}';
$string['app_wo_tries'] = 'Intentos';
$string['app_wo_won'] = '¡Muy bien! Al {$a}.º intento';
$string['boardfolder'] = 'Pizarras · {$a}';
$string['boardname'] = 'Pizarra {$a}';
$string['boardsection'] = 'Pizarras de clase';
$string['boardshared_body'] = '{$a->teacher} ha compartido una pizarra con tu clase en {$a->course}: {$a->name}.';
$string['boardshared_link'] = 'Ver la pizarra';
$string['boardshared_subject'] = 'Nueva pizarra en {$a}';
$string['categorymodes'] = 'Modo de pantalla por categoría';
$string['categorymodes_desc'] = 'El modo con el que empieza un curso, según su categoría. Una subcategoría sin modo propio toma el de la categoría de arriba, y una categoría sin modo, el del sitio. El profesor puede seguir eligiendo otro en cada curso.';
$string['categorymodes_parent'] = 'Como la categoría de arriba';
$string['categorymodes_site'] = 'Como el sitio';
$string['choose'] = '¿Con qué clase?';
$string['choose_all'] = 'Todas';
$string['choose_all_categories'] = 'Todas las categorías';
$string['choose_category'] = 'Categoría';
$string['choose_continue'] = 'Seguir con';
$string['choose_desc'] = 'Elige el curso y se abren las herramientas con sus alumnos ya cargados.';
$string['choose_filter'] = 'Filtrar los cursos';
$string['choose_hello_afternoon'] = 'Buenas tardes, {$a}';
$string['choose_hello_evening'] = 'Buenas noches, {$a}';
$string['choose_hello_morning'] = 'Buenos días, {$a}';
$string['choose_none_found'] = 'No hay ningún curso con ese nombre.';
$string['choose_remote'] = 'Tu mando fijo';
$string['choose_remote_off'] = 'Para manejar la pizarra desde el móvil sin entrar en el aula virtual: «En vivo» y «Mando», en la pizarra.';
$string['choose_remote_on'] = 'Escanéalo con el móvil: maneja la pizarra que abras.';
$string['choose_search'] = 'Buscar un curso';
$string['choose_standalone_desc'] = 'Las herramientas sin alumnos, para cualquier momento';
$string['choose_student'] = '1 alumno';
$string['choose_students'] = '{$a} alumnos';
$string['days'] = 'Días que cuentan para el sorteo justo';
$string['days_desc'] = 'Al sortear salen antes los alumnos a los que menos les ha tocado en estos últimos días. También es el periodo que se ve en «Participación».';
$string['defaultmode'] = 'Modo de la pantalla por defecto';
$string['defaultmode_desc'] = 'Cómo se ve la pantalla en un curso hasta que el profesor elige otro modo. Hay cuatro y se usa uno cada vez (no se combinan): <strong>Infantil</strong> (de 3 a 6 años: todo más grande y con más ayudas, como las líneas guía del tangram), <strong>Primaria</strong> (de 6 a 12), <strong>Secundaria</strong> (de 12 a 16, más sobrio) y <strong>Superior</strong> (Bachillerato y universidad: lo más exigente y sobrio, sin confeti). Cada profesor puede cambiar el modo en cada curso con el botón de la barra de arriba, y se le recuerda en ese curso. Ningún modo quita herramientas: el modo cambia el aspecto y cómo empiezan los juegos. El contenido de los juegos va aparte, en «Niveles del centro», y ahí sí se pueden marcar varios.';
$string['groupingname'] = '{$a->list} · equipos del {$a->when}';
$string['jointitle'] = 'Entra en la clase';
$string['kicked'] = 'El profe ha sacado este dispositivo de la sesión.';
$string['level_early'] = 'Infantil';
$string['level_higher'] = 'Universidad y superior';
$string['level_primary'] = 'Primaria';
$string['level_secondary'] = 'Secundaria';
$string['level_upper'] = 'Bachillerato';
$string['levels'] = 'Niveles del centro';
$string['levels_desc'] = 'El contenido de los juegos (conjuntos de ejemplo: formas, sombras de animales, tablas de multiplicar, elementos químicos, gráficas de funciones…) de los niveles que se imparten en el centro. Se pueden marcar varios, y el profesor puede acotarlos aún más en cada juego. Esto va aparte del modo de la pantalla, de arriba, que es uno cada vez.';
$string['live'] = 'Sesiones en vivo';
$string['live_desc'] = 'La pizarra puede abrir sesiones en vivo: los alumnos contestan una votación o pulsan el pulsador de su equipo desde una tableta, un Chromebook o un móvil, y el profesor puede usar su propio móvil como mando de la pizarra. Cada sesión se abre con una de dos entradas: con el código de la pizarra (nadie inicia sesión y no sale ningún nombre) o con el usuario de Moodle de los alumnos (solo los alumnos del curso, con su nombre). Mientras una sesión está abierta, cada dispositivo pregunta al sitio cada segundo y medio; las sesiones se cierran solas a los 15 minutos sin la pizarra y se borran al día siguiente.';
$string['liveclosed'] = 'La pregunta está cerrada.';
$string['livedisabled'] = 'Las sesiones en vivo están apagadas en este sitio.';
$string['livefull'] = 'La sesión está llena.';
$string['livenotice'] = 'Aviso a los alumnos';
$string['livenotice_close'] = 'Cerrar el aviso';
$string['livenotice_desc'] = 'Cuando un profesor abre una sesión en vivo, los alumnos de ese curso ven en sus páginas un aviso pequeño con un botón para entrar: no hace falta teclear el código ni escanear el QR.';
$string['livenotice_join'] = 'Entrar';
$string['livenotice_title'] = 'En vivo: {$a}';
$string['logros'] = 'Cromos de los profesores';
$string['logros_desc'] = 'Cada herramienta tiene un cromo para el profesor, que se consigue usándola de verdad con una clase y sube de nivel con los días de uso (1, 3, 8, 20 y 50). Cada profesor ve solo su álbum, en «¿Con qué clase?»; nunca hay clasificaciones entre profesores.';
$string['logros_devices'] = 'Dispositivos para una sesión en vivo de verdad';
$string['logros_devices_desc'] = 'Cuántos dispositivos tienen que entrar en una sesión en vivo (votación, lluvia de ideas, concurso, pulsadores) para que cuente como uso real.';
$string['logros_picks'] = 'Turnos para un uso de verdad de «¿A quién le toca?»';
$string['logros_picks_desc'] = 'Cuántos alumnos tienen que salir en la misma clase el mismo día.';
$string['logros_students'] = 'Alumnos para unos grupos de verdad';
$string['logros_students_desc'] = 'Cuántos alumnos tiene que tener la lista del curso con la que se hacen los grupos.';
$string['menu'] = 'Enlace en el menú principal';
$string['menu_desc'] = 'Muestra las herramientas de clase en el menú de arriba a quien da clase en algún curso. Dentro de cada curso el enlace está siempre en su barra.';
$string['messageprovider:boardshared'] = 'Una pizarra compartida con tu clase';
$string['mode_advanced'] = 'Superior (Bachillerato y universidad)';
$string['mode_early'] = 'Infantil';
$string['mode_primary'] = 'Primaria';
$string['mode_secondary'] = 'Secundaria';
$string['namestyle'] = 'Nombre en la pizarra';
$string['namestyle_desc'] = 'Cómo aparece cada alumno en «¿A quién le toca?» y en los grupos.';
$string['namestyle_first'] = 'Solo el nombre';
$string['namestyle_firstsurname'] = 'Nombre y primer apellido';
$string['namestyle_full'] = 'Nombre completo';
$string['namestyle_initials'] = 'Nombre e iniciales de los apellidos';
$string['navlabel'] = 'Herramientas de clase';
$string['nocourses'] = 'No das clase en ningún curso. Puedes usar las herramientas igualmente y pegar tus listas.';
$string['oksigeniaclasstools:generate'] = 'Pedir ejercicios a la IA del sitio para los juegos de las herramientas de clase';
$string['oksigeniaclasstools:use'] = 'Usar las herramientas de clase con los alumnos del curso';
$string['pluginname'] = 'Herramientas de clase (Oksigenia Classtools)';
$string['privacy:learnt'] = 'Cromos aprendidos';
$string['privacy:metadata:core_ai'] = 'Los ejercicios que se piden a la IA del sitio pasan por el subsistema de IA de Moodle, que guarda la petición y su respuesta.';
$string['privacy:metadata:core_files'] = 'Las imágenes de las preguntas del concurso se guardan en el curso, para el profesor que las puso.';
$string['privacy:metadata:core_message'] = 'Los alumnos reciben un aviso cuando un profesor comparte una pizarra con su clase.';
$string['privacy:metadata:learnt'] = 'Los cromos que ha aprendido un profesor: el «Ahora tú» de la ayuda guiada de una herramienta, hecho en la pizarra de práctica.';
$string['privacy:metadata:learnt:courseid'] = 'El curso donde se abrió la ayuda.';
$string['privacy:metadata:learnt:cromo'] = 'El cromo (la herramienta).';
$string['privacy:metadata:learnt:timecreated'] = 'Cuándo se aprendió.';
$string['privacy:metadata:learnt:userid'] = 'El profesor.';
$string['privacy:metadata:live'] = 'Sesiones en vivo que abren los profesores en la pizarra.';
$string['privacy:metadata:live:courseid'] = 'El curso de la sesión.';
$string['privacy:metadata:live:timecreated'] = 'Cuándo se abrió.';
$string['privacy:metadata:live:userid'] = 'El profesor que la abrió.';
$string['privacy:metadata:livein'] = 'Quién entró en una sesión en vivo con su usuario, y qué contestó.';
$string['privacy:metadata:livein:answer'] = 'Qué contestó: un voto, una o dos palabras, o las frases de un billete de salida (se guarda un día como mucho).';
$string['privacy:metadata:livein:team'] = 'Su equipo, en los pulsadores.';
$string['privacy:metadata:livein:timecreated'] = 'Cuándo contestó.';
$string['privacy:metadata:livein:userid'] = 'El alumno, cuando entró con su usuario.';
$string['privacy:metadata:picks'] = 'Cada vez que sale un alumno en la pantalla, para que salgan antes los que menos han salido y se vea la participación. Se borran cuando son más antiguos que los días que cuentan para el sorteo justo.';
$string['privacy:metadata:picks:courseid'] = 'El curso en el que se hizo el sorteo.';
$string['privacy:metadata:picks:teacherid'] = 'El profesor que hizo el sorteo.';
$string['privacy:metadata:picks:timecreated'] = 'Cuándo le tocó.';
$string['privacy:metadata:picks:userid'] = 'El alumno al que le tocó.';
$string['privacy:metadata:preference:sala'] = 'Si el profesor aparece en la sala de profes.';
$string['privacy:metadata:remote'] = 'El mando fijo de cada profesor: una dirección para su móvil con una llave, y si está encendido.';
$string['privacy:metadata:remote:enabled'] = 'Si el mando está encendido.';
$string['privacy:metadata:remote:timecreated'] = 'Cuándo se encendió por primera vez.';
$string['privacy:metadata:remote:token'] = 'La llave de la dirección del mando.';
$string['privacy:metadata:remote:userid'] = 'El profesor.';
$string['privacy:metadata:state'] = 'Lo que cada profesor guarda de cada herramienta en cada curso (por ejemplo, el marcador o sus roscos), para seguir desde cualquier ordenador.';
$string['privacy:metadata:state:courseid'] = 'El curso.';
$string['privacy:metadata:state:data'] = 'Lo guardado (nombres de equipos, puntos, preguntas…).';
$string['privacy:metadata:state:timemodified'] = 'Cuándo se guardó por última vez.';
$string['privacy:metadata:state:tool'] = 'La herramienta.';
$string['privacy:metadata:state:userid'] = 'El profesor.';
$string['privacy:metadata:uses'] = 'Los usos reales de las herramientas con una clase, guardados para los cromos del profesor: uno por cromo, curso y día.';
$string['privacy:metadata:uses:courseid'] = 'El curso.';
$string['privacy:metadata:uses:cromo'] = 'El cromo (la herramienta usada).';
$string['privacy:metadata:uses:day'] = 'El día del uso.';
$string['privacy:metadata:uses:timecreated'] = 'Cuándo se guardó.';
$string['privacy:metadata:uses:userid'] = 'El profesor.';
$string['privacy:remote'] = 'Mando fijo';
$string['privacy:sala_in'] = 'El profesor aparece en la sala de profes.';
$string['privacy:sala_out'] = 'El profesor no aparece en la sala de profes.';
$string['privacy:uses'] = 'Usos para los cromos';
$string['remoteoff'] = 'Mando fijo: apagarse solo';
$string['remoteoff_desc'] = 'El mando fijo de cada profesor se apaga solo tras estas horas sin órdenes del móvil (contando desde que se encendió). El profesor lo vuelve a encender en la pizarra con un toque.';
$string['remoteoff_hours'] = 'Tras {$a} horas';
$string['remoteoff_never'] = 'Nunca';
$string['remoteoff_one'] = 'Tras 1 hora';
$string['sala'] = 'Sala de profes';
$string['sala_close'] = 'Cerrar';
$string['sala_count'] = '{$a} en la sala';
$string['sala_count_none'] = 'Todavía nadie';
$string['sala_desc'] = 'En «¿Con qué clase?», los profesores que quieran aparecen con su bichito y sus cromos, para saber quién más juega con su clase. Cada uno decide si aparece (de partida, no) y puede salir cuando quiera. Nunca se enseñan recuentos ni horas, ni se ordena a nadie por uso. Necesita los cromos encendidos.';
$string['sala_empty'] = 'Todavía no se ha apuntado nadie. ¿Empiezas tú?';
$string['sala_intro'] = 'Quién más juega con su clase: para saber a quién preguntar.';
$string['sala_join'] = 'Aparecer en la sala';
$string['sala_join_note'] = 'Solo se ven tu bichito, tu nombre y tus cromos con su nivel; nunca cuántas veces ni cuánto tiempo. Puedes salir cuando quieras.';
$string['sala_none'] = 'Sin cromos en este tiempo';
$string['sala_open'] = 'Ver la sala';
$string['sala_others'] = 'Y {$a} compañeros más juegan con sus clases.';
$string['sala_others_one'] = 'Y un compañero más juega con su clase.';
$string['sala_season_span'] = 'Temporada «{$a->name}», desde el {$a->date}.';
$string['sala_season_span_noname'] = 'Desde el {$a}.';
$string['sala_seasons'] = 'Temporadas de la sala';
$string['sala_seasons_desc'] = 'Opcional. Una por línea, con el día en que empieza y su nombre: «2026-09-08 | Primer trimestre». La sala cuenta desde el comienzo de la temporada en curso.';
$string['sala_weeks'] = 'Semanas que cuenta la sala';
$string['sala_weeks_desc'] = 'Los niveles de la sala salen de los días de uso de las últimas semanas: nadie se queda arriba para siempre, y quien llega se pone al día. No se usa mientras haya una temporada en curso.';
$string['sala_weeks_span'] = 'Cuenta las últimas {$a} semanas.';
$string['sala_you'] = 'tú';
$string['show_games'] = 'Juegos';
$string['show_games_desc'] = 'Los juegos de la pestaña Juegos en este sitio.';
$string['show_materials'] = 'Materiales';
$string['show_materials_desc'] = 'Los materiales de la pestaña Material en este sitio.';
$string['show_tools'] = 'Herramientas';
$string['show_tools_desc'] = 'Las pestañas que enseña la pantalla en este sitio. Las que se quiten no las ven los profesores.';
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
