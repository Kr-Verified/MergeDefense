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

function getRandomTowerAttribute() {
  if (Math.random() >= 0.4) return 'none';
  const attributes = ['water', 'fire', 'bomb', 'ball', 'power', 'wall', 'blood'];
  return attributes[Math.floor(Math.random() * attributes.length)];
}

function getStarText(star) {
  return `${star}성`;
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
  if (names[attribute] !== undefined) return names[attribute];
  if (attribute && attribute.includes('+')) {
    return attribute.split('+').map(part => names[part] || part).join('');
  }
  return attribute || '';
}

function getAttributeClass(attribute) {
  if (!attribute || attribute === 'none') return 'none';
  return BASE_ATTRIBUTES.includes(attribute) ? attribute : 'fused';
}

function getTowerUpgradeTotal(tower) {
  return parseInt(tower.dataset.speedUpgrade || '0') +
    parseInt(tower.dataset.powerUpgrade || '0') +
    parseInt(tower.dataset.rangeUpgrade || '0') +
    parseInt(tower.dataset.hpUpgrade || '0');
}

function getTowerHtml(lv, star, attribute = 'none') {
  const stars = '★'.repeat(star);
  const attributeText = getAttributeText(attribute);
  return `
    <p class="tower-level">${lv} Lv</p>
    <div class="tower-hp-bar"><div class="tower-hp-fill"></div></div>
    <div class="tower-image-wrap">
      <img src="./img/${lv}.png" alt="${lv} Lv tower">
      <span class="tower-star-badge">${stars}</span>
      ${attributeText ? `<span class="tower-attribute-badge attribute-${getAttributeClass(attribute)}">${attributeText}</span>` : ''}
    </div>
  `;
}

function setTowerAttribute(tower, attribute) {
  if (isSpectatorMode()) return;
  tower.dataset.attribute = attribute;
  tower.className = tower.className.replace(/attribute-\S+/, `attribute-${getAttributeClass(attribute)}`);
  const lv = parseInt(tower.dataset.lv);
  const star = parseInt(tower.dataset.star || '1');
  tower.innerHTML = getTowerHtml(lv, star, attribute);
  renderTowerHpBar(tower);
  reportTeamSharedState();
}

function getTowerMaxHp(tower) {
  const lv = parseInt(tower.dataset.lv);
  const star = parseInt(tower.dataset.star || '1');
  const hpUpgrade = parseInt(tower.dataset.hpUpgrade || '0');
  const baseMaxHp = lv * 50 * getTowerStarDamageMultiplier(star);
  return Math.max(1, Math.floor(baseMaxHp * (1 + hpUpgrade * TOWER_HP_UPGRADE_MULTIPLIER + getEquipmentBonus(tower, 'maxHp'))));
}

function applyTowerMaxHpDelta(tower, oldMaxHp) {
  const newMaxHp = getTowerMaxHp(tower);
  if (newMaxHp === oldMaxHp) return;

  tower.dataset.maxHp = `${newMaxHp}`;
  const currentHp = parseInt(tower.dataset.hp || `${oldMaxHp}`);
  tower.dataset.hp = `${Math.max(1, Math.min(newMaxHp, currentHp + (newMaxHp - oldMaxHp)))}`;
  renderTowerHpBar(tower);
}

function renderTowerHpBar(tower) {
  const hpFill = tower.querySelector('.tower-hp-fill');
  if (!hpFill) return;

  const maxHp = parseInt(tower.dataset.maxHp || '1');
  const hp = parseInt(tower.dataset.hp || '0');
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  hpFill.style.width = `${ratio * 100}%`;
  hpFill.classList.toggle('low', ratio <= 0.3);
  hpFill.classList.toggle('mid', ratio > 0.3 && ratio <= 0.6);
}

function destroyTower(tower) {
  if (!tower || !board.contains(tower)) return;

  releaseTowerEquipment(tower);
  if (tower === selectedTower) closeUpgradeModal();
  tower.remove();
  refreshUpgradeUi();
  reportTeamSharedState();
}

function spawnTower(lv, star = getRandomTowerStar(), attribute = getRandomTowerAttribute()) {
  if (isSpectatorMode()) return;
  const tower = createTower(lv, star, attribute);
  const div = document.createElement('div');
  div.className = `tower star-${tower.star} attribute-${getAttributeClass(tower.attribute)}`;
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

function setDefaultTowerStats(tower) {
  tower.dataset.speedUpgrade = tower.dataset.speedUpgrade || '0';
  tower.dataset.powerUpgrade = tower.dataset.powerUpgrade || '0';
  tower.dataset.rangeUpgrade = tower.dataset.rangeUpgrade || '0';
  tower.dataset.hpUpgrade = tower.dataset.hpUpgrade || '0';
  tower.dataset.lastAttack = tower.dataset.lastAttack || '0';
  tower.dataset.equipment = tower.dataset.equipment || '[null,null,null]';
  tower.dataset.time = tower.dataset.time || '0';
  tower.dataset.targetPriority = tower.dataset.targetPriority || DEFAULT_TARGET_PRIORITY;
  tower.dataset.stunUntil = tower.dataset.stunUntil || '0';
  if (!tower.dataset.maxHp) {
    const maxHp = getTowerMaxHp(tower);
    tower.dataset.maxHp = `${maxHp}`;
    tower.dataset.hp = `${maxHp}`;
  }
  renderTowerHpBar(tower);
}

function copyTowerStats(fromTower, toTower) {
  toTower.dataset.star = fromTower.dataset.star || '1';
  toTower.dataset.attribute = fromTower.dataset.attribute || 'none';
  toTower.dataset.speedUpgrade = fromTower.dataset.speedUpgrade || '0';
  toTower.dataset.powerUpgrade = fromTower.dataset.powerUpgrade || '0';
  toTower.dataset.rangeUpgrade = fromTower.dataset.rangeUpgrade || '0';
  toTower.dataset.hpUpgrade = fromTower.dataset.hpUpgrade || '0';
  toTower.dataset.lastAttack = fromTower.dataset.lastAttack || '0';
  toTower.dataset.equipment = fromTower.dataset.equipment || '[null,null,null]';
  toTower.dataset.time = fromTower.dataset.time || '0';
  toTower.dataset.targetPriority = fromTower.dataset.targetPriority || DEFAULT_TARGET_PRIORITY;
  toTower.dataset.stunUntil = fromTower.dataset.stunUntil || '0';
  toTower.dataset.maxHp = fromTower.dataset.maxHp || `${getTowerMaxHp(toTower)}`;
  toTower.dataset.hp = fromTower.dataset.hp || toTower.dataset.maxHp;
  renderTowerHpBar(toTower);
}

function getTowerDamage(tower) {
  const lv = parseInt(tower.dataset.lv);
  const star = parseInt(tower.dataset.star || '1');
  const powerUpgrade = parseInt(tower.dataset.powerUpgrade || '0');
  const baseDamage = Math.floor(Math.pow(lv, 1.5)) * 10;
  const attributeMultiplier = getAttributeDamageMult(tower.dataset.attribute || 'none') * getTowerActiveBuffDamageMult(tower);
  return Math.floor(baseDamage * getTowerStarDamageMultiplier(star) * attributeMultiplier * (1 + powerUpgrade * 0.35 + globalPowerUpgrade * 0.2 + getEquipmentBonus(tower, 'power')));
}

function getTowerRange(tower) {
  const rangeUpgrade = parseInt(tower.dataset.rangeUpgrade || '0');
  return Math.floor((BASE_ATTACK_RANGE + rangeUpgrade * 60 + globalRangeUpgrade * 40) * (1 + getEquipmentBonus(tower, 'range')));
}

function getTowerAttackInterval(tower) {
  const speedUpgrade = parseInt(tower.dataset.speedUpgrade || '0');
  const attributeMultiplier = getAttributeAtkIntervalMult(tower.dataset.attribute || 'none') * getTowerActiveBuffAtkIntervalMult(tower);
  const starMultiplier = parseInt(tower.dataset.star || '1') === 5 ? 1 / 1.5 : 1;
  const equipmentMultiplier = Math.max(0.1, 1 - getEquipmentBonus(tower, 'speed'));
  if (gameSpeed === 0) return Infinity;
  return Math.max(MIN_ATTACK_INTERVAL, BASE_ATTACK_INTERVAL - speedUpgrade * TOWER_SPEED_UPGRADE_STEP - globalSpeedUpgrade * GLOBAL_SPEED_UPGRADE_STEP) * attributeMultiplier * starMultiplier * equipmentMultiplier / gameSpeed;
}

function getBombRange(tower) {
  const splash = getAttributeSplashConfig(tower.dataset.attribute || 'none');
  return Math.floor(130 * (splash?.radiusMult || 1) * (1 + getEquipmentBonus(tower, 'splash')));
}

function getCriticalChance(tower) {
  return Math.min(MAX_CRITICAL_CHANCE, BASE_CRITICAL_CHANCE + criticalChanceUpgrade * 0.01 + getEquipmentBonus(tower, 'critChance'));
}

function getCriticalDamageMultiplier(tower) {
  return BASE_CRITICAL_DAMAGE_MULTIPLIER + criticalDamageUpgrade * 0.1 + getEquipmentBonus(tower, 'critDamage');
}

function refreshCreateUpgradeButton() {
  const cost = getSelectedUpgradeCost('create');
  upgradeBtn.textContent = `생성 단계 향상 ${getUpgradeAmountLabel('create')} ${cost} $`;
  upgradeBtn.disabled = getSelectedUpgradeCount('create') < 1 || coins < cost;
  refreshUpgradeAmountControls();
}

function spawnBtn() {
  if (isSpectatorMode()) return;
  const cost = getTowerCreateCost();
  if (coins>=cost) {
    coins-=cost;
    spawnTower(spawnLv);
    refreshUpgradeUi();
    reportTeamSharedState();
  }
}

function getMergedTowerAttribute(firstAttribute, secondAttribute) {
  if (firstAttribute === 'ball' || secondAttribute === 'ball') return 'ball';
  if (firstAttribute !== 'none') return firstAttribute;
  return secondAttribute;
}

function getTowerCreateCost() {
  return Math.ceil(Math.pow(spawnLv, 2.6));
}
