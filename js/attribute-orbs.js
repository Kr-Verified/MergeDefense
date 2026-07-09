const FUSION_RECIPES = [
  { ingredients: ['water', 'water', 'water'], result: '빙결', effect: '적을 1초간 얼리고, 이후 3초간 둔화시킵니다.' },
  { ingredients: ['fire', 'fire', 'fire'], result: '지옥불', effect: '5초 동안 강한 지속 피해를 줍니다. 지속 피해 중인 적은 회복 효과를 받지 못합니다.' },
  { ingredients: ['bomb', 'bomb', 'bomb'], result: '핵폭발', effect: '매우 넓은 범위 피해를 주지만 공격 속도가 크게 느려집니다.' },
  { ingredients: ['ball', 'ball', 'ball'], result: '광속', effect: '공격 속도가 매우 빨라지지만, 낮은 확률로 적을 3성 강화시킵니다.' },
  { ingredients: ['power', 'power', 'power'], result: '거인', effect: '공격력이 크게 증가하지만 공격 속도가 약간 감소합니다.' },
  { ingredients: ['wall', 'wall', 'wall'], result: '감옥', effect: '적을 짧게 정지시키고, 정지된 적이 받는 피해가 증가합니다.' },
  { ingredients: ['blood', 'blood', 'blood'], result: '흡혈귀', effect: '준 피해의 일부만큼 성 체력을 회복하고, 체력이 낮을수록 회복량이 증가합니다.' },
  { ingredients: ['water', 'fire', 'bomb'], result: '증기폭발', effect: '범위 피해를 주고, 맞은 적을 둔화시킵니다. 지속 피해도 약하게 적용됩니다.' },
  { ingredients: ['water', 'fire', 'power'], result: '열탕', effect: '높은 피해를 주고 3초간 둔화와 지속 피해를 동시에 적용합니다.' },
  { ingredients: ['water', 'fire', 'wall'], result: '냉각장벽', effect: '적을 잠시 정지시킨 뒤 둔화시키고, 정지 중일 때 지속 피해를 줍니다.' },
  { ingredients: ['water', 'fire', 'blood'], result: '생명증기', effect: '적에게 지속 피해를 주며, 피해량 일부만큼 성 체력을 회복합니다.' },
  { ingredients: ['water', 'bomb', 'ball'], result: '물폭풍', effect: '빠르게 공격하며 작은 범위 둔화를 일으킵니다.' },
  { ingredients: ['water', 'bomb', 'power'], result: '해일', effect: '넓은 범위에 강한 피해를 주고 적들을 3초간 둔화시킵니다.' },
  { ingredients: ['water', 'bomb', 'wall'], result: '홍수', effect: '범위 안의 적을 밀어내거나 잠시 정지시키고 둔화시킵니다.' },
  { ingredients: ['water', 'bomb', 'blood'], result: '흡수파도', effect: '범위 피해를 주고, 맞은 적 수에 비례해 성 체력을 회복합니다.' },
  { ingredients: ['water', 'ball', 'power'], result: '칼날비', effect: '빠른 공격으로 적을 둔화시키며, 둔화된 적에게 추가 피해를 줍니다.' },
  { ingredients: ['water', 'ball', 'wall'], result: '시간감옥', effect: '공격 속도가 빠르고, 일정 횟수 공격한 적을 잠시 정지시킵니다.' },
  { ingredients: ['water', 'ball', 'blood'], result: '피의 비', effect: '빠르게 공격하며 적을 둔화시키고, 피해 일부로 성 체력을 회복합니다.' },
  { ingredients: ['water', 'power', 'wall'], result: '빙벽', effect: '강한 피해를 주고 적을 정지시킨 뒤 둔화시킵니다.' },
  { ingredients: ['water', 'power', 'blood'], result: '냉혈', effect: '둔화된 적에게 더 큰 피해를 주고, 추가 피해량 일부를 회복합니다.' },
  { ingredients: ['water', 'wall', 'blood'], result: '생명의 늪', effect: '범위 안 적을 느리게 만들고, 오래 머무를수록 성 체력을 회복합니다.' },
  { ingredients: ['fire', 'bomb', 'ball'], result: '연쇄폭발', effect: '빠르게 공격하며 불이 붙은 적이 죽으면 작은 폭발을 일으킵니다.' },
  { ingredients: ['fire', 'bomb', 'power'], result: '화산', effect: '강한 범위 피해와 지속 피해를 줍니다. 보스에게는 지속 피해 시간이 증가합니다.' },
  { ingredients: ['fire', 'bomb', 'wall'], result: '지뢰장벽', effect: '적을 잠시 정지시키고 폭발 피해를 줍니다. 정지된 적에게 지속 피해가 더 강해집니다.' },
  { ingredients: ['fire', 'bomb', 'blood'], result: '피폭발', effect: '범위 지속 피해를 주고, 불에 타는 적 수에 비례해 성 체력을 회복합니다.' },
  { ingredients: ['fire', 'ball', 'power'], result: '광전사', effect: '공격 속도와 공격력이 모두 증가하지만, 일정 확률로 적을 강화시킵니다.' },
  { ingredients: ['fire', 'ball', 'wall'], result: '화염사슬', effect: '빠르게 공격하며 일정 확률로 적을 묶어 정지시키고 불태웁니다.' },
  { ingredients: ['fire', 'ball', 'blood'], result: '흡혈화염', effect: '빠른 지속 피해를 주고, 불 피해의 일부만큼 성 체력을 회복합니다.' },
  { ingredients: ['fire', 'power', 'wall'], result: '용암', effect: '공격 속도는 느리지만 매우 강한 피해와 정지, 지속 피해를 동시에 줍니다.' },
  { ingredients: ['fire', 'power', 'blood'], result: '피의 불꽃', effect: '공격력이 증가하고 지속 피해를 주며, 지속 피해 일부로 회복합니다.' },
  { ingredients: ['fire', 'wall', 'blood'], result: '제물의 벽', effect: '적을 정지시키고 불태웁니다. 정지된 적이 죽으면 성 체력을 회복합니다.' },
  { ingredients: ['bomb', 'ball', 'power'], result: '탄막', effect: '빠른 범위 공격을 합니다. 단일 피해는 낮지만 여러 적에게 강합니다.' },
  { ingredients: ['bomb', 'ball', 'wall'], result: '충격파', effect: '빠른 공격으로 작은 범위 피해를 주고, 일정 확률로 적을 정지시킵니다.' },
  { ingredients: ['bomb', 'ball', 'blood'], result: '피의 파편', effect: '범위 공격을 빠르게 하며, 맞은 적 수에 따라 성 체력을 회복합니다.' },
  { ingredients: ['bomb', 'power', 'wall'], result: '대포', effect: '공격 속도는 느리지만 강한 범위 피해와 짧은 정지를 줍니다.' },
  { ingredients: ['bomb', 'power', 'blood'], result: '흡혈폭탄', effect: '강한 범위 피해를 주고, 피해량 일부만큼 성 체력을 회복합니다.' },
  { ingredients: ['bomb', 'wall', 'blood'], result: '피의 장벽', effect: '범위 안 적을 정지시키고, 정지한 적 수에 비례해 성 체력을 회복합니다.' },
  { ingredients: ['ball', 'power', 'wall'], result: '파쇄', effect: '공격 속도와 공격력이 증가하지만, 일정 확률로 공격 후 잠시 과열됩니다. 적을 짧게 정지시킵니다.' },
  { ingredients: ['ball', 'power', 'blood'], result: '사냥꾼', effect: '빠르고 강한 공격을 하며, 처치 시 성 체력을 회복합니다.' },
  { ingredients: ['ball', 'wall', 'blood'], result: '흡착', effect: '빠르게 공격하며 적을 짧게 붙잡고, 붙잡힌 적에게 준 피해 일부를 회복합니다.' },
  { ingredients: ['power', 'wall', 'blood'], result: '수호자', effect: '공격 속도는 느리지만 강한 피해, 정지, 회복을 동시에 가집니다.' },
  { ingredients: ['빙결', '화산', '대포'], result: '빙화산포', effect: '매우 느리게 공격하지만, 넓은 범위에 강한 피해를 주고 적을 얼린 뒤 불태웁니다.' },
  { ingredients: ['증기폭발', '생명의 늪', '대포'], result: '늪지포', effect: '범위 피해를 주고, 맞은 적을 둔화시킵니다. 둔화된 적이 많을수록 성 체력을 회복합니다.' },
  { ingredients: ['연쇄폭발', '화산', '탄막'], result: '폭염탄막', effect: '빠르게 범위 공격을 하며, 불타는 적이 죽으면 주변에 연쇄 폭발을 일으킵니다.' },
  { ingredients: ['감옥', '빙벽', '용암'], result: '절대감옥', effect: '적을 긴 시간 정지시키고, 정지된 적에게 지속 피해와 추가 피해를 줍니다. 공격 속도는 매우 느립니다.' },
  { ingredients: ['광속', '사냥꾼', '칼날비'], result: '암살비', effect: '매우 빠르게 공격하며, 체력이 낮은 적에게 추가 피해를 줍니다. 처치 시 성 체력을 회복합니다.' },
  { ingredients: ['핵폭발', '피폭발', '흡혈폭탄'], result: '혈핵', effect: '매우 넓은 범위에 큰 피해를 주고, 맞은 적 수에 비례해 성 체력을 회복합니다. 대신 공격 간격이 깁니다.' },
  { ingredients: ['시간감옥', '화염사슬', '충격파'], result: '시간사슬', effect: '빠르게 공격하며 일정 확률로 적을 묶어 정지시킵니다. 정지된 적 주변에 충격파가 발생합니다.' },
  { ingredients: ['지옥불', '피의 불꽃', '흡혈화염'], result: '혈염', effect: '강한 지속 피해를 주고, 지속 피해의 일부만큼 성 체력을 회복합니다. 같은 적을 오래 때릴수록 피해가 증가합니다.' },
  { ingredients: ['해일', '홍수', '생명의 늪'], result: '심해', effect: '넓은 범위 적을 강하게 둔화시키고, 일정 확률로 뒤로 밀어냅니다. 범위 안 적이 많을수록 회복량이 증가합니다.' },
  { ingredients: ['거인', '대포', '파쇄'], result: '파멸포', effect: '공격 속도는 매우 느리지만, 방어력이 높은 적에게 큰 추가 피해를 줍니다. 공격 시 짧은 정지를 적용합니다.' },
  { ingredients: ['광전사', '탄막', '연쇄폭발'], result: '광란폭죽', effect: '공격 속도가 매우 빠르고, 일정 확률로 작은 폭발을 연속으로 일으킵니다. 낮은 확률로 적을 강화시킬 위험이 있습니다.' },
  { ingredients: ['수호자', '생명의 늪', '피의 장벽'], result: '성역', effect: '공격력은 낮지만 적을 오래 붙잡고, 성 체력을 꾸준히 회복합니다. 방어형 최종 속성 느낌입니다.' },
  { ingredients: ['빙결', '시간감옥', '감옥'], result: '영구동토', effect: '적을 자주 정지시키고 둔화시킵니다. 대신 피해량은 낮습니다.' },
  { ingredients: ['화산', '지뢰장벽', '용암'], result: '마그마지대', effect: '공격한 위치에 잠시 마그마 장판을 남깁니다. 장판 위 적은 지속 피해를 받고 느려집니다.' },
  { ingredients: ['물폭풍', '칼날비', '암살비'], result: '폭우검', effect: '빠르게 여러 번 공격하며, 둔화된 적에게 치명타 확률이 증가합니다.' },
  { ingredients: ['흡혈귀', '사냥꾼', '혈염'], result: '포식자', effect: '적을 처치할 때마다 일시적으로 공격력과 회복량이 증가합니다.' },
  { ingredients: ['핵폭발', '절대감옥', '혈핵'], result: '종말', effect: '아주 긴 쿨타임 후 화면 전체에 큰 피해를 주고, 살아남은 적을 잠시 정지시킵니다.' },
  { ingredients: ['광속', '광전사', '광란폭죽'], result: '과부하', effect: '공격 속도가 극단적으로 빨라집니다. 일정 시간 공격 후 잠시 멈추며, 적 강화 확률이 존재합니다.' },
  { ingredients: ['대포', '빙화산포', '파멸포'], result: '천공포', effect: '보스와 고체력 적에게 매우 강한 단일 폭발 피해를 줍니다. 주변 적에게는 약한 범위 피해를 줍니다.' },
  { ingredients: ['성역', '수호자', '절대감옥'], result: '왕성수호', effect: '성 근처의 적을 강하게 정지시키고, 성 체력이 낮을수록 회복량과 정지 시간이 증가합니다.' }
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
    <p class="recipe-book-effect">${recipe.effect}</p>
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
  reportTeamSharedState();
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
  reportTeamSharedState();
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
  reportTeamSharedState();
}

const FORGE_SLOT_BUTTONS = [forgeSlot0Btn, forgeSlot1Btn, forgeSlot2Btn];

function openBlacksmithModal() {
  forgeSlots = [null, null, null];
  forgeActiveSlot = null;
  refreshBlacksmithModal();
  blacksmithModal.classList.remove('hidden');
}

function closeBlacksmithModal() {
  blacksmithModal.classList.add('hidden');
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
  forgeEffectText.textContent = recipe ? recipe.effect : '';

  forgeCombineBtn.disabled = !recipe || !hasEnoughOrbsForForge(recipe);
}

function hasEnoughOrbsForForge(recipe) {
  if (!recipe) return false;

  const needed = {};
  forgeSlots.forEach(key => { needed[key] = (needed[key] || 0) + 1; });
  return Object.keys(needed).every(key => (attributeOrbs[key] || 0) >= needed[key]);
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
  const recipe = findFusionRecipe(forgeSlots);
  if (!recipe || !hasEnoughOrbsForForge(recipe)) return;

  forgeSlots.forEach(key => { attributeOrbs[key] -= 1; });
  addAttributeOrb(recipe.result, 1);
  forgeSlots = [null, null, null];
  forgeActiveSlot = null;
  refreshBlacksmithModal();
  reportTeamSharedState();
}
