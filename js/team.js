(function () {
  const params = new URLSearchParams(window.location.search);
  const roomIdParam = params.get('room');
  const isSpectatorParam = params.get('guest') === '1';

  const session = {
    active: Boolean(roomIdParam),
    isSpectator: isSpectatorParam,
    isHost: null,
    roomId: roomIdParam ? parseInt(roomIdParam, 10) : null,
    clientId: localStorage.getItem('clientId') || null,
    playerName: localStorage.getItem('name') || 'Guest',
    channel: null,
    ended: false,
    applyingSharedState: false,
    sharedStateVersion: 0,
    pendingSharedStateTimer: null,

    isActive() {
      return this.active;
    }
  };

  window.TeamSession = session;

  if (!session.active || (!session.clientId && !session.isSpectator) || Number.isNaN(session.roomId)) {
    session.active = false;
    return;
  }

  function getSupabaseClient() {
    const config = window.SUPABASE_CONFIG || {};
    if (!config.url || !(config.publicKey || config.anonKey)) return null;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    return window.supabase.createClient(config.url, config.publicKey || config.anonKey);
  }

  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    session.active = false;
    return;
  }

  session.reportEnemySpawned = function (enemy) {
    if (!session.channel || session.isSpectator) return;
    session.channel.send({
      type: 'broadcast',
      event: 'enemy-spawn',
      payload: { id: enemy.id, lv: enemy.lv, star: enemy.star, attribute: enemy.attribute }
    });
  };

  session.reportEnemyHit = function (enemyId, amount) {
    if (!session.channel || session.isSpectator) return;
    session.channel.send({
      type: 'broadcast',
      event: 'enemy-hit',
      payload: { id: enemyId, amount: amount, from: session.clientId }
    });
  };

  session.reportEnemyDeath = function (enemyId, reward = 0) {
    if (!session.channel || session.isSpectator) return;
    session.channel.send({
      type: 'broadcast',
      event: 'enemy-death',
      payload: { id: enemyId, reward: reward, from: session.clientId }
    });
  };

  session.reportCastleHit = function (amount) {
    if (!session.channel || session.isSpectator) return;
    session.channel.send({
      type: 'broadcast',
      event: 'castle-hit',
      payload: { amount: amount, from: session.clientId }
    });
  };

  session.reportCursorMove = function (xRatio, yRatio) {
    if (!session.channel || session.isSpectator) return;
    session.channel.send({
      type: 'broadcast',
      event: 'cursor-move',
      payload: { from: session.clientId, name: session.playerName, xRatio: xRatio, yRatio: yRatio }
    });
  };

  function serializeSharedState() {
    const state = serializeGameState();
    state.version = Math.max(Date.now(), session.sharedStateVersion + 1);
    return state;
  }

  function applySharedState(state, senderId = null) {
    if (!state || state.version <= session.sharedStateVersion) return;
    session.sharedStateVersion = state.version;
    session.applyingSharedState = true;

    try {
      applyGameState(state);
      saveGameStateToStorage();
      resetGameIntervals();
    } finally {
      session.applyingSharedState = false;
    }
  }

  session.reportSharedState = function () {
    if (!session.active || session.isSpectator || !session.channel || session.applyingSharedState || session.ended) return;

    clearTimeout(session.pendingSharedStateTimer);
    session.pendingSharedStateTimer = setTimeout(() => {
      if (!session.channel || session.applyingSharedState || session.ended) return;
      const state = serializeSharedState();
      session.sharedStateVersion = state.version;
      saveGameStateToStorage();
      session.channel.send({
        type: 'broadcast',
        event: 'shared-state',
        payload: { from: session.clientId, state }
      });
    }, 50);
  };

  session.reportSharedStateNow = function () {
    if (!session.active || session.isSpectator || !session.channel || session.applyingSharedState || session.ended) return;
    clearTimeout(session.pendingSharedStateTimer);
    const state = serializeSharedState();
    session.sharedStateVersion = state.version;
    saveGameStateToStorage();
    session.channel.send({
      type: 'broadcast',
      event: 'shared-state',
      payload: { from: session.clientId, state }
    });
  };

  let cursorLayer = null;
  const remoteCursors = {};
  const teamCoinInfo = {};

  function getPresenceName(clientId) {
    if (!session.channel) return null;
    const entries = session.channel.presenceState()[clientId];
    return entries && entries.length ? (entries[0].name || null) : null;
  }

  function renderTeamCoinList() {
    let list = document.getElementById('team-coin-list');
    if (!list) {
      list = document.createElement('div');
      list.id = 'team-coin-list';
      document.getElementById('game-board').appendChild(list);
    }

    list.innerHTML = '';

    Object.keys(teamCoinInfo)
      .map(clientId => ({ clientId, ...teamCoinInfo[clientId] }))
      .filter(entry => typeof entry.coins === 'number')
      .sort((a, b) => (a.clientId === session.clientId ? -1 : b.clientId === session.clientId ? 1 : 0))
      .forEach(entry => {
        const isSelf = entry.clientId === session.clientId;
        const span = document.createElement('span');
        span.className = isSelf ? 'team-coin-entry self' : 'team-coin-entry';
        span.textContent = `${entry.name || 'Guest'}${isSelf ? ' (나)' : ''} ${Math.floor(entry.coins)} $`;
        list.appendChild(span);
      });
  }

  function updateSelfCoinInfo() {
    if (session.isSpectator) return;
    teamCoinInfo[session.clientId] = {
      name: session.playerName,
      coins: typeof coins === 'number' ? coins : 0
    };
    renderTeamCoinList();
  }

  function pruneTeamCoinInfo(presenceState) {
    const activeIds = new Set(Object.keys(presenceState || {}));
    Object.keys(teamCoinInfo).forEach(clientId => {
      if (!activeIds.has(clientId)) delete teamCoinInfo[clientId];
    });
    Object.entries(presenceState || {}).forEach(([clientId, entries]) => {
      if (teamCoinInfo[clientId] && entries && entries.length) {
        teamCoinInfo[clientId].name = entries[0].name || teamCoinInfo[clientId].name;
      }
    });
    renderTeamCoinList();
  }

  function removeTeamCoinList() {
    document.getElementById('team-coin-list')?.remove();
  }

  function hashStringToHue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash % 360;
  }

  function ensureCursorLayer() {
    if (cursorLayer) return cursorLayer;
    cursorLayer = document.createElement('div');
    cursorLayer.id = 'remote-cursor-layer';
    document.body.appendChild(cursorLayer);
    return cursorLayer;
  }

  function upsertRemoteCursor(clientId, name, xRatio, yRatio) {
    if (typeof xRatio !== 'number' || typeof yRatio !== 'number') return;

    let cursor = remoteCursors[clientId];
    if (!cursor) {
      const el = document.createElement('div');
      el.className = 'remote-cursor';
      el.innerHTML = '<div class="remote-cursor-dot"></div><div class="remote-cursor-name"></div>';
      el.querySelector('.remote-cursor-dot').style.backgroundColor = `hsl(${hashStringToHue(clientId)}, 75%, 58%)`;
      ensureCursorLayer().appendChild(el);
      cursor = { el: el };
      remoteCursors[clientId] = cursor;
    }

    cursor.el.querySelector('.remote-cursor-name').textContent = name || 'Guest';
    cursor.el.style.left = `${xRatio * window.innerWidth}px`;
    cursor.el.style.top = `${yRatio * window.innerHeight}px`;
  }

  function removeRemoteCursor(clientId) {
    const cursor = remoteCursors[clientId];
    if (!cursor) return;
    cursor.el.remove();
    delete remoteCursors[clientId];
  }

  function pruneRemoteCursors(presenceState) {
    const activeIds = new Set(Object.keys(presenceState || {}));
    Object.keys(remoteCursors).forEach(clientId => {
      if (!activeIds.has(clientId)) removeRemoteCursor(clientId);
    });
  }

  function removeAllRemoteCursors() {
    Object.keys(remoteCursors).forEach(removeRemoteCursor);
  }

  function finishTeamGame(seconds) {
    if (typeof clearSavedGameState === 'function') clearSavedGameState();
    removeAllRemoteCursors();
    removeTeamCoinList();

    const presenceState = session.channel ? session.channel.presenceState() : {};
    const mateNames = Object.entries(presenceState)
      .filter(([clientId]) => clientId !== session.clientId)
      .map(([, entries]) => (entries && entries[0] && entries[0].name) || 'Guest');

    if (session.channel) {
      supabaseClient.removeChannel(session.channel);
      session.channel = null;
    }

    const params = new URLSearchParams({
      team: '1',
      time: String(Math.max(0, Math.floor(seconds || 0))),
      me: session.playerName || 'Guest'
    });
    mateNames.forEach(name => params.append('mate', name));

    window.location.href = `fail.html?${params.toString()}`;
  }

  session.endGame = async function (seconds) {
    if (session.ended) return;
    session.ended = true;

    if (session.channel) {
      session.channel.send({
        type: 'broadcast',
        event: 'game-end',
        payload: { seconds: seconds, from: session.clientId }
      });
    }

    try {
      await supabaseClient.from('rooms').update({ status: 'ended' }).eq('id', session.roomId);
    } catch (error) {
      console.error('Failed to close room', error);
    }

    finishTeamGame(seconds);
  };

  function renderTeamModeBadge() {
    if (document.getElementById('team-mode-badge')) return;
    const nameEl = document.getElementById('name');
    if (!nameEl) return;

    const badge = document.createElement('div');
    badge.id = 'team-mode-badge';
    badge.textContent = session.isSpectator ? '관전 모드' : session.isHost ? '팀 플레이 · 호스트' : '팀 플레이';
    nameEl.insertAdjacentElement('afterend', badge);
  }

  function renderTeamPlayerList(presenceState) {
    let list = document.getElementById('team-player-list');
    if (!list) {
      list = document.createElement('div');
      list.id = 'team-player-list';
      document.getElementById('game-board').appendChild(list);
    }

    const names = Object.values(presenceState)
      .flat()
      .map(entry => entry.name || 'Guest');
    list.textContent = names.length ? `팀원: ${names.join(', ')}` : '';
  }

  async function init() {
    const { data: roomRows, error } = await supabaseClient
      .from('rooms')
      .select('id,castle_hp,castle_max_hp,status,host_client_id,allow_spectators')
      .eq('id', session.roomId)
      .limit(1);

    if (error || !roomRows || !roomRows.length) {
      console.error('팀 방을 찾을 수 없습니다.', error);
      session.active = false;
      return;
    }

    const room = roomRows[0];
    if (session.isSpectator && (room.status !== 'playing' || room.allow_spectators !== true)) {
      session.active = false;
      window.location.href = 'room.html';
      return;
    }

    session.isHost = !session.isSpectator && room.host_client_id === session.clientId;

    if (typeof maxHealth !== 'undefined') {
      maxHealth = room.castle_max_hp || maxHealth;
      health = room.castle_hp || maxHealth;
      updateHealthText();
    }

    const channel = supabaseClient.channel(`room-${session.roomId}`, {
      config: { broadcast: { self: false }, presence: { key: session.clientId || `guest-${Date.now()}` } }
    });

    channel.on('broadcast', { event: 'enemy-spawn' }, ({ payload }) => {
      if (!session.isHost) spawnEnemy(payload.id, payload.lv, payload.attribute, payload.star);
    });

    channel.on('broadcast', { event: 'enemy-hit' }, ({ payload }) => {
      if (payload.from === session.clientId) return;
      applyRemoteEnemyHit(payload.id, payload.amount);
    });

    channel.on('broadcast', { event: 'enemy-death' }, ({ payload }) => {
      if (payload.from === session.clientId) return;
      coins += Math.max(0, parseInt(payload.reward || '0', 10));
      refreshUpgradeUi();
      removeRemoteEnemy(payload.id);
      updateSelfCoinInfo();
    });

    channel.on('broadcast', { event: 'castle-hit' }, ({ payload }) => {
      if (payload.from === session.clientId) return;
      applyRemoteCastleHit(payload.amount);
    });

    channel.on('broadcast', { event: 'shared-state' }, ({ payload }) => {
      if (!payload || payload.from === session.clientId) return;
      applySharedState(payload.state, payload.from);
      const peerCoins = payload.state?.globals?.coins;
      if (typeof peerCoins === 'number') {
        teamCoinInfo[payload.from] = {
          name: getPresenceName(payload.from) || teamCoinInfo[payload.from]?.name || 'Guest',
          coins: peerCoins
        };
      }
      updateSelfCoinInfo();
    });

    channel.on('broadcast', { event: 'state-request' }, ({ payload }) => {
      if (!session.isHost || !payload || payload.from === session.clientId) return;
      session.reportSharedStateNow();
    });

    channel.on('broadcast', { event: 'game-end' }, ({ payload }) => {
      if (session.ended) return;
      session.ended = true;
      isGameOver = true;
      finishTeamGame(payload.seconds);
    });

    channel.on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
      if (!payload || payload.from === session.clientId) return;
      upsertRemoteCursor(payload.from, payload.name, payload.xRatio, payload.yRatio);
    });

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      renderTeamPlayerList(presenceState);
      pruneRemoteCursors(presenceState);
      pruneTeamCoinInfo(presenceState);
    });

    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        if (!session.isSpectator) {
          await channel.track({ name: session.playerName, clientId: session.clientId });
        }
        updateSelfCoinInfo();
        if (!session.isHost) {
          channel.send({
            type: 'broadcast',
            event: 'state-request',
            payload: { from: session.clientId }
          });
        } else {
          session.reportSharedStateNow();
        }
      }
    });

    session.channel = channel;

    setInterval(() => {
      if (session.ended) return;
      updateSelfCoinInfo();
    }, 1000);

    let lastCursorSentAt = 0;
    document.addEventListener('mousemove', e => {
      if (!session.channel || session.ended || session.isSpectator) return;
      const now = Date.now();
      if (now - lastCursorSentAt < 80) return;
      lastCursorSentAt = now;
      session.reportCursorMove(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    });

    if (session.isHost) {
      setInterval(() => {
        if (session.ended || typeof health === 'undefined') return;
        supabaseClient
          .from('rooms')
          .update({
            castle_hp: Math.max(0, Math.floor(health)),
            castle_max_hp: Math.max(1, Math.floor(maxHealth)),
            updated_at: new Date().toISOString()
          })
          .eq('id', session.roomId)
          .then(() => {});
      }, 5000);
    }

    renderTeamModeBadge();
    if (typeof resetGameIntervals === 'function') resetGameIntervals();
  }

  window.addEventListener('DOMContentLoaded', () => {
    init().catch(error => {
      console.error('팀 세션 초기화 실패', error);
      session.active = false;
    });
  });
})();
