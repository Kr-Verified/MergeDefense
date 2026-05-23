let towerId = 0;
let enemyId = 0;
let equipmentId = 0;
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
const towerTimeText = document.getElementById('tower-time');
const upgradeSpeedBtn = document.getElementById('upgrade-speed-btn');
const upgradePowerBtn = document.getElementById('upgrade-power-btn');
const upgradeRangeBtn = document.getElementById('upgrade-range-btn');
const timeUpgradeSpeedBtn = document.getElementById('time-upgrade-speed-btn');
const timeUpgradePowerBtn = document.getElementById('time-upgrade-power-btn');
const timeUpgradeRangeBtn = document.getElementById('time-upgrade-range-btn');
const timeUpgradeStarBtn = document.getElementById('time-upgrade-star-btn');
const towerCountBar = document.getElementById('tower-count');
const globalSpeedBtn = document.getElementById('global-speed-btn');
const globalPowerBtn = document.getElementById('global-power-btn');
const globalRangeBtn = document.getElementById('global-range-btn');
const criticalChanceBtn = document.getElementById('critical-chance-btn');
const criticalDamageBtn = document.getElementById('critical-damage-btn');
const castleHealthBtn = document.getElementById('castle-health-btn');
const towerLimitBtn = document.getElementById('tower-limit-btn');
const speedModeBtn = document.getElementById('speed-mode-btn');
const towerViewBtn = document.getElementById('tower-view-btn');
const itemViewBtn = document.getElementById('item-view-btn');
const equipmentSlots = document.getElementById('equipment-slots');
const inventoryEmpty = document.getElementById('inventory-empty');
let draggedTower = null;
let draggedEquipment = null;
let selectedTower = null;
let inventoryView = 'tower';
let isGamePaused = false;
let isGameOver = false;
const selectedUpgradeAmounts = {
  create: '1',
  globalSpeed: '1',
  globalPower: '1',
  globalRange: '1',
  criticalChance: '1',
  criticalDamage: '1',
  castleHealth: '1',
  towerLimit: '1',
  towerSpeed: '1',
  towerPower: '1',
  towerRange: '1'
};
let health = 1000;
let maxHealth = 1000;
let globalSpeedUpgrade = 0;
let globalPowerUpgrade = 0;
let globalRangeUpgrade = 0;
let criticalChanceUpgrade = 0;
let criticalDamageUpgrade = 0;
let castleHealthUpgrade = 0;
let towerLimitUpgrade = 0;
let towerLimit = 10;
let gameSpeed = 1;
let enemySpawnInterval = null;
let towerAttackInterval = null;
let castleRecoverInterval = null;
let survivalTimerInterval = null;
let towerTimeInterval = null;
let bossRecoverInterval = null;
let survivedSeconds = 0;
const enemies = [];
const spawnedLimitedEnemyLevels = new Set();
document.getElementById('name').textContent = `${localStorage.getItem('name')}`;

const BASE_ATTACK_INTERVAL = 1000;
const BASE_ATTACK_RANGE = 400;
const MIN_ATTACK_INTERVAL = 250;
const BASE_CASTLE_HEALTH = 1000;
const BASE_CRITICAL_CHANCE = 0.1;
const BASE_CRITICAL_DAMAGE_MULTIPLIER = 2;
const MAX_CRITICAL_CHANCE = 1;
const TOWER_STAR_UPGRADE_COSTS = {
  2: 50,
  3: 300,
  4: 1800,
  5: 8000
};
const EQUIPMENT_SLOT_UNLOCK_LEVELS = [0, 10, 100];
const EQUIPMENT_TYPES = {
  oil: {
    name: '기름',
    stat: 'speed',
    description: '공격속도'
  },
  scope: {
    name: '조준경',
    stat: 'range',
    description: '공격범위'
  },
  powder: {
    name: '화약',
    stat: 'power',
    description: '공격파워'
  },
  weight: {
    name: '무게추',
    stat: 'splash',
    description: '범위공격'
  },
  needle: {
    name: '바늘',
    stat: 'critChance',
    description: '치명확률'
  },
  hammer: {
    name: '망치',
    stat: 'critDamage',
    description: '치명피해'
  }
};

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
  if (Math.random() >= 0.4) return 'none';
  const attributes = ['water', 'fire', 'bomb', 'ball', 'power', 'wall', 'blood'];
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

function getEnemyCastleDamage(lv, star) {
  const bossMultiplier = lv%5==0 ? 10 : 1;
  return lv * getEnemyStarDamageMultiplier(star) * bossMultiplier;
}

function getTowerStarDamageMultiplier(star) {
  if (star === 5) return 12;
  if (star === 4) return 5;
  return star;
}

function getAttributeText(attribute) {
  const names = {
    water: '물',
    fire: '불',
    bomb: '폭탄',
    ball: '공',
    power: '힘',
    wall: '벽',
    blood: '피',
    none: ''
  };
  return names[attribute] || '';
}

function createEquipment() {
  const types = Object.keys(EQUIPMENT_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const minValue = type === 'needle' ? 3 : 3;
  const maxValue = type === 'needle' ? 10 : 45;
  return {
    id: equipmentId++,
    type: type,
    value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
  };
}

function createMergedEquipment(firstEquipment, secondEquipment) {
  const minValue = Math.min(firstEquipment.value, secondEquipment.value);
  const maxValue = firstEquipment.value + secondEquipment.value;
  return {
    id: equipmentId++,
    type: firstEquipment.type,
    value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
  };
}

function getEquipmentHtml(equipment) {
  const meta = EQUIPMENT_TYPES[equipment.type];
  return `
    <p class="equipment-name">${meta.name}</p>
    <p class="equipment-effect">${meta.description} +${equipment.value}%</p>
  `;
}

function getTowerEquipment(tower) {
  try {
    const equipment = JSON.parse(tower.dataset.equipment || '[null,null,null]');
    return [equipment[0] || null, equipment[1] || null, equipment[2] || null];
  } catch (error) {
    return [null, null, null];
  }
}

function setTowerEquipment(tower, equipment) {
  tower.dataset.equipment = JSON.stringify(equipment);
}

function getEquipmentBonus(tower, stat) {
  return getTowerEquipment(tower).reduce((sum, equipment) => {
    if (!equipment || EQUIPMENT_TYPES[equipment.type].stat !== stat) return sum;
    return sum + equipment.value / 100;
  }, 0);
}

function getTowerUpgradeTotal(tower) {
  return parseInt(tower.dataset.speedUpgrade || '0') +
    parseInt(tower.dataset.powerUpgrade || '0') +
    parseInt(tower.dataset.rangeUpgrade || '0');
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

function updateTopStatus() {
  updateSurvivalTime();
  coinBar.textContent = `${coins} $`;
  towerCountBar.textContent = `${getInstalledTowerCount()} / ${towerLimit} 포탑`;
}

function updateHealthText() {
  document.getElementById('health').textContent = `${Math.ceil(health)} / ${maxHealth} Hp`;
}

function getSupabaseConfig() {
  return window.SUPABASE_CONFIG || {};
}

function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && (config.publicKey || config.anonKey) && config.rankingsTable);
}

async function saveRanking() {
  if (!isSupabaseConfigured()) return;

  const config = getSupabaseConfig();
  const supabaseKey = config.publicKey || config.anonKey;
  const playerName = localStorage.getItem('name') || 'Guest';

  await fetch(`${config.url}/rest/v1/${config.rankingsTable}`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      name: playerName,
      survival_time: survivedSeconds
    })
  });
}

async function endGame() {
  if (isGameOver) return;

  isGameOver = true;
  try {
    await saveRanking();
  } catch (error) {
    console.error('Failed to save ranking', error);
  } finally {
    window.location.href = 'fail.html';
  }
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

function spawnEnemy() {
  if (isGamePaused) return;

  const maxLv = Math.floor(enemyId / 10) + 1;
  const spawnableLevels = [];
  for (let lv = 1; lv <= maxLv; lv += 1) {
    if (lv % 5 !== 0 || !spawnedLimitedEnemyLevels.has(lv)) spawnableLevels.push(lv);
  }
  const lv = spawnableLevels[Math.floor(Math.random() * spawnableLevels.length)];
  if (lv % 5 === 0) spawnedLimitedEnemyLevels.add(lv);
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
      health -= parseInt(enemyDiv.dataset.castleDamage || '1');
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
  updateInventoryView();
}

function spawnEquipment() {
  const equipment = createEquipment();
  addEquipmentToInventory(equipment);
}

function addEquipmentToInventory(equipment) {
  const div = document.createElement('div');
  div.className = `equipment equipment-${equipment.type}`;
  div.draggable = true;
  div.innerHTML = getEquipmentHtml(equipment);

  div.dataset.id = equipment.id;
  div.dataset.type = equipment.type;
  div.dataset.value = equipment.value;

  createBar.appendChild(div);
  makeEquipmentDraggable(div);
  updateInventoryView();
}

function setDefaultTowerStats(tower) {
  tower.dataset.speedUpgrade = tower.dataset.speedUpgrade || '0';
  tower.dataset.powerUpgrade = tower.dataset.powerUpgrade || '0';
  tower.dataset.rangeUpgrade = tower.dataset.rangeUpgrade || '0';
  tower.dataset.lastAttack = tower.dataset.lastAttack || '0';
  tower.dataset.equipment = tower.dataset.equipment || '[null,null,null]';
  tower.dataset.time = tower.dataset.time || '0';
}

function copyTowerStats(fromTower, toTower) {
  toTower.dataset.star = fromTower.dataset.star || '1';
  toTower.dataset.attribute = fromTower.dataset.attribute || 'none';
  toTower.dataset.speedUpgrade = fromTower.dataset.speedUpgrade || '0';
  toTower.dataset.powerUpgrade = fromTower.dataset.powerUpgrade || '0';
  toTower.dataset.rangeUpgrade = fromTower.dataset.rangeUpgrade || '0';
  toTower.dataset.lastAttack = fromTower.dataset.lastAttack || '0';
  toTower.dataset.equipment = fromTower.dataset.equipment || '[null,null,null]';
  toTower.dataset.time = fromTower.dataset.time || '0';
}

function getTowerDamage(tower) {
  const lv = parseInt(tower.dataset.lv);
  const star = parseInt(tower.dataset.star || '1');
  const powerUpgrade = parseInt(tower.dataset.powerUpgrade || '0');
  const baseDamage = Math.floor(Math.pow(lv, 1.5)) * 10;
  let attributeMultiplier = tower.dataset.attribute === 'power' ? 2 : 1;
  if (tower.dataset.attribute === 'blood') attributeMultiplier *= 0.5;
  return Math.floor(baseDamage * getTowerStarDamageMultiplier(star) * attributeMultiplier * (1 + powerUpgrade * 0.35 + globalPowerUpgrade * 0.2 + getEquipmentBonus(tower, 'power')));
}

function getTowerRange(tower) {
  const rangeUpgrade = parseInt(tower.dataset.rangeUpgrade || '0');
  return Math.floor((BASE_ATTACK_RANGE + rangeUpgrade * 60 + globalRangeUpgrade * 40) * (1 + getEquipmentBonus(tower, 'range')));
}

function getTowerAttackInterval(tower) {
  const speedUpgrade = parseInt(tower.dataset.speedUpgrade || '0');
  let attributeMultiplier = tower.dataset.attribute === 'ball' ? 0.5 : 1;
  if (tower.dataset.attribute === 'wall') attributeMultiplier *= 2;
  const starMultiplier = parseInt(tower.dataset.star || '1') === 5 ? 1 / 1.5 : 1;
  const equipmentMultiplier = Math.max(0.1, 1 - getEquipmentBonus(tower, 'speed'));
  return Math.max(MIN_ATTACK_INTERVAL, BASE_ATTACK_INTERVAL - speedUpgrade * 120 - globalSpeedUpgrade * 80) * attributeMultiplier * starMultiplier * equipmentMultiplier / gameSpeed;
}

function getBombRange(tower) {
  return Math.floor(130 * (1 + getEquipmentBonus(tower, 'splash')));
}

function getCriticalChance(tower) {
  return Math.min(MAX_CRITICAL_CHANCE, BASE_CRITICAL_CHANCE + criticalChanceUpgrade * 0.01 + getEquipmentBonus(tower, 'critChance'));
}

function getCriticalDamageMultiplier(tower) {
  return BASE_CRITICAL_DAMAGE_MULTIPLIER + criticalDamageUpgrade * 0.1 + getEquipmentBonus(tower, 'critDamage');
}

function applyCriticalDamage(tower, damage) {
  if (Math.random() >= getCriticalChance(tower)) return Math.floor(damage);
  return Math.floor(damage * getCriticalDamageMultiplier(tower));
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

function getTowerLimitUpgradeCost() {
  return 10 * Math.pow(10, towerLimitUpgrade);
}

function getInstalledTowerCount() {
  return [...board.querySelectorAll('.tower')].length;
}

function getUpgradeCostForLevel(key, level) {
  if (key === 'create') return Math.pow(level, 4) * 5;
  if (key === 'globalSpeed' || key === 'globalPower' || key === 'globalRange') return Math.pow(level + 1, 2) * 25;
  if (key === 'criticalChance') return 8 * Math.pow(8, level);
  if (key === 'criticalDamage') return 7 * Math.pow(7, level);
  if (key === 'castleHealth') return Math.pow(level + 1, 2) * 30;
  if (key === 'towerLimit') return 10 * Math.pow(10, level);
  if (!selectedTower) return Infinity;

  const towerLv = parseInt(selectedTower.dataset.lv);
  return towerLv * Math.pow(level + 1, 2) * 5;
}

function getCurrentUpgradeLevel(key) {
  if (key === 'create') return spawnLv;
  if (key === 'globalSpeed') return globalSpeedUpgrade;
  if (key === 'globalPower') return globalPowerUpgrade;
  if (key === 'globalRange') return globalRangeUpgrade;
  if (key === 'criticalChance') return criticalChanceUpgrade;
  if (key === 'criticalDamage') return criticalDamageUpgrade;
  if (key === 'castleHealth') return castleHealthUpgrade;
  if (key === 'towerLimit') return towerLimitUpgrade;
  if (!selectedTower) return 0;
  if (key === 'towerSpeed') return parseInt(selectedTower.dataset.speedUpgrade || '0');
  if (key === 'towerPower') return parseInt(selectedTower.dataset.powerUpgrade || '0');
  if (key === 'towerRange') return parseInt(selectedTower.dataset.rangeUpgrade || '0');
  return 0;
}

function getUpgradeCostForCount(key, count) {
  const currentLevel = getCurrentUpgradeLevel(key);
  let totalCost = 0;

  for (let i = 0; i < count; i += 1) {
    const level = key === 'create' ? currentLevel + i : currentLevel + i;
    totalCost += getUpgradeCostForLevel(key, level);
  }

  return totalCost;
}

function getMaxAffordableUpgradeCount(key) {
  let count = 0;
  let totalCost = 0;
  const currentLevel = getCurrentUpgradeLevel(key);

  while (count < 10000) {
    if (count >= getRemainingUpgradeCount(key)) break;
    const nextCost = getUpgradeCostForLevel(key, currentLevel + count);
    if (totalCost + nextCost > coins) break;
    totalCost += nextCost;
    count += 1;
  }

  return count;
}

function getSelectedUpgradeCount(key) {
  const amount = selectedUpgradeAmounts[key] || '1';
  if (amount === 'max') return getMaxAffordableUpgradeCount(key);
  return Math.min(parseInt(amount), getRemainingUpgradeCount(key));
}

function getRemainingUpgradeCount(key) {
  if (key === 'criticalChance') return Math.max(0, 90 - criticalChanceUpgrade);
  return Infinity;
}

function getSelectedUpgradeCost(key) {
  return getUpgradeCostForCount(key, getSelectedUpgradeCount(key));
}

function getUpgradeAmountLabel(key) {
  const amount = selectedUpgradeAmounts[key] || '1';
  if (amount !== 'max') return `x${amount}`;
  return `max x${getMaxAffordableUpgradeCount(key)}`;
}

function setupUpgradeAmountControls(button, key) {
  const wrapper = document.createElement('div');
  wrapper.className = 'upgrade-button-wrap';
  button.parentNode.insertBefore(wrapper, button);
  wrapper.appendChild(button);

  const controls = document.createElement('div');
  controls.className = 'upgrade-amount-controls';

  ['1', '10', '100'].forEach(amount => {
    const amountButton = document.createElement('button');
    amountButton.type = 'button';
    amountButton.className = 'upgrade-amount-btn';
    amountButton.textContent = `x${amount}`;
    amountButton.dataset.upgradeKey = key;
    amountButton.dataset.amount = amount;
    amountButton.addEventListener('click', () => {
      selectedUpgradeAmounts[key] = amount;
      refreshUpgradeUi();
    });
    controls.appendChild(amountButton);
  });

  wrapper.appendChild(controls);
}

function refreshUpgradeAmountControls() {
  document.querySelectorAll('.upgrade-amount-btn').forEach(button => {
    button.classList.toggle('active', selectedUpgradeAmounts[button.dataset.upgradeKey] === button.dataset.amount);
  });
}

function refreshGlobalUpgradeButtons() {
  const speedCost = getSelectedUpgradeCost('globalSpeed');
  const powerCost = getSelectedUpgradeCost('globalPower');
  const rangeCost = getSelectedUpgradeCost('globalRange');
  const criticalChanceCost = getSelectedUpgradeCost('criticalChance');
  const criticalDamageCost = getSelectedUpgradeCost('criticalDamage');
  const castleHealthCost = getSelectedUpgradeCost('castleHealth');

  globalSpeedBtn.textContent = `전체 속도 Lv.${globalSpeedUpgrade} ${getUpgradeAmountLabel('globalSpeed')} ${speedCost} $`;
  globalPowerBtn.textContent = `전체 힘 Lv.${globalPowerUpgrade} ${getUpgradeAmountLabel('globalPower')} ${powerCost} $`;
  globalRangeBtn.textContent = `전체 범위 Lv.${globalRangeUpgrade} ${getUpgradeAmountLabel('globalRange')} ${rangeCost} $`;
  criticalChanceBtn.textContent = `치명타 확률 ${Math.round(getCriticalChance(document.body) * 100)}% ${getUpgradeAmountLabel('criticalChance')} ${criticalChanceCost} $`;
  criticalDamageBtn.textContent = `치명타 피해 ${(getCriticalDamageMultiplier(document.body)).toFixed(1)}배 ${getUpgradeAmountLabel('criticalDamage')} ${criticalDamageCost} $`;
  castleHealthBtn.textContent = `성 체력 Lv.${castleHealthUpgrade} ${getUpgradeAmountLabel('castleHealth')} ${castleHealthCost} $`;
  const towerLimitCost = getSelectedUpgradeCost('towerLimit');
  towerLimitBtn.textContent = `설치 최대치 ${getInstalledTowerCount()} / ${towerLimit} ${getUpgradeAmountLabel('towerLimit')} ${towerLimitCost} $`;
  globalSpeedBtn.disabled = getSelectedUpgradeCount('globalSpeed') < 1 || coins < speedCost;
  globalPowerBtn.disabled = getSelectedUpgradeCount('globalPower') < 1 || coins < powerCost;
  globalRangeBtn.disabled = getSelectedUpgradeCount('globalRange') < 1 || coins < rangeCost;
  criticalChanceBtn.disabled = getSelectedUpgradeCount('criticalChance') < 1 || coins < criticalChanceCost;
  criticalDamageBtn.disabled = getSelectedUpgradeCount('criticalDamage') < 1 || coins < criticalDamageCost;
  castleHealthBtn.disabled = getSelectedUpgradeCount('castleHealth') < 1 || coins < castleHealthCost;
  towerLimitBtn.disabled = getSelectedUpgradeCount('towerLimit') < 1 || coins < towerLimitCost;
  refreshUpgradeAmountControls();
}

function refreshUpgradeUi() {
  updateTopStatus();
  refreshCreateUpgradeButton();
  refreshGlobalUpgradeButtons();
  if (selectedTower) refreshUpgradeModal();
}

function refreshCreateUpgradeButton() {
  const cost = getSelectedUpgradeCost('create');
  upgradeBtn.textContent = `생성 단계 향상 ${getUpgradeAmountLabel('create')} ${cost} $`;
  upgradeBtn.disabled = getSelectedUpgradeCount('create') < 1 || coins < cost;
  refreshUpgradeAmountControls();
}

function openUpgradeModal(tower) {
  if (!board.contains(tower)) return;
  if (selectedTower && selectedTower !== tower) selectedTower.classList.remove('selected');
  selectedTower = tower;
  isGamePaused = true;
  tower.classList.add('selected');
  refreshUpgradeModal();
  upgradeModal.classList.remove('hidden');
}

function closeUpgradeModal() {
  if (selectedTower) selectedTower.classList.remove('selected');
  selectedTower = null;
  isGamePaused = false;
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
  towerTimeText.textContent = `타임: ${parseInt(selectedTower.dataset.time || '0')}`;
  refreshEquipmentSlots();

  const speedCost = getSelectedUpgradeCost('towerSpeed');
  const powerCost = getSelectedUpgradeCost('towerPower');
  const rangeCost = getSelectedUpgradeCost('towerRange');
  const timeSpeedCount = getSelectedTimeUpgradeCount('speed');
  const timePowerCount = getSelectedTimeUpgradeCount('power');
  const timeRangeCount = getSelectedTimeUpgradeCount('range');
  const timeSpeedCost = getTimeUpgradeCostForCount(selectedTower, 'speed', timeSpeedCount);
  const timePowerCost = getTimeUpgradeCostForCount(selectedTower, 'power', timePowerCount);
  const timeRangeCost = getTimeUpgradeCostForCount(selectedTower, 'range', timeRangeCount);
  const starUpgradeCost = getTowerStarUpgradeCost(selectedTower);

  upgradeSpeedBtn.textContent = `공격 속도 향상 ${getUpgradeAmountLabel('towerSpeed')} ${speedCost} $`;
  upgradePowerBtn.textContent = `공격 힘 향상 ${getUpgradeAmountLabel('towerPower')} ${powerCost} $`;
  upgradeRangeBtn.textContent = `공격 범위 향상 ${getUpgradeAmountLabel('towerRange')} ${rangeCost} $`;
  timeUpgradeSpeedBtn.textContent = `타임 속도 향상 ${getTimeUpgradeAmountLabel('speed')} ${timeSpeedCost} T`;
  timeUpgradePowerBtn.textContent = `타임 힘 향상 ${getTimeUpgradeAmountLabel('power')} ${timePowerCost} T`;
  timeUpgradeRangeBtn.textContent = `타임 범위 향상 ${getTimeUpgradeAmountLabel('range')} ${timeRangeCost} T`;
  timeUpgradeStarBtn.textContent = getTowerStarUpgradeText(selectedTower);
  upgradeSpeedBtn.disabled = getSelectedUpgradeCount('towerSpeed') < 1 || coins < speedCost;
  upgradePowerBtn.disabled = getSelectedUpgradeCount('towerPower') < 1 || coins < powerCost;
  upgradeRangeBtn.disabled = getSelectedUpgradeCount('towerRange') < 1 || coins < rangeCost;
  timeUpgradeSpeedBtn.disabled = timeSpeedCount < 1 || parseInt(selectedTower.dataset.time || '0') < timeSpeedCost;
  timeUpgradePowerBtn.disabled = timePowerCount < 1 || parseInt(selectedTower.dataset.time || '0') < timePowerCost;
  timeUpgradeRangeBtn.disabled = timeRangeCount < 1 || parseInt(selectedTower.dataset.time || '0') < timeRangeCost;
  timeUpgradeStarBtn.disabled = starUpgradeCost === null || parseInt(selectedTower.dataset.time || '0') < starUpgradeCost;
  refreshGlobalUpgradeButtons();
}

function getTimeUpgradeCost(tower, type) {
  return parseInt(tower.dataset[`${type}Upgrade`] || '0') + 1;
}

function getUpgradeTypeFromKey(key) {
  if (key === 'towerSpeed') return 'speed';
  if (key === 'towerPower') return 'power';
  if (key === 'towerRange') return 'range';
  return '';
}

function getSelectedTimeUpgradeCount(type) {
  const amountKey = type === 'speed' ? 'towerSpeed' : type === 'power' ? 'towerPower' : 'towerRange';
  const amount = selectedUpgradeAmounts[amountKey] || '1';
  if (amount === 'max') return getMaxAffordableTimeUpgradeCount(type);
  return parseInt(amount);
}

function getTimeUpgradeCostForCount(tower, type, count) {
  const currentLevel = parseInt(tower.dataset[`${type}Upgrade`] || '0');
  let totalCost = 0;

  for (let i = 0; i < count; i += 1) {
    totalCost += currentLevel + i + 1;
  }

  return totalCost;
}

function getMaxAffordableTimeUpgradeCount(type) {
  if (!selectedTower) return 0;

  let count = 0;
  let totalCost = 0;
  const currentTime = parseInt(selectedTower.dataset.time || '0');
  const currentLevel = parseInt(selectedTower.dataset[`${type}Upgrade`] || '0');

  while (count < 10000) {
    const nextCost = currentLevel + count + 1;
    if (totalCost + nextCost > currentTime) break;
    totalCost += nextCost;
    count += 1;
  }

  return count;
}

function getTimeUpgradeAmountLabel(type) {
  const amountKey = type === 'speed' ? 'towerSpeed' : type === 'power' ? 'towerPower' : 'towerRange';
  const amount = selectedUpgradeAmounts[amountKey] || '1';
  if (amount !== 'max') return `x${amount}`;
  return `max x${getMaxAffordableTimeUpgradeCount(type)}`;
}

function getTowerStarUpgradeCost(tower) {
  const nextStar = parseInt(tower.dataset.star || '1') + 1;
  return TOWER_STAR_UPGRADE_COSTS[nextStar] || null;
}

function getTowerStarUpgradeText(tower) {
  const nextStar = parseInt(tower.dataset.star || '1') + 1;
  const cost = TOWER_STAR_UPGRADE_COSTS[nextStar];
  if (!cost) return '최대 성급';
  return `${nextStar}성으로 업그레이드 ${cost} T`;
}

function refreshEquipmentSlots() {
  if (!selectedTower) return;

  const equipment = getTowerEquipment(selectedTower);
  const upgradeTotal = getTowerUpgradeTotal(selectedTower);
  [...equipmentSlots.querySelectorAll('.equipment-slot')].forEach(slot => {
    const slotIndex = parseInt(slot.dataset.slot);
    const unlockLevel = EQUIPMENT_SLOT_UNLOCK_LEVELS[slotIndex];
    const equipped = equipment[slotIndex];
    const locked = upgradeTotal < unlockLevel;

    slot.classList.toggle('locked', locked);
    slot.classList.toggle('filled', !!equipped);
    slot.innerHTML = '';

    if (locked) {
      slot.innerHTML = `<span>${unlockLevel}Lv 잠금</span>`;
      return;
    }

    if (equipped) {
      slot.innerHTML = getEquipmentHtml(equipped);
      return;
    }

    slot.innerHTML = '<span>빈 슬롯</span>';
  });
}

function equipDraggedEquipment(slotIndex) {
  if (!selectedTower || !draggedEquipment) return;
  if (getTowerUpgradeTotal(selectedTower) < EQUIPMENT_SLOT_UNLOCK_LEVELS[slotIndex]) return;

  const equipment = getTowerEquipment(selectedTower);
  if (equipment[slotIndex]) return;

  equipment[slotIndex] = {
    id: parseInt(draggedEquipment.dataset.id),
    type: draggedEquipment.dataset.type,
    value: parseInt(draggedEquipment.dataset.value)
  };

  setTowerEquipment(selectedTower, equipment);
  draggedEquipment.remove();
  draggedEquipment = null;
  refreshUpgradeUi();
}

function unequipEquipment(slotIndex) {
  if (!selectedTower) return;

  const equipment = getTowerEquipment(selectedTower);
  const equipped = equipment[slotIndex];
  if (!equipped) return;

  equipment[slotIndex] = null;
  setTowerEquipment(selectedTower, equipment);
  addEquipmentToInventory(equipped);
  refreshUpgradeUi();
}

function releaseTowerEquipment(tower) {
  getTowerEquipment(tower).forEach(equipment => {
    if (equipment) addEquipmentToInventory(equipment);
  });
  setTowerEquipment(tower, [null, null, null]);
}

function upgradeSelectedTower(type) {
  if (!selectedTower || !document.body.contains(selectedTower)) return;

  const amountKey = type === 'speed' ? 'towerSpeed' : type === 'power' ? 'towerPower' : 'towerRange';
  const count = getSelectedUpgradeCount(amountKey);
  const cost = getSelectedUpgradeCost(amountKey);
  if (count < 1) return;
  if (coins < cost) return;

  coins -= cost;
  const key = `${type}Upgrade`;
  selectedTower.dataset[key] = `${parseInt(selectedTower.dataset[key] || '0') + count}`;
  refreshUpgradeUi();
}

function upgradeSelectedTowerWithTime(type) {
  if (!selectedTower || !document.body.contains(selectedTower)) return;

  const count = getSelectedTimeUpgradeCount(type);
  const cost = getTimeUpgradeCostForCount(selectedTower, type, count);
  const currentTime = parseInt(selectedTower.dataset.time || '0');
  if (count < 1) return;
  if (currentTime < cost) return;

  selectedTower.dataset.time = `${currentTime - cost}`;
  const key = `${type}Upgrade`;
  selectedTower.dataset[key] = `${parseInt(selectedTower.dataset[key] || '0') + count}`;
  refreshUpgradeUi();
}

function upgradeSelectedTowerStarWithTime() {
  if (!selectedTower || !document.body.contains(selectedTower)) return;

  const currentStar = parseInt(selectedTower.dataset.star || '1');
  const nextStar = currentStar + 1;
  const cost = TOWER_STAR_UPGRADE_COSTS[nextStar];
  const currentTime = parseInt(selectedTower.dataset.time || '0');
  if (!cost || currentTime < cost) return;

  selectedTower.dataset.time = `${currentTime - cost}`;
  selectedTower.dataset.star = `${nextStar}`;
  selectedTower.classList.remove('star-1', 'star-2', 'star-3', 'star-4', 'star-5');
  selectedTower.classList.add(`star-${nextStar}`);
  selectedTower.innerHTML = getTowerHtml(
    parseInt(selectedTower.dataset.lv),
    nextStar,
    selectedTower.dataset.attribute || 'none'
  );
  refreshUpgradeUi();
}

function upgradeGlobalTowerStat(type) {
  const amountKey = type === 'speed' ? 'globalSpeed' : type === 'power' ? 'globalPower' : 'globalRange';
  const count = getSelectedUpgradeCount(amountKey);
  const cost = getSelectedUpgradeCost(amountKey);
  if (count < 1) return;
  if (coins < cost) return;

  coins -= cost;

  if (type === 'speed') globalSpeedUpgrade += count;
  if (type === 'power') globalPowerUpgrade += count;
  if (type === 'range') globalRangeUpgrade += count;

  refreshUpgradeUi();
}

function upgradeCriticalStat(type) {
  const amountKey = type === 'chance' ? 'criticalChance' : 'criticalDamage';
  const count = getSelectedUpgradeCount(amountKey);
  const cost = getSelectedUpgradeCost(amountKey);
  if (count < 1) return;
  if (coins < cost) return;

  coins -= cost;
  if (type === 'chance') criticalChanceUpgrade += count;
  if (type === 'damage') criticalDamageUpgrade += count;

  refreshUpgradeUi();
}

function upgradeCastleHealth() {
  const count = getSelectedUpgradeCount('castleHealth');
  const cost = getSelectedUpgradeCost('castleHealth');
  if (count < 1) return;
  if (coins < cost) return;

  coins -= cost;
  castleHealthUpgrade += count;
  maxHealth = BASE_CASTLE_HEALTH + castleHealthUpgrade * 250;
  health = Math.min(maxHealth, health + 250 * count);
  updateHealthText();
  refreshUpgradeUi();
}

function upgradeTowerLimit() {
  const count = getSelectedUpgradeCount('towerLimit');
  const cost = getSelectedUpgradeCost('towerLimit');
  if (count < 1) return;
  if (coins < cost) return;

  coins -= cost;
  towerLimitUpgrade += count;
  towerLimit += count;
  refreshUpgradeUi();
}

function recoverCastleHealth() {
  if (isGamePaused) return;
  if (health >= maxHealth) return;

  health = Math.min(maxHealth, health + maxHealth * 0.01);
  updateHealthText();
}

function spawnBtn() {
  const cost = getTowerCreateCost();
  if (coins>=cost) {
    coins-=cost;
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
      releaseTowerEquipment(draggedTower);
      releaseTowerEquipment(elem);
      if (draggedTower === selectedTower || elem === selectedTower) closeUpgradeModal();
      draggedTower.remove();
      elem.remove();

      spawnTower(draggedLv+1, resultStar, resultAttribute);
    }
  });
}

function makeEquipmentDraggable(elem) {
  elem.addEventListener('dragstart', e => {
    draggedEquipment = elem;
    draggedTower = null;
  });

  elem.addEventListener('dragend', e => {
    draggedEquipment = null;
  });

  elem.addEventListener('dragover', e => {
    if (draggedEquipment && draggedEquipment !== elem) e.preventDefault();
  });

  elem.addEventListener('drop', e => {
    e.preventDefault();
    if (!draggedEquipment || draggedEquipment === elem) return;
    mergeEquipment(draggedEquipment, elem);
  });
}

function getEquipmentFromElement(elem) {
  return {
    id: parseInt(elem.dataset.id),
    type: elem.dataset.type,
    value: parseInt(elem.dataset.value)
  };
}

function mergeEquipment(firstElem, secondElem) {
  if (!firstElem.classList.contains('equipment') || !secondElem.classList.contains('equipment')) return;
  if (firstElem.dataset.type !== secondElem.dataset.type) return;

  const mergedEquipment = createMergedEquipment(
    getEquipmentFromElement(firstElem),
    getEquipmentFromElement(secondElem)
  );

  firstElem.remove();
  secondElem.remove();
  draggedEquipment = null;
  addEquipmentToInventory(mergedEquipment);
  setInventoryView('item');
}

function setInventoryView(view) {
  inventoryView = view;
  updateInventoryView();
}

function updateInventoryView() {
  const showTowers = inventoryView === 'tower';
  let visibleCount = 0;

  towerViewBtn.classList.toggle('active', showTowers);
  itemViewBtn.classList.toggle('active', !showTowers);

  [...createBar.querySelectorAll('.tower')].forEach(tower => {
    if (board.contains(tower)) return;
    tower.classList.toggle('hidden-inventory', !showTowers);
    if (showTowers) visibleCount += 1;
  });

  [...createBar.querySelectorAll('.equipment')].forEach(equipment => {
    equipment.classList.toggle('hidden-inventory', showTowers);
    if (!showTowers) visibleCount += 1;
  });

  inventoryEmpty.textContent = showTowers ? '대기 중인 포탑이 없습니다' : '보유 중인 아이템이 없습니다';
  inventoryEmpty.classList.toggle('hidden-inventory', visibleCount > 0);
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
      if (to === board && getInstalledTowerCount() >= towerLimit) {
        draggedTower = null;
        refreshUpgradeUi();
        return;
      }

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
        div.style.zIndex = '10';
      } else {
        div.classList.remove('installed');
        div.style.position = 'relative'; // 기본 정렬
        div.style.zIndex = '1';
      }

      makeDraggable(div);
      to.appendChild(div);
      updateInventoryView();
      refreshUpgradeUi();
    }

    draggedTower = null;
  };
}


board.addEventListener('drop', move(createBar, board));
createBar.addEventListener('drop', move(board, createBar));

equipmentSlots.addEventListener('dragover', e => {
  if (draggedEquipment) e.preventDefault();
});

equipmentSlots.addEventListener('drop', e => {
  e.preventDefault();
  const slot = e.target.closest('.equipment-slot');
  if (!slot) return;
  equipDraggedEquipment(parseInt(slot.dataset.slot));
});

equipmentSlots.addEventListener('click', e => {
  e.stopPropagation();
  const slot = e.target.closest('.equipment-slot');
  if (!slot || slot.classList.contains('locked')) return;
  unequipEquipment(parseInt(slot.dataset.slot));
});

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

function recoverCastleHealthByAmount(amount) {
  if (amount <= 0 || health >= maxHealth) return;

  health = Math.min(maxHealth, health + amount);
  updateHealthText();
}

function damageEnemy(enemy, damage, sourceTower = null) {
  if (!enemy || !document.body.contains(enemy.element)) return 0;

  const appliedDamage = Math.floor(damage);
  enemy.hp -= appliedDamage;
  enemy.element.innerHTML = getEnemyHtml(enemy);

  if (enemy.hp <= 0) {
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
  }

  return appliedDamage;
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
    targetEnemy.element.dataset.slowUntil = `${Date.now() + 3000}`;
  }

  if (attribute === 'wall' && document.body.contains(targetEnemy.element)) {
    targetEnemy.element.dataset.stopUntil = `${Date.now() + 3000}`;
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

  const oldMaxHp = getBaseEnemyHp(enemy.lv) * getEnemyStarHealthMultiplier(enemy.star);
  const newMaxHp = getBaseEnemyHp(enemy.lv) * getEnemyStarHealthMultiplier(3);

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
    damageEnemy(enemy, baseDamage * 0.25, fromTower);

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

    if (dist <= bombRange) damageEnemy(enemy, damage, fromTower);
  });
}

function towerAttackLoop() {
  if (isGamePaused) return;

  const towers = document.querySelectorAll('.tower');
  const now = Date.now();
  towers.forEach(tower => {
    if (!board.contains(tower)) return;
    const lastAttack = parseInt(tower.dataset.lastAttack || '0');
    if (now - lastAttack < getTowerAttackInterval(tower)) return;

    const towerRect = tower.getBoundingClientRect();
    const towerRange = getTowerRange(tower);
    let targetEnemy = null;
    let nearestDistance = Infinity;

    enemies.forEach(enemy => {
      if (!document.body.contains(enemy.element)) return;

      const enemyRect = enemy.element.getBoundingClientRect();
      const dx = (enemyRect.left + 40) - (towerRect.left + 40);
      const dy = (enemyRect.top + 40) - (towerRect.top + 40);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < towerRange && dist < nearestDistance) {
        targetEnemy = enemy;
        nearestDistance = dist;
      }
    });

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
    if (enemy.lv%5!=0 || !document.body.contains(enemy.element)) return;

    enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * 0.01);
    enemy.element.innerHTML = getEnemyHtml(enemy);
  });
}

function getTowerCreateCost() {
  return Math.ceil(Math.pow(spawnLv, 2.6));
}

function updateSpeedModeButton() {
  speedModeBtn.textContent = `${gameSpeed}배속`;
  speedModeBtn.classList.toggle('active', gameSpeed !== 1);
}

function resetGameIntervals() {
  if (enemySpawnInterval) clearInterval(enemySpawnInterval);
  if (towerAttackInterval) clearInterval(towerAttackInterval);
  if (castleRecoverInterval) clearInterval(castleRecoverInterval);
  if (survivalTimerInterval) clearInterval(survivalTimerInterval);
  if (towerTimeInterval) clearInterval(towerTimeInterval);
  if (bossRecoverInterval) clearInterval(bossRecoverInterval);

  enemySpawnInterval = setInterval(spawnEnemy, 5000 / gameSpeed);
  towerAttackInterval = setInterval(towerAttackLoop, 100 / gameSpeed);
  castleRecoverInterval = setInterval(recoverCastleHealth, 1000 / gameSpeed);
  towerTimeInterval = setInterval(towerTimeLoop, 1000 / gameSpeed);
  bossRecoverInterval = setInterval(bossRecoverLoop, 1000 / gameSpeed);
  survivalTimerInterval = setInterval(() => {
    if (isGamePaused) return;

    survivedSeconds += 1;
    updateTopStatus();
  }, 1000 / gameSpeed);
}

function toggleSpeedMode() {
  if (gameSpeed === 1) gameSpeed = 2;
  else if (gameSpeed === 2) gameSpeed = 5;
  else gameSpeed = 1;
  updateSpeedModeButton();
  resetGameIntervals();
}


function upgradeCreate() {
  const count = getSelectedUpgradeCount('create');
  const cost = getSelectedUpgradeCost('create');
  if (count < 1) return;
  if ( coins >= cost ) {
    coins -= cost;
    spawnLv += count;
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
timeUpgradeSpeedBtn.addEventListener('click', () => upgradeSelectedTowerWithTime('speed'));
timeUpgradePowerBtn.addEventListener('click', () => upgradeSelectedTowerWithTime('power'));
timeUpgradeRangeBtn.addEventListener('click', () => upgradeSelectedTowerWithTime('range'));
timeUpgradeStarBtn.addEventListener('click', upgradeSelectedTowerStarWithTime);
globalSpeedBtn.addEventListener('click', () => upgradeGlobalTowerStat('speed'));
globalPowerBtn.addEventListener('click', () => upgradeGlobalTowerStat('power'));
globalRangeBtn.addEventListener('click', () => upgradeGlobalTowerStat('range'));
criticalChanceBtn.addEventListener('click', () => upgradeCriticalStat('chance'));
criticalDamageBtn.addEventListener('click', () => upgradeCriticalStat('damage'));
castleHealthBtn.addEventListener('click', upgradeCastleHealth);
towerLimitBtn.addEventListener('click', upgradeTowerLimit);
speedModeBtn.addEventListener('click', toggleSpeedMode);
towerViewBtn.addEventListener('click', () => setInventoryView('tower'));
itemViewBtn.addEventListener('click', () => setInventoryView('item'));
setupUpgradeAmountControls(upgradeBtn, 'create');
setupUpgradeAmountControls(globalSpeedBtn, 'globalSpeed');
setupUpgradeAmountControls(globalPowerBtn, 'globalPower');
setupUpgradeAmountControls(globalRangeBtn, 'globalRange');
setupUpgradeAmountControls(criticalChanceBtn, 'criticalChance');
setupUpgradeAmountControls(criticalDamageBtn, 'criticalDamage');
setupUpgradeAmountControls(castleHealthBtn, 'castleHealth');
setupUpgradeAmountControls(towerLimitBtn, 'towerLimit');
setupUpgradeAmountControls(upgradeSpeedBtn, 'towerSpeed');
setupUpgradeAmountControls(upgradePowerBtn, 'towerPower');
setupUpgradeAmountControls(upgradeRangeBtn, 'towerRange');
updateHealthText();
updateSpeedModeButton();
priceBar.textContent = `${getTowerCreateCost()} $`;
refreshUpgradeUi();
updateInventoryView();
resetGameIntervals();
