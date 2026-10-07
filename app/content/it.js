// Content of the games and materials in Italian: letters, keyboard, words, pairs, the time in words and the examples.
// Every language has its file with the same keys (see README.md in this folder); Moodle loads the user's one.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
window.CLASSTOOLS_CONTENT = {
    lang: 'it',
    decimal: ',',
    // Letters: A to Z (J K W X Y too, they appear in loanwords); the accents count as the base letter.
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    fold: { Á: 'A', À: 'A', Â: 'A', Ä: 'A', É: 'E', È: 'E', Ê: 'E', Ë: 'E', Í: 'I', Ì: 'I', Î: 'I', Ï: 'I', Ó: 'O', Ò: 'O', Ô: 'O', Ö: 'O',
        Ú: 'U', Ù: 'U', Û: 'U', Ü: 'U', Ç: 'C', Ñ: 'N' },
    keyboard: ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'],
    vowels: 'AEIOU',
    stopOut: 'HJKWXY',
    words: {
        long: ['ELEFANTE', 'GIRAFFA', 'FARFALLA', 'COCCODRILLO', 'PINGUINO', 'TARTARUGA', 'DELFINO', 'CANGURO', 'SCOIATTOLO', 'COCCINELLA',
            'VULCANO', 'MONTAGNA', 'OCEANO', 'PIANETA', 'STELLA', 'ARCOBALENO', 'TEMPORALE', 'CASCATA', 'DESERTO', 'FORESTA',
            'LAVAGNA', 'ZAINO', 'QUADERNO', 'TEMPERINO', 'BIBLIOTECA', 'FORBICI', 'CALENDARIO', 'DIZIONARIO', 'RICREAZIONE', 'MATITA',
            'BICICLETTA', 'ELICOTTERO', 'SOTTOMARINO', 'TELESCOPIO', 'CHITARRA', 'TAMBURO', 'CIOCCOLATO', 'ARANCIA', 'BANANA', 'ANGURIA',
            'ROBOT', 'ASTRONAUTA', 'CASTELLO', 'DINOSAURO', 'PIRAMIDE', 'BUSSOLA', 'MONGOLFIERA', 'OMBRELLO', 'RAGNATELA', 'PIPISTRELLO',
            'FRAGOLA', 'CONIGLIO'],
        five: ['LIBRO', 'MONTE', 'VERDE', 'SEDIA', 'PENNA', 'GOMMA', 'PESCA', 'MANGO', 'PIANO', 'TIGRE', 'ZEBRA', 'GATTO', 'VOLPE',
            'CERVO', 'LEONE', 'CAPRA', 'MUCCA', 'PESCE', 'LATTE', 'PASTA', 'TORTA', 'MIELE', 'TRENO', 'BARCA', 'AEREO', 'CIELO',
            'TERRA', 'MONDO', 'FIUME', 'VENTO', 'FUOCO', 'ACQUA', 'ISOLA', 'PRATO', 'FIORE', 'BANCO', 'GESSO', 'ZAINO', 'CARTA',
            'COLLA', 'MAPPA', 'GIOCO', 'PALLA', 'PORTA', 'LETTO', 'ROSSO', 'VIOLA', 'BOCCA', 'DENTE', 'GAMBA', 'ROBOT', 'CITTÀ'],
    },
    colours: ['Rosso', 'Blu', 'Verde', 'Giallo', 'Viola', 'Arancione', 'Rosa', 'Marrone', 'Nero', 'Bianco', 'Grigio', 'Azzurro'],
    numbers: ['uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici',
        'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove', 'venti'],
    opposites: [['alto', 'basso'], ['grande', 'piccolo'], ['freddo', 'caldo'], ['giorno', 'notte'], ['aprire', 'chiudere'], ['veloce', 'lento'],
        ['pieno', 'vuoto'], ['sopra', 'sotto'], ['dentro', 'fuori'], ['molto', 'poco'], ['nuovo', 'vecchio'], ['chiaro', 'scuro'],
        ['vincere', 'perdere'], ['entrare', 'uscire'], ['duro', 'morbido'], ['pulito', 'sporco']],
    elements: ['Idrogeno', 'Elio', 'Litio', 'Carbonio', 'Azoto', 'Ossigeno', 'Fluoro', 'Neon', 'Sodio', 'Magnesio', 'Alluminio',
        'Silicio', 'Fosforo', 'Zolfo', 'Cloro', 'Argon', 'Potassio', 'Calcio', 'Ferro', 'Rame', 'Zinco', 'Argento', 'Stagno', 'Iodio',
        'Oro', 'Mercurio', 'Piombo', 'Uranio'],
    units: [['Lunghezza', 'metro (m)'], ['Massa', 'chilogrammo (kg)'], ['Tempo', 'secondo (s)'], ['Temperatura', 'kelvin (K)'],
        ['Intensità di corrente', 'ampere (A)'], ['Quantità di sostanza', 'mole (mol)'], ['Intensità luminosa', 'candela (cd)'],
        ['Forza', 'newton (N)'], ['Energia', 'joule (J)'], ['Potenza', 'watt (W)'], ['Pressione', 'pascal (Pa)'], ['Frequenza', 'hertz (Hz)'],
        ['Carica elettrica', 'coulomb (C)'], ['Tensione elettrica', 'volt (V)'], ['Resistenza elettrica', 'ohm (Ω)']],
    prefixes: [['tera (T)', '10¹²'], ['giga (G)', '10⁹'], ['mega (M)', '10⁶'], ['chilo (k)', '10³'], ['etto (h)', '10²'], ['deca (da)', '10¹'],
        ['deci (d)', '10⁻¹'], ['centi (c)', '10⁻²'], ['milli (m)', '10⁻³'], ['micro (µ)', '10⁻⁶'], ['nano (n)', '10⁻⁹'], ['pico (p)', '10⁻¹²']],
    formulas: [['H₂O', 'Acqua'], ['CO₂', 'Diossido di carbonio'], ['NaCl', 'Cloruro di sodio'], ['NH₃', 'Ammoniaca'], ['CH₄', 'Metano'],
        ['H₂SO₄', 'Acido solforico'], ['HCl', 'Acido cloridrico'], ['NaOH', 'Idrossido di sodio'], ['CaCO₃', 'Carbonato di calcio'],
        ['O₃', 'Ozono'], ['C₆H₁₂O₆', 'Glucosio'], ['HNO₃', 'Acido nitrico'], ['CO', 'Monossido di carbonio'], ['H₂O₂', 'Perossido di idrogeno'],
        ['C₂H₅OH', 'Etanolo'], ['Fe₂O₃', 'Ossido di ferro(III)']],
    laws: [['F = m·a', 'Secondo principio della dinamica'], ['E = m·c²', 'Equivalenza massa-energia'], ['V = R·I', 'Prima legge di Ohm'],
        ['p·V = n·R·T', 'Legge dei gas perfetti'], ['F = G·m₁·m₂/r²', 'Gravitazione universale'], ['F = k·q₁·q₂/r²', 'Legge di Coulomb'],
        ['E = h·f', 'Energia di un fotone'], ['p = m·v', 'Quantità di moto'], ['Ec = ½·m·v²', 'Energia cinetica'],
        ['Ep = m·g·h', 'Energia potenziale gravitazionale'], ['L = F·s', 'Lavoro'], ['P = L/t', 'Potenza'], ['d = m/V', 'Densità'],
        ['v = λ·f', 'Velocità di un\'onda'], ['F = −k·x', 'Legge di Hooke']],
    functions: ['y = x²', 'y = x³', 'y = √x', 'y = 1/x', 'y = sen x', 'y = cos x', 'y = eˣ', 'y = ln x', 'y = |x|', 'y = 2x + 1', 'y = −x²', 'y = x'],
    derivatives: [['x²', '2x'], ['x³', '3x²'], ['sen x', 'cos x'], ['cos x', '−sen x'], ['ln x', '1/x'], ['√x', '1 / (2√x)'],
        ['1/x', '−1/x²'], ['tg x', '1 / cos² x'], ['5x', '5'], ['e²ˣ', '2e²ˣ'], ['x⁴', '4x³']],
    integrals: [['x dx', 'x²/2 + C'], ['1/x dx', 'ln|x| + C'], ['eˣ dx', 'eˣ + C'], ['cos x dx', 'sen x + C'],
        ['sen x dx', '−cos x + C'], ['3x² dx', 'x³ + C'], ['1/(1 + x²) dx', 'arctg x + C'], ['1/√(1 − x²) dx', 'arcsen x + C'],
        ['1/cos² x dx', 'tg x + C'], ['aˣ dx', 'aˣ/ln a + C'], ['k dx', 'kx + C'], ['1/(2√x) dx', '√x + C']],
    groups: [['–OH', 'Alcol'], ['–CHO', 'Aldeide'], ['–CO–', 'Chetone'], ['–COOH', 'Acido carbossilico'], ['–COO–', 'Estere'],
        ['–O–', 'Etere'], ['–NH₂', 'Ammina'], ['–CONH₂', 'Ammide'], ['–C≡N', 'Nitrile'], ['–NO₂', 'Nitroderivato'],
        ['C=C', 'Alchene'], ['C≡C', 'Alchino'], ['–X (F, Cl, Br, I)', 'Alogenuro']],
    constants: [['c = 3,00·10⁸ m/s', 'Velocità della luce'], ['h = 6,63·10⁻³⁴ J·s', 'Costante di Planck'],
        ['G = 6,67·10⁻¹¹ N·m²/kg²', 'Costante di gravitazione universale'], ['e = 1,60·10⁻¹⁹ C', 'Carica elementare'],
        ['NA = 6,02·10²³ mol⁻¹', 'Numero di Avogadro'], ['R = 8,31 J/(mol·K)', 'Costante dei gas'],
        ['k = 1,38·10⁻²³ J/K', 'Costante di Boltzmann'], ['g = 9,81 m/s²', 'Accelerazione di gravità'],
        ['mₑ = 9,11·10⁻³¹ kg', 'Massa dell\'elettrone'], ['mₚ = 1,67·10⁻²⁷ kg', 'Massa del protone'],
        ['ε₀ = 8,85·10⁻¹² F/m', 'Costante dielettrica del vuoto'], ['μ₀ = 4π·10⁻⁷ T·m/A', 'Permeabilità magnetica del vuoto']],
    greek: [['α', 'alfa'], ['β', 'beta'], ['γ', 'gamma'], ['δ', 'delta'], ['ε', 'epsilon'], ['θ', 'theta'], ['λ', 'lambda'],
        ['μ', 'mu'], ['π', 'pi'], ['ρ', 'rho'], ['σ', 'sigma'], ['φ', 'fi'], ['ω', 'omega']],
    // «Le tre e un quarto», «Le quattro meno dieci», «L'una e mezza», «Mezzogiorno in punto», «Mezzanotte meno un quarto».
    clock: (t) => {
        const HOURS = ['', 'l\'una', 'le due', 'le tre', 'le quattro', 'le cinque', 'le sei', 'le sette', 'le otto', 'le nove', 'le dieci',
            'le undici'];
        const NUM = ['', 'un minuto', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici',
            'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove', 'venti', 'ventuno', 'ventidue', 'ventitré',
            'ventiquattro', 'venticinque', 'ventisei', 'ventisette', 'ventotto', 'ventinove'];
        let h = Math.floor(t / 60), m = t % 60, meno = false;
        if (m > 30) { h += 1; m = 60 - m; meno = true; }
        h %= 24;
        const hour = h === 0 ? 'mezzanotte' : (h === 12 ? 'mezzogiorno' : HOURS[h % 12]);
        let text;
        if (m === 0) { text = `${hour} in punto`; }
        else if (m === 15) { text = `${hour} ${meno ? 'meno' : 'e'} un quarto`; }
        else if (m === 30) { text = `${hour} e mezza`; }
        else { text = `${hour} ${meno ? 'meno' : 'e'} ${NUM[m]}`; }
        return text.charAt(0).toUpperCase() + text.slice(1);
    },
    rosco: [
        ['A', 's', 'Insetto che produce il miele', 'Ape'], ['B', 's', 'Veicolo a due ruote che si muove con i pedali', 'Bicicletta'],
        ['C', 's', 'Animale che porta la casa sulla schiena e lascia una scia luccicante', 'Chiocciola'],
        ['D', 's', 'Enorme rettile vissuto milioni di anni fa', 'Dinosauro'],
        ['E', 's', 'Animale con la proboscide che vive in Africa e in Asia', 'Elefante'],
        ['F', 's', 'Piccolo frutto rosso con i semi all\'esterno', 'Fragola'], ['G', 's', 'Animale che fa le fusa e miagola', 'Gatto'],
        ['H', 'c', 'Oggetto che serve per aprire e chiudere una porta', 'Chiave'],
        ['I', 's', 'Pezzo di terra circondato dall\'acqua da tutte le parti', 'Isola'],
        ['J', 's', 'Pantaloni di tessuto blu, robusti e comodi', 'Jeans'],
        ['K', 's', 'Piccolo frutto con la buccia marrone e pelosa, verde dentro', 'Kiwi'], ['L', 's', 'Satellite naturale della Terra', 'Luna'],
        ['M', 's', 'Grande distesa di acqua salata dove vivono i pesci e i delfini', 'Mare'],
        ['N', 's', 'Acqua ghiacciata che cade dal cielo in fiocchi bianchi', 'Neve'],
        ['O', 's', 'Lo guardiamo per sapere che ore sono', 'Orologio'],
        ['P', 's', 'Uccello bianco e nero che vive vicino al Polo Sud e non vola', 'Pinguino'],
        ['Q', 's', 'A scuola ci scriviamo e ci facciamo gli esercizi', 'Quaderno'],
        ['R', 's', 'Piccolo animale con otto zampe che tesse la tela', 'Ragno'],
        ['S', 's', 'Stella che ci dà luce e calore', 'Sole'], ['T', 's', 'Animale con il guscio che cammina molto lentamente', 'Tartaruga'],
        ['U', 's', 'Piccolo frutto che cresce a grappoli', 'Uva'], ['V', 's', 'Montagna che può eruttare lava', 'Vulcano'],
        ['W', 's', 'Connessione a internet senza fili', 'Wifi'],
        ['X', 's', 'Strumento musicale con lamelle che si suonano con le bacchette', 'Xilofono'],
        ['Y', 's', 'Alimento fatto con il latte che si mangia con il cucchiaino', 'Yogurt'],
        ['Z', 's', 'Animale a strisce bianche e nere che assomiglia a un cavallo', 'Zebra'],
    ],
    lock: {
        name: 'Lucchetto di esempio', final: 'Bravi! Avete aperto il lucchetto tutti insieme.',
        clues: ['Il primo numero è quante zampe ha un gatto.', 'Il secondo, le dita di una mano meno quattro.',
            'Il terzo, quanti occhi ha una persona.', 'Il quarto, i giorni di una settimana.'],
    },
};
