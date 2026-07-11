const ATTRIBUTE_EFFECT_CONFIG = {
  power: { damageMult: 2 },
  blood: { damageMult: 0.5, lifesteal: { percent: 0.10 } },
  ball: { atkIntervalMult: 0.5, starUpChance: 0.10 },
  wall: { atkIntervalMult: 2, stun: { durationMs: 3000 } },
  water: { slow: { durationMs: 3000, speedMult: 0.5 } },
  fire: { burn: { tickMult: 0.25, ticks: 3, intervalMs: 1000 } },
  bomb: { splash: { radiusMult: 1, damageMult: 0.7 } },

  빙결: { freeze: { stunMs: 1000, slowMs: 3000, slowMult: 0.5 } },
  지옥불: { burn: { tickMult: 0.375, ticks: 5, intervalMs: 1000 }, suppressRegen: { durationMs: 5000 } },
  핵폭발: { splash: { radiusMult: 3.0, damageMult: 0.7 }, atkIntervalMult: 2.5 },
  광속: { atkIntervalMult: 0.25, starUpChance: 0.10 },
  거인: { damageMult: 2.5, atkIntervalMult: 1.15 },
  감옥: { stun: { durationMs: 1200 }, bonusVsControlled: { damageMult: 1.5 } },
  흡혈귀: { lifesteal: { percent: 0.25, scalesWithMissingCastleHp: true }, damageMult: 0.5 },

  증기폭발: { splash: { radiusMult: 0.7, damageMult: 0.49 }, slow: { durationMs: 2100, speedMult: 0.65 }, burn: { tickMult: 0.10, ticks: 2, intervalMs: 1000 } },
  열탕: { damageMult: 1.7, burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000 }, slow: { durationMs: 3000, speedMult: 0.65 } },
  냉각장벽: { stun: { durationMs: 2100 }, slow: { durationMs: 2100, speedMult: 0.65 }, burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000, whileControlledOnly: true } },
  생명증기: { burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000 }, lifesteal: { percent: 0.07, fromDotOnly: true } },
  물폭풍: { atkIntervalMult: 0.65, slow: { durationMs: 2100, speedMult: 0.65, radiusMult: 0.5 } },
  해일: { damageMult: 1.7, splash: { radiusMult: 0.7, damageMult: 0.49 }, slow: { durationMs: 3000, speedMult: 0.65 } },
  홍수: { stun: { durationMs: 2100 }, slow: { durationMs: 2100, speedMult: 0.65 } },
  흡수파도: { splash: { radiusMult: 0.7, damageMult: 0.49 }, lifesteal: { percent: 0.07, scalesWithHitCount: true } },
  칼날비: { atkIntervalMult: 0.65, bonusVsControlled: { damageMult: 1.35 }, slow: { durationMs: 1500, speedMult: 0.75 } },
  시간감옥: { atkIntervalMult: 0.65, stun: { durationMs: 2100, afterHitCount: 5 } },
  '피의 비': { atkIntervalMult: 0.65, slow: { durationMs: 2100, speedMult: 0.65 }, lifesteal: { percent: 0.05 } },
  빙벽: { damageMult: 1.7, stun: { durationMs: 2100 }, slow: { durationMs: 2100, speedMult: 0.65 } },
  냉혈: { bonusVsControlled: { damageMult: 1.35 }, lifesteal: { percent: 0.07, fromBonusOnly: true }, slow: { durationMs: 1500, speedMult: 0.75 } },
  '생명의 늪': { slow: { durationMs: 2100, speedMult: 0.65, radiusMult: 0.6 }, lifesteal: { percent: 0.07, scalesWithHitCount: true } },
  연쇄폭발: { atkIntervalMult: 0.65, onKillChainSplash: { radiusMult: 1.05, damageMult: 0.35 } },
  화산: { splash: { radiusMult: 0.7, damageMult: 0.49 }, burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000 }, bonusVsBoss: { damageMult: 1.42, appliesTo: 'burn' } },
  지뢰장벽: { stun: { durationMs: 2100 }, splash: { radiusMult: 0.7, damageMult: 0.49 }, burn: { tickMult: 0.15, ticks: 3, intervalMs: 1000 }, bonusVsControlled: { damageMult: 1.35, appliesTo: 'burn' } },
  피폭발: { splash: { radiusMult: 0.7, damageMult: 0.49 }, burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000 }, lifesteal: { percent: 0.05, scalesWithHitCount: true } },
  광전사: { atkIntervalMult: 0.65, damageMult: 1.7, starUpChance: 0.10 },
  화염사슬: { atkIntervalMult: 0.65, stun: { durationMs: 2100, chance: 0.35 }, burn: { tickMult: 0.15, ticks: 3, intervalMs: 1000, triggersOnStunOnly: true } },
  흡혈화염: { atkIntervalMult: 0.65, burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000 }, lifesteal: { percent: 0.05, fromDotOnly: true } },
  용암: { damageMult: 1.7, stun: { durationMs: 2100 }, burn: { tickMult: 0.12, ticks: 3, intervalMs: 1000 }, atkIntervalMult: 1.5 },
  '피의 불꽃': { damageMult: 1.7, burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000 }, lifesteal: { percent: 0.05, fromDotOnly: true } },
  '제물의 벽': { stun: { durationMs: 2100 }, burn: { tickMult: 0.18, ticks: 3, intervalMs: 1000 }, killHeal: { percent: 0.04, requiresControlledAtDeath: true } },
  탄막: { atkIntervalMult: 0.65, splash: { radiusMult: 0.7, damageMult: 0.49 }, damageMult: 0.7 },
  충격파: { atkIntervalMult: 0.65, splash: { radiusMult: 0.5, damageMult: 0.4 }, stun: { durationMs: 1500, chance: 0.3 } },
  '피의 파편': { atkIntervalMult: 0.65, splash: { radiusMult: 0.7, damageMult: 0.49 }, lifesteal: { percent: 0.05, scalesWithHitCount: true } },
  대포: { splash: { radiusMult: 0.7, damageMult: 0.49 }, atkIntervalMult: 1.7, damageMult: 1.4, stun: { durationMs: 900 } },
  흡혈폭탄: { splash: { radiusMult: 0.7, damageMult: 0.49 }, damageMult: 1.7, lifesteal: { percent: 0.05 } },
  '피의 장벽': { stun: { durationMs: 2100, radiusMult: 0.6 }, lifesteal: { percent: 0.07, scalesWithHitCount: true } },
  파쇄: { atkIntervalMult: 0.65, damageMult: 1.7, selfPauseCycle: { activeMs: 6000, pauseMs: 1500, chance: 0.25 }, stun: { durationMs: 900 } },
  사냥꾼: { atkIntervalMult: 0.65, damageMult: 1.7, killHeal: { percent: 0.04 } },
  흡착: { atkIntervalMult: 0.65, stun: { durationMs: 1200 }, lifesteal: { percent: 0.07, requiresControlledTarget: true } },
  수호자: { damageMult: 1.5, stun: { durationMs: 1800 }, lifesteal: { percent: 0.06 }, atkIntervalMult: 1.7 },

  빙화산포: { splash: { radiusMult: 1.2, damageMult: 0.85 }, stun: { durationMs: 1800 }, burn: { tickMult: 0.15, ticks: 4, intervalMs: 1000 }, atkIntervalMult: 1.6 },
  늪지포: { splash: { radiusMult: 1.2, damageMult: 0.85 }, slow: { durationMs: 1800, speedMult: 0.70 }, lifesteal: { percent: 0.06, scalesWithHitCount: true } },
  폭염탄막: { onKillChainSplash: { radiusMult: 1.8, damageMult: 0.60 }, splash: { radiusMult: 0.6, damageMult: 0.42 }, atkIntervalMult: 0.70, burn: { tickMult: 0.15, ticks: 4, intervalMs: 1000 } },
  절대감옥: { stun: { durationMs: 3600 }, bonusVsControlled: { damageMult: 1.30 }, burn: { tickMult: 0.15, ticks: 4, intervalMs: 1000 }, atkIntervalMult: 1.6 },
  암살비: { atkIntervalMult: 0.40, bonusVsLowHp: { hpPercentThreshold: 0.25, damageMult: 1.6 }, killHeal: { percent: 0.04 } },
  혈핵: { splash: { radiusMult: 1.2, damageMult: 0.85 }, lifesteal: { percent: 0.06, scalesWithHitCount: true }, atkIntervalMult: 1.6 },
  시간사슬: { stun: { durationMs: 1800, chance: 0.35 }, atkIntervalMult: 0.70, splash: { radiusMult: 0.6, damageMult: 0.42, triggersOnStunOnly: true } },
  혈염: { burn: { tickMult: 0.30, ticks: 5, intervalMs: 1000 }, lifesteal: { percent: 0.06, fromDotOnly: true }, stackingDamage: { perStackMult: 0.08, maxStacks: 5, stackDurationMs: 3000 } },
  심해: { slow: { durationMs: 1800, speedMult: 0.40 }, splash: { radiusMult: 0.9, damageMult: 0 }, stun: { durationMs: 900, chance: 0.3 }, lifesteal: { percent: 0.06, scalesWithHitCount: true } },
  파멸포: { bonusVsBoss: { damageMult: 1.72 }, atkIntervalMult: 1.6, stun: { durationMs: 1800 } },
  광란폭죽: { atkIntervalMult: 0.40, onKillChainSplash: { radiusMult: 0.9, damageMult: 0.30, chance: 0.4 }, starUpChance: 0.10 },
  성역: { stun: { durationMs: 3600 }, lifesteal: { percent: 0.06 }, damageMult: 0.6 },

  영구동토: { stun: { durationMs: 4050, chance: 0.55 }, slow: { durationMs: 1650, speedMult: 0.73 }, damageMult: 0.6 },
  마그마지대: { splash: { radiusMult: 1.35, damageMult: 0.95 }, burn: { tickMult: 0.14, ticks: 4, intervalMs: 1000 }, slow: { durationMs: 1650, speedMult: 0.73 } },
  폭우검: { atkIntervalMult: 0.33, slow: { durationMs: 1650, speedMult: 0.73 }, bonusVsControlled: { damageMult: 1.28 } },
  포식자: { onKillBuff: { durationMs: 5400, damageMult: 1.81, atkIntervalMult: 0.7, lifestealBonusPercent: 0.08 }, lifesteal: { percent: 0.06 } },
  종말: { ultimateBurst: { cooldownMs: 90000, damageMult: 5.0, stunMs: 3000 } },
  과부하: { atkIntervalMult: 0.20, selfPauseCycle: { activeMs: 8000, pauseMs: 2000 }, starUpChance: 0.06 },
  천공포: { bonusVsBoss: { damageMult: 1.81 }, splash: { radiusMult: 0.55, damageMult: 0.39 } },
  왕성수호: { stun: { durationMs: 4050, scalesWithMissingCastleHp: true, nearCastleOnly: { radius: 250 } }, lifesteal: { percent: 0.14, scalesWithMissingCastleHp: true } }
};

function getAttributeEffectConfig(attribute) {
  return ATTRIBUTE_EFFECT_CONFIG[attribute] || null;
}

function getAttributeDamageMult(attribute) {
  const config = getAttributeEffectConfig(attribute);
  return config && typeof config.damageMult === 'number' ? config.damageMult : 1;
}

function getAttributeAtkIntervalMult(attribute) {
  const config = getAttributeEffectConfig(attribute);
  return config && typeof config.atkIntervalMult === 'number' ? config.atkIntervalMult : 1;
}

function getAttributeSplashConfig(attribute) {
  const config = getAttributeEffectConfig(attribute);
  return config && config.splash ? config.splash : null;
}

function getTowerActiveBuffDamageMult(tower) {
  const buffUntil = parseInt(tower.dataset.buffUntil || '0', 10);
  if (Date.now() >= buffUntil) return 1;
  return parseFloat(tower.dataset.buffDamageMult || '1');
}

function getTowerActiveBuffAtkIntervalMult(tower) {
  const buffUntil = parseInt(tower.dataset.buffUntil || '0', 10);
  if (Date.now() >= buffUntil) return 1;
  return parseFloat(tower.dataset.buffAtkIntervalMult || '1');
}

function isEnemyControlled(enemy) {
  if (!enemy || !enemy.element) return false;
  const now = Date.now();
  return now < parseInt(enemy.element.dataset.slowUntil || '0', 10) || now < parseInt(enemy.element.dataset.stopUntil || '0', 10);
}

function isBossEnemy(enemy) {
  return Boolean(enemy && enemy.lv % 5 === 0);
}

function isEnemyNearCastle(enemy, radius) {
  const defenseEl = document.getElementById('defense');
  if (!defenseEl || !enemy.element) return false;
  const defRect = defenseEl.getBoundingClientRect();
  const enemyRect = enemy.element.getBoundingClientRect();
  const dx = (defRect.left + defRect.width / 2) - (enemyRect.left + enemyRect.width / 2);
  const dy = (defRect.top + defRect.height / 2) - (enemyRect.top + enemyRect.height / 2);
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

function getNearbyEnemies(centerEnemy, radiusMult) {
  if (!centerEnemy.element) return [centerEnemy];
  const rect = centerEnemy.element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = 130 * radiusMult;
  return enemies.filter(enemy => {
    if (!document.body.contains(enemy.element)) return false;
    const enemyRect = enemy.element.getBoundingClientRect();
    const dx = cx - (enemyRect.left + enemyRect.width / 2);
    const dy = cy - (enemyRect.top + enemyRect.height / 2);
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

function applyControlToTargets(centerEnemy, radiusMult, apply) {
  const targets = radiusMult ? getNearbyEnemies(centerEnemy, radiusMult) : [centerEnemy];
  targets.forEach(apply);
}

const attributeHitStreak = new Map();

function getAndIncrementHitStreak(fromTower, enemy) {
  const key = `${fromTower.dataset.id}:${enemy.id}`;
  const count = (attributeHitStreak.get(key) || 0) + 1;
  attributeHitStreak.set(key, count);
  return count;
}

function resetHitStreak(fromTower, enemy) {
  attributeHitStreak.delete(`${fromTower.dataset.id}:${enemy.id}`);
}

const attributeStackState = new Map();

function getStackingBonusMult(config, fromTower, enemy) {
  if (!config.stackingDamage) return 1;
  const key = `${fromTower.dataset.id}:${enemy.id}`;
  const now = Date.now();
  const entry = attributeStackState.get(key);
  const stacks = entry && now - entry.lastHitAt <= config.stackingDamage.stackDurationMs
    ? Math.min(config.stackingDamage.maxStacks, entry.count + 1)
    : 1;
  attributeStackState.set(key, { count: stacks, lastHitAt: now });
  return 1 + (stacks - 1) * config.stackingDamage.perStackMult;
}

function getAttributeBonusDamageMult(config, enemy) {
  let multiplier = 1;
  if (config.bonusVsControlled && config.bonusVsControlled.appliesTo !== 'burn' && isEnemyControlled(enemy)) {
    multiplier *= config.bonusVsControlled.damageMult;
  }
  if (config.bonusVsBoss && config.bonusVsBoss.appliesTo !== 'burn' && isBossEnemy(enemy)) {
    multiplier *= config.bonusVsBoss.damageMult;
  }
  if (config.bonusVsLowHp && enemy.maxHp > 0 && (enemy.hp / enemy.maxHp) <= config.bonusVsLowHp.hpPercentThreshold) {
    multiplier *= config.bonusVsLowHp.damageMult;
  }
  return multiplier;
}

function applyAttributeLifesteal(enemy, dealtDamage, lifestealConfig, hitCount) {
  if (!dealtDamage || dealtDamage <= 0) return;
  if (lifestealConfig.requiresControlledTarget && !isEnemyControlled(enemy)) return;

  let percent = lifestealConfig.percent;
  if (lifestealConfig.scalesWithHitCount && hitCount) {
    percent *= Math.min(5, hitCount);
  }
  if (lifestealConfig.scalesWithMissingCastleHp) {
    const missingFraction = 1 - (health / maxHealth);
    percent *= (1 + missingFraction);
  }
  recoverCastleHealthByAmount(dealtDamage * percent);
}

function applyAttributeBurn(enemy, baseDamage, fromTower, config) {
  const burnConfig = config.burn;
  let ticks = 0;
  const fireInterval = setInterval(() => {
    if (isGamePaused) return;

    if (!document.body.contains(enemy.element)) {
      clearInterval(fireInterval);
      return;
    }

    ticks += 1;
    const dealt = damageEnemy(enemy, baseDamage * burnConfig.tickMult, fromTower, { type: 'dot' });
    if (config.lifesteal && config.lifesteal.fromDotOnly) {
      applyAttributeLifesteal(enemy, dealt, config.lifesteal, 1);
    }

    if (ticks >= burnConfig.ticks) clearInterval(fireInterval);
  }, burnConfig.intervalMs / gameSpeed);
}

function applyAttributeOnHitEffects(fromTower, targetEnemy, dealtDamage, config, attackDamage, hitCount) {
  if (!targetEnemy || !document.body.contains(targetEnemy.element)) return;
  const now = Date.now();

  if (config.freeze) {
    const el = targetEnemy.element;
    const stopUntil = now + getEnemyControlDuration(targetEnemy, config.freeze.stunMs, 'stop');
    if (stopUntil > parseInt(el.dataset.stopUntil || '0', 10)) el.dataset.stopUntil = `${stopUntil}`;
    const slowUntil = stopUntil + config.freeze.slowMs;
    if (slowUntil > parseInt(el.dataset.slowUntil || '0', 10)) el.dataset.slowUntil = `${slowUntil}`;
  }

  if (config.slow) {
    applyControlToTargets(targetEnemy, config.slow.radiusMult, enemy => {
      if (!document.body.contains(enemy.element)) return;
      const slowUntil = now + getEnemyControlDuration(enemy, config.slow.durationMs, 'slow');
      if (slowUntil > parseInt(enemy.element.dataset.slowUntil || '0', 10)) enemy.element.dataset.slowUntil = `${slowUntil}`;
    });
  }

  if (config.stun) {
    const passesNearCastle = !config.stun.nearCastleOnly || isEnemyNearCastle(targetEnemy, config.stun.nearCastleOnly.radius);
    const passesChance = !config.stun.chance || Math.random() < config.stun.chance;
    const passesHitCount = !config.stun.afterHitCount || getAndIncrementHitStreak(fromTower, targetEnemy) >= config.stun.afterHitCount;
    if (passesNearCastle && passesChance && passesHitCount) {
      if (config.stun.afterHitCount) resetHitStreak(fromTower, targetEnemy);
      let durationMs = config.stun.durationMs;
      if (config.stun.scalesWithMissingCastleHp) durationMs *= (1 + (1 - health / maxHealth));
      applyControlToTargets(targetEnemy, config.stun.radiusMult, enemy => {
        if (!document.body.contains(enemy.element)) return;
        const stopUntil = now + getEnemyControlDuration(enemy, durationMs, 'stop');
        if (stopUntil > parseInt(enemy.element.dataset.stopUntil || '0', 10)) enemy.element.dataset.stopUntil = `${stopUntil}`;
      });
    }
  }

  if (config.suppressRegen) {
    const el = targetEnemy.element;
    const suppressUntil = now + config.suppressRegen.durationMs;
    if (suppressUntil > parseInt(el.dataset.regenSuppressedUntil || '0', 10)) el.dataset.regenSuppressedUntil = `${suppressUntil}`;
  }

  if (config.burn) {
    const eligible = (!config.burn.whileControlledOnly || isEnemyControlled(targetEnemy)) &&
      (!config.burn.triggersOnStunOnly || now < parseInt(targetEnemy.element.dataset.stopUntil || '0', 10));
    if (eligible) {
      const bossBurnBonus = config.bonusVsBoss && config.bonusVsBoss.appliesTo === 'burn' && isBossEnemy(targetEnemy) ? config.bonusVsBoss.damageMult : 1;
      const controlledBurnBonus = config.bonusVsControlled && config.bonusVsControlled.appliesTo === 'burn' && isEnemyControlled(targetEnemy) ? config.bonusVsControlled.damageMult : 1;
      applyAttributeBurn(targetEnemy, attackDamage * bossBurnBonus * controlledBurnBonus, fromTower, config);
    }
  }

  if (config.starUpChance && Math.random() < config.starUpChance) {
    promoteEnemyToThreeStar(targetEnemy);
  }

  if (config.lifesteal && !config.lifesteal.fromDotOnly) {
    if (config.lifesteal.fromBonusOnly) {
      if (isEnemyControlled(targetEnemy)) applyAttributeLifesteal(targetEnemy, dealtDamage, config.lifesteal, hitCount);
    } else {
      applyAttributeLifesteal(targetEnemy, dealtDamage, config.lifesteal, hitCount);
    }
  }

  if (config.selfPauseCycle) {
    const streakStart = parseInt(fromTower.dataset.overheatStreakStartedAt || '0', 10);
    if (!streakStart) {
      fromTower.dataset.overheatStreakStartedAt = `${now}`;
    } else if (now - streakStart >= config.selfPauseCycle.activeMs) {
      if (!config.selfPauseCycle.chance || Math.random() < config.selfPauseCycle.chance) {
        stunTower(fromTower, config.selfPauseCycle.pauseMs);
      }
      fromTower.dataset.overheatStreakStartedAt = '0';
    }
  }
}

function applyAttributeSplash(fromTower, targetEnemy, attackDamage, config) {
  if (!document.body.contains(targetEnemy.element)) return;

  const targetRect = targetEnemy.element.getBoundingClientRect();
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const bombRange = getBombRange(fromTower);

  const hitEnemies = [...enemies].filter(enemy => {
    if (!document.body.contains(enemy.element)) return false;
    const enemyRect = enemy.element.getBoundingClientRect();
    const enemyX = enemyRect.left + enemyRect.width / 2;
    const enemyY = enemyRect.top + enemyRect.height / 2;
    const dx = targetX - enemyX;
    const dy = targetY - enemyY;
    return Math.sqrt(dx * dx + dy * dy) <= bombRange;
  });

  hitEnemies.forEach(enemy => {
    const stunGatePasses = !config.splash.triggersOnStunOnly || Date.now() < parseInt(enemy.element.dataset.stopUntil || '0', 10);
    let dealtDamage = 0;
    if (stunGatePasses) {
      const bonusMult = getAttributeBonusDamageMult(config, enemy) * getStackingBonusMult(config, fromTower, enemy);
      dealtDamage = damageEnemy(enemy, attackDamage * config.splash.damageMult * bonusMult, fromTower, { type: 'bomb' });
    }
    applyAttributeOnHitEffects(fromTower, enemy, dealtDamage, config, attackDamage, hitEnemies.length);
  });
}

function applyOnKillChainSplash(fromTower, deadEnemy, chainConfig) {
  if (chainConfig.chance && Math.random() >= chainConfig.chance) return;
  if (!deadEnemy.element) return;

  const rect = deadEnemy.element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = 130 * chainConfig.radiusMult;
  const baseDamage = getTowerDamage(fromTower);

  [...enemies].forEach(enemy => {
    if (enemy === deadEnemy || !document.body.contains(enemy.element)) return;
    const enemyRect = enemy.element.getBoundingClientRect();
    const dx = centerX - (enemyRect.left + enemyRect.width / 2);
    const dy = centerY - (enemyRect.top + enemyRect.height / 2);
    if (Math.sqrt(dx * dx + dy * dy) <= radius) {
      damageEnemy(enemy, baseDamage * chainConfig.damageMult, fromTower, { type: 'bomb' });
    }
  });
}

function applyAttributeOnKillEffects(fromTower, deadEnemy) {
  if (!fromTower) return;
  const attribute = fromTower.dataset.attribute || 'none';
  const config = getAttributeEffectConfig(attribute);
  if (!config) return;

  if (config.killHeal && (!config.killHeal.requiresControlledAtDeath || isEnemyControlled(deadEnemy))) {
    recoverCastleHealthByAmount(deadEnemy.maxHp * config.killHeal.percent);
  }

  if (config.onKillChainSplash) {
    applyOnKillChainSplash(fromTower, deadEnemy, config.onKillChainSplash);
  }

  if (config.onKillBuff) {
    const now = Date.now();
    const newBuffUntil = now + config.onKillBuff.durationMs;
    const currentBuffUntil = parseInt(fromTower.dataset.buffUntil || '0', 10);
    if (newBuffUntil > currentBuffUntil) {
      fromTower.dataset.buffUntil = `${newBuffUntil}`;
      fromTower.dataset.buffDamageMult = `${config.onKillBuff.damageMult}`;
      fromTower.dataset.buffAtkIntervalMult = `${config.onKillBuff.atkIntervalMult ?? 1}`;
    }
    if (config.onKillBuff.lifestealBonusPercent) {
      recoverCastleHealthByAmount(deadEnemy.maxHp * config.onKillBuff.lifestealBonusPercent);
    }
  }
}

function maybeTriggerUltimateBurst(tower) {
  const attribute = tower.dataset.attribute || 'none';
  const config = getAttributeEffectConfig(attribute);
  if (!config || !config.ultimateBurst) return;

  const now = Date.now();
  const readyAt = parseInt(tower.dataset.ultimateReadyAt || '0', 10);
  if (now < readyAt) return;

  tower.dataset.ultimateReadyAt = `${now + config.ultimateBurst.cooldownMs / gameSpeed}`;
  const baseDamage = getTowerDamage(tower);
  [...enemies].forEach(enemy => {
    if (!document.body.contains(enemy.element)) return;
    const dealt = damageEnemy(enemy, baseDamage * config.ultimateBurst.damageMult, tower, { type: 'bomb' });
    if (dealt > 0 && document.body.contains(enemy.element)) {
      const stopUntil = now + config.ultimateBurst.stunMs;
      if (stopUntil > parseInt(enemy.element.dataset.stopUntil || '0', 10)) enemy.element.dataset.stopUntil = `${stopUntil}`;
    }
  });
}

function formatPercent(fraction) {
  return `${Math.round(fraction * 100)}%`;
}

function formatSeconds(ms) {
  const seconds = Math.round((ms / 1000) * 10) / 10;
  return `${seconds}초`;
}

function formatMultiplier(value) {
  return `${Math.round(value * 100) / 100}`;
}

function getAttributeEffectDescription(attribute) {
  const config = getAttributeEffectConfig(attribute);
  if (!config) return '';

  const clauses = [];

  if (config.freeze) {
    clauses.push(`공격 시 적을 ${formatSeconds(config.freeze.stunMs)}간 얼리고, 이후 ${formatSeconds(config.freeze.slowMs)}간 이동 속도를 ${formatPercent(1 - config.freeze.slowMult)} 감소시킵니다.`);
  }

  if (config.slow) {
    const areaText = config.slow.radiusMult ? ' 범위 내' : '';
    clauses.push(`공격 시${areaText} 적의 이동 속도를 ${formatSeconds(config.slow.durationMs)}간 ${formatPercent(1 - config.slow.speedMult)} 감소시킵니다.`);
  }

  if (config.stun) {
    const areaText = config.stun.radiusMult ? ' 범위 내' : '';
    const chanceText = config.stun.chance ? `${formatPercent(config.stun.chance)} 확률로 ` : '';
    const hitCountText = config.stun.afterHitCount ? `${config.stun.afterHitCount}회 공격마다 ` : '';
    const nearCastleText = config.stun.nearCastleOnly ? ' 성 근처의' : '';
    clauses.push(`${hitCountText}${chanceText}공격 시${areaText}${nearCastleText} 적을 ${formatSeconds(config.stun.durationMs)}간 정지시킵니다.`);
  }

  if (config.burn) {
    clauses.push(`공격 시 1초마다 공격력의 ${formatPercent(config.burn.tickMult)}씩 ${config.burn.ticks}회(총 ${formatPercent(config.burn.tickMult * config.burn.ticks)}) 화상 피해를 입힙니다.`);
  }

  if (config.splash) {
    clauses.push(`공격 시 반경 ${Math.round(130 * config.splash.radiusMult)} 내 적에게 공격력의 ${formatPercent(config.splash.damageMult)}만큼 피해를 줍니다.`);
  }

  if (config.suppressRegen) {
    clauses.push(`공격 시 ${formatSeconds(config.suppressRegen.durationMs)}간 적의 회복 효과를 막습니다.`);
  }

  if (config.damageMult !== undefined && config.damageMult !== 1) {
    clauses.push(config.damageMult > 1
      ? `공격력이 ${formatMultiplier(config.damageMult)}배가 됩니다.`
      : `공격력이 ${formatPercent(1 - config.damageMult)} 감소합니다.`);
  }

  if (config.atkIntervalMult !== undefined && config.atkIntervalMult !== 1) {
    clauses.push(config.atkIntervalMult < 1
      ? `공격 속도가 ${formatMultiplier(1 / config.atkIntervalMult)}배 빨라집니다.`
      : `공격 속도가 ${formatMultiplier(config.atkIntervalMult)}배 느려집니다.`);
  }

  if (config.starUpChance) {
    clauses.push(`타격 시 ${formatPercent(config.starUpChance)} 확률로 적을 3성으로 강화시킵니다.`);
  }

  if (config.lifesteal) {
    clauses.push(`준 피해의 ${formatPercent(config.lifesteal.percent)}만큼 성 체력을 회복합니다.`);
  }

  if (config.bonusVsControlled && config.bonusVsControlled.appliesTo !== 'burn') {
    clauses.push(`둔화/정지 중인 적에게 ${formatMultiplier(config.bonusVsControlled.damageMult)}배 피해를 줍니다.`);
  }

  if (config.bonusVsBoss && config.bonusVsBoss.appliesTo !== 'burn') {
    clauses.push(`보스(5의 배수 레벨)에게 ${formatMultiplier(config.bonusVsBoss.damageMult)}배 피해를 줍니다.`);
  }

  if (config.bonusVsLowHp) {
    clauses.push(`체력이 ${formatPercent(config.bonusVsLowHp.hpPercentThreshold)} 이하인 적에게 ${formatMultiplier(config.bonusVsLowHp.damageMult)}배 피해를 줍니다.`);
  }

  if (config.killHeal) {
    clauses.push(`처치 시 적 최대 체력의 ${formatPercent(config.killHeal.percent)}만큼 성 체력을 회복합니다.`);
  }

  if (config.onKillChainSplash) {
    clauses.push(`처치 시 반경 ${Math.round(130 * config.onKillChainSplash.radiusMult)}에 공격력의 ${formatPercent(config.onKillChainSplash.damageMult)}만큼 연쇄 폭발 피해를 줍니다.`);
  }

  if (config.onKillBuff) {
    clauses.push(`처치 시 ${formatSeconds(config.onKillBuff.durationMs)}간 공격력 ${formatMultiplier(config.onKillBuff.damageMult)}배로 강화됩니다.`);
  }

  if (config.stackingDamage) {
    clauses.push(`같은 적을 계속 공격할수록 피해가 최대 ${formatPercent(config.stackingDamage.perStackMult * (config.stackingDamage.maxStacks - 1))}까지 누적 증가합니다.`);
  }

  if (config.selfPauseCycle) {
    clauses.push(`${formatSeconds(config.selfPauseCycle.activeMs)} 동안 공격 후 ${formatSeconds(config.selfPauseCycle.pauseMs)}간 멈춥니다.`);
  }

  if (config.ultimateBurst) {
    clauses.push(`${formatSeconds(config.ultimateBurst.cooldownMs)}마다 화면의 모든 적에게 공격력의 ${formatMultiplier(config.ultimateBurst.damageMult)}배 피해를 주고 ${formatSeconds(config.ultimateBurst.stunMs)}간 정지시킵니다.`);
  }

  return clauses.join(' ');
}
