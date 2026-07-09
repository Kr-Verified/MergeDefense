let towerId = 0;
let enemyId = 0;
let coins = 3;
let spawnLv = 1;
const board = document.getElementById('game-board');
const createBar = document.getElementById('create-bar');
const coinBar = document.getElementById('coin-bar');
const survivalTimeBar = document.getElementById('survival-time');
const upgradeBtn = document.getElementById('upgrade-create-btn');
const spawnLvExpress = document.getElementById('spawnLv');
const priceBar = document.getElementById('price');
const upgradeModal = document.getElementById('upgrade-modal');
const closeUpgradeModalBtn = document.getElementById('close-upgrade-modal');
const towerLevelText = document.getElementById('tower-level');
const towerStarText = document.getElementById('tower-star');
const towerDamageText = document.getElementById('tower-damage');
const towerSpeedText = document.getElementById('tower-speed');
const towerRangeText = document.getElementById('tower-range');
const upgradeSpeedBtn = document.getElementById('upgrade-speed-btn');
const upgradePowerBtn = document.getElementById('upgrade-power-btn');
const upgradeRangeBtn = document.getElementById('upgrade-range-btn');
const globalSpeedBtn = document.getElementById('global-speed-btn');
const globalPowerBtn = document.getElementById('global-power-btn');
const globalRangeBtn = document.getElementById('global-range-btn');
const castleHealthBtn = document.getElementById('castle-health-btn');
const speedModeBtn = document.getElementById('speed-mode-btn');
let draggedTower = null;
let selectedTower = null;
let health = 1000;
let maxHealth = 1000;
let globalSpeedUpgrade = 0;
let globalPowerUpgrade = 0;
let globalRangeUpgrade = 0;
let castleHealthUpgrade = 0;
let gameSpeed = 1;
let enemySpawnInterval = null;
let towerAttackInterval = null;
let castleRecoverInterval = null;
let survivalTimerInterval = null;
let survivedSeconds = 0;
const enemies = [];
document.getElementById('name').textContent = `${localStorage.getItem('name')}`;

const BASE_ATTACK_INTERVAL = 1000;
const BASE_ATTACK_RANGE = 400;
const MIN_ATTACK_INTERVAL = 250;
const BASE_CASTLE_HEALTH = 1000;

function createTower(lv, star = getRandomTowerStar(), attribute = getRandomTowerAttribute()) {
  return {
    id: towerId++,
    lv: lv,
    star: star,
    attribute: attribute,
    element: null
  };
}

function getRandomTowerStar() {
  const random = Math.random();
  if (random < 0.001) return 4;
  if (random < 0.011) return 3;
  if (random < 0.101) return 2;
  return 1;
}

function getRandomEnemyStar() {
  const random = Math.random();
  if (random < 0.001) return 4;
  if (random < 0.011) return 3;
  if (random < 0.101) return 2;
  return 1;
}

function getRandomTowerAttribute() {
  if (Math.random() >= 0.2) return 'none';
  const attributes = ['water', 'fire', 'bomb', 'ball'];
  return attributes[Math.floor(Math.random() * attributes.length)];
}

function getStarText(star) {
  return `${star}성`;
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

function getTowerStarDamageMultiplier(star) {
  if (star === 4) return 5;
  return star;
}

function getAttributeText(attribute) {
  const names = {
    water: '물',
    fire: '불',
    bomb: '폭탄',
    ball: '공',
    none: ''
  };
  return names[attribute] || '';
}

function getTowerHtml(lv, star, attribute = 'none') {
  const stars = '★'.repeat(star);
  const attributeText = getAttributeText(attribute);
  return `
    <p class="tower-level">${lv} Lv</p>
    <div class="tower-image-wrap">
      <img src="./img/${lv}.png" alt="${lv} Lv tower">
      <span class="tower-star-badge">${stars}</span>
      ${attributeText ? `<span class="tower-attribute-badge attribute-${attribute}">${attributeText}</span>` : ''}
    </div>
  `;
}

function updateSurvivalTime() {
  survivalTimeBar.textContent = `${survivedSeconds}초`;
}

function updateHealthText() {
  document.getElementById('health').textContent = `${Math.ceil(health)} / ${maxHealth} Hp`;
}

function createEnemy(lv, star = getRandomEnemyStar()) {
  let hp = getBaseEnemyHp(lv);
  hp *= getEnemyStarHealthMultiplier(star);
  return {
    id: enemyId++,
    lv: lv,
    star: star,
    hp: hp,
    castleDamage: lv * getEnemyStarDamageMultiplier(star),
    element: null
  }
}

function getBaseEnemyHp(lv) {
  let hp = lv*lv*100;
  if (lv%5==0) hp*=lv;
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
    <p class="enemy-hp">${enemy.hp} Hp</p>
    <p class="enemy-damage">성 공격 ${enemy.castleDamage}</p>
  `;
}

function spawnEnemy() {
  const lv = Math.floor(Math.random() * Math.floor(enemyId/10)+1);
  const enemy = createEnemy(lv);
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
}

function moveEnemy(enemyDiv, targetX, targetY, speed = 1.5) {
  const interval = setInterval(() => {
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
      health -= parseInt(enemyDiv.dataset.castleDamage || '1');
      if (health<=0) window.location.href = "fail.html";
      updateHealthText();
    }else {
    // 방향 벡터 단위화 후 이동
    if (parseInt(enemyDiv.dataset.lv)%4==0) speed = 2.3;
    const slowMultiplier = Date.now() < parseInt(enemyDiv.dataset.slowUntil || '0') ? 0.5 : 1;
    const vx = (dx / dist) * speed * gameSpeed * slowMultiplier;
    const vy = (dy / dist) * speed * gameSpeed * slowMultiplier;

    enemyDiv.style.left = `${enemyDiv.offsetLeft + vx}px`;
    enemyDiv.style.top = `${enemyDiv.offsetTop + vy}px`;
    }
  }, 16);
}

function spawnTower(lv, star = getRandomTowerStar(), attribute = getRandomTowerAttribute()) {
  const tower = createTower(lv, star, attribute);
  const div = document.createElement('div');
  div.className = `tower star-${tower.star} attribute-${tower.attribute}`;
  div.innerHTML = getTowerHtml(tower.lv, tower.star, tower.attribute);
  div.draggable = true;
  tower.element = div;

  div.dataset.id = tower.id;
  div.dataset.lv = tower.lv;
  div.dataset.star = tower.star;
  div.dataset.attribute = tower.attribute;
  setDefaultTowerStats(div);

  createBar.appendChild(div);
  makeDraggable(div);
}

function setDefaultTowerStats(tower) {
  tower.dataset.speedUpgrade = tower.dataset.speedUpgrade || '0';
  tower.dataset.powerUpgrade = tower.dataset.powerUpgrade || '0';
  tower.dataset.rangeUpgrade = tower.dataset.rangeUpgrade || '0';
  tower.dataset.lastAttack = tower.dataset.lastAttack || '0';
}

function copyTowerStats(fromTower, toTower) {
  toTower.dataset.star = fromTower.dataset.star || '1';
  toTower.dataset.attribute = fromTower.dataset.attribute || 'none';
  toTower.dataset.speedUpgrade = fromTower.dataset.speedUpgrade || '0';
  toTower.dataset.powerUpgrade = fromTower.dataset.powerUpgrade || '0';
  toTower.dataset.rangeUpgrade = fromTower.dataset.rangeUpgrade || '0';
  toTower.dataset.lastAttack = fromTower.dataset.lastAttack || '0';
}

function getTowerDamage(tower) {
  const lv = parseInt(tower.dataset.lv);
  const star = parseInt(tower.dataset.star || '1');
  const powerUpgrade = parseInt(tower.dataset.powerUpgrade || '0');
  const baseDamage = Math.floor(Math.pow(lv, 1.5)) * 10;
  return Math.floor(baseDamage * getTowerStarDamageMultiplier(star) * (1 + powerUpgrade * 0.35 + globalPowerUpgrade * 0.2));
}

function getTowerRange(tower) {
  const rangeUpgrade = parseInt(tower.dataset.rangeUpgrade || '0');
  return BASE_ATTACK_RANGE + rangeUpgrade * 60 + globalRangeUpgrade * 40;
}

function getTowerAttackInterval(tower) {
  const speedUpgrade = parseInt(tower.dataset.speedUpgrade || '0');
  const attributeMultiplier = tower.dataset.attribute === 'ball' ? 0.5 : 1;
  return Math.max(MIN_ATTACK_INTERVAL, BASE_ATTACK_INTERVAL - speedUpgrade * 120 - globalSpeedUpgrade * 80) * attributeMultiplier / gameSpeed;
}

function getUpgradeCost(tower, type) {
  const lv = parseInt(tower.dataset.lv);
  const currentUpgrade = parseInt(tower.dataset[`${type}Upgrade`] || '0');
  return lv * Math.pow(currentUpgrade + 1, 2) * 5;
}

function getGlobalUpgradeCost(type) {
  const levels = {
    speed: globalSpeedUpgrade,
    power: globalPowerUpgrade,
    range: globalRangeUpgrade
  };
  return Math.pow(levels[type] + 1, 2) * 25;
}

function getCastleHealthUpgradeCost() {
  return Math.pow(castleHealthUpgrade + 1, 2) * 30;
}

function refreshGlobalUpgradeButtons() {
  const speedCost = getGlobalUpgradeCost('speed');
  const powerCost = getGlobalUpgradeCost('power');
  const rangeCost = getGlobalUpgradeCost('range');
  const castleHealthCost = getCastleHealthUpgradeCost();

  globalSpeedBtn.textContent = `전체 속도 Lv.${globalSpeedUpgrade} ${speedCost} $`;
  globalPowerBtn.textContent = `전체 힘 Lv.${globalPowerUpgrade} ${powerCost} $`;
  globalRangeBtn.textContent = `전체 범위 Lv.${globalRangeUpgrade} ${rangeCost} $`;
  castleHealthBtn.textContent = `성 체력 Lv.${castleHealthUpgrade} ${castleHealthCost} $`;
  globalSpeedBtn.disabled = coins < speedCost;
  globalPowerBtn.disabled = coins < powerCost;
  globalRangeBtn.disabled = coins < rangeCost;
  castleHealthBtn.disabled = coins < castleHealthCost;
}

function refreshUpgradeUi() {
  refreshGlobalUpgradeButtons();
  if (selectedTower) refreshUpgradeModal();
}

function openUpgradeModal(tower) {
  if (!board.contains(tower)) return;
  if (selectedTower && selectedTower !== tower) selectedTower.classList.remove('selected');
  selectedTower = tower;
  tower.classList.add('selected');
  refreshUpgradeModal();
  upgradeModal.classList.remove('hidden');
}

function closeUpgradeModal() {
  if (selectedTower) selectedTower.classList.remove('selected');
  selectedTower = null;
  upgradeModal.classList.add('hidden');
}

function refreshUpgradeModal() {
  if (!selectedTower || !document.body.contains(selectedTower)) {
    closeUpgradeModal();
    return;
  }

  towerLevelText.textContent = `Lv ${selectedTower.dataset.lv}`;
  const towerStar = parseInt(selectedTower.dataset.star || '1');
  const attributeText = getAttributeText(selectedTower.dataset.attribute || 'none');
  towerStarText.textContent = `${getStarText(towerStar)} 공격력 ${getTowerStarDamageMultiplier(towerStar)}배${attributeText ? ` / ${attributeText}` : ''}`;
  towerDamageText.textContent = `공격 힘: ${getTowerDamage(selectedTower)}`;
  towerSpeedText.textContent = `공격 속도: ${(1000 / getTowerAttackInterval(selectedTower)).toFixed(2)}회/초`;
  towerRangeText.textContent = `공격 범위: ${getTowerRange(selectedTower)}`;

  const speedCost = getUpgradeCost(selectedTower, 'speed');
  const powerCost = getUpgradeCost(selectedTower, 'power');
  const rangeCost = getUpgradeCost(selectedTower, 'range');

  upgradeSpeedBtn.textContent = `공격 속도 향상 ${speedCost} $`;
  upgradePowerBtn.textContent = `공격 힘 향상 ${powerCost} $`;
  upgradeRangeBtn.textContent = `공격 범위 향상 ${rangeCost} $`;
  upgradeSpeedBtn.disabled = coins < speedCost;
  upgradePowerBtn.disabled = coins < powerCost;
  upgradeRangeBtn.disabled = coins < rangeCost;
  refreshGlobalUpgradeButtons();
}

function upgradeSelectedTower(type) {
  if (!selectedTower || !document.body.contains(selectedTower)) return;

  const cost = getUpgradeCost(selectedTower, type);
  if (coins < cost) return;

  coins -= cost;
  coinBar.textContent = `${coins} $`;
  const key = `${type}Upgrade`;
  selectedTower.dataset[key] = `${parseInt(selectedTower.dataset[key] || '0') + 1}`;
  refreshUpgradeUi();
}

function upgradeGlobalTowerStat(type) {
  const cost = getGlobalUpgradeCost(type);
  if (coins < cost) return;

  coins -= cost;
  coinBar.textContent = `${coins} $`;

  if (type === 'speed') globalSpeedUpgrade += 1;
  if (type === 'power') globalPowerUpgrade += 1;
  if (type === 'range') globalRangeUpgrade += 1;

  refreshUpgradeUi();
}

function upgradeCastleHealth() {
  const cost = getCastleHealthUpgradeCost();
  if (coins < cost) return;

  coins -= cost;
  coinBar.textContent = `${coins} $`;
  castleHealthUpgrade += 1;
  maxHealth = BASE_CASTLE_HEALTH + castleHealthUpgrade * 250;
  health = Math.min(maxHealth, health + 250);
  updateHealthText();
  refreshUpgradeUi();
}

function recoverCastleHealth() {
  if (health >= maxHealth) return;

  health = Math.min(maxHealth, health + maxHealth * 0.01);
  updateHealthText();
}

function spawnBtn() {
  const cost = getTowerCreateCost();
  if (coins>=cost) {
    coins-=cost;
    coinBar.textContent = `${coins} $`;
    spawnTower(spawnLv);
    refreshUpgradeUi();
  }
}

function makeDraggable(elem) {
  elem.addEventListener('dragstart', e => { draggedTower = elem; });

  elem.addEventListener('click', e => {
    e.stopPropagation();
    if (elem.classList.contains('tower') && board.contains(elem)) openUpgradeModal(elem);
  });

  elem.addEventListener('dragover', e => { e.preventDefault(); });

  elem.addEventListener('drop', e => {
    e.preventDefault();

    if (!draggedTower || draggedTower === elem) return;
    if (!draggedTower.classList.contains('tower') || !elem.classList.contains('tower')) return;

    const draggedLv = parseInt(draggedTower.dataset.lv);
    const targetLv = parseInt(elem.dataset.lv);

    if (draggedLv === targetLv) {
      const resultStar = Math.max(
        parseInt(draggedTower.dataset.star || '1'),
        parseInt(elem.dataset.star || '1')
      );
      const draggedAttribute = draggedTower.dataset.attribute || 'none';
      const targetAttribute = elem.dataset.attribute || 'none';
      const resultAttribute = getMergedTowerAttribute(draggedAttribute, targetAttribute);
      draggedTower.remove();
      elem.remove();

      spawnTower(draggedLv+1, resultStar, resultAttribute);
    }
  });
}

function getMergedTowerAttribute(firstAttribute, secondAttribute) {
  if (firstAttribute === 'ball' || secondAttribute === 'ball') return 'ball';
  if (firstAttribute !== 'none') return firstAttribute;
  return secondAttribute;
}

board.addEventListener('dragover', e => {
  e.preventDefault();
});
createBar.addEventListener('dragover', e => {
  e.preventDefault();
});

function move(from, to) {
  return function (e) {
    e.preventDefault();
    if (!draggedTower) return;

    if (from.contains(draggedTower)) {
      const x = e.clientX;
      const y = e.clientY;

      const lv = parseInt(draggedTower.dataset.lv);
      const id = draggedTower.dataset.id;

      if (draggedTower === selectedTower) closeUpgradeModal();
      from.removeChild(draggedTower);

      const div = document.createElement('div');
      div.className = `tower star-${draggedTower.dataset.star || '1'} attribute-${draggedTower.dataset.attribute || 'none'}`;
      div.innerHTML = getTowerHtml(lv, parseInt(draggedTower.dataset.star || '1'), draggedTower.dataset.attribute || 'none');
      div.draggable = true;
      div.dataset.lv = lv;
      div.dataset.id = id;
      copyTowerStats(draggedTower, div);

      if (to === board) {
        div.classList.add('installed');
        div.style.position = 'absolute';
        div.style.left = `${x - 40}px`;
        div.style.top = `${y - 40}px`;
        div.style.zIndex = '0';
      } else {
        div.classList.remove('installed');
        div.style.position = 'relative'; // 기본 정렬
      }

      makeDraggable(div);
      to.appendChild(div);
    }

    draggedTower = null;
  };
}


board.addEventListener('drop', move(createBar, board));
createBar.addEventListener('drop', move(board, createBar));

function fireBullet(fromTower, toEnemy) {
  if (fromTower.dataset.attacking === 'true') return;
  fromTower.dataset.attacking = 'true';
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
      fromTower.dataset.attacking = 'false';
      return;
    }

    const speed = 5;
    const vx = (dx / dist) * speed * gameSpeed;
    const vy = (dy / dist) * speed * gameSpeed;

    bullet.style.left = `${bulletX + vx}px`;
    bullet.style.top = `${bulletY + vy}px`;
  }, 16);
}

function damageEnemy(enemy, damage) {
  if (!enemy || !document.body.contains(enemy.element)) return;

  enemy.hp -= Math.floor(damage);
  enemy.element.innerHTML = getEnemyHtml(enemy);

  if (enemy.hp <= 0) {
    if (document.body.contains(enemy.element)) enemy.element.remove();
    coins += parseInt(enemy.element.dataset.lv)*parseInt(enemy.element.dataset.lv);
    coinBar.textContent = `${coins} $`;
    refreshUpgradeUi();
    const idx = enemies.indexOf(enemy)
    if (idx!=-1) enemies.splice(idx, 1);
  }
}

function applyTowerHit(fromTower, targetEnemy) {
  const attribute = fromTower.dataset.attribute || 'none';
  const baseDamage = getTowerDamage(fromTower);

  if (attribute === 'bomb') {
    applyBombDamage(targetEnemy, baseDamage * 0.7);
    return;
  }

  damageEnemy(targetEnemy, baseDamage);

  if (attribute === 'water' && document.body.contains(targetEnemy.element)) {
    targetEnemy.element.dataset.slowUntil = `${Date.now() + 3000}`;
  }

  if (attribute === 'fire' && document.body.contains(targetEnemy.element)) {
    applyFireDamage(targetEnemy, baseDamage);
  }

  if (attribute === 'ball' && document.body.contains(targetEnemy.element)) {
    promoteEnemyToThreeStar(targetEnemy);
  }
}

function promoteEnemyToThreeStar(enemy) {
  if (enemy.star >= 3 || !document.body.contains(enemy.element)) return;
  if (Math.random() >= 0.1) return;

  const oldMaxHp = getBaseEnemyHp(enemy.lv) * getEnemyStarHealthMultiplier(enemy.star);
  const newMaxHp = getBaseEnemyHp(enemy.lv) * getEnemyStarHealthMultiplier(3);

  enemy.star = 3;
  enemy.hp += newMaxHp - oldMaxHp;
  enemy.castleDamage = enemy.lv * getEnemyStarDamageMultiplier(3);
  enemy.element.classList.remove('star-1', 'star-2', 'star-4');
  enemy.element.classList.add('star-3');
  enemy.element.dataset.star = '3';
  enemy.element.dataset.castleDamage = enemy.castleDamage;
  enemy.element.innerHTML = getEnemyHtml(enemy);
}

function applyFireDamage(enemy, baseDamage) {
  let ticks = 0;
  const fireInterval = setInterval(() => {
    if (!document.body.contains(enemy.element)) {
      clearInterval(fireInterval);
      return;
    }

    ticks += 1;
    damageEnemy(enemy, baseDamage * 0.25);

    if (ticks >= 3) clearInterval(fireInterval);
  }, 1000 / gameSpeed);
}

function applyBombDamage(targetEnemy, damage) {
  const targetRect = targetEnemy.element.getBoundingClientRect();
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const bombRange = 130;

  [...enemies].forEach(enemy => {
    if (!document.body.contains(enemy.element)) return;

    const enemyRect = enemy.element.getBoundingClientRect();
    const enemyX = enemyRect.left + enemyRect.width / 2;
    const enemyY = enemyRect.top + enemyRect.height / 2;
    const dx = targetX - enemyX;
    const dy = targetY - enemyY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= bombRange) damageEnemy(enemy, damage);
  });
}

function towerAttackLoop() {
  const towers = document.querySelectorAll('.tower');
  const now = Date.now();
  towers.forEach(tower => {
    if (!board.contains(tower)) return;
    const lastAttack = parseInt(tower.dataset.lastAttack || '0');
    if (now - lastAttack < getTowerAttackInterval(tower)) return;

    const towerRect = tower.getBoundingClientRect();
    const towerRange = getTowerRange(tower);

    enemies.forEach(enemy => {
      if (tower.dataset.attacking === 'true') return;
      const enemyRect = enemy.element.getBoundingClientRect();
      const dx = (enemyRect.left + 40) - (towerRect.left + 40);
      const dy = (enemyRect.top + 40) - (towerRect.top + 40);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < towerRange) {
        tower.dataset.lastAttack = `${now}`;
        fireBullet(tower, enemy);
      }
    });
  });
}

function getTowerCreateCost() {
  return Math.ceil(Math.pow(spawnLv, 2.6));
}

function updateSpeedModeButton() {
  speedModeBtn.textContent = gameSpeed === 2 ? '2배속 ON' : '2배속 OFF';
  speedModeBtn.classList.toggle('active', gameSpeed === 2);
}

function resetGameIntervals() {
  if (enemySpawnInterval) clearInterval(enemySpawnInterval);
  if (towerAttackInterval) clearInterval(towerAttackInterval);
  if (castleRecoverInterval) clearInterval(castleRecoverInterval);
  if (survivalTimerInterval) clearInterval(survivalTimerInterval);

  enemySpawnInterval = setInterval(spawnEnemy, 2500 / gameSpeed);
  towerAttackInterval = setInterval(towerAttackLoop, 100 / gameSpeed);
  castleRecoverInterval = setInterval(recoverCastleHealth, 1000 / gameSpeed);
  survivalTimerInterval = setInterval(() => {
    survivedSeconds += 1;
    updateSurvivalTime();
  }, 1000);
}

function toggleSpeedMode() {
  gameSpeed = gameSpeed === 1 ? 2 : 1;
  updateSpeedModeButton();
  resetGameIntervals();
}


function upgradeCreate() {
  const cost = Math.pow(spawnLv, 4)*5;
  if ( coins >= cost ) {
    coins -= cost;
    spawnLv += 1;
    coinBar.textContent = `${coins} $`;
    upgradeBtn.textContent = `생성 단계 향상 ${Math.pow(spawnLv, 4)*5} $`;
    spawnLvExpress.textContent = `${spawnLv} 생성`;
    priceBar.textContent = `${getTowerCreateCost()} $`
    refreshUpgradeUi();
  }
}

closeUpgradeModalBtn.addEventListener('click', closeUpgradeModal);
upgradeModal.addEventListener('click', e => {
  if (e.target === upgradeModal) closeUpgradeModal();
});
board.addEventListener('click', closeUpgradeModal);
upgradeSpeedBtn.addEventListener('click', () => upgradeSelectedTower('speed'));
upgradePowerBtn.addEventListener('click', () => upgradeSelectedTower('power'));
upgradeRangeBtn.addEventListener('click', () => upgradeSelectedTower('range'));
globalSpeedBtn.addEventListener('click', () => upgradeGlobalTowerStat('speed'));
globalPowerBtn.addEventListener('click', () => upgradeGlobalTowerStat('power'));
globalRangeBtn.addEventListener('click', () => upgradeGlobalTowerStat('range'));
castleHealthBtn.addEventListener('click', upgradeCastleHealth);
speedModeBtn.addEventListener('click', toggleSpeedMode);
updateHealthText();
updateSurvivalTime();
updateSpeedModeButton();
priceBar.textContent = `${getTowerCreateCost()} $`;
refreshGlobalUpgradeButtons();
resetGameIntervals();
