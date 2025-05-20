let towerId = 0;
let enemyId = 0;
let coins = 3;
let spawnLv = 1;
const board = document.getElementById('game-board');
const createBar = document.getElementById('create-bar');
const coinBar = document.getElementById('coin-bar');
const upgradeBtn = document.getElementById('upgrade-create-btn');
const spawnLvExpress = document.getElementById('spawnLv');
const priceBar = document.getElementById('price');
let draggedTower = null;
let health = 1000;
const enemies = [];
document.getElementById('name').textContent = `${localStorage.getItem('name')}`;

function createTower(lv) {
  return {
    id: towerId++,
    lv: lv,
    element: null
  };
}

function createEnemy(lv) {
  let hp = lv*lv*100;
  if (lv%5==0) hp*=lv; 
  return {
    id: enemyId++,
    lv: lv,
    hp: hp,
    element: null
  }
}

function spawnEnemy() {
  const lv = Math.floor(Math.random() * Math.floor(enemyId/10)+1);
  const enemy = createEnemy(lv);
  const div = document.createElement('div');
  div.className = 'enemy';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  let size = 100;
  if (parseInt(enemy.lv)%5==0) size = 150;
  div.innerHTML = `<p style="margin:0; color:red;">${enemy.lv} Lv</p><img src="./enemyImg/${enemy.lv}.png" width=${size}px></img><p style="color:red;">${enemy.hp} Hp</p>`
  div.draggable = true;
  enemy.element = div;
  div.style.position = 'absolute';
  div.style.left = '90vw';
  div.style.top = `${Math.floor(Math.random()*70)}vh`;

  div.dataset.id = enemy.id;
  div.dataset.lv = enemy.lv;

  board.appendChild(div);
  makeDraggable(div);

  const defense = document.getElementById('defense');
  const defenseRect = defense.getBoundingClientRect();
  const targetX = defenseRect.left;
  const targetY = defenseRect.top;

  enemies.push(enemy);
  moveEnemy(div, targetX, targetY);
}

function moveEnemy(enemyDiv, targetX, targetY, speed = 1.5) {
  const interval = setInterval(() => {
    const rect = enemyDiv.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 15) {
      health-=1;
      if (health<=0) window.location.href = "fail.html";
      document.getElementById('health').innerHTML = `<p style="color:red; margin-bottom:10px;">${health} Hp</p>`;
    }else {
    // 방향 벡터 단위화 후 이동
    if (parseInt(enemyDiv.dataset.lv)==4) speed = 2.3;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    enemyDiv.style.left = `${enemyDiv.offsetLeft + vx}px`;
    enemyDiv.style.top = `${enemyDiv.offsetTop + vy}px`;
    }
  }, 16);
}

setInterval(spawnEnemy, 2500);

function spawnTower(lv) {
  const tower = createTower(lv);
  const div = document.createElement('div');
  div.className = 'tower';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.innerHTML = `<p style="margin:0;">${tower.lv} Lv</p><img src="./img/${tower.lv}.png" width=100%></img>`;
  div.draggable = true;
  tower.element = div;

  div.dataset.id = tower.id;
  div.dataset.lv = tower.lv;

  createBar.appendChild(div);
  makeDraggable(div);
}

function spawnBtn() {
  const cost = spawnLv*spawnLv;
  if (coins>=cost) {
    coins-=cost;
    coinBar.textContent = `${coins} $`;
    spawnTower(spawnLv);
  }
}

function makeDraggable(elem) {
  elem.addEventListener('dragstart', e => { draggedTower = elem; });

  elem.addEventListener('dragover', e => { e.preventDefault(); });

  elem.addEventListener('drop', e => {
    e.preventDefault();

    if (!draggedTower || draggedTower === elem) return;

    const draggedLv = parseInt(draggedTower.dataset.lv);
    const targetLv = parseInt(elem.dataset.lv);

    if (draggedLv === targetLv) {
      draggedTower.remove();
      elem.remove();

      spawnTower(draggedLv+1);
    }
  });
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
      const x = e.clientX;
      const y = e.clientY;

      const lv = parseInt(draggedTower.dataset.lv);
      const id = draggedTower.dataset.id;

      from.removeChild(draggedTower);

      const div = document.createElement('div');
      div.className = 'tower';
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.innerHTML = `<p style="margin:0;">${lv} Lv</p><img src="./img/${lv}.png" width=100%></img>`;
      div.draggable = true;
      div.dataset.lv = lv;
      div.dataset.id = id;

      if (to === board) {
        div.style.position = 'absolute';
        div.style.left = `${x - 40}px`;
        div.style.top = `${y - 40}px`;
        div.style.zIndex = '0';
      } else {
        div.style.position = 'relative'; // 기본 정렬
      }

      makeDraggable(div);
      to.appendChild(div);
    }

    draggedTower = null;
  };
}


board.addEventListener('drop', move(createBar, board));
createBar.addEventListener('drop', move(board, createBar));

function fireBullet(fromTower, toEnemy) {
  if (fromTower.dataset.attacking === 'true') return;
  fromTower.dataset.attacking = 'true';
  const bullet = document.createElement('div');
  bullet.className = 'bullet';
  bullet.style.position = 'absolute';
  bullet.style.width = '10px';
  bullet.style.height = '10px';
  bullet.style.borderRadius = '50%';
  bullet.style.backgroundColor = 'black';
  bullet.style.zIndex = '-1';

  // 타워 중심 위치
  const towerRect = fromTower.getBoundingClientRect();

  bullet.style.left = `${towerRect.left + towerRect.width / 2}px`;
  bullet.style.top = `${towerRect.top + towerRect.height / 2}px`;

  document.body.appendChild(bullet);

  const interval = setInterval(() => {
    const bulletX = bullet.offsetLeft;
    const bulletY = bullet.offsetTop;
    const targetX = toEnemy.element.offsetLeft + 40;
    const targetY = toEnemy.element.offsetTop + 40;

    const dx = targetX - bulletX;
    const dy = targetY - bulletY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const outOfScreen = bulletX < 0 || bulletX > window.innerWidth || bulletY < 0 || bulletY > window.innerHeight;

    if (dist < 10 || outOfScreen) {
      clearInterval(interval);
      bullet.remove();

      // 피 깎기
      toEnemy.hp -= parseInt(Math.floor(Math.pow(fromTower.dataset.lv, 1.5)))*10;
      toEnemy.element.innerHTML = `<p style="margin:0; color:red;">${toEnemy.lv} Lv</p><img src="./enemyImg/${toEnemy.lv}.png" width=100px></img><p style="color:red;">${toEnemy.hp} Hp</p>`;
      if (toEnemy.hp <= 0) {
        if (document.body.contains(toEnemy.element)) toEnemy.element.remove();
        coins += parseInt(toEnemy.element.dataset.lv)*parseInt(toEnemy.element.dataset.lv);
        coinBar.textContent = `${coins} $`;
        const idx = enemies.indexOf(toEnemy)
        if (idx!=-1) enemies.splice(idx, 1);
      }
      fromTower.dataset.attacking = 'false';
      return;
    }

    const speed = 5;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    bullet.style.left = `${bulletX + vx}px`;
    bullet.style.top = `${bulletY + vy}px`;
  }, 16);
}

function towerAttackLoop() {
  const towers = document.querySelectorAll('.tower');
  towers.forEach(tower => {
    const towerRect = tower.getBoundingClientRect();

    enemies.forEach(enemy => {
      const enemyRect = enemy.element.getBoundingClientRect();
      const dx = (enemyRect.left + 40) - (towerRect.left + 40);
      const dy = (enemyRect.top + 40) - (towerRect.top + 40);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 400 && board.contains(tower)) {
        fireBullet(tower, enemy);
      }
    });
  });
}

// 매 1초마다 타워 공격 시도
setInterval(towerAttackLoop, 1000);


function upgradeCreate() {
  const cost = Math.pow(spawnLv, 4)*5;
  if ( coins >= cost ) {
    coins -= cost;
    spawnLv += 1;
    coinBar.textContent = `${coins} $`;
    upgradeBtn.textContent = `생성 단계 향상 ${Math.pow(spawnLv, 4)*5} $`;
    spawnLvExpress.textContent = `${spawnLv} 생성`;
    priceBar.textContent = `${spawnLv*spawnLv} $`
  }
}