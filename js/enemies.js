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

function getEnemyCastleDamage(lv, star) {
  const bossMultiplier = lv%5==0 ? 10 : 1;
  return lv * getEnemyStarDamageMultiplier(star) * bossMultiplier;
}

function createEnemy(lv, star = getRandomEnemyStar()) {
  let hp = getBaseEnemyHp(lv);
  hp *= getEnemyStarHealthMultiplier(star);
  return {
    id: enemyId++,
    lv: lv,
    star: star,
    hp: hp,
    maxHp: hp,
    castleDamage: getEnemyCastleDamage(lv, star),
    element: null
  }
}

function getBaseEnemyHp(lv) {
  let hp = lv*lv*100;
  if (lv%5==0) hp*=lv*2;
  return hp;
}

function getEnemyHtml(enemy) {
  const size = parseInt(enemy.lv)%5==0 ? 150 : 100;
  const stars = '★'.repeat(enemy.star);
  return `
    <p class="enemy-level">${enemy.lv} Lv</p>
    <div class="enemy-image-wrap">
      <img src="./enemyImg/${enemy.lv}.png" width="${size}px" alt="${enemy.lv} Lv enemy">
      <span class="enemy-star-badge">${stars}</span>
    </div>
    <p class="enemy-hp">${Math.ceil(enemy.hp)} Hp</p>
    <p class="enemy-damage">성 공격 ${enemy.castleDamage}</p>
  `;
}

function spawnEnemy(forcedId, forcedLv) {
  if (isGamePaused) return null;

  let lv = forcedLv;
  if (lv === undefined) {
    const maxLv = Math.floor(enemyId / 10) + 1;
    const spawnableLevels = [];
    for (let candidate = 1; candidate <= maxLv; candidate += 1) {
      if (candidate % 5 !== 0 || !spawnedLimitedEnemyLevels.has(candidate)) spawnableLevels.push(candidate);
    }
    lv = spawnableLevels[Math.floor(Math.random() * spawnableLevels.length)];
  }

  if (lv % 5 === 0) spawnedLimitedEnemyLevels.add(lv);
  const enemy = createEnemy(lv);
  if (forcedId !== undefined) enemy.id = forcedId;
  const div = document.createElement('div');
  div.className = `enemy star-${enemy.star}`;
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.innerHTML = getEnemyHtml(enemy);
  div.draggable = true;
  enemy.element = div;
  div.style.position = 'absolute';
  div.style.left = '90vw';
  div.style.top = `${Math.floor(Math.random()*70)}vh`;

  div.dataset.id = enemy.id;
  div.dataset.lv = enemy.lv;
  div.dataset.star = enemy.star;
  div.dataset.maxHp = enemy.maxHp;
  div.dataset.castleDamage = enemy.castleDamage;
  div.dataset.lastCastleAttack = '0';

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

function moveEnemy(enemyDiv, targetX, targetY, speed = 1.5) {
  const interval = setInterval(() => {
    if (isGamePaused) return;

    const rect = enemyDiv.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 15) {
      const now = Date.now();
      const lastCastleAttack = parseInt(enemyDiv.dataset.lastCastleAttack || '0');
      if (now - lastCastleAttack < 1000 / gameSpeed) return;

      enemyDiv.dataset.lastCastleAttack = `${now}`;
      const castleDamage = parseInt(enemyDiv.dataset.castleDamage || '1');
      health -= castleDamage;
      if (window.TeamSession && window.TeamSession.isActive()) window.TeamSession.reportCastleHit(castleDamage);
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
    const slowMultiplier = Date.now() < parseInt(enemyDiv.dataset.slowUntil || '0') ? 0.5 : 1;
    const vx = (dx / dist) * speed * gameSpeed * slowMultiplier;
    const vy = (dy / dist) * speed * gameSpeed * slowMultiplier;

    enemyDiv.style.left = `${enemyDiv.offsetLeft + vx}px`;
    enemyDiv.style.top = `${enemyDiv.offsetTop + vy}px`;
    }
  }, 16);
}
