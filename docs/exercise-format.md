# Exercise format

The format of the exercises of four games of the board: **Order**, **Sort** (with **Odd one out** and **Venn**),
**Spot the mistakes** and **Who am I?**. Agreed with Oksigenia Tesapé so that an exercise written for one works in the
other: teachers write it as plain text, and it is kept and shared as JSON.

## Plain text

What a teacher writes or pastes. Rules that hold in the four games:

- One thing per line. A blank line separates one exercise from the next.
- The game is chosen by the teacher, never guessed from the text.
- A first line starting with `#` is the title (optional).
- A line starting with `?` explains an item: `? item: why`. It is shown when the class gets that item wrong
  (optional, in any game).
- No keywords in any language.

### Order

The items in their right order, one per line.

```
# The water cycle
Evaporation
Condensation
Precipitation
? Condensation: the vapour cools down and forms drops
```

### Sort, Odd one out and Venn

`Group: item, item, item`. If a line has a `;`, the items are separated by `;` and commas stay free inside them.
An item in two groups goes in their intersection (Venn). Odd one out is made from the same text: three items of one
group and one of another.

```
# Animals
Mammals: dog, whale, bat
Birds: penguin, hen, ostrich
? bat: it flies, but it has fur and its young drink milk
```

With commas inside the items:

```
Mammals: dog; whale, the blue one; bat
```

```
Even numbers: 2, 4, 6, 8
Multiples of 3: 3, 6, 9
```

### Spot the mistakes

The text, with each mistake between brackets: `[what it says|right]`. Several right answers are separated by `/`, and
a third part explains it: `[what it says|right/also right|why]`.

```
Columbus reached America in [1942|1492|in 1492, not in 1942] with three [boats|caravels/carracks].
```

### Who am I?

`= answer` on the first line, with other accepted answers after `/`, and the clues under it, from the hardest to the
easiest.

```
= Marie Curie / Curie
I was born in Warsaw.
I won two Nobel prizes, in different sciences.
I studied radioactivity.
```

## JSON

How an exercise is kept and shared. `title` and `why` are optional everywhere; `why` maps an item (or a mark) to its
explanation.

```json
{"type": "order", "title": "The water cycle", "items": ["Evaporation", "Condensation", "Precipitation"],
 "why": {"Condensation": "the vapour cools down and forms drops"}}

{"type": "classify", "title": "Animals", "mode": "sort",
 "groups": [{"name": "Mammals", "items": ["dog", "whale", "bat"]}, {"name": "Birds", "items": ["penguin", "hen"]}],
 "why": {"bat": "it flies, but it has fur and its young drink milk"}}

{"type": "errors", "title": "", "text": "Columbus reached America in {0} with three {1}.",
 "marks": [{"wrong": "1942", "right": ["1492"], "why": "in 1492, not in 1942"},
           {"wrong": "boats", "right": ["caravels", "carracks"]}]}

{"type": "whoami", "answer": "Marie Curie", "accept": ["Curie"],
 "clues": ["I was born in Warsaw.", "I won two Nobel prizes, in different sciences.", "I studied radioactivity."]}
```

- `classify.mode`: `sort` (into the groups), `odd` (odd one out) or `venn`. An item in two groups is the same string
  in both.
- `errors.text` holds `{n}` where the n-th mark goes.
- Strings are plain text: no HTML. Whoever shows them escapes them.

## From a glossary of the course

When the board takes an exercise from a glossary: in Who am I?, the concept is the answer and its definition the
clue; in Sort, the glossary's categories are the groups.
