(function () {
  const ROOT = 'sounds/';
  const tracks = {
    town: 'TownTheme.mp3', lobby: 'happy_adveture.mp3',
    battle: 'DST-TowerDefenseTheme.mp3', battleHard: 'DST-ReturnOfTowerDefenseTheme.mp3'
  };
  const effects = {
    click: 'packs/interface/click_001.ogg', create: 'packs/interface/drop_002.ogg',
    place: 'packs/interface/drop_004.ogg', recall: 'packs/interface/minimize_004.ogg',
    merge: 'packs/interface/maximize_006.ogg', error: 'packs/interface/error_004.ogg',
    upgrade: 'packs/interface/confirmation_002.ogg', hit: 'packs/impact/impactGeneric_light_002.ogg',
    critical: 'packs/impact/impactMetal_heavy_002.ogg', castleHit: 'packs/impact/impactMining_004.ogg',
    explosion: 'packs/impact/impactPlate_heavy_003.ogg', boss: 'packs/impact/impactBell_heavy_001.ogg',
    loot: 'packs/rpg/metalClick.ogg', equip: 'packs/rpg/metalLatch.ogg',
    equipmentMerge: 'packs/rpg/metalPot2.ogg', goldRush: 'packs/casino/chips-stack-3.ogg',
    barrage: 'packs/impact/impactPlate_heavy_004.ogg', frost: 'packs/interface/glass_004.ogg',
    repair: 'packs/impact/impactMining_002.ogg', spawnSlow: 'packs/digital/phaserDown3.ogg',
    speed: 'packs/digital/phaseJump2.ogg', gameOver: 'packs/jingles/8-Bit jingles/jingles_NES13.ogg'
  };
  const bgm = new Audio();
  bgm.loop = true;
  bgm.volume = 0.24;
  let currentTrack = '';
  let unlocked = false;
  const lastPlayed = new Map();

  function playBgm(name) {
    const path = tracks[name];
    if (!path || currentTrack === path) return;
    currentTrack = path;
    bgm.src = ROOT + path;
    if (unlocked) bgm.play().catch(() => {});
  }
  function play(name, options = {}) {
    const path = effects[name];
    if (!path) return;
    const now = performance.now();
    if (now - (lastPlayed.get(name) || 0) < (options.throttle ?? 0)) return;
    lastPlayed.set(name, now);
    const sound = new Audio(ROOT + path);
    sound.volume = Math.max(0, Math.min(1, options.volume ?? 0.55));
    sound.playbackRate = options.rate ?? 1;
    sound.play().catch(() => {});
  }
  function unlock() {
    unlocked = true;
    if (currentTrack) bgm.play().catch(() => {});
    if (page === 'fail.html') play('gameOver', { volume: 0.65 });
  }
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '') playBgm('town');
  else if (page === 'room.html') playBgm('lobby');
  else if (page === 'main.html') playBgm('battle');
  else if (page === 'fail.html') play('gameOver', { volume: 0.65 });

  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('click', event => {
    if (event.target.closest('button')) play('click', { volume: 0.22, throttle: 35 });
  }, true);
  if (page === 'main.html') setInterval(() => {
    if (typeof survivedSeconds !== 'undefined' && survivedSeconds >= 120) playBgm('battleHard');
  }, 2000);
  window.GameAudio = { play, playBgm, unlock };
})();
