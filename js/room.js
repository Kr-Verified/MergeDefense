const statusMessage = document.getElementById('status-message');
const preRoomView = document.getElementById('pre-room-view');
const lobbyView = document.getElementById('lobby-view');
const roomListEl = document.getElementById('room-list');
const createRoomNameInput = document.getElementById('create-room-name');
const createRoomPasswordInput = document.getElementById('create-room-password');
const createRoomMaxSelect = document.getElementById('create-room-max');
const createRoomSpectatorsInput = document.getElementById('create-room-spectators');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomCodeInput = document.getElementById('join-room-code');
const joinRoomPasswordInput = document.getElementById('join-room-password');
const joinRoomBtn = document.getElementById('join-room-btn');
const lobbyRoomName = document.getElementById('lobby-room-name');
const lobbyCode = document.getElementById('lobby-code');
const lobbyPlayers = document.getElementById('lobby-players');
const lobbyStartBtn = document.getElementById('lobby-start-btn');
const lobbyLeaveBtn = document.getElementById('lobby-leave-btn');
const lobbyDeleteBtn = document.getElementById('lobby-delete-btn');
const lobbyWaitMessage = document.getElementById('lobby-wait-message');

let currentRoom = null;
let currentChannel = null;
let roomListTimer = null;

function getSupabaseConfig() {
  return window.SUPABASE_CONFIG || {};
}

function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && (config.publicKey || config.anonKey));
}

function getClient() {
  if (!isSupabaseConfigured() || !window.supabase || typeof window.supabase.createClient !== 'function') return null;
  const config = getSupabaseConfig();
  return window.supabase.createClient(config.url, config.publicKey || config.anonKey);
}

const supabaseClient = getClient();

function showStatus(message, isError = true) {
  statusMessage.textContent = message || '';
  statusMessage.style.color = isError ? '#f87171' : '#4ade80';
}

function ensurePlayerName() {
  const name = localStorage.getItem('name');
  if (!name) {
    window.location.href = 'index.html';
    return null;
  }
  return name;
}

function ensureClientId() {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function fetchRoomList() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('rooms')
    .select('id,code,name,max_players,password_hash,status,allow_spectators,room_players(count)')
    .in('status', ['waiting', 'playing'])
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    roomListEl.innerHTML = '<p class="room-meta">방 목록을 불러오지 못했습니다.</p>';
    return;
  }

  if (!data || !data.length) {
    roomListEl.innerHTML = '<p class="room-meta">열린 방이 없습니다. 새로 만들어보세요!</p>';
    return;
  }

  roomListEl.innerHTML = data.map(room => {
    const playerCount = room.room_players?.[0]?.count ?? 0;
    const locked = room.password_hash ? '🔒 ' : '';
    const isWaiting = room.status === 'waiting';
    const canWatch = room.status === 'playing' && room.allow_spectators === true;
    const actionButton = isWaiting
      ? `<button type="button" class="ghost fill-code-btn" data-code="${room.code}">참가</button>`
      : canWatch
        ? `<button type="button" class="watch watch-room-btn" data-room-id="${room.id}">관전</button>`
        : '';
    const statusText = isWaiting ? `${playerCount}/${room.max_players}` : '진행 중';
    return `
      <div class="room-row">
        <span class="room-name">${locked}${escapeHtml(room.name)}</span>
        <span class="room-meta">${statusText}</span>
        ${actionButton}
      </div>
    `;
  }).join('');

  [...roomListEl.querySelectorAll('.fill-code-btn')].forEach(button => {
    button.addEventListener('click', () => {
      joinRoomCodeInput.value = button.dataset.code;
      joinRoomPasswordInput.focus();
    });
  });

  [...roomListEl.querySelectorAll('.watch-room-btn')].forEach(button => {
    button.addEventListener('click', () => {
      window.location.href = `main.html?room=${button.dataset.roomId}&guest=1`;
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function createRoom() {
  if (!supabaseClient) {
    showStatus('Supabase 설정이 필요합니다.');
    return;
  }

  const name = createRoomNameInput.value.trim() || `${ensurePlayerName()}의 방`;
  const password = createRoomPasswordInput.value;
  const maxPlayers = parseInt(createRoomMaxSelect.value, 10);
  const allowSpectators = createRoomSpectatorsInput.checked;
  const clientId = ensureClientId();
  const playerName = ensurePlayerName();
  if (!playerName) return;

  createRoomBtn.disabled = true;
  showStatus('방 생성 중...', false);

  try {
    const passwordHash = password ? await sha256Hex(password) : null;
    let room = null;

    for (let attempt = 0; attempt < 5 && !room; attempt += 1) {
      const code = generateRoomCode();
      const { data, error } = await supabaseClient
        .from('rooms')
        .insert({
          code,
          name,
          password_hash: passwordHash,
          host_client_id: clientId,
          max_players: maxPlayers,
          allow_spectators: allowSpectators,
          status: 'waiting',
          castle_max_hp: 1000,
          castle_hp: 1000
        })
        .select()
        .limit(1);

      if (!error && data && data.length) room = data[0];
      else if (error && error.code !== '23505') throw error;
    }

    if (!room) throw new Error('초대코드 생성에 실패했습니다. 다시 시도해주세요.');

    const { error: joinError } = await supabaseClient.from('room_players').insert({
      room_id: room.id,
      client_id: clientId,
      name: playerName,
      is_host: true
    });
    if (joinError) throw joinError;

    showStatus('', false);
    await enterLobby(room);
  } catch (error) {
    console.error(error);
    showStatus('방 생성에 실패했습니다. Supabase 테이블 설정을 확인해주세요.');
  } finally {
    createRoomBtn.disabled = false;
  }
}

async function joinRoom() {
  if (!supabaseClient) {
    showStatus('Supabase 설정이 필요합니다.');
    return;
  }

  const code = joinRoomCodeInput.value.trim().toUpperCase();
  const password = joinRoomPasswordInput.value;
  const clientId = ensureClientId();
  const playerName = ensurePlayerName();
  if (!playerName) return;
  if (!code) {
    showStatus('초대코드를 입력해주세요.');
    return;
  }

  joinRoomBtn.disabled = true;
  showStatus('참가 중...', false);

  try {
    const { data, error } = await supabaseClient
      .from('rooms')
      .select('id,code,name,max_players,password_hash,status,room_players(count)')
      .eq('code', code)
      .limit(1);

    if (error || !data || !data.length) {
      showStatus('존재하지 않는 초대코드입니다.');
      return;
    }

    const room = data[0];
    if (room.status !== 'waiting') {
      showStatus('이미 시작되었거나 종료된 방입니다.');
      return;
    }

    const playerCount = room.room_players?.[0]?.count ?? 0;
    if (playerCount >= room.max_players) {
      showStatus('방 인원이 가득 찼습니다.');
      return;
    }

    if (room.password_hash) {
      const hash = await sha256Hex(password || '');
      if (hash !== room.password_hash) {
        showStatus('비밀번호가 틀렸습니다.');
        return;
      }
    }

    const { error: joinError } = await supabaseClient.from('room_players').upsert({
      room_id: room.id,
      client_id: clientId,
      name: playerName,
      is_host: false
    }, { onConflict: 'room_id,client_id' });
    if (joinError) throw joinError;

    showStatus('', false);
    await enterLobby(room);
  } catch (error) {
    console.error(error);
    showStatus('참가에 실패했습니다.');
  } finally {
    joinRoomBtn.disabled = false;
  }
}

async function enterLobby(room) {
  currentRoom = room;
  const clientId = ensureClientId();
  const isHost = room.host_client_id ? room.host_client_id === clientId : true;

  preRoomView.classList.add('hidden');
  lobbyView.classList.remove('hidden');
  lobbyRoomName.textContent = room.name;
  lobbyCode.textContent = room.code;
  lobbyStartBtn.classList.toggle('hidden', !isHost);
  lobbyDeleteBtn.classList.toggle('hidden', !isHost);
  lobbyWaitMessage.textContent = isHost ? '' : '호스트가 시작하기를 기다리는 중...';

  stopRoomListPolling();

  const channel = supabaseClient.channel(`room-${room.id}`, {
    config: { presence: { key: clientId } }
  });

  channel.on('presence', { event: 'sync' }, () => {
    renderLobbyPlayers(channel.presenceState());
  });

  channel.on('broadcast', { event: 'game-start' }, () => {
    window.location.href = `main.html?room=${room.id}`;
  });

  channel.subscribe(async status => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ name: localStorage.getItem('name') || 'Guest', isHost });
    }
  });

  currentChannel = channel;

  lobbyStartBtn.onclick = async () => {
    lobbyStartBtn.disabled = true;
    try {
      await supabaseClient.from('rooms').update({ status: 'playing' }).eq('id', room.id);
      channel.send({ type: 'broadcast', event: 'game-start', payload: {} });
      window.location.href = `main.html?room=${room.id}`;
    } catch (error) {
      console.error(error);
      showStatus('게임 시작에 실패했습니다.');
      lobbyStartBtn.disabled = false;
    }
  };

  lobbyDeleteBtn.onclick = async () => {
    if (!confirm('방을 삭제할까요? 참가자 전원이 방에서 나가게 됩니다.')) return;
    await supabaseClient.from('rooms').delete().eq('id', room.id);
    leaveLobbyView();
  };

  lobbyLeaveBtn.onclick = async () => {
    await supabaseClient.from('room_players').delete().eq('room_id', room.id).eq('client_id', clientId);
    if (isHost) await supabaseClient.from('rooms').delete().eq('id', room.id);
    leaveLobbyView();
  };
}

function renderLobbyPlayers(presenceState) {
  const entries = Object.values(presenceState).flat();
  lobbyPlayers.innerHTML = entries.map(entry => `
    <div class="lobby-player">${escapeHtml(entry.name || 'Guest')}${entry.isHost ? ' 👑' : ''}</div>
  `).join('');
}

function leaveLobbyView() {
  if (currentChannel) {
    supabaseClient.removeChannel(currentChannel);
    currentChannel = null;
  }
  currentRoom = null;
  lobbyView.classList.add('hidden');
  preRoomView.classList.remove('hidden');
  startRoomListPolling();
}

function startRoomListPolling() {
  fetchRoomList();
  roomListTimer = setInterval(fetchRoomList, 4000);
}

function stopRoomListPolling() {
  if (roomListTimer) clearInterval(roomListTimer);
  roomListTimer = null;
}

createRoomBtn.addEventListener('click', createRoom);
joinRoomBtn.addEventListener('click', joinRoom);

ensurePlayerName();
ensureClientId();

if (!supabaseClient) {
  showStatus('Supabase 설정이 필요합니다. js/supabase-config.js를 확인해주세요.');
  roomListEl.innerHTML = '<p class="room-meta">Supabase 설정이 필요합니다.</p>';
} else {
  startRoomListPolling();
}
