// Telltale — a spot-the-difference mystery. Bootstrap: build the game,
// start the loop, then apply any screenshot staging from the URL.

import { Game } from './game.js';
import { applyShotParams } from './shots.js';

const game = new Game(document);
game.boot();
applyShotParams(game, window.location.search);
