function updateSurvivalTime() {
  survivalTimeBar.textContent = `${formatNumber(survivedSeconds)}초`;
}

function updateTopStatus() {
  updateSurvivalTime();
  coinBar.textContent = `${formatNumber(coins)} $`;
  towerCountBar.textContent = `${formatNumber(getInstalledTowerCount())} / ${formatNumber(towerLimit)} 포탑`;
}

function updateHealthText() {
  document.getElementById('health').textContent = `${formatNumber(Math.ceil(health))} / ${formatNumber(maxHealth)} Hp`;
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
  updateGamePausedState();
  if (typeof clearSavedGameState === 'function') clearSavedGameState();

  if (window.TeamSession && window.TeamSession.isActive()) {
    await window.TeamSession.endGame(survivedSeconds);
    return;
  }

  try {
    await saveRanking();
  } catch (error) {
    console.error('Failed to save ranking', error);
  } finally {
    const playerName = localStorage.getItem('name') || 'Guest';
    const params = new URLSearchParams({
      name: playerName,
      time: String(Math.max(0, Math.floor(survivedSeconds || 0)))
    });
    window.location.href = `fail.html?${params.toString()}`;
  }
}

function updateGamePausedState() {
  const pauseForUpgradeModal = isUpgradeModalOpen && !isTeamActive();
  isGamePaused = isGameOver || pauseForUpgradeModal || gameSpeed === 0;
}

function getInstalledTowerCount() {
  return [...board.querySelectorAll('.tower')].length;
}

function openGiveUpModal() {
  giveUpModal.classList.remove('hidden');
}

function closeGiveUpModal() {
  giveUpModal.classList.add('hidden');
}

function confirmGiveUp() {
  closeGiveUpModal();
  if (typeof clearAllSavedGameStates === 'function') clearAllSavedGameStates();
  endGame();
}

function leaveSpectatorMode() {
  window.location.href = 'room.html';
}

function applySpectatorMode() {
  if (!isSpectatorMode()) return;

  document.body.classList.add('spectator-mode');
  giveUpBtn.textContent = '뒤로가기';
  document.getElementById('name').textContent = 'Guest';
}

function setCreateBarHeight(heightPx) {
  const minHeight = 120;
  const maxHeight = Math.floor(window.innerHeight * 0.65);
  const clampedHeight = Math.max(minHeight, Math.min(maxHeight, heightPx));

  document.documentElement.style.setProperty('--create-bar-height', `${clampedHeight}px`);
  localStorage.setItem('mergedefense:createBarHeight', `${clampedHeight}`);
}

function initCreateBarResizer() {
  const handle = document.getElementById('create-bar-resize-handle');
  if (!handle) return;

  const savedHeight = parseInt(localStorage.getItem('mergedefense:createBarHeight') || '', 10);
  if (Number.isFinite(savedHeight)) setCreateBarHeight(savedHeight);

  let startY = 0;
  let startHeight = 0;
  let activePointerId = null;

  handle.addEventListener('pointerdown', e => {
    startY = e.clientY;
    startHeight = createBar.getBoundingClientRect().height;
    activePointerId = e.pointerId;
    handle.setPointerCapture(e.pointerId);
    document.body.classList.add('resizing-create-bar');
  });

  handle.addEventListener('pointermove', e => {
    if (activePointerId !== e.pointerId) return;
    setCreateBarHeight(startHeight - (e.clientY - startY));
  });

  function stopResize(e) {
    if (activePointerId !== e.pointerId) return;
    activePointerId = null;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    document.body.classList.remove('resizing-create-bar');
  }

  handle.addEventListener('pointerup', stopResize);
  handle.addEventListener('pointercancel', stopResize);
  window.addEventListener('resize', () => setCreateBarHeight(createBar.getBoundingClientRect().height));
}

function refreshUpgradeUi() {
  updateTopStatus();
  refreshCreateUpgradeButton();
  refreshGlobalUpgradeButtons();
  if (selectedTower) refreshUpgradeModal();
  if (waitingTowerActionTarget && !deleteTowerModal.classList.contains('hidden')) refreshDeleteTowerModal();
}

function recoverCastleHealth() {
  if (isGamePaused) return;
  if (health >= maxHealth) return;

  const amount = maxHealth * 0.01;
  health = Math.min(maxHealth, health + amount);
  updateHealthText();
  if (window.TeamSession && window.TeamSession.isActive()) window.TeamSession.reportCastleHit(-amount);
  reportTeamSharedState();
}

function recoverCastleHealthByAmount(amount) {
  if (amount <= 0 || health >= maxHealth) return;

  health = Math.min(maxHealth, health + amount);
  updateHealthText();
  if (window.TeamSession && window.TeamSession.isActive()) window.TeamSession.reportCastleHit(-amount);
  reportTeamSharedState();
}

function updateSpeedModeButton() {
  speedModeBtn.textContent = `${gameSpeed}배속`;
  speedModeBtn.classList.toggle('active', gameSpeed !== 1);
}

function getEnemySpawnIntervalMs() {
  const slowMultiplier = Date.now() < enemySpawnSlowUntil ? ENEMY_SPAWN_SLOW_MULTIPLIER : 1;
  return ENEMY_SPAWN_BASE_INTERVAL * slowMultiplier / gameSpeed;
}

function resetGameIntervals() {
  if (enemySpawnInterval) clearInterval(enemySpawnInterval);
  if (towerAttackInterval) clearInterval(towerAttackInterval);
  if (castleRecoverInterval) clearInterval(castleRecoverInterval);
  if (survivalTimerInterval) clearInterval(survivalTimerInterval);
  if (towerTimeInterval) clearInterval(towerTimeInterval);
  if (bossRecoverInterval) clearInterval(bossRecoverInterval);
  if (enemyTowerCombatInterval) clearInterval(enemyTowerCombatInterval);
  if (enemySummonInterval) clearInterval(enemySummonInterval);
  if (enemySpawnSlowTimeout) clearTimeout(enemySpawnSlowTimeout);
  updateGamePausedState();
  if (gameSpeed === 0) return;

  const isWaveAuthority = isTeamSimulationAuthority();

  enemySpawnInterval = isWaveAuthority ? setInterval(spawnEnemy, getEnemySpawnIntervalMs()) : null;
  if (Date.now() < enemySpawnSlowUntil) {
    enemySpawnSlowTimeout = setTimeout(resetGameIntervals, Math.max(0, enemySpawnSlowUntil - Date.now()));
  }
  towerAttackInterval = isWaveAuthority ? setInterval(towerAttackLoop, 100 / gameSpeed) : null;
  castleRecoverInterval = isWaveAuthority ? setInterval(recoverCastleHealth, 1000 / gameSpeed) : null;
  towerTimeInterval = isWaveAuthority ? setInterval(towerTimeLoop, 1000 / gameSpeed) : null;
  bossRecoverInterval = isWaveAuthority ? setInterval(bossRecoverLoop, 1000 / gameSpeed) : null;
  enemyTowerCombatInterval = isWaveAuthority ? setInterval(enemyTowerCombatLoop, 200 / gameSpeed) : null;
  enemySummonInterval = isWaveAuthority ? setInterval(enemySummonLoop, 250 / gameSpeed) : null;
  survivalTimerInterval = setInterval(() => {
    if (isGamePaused) return;

    if (isWaveAuthority) survivedSeconds += 1;
    updateTopStatus();
    refreshSkillBar();
    if (isWaveAuthority) reportTeamSharedState();
  }, 1000 / gameSpeed);
}

function toggleSpeedMode() {
  const currentIndex = GAME_SPEED_OPTIONS.indexOf(gameSpeed);
  gameSpeed = GAME_SPEED_OPTIONS[(currentIndex + 1) % GAME_SPEED_OPTIONS.length];
  updateGamePausedState();
  updateSpeedModeButton();
  resetGameIntervals();
  refreshSkillBar();
  reportTeamSharedState();
}


function upgradeCreate() {
  const count = getSelectedUpgradeCount('create');
  const cost = getSelectedUpgradeCost('create');
  if (count < 1) return;
  if ( coins >= cost ) {
    coins -= cost;
    spawnLv += count;
    GameAudio.play('upgrade');
    spawnLvExpress.textContent = `${formatNumber(spawnLv)} 생성`;
    priceBar.textContent = `${formatNumber(getTowerCreateCost())} $`
    refreshUpgradeUi();
    reportTeamSharedState();
  }
}

createBtn.addEventListener('click', spawnBtn);
upgradeBtn.addEventListener('click', upgradeCreate);
closeUpgradeModalBtn.addEventListener('click', closeUpgradeModal);
sellTowerBtn.addEventListener('click', deleteSelectedTower);
upgradeModal.addEventListener('click', e => {
  if (e.target === upgradeModal) closeUpgradeModal();
});
board.addEventListener('click', closeUpgradeModal);
upgradeSpeedBtn.addEventListener('click', () => upgradeSelectedTower('speed'));
upgradePowerBtn.addEventListener('click', () => upgradeSelectedTower('power'));
upgradeRangeBtn.addEventListener('click', () => upgradeSelectedTower('range'));
upgradeHpBtn.addEventListener('click', () => upgradeSelectedTower('hp'));
timeUpgradeSpeedBtn.addEventListener('click', () => upgradeSelectedTowerWithTime('speed'));
timeUpgradePowerBtn.addEventListener('click', () => upgradeSelectedTowerWithTime('power'));
timeUpgradeRangeBtn.addEventListener('click', () => upgradeSelectedTowerWithTime('range'));
timeUpgradeHpBtn.addEventListener('click', () => upgradeSelectedTowerWithTime('hp'));
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
giveUpBtn.addEventListener('click', () => {
  if (isSpectatorMode()) {
    leaveSpectatorMode();
    return;
  }
  openGiveUpModal();
});
closeGiveUpModalBtn.addEventListener('click', closeGiveUpModal);
cancelGiveUpBtn.addEventListener('click', closeGiveUpModal);
confirmGiveUpBtn.addEventListener('click', confirmGiveUp);
giveUpModal.addEventListener('click', e => {
  if (e.target === giveUpModal) closeGiveUpModal();
});

towerActionDeleteBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (!waitingTowerActionTarget) return;
  hideTowerActionPopup();
  openDeleteTowerModal();
});
towerActionDisassembleBtn.addEventListener('click', e => {
  e.stopPropagation();
  disassembleWaitingTower();
});
towerActionFuseBtn.addEventListener('click', e => {
  e.stopPropagation();
  hideTowerActionPopup();
  openFusionModal();
});
towerActionCancelBtn.addEventListener('click', e => {
  e.stopPropagation();
  cancelTowerAction();
});
towerActionPopup.addEventListener('click', e => {
  if (e.target === towerActionPopup) cancelTowerAction();
});

closeDeleteTowerModalBtn.addEventListener('click', closeDeleteTowerModal);
cancelDeleteTowerBtn.addEventListener('click', closeDeleteTowerModal);
confirmDeleteTowerBtn.addEventListener('click', confirmDeleteTower);
deleteTowerModal.addEventListener('click', e => {
  if (e.target === deleteTowerModal) closeDeleteTowerModal();
});

closeFusionModalBtn.addEventListener('click', closeFusionModal);
fusionCancelBtn.addEventListener('click', closeFusionModal);
fusionModal.addEventListener('click', e => {
  if (e.target === fusionModal) closeFusionModal();
});
fusionOrbList.addEventListener('click', e => {
  const chip = e.target.closest('.orb-chip');
  if (!chip) return;
  applyFusionOrb(chip.dataset.attribute);
});

blacksmithBtn.addEventListener('click', () => {
  setInventoryView('recipe');
  openBlacksmithModal();
});
closeBlacksmithModalBtn.addEventListener('click', closeBlacksmithModal);
blacksmithModal.addEventListener('click', e => {
  if (e.target === blacksmithModal) closeBlacksmithModal();
});
blacksmithOrbList.addEventListener('click', e => {
  const chip = e.target.closest('.orb-chip');
  if (!chip) return;
  assignForgeOrb(chip.dataset.attribute);
});

let hoveredOrbAttribute = null;
blacksmithOrbList.addEventListener('mousemove', e => {
  const chip = e.target.closest('.orb-chip');
  if (!chip) {
    hoveredOrbAttribute = null;
    hideOrbTooltip();
    return;
  }

  if (chip.dataset.attribute !== hoveredOrbAttribute) {
    hoveredOrbAttribute = chip.dataset.attribute;
    showOrbTooltip(hoveredOrbAttribute, e.clientX, e.clientY);
  } else {
    positionOrbTooltip(e.clientX, e.clientY);
  }
});
blacksmithOrbList.addEventListener('mouseleave', () => {
  hoveredOrbAttribute = null;
  hideOrbTooltip();
});
forgeSlot0Btn.addEventListener('click', () => selectForgeSlot(0));
forgeSlot1Btn.addEventListener('click', () => selectForgeSlot(1));
forgeSlot2Btn.addEventListener('click', () => selectForgeSlot(2));
forgeCombineBtn.addEventListener('click', combineForge);
document.querySelectorAll('.skill-btn').forEach(button => {
  button.addEventListener('click', () => useSkill(button.dataset.skill));
});
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
setupUpgradeAmountControls(upgradeHpBtn, 'towerHp');
initCreateBarResizer();
startGameAutosave();
applySpectatorMode();
updateHealthText();
updateSpeedModeButton();
spawnLvExpress.textContent = `${formatNumber(spawnLv)} 생성`;
priceBar.textContent = `${formatNumber(getTowerCreateCost())} $`;
refreshUpgradeUi();
updateInventoryView();
refreshSkillBar();
resetGameIntervals();
