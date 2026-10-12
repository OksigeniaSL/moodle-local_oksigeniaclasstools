# Printed cards: the mark and how it is read

The printed cards of Class tools («Live» › «Hands up or cards» › «Print cards», the card that is turned) carry a mark
of our own, published here so that anyone can print, read or improve it. It is part of this plugin and under its
licence (GNU GPL v3 or later). The code that draws and reads it is `app/scanner.js`.

## The card

- A square of 135 mm. Four bands of 20 mm, one per side, in the colour of each answer on the board, with its letter
  upright when that side is on top: A on top (red), B on the right (blue), C at the bottom (yellow), D on the left
  (green). The name of the student and the number of the card go in a corner of the A band.
- In the middle, a white square of 95 mm with the mark, which takes 6 of its 8 cells (11.875 mm each): the white cell
  around it is its margin, which the reading needs.

## The mark

- 6 × 6 cells. The outer ring of cells is black. The 4 × 4 cells inside say which card it is: black is 1, white is 0.
- Bit `r × 4 + c` (from 0) is the cell of row `r` and column `c` inside the border, counted from the top left with the
  card as printed (A on top). The code of card *n* is entry *n* of the table below.
- The 60 codes were chosen so that any two of them, in any of their four quarter turns, differ in at least 4 cells,
  and so do the four turns of each one. A reading one cell away from a code is that card; anything else is not a
  card. The search: every 16-bit word with 5 to 11 black cells, in a fixed shuffled order, taken when it keeps that
  distance with every turn of the ones already taken.

## The answer

The turn of the mark in the picture is the answer: as printed, **A**; a quarter turn clockwise, **D**; half a turn,
**C**; a quarter turn anticlockwise, **B**. That is, the side of the card that is on top.

## Reading

1. Grey levels (0.30 R + 0.59 G + 0.11 B).
2. A pixel is dark if it is below 85 % of the mean of a window around it (a 40th of the shorter side of the picture),
   or below 45 % of the mean of the whole picture.
3. The dark patches (4-connected), and the outline of each one: the first and last dark pixel of each row and column.
4. The convex hull of the outline and four corners: the point farthest from the middle, the one farthest from it,
   and the farthest from the diagonal between them on each side. Each side is then fitted with a straight line, away
   from the corners, and the corners are where the lines meet.
5. Through the perspective of those corners, the grey of each of the 6 × 6 cells (nine points near its middle) and of
   the margin half a cell outside the border. The border must be dark and the margin light (no more than two cells
   wrong in each), with a difference of 40 grey levels at least.
6. The 16 cells inside, black or white by the middle grey between border and margin, compared with every code in its
   four turns.

## The codes

The cells as four rows of four, from the top, 1 for black.

| Card | Code | Cells |
| --- | --- | --- |
| 1 | 38450 | `0100/1100/0110/1001` |
| 2 | 65217 | `1000/0011/0111/1111` |
| 3 | 10134 | `0110/1001/1110/0100` |
| 4 | 18845 | `1011/1001/1001/0010` |
| 5 | 11673 | `1001/1001/1011/0100` |
| 6 | 8669 | `1011/1011/1000/0100` |
| 7 | 8566 | `0110/1110/1000/0100` |
| 8 | 20266 | `0101/0100/1111/0010` |
| 9 | 59372 | `0011/0111/1110/0111` |
| 10 | 24004 | `0010/0011/1011/1010` |
| 11 | 6730 | `0101/0010/0101/1000` |
| 12 | 34104 | `0001/1100/1010/0001` |
| 13 | 43726 | `0111/0011/0101/0101` |
| 14 | 57713 | `1000/1110/1000/0111` |
| 15 | 40301 | `1011/0110/1011/1001` |
| 16 | 9467 | `1101/1111/0010/0100` |
| 17 | 25620 | `0010/1000/0010/0110` |
| 18 | 55857 | `1000/1100/0101/1011` |
| 19 | 62409 | `1001/0011/1100/1111` |
| 20 | 44215 | `1110/1101/0011/0101` |
| 21 | 36704 | `0000/0110/1111/0001` |
| 22 | 61877 | `1010/1101/1000/1111` |
| 23 | 33174 | `0110/1001/1000/0001` |
| 24 | 45256 | `0001/0011/0000/1101` |
| 25 | 60518 | `0110/0110/0011/0111` |
| 26 | 15480 | `0001/1110/0011/1100` |
| 27 | 47243 | `1101/0001/0001/1101` |
| 28 | 35295 | `1111/1011/1001/0001` |
| 29 | 2605 | `1011/0100/0101/0000` |
| 30 | 53146 | `0101/1001/1111/0011` |
| 31 | 50322 | `0100/1001/0010/0011` |
| 32 | 28505 | `1001/1010/1111/0110` |
| 33 | 52728 | `0001/1111/1011/0011` |
| 34 | 49972 | `0010/1100/1100/0011` |
| 35 | 63693 | `1011/0011/0001/1111` |
| 36 | 11209 | `1001/0011/1101/0100` |
| 37 | 30059 | `1101/0110/1010/1110` |
| 38 | 31354 | `0101/1110/0101/1110` |
| 39 | 37761 | `1000/0001/1100/1001` |
| 40 | 54791 | `1110/0000/0110/1011` |
| 41 | 40854 | `0110/1001/1111/1001` |
| 42 | 4747 | `1101/0001/0100/1000` |
| 43 | 48449 | `1000/0010/1011/1101` |
| 44 | 33109 | `1010/1010/1000/0001` |
| 45 | 15790 | `0111/0101/1011/1100` |
| 46 | 51548 | `0011/1010/1001/0011` |
| 47 | 43507 | `1100/1111/1001/0101` |
| 48 | 45447 | `1110/0001/1000/1101` |
| 49 | 15657 | `1001/0100/1011/1100` |
| 50 | 12569 | `1001/1000/1000/1100` |
| 51 | 22280 | `0001/0000/1110/1010` |
| 52 | 4464 | `0000/1110/1000/1000` |
| 53 | 54391 | `1110/1110/0010/1011` |
| 54 | 35819 | `1101/0111/1101/0001` |
| 55 | 22590 | `0111/1100/0001/1010` |
| 56 | 53664 | `0000/0101/1000/1011` |
| 57 | 46287 | `1111/0011/0010/1101` |
| 58 | 9001 | `1001/0100/1100/0100` |
| 59 | 60873 | `1001/0011/1011/0111` |
| 60 | 22841 | `1001/1100/1001/1010` |
