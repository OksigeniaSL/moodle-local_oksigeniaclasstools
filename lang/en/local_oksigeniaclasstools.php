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

$string['ai'] = 'Exercises with the AI of the site';
$string['ai_desc'] = 'If the site has an AI provider that generates text (from Moodle 4.5), teachers can ask it for exercises for Order, Sort, Spot the mistakes and Who am I? from «My exercises». The plugin builds the prompt from the game, the topic and the level; Moodle shows its AI policy before the first use and keeps a record of each request. The exercises are added to the box, for the teacher to check before saving.';
$string['ai_unavailable'] = 'The AI of the site is not available in this course.';
$string['app_ah_builtin_advanced'] = 'At random: upper secondary and university words';
$string['app_ah_builtin_early'] = 'At random: early years words';
$string['app_ah_builtin_primary'] = 'At random: primary school words';
$string['app_ah_builtin_secondary'] = 'At random: secondary school words';
$string['app_ah_initial_ask'] = 'Which letter does it start with?';
$string['app_ah_initial_next'] = 'Another name';
$string['app_ah_initial_none'] = 'This game needs a class list of the course, with the names of the class.';
$string['app_ah_initial_right'] = 'Yes! {$a}';
$string['app_ah_initial_start'] = 'A name';
$string['app_ah_kind'] = 'What do we play?';
$string['app_ah_kind_initial'] = 'First letter of a name';
$string['app_ah_kind_word'] = 'The whole word';
$string['app_ah_left_many'] = '{$a} balloons';
$string['app_ah_left_one'] = '{$a} balloon';
$string['app_ah_name'] = 'Hangman';
$string['app_ah_need_word'] = 'Type the word or choose a list.';
$string['app_ah_reveal'] = 'Show the word';
$string['app_ah_spent'] = 'Spent balloons';
$string['app_ah_spent_go'] = 'They go';
$string['app_ah_spent_stay'] = 'They stay';
$string['app_ah_uncover'] = 'Uncover a letter';
$string['app_ah_uncover_hint'] = 'It costs a balloon';
$string['app_ah_won'] = 'Well done! You\'ve guessed it';
$string['app_ai_done'] = 'Done: {$a} added. Check them before saving.';
$string['app_ai_done_quiz'] = 'Done: {$a} questions in the box. Press «Add them» to put them in the quiz.';
$string['app_ai_done_rosco'] = 'Done: {$a} letters filled in. Check them before saving.';
$string['app_ai_example_pairs'] = 'France = Paris
Italy = Rome
Portugal = Lisbon';
$string['app_ai_example_quiz'] = 'Which is the largest planet in the Solar System? | *Jupiter | Saturn | Neptune | Earth
Pure water boils at 100 °C at sea level | T
A whale is a fish | F';
$string['app_ai_example_rosco'] = 'A | The fruit that fell on Newton\'s head, so the story goes | apple
B | Insect that makes honey | bee
X | Large farm animal that pulls a plough | ox';
$string['app_ai_example_timeline'] = '476 – 1492 | Middle Ages
1492 | Columbus reaches America
1969-07-20 | Landing on the Moon';
$string['app_ai_example_trios'] = 'France = Paris = French
Italy = Rome = Italian
Portugal = Lisbon = Portuguese';
$string['app_ai_example_words'] = 'volcano
glacier
plateau';
$string['app_ai_for'] = 'For';
$string['app_ai_kind_pairs'] = 'Pairs «a = b» (Pairs)';
$string['app_ai_kind_trios'] = 'Trios «a = b = c» (Pairs)';
$string['app_ai_kind_words'] = 'Words (hangman, word, secret code)';
$string['app_ai_prompt'] = 'Write {$a->what} for {$a->level}, on «{$a->topic}».

Format (plain text, nothing else): {$a->rules}

Example:
{$a->example}

Answer only with that, in the language of this text, without explanations or Markdown. Check that everything you write is correct.';
$string['app_ai_rules_pairs'] = 'One pair per line: the two halves separated by =, each of a few words.';
$string['app_ai_rules_quiz'] = 'One question per line: the question, then two to four answers separated by |, with * before the only right one. For true or false, the statement, | and T or F.';
$string['app_ai_rules_rosco'] = 'One line per letter, for these letters: {$a}. On each line, the letter, the clue and the answer, separated by |. The answer starts with that letter or, if no good word does, contains it.';
$string['app_ai_rules_timeline'] = 'One line per event: «date | name», or per period: «date – date | name». Dates: a year (1492), a year before Christ (753 BC), a full date (1969-07-20), or millions of years ago (66 Ma). Only dates you are sure of; nothing made up.';
$string['app_ai_rules_trios'] = 'One trio per line: three things that go together, separated by =, each of a few words.';
$string['app_ai_rules_words'] = 'One word per line, without articles, numbers or explanations.';
$string['app_ai_what_pairs'] = '{$a} pairs';
$string['app_ai_what_quiz'] = '{$a} quiz questions';
$string['app_ai_what_rosco'] = 'a letter wheel, with a clue for each letter';
$string['app_ai_what_timeline'] = '{$a} events or periods for a timeline';
$string['app_ai_what_trios'] = '{$a} trios';
$string['app_ai_what_words'] = '{$a} words';
$string['app_asi_group'] = 'In groups';
$string['app_asi_hand'] = 'Raise your hand';
$string['app_asi_hint'] = 'Tap one to show it full size. To go back, tap the screen again.';
$string['app_asi_listen'] = 'Listen';
$string['app_asi_pairs'] = 'In pairs';
$string['app_asi_quiet'] = 'Quiet voices';
$string['app_asi_silence'] = 'Silence';
$string['app_b10_base'] = 'Base';
$string['app_b10_base_n'] = 'Base {$a}';
$string['app_b10_blocks_of'] = 'Blocks of {$a}';
$string['app_b10_break_n'] = 'Break into {$a} →';
$string['app_b10_broken'] = '1 in {$a->a} → 10 in {$a->b}';
$string['app_b10_build'] = 'Build a number';
$string['app_b10_empty'] = 'Empty';
$string['app_b10_group_n'] = 'Swap {$a} for 1 ←';
$string['app_b10_grouped'] = '10 in {$a->a} → 1 in {$a->b}';
$string['app_b10_guess'] = 'What number is it? Tap to see it';
$string['app_b10_h'] = 'Hundreds';
$string['app_b10_help'] = 'Add and take away blocks with + and −, or tap a block to take it away. With as many of a kind as the base (ten in base 10), swap them for one of the next column; one can be broken into that many.';
$string['app_b10_hide'] = 'Hide the number';
$string['app_b10_in_base'] = '{$a->n} in base {$a->b}';
$string['app_b10_less'] = '{$a}: one less';
$string['app_b10_more'] = '{$a}: one more';
$string['app_b10_put'] = 'Put';
$string['app_b10_t'] = 'Tens';
$string['app_b10_take'] = '{$a}: take one away';
$string['app_b10_th'] = 'Thousands';
$string['app_b10_u'] = 'Ones';
$string['app_b10_upto'] = 'Up to';
$string['app_ba_add_left'] = 'Put {$a} on the left pan';
$string['app_ba_add_right'] = 'Put {$a} on the right pan';
$string['app_ba_bad'] = 'Write it like 2x + 3 = 11, with whole numbers and a solution the scale can show: a whole number above zero.';
$string['app_ba_both_one'] = 'Take 1 off each pan';
$string['app_ba_both_x'] = 'Take a box off each pan';
$string['app_ba_compare'] = 'Compare';
$string['app_ba_empty'] = 'Empty the pans';
$string['app_ba_equation'] = 'Equations';
$string['app_ba_help'] = 'Put weights on each pan with the buttons below and tap a weight to take it off. The scale leans to the heavier side.';
$string['app_ba_help_eq'] = 'Each box weighs x. What comes off one pan has to come off the other, or the scale tips: take the same off both until a box is left on its own.';
$string['app_ba_hide'] = 'Close the boxes';
$string['app_ba_new'] = 'New equation';
$string['app_ba_numbers'] = 'Weights with numbers';
$string['app_ba_put'] = 'Put';
$string['app_ba_reveal'] = 'Open the boxes';
$string['app_ba_share'] = 'Share both pans out by {$a}';
$string['app_ba_share_any'] = 'Share both pans out';
$string['app_ba_solved'] = 'x = {$a}, without breaking the balance.';
$string['app_ba_take_box'] = 'Take off a box';
$string['app_ba_take_one'] = 'Take off a weight of 1';
$string['app_ba_take_weight'] = 'Take off the weight of {$a}';
$string['app_ba_unbalanced'] = 'Out of balance: do the same on the other pan.';
$string['app_ba_undo'] = 'Undo';
$string['app_ba_write'] = 'Or write one';
$string['app_bar_back'] = 'Back to the course';
$string['app_bar_brand_lead'] = 'Class';
$string['app_bar_brand_strong'] = 'tools';
$string['app_bar_fullscreen'] = 'Full screen';
$string['app_bar_fullscreen_exit'] = 'Exit full screen';
$string['app_bar_home'] = 'Back to home';
$string['app_bar_mode'] = 'Mode';
$string['app_bar_mode_title'] = 'Screen mode (one at a time)';
$string['app_bar_names_upper'] = 'Names in capitals';
$string['app_bar_names_upper_hint'] = 'For those who are learning to read: on by default in Early years. Only on this screen; the profiles do not change.';
$string['app_bar_present'] = 'Present';
$string['app_bar_present_exit'] = 'Show the tools';
$string['app_bar_session_login'] = 'Log in again';
$string['app_bar_session_text'] = 'your session on the site has expired. What you have now stays on this computer.';
$string['app_bar_session_title'] = 'Not saving to the course:';
$string['app_bar_sound'] = 'Sound';
$string['app_bar_sound_off'] = 'Sound off (press to turn it on)';
$string['app_bar_sound_on'] = 'Sound on (press to mute)';
$string['app_bar_split'] = 'Two tools at once';
$string['app_bar_title'] = 'Class tools';
$string['app_bar_tools'] = 'Tools';
$string['app_bar_window'] = 'Open in another window';
$string['app_bar_zoom'] = 'Size of the board on this screen';
$string['app_bar_zoom_in'] = 'Bigger';
$string['app_bar_zoom_out'] = 'Smaller';
$string['app_bar_zoom_reset'] = 'Normal size';
$string['app_bq_back'] = 'Back to work: block {$a->n} of {$a->of}';
$string['app_bq_blocks'] = 'In blocks';
$string['app_bq_count'] = 'Blocks';
$string['app_bq_kind'] = 'How it counts';
$string['app_bq_one'] = 'One count';
$string['app_bq_rest'] = 'Rest';
$string['app_bq_rest_now'] = 'Rest';
$string['app_bq_summary'] = '{$a->n} blocks of {$a->work} min with rests of {$a->rest}: {$a->total} min in all. Each part starts by itself.';
$string['app_bq_tip_1'] = 'Rest: look out of the window, far away, for a while.';
$string['app_bq_tip_2'] = 'Rest: stand up and stretch.';
$string['app_bq_tip_3'] = 'Rest: a drink of water.';
$string['app_bq_tip_4'] = 'Rest: three deep breaths, slowly.';
$string['app_bq_tip_5'] = 'Rest: roll the shoulders and move the neck gently.';
$string['app_bq_tip_6'] = 'Rest: close the eyes for a moment.';
$string['app_bq_title'] = 'Work and rest';
$string['app_bq_work'] = 'Work';
$string['app_bq_work_n'] = 'Work {$a->n} of {$a->of}';
$string['app_ca_ans'] = 'Ans';
$string['app_ca_basic'] = 'Basic';
$string['app_ca_error'] = 'It cannot be worked out';
$string['app_ca_guess'] = 'Estimate first';
$string['app_ca_guess_now'] = 'How much will it be? Estimate it, and then look.';
$string['app_ca_keys'] = 'Keys';
$string['app_ca_kind'] = 'Kind of calculator';
$string['app_ca_reveal'] = 'Show the result';
$string['app_ca_sci'] = 'Scientific';
$string['app_ca_steps'] = 'Step by step';
$string['app_ca_tape'] = 'Results';
$string['app_ca_tape_clear'] = 'Clear the results';
$string['app_ca_tape_empty'] = 'Each result stays here; a tap uses it again.';
$string['app_ca_undefined'] = 'Not defined';
$string['app_ca_use'] = 'Use this result';
$string['app_cd_day'] = 'Day';
$string['app_cd_day_one'] = 'day';
$string['app_cd_days'] = 'days';
$string['app_cd_here'] = 'It\'s here!';
$string['app_cd_hint'] = 'Choose what we are waiting for, the day and the time.';
$string['app_cd_hour_one'] = 'hour';
$string['app_cd_hours'] = 'hours';
$string['app_cd_left'] = 'Still to go';
$string['app_cd_minute_one'] = 'minute';
$string['app_cd_minutes'] = 'minutes';
$string['app_cd_school_many'] = '{$a} school days in between';
$string['app_cd_school_one'] = '1 school day in between';
$string['app_cd_second_one'] = 'second';
$string['app_cd_seconds'] = 'seconds';
$string['app_cd_time'] = 'Time';
$string['app_cd_what'] = 'What are we waiting for?';
$string['app_cd_what_ph'] = 'The school trip';
$string['app_cel_continue'] = 'Continue';
$string['app_cel_done'] = 'Well done!';
$string['app_ch_all_out'] = 'Everyone has come out: starting again.';
$string['app_ch_bad'] = 'Bad';
$string['app_ch_blue'] = 'Blue';
$string['app_ch_builtin'] = 'Others';
$string['app_ch_cards'] = 'Cards';
$string['app_ch_coin'] = 'Coin';
$string['app_ch_custom_faces'] = 'Faces of the custom die, one per line';
$string['app_ch_custom_hint'] = 'For example: “verb in the past”';
$string['app_ch_d6'] = '6-sided (dots)';
$string['app_ch_d_add_sub'] = 'Add or subtract (+ −)';
$string['app_ch_d_arrows'] = 'Direction ({$a} arrows)';
$string['app_ch_d_colours'] = 'Colours';
$string['app_ch_d_custom'] = 'Custom';
$string['app_ch_d_letters'] = 'Letters';
$string['app_ch_d_ops'] = 'Operations (+ − × ÷)';
$string['app_ch_d_sides'] = '{$a}-sided';
$string['app_ch_d_vowels'] = 'Vowels';
$string['app_ch_deck'] = 'Deck';
$string['app_ch_dice'] = 'Dice';
$string['app_ch_die'] = 'Die {$a}';
$string['app_ch_die_kinds'] = 'Dice';
$string['app_ch_draw'] = 'Draw a card';
$string['app_ch_edit_list'] = 'Edit';
$string['app_ch_empty'] = 'No segments left. Press “Put them all back”.';
$string['app_ch_empty_deck'] = 'No cards left. Press “Shuffle again”.';
$string['app_ch_even'] = 'Even';
$string['app_ch_even_odd'] = 'Even or odd';
$string['app_ch_exclaim'] = '{$a}!';
$string['app_ch_false'] = 'False';
$string['app_ch_freq_one'] = '{$a} throws · each bar, how many times; the line, what is expected';
$string['app_ch_freq_sum'] = '{$a} throws · the sum of the dice; the line, what is expected';
$string['app_ch_from'] = 'From';
$string['app_ch_good'] = 'Good';
$string['app_ch_green'] = 'Green';
$string['app_ch_heads'] = 'Heads';
$string['app_ch_heads_tails'] = 'Heads or tails';
$string['app_ch_how_many'] = 'How many dice?';
$string['app_ch_last_one'] = 'Only “{$a}” is left: it is the last one';
$string['app_ch_left'] = '{$a} left';
$string['app_ch_letters_az'] = 'Letters (A–Z)';
$string['app_ch_letters_stop'] = 'Letters for “Stop” (no K, Ñ, Q, W, X, Y)';
$string['app_ch_many'] = 'Many throws';
$string['app_ch_many_clear'] = 'Clear the chart';
$string['app_ch_many_go'] = 'Throw';
$string['app_ch_many_n'] = '{$a} throws';
$string['app_ch_many_numbers'] = 'Only with dice of numbers.';
$string['app_ch_motif'] = 'Design';
$string['app_ch_new_list'] = 'New list';
$string['app_ch_no'] = 'No';
$string['app_ch_no_list'] = 'That list is empty.';
$string['app_ch_no_repeat'] = 'No repeats';
$string['app_ch_numbers'] = 'Numbers from {$a->a} to {$a->b}';
$string['app_ch_numbers_pick'] = 'Numbers…';
$string['app_ch_odd'] = 'Odd';
$string['app_ch_only_one'] = 'There is only one segment: “{$a}”';
$string['app_ch_orange'] = 'Orange';
$string['app_ch_other'] = 'Other';
$string['app_ch_ownlists'] = 'Your lists';
$string['app_ch_press_to'] = 'Press “{$a}”';
$string['app_ch_purple'] = 'Purple';
$string['app_ch_put_back'] = 'Put them all back';
$string['app_ch_red'] = 'Red';
$string['app_ch_red_blue'] = 'Red or blue team';
$string['app_ch_remove_picked'] = 'Remove the one picked';
$string['app_ch_reset_tally'] = 'Reset to zero';
$string['app_ch_reshuffle'] = 'Shuffle again';
$string['app_ch_result'] = 'Result: {$a}';
$string['app_ch_roll'] = 'Roll';
$string['app_ch_side1'] = 'One side';
$string['app_ch_side2'] = 'The other';
$string['app_ch_source'] = 'Segments';
$string['app_ch_spin'] = 'Spin';
$string['app_ch_students'] = 'Students';
$string['app_ch_tails'] = 'Tails';
$string['app_ch_thumbs'] = 'Thumbs up or down';
$string['app_ch_to'] = 'to';
$string['app_ch_toss'] = 'Toss';
$string['app_ch_total'] = 'Total: {$a}';
$string['app_ch_true'] = 'True';
$string['app_ch_true_false'] = 'True or false';
$string['app_ch_what'] = 'What shall we use?';
$string['app_ch_wheel'] = 'Wheel';
$string['app_ch_yellow'] = 'Yellow';
$string['app_ch_yes'] = 'Yes';
$string['app_ch_yes_no'] = 'Yes or no';
$string['app_cl_ask'] = 'What time is it?';
$string['app_cl_check'] = 'Check';
$string['app_cl_clock'] = 'Clock for learning the time';
$string['app_cl_countdown'] = 'Countdown';
$string['app_cl_digital'] = 'Show the digital time';
$string['app_cl_drag_hint'] = 'Move the hands with your finger or the mouse';
$string['app_cl_h24'] = '24-hour clock';
$string['app_cl_learn'] = 'Learn the time';
$string['app_cl_level'] = 'Level';
$string['app_cl_level_five'] = 'Every 5 minutes';
$string['app_cl_level_h'] = 'O\'clock';
$string['app_cl_level_half'] = 'Half past';
$string['app_cl_level_minute'] = 'Minute by minute';
$string['app_cl_level_quarter'] = 'Quarter past and quarter to';
$string['app_cl_minutes'] = 'Show the minutes';
$string['app_cl_mode'] = 'Clock';
$string['app_cl_now'] = 'Current time';
$string['app_cl_reveal'] = 'Show the answer';
$string['app_cl_right'] = 'Well done! That\'s the time';
$string['app_cl_roman'] = 'Roman numerals';
$string['app_cl_set'] = 'Set the time';
$string['app_cl_set_this'] = 'Set: {$a}';
$string['app_cl_words'] = 'Show in words';
$string['app_cl_wrong'] = 'Not yet: look carefully at the hands';
$string['app_cr_album'] = 'My stickers';
$string['app_cr_alzatarjetas_how'] = 'Read {$a} printed cards or more with the camera.';
$string['app_cr_alzatarjetas_name'] = 'Card Raiser';
$string['app_cr_alzatarjetas_text'] = 'Reads the whole class at a glance.';
$string['app_cr_atrapanubes_how'] = 'Close a brainstorm with {$a} answers or more.';
$string['app_cr_atrapanubes_name'] = 'Cloud Catcher';
$string['app_cr_atrapanubes_text'] = 'Catches ideas before the wind takes them.';
$string['app_cr_cazaletras_how'] = 'Finish a letter wheel.';
$string['app_cr_cazaletras_name'] = 'Letter Catcher';
$string['app_cr_cazaletras_text'] = 'From A to Z, letter by letter.';
$string['app_cr_close'] = 'Close';
$string['app_cr_creajuegos_how'] = 'Play one of your own exercises in Order, Sort, Spot the mistakes or Who am I?';
$string['app_cr_creajuegos_name'] = 'Game Maker';
$string['app_cr_creajuegos_text'] = 'A new game for every topic.';
$string['app_cr_cuentamanos_how'] = 'Count {$a} hands or more in a show of hands.';
$string['app_cr_cuentamanos_name'] = 'Hand Counter';
$string['app_cr_cuentamanos_text'] = 'Not a single hand gets away.';
$string['app_cr_cuentavotos_how'] = 'Close a vote with {$a} devices or more, most of them voting.';
$string['app_cr_cuentavotos_name'] = 'Vote Counter';
$string['app_cr_cuentavotos_text'] = 'Counts votes faster than their shadow.';
$string['app_cr_cumplemetas_how'] = 'Reach the class goal.';
$string['app_cr_cumplemetas_name'] = 'Goal Getter';
$string['app_cr_cumplemetas_text'] = 'With their class, reaches every goal.';
$string['app_cr_day'] = '1 day of use';
$string['app_cr_days'] = '{$a} days of use';
$string['app_cr_despejaequis_how'] = 'Solve an equation on the balance scale, keeping it in balance.';
$string['app_cr_despejaequis_name'] = 'X Finder';
$string['app_cr_despejaequis_text'] = 'What it does to one side, it does to the other.';
$string['app_cr_despliegacubos_how'] = 'Show another net of a 3D shape with «Another net».';
$string['app_cr_despliegacubos_name'] = 'Cube Unfolder';
$string['app_cr_despliegacubos_text'] = 'Knows the eleven ways to open a cube.';
$string['app_cr_domamoviles_how'] = 'Have {$a} devices or more join a live session.';
$string['app_cr_domamoviles_name'] = 'Phone Tamer';
$string['app_cr_domamoviles_text'] = 'No phone resists them.';
$string['app_cr_echacuentas_how'] = 'Show a result on the calculator after «Estimate first».';
$string['app_cr_echacuentas_name'] = 'Number Cruncher';
$string['app_cr_echacuentas_text'] = 'Estimates first, then works it out.';
$string['app_cr_fam_balance'] = 'Balance scale';
$string['app_cr_fam_board'] = 'Whiteboard';
$string['app_cr_fam_calc'] = 'Calculator';
$string['app_cr_fam_cards'] = 'Printed cards';
$string['app_cr_fam_dice'] = 'Dice';
$string['app_cr_fam_exercises'] = 'My exercises';
$string['app_cr_fam_exit'] = 'Exit ticket';
$string['app_cr_fam_goal'] = 'Class goal';
$string['app_cr_fam_groups'] = 'Groups';
$string['app_cr_fam_hangman'] = 'Hangman';
$string['app_cr_fam_live'] = 'Live';
$string['app_cr_fam_picker'] = 'Whose turn?';
$string['app_cr_fam_rosco'] = 'Letter wheel';
$string['app_cr_fam_score'] = 'Score';
$string['app_cr_fam_simon'] = 'Simon';
$string['app_cr_fam_solids'] = '3D shapes';
$string['app_cr_fam_timer'] = 'Timer';
$string['app_cr_got'] = '{$a->got} of {$a->all} stickers';
$string['app_cr_got_split'] = '{$a->real} with your classes and {$a->learned} in the guided helps';
$string['app_cr_guardatiempos_how'] = 'Let a timer of a minute or more reach zero.';
$string['app_cr_guardatiempos_name'] = 'Time Keeper';
$string['app_cr_guardatiempos_text'] = 'Time never gets away from them.';
$string['app_cr_intro'] = 'Each tool has its sticker: it is earned by using it for real with the class, and it goes up a level with the days of use.';
$string['app_cr_lanzapreguntas_how'] = 'Run 3 quiz questions with {$a} devices or more.';
$string['app_cr_lanzapreguntas_name'] = 'Question Launcher';
$string['app_cr_lanzapreguntas_text'] = 'Sharp aim: every doubt, on target.';
$string['app_cr_lap'] = 'Lap';
$string['app_cr_lap_n'] = 'Lap {$a}';
$string['app_cr_lap_total'] = 'total {$a}';
$string['app_cr_laps'] = 'Laps';
$string['app_cr_level_0'] = 'Learned';
$string['app_cr_level_1'] = 'Level 1';
$string['app_cr_level_2'] = 'Level 2 · Bronze';
$string['app_cr_level_3'] = 'Level 3 · Silver';
$string['app_cr_level_4'] = 'Level 4 · Gold';
$string['app_cr_level_5'] = 'Level 5 · Shiny';
$string['app_cr_mandamas_how'] = 'Drive the board from your phone: 5 orders in a day.';
$string['app_cr_mandamas_name'] = 'Remote Master';
$string['app_cr_mandamas_text'] = 'Runs the board from any corner.';
$string['app_cr_missing'] = 'Still to get';
$string['app_cr_new'] = 'New sticker!';
$string['app_cr_next'] = 'Next level at {$a} days';
$string['app_cr_none'] = 'No stickers yet: use any tool with your class and they start coming.';
$string['app_cr_number'] = 'No. {$a->n} · {$a->family}';
$string['app_cr_open'] = 'Open the album';
$string['app_cr_pasalimpios_how'] = 'Let the board straighten a shape (magic shapes).';
$string['app_cr_pasalimpios_name'] = 'Tidy Hand';
$string['app_cr_pasalimpios_text'] = 'What they draw comes out right the first time.';
$string['app_cr_picabilletes_how'] = 'Close an exit ticket that {$a} or more have handed in.';
$string['app_cr_picabilletes_name'] = 'Ticket Clipper';
$string['app_cr_picabilletes_text'] = 'Nobody leaves without a ticket.';
$string['app_cr_quitatelones_how'] = 'Use the curtain or the spotlight on the board.';
$string['app_cr_quitatelones_name'] = 'Curtain Raiser';
$string['app_cr_quitatelones_text'] = 'Nobody sees the answer before its time.';
$string['app_cr_repartequipos_how'] = 'Make groups with a course list of {$a} students or more and leave them two minutes on screen, or keep them.';
$string['app_cr_repartequipos_name'] = 'Team Maker';
$string['app_cr_repartequipos_text'] = 'Makes teams with no complaints.';
$string['app_cr_sacanombres_how'] = 'Pick {$a} students in the same class with «Whose turn?».';
$string['app_cr_sacanombres_name'] = 'Name Picker';
$string['app_cr_sacanombres_text'] = 'Pulls names out of the hat, no tricks.';
$string['app_cr_salvaglobos_how'] = 'Finish a game of hangman.';
$string['app_cr_salvaglobos_name'] = 'Balloon Saver';
$string['app_cr_salvaglobos_text'] = 'Not a balloon bursts in their hands.';
$string['app_cr_sigueluces_how'] = 'Get a Simon sequence of 5 or more right.';
$string['app_cr_sigueluces_name'] = 'Light Chaser';
$string['app_cr_sigueluces_text'] = 'Never misses a light.';
$string['app_cr_tiradados_how'] = 'Throw the dice 10 times, or use «Many throws».';
$string['app_cr_tiradados_name'] = 'Dice Roller';
$string['app_cr_tiradados_text'] = 'Luck smiles on them.';
$string['app_cr_tocanotas_how'] = 'Play a whole song on the score.';
$string['app_cr_tocanotas_name'] = 'Note Player';
$string['app_cr_tocanotas_text'] = 'Sings in tune and plays in time.';
$string['app_cr_tocatimbres_how'] = 'Play 3 rounds of buzzers with {$a} devices or more.';
$string['app_cr_tocatimbres_name'] = 'Bell Ringer';
$string['app_cr_tocatimbres_text'] = 'Nobody gets to the buzzer first.';
$string['app_cr_top'] = 'Top level!';
$string['app_cr_trazacirculos_how'] = 'Use the ruler, the set squares, the protractor or the compass.';
$string['app_cr_trazacirculos_name'] = 'Circle Drawer';
$string['app_cr_trazacirculos_text'] = 'Their compass never goes astray.';
$string['app_cr_up'] = 'Up a level!';
$string['app_cr_weeks'] = 'Weeks with the board: {$a->n} of {$a->of}';
$string['app_cr_weeks_done'] = '{$a} weeks with the board: steady!';
$string['app_dl_again'] = 'Another round';
$string['app_dl_button'] = 'Duel';
$string['app_dl_challenge'] = 'The challenge';
$string['app_dl_challenge_ph'] = 'The challenge, the same for both (for example: make 3/4)';
$string['app_dl_close'] = 'Close the duel';
$string['app_dl_done'] = 'Done!';
$string['app_dl_first'] = '{$a} finished first!';
$string['app_dl_hint_compare'] = 'Two models side by side, to look at them together and talk about them.';
$string['app_dl_hint_together'] = 'Both at the same time, each in their half (on a multi-touch screen): the first to press «Done!» wins.';
$string['app_dl_hint_turns'] = 'One after the other, each with their own clock (for a projector or a screen of one touch): the faster one wins.';
$string['app_dl_mode'] = 'How they play';
$string['app_dl_mode_compare'] = 'Compare';
$string['app_dl_mode_together'] = 'At once';
$string['app_dl_mode_turns'] = 'In turns';
$string['app_dl_name'] = 'Who plays on this side';
$string['app_dl_opened'] = 'Duel: the same material in two halves.';
$string['app_dl_pick_two'] = 'Pick two';
$string['app_dl_restart'] = 'Start again';
$string['app_dl_side_n'] = 'Side {$a}';
$string['app_dl_start'] = 'Start';
$string['app_dl_tie'] = 'A tie!';
$string['app_dl_wins'] = '{$a->who} wins: {$a->time} (the other one, {$a->other})';
$string['app_ec_again'] = 'Again';
$string['app_ec_bars'] = 'Bars';
$string['app_ec_easy'] = 'Easy';
$string['app_ec_good'] = 'Well done!';
$string['app_ec_hard'] = 'Harder';
$string['app_ec_help'] = 'The board counts four and claps a rhythm; the class claps it back. Someone can tap its echo on the drum (or with the space bar), and the board says whether it matches; or you listen and say.';
$string['app_ec_level'] = 'Rhythms';
$string['app_ec_listen'] = 'Listen';
$string['app_ec_msg_count'] = 'The taps do not match: there were {$a->want} claps and {$a->got} taps.';
$string['app_ec_msg_listen'] = 'Listen!';
$string['app_ec_msg_right'] = 'A perfect echo!';
$string['app_ec_msg_start'] = 'Press «Listen»: the board claps, and then it is the class\'s turn.';
$string['app_ec_msg_turn'] = 'Your turn: clap it back, or tap it on the drum.';
$string['app_ec_msg_wrong'] = 'Nearly: look where it slipped.';
$string['app_ec_name'] = 'Clap echo';
$string['app_ec_new'] = 'Another rhythm';
$string['app_ec_normal'] = 'Normal';
$string['app_ec_pad'] = 'Boom!';
$string['app_ec_pad_label'] = 'Tap the rhythm here';
$string['app_ec_record'] = 'Record: {$a}';
$string['app_ec_slow'] = 'Slow';
$string['app_ec_speed'] = 'Speed';
$string['app_ec_streak'] = 'In a row: {$a}';
$string['app_ec_teacher'] = 'If they clap without the drum, you decide:';
$string['app_ed_confirm_delete'] = 'Sure? Press again';
$string['app_ed_default_name'] = 'List {$a}';
$string['app_ed_delete'] = 'Delete the list';
$string['app_ed_deleted'] = 'List deleted';
$string['app_ed_edit_list'] = 'Edit the list';
$string['app_ed_name'] = 'List name';
$string['app_ed_name_placeholder'] = 'For example: 5A';
$string['app_ed_need_one'] = 'Paste at least one name (one per line).';
$string['app_ed_new_list'] = 'New list';
$string['app_ed_note_local'] = 'Saved only on this computer, in this browser. It never leaves here.';
$string['app_ed_note_nostore'] = 'This browser won\'t allow saving: the list will last until you close the page.';
$string['app_ed_paste_placeholder'] = 'Paste your class list here
(you can copy it from a spreadsheet)';
$string['app_ed_saved'] = 'List “{$a->name}” saved with {$a->n} students';
$string['app_ed_students'] = 'Students (or words, questions…), one per line';
$string['app_er_again'] = 'Tap it again to see the correction';
$string['app_er_done'] = 'All mistakes found!';
$string['app_er_found'] = '{$a->n} of {$a->of} mistakes found';
$string['app_er_name'] = 'Spot the mistakes';
$string['app_er_show'] = 'Show the rest';
$string['app_er_tap'] = 'Tap the mistakes';
$string['app_ex_ai'] = 'Prompt for your AI';
$string['app_ex_ai_accept'] = 'Accept and go on';
$string['app_ex_ai_any'] = 'a topic of your choice';
$string['app_ex_ai_copied'] = 'Copied: paste it in your AI.';
$string['app_ex_ai_copy'] = 'Copy';
$string['app_ex_ai_count'] = 'How many';
$string['app_ex_ai_done'] = '{$a} exercises added below: check them before saving.';
$string['app_ex_ai_error'] = 'The AI of the site could not answer. {$a}';
$string['app_ex_ai_for_advanced'] = 'students of 16 and over (upper secondary or higher)';
$string['app_ex_ai_for_early'] = 'Early years children (3 to 6 years old)';
$string['app_ex_ai_for_primary'] = 'Primary pupils (6 to 12 years old)';
$string['app_ex_ai_for_secondary'] = 'Secondary students (12 to 16 years old)';
$string['app_ex_ai_go'] = 'Generate';
$string['app_ex_ai_hint'] = 'Write the topic, copy the text, paste it in your AI and paste what it answers in the box below.';
$string['app_ex_ai_hint_site'] = 'Write the topic and generate them here with the AI of the site, or copy the text for an AI of your own.';
$string['app_ex_ai_level'] = 'Level';
$string['app_ex_ai_none'] = 'The AI did not answer with exercises in the format. Try again or change the topic.';
$string['app_ex_ai_prompt'] = 'Write {$a->n} exercises for the game «{$a->game}» for {$a->level}, on «{$a->topic}».

Format (plain text, nothing else): {$a->rules} Separate one exercise from the next with a blank line, and start each one with its title on a line beginning with #.

Example:
{$a->example}

Answer only with the exercises, in the language of this text, without explanations or Markdown. Check that everything you write is correct.';
$string['app_ex_ai_topic'] = 'Topic';
$string['app_ex_ai_wait'] = 'The AI is writing them; it can take a minute.';
$string['app_ex_cancel'] = 'Cancel';
$string['app_ex_check'] = 'Check';
$string['app_ex_count'] = '{$a} exercises ready';
$string['app_ex_count_none'] = 'No exercise yet: check the format';
$string['app_ex_count_one'] = '1 exercise ready';
$string['app_ex_edit_title'] = '{$a}: my exercises';
$string['app_ex_example'] = 'Example: {$a}';
$string['app_ex_example_classify_advanced'] = '# Biomolecules
Carbohydrates: glucose, starch, cellulose, glycogen
Lipids: cholesterol, triglycerides, phospholipids, waxes
Proteins: haemoglobin, collagen, insulin, keratin
Nucleic acids: DNA, messenger RNA, transfer RNA, ribosomal RNA
? cholesterol: it is a lipid, even if it has no fatty acids

# Chemical bonds
Ionic: NaCl, KBr, CaO, MgCl₂
Covalent: H₂O, CO₂, CH₄, NH₃
Metallic: Fe, Cu, Al, Au

# Even and odd functions
Even: x², cos x, |x|
Odd: x³, sin x, 1/x
Neither: eˣ, ln x, x + 1
? |x|: f(−x) = f(x), as in x²

# Conditionals
Zero: If you heat ice, it melts; If it rains, the grass gets wet; If you mix red and yellow, you get orange
First: If it rains tomorrow, we will stay at home; If you study, you will pass; If you don\'t hurry, you will miss the bus
Second: If I had more time, I would learn Chinese; If she lived nearer, she would visit us more; If I were you, I would apologise
Third: If we had left earlier, we would have caught the train; If he had studied, he would have passed; If you had told me, I would have helped you

# Functions (for Venn)
Increasing on all of ℝ: x³, eˣ, 2x + 1
Odd: x³, sin x, 1/x
? x³: it is odd and it always increases';
$string['app_ex_example_classify_primary'] = '# Vertebrates
Mammals: dog, whale, bat, horse
Birds: penguin, hen, ostrich, eagle
Reptiles: turtle, snake, lizard
? bat: it flies, but it has fur and its young drink milk
? penguin: it does not fly, but it has feathers and lays eggs

# Kinds of words
Nouns: table, dog, joy, city
Adjectives: tall, green, happy, quick
Verbs: run, think, write, jump

# States of matter
Solid: ice, stone, wood
Liquid: water, oil, milk
Gas: water vapour, air, oxygen

# Numbers (for Venn)
Even numbers: 2, 4, 6, 8, 10, 12
Multiples of 3: 3, 6, 9, 12, 15
? 6: it is even and a multiple of 3

# Angles
Acute: 30°, 45°, 60°, 89°
Right: 90°
Obtuse: 100°, 120°, 150°';
$string['app_ex_example_classify_secondary'] = '# Rocks
Igneous: granite, basalt, pumice, obsidian
Sedimentary: limestone, sandstone, conglomerate, coal
Metamorphic: marble, slate, quartzite, gneiss
? marble: it is limestone changed by pressure and heat

# The five kingdoms
Animals: jellyfish, sponge, earthworm, octopus
Plants: fern, moss, pine, wheat
Fungi: mushroom, yeast, bread mould
Protists: amoeba, paramecium, green alga
Monera: bacterium, cyanobacterium, lactobacillus
? sponge: it is an animal, even if it lives fixed to the sea floor
? yeast: it is a fungus with only one cell

# Physical and chemical changes
Physical: melting ice, breaking a glass, dissolving sugar in water, boiling water
Chemical: burning paper, a nail rusting, cooking an egg, milk turning sour
? dissolving sugar in water: the sugar is still sugar; when the water evaporates, it appears again

# Countable or uncountable
Countable: apple, chair, idea, coin
Uncountable: water, information, advice, furniture

# Numbers (the smallest set)
Natural: 3, 17, 100
Negative integers: −4, −12, −1
Rational, not integers: 1/2, 0.75, −2.5
Irrational: √2, π, √5
? 0.75: it is 3/4, a fraction

# Divisibility (for Venn)
Multiples of 4: 4, 8, 12, 16, 20, 24
Multiples of 6: 6, 12, 18, 24, 30
? 12: it is a multiple of 4 and of 6, like every multiple of 12';
$string['app_ex_example_errors_advanced'] = '# DNA
DNA is a double helix whose bases pair like this: adenine with [cytosine|thymine] and guanine with [uracil|cytosine|uracil is only found in RNA]. Watson and Crick published its structure in [1963|1953].

# pH
At 25 °C, a neutral solution has a pH of [0|7], and a solution with a pH of 3 is [basic|acidic].

# Novels
Frankenstein was written by [Bram Stoker|Mary Shelley], and Dracula by [Mary Shelley|Bram Stoker].

# Derivatives
The derivative of sin x is [−cos x|cos x], and the derivative of eˣ is [x·eˣ⁻¹|eˣ|the exponential is its own derivative].

# The Berlin Wall
The Berlin Wall fell in [1991|1989], and Germany was reunified in [1989|1990].

# Newton
According to Newton\'s second law, force is equal to mass times [velocity|acceleration], and it is measured in [joules|newtons|the joule measures energy and work].';
$string['app_ex_example_errors_primary'] = '# Columbus
Columbus reached America in [1942|1492|in 1492, not in 1942] with three [boats|caravels/ships]: the Pinta, the Niña and the [Santa Lucía|Santa María].

# Spelling
Yesterday [their|there] was a dog in [are|our] garden, and it [eated|ate] my sandwich.

# Shapes
A triangle has [four|three] sides and its angles add up to [360|180|the angles of a triangle add up to 180 degrees] degrees.

# Plants
Plants make their food with [moonlight|sunlight] in a process called [respiration|photosynthesis].

# Capitals
Paris is the capital of [Italy|France], and the river that crosses it is the [Thames|Seine].';
$string['app_ex_example_errors_secondary'] = '# The cell
In the cell, the DNA is kept in the [ribosome|nucleus], energy is released in the [vacuoles|mitochondria] and, in plants, photosynthesis happens in the [lysosomes|chloroplasts].

# Spelling
[Its|It\'s] too late: the shop has closed [it\'s|its] doors, and [their|they\'re] not opening again [untill|until] Monday.

# Pythagoras
In [an equilateral|a right-angled] triangle, the square of the hypotenuse is equal to the [difference|sum] of the squares of the other two sides: if they are 3 and 4, the hypotenuse is [7|5|√(9 + 16) = 5].

# The French Revolution
The French Revolution began in [1798|1789] with the storming of the [Tower of London|Bastille], and it ended when [Louis XIV|Napoleon Bonaparte] took power.

# Light and sound
Light travels in a vacuum at about [300,000 km/h|300,000 km/s|300,000 kilometres per second, not per hour], but sound cannot travel through [air|a vacuum|sound needs a medium, such as air or water].

# Rivers
The longest river in the United Kingdom is the [Thames|Severn], and it flows into the [North Sea|Bristol Channel|the Thames flows into the North Sea].';
$string['app_ex_example_order_advanced'] = '# Protein synthesis (eukaryotes)
Transcription of DNA into messenger RNA
Processing of the messenger RNA
Export of the messenger RNA to the cytoplasm
Translation in the ribosome
Folding of the protein

# Cellular respiration
Glycolysis
Oxidative decarboxylation of pyruvate
Krebs cycle
Electron transport chain and oxidative phosphorylation

# Electromagnetic waves, from lower to higher frequency
Radio waves
Microwaves
Infrared
Visible light
Ultraviolet
X-rays
Gamma rays

# Art movements
Renaissance
Baroque
Neoclassicism
Romanticism
Realism
Impressionism
Cubism

# The First World War
Assassination of Archduke Franz Ferdinand
Austria-Hungary declares war on Serbia
Germany invades Belgium
The United States enters the war
Armistice';
$string['app_ex_example_order_primary'] = '# The water cycle
Evaporation
Condensation
Precipitation
Collection
? Condensation: the water vapour cools down and turns into drops

# The phases of the Moon
New moon
First quarter
Full moon
Last quarter

# From seed to plant
Seed
Germination
Seedling
Adult plant
Flower
Fruit

# The planets from the Sun
Mercury
Venus
Earth
Mars
Jupiter
Saturn
Uranus
Neptune

# The ages of history
Prehistory
Ancient history
Middle Ages
Early modern period
Late modern period

# Solving a problem
Read the problem
Write down the data
Think which operation
Calculate
Check the result';
$string['app_ex_example_order_secondary'] = '# Layers of the Earth, from the outside in
Crust
Mantle
Outer core
Inner core

# Levels of organisation of living things
Atom
Molecule
Cell
Tissue
Organ
Organ system
Organism

# Mitosis
Prophase
Metaphase
Anaphase
Telophase
? Metaphase: the chromosomes line up in the middle of the cell

# The French Revolution (1789-1799)
Storming of the Bastille
Declaration of the Rights of Man and of the Citizen
Proclamation of the Republic
Execution of Louis XVI
Napoleon\'s coup

# Order of operations
Brackets
Powers and roots
Multiplication and division
Addition and subtraction';
$string['app_ex_example_whoami_advanced'] = '# Biology
= The ribosome / ribosome
I have no membrane.
I am made of RNA and proteins.
I am free in the cytoplasm or attached to the rough endoplasmic reticulum.
I translate messenger RNA into proteins.

# Physics
= Albert Einstein / Einstein
I was born in Ulm in 1879.
I worked at the patent office in Bern.
I was awarded the Nobel Prize for explaining the photoelectric effect.
I formulated the theory of relativity.

# History
= Napoleon Bonaparte / Napoleon / Bonaparte
I was born in Corsica in 1769.
I staged a coup in 1799.
My troops occupied Spain and in 1808 the Peninsular War began.
I crowned myself Emperor of the French and lost at Waterloo.

# Philosophy
= Plato
I founded the Academy in Athens.
Aristotle was my student.
I was a disciple of Socrates.
I wrote The Republic, with the allegory of the cave.

# Economics
= Adam Smith / Smith
I was born in Scotland in 1723.
I explained the division of labour with a pin factory.
I wrote about the invisible hand of the market.
I wrote The Wealth of Nations.

# Literature
= George Orwell / Orwell
I fought in the Spanish Civil War.
I wrote Homage to Catalonia.
My real name was Eric Arthur Blair.
I wrote Animal Farm and Nineteen Eighty-Four.';
$string['app_ex_example_whoami_primary'] = '# Science
= Marie Curie / Curie
I was born in Warsaw in 1867.
I won two Nobel prizes, in two different sciences.
I discovered polonium and radium.
I studied radioactivity with Pierre, my husband.

# Animals
= The dolphin / dolphin
I live in the sea, but I am not a fish.
I breathe air and have to come up to the surface.
I find my way with echoes.
I am a very clever and playful mammal.

# Geography
= Everest / Mount Everest
I am in Asia, between two countries.
I am in the Himalayas.
I am more than 8,800 metres high.
I am the highest mountain in the world.

# Art
= Leonardo da Vinci / Leonardo
I was born in Italy in 1452.
I drew flying machines centuries before aeroplanes.
I painted The Last Supper.
I painted the Mona Lisa.

# Literature
= William Shakespeare / Shakespeare
I was born in Stratford-upon-Avon.
My plays were performed at the Globe theatre in London.
I wrote Romeo and Juliet.
I wrote Hamlet.';
$string['app_ex_example_whoami_secondary'] = '# History
= Charles V / Charles I / Charles
I was born in Ghent in the year 1500.
I retired to the monastery of Yuste.
I was Holy Roman Emperor.
I was the grandson of Ferdinand and Isabella, and King of Spain.

# Science
= Isaac Newton / Newton
I was born in England in the 17th century.
I was a professor at Cambridge and President of the Royal Society.
I split white light with a prism.
I formulated the law of universal gravitation and three laws of motion.

# Chemistry
= Oxygen / O
My atomic number is 8.
I am almost half of the mass of the Earth\'s crust.
I am about 21% of the air.
Without me there is no burning, and living things breathe me.

# Geography
= The Nile / Nile
I flow into the Mediterranean Sea through a delta.
One of my sources is in the African Great Lakes region.
I flow through Sudan and Egypt.
The pyramids of Giza were built near me.

# Art
= Vincent van Gogh / Van Gogh
I was born in the Netherlands in 1853.
I sold very few paintings in my lifetime.
I lived and painted in Arles, in the south of France.
I painted The Starry Night and Sunflowers.

# Mathematics
= Pythagoras
I was born on the island of Samos.
I founded a school in Croton, in the south of Italy.
For my school, everything was number.
A theorem about right-angled triangles bears my name.';
$string['app_ex_exercise'] = 'Exercise';
$string['app_ex_format'] = 'A line starting with # is the title, and one starting with ? explains an item: «? item: why».';
$string['app_ex_help_classify'] = '«Group: item, item, item», one group per line (with ; instead of , if the items carry commas). An item in two groups goes in their intersection (Venn).';
$string['app_ex_help_errors'] = 'The text, with each mistake as [what it says|right], several right answers with /, and the why as a third part: [1942|1492|not in 1942].';
$string['app_ex_help_order'] = 'The items in their right order, one per line.';
$string['app_ex_help_whoami'] = '«= answer» on the first line (other accepted answers after /), then the clues, from the hardest to the easiest.';
$string['app_ex_mine'] = 'My exercises';
$string['app_ex_press_start'] = 'Choose the exercise and press «Start»';
$string['app_ex_save'] = 'Save';
$string['app_ex_text'] = 'Your exercises, a blank line between them';
$string['app_ex_untitled'] = 'Exercise {$a}';
$string['app_ex_why'] = 'Why';
$string['app_fin_ok'] = 'OK';
$string['app_fin_time'] = 'Time\'s up!';
$string['app_fw_compare'] = 'Colour the same amount in another row';
$string['app_fw_help'] = 'Tap the pieces to colour them: the same width is the same amount. The ruler slides from its red handle.';
$string['app_fw_l_decimal'] = 'Decimals';
$string['app_fw_l_fraction'] = 'Fractions';
$string['app_fw_l_none'] = 'Nothing';
$string['app_fw_l_percent'] = 'Percentages';
$string['app_fw_labels'] = 'On the pieces';
$string['app_fw_rows'] = 'Rows';
$string['app_fw_ruler'] = 'Ruler to compare';
$string['app_fw_start'] = 'Colour some pieces';
$string['app_fx_all'] = 'All the symbols';
$string['app_fx_delete'] = 'Delete';
$string['app_fx_hint'] = 'Write it in one line: 3/4, x^2, sqrt(2), {x + y = 3; x − y = 1}; chemistry with ce(2H2 + O2 -> 2H2O). Tab goes to the next box □.';
$string['app_fx_n_root'] = 'root';
$string['app_fx_n_sin'] = 'sin';
$string['app_fx_n_sqrt'] = 'sqrt';
$string['app_fx_n_unit'] = 'unit';
$string['app_fx_p_abs'] = 'Absolute value';
$string['app_fx_p_box'] = 'A box to fill in';
$string['app_fx_p_chem'] = 'Molecule or ion: ce(H2SO4), ce(Fe^3+)';
$string['app_fx_p_equilibrium'] = 'Equilibrium: ce(N2 + 3H2 <=> 2NH3)';
$string['app_fx_p_frac'] = 'Fraction';
$string['app_fx_p_index'] = 'Index';
$string['app_fx_p_int'] = 'Integral';
$string['app_fx_p_lim'] = 'Limit';
$string['app_fx_p_mixed'] = 'Mixed number';
$string['app_fx_p_paren'] = 'Brackets';
$string['app_fx_p_power'] = 'Power';
$string['app_fx_p_reaction'] = 'Reaction: ce(2H2 + O2 -> 2H2O)';
$string['app_fx_p_root'] = 'Root of index n';
$string['app_fx_p_sqrt'] = 'Square root';
$string['app_fx_p_square'] = 'Squared';
$string['app_fx_p_sum'] = 'Sum';
$string['app_fx_p_sys'] = 'System of equations';
$string['app_fx_p_units'] = 'Units, upright: unit(m/s^2)';
$string['app_fx_p_vec'] = 'Vector';
$string['app_fx_ph'] = 'For example: 3/4 + 1/2 = □';
$string['app_fx_put'] = 'Put it on the board';
$string['app_fx_save'] = 'Save the changes';
$string['app_fx_title'] = 'Formula';
$string['app_g_and_now'] = 'And now…';
$string['app_g_clear'] = 'Clear the result';
$string['app_g_drag_hint'] = 'Drag to change the order';
$string['app_g_empty_start'] = 'Choose a list (or paste the names) and press “Make groups”.';
$string['app_g_goes_to'] = '{$a->name}: group {$a->n}';
$string['app_g_group_n'] = 'Group {$a}';
$string['app_g_how'] = 'How shall we split them?';
$string['app_g_less'] = 'One fewer';
$string['app_g_list_empty'] = 'That list is empty.';
$string['app_g_made'] = '{$a} groups made';
$string['app_g_make'] = 'Make groups';
$string['app_g_mode_num'] = 'No. of groups';
$string['app_g_mode_size'] = 'Students per group';
$string['app_g_more'] = 'One more';
$string['app_g_n_groups'] = '{$a} groups';
$string['app_g_n_size'] = '{$a} students per group';
$string['app_g_need_two'] = 'At least two names are needed.';
$string['app_g_paste_hint'] = 'Paste your class\'s names, one per line.';
$string['app_g_paste_now'] = 'Paste names now…';
$string['app_g_paste_placeholder'] = 'Paste the names here, one per line';
$string['app_g_pasted_aria'] = 'Pasted names, one per line';
$string['app_g_place_all'] = 'Place everyone now';
$string['app_g_roles'] = 'A role for each one';
$string['app_g_roles_done'] = 'Roles handed out';
$string['app_g_roles_edit'] = 'Change the roles';
$string['app_g_roles_hint'] = 'One per line (up to 6).';
$string['app_g_roles_list'] = 'Roles, one per line';
$string['app_g_roles_rotate'] = 'Other roles';
$string['app_g_roles_set'] = 'Set of roles';
$string['app_g_roles_set_music'] = 'Music';
$string['app_g_roles_set_own'] = 'My own';
$string['app_g_roles_set_reading'] = 'Reading';
$string['app_g_roles_set_science'] = 'Science';
$string['app_g_roles_set_tasks'] = 'Group tasks';
$string['app_g_save_course'] = 'Save as course groups';
$string['app_g_save_failed'] = 'Could not save them. Try again';
$string['app_g_save_list'] = 'Save as a list';
$string['app_g_saved'] = 'Saved to the course';
$string['app_g_saved_announce'] = 'Saved to the course as {$a}';
$string['app_g_saved_as'] = 'Saved to the course as “{$a}”.';
$string['app_g_saving'] = 'Saving…';
$string['app_g_sizes'] = '{$a->a} and {$a->b}';
$string['app_g_students'] = 'Students';
$string['app_g_summary_many'] = '{$a->n} students in {$a->k} groups of {$a->size}.';
$string['app_g_summary_one'] = '{$a->n} students in {$a->k} group of {$a->size}.';
$string['app_g_suspense'] = 'Deal them out with suspense';
$string['app_ga_clue'] = 'Clue: {$a}';
$string['app_ga_clue_optional'] = 'Clue (optional)';
$string['app_ga_delete'] = 'Delete';
$string['app_ga_from_glossary'] = 'Glossaries of the course';
$string['app_ga_from_lists'] = 'At random from your lists';
$string['app_ga_game'] = 'Game';
$string['app_ga_lost'] = 'Oops! It was “{$a}”';
$string['app_ga_new_word'] = 'New word';
$string['app_ga_press_new_word'] = 'Choose the word and press “New word”';
$string['app_ga_secret_word'] = 'Secret word (hidden)';
$string['app_ga_settings'] = 'Settings';
$string['app_ga_start'] = 'Start';
$string['app_ga_try'] = 'Try';
$string['app_ga_type_it'] = 'I\'ll type it';
$string['app_ga_whole_class'] = 'Whole class';
$string['app_ga_word'] = 'Word';
$string['app_ga_words_lang'] = 'Language of the words';
$string['app_gb_area_perimeter'] = 'Area: {$a->area} little squares · Perimeter: {$a->perimeter}';
$string['app_gb_close'] = 'Tap the first peg to close the shape';
$string['app_gb_drag'] = 'Drag a corner to change the shape';
$string['app_gb_help'] = 'Tap pegs to stretch a band: the first peg again closes the shape, the last one again leaves it as a line. Drag a corner to move it to another peg.';
$string['app_gb_length'] = 'Length: {$a}';
$string['app_gb_measure'] = 'Area and perimeter';
$string['app_gb_n_by_n'] = '{$a} × {$a}';
$string['app_gb_next'] = 'Tap the next peg';
$string['app_gb_size'] = 'Pegs';
$string['app_gb_squares'] = 'Show the little squares';
$string['app_gb_start'] = 'Tap a peg to start a band';
$string['app_gd_ahorcado_how'] = 'Type the word yourself (it is typed hidden), use the board\'s words, or take a glossary of the course.
A clue helps the youngest and makes the older ones think.
«Uncover a letter» costs a balloon: use it when they get stuck.
With «Language of the words», in English or French, with its keyboard.
In Early years, «First letter of a name» needs a class list.';
$string['app_gd_ahorcado_scene'] = 'In Early years circle time, Pablo\'s photo appears and under it «_ABLO». Three big letters: P, M and S. Pablo shouts his before anyone else; next comes María, and the class is already looking for the M.';
$string['app_gd_ahorcado_sources'] = 'Ferreiro, E. and Teberosky, A. (1979). Los sistemas de escritura en el desarrollo del niño. Siglo XXI.';
$string['app_gd_ahorcado_stages'] = 'early|The first letter of a classmate\'s name, with their photo.
primary|Words of the topic and spelling; balloons that go.
secondary|Words of the subject from the glossary; balloons that stay.
advanced|Terms of the subject and foreign languages, with the language of the words.';
$string['app_gd_ahorcado_what'] = 'Guess a word letter by letter before the balloons run out; in Early years, the first letter of a classmate\'s name.';
$string['app_gd_ahorcado_why'] = 'In Early years the game uses the names of the class, because a child\'s own name is the first stable written form with meaning for them (Ferreiro and Teberosky, 1979).
Balloons that go, instead of a hanged figure, take the punishment out of the classic picture.';
$string['app_gd_ahorcado_works'] = 'Spelling and vocabulary: which letters a word has, and in what order.
Thinking which letters are more likely (vowels first, then the common ones).
In Early years, recognising the first letter of the names of the class.
With a glossary of the course, the words of the subject with their definition as the clue.';
$string['app_gd_all'] = 'All the guides';
$string['app_gd_asi_how'] = 'Teach them at the start of the year, one by one, explaining what is done with each.
Put the sign up before each activity starts, not when there is already noise.
Praise aloud when the class follows it.';
$string['app_gd_asi_scene'] = 'After the group work, the teacher taps «Listen» and the sign fills the screen. The groups turn to the board before she says a word: they practised it in the first week.';
$string['app_gd_asi_sources'] = 'Simonsen, B., Fairbanks, S., Briesch, A., Myers, D. and Sugai, G. (2008). Evidence-based practices in classroom management: Considerations for research to practice. Education and Treatment of Children, 31(3), 351–380.|https://doi.org/10.1353/etc.0.0007';
$string['app_gd_asi_stages'] = 'early|Few signs, always the same, each with its gesture.
primary|For every change of activity.
secondary|When group or individual work begins.
advanced|In workshops and labs.';
$string['app_gd_asi_what'] = 'Full-screen signs with the way of working of the moment: silence, quiet voices, in pairs, in groups, hands up, listen.';
$string['app_gd_asi_why'] = 'A review of classroom management practices with empirical support points to posting, teaching, reviewing and reinforcing the expectations of the class, and to giving structure with clearly defined routines (Simonsen and others, 2008). The sign keeps the expectation of the moment in sight.';
$string['app_gd_asi_works'] = 'The class knowing what is expected at each moment.
Quicker changes between activities.
Fewer orders given aloud.';
$string['app_gd_azar_how'] = 'To draw lots, the wheel with the class list, with no repeats until everyone has come out.
Before throwing, they bet which sum will come up most with two dice, and why.
«Many throws»: ten, then a hundred, then a thousand; they compare the chart with what is expected.
The dice with operations for mental arithmetic: throw and work it out.
Cards and coins for simple probability games (heads or tails, the suit of a card).';
$string['app_gd_azar_scene'] = 'In Year 8 the class bets: with two dice, will 7 or 12 come up more? There are votes for both. With ten throws 12 wins by chance and there are protests; with a thousand, the bar of 7 is about six times that of 12, as the chart of what is expected says.';
$string['app_gd_azar_sources'] = 'Konold, C. (1989). Informal conceptions of probability. Cognition and Instruction, 6(1), 59–98.|https://srri.umass.edu/publications/konold-1989icp';
$string['app_gd_azar_stages'] = 'early|Counting the dots of a die, and drawing lots for who starts.
primary|Sums with dice, mental arithmetic and what is more likely.
secondary|Frequencies and probability: the law of large numbers with many throws.
advanced|Probability distributions (the sum of two dice) and simulation.';
$string['app_gd_azar_what'] = 'Wheel, dice, coins and cards to draw lots and to play, and many throws at once with their chart of frequencies.';
$string['app_gd_azar_why'] = 'Faced with chance, many people try to guess what the next throw will bring, as if each one had a right answer: Konold (1989) called it the outcome approach. Probability speaks of what happens in the long run, not of one throw.
«Many throws» shows it: with ten throws the bars jump about, and with a thousand they come close to what they should be; with two dice, a sum of 7 comes up more than 2 or 12.';
$string['app_gd_azar_works'] = 'Drawing lots fairly: turns, groups, who starts.
Operations with dice: adding, subtracting, multiplying what comes up.
Probability: what is more likely, and why.
Frequencies: what comes up in many throws against what should.
The difference between what happens once and what happens in the long run.';
$string['app_gd_balanza_how'] = '«Compare»: they predict which way it will lean before the weight goes on.
Without numbers (Early years), only cubes: which pan weighs more, and how many to add to make them equal.
With numbers: several ways to balance 10 (5 + 5, 5 + 2 + 2 + 1…).
«Equations»: a new one or one they write; they say what they would take off both pans before touching anything.
Taking something off one pan only, on purpose: the scale tips and the equation becomes an inequality.
«Open the boxes» at the end, to check the value of x.
«Duel»: the same material in two halves for two students with the same challenge; at once on a multi-touch screen, in turns with a clock each on a projector, or «Compare» to put two models side by side.';
$string['app_gd_balanza_scene'] = 'In Year 8, the teacher writes 3x + 1 = x + 9. A student wants to «move the 1 over and subtract». She takes a weight off one pan only and the scale tips; the class sees that it has to come off the other one too, and then a box from each side: «move it over» stops being a rule to learn by heart.';
$string['app_gd_balanza_sources'] = 'Otten, M., Van den Heuvel-Panhuizen, M. and Veldhuis, M. (2019). The balance model for teaching linear equations: a systematic literature review. International Journal of STEM Education, 6, 30.|https://doi.org/10.1186/s40594-019-0183-2
Vlassis, J. (2002). The balance model: Hindrance or support for the solving of linear equations with one unknown. Educational Studies in Mathematics, 49(3), 341–359.|https://doi.org/10.1023/A:1020229023965';
$string['app_gd_balanza_stages'] = 'early|Comparing with cubes: more, less and the same.
primary|The signs >, < and =, breaking numbers up and, at the end of the stage, simple equations such as x + 3 = 8.
secondary|First-degree equations with the unknown on one side or on both (3x + 2 = x + 10).';
$string['app_gd_balanza_what'] = 'A two-pan balance: it compares weights in Early years and Primary and, from Secondary, shows equations with boxes of an unknown weight.';
$string['app_gd_balanza_why'] = 'In an equation, the equals sign says that both sides are worth the same; on a balance, that can be seen: take something off one pan and not the other, and it tips. That is why it is one of the most used models to teach how to solve equations.
A review of 34 studies (Otten, Van den Heuvel-Panhuizen and Veldhuis, 2019) finds it widely used to support solving linear equations, but no clear pattern in its results: it is a more complex tool than it looks, and it is worth using with a purpose, not as a trick. Vlassis (2002) weighs up the arguments of those who defend it and those who reject it.
It has a limit worth saying in class: there are no negative weights, so equations with negative numbers need another model.';
$string['app_gd_balanza_works'] = 'Comparing amounts: more, less, the same, and the signs >, < and =.
A sum as a weight: 5 weighs the same as 2 + 2 + 1.
The equals sign as a balance between two sides, not as «the answer comes next».
Solving first-degree equations doing the same on both sides: taking off and sharing out.
Inequalities: what is seen when the scale tips (2x + 2 < 11).';
$string['app_gd_base10_how'] = '«Build a number»: they make it with blocks and read it as the sum of its parts.
With ten in one column, «Swap 10 for 1» groups them; «Break into 10» does the opposite.
«Hide the number» and «What number is it?» to read it from the blocks alone.
To subtract with borrowing, they break a ten before taking away: the same as on paper.
In another base, the same swaps are of that number of blocks, and the number is also written in that base («234 in base 5»).
«Duel»: the same material in two halves for two students with the same challenge; at once on a multi-touch screen, in turns with a clock each on a projector, or «Compare» to put two models side by side.';
$string['app_gd_base10_scene'] = 'In Year 3, the teacher asks for 52 minus 17. A student says 7 cannot be taken from 2. He breaks a ten into ten ones with a tap, takes seven away, and the class sees what borrowing one means before writing it down.';
$string['app_gd_base10_sources'] = 'Dienes, Z. P. (1960). Building Up Mathematics. Hutchinson Educational.';
$string['app_gd_base10_stages'] = 'early|Now and then: counting ones and seeing that ten make a rod.
primary|Place value, carrying in additions and borrowing in subtractions.
secondary|Other bases: binary and hexadecimal in technology; and for those who still struggle with place value.
advanced|In teacher training, to teach the decimal number system.';
$string['app_gd_base10_what'] = 'Ones, tens, hundreds and thousands on a place-value mat: the number they make, part by part.';
$string['app_gd_base10_why'] = 'Swapping ten for one (grouping) and one for ten (breaking) is what lies behind carrying and borrowing in written sums: with the blocks it is done in sight before it is done on paper.
Zoltan Dienes, who set out his theory of how mathematics is learnt in Building Up Mathematics (1960), made multibase blocks known for teaching place value: the same idea in base 2, 5 or 16 shows that ten is only one choice.';
$string['app_gd_base10_works'] = 'Place value: the 3 in 30 is not worth the same as the 3 in 300.
Grouping ten of one kind into one of the next, and breaking one into ten.
Adding and subtracting with carrying and borrowing, knowing why at each step.
Reading and writing numbers as the sum of their parts («100 + 30 + 12 = 142»).
Other bases (2, 5, 16…): place value without the ten, for technology and for understanding the system.';
$string['app_gd_button'] = 'Teacher\'s guide';
$string['app_gd_calc_how'] = 'With «Estimate first», the result shows «?» until you press «Show the result» (with a keyboard, «=» or Enter too): first they estimate, then they check.
With «Step by step», a combined operation is worked out line by line: what is about to be done is underlined, and what has just been worked out is in green. Ask them which comes next before showing it.
To check a sum done in the notebook, line by line against the steps.
Patterns: multiply by 10 several times, divide by 3, see the decimals that repeat.
In Secondary, the scientific one for powers, roots, trigonometry and powers of ten; «2nd» gives the inverse functions.';
$string['app_gd_calc_scene'] = 'In Year 7, the teacher asks how much 1 divided by 3 is. Someone says 0.3. They key it in and threes fill the screen to the end: the class sees that the decimal does not finish, and from there comes the idea of a recurring decimal.';
$string['app_gd_calc_sources'] = 'Ellington, A. J. (2003). A meta-analysis of the effects of calculators on students\' achievement and attitude levels in precollege mathematics classes. Journal for Research in Mathematics Education, 34(5), 433–463.';
$string['app_gd_calc_stages'] = 'primary|Combined operations step by step, with and without brackets; estimating before calculating; checking sums.
secondary|The scientific one: powers, roots, powers of ten; the order of operations with powers and negative numbers.
advanced|Functions, trigonometry in degrees or radians, and logarithms.';
$string['app_gd_calc_what'] = 'A big calculator on the board: basic in Primary and scientific from Secondary. «Step by step» shows how a combined operation is worked out, and «Estimate first» hides the result until the class has said how much it will be.';
$string['app_gd_calc_why'] = 'A meta-analysis of 54 studies (Ellington, 2003) found that, when the calculator was also used in the tests, the skills of operating and of solving problems got better, and so did the attitude towards mathematics.
Projected, everyone sees the same keys and the same result, and they can think aloud about what to key in before doing it.';
$string['app_gd_calc_works'] = 'Checking the results of written or mental calculation.
The order of operations: brackets, powers, × and ÷, + and −, one step at a time.
Estimating before calculating.
Exploring patterns: what happens when multiplying by 10, by 0.1…
Focusing on the problem when the sums are long.
The scientific one: powers, roots, functions, powers of ten.';
$string['app_gd_clasificar_how'] = '«Sort»: a card and then its box; on checking, the wrong ones go back.
«Odd one out»: four cards, three of a group and one of another; they say why it does not fit before tapping it.
«Venn»: two groups that share items, such as the multiples of 4 and those of 6.
In «My exercises», one group per line («Group: item, item»); the examples of each level serve as a model.';
$string['app_gd_clasificar_scene'] = 'In Year 8, the odd one out shows limestone, sandstone, marble and coal. A student says coal is the odd one because it is not a stone. She taps marble once the class reminds her how it forms: it is a metamorphic rock, and the other three are sedimentary.';
$string['app_gd_clasificar_sources'] = 'Inhelder, B. and Piaget, J. (1964). The Early Growth of Logic in the Child: Classification and Seriation. London: Routledge & Kegan Paul.
Metcalfe, J. (2017). Learning from errors. Annual Review of Psychology, 68, 465–489.|https://doi.org/10.1146/annurev-psych-010416-044022';
$string['app_gd_clasificar_stages'] = 'primary|Animals, kinds of words, states of matter, angles.
secondary|Rocks, the five kingdoms, physical and chemical changes, sets of numbers.
advanced|Biomolecules, chemical bonds, even and odd functions, kinds of sentences.';
$string['app_gd_clasificar_what'] = 'Cards shared out into groups; also as «Odd one out» (three of a group and one of another) and as a Venn diagram (one group, the other or both).';
$string['app_gd_clasificar_why'] = 'Sorting is grouping things by what they have in common, and class inclusion (every dog is a mammal, but not the other way round) is one of the foundations of logical reasoning that Inhelder and Piaget studied (1964).
Each mistake sends the card back with its why, if it has one: mistakes corrected straight away help learning (Metcalfe, 2017).
In the Venn diagram, the zone in the middle makes them look at two criteria at once.';
$string['app_gd_clasificar_works'] = 'Sorting by a criterion, and saying which one.
The cases that mislead: a bat flies, but it is a mammal.
In the odd one out, finding what does not fit and why.
In the Venn diagram, seeing that an item can belong to two classes at once.';
$string['app_gd_close'] = 'Close the guide';
$string['app_gd_codigo_how'] = 'Write the code (2 to 8 numbers or letters) and one clue per line; they are shown one by one.
A countdown adds excitement; without it, more calm to think.
In groups, each group solves one clue and brings its digit.
When it opens, a final message (the next step, the homework).';
$string['app_gd_codigo_scene'] = 'Last class of the term in Year 8: four clues, one per group, each with a proportion problem. When the fourth group calls out its digit and the lock opens, the message says where the review sheet for the test is.';
$string['app_gd_codigo_sources'] = 'Veldkamp, A., van de Grint, L., Knippels, M.-C. P. J. and van Joolingen, W. R. (2020). Escape education: A systematic review on escape rooms in education. Educational Research Review, 31, 100364.|https://doi.org/10.1016/j.edurev.2020.100364';
$string['app_gd_codigo_stages'] = 'primary|Clues of arithmetic and reading; the example lock to start with.
secondary|Problems of the subject in a chain, in groups.
advanced|Case studies, and review before a test.';
$string['app_gd_codigo_what'] = 'A lock with a code that opens by solving clues, as in an escape room, with a countdown if wanted.';
$string['app_gd_codigo_why'] = 'A review of 39 escape rooms in education found that the great majority of students enjoyed them and that teachers saw them as highly engaged, and that they serve to practise teamwork. On the other hand, there is hardly any evidence that new content is learnt with them (Veldkamp and others, 2020). Better to use it to review and apply what has already been worked on.';
$string['app_gd_codigo_works'] = 'Solving problems in a chain: each clue gives a digit.
Working as a team and talking to each other.
Reviewing any subject as a challenge.';
$string['app_gd_collapse'] = 'Back to the side';
$string['app_gd_cuerpos_how'] = 'Choose a shape; drag to turn it, and the wheel or two fingers bring it closer.
«Unfold» opens it slowly into its net and shows it from above; «Fold» closes it. «Open it little by little» stops it halfway, to ask which face will go where.
«Another net»: for the small shapes, all their nets one by one (the cube has 11); for the big ones, a new one each time.
Tap a face to paint it: paint two opposite faces of the cube and unfold it to see where they end up.
«Count»: the board numbers the faces, the edges or the vertices one by one; another tap, all at once.
«See through» shows the hidden edges, dashed. «Front», «From above» and «Side» give the views without perspective.';
$string['app_gd_cuerpos_scene'] = 'In fifth year, the teacher paints the top face of the cube red, turns it over and paints the bottom one yellow. She opens it halfway and asks where the yellow one will be in the net. Hands go up, and the class is divided.
She unfolds it: the red and the yellow end up on both sides of the same square, one above the cross and one below. Then they go through the eleven nets and, before each one unfolds, the class points to where the red one will land.';
$string['app_gd_cuerpos_sources'] = 'Euler, L. (1758). Elementa doctrinae solidorum. Novi Commentarii academiae scientiarum Petropolitanae, 4, 109–140 (E230).|https://scholarlycommons.pacific.edu/euler-works/230/
Uttal, D. H., Meadow, N. G., Tipton, E., Hand, L. L., Alden, A. R., Warren, C. and Newcombe, N. S. (2013). The malleability of spatial skills: A meta-analysis of training studies. Psychological Bulletin, 139(2), 352–402.|https://doi.org/10.1037/a0028446';
$string['app_gd_cuerpos_stages'] = 'early|The cube, the sphere, the cylinder, the cone, the pyramid and the cuboid: recognising them, turning them and finding things in the classroom with their shape.
primary|Prisms and pyramids with their elements; round solids; nets.
secondary|Regular polyhedra, Euler\'s formula and the views of a solid.
advanced|The views (front, top and side) in technical drawing, and the nets of the polyhedra.';
$string['app_gd_cuerpos_what'] = '3D shapes that turn with a finger and unfold into their nets: prisms, pyramids, round solids and the regular polyhedra. The board counts their faces, edges and vertices.';
$string['app_gd_cuerpos_why'] = 'Spatial skills can be trained: in a meta-analysis of 217 studies, Uttal and colleagues (2013) found an average improvement of almost half a standard deviation over the control groups, which lasted over time and carried over to spatial tasks that had not been trained. They suggest that a spatially rich education may increase participation in mathematics, science and engineering.
In a convex polyhedron, faces + vertices − edges = 2. Euler stated it in a work written in 1750 and published in 1758; counting the three elements in several solids is a way to discover it.';
$string['app_gd_cuerpos_works'] = 'Recognising and naming solids: prisms, pyramids, cylinder, cone and sphere.
Their elements: faces, edges and vertices; bases and side faces.
Nets: which flat shape folds into each solid.
The views from the front, from above and from a side.
In Secondary, the regular polyhedra and Euler\'s formula.';
$string['app_gd_eco_how'] = '«Listen»: the board counts four and claps the rhythm, and the drum pulses with each clap.
The class claps it back, all at once or in turns with «Whose turn?».
To check it, someone taps the echo on the drum (or with the space bar); or you listen and press «Well done!».
Then the rhythm shows written: read it aloud with its syllables (ta, ti-ti…) before going on.
«Again» repeats the same; «Another rhythm», a new one; two bars and «Harder», for those who have mastered it.';
$string['app_gd_eco_scene'] = 'In year two, before the recorders come out, the teacher sets the echo to slow. The class claps it back all together, and then Lucía taps it on the drum: all green. «Let\'s read the rhythm»: ta, ti-ti, ta, ta. After the third one in a row, the recorders come out.';
$string['app_gd_eco_sources'] = 'TeacherVision. Teaching rhythms through echo (resource for teachers).|https://teachervision.com/music/teaching-rhythms-through-echo';
$string['app_gd_eco_stages'] = 'early|One bar of ta and ti-ti, slow, all clapping at once, and you decide with «Well done!».
primary|In turns on the drum; reading the written rhythm with its syllables.
secondary|Two bars, harder and at normal speed, as a warm-up before playing.';
$string['app_gd_eco_what'] = 'The board counts four and claps a rhythm of one or two bars, and the class claps it back. The echo can be tapped on a drum on the board, which compares it with the rhythm, or you judge it by ear; then the rhythm shows written with ta and ti-ti.';
$string['app_gd_eco_why'] = 'Echo is the most direct way to learn a rhythm: it is heard, kept and given back, without a score. The count of four before each rhythm gives the beat, and the two levels (ta and ti-ti, or also ta-a, a rest and ti-ri-ti-ri) and the speed adjust the difficulty.
The drum on the board measures the echo with room for the class to go a little faster or slower, because the rhythm is what matters, not the exact speed; at the end, the written rhythm marks in green what matched and in red what slipped.';
$string['app_gd_eco_works'] = 'Listening carefully and keeping a rhythm in memory.
Keeping the beat and reproducing durations: crotchets, quavers, minims, semiquavers and rests.
Naming what is heard with rhythm syllables.
Waiting for one\'s turn and listening to the others.';
$string['app_gd_envivo_how'] = 'Open the session: they join with the QR or the code, with their course account or without one.
Vote: ask the question, open it, wait, close it and the bars appear; «Another question» for a second round.
For Peer Instruction: they vote, discuss in pairs for a couple of minutes and vote again.
Brainstorm: a word or two each; check them before showing them if needed.
Without tablets: «Hands up», and you count with + and −.
Fixed remote, on your phone and without logging in: on top, the buttons of the tool on the board (in «Groups», how many and «Make groups»; in the alphabet wheel, «Right», «Wrong», «Pass» and the answer, which only you see) and, below, its options («Deal them out with suspense», «Scratch to reveal», the game, the look of the timer…); with «Let a student press it», the phone keeps only the main button, big and round, for a child to press (leaving is holding); under «More orders», the timer, picking someone, opening or closing the vote or the ticket, the curtain («Uncover a little» pulls it down) and the relays; and also going to a tool, reading the cards and «Change the class», which takes the open board to another of your courses. It turns itself off after the hours without use that the school sets.
Music quiz: «Music» makes the questions by itself (which song is it?, rhythm dictation with ta and ti-ti, or melody dictation from do) and the board plays each one as it opens; «Again» plays it once more.';
$string['app_gd_envivo_scene'] = 'Before the experiment, Year 5 vote whether an egg floats in salty water: nearly everyone says no. They do the experiment and repeat the question with «Another question»; the bars change, and the best part begins: explaining why.';
$string['app_gd_envivo_sources'] = 'Crouch, C. H. and Mazur, E. (2001). Peer Instruction: Ten years of experience and results. American Journal of Physics, 69(9), 970–977.|https://doi.org/10.1119/1.1374249
White, R. T. and Gunstone, R. F. (1992). Probing Understanding. Falmer Press.';
$string['app_gd_envivo_stages'] = 'early|A show of hands in circle time, to choose together.
primary|Votes from A to D, yes or no, or the traffic light to see who has understood.
secondary|Peer Instruction, brainstorms and quizzes in teams.
advanced|Conceptual votes in large classes, and brainstorms in seminars.';
$string['app_gd_envivo_what'] = 'Sessions with the class\'s phones or tablets: a vote, a brainstorm, a quiz, buzzers, the teacher\'s phone as a remote and, without tablets, hands up.';
$string['app_gd_envivo_why'] = 'In Peer Instruction, students answer a conceptual question, discuss it with a classmate and answer again; ten years of it in introductory physics at Harvard University showed better mastery of conceptual reasoning and of problem solving (Crouch and Mazur, 2001).
Voting before and after an experiment follows the predict-observe-explain technique, as described by White and Gunstone (1992).';
$string['app_gd_envivo_works'] = 'Everyone answers at once, not just one.
Seeing at a glance what the class has understood.
Giving an opinion without being swayed by the others: a vote hides the bars while it is open.
Taking part with their name or without it.';
$string['app_gd_errores_how'] = 'Choose an example or write a text in «My exercises» with each mistake like this: [what it says|what is right|why].
The class says how many mistakes they think there are before starting.
One tap marks the word; the second shows the correction: so it can be talked over before it is seen.
Sentences from the class\'s own writing (without names) also work.';
$string['app_gd_errores_scene'] = 'In Year 12, the text says the derivative of sin x is −cos x. A student marks it, but is not sure of the correction. Before the second tap, the teacher asks them to check it with the definition on the board; when cos x comes out, they have worked it out themselves.';
$string['app_gd_errores_sources'] = 'Metcalfe, J. (2017). Learning from errors. Annual Review of Psychology, 68, 465–489.|https://doi.org/10.1146/annurev-psych-010416-044022';
$string['app_gd_errores_stages'] = 'primary|Basic spelling, facts of Science and Geography.
secondary|Spelling, dates of History, Physics and Mathematics.
advanced|Concepts of Biology, Chemistry and Literature, derivatives and key dates.';
$string['app_gd_errores_what'] = 'A text with hidden mistakes: the wrong word is tapped and marked, and another tap shows the correction and its why.';
$string['app_gd_errores_why'] = 'Metcalfe (2017) reviews the research on learning from errors: making a mistake and getting the correction straight away helps learning, against the habit of avoiding mistakes at all costs. Here the mistake is in the text, and the correction comes with a tap, with its why.
Looking for mistakes means reading slowly and comparing with what is known, and each find can be talked over in class before the correction is shown.';
$string['app_gd_errores_works'] = 'Reading carefully and critically.
Spelling and grammar in context.
Facts of any subject: dates, figures, concepts.
Correcting, and explaining why.';
$string['app_gd_expand'] = 'Expand: read it big';
$string['app_gd_fractions_how'] = 'They colour pieces in one row and look for the same amount in another: the wall says which parts are equal («1/2 = 2/4 = 3/6»).
The ruler for comparing slides across the wall and lines the rows up.
On the pieces: fractions, decimals, percentages, or nothing, so that they reason with the size alone.
Ask first and check afterwards: «Which is more, two thirds or three quarters?».
«Duel»: the same material in two halves for two students with the same challenge; at once on a multi-touch screen, in turns with a clock each on a projector, or «Compare» to put two models side by side.';
$string['app_gd_fractions_scene'] = 'In Year 7, the teacher asks which is more, two thirds or three quarters. The class splits in two. One student colours two thirds, another three quarters, and the ruler settles it: three quarters reaches a little further.';
$string['app_gd_fractions_sources'] = 'Siegler, R. and others (2010). Developing effective fractions instruction for kindergarten through 8th grade (NCEE 2010-4039). Institute of Education Sciences.|https://ies.ed.gov/ncee/wwc/PracticeGuide/15';
$string['app_gd_fractions_stages'] = 'early|Halves and wholes with coloured pieces, without numbers.
primary|Simple fractions, equivalent fractions and comparing them.
secondary|Equivalents, decimals and percentages; adding fractions while seeing them.
advanced|In teacher training, to show the measurement model of fractions.';
$string['app_gd_fractions_what'] = 'One whole on top and, under it, the same whole in halves, thirds, quarters…: fractions are compared at a glance.';
$string['app_gd_fractions_why'] = 'The practice guide of the US Institute of Education Sciences on fractions recommends helping students see that fractions are numbers, with measurement activities and number lines (Siegler and others, 2010). On the wall each piece is a length: what it measures is compared by putting one row against another, as on a number line.';
$string['app_gd_fractions_works'] = 'What a fraction is: equal parts of the same whole.
Comparing: a third is less than a half, although 3 is more than 2.
Equivalent fractions: 1/2 = 2/4 = 3/6.
Fraction, decimal and percentage of the same amount.';
$string['app_gd_geoboard_how'] = 'Tap pegs to stretch a band; tap the first one to close the figure.
Drag a corner to another peg to change the figure.
«Area and perimeter» gives the measures, and the little squares help to count them.
Challenges: «Make a rectangle of area 6», «How many different triangles of area 2 are there?».
More pegs for big figures; fewer for the youngest.
«Duel»: the same material in two halves for two students with the same challenge; at once on a multi-touch screen, in turns with a clock each on a projector, or «Compare» to put two models side by side.';
$string['app_gd_geoboard_scene'] = 'In Year 8, the teacher asks for figures of area 4. Squares, rectangles and an odd triangle come out. For each one they count the pegs inside and on the edge, and the class finds the rule before anyone says its name: Pick.';
$string['app_gd_geoboard_sources'] = 'Gattegno, C. (1954). The Gattegno geoboards. Bulletin of the Association for Teaching Aids in Mathematics, 3.|https://roslyn-young.fr/biblios/bibliography-of-gattegno-s-work
Pick, G. (1899). Geometrisches zur Zahlenlehre. Lotos, 47, 311–319.|https://mathshistory.st-andrews.ac.uk/Biographies/Pick/';
$string['app_gd_geoboard_stages'] = 'early|Stretching bands, making figures and naming them.
primary|Polygons, area by counting squares, and perimeter.
secondary|Areas of triangles and irregular polygons; Pick\'s theorem.
advanced|In teacher training, to teach geometry with hands-on materials.';
$string['app_gd_geoboard_what'] = 'A board of pegs on which rubber bands are stretched: figures, areas and perimeters that are seen and counted.';
$string['app_gd_geoboard_why'] = 'The geoboard was introduced and made known by the mathematics educator Caleb Gattegno, who described it in 1954.
For a polygon with its corners on the pegs and no holes, the area is the number of pegs inside plus half of those on the edge, minus one: Pick\'s theorem (Pick, 1899). On the geoboard it is checked against the area the board gives.';
$string['app_gd_geoboard_works'] = 'Building and recognising polygons.
Area by counting little squares, and perimeter.
Symmetry and congruent figures.
In secondary school, Pick\'s theorem.';
$string['app_gd_grupos_how'] = '«Who\'s missing today?» before making the groups.
Number of groups, or students per group.
«A role for each one» and, in «Change the roles», the set of roles: group tasks, music, science, reading or your own.
«Other roles» hands them out again; the sharing takes into account the roles each one has already had.
«Save as course groups» leaves them in the course for assignments and forums.';
$string['app_gd_grupos_scene'] = 'In the Year 8 lab two students are missing. The teacher marks who is absent, asks for groups of four and the science roles: measure, write down, set up, photograph. Nobody chooses who they go with, and nobody is left without a task.';
$string['app_gd_grupos_sources'] = 'Johnson, D. W. and Johnson, R. T. (2009). An educational psychology success story: Social interdependence theory and cooperative learning. Educational Researcher, 38(5), 365–379.|https://doi.org/10.3102/0013189X09339057
Palincsar, A. S. and Brown, A. L. (1984). Reciprocal teaching of comprehension-fostering and comprehension-monitoring activities. Cognition and Instruction, 1(2), 117–175.|https://doi.org/10.1207/s1532690xci0102_1';
$string['app_gd_grupos_stages'] = 'early|Pairs and small groups; simple roles such as handing out the materials.
primary|Work teams with roles that change every week.
secondary|Project groups with roles for the subject, saved in the course.
advanced|Seminars and group work, saved as course groups.';
$string['app_gd_grupos_what'] = 'Random groups from the class list, without those absent, with a role for each one if wanted.';
$string['app_gd_grupos_why'] = 'In their review of cooperative learning, David and Roger Johnson say that cooperation works when there is positive interdependence (the group needs everyone) and individual accountability (each one\'s work counts and is given back to them), along with interaction, social skills and the group reflecting on how it has worked (Johnson and Johnson, 2009). Roles help with both: each member has a task the group needs.
The Reading set uses the four roles of reciprocal teaching: predicting, questioning, clarifying and summarising. Palincsar and Brown (1984) studied it with 12- and 13-year-olds who struggled with reading comprehension, with good results in small samples.';
$string['app_gd_grupos_works'] = 'Working with different classmates, not always the same ones.
Sharing out responsibilities with roles.
Fair, quick groups, with no arguing about who goes with whom.';
$string['app_gd_how'] = 'How to take it to class';
$string['app_gd_index_games'] = 'Games';
$string['app_gd_index_lead'] = 'Each guide says what the tool is for, how to take it to class and what it gives at each stage, with its sources.';
$string['app_gd_index_materials'] = 'Materials';
$string['app_gd_index_tools'] = 'Tools';
$string['app_gd_line_how'] = 'Choose the stretch: «From 0 to 10», «From −10 to 10», quarters, thirds, tenths… or your own.
A tap on the line starts at a point; each tap after it is a jump, drawn with its arc and its sum.
Hide the numbers and ask where one falls before uncovering it.
To subtract, jumps backwards; for negatives, crossing zero.
In Early years a frog jumps: the same jump, with something to watch.
«Intervals»: type [−2, 3), x ≥ 1 or |x − 1| < 2 and it is drawn and written the other ways; a tap on an end opens or closes it. «One at random» with the notation hidden, for them to write it.
«Duel»: the same material in two halves for two students with the same challenge; at once on a multi-touch screen, in turns with a clock each on a projector, or «Compare» to put two models side by side.';
$string['app_gd_line_scene'] = 'In Year 6, the teacher chooses quarters from 0 to 2, hides the numbers and asks where three quarters goes. Some put it after 1, because three and four seem big numbers to them. When it is uncovered, the line shows them that three quarters does not even reach 1.';
$string['app_gd_line_sources'] = 'Siegler, R. S. and Ramani, G. B. (2008). Playing linear numerical board games promotes low-income children\'s numerical development. Developmental Science, 11(5), 655–661.|https://doi.org/10.1111/j.1467-7687.2008.00714.x
Siegler, R. and others (2010). Developing effective fractions instruction for kindergarten through 8th grade (NCEE 2010-4039). Institute of Education Sciences.|https://ies.ed.gov/ncee/wwc/PracticeGuide/15';
$string['app_gd_line_stages'] = 'early|From 0 to 10: counting jumps one by one and seeing which number is further.
primary|Adding and subtracting as jumps, decimals and simple fractions.
secondary|Negative numbers, equivalent fractions and operations with fractions; intervals and inequalities.
advanced|Intervals, inequalities and absolute value; in teacher training, to teach how to use the line in primary school.';
$string['app_gd_line_what'] = 'A line with the numbers in order, on which jumps are drawn: whole numbers, negatives, decimals or fractions; and, from Secondary, intervals.';
$string['app_gd_line_why'] = 'In a study with low-income preschoolers, four 15-minute sessions of a board game with the numbers 1 to 10 in a line closed their gap in placing numbers on a number line; the same game with colours instead of numbers had no effect (Siegler and Ramani, 2008).
For fractions, the practice guide of the US Institute of Education Sciences recommends using number lines as a central tool from the early grades, so that fractions are seen as numbers (Siegler and others, 2010).';
$string['app_gd_line_works'] = 'The order of numbers and the distance between them: which is bigger, and by how much.
Adding and subtracting as jumps («2 + 3 + 4 = 9»).
Negative numbers, to the left of zero.
Fractions and decimals as numbers with their own place on the line.
Estimating where a number falls before checking it.
Intervals, inequalities and absolute value: the same part of the line written three ways.';
$string['app_gd_marcador_how'] = 'In teams: one tap adds, the other takes away; the crown marks the leader.
The class goal: choose its look (each level starts with one), the goal and the prize; each point brings it closer. In Primary the count says what is left; in Secondary, the fraction and the percentage.
The rocket gives a fact about each planet as it passes it; the song plays whole at the goal; the mosaic can uncover a picture of yours (it stays in that browser).
It is kept in the course: it goes on the next day from any computer.
With the live quiz or with the games, to keep the points of several rounds.';
$string['app_gd_marcador_scene'] = 'In Year 4, the jar of the class has a goal: a games session on Friday. Each time the class goes quiet in less than ten seconds, a marble drops in. On Thursday three are missing, and it is the students themselves who ask each other for silence.';
$string['app_gd_marcador_sources'] = 'Barrish, H. H., Saunders, M. and Wolf, M. M. (1969). Good behavior game: effects of individual contingencies for group consequences on disruptive behavior in a classroom. Journal of Applied Behavior Analysis, 2(2), 119–124.|https://doi.org/10.1901/jaba.1969.2-119
Little, S. G., Akin-Little, A. and O\'Neill, K. (2015). Group contingency interventions with children—1980-2010: A meta-analysis. Behavior Modification, 39(2), 322–341.|https://doi.org/10.1177/0145445514554393';
$string['app_gd_marcador_stages'] = 'early|The critter\'s path: counting squares up to the goal; or the jar of marbles.
primary|The rocket or the plant, with what is left; teams in the games and a weekly goal.
secondary|The mosaic, with the fraction and the percentage; quizzes in teams and long challenges.
advanced|Debates and competitions in teams; the mosaic with the percentage.';
$string['app_gd_marcador_what'] = 'A scoreboard for 2 to 8 teams with big buttons, or a goal of the whole class: a jar of marbles, or a look that teaches something while it fills (the critter\'s path, a plant that grows, a rocket through the solar system, a song note by note or a mosaic that uncovers a picture).';
$string['app_gd_marcador_why'] = 'Dividing the class into teams with a scoreboard in sight has also been used for behaviour: in the Good Behavior Game (Barrish, Saunders and Wolf, 1969), a fourth-grade class was split into two teams and each disruption added a mark to its team; disruptive behaviour fell sharply while the game lasted.
The class goal is an interdependent group contingency: the reward is for everyone when the whole class reaches the goal, and nobody is singled out. In a meta-analysis of 50 studies with school-age children, Little, Akin-Little and O\'Neill (2015) found that group contingencies, this kind among them (35 of the studies), work for a wide range of behaviours.';
$string['app_gd_marcador_works'] = 'Playing in teams and keeping the count in sight.
Adding points and comparing: how far each team has to go.
A common goal: the whole class pulls the same way.
Class rules with a group consequence.
Counting, the number sequence and counting in twos or fives (the path); the life cycle of a plant, the order of the planets and reading music.
Fractions and percentages (the mosaic, and the count in Secondary).';
$string['app_gd_none'] = 'This tool has no guide of its own. These are the guides there are:';
$string['app_gd_ordenar_how'] = 'Choose an example of the level, or write your own in «My exercises»: one item per line, in its order.
A line «? item: why» explains why it goes there; it comes up when someone puts it in the wrong place.
One student taps the cards while the class says aloud what comes next.
«Prompt for your AI» prepares exercises on any topic; check them before saving.';
$string['app_gd_ordenar_scene'] = 'In Year 5, the exercise is the water cycle. A student puts condensation before evaporation. On checking, the card goes back and its why comes up: the vapour cools down and turns into drops. The class talks about what has to happen before there is any vapour, and he puts it right on the second try.';
$string['app_gd_ordenar_sources'] = 'Inhelder, B. and Piaget, J. (1964). The Early Growth of Logic in the Child: Classification and Seriation. London: Routledge & Kegan Paul.
Metcalfe, J. (2017). Learning from errors. Annual Review of Psychology, 68, 465–489.|https://doi.org/10.1146/annurev-psych-010416-044022';
$string['app_gd_ordenar_stages'] = 'primary|Cycles of nature, the steps to solve a problem, the ages of history.
secondary|Science processes (mitosis, the layers of the Earth), timelines and the order of operations.
advanced|Long processes: protein synthesis, cellular respiration, art movements.';
$string['app_gd_ordenar_what'] = 'Cards put in their order with taps: the steps of a process, the phases of a cycle, periods, sizes…';
$string['app_gd_ordenar_why'] = 'Ordering is seriation: placing things by a relation, such as before and after or more and less. Inhelder and Piaget studied with more than two thousand children how seriation and classification are built, two foundations of logical reasoning (Inhelder and Piaget, 1964).
When checking, the cards in the right place stay and the others go back, with their why if the exercise has one: making a mistake and getting the correction straight away helps learning (Metcalfe, 2017).';
$string['app_gd_ordenar_works'] = 'Sequencing: what comes before and what after, and why.
The processes of any subject: the water cycle, mitosis, protein synthesis.
Chronology: periods and events in their order.
Explaining an order aloud, not only getting it right.';
$string['app_gd_palabra_how'] = 'The class proposes and the teacher types: one try, one discussion.
Before each try, they say which letters they already know and which they have ruled out.
Choose the number of tries (from 5 to 8) for their age.
There is no dictionary: any word with the right number of letters counts.';
$string['app_gd_palabra_scene'] = 'In a Year 9 English class the word is in English and the clue is «a planet». At the third try they have _A_S; someone proposes MARS and the row turns green.';
$string['app_gd_palabra_sources'] = 'Wordle (Wikipedia).|https://en.wikipedia.org/wiki/Wordle';
$string['app_gd_palabra_stages'] = 'primary|Five-letter words, with a clue.
secondary|Six letters, words of the subject.
advanced|Seven letters, or another language with its keyboard.';
$string['app_gd_palabra_what'] = 'Guess a word in six tries: green if the letter is in its place, yellow if it is somewhere else, grey if it is not there.';
$string['app_gd_palabra_why'] = 'The game was created by Josh Wardle and spread widely after its release in October 2021. Each try gives information that has to be combined with that of the earlier ones: a deduction exercise with words.';
$string['app_gd_palabra_works'] = 'Spelling: which words exist with those letters.
Reasoning with clues: ruling out letters and places.
Words of the subject, from a glossary of the course or in another language.
Discussing as a group before each try.';
$string['app_gd_parejas_how'] = 'Choose a set by level, or the faces and names of the class, your lists («dog = perro»), a glossary or the matching questions of the course.
The whole class, or two teams: finding a pair gives another turn.
Before turning the second card, the class says what it expects to find.
Few pairs to start; more when they know the content.';
$string['app_gd_parejas_scene'] = 'First day of the year in Year 6: the teacher opens Pairs with the faces and names of the class. Each pair matches a photo with its name, and by the end of the game everyone knows what the two new students are called.';
$string['app_gd_parejas_sources'] = 'Roediger, H. L. and Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.|https://doi.org/10.1111/j.1467-9280.2006.01693.x';
$string['app_gd_parejas_stages'] = 'early|Shapes, colours, animal shadows and numbers, with few pairs.
primary|Word and picture, sums and results, faces and names of the class.
secondary|Concept and definition, formulas and names, languages.
advanced|Derivatives, chemical elements, authors and works: what is reviewed from the question bank.';
$string['app_gd_parejas_what'] = 'Cards face down, turned two at a time, to find the pairs: the same, or related.';
$string['app_gd_parejas_why'] = 'When the pairs are related rather than equal (concept and definition, word and translation), the content has to be remembered to recognise the pair: a form of retrieval practice, and remembering what has been learnt, rather than rereading it, helps to keep it (Roediger and Karpicke, 2006).';
$string['app_gd_parejas_works'] = 'Visual memory and attention: where each card was.
Relating ideas: word and picture, concept and definition, number and amount.
Words of the subject, from the glossary or the question bank of the course.
Turns and teams.';
$string['app_gd_pizarra_how'] = 'For an explanation, the simple board and its backgrounds (squared paper, handwriting lines, staves).
A student comes out to draw what they have understood: an outline, a cycle, a map.
Formulas are written in one line and drawn as in a book.
Geometry: ruler, set squares, protractor and compass.
The curtain covers the board and uncovers it bit by bit; the spotlight lights up a part.';
$string['app_gd_pizarra_scene'] = 'In Year 6, the teacher explains the water cycle and then asks a student to draw it without the book. The sun, the sea and the rain are there, but not the clouds; the class notices that condensation is missing, and he adds it with arrows.';
$string['app_gd_pizarra_sources'] = 'Fiorella, L. and Mayer, R. E. (2015). Learning as a Generative Activity: Eight Learning Strategies that Promote Understanding. Cambridge University Press.';
$string['app_gd_pizarra_stages'] = 'early|Drawing with a finger and tracing letters on handwriting lines.
primary|Outlines, problems step by step and geometry with a ruler.
secondary|Formulas, geometry with instruments and pages kept.
advanced|Formulas and diagrams, with the pages kept in the course.';
$string['app_gd_pizarra_what'] = 'A simple board to write and draw with a finger, and a full one with pages, backgrounds, formulas, ruler, compass and protractor.';
$string['app_gd_pizarra_why'] = 'Drawing what is learnt is one of the eight strategies of generative learning gathered by Fiorella and Mayer (2015): turning a text or an explanation into a drawing makes the learner select what matters and organise it.
The full board keeps its pages in the course, so a student\'s drawing can be taken up again another day.';
$string['app_gd_pizarra_works'] = 'Explaining by drawing: outlines, diagrams, processes.
Working things out step by step, in sight.
Geometry with instruments: measuring, drawing, constructing.
Students coming out to draw what they understand.';
$string['app_gd_plano_how'] = '«Points»: they call the coordinates of a point and it is tapped, or the other way round: a point goes on and they say where it is.
«Hide the coordinates»: the points only with their letter, to ask where each one is.
«Making a shape»: a polygon by its vertices, then moved by adding the same to every x.
«As vectors»: each arrow with its components, from A to B and from B to C.
«Battleship»: one to four teams, each calls a point in its turn; a hit shoots again. «Show the fleet» at the end.';
$string['app_gd_plano_scene'] = 'In Year 7, two teams play Battleship in all four quadrants. One shouts «minus three, two!» and points up and to the left; the teacher taps it: water. The other team, which already had a hit at (−3, 1), shoots at (−3, 0) and sinks the ship: in ten minutes they have said forty pairs, in order and with their signs.';
$string['app_gd_plano_sources'] = 'Descartes, R. (1637). La Géométrie. Appendix to the Discours de la méthode. Leiden: Ian Maire.';
$string['app_gd_plano_stages'] = 'primary|The first quadrant: placing points and playing Battleship.
secondary|All four quadrants, shapes, symmetries and translations, and vectors.
advanced|Vectors and their components, as a support for analytic geometry.';
$string['app_gd_plano_what'] = 'A grid with the x and y axes: the first quadrant (0 to 10) or all four (−6 to 6). Points with their coordinates, shapes and vectors, and Battleship by teams.';
$string['app_gd_plano_why'] = 'With a pair of numbers every point of the plane is located: that is the idea of analytic geometry, which starts with Descartes\' La Géométrie (1637); that is why the coordinates are called Cartesian.
The order of the pair matters: (3, 2) and (2, 3) are different points, and in Battleship a pair the wrong way round is a wasted shot, so it shows at once.
In all four quadrants, the sign gives the direction: to the left of the y axis, or below the x axis.';
$string['app_gd_plano_works'] = 'Placing and reading points by their coordinates: first x, then y.
Negative numbers, in all four quadrants.
Shapes from their vertices: polygons, symmetries and translations.
Vectors and their components: how far along x and how far along y.
Battleship: saying the pair in order, and working out where to shoot after a hit.';
$string['app_gd_quien_how'] = 'Ask the question to the whole class before choosing: that way everyone thinks about it.
Count to three or four in silence, then press.
If the one chosen does not know, they choose a classmate to help and then say it in their own words.
Turn on «Fewest turns first» so that in a few weeks everyone has spoken.
With «Who\'s missing today?», those absent are not chosen.';
$string['app_gd_quien_scene'] = 'Yesterday\'s problems are being corrected. The teacher reads one out, counts to four in silence and presses: Lucy comes out, who had not been chosen for two weeks, because «Fewest turns first» is on. As anyone could have been chosen, everyone had their answer ready in their notebook.';
$string['app_gd_quien_sources'] = 'Dallimore, E. J., Hertenstein, J. H. and Platt, M. B. (2013). Impact of cold-calling on student voluntary participation. Journal of Management Education, 37(3), 305–341.|https://doi.org/10.1177/1052562912446067
Rowe, M. B. (1986). Wait time: Slowing down may be a way of speeding up! Journal of Teacher Education, 37(1), 43–50.
Lemov, D. (2021). Teach Like a Champion 3.0. Jossey-Bass.';
$string['app_gd_quien_stages'] = 'early|To share out jobs and turns in circle time, with the photo shown big.
primary|To correct aloud or to choose who comes to the board.
secondary|For review questions, after thinking about them for a minute in pairs.
advanced|To choose who presents or defends an answer in a seminar.';
$string['app_gd_quien_what'] = 'Choose at random whose turn it is to answer, with fair turns, so that the whole class takes part and not always the same ones.';
$string['app_gd_quien_why'] = 'Asking someone who has not put their hand up is what Doug Lemov calls «cold call»: as anyone may be chosen, everyone prepares an answer. In a study with university students, in the classes where it was done often more students answered of their own accord, and they felt more at ease taking part (Dallimore, Hertenstein and Platt, 2013).
A few seconds of silence after the question bring longer, better reasoned answers: Mary Budd Rowe found that teachers wait, on average, less than a second (Rowe, 1986).';
$string['app_gd_quien_works'] = 'The whole class thinks: anyone may be chosen.
Fair turns: «Fewest turns first» chooses first whoever has had fewest turns in the course.
Seeing what each one has understood, not only those who put their hand up.
Speaking in front of the others little by little, with questions within their reach.';
$string['app_gd_quiensoy_how'] = 'Choose an example of the level, or write your own in «My exercises»: «= answer» on the first line and the clues below.
In teams: whoever gets it with fewer clues takes more points.
The students write the clues of a figure or a concept of the unit: choosing which clue goes first is also reviewing.
«Prompt for your AI» prepares figures and concepts on any topic.';
$string['app_gd_quiensoy_scene'] = 'In Year 9, at the end of the unit on the cell, each team writes in «My exercises» the clues of an organelle for the other team. The mitochondria one starts with «I have my own DNA»; nobody gets it until the third clue, and the talk about why they have DNA reviews half the unit.';
$string['app_gd_quiensoy_sources'] = 'Roediger, H. L. and Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.|https://www.jstor.org/stable/40064526';
$string['app_gd_quiensoy_stages'] = 'primary|Animals, places and well-known figures.
secondary|Figures of History, Science and Art, chemical elements, places.
advanced|Concepts and authors: organelles, philosophers, economists, writers.';
$string['app_gd_quiensoy_what'] = 'Clues one by one, from the hardest to the easiest, until someone guesses who or what it is; the fewer the clues, the more the answer is worth.';
$string['app_gd_quiensoy_why'] = 'Guessing from clues means retrieving from memory what is known. Roediger and Karpicke (2006) found that recalling what has been studied makes it last longer than reading it again, even though reading it again seems to work better at first.
The clues go from the hardest to the easiest so that everyone has their moment: those who know more get it sooner, and the rest arrive with the last ones.';
$string['app_gd_quiensoy_works'] = 'Recalling what has been learnt from clues.
Linking facts to a person, a place, an animal or a concept.
Venturing an answer and giving reasons for it.
Reviewing any subject at the end of a unit.';
$string['app_gd_reloj_how'] = 'Choose the level: o\'clock, half past, quarter past and to, every five minutes or minute by minute.
«What time is it?»: a time appears on the clock and the class reads it.
«Set the time»: the class moves the hands to the time asked for.
Hide the time in digits or in words so that they read the hands alone.
«Roman numerals», for clocks like those on buildings.';
$string['app_gd_reloj_scene'] = 'In Year 3, the teacher turns on Roman numerals and sets a quarter past four. «It\'s like the town hall clock», someone says. The class reads the time without digits and, along the way, learns that IV is four.';
$string['app_gd_reloj_sources'] = 'Real Decreto 157/2022, de 1 de marzo, por el que se establecen la ordenación y las enseñanzas mínimas de la Educación Primaria. BOE-A-2022-3296.|https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296
Department for Education (2013). National curriculum in England: mathematics programmes of study.|https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study';
$string['app_gd_reloj_stages'] = 'early|O\'clock, with the hour hand: when we eat, when we go home.
primary|From half past to minute by minute, and Roman numerals.
secondary|The 24-hour clock and working out how long things last.
advanced|Rarely; in teacher training, to teach how to tell the time.';
$string['app_gd_reloj_what'] = 'A clock whose hands move with a finger, with the time in digits and in words, to learn to tell the time.';
$string['app_gd_reloj_why'] = 'Telling the time is part of primary school: the Spanish curriculum includes measuring time with the analogue and digital clock (Real Decreto 157/2022, Mathematics). In England, pupils tell the time to five minutes in Year 2 and, in Year 3, from an analogue clock with Roman numerals from I to XII (Department for Education, 2013).';
$string['app_gd_reloj_works'] = 'Reading the time on a clock with hands: o\'clock, half past, quarter past and to, five minutes, minute by minute.
Relating the clock with hands to the digital time and to the time in words.
Roman numerals on the dial.
12 and 24 hours.';
$string['app_gd_rods_how'] = 'Start with free play: staircases, trains and «carpets» of rods of the same length.
Ask for every way of making a number with two rods: the carpet of ten gathers all its splits.
Hide the numbers («Show the numbers» off) so that they reason with the lengths.
With «Compare: two tables», two students solve the same challenge in two different ways.
A table with few columns for the youngest; with many, to multiply and for fractions.
«Duel»: the same material in two halves for two students with the same challenge; at once on a multi-touch screen, in turns with a clock each on a projector, or «Compare» to put two models side by side.';
$string['app_gd_rods_scene'] = 'In Year 2, the teacher turns «Show the numbers» off and asks: «Make the orange one with two rods». One pair after another comes out with a different answer, until the carpet of ten is complete. Then someone notices that the answers come in twos: white and blue, blue and white.';
$string['app_gd_rods_sources'] = 'Cuisenaire, G. (1952). Les nombres en couleurs. Thuin.
Cuisenaire, G. and Gattegno, C. (1971). Initiation aux nombres en couleurs. Delachaux et Niestlé.';
$string['app_gd_rods_stages'] = 'early|Free play, ordering from the shortest to the longest, and comparing.
primary|Splitting numbers, adding and subtracting, doubles and halves, times tables and fractions.
secondary|Equivalent fractions, ratios, and letters instead of rods as a first algebra (if r is the red one, r + r is the four).
advanced|In teacher training, to teach future teachers how to use them.';
$string['app_gd_rods_what'] = 'Ten coloured rods from 1 to 10 units long: numbers are seen and touched as lengths.';
$string['app_gd_rods_why'] = 'The rods were devised by Georges Cuisenaire, a teacher in Thuin (Belgium), who published his method in 1952 as Les nombres en couleurs. From 1953 the mathematics educator Caleb Gattegno made them known all over the world.
Each number is a length and each length has its colour: relations between numbers are seen before they are written, and they can be checked by putting one rod next to another.';
$string['app_gd_rods_works'] = 'Comparing and ordering: longer, shorter, the same.
Making and breaking a number («which two rods make the orange one?»).
Relations between numbers: double, half, one more.
Adding, subtracting, multiplying and dividing with their hands.
Fractions and ratios: the two is half of the four.';
$string['app_gd_rosco_how'] = 'Write your wheel with the words of the topic, or copy the example one and adapt it.
The whole class against the clock, or two teams, each with its wheel and its time.
You mark right, wrong or «Pass».
Use it to review at the end of a topic, not to introduce it.';
$string['app_gd_rosco_scene'] = 'Friday review in Year 7: two teams, a science wheel each. The «P» of photosynthesis falls at the first try; the «X» of xylem stays on «Pass» to the very end, and on Monday it is the word everyone remembers.';
$string['app_gd_rosco_sources'] = 'Roediger, H. L. and Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.|https://doi.org/10.1111/j.1467-9280.2006.01693.x';
$string['app_gd_rosco_stages'] = 'primary|Vocabulary of the topic and spelling, with simple clues.
secondary|Reviewing the concepts of any subject before a test.
advanced|The terms of the subject, also in other languages.';
$string['app_gd_rosco_what'] = 'A ring of letters with a clue for each one: the class guesses words.';
$string['app_gd_rosco_why'] = 'Trying to remember something helps to keep it better than studying it again: in an experiment with university students, those who took a recall test remembered more a week later than those who reread the text, although the latter felt surer (Roediger and Karpicke, 2006). The letter wheel turns that retrieval practice into a game.';
$string['app_gd_rosco_works'] = 'Vocabulary of any subject, with its definition.
Remembering without looking: each clue makes them bring the word back from memory.
Spelling: the word starts with that letter, or contains it.
Teamwork, with two teams and their clocks.';
$string['app_gd_salida_how'] = 'Prepare the ticket: choose whether it asks «How are you getting on?» and write up to three short questions, or choose them from «Ideas». One or two is better: it has to fit in three to five minutes.
Open the session a few minutes before the end; they join with the QR or the code. With their Moodle account you will know who needs what; without names, they tend to answer more frankly.
Open the ticket. The board only shows who has handed it in; on the way out, each student shows their green screen.
Close the ticket and the faces of the class come out. The answers do not show until you press «Show the answers»: check them before projecting them, and take off the screen what should not be seen.
The piles (Not yet, Halfway, Understand it, Could explain it) say where to start: going over it with everyone, small groups with an expert in each, or moving on.
«One at random» shows an answer without a name, big, to talk about it with the class.
«Download» saves the tickets in a spreadsheet: the session is deleted the next day.
Without devices: the same ticket on a card or a sticky note, or the four faces on the door so each one puts a sticker or their peg on theirs on the way out; count them with «Hands up or cards».';
$string['app_gd_salida_scene'] = 'Friday, five minutes before break: the year five class does the ticket on equivalent fractions. When it closes there are nine faces on «Halfway», and nearly all the questions say the same: they do not see why 2/4 equals 1/2.
On Monday the lesson starts with the fraction wall, and the four who could explain it act as experts, one at each table.';
$string['app_gd_salida_sources'] = 'Black, P. and Wiliam, D. (1998). Assessment and classroom learning. Assessment in Education: Principles, Policy & Practice, 5(1), 7–74.|https://doi.org/10.1080/0969595980050102
Marzano, R. J. (2012). The many uses of exit slips. Educational Leadership, 70(2).|https://ascd.org/el/articles/the-many-uses-of-exit-slips
Wiliam, D. (2011). Embedded Formative Assessment. Solution Tree Press.
Northwest Educational Service District 189 (n. d.). Exit Pass. Formative Assessment Techniques (handout adapted from Wiliam, 2011).|https://www.nwesd.org/wp-content/uploads/2013/08/EL_Exit_Pass_kdj.pdf';
$string['app_gd_salida_stages'] = 'early|Only the faces, and by hand: on the way out, each one puts their peg or a sticker on their face, and you talk about it at circle time the next day.
primary|The faces and one question: «The most important thing I learned today» or «A question I still have». With their accounts, to make the next day\'s groups.
secondary|A question on understanding («Explain it in your own words», «Give an example») and another on how they worked; the download, to plan.
advanced|The point they found hardest and what they would change in the session; without names, so they are frank.';
$string['app_gd_salida_what'] = 'At the end of the lesson, each student says from their phone or tablet how they are getting on (four faces) and answers one to three short questions. While it is open you see who has handed it in; once closed, how the class is getting on and the tickets in piles, to prepare the next lesson.';
$string['app_gd_salida_why'] = 'The exit ticket is a formative assessment technique: gathering, while teaching, evidence of what they have learned in order to adjust the teaching. In their review of the research, Black and Wiliam (1998) conclude that several studies show firm evidence that strengthening the frequent feedback students receive about their learning yields substantial gains.
Marzano (2012) describes four kinds of exit slip prompts: those that give data on what they understood (rating themselves from 0 to 3, or «what are you most confused about from today?»), those that make them analyse their own effort, those about a way of working in class, and those that open communication with the teacher. The faces of Classtools adapt his 0 to 3 scale, and the question ideas follow those four kinds.
What matters is what comes next. If nearly the whole class has the same question, Marzano suggests teaching it again the next day; if the questions differ, small groups, with the students who understood it as experts in each.
Wiliam (2011) describes it as an «exit pass»: three to five minutes before a break, after which the teacher reads the passes and decides what to change. A handout based on his book gives these variations: grouping the students by what their answers show, giving them back a written comment, or reading answers aloud without names to start a discussion.';
$string['app_gd_salida_works'] = 'Knowing, before the next lesson, what each one has understood and what not.
Everyone answers, also those who never raise their hand.
Thinking about what they learned and how they worked.
A way to tell you what they would not say aloud.';
$string['app_gd_scene'] = 'In class';
$string['app_gd_score_how'] = 'Choose a song, or write one with taps on the staff.
«Play with me»: a student comes to the glockenspiel and the screen lights the note to play.
«Which note is it?»: a note sounds and the class looks for it; the streak is counted.
With «Whose turn?», each student plays one note of the song, in relay.';
$string['app_gd_score_scene'] = 'In Year 2, the relay song: each student comes to the glockenspiel and plays one note of «Are You Sleeping, Brother John?» with «Play with me». When the whole song sounds, played by all of them, they ask to play it again.';
$string['app_gd_score_sources'] = 'Orff Schulwerk (Wikipedia).|https://en.wikipedia.org/wiki/Orff_Schulwerk';
$string['app_gd_score_stages'] = 'early|Listening, playing the glockenspiel freely, high and low.
primary|Reading notes and their lengths, and playing simple songs.
secondary|Time signatures, sharps and flats, and note dictation.
advanced|In music teacher training, to prepare songs for the classroom.';
$string['app_gd_score_what'] = 'A staff on which notes are written with a tap and played, with a glockenspiel under it to play along.';
$string['app_gd_score_why'] = 'The glockenspiel is one of the barred instruments that the Orff Schulwerk of Carl Orff and Gunild Keetman adapted for school music, with xylophones and metallophones. On the screen, the written note, its sound and its bar are seen at the same time.';
$string['app_gd_score_works'] = 'Reading notes on the staff, and how long they last.
Hearing and recognising notes («Which note is it?»).
Playing a melody with «Play with me», which lights the next note.
Rhythm and time signatures: 2/4, 3/4, 4/4, 6/8.';
$string['app_gd_semaforo_how'] = '«Adjust to this class» with the class working at a volume that seems right to you: that will be green.
Explain beforehand what each colour means and what happens on red.
«A face in the light» for the youngest.
Use it for group work, not when speaking aloud is the point.';
$string['app_gd_semaforo_scene'] = 'During play in corners in Early years, the light turns amber and the face stops smiling. Nobody says anything: a girl puts her finger to her lips, the light goes back to green, and the class celebrates in a whisper.';
$string['app_gd_semaforo_sources'] = 'Berglund, B., Lindvall, T. and Schwela, D. H. (Eds.) (1999). Guidelines for Community Noise. World Health Organization.|https://www.who.int/publications/i/item/a68672
Shield, B. M. and Dockrell, J. E. (2008). The effects of environmental and classroom noise on the academic attainments of primary school children. Journal of the Acoustical Society of America, 123(1), 133–144.|https://doi.org/10.1121/1.2812596';
$string['app_gd_semaforo_stages'] = 'early|With the face in the light, during play in corners.
primary|Work in pairs and in groups.
secondary|Group work and the lab.
advanced|Rarely; in open-plan rooms or study areas.';
$string['app_gd_semaforo_what'] = 'A traffic light that listens to the noise of the class and turns green, amber or red: the volume is seen without raising the voice.';
$string['app_gd_semaforo_why'] = 'The World Health Organization recommends that the background sound in a classroom should not exceed 35 dB during lessons, so that speech is understood well (Berglund, Lindvall and Schwela, 1999). In London primary schools, classroom noise was related to lower results in national tests, also after taking social factors into account (Shield and Dockrell, 2008).
The light does not measure exact decibels: it compares with the usual noise of your class, set with «Adjust to this class». It records nothing and sends nothing; it only measures the volume.';
$string['app_gd_semaforo_works'] = 'Being aware of the volume when working in groups.
The class regulating itself, without the teacher having to ask for silence.
Comparing the noise of different activities.';
$string['app_gd_simon_how'] = 'With the class list a different student comes out every round; the others may say the colours quietly while they sound.
After a mistake the same sequence plays again for the next one: nobody starts from scratch. «From the start» keeps the classic game.
Six colours and the fast speed are more of a challenge for the older ones.
Two or three rounds are enough as an active break between two tasks.
«Backwards»: the sequence is repeated from the end to the start, so it has to be turned round before pressing.
«The pads show»: arrows (all four alike, so the direction is read and not the colour), numbers with a rule (a 3 comes up and, with «What it needs to make 10», the 7 is pressed) or notes without colours (only heard; the pads say C, D, E…).
Nine pads, for those who can already do six.
«Syllables of a word»: the pads show the syllables of the word and others; with «Its syllables light up» the word builds up above as they light, and with «It is written and they split it» it shows whole and the class presses its syllables in order. When they get it, the word shows big. They start with two syllables and grow to five. Backwards, the word is said from the end to the start. In the Infantil mode, the syllables are in capitals.';
$string['app_gd_simon_scene'] = 'Year 4 come back from break with a lot to say. The teacher opens Simon with the class list: every round one student comes out and the others say the colours quietly. Hugo fails at the seventh; the sequence plays again for Martina, who completes it to applause. Three rounds later, the reading starts.';
$string['app_gd_simon_sources'] = 'Melby-Lervåg, M. and Hulme, C. (2013). Is working memory training effective? A meta-analytic review. Developmental Psychology, 49(2), 270–291.|https://doi.org/10.1037/a0028228
Martínez, N. and Goikoetxea, E. (2020). Predictors of reading and spelling words change as a function of syllabic structure in Spanish. Psicología Educativa, 26(1), 37–48.|https://doi.org/10.5093/psed2019a20';
$string['app_gd_simon_stages'] = 'early|Four colours at the normal speed, naming the colours aloud; the syllables of two and three syllable words, clapping once per syllable.
primary|Six colours, in turns with the class list; numbers with a rule for mental arithmetic; in years one and two, syllables: «It is written and they split it».
secondary|The fast speed, as a challenge for the class to beat its record; backwards or with arrows; notes without colours in Music.
advanced|For group activities, or to show in Psychology what working memory is.';
$string['app_gd_simon_what'] = 'Repeating a sequence that grows each round (colours and sounds, arrows, numbers with a rule, notes or the syllables of a word): a game of attention and memory for the whole class.';
$string['app_gd_simon_why'] = 'Simon asks to keep a sequence in mind and repeat it in order, like the tasks with which working memory is measured. It is worth knowing that training that memory improves similar tasks, but it has not been seen to improve other abilities such as reading or arithmetic (Melby-Lervåg and Hulme, 2013).
So it is played for what it is: a short time of shared attention, turns and listening.
With syllables, the game works on syllable awareness. Martínez and Goikoetxea (2020) followed 47 Spanish-speaking children from kindergarten to year two: they note that in Spanish children identify syllables more easily than phonemes, and found that letter knowledge predicted reading and spelling words with simple syllables, while for complex syllables (such as «bla» or «tren») phonological awareness weighed more.';
$string['app_gd_simon_works'] = 'Keeping attention: watching and listening to the very end.
Remembering a sequence in order, with what is seen and what is heard.
Waiting for their turn and listening to the others.
Playing as a team: the class helps whoever comes out.
With syllables: splitting a word into its syllables and putting them together to read it.';
$string['app_gd_sources'] = 'Sources';
$string['app_gd_stages'] = 'By school level';
$string['app_gd_tangram_how'] = 'Start with the easy silhouettes (House, Boat) and leave the polygons for later.
A piece turns with a double tap; before moving it, they say which piece they are looking for and why.
If they get stuck, the hint shows where a piece goes.
For fractions: «Which part of the square is this triangle?», and they check it by laying pieces on top.
With «Whose turn?», a different student places each piece.';
$string['app_gd_tangram_scene'] = 'In Year 5, the teacher puts up the cat and asks which takes more room, the cat or the boat. Half the class says the cat. They build it with the seven pieces, then the boat with the same seven, and the room goes quiet: they are the same size.';
$string['app_gd_tangram_sources'] = 'Slocum, J. and others (2003). The Tangram Book: The Story of the Chinese Puzzle with over 2000 Puzzles to Solve. Sterling.';
$string['app_gd_tangram_stages'] = 'early|Easy silhouettes, naming triangle and square.
primary|Harder figures, polygons, symmetry and the fraction of each piece.
secondary|Areas and fractions of the square; showing that every figure has the same area.
advanced|In teacher training, to design geometry activities with hands-on materials.';
$string['app_gd_tangram_what'] = 'Seven pieces that together make a square: figures and silhouettes are built with them.';
$string['app_gd_tangram_why'] = 'The tangram is a Chinese puzzle known since about 1800; the oldest surviving books about it date from 1813 (Slocum, 2003).
All its figures are made with the same seven pieces, so they all have the same area: a way of seeing that area is kept when the shape changes.';
$string['app_gd_tangram_works'] = 'Seeing and turning shapes in the mind: spatial reasoning.
Naming figures: triangles, square, parallelogram.
Area without formulas: made with the same seven pieces, every figure has the same area.
Fractions of the square: each small triangle is a sixteenth of it.
Persevering: trying, turning and trying again.';
$string['app_gd_tarjetas_how'] = 'Print them with «Print cards»: with the names of a list or numbered. The card that is turned comes two to a page; the others, a page per student. Laminated, they last the whole year.
Ask, give time to think in silence and, at the signal («three, two, one, up!»), all at once: so nobody looks at what the next one raises.
Without a phone: you read the colours at a glance; if you want the numbers on the board, count them with + and −.
Talk before giving the answer: «Those with blue, why?». Have someone of each colour explain theirs.
«In groups»: each one to the place of their colour (the corner, the hoop or the table of that colour); there, they talk it over; then «Two minutes to convince» someone of another colour, and they vote again.
Peer instruction: they vote, discuss it in pairs with someone who chose something else, and vote again (Crouch and Mazur, 2001).
By tables: each table counts its colours and tells you; so they do the counting.
One by one: go round the tables and ask or take notes; with 12 to 30 students it does not take long.
With the camera: «Read the cards», with the camera of the board\'s computer or with the phone («Read the cards» on the fixed remote), pointing at the raised cards or going round the tables. Each one is outlined in its colour and the board counts, says who is still to be read and, only if you ask, who answered what. The pictures do not leave the device: only card numbers and letters reach the board. They are read with the list they were printed for: if the list changes, print them again.
With an old phone or without a camera, everything else works the same: the card does not need the phone. A photo of the class with the cards up is a record to look at later.
The traffic light while they work: the card on the table, red if they need help; you go to the red ones first.
Yes and no, for quick true or false; the four separate cards, for those who still get mixed up turning one.';
$string['app_gd_tarjetas_scene'] = 'In year two, the teacher asks which weighs more: A, a kilo of straw; B, a kilo of iron; C, they weigh the same. The cards go up at once and there is a lot of blue. «In groups»: blue to the blue hoop, red to the red one, yellow to the yellow one. In each hoop they talk for a minute, and then each one looks for someone of another colour to convince.
When they vote again there is much more yellow. Those still on blue explain why, and the class balance settles the discussion.';
$string['app_gd_tarjetas_sources'] = 'Narayan, J. S., Heward, W. L., Gardner, R., Courson, F. H. and Omness, C. K. (1990). Using response cards to increase student participation in an elementary classroom. Journal of Applied Behavior Analysis, 23(4), 483–490.|https://doi.org/10.1901/jaba.1990.23-483
Gardner, R., Heward, W. L. and Grossi, T. A. (1994). Effects of response cards on student participation and academic achievement: A systematic replication with inner-city students during whole-class science instruction. Journal of Applied Behavior Analysis, 27(1), 63–71.|https://doi.org/10.1901/jaba.1994.27-63
Lasry, N. (2008). Clickers or flashcards: Is there really a difference? The Physics Teacher, 46(4), 242–244.|https://doi.org/10.1119/1.2895678
Wiliam, D. (2011). Embedded Formative Assessment. Solution Tree Press.
Northwest Educational Service District 189 (n. d.). ABCD Cards. Formative Assessment Techniques (handout adapted from Wiliam, 2011).|https://www.nwesd.org/wp-content/uploads/2013/08/EL_ABCD_Cards_kdj.pdf
Crouch, C. H. and Mazur, E. (2001). Peer Instruction: Ten years of experience and results. American Journal of Physics, 69(9), 970–977.|https://doi.org/10.1119/1.1374249';
$string['app_gd_tarjetas_stages'] = 'early|Yes and no, or the traffic light, and moving: those with the red card, to the red hoop; count together how many are in each hoop.
primary|The card that is turned or the four cards with multiple choice questions; in groups and convincing someone of another colour; the traffic light while they work.
secondary|Concept questions with a common mistake among the options: vote, discuss in pairs and vote again.
advanced|Peer instruction in large groups without devices: the cards work as well as clickers.';
$string['app_gd_tarjetas_what'] = 'Voting without devices: hands up or printed cards (one that is turned with A, B, C and D, four separate cards, the traffic light, or yes and no). The board prints the cards with the names of the class, and helps to count and to make groups by answer. No phone is needed: the card works on its own; if you like, the card that is turned can be read with the camera of the computer or the phone.';
$string['app_gd_tarjetas_why'] = 'When each student answers with a card instead of raising a hand for one to answer, everyone answers. In a year four class, Narayan, Heward, Gardner, Courson and Omness (1990) found that with response cards participation was much higher than with hands up, that most students did better in the daily quizzes, and that 19 of the 20 students preferred them. In a replication in a year five science class, Gardner, Heward and Grossi (1994) counted fourteen times more answers, and all 22 students did better on what was taught with cards.
Technology is not what counts: in physics, with peer instruction, Lasry (2008) compared clickers with paper flashcards and found that clickers gave no advantage in what was learned; their value is mostly in recording the data.
ABCD cards are one of the techniques of Wiliam (2011): a question with up to four options, time to think and, at a signal, everyone raises their answer. If one option is a common mistake, it is clear at once who has it; and with questions of opinion, hearing someone defend another answer makes some change their mind.';
$string['app_gd_tarjetas_works'] = 'Everyone answers at once, not only whoever raises a hand.
Seeing at a glance what the class has understood and who needs help.
Explaining why: every answer has someone to defend it.
Moving and grouping by answer.
Working «unplugged», with the material in their hands.';
$string['app_gd_tiempo_how'] = 'Choose an example or make your own timeline: a line per event («1492 | Columbus reaches America») or per period («476 – 1492 | Middle Ages»).
«See it all» fits the timeline; drag to move along it and zoom with the wheel, two fingers or the magnifier: the marks go from days to years, centuries or millions of years.
«Hide the dates»: the class puts the events in order before seeing them; a tap on one shows its date.
To feel duration, compare periods («how many Middle Ages fit in Ancient history?») or look for where Homo sapiens is in the history of the Earth.
The AI of your Moodle or your own AI can suggest events on a topic: check the dates before using them.';
$string['app_gd_tiempo_scene'] = 'In year six, the teacher opens the history of the Earth with the dates hidden and asks what came first, the dinosaurs or the first people. They know at once.
Then she taps «See it all» and looks for Homo sapiens: the line has to be zoomed in a long way to see it apart from «Today». The class goes quiet for a moment.';
$string['app_gd_tiempo_sources'] = 'Pagès, J. and Santisteban, A. (2010). La enseñanza y el aprendizaje del tiempo histórico en la educación primaria. Cadernos CEDES, 30(82), 281–309.|https://doi.org/10.1590/S0101-32622010000300002
Cheek (2010). Factors underlying students\' conceptions of deep time: An exploratory study. Doctoral thesis, Durham University.|https://etheses.durham.ac.uk/277/
International Commission on Stratigraphy. International Chronostratigraphic Chart (the ages of the eras in the example).|https://stratigraphy.org/chart';
$string['app_gd_tiempo_stages'] = 'primary|A life or a school year, with months and years; the history of flight; before and after Christ.
secondary|The ages of history and what was happening elsewhere at the same time; the periods of a topic.
advanced|The history of the Earth, with its eras, and the scale of deep time.';
$string['app_gd_tiempo_what'] = 'A timeline that zooms in and out, from days to the age of the Earth: events (a point) and periods (a bar), with examples for each stage and timelines of your own, written or asked to an AI.';
$string['app_gd_tiempo_why'] = 'Historical time is a complex concept: Pagès and Santisteban (2010) propose teaching it in primary school with a model that goes beyond learning dates, so that history helps to understand the present from the past.
With deep time, the order is usually clear and duration is the hard part: interviewing 35 students, Cheek (2010) found that putting the great events of the Earth\'s history in order was easy for them and measuring the time between them was not, partly because of numbers in the thousands and millions. Zooming the line in and out makes those distances visible.';
$string['app_gd_tiempo_works'] = 'Putting events in order and seeing what happens at the same time.
Duration: how far one event is from another, and how long some periods are next to others.
Scales: the months of a life, the centuries of history, the millions of years of the Earth.
Before and after Christ, and «millions of years ago».';
$string['app_gd_why'] = 'Why';
$string['app_gd_works'] = 'What it works on';
$string['app_gen_again'] = 'Again';
$string['app_gen_big_view'] = 'Large view';
$string['app_gen_cancel'] = 'Cancel';
$string['app_gen_close'] = 'Close';
$string['app_gen_done'] = 'Done';
$string['app_gen_pause'] = 'Pause';
$string['app_gen_reset'] = 'Reset';
$string['app_gen_resume'] = 'Resume';
$string['app_gen_save'] = 'Save';
$string['app_gen_start'] = 'Start';
$string['app_gl_add'] = 'Add {$a}';
$string['app_gl_count'] = '{$a->n} of {$a->of}';
$string['app_gl_count_frac'] = '{$a->frac} · {$a->pct}%';
$string['app_gl_count_left'] = '{$a->n} of {$a->of} · {$a->left} to go';
$string['app_gl_done'] = 'We did it!';
$string['app_gl_fact_jupiter'] = 'the biggest planet of the solar system';
$string['app_gl_fact_mars'] = 'the red planet';
$string['app_gl_fact_neptune'] = 'the farthest from the Sun';
$string['app_gl_fact_saturn'] = 'the one with the most striking rings';
$string['app_gl_fact_uranus'] = 'it spins lying on its side';
$string['app_gl_for'] = 'For: {$a}';
$string['app_gl_goal'] = 'Class goal';
$string['app_gl_help'] = 'The whole class scores together; when it reaches the goal, the prize.';
$string['app_gl_look'] = 'Look';
$string['app_gl_look_bote'] = 'Jar of marbles';
$string['app_gl_look_camino'] = 'The critter\'s path';
$string['app_gl_look_cancion'] = 'A song, note by note';
$string['app_gl_look_cohete'] = 'A rocket through the solar system';
$string['app_gl_look_mosaico'] = 'A mosaic that uncovers a picture';
$string['app_gl_look_planta'] = 'A plant that grows';
$string['app_gl_no_song'] = 'There are no songs in the score';
$string['app_gl_notes'] = '{$a->n} of {$a->of} notes';
$string['app_gl_pic_choose'] = 'Choose a picture';
$string['app_gl_pic_mar'] = 'Under the sea';
$string['app_gl_pic_mia'] = 'A picture of mine';
$string['app_gl_pic_note'] = 'Your picture stays only in this browser.';
$string['app_gl_pic_paisaje'] = 'Sunset in the mountains';
$string['app_gl_picture'] = 'Picture';
$string['app_gl_pl_done'] = 'We\'ve reached Neptune, the farthest planet from the Sun!';
$string['app_gl_pl_earth'] = 'Earth';
$string['app_gl_pl_jupiter'] = 'Jupiter';
$string['app_gl_pl_mars'] = 'Mars';
$string['app_gl_pl_mercury'] = 'Mercury';
$string['app_gl_pl_neptune'] = 'Neptune';
$string['app_gl_pl_saturn'] = 'Saturn';
$string['app_gl_pl_scale'] = 'Not to scale';
$string['app_gl_pl_start'] = 'Lift-off from the Earth';
$string['app_gl_pl_uranus'] = 'Uranus';
$string['app_gl_pl_venus'] = 'Venus';
$string['app_gl_plant_flower'] = 'It flowers';
$string['app_gl_plant_fruit'] = 'It bears fruit';
$string['app_gl_plant_germ'] = 'It germinates';
$string['app_gl_plant_grows'] = 'It grows';
$string['app_gl_plant_seed'] = 'Seed';
$string['app_gl_plant_seedling'] = 'Seedling';
$string['app_gl_prize'] = 'Prize';
$string['app_gl_prize_ph'] = 'An afternoon of games';
$string['app_gl_reset'] = 'Start again';
$string['app_gl_reset_sure'] = 'Sure? Press again';
$string['app_gl_skip'] = 'Counting in {$a}s';
$string['app_gl_song'] = 'Song';
$string['app_gl_take'] = 'Take away {$a}';
$string['app_gl_target'] = 'Goal';
$string['app_gl_teams'] = 'Teams';
$string['app_gl_tiles'] = '{$a->n} of {$a->of} tiles uncovered';
$string['app_gl_what'] = 'What to count';
$string['app_hp_again'] = 'Again';
$string['app_hp_ahorcado_1'] = 'To open a new topic, a mystery word: if they guess it, they know what today\'s lesson is about.';
$string['app_hp_ahorcado_2'] = 'In «Games», «Hangman», choose «I\'ll type it» and type the word, which nobody sees. A clue too, if you like.';
$string['app_hp_ahorcado_3'] = 'Press «New word» and tap the letters the class calls out on the keyboard.';
$string['app_hp_ahorcado_4'] = 'Instead of a hanged figure, seven balloons: each wrong letter pops one.';
$string['app_hp_ahorcado_5'] = 'No word to hand? «At random» brings words for each stage.';
$string['app_hp_ahorcado_6'] = 'Your turn: press «New word» and try a letter on the keyboard.';
$string['app_hp_ahorcado_7'] = 'You\'ve got it! This critter is yours: the Balloon Saver.';
$string['app_hp_ahorcado_again'] = 'Well done! The Balloon Saver is already yours.';
$string['app_hp_ahorcado_clue'] = 'What we\'re going to study today';
$string['app_hp_ahorcado_h1'] = 'Press «New word»';
$string['app_hp_ahorcado_h2'] = 'Try the E';
$string['app_hp_ahorcado_title'] = 'Hangman: the word that opens the topic';
$string['app_hp_ahorcado_word'] = 'ECOSYSTEM';
$string['app_hp_balanza_1'] = 'Time to solve 3x + 1 = x + 9, and a student knows the rule: «move the 1 over and subtract». But why subtract? Today she finds out on the balance scale.';
$string['app_hp_balanza_2'] = 'In «Materials», «Balance scale», choose «Equations», type it in and press «Put». Each box weighs x, and both pans weigh the same.';
$string['app_hp_balanza_3'] = 'She takes the 1 off one pan only, and the scale tips. To bring it back into balance, a 1 has to come off the other pan too.';
$string['app_hp_balanza_4'] = 'That\'s all «move it over and subtract» meant: the same off both pans. Boxes work the same way: «Take a box off each pan». That leaves 2x = 8.';
$string['app_hp_balanza_5'] = 'With «Share both pans out by 2», a box is left on its own: x = 4. To check, put the equation in again and press «Open the boxes»: a 4 in each one.';
$string['app_hp_balanza_6'] = 'Your turn: take the same off both pans until a box is left on its own.';
$string['app_hp_balanza_7'] = 'You\'ve got it! This critter is yours: the X Finder.';
$string['app_hp_balanza_again'] = 'Well done! The X Finder is already yours.';
$string['app_hp_balanza_h1'] = 'Press «Take 1 off each pan»';
$string['app_hp_balanza_h2'] = 'Now «Take a box off each pan»';
$string['app_hp_balanza_h3'] = 'And «Share both pans out by 2»';
$string['app_hp_balanza_title'] = 'Balance scale: equations in balance';
$string['app_hp_calculadora_1'] = 'The class is planning a trip to the science museum: there are 24 of them, three can\'t go and a ticket costs 6 euros. How much do they pay altogether?';
$string['app_hp_calculadora_2'] = 'In «Materials», «Calculator». The basic one has brackets: (24 − 3) × 6 goes in just as it is written in the exercise book.';
$string['app_hp_calculadora_3'] = 'With «Estimate first», pressing «=» shows «?»: first they say how much they think it will be. About a hundred and twenty. «Show the result» checks it.';
$string['app_hp_calculadora_4'] = 'With «Step by step», the operation comes out line by line: underlined, what comes next; in green, what has just been worked out. It\'s 126 euros.';
$string['app_hp_calculadora_5'] = 'From Secondary on, the «Scientific» one. With «2nd», the keys change: sine turns into its inverse, and the square root into the cube root. The cube root of 27 is 3.';
$string['app_hp_calculadora_6'] = 'Your turn: press «=» and, once they have estimated, «Show the result».';
$string['app_hp_calculadora_7'] = 'You\'ve got it! This critter is yours: the Number Cruncher.';
$string['app_hp_calculadora_again'] = 'Well done! The Number Cruncher is already yours.';
$string['app_hp_calculadora_h1'] = 'Press «=»';
$string['app_hp_calculadora_h2'] = 'They have estimated: «Show the result»';
$string['app_hp_calculadora_title'] = 'Calculator: estimate first, then work it out';
$string['app_hp_captions'] = 'Captions';
$string['app_hp_close'] = 'Close the help';
$string['app_hp_close_short'] = 'Close';
$string['app_hp_concurso_1'] = 'Year six have written a quiz about volcanoes for year four. Today year four play it, in teams.';
$string['app_hp_concurso_2'] = 'In «Quiz», press «New set» and «Paste several questions, or ask an AI for them»: one per line, with an asterisk before the right answer. The «Prompt for your AI» already uses that format.';
$string['app_hp_concurso_3'] = 'Under «Teams», «They choose», then open the session: everyone picks a team as they join.';
$string['app_hp_concurso_4'] = 'Press «Start the quiz». The clock runs and, once everyone has answered, the right answer appears with how many chose each one.';
$string['app_hp_concurso_5'] = '«Next question» and, at the end, the team podium. Next time, year four write the quiz for year six.';
$string['app_hp_concurso_6'] = 'Your turn: press «Start the quiz» and, once the right answer appears, «Next question».';
$string['app_hp_concurso_7'] = 'You\'ve got it! This critter is yours: the Question Launcher.';
$string['app_hp_concurso_again'] = 'Well done! The Question Launcher is already yours.';
$string['app_hp_concurso_h1'] = 'Press «Start the quiz»';
$string['app_hp_concurso_h2'] = 'It\'s uncovered: «Next question»';
$string['app_hp_concurso_name'] = 'Volcanoes (by Year 6)';
$string['app_hp_concurso_text'] = 'What do we call molten rock when it comes out of a volcano? | Magma | *Lava | Ash
On which island is Mount Teide? | Gran Canaria | Lanzarote | *Tenerife';
$string['app_hp_concurso_title'] = 'Quiz: they write it';
$string['app_hp_concurso_topic'] = 'Volcanoes';
$string['app_hp_cortina_1'] = 'You\'re going over the exercise out loud: the answers are already on the board, but covered.';
$string['app_hp_cortina_2'] = 'On the «Full board», the «Curtain» covers the whole board.';
$string['app_hp_cortina_3'] = 'Drag its edge to uncover the first answer; once they\'ve said it, the next one.';
$string['app_hp_cortina_4'] = 'With the «Spotlight», only a circle stays lit: what matters, and nothing else.';
$string['app_hp_cortina_5'] = 'And with the «Laser pointer», you point without leaving a mark.';
$string['app_hp_cortina_6'] = 'Your turn: open the «Curtain» and uncover it by dragging its edge.';
$string['app_hp_cortina_7'] = 'You\'ve got it! This critter is yours: the Curtain Raiser.';
$string['app_hp_cortina_again'] = 'Well done! The Curtain Raiser is already yours.';
$string['app_hp_cortina_h1'] = 'Open the «Curtain»';
$string['app_hp_cortina_h2'] = 'Drag its edge down';
$string['app_hp_cortina_title'] = 'Curtain and spotlight';
$string['app_hp_dados_1'] = 'After reading a story, two dice: one says who answers and the other, which question.';
$string['app_hp_dados_2'] = 'In «Chance», «Dice», choose two: the first, the class list; the second, «Custom».';
$string['app_hp_dados_3'] = 'Type the faces, one per line: who?, where?, when?, why?…';
$string['app_hp_dados_4'] = 'Press «Roll»: a name and a question come out, and off they go.';
$string['app_hp_dados_5'] = 'There are dice with operations, arrows, letters or colours. And with number dice, «Many throws»: a thousand at once, and seven comes up far more often than twelve.';
$string['app_hp_dados_6'] = 'Your turn: set three dice and press «Roll».';
$string['app_hp_dados_7'] = 'You\'ve got it! This critter is yours: the Dice Roller.';
$string['app_hp_dados_again'] = 'Well done! The Dice Roller is already yours.';
$string['app_hp_dados_faces'] = 'Who?
Where?
When?
Why?
What happened?
How does it end?';
$string['app_hp_dados_h1'] = 'Set three dice';
$string['app_hp_dados_h2'] = 'And now «Roll»';
$string['app_hp_dados_title'] = 'Dice: the question die';
$string['app_hp_done'] = 'Well done!';
$string['app_hp_ejercicios_1'] = 'In «Games», «Order» comes with examples, like the water cycle. This week it\'s the frog\'s life cycle, and that one you write yourself.';
$string['app_hp_ejercicios_2'] = 'Press «My exercises» and write your own: the title after #, one stage per line, in order, and after ?, the reason why.';
$string['app_hp_ejercicios_3'] = 'Below, it says «1 exercise ready». To ask your AI for more, on any topic, «Prompt for your AI» gives you the text. Press «Save».';
$string['app_hp_ejercicios_4'] = 'Pick it under «Exercise» and press «Start». The class calls out the order and you tap the cards; «Check» sends the wrong ones back, with their reason.';
$string['app_hp_ejercicios_5'] = 'Second time round, all in order! «Sort», «Spot the mistakes» and «Who am I?» work the same way: each one explains its format in «My exercises».';
$string['app_hp_ejercicios_6'] = 'Your turn: write a short exercise, with a title and two lines, and press «Save».';
$string['app_hp_ejercicios_7'] = 'You\'ve got it! This critter is yours: the Game Maker.';
$string['app_hp_ejercicios_again'] = 'Well done! The Game Maker is already yours.';
$string['app_hp_ejercicios_h1'] = 'Type # and a title; below it, two lines in order';
$string['app_hp_ejercicios_h2'] = 'When you finish, «Save»';
$string['app_hp_ejercicios_practice'] = '# From wheat to bread
Grind the wheat
Knead
Bake';
$string['app_hp_ejercicios_text'] = '# The frog\'s life cycle
Egg
Tadpole
Tadpole with legs
Frog
? Tadpole with legs: a tadpole grows its legs before it loses its tail';
$string['app_hp_ejercicios_title'] = 'My exercises: a game for every topic';
$string['app_hp_ejercicios_topic'] = 'Plants';
$string['app_hp_entrar_1'] = '«Live» opens your board to phones. Let\'s see it at a parents\' evening.';
$string['app_hp_entrar_2'] = 'Choose «Vote» and, under «How do they join?», «With the code»: no account needed, so families can join too.';
$string['app_hp_entrar_3'] = 'Press «Open the session». The board shows a QR code and a four-letter code.';
$string['app_hp_entrar_4'] = 'Every phone that joins becomes a little critter with its own name. Nobody knows who voted what.';
$string['app_hp_entrar_5'] = 'They\'re in. Ask whatever you like: for example, where shall we go on our school trip?';
$string['app_hp_entrar_6'] = 'Your turn: choose «Vote», then «With the code», and press «Open the session».';
$string['app_hp_entrar_7'] = 'You\'ve got it! This critter is yours: the Phone Tamer.';
$string['app_hp_entrar_again'] = 'Well done! The Phone Tamer is already yours.';
$string['app_hp_entrar_h1'] = 'Press «Vote»';
$string['app_hp_entrar_h2'] = 'Now «With the code»';
$string['app_hp_entrar_h3'] = 'And «Open the session»';
$string['app_hp_entrar_q'] = 'Where shall we go on our school trip?';
$string['app_hp_entrar_title'] = 'Getting the class in';
$string['app_hp_fictional'] = 'Practice class · fictitious data';
$string['app_hp_guided'] = 'Guided help';
$string['app_hp_instrumentos_1'] = 'Geometry on the board, with the real instruments: ruler, protractor and compass.';
$string['app_hp_instrumentos_2'] = 'On the «Full board», bring out the «Ruler»: the pen, held against its edge, draws straight.';
$string['app_hp_instrumentos_3'] = 'With the «Protractor», move its arm and read the angle.';
$string['app_hp_instrumentos_4'] = 'The «Compass»: open it to the length you want and turn it from the pencil to draw the circle.';
$string['app_hp_instrumentos_5'] = 'Each instrument moves when you drag it and turns from its handle.';
$string['app_hp_instrumentos_6'] = 'Your turn: bring out the «Compass» and draw a circle turning it from the pencil.';
$string['app_hp_instrumentos_7'] = 'You\'ve got it! This critter is yours: the Circle Drawer.';
$string['app_hp_instrumentos_again'] = 'Well done! The Circle Drawer is already yours.';
$string['app_hp_instrumentos_h1'] = 'Bring out the «Compass»';
$string['app_hp_instrumentos_h2'] = 'Turn it from the pencil';
$string['app_hp_instrumentos_title'] = 'Ruler, protractor and compass';
$string['app_hp_mando_1'] = 'They\'re working in groups and you go from table to table. In «Live», «Remote», press «Turn the fixed remote on».';
$string['app_hp_mando_2'] = 'Scan the QR code with your phone: the address doesn\'t change and doesn\'t ask you to log in. Your phone now drives this board.';
$string['app_hp_mando_3'] = 'In «Go to a tool», the timer: start it from your phone and, if a group needs a little longer, «+1 minute».';
$string['app_hp_mando_4'] = '«Whose turn?» picks someone to tell everyone how their group is doing, and the «Curtain» covers the board while they think.';
$string['app_hp_mando_5'] = 'Save the address on your phone: it works all year and for all your classes, which you switch in «Change the class». If it ever gets out, «Change the address».';
$string['app_hp_mando_6'] = 'Your turn: from your phone, start the timer and then press «Whose turn?».';
$string['app_hp_mando_7'] = 'You\'ve got it! This critter is yours: the Remote Master.';
$string['app_hp_mando_again'] = 'Well done! The Remote Master is already yours.';
$string['app_hp_mando_h1'] = 'On the phone, the timer: «Start»';
$string['app_hp_mando_h2'] = 'Now open «More orders»';
$string['app_hp_mando_h3'] = 'And «Whose turn?»';
$string['app_hp_mando_title'] = 'The fixed remote: the board in your pocket';
$string['app_hp_manos_1'] = 'At circle time, the class chooses a name for its pet. No screens: they raise their hands and you count.';
$string['app_hp_manos_2'] = 'Choose «Hands up or cards» and, under «Answers», «My own answers»: type the names, one per line.';
$string['app_hp_manos_3'] = 'Type the question and count the hands for each name with «+».';
$string['app_hp_manos_4'] = 'The bars grow as you count; if you add one too many, «−».';
$string['app_hp_manos_5'] = 'Fluffy wins. For the next question, «Back to zero».';
$string['app_hp_manos_6'] = 'Your turn: count one more hand for Cinnamon and then press «Back to zero».';
$string['app_hp_manos_7'] = 'You\'ve got it! This critter is yours: the Hand Counter.';
$string['app_hp_manos_again'] = 'Well done! The Hand Counter is already yours.';
$string['app_hp_manos_h1'] = 'One more hand for Cinnamon';
$string['app_hp_manos_h2'] = 'And now «Back to zero»';
$string['app_hp_manos_pets'] = 'Lola
Fluffy
Cinnamon';
$string['app_hp_manos_q'] = 'What\'s our pet called?';
$string['app_hp_manos_title'] = 'Hands up: the class pet';
$string['app_hp_meta_1'] = 'The whole class pulls the same way: if together they reach the goal, the prize is for everyone.';
$string['app_hp_meta_2'] = 'In «Scoreboard», «Class goal», set the goal and the prize: for example, thirty, and an afternoon of games.';
$string['app_hp_meta_3'] = 'Every time the whole class manages it, add a point. In Primary, a rocket crosses the solar system, with a fact about each planet it passes.';
$string['app_hp_meta_4'] = 'Each level starts with a look of its own: in Early years, the critter\'s path, to count squares; from Secondary on, a mosaic that uncovers a picture, with the fraction and the percentage.';
$string['app_hp_meta_5'] = 'Under «Look» there are more: the plant that grows, a song note by note or the jar of marbles. And when they reach the goal, we did it!';
$string['app_hp_meta_6'] = 'Your turn: add five to the class goal.';
$string['app_hp_meta_7'] = 'You\'ve got it! This critter is yours: the Goal Getter.';
$string['app_hp_meta_again'] = 'Well done! The Goal Getter is already yours.';
$string['app_hp_meta_h1'] = 'Add five with «+5»';
$string['app_hp_meta_prize'] = 'An afternoon of games';
$string['app_hp_meta_title'] = 'Class goal: all together';
$string['app_hp_next'] = 'Next step';
$string['app_hp_now_you'] = 'Now you';
$string['app_hp_nube_1'] = 'At the end of the fractions lesson, one question: what wasn\'t clear? Whatever comes up most is what you go over tomorrow.';
$string['app_hp_nube_2'] = 'In «Brainstorm», type the question and press «Open the answers»: everyone replies with one word from their phone.';
$string['app_hp_nube_3'] = 'With «Check before showing», the answers reach you first: anything off topic, you hide.';
$string['app_hp_nube_4'] = 'Press «Show all». However it\'s written, the same word counts once and grows: denominator, eight times.';
$string['app_hp_nube_5'] = 'If two people say the same thing in other words, tap both and press «Join». With «Save image», it\'s ready for tomorrow.';
$string['app_hp_nube_6'] = 'Your turn: press «Open the answers» and, when they arrive, «Show all».';
$string['app_hp_nube_7'] = 'You\'ve got it! This critter is yours: the Cloud Catcher.';
$string['app_hp_nube_again'] = 'Well done! The Cloud Catcher is already yours.';
$string['app_hp_nube_h1'] = 'Press «Open the answers»';
$string['app_hp_nube_h2'] = 'They\'re in: «Show all»';
$string['app_hp_nube_q'] = 'What wasn\'t clear?';
$string['app_hp_nube_title'] = 'Brainstorm: the cloud of doubts';
$string['app_hp_partitura_1'] = 'Today, the relay song: each pupil comes up to the board and plays one note on the glockenspiel.';
$string['app_hp_partitura_2'] = 'In «Materials», «Score», choose a song: folk songs from many countries come with it, and each one says where it\'s from.';
$string['app_hp_partitura_3'] = 'Press «Listen»: the tune plays and the notes light up, with their name and their colour.';
$string['app_hp_partitura_4'] = 'With «Play with me», the glockenspiel lights up the next note and waits: someone comes up, plays it, and it\'s the next one\'s turn.';
$string['app_hp_partitura_5'] = 'And to practise the notes, «Which note is it?»: one plays and the class guesses it.';
$string['app_hp_partitura_6'] = 'Your turn: press «Play with me» and play the note that lights up on the glockenspiel.';
$string['app_hp_partitura_7'] = 'You\'ve got it! This critter is yours: the Note Player.';
$string['app_hp_partitura_again'] = 'Well done! The Note Player is already yours.';
$string['app_hp_partitura_h1'] = 'Press «Play with me»';
$string['app_hp_partitura_h2'] = 'Play the note that lights up';
$string['app_hp_partitura_title'] = 'Score: the relay song';
$string['app_hp_pause'] = 'Pause';
$string['app_hp_pizarra_1'] = 'In maths you draw freehand, and the board makes a clean copy.';
$string['app_hp_pizarra_2'] = 'On the «Full board», draw a triangle by hand and keep your finger still at the end: it comes out perfect.';
$string['app_hp_pizarra_3'] = 'The same with a circle: by hand, a moment still, and a perfect circle.';
$string['app_hp_pizarra_4'] = 'With «Formula», you type it the way you say it: x squared plus one, over two. And it comes out as in the book.';
$string['app_hp_pizarra_5'] = 'With «Select, move and resize», anything can be moved or resized.';
$string['app_hp_pizarra_6'] = 'Your turn: draw a circle by hand and keep your finger still at the end.';
$string['app_hp_pizarra_7'] = 'You\'ve got it! This critter is yours: the Tidy Hand.';
$string['app_hp_pizarra_again'] = 'Well done! The Tidy Hand is already yours.';
$string['app_hp_pizarra_h1'] = 'Draw a circle by hand and keep your finger still at the end';
$string['app_hp_pizarra_title'] = 'Magic shapes and formulas';
$string['app_hp_play'] = 'Play';
$string['app_hp_practice_board'] = 'Practice board';
$string['app_hp_practice_course'] = 'Class 4B · Science';
$string['app_hp_practice_half_a'] = 'Split group A';
$string['app_hp_practice_half_b'] = 'Split group B';
$string['app_hp_practice_list'] = 'Class 4B';
$string['app_hp_practice_other1'] = 'Class 3A · Maths';
$string['app_hp_practice_other2'] = 'Class 2C · Language';
$string['app_hp_practice_phone'] = 'The teacher\'s phone';
$string['app_hp_prev'] = 'Previous step';
$string['app_hp_pulsadores_1'] = 'You read a text aloud with a hidden mistake: «Columbus reached America in 1942». The first team to catch it buzzes.';
$string['app_hp_pulsadores_2'] = 'In «Buzzers», choose how many teams and open the session: everyone joins a team as they come in.';
$string['app_hp_pulsadores_3'] = 'Press «Open the buzzers» and start reading. From then on, every phone is its team\'s buzzer.';
$string['app_hp_pulsadores_4'] = 'The first one shows big, with who pressed; the others, with how many hundredths of a second later.';
$string['app_hp_pulsadores_5'] = '«Close the buzzers», that team answers and, with «Another round», on to the next mistake.';
$string['app_hp_pulsadores_6'] = 'Your turn: press «Open the buzzers» and, when someone buzzes, «Close the buzzers».';
$string['app_hp_pulsadores_7'] = 'You\'ve got it! This critter is yours: the Bell Ringer.';
$string['app_hp_pulsadores_again'] = 'Well done! The Bell Ringer is already yours.';
$string['app_hp_pulsadores_h1'] = 'Press «Open the buzzers»';
$string['app_hp_pulsadores_h2'] = 'They\'ve buzzed: «Close the buzzers»';
$string['app_hp_pulsadores_title'] = 'Buzzers: catch the mistake';
$string['app_hp_rosco_1'] = 'Friday revision: two teams, each with its own wheel and its own clock.';
$string['app_hp_rosco_2'] = 'In «Games», «Alphabet wheel», choose «Two teams» and the time, and press «Start».';
$string['app_hp_rosco_3'] = 'Read the clue and mark «Right», «Wrong» or «Pass». After a right answer the same team carries on; otherwise, it\'s the other team\'s turn.';
$string['app_hp_rosco_4'] = 'Each clock only runs during its team\'s turn.';
$string['app_hp_rosco_5'] = 'With «New wheel» you write your own with the words of the topic, and it stays saved.';
$string['app_hp_rosco_6'] = 'Your turn: press «Start» and mark the first answer as «Right».';
$string['app_hp_rosco_7'] = 'You\'ve got it! This critter is yours: the Letter Catcher.';
$string['app_hp_rosco_again'] = 'Well done! The Letter Catcher is already yours.';
$string['app_hp_rosco_h1'] = 'Press «Start»';
$string['app_hp_rosco_h2'] = 'And mark «Right»';
$string['app_hp_rosco_title'] = 'Alphabet wheel: Friday revision';
$string['app_hp_salida_1'] = 'Five minutes before break, in Science: the exit ticket. From their phones, each one says how they\'re getting on and answers a couple of questions.';
$string['app_hp_salida_2'] = 'In «Live», choose «Exit ticket». Keep the four faces and write your questions, or pick them from «Ideas…»: the most important thing, and a question they still have.';
$string['app_hp_salida_3'] = 'Open the session, then «Open the ticket». While it\'s open, you only see who has handed it in; on the way out, each one shows their green screen.';
$string['app_hp_salida_4'] = '«Close the ticket» brings up how the class is getting on: today, eight are «Halfway».';
$string['app_hp_salida_5'] = '«Show the answers» sorts them into piles, from «Not yet» to «Could explain it». Nearly every question is the same: why isn\'t a spider an insect?';
$string['app_hp_salida_6'] = 'Your turn: press «Open the ticket» and, once they\'ve handed it in, «Close the ticket».';
$string['app_hp_salida_7'] = 'You\'ve got it! This critter is yours: the Ticket Clipper.';
$string['app_hp_salida_again'] = 'Well done! The Ticket Clipper is already yours.';
$string['app_hp_salida_h1'] = 'Press «Open the ticket»';
$string['app_hp_salida_h2'] = 'Once they\'ve handed it in, «Close the ticket»';
$string['app_hp_salida_title'] = 'Exit ticket: where the next lesson starts';
$string['app_hp_silabas_1'] = 'Before reading, in year one, five minutes of Simon with syllables: a word lights up, syllable by syllable, and it has to be repeated in order.';
$string['app_hp_silabas_2'] = 'In «Games», «Simon». Under «The pads show», choose «Syllables of a word». With «Its syllables light up», the word builds up above the pads.';
$string['app_hp_silabas_3'] = 'Then they repeat it on the pads, syllable by syllable. When they get it right, the whole word comes up big, and the next one follows.';
$string['app_hp_silabas_4'] = 'With «It is written and they split it», the word comes up whole and they split it. The words grow: two of two syllables, two of three, and so on up to five.';
$string['app_hp_silabas_5'] = 'In Early years, the syllables come up in capitals. With words of two and three syllables, one clap for each syllable.';
$string['app_hp_silabas_6'] = 'Your turn: press «Start» and split the word into its syllables.';
$string['app_hp_silabas_7'] = 'You\'ve got it! This critter is yours: the Light Chaser.';
$string['app_hp_silabas_again'] = 'Well done! The Light Chaser is already yours.';
$string['app_hp_silabas_h1'] = 'Press «Start»';
$string['app_hp_silabas_h2'] = 'Press its syllables in order';
$string['app_hp_silabas_title'] = 'Simon with syllables: five minutes before reading';
$string['app_hp_skip'] = 'Skip';
$string['app_hp_step'] = 'Step {$a->n} / {$a->all}';
$string['app_hp_step_you'] = 'Now you · step {$a->n} / {$a->all}';
$string['app_hp_tarjetas_1'] = 'A trick question in Science: which weighs more, a kilo of straw or a kilo of iron? No phones: everyone answers at once, with a card.';
$string['app_hp_tarjetas_2'] = 'In «Hands up or cards», press «Print cards»: one card that is turned, with A, B, C and D, or four separate ones, the traffic light, or yes and no. Each comes with a name from the list.';
$string['app_hp_tarjetas_3'] = 'At the signal, all the cards go up: lots of blue, the iron. With «In groups», everyone goes to the spot of their colour and talks about why.';
$string['app_hp_tarjetas_4'] = 'Then, «Two minutes to convince» someone of another colour. And cards up again: this time the camera reads them, with «Read the cards».';
$string['app_hp_tarjetas_5'] = 'The square mark in the middle tells whose card it is and what it answers: yellow wins, they weigh the same. Below, «Still to read» and «Who answered what».';
$string['app_hp_tarjetas_6'] = 'Your turn: press «Read the cards» and then «Use this computer\'s camera».';
$string['app_hp_tarjetas_7'] = 'You\'ve got it! This critter is yours: the Card Raiser.';
$string['app_hp_tarjetas_again'] = 'Well done! The Card Raiser is already yours.';
$string['app_hp_tarjetas_h1'] = 'Press «Read the cards»';
$string['app_hp_tarjetas_h2'] = 'And now «Use this computer\'s camera»';
$string['app_hp_tarjetas_q'] = 'Which weighs more? A: a kilo of straw. B: a kilo of iron. C: they weigh the same.';
$string['app_hp_tarjetas_title'] = 'Printed cards: everyone answers at once, without phones';
$string['app_hp_votar_1'] = 'Before the experiment, the question: does an egg float in salty water?';
$string['app_hp_votar_2'] = 'Choose «Yes or no» and press «Open the vote». Everyone votes from their phone.';
$string['app_hp_votar_3'] = 'While they vote, you only see how many have answered, so nobody follows what the others chose.';
$string['app_hp_votar_4'] = 'Press «Close the vote» and the bars appear: nearly everyone thinks it won\'t float.';
$string['app_hp_votar_5'] = 'Now the experiment. Then «Another question», with the same question: the bars have changed.';
$string['app_hp_votar_6'] = 'Your turn: press «Open the vote» and, once they\'ve voted, «Close the vote».';
$string['app_hp_votar_7'] = 'You\'ve got it! This critter is yours: the Vote Counter.';
$string['app_hp_votar_again'] = 'Well done! The Vote Counter is already yours.';
$string['app_hp_votar_h1'] = 'Press «Open the vote»';
$string['app_hp_votar_h2'] = 'They have voted: «Close the vote»';
$string['app_hp_votar_q'] = 'Does an egg float in salty water?';
$string['app_hp_votar_title'] = 'Vote: predict before the experiment';
$string['app_hp_watch'] = 'Watch how it works';
$string['app_hp_watch_captions'] = 'with captions · and at the end, try it yourself';
$string['app_hp_watch_voice'] = 'with voice · and at the end, try it yourself';
$string['app_hp_your_turn_n'] = 'Your turn · {$a->n} of {$a->all}';
$string['app_id_accept'] = 'Show “{$a}”';
$string['app_id_check_first'] = 'There are answers waiting to be checked below.';
$string['app_id_close'] = 'Close the answers';
$string['app_id_count'] = '{$a->n} answers · {$a->who} of {$a->of} devices';
$string['app_id_default_name'] = 'Brainstorm {$a}';
$string['app_id_empty'] = 'No answers yet.';
$string['app_id_file'] = 'brainstorm';
$string['app_id_hidden'] = 'Hidden: {$a}';
$string['app_id_hide'] = 'Hide';
$string['app_id_max'] = 'Answers each';
$string['app_id_max_many'] = '{$a} answers each';
$string['app_id_max_one'] = '1 answer each';
$string['app_id_merge'] = 'Join';
$string['app_id_new'] = 'New question';
$string['app_id_open'] = 'Open the answers';
$string['app_id_pending'] = 'To check: {$a}';
$string['app_id_question_ph'] = 'The question or the topic (the devices see it)';
$string['app_id_reject'] = 'Hide “{$a}”';
$string['app_id_reopen'] = 'Open again';
$string['app_id_restore'] = 'Tap one to show it again';
$string['app_id_review'] = 'Check before showing';
$string['app_id_save'] = 'Save image';
$string['app_id_saved'] = 'Image saved';
$string['app_id_scale_high'] = 'very much';
$string['app_id_scale_low'] = 'not at all';
$string['app_id_selected_many'] = '{$a} chosen';
$string['app_id_selected_one'] = '1 chosen';
$string['app_id_send'] = 'Send to the class';
$string['app_id_show_all'] = 'Show all';
$string['app_id_sort'] = 'Sort by how many times';
$string['app_id_star'] = 'Highlight';
$string['app_id_tray'] = 'Drag each answer to its box';
$string['app_id_tray_empty'] = 'All placed. Drag one back here to take it out.';
$string['app_id_unselect'] = 'Done';
$string['app_id_unstar'] = 'Remove the highlight';
$string['app_id_v_cloud'] = 'Cloud';
$string['app_id_v_eisen'] = 'Urgent or important';
$string['app_id_v_list'] = 'Ranking';
$string['app_id_v_procon'] = 'For and against';
$string['app_id_v_scale'] = 'Scale from 1 to 5';
$string['app_id_v_swot'] = 'SWOT';
$string['app_id_view'] = 'View';
$string['app_id_wait_open'] = 'Write the question and open the answers.';
$string['app_id_z_con'] = 'Against';
$string['app_id_z_ni'] = 'Important, not urgent';
$string['app_id_z_nn'] = 'Neither urgent nor important';
$string['app_id_z_o'] = 'Opportunities';
$string['app_id_z_pro'] = 'For';
$string['app_id_z_s'] = 'Strengths';
$string['app_id_z_t'] = 'Threats';
$string['app_id_z_ui'] = 'Urgent and important';
$string['app_id_z_un'] = 'Urgent, not important';
$string['app_id_z_w'] = 'Weaknesses';
$string['app_in_bevel'] = 'Set square (30° and 60°)';
$string['app_in_close'] = 'Remove';
$string['app_in_compass'] = 'Compass';
$string['app_in_curtain'] = 'Curtain: cover the board and uncover it bit by bit';
$string['app_in_protractor'] = 'Protractor';
$string['app_in_ruler'] = 'Ruler';
$string['app_in_spot'] = 'Spotlight';
$string['app_in_square'] = 'Set square (45°)';
$string['app_iv_ask'] = 'How is it written? (tap to see)';
$string['app_iv_bad'] = 'Write it like [−2, 3), x ≥ 1, −1 < x ≤ 4 or |x − 1| < 2';
$string['app_iv_help'] = 'Write it, or draw one at random. A tap on an end opens or closes it: a filled end is in, a hollow one is not.';
$string['app_iv_hide'] = 'Hide how it is written';
$string['app_iv_or'] = 'or';
$string['app_iv_put'] = 'Draw';
$string['app_iv_random'] = 'One at random';
$string['app_iv_write'] = 'An interval, an inequality or an absolute value';
$string['app_levels_other'] = 'Other levels';
$string['app_lock_again'] = 'Again';
$string['app_lock_bad_code'] = 'The code must have 2 to 8 numbers or letters.';
$string['app_lock_cancel'] = 'Cancel';
$string['app_lock_clues'] = 'Clues';
$string['app_lock_clues_label'] = 'Clues, one per line (shown in this order)';
$string['app_lock_code'] = 'Code (2 to 8 numbers or letters)';
$string['app_lock_copy_of'] = '{$a} (copy)';
$string['app_lock_edit'] = 'Edit';
$string['app_lock_editor_copy'] = 'Copy of the example lock';
$string['app_lock_editor_edit'] = 'Edit the lock';
$string['app_lock_erase'] = 'Delete';
$string['app_lock_final_msg'] = 'Message when it opens (optional)';
$string['app_lock_lock'] = 'Lock';
$string['app_lock_lock_name'] = 'Lock name';
$string['app_lock_minutes'] = '{$a} min';
$string['app_lock_name'] = 'Secret code';
$string['app_lock_new'] = 'New lock';
$string['app_lock_next_clue'] = 'Show the next clue';
$string['app_lock_no_more_clues'] = 'No more clues';
$string['app_lock_no_time'] = 'No time limit';
$string['app_lock_opened'] = 'Unlocked!';
$string['app_lock_press_start'] = 'Choose the lock and press “Start”';
$string['app_lock_remove'] = 'Delete the lock';
$string['app_lock_remove_sure'] = 'Are you sure? Press again';
$string['app_lock_save'] = 'Save';
$string['app_lock_start'] = 'Start';
$string['app_lock_time'] = 'Time';
$string['app_lock_time_up'] = 'Time\'s up!';
$string['app_lock_tries_many'] = '{$a} tries';
$string['app_lock_tries_one'] = '{$a} try';
$string['app_lock_wrong'] = 'That\'s not the code!';
$string['app_lv_after'] = '+{$a} s';
$string['app_lv_again'] = 'Another question';
$string['app_lv_anon'] = 'With the code';
$string['app_lv_anon_hint'] = 'Nobody logs in and no name shows: each device is a critter with a name.';
$string['app_lv_anon_short'] = 'No account: anyone can join, also from outside';
$string['app_lv_answered'] = '{$a->n} of {$a->of} have answered';
$string['app_lv_answers'] = 'Answers';
$string['app_lv_bye'] = 'The session is over. Thank you!';
$string['app_lv_change'] = 'You can change it until it closes.';
$string['app_lv_change_team'] = 'Change team';
$string['app_lv_choose'] = 'Choose your answer.';
$string['app_lv_close_round'] = 'Close the buzzers';
$string['app_lv_close_vote'] = 'Close the vote';
$string['app_lv_closed'] = 'Vote closed';
$string['app_lv_closes_in'] = 'Closes in {$a}';
$string['app_lv_cmd_next'] = 'Next tool';
$string['app_lv_cmd_pick'] = 'Whose turn?';
$string['app_lv_cmd_plus'] = '+1 minute';
$string['app_lv_cmd_present'] = 'Present';
$string['app_lv_cmd_prev'] = 'Previous tool';
$string['app_lv_cmd_reset'] = 'Reset the timer';
$string['app_lv_cmd_timer'] = 'Timer: start or pause';
$string['app_lv_code'] = 'Code';
$string['app_lv_copied'] = 'Copied';
$string['app_lv_copy'] = 'Copy the address';
$string['app_lv_custom'] = 'Answers, one per line (2 to 5)';
$string['app_lv_custom_ph'] = 'Red
Blue
Green';
$string['app_lv_device_n'] = 'Device {$a}';
$string['app_lv_devices'] = 'Who is in';
$string['app_lv_end'] = 'End the session';
$string['app_lv_end_confirm'] = 'Tap again to end it';
$string['app_lv_ended'] = 'Session ended';
$string['app_lv_enter'] = 'Enter';
$string['app_lv_ex_back'] = 'Back to the summary';
$string['app_lv_ex_change'] = 'Change it';
$string['app_lv_ex_close'] = 'Close the ticket';
$string['app_lv_ex_closed'] = 'Ticket closed';
$string['app_lv_ex_csv_who'] = 'Who';
$string['app_lv_ex_door'] = 'On the way out, each one shows their ticket: the green screen on their device.';
$string['app_lv_ex_download'] = 'Download';
$string['app_lv_ex_empty'] = 'Choose a face or write something first.';
$string['app_lv_ex_f0'] = 'I don\'t understand it yet';
$string['app_lv_ex_f1'] = 'I half understand it';
$string['app_lv_ex_f2'] = 'I understand it';
$string['app_lv_ex_f3'] = 'I could explain it to someone';
$string['app_lv_ex_feel_on'] = 'Ask «How are you getting on?» (four faces)';
$string['app_lv_ex_feel_q'] = 'How are you getting on?';
$string['app_lv_ex_file'] = 'exit-ticket';
$string['app_lv_ex_first'] = 'Prepare it now; open the session (on the left) a few minutes before the end, and then the ticket.';
$string['app_lv_ex_g_lesson'] = 'How the lesson went';
$string['app_lv_ex_g_self'] = 'How they worked';
$string['app_lv_ex_g_teacher'] = 'For the teacher';
$string['app_lv_ex_g_understand'] = 'What they understood';
$string['app_lv_ex_group'] = 'How to sort the tickets';
$string['app_lv_ex_group_feel'] = 'In piles, by how they are getting on';
$string['app_lv_ex_group_time'] = 'In the order they came';
$string['app_lv_ex_handed'] = '{$a->n} of {$a->of} have handed it in';
$string['app_lv_ex_hidden'] = 'Taken off the screen.';
$string['app_lv_ex_hide'] = 'Take it off the screen';
$string['app_lv_ex_hide_answers'] = 'Hide the answers';
$string['app_lv_ex_ideas'] = 'Ideas…';
$string['app_lv_ex_in'] = 'Handed in';
$string['app_lv_ex_lead'] = 'At the end of the lesson, each student says how they are getting on and answers one to three short questions. Three to five minutes; it tells you where to start the next lesson.';
$string['app_lv_ex_missing'] = 'Still to hand in';
$string['app_lv_ex_n'] = 'Ticket {$a}';
$string['app_lv_ex_names'] = 'With names';
$string['app_lv_ex_new'] = 'Another ticket';
$string['app_lv_ex_no_texts'] = 'No written answers.';
$string['app_lv_ex_none'] = 'You have not handed in the ticket.';
$string['app_lv_ex_nothing'] = 'The ticket needs the faces or at least one question.';
$string['app_lv_ex_open'] = 'Open the ticket';
$string['app_lv_ex_p_activity'] = 'Which activity today helped you learn most?';
$string['app_lv_ex_p_better'] = 'What could you have done to learn better?';
$string['app_lv_ex_p_confused'] = 'What I found hardest to understand today';
$string['app_lv_ex_p_doubt'] = 'A question I still have';
$string['app_lv_ex_p_effort'] = 'How hard did you work today? Why?';
$string['app_lv_ex_p_example'] = 'Give an example of what we saw today';
$string['app_lv_ex_p_group'] = 'Did the group work help you understand it? What would you change?';
$string['app_lv_ex_p_learned'] = 'The most important thing I learned today';
$string['app_lv_ex_p_teacher'] = 'What could I do to help you understand it better?';
$string['app_lv_ex_p_use'] = 'Where would you use it outside school?';
$string['app_lv_ex_p_words'] = 'Explain it in your own words: ';
$string['app_lv_ex_ph'] = 'A sentence or two';
$string['app_lv_ex_q_n'] = 'Question {$a}';
$string['app_lv_ex_q_optional'] = 'Optional';
$string['app_lv_ex_q_ph'] = 'Write it, or choose one from «Ideas»';
$string['app_lv_ex_random'] = 'One at random';
$string['app_lv_ex_random_again'] = 'Another';
$string['app_lv_ex_random_close'] = 'Close';
$string['app_lv_ex_reopen'] = 'Reopen';
$string['app_lv_ex_s0'] = 'Not yet';
$string['app_lv_ex_s1'] = 'Halfway';
$string['app_lv_ex_s2'] = 'Understand it';
$string['app_lv_ex_s3'] = 'Could explain it';
$string['app_lv_ex_s_none'] = 'No face';
$string['app_lv_ex_send'] = 'Hand it in';
$string['app_lv_ex_send_again'] = 'Hand it in again';
$string['app_lv_ex_sent'] = 'Ticket handed in';
$string['app_lv_ex_sent_text'] = 'Show it on the way out. You can change it while it is open.';
$string['app_lv_ex_show_answers'] = 'Show the answers';
$string['app_lv_ex_title'] = 'Exit ticket';
$string['app_lv_ex_total_many'] = '{$a} tickets';
$string['app_lv_ex_total_one'] = '{$a} ticket';
$string['app_lv_ex_veil'] = 'The answers do not show until you press «Show the answers»: check them before projecting them.';
$string['app_lv_ex_wait'] = 'Look at the board: the ticket is coming.';
$string['app_lv_failed'] = 'The site does not answer. Trying again…';
$string['app_lv_first'] = '{$a} pressed first!';
$string['app_lv_full'] = 'The session is full.';
$string['app_lv_go'] = 'Go!';
$string['app_lv_green'] = 'I get it';
$string['app_lv_hand_less'] = '{$a}: one hand less';
$string['app_lv_hand_more'] = '{$a}: one hand more';
$string['app_lv_hands_many'] = '{$a} hands';
$string['app_lv_hands_one'] = '{$a} hand';
$string['app_lv_hands_reset'] = 'Back to zero';
$string['app_lv_hidden'] = 'Anonymous with their account';
$string['app_lv_hidden_hint'] = 'Only this course\'s students get in, once each, but nobody sees who answered what: each one is a critter with a name.';
$string['app_lv_hidden_short'] = 'Only this course\'s students, no names: critters';
$string['app_lv_how'] = 'How do they join?';
$string['app_lv_idea_done'] = 'Sent. Look at the board!';
$string['app_lv_idea_left_many'] = 'You can send {$a} more';
$string['app_lv_idea_left_one'] = 'You can send 1 more';
$string['app_lv_idea_ph'] = 'One or two words';
$string['app_lv_idea_remove'] = 'Take back “{$a}”';
$string['app_lv_idea_send'] = 'Send';
$string['app_lv_idea_yours'] = 'Your answers';
$string['app_lv_in_many'] = '{$a} devices in';
$string['app_lv_in_one'] = '{$a} device in';
$string['app_lv_intro_buzz'] = 'Each tablet presses for its team: the board shows who was first, to the hundredth of a second.';
$string['app_lv_intro_hands'] = 'Count the raised hands for each answer with + and −.';
$string['app_lv_intro_ideas'] = 'Everyone writes a word or two from their device. The board makes a live cloud of them that you can highlight, join, sort and drag into a template.';
$string['app_lv_intro_quiz'] = 'Questions with one right answer: the devices answer, the board reveals it and counts the points.';
$string['app_lv_intro_remote'] = 'Your phone as a remote: start the timer, pick a student or change tool from anywhere in the classroom.';
$string['app_lv_intro_vote'] = 'The class answers from their tablets or computers, and the board counts the votes.';
$string['app_lv_join_title'] = 'Join the class';
$string['app_lv_joined'] = 'You are in.';
$string['app_lv_kick'] = 'Take {$a} out of the session';
$string['app_lv_kicked'] = 'The teacher has taken this device out of the session.';
$string['app_lv_kind_buzz'] = 'Buzzers';
$string['app_lv_kind_exit'] = 'Exit ticket';
$string['app_lv_kind_hands'] = 'Hands up or cards';
$string['app_lv_kind_ideas'] = 'Brainstorm';
$string['app_lv_kind_quiz'] = 'Quiz';
$string['app_lv_kind_remote'] = 'Remote';
$string['app_lv_kind_vote'] = 'Vote';
$string['app_lv_left'] = '{$a} left';
$string['app_lv_limit'] = 'Closes by itself';
$string['app_lv_limit_m'] = 'Closes in {$a} minutes';
$string['app_lv_limit_m1'] = 'Closes in 1 minute';
$string['app_lv_limit_none'] = 'No time limit';
$string['app_lv_limit_s'] = 'Closes in {$a} seconds';
$string['app_lv_moodle'] = 'With their account';
$string['app_lv_moodle_hint'] = 'Students of this course log in, and the board shows their names.';
$string['app_lv_moodle_short'] = 'Only this course\'s students; their names show';
$string['app_lv_next_round'] = 'Another round';
$string['app_lv_no'] = 'No';
$string['app_lv_no_session'] = 'There is no open session with that code.';
$string['app_lv_nobody'] = 'Nobody has pressed yet…';
$string['app_lv_offline'] = 'No connection. Trying again…';
$string['app_lv_open_round'] = 'Open the buzzers';
$string['app_lv_open_vote'] = 'Open the vote';
$string['app_lv_opened'] = 'Session open. The code is {$a}.';
$string['app_lv_others_many'] = 'There are {$a} other live sessions open on the site: answers may take a little longer.';
$string['app_lv_others_one'] = 'There is another live session open on the site: answers may take a little longer.';
$string['app_lv_pick_team'] = 'Which is your team?';
$string['app_lv_place_1'] = 'First!';
$string['app_lv_place_n'] = 'Number {$a}';
$string['app_lv_question_n'] = 'Question {$a}';
$string['app_lv_question_ph'] = 'Question (optional)';
$string['app_lv_quiz_none'] = 'No answer';
$string['app_lv_quiz_rank'] = 'Place {$a}';
$string['app_lv_quiz_right'] = 'Right!';
$string['app_lv_quiz_sent'] = 'Answer sent!';
$string['app_lv_quiz_teamrank'] = 'Your team: place {$a}';
$string['app_lv_quiz_time'] = 'Time is up';
$string['app_lv_quiz_total'] = '{$a} points so far';
$string['app_lv_quiz_wait'] = 'Wait for the first question';
$string['app_lv_quiz_wait_reveal'] = 'Look at the board';
$string['app_lv_quiz_was'] = 'The right one was';
$string['app_lv_quiz_wrong'] = 'Not that one';
$string['app_lv_quiz_yours'] = 'Your answer';
$string['app_lv_red'] = 'I don’t get it';
$string['app_lv_remote_help'] = 'It works on any tool, also while presenting.';
$string['app_lv_remote_hint'] = 'Then open the address or the QR on your phone, with your own account.';
$string['app_lv_remote_ok'] = 'Phone connected';
$string['app_lv_remote_title'] = 'Remote for the board';
$string['app_lv_remote_waiting'] = 'Waiting for your phone…';
$string['app_lv_sent'] = 'sent';
$string['app_lv_short_buzz'] = 'In teams: who presses first?';
$string['app_lv_short_exit'] = 'How they are getting on and what they learned, at the end of the lesson';
$string['app_lv_short_hands'] = 'No devices: hands or printed cards, and you count';
$string['app_lv_short_ideas'] = 'They write a word or two: a live cloud';
$string['app_lv_short_quiz'] = 'Questions with points, each one or by teams';
$string['app_lv_short_remote'] = 'Your phone runs the board';
$string['app_lv_short_vote'] = 'They answer A–D, yes or no from their device';
$string['app_lv_show'] = 'Show the results on the devices';
$string['app_lv_start'] = 'Open the session';
$string['app_lv_step_anon'] = 'They need no account.';
$string['app_lv_step_login'] = 'They log in with their account if asked.';
$string['app_lv_step_notice'] = 'In the course, a notice with «Join» pops up for them.';
$string['app_lv_step_qr'] = 'Or they scan the QR with their device.';
$string['app_lv_step_url'] = 'Or they open {$a} (the code is already in it; tap to copy it).';
$string['app_lv_team_n'] = 'Team {$a}';
$string['app_lv_teams'] = 'Teams';
$string['app_lv_type_code'] = 'Type the code on the board';
$string['app_lv_v_abcd'] = 'A, B, C, D';
$string['app_lv_v_custom'] = 'My own answers';
$string['app_lv_v_five'] = 'From 1 to 5';
$string['app_lv_v_light'] = 'Traffic light: I get it, more or less, I don’t';
$string['app_lv_v_yesno'] = 'Yes or no';
$string['app_lv_votes_many'] = '{$a} votes';
$string['app_lv_votes_one'] = '{$a} vote';
$string['app_lv_wait_open'] = 'When everyone is in, open the vote.';
$string['app_lv_wait_question'] = 'Look at the board: the question is coming.';
$string['app_lv_wait_round'] = 'Get ready…';
$string['app_lv_wait_round_board'] = 'When the teams are ready, open the buzzers.';
$string['app_lv_what'] = 'What shall we do?';
$string['app_lv_yellow'] = 'More or less';
$string['app_lv_yes'] = 'Yes';
$string['app_lv_you_anon'] = 'You are taking part without an account: nobody sees your name.';
$string['app_lv_you_hidden'] = 'You are taking part anonymously: your teacher does not see your name.';
$string['app_lv_your_answer'] = 'Your answer: {$a}';
$string['app_me_all_levels'] = 'All levels';
$string['app_me_card'] = 'Card {$a}';
$string['app_me_done'] = 'All of them! In {$a} tries';
$string['app_me_faces'] = 'Faces and names: {$a}';
$string['app_me_few'] = 'At least two pairs are needed.';
$string['app_me_found'] = '{$a->a} of {$a->b} pairs';
$string['app_me_found_trios'] = '{$a->a} of {$a->b} trios';
$string['app_me_from_bank'] = 'Question bank (matching)';
$string['app_me_level'] = 'Level';
$string['app_me_level_early'] = 'Early years';
$string['app_me_level_higher'] = 'Higher education';
$string['app_me_level_primary'] = 'Primary';
$string['app_me_level_secondary'] = 'Secondary';
$string['app_me_level_upper'] = 'Upper secondary';
$string['app_me_limit'] = 'Against the tries';
$string['app_me_lost'] = 'Out of tries: {$a->a} of {$a->b} found';
$string['app_me_moves_many'] = '{$a} tries';
$string['app_me_moves_one'] = '{$a} try';
$string['app_me_own'] = 'Your lists';
$string['app_me_pairs'] = 'Pairs';
$string['app_me_peek'] = 'A glance at the start';
$string['app_me_peek_none'] = 'No';
$string['app_me_peek_s'] = '{$a} seconds';
$string['app_me_peeking'] = 'Look carefully…';
$string['app_me_press_start'] = 'Choose what to match and press “Deal”';
$string['app_me_set_animals'] = 'An animal and its shadow';
$string['app_me_set_clock'] = 'The time: clock and digital';
$string['app_me_set_colours'] = 'A colour and its name';
$string['app_me_set_constants'] = 'Physical constants';
$string['app_me_set_derivatives'] = 'Derivatives';
$string['app_me_set_dots'] = 'Dots and numbers';
$string['app_me_set_elements'] = 'Chemical elements: symbol and name';
$string['app_me_set_equations'] = 'Equations and their solutions';
$string['app_me_set_fgroups'] = 'Functional groups';
$string['app_me_set_formulas'] = 'Chemical formulas';
$string['app_me_set_fractions'] = 'Fractions';
$string['app_me_set_graphs'] = 'Functions and their graphs';
$string['app_me_set_greek'] = 'Greek letters';
$string['app_me_set_integrals'] = 'Standard integrals';
$string['app_me_set_laws'] = 'Laws of physics';
$string['app_me_set_letters'] = 'Capital and small letter';
$string['app_me_set_numbers'] = 'A number and its name';
$string['app_me_set_opposites'] = 'Opposites';
$string['app_me_set_prefixes'] = 'Prefixes and powers of 10';
$string['app_me_set_shapes'] = 'Shapes and colours';
$string['app_me_set_times'] = 'Times tables';
$string['app_me_set_units'] = 'Quantities and units';
$string['app_me_start'] = 'Deal';
$string['app_me_students'] = 'Students';
$string['app_me_team'] = 'Team {$a}';
$string['app_me_tie'] = 'It\'s a draw!';
$string['app_me_tries_left'] = '{$a} tries left';
$string['app_me_tries_one'] = '1 try left';
$string['app_me_trios'] = 'Trios: three cards that go together';
$string['app_me_turn'] = '{$a}\'s turn';
$string['app_me_two_teams'] = 'Two teams';
$string['app_me_what'] = 'What to match';
$string['app_me_who'] = 'Who\'s playing?';
$string['app_me_whole_class'] = 'The whole class';
$string['app_me_winner'] = '{$a} wins!';
$string['app_mode_advanced'] = 'Advanced';
$string['app_mode_advanced_hint'] = 'Upper secondary and university: everything at full';
$string['app_mode_early'] = 'Early years';
$string['app_mode_early_hint'] = 'Ages 3 to 6: bigger, with more help';
$string['app_mode_primary'] = 'Primary';
$string['app_mode_primary_hint'] = 'Ages 6 to 12';
$string['app_mode_secondary'] = 'Secondary';
$string['app_mode_secondary_hint'] = 'Ages 12 to 16: more sober';
$string['app_mq_button'] = 'Music';
$string['app_mq_count'] = 'How many questions';
$string['app_mq_hard'] = 'Harder';
$string['app_mq_hint'] = 'The questions make themselves; when each one opens, the board plays it, and «Again» plays it once more. The set stays with the others, to edit it or play it again.';
$string['app_mq_kind_melody'] = 'Melody dictation';
$string['app_mq_kind_rhythm'] = 'Rhythm dictation';
$string['app_mq_kind_song'] = 'Which song is it?';
$string['app_mq_make'] = 'Make the quiz';
$string['app_mq_no_songs'] = 'The score needs at least four songs with a title.';
$string['app_mq_q_melody'] = 'Which notes did you hear? (it starts on {$a})';
$string['app_mq_q_rhythm'] = 'Which rhythm did you hear?';
$string['app_mq_q_song'] = 'Which song is it?';
$string['app_mq_replay'] = 'Again';
$string['app_mq_set_melody'] = 'Music: melody dictation';
$string['app_mq_set_rhythm'] = 'Music: rhythm dictation';
$string['app_mq_set_song'] = 'Music: which song is it?';
$string['app_mq_syl_rest'] = 'rest';
$string['app_mq_syl_ta'] = 'ta';
$string['app_mq_syl_taa'] = 'ta-a';
$string['app_mq_syl_tiri'] = 'ti-ri-ti-ri';
$string['app_mq_syl_titi'] = 'ti-ti';
$string['app_mq_title'] = 'Music questions';
$string['app_mq_what_melody'] = 'A few notes that start on do, and four ways of writing them.';
$string['app_mq_what_rhythm'] = 'A bar of claps, and four rhythms written with ta, ti-ti, ta-a, ti-ri-ti-ri and the rest.';
$string['app_mq_what_song'] = 'The beginning of a song of the score, and four titles to choose from.';
$string['app_mt_balance'] = 'Balance scale';
$string['app_mt_base10'] = 'Base 10 blocks';
$string['app_mt_calc'] = 'Calculator';
$string['app_mt_clear'] = 'Remove all';
$string['app_mt_clear_sure'] = 'Are you sure? Press again';
$string['app_mt_cols'] = '{$a} columns';
$string['app_mt_done'] = 'You did it!';
$string['app_mt_fig_boat'] = 'Boat';
$string['app_mt_fig_cat'] = 'Cat';
$string['app_mt_fig_done'] = 'You made “{$a}” with the seven pieces.';
$string['app_mt_fig_fish'] = 'Fish';
$string['app_mt_fig_hexagon'] = 'Hexagon {$a}';
$string['app_mt_fig_house'] = 'House';
$string['app_mt_fig_pentagon'] = 'Pentagon {$a}';
$string['app_mt_fig_rectangle'] = 'Rectangle';
$string['app_mt_fig_rhomboid'] = 'Parallelogram';
$string['app_mt_fig_right_trapezium'] = 'Right trapezium {$a}';
$string['app_mt_fig_sailboat'] = 'Sailing boat';
$string['app_mt_fig_square'] = 'Square';
$string['app_mt_fig_trapezium'] = 'Trapezium';
$string['app_mt_fig_triangle'] = 'Triangle';
$string['app_mt_figure'] = 'Shape';
$string['app_mt_flip'] = 'Flip';
$string['app_mt_fractions'] = 'Fraction wall';
$string['app_mt_free'] = 'Free, no shape';
$string['app_mt_geoboard'] = 'Geoboard';
$string['app_mt_group_figures'] = 'Pictures';
$string['app_mt_group_shapes'] = 'Geometric shapes';
$string['app_mt_guides'] = 'Guide lines';
$string['app_mt_line'] = 'Number line';
$string['app_mt_next_figure'] = 'Another shape';
$string['app_mt_numbers'] = 'Show the numbers';
$string['app_mt_numbers_a'] = 'Numbers on table A';
$string['app_mt_numbers_b'] = 'Numbers on table B';
$string['app_mt_piece'] = 'Tangram piece';
$string['app_mt_plane'] = 'Coordinate plane';
$string['app_mt_reset'] = 'Start again';
$string['app_mt_rod'] = 'Rod {$a}';
$string['app_mt_rods'] = 'Rods';
$string['app_mt_rods_help'] = 'Drag rods from the staircase to the table. To rotate one, tap it twice. To remove it, put it back on the staircase.';
$string['app_mt_score'] = 'Score';
$string['app_mt_size'] = 'Table size';
$string['app_mt_solids'] = '3D shapes';
$string['app_mt_tangram'] = 'Tangram';
$string['app_mt_tangram_help'] = 'Drag the pieces. To rotate one, tap it twice or press “Rotate”. The parallelogram flips with “Flip”. Pieces snap together when they get close.';
$string['app_mt_timeline'] = 'Timeline';
$string['app_mt_turn'] = 'Rotate';
$string['app_mt_two'] = 'Compare: two tables';
$string['app_mt_what'] = 'Material';
$string['app_nl_clear'] = 'Clear';
$string['app_nl_help'] = 'Tap a point to start, then where each jump lands. Tap the point again to start somewhere else.';
$string['app_nl_help_hidden'] = 'Tap a hidden number to uncover it (and again to hide it). The jumps work the same.';
$string['app_nl_hide'] = 'Hide the numbers';
$string['app_nl_kind_intervals'] = 'Intervals';
$string['app_nl_kind_jumps'] = 'Jumps';
$string['app_nl_now_jump'] = 'Now tap where the jump lands';
$string['app_nl_numbers'] = 'Numbers';
$string['app_nl_p_custom'] = 'My own';
$string['app_nl_p_halves'] = 'Halves, from 0 to 3';
$string['app_nl_p_negative'] = 'From −10 to 10';
$string['app_nl_p_negquarters'] = 'Quarters, from −2 to 2';
$string['app_nl_p_quarters'] = 'Quarters, from 0 to 2';
$string['app_nl_p_tenths'] = 'Tenths, from 0 to 1';
$string['app_nl_p_thirds'] = 'Thirds, from 0 to 2';
$string['app_nl_p_to10'] = 'From 0 to 10';
$string['app_nl_p_to100'] = 'From 0 to 100';
$string['app_nl_p_to1000'] = 'From 0 to 1000, in tens';
$string['app_nl_p_to20'] = 'From 0 to 20';
$string['app_nl_start'] = 'Tap the line where we start';
$string['app_nl_starts'] = 'We start at {$a}';
$string['app_nl_step'] = 'In steps of';
$string['app_nl_undo'] = 'Undo';
$string['app_ord_done'] = 'All in order!';
$string['app_ord_name'] = 'Order';
$string['app_ord_place'] = 'Tap the cards in their order';
$string['app_ord_right'] = '{$a->n} of {$a->of} in their place';
$string['app_pl_add'] = 'Put';
$string['app_pl_again'] = '{$a} has already been called';
$string['app_pl_all_sunk'] = 'The whole fleet is sunk';
$string['app_pl_bad'] = 'Two whole numbers between {$a->a} and {$a->b}, like (3, 2)';
$string['app_pl_call'] = 'The point they call';
$string['app_pl_empty'] = 'Clear the points';
$string['app_pl_fire'] = 'Shoot';
$string['app_pl_fleet'] = 'Battleship';
$string['app_pl_fleet_help'] = 'A fleet of seven ships is hidden on the crossings. Each team in turn calls a point, and it is tapped or typed: water, hit or sunk. A hit shoots again.';
$string['app_pl_help'] = 'Tap a crossing to put a point (A, B, C…) and tap it again to take it away, or type its coordinates: first x, across, then y, up.';
$string['app_pl_hide'] = 'Hide the coordinates';
$string['app_pl_hit'] = '{$a}: hit! Shoot again';
$string['app_pl_join'] = 'The points';
$string['app_pl_join_line'] = 'Joined in a line';
$string['app_pl_join_none'] = 'Apart';
$string['app_pl_join_shape'] = 'Making a shape';
$string['app_pl_join_vectors'] = 'As vectors, one after another';
$string['app_pl_left'] = 'Ships afloat: {$a}';
$string['app_pl_new_fleet'] = 'New fleet';
$string['app_pl_points'] = 'Points';
$string['app_pl_quad_four'] = 'All four';
$string['app_pl_quad_one'] = 'The first';
$string['app_pl_quadrants'] = 'Quadrants';
$string['app_pl_show_fleet'] = 'Show the fleet';
$string['app_pl_sunk'] = '{$a}: hit and sunk! Shoot again';
$string['app_pl_team'] = 'Team {$a}';
$string['app_pl_teams'] = 'Teams';
$string['app_pl_turn'] = 'Team {$a} to shoot';
$string['app_pl_type'] = 'Put a point';
$string['app_pl_water'] = '{$a}: water';
$string['app_pr_bad'] = 'That is not a link to a Canva design. Paste the one from «Share» → «Copy link».';
$string['app_pr_blank'] = 'Not showing? In Canva, the access level has to be «Anyone with the link».';
$string['app_pr_in_canva'] = 'Open in Canva';
$string['app_pr_link'] = 'Link to your Canva presentation';
$string['app_pr_name'] = 'Name (optional)';
$string['app_pr_note'] = 'Anyone with the link can see the presentation: keep your students\' data out of it.';
$string['app_pr_open'] = 'Open';
$string['app_pr_opened'] = 'Presentation open: {$a}';
$string['app_pr_other'] = 'Another presentation';
$string['app_pr_placeholder'] = 'https://canva.link/…';
$string['app_pr_recent'] = 'Recent presentations';
$string['app_pr_remove'] = 'Remove from the list';
$string['app_pr_short'] = 'Canva short links only open inside Moodle. Open the link in the browser and paste here the long address it leads to.';
$string['app_pr_short_fail'] = 'That short link could not be followed. Open it in the browser and paste here the long address it leads to.';
$string['app_pr_step1'] = 'In Canva, open the presentation and press «Share».';
$string['app_pr_step2'] = 'Under «Access level», choose «Anyone with the link», only to view.';
$string['app_pr_step3'] = 'Press «Copy link» and paste it here.';
$string['app_pr_turn_task'] = 'Your turn to answer!';
$string['app_pr_untitled'] = 'Canva presentation';
$string['app_pr_where'] = 'Where is the link?';
$string['app_pr_write'] = 'Write on it';
$string['app_pr_write_note'] = 'A clear sheet over the slide. To move on to another slide, turn it off: what is written goes away.';
$string['app_q_absent'] = 'Who\'s missing today?';
$string['app_q_absent_n'] = 'Missing today: {$a}';
$string['app_q_absent_n_sr'] = 'Missing today {$a}';
$string['app_q_absent_note'] = 'Tap whoever hasn\'t come in: today they won\'t be picked or put in groups. Tomorrow everyone is back.';
$string['app_q_all_absent'] = 'Everyone on this list is missing today.';
$string['app_q_all_here'] = 'Everyone\'s here';
$string['app_q_all_out'] = 'Everyone has been picked. Press “Start again”.';
$string['app_q_already'] = 'Already picked';
$string['app_q_count'] = '{$a->a} of {$a->b}';
$string['app_q_create_list'] = 'Create a list';
$string['app_q_edit'] = 'Edit';
$string['app_q_empty'] = 'Paste your class list to begin';
$string['app_q_empty_note'] = 'Each list is only saved on this computer.';
$string['app_q_fair'] = 'Fewest turns first';
$string['app_q_fair_hint'] = 'Picks someone from those who have been picked the fewest times in recent weeks';
$string['app_q_left'] = '{$a} left';
$string['app_q_list'] = 'List';
$string['app_q_me_name'] = '{$a} (teacher)';
$string['app_q_no_lists'] = '(no lists yet)';
$string['app_q_no_repeat'] = 'No repeats';
$string['app_q_no_students'] = 'This list has no students.';
$string['app_q_none_yet'] = 'Nobody yet.';
$string['app_q_participation'] = 'Participation';
$string['app_q_participation_note'] = 'Times each one has been picked in the last {$a} days, by any teacher on this course. Fewest at the top.';
$string['app_q_pick'] = 'Pick';
$string['app_q_ready'] = '{$a->count} in “{$a->list}”. Press “Pick”.';
$string['app_q_restart'] = 'Start again';
$string['app_q_shuffling'] = 'Shuffling…';
$string['app_q_students'] = '{$a} students';
$string['app_q_students_absent'] = '{$a->n} students ({$a->m} missing)';
$string['app_q_this_course'] = 'This course';
$string['app_q_turn'] = 'It\'s {$a}\'s turn';
$string['app_q_with_me'] = 'The teacher plays too';
$string['app_q_your_lists'] = 'Your lists';
$string['app_qr_big_image'] = 'That image is too big: choose one under 300 KB.';
$string['app_qr_black'] = 'Black';
$string['app_qr_blue'] = 'Blue';
$string['app_qr_choose'] = 'Choose image';
$string['app_qr_circles'] = 'Circles';
$string['app_qr_colour'] = 'Colour';
$string['app_qr_empty'] = 'Type or paste a link and its code will appear here.';
$string['app_qr_enlarge'] = 'Enlarge';
$string['app_qr_erase'] = 'Clear';
$string['app_qr_eye_colour'] = 'Corner colour';
$string['app_qr_eyes'] = 'Corners';
$string['app_qr_eyes_rounded'] = 'Rounded';
$string['app_qr_eyes_square'] = 'Squares';
$string['app_qr_green'] = 'Green';
$string['app_qr_label'] = 'QR code for: {$a}';
$string['app_qr_logo'] = 'Logo in the middle';
$string['app_qr_modules'] = 'Dots';
$string['app_qr_modules_rounded'] = 'Rounded';
$string['app_qr_modules_square'] = 'Squares';
$string['app_qr_my_image'] = 'My own image';
$string['app_qr_no_lib'] = 'The QR generator could not be loaded.';
$string['app_qr_no_logo'] = 'No logo';
$string['app_qr_note'] = 'The code is made right here, offline. With a logo, the code has more error correction so that it can still be read.';
$string['app_qr_placeholder'] = 'Paste a link or type some text here';
$string['app_qr_png'] = 'Download PNG';
$string['app_qr_purple'] = 'Purple';
$string['app_qr_red'] = 'Red';
$string['app_qr_same'] = 'Same';
$string['app_qr_saved'] = 'Downloaded: {$a}';
$string['app_qr_site_logo'] = 'The site\'s logo';
$string['app_qr_svg'] = 'Download SVG';
$string['app_qr_teal'] = 'Teal';
$string['app_qr_terracotta'] = 'Terracotta';
$string['app_qr_text'] = 'Text or link';
$string['app_qr_too_long'] = 'It is too long for a QR code. Shorten it a little.';
$string['app_qz_add_q'] = 'Add the question';
$string['app_qz_after'] = 'After each question';
$string['app_qz_and_more'] = 'and {$a} more';
$string['app_qz_answer'] = 'Answer';
$string['app_qz_answer_optional'] = 'Answer (optional)';
$string['app_qz_bank'] = 'From the question bank';
$string['app_qz_bank_add'] = 'Add the ticked ones to the set';
$string['app_qz_bank_category'] = 'Category';
$string['app_qz_bank_empty'] = 'This course has no banks with questions you can use.';
$string['app_qz_bank_error'] = 'The question bank could not be read.';
$string['app_qz_bank_loading'] = 'Looking…';
$string['app_qz_bank_none'] = 'No question of this category fits (multiple choice with one answer, or true/false).';
$string['app_qz_bank_skipped'] = '{$a} left out: several right answers, more than four answers or no text.';
$string['app_qz_bank_title'] = 'Questions from the question bank';
$string['app_qz_by_student'] = 'By student';
$string['app_qz_del_q'] = 'Delete the question';
$string['app_qz_del_set'] = 'Delete this set';
$string['app_qz_del_set_sure'] = 'Sure? Press again';
$string['app_qz_devtext'] = 'The question and its answers on the devices';
$string['app_qz_done'] = 'Done';
$string['app_qz_edit'] = 'Edit the questions';
$string['app_qz_edit_q'] = 'Edit the question';
$string['app_qz_edit_title'] = 'Questions of the set';
$string['app_qz_empty'] = 'Choose a set with questions, or write one.';
$string['app_qz_end'] = 'Podium at the end';
$string['app_qz_ex_o1'] = 'Seven|Five|Ten|Six';
$string['app_qz_ex_o2'] = 'True|False';
$string['app_qz_ex_o3'] = 'Dolphin|Shark|Trout';
$string['app_qz_ex_q1'] = 'How many days does a week have?';
$string['app_qz_ex_q2'] = 'Water freezes at 0 °C.';
$string['app_qz_ex_q3'] = 'Which one is a mammal?';
$string['app_qz_example'] = 'Example';
$string['app_qz_false'] = 'False';
$string['app_qz_first'] = 'First place';
$string['app_qz_first_tie'] = 'Tied for first place';
$string['app_qz_hits'] = 'Right answers';
$string['app_qz_img'] = 'This question has a picture';
$string['app_qz_img_add'] = 'Add a picture';
$string['app_qz_img_change'] = 'Another picture';
$string['app_qz_img_del'] = 'Remove the picture';
$string['app_qz_img_error'] = 'That picture could not be kept: try another one (PNG or JPG).';
$string['app_qz_img_hint'] = 'Or paste it (Ctrl+V). It shows on the board, beside the answers.';
$string['app_qz_img_sending'] = 'Keeping the picture…';
$string['app_qz_kind_choice'] = '2 to 4 answers';
$string['app_qz_kind_tf'] = 'True or false';
$string['app_qz_lobby'] = '{$a->n} questions · {$a->m} in';
$string['app_qz_mode_calm'] = 'Calm';
$string['app_qz_mode_fast'] = 'Fast';
$string['app_qz_mode_hint_calm'] = 'Calm: each right answer is worth 1000 points, whenever it comes.';
$string['app_qz_mode_hint_fast'] = 'Fast: a right answer is worth from 500 to 1000 points, more the sooner it comes.';
$string['app_qz_need'] = 'Write the question and at least two answers, and mark the right one.';
$string['app_qz_new'] = 'New set';
$string['app_qz_new_name'] = 'Set {$a}';
$string['app_qz_next'] = 'Next question';
$string['app_qz_nteams'] = 'Teams';
$string['app_qz_paste'] = 'Paste several questions, or ask an AI for them';
$string['app_qz_paste_go'] = 'Add them';
$string['app_qz_paste_hint'] = 'One per line: the question, then the answers separated by |, with * before the right one. For true/false, V or F after the question.';
$string['app_qz_paste_none'] = 'No question could be read: check the | and the *.';
$string['app_qz_paste_ph'] = 'Capital of Italy? | *Rome | Milan | Naples
The Sun is a star | V';
$string['app_qz_podium'] = 'Podium';
$string['app_qz_points'] = 'Mode';
$string['app_qz_points_col'] = 'Points';
$string['app_qz_q_n'] = 'Question {$a->n} of {$a->of}';
$string['app_qz_q_ph'] = 'The question';
$string['app_qz_question'] = 'Question';
$string['app_qz_ranking'] = 'Ranking';
$string['app_qz_ready'] = '{$a} questions. Open the session when they are ready.';
$string['app_qz_results'] = 'Results';
$string['app_qz_results_note'] = 'Only you see this; nothing goes to the gradebook.';
$string['app_qz_reveal'] = 'Reveal the answer';
$string['app_qz_right'] = 'The right one';
$string['app_qz_right_col'] = 'Right';
$string['app_qz_save_q'] = 'Save the question';
$string['app_qz_secs'] = 'Time for each question';
$string['app_qz_secs_default'] = 'As the quiz';
$string['app_qz_secs_n'] = '{$a} seconds';
$string['app_qz_set'] = 'Set of questions';
$string['app_qz_set_name'] = 'Name of the set';
$string['app_qz_start'] = 'Start the quiz';
$string['app_qz_student'] = 'Student';
$string['app_qz_teams'] = 'Teams';
$string['app_qz_teams_groups'] = 'The {$a} groups made';
$string['app_qz_teams_groups_hint'] = 'The groups of «Groups» are the teams; whoever is in none chooses on the device.';
$string['app_qz_teams_none'] = 'Each one';
$string['app_qz_teams_none_hint'] = 'Each one plays for themselves.';
$string['app_qz_teams_pick'] = 'They choose';
$string['app_qz_teams_pick_hint'] = 'Each one chooses a team on the device; the teams count their average.';
$string['app_qz_tie_n'] = '{$a} tied';
$string['app_qz_to_podium'] = 'See the podium';
$string['app_qz_to_ranking'] = 'See the ranking';
$string['app_qz_to_results'] = 'See the results';
$string['app_qz_top'] = 'Show';
$string['app_qz_top_all'] = 'Everyone';
$string['app_qz_top_n'] = 'Only the first {$a}';
$string['app_qz_true'] = 'True';
$string['app_rl_build'] = 'Set up';
$string['app_rl_clarify'] = 'Clarify';
$string['app_rl_dance'] = 'Choreography';
$string['app_rl_flute'] = 'Flute';
$string['app_rl_glockenspiel'] = 'Glockenspiel';
$string['app_rl_materials'] = 'Materials';
$string['app_rl_measure'] = 'Measure';
$string['app_rl_notes'] = 'Notes';
$string['app_rl_photo'] = 'Photograph';
$string['app_rl_predict'] = 'Predict';
$string['app_rl_question'] = 'Question';
$string['app_rl_record'] = 'Write down';
$string['app_rl_spokesperson'] = 'Spokesperson';
$string['app_rl_summarise'] = 'Summarise';
$string['app_rl_tambourine'] = 'Tambourine';
$string['app_rl_time'] = 'Timekeeper';
$string['app_rm_answer'] = 'Answer: {$a}';
$string['app_rm_bar_cards'] = 'Cards';
$string['app_rm_bar_class'] = 'Class';
$string['app_rm_change'] = 'Change';
$string['app_rm_close'] = 'Close';
$string['app_rm_closed'] = 'That board is not open any more.';
$string['app_rm_cmd_curtain'] = 'Curtain';
$string['app_rm_cmd_live'] = 'Open or close (Live)';
$string['app_rm_cmd_next'] = 'Next question';
$string['app_rm_cmd_relay'] = 'Relays on/off';
$string['app_rm_cmd_reveal'] = 'Uncover a little';
$string['app_rm_cmd_turn'] = 'Pick someone here';
$string['app_rm_copied'] = 'Address copied.';
$string['app_rm_copy'] = 'Copy the address';
$string['app_rm_course'] = 'Change the class';
$string['app_rm_course_going'] = 'The board goes to {$a}';
$string['app_rm_course_hint'] = 'The open board goes to the class you choose.';
$string['app_rm_course_none'] = 'You have no other class with the board.';
$string['app_rm_how'] = 'Scan the code with your phone and keep it on its home screen: the address is always the same.';
$string['app_rm_intro'] = 'An address for your phone that does not change and does not ask you to log in: open it, for instance, from the home screen of the phone, and it drives the board you have open.';
$string['app_rm_kid'] = 'Let a student press it';
$string['app_rm_kid_hold'] = 'Hold to leave';
$string['app_rm_kid_look'] = 'Look at the board!';
$string['app_rm_kid_none'] = 'Nothing to press right now';
$string['app_rm_last'] = 'Last order: {$a}';
$string['app_rm_more'] = 'More orders';
$string['app_rm_no_board_text'] = 'Open the board on the computer, in a course: it shows up here by itself.';
$string['app_rm_no_board_title'] = 'No board is open';
$string['app_rm_off_text'] = 'It has been turned off, or its address has changed. On the board, in «Live» and «Remote», there is the address of now.';
$string['app_rm_off_title'] = 'This remote is not on';
$string['app_rm_on_board'] = 'On the board: {$a}';
$string['app_rm_on_board_short'] = 'On the board';
$string['app_rm_options'] = 'Options';
$string['app_rm_or_session'] = 'There is also the remote with a code («Open the session»), which asks you to log in on the phone.';
$string['app_rm_phone_in'] = 'phone connected';
$string['app_rm_phone_waiting'] = 'waiting for the phone';
$string['app_rm_rotate'] = 'Change the address';
$string['app_rm_rotate_sure'] = 'The old one will stop working. Tap again';
$string['app_rm_scan'] = 'Read the cards';
$string['app_rm_scan_back'] = 'Back to the remote';
$string['app_rm_scan_card'] = 'card {$a}';
$string['app_rm_scan_count'] = 'Cards read: {$a}';
$string['app_rm_scan_hint'] = 'Point at the raised cards: each one is outlined in the colour of its answer and goes to the board.';
$string['app_rm_scan_nocam'] = 'The camera cannot be used: allow it in the browser.';
$string['app_rm_title'] = 'Fixed remote';
$string['app_rm_tools'] = 'Go to a tool';
$string['app_rm_turn_off'] = 'Turn off';
$string['app_rm_turn_on'] = 'Turn the fixed remote on';
$string['app_rm_waiting_orders'] = 'Waiting for orders from the phone';
$string['app_rm_warning'] = 'Whoever has this address can drive your board while it is open, although they see nothing of the students. If you have shared it by mistake, change it.';
$string['app_rm_which'] = 'Which board';
$string['app_ro_again'] = 'Play again';
$string['app_ro_answer'] = 'Answer';
$string['app_ro_answer_was'] = 'It was “{$a}”';
$string['app_ro_bad_many'] = '{$a} wrong';
$string['app_ro_bad_one'] = '{$a} wrong';
$string['app_ro_cancel'] = 'Cancel';
$string['app_ro_change'] = 'Change wheel';
$string['app_ro_class'] = 'The class';
$string['app_ro_clue'] = 'Clue';
$string['app_ro_contains'] = 'Contains {$a}';
$string['app_ro_copy_example'] = 'Copy of the example wheel';
$string['app_ro_copy_of'] = '{$a} (copy)';
$string['app_ro_edit'] = 'Edit';
$string['app_ro_edit_title'] = 'Edit the wheel';
$string['app_ro_editor_note'] = 'Leave blank the letters you don\'t want: the wheel is made from those with a clue and an answer.';
$string['app_ro_example'] = 'Example wheel';
$string['app_ro_finish'] = 'Finish';
$string['app_ro_finished'] = 'Wheel complete!';
$string['app_ro_keys'] = 'Keys: Enter, right · Backspace, wrong · Space, pass';
$string['app_ro_kind'] = 'Type';
$string['app_ro_kind_contains'] = 'Contains';
$string['app_ro_kind_starts'] = 'Starts';
$string['app_ro_left'] = '{$a} unanswered';
$string['app_ro_letter'] = 'Letter';
$string['app_ro_min'] = '{$a} min';
$string['app_ro_min_sec'] = '{$a->m} min {$a->s} s';
$string['app_ro_name'] = 'Alphabet wheel';
$string['app_ro_need_one'] = 'Write at least one letter with its clue and its answer.';
$string['app_ro_new'] = 'New wheel';
$string['app_ro_no_time'] = 'No time limit';
$string['app_ro_ok_many'] = '{$a} right';
$string['app_ro_ok_one'] = '{$a} right';
$string['app_ro_pass'] = 'Pass';
$string['app_ro_pause'] = 'Pause';
$string['app_ro_remove'] = 'Delete the wheel';
$string['app_ro_remove_sure'] = 'Sure? Press again';
$string['app_ro_resume'] = 'Resume';
$string['app_ro_right'] = 'Right';
$string['app_ro_save'] = 'Save';
$string['app_ro_second'] = 'Team 2\'s wheel';
$string['app_ro_starts'] = 'Starts with {$a}';
$string['app_ro_team'] = 'Team {$a}';
$string['app_ro_tie'] = 'It\'s a draw!';
$string['app_ro_time'] = 'Time for each';
$string['app_ro_time_up'] = 'Time\'s up!';
$string['app_ro_two_teams'] = 'Two teams';
$string['app_ro_wheel_name'] = 'Wheel name';
$string['app_ro_who'] = 'Who is playing?';
$string['app_ro_winner'] = '{$a} wins!';
$string['app_ro_wrong'] = 'Wrong';
$string['app_rs_dice_wait'] = 'Scratch to see what came out';
$string['app_rs_reveal'] = 'Reveal';
$string['app_rs_scratch'] = 'Scratch';
$string['app_rs_toggle'] = 'Scratch to reveal';
$string['app_sc_add_team'] = 'Add team';
$string['app_sc_again'] = 'From the start';
$string['app_sc_ai_done'] = 'The song is on the score: listen to it and check it before playing it in class.';
$string['app_sc_clear'] = 'Clear';
$string['app_sc_clear_sure'] = 'Sure? Press again';
$string['app_sc_clef'] = 'Clef';
$string['app_sc_clef_fa'] = 'Bass (F)';
$string['app_sc_clef_sol'] = 'Treble (G)';
$string['app_sc_colour'] = 'Change the colour';
$string['app_sc_colours'] = 'Colours of the glockenspiel';
$string['app_sc_copied'] = 'Copied: paste it in your AI.';
$string['app_sc_copy'] = 'Copy';
$string['app_sc_copy_of'] = '{$a} (copy)';
$string['app_sc_delete'] = 'Delete this song';
$string['app_sc_delete_confirm'] = 'Tap again to delete it';
$string['app_sc_dot'] = 'Dot';
$string['app_sc_err_empty'] = 'There are no notes to play.';
$string['app_sc_err_note'] = '«{$a}» is not a note: like C, D4, G:h, F#:e, or - for a rest.';
$string['app_sc_err_tempo'] = 'The tempo «{$a}» is not known: a number from 30 to 240.';
$string['app_sc_err_time'] = 'The time «{$a}» is not known: use 2/4, 3/4, 4/4 or 6/8.';
$string['app_sc_export'] = 'Download';
$string['app_sc_f_b'] = 'Half note';
$string['app_sc_f_c'] = 'Eighth note';
$string['app_sc_f_n'] = 'Quarter note';
$string['app_sc_f_r'] = 'Whole note';
$string['app_sc_f_s'] = 'Sixteenth note';
$string['app_sc_fast'] = 'fast';
$string['app_sc_figure'] = 'Figure';
$string['app_sc_flat'] = 'Flat';
$string['app_sc_from_groups'] = 'Use the teams from “Groups”';
$string['app_sc_from_home'] = 'From {$a}';
$string['app_sc_from_world'] = 'From other countries';
$string['app_sc_game'] = 'Which note is it?';
$string['app_sc_game_next'] = 'Another note';
$string['app_sc_game_right'] = '{$a->name}! Streak: {$a->n}';
$string['app_sc_game_wrong'] = 'It was {$a}';
$string['app_sc_group'] = 'Group {$a}';
$string['app_sc_h_clef'] = 'Clef';
$string['app_sc_h_from'] = 'Origin';
$string['app_sc_h_lyrics'] = 'Lyrics';
$string['app_sc_h_pickup'] = 'Pickup';
$string['app_sc_h_tempo'] = 'Tempo';
$string['app_sc_h_time'] = 'Time';
$string['app_sc_h_title'] = 'Title';
$string['app_sc_import'] = 'Open';
$string['app_sc_import_file'] = 'Open a file';
$string['app_sc_import_go'] = 'Bring it in';
$string['app_sc_import_hint'] = 'Paste the text of a song or open a .txt or .abc file: written by hand, made with the prompt for your AI, or in ABC (abcnotation.com).';
$string['app_sc_import_ph'] = 'Title: Twinkle, Twinkle
Time: 4/4
Tempo: 100
C:q C G G | A A G:h';
$string['app_sc_import_title'] = 'Bring in a song';
$string['app_sc_leads'] = 'In the lead: {$a}';
$string['app_sc_listen'] = 'Listen';
$string['app_sc_lyrics'] = 'Lyrics';
$string['app_sc_medium'] = 'moderate';
$string['app_sc_metro'] = 'Metronome';
$string['app_sc_mine'] = 'My songs';
$string['app_sc_mine_note'] = 'One of your songs, kept in this course.';
$string['app_sc_mode'] = 'What to do';
$string['app_sc_muted'] = 'The sound is off: turn it on with the speaker at the top.';
$string['app_sc_name'] = 'Team name';
$string['app_sc_names'] = 'Names of the notes';
$string['app_sc_naming'] = 'Notation';
$string['app_sc_naming_auto'] = 'As the language ({$a})';
$string['app_sc_naming_german'] = 'C D E … H (German)';
$string['app_sc_naming_letters'] = 'C D E (English)';
$string['app_sc_naming_solfa'] = 'do re mi';
$string['app_sc_new'] = 'New';
$string['app_sc_new_name'] = 'Song {$a}';
$string['app_sc_no_groups'] = 'Make the teams first in the “Groups” tab.';
$string['app_sc_origin'] = 'From: {$a}';
$string['app_sc_playalong'] = 'Play with me';
$string['app_sc_points_many'] = '{$a} points';
$string['app_sc_points_one'] = '{$a} point';
$string['app_sc_prompt'] = 'Prompt for your AI';
$string['app_sc_prompt_any'] = 'the song you want';
$string['app_sc_prompt_hint'] = 'Write the name of the song. With the AI of your Moodle, «Generate» brings it straight onto the score; with your own AI, copy the text, paste it there and bring back what it answers with «Open».';
$string['app_sc_prompt_song'] = 'Song';
$string['app_sc_prompt_text'] = 'Write the melody of "{$a}" in the text format of Class tools, so that it plays on the school glockenspiel.

Rules:
1. Start with these lines (those that are needed):
Title: the name of the song
Origin: the country or the composer
Clef: treble (or bass, if it is low)
Time: 2/4, 3/4, 4/4 or 6/8
Tempo: quarter notes per minute (for example, 100)
Pickup: how long the notes before the first bar last, only if there are any (q, e…)
2. Then only the melody, one voice, with the notes separated by spaces and | between bars.
3. Notes: C D E F G A B (or do re mi fa sol la si). Middle C is C4: C5 is an octave higher and G3 one lower; with no number, octave 4. Sharp with # (F#), flat with b (Bb).
4. The length, after a colon, on every note: w whole, h half, q quarter, e eighth, s sixteenth; with a dot after it, dotted (G:q.). Each bar must add up to its time signature.
5. A rest is - with its length (-:q).
6. No chords, triplets, ties or repeats: all written out.

Example:
Title: Twinkle, Twinkle, Little Star
Origin: France
Clef: treble
Time: 4/4
Tempo: 100
C:q C:q G:q G:q | A:q A:q G:h | F:q F:q E:q E:q | D:q D:q C:h

Answer only with the text, without explanations.';
$string['app_sc_prompt_title'] = 'A song with your AI';
$string['app_sc_remove'] = 'Remove this team';
$string['app_sc_reset'] = 'Reset to zero';
$string['app_sc_reset_sure'] = 'Sure? Press again';
$string['app_sc_rest'] = 'Rest';
$string['app_sc_rhythm'] = 'Rhythm in syllables (ta, ti-ti) and claps';
$string['app_sc_sharp'] = 'Sharp';
$string['app_sc_slow'] = 'slow';
$string['app_sc_song'] = 'Song';
$string['app_sc_songs'] = 'Songs';
$string['app_sc_stop'] = 'Stop';
$string['app_sc_team'] = 'Team {$a}';
$string['app_sc_teams_many'] = '{$a} teams';
$string['app_sc_teams_one'] = '{$a} team';
$string['app_sc_tempo'] = 'Tempo';
$string['app_sc_tie'] = 'Draw';
$string['app_sc_time'] = 'Time';
$string['app_sc_untitled'] = 'Untitled';
$string['app_sc_v_bells'] = 'Glockenspiel';
$string['app_sc_v_flute'] = 'Recorder';
$string['app_sc_v_marimba'] = 'Marimba';
$string['app_sc_v_piano'] = 'Piano';
$string['app_sc_voice'] = 'Sound';
$string['app_sc_well_done'] = 'Well done!';
$string['app_sc_write'] = 'Write';
$string['app_sd_clear'] = 'Clear the colours';
$string['app_sd_count'] = 'Count';
$string['app_sd_count_edges'] = 'Edges';
$string['app_sd_count_faces'] = 'Faces';
$string['app_sd_count_vertices'] = 'Vertices';
$string['app_sd_counted_edges'] = '{$a} edges';
$string['app_sd_counted_faces'] = '{$a} faces';
$string['app_sd_counted_vertices'] = '{$a} vertices';
$string['app_sd_elements'] = 'Faces, edges and vertices';
$string['app_sd_elements_n'] = '{$a->f} faces, {$a->e} edges and {$a->v} vertices';
$string['app_sd_euler'] = 'Faces + vertices − edges: {$a}';
$string['app_sd_fold'] = 'Fold';
$string['app_sd_group_prisms'] = 'Prisms';
$string['app_sd_group_pyramids'] = 'Pyramids';
$string['app_sd_group_regular'] = 'Regular polyhedra';
$string['app_sd_group_round'] = 'Round solids';
$string['app_sd_help'] = 'Drag to turn it; the wheel or two fingers bring it closer. Tap a face to paint it: the colour stays when it is unfolded.';
$string['app_sd_label'] = '3D shape: drag or use the arrow keys to turn it';
$string['app_sd_n_cilindro'] = 'Cylinder';
$string['app_sd_n_cono'] = 'Cone';
$string['app_sd_n_cubo'] = 'Cube';
$string['app_sd_n_dodecaedro'] = 'Dodecahedron';
$string['app_sd_n_esfera'] = 'Sphere';
$string['app_sd_n_hexaedro'] = 'Cube (hexahedron)';
$string['app_sd_n_icosaedro'] = 'Icosahedron';
$string['app_sd_n_octaedro'] = 'Octahedron';
$string['app_sd_n_ortoedro'] = 'Cuboid';
$string['app_sd_n_piramide3'] = 'Triangular pyramid';
$string['app_sd_n_piramide4'] = 'Square pyramid';
$string['app_sd_n_piramide5'] = 'Pentagonal pyramid';
$string['app_sd_n_piramide6'] = 'Hexagonal pyramid';
$string['app_sd_n_prisma3'] = 'Triangular prism';
$string['app_sd_n_prisma5'] = 'Pentagonal prism';
$string['app_sd_n_prisma6'] = 'Hexagonal prism';
$string['app_sd_n_tetraedro'] = 'Tetrahedron';
$string['app_sd_net_n'] = 'Net {$a->n} of {$a->all}';
$string['app_sd_no_net'] = 'A sphere cannot be unfolded flat.';
$string['app_sd_open'] = 'Open it little by little';
$string['app_sd_other_net'] = 'Another net';
$string['app_sd_round_cone'] = 'a flat base (a circle), a curved surface and a vertex';
$string['app_sd_round_cylinder'] = 'two flat bases (circles) and a curved surface';
$string['app_sd_round_sphere'] = 'only a curved surface';
$string['app_sd_see'] = 'See through';
$string['app_sd_spin'] = 'Turn by itself';
$string['app_sd_unfold'] = 'Unfold';
$string['app_sd_view'] = 'View';
$string['app_sd_view_3d'] = '3D';
$string['app_sd_view_front'] = 'Front';
$string['app_sd_view_side'] = 'Side';
$string['app_sd_view_top'] = 'From above';
$string['app_sd_which'] = 'Shape';
$string['app_si_again'] = 'Again';
$string['app_si_blue'] = 'Blue';
$string['app_si_brown'] = 'Brown';
$string['app_si_down'] = 'Down';
$string['app_si_fail'] = 'Oops! Wrong';
$string['app_si_fail_repeat'] = 'Same again';
$string['app_si_fail_reset'] = 'From the start';
$string['app_si_fail_who'] = 'Oops! {$a} got it wrong';
$string['app_si_fast'] = 'Fast';
$string['app_si_green'] = 'Green';
$string['app_si_kind'] = 'The pads show';
$string['app_si_kind_arrows'] = 'Arrows';
$string['app_si_kind_colors'] = 'Colours';
$string['app_si_kind_notes'] = 'Notes, without colours';
$string['app_si_kind_numbers'] = 'Numbers, with a rule';
$string['app_si_kind_syllables'] = 'Syllables of a word';
$string['app_si_left'] = 'Left';
$string['app_si_listen'] = 'Listen!';
$string['app_si_name'] = 'Simon';
$string['app_si_next'] = '{$a}\'s turn';
$string['app_si_normal'] = 'Normal';
$string['app_si_note_names'] = 'C,D,E,F,G,A,B,high C,high D';
$string['app_si_on_fail'] = 'After a mistake';
$string['app_si_orange'] = 'Orange';
$string['app_si_order'] = 'When repeating';
$string['app_si_order_reverse'] = 'Backwards';
$string['app_si_order_same'] = 'In order';
$string['app_si_pads'] = 'Pads';
$string['app_si_pink'] = 'Pink';
$string['app_si_press_start'] = 'Press “Start”';
$string['app_si_purple'] = 'Purple';
$string['app_si_record'] = 'Record: {$a}';
$string['app_si_record_who'] = 'Record: {$a->n} ({$a->who})';
$string['app_si_red'] = 'Red';
$string['app_si_right'] = 'Right';
$string['app_si_round'] = 'Round {$a}';
$string['app_si_rule'] = 'The rule';
$string['app_si_rule_double'] = 'Its double';
$string['app_si_rule_minus1'] = 'Take away 1';
$string['app_si_rule_plus1'] = 'Add 1';
$string['app_si_rule_ten'] = 'What it needs to make 10';
$string['app_si_same_again'] = 'The same one again';
$string['app_si_speed'] = 'Speed';
$string['app_si_syl_mode'] = 'The word';
$string['app_si_syl_read'] = 'It is written and they split it';
$string['app_si_syl_split'] = 'Press its syllables in order!';
$string['app_si_syl_split_reverse'] = 'Press its syllables backwards!';
$string['app_si_syl_watch'] = 'Its syllables light up';
$string['app_si_teal'] = 'Teal';
$string['app_si_turns'] = 'Turns';
$string['app_si_up'] = 'Up';
$string['app_si_watch'] = 'Watch!';
$string['app_si_word_n'] = 'Word {$a}';
$string['app_si_yellow'] = 'Yellow';
$string['app_si_your_turn'] = 'Your turn!';
$string['app_si_your_turn_reverse'] = 'Your turn, backwards!';
$string['app_sl_button'] = 'Teachers\' room';
$string['app_sm_adjust'] = 'Adjust to this class';
$string['app_sm_adjust_hint'] = 'With the class working at a volume that is fine, press it: that will be green.';
$string['app_sm_adjusted'] = 'Adjusted: that noise is green now. Sensitivity moves it up or down.';
$string['app_sm_adjusting'] = 'Listening… {$a}';
$string['app_sm_amber'] = 'A bit quieter';
$string['app_sm_asking'] = 'Asking for permission…';
$string['app_sm_best'] = 'Best: {$a}';
$string['app_sm_extras'] = 'More on the traffic light';
$string['app_sm_face'] = 'A face in the light';
$string['app_sm_green'] = 'Very good';
$string['app_sm_level'] = 'Noise level';
$string['app_sm_light_amber'] = 'Traffic light on amber';
$string['app_sm_light_green'] = 'Traffic light on green';
$string['app_sm_light_red'] = 'Traffic light on red';
$string['app_sm_listen'] = 'Listen to the class';
$string['app_sm_mic_denied'] = 'The browser won\'t let me use the microphone.';
$string['app_sm_mic_denied_frame'] = 'I\'m not allowed to use the microphone here.';
$string['app_sm_mic_denied_help'] = 'Click the padlock next to the address, allow the microphone and try again.';
$string['app_sm_mic_frame'] = 'The microphone can\'t be used inside the course page.';
$string['app_sm_mic_none'] = 'I can\'t find a microphone on this computer.';
$string['app_sm_mic_none_help'] = 'Plug one in or try another computer.';
$string['app_sm_mic_pending'] = 'The browser is asking you whether I may use the microphone.';
$string['app_sm_mic_pending_frame'] = 'Can\'t see the question about using the microphone?';
$string['app_sm_mic_pending_help'] = 'Press “Allow”. If you can\'t see the question, look for the microphone or padlock icon next to the address.';
$string['app_sm_mic_unavailable'] = 'The microphone isn\'t available.';
$string['app_sm_mic_unavailable_help'] = 'Check that the computer has a microphone and that no other program is using it.';
$string['app_sm_mic_window'] = 'Open it in another window to use the microphone.';
$string['app_sm_off'] = 'Traffic light off';
$string['app_sm_patience'] = 'Patience';
$string['app_sm_patience_aria'] = 'Class patience';
$string['app_sm_patience_gone'] = 'Out of patience';
$string['app_sm_patience_note'] = 'Lasting noise uses it up; calm brings it back.';
$string['app_sm_patience_out'] = 'Out of patience!';
$string['app_sm_privacy'] = 'Sound is never recorded or sent anywhere: only the volume is measured, here, on this computer.';
$string['app_sm_red'] = 'Too much noise!';
$string['app_sm_scale_lower'] = 'Quieter';
$string['app_sm_scale_ok'] = 'Fine';
$string['app_sm_scale_too'] = 'Too loud';
$string['app_sm_sens_high'] = 'high';
$string['app_sm_sens_low'] = 'low';
$string['app_sm_sens_medium'] = 'medium';
$string['app_sm_sensitivity'] = 'Sensitivity';
$string['app_sm_stop'] = 'Turn off the traffic light';
$string['app_sm_streak'] = 'Calm streak';
$string['app_sm_trail'] = 'The last minute';
$string['app_sm_waves'] = 'Waves when it gets loud';
$string['app_so_another'] = 'Another round';
$string['app_so_both'] = 'In both';
$string['app_so_done'] = 'All sorted!';
$string['app_so_mode'] = 'Play';
$string['app_so_name'] = 'Sort';
$string['app_so_need_groups'] = 'This exercise needs two groups, one of them with three items or more.';
$string['app_so_odd'] = 'Odd one out';
$string['app_so_odd_ask'] = 'Which is the odd one out?';
$string['app_so_odd_right'] = '«{$a->odd}» is from «{$a->oddgroup}»; the others are from «{$a->group}».';
$string['app_so_pick'] = 'Tap a card and then its box';
$string['app_so_right'] = '{$a->n} of {$a->of} in their place';
$string['app_so_sort'] = 'Sort';
$string['app_so_venn'] = 'Venn';
$string['app_split_close'] = 'One tool only';
$string['app_split_swap'] = 'Swap sides';
$string['app_tab_board'] = 'Whiteboard';
$string['app_tab_chance'] = 'Chance';
$string['app_tab_clock'] = 'Clock';
$string['app_tab_games'] = 'Games';
$string['app_tab_groups'] = 'Groups';
$string['app_tab_live'] = 'Live';
$string['app_tab_materials'] = 'Materials';
$string['app_tab_noise'] = 'Traffic light';
$string['app_tab_picker'] = 'Whose turn?';
$string['app_tab_qr'] = 'QR';
$string['app_tab_rules'] = 'How we work';
$string['app_tab_scoreboard'] = 'Scoreboard';
$string['app_tab_slides'] = 'Presentation';
$string['app_tab_stopwatch'] = 'Stopwatch';
$string['app_tab_timer'] = 'Timer';
$string['app_tc_back'] = 'Back to counting';
$string['app_tc_card_n'] = 'Card {$a}';
$string['app_tc_count'] = 'How many';
$string['app_tc_f_four'] = 'Four cards: A, B, C and D';
$string['app_tc_f_light'] = 'Traffic light: green, yellow and red';
$string['app_tc_f_rotate'] = 'One card that is turned: A, B, C and D';
$string['app_tc_f_yesno'] = 'Yes and no';
$string['app_tc_for'] = 'For';
$string['app_tc_format'] = 'Which cards';
$string['app_tc_groups'] = 'In groups';
$string['app_tc_groups_lead'] = 'Each one to the place of their colour: talk about why.';
$string['app_tc_note_rotate'] = 'Two cards to a page. Each one turns the card so their answer is on top. Laminated, they last the whole year.';
$string['app_tc_note_set'] = 'One page per student, to cut out. Laminated, they last the whole year.';
$string['app_tc_numbered'] = 'Numbered, without names';
$string['app_tc_print'] = 'Print';
$string['app_tc_print_cards'] = 'Print cards';
$string['app_tc_printing'] = 'The cards are ready to print.';
$string['app_tc_scan'] = 'Read the cards';
$string['app_tc_scan_cam'] = 'Use this computer\'s camera';
$string['app_tc_scan_count'] = '{$a->n} of {$a->of} read';
$string['app_tc_scan_hint'] = 'Point the camera at the raised cards: each one is outlined in the colour of its answer.';
$string['app_tc_scan_missing'] = 'Still to read';
$string['app_tc_scan_names'] = 'Who answered what';
$string['app_tc_scan_new'] = 'Another question';
$string['app_tc_scan_nocam'] = 'The camera cannot be used: allow it in the browser, or read them with the phone.';
$string['app_tc_scan_phone'] = 'Also with the phone: «Read the cards» on the fixed remote («Live» › «Remote»). The cards are read with the list they were printed for.';
$string['app_tc_scan_stop'] = 'Stop the camera';
$string['app_tc_talk'] = 'Two minutes to convince';
$string['app_tc_talk_done'] = 'Time\'s up: raise the cards again!';
$string['app_tc_talk_now'] = 'Talk with someone of another colour:';
$string['app_tc_title'] = 'Cards to vote';
$string['app_tc_turn'] = 'Turn the card: your answer on top.';
$string['app_tl_ago_ma'] = '{$a} Ma ago';
$string['app_tl_ago_years'] = '{$a} years ago';
$string['app_tl_bad_lines'] = 'Lines that cannot be read: {$a}';
$string['app_tl_bc'] = '{$a} BC';
$string['app_tl_delete'] = 'Delete the timeline';
$string['app_tl_delete_sure'] = 'Sure? Tap again';
$string['app_tl_edit'] = 'Edit';
$string['app_tl_empty'] = 'This timeline has no dates yet';
$string['app_tl_err_empty'] = 'At least one line «date | name» is needed.';
$string['app_tl_ex_ages'] = 'The ages of history (as taught in Spain)
3200 BC – 476 | Ancient history
476 – 1492 | Middle Ages
1492 – 1789 | Modern age
1789 – today | Contemporary age
3200 BC | Writing appears in Mesopotamia: prehistory ends
476 | The Western Roman Empire falls
1492 | Columbus reaches America
1789 | The French Revolution';
$string['app_tl_ex_earth'] = 'The history of the Earth
4540 Ma | The Earth forms
4540 Ma – 538.8 Ma | Precambrian
538.8 Ma – 251.9 Ma | Palaeozoic
251.9 Ma – 66 Ma | Mesozoic
66 Ma – today | Cenozoic
66 Ma | The extinction of the (non-bird) dinosaurs
300 ka | Homo sapiens appears';
$string['app_tl_ex_flight'] = 'History of flight
1783-11-21 | First people to fly, in a balloon of the Montgolfier brothers
1903-12-17 | First flight in an aeroplane (the Wright brothers)
1927-05-21 | Lindbergh crosses the Atlantic without stopping
1961-04-12 | Gagarin, the first person in space
1969-07-20 | Landing on the Moon';
$string['app_tl_examples'] = 'Examples';
$string['app_tl_fit'] = 'See it all';
$string['app_tl_format'] = 'One line per event: «date | name». A period: «date – date | name». Dates: 1969-07-20, 1492, 753 BC, 66 Ma (millions of years ago), 300 ka (thousands of years ago), today. The first line, without «|», is the title.';
$string['app_tl_help'] = 'Drag to move along it; the wheel, two fingers or the magnifier zoom in and out. Tap an event or a period to see it big.';
$string['app_tl_hide'] = 'Hide the dates';
$string['app_tl_mine'] = 'Mine';
$string['app_tl_new'] = 'New timeline';
$string['app_tl_text_ph'] = 'History of flight
1903-12-17 | First flight in an aeroplane
1969-07-20 | Landing on the Moon';
$string['app_tl_today'] = 'Today';
$string['app_tl_untitled'] = 'Untitled';
$string['app_tl_which'] = 'Timeline';
$string['app_tl_zoom_in'] = 'Zoom in';
$string['app_tl_zoom_out'] = 'Zoom out';
$string['app_tm_custom'] = 'Your own time';
$string['app_tm_fact_barco'] = 'A sailing boat sails at about 15 km/h.';
$string['app_tm_fact_caracol'] = 'A snail travels about 50 metres in an hour.';
$string['app_tm_fact_coche'] = 'A racing car goes faster than 300 km/h.';
$string['app_tm_fact_cohete'] = 'A rocket goes up at more than 28,000 km/h.';
$string['app_tm_fav'] = 'Your time: {$a}';
$string['app_tm_fav_add'] = 'Keep {$a}';
$string['app_tm_fav_add_title'] = 'Keep this time among yours (up to two)';
$string['app_tm_fav_remove'] = 'Remove {$a} from your times';
$string['app_tm_final'] = 'Liven up the last 10 seconds';
$string['app_tm_look'] = 'Look';
$string['app_tm_look_bar'] = 'Bar';
$string['app_tm_look_disc'] = 'Disc';
$string['app_tm_look_pulsar'] = 'Pulsar';
$string['app_tm_look_ring'] = 'Ring';
$string['app_tm_look_sand'] = 'Sand';
$string['app_tm_min_less'] = 'One minute less';
$string['app_tm_min_more'] = 'One minute more';
$string['app_tm_min_short'] = '{$a} min';
$string['app_tm_mini_go'] = 'Back to the timer';
$string['app_tm_minutes'] = 'Minutes';
$string['app_tm_one_left'] = '1 minute left';
$string['app_tm_paused'] = 'Paused';
$string['app_tm_paused_sr'] = 'Timer paused';
$string['app_tm_plus_one'] = '1 minute';
$string['app_tm_quick'] = 'Quick times';
$string['app_tm_ready'] = 'Ready';
$string['app_tm_running'] = 'Running';
$string['app_tm_running_sr'] = 'Timer running';
$string['app_tm_sec_less'] = 'Five seconds less';
$string['app_tm_sec_more'] = 'Five seconds more';
$string['app_tm_seconds'] = 'Seconds';
$string['app_tm_traveller'] = 'What travels the bar';
$string['app_tm_v_barco'] = 'Sailing boat';
$string['app_tm_v_bateria'] = 'Battery';
$string['app_tm_v_caracol'] = 'Snail';
$string['app_tm_v_coche'] = 'Racing car';
$string['app_tm_v_cohete'] = 'Rocket';
$string['app_tm_v_ninguno'] = 'Just the bar';
$string['app_tm_v_pixel'] = 'Pixels';
$string['app_tm_warn'] = 'Warn when 1 minute is left';
$string['app_tq_count'] = 'Touches the screen thinks are on it: {$a}';
$string['app_tq_given'] = 'tap given by the board';
$string['app_tq_hint'] = 'A circle left with no finger on it is a touch the screen has not let go; in red after four seconds.';
$string['app_tq_title'] = 'Touch test';
$string['app_turn_button'] = 'Whose turn?';
$string['app_turn_none'] = 'Choose a list in «Whose turn?» first.';
$string['app_turn_ok'] = 'OK';
$string['app_turn_other'] = 'Another';
$string['app_turn_relay'] = 'Relay';
$string['app_turn_relay_m'] = 'Another every {$a} minutes';
$string['app_turn_relay_m1'] = 'Another every minute';
$string['app_turn_relay_none'] = 'Just this one';
$string['app_turn_relay_s'] = 'Another every {$a} seconds';
$string['app_turn_stop'] = 'Stop';
$string['app_turn_task_board'] = 'To the board!';
$string['app_turn_task_note'] = 'Which note is it?';
$string['app_turn_task_play'] = 'To the glockenspiel!';
$string['app_turn_title'] = 'It\'s the turn of…';
$string['app_wa_clue'] = 'Another clue';
$string['app_wa_name'] = 'Who am I?';
$string['app_wa_next'] = 'Another one';
$string['app_wa_no_more'] = 'No more clues';
$string['app_wa_points'] = '{$a} points!';
$string['app_wa_right'] = 'Got it!';
$string['app_wa_show'] = 'Show the answer';
$string['app_wa_was'] = 'It was {$a}';
$string['app_wa_worth'] = 'Worth {$a} points';
$string['app_wb_background'] = 'Background';
$string['app_wb_bg_bigger'] = 'Bigger';
$string['app_wb_bg_blank'] = 'Blank';
$string['app_wb_bg_double'] = 'Double lines';
$string['app_wb_bg_grid'] = 'Squared paper';
$string['app_wb_bg_lines'] = 'Handwriting lines';
$string['app_wb_bg_ruled'] = 'Lined';
$string['app_wb_bg_size'] = 'Size';
$string['app_wb_bg_smaller'] = 'Smaller';
$string['app_wb_bg_staff'] = 'Music staves';
$string['app_wb_black'] = 'Black';
$string['app_wb_blue'] = 'Blue';
$string['app_wb_board'] = 'Drawing board';
$string['app_wb_cancel'] = 'Cancel';
$string['app_wb_clear'] = 'Clear all';
$string['app_wb_clear_sure'] = 'Are you sure? Press again';
$string['app_wb_colour'] = 'Colour';
$string['app_wb_default_name'] = 'Board {$a}';
$string['app_wb_del_page'] = 'Delete the page';
$string['app_wb_del_page_sure'] = 'Are you sure? Press again';
$string['app_wb_download'] = 'Download';
$string['app_wb_dup_page'] = 'Duplicate';
$string['app_wb_eraser'] = 'Eraser';
$string['app_wb_file'] = 'whiteboard';
$string['app_wb_fit'] = 'The picture as wide as the screen';
$string['app_wb_full'] = 'Full board: pages, instruments, picture or PDF';
$string['app_wb_green'] = 'Green';
$string['app_wb_image'] = 'Picture or PDF as background';
$string['app_wb_image_missing'] = 'The picture is in the browser it was added in';
$string['app_wb_image_remove'] = 'Remove the picture';
$string['app_wb_import_error'] = 'That file cannot be opened: try a picture (PNG, JPG) or a PDF.';
$string['app_wb_importing'] = 'Bringing in page {$a->n} of {$a->of}…';
$string['app_wb_magic'] = 'Magic shapes: keep the finger still at the end of a stroke and it becomes a line, a circle, a triangle or a rectangle';
$string['app_wb_margin'] = 'Margin line';
$string['app_wb_more'] = 'Full board';
$string['app_wb_new_page'] = 'New page';
$string['app_wb_next'] = 'Next page';
$string['app_wb_orange'] = 'Orange';
$string['app_wb_page_of'] = 'Page {$a->n} of {$a->of}';
$string['app_wb_pages'] = 'Pages';
$string['app_wb_pdf_many'] = 'Only the first {$a} pages fit.';
$string['app_wb_prev'] = 'Previous page';
$string['app_wb_purple'] = 'Purple';
$string['app_wb_red'] = 'Red';
$string['app_wb_redo'] = 'Redo';
$string['app_wb_saved'] = 'Downloaded: {$a}';
$string['app_wb_sel_copy'] = 'Copy';
$string['app_wb_sel_delete'] = 'Delete';
$string['app_wb_send'] = 'Share with the class';
$string['app_wb_send_empty'] = 'The board is empty.';
$string['app_wb_send_error'] = 'It could not be saved: {$a}';
$string['app_wb_send_for'] = 'For';
$string['app_wb_send_format'] = 'Format';
$string['app_wb_send_go'] = 'Save and notify';
$string['app_wb_send_name'] = 'Name';
$string['app_wb_send_note'] = 'It is saved in the course, in the section “Class boards”, in a folder for that class, and its students get a notification.';
$string['app_wb_send_note_cohort'] = 'This class is not a Moodle group: everyone in the course can see its folder; only its students get the notification.';
$string['app_wb_send_title'] = 'Save in the course and notify the class';
$string['app_wb_sending'] = 'Saving…';
$string['app_wb_sent'] = 'Saved in “{$a->folder}”. Notified: {$a->n}.';
$string['app_wb_sent_open'] = 'Open the folder';
$string['app_wb_sf_black'] = 'Black';
$string['app_wb_sf_green'] = 'Green';
$string['app_wb_sf_white'] = 'White';
$string['app_wb_size'] = 'Thickness';
$string['app_wb_size_l'] = 'Thick';
$string['app_wb_size_m'] = 'Medium';
$string['app_wb_size_s'] = 'Thin';
$string['app_wb_surface'] = 'Board';
$string['app_wb_t_arrow'] = 'Arrow';
$string['app_wb_t_ellipse'] = 'Circle or oval';
$string['app_wb_t_formula'] = 'Formula: fractions, powers, roots…';
$string['app_wb_t_hand'] = 'Move around the page';
$string['app_wb_t_hl'] = 'Highlighter';
$string['app_wb_t_laser'] = 'Laser pointer';
$string['app_wb_t_line'] = 'Straight line';
$string['app_wb_t_pen'] = 'Pen';
$string['app_wb_t_rect'] = 'Rectangle';
$string['app_wb_t_select'] = 'Select, move and resize';
$string['app_wb_t_text'] = 'Text';
$string['app_wb_text_ph'] = 'Type and press Enter';
$string['app_wb_too_big'] = 'These pages are too big to keep in the course: they stay in this browser.';
$string['app_wb_tool'] = 'Tool';
$string['app_wb_undo'] = 'Undo';
$string['app_wb_yellow'] = 'Yellow';
$string['app_wb_zoom_in'] = 'Zoom in';
$string['app_wb_zoom_out'] = 'Zoom out';
$string['app_wb_zoom_reset'] = 'Back to the whole page';
$string['app_wo_builtin'] = 'At random: {$a}-letter words';
$string['app_wo_hint'] = '3 to 8 letters';
$string['app_wo_letters'] = '{$a}-letter word';
$string['app_wo_name'] = 'Word';
$string['app_wo_need_word'] = 'The word must have 3 to 8 letters, with no spaces.';
$string['app_wo_short'] = 'Not enough letters: it has {$a}';
$string['app_wo_tries'] = 'Tries';
$string['app_wo_won'] = 'Well done! On try {$a}';
$string['boardfolder'] = 'Boards · {$a}';
$string['boardname'] = 'Board {$a}';
$string['boardsection'] = 'Class boards';
$string['boardshared_body'] = '{$a->teacher} has shared a board with your class in {$a->course}: {$a->name}.';
$string['boardshared_link'] = 'See the board';
$string['boardshared_subject'] = 'New board in {$a}';
$string['categorymodes'] = 'Screen mode by category';
$string['categorymodes_desc'] = 'The mode a course starts in, by its category. A subcategory without a mode of its own takes the one of the category above, and a category without one takes the mode of the site. The teacher can still choose another in each course.';
$string['categorymodes_parent'] = 'Like the category above';
$string['categorymodes_site'] = 'Like the site';
$string['choose'] = 'Which class?';
$string['choose_all'] = 'All';
$string['choose_all_categories'] = 'All the categories';
$string['choose_category'] = 'Category';
$string['choose_continue'] = 'Carry on with';
$string['choose_desc'] = 'Pick a course and the tools open with its students already loaded.';
$string['choose_filter'] = 'Filter the courses';
$string['choose_hello_afternoon'] = 'Good afternoon, {$a}';
$string['choose_hello_evening'] = 'Good evening, {$a}';
$string['choose_hello_morning'] = 'Good morning, {$a}';
$string['choose_hide'] = 'Hide from here';
$string['choose_hidehidden'] = 'Fold the hidden ones away';
$string['choose_none_found'] = 'No course with that name.';
$string['choose_remote'] = 'Your fixed remote';
$string['choose_remote_off'] = 'To drive the board from your phone without logging in: «Live» and «Remote», on the board.';
$string['choose_remote_on'] = 'Scan it with your phone: it drives the board you open.';
$string['choose_search'] = 'Look for a course';
$string['choose_showhidden'] = 'Show the hidden ones';
$string['choose_standalone_desc'] = 'The tools without students, for any moment';
$string['choose_student'] = '1 student';
$string['choose_students'] = '{$a} students';
$string['choose_unhide'] = 'Show here again';
$string['days'] = 'Days counted for fair picking';
$string['days_desc'] = 'When picking, students who have been picked least in these last days come first. It is also the period shown in «Participation».';
$string['defaultmode'] = 'Screen mode by default';
$string['defaultmode_desc'] = 'How the board looks in a course until the teacher chooses another mode. There are four, and only one is used at a time (they do not combine): <strong>Early years</strong> (ages 3 to 6: everything bigger, with more help, such as the tangram guide lines), <strong>Primary</strong> (6 to 12), <strong>Secondary</strong> (12 to 16, more sober) and <strong>Advanced</strong> (upper secondary and university: the most demanding and sober, without confetti). Each teacher can change the mode in each course with the button in the top bar, and it is remembered for that course. No mode removes a tool: the mode changes the look and how the games start. The games\' content goes separately in «School levels», where several can be ticked.';
$string['groupingname'] = '{$a->list} · teams of {$a->when}';
$string['jointitle'] = 'Join the class';
$string['kicked'] = 'The teacher has taken this device out of the session.';
$string['level_early'] = 'Early years';
$string['level_higher'] = 'Higher education';
$string['level_primary'] = 'Primary';
$string['level_secondary'] = 'Secondary';
$string['level_upper'] = 'Upper secondary';
$string['levels'] = 'School levels';
$string['levels_desc'] = 'The games\' content (built-in sets: shapes, animal shadows, times tables, chemical elements, graphs of functions…) for the levels taught at this school. Several can be ticked, and teachers can narrow them further in each game. This is separate from the screen mode above, which is one at a time.';
$string['live'] = 'Live sessions';
$string['live_desc'] = 'The board can open live sessions: students answer a vote or press their team\'s buzzer from a tablet, a Chromebook or a phone, and the teacher can use their own phone as a remote for the board. Each session is opened for one of two ways in: with the code on the board (nobody logs in and no names appear) or with the students\' Moodle accounts (only students of the course, with their names). While a session is open, each device asks the site how it goes every second and a half; sessions end on their own after 15 minutes without the board, and are deleted the next day.';
$string['liveclosed'] = 'The question is closed.';
$string['livedisabled'] = 'Live sessions are turned off on this site.';
$string['livefull'] = 'The session is full.';
$string['livenotice'] = 'Notice for students';
$string['livenotice_close'] = 'Close the notice';
$string['livenotice_desc'] = 'When a teacher opens a live session, the students of that course see a small notice on the course pages with a button to join: they need not type the code or scan the QR.';
$string['livenotice_join'] = 'Join';
$string['livenotice_title'] = 'Live: {$a}';
$string['logros'] = 'Teachers\' stickers';
$string['logros_desc'] = 'Each tool has a sticker for the teacher, earned by using it for real with a class and raised a level with the days of use (1, 3, 8, 20 and 50). Each teacher sees only their own album, on «Which class?»; there is never a ranking between teachers.';
$string['logros_devices'] = 'Devices for a real live session';
$string['logros_devices_desc'] = 'How many devices have to join a live session (vote, brainstorm, quiz, buzzers) for it to count as a real use.';
$string['logros_picks'] = 'Turns for a real use of «Whose turn?»';
$string['logros_picks_desc'] = 'How many students have to be picked in the same class on the same day.';
$string['logros_students'] = 'Students for real groups';
$string['logros_students_desc'] = 'How many students the course list has to have when groups are made with it.';
$string['menu'] = 'Link in the main menu';
$string['menu_desc'] = 'Shows the classroom tools in the top menu to anyone who teaches a course. Inside each course the link is always in the course bar.';
$string['messageprovider:boardshared'] = 'A drawing board shared with your class';
$string['mode_advanced'] = 'Advanced (upper secondary and university)';
$string['mode_early'] = 'Early years';
$string['mode_primary'] = 'Primary';
$string['mode_secondary'] = 'Secondary';
$string['namestyle'] = 'Name on the board';
$string['namestyle_desc'] = 'How each student is shown in the name picker and in groups.';
$string['namestyle_first'] = 'First name only';
$string['namestyle_firstsurname'] = 'First name and first surname';
$string['namestyle_full'] = 'Full name';
$string['namestyle_initials'] = 'First name and the initials of the surnames';
$string['navlabel'] = 'Class tools';
$string['nocourses'] = 'You do not teach in any course. You can still use the tools and paste your own lists.';
$string['oksigeniaclasstools:generate'] = 'Ask the AI of the site for exercises for the games of the class tools';
$string['oksigeniaclasstools:use'] = 'Use the classroom tools with the course students';
$string['pluginname'] = 'Class tools (Oksigenia Classtools)';
$string['privacy:hidden'] = 'Courses hidden from «Which class?» (their ids): {$a}';
$string['privacy:learnt'] = 'Stickers learned';
$string['privacy:metadata:core_ai'] = 'Exercises asked from the AI of the site go through the AI subsystem of Moodle, which keeps the request and its answer.';
$string['privacy:metadata:core_files'] = 'The pictures of the quiz questions are kept in the course, for the teacher who put them.';
$string['privacy:metadata:core_message'] = 'Students get a notification when a teacher shares a drawing board with their class.';
$string['privacy:metadata:learnt'] = 'The stickers a teacher has learned: the «Now you» of the guided help of a tool, done on the practice board.';
$string['privacy:metadata:learnt:courseid'] = 'The course where the help was opened.';
$string['privacy:metadata:learnt:cromo'] = 'The sticker (the tool).';
$string['privacy:metadata:learnt:timecreated'] = 'When it was learned.';
$string['privacy:metadata:learnt:userid'] = 'The teacher.';
$string['privacy:metadata:live'] = 'Live sessions opened by teachers on the board.';
$string['privacy:metadata:live:courseid'] = 'The course of the session.';
$string['privacy:metadata:live:timecreated'] = 'When it was opened.';
$string['privacy:metadata:live:userid'] = 'The teacher who opened it.';
$string['privacy:metadata:livein'] = 'Who joined a live session with their account, and what they answered.';
$string['privacy:metadata:livein:answer'] = 'What they answered: a vote, a word or two, or the sentences of an exit ticket (kept for a day at most).';
$string['privacy:metadata:livein:team'] = 'Their team, for the buzzers.';
$string['privacy:metadata:livein:timecreated'] = 'When they answered.';
$string['privacy:metadata:livein:userid'] = 'The student, when they joined with their account.';
$string['privacy:metadata:picks'] = 'Each time a student is picked on the board, so that those picked least come first and participation can be seen. Picks are deleted once they are older than the days counted for fair picking.';
$string['privacy:metadata:picks:courseid'] = 'The course where the pick happened.';
$string['privacy:metadata:picks:teacherid'] = 'The teacher who made the pick.';
$string['privacy:metadata:picks:timecreated'] = 'When the student was picked.';
$string['privacy:metadata:picks:userid'] = 'The student who was picked.';
$string['privacy:metadata:preference:hidden'] = 'The courses the teacher hides from «Which class?».';
$string['privacy:metadata:preference:sala'] = 'Whether the teacher appears in the teachers\' room.';
$string['privacy:metadata:remote'] = 'The fixed remote of each teacher: an address for their phone with a key, and whether it is on.';
$string['privacy:metadata:remote:enabled'] = 'Whether the remote is on.';
$string['privacy:metadata:remote:timecreated'] = 'When it was first turned on.';
$string['privacy:metadata:remote:token'] = 'The key in the address of the remote.';
$string['privacy:metadata:remote:userid'] = 'The teacher.';
$string['privacy:metadata:state'] = 'What each teacher keeps of each tool in each course (for example the scoreboard or their alphabet wheels), to go on from any computer.';
$string['privacy:metadata:state:courseid'] = 'The course.';
$string['privacy:metadata:state:data'] = 'What is kept (team names, scores, questions…).';
$string['privacy:metadata:state:timemodified'] = 'When it was last saved.';
$string['privacy:metadata:state:tool'] = 'The tool.';
$string['privacy:metadata:state:userid'] = 'The teacher.';
$string['privacy:metadata:uses'] = 'The real uses of the tools with a class, kept for the teacher\'s stickers: one per sticker, course and day.';
$string['privacy:metadata:uses:courseid'] = 'The course.';
$string['privacy:metadata:uses:cromo'] = 'The sticker (the tool used).';
$string['privacy:metadata:uses:day'] = 'The day of the use.';
$string['privacy:metadata:uses:timecreated'] = 'When it was kept.';
$string['privacy:metadata:uses:userid'] = 'The teacher.';
$string['privacy:remote'] = 'Fixed remote';
$string['privacy:sala_in'] = 'The teacher appears in the teachers\' room.';
$string['privacy:sala_out'] = 'The teacher does not appear in the teachers\' room.';
$string['privacy:uses'] = 'Uses for the stickers';
$string['remoteoff'] = 'Fixed remote: turn off by itself';
$string['remoteoff_desc'] = 'The fixed remote of each teacher turns itself off after these hours without orders from the phone (counting from when it was turned on). The teacher turns it on again on the board with one tap.';
$string['remoteoff_hours'] = 'After {$a} hours';
$string['remoteoff_never'] = 'Never';
$string['remoteoff_one'] = 'After 1 hour';
$string['sala'] = 'Teachers\' room';
$string['sala_close'] = 'Close';
$string['sala_count'] = '{$a} in the room';
$string['sala_count_none'] = 'Nobody yet';
$string['sala_desc'] = 'On «Which class?», the teachers who want to appear there, with their critter and their stickers, so everyone knows who else plays with their class. Each teacher decides whether to appear (at first, no) and can leave whenever they like. Counts and hours are never shown, and nobody is ordered by use. It needs the stickers on.';
$string['sala_empty'] = 'Nobody has joined yet. Will you be the first?';
$string['sala_intro'] = 'Who else plays with their class: to know whom to ask.';
$string['sala_join'] = 'Appear in the room';
$string['sala_join_note'] = 'Only your critter, your name and your stickers with their level are seen; never how many times or how long. You can leave whenever you like.';
$string['sala_mine_before'] = 'And {$a} won before this time, still in «My stickers».';
$string['sala_mine_before_one'] = 'And 1 won before this time, still in «My stickers».';
$string['sala_mine_learned'] = 'And {$a} learned in the guided helps, only in «My stickers».';
$string['sala_mine_learned_one'] = 'And 1 learned in a guided help, only in «My stickers».';
$string['sala_none'] = 'No stickers won with a class in this time yet';
$string['sala_open'] = 'See the room';
$string['sala_others'] = 'And {$a} more colleagues play with their classes.';
$string['sala_others_one'] = 'And one more colleague plays with their class.';
$string['sala_season_span'] = 'It counts the stickers won using the tools with a class in the season «{$a->name}», since {$a->date} (not the ones of the guided helps).';
$string['sala_season_span_noname'] = 'Since {$a}.';
$string['sala_seasons'] = 'Seasons of the room';
$string['sala_seasons_desc'] = 'Optional. One per line, with the day it begins and its name: «2026-09-08 | First term». The room counts from the beginning of the season on now.';
$string['sala_weeks'] = 'Weeks the room counts';
$string['sala_weeks_desc'] = 'The levels in the room come from the days of use in the last weeks: nobody stays on top for ever, and a newcomer catches up. Not used when a season is on.';
$string['sala_weeks_span'] = 'It counts the stickers won using the tools with a class in the last {$a} weeks (not the ones of the guided helps).';
$string['sala_you'] = 'you';
$string['show_games'] = 'Games';
$string['show_games_desc'] = 'The games of the Games tab on this site.';
$string['show_materials'] = 'Materials';
$string['show_materials_desc'] = 'The materials of the Materials tab on this site.';
$string['show_tools'] = 'Tools';
$string['show_tools_desc'] = 'The tabs the board shows on this site. Leave out the ones your school does not use: teachers will not see them. «Presentation» starts off: it shows Canva presentations inside the board, loaded from canva.com when a teacher opens one.';
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
$string['tourstep3content'] = '<p>Open them in full screen: everything works with fingers. The scoreboard, your alphabet wheels and your locks follow you to any computer.</p>';
$string['tourstep3title'] = 'On the interactive whiteboard';
$string['usage'] = 'Use of the boards';
$string['usage_allcourses'] = 'All courses';
$string['usage_course'] = 'Course';
$string['usage_days'] = 'Days used';
$string['usage_desc'] = 'How many times each tool, game and material of the board was chosen and how long it was in use (while the board was on screen and someone had touched it in the last 15 minutes), on the boards of students and of teachers. The most used by students first.';
$string['usage_none'] = 'Nothing has been counted in this course and period yet.';
$string['usage_period'] = 'Period';
$string['usage_period_all'] = 'Since the start';
$string['usage_period_month'] = 'Last 30 days';
$string['usage_period_today'] = 'Today';
$string['usage_period_week'] = 'Last 7 days';
$string['usage_see'] = 'See what the boards are used for: tools, games and materials, by students and by teachers.';
$string['usage_students_opens'] = 'Students: times';
$string['usage_students_time'] = 'Students: time';
$string['usage_teachers_opens'] = 'Teachers: times';
$string['usage_teachers_time'] = 'Teachers: time';
$string['usage_tool'] = 'Tool';
$string['wholeclass'] = 'Whole class';
$string['wholecourse'] = 'Whole course';
