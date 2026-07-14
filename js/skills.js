function castBarrage() {
  [...enemies].forEach(enemy => damageEnemy(enemy, enemy.hp * 0.3, null, { type: 'skill' }));
}

function castFrostWave() {
  [...enemies].forEach(enemy => {
    if (!document.body.contains(enemy.element)) return;
    enemy.element.dataset.slowUntil = `${Date.now() + getEnemyControlDuration(enemy, 4000, 'slow')}`;
    enemy.element.dataset.slowMult = '0.5';
    reportEnemyStatus(enemy);
  });
}

function castSpawnSlow() {
  enemySpawnSlowUntil = Math.max(enemySpawnSlowUntil, Date.now() + ENEMY_SPAWN_SLOW_DURATION);
  resetGameIntervals();
  reportTeamSharedState();
}

function castGoldRush() {
  coins += Math.max(20, Math.floor(40 * Math.pow(spawnLv, 1.5)));
  refreshUpgradeUi();
}

function castFieldRepair() {
  recoverCastleHealthByAmount(maxHealth * 0.2);
  board.querySelectorAll('.tower').forEach(tower => {
    const maxHp = parseInt(tower.dataset.maxHp || `${getTowerMaxHp(tower)}`);
    const hp = Math.min(maxHp, parseInt(tower.dataset.hp || '0') + Math.floor(maxHp * 0.2));
    tower.dataset.hp = `${hp}`;
    renderTowerHpBar(tower);
  });
  if (selectedTower) refreshUpgradeModal();
  reportTeamSharedState();
}

const SKILLS = {
  barrage: { name: '포격', cooldown: 20000, cast: castBarrage },
  frost: { name: '빙결파', cooldown: 15000, cast: castFrostWave },
  goldRush: { name: '골드러시', cooldown: 25000, cast: castGoldRush },
  repair: { name: '응급 수리', cooldown: 30000, cast: castFieldRepair },
  spawnSlow: { name: '소환 지연', cooldown: 45000, cast: castSpawnSlow }
};
const skillLastUsed = { barrage: Date.now(), frost: Date.now(), goldRush: Date.now(), repair: Date.now(), spawnSlow: Date.now() };

function useSkill(key) {
  if (isSpectatorMode()) return;
  if (isGamePaused || isGameOver) return;

  const skill = SKILLS[key];
  if (!skill) return;

  const now = Date.now();
  const cooldown = skill.cooldown;
  if (now - skillLastUsed[key] < cooldown) return;

  skillLastUsed[key] = now;
  skill.cast();
  GameAudio.play(key, { volume: 0.7 });
  refreshSkillBar();
}

function refreshSkillBar() {
  if (gameSpeed === 0) {
    document.querySelectorAll('.skill-btn').forEach(button => {
      button.disabled = true;
      const cooldownText = button.querySelector('.skill-cooldown');
      const cooldownFill = button.querySelector('.skill-cooldown-fill');
      if (cooldownText) cooldownText.textContent = '정지';
      if (cooldownFill) cooldownFill.style.height = '100%';
    });
    return;
  }

  const now = Date.now();
  document.querySelectorAll('.skill-btn').forEach(button => {
    const key = button.dataset.skill;
    const skill = SKILLS[key];
    if (!skill) return;

    const cooldown = skill.cooldown;
    const remaining = Math.max(0, cooldown - (now - skillLastUsed[key]));
    const ready = remaining <= 0;

    button.disabled = !ready || isGamePaused || isGameOver;
    const cooldownText = button.querySelector('.skill-cooldown');
    const cooldownFill = button.querySelector('.skill-cooldown-fill');
    if (cooldownText) cooldownText.textContent = ready ? '준비' : `${Math.ceil(remaining / 1000)}s`;
    if (cooldownFill) cooldownFill.style.height = `${Math.min(100, (remaining / cooldown) * 100)}%`;
  });
}
