function getSupabaseConfig() {
  return window.SUPABASE_CONFIG || {};
}

function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && (config.publicKey || config.anonKey) && config.rankingsTable);
}

function renderRanking(rows, options = {}) {
  const list = document.getElementById(options.listId || 'ranking-list');
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
    if (options.team) {
      name.classList.add('team-ranking-names');
      const playerNames = Array.isArray(row.player_names) ? row.player_names : [];
      const playerCount = Math.max(1, parseInt(row.player_count || playerNames.length || '1', 10));
      name.textContent = playerNames.length ? `[${playerCount}인] ${playerNames.join(', ')}` : '팀원 없음';
      name.title = name.textContent;
    } else {
      name.textContent = row.name || 'Guest';
    }

    const time = document.createElement('span');
    time.className = 'ranking-time';
    time.textContent = `${formatNumber(row.survival_time || 0)}초`;

    item.append(rank, name, time);
    list.appendChild(item);
  });
}

function showRankingMessage(message, listId = 'ranking-list') {
  const list = document.getElementById(listId);
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

async function loadTeamRanking() {
  const listId = 'team-ranking-list';
  const config = getSupabaseConfig();
  if (!isSupabaseConfigured() || !config.teamRankingsTable) {
    showRankingMessage('Supabase 팀 랭킹 설정이 필요합니다.', listId);
    return;
  }

  const supabaseKey = config.publicKey || config.anonKey;
  try {
    const query = 'select=player_names,player_count,survival_time,created_at&order=survival_time.desc&limit=10';
    const response = await fetch(`${config.url}/rest/v1/${config.teamRankingsTable}?${query}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });
    if (!response.ok) throw new Error(`Team ranking request failed: ${response.status}`);
    renderRanking(await response.json(), { listId, team: true });
  } catch (error) {
    console.error(error);
    showRankingMessage('팀 랭킹을 불러오지 못했습니다.', listId);
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
loadTeamRanking();
