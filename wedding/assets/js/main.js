const weddingDate = new Date('2026-10-04T00:00:00+09:00');

function renderCalendar() {
  const target = document.querySelector('#calendar-days');
  if (!target) return;

  const year = 2026;
  const monthIndex = 9;
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < firstDay; i += 1) {
    fragment.append(document.createElement('span'));
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const cell = document.createElement('span');
    cell.textContent = String(day);
    if (day === 4) {
      cell.className = 'is-wedding-day';
      cell.setAttribute('aria-label', '10월 4일 결혼식');
    }
    fragment.append(cell);
  }

  target.append(fragment);
}

function renderCountdown() {
  const target = document.querySelector('#countdown');
  if (!target) return;

  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();
  const days = Math.ceil(diff / 86_400_000);

  if (days > 0) target.textContent = `결혼식까지 ${days}일 남았습니다.`;
  else if (days === 0) target.textContent = '오늘, 저희 결혼합니다.';
  else target.textContent = '함께 축복해 주셔서 감사합니다.';
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function bindCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        showToast('복사했습니다.');
      } catch {
        showToast('복사하지 못했습니다.');
      }
    });
  });
}

renderCalendar();
renderCountdown();
bindCopyButtons();
