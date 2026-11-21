// Screenshot staging: URL parameters set up a real game state so the
// screenshots are true renders of the game's own code, mid-play.
//   ?shot=menu                                  the title screen
//   ?shot=play&level=1&found=0,1,2,3&time=87     mid-game, four found
//   ?shot=hint&level=0&found=0,1,2,3,4           mid-game with a hint ring
//   ?shot=complete&level=0&stars=3              the level-clear screen
//   ?shot=gameover&level=2                      the time-up screen
// The timer is frozen while staging so the frame is stable.

export function applyShotParams(game, search) {
  const p = new URLSearchParams(search);
  const shot = p.get('shot');
  if (!shot) return false;
  game.staging = true;

  if (shot === 'menu') {
    game.showScreen('menu');
    return true;
  }

  const level = Math.min(2, Math.max(0, parseInt(p.get('level') ?? '0', 10) || 0));
  game.startLevel(level);

  if (shot === 'play' || shot === 'hint' || shot === 'found') {
    const found = (p.get('found') ?? '')
      .split(',')
      .filter((s) => s !== '')
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isInteger(n));
    game.stageFound(found);
    const time = parseInt(p.get('time') ?? '', 10);
    if (Number.isInteger(time)) game.stageTime(time);
    const score = parseInt(p.get('score') ?? '', 10);
    if (Number.isInteger(score)) game.stageScore(score);
    if (shot === 'hint') game.stageHint();
    return true;
  }

  if (shot === 'complete') {
    const stars = Math.min(3, Math.max(1, parseInt(p.get('stars') ?? '3', 10) || 3));
    const all = game.state.level.scene.differences.map((_, i) => i);
    game.stageFound(all);
    game.stageComplete(stars);
    return true;
  }

  if (shot === 'gameover') {
    game.stageGameOver();
    return true;
  }

  return false;
}
