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
