function getRandomEnemyStar() {
  const random = Math.random();
  if (random < 0.001) return 4;
  if (random < 0.011) return 3;
  if (random < 0.101) return 2;
  return 1;
}

function getEnemyStarDamageMultiplier(star) {
  if (star === 4) return 8;
  if (star === 3) return 4;
  if (star === 2) return 2;
  return 1;
}

function getEnemyStarHealthMultiplier(star) {
  return getEnemyStarDamageMultiplier(star);
}

function isEmpoweredEnemyLevel(lv) {
  return parseInt(lv, 10) % 11 === 0;
}

function isFixedDamageEnemyLevel(lv) {
  return parseInt(lv, 10) % 17 === 0;
}

function getEnemyLevelHealthMultiplier(lv) {
  const level = parseInt(lv, 10);
  let highLevelMultiplier = 1;
  if (level >= 150) highLevelMultiplier = 128;
  else if (level >= 100) highLevelMultiplier = 32;
  else if (level >= 75) highLevelMultiplier = 8;
  else if (level >= 50) highLevelMultiplier = 4;
  else if (level >= 25) highLevelMultiplier = 2;
  return highLevelMultiplier * (isEmpoweredEnemyLevel(level) ? 0.5 : 1);
}

function getEnemyLevelDamageMultiplier(lv) {
  return isEmpoweredEnemyLevel(lv) ? 2 : 1;
}

function getEnemyLevelHealMultiplier(lv) {
  return isEmpoweredEnemyLevel(lv) ? 4 : 1;
}

function getEnemyCastleDamage(lv, star) {
  const bossMultiplier = lv%5==0 ? 10 : 1;
  return lv * getEnemyStarDamageMultiplier(star) * bossMultiplier * getEnemyLevelDamageMultiplier(lv);
}

function getEnemyAttributeText(attribute) {
  const names = {
    air: '공중',
    ghost: '고스트',
    golem: '골렘',
    lightning: '번개',
    ice: '얼음',
    flame: '화염',
    regen: '재생',
    shield: '방패',
    split: '분열',
    berserk: '광폭',
    vampire: '흡혈',
    magicResist: '마법저항',
    heavyArmor: '중갑',
    assassin: '암살자',
    boss: '보스',
    none: ''
  };
  return names[attribute] || '';
}

function getRandomFromList(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomEnemyAttribute() {
  const roll = Math.random();

  if (survivedSeconds < 30) return 'none';
  if (survivedSeconds < 100) return roll < 0.8 ? 'none' : getRandomFromList(EARLY_ENEMY_ATTRIBUTES);
  if (survivedSeconds < 600) return roll < 0.6 ? 'none' : getRandomFromList(MID_ENEMY_ATTRIBUTES);
  return roll < 0.05 ? 'none' : getRandomFromList(ALL_ENEMY_ATTRIBUTES);
}

function getEnemyAttributeMaxHpMultiplier(attribute) {
  if (attribute === 'golem') return 1.8;
  if (attribute === 'assassin') return 0.55;
  if (attribute === 'heavyArmor') return 1.25;
  return 1;
}

function getEnemyAttributeCastleDamageMultiplier(attribute) {
  if (attribute === 'vampire') return 1.5;
  if (attribute === 'assassin') return 1.2;
  return 1;
}

function createEnemy(lv, star = getRandomEnemyStar(), attribute = getRandomEnemyAttribute()) {
  const hp = getEnemyMaxHp(lv, star, attribute);
  return {
    id: enemyId++,
    lv: lv,
    star: star,
    attribute: attribute,
    hp: hp,
    maxHp: hp,
    castleDamage: Math.ceil(getEnemyCastleDamage(lv, star) * getEnemyAttributeCastleDamageMultiplier(attribute)),
    element: null
  }
}

function getEnemyMaxHp(lv, star, attribute) {
  const level = Math.max(1, parseInt(lv, 10));
  let baseHp = getBaseEnemyHp(level);
  if (isFixedDamageEnemyLevel(level)) {
    baseHp = level;
    if (level % 5 === 0) baseHp *= level * 2;
  }
  return baseHp *
    getEnemyStarHealthMultiplier(star) *
    getEnemyAttributeMaxHpMultiplier(attribute) *
    getEnemyLevelHealthMultiplier(level);
}

function getBaseEnemyHp(lv) {
  let hp = lv*lv*100;
  if (lv%5==0) hp*=lv*2;
  return hp;
}

function getEnemyHtml(enemy) {
  const size = parseInt(enemy.lv)%5==0 ? 150 : 100;
  const stars = '★'.repeat(enemy.star);
  const attributeText = getEnemyAttributeText(enemy.attribute);
  const bossText = parseInt(enemy.lv)%5==0 ? getEnemyAttributeText('boss') : '';
  return `
    <p class="enemy-level">${formatNumber(enemy.lv)} Lv</p>
    <div class="enemy-image-wrap">
      <img src="./enemyImg/${enemy.lv}.png" width="${size}px" alt="${enemy.lv} Lv enemy">
      <span class="enemy-star-badge">${stars}</span>
      ${attributeText ? `<span class="enemy-attribute-badge enemy-attribute-${enemy.attribute}">${attributeText}</span>` : ''}
      ${bossText ? `<span class="enemy-boss-badge">${bossText}</span>` : ''}
    </div>
    <p class="enemy-hp">${formatNumber(Math.ceil(enemy.hp))} Hp</p>
    <p class="enemy-damage">성 공격 ${formatNumber(enemy.castleDamage)}</p>
  `;
}

function spawnEnemy(forcedId, forcedLv, forcedAttribute, forcedStar, options = {}) {
  if (isGamePaused && !options.allowWhilePaused) return null;

  let lv = forcedLv;
  if (lv === undefined) {
    const maxLv = Math.floor(enemyId / 20) + 1;
    const spawnableLevels = [];
    for (let candidate = 1; candidate <= maxLv; candidate += 1) {
      if (candidate % 5 !== 0 || !spawnedLimitedEnemyLevels.has(candidate)) spawnableLevels.push(candidate);
    }
    lv = spawnableLevels[Math.floor(Math.random() * spawnableLevels.length)];
  }

  if (lv % 5 === 0) spawnedLimitedEnemyLevels.add(lv);
  const enemy = createEnemy(lv, forcedStar || getRandomEnemyStar(), forcedAttribute || getRandomEnemyAttribute());
  if (lv % 5 === 0) GameAudio.play('boss', { volume: 0.65, throttle: 800 });
  if (forcedId !== undefined) enemy.id = forcedId;
  const div = document.createElement('div');
  div.className = `enemy star-${enemy.star} enemy-attr-${enemy.attribute}`;
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.innerHTML = getEnemyHtml(enemy);
  div.draggable = true;
  enemy.element = div;
  div.style.position = 'absolute';
  const spawnLeft = Number(options.left);
  const spawnTop = Number(options.top);
  div.style.left = Number.isFinite(spawnLeft) ? `${spawnLeft}px` : '90vw';
  div.style.top = Number.isFinite(spawnTop) ? `${spawnTop}px` : `${Math.floor(Math.random()*70)}vh`;

  div.dataset.id = enemy.id;
  div.dataset.lv = enemy.lv;
  div.dataset.star = enemy.star;
  div.dataset.attribute = enemy.attribute;
  div.dataset.maxHp = enemy.maxHp;
  div.dataset.castleDamage = enemy.castleDamage;
  div.dataset.lastCastleAttack = '0';
  div.dataset.lastTeleport = '0';
  div.dataset.lastSummonAt = div.dataset.lastSummonAt || `${Date.now()}`;

  board.appendChild(div);
  makeDraggable(div);

  const defense = document.getElementById('defense');
  const defenseRect = defense.getBoundingClientRect();
  const targetX = defenseRect.left;
  const targetY = defenseRect.top;

  enemies.push(enemy);
  moveEnemy(div, targetX, targetY);

  if (forcedId === undefined && window.TeamSession && window.TeamSession.isActive() && window.TeamSession.isHost) {
    window.TeamSession.reportEnemySpawned(enemy);
  }

  return enemy;
}

function getRandomSummonedEnemyLevel(parentLv) {
  return Math.max(1, parentLv - (Math.floor(Math.random() * 3) + 1));
}

function getRandomPositionNearEnemy(enemyDiv) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * ENEMY_SUMMON_RADIUS;
  const left = enemyDiv.offsetLeft + Math.cos(angle) * distance;
  const top = enemyDiv.offsetTop + Math.sin(angle) * distance;
  const maxLeft = Math.max(0, board.clientWidth - enemyDiv.offsetWidth);
  const maxTop = Math.max(0, board.clientHeight - enemyDiv.offsetHeight);

  return {
    left: Math.max(0, Math.min(maxLeft, left)),
    top: Math.max(0, Math.min(maxTop, top))
  };
}

function summonEnemyNearParent(parentEnemy) {
  if (!parentEnemy?.element || !document.body.contains(parentEnemy.element)) return;

  const childLv = getRandomSummonedEnemyLevel(parentEnemy.lv);
  const position = getRandomPositionNearEnemy(parentEnemy.element);
  spawnEnemy(undefined, childLv, undefined, undefined, position);
}

function enemySummonLoop() {
  if (isGamePaused || !isTeamSimulationAuthority()) return;

  const now = Date.now();
  enemies.forEach(enemy => {
    if (!enemy.element || !document.body.contains(enemy.element)) return;
    if (enemy.lv % 7 !== 0) return;

    const lastSummonAt = parseInt(enemy.element.dataset.lastSummonAt || '0', 10);
    if (now - lastSummonAt < ENEMY_SUMMON_INTERVAL / gameSpeed) return;

    enemy.element.dataset.lastSummonAt = `${now}`;
    summonEnemyNearParent(enemy);
  });
}

function getEnemyByElement(enemyDiv) {
  return enemies.find(enemy => enemy.element === enemyDiv) || null;
}

function getEnemyMoveSpeedMultiplier(enemy) {
  const attribute = enemy?.attribute || enemy?.element?.dataset.attribute || 'none';
  let multiplier = 1;

  if (attribute === 'golem') multiplier *= 0.8;
  if (attribute === 'lightning') multiplier *= 1.45;
  if (attribute === 'assassin') multiplier *= 1.8;
  if (attribute === 'berserk' && enemy.maxHp > 0 && enemy.hp / enemy.maxHp <= 0.4) multiplier *= 1.6;

  return multiplier;
}

function getEnemySlowMultiplier(enemyDiv) {
  const enemy = getEnemyByElement(enemyDiv);
  const attribute = enemy?.attribute || enemyDiv.dataset.attribute || 'none';
  const isSlowed = Date.now() < parseInt(enemyDiv.dataset.slowUntil || '0');
  if (!isSlowed) return 1;

  const effectSlowMult = parseFloat(enemyDiv.dataset.slowMult || '0.5');
  if (attribute === 'golem') return 0.75;
  if (attribute === 'ice') return 0.8;
  return Number.isFinite(effectSlowMult) ? effectSlowMult : 0.5;
}

function maybeTeleportEnemy(enemyDiv, dx, dy, dist) {
  const enemy = getEnemyByElement(enemyDiv);
  if ((enemy?.attribute || enemyDiv.dataset.attribute) !== 'lightning') return;
  if (dist <= 120) return;

  const now = Date.now();
  const interval = 2800 / Math.max(1, gameSpeed);
  const lastTeleport = parseInt(enemyDiv.dataset.lastTeleport || '0');
  if (now - lastTeleport < interval) return;

  enemyDiv.dataset.lastTeleport = `${now}`;
  const stepX = (dx / dist) * 90;
  const stepY = (dy / dist) * 90;
  enemyDiv.style.left = `${enemyDiv.offsetLeft + stepX}px`;
  enemyDiv.style.top = `${Math.max(0, enemyDiv.offsetTop + stepY + (Math.random() * 60 - 30))}px`;
}

function moveEnemy(enemyDiv, targetX, targetY, speed = 1.5) {
  const interval = setInterval(() => {
    if (isGamePaused) return;
    if (isTeamActive() && !isTeamSimulationAuthority()) return;

    const rect = enemyDiv.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 15) {
      if (!isTeamSimulationAuthority()) return;

      const now = Date.now();
      const lastCastleAttack = parseInt(enemyDiv.dataset.lastCastleAttack || '0');
      if (now - lastCastleAttack < 1000 / gameSpeed) return;

      enemyDiv.dataset.lastCastleAttack = `${now}`;
      const enemy = getEnemyByElement(enemyDiv);
      const castleDamage = parseInt(enemyDiv.dataset.castleDamage || '1');
      health -= castleDamage;
      GameAudio.play('castleHit', { volume: 0.52, throttle: 180 });
      if (enemy?.attribute === 'vampire') {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(enemy.maxHp * 0.12 * getEnemyLevelHealMultiplier(enemy.lv)));
        enemy.element.innerHTML = getEnemyHtml(enemy);
      }
      if (window.TeamSession && window.TeamSession.isActive()) window.TeamSession.reportCastleHit(castleDamage);
      reportTeamSharedState();
      if (health<=0) {
        endGame();
        return;
      }
      updateHealthText();
    }else {
    // 방향 벡터 단위화 후 이동
    const enemyLv = parseInt(enemyDiv.dataset.lv);
    speed = enemyLv%5==0 ? 0.8 : 1.5;
    if (enemyLv%4==0 && enemyLv%5!=0) speed = 2.3;
    if (Date.now() < parseInt(enemyDiv.dataset.stopUntil || '0')) return;
    if (enemyDiv.dataset.engaged === '1') return;
    maybeTeleportEnemy(enemyDiv, dx, dy, dist);
    const enemy = getEnemyByElement(enemyDiv);
    const slowMultiplier = getEnemySlowMultiplier(enemyDiv);
    const attributeSpeedMultiplier = getEnemyMoveSpeedMultiplier(enemy);
    const vx = (dx / dist) * speed * gameSpeed * slowMultiplier * attributeSpeedMultiplier;
    const vy = (dy / dist) * speed * gameSpeed * slowMultiplier * attributeSpeedMultiplier;

    enemyDiv.style.left = `${enemyDiv.offsetLeft + vx}px`;
    enemyDiv.style.top = `${enemyDiv.offsetTop + vy}px`;
    }
  }, 16);
  enemyDiv._moveInterval = interval;
}

function applyRemoteEnemySnapshot(snapshotEnemies) {
  if (isTeamSimulationAuthority()) return;
  const now = Date.now();
  const remoteIds = new Set(snapshotEnemies.map(state => String(state.id)));

  snapshotEnemies.forEach(state => {
    let enemy = enemies.find(item => String(item.id) === String(state.id));
    if (!enemy) {
      enemy = spawnEnemy(state.id, state.lv, state.attribute, state.star, {
        left: state.left,
        top: state.top,
        allowWhilePaused: true
      });
    }
    if (!enemy?.element || !document.body.contains(enemy.element)) return;

    enemy.lv = parseInt(state.lv, 10);
    enemy.star = parseInt(state.star || '1', 10);
    enemy.attribute = state.attribute || 'none';
    enemy.maxHp = Math.max(1, Number(state.maxHp) || enemy.maxHp);
    enemy.hp = Math.max(0, Math.min(enemy.maxHp, Number(state.hp)));
    enemy.castleDamage = Math.max(1, parseInt(state.castleDamage || enemy.castleDamage, 10));
    enemy.element.dataset.maxHp = `${enemy.maxHp}`;
    enemy.element.dataset.castleDamage = `${enemy.castleDamage}`;
    enemy.element.dataset.slowUntil = `${now + Math.max(0, Number(state.slowRemaining) || 0)}`;
    enemy.element.dataset.stopUntil = `${now + Math.max(0, Number(state.stopRemaining) || 0)}`;
    enemy.element.dataset.regenSuppressedUntil = `${now + Math.max(0, Number(state.regenSuppressRemaining) || 0)}`;
    enemy.element.dataset.slowMult = `${Number.isFinite(Number(state.slowMult)) ? state.slowMult : 0.5}`;
    enemy.element.innerHTML = getEnemyHtml(enemy);

    const targetLeft = Number(state.left);
    const targetTop = Number(state.top);
    if (Number.isFinite(targetLeft) && Number.isFinite(targetTop)) {
      const currentLeft = enemy.element.offsetLeft;
      const currentTop = enemy.element.offsetTop;
      const distance = Math.hypot(targetLeft - currentLeft, targetTop - currentTop);
      const blend = distance > 240 ? 1 : 0.65;
      enemy.element.style.left = `${currentLeft + (targetLeft - currentLeft) * blend}px`;
      enemy.element.style.top = `${currentTop + (targetTop - currentTop) * blend}px`;
    }
  });

  [...enemies].forEach(enemy => {
    if (remoteIds.has(String(enemy.id))) return;
    if (enemy.element?._moveInterval) clearInterval(enemy.element._moveInterval);
    enemy.element?.remove();
    const index = enemies.indexOf(enemy);
    if (index !== -1) enemies.splice(index, 1);
  });
}
