(function () {
  const params = new URLSearchParams(window.location.search);
  const roomIdParam = params.get('room');

  const session = {
    active: Boolean(roomIdParam),
    isHost: null,
    roomId: roomIdParam ? parseInt(roomIdParam, 10) : null,
    clientId: localStorage.getItem('clientId') || null,
    playerName: localStorage.getItem('name') || 'Guest',
    channel: null,
    ended: false,

    isActive() {
      return this.active;
    }
  };

  window.TeamSession = session;

  if (!session.active || !session.clientId || Number.isNaN(session.roomId)) {
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
    if (!session.channel) return;
    session.channel.send({
      type: 'broadcast',
      event: 'enemy-spawn',
      payload: { id: enemy.id, lv: enemy.lv }
    });
  };

  session.reportEnemyHit = function (enemyId, amount) {
    if (!session.channel) return;
    session.channel.send({
      type: 'broadcast',
      event: 'enemy-hit',
      payload: { id: enemyId, amount: amount, from: session.clientId }
    });
  };

  session.reportEnemyDeath = function (enemyId) {
    if (!session.channel) return;
    session.channel.send({
      type: 'broadcast',
      event: 'enemy-death',
      payload: { id: enemyId, from: session.clientId }
    });
  };

  session.reportCastleHit = function (amount) {
    if (!session.channel) return;
    session.channel.send({
      type: 'broadcast',
      event: 'castle-hit',
      payload: { amount: amount, from: session.clientId }
    });
  };

  function finishTeamGame(seconds) {
    if (session.channel) {
      supabaseClient.removeChannel(session.channel);
      session.channel = null;
    }
    window.location.href = `fail.html?team=1&time=${Math.max(0, Math.floor(seconds || 0))}`;
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
    badge.textContent = session.isHost ? '팀 플레이 · 호스트' : '팀 플레이';
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
      .select('id,castle_hp,castle_max_hp,status,host_client_id')
      .eq('id', session.roomId)
      .limit(1);

    if (error || !roomRows || !roomRows.length) {
      console.error('팀 방을 찾을 수 없습니다.', error);
      session.active = false;
      return;
    }

    const room = roomRows[0];
    session.isHost = room.host_client_id === session.clientId;

    if (typeof maxHealth !== 'undefined') {
      maxHealth = room.castle_max_hp || maxHealth;
      health = room.castle_hp || maxHealth;
      updateHealthText();
    }

    const channel = supabaseClient.channel(`room-${session.roomId}`, {
      config: { broadcast: { self: false }, presence: { key: session.clientId } }
    });

    channel.on('broadcast', { event: 'enemy-spawn' }, ({ payload }) => {
      if (!session.isHost) spawnEnemy(payload.id, payload.lv);
    });

    channel.on('broadcast', { event: 'enemy-hit' }, ({ payload }) => {
      if (payload.from === session.clientId) return;
      applyRemoteEnemyHit(payload.id, payload.amount);
    });

    channel.on('broadcast', { event: 'enemy-death' }, ({ payload }) => {
      if (payload.from === session.clientId) return;
      removeRemoteEnemy(payload.id);
    });

    channel.on('broadcast', { event: 'castle-hit' }, ({ payload }) => {
      if (payload.from === session.clientId) return;
      applyRemoteCastleHit(payload.amount);
    });

    channel.on('broadcast', { event: 'game-end' }, ({ payload }) => {
      if (session.ended) return;
      session.ended = true;
      isGameOver = true;
      finishTeamGame(payload.seconds);
    });

    channel.on('presence', { event: 'sync' }, () => {
      renderTeamPlayerList(channel.presenceState());
    });

    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ name: session.playerName, clientId: session.clientId });
      }
    });

    session.channel = channel;

    if (session.isHost) {
      setInterval(() => {
        if (session.ended || typeof health === 'undefined') return;
        supabaseClient
          .from('rooms')
          .update({ castle_hp: Math.max(0, Math.floor(health)) })
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
