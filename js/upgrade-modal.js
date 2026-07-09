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

function openUpgradeModal(tower) {
  if (isSpectatorMode()) return;
  if (!board.contains(tower)) return;
  if (selectedTower && selectedTower !== tower) selectedTower.classList.remove('selected');
  selectedTower = tower;
  isUpgradeModalOpen = true;
  updateGamePausedState();
  tower.classList.add('selected');
  refreshUpgradeModal();
  upgradeModal.classList.remove('hidden');
}

function closeUpgradeModal() {
  if (selectedTower) selectedTower.classList.remove('selected');
  selectedTower = null;
  isUpgradeModalOpen = false;
  updateGamePausedState();
  upgradeModal.classList.add('hidden');
}

function deleteSelectedTower() {
  if (isSpectatorMode()) return;
  if (!selectedTower) return;

  const cost = getTowerDeleteCost(selectedTower);
  if (coins < cost) return;

  coins -= cost;
  destroyTower(selectedTower);
  updateInventoryView();
  refreshUpgradeUi();
  updateTopStatus();
  reportTeamSharedState();
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
  towerHpText.textContent = `체력: ${parseInt(selectedTower.dataset.hp || '0')} / ${parseInt(selectedTower.dataset.maxHp || '0')}${Date.now() < parseInt(selectedTower.dataset.stunUntil || '0') ? ' (기절)' : ''}`;
  towerTimeText.textContent = `타임: ${parseInt(selectedTower.dataset.time || '0')}`;
  const deleteCost = getTowerDeleteCost(selectedTower);
  sellTowerBtn.textContent = `포탑 삭제 -${deleteCost} $`;
  sellTowerBtn.disabled = coins < deleteCost;
  refreshEquipmentSlots();
  refreshTargetingOptions();

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

function refreshTargetingOptions() {
  if (!selectedTower) return;

  const priority = selectedTower.dataset.targetPriority || DEFAULT_TARGET_PRIORITY;
  [...targetingOptions.querySelectorAll('.targeting-btn')].forEach(button => {
    button.classList.toggle('active', button.dataset.priority === priority);
  });
}

function setSelectedTowerTargetPriority(priority) {
  if (isSpectatorMode()) return;
  if (!selectedTower || !TARGET_PRIORITIES.includes(priority)) return;

  selectedTower.dataset.targetPriority = priority;
  refreshTargetingOptions();
  reportTeamSharedState();
}

function upgradeSelectedTower(type) {
  if (isSpectatorMode()) return;
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
  reportTeamSharedState();
}

function upgradeSelectedTowerWithTime(type) {
  if (isSpectatorMode()) return;
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
  reportTeamSharedState();
}

function upgradeSelectedTowerStarWithTime() {
  if (isSpectatorMode()) return;
  if (!selectedTower || !document.body.contains(selectedTower)) return;

  const currentStar = parseInt(selectedTower.dataset.star || '1');
  const nextStar = currentStar + 1;
  const cost = TOWER_STAR_UPGRADE_COSTS[nextStar];
  const currentTime = parseInt(selectedTower.dataset.time || '0');
  if (!cost || currentTime < cost) return;

  const oldMaxHp = getTowerMaxHp(selectedTower);
  const currentHp = parseInt(selectedTower.dataset.hp || `${oldMaxHp}`);

  selectedTower.dataset.time = `${currentTime - cost}`;
  selectedTower.dataset.star = `${nextStar}`;
  selectedTower.classList.remove('star-1', 'star-2', 'star-3', 'star-4', 'star-5');
  selectedTower.classList.add(`star-${nextStar}`);
  selectedTower.innerHTML = getTowerHtml(
    parseInt(selectedTower.dataset.lv),
    nextStar,
    selectedTower.dataset.attribute || 'none'
  );

  const newMaxHp = getTowerMaxHp(selectedTower);
  selectedTower.dataset.maxHp = `${newMaxHp}`;
  selectedTower.dataset.hp = `${currentHp + (newMaxHp - oldMaxHp)}`;
  renderTowerHpBar(selectedTower);
  refreshUpgradeUi();
  reportTeamSharedState();
}

function upgradeGlobalTowerStat(type) {
  if (isSpectatorMode()) return;
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
  reportTeamSharedState();
}

function upgradeCriticalStat(type) {
  if (isSpectatorMode()) return;
  const amountKey = type === 'chance' ? 'criticalChance' : 'criticalDamage';
  const count = getSelectedUpgradeCount(amountKey);
  const cost = getSelectedUpgradeCost(amountKey);
  if (count < 1) return;
  if (coins < cost) return;

  coins -= cost;
  if (type === 'chance') criticalChanceUpgrade += count;
  if (type === 'damage') criticalDamageUpgrade += count;

  refreshUpgradeUi();
  reportTeamSharedState();
}

function upgradeCastleHealth() {
  if (isSpectatorMode()) return;
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
  reportTeamSharedState();
}

function upgradeTowerLimit() {
  if (isSpectatorMode()) return;
  const count = getSelectedUpgradeCount('towerLimit');
  const cost = getSelectedUpgradeCost('towerLimit');
  if (count < 1) return;
  if (coins < cost) return;

  coins -= cost;
  towerLimitUpgrade += count;
  towerLimit += count;
  refreshUpgradeUi();
  reportTeamSharedState();
}

targetingOptions.addEventListener('click', e => {
  e.stopPropagation();
  const button = e.target.closest('.targeting-btn');
  if (!button) return;
  setSelectedTowerTargetPriority(button.dataset.priority);
});
