const params = new URLSearchParams(window.location.search);
if (params.get('team') === '1') {
  const seconds = parseInt(params.get('time') || '0', 10);
  const el = document.getElementById('team-summary');
  el.textContent = `팀 생존 시간: ${seconds}초`;
  el.classList.remove('hidden');
}

document.getElementById('retry-btn').addEventListener('click', () => {
  window.location.href = 'index.html';
});
