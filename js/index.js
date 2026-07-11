function getSupabaseConfig() {
  return window.SUPABASE_CONFIG || {};
}

function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && (config.publicKey || config.anonKey) && config.rankingsTable);
}

function renderRanking(rows) {
  const list = document.getElementById('ranking-list');
  list.innerHTML = '';

  if (!rows.length) {
    const empty = document.createElement('li');
    empty.className = 'ranking-message';
    empty.textContent = '아직 기록이 없습니다.';
    list.appendChild(empty);
    return;
  }

  rows.forEach((row, index) => {
    const item = document.createElement('li');
    item.className = 'ranking-row';

    const rank = document.createElement('span');
    rank.textContent = `#${formatNumber(index + 1)}`;

    const name = document.createElement('span');
    name.className = 'ranking-name';
    name.textContent = row.name || 'Guest';

    const time = document.createElement('span');
    time.className = 'ranking-time';
    time.textContent = `${formatNumber(row.survival_time || 0)}초`;

    item.append(rank, name, time);
    list.appendChild(item);
  });
}

function showRankingMessage(message) {
  const list = document.getElementById('ranking-list');
  list.innerHTML = '';
  const item = document.createElement('li');
  item.className = 'ranking-message';
  item.textContent = message;
  list.appendChild(item);
}

async function loadRanking() {
  if (!isSupabaseConfigured()) {
    showRankingMessage('Supabase 설정이 필요합니다.');
    return;
  }

  const config = getSupabaseConfig();
  const supabaseKey = config.publicKey || config.anonKey;
  try {
    const response = await fetch(`${config.url}/rest/v1/${config.rankingsTable}?select=name,survival_time,created_at&order=survival_time.desc&limit=10`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });
    if (!response.ok) throw new Error(`Ranking request failed: ${response.status}`);
    renderRanking(await response.json());
  } catch (error) {
    console.error(error);
    showRankingMessage('랭킹을 불러오지 못했습니다.');
  }
}

function login() {
  const name = document.getElementById('name').value;
  if (name != '') {
    localStorage.setItem('name', name);
    window.location.href = 'main.html';
  }
}

function goToTeamPlay() {
  const name = document.getElementById('name').value;
  if (name != '') localStorage.setItem('name', name);
  if (!localStorage.getItem('name')) {
    alert('닉네임을 입력해주세요.');
    return;
  }
  window.location.href = 'room.html';
}

document.getElementById('start-btn').addEventListener('click', login);
document.getElementById('team-btn').addEventListener('click', goToTeamPlay);

loadRanking();
