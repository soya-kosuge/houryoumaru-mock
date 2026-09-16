(() => {
  'use strict';
  const body = document.querySelector('#reservation-history-table tbody');
  if (!body) return;
  const appData = window.HoryomaruAppData;
  const base = Array.isArray(appData?.reservations) ? appData.reservations : [];
  let local = [];
  try { local = JSON.parse(localStorage.getItem('horyomaruAdminReservations') || '[]'); } catch (_) { local = []; }
  if (!Array.isArray(local)) local = [];
  const trips = appData?.getTrips?.() || [];
  const tripMap = new Map(trips.map((trip) => [trip.id, trip]));
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const normalizeDate = (v) => String(v || '').replaceAll('/','-');
  const progressStatus = (item) => {
    if (['キャンセル', '通常キャンセル', '無断キャンセル'].includes(String(item.status || '').trim())) return item.status;
    const reservedAt = new Date(item.reservedAt || item.createdAt || '').getTime();
    if (!Number.isFinite(reservedAt)) return item.status === '予約中' ? '予約中' : '予約完了';
    return Date.now() - reservedAt >= 48 * 60 * 60 * 1000 ? '予約完了' : '予約中';
  };
  const all = [...base, ...local].filter((item, index, arr) => arr.findIndex((x) => x.id === item.id) === index);
  const past = all.filter((item) => normalizeDate(item.dateKey || item.date) < todayKey);

  const render = () => {
    const date = document.getElementById('history-date').value;
    const course = document.getElementById('history-course').value;
    const name = document.getElementById('history-name').value.trim().toLowerCase();
    const filtered = past.filter((item) => {
      const itemDate = normalizeDate(item.dateKey || item.date);
      return (!date || itemDate === date) && (!course || item.course === course) && (!name || String(item.name || '').toLowerCase().includes(name));
    }).sort((a,b) => normalizeDate(b.dateKey || b.date).localeCompare(normalizeDate(a.dateKey || a.date)));
    body.innerHTML = filtered.map((item) => {
      const trip = tripMap.get(item.tripId) || trips.find((t) => t.date === normalizeDate(item.dateKey || item.date) && t.course === item.course);
      const status = progressStatus(item);
      const ship = item.ship || trip?.ship || '未設定';
      const params = new URLSearchParams({
        date: normalizeDate(item.dateKey || item.date),
        course: item.course || '',
        ship,
        name: item.name || ''
      });
      return `<tr><td>${esc(normalizeDate(item.dateKey || item.date).replaceAll('-','/'))}</td><td>${esc(item.course || '－')}</td><td>${esc(ship)}</td><td>${esc(item.name || '－')}</td><td>${Number(item.participants || 0)}名</td><td>${Number(item.rentalRod || 0) ? `${Number(item.rentalRod)}本` : 'なし'}</td><td>${esc(status)}</td><td><a class="btn btn-primary btn-sm" href="adminReservationDetail.html?${esc(params.toString())}">詳細</a></td></tr>`;
    }).join('');
    document.getElementById('history-count').textContent = `${filtered.length}件 / 全${past.length}件`;
  };
  ['history-date','history-course','history-name'].forEach((id) => document.getElementById(id)?.addEventListener(id === 'history-name' ? 'input' : 'change', render));
  document.getElementById('history-clear')?.addEventListener('click', () => {
    document.getElementById('history-date').value = '';
    document.getElementById('history-course').value = '';
    document.getElementById('history-name').value = '';
    render();
  });
  render();
})();
