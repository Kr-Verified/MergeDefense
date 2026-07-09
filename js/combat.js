function damageTower(tower, amount) {
  if (!tower || !board.contains(tower)) return;

  const maxHp = parseInt(tower.dataset.maxHp || `${getTowerMaxHp(tower)}`);
  const hp = Math.max(0, parseInt(tower.dataset.hp || `${maxHp}`) - Math.floor(amount));
  tower.dataset.hp = `${hp}`;
  renderTowerHpBar(tower);
  if (tower === selectedTower) refreshUpgradeModal();

  if (hp <= 0) destroyTower(tower);
}

function stunTower(tower, durationMs) {
  if (!tower || !board.contains(tower)) return;

  const stunUntil = Date.now() + durationMs;
  if (stunUntil > parseInt(tower.dataset.stunUntil || '0')) tower.dataset.stunUntil = `${stunUntil}`;
  tower.classList.add('stunned');
}

function applyCriticalDamage(tower, damage) {
  if (Math.random() >= getCriticalChance(tower)) return Math.floor(damage);
  return Math.floor(damage * getCriticalDamageMultiplier(tower));
}

function fireBullet(fromTower, toEnemy) {
  if (!toEnemy || !document.body.contains(toEnemy.element)) return;

  const bullet = document.createElement('div');
  bullet.className = 'bullet';
  bullet.style.position = 'absolute';
  bullet.style.width = '10px';
  bullet.style.height = '10px';
  bullet.style.borderRadius = '50%';
  bullet.style.backgroundColor = 'black';
  bullet.style.zIndex = '-1';

  // 타워 중심 위치
  const towerRect = fromTower.getBoundingClientRect();

  bullet.style.left = `${towerRect.left + towerRect.width / 2}px`;
  bullet.style.top = `${towerRect.top + towerRect.height / 2}px`;

  document.body.appendChild(bullet);

  const interval = setInterval(() => {
    if (isGamePaused) return;
    if (!document.body.contains(toEnemy.element)) {
      clearInterval(interval);
      bullet.remove();
      return;
    }

    const bulletX = bullet.offsetLeft;
    const bulletY = bullet.offsetTop;
    const targetX = toEnemy.element.offsetLeft + 40;
    const targetY = toEnemy.element.offsetTop + 40;

    const dx = targetX - bulletX;
    const dy = targetY - bulletY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const outOfScreen = bulletX < 0 || bulletX > window.innerWidth || bulletY < 0 || bulletY > window.innerHeight;

    if (dist < 10 || outOfScreen) {
      clearInterval(interval);
      bullet.remove();

      applyTowerHit(fromTower, toEnemy);
      return;
    }

    const speed = 5;
    const vx = (dx / dist) * speed * gameSpeed;
    const vy = (dy / dist) * speed * gameSpeed;

    bullet.style.left = `${bulletX + vx}px`;
    bullet.style.top = `${bulletY + vy}px`;
  }, 16);
}

function addTowerTime(tower, amount) {
  if (!tower || !document.body.contains(tower)) return;

  tower.dataset.time = `${parseInt(tower.dataset.time || '0') + amount}`;
  if (tower === selectedTower) refreshUpgradeModal();
}

function isTowerAttribute(attribute, ...attributes) {
  return attributes.includes(attribute);
}

function getEnemyControlDuration(enemy, durationMs, controlType) {
  const attribute = enemy?.attribute || 'none';
  let multiplier = 1;

  if (enemy.lv % 5 === 0) multiplier *= 0.5;
  if (attribute === 'golem' && controlType !== 'fire') multiplier *= 0.55;
  if (attribute === 'ice' && (controlType === 'slow' || controlType === 'stop' || controlType === 'stun')) multiplier *= 0.4;
  if (attribute === 'magicResist' && (controlType === 'slow' || controlType === 'stop')) multiplier *= 0.7;

  return durationMs * multiplier;
}

function getEnemyDamageMultiplier(enemy, sourceTower, damageType) {
  const enemyAttribute = enemy.attribute || 'none';
  const towerAttribute = sourceTower?.dataset?.attribute || 'none';
  let multiplier = 1;

  if (enemyAttribute === 'air') {
    if (isTowerAttribute(towerAttribute, 'none', 'power')) multiplier *= 0.35;
    if (isTowerAttribute(towerAttribute, 'ball', 'fire', 'water', 'bomb', 'wall', 'blood')) multiplier *= 1.45;
  }

  if (enemyAttribute === 'ghost') {
    if (towerAttribute === 'wall') multiplier *= 1.55;
    else if (damageType === 'attack' && Math.random() < 0.35) return 0;
  }

  if (enemyAttribute === 'golem' && isTowerAttribute(towerAttribute, 'power', 'bomb')) multiplier *= 1.5;
  if (enemyAttribute === 'lightning' && isTowerAttribute(towerAttribute, 'water', 'wall')) multiplier *= 1.5;
  if (enemyAttribute === 'ice' && towerAttribute === 'fire') multiplier *= 1.6;

  if (enemyAttribute === 'flame') {
    if (damageType === 'dot') multiplier *= 0.3;
    if (towerAttribute === 'water') multiplier *= 1.6;
  }

  if (enemyAttribute === 'regen' && (towerAttribute === 'fire' || towerAttribute === 'bomb' || damageType === 'dot')) multiplier *= 1.45;

  if (enemyAttribute === 'shield') {
    const enemyRect = enemy.element.getBoundingClientRect();
    const towerRect = sourceTower?.getBoundingClientRect?.();
    const isFrontHit = towerRect ? (towerRect.left + towerRect.width / 2) < (enemyRect.left + enemyRect.width / 2) : true;
    if (damageType !== 'bomb' && isFrontHit) multiplier *= 0.6;
    if (damageType === 'bomb' || !isFrontHit) multiplier *= 1.35;
  }

  if (enemyAttribute === 'split' && damageType === 'bomb') multiplier *= 1.45;
  if (enemyAttribute === 'vampire' && isTowerAttribute(towerAttribute, 'power', 'bomb')) multiplier *= 1.4;

  if (enemyAttribute === 'magicResist') {
    if (isTowerAttribute(towerAttribute, 'fire', 'water', 'blood')) multiplier *= 0.65;
    if (isTowerAttribute(towerAttribute, 'power', 'ball')) multiplier *= 1.4;
  }

  if (enemyAttribute === 'heavyArmor') {
    if (damageType === 'attack' && !isTowerAttribute(towerAttribute, 'bomb')) multiplier *= 0.65;
    if (damageType === 'bomb' || damageType === 'dot') multiplier *= 1.4;
  }

  return multiplier;
}

function applyEnemyDeathEffects(enemy, sourceTower, damageType) {
  if (enemy.attribute !== 'split') return;
  if (damageType === 'bomb') return;
  if (window.TeamSession && window.TeamSession.isActive() && !window.TeamSession.isHost) return;

  const childLevel = Math.max(1, Math.floor(enemy.lv * 0.6));
  const enemyRect = enemy.element.getBoundingClientRect();
  for (let i = 0; i < 2; i += 1) {
    const child = spawnEnemy(undefined, childLevel, 'none', 1);
    if (!child || !child.element) continue;
    child.maxHp = Math.max(1, Math.floor(enemy.maxHp * 0.22));
    child.hp = child.maxHp;
    child.castleDamage = Math.max(1, Math.floor(enemy.castleDamage * 0.35));
    child.element.dataset.maxHp = child.maxHp;
    child.element.dataset.castleDamage = child.castleDamage;
    child.element.style.left = `${enemyRect.left + i * 28}px`;
    child.element.style.top = `${Math.max(0, enemyRect.top + (i === 0 ? -24 : 24))}px`;
    child.element.innerHTML = getEnemyHtml(child);
  }
}

function damageEnemy(enemy, damage, sourceTower = null, options = {}) {
  if (!enemy || !document.body.contains(enemy.element)) return 0;

  const damageType = options.type || 'attack';
  const appliedDamage = Math.max(0, Math.floor(damage * getEnemyDamageMultiplier(enemy, sourceTower, damageType)));
  if (appliedDamage <= 0) return 0;

  enemy.hp -= appliedDamage;
  enemy.element.innerHTML = getEnemyHtml(enemy);

  const isTeamActive = window.TeamSession && window.TeamSession.isActive();
  if (isTeamActive) window.TeamSession.reportEnemyHit(enemy.id, appliedDamage);

  if (enemy.hp <= 0) {
    applyEnemyDeathEffects(enemy, sourceTower, damageType);
    if (document.body.contains(enemy.element)) enemy.element.remove();
    addTowerTime(sourceTower, parseInt(enemy.element.dataset.lv || enemy.lv || '0'));
    const rewardMultiplierRoll = Math.random();
    let rewardMultiplier = 1;
    if (rewardMultiplierRoll < 0.02) rewardMultiplier = 20;
    else if (rewardMultiplierRoll < 0.22) rewardMultiplier = 3;
    coins += parseInt(enemy.element.dataset.lv)*parseInt(enemy.element.dataset.lv)*rewardMultiplier;
    if (Math.random() < 0.3) spawnEquipment();
    refreshUpgradeUi();
    const idx = enemies.indexOf(enemy)
    if (idx!=-1) enemies.splice(idx, 1);
    if (isTeamActive) window.TeamSession.reportEnemyDeath(enemy.id);
  }

  return appliedDamage;
}

function applyRemoteEnemyHit(enemyId, amount) {
  const enemy = enemies.find(e => e.id === enemyId);
  if (!enemy || !document.body.contains(enemy.element)) return;

  enemy.hp = Math.max(0, Math.min(enemy.maxHp, enemy.hp - amount));
  enemy.element.innerHTML = getEnemyHtml(enemy);
}

function removeRemoteEnemy(enemyId) {
  const idx = enemies.findIndex(e => e.id === enemyId);
  if (idx === -1) return;

  const enemy = enemies[idx];
  if (document.body.contains(enemy.element)) enemy.element.remove();
  enemies.splice(idx, 1);
}

function applyRemoteCastleHit(amount) {
  if (isGameOver) return;

  health = Math.max(0, Math.min(maxHealth, health - amount));
  updateHealthText();
  if (health <= 0) endGame();
}

function applyTowerHit(fromTower, targetEnemy) {
  const attribute = fromTower.dataset.attribute || 'none';
  const baseDamage = getTowerDamage(fromTower);
  const attackDamage = applyCriticalDamage(fromTower, baseDamage);

  if (attribute === 'bomb') {
    applyBombDamage(targetEnemy, attackDamage * 0.7, fromTower);
    return;
  }

  const dealtDamage = damageEnemy(targetEnemy, attackDamage, fromTower);

  if (attribute === 'blood') {
    recoverCastleHealthByAmount(dealtDamage * 0.1);
  }

  if (attribute === 'water' && document.body.contains(targetEnemy.element)) {
    targetEnemy.element.dataset.slowUntil = `${Date.now() + getEnemyControlDuration(targetEnemy, 3000, 'slow')}`;
  }

  if (attribute === 'wall' && document.body.contains(targetEnemy.element)) {
    targetEnemy.element.dataset.stopUntil = `${Date.now() + getEnemyControlDuration(targetEnemy, 3000, 'stop')}`;
  }

  if (attribute === 'fire' && document.body.contains(targetEnemy.element)) {
    applyFireDamage(targetEnemy, attackDamage, fromTower);
  }

  if (attribute === 'ball' && document.body.contains(targetEnemy.element)) {
    promoteEnemyToThreeStar(targetEnemy);
  }
}

function promoteEnemyToThreeStar(enemy) {
  if (enemy.star >= 3 || !document.body.contains(enemy.element)) return;
  if (Math.random() >= 0.1) return;

  const attributeHpMultiplier = getEnemyAttributeMaxHpMultiplier(enemy.attribute);
  const oldMaxHp = getBaseEnemyHp(enemy.lv) * getEnemyStarHealthMultiplier(enemy.star) * attributeHpMultiplier;
  const newMaxHp = getBaseEnemyHp(enemy.lv) * getEnemyStarHealthMultiplier(3) * attributeHpMultiplier;

  enemy.star = 3;
  enemy.hp += newMaxHp - oldMaxHp;
  enemy.maxHp = newMaxHp;
  enemy.castleDamage = getEnemyCastleDamage(enemy.lv, 3);
  enemy.element.classList.remove('star-1', 'star-2', 'star-4');
  enemy.element.classList.add('star-3');
  enemy.element.dataset.star = '3';
  enemy.element.dataset.maxHp = enemy.maxHp;
  enemy.element.dataset.castleDamage = enemy.castleDamage;
  enemy.element.innerHTML = getEnemyHtml(enemy);
}

function applyFireDamage(enemy, baseDamage, fromTower) {
  let ticks = 0;
  const fireInterval = setInterval(() => {
    if (isGamePaused) return;

    if (!document.body.contains(enemy.element)) {
      clearInterval(fireInterval);
      return;
    }

    ticks += 1;
    damageEnemy(enemy, baseDamage * 0.25, fromTower, { type: 'dot' });

    if (ticks >= 3) clearInterval(fireInterval);
  }, 1000 / gameSpeed);
}

function applyBombDamage(targetEnemy, damage, fromTower) {
  const targetRect = targetEnemy.element.getBoundingClientRect();
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const bombRange = getBombRange(fromTower);

  [...enemies].forEach(enemy => {
    if (!document.body.contains(enemy.element)) return;

    const enemyRect = enemy.element.getBoundingClientRect();
    const enemyX = enemyRect.left + enemyRect.width / 2;
    const enemyY = enemyRect.top + enemyRect.height / 2;
    const dx = targetX - enemyX;
    const dy = targetY - enemyY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= bombRange) damageEnemy(enemy, damage, fromTower, { type: 'bomb' });
  });
}

function getTowerTarget(tower, towerRect, towerRange) {
  const priority = tower.dataset.targetPriority || DEFAULT_TARGET_PRIORITY;
  let targetEnemy = null;
  let bestDistance = Infinity;
  let bestHp = priority === 'highestHp' ? -Infinity : Infinity;

  enemies.forEach(enemy => {
    if (!document.body.contains(enemy.element)) return;

    const enemyRect = enemy.element.getBoundingClientRect();
    const dx = (enemyRect.left + 40) - (towerRect.left + 40);
    const dy = (enemyRect.top + 40) - (towerRect.top + 40);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist >= towerRange) return;

    if (priority === 'highestHp') {
      if (enemy.hp > bestHp || (enemy.hp === bestHp && dist < bestDistance)) {
        targetEnemy = enemy;
        bestHp = enemy.hp;
        bestDistance = dist;
      }
      return;
    }

    if (priority === 'lowestHp') {
      if (enemy.hp < bestHp || (enemy.hp === bestHp && dist < bestDistance)) {
        targetEnemy = enemy;
        bestHp = enemy.hp;
        bestDistance = dist;
      }
      return;
    }

    if (dist < bestDistance) {
      targetEnemy = enemy;
      bestDistance = dist;
    }
  });

  return targetEnemy;
}

function towerAttackLoop() {
  if (isGamePaused) return;

  const towers = document.querySelectorAll('.tower');
  const now = Date.now();
  towers.forEach(tower => {
    if (!board.contains(tower)) return;

    if (now < parseInt(tower.dataset.stunUntil || '0')) {
      tower.classList.add('stunned');
      return;
    }
    tower.classList.remove('stunned');

    const lastAttack = parseInt(tower.dataset.lastAttack || '0');
    if (now - lastAttack < getTowerAttackInterval(tower)) return;

    const towerRect = tower.getBoundingClientRect();
    const towerRange = getTowerRange(tower);
    const targetEnemy = getTowerTarget(tower, towerRect, towerRange);

    if (targetEnemy) {
      tower.dataset.lastAttack = `${now}`;
      fireBullet(tower, targetEnemy);
    }
  });
}

function towerTimeLoop() {
  if (isGamePaused) return;

  board.querySelectorAll('.tower').forEach(tower => {
    addTowerTime(tower, 1);
  });
}

function bossRecoverLoop() {
  if (isGamePaused) return;

  enemies.forEach(enemy => {
    if (!document.body.contains(enemy.element)) return;

    let healAmount = 0;
    if (enemy.lv%5==0) healAmount += enemy.maxHp * 0.01;
    if (enemy.attribute === 'regen') healAmount += enemy.maxHp * 0.006;
    if (healAmount <= 0) return;

    enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
    enemy.element.innerHTML = getEnemyHtml(enemy);
    if (window.TeamSession && window.TeamSession.isActive()) window.TeamSession.reportEnemyHit(enemy.id, -healAmount);
  });
}

function getNearestTowerInRange(x, y, range) {
  let nearestTower = null;
  let nearestDistance = Infinity;

  board.querySelectorAll('.tower').forEach(tower => {
    const rect = tower.getBoundingClientRect();
    const dx = (rect.left + rect.width / 2) - x;
    const dy = (rect.top + rect.height / 2) - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < range && dist < nearestDistance) {
      nearestTower = tower;
      nearestDistance = dist;
    }
  });

  return nearestTower;
}

function enemyTowerCombatLoop() {
  if (isGamePaused) return;

  const now = Date.now();

  enemies.forEach(enemy => {
    if (!document.body.contains(enemy.element)) return;

    const isBoss = enemy.lv % 5 === 0;
    const rect = enemy.element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (isBoss) {
      const lastAoe = parseInt(enemy.element.dataset.lastBossAoe || '0');
      if (now - lastAoe < BOSS_AOE_INTERVAL / gameSpeed) return;

      const towersInRange = [...board.querySelectorAll('.tower')].filter(tower => {
        const towerRect = tower.getBoundingClientRect();
        const dx = (towerRect.left + towerRect.width / 2) - x;
        const dy = (towerRect.top + towerRect.height / 2) - y;
        return Math.sqrt(dx * dx + dy * dy) < BOSS_AOE_RANGE;
      });

      if (towersInRange.length === 0) return;

      enemy.element.dataset.lastBossAoe = `${now}`;
      towersInRange.forEach(tower => {
        damageTower(tower, enemy.castleDamage);
        stunTower(tower, BOSS_AOE_STUN_DURATION / gameSpeed);
      });
      return;
    }

    if (enemy.lv % 3 !== 0) {
      enemy.element.dataset.engaged = '0';
      return;
    }

    const targetTower = getNearestTowerInRange(x, y, TOWER_MELEE_RANGE);
    if (!targetTower) {
      enemy.element.dataset.engaged = '0';
      return;
    }

    enemy.element.dataset.engaged = '1';
    const lastTowerAttack = parseInt(enemy.element.dataset.lastTowerAttack || '0');
    if (now - lastTowerAttack < ENEMY_TOWER_ATTACK_INTERVAL / gameSpeed) return;

    enemy.element.dataset.lastTowerAttack = `${now}`;
    damageTower(targetTower, enemy.castleDamage);
  });
}
