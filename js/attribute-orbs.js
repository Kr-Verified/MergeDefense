const FUSION_RECIPES = [
  { ingredients: ['water', 'water', 'water'], result: '빙결' },
  { ingredients: ['fire', 'fire', 'fire'], result: '지옥불' },
  { ingredients: ['bomb', 'bomb', 'bomb'], result: '핵폭발' },
  { ingredients: ['ball', 'ball', 'ball'], result: '광속' },
  { ingredients: ['power', 'power', 'power'], result: '거인' },
  { ingredients: ['wall', 'wall', 'wall'], result: '감옥' },
  { ingredients: ['blood', 'blood', 'blood'], result: '흡혈귀' },
  { ingredients: ['water', 'fire', 'bomb'], result: '증기폭발' },
  { ingredients: ['water', 'fire', 'power'], result: '열탕' },
  { ingredients: ['water', 'fire', 'wall'], result: '냉각장벽' },
  { ingredients: ['water', 'fire', 'blood'], result: '생명증기' },
  { ingredients: ['water', 'bomb', 'ball'], result: '물폭풍' },
  { ingredients: ['water', 'bomb', 'power'], result: '해일' },
  { ingredients: ['water', 'bomb', 'wall'], result: '홍수' },
  { ingredients: ['water', 'bomb', 'blood'], result: '흡수파도' },
  { ingredients: ['water', 'ball', 'power'], result: '칼날비' },
  { ingredients: ['water', 'ball', 'wall'], result: '시간감옥' },
  { ingredients: ['water', 'ball', 'blood'], result: '피의 비' },
  { ingredients: ['water', 'power', 'wall'], result: '빙벽' },
  { ingredients: ['water', 'power', 'blood'], result: '냉혈' },
  { ingredients: ['water', 'wall', 'blood'], result: '생명의 늪' },
  { ingredients: ['fire', 'bomb', 'ball'], result: '연쇄폭발' },
  { ingredients: ['fire', 'bomb', 'power'], result: '화산' },
  { ingredients: ['fire', 'bomb', 'wall'], result: '지뢰장벽' },
  { ingredients: ['fire', 'bomb', 'blood'], result: '피폭발' },
  { ingredients: ['fire', 'ball', 'power'], result: '광전사' },
  { ingredients: ['fire', 'ball', 'wall'], result: '화염사슬' },
  { ingredients: ['fire', 'ball', 'blood'], result: '흡혈화염' },
  { ingredients: ['fire', 'power', 'wall'], result: '용암' },
  { ingredients: ['fire', 'power', 'blood'], result: '피의 불꽃' },
  { ingredients: ['fire', 'wall', 'blood'], result: '제물의 벽' },
  { ingredients: ['bomb', 'ball', 'power'], result: '탄막' },
  { ingredients: ['bomb', 'ball', 'wall'], result: '충격파' },
  { ingredients: ['bomb', 'ball', 'blood'], result: '피의 파편' },
  { ingredients: ['bomb', 'power', 'wall'], result: '대포' },
  { ingredients: ['bomb', 'power', 'blood'], result: '흡혈폭탄' },
  { ingredients: ['bomb', 'wall', 'blood'], result: '피의 장벽' },
  { ingredients: ['ball', 'power', 'wall'], result: '파쇄' },
  { ingredients: ['ball', 'power', 'blood'], result: '사냥꾼' },
  { ingredients: ['ball', 'wall', 'blood'], result: '흡착' },
  { ingredients: ['power', 'wall', 'blood'], result: '수호자' },
  { ingredients: ['빙결', '화산', '대포'], result: '빙화산포' },
  { ingredients: ['증기폭발', '생명의 늪', '대포'], result: '늪지포' },
  { ingredients: ['연쇄폭발', '화산', '탄막'], result: '폭염탄막' },
  { ingredients: ['감옥', '빙벽', '용암'], result: '절대감옥' },
  { ingredients: ['광속', '사냥꾼', '칼날비'], result: '암살비' },
  { ingredients: ['핵폭발', '피폭발', '흡혈폭탄'], result: '혈핵' },
  { ingredients: ['시간감옥', '화염사슬', '충격파'], result: '시간사슬' },
  { ingredients: ['지옥불', '피의 불꽃', '흡혈화염'], result: '혈염' },
  { ingredients: ['해일', '홍수', '생명의 늪'], result: '심해' },
  { ingredients: ['거인', '대포', '파쇄'], result: '파멸포' },
  { ingredients: ['광전사', '탄막', '연쇄폭발'], result: '광란폭죽' },
  { ingredients: ['수호자', '생명의 늪', '피의 장벽'], result: '성역' },
  { ingredients: ['빙결', '시간감옥', '감옥'], result: '영구동토' },
  { ingredients: ['화산', '지뢰장벽', '용암'], result: '마그마지대' },
  { ingredients: ['물폭풍', '칼날비', '암살비'], result: '폭우검' },
  { ingredients: ['흡혈귀', '사냥꾼', '혈염'], result: '포식자' },
  { ingredients: ['핵폭발', '절대감옥', '혈핵'], result: '종말' },
  { ingredients: ['광속', '광전사', '광란폭죽'], result: '과부하' },
  { ingredients: ['대포', '빙화산포', '파멸포'], result: '천공포' },
  { ingredients: ['성역', '수호자', '절대감옥'], result: '왕성수호' }
];

function findFusionRecipe(ingredients) {
  if (ingredients.some(ingredient => !ingredient)) return null;

  const sorted = [...ingredients].sort();
  return FUSION_RECIPES.find(recipe => {
    const recipeSorted = [...recipe.ingredients].sort();
    return recipeSorted.length === sorted.length && recipeSorted.every((value, index) => value === sorted[index]);
  }) || null;
}

function maybeGrantRecipeBook() {
  if (isSpectatorMode()) return;
  if (Math.random() >= RECIPE_BOOK_DROP_CHANCE) return;

  const recipe = FUSION_RECIPES[Math.floor(Math.random() * FUSION_RECIPES.length)];
  if (ownedRecipeBooks[recipe.result]) return;

  ownedRecipeBooks[recipe.result] = true;
  addRecipeBookToInventory(recipe);
}

function getRecipeBookHtml(recipe) {
  return `
    <p class="recipe-book-name">${recipe.result} 조합서</p>
    <p class="recipe-book-ingredients">${recipe.ingredients.map(getAttributeText).join(' + ')}</p>
    <p class="recipe-book-effect">${getAttributeEffectDescription(recipe.result)}</p>
  `;
}

function addRecipeBookToInventory(recipe) {
  const div = document.createElement('div');
  div.className = 'recipe-book';
  div.innerHTML = getRecipeBookHtml(recipe);
  div.dataset.result = recipe.result;

  createBar.appendChild(div);
  updateInventoryView();
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

let orbTooltipEl = null;

function ensureOrbTooltip() {
  if (orbTooltipEl) return orbTooltipEl;
  orbTooltipEl = document.createElement('div');
  orbTooltipEl.id = 'orb-tooltip';
  orbTooltipEl.classList.add('hidden');
  document.body.appendChild(orbTooltipEl);
  return orbTooltipEl;
}

function positionOrbTooltip(x, y) {
  if (!orbTooltipEl || orbTooltipEl.classList.contains('hidden')) return;
  const offset = 16;
  const rect = orbTooltipEl.getBoundingClientRect();
  let left = x + offset;
  let top = y + offset;
  if (left + rect.width > window.innerWidth) left = x - rect.width - offset;
  if (top + rect.height > window.innerHeight) top = y - rect.height - offset;
  orbTooltipEl.style.left = `${Math.max(0, left)}px`;
  orbTooltipEl.style.top = `${Math.max(0, top)}px`;
}

function showOrbTooltip(attribute, x, y) {
  const text = getAttributeEffectDescription(attribute);
  if (!text) {
    hideOrbTooltip();
    return;
  }

  const tooltip = ensureOrbTooltip();
  tooltip.textContent = text;
  tooltip.classList.remove('hidden');
  positionOrbTooltip(x, y);
}

function hideOrbTooltip() {
  if (orbTooltipEl) orbTooltipEl.classList.add('hidden');
}

function openTowerActionPopup(tower) {
  if (isSpectatorMode()) return;
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
  if (isSpectatorMode()) return;
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
  reportTeamSharedState();
}

function refreshDeleteTowerModal() {
  if (!waitingTowerActionTarget) return;
  const cost = getTowerDeleteCost(waitingTowerActionTarget);
  deleteTowerCostText.textContent = `삭제 시 ${cost} $ 이 소모됩니다.`;
  confirmDeleteTowerBtn.disabled = coins < cost;
}

function openDeleteTowerModal() {
  if (isSpectatorMode()) return;
  if (!waitingTowerActionTarget) return;
  refreshDeleteTowerModal();
  deleteTowerModal.classList.remove('hidden');
}

function closeDeleteTowerModal() {
  deleteTowerModal.classList.add('hidden');
  waitingTowerActionTarget = null;
}

function confirmDeleteTower() {
  if (isSpectatorMode()) return;
  if (!waitingTowerActionTarget) return;

  const cost = getTowerDeleteCost(waitingTowerActionTarget);
  if (coins < cost) return;

  coins -= cost;
  waitingTowerActionTarget.remove();
  closeDeleteTowerModal();
  updateInventoryView();
  refreshUpgradeUi();
  reportTeamSharedState();
}

function openFusionModal() {
  if (isSpectatorMode()) return;
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
  if (isSpectatorMode()) return;
  const tower = waitingTowerActionTarget;
  if (!tower || (attributeOrbs[attribute] || 0) < 1) return;

  attributeOrbs[attribute] -= 1;
  setTowerAttribute(tower, attribute);
  closeFusionModal();
  updateInventoryView();
  reportTeamSharedState();
}

const FORGE_SLOT_BUTTONS = [forgeSlot0Btn, forgeSlot1Btn, forgeSlot2Btn];

function openBlacksmithModal() {
  if (isSpectatorMode()) return;
  forgeSlots = [null, null, null];
  forgeActiveSlot = null;
  refreshBlacksmithModal();
  blacksmithModal.classList.remove('hidden');
}

function closeBlacksmithModal() {
  blacksmithModal.classList.add('hidden');
  hideOrbTooltip();
  forgeSlots = [null, null, null];
  forgeActiveSlot = null;
}

function refreshBlacksmithModal() {
  blacksmithOrbList.innerHTML = getBlacksmithDisplayEntries().map(getOrbChipHtml).join('');

  [0, 1, 2].forEach(index => {
    const slotBtn = FORGE_SLOT_BUTTONS[index];
    const key = forgeSlots[index];
    slotBtn.textContent = key ? getAttributeText(key) : '+';
    slotBtn.className = `forge-slot${key ? ` attribute-${getAttributeClass(key)}` : ''}${forgeActiveSlot === index ? ' active' : ''}`;
  });

  const recipe = findFusionRecipe(forgeSlots);
  forgeResultEl.textContent = recipe ? getAttributeText(recipe.result) : '?';
  forgeResultEl.className = `forge-slot forge-result${recipe ? ` attribute-${getAttributeClass(recipe.result)}` : ''}`;
  forgeEffectText.textContent = recipe ? getAttributeEffectDescription(recipe.result) : '';

  forgeCombineBtn.disabled = !recipe || !hasEnoughOrbsForForge(recipe);
}

function hasEnoughOrbsForForge(recipe) {
  if (!recipe) return false;

  const needed = {};
  forgeSlots.forEach(key => { needed[key] = (needed[key] || 0) + 1; });
  return Object.keys(needed).every(key => (attributeOrbs[key] || 0) >= needed[key]);
}

function selectForgeSlot(index) {
  if (isSpectatorMode()) return;
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
  if (isSpectatorMode()) return;
  if (forgeActiveSlot === null || (attributeOrbs[attribute] || 0) < 1) return;
  forgeSlots[forgeActiveSlot] = attribute;
  forgeActiveSlot = null;
  refreshBlacksmithModal();
}

function combineForge() {
  if (isSpectatorMode()) return;
  const recipe = findFusionRecipe(forgeSlots);
  if (!recipe || !hasEnoughOrbsForForge(recipe)) return;

  forgeSlots.forEach(key => { attributeOrbs[key] -= 1; });
  addAttributeOrb(recipe.result, 1);
  forgeSlots = [null, null, null];
  forgeActiveSlot = null;
  refreshBlacksmithModal();
  reportTeamSharedState();
}
