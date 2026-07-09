const params = new URLSearchParams(window.location.search);

function getShareUrl() {
  return `${window.location.origin}${window.location.pathname.replace('fail.html', 'index.html')}`;
}

async function shareRecord(shareText) {
  const shareUrl = getShareUrl();

  if (navigator.share) {
    try {
      await navigator.share({ title: '머지디펜스 기록', text: shareText, url: shareUrl });
    } catch (error) {
      if (error.name !== 'AbortError') console.error('공유에 실패했습니다.', error);
    }
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('기록이 클립보드에 복사되었습니다. SNS에 붙여넣어 공유해보세요!');
    } catch (error) {
      console.error('클립보드 복사에 실패했습니다.', error);
    }
    return;
  }

  window.prompt('아래 내용을 복사해 공유해보세요.', `${shareText} ${shareUrl}`);
}

let shareText = '';

if (params.get('team') === '1') {
  const seconds = parseInt(params.get('time') || '0', 10);
  const selfName = params.get('me') || 'Guest';
  const mateNames = params.getAll('mate');

  const rosterEl = document.getElementById('team-roster');
  rosterEl.innerHTML = '';

  const selfSpan = document.createElement('span');
  selfSpan.className = 'roster-self';
  selfSpan.textContent = `${selfName} (나)`;
  rosterEl.appendChild(selfSpan);

  mateNames.forEach(name => {
    const separator = document.createElement('span');
    separator.textContent = ', ';
    rosterEl.appendChild(separator);

    const mateSpan = document.createElement('span');
    mateSpan.textContent = name;
    rosterEl.appendChild(mateSpan);
  });

  document.getElementById('team-time').textContent = `팀 생존 시간: ${seconds}초`;
  document.getElementById('team-summary').classList.remove('hidden');

  shareText = mateNames.length
    ? `머지디펜스에서 ${selfName}님이 ${mateNames.join(', ')}님과 함께 ${seconds}초 동안 생존했습니다! 나도 도전해보기 →`
    : `머지디펜스에서 ${selfName}님이 ${seconds}초 동안 생존했습니다! 나도 도전해보기 →`;
} else {
  const name = params.get('name') || localStorage.getItem('name') || 'Guest';
  const seconds = parseInt(params.get('time') || '0', 10);

  const summaryEl = document.getElementById('solo-summary');
  summaryEl.textContent = `${name}님의 생존 시간: ${seconds}초`;
  summaryEl.classList.remove('hidden');

  shareText = `머지디펜스에서 ${name}님이 ${seconds}초 동안 생존했습니다! 나도 도전해보기 →`;
}

const shareBtn = document.getElementById('share-btn');
shareBtn.classList.remove('hidden');
shareBtn.addEventListener('click', () => {
  shareRecord(shareText);
});

document.getElementById('retry-btn').addEventListener('click', () => {
  window.location.href = 'index.html';
});
