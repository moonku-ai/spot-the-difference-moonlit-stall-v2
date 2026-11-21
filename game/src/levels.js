// The three levels: rising difficulty, one scene each.

import * as bookshop from './scenes/bookshop.js';
import * as harbor from './scenes/harbor.js';
import * as garden from './scenes/garden.js';

export const LEVELS = [
  {
    id: 'bookshop',
    name: 'The Old Bookshop',
    subtitle: 'Six quiet changes among the shelves',
    scene: bookshop,
    timeLimit: 180,
    hints: 3,
  },
  {
    id: 'harbor',
    name: 'Harbor at Dawn',
    subtitle: 'Eight changes as the boats wake up',
    scene: harbor,
    timeLimit: 150,
    hints: 3,
  },
  {
    id: 'garden',
    name: 'The Night Garden',
    subtitle: 'Ten changes under the moon',
    scene: garden,
    timeLimit: 120,
    hints: 3,
  },
];

export function levelById(id) {
  return LEVELS.find((l) => l.id === id) ?? null;
}
