let towerId = 0;
let enemyId = 0;
let equipmentId = 0;
let coins = 3;
let personalTimeTokens = 0;
let spawnLv = 1;
const board = document.getElementById('game-board');
const giveUpBtn = document.getElementById('give-up-btn');
const createBar = document.getElementById('create-bar');
const createBtn = document.getElementById('create-btn');
const coinBar = document.getElementById('coin-bar');
const personalTimeBankBar = document.getElementById('personal-time-bank');
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
const towerHpText = document.getElementById('tower-hp');
const towerTimeText = document.getElementById('tower-time');
const timeBankBalanceText = document.getElementById('time-bank-balance');
const timeTransferAmountInput = document.getElementById('time-transfer-amount');
const withdrawTimeBtn = document.getElementById('withdraw-time-btn');
const injectTimeBtn = document.getElementById('inject-time-btn');
const upgradeSpeedBtn = document.getElementById('upgrade-speed-btn');
const upgradePowerBtn = document.getElementById('upgrade-power-btn');
const upgradeRangeBtn = document.getElementById('upgrade-range-btn');
const upgradeHpBtn = document.getElementById('upgrade-hp-btn');
const timeUpgradeSpeedBtn = document.getElementById('time-upgrade-speed-btn');
const timeUpgradePowerBtn = document.getElementById('time-upgrade-power-btn');
const timeUpgradeRangeBtn = document.getElementById('time-upgrade-range-btn');
const timeUpgradeHpBtn = document.getElementById('time-upgrade-hp-btn');
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
const sellTowerBtn = document.getElementById('sell-tower-btn');
const targetingOptions = document.getElementById('targeting-options');
const inventoryEmpty = document.getElementById('inventory-empty');
const blacksmithBtn = document.getElementById('blacksmith-btn');
const towerActionPopup = document.getElementById('tower-action-popup');
const towerActionPanel = document.getElementById('tower-action-panel');
const towerActionTitle = document.getElementById('tower-action-title');
const towerActionSubtitle = document.getElementById('tower-action-subtitle');
const towerActionDeleteBtn = document.getElementById('tower-action-delete');
const towerActionDisassembleBtn = document.getElementById('tower-action-disassemble');
const towerActionFuseBtn = document.getElementById('tower-action-fuse');
const towerActionCancelBtn = document.getElementById('tower-action-cancel');
const deleteTowerModal = document.getElementById('delete-tower-modal');
const closeDeleteTowerModalBtn = document.getElementById('close-delete-tower-modal');
const deleteTowerCostText = document.getElementById('delete-tower-cost');
const confirmDeleteTowerBtn = document.getElementById('confirm-delete-tower-btn');
const cancelDeleteTowerBtn = document.getElementById('cancel-delete-tower-btn');
const giveUpModal = document.getElementById('give-up-modal');
const closeGiveUpModalBtn = document.getElementById('close-give-up-modal');
const confirmGiveUpBtn = document.getElementById('confirm-give-up-btn');
const cancelGiveUpBtn = document.getElementById('cancel-give-up-btn');
const fusionModal = document.getElementById('fusion-modal');
const closeFusionModalBtn = document.getElementById('close-fusion-modal');
const fusionCurrentAttributeText = document.getElementById('fusion-current-attribute');
const fusionOrbList = document.getElementById('fusion-orb-list');
const fusionCancelBtn = document.getElementById('fusion-cancel-btn');
const blacksmithModal = document.getElementById('blacksmith-modal');
const closeBlacksmithModalBtn = document.getElementById('close-blacksmith-modal');
const blacksmithOrbList = document.getElementById('blacksmith-orb-list');
const forgeSlot0Btn = document.getElementById('forge-slot-0');
const forgeSlot1Btn = document.getElementById('forge-slot-1');
const forgeSlot2Btn = document.getElementById('forge-slot-2');
const forgeResultEl = document.getElementById('forge-result');
const forgeEffectText = document.getElementById('forge-effect-text');
const forgeCombineBtn = document.getElementById('forge-combine-btn');
let draggedTower = null;
let draggedEquipment = null;
let selectedTower = null;
let waitingTowerActionTarget = null;
let attributeOrbs = {};
let forgeSlots = [null, null, null];
let forgeActiveSlot = null;
let ownedRecipeBooks = {};
const RECIPE_BOOK_DROP_CHANCE = 0.2;
let inventoryView = 'tower';
let isGamePaused = false;
let isGameOver = false;
let isUpgradeModalOpen = false;
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
  towerRange: '1',
  towerHp: '1'
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
const GAME_SPEED_OPTIONS = [1, 2, 5, 0];
let enemySpawnInterval = null;
let towerAttackInterval = null;
let castleRecoverInterval = null;
let survivalTimerInterval = null;
let towerTimeInterval = null;
let bossRecoverInterval = null;
let enemyTowerCombatInterval = null;
let enemySummonInterval = null;
let enemySpawnSlowTimeout = null;
let survivedSeconds = 0;
let enemySpawnSlowUntil = 0;
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
const DEFAULT_TARGET_PRIORITY = 'nearest';
const TARGET_PRIORITIES = ['nearest', 'highestHp', 'lowestHp'];
const ENEMY_SPAWN_BASE_INTERVAL = 2500;
const ENEMY_SPAWN_SLOW_DURATION = 10000;
const ENEMY_SPAWN_SLOW_MULTIPLIER = 2;
const ENEMY_SUMMON_INTERVAL = 10000;
const ENEMY_SUMMON_RADIUS = 100;
const TOWER_SPEED_UPGRADE_STEP = 120;
const GLOBAL_SPEED_UPGRADE_STEP = 80;
const TOWER_HP_UPGRADE_MULTIPLIER = 0.2;
const TOWER_MELEE_RANGE = 90;
const ENEMY_TOWER_ATTACK_INTERVAL = 1000;
const BOSS_AOE_RANGE = 220;
const BOSS_AOE_INTERVAL = 3000;
const BOSS_AOE_STUN_DURATION = 2000;
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
    description: '폭탄 범위'
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
  },
  shield: {
    name: '방패',
    stat: 'maxHp',
    description: '최대 체력'
  }
};

const BASE_ATTRIBUTES = ['water', 'fire', 'bomb', 'ball', 'power', 'wall', 'blood'];
const EARLY_ENEMY_ATTRIBUTES = ['air', 'ghost', 'golem', 'lightning'];
const MID_ENEMY_ATTRIBUTES = [
  'air',
  'ghost',
  'golem',
  'lightning',
  'regen',
  'shield',
  'split',
  'assassin',
  'heavyArmor',
  'magicResist'
];
const ALL_ENEMY_ATTRIBUTES = [
  'air',
  'ghost',
  'golem',
  'lightning',
  'ice',
  'flame',
  'regen',
  'shield',
  'split',
  'berserk',
  'vampire',
  'magicResist',
  'heavyArmor',
  'assassin'
];

function isTeamActive() {
  return Boolean(window.TeamSession && window.TeamSession.isActive());
}

function isSpectatorMode() {
  return Boolean(window.TeamSession && window.TeamSession.isActive() && window.TeamSession.isSpectator);
}

function isApplyingTeamSharedState() {
  return Boolean(window.TeamSession && window.TeamSession.applyingSharedState);
}

function isTeamSimulationAuthority() {
  return !isTeamActive() || (!isSpectatorMode() && window.TeamSession.isHost === true);
}

function reportTeamSharedState() {
  if (!window.TeamSession || !window.TeamSession.isActive() || isSpectatorMode() || isApplyingTeamSharedState()) return;
  window.TeamSession.reportSharedState();
}
