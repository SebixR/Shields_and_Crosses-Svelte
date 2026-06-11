# A fantasy spin on Tic-Tac-Toe
Available at [Shields and Crosses](https://shields-and-crosses.pages.dev/)

Built with Svelte.
## Rules
This is a variant of Tic-Tac-Toe that introduces characters with classes and statistics.
You create the characters yourself and then pick one for yourself and one for the CPU (playing against other players is not an option).
The characters then engade in a duel.

The rules might seem complicated, but simply playing a couple times should make everytihing clear.
### Characters
Each class has one associated primary statistic:
**Warrior** - Strength
**Rogue** - Speed
**Mage** - Intelligence

Characters play a game of Tic-Tac-Toe where each column and each row is randomly assigned one of the three statistic.
### Gameplay
The match itself plays exactly like normal Tic-Tac-Toe with the only exception being the ability to swap.
### Board statistics
As characters place symbols on the board, their statistics are increased based on the statistics assigned to the rows and columns of said board.
For example: when a character places a symbol in the \[str x spd] field, their Strenght and Speed are both increased by 1.

When the row and column statistics are the same (\[str x str], \[spd x spd] and \[int x int] fields) and the statistic in question is the same as the character's primary statistic, they receive 3 points, instead of 2.
For example: a Rogue will receive +3 Speed by placing their symbol on the \[spd x spd] field, while a Warrior or Mage only get +2 Speed.

Thus the character's statistics change throughout the game.
### Swapping
Once per game, if a character's primary statistic is higher than the that same statistic belonging to the opponent, while the remainnig two are lower, they are allowed to prevent the opponent from winning the match by overwriting one of their symbols.

You cannot overwrite a symbol if it would result in your victory.

Example:
Robin Hood (X) is a Rogue, so his primary statistic is Speed, while Gandalf (O) is a mage, his primary statistic being Intelligence.
Robin's Speed is higher than Gandalf's Speed, while his Strength and Intelligence are lower. Gandalf is also one move away from victory.
Thus, Robin is allowed to overwrite one of Gandalf's symbols, specifically the one in the top-right corner.

<img width="600" alt="swapping_example" src="https://github.com/user-attachments/assets/c78b45fa-ddf7-4f87-9af0-5bb11a5dea02" />

The O in the middle cannot be overwritten by Robin, because then he'd win the match.
### Bonus points & deciding the winner
Once the Tic-Tac-Toe match concludes, bonus points are added to the characters' statistics.

- **General win**: the character who won in Tic-Tac-Toe reveives +2 points.
- **Double advantage**: if a character has double the points in their primary static (or the opponent has 0), they receive +2 points. If this is true for both characters, then the one who won the match receives the points first. If there was no winner, the order is random.
- **Stat synergy**: winning via a row/column corresponding to the character's primary statistics grants +1 point.

Bonus points are always added to the statistic that needs them most.
Examples:
- if a character's Speed is equal to the opponent's, the bonus points will be added to Speed.
- if a character's Strenght is lower the the opponent's, while both of the other statistics are higher, the bonus points will be added to Strength.
### Deciding the winner
The winner is decided by comparing the characters' final statistics.
If two or more of a character's statistics are higher than the opponent's - they win the game.

Just like in normal Tic-Tac-Toe the possibilty of a draw is still there, but it's much less probable.
