const GAME_SAVE_VERSION = 1;
const SOLO_SAVE_KEY = 'mergedefense:solo';

function getCurrentGameSaveKey() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('room');
  return roomId ? `mergedefense:team:${roomId}` : SOLO_SAVE_KEY;
}

function isPersistenceDisabled() {
  return Boolean(window.TeamSession && window.TeamSession.isActive() && window.TeamSession.isSpectator);
}

function serializeElementDataset(element) {
  return Object.keys(element.dataset).reduce((data, key) => {
    data[key] = element.dataset[key];
    return data;
  }, {});
}

function serializeTowerState(tower) {
  const inBoard = board.contains(tower);
  return {
    container: inBoard ? 'board' : 'inventory',
    dataset: serializeElementDataset(tower),
    left: tower.style.left || '',
    top: tower.style.top || '',
    zIndex: tower.style.zIndex || ''
  };
}

function serializeEquipmentState(equipment) {
  return {
    id: parseInt(equipment.dataset.id, 10),
    type: equipment.dataset.type,
    value: parseInt(equipment.dataset.value, 10)
  };
}

function serializeEnemyState(enemy) {
  return {
    id: enemy.id,
    lv: enemy.lv,
    star: enemy.star,
    attribute: enemy.attribute,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    castleDamage: enemy.castleDamage,
    dataset: enemy.element ? serializeElementDataset(enemy.element) : {},
    left: enemy.element?.style.left || '',
    top: enemy.element?.style.top || '',
    zIndex: enemy.element?.style.zIndex || ''
  };
}

function serializeGameState() {
  return {
    saveVersion: GAME_SAVE_VERSION,
    version: Date.now(),
    globals: {
      coins,
      personalTimeTokens,
      spawnLv,
      health,
      maxHealth,
      globalSpeedUpgrade,
      globalPowerUpgrade,
      globalRangeUpgrade,
      criticalChanceUpgrade,
      criticalDamageUpgrade,
      castleHealthUpgrade,
      towerLimitUpgrade,
      towerLimit,
      gameSpeed,
      survivedSeconds,
      enemySpawnSlowUntil,
      towerId,
      enemyId,
      equipmentId,
      attributeOrbs: { ...attributeOrbs },
      ownedRecipeBooks: { ...ownedRecipeBooks },
      spawnedLimitedEnemyLevels: [...spawnedLimitedEnemyLevels],
      skillLastUsed: typeof skillLastUsed === 'object' ? { ...skillLastUsed } : {}
    },
    towers: [...document.querySelectorAll('.tower')].map(serializeTowerState),
    equipment: [...document.querySelectorAll('#create-bar .equipment')].map(serializeEquipmentState),
    enemies: enemies
      .filter(enemy => enemy.element && document.body.contains(enemy.element))
      .map(serializeEnemyState)
  };
}

function clearEnemyElement(enemy) {
  if (enemy?.element?._moveInterval) clearInterval(enemy.element._moveInterval);
  if (enemy?.element && document.body.contains(enemy.element)) enemy.element.remove();
}

function captureLocalUiState() {
  const towerIdOf = tower => tower?.dataset?.id || null;
  return {
    selectedTowerId: towerIdOf(selectedTower),
    waitingTowerId: towerIdOf(waitingTowerActionTarget),
    draggedTowerId: towerIdOf(draggedTower),
    draggedEquipmentId: draggedEquipment?.dataset?.id || null,
    upgradeOpen: !upgradeModal?.classList.contains('hidden'),
    towerActionOpen: !towerActionPopup?.classList.contains('hidden'),
    deleteOpen: !deleteTowerModal?.classList.contains('hidden'),
    fusionOpen: !fusionModal?.classList.contains('hidden'),
    blacksmithOpen: !blacksmithModal?.classList.contains('hidden'),
    forgeSlots: typeof forgeSlots !== 'undefined' ? [...forgeSlots] : null,
    forgeActiveSlot: typeof forgeActiveSlot !== 'undefined' ? forgeActiveSlot : null
  };
}

function restoreLocalUiState(uiState) {
  if (!uiState) return;
  const findTower = id => id === null ? null : [...document.querySelectorAll('.tower')].find(tower => tower.dataset.id === String(id)) || null;
  const findEquipment = id => id === null ? null : [...document.querySelectorAll('#create-bar .equipment')].find(item => item.dataset.id === String(id)) || null;

  selectedTower = findTower(uiState.selectedTowerId);
  waitingTowerActionTarget = findTower(uiState.waitingTowerId);
  draggedTower = findTower(uiState.draggedTowerId);
  draggedEquipment = findEquipment(uiState.draggedEquipmentId);

  if (selectedTower && uiState.upgradeOpen && board.contains(selectedTower)) {
    selectedTower.classList.add('selected');
    isUpgradeModalOpen = true;
    updateGamePausedState();
    upgradeModal.classList.remove('hidden');
    refreshUpgradeModal();
  }
  if (waitingTowerActionTarget && uiState.towerActionOpen) towerActionPopup.classList.remove('hidden');
  if (waitingTowerActionTarget && uiState.deleteOpen) deleteTowerModal.classList.remove('hidden');
  if (waitingTowerActionTarget && uiState.fusionOpen) fusionModal.classList.remove('hidden');
  if (uiState.blacksmithOpen) {
    if (uiState.forgeSlots) forgeSlots = [...uiState.forgeSlots];
    forgeActiveSlot = uiState.forgeActiveSlot;
    refreshBlacksmithModal();
    blacksmithModal.classList.remove('hidden');
  }
}

function clearCurrentGameEntities() {
  if (selectedTower) selectedTower.classList.remove('selected');
  selectedTower = null;
  waitingTowerActionTarget = null;
  draggedTower = null;
  draggedEquipment = null;
  if (typeof closeUpgradeModal === 'function') closeUpgradeModal();
  if (typeof closeDeleteTowerModal === 'function') closeDeleteTowerModal();
  if (typeof closeFusionModal === 'function') closeFusionModal();
  if (typeof closeBlacksmithModal === 'function') closeBlacksmithModal();

  document.querySelectorAll('.tower').forEach(tower => tower.remove());
  document.querySelectorAll('#create-bar .equipment, #create-bar .recipe-book').forEach(item => item.remove());
  enemies.forEach(clearEnemyElement);
  enemies.length = 0;
  document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
}

function createTowerFromSavedState(state) {
  const data = state.dataset || {};
  const lv = parseInt(data.lv || '1', 10);
  const star = parseInt(data.star || '1', 10);
  const attribute = data.attribute || 'none';
  const tower = document.createElement('div');
  tower.className = `tower star-${star} attribute-${getAttributeClass(attribute)}`;
  if (state.container === 'board') tower.classList.add('installed');
  tower.innerHTML = getTowerHtml(lv, star, attribute);
  tower.draggable = true;
  Object.keys(data).forEach(key => { tower.dataset[key] = data[key]; });
  applyTowerSizeClass(tower);
  reconcileTowerEquipmentStats(tower);

  if (state.container === 'board') {
    tower.style.position = 'absolute';
    tower.style.left = state.left || '0px';
    tower.style.top = state.top || '0px';
    tower.style.zIndex = state.zIndex || '10';
  } else {
    tower.style.position = 'relative';
    tower.style.zIndex = state.zIndex || '1';
  }

  makeDraggable(tower);
  renderTowerHpBar(tower);
  return tower;
}

function createEquipmentFromSavedState(equipment) {
  const div = document.createElement('div');
  div.className = `equipment equipment-${equipment.type}`;
  div.draggable = true;
  div.innerHTML = getEquipmentHtml(equipment);
  div.dataset.id = equipment.id;
  div.dataset.type = equipment.type;
  div.dataset.value = equipment.value;
  makeEquipmentDraggable(div);
  return div;
}

function createEnemyFromSavedState(state) {
  const enemy = createEnemy(
    parseInt(state.lv || state.dataset?.lv || '1', 10),
    parseInt(state.star || state.dataset?.star || '1', 10),
    state.attribute || state.dataset?.attribute || 'none'
  );
  enemy.id = parseInt(state.id ?? state.dataset?.id ?? enemy.id, 10);
  enemy.hp = Number(state.hp ?? state.dataset?.hp ?? enemy.hp);
  enemy.maxHp = Number(state.maxHp ?? state.dataset?.maxHp ?? enemy.maxHp);
  enemy.castleDamage = parseInt(state.castleDamage ?? state.dataset?.castleDamage ?? enemy.castleDamage, 10);

  const div = document.createElement('div');
  div.className = `enemy star-${enemy.star} enemy-attr-${enemy.attribute}`;
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.style.position = 'absolute';
  div.style.left = state.left || '90vw';
  div.style.top = state.top || '0px';
  div.style.zIndex = state.zIndex || '';
  div.draggable = true;
  div.innerHTML = getEnemyHtml(enemy);
  enemy.element = div;

  const data = state.dataset || {};
  Object.keys(data).forEach(key => { div.dataset[key] = data[key]; });
  div.dataset.id = enemy.id;
  div.dataset.lv = enemy.lv;
  div.dataset.star = enemy.star;
  div.dataset.attribute = enemy.attribute;
  div.dataset.maxHp = enemy.maxHp;
  div.dataset.castleDamage = enemy.castleDamage;
  div.dataset.lastCastleAttack = div.dataset.lastCastleAttack || '0';
  div.dataset.lastTeleport = div.dataset.lastTeleport || '0';

  board.appendChild(div);
  makeDraggable(div);
  enemies.push(enemy);

  const defense = document.getElementById('defense');
  const defenseRect = defense.getBoundingClientRect();
  moveEnemy(div, defenseRect.left, defenseRect.top);
  return enemy;
}

function applyGameState(state, options = {}) {
  if (!state || state.saveVersion !== GAME_SAVE_VERSION || isGameOver) return false;

  const localUiState = options.preserveLocalUi ? captureLocalUiState() : null;
  clearCurrentGameEntities();

  const globals = state.globals || {};
  coins = globals.coins ?? coins;
  personalTimeTokens = globals.personalTimeTokens ?? personalTimeTokens;
  spawnLv = globals.spawnLv ?? spawnLv;
  health = globals.health ?? health;
  maxHealth = globals.maxHealth ?? maxHealth;
  globalSpeedUpgrade = globals.globalSpeedUpgrade ?? globalSpeedUpgrade;
  globalPowerUpgrade = globals.globalPowerUpgrade ?? globalPowerUpgrade;
  globalRangeUpgrade = globals.globalRangeUpgrade ?? globalRangeUpgrade;
  criticalChanceUpgrade = globals.criticalChanceUpgrade ?? criticalChanceUpgrade;
  criticalDamageUpgrade = globals.criticalDamageUpgrade ?? criticalDamageUpgrade;
  castleHealthUpgrade = globals.castleHealthUpgrade ?? castleHealthUpgrade;
  towerLimitUpgrade = globals.towerLimitUpgrade ?? towerLimitUpgrade;
  towerLimit = globals.towerLimit ?? towerLimit;
  gameSpeed = globals.gameSpeed ?? gameSpeed;
  survivedSeconds = globals.survivedSeconds ?? survivedSeconds;
  enemySpawnSlowUntil = globals.enemySpawnSlowUntil ?? enemySpawnSlowUntil;
  towerId = globals.towerId ?? towerId;
  enemyId = globals.enemyId ?? enemyId;
  equipmentId = globals.equipmentId ?? equipmentId;
  attributeOrbs = { ...(globals.attributeOrbs || {}) };
  ownedRecipeBooks = { ...(globals.ownedRecipeBooks || {}) };

  spawnedLimitedEnemyLevels.clear();
  (globals.spawnedLimitedEnemyLevels || []).forEach(level => spawnedLimitedEnemyLevels.add(level));
  if (typeof skillLastUsed === 'object') {
    Object.keys(skillLastUsed).forEach(key => {
      skillLastUsed[key] = globals.skillLastUsed?.[key] || Date.now();
    });
  }

  let maxTowerId = towerId;
  (state.towers || []).forEach(towerState => {
    const tower = createTowerFromSavedState(towerState);
    const id = parseInt(tower.dataset.id || '0', 10);
    if (!Number.isNaN(id)) maxTowerId = Math.max(maxTowerId, id + 1);
    (towerState.container === 'board' ? board : createBar).appendChild(tower);
  });
  towerId = maxTowerId;

  let maxEquipmentId = equipmentId;
  (state.equipment || []).forEach(equipment => {
    const item = createEquipmentFromSavedState(equipment);
    if (!Number.isNaN(equipment.id)) maxEquipmentId = Math.max(maxEquipmentId, equipment.id + 1);
    createBar.appendChild(item);
  });
  equipmentId = maxEquipmentId;

  Object.keys(ownedRecipeBooks).forEach(result => {
    if (!ownedRecipeBooks[result]) return;
    const recipe = FUSION_RECIPES.find(item => item.result === result);
    if (recipe) addRecipeBookToInventory(recipe);
  });

  let maxEnemyId = enemyId;
  (state.enemies || []).forEach(enemyState => {
    const enemy = createEnemyFromSavedState(enemyState);
    maxEnemyId = Math.max(maxEnemyId, enemy.id + 1);
  });
  enemyId = maxEnemyId;

  spawnLvExpress.textContent = `${formatNumber(spawnLv)} 생성`;
  priceBar.textContent = `${formatNumber(getTowerCreateCost())} $`;
  updateHealthText();
  updateSpeedModeButton();
  updateGamePausedState();
  updateInventoryView();
  refreshUpgradeUi();
  refreshSkillBar();
  restoreLocalUiState(localUiState);
  return true;
}

function saveGameStateToStorage() {
  if (isGameOver || isPersistenceDisabled()) return;

  try {
    localStorage.setItem(getCurrentGameSaveKey(), JSON.stringify(serializeGameState()));
  } catch (error) {
    console.error('게임 저장에 실패했습니다.', error);
  }
}

function loadGameStateFromStorage() {
  if (isPersistenceDisabled()) return null;
  try {
    const raw = localStorage.getItem(getCurrentGameSaveKey());
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('게임 저장 데이터를 읽지 못했습니다.', error);
    return null;
  }
}

function restoreSavedGameState() {
  return applyGameState(loadGameStateFromStorage());
}

function clearSavedGameState() {
  if (isPersistenceDisabled()) return;
  try {
    localStorage.removeItem(getCurrentGameSaveKey());
  } catch (error) {
    console.error('게임 저장 삭제에 실패했습니다.', error);
  }
}

function clearAllSavedGameStates() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith('mergedefense:'))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('게임 저장 전체 삭제에 실패했습니다.', error);
  }
}

function startGameAutosave() {
  if (isPersistenceDisabled()) return;
  restoreSavedGameState();
  setInterval(saveGameStateToStorage, 1000);
  window.addEventListener('beforeunload', saveGameStateToStorage);
}
