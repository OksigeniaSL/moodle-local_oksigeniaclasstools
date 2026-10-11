#!/usr/bin/env node
// Checks app/exercises.js against the examples of docs/exercise-format.md: plain text in, the shared JSON out, and
// back to text. Usage: node tools/exercises_check.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app/exercises.js'), 'utf8'), box);
const { parse, toText, oddRound } = box.window.ClasstoolsExercises;
// Objects from the sandbox, compared as plain JSON.
const plain = (x) => JSON.parse(JSON.stringify(x));
let failed = 0;
const check = (name, fn) => {
    try { fn(); console.log(`ok   ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}: ${e.message}`); }
};

check('order', () => {
    const [ex] = plain(parse('# The water cycle\nEvaporation\nCondensation\nPrecipitation\n? Condensation: the vapour cools down and forms drops', 'order'));
    assert.deepStrictEqual(ex, { type: 'order', title: 'The water cycle', items: ['Evaporation', 'Condensation', 'Precipitation'],
        why: { Condensation: 'the vapour cools down and forms drops' } });
});
check('order needs two items', () => assert.strictEqual(parse('Only one', 'order').length, 0));
check('the game decides, not the text', () => {
    const [ex] = plain(parse('Step 1: mix\nStep 2: bake', 'order'));
    assert.deepStrictEqual(ex.items, ['Step 1: mix', 'Step 2: bake']);
});
check('classify with commas and with semicolons', () => {
    const [ex] = plain(parse('# Animals\nMammals: dog, whale, bat\nBirds: penguin, hen, ostrich\n? bat: it flies, but it has fur', 'classify'));
    assert.deepStrictEqual(ex.groups, [{ name: 'Mammals', items: ['dog', 'whale', 'bat'] }, { name: 'Birds', items: ['penguin', 'hen', 'ostrich'] }]);
    assert.strictEqual(ex.mode, 'sort');
    assert.strictEqual(ex.why.bat, 'it flies, but it has fur');
    const [semi] = plain(parse('Mammals: dog; whale, the blue one; bat\nBirds: hen', 'classify'));
    assert.deepStrictEqual(semi.groups[0].items, ['dog', 'whale, the blue one', 'bat']);
});
check('venn: the same item in two groups', () => {
    const [ex] = plain(parse('Even numbers: 2, 4, 6, 8\nMultiples of 3: 3, 6, 9', 'classify', 'venn'));
    assert.strictEqual(ex.mode, 'venn');
    assert.ok(ex.groups[0].items.includes('6') && ex.groups[1].items.includes('6'));
});
check('two exercises, a blank line between them', () => {
    const all = parse('# One\na\nb\n\n# Two\nc\nd\n   \n# Three\ne\nf', 'order');
    assert.deepStrictEqual(plain(all).map((x) => x.title), ['One', 'Two', 'Three']);
});
check('errors', () => {
    const [ex] = plain(parse('Columbus reached America in [1942|1492|in 1492, not in 1942] with three [boats|caravels/carracks].', 'errors'));
    assert.deepStrictEqual(ex, { type: 'errors', text: 'Columbus reached America in {0} with three {1}.',
        marks: [{ wrong: '1942', right: ['1492'], why: 'in 1492, not in 1942' }, { wrong: 'boats', right: ['caravels', 'carracks'] }] });
});
check('errors need a mark', () => assert.strictEqual(parse('No mistakes here.', 'errors').length, 0));
check('who am I', () => {
    const [ex] = plain(parse('= Marie Curie / Curie\nI was born in Warsaw.\nI won two Nobel prizes, in different sciences.\nI studied radioactivity.', 'whoami'));
    assert.deepStrictEqual(ex, { type: 'whoami', answer: 'Marie Curie', accept: ['Curie'],
        clues: ['I was born in Warsaw.', 'I won two Nobel prizes, in different sciences.', 'I studied radioactivity.'] });
});
check('who am I needs the answer first', () => assert.strictEqual(parse('I was born in Warsaw.\n= Marie Curie', 'whoami').length, 0));
check('back to text and in again', () => {
    const texts = [
        ['# The water cycle\nEvaporation\nCondensation\n? Condensation: drops', 'order'],
        ['# Animals\nMammals: dog; whale, the blue one\nBirds: hen, owl', 'classify'],
        ['Columbus reached America in [1942|1492|not 1942] with three [boats|caravels/carracks].', 'errors'],
        ['= Marie Curie / Curie\nI was born in Warsaw.\nI studied radioactivity.', 'whoami'],
    ];
    texts.forEach(([text, type]) => {
        const [ex] = parse(text, type);
        assert.deepStrictEqual(plain(parse(toText(ex), type)[0]), plain(ex), type);
    });
});
check('odd one out', () => {
    const [ex] = parse('Mammals: dog, whale, bat, horse\nBirds: penguin, hen', 'classify');
    let n = 0;
    const random = (k) => (n++ * 7) % k;
    const round = plain(oddRound(ex, random));
    assert.strictEqual(round.items.length, 4);
    assert.strictEqual(round.group, 'Mammals');
    assert.strictEqual(round.oddGroup, 'Birds');
    assert.ok(['penguin', 'hen'].includes(round.odd) && round.items.includes(round.odd));
    assert.strictEqual(round.items.filter((x) => ['dog', 'whale', 'bat', 'horse'].includes(x)).length, 3);
});
process.exit(failed ? 1 : 0);
