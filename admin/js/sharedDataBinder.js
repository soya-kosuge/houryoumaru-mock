(() => {
  'use strict';
  const data = window.HoryomaruAppData;
  if (!data) return;

  const trips = data.getTrips();
  const baseReservations = data.reservations || [];
  const userReservations = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('horyomaruAdminReservations') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();
  const reservations = [...baseReservations, ...userReservations];
  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const fmtDate = (d) => String(d || '').replaceAll('-', '/');
  const adminTripStatus = (trip) => {
    if (trip.status === 'full' || Number(trip.reserved || 0) >= Number(trip.capacity || 0)) {
      return { key: 'full', label: '満員', text: '× 満員' };
    }
    if (trip.status === 'few') {
      return { key: 'few', label: '残りわずか', text: '△ 残りわずか' };
    }
    return { key: 'ok', label: '空きあり', text: '〇 空きあり' };
  };

  const tripBody = document.querySelector('#trip-table tbody');
  if (tripBody) {
    tripBody.innerHTML = trips.map((trip) => {
      const status = adminTripStatus(trip);
      return `
      <tr data-search-row="">
        <td>${fmtDate(trip.date)}</td><td>${esc(trip.course)}</td><td>${esc(trip.ship)}</td><td>${esc(trip.captain)}</td>
        <td>${esc(trip.target)}</td><td>${trip.reserved} / ${trip.capacity}名</td>
        <td><span class="trip-status ${status.key}" data-status="${status.label}">${status.text}</span></td>
      </tr>`;
    }).join('');
  }

  const summaryBody = document.querySelector('#reservation-table tbody');
  if (summaryBody) {
    summaryBody.innerHTML = trips.filter((trip) => trip.reserved > 0).map((trip) => `
      <tr data-search-row><td>${fmtDate(trip.date)}</td><td>${esc(trip.course)}</td><td>${trip.reserved}名</td></tr>`).join('');
  }

  const detailBody = document.querySelector('#reservation-detail-table tbody');
  if (detailBody) {
    detailBody.innerHTML = reservations.map((item) => `
      <tr data-course="${esc(item.course)}" data-date="${esc(item.date)}" data-detail-search-row="" data-name="${esc(item.name)}">
        <td data-editable>${esc(item.date)}</td><td data-editable>${esc(item.course)}</td><td data-editable>${esc(item.name)}</td>
        <td data-editable>${esc(item.nameKana || '－')}</td><td data-editable>${Number(item.participants || 0)}名</td>
        <td data-editable>${Number(item.rentalRod || 0) ? `${Number(item.rentalRod)}本` : 'なし'}</td>
        <td data-editable>${esc(item.phone || '－')}</td><td data-editable>${esc(item.email || '－')}</td>
        <td><button class="btn btn-primary btn-sm" data-edit-row type="button">修正</button></td>
      </tr>`).join('');
  }

  const printBody = document.querySelector('#print-reservation-table tbody');
  if (printBody) {
    printBody.innerHTML = reservations.map((item) => `
      <tr data-print-row><td>${esc(item.date)}</td><td>${esc(item.course)}</td><td>${esc(item.name)}</td>
      <td>${Number(item.participants || 0)}名</td><td>${Number(item.rentalRod || 0) ? `${Number(item.rentalRod)}本` : 'なし'}</td><td>${esc(item.phone || '－')}</td></tr>`).join('');
  }

  // ダッシュボードは共通データの「本日(2026-08-06)」を表示する。
  const dashboardTitle = [...document.querySelectorAll('.sub-title')].find((el) => el.textContent.includes('本日'));
  if (dashboardTitle) {
    const today = '2026-08-06';
    const todayTrips = trips.filter((trip) => trip.date === today);
    dashboardTitle.textContent = '本日(08/06)の出船';
    const list = dashboardTitle.parentElement?.querySelector('.kpi-list');
    if (list) {
      list.innerHTML = todayTrips.map((trip, index) => `
        <div class="kpi-row${index ? ' dashboard-trip-separator' : ''}"><span>${esc(trip.course)}</span><strong>${esc(trip.time)} 出船</strong></div>
        <div class="kpi-row"><span>予約人数</span><strong>${trip.reserved} / ${trip.capacity}名</strong></div>
        <div class="kpi-row"><span>担当</span><strong>${esc(trip.captain)}</strong></div>`).join('');
    }
    const cards = document.querySelectorAll('.stat-card');
    const todayBookings = reservations.filter((r) => String(r.dateKey || r.date || '').replaceAll('/','-') === today);
    const participants = todayBookings.reduce((sum,r) => sum + Number(r.participants || 0), 0);
    if (cards[0]) {
      cards[0].querySelector('.stat-value').textContent = `${todayBookings.length}件`;
      cards[0].querySelector('.stat-note').textContent = `参加予定 ${participants}名`;
    }
    if (cards[1]) {
      const monthBookings = reservations.filter((r) => String(r.dateKey || r.date || '').replaceAll('/','-').startsWith('2026-08'));
      cards[1].querySelector('.stat-value').textContent = `${monthBookings.length}件`;
      cards[1].querySelector('.stat-note').textContent = `参加予定 ${monthBookings.reduce((s,r)=>s+Number(r.participants||0),0)}名`;
    }
  }
})();
