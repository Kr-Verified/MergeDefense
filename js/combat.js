function damageTower(tower, amount) {
  if (!tower || !board.contains(tower)) return;

  const maxHp = parseInt(tower.dataset.maxHp || `${getTowerMaxHp(tower)}`);
  const hp = Math.max(0, parseInt(tower.dataset.hp || `${maxHp}`) - Math.floor(amount));
  tower.dataset.hp = `${hp}`;
  renderTowerHpBar(tower);
  if (tower === selectedTower) refreshUpgradeModal();
  window.TeamSession?.reportTowerHealth?.(tower);
  reportTeamSharedState();

  if (hp <= 0) destroyTower(tower);
}

function stunTower(tower, durationMs) {
  if (!tower || !board.contains(tower)) return;

  const stunUntil = Date.now() + durationMs;
  if (stunUntil > parseInt(tower.dataset.stunUntil || '0')) tower.dataset.stunUntil = `${stunUntil}`;
  tower.classList.add('stunned');
  window.TeamSession?.reportTowerStunned?.(tower);
  reportTeamSharedState();
}

function applyCriticalDamage(tower, damage) {
  if (Math.random() >= getCriticalChance(tower)) return Math.floor(damage);
  GameAudio.play('critical', { volume: 0.38, throttle: 80 });
  return Math.floor(damage * getCriticalDamageMultiplier(tower));
}

const activeBullets = [];
const bulletElementPool = [];
const MAX_VISIBLE_BULLETS = 150;
const MAX_ACTIVE_BULLETS = 1200;
const BULLET_SPEED_PX_PER_SECOND = 312.5;
let bulletAnimationFrame = null;
let lastBulletFrameTime = 0;
let visibleBulletCount = 0;

function acquireBulletElement() {
  const element = bulletElementPool.pop() || document.createElement('div');
  element.className = 'bullet';
  element.style.position = 'fixed';
  element.style.left = '0';
  element.style.top = '0';
  element.style.width = '10px';
  element.style.height = '10px';
  element.style.borderRadius = '50%';
  element.style.backgroundColor = 'black';
  element.style.pointerEvents = 'none';
  element.style.willChange = 'transform';
  document.body.appendChild(element);
  visibleBulletCount += 1;
  return element;
}

function releaseBulletElement(element) {
  if (!element) return;
  element.remove();
  visibleBulletCount = Math.max(0, visibleBulletCount - 1);
  if (bulletElementPool.length < MAX_VISIBLE_BULLETS) bulletElementPool.push(element);
}

function removeActiveBullet(index) {
  const bullet = activeBullets[index];
  releaseBulletElement(bullet.element);
  const lastBullet = activeBullets.pop();
  if (index < activeBullets.length) activeBullets[index] = lastBullet;
}

function animateBullets(frameTime) {
  bulletAnimationFrame = null;
  const deltaSeconds = lastBulletFrameTime
    ? Math.min(0.05, Math.max(0, (frameTime - lastBulletFrameTime) / 1000))
    : 0;
  lastBulletFrameTime = frameTime;

  if (!isGamePaused && gameSpeed > 0) {
    const targetPositions = new Map();
    for (let index = activeBullets.length - 1; index >= 0; index -= 1) {
      const bullet = activeBullets[index];
      if (!bullet.target?.element || !document.body.contains(bullet.target.element)) {
        removeActiveBullet(index);
        continue;
      }

      let target = targetPositions.get(bullet.target.element);
      if (!target) {
        const rect = bullet.target.element.getBoundingClientRect();
        target = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        targetPositions.set(bullet.target.element, target);
      }

      const dx = target.x - bullet.x;
      const dy = target.y - bullet.y;
      const distance = Math.hypot(dx, dy);
      const step = BULLET_SPEED_PX_PER_SECOND * deltaSeconds * gameSpeed;
      const outOfScreen = bullet.x < -20 || bullet.x > window.innerWidth + 20 || bullet.y < -20 || bullet.y > window.innerHeight + 20;

      if (distance <= Math.max(10, step) || outOfScreen) {
        const sourceTower = bullet.sourceTower;
        const targetEnemy = bullet.target;
        removeActiveBullet(index);
        if (!outOfScreen) applyTowerHit(sourceTower, targetEnemy);
        continue;
      }

      bullet.x += (dx / distance) * step;
      bullet.y += (dy / distance) * step;
      if (bullet.element) bullet.element.style.transform = `translate3d(${bullet.x - 5}px, ${bullet.y - 5}px, 0)`;
    }
  }

  if (activeBullets.length) {
    bulletAnimationFrame = requestAnimationFrame(animateBullets);
  } else {
    lastBulletFrameTime = 0;
  }
}

function fireBullet(fromTower, toEnemy) {
  if (!toEnemy || !document.body.contains(toEnemy.element)) return;
  if (activeBullets.length >= MAX_ACTIVE_BULLETS) {
    applyTowerHit(fromTower, toEnemy);
    return;
  }

  const towerRect = fromTower.getBoundingClientRect();
  const x = towerRect.left + towerRect.width / 2;
  const y = towerRect.top + towerRect.height / 2;
  const element = visibleBulletCount < MAX_VISIBLE_BULLETS
    ? acquireBulletElement()
    : null;
  if (element) element.style.transform = `translate3d(${x - 5}px, ${y - 5}px, 0)`;
  activeBullets.push({ sourceTower: fromTower, target: toEnemy, x, y, element });

  if (bulletAnimationFrame === null) bulletAnimationFrame = requestAnimationFrame(animateBullets);
}

function addTowerTime(tower, amount) {
  if (!tower || !document.body.contains(tower)) return;

  tower.dataset.time = `${parseInt(tower.dataset.time || '0') + amount}`;
  if (tower === selectedTower) refreshUpgradeModal();
  reportTeamSharedState();
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
  const modifiedDamage = damage * getEnemyDamageMultiplier(enemy, sourceTower, damageType);
  const appliedDamage = isFixedDamageEnemyLevel(enemy.lv) && modifiedDamage > 0
    ? getFixedEnemyHitDamage(sourceTower)
    : Math.max(0, Math.floor(modifiedDamage));
  if (appliedDamage <= 0) return 0;

  enemy.hp -= appliedDamage;
  enemy.element.innerHTML = getEnemyHtml(enemy);

  const isTeamActive = window.TeamSession && window.TeamSession.isActive();
  if (isTeamActive) window.TeamSession.reportEnemyHit(enemy.id, appliedDamage);

  if (enemy.hp <= 0) {
    applyEnemyDeathEffects(enemy, sourceTower, damageType);
    applyAttributeOnKillEffects(sourceTower, enemy);
    if (enemy.element._moveInterval) clearInterval(enemy.element._moveInterval);
    if (document.body.contains(enemy.element)) enemy.element.remove();
    addTowerTime(sourceTower, parseInt(enemy.element.dataset.lv || enemy.lv || '0'));
    const rewardMultiplierRoll = Math.random();
    let rewardMultiplier = 1;
    if (rewardMultiplierRoll < 0.02) rewardMultiplier = 20;
    else if (rewardMultiplierRoll < 0.22) rewardMultiplier = 3;
    const reward = parseInt(enemy.element.dataset.lv)*parseInt(enemy.element.dataset.lv)*rewardMultiplier;
    coins += reward;
    if (Math.random() < 0.3) spawnEquipment();
    refreshUpgradeUi();
    const idx = enemies.indexOf(enemy)
    if (idx!=-1) enemies.splice(idx, 1);
    if (isTeamActive) window.TeamSession.reportEnemyDeath(enemy.id, reward);
  }

  return appliedDamage;
}

function getFixedEnemyHitDamage(sourceTower) {
  if (!sourceTower?.dataset) return 1;
  const star = Math.max(1, Math.min(5, parseInt(sourceTower.dataset.star || '1', 10)));
  const largeTowerMultiplier = isLargeTowerLevel(sourceTower.dataset.lv) ? 2 : 1;
  return star * largeTowerMultiplier;
}

function applyRemoteEnemyHit(enemyId, amount) {
  const enemy = enemies.find(e => e.id === enemyId);
  if (!enemy || !document.body.contains(enemy.element)) return;

  enemy.hp = Math.max(0, Math.min(enemy.maxHp, enemy.hp - amount));
  enemy.element.innerHTML = getEnemyHtml(enemy);
}

function applyRemoteEnemyStatus(enemyId, status) {
  const enemy = enemies.find(item => item.id === enemyId);
  if (!enemy || !document.body.contains(enemy.element)) return null;
  const now = Date.now();
  const slowUntil = now + Math.max(0, Number(status.slowRemaining) || 0);
  const stopUntil = now + Math.max(0, Number(status.stopRemaining) || 0);
  const regenSuppressedUntil = now + Math.max(0, Number(status.regenSuppressRemaining) || 0);
  if (status.authoritative || slowUntil > parseInt(enemy.element.dataset.slowUntil || '0', 10)) {
    enemy.element.dataset.slowUntil = `${slowUntil}`;
  }
  if (status.authoritative || stopUntil > parseInt(enemy.element.dataset.stopUntil || '0', 10)) {
    enemy.element.dataset.stopUntil = `${stopUntil}`;
  }
  if (status.authoritative || regenSuppressedUntil > parseInt(enemy.element.dataset.regenSuppressedUntil || '0', 10)) {
    enemy.element.dataset.regenSuppressedUntil = `${regenSuppressedUntil}`;
  }
  if (Number.isFinite(Number(status.slowMult))) enemy.element.dataset.slowMult = `${status.slowMult}`;
  if (status.authoritative && Number.isFinite(Number(status.left)) && Number.isFinite(Number(status.top))) {
    setRemoteEnemyMotionTarget(enemy.element, Number(status.left), Number(status.top));
  }
  return enemy;
}

function reportEnemyStatus(enemy) {
  if (!window.TeamSession?.isActive() || !enemy?.element || !document.body.contains(enemy.element)) return;
  window.TeamSession.reportEnemyStatus(enemy);
}

function removeRemoteEnemy(enemyId) {
  const idx = enemies.findIndex(e => e.id === enemyId);
  if (idx === -1) return;

  const enemy = enemies[idx];
  if (enemy.element._moveInterval) clearInterval(enemy.element._moveInterval);
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
  const config = getAttributeEffectConfig(attribute);
  const baseDamage = getTowerDamage(fromTower);
  const attackDamage = applyCriticalDamage(fromTower, baseDamage);
  GameAudio.play('hit', { volume: 0.13, throttle: 65, rate: 0.94 + Math.random() * 0.12 });

  maybeTriggerUltimateBurst(fromTower);

  if (!config) {
    damageEnemy(targetEnemy, attackDamage, fromTower);
    return;
  }

  if (config.splash) {
    applyAttributeSplash(fromTower, targetEnemy, attackDamage, config);
    return;
  }

  const bonusMult = getAttributeBonusDamageMult(config, targetEnemy) * getStackingBonusMult(config, fromTower, targetEnemy);
  const dealtDamage = damageEnemy(targetEnemy, attackDamage * bonusMult, fromTower);
  applyAttributeOnHitEffects(fromTower, targetEnemy, dealtDamage, config, attackDamage, 1);
}

function promoteEnemyToThreeStar(enemy) {
  if (enemy.star >= 3 || !document.body.contains(enemy.element)) return;

  const oldMaxHp = getEnemyMaxHp(enemy.lv, enemy.star, enemy.attribute);
  const newMaxHp = getEnemyMaxHp(enemy.lv, 3, enemy.attribute);

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
    healAmount *= getEnemyLevelHealMultiplier(enemy.lv);
    if (Date.now() < parseInt(enemy.element.dataset.regenSuppressedUntil || '0', 10)) return;
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
