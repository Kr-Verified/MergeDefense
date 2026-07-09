function getFusedAttributeKey(firstAttribute, secondAttribute) {
  return [firstAttribute, secondAttribute].sort().join('+');
}

function getTowerDeleteCost(tower) {
  const lv = parseInt(tower.dataset.lv || '1');
  return lv * lv;
}

function addAttributeOrb(attribute, count = 1) {
  if (!attribute || attribute === 'none') return;
  attributeOrbs[attribute] = (attributeOrbs[attribute] || 0) + count;
}

function getOwnedAttributeOrbEntries() {
  return Object.keys(attributeOrbs)
    .filter(key => attributeOrbs[key] > 0)
    .sort((a, b) => {
      const aIndex = BASE_ATTRIBUTES.indexOf(a);
      const bIndex = BASE_ATTRIBUTES.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    })
    .map(key => ({ key, count: attributeOrbs[key] }));
}

function getBlacksmithDisplayEntries() {
  const entries = BASE_ATTRIBUTES.map(key => ({ key, count: attributeOrbs[key] || 0 }));
  getOwnedAttributeOrbEntries().forEach(entry => {
    if (!BASE_ATTRIBUTES.includes(entry.key)) entries.push(entry);
  });
  return entries;
}

function getOrbChipHtml(entry) {
  return `
    <div class="orb-chip attribute-${getAttributeClass(entry.key)}" data-attribute="${entry.key}">
      <span class="orb-name">${getAttributeText(entry.key)}</span>
      <span class="orb-count">x${entry.count}</span>
    </div>
  `;
}

function openTowerActionPopup(tower) {
  waitingTowerActionTarget = tower;
  renderTowerActionPopup();
  towerActionPopup.classList.remove('hidden');
  positionTowerActionPopup(tower);
}

function positionTowerActionPopup(tower) {
  const rect = tower.getBoundingClientRect();
  towerActionPanel.style.left = `${rect.left + rect.width / 2}px`;
  towerActionPanel.style.top = `${rect.top + rect.height / 2}px`;

  const margin = 10;
  const panelRect = towerActionPanel.getBoundingClientRect();
  let shiftX = 0;
  let shiftY = 0;
  if (panelRect.left < margin) shiftX = margin - panelRect.left;
  if (panelRect.right > window.innerWidth - margin) shiftX = window.innerWidth - margin - panelRect.right;
  if (panelRect.top < margin) shiftY = margin - panelRect.top;
  if (panelRect.bottom > window.innerHeight - margin) shiftY = window.innerHeight - margin - panelRect.bottom;
  if (shiftX || shiftY) {
    towerActionPanel.style.left = `${rect.left + rect.width / 2 + shiftX}px`;
    towerActionPanel.style.top = `${rect.top + rect.height / 2 + shiftY}px`;
  }
}

function renderTowerActionPopup() {
  const tower = waitingTowerActionTarget;
  if (!tower) return;

  const lv = tower.dataset.lv;
  const star = parseInt(tower.dataset.star || '1');
  const attribute = tower.dataset.attribute || 'none';
  towerActionTitle.textContent = `${lv} Lv 포탑`;
  towerActionSubtitle.textContent = `${getStarText(star)} · ${getAttributeText(attribute) || '속성 없음'}`;
  const deleteCost = getTowerDeleteCost(tower);
  towerActionDeleteBtn.textContent = `삭제 (-${deleteCost} $)`;
  towerActionDeleteBtn.disabled = coins < deleteCost;
  towerActionDisassembleBtn.disabled = attribute === 'none';
  towerActionDisassembleBtn.textContent = attribute === 'none' ? '분해 (속성 없음)' : `분해 (${getAttributeText(attribute)} 구슬)`;
}

function hideTowerActionPopup() {
  towerActionPopup.classList.add('hidden');
}

function cancelTowerAction() {
  hideTowerActionPopup();
  waitingTowerActionTarget = null;
}

function disassembleWaitingTower() {
  const tower = waitingTowerActionTarget;
  if (!tower) return;

  const attribute = tower.dataset.attribute || 'none';
  if (attribute === 'none') return;

  hideTowerActionPopup();
  addAttributeOrb(attribute, 1);
  tower.remove();
  waitingTowerActionTarget = null;
  updateInventoryView();
  refreshUpgradeUi();
}

function refreshDeleteTowerModal() {
  if (!waitingTowerActionTarget) return;
  const cost = getTowerDeleteCost(waitingTowerActionTarget);
  deleteTowerCostText.textContent = `삭제 시 ${cost} $ 이 소모됩니다.`;
  confirmDeleteTowerBtn.disabled = coins < cost;
}

function openDeleteTowerModal() {
  if (!waitingTowerActionTarget) return;
  refreshDeleteTowerModal();
  deleteTowerModal.classList.remove('hidden');
}

function closeDeleteTowerModal() {
  deleteTowerModal.classList.add('hidden');
  waitingTowerActionTarget = null;
}

function confirmDeleteTower() {
  if (!waitingTowerActionTarget) return;

  const cost = getTowerDeleteCost(waitingTowerActionTarget);
  if (coins < cost) return;

  coins -= cost;
  waitingTowerActionTarget.remove();
  closeDeleteTowerModal();
  updateInventoryView();
  refreshUpgradeUi();
}

function openFusionModal() {
  if (!waitingTowerActionTarget) return;
  renderFusionModal();
  fusionModal.classList.remove('hidden');
}

function closeFusionModal() {
  fusionModal.classList.add('hidden');
  waitingTowerActionTarget = null;
}

function renderFusionModal() {
  const tower = waitingTowerActionTarget;
  if (!tower) return;

  const currentAttribute = tower.dataset.attribute || 'none';
  fusionCurrentAttributeText.textContent = `현재 속성: ${getAttributeText(currentAttribute) || '없음'}`;

  const entries = getOwnedAttributeOrbEntries();
  fusionOrbList.innerHTML = entries.length
    ? entries.map(getOrbChipHtml).join('')
    : '<p class="fusion-empty">보유 중인 속성 구슬이 없습니다. 대장장에서 확인하세요.</p>';
}

function applyFusionOrb(attribute) {
  const tower = waitingTowerActionTarget;
  if (!tower || (attributeOrbs[attribute] || 0) < 1) return;

  attributeOrbs[attribute] -= 1;
  setTowerAttribute(tower, attribute);
  closeFusionModal();
  updateInventoryView();
}

function openBlacksmithModal() {
  forgeSlots = [null, null];
  forgeActiveSlot = null;
  refreshBlacksmithModal();
  blacksmithModal.classList.remove('hidden');
}

function closeBlacksmithModal() {
  blacksmithModal.classList.add('hidden');
  forgeSlots = [null, null];
  forgeActiveSlot = null;
}

function refreshBlacksmithModal() {
  blacksmithOrbList.innerHTML = getBlacksmithDisplayEntries().map(getOrbChipHtml).join('');

  [0, 1].forEach(index => {
    const slotBtn = index === 0 ? forgeSlot0Btn : forgeSlot1Btn;
    const key = forgeSlots[index];
    slotBtn.textContent = key ? getAttributeText(key) : '+';
    slotBtn.className = `forge-slot${key ? ` attribute-${getAttributeClass(key)}` : ''}${forgeActiveSlot === index ? ' active' : ''}`;
  });

  const resultKey = forgeSlots[0] && forgeSlots[1] ? getFusedAttributeKey(forgeSlots[0], forgeSlots[1]) : null;
  forgeResultEl.textContent = resultKey ? getAttributeText(resultKey) : '?';
  forgeResultEl.className = `forge-slot forge-result${resultKey ? ` attribute-${getAttributeClass(resultKey)}` : ''}`;

  forgeCombineBtn.disabled = !hasEnoughOrbsForForge();
}

function hasEnoughOrbsForForge() {
  const [first, second] = forgeSlots;
  if (!first || !second) return false;
  if (first === second) return (attributeOrbs[first] || 0) >= 2;
  return (attributeOrbs[first] || 0) >= 1 && (attributeOrbs[second] || 0) >= 1;
}

function selectForgeSlot(index) {
  if (forgeSlots[index]) {
    forgeSlots[index] = null;
    forgeActiveSlot = null;
    refreshBlacksmithModal();
    return;
  }
  forgeActiveSlot = forgeActiveSlot === index ? null : index;
  refreshBlacksmithModal();
}

function assignForgeOrb(attribute) {
  if (forgeActiveSlot === null || (attributeOrbs[attribute] || 0) < 1) return;
  forgeSlots[forgeActiveSlot] = attribute;
  forgeActiveSlot = null;
  refreshBlacksmithModal();
}

function combineForge() {
  if (!hasEnoughOrbsForForge()) return;

  const [first, second] = forgeSlots;
  attributeOrbs[first] -= 1;
  attributeOrbs[second] -= 1;
  addAttributeOrb(getFusedAttributeKey(first, second), 1);
  forgeSlots = [null, null];
  forgeActiveSlot = null;
  refreshBlacksmithModal();
}
