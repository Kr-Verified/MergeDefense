let teamEquipmentIdSecond = 0;
let teamEquipmentIdSequence = 0;

function allocateEquipmentId() {
  if (!window.TeamSession?.isActive() || !window.TeamSession.clientId) return equipmentId++;
  const second = Math.floor(Date.now() / 1000);
  if (second !== teamEquipmentIdSecond) {
    teamEquipmentIdSecond = second;
    teamEquipmentIdSequence = 0;
  }
  let clientHash = 0;
  for (const char of window.TeamSession.clientId) clientHash = (clientHash * 31 + char.charCodeAt(0)) % 1000;
  const id = second * 1000000 + clientHash * 1000 + teamEquipmentIdSequence;
  teamEquipmentIdSequence = (teamEquipmentIdSequence + 1) % 1000;
  return id;
}

function createEquipment() {
  const types = Object.keys(EQUIPMENT_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const minValue = type === 'needle' ? 3 : type === 'shield' ? 5 : 3;
  const maxValue = type === 'needle' ? 10 : type === 'shield' ? 50 : 45;
  return {
    id: allocateEquipmentId(),
    type: type,
    value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
  };
}

function createMergedEquipment(firstEquipment, secondEquipment) {
  const minValue = Math.min(firstEquipment.value, secondEquipment.value);
  const maxValue = firstEquipment.value + secondEquipment.value;
  return {
    id: allocateEquipmentId(),
    type: firstEquipment.type,
    value: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
  };
}

function getEquipmentHtml(equipment) {
  const meta = EQUIPMENT_TYPES[equipment.type];
  return `
    <p class="equipment-name">${meta.name}</p>
    <p class="equipment-effect">${meta.description} +${formatNumber(equipment.value)}%</p>
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

function spawnEquipment() {
  if (isSpectatorMode()) return;
  const equipment = createEquipment();
  addEquipmentToInventory(equipment);
  GameAudio.play('loot', { volume: 0.55, throttle: 100 });
  reportTeamSharedState();
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
      slot.innerHTML = `<span>${formatNumber(unlockLevel)}Lv 잠금</span>`;
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
  if (isSpectatorMode()) return;
  if (!selectedTower || !draggedEquipment) return;
  if (getTowerUpgradeTotal(selectedTower) < EQUIPMENT_SLOT_UNLOCK_LEVELS[slotIndex]) return;

  const equipment = getTowerEquipment(selectedTower);
  if (equipment[slotIndex]) return;

  const oldMaxHp = getTowerMaxHp(selectedTower);
  equipment[slotIndex] = {
    id: parseInt(draggedEquipment.dataset.id),
    type: draggedEquipment.dataset.type,
    value: parseInt(draggedEquipment.dataset.value)
  };

  setTowerEquipment(selectedTower, equipment);
  applyTowerMaxHpDelta(selectedTower, oldMaxHp);
  draggedEquipment.remove();
  draggedEquipment = null;
  GameAudio.play('equip');
  refreshUpgradeUi();
  reportTeamSharedState();
}

function unequipEquipment(slotIndex) {
  if (isSpectatorMode()) return;
  if (!selectedTower) return;

  const equipment = getTowerEquipment(selectedTower);
  const equipped = equipment[slotIndex];
  if (!equipped) return;

  const oldMaxHp = getTowerMaxHp(selectedTower);
  equipment[slotIndex] = null;
  setTowerEquipment(selectedTower, equipment);
  applyTowerMaxHpDelta(selectedTower, oldMaxHp);
  addEquipmentToInventory(equipped);
  refreshUpgradeUi();
  reportTeamSharedState();
}

function releaseTowerEquipment(tower) {
  getTowerEquipment(tower).forEach(equipment => {
    if (equipment) addEquipmentToInventory(equipment);
  });
  setTowerEquipment(tower, [null, null, null]);
}

function makeEquipmentDraggable(elem) {
  elem.addEventListener('dragstart', e => {
    if (isSpectatorMode()) {
      e.preventDefault();
      return;
    }
    draggedEquipment = elem;
    draggedTower = null;
  });

  elem.addEventListener('dragend', e => {
    draggedEquipment = null;
    window.TeamSession?.flushPendingSharedStates?.();
  });

  elem.addEventListener('dragover', e => {
    if (draggedEquipment && draggedEquipment !== elem) e.preventDefault();
  });

  elem.addEventListener('drop', e => {
    e.preventDefault();
    if (isSpectatorMode()) return;
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
  if (isSpectatorMode()) return;
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
  GameAudio.play('equipmentMerge');
  setInventoryView('item');
  reportTeamSharedState();
}

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
