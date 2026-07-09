function makeDraggable(elem) {
  elem.addEventListener('dragstart', e => { draggedTower = elem; });

  elem.addEventListener('click', e => {
    e.stopPropagation();
    if (!elem.classList.contains('tower')) return;
    if (board.contains(elem)) { openUpgradeModal(elem); return; }
    if (createBar.contains(elem)) openTowerActionPopup(elem);
  });

  elem.addEventListener('dragover', e => { e.preventDefault(); });

  elem.addEventListener('drop', e => {
    e.preventDefault();

    if (!draggedTower || draggedTower === elem) return;
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
    }
  });
}

function setInventoryView(view) {
  inventoryView = view;
  updateInventoryView();
}

function updateInventoryView() {
  const showTowers = inventoryView === 'tower';
  let visibleCount = 0;

  towerViewBtn.classList.toggle('active', showTowers);
  itemViewBtn.classList.toggle('active', !showTowers);

  [...createBar.querySelectorAll('.tower')].forEach(tower => {
    if (board.contains(tower)) return;
    tower.classList.toggle('hidden-inventory', !showTowers);
    if (showTowers) visibleCount += 1;
  });

  [...createBar.querySelectorAll('.equipment')].forEach(equipment => {
    equipment.classList.toggle('hidden-inventory', showTowers);
    if (!showTowers) visibleCount += 1;
  });

  inventoryEmpty.textContent = showTowers ? '대기 중인 포탑이 없습니다' : '보유 중인 아이템이 없습니다';
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

    if (from.contains(draggedTower)) {
      if (to === board && getInstalledTowerCount() >= towerLimit) {
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
      updateInventoryView();
      refreshUpgradeUi();
    }

    draggedTower = null;
  };
}


board.addEventListener('drop', move(createBar, board));
createBar.addEventListener('drop', move(board, createBar));
