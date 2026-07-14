function makeDraggable(elem) {
  elem.addEventListener('dragstart', e => {
    if (isSpectatorMode()) {
      e.preventDefault();
      return;
    }
    draggedTower = elem;
  });

  elem.addEventListener('dragend', () => {
    draggedTower = null;
    window.TeamSession?.flushPendingSharedStates?.();
  });

  elem.addEventListener('click', e => {
    e.stopPropagation();
    if (isSpectatorMode()) return;
    if (!elem.classList.contains('tower')) return;
    if (board.contains(elem)) { openUpgradeModal(elem); return; }
    if (createBar.contains(elem)) openTowerActionPopup(elem);
  });

  elem.addEventListener('dragover', e => { e.preventDefault(); });

  elem.addEventListener('drop', e => {
    e.preventDefault();

    if (!draggedTower || draggedTower === elem) return;
    if (isSpectatorMode()) return;
    if (!draggedTower.classList.contains('tower') || !elem.classList.contains('tower')) return;

    const draggedLv = parseInt(draggedTower.dataset.lv);
    const targetLv = parseInt(elem.dataset.lv);

    if (draggedLv === targetLv) {
      const resultStar = Math.max(
        parseInt(draggedTower.dataset.star || '1'),
        parseInt(elem.dataset.star || '1')
      );
      const draggedAttribute = draggedTower.dataset.attribute || 'none';
      const targetAttribute = elem.dataset.attribute || 'none';
      const resultAttribute = getMergedTowerAttribute(draggedAttribute, targetAttribute);
      releaseTowerEquipment(draggedTower);
      releaseTowerEquipment(elem);
      if (draggedTower === selectedTower || elem === selectedTower) closeUpgradeModal();
      if (draggedTower === waitingTowerActionTarget || elem === waitingTowerActionTarget) cancelTowerAction();
      draggedTower.remove();
      elem.remove();

      spawnTower(draggedLv+1, resultStar, resultAttribute);
      GameAudio.play('merge', { volume: 0.65 });
      maybeGrantRecipeBook();
      reportTeamSharedState();
    }
  });
}

function setInventoryView(view) {
  inventoryView = view;
  updateInventoryView();
}

function updateInventoryView() {
  const showTowers = inventoryView === 'tower';
  const showItems = inventoryView === 'item';
  const showRecipes = inventoryView === 'recipe';
  let visibleCount = 0;

  towerViewBtn.classList.toggle('active', showTowers);
  itemViewBtn.classList.toggle('active', showItems);
  blacksmithBtn.classList.toggle('active', showRecipes);

  [...createBar.querySelectorAll('.tower')].forEach(tower => {
    if (board.contains(tower)) return;
    tower.classList.toggle('hidden-inventory', !showTowers);
    if (showTowers) visibleCount += 1;
  });

  [...createBar.querySelectorAll('.equipment')].forEach(equipment => {
    equipment.classList.toggle('hidden-inventory', !showItems);
    if (showItems) visibleCount += 1;
  });

  [...createBar.querySelectorAll('.recipe-book')].forEach(book => {
    book.classList.toggle('hidden-inventory', !showRecipes);
    if (showRecipes) visibleCount += 1;
  });

  const emptyMessages = {
    tower: '대기 중인 포탑이 없습니다',
    item: '보유 중인 아이템이 없습니다',
    recipe: '보유 중인 조합서가 없습니다'
  };
  inventoryEmpty.textContent = emptyMessages[inventoryView] || '';
  inventoryEmpty.classList.toggle('hidden-inventory', visibleCount > 0);
}

board.addEventListener('dragover', e => {
  e.preventDefault();
});
createBar.addEventListener('dragover', e => {
  e.preventDefault();
});

function move(from, to) {
  return function (e) {
    e.preventDefault();
    if (!draggedTower) return;
    if (isSpectatorMode()) {
      draggedTower = null;
      return;
    }

    if (from.contains(draggedTower)) {
      if (to === board && getInstalledTowerCount() >= towerLimit) {
        GameAudio.play('error');
        draggedTower = null;
        refreshUpgradeUi();
        return;
      }

      const x = e.clientX;
      const y = e.clientY;

      const lv = parseInt(draggedTower.dataset.lv);
      const id = draggedTower.dataset.id;

      if (draggedTower === selectedTower) closeUpgradeModal();
      if (draggedTower === waitingTowerActionTarget) cancelTowerAction();
      from.removeChild(draggedTower);

      const div = document.createElement('div');
      div.className = `tower star-${draggedTower.dataset.star || '1'} attribute-${getAttributeClass(draggedTower.dataset.attribute || 'none')}`;
      div.innerHTML = getTowerHtml(lv, parseInt(draggedTower.dataset.star || '1'), draggedTower.dataset.attribute || 'none');
      div.draggable = true;
      div.dataset.lv = lv;
      div.dataset.id = id;
      copyTowerStats(draggedTower, div);
      applyTowerSizeClass(div);

      if (to === board) {
        div.classList.add('installed');
        div.style.position = 'absolute';
        div.style.left = `${x - 40}px`;
        div.style.top = `${y - 40}px`;
        div.style.zIndex = '10';
      } else {
        div.classList.remove('installed');
        div.style.position = 'relative'; // 기본 정렬
        div.style.zIndex = '1';
      }

      makeDraggable(div);
      to.appendChild(div);
      GameAudio.play(to === board ? 'place' : 'recall');
      updateInventoryView();
      refreshUpgradeUi();
      reportTeamSharedState();
    }

    draggedTower = null;
  };
}


board.addEventListener('drop', move(createBar, board));
createBar.addEventListener('drop', move(board, createBar));
