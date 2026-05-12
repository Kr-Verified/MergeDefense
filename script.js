let towerId = 0;
let enemyId = 0;
let coins = 3;
let spawnLv = 1;
const board = document.getElementById('game-board');
const createBar = document.getElementById('create-bar');
const coinBar = document.getElementById('coin-bar');
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
let draggedTower = null;
let selectedTower = null;
let health = 1000;
let maxHealth = 1000;
let globalSpeedUpgrade = 0;
let globalPowerUpgrade = 0;
let globalRangeUpgrade = 0;
let castleHealthUpgrade = 0;
const enemies = [];
document.getElementById('name').textContent = `${localStorage.getItem('name')}`;

const BASE_ATTACK_INTERVAL = 1000;
const BASE_ATTACK_RANGE = 400;
const MIN_ATTACK_INTERVAL = 250;
const BASE_CASTLE_HEALTH = 1000;

function createTower(lv, star = getRandomTowerStar()) {
  return {
    id: towerId++,
    lv: lv,
    star: star,
    element: null
  };
}

function getRandomTowerStar() {
  const random = Math.random();
  if (random < 0.01) return 3;
  if (random < 0.10) return 2;
  return 1;
}

function getStarText(star) {
  return `${star}성`;
}

function getTowerHtml(lv, star) {
  const stars = '★'.repeat(star);
  return `
    <p class="tower-level">${lv} Lv</p>
    <div class="tower-image-wrap">
      <img src="./img/${lv}.png" alt="${lv} Lv tower">
      <span class="tower-star-badge">${stars}</span>
    </div>
  `;
}

function updateHealthText() {
  document.getElementById('health').textContent = `${Math.ceil(health)} / ${maxHealth} Hp`;
}

function createEnemy(lv) {
  let hp = lv*lv*100;
  if (lv%5==0) hp*=lv; 
  return {
    id: enemyId++,
    lv: lv,
    hp: hp,
    element: null
  }
}

function spawnEnemy() {
  const lv = Math.floor(Math.random() * Math.floor(enemyId/10)+1);
  const enemy = createEnemy(lv);
  const div = document.createElement('div');
  div.className = 'enemy';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  let size = 100;
  if (parseInt(enemy.lv)%5==0) size = 150;
  div.innerHTML = `<p style="margin:0; color:red;">${enemy.lv} Lv</p><img src="./enemyImg/${enemy.lv}.png" width=${size}px></img><p style="color:red;">${enemy.hp} Hp</p>`
  div.draggable = true;
  enemy.element = div;
  div.style.position = 'absolute';
  div.style.left = '90vw';
  div.style.top = `${Math.floor(Math.random()*70)}vh`;

  div.dataset.id = enemy.id;
  div.dataset.lv = enemy.lv;

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
      health-=1;
      if (health<=0) window.location.href = "fail.html";
      updateHealthText();
    }else {
    // 방향 벡터 단위화 후 이동
    if (parseInt(enemyDiv.dataset.lv)==4) speed = 2.3;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    enemyDiv.style.left = `${enemyDiv.offsetLeft + vx}px`;
    enemyDiv.style.top = `${enemyDiv.offsetTop + vy}px`;
    }
  }, 16);
}

setInterval(spawnEnemy, 2500);

function spawnTower(lv, star = getRandomTowerStar()) {
  const tower = createTower(lv, star);
  const div = document.createElement('div');
  div.className = `tower star-${tower.star}`;
  div.innerHTML = getTowerHtml(tower.lv, tower.star);
  div.draggable = true;
  tower.element = div;

  div.dataset.id = tower.id;
  div.dataset.lv = tower.lv;
  div.dataset.star = tower.star;
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
  return Math.floor(baseDamage * star * (1 + powerUpgrade * 0.35 + globalPowerUpgrade * 0.2));
}

function getTowerRange(tower) {
  const rangeUpgrade = parseInt(tower.dataset.rangeUpgrade || '0');
  return BASE_ATTACK_RANGE + rangeUpgrade * 60 + globalRangeUpgrade * 40;
}

function getTowerAttackInterval(tower) {
  const speedUpgrade = parseInt(tower.dataset.speedUpgrade || '0');
  return Math.max(MIN_ATTACK_INTERVAL, BASE_ATTACK_INTERVAL - speedUpgrade * 120 - globalSpeedUpgrade * 80);
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
  towerStarText.textContent = `${getStarText(parseInt(selectedTower.dataset.star || '1'))} 공격력 ${selectedTower.dataset.star || '1'}배`;
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
  const cost = spawnLv*spawnLv;
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
      draggedTower.remove();
      elem.remove();

      spawnTower(draggedLv+1, resultStar);
    }
  });
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
      div.className = `tower star-${draggedTower.dataset.star || '1'}`;
      div.innerHTML = getTowerHtml(lv, parseInt(draggedTower.dataset.star || '1'));
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

      // 피 깎기
      toEnemy.hp -= getTowerDamage(fromTower);
      toEnemy.element.innerHTML = `<p style="margin:0; color:red;">${toEnemy.lv} Lv</p><img src="./enemyImg/${toEnemy.lv}.png" width=100px></img><p style="color:red;">${toEnemy.hp} Hp</p>`;
      if (toEnemy.hp <= 0) {
        if (document.body.contains(toEnemy.element)) toEnemy.element.remove();
        coins += parseInt(toEnemy.element.dataset.lv)*parseInt(toEnemy.element.dataset.lv);
        coinBar.textContent = `${coins} $`;
        refreshUpgradeUi();
        const idx = enemies.indexOf(toEnemy)
        if (idx!=-1) enemies.splice(idx, 1);
      }
      fromTower.dataset.attacking = 'false';
      return;
    }

    const speed = 5;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    bullet.style.left = `${bulletX + vx}px`;
    bullet.style.top = `${bulletY + vy}px`;
  }, 16);
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

// 짧은 간격으로 확인하고, 실제 발사 주기는 타워별 공격 속도로 제한한다.
setInterval(towerAttackLoop, 100);
setInterval(recoverCastleHealth, 1000);


function upgradeCreate() {
  const cost = Math.pow(spawnLv, 4)*5;
  if ( coins >= cost ) {
    coins -= cost;
    spawnLv += 1;
    coinBar.textContent = `${coins} $`;
    upgradeBtn.textContent = `생성 단계 향상 ${Math.pow(spawnLv, 4)*5} $`;
    spawnLvExpress.textContent = `${spawnLv} 생성`;
    priceBar.textContent = `${spawnLv*spawnLv} $`
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
updateHealthText();
refreshGlobalUpgradeButtons();
