(() => {
  'use strict';
  const data = window.HoryomaruAppData;
  if (!data) return;

  const trips = data.getTrips();
  const shipSettings = {
    'カムトゥドリーム': { capacity: 12, specialCapacity: 0 },
    'ドリーム': { capacity: 30, specialCapacity: 3 },
    'スーパードリーム': { capacity: 32, specialCapacity: 6 }
  };
  const julyHistoryTrips = [
    ['2026-07-29', '半夜便', 'スーパードリーム', 16, 32],
    ['2026-07-29', '深夜便', 'ドリーム', 8, 30],
    ['2026-07-30', '半夜便', 'スーパードリーム', 8, 32],
    ['2026-07-30', '深夜便', 'ドリーム', 8, 30],
    ['2026-07-31', '半夜便', 'スーパードリーム', 16, 32],
    ['2026-07-31', '半夜便', 'カムトゥドリーム', 10, 12],
    ['2026-07-31', '深夜便', 'ドリーム', 16, 30]
  ].map(([date, course, ship, reserved, capacity], index) => ({
    id: `history-${date}-${index + 1}`, date, course, ship, reserved, capacity,
    time: course === '半夜便' ? '17:00' : '22:00',
    target: 'マイカ＆ムギイカ',
    captain: index % 2 === 0 ? '佐藤船長' : '山田船長',
    specialCapacity: shipSettings[ship].specialCapacity,
    specialReserved: 0,
    remaining: capacity - reserved,
    status: capacity - reserved <= 3 ? 'few' : 'ok',
    price: 13000
  }));
  const adminTrips = [
    ...julyHistoryTrips,
    ...trips
  ];
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
  const todayKey = new Date(Date.now() + (9 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const tripById = new Map(trips.map((trip) => [trip.id, trip]));
  const reservationTrip = (item) => tripById.get(item.tripId) || trips.find((trip) => {
    const dateKey = String(item.dateKey || item.date || '').replaceAll('/', '-');
    return trip.date === dateKey && trip.course === item.course;
  });
  const reservationShip = (item) => item.ship || reservationTrip(item)?.ship || '未設定';
  const detailUrl = ({ date, course, ship }) => {
    const params = new URLSearchParams({
      date: String(date || '').replaceAll('/', '-'),
      course: String(course || ''),
      ship: String(ship || '')
    });
    return `adminReservationDetail.html?${params.toString()}`;
  };
  const cancellationLabel = (status) => {
    if (['無断キャンセル', 'no-show', 'no_show'].includes(status)) return '無断キャンセル';
    if (['キャンセル', '通常キャンセル', 'cancelled', 'canceled'].includes(status)) return '通常キャンセル';
    return 'なし';
  };
  const cancellationClass = (label) => label === '無断キャンセル' ? 'no-show' : (label === '通常キャンセル' ? 'normal' : 'none');
  const isCancelledReservation = (status) => [
    'キャンセル', '通常キャンセル', '無断キャンセル', 'cancelled', 'canceled', 'no-show', 'no_show'
  ].includes(String(status || '').trim());
  const isNoShowReservation = (status) => ['無断キャンセル', 'no-show', 'no_show'].includes(String(status || '').trim());
  const customerKey = (item) => String(item.customerId || item.phone || item.email || item.name || '').replace(/\s/g, '');
  const customerMap = new Map();
  (data.customerProfiles || []).forEach((profile) => {
    customerMap.set(String(profile.id), {
      ...profile,
      useCount: 0,
      cancelCount: 0,
      noShowCount: 0,
      lastDate: ''
    });
  });
  reservations.forEach((reservation, index) => {
    const key = customerKey(reservation) || `guest-${index + 1}`;
    const profile = customerMap.get(key) || {
      id: String(reservation.customerId || `G${String(index + 1).padStart(4, '0')}`),
      name: reservation.name || 'ゲスト',
      nameKana: reservation.nameKana || '－',
      phone: reservation.phone || '－',
      email: reservation.email || '－',
      useCount: 0,
      cancelCount: 0,
      noShowCount: 0,
      lastDate: ''
    };
    const status = String(reservation.status || '').trim();
    const dateKey = String(reservation.dateKey || reservation.date || '').replaceAll('/', '-');
    if (isCancelledReservation(status)) {
      profile.cancelCount += 1;
      if (isNoShowReservation(status)) profile.noShowCount += 1;
    } else if (dateKey && dateKey < todayKey) {
      profile.useCount += 1;
      if (!profile.lastDate || dateKey > profile.lastDate) profile.lastDate = dateKey;
    }
    customerMap.set(key, profile);
  });
  const customers = [...customerMap.values()].map((customer) => ({
    ...customer,
    rank: customer.useCount >= 6 ? '常連' : (customer.useCount >= 2 ? '一般' : '新規'),
    lastDateLabel: customer.lastDate ? fmtDate(customer.lastDate) : '－'
  }));
  window.HoryomaruAdminCustomers = customers.map((customer) => ({ ...customer }));
  const adminTripStatus = (trip) => {
    const isCancelled = trip.operationStatus === '運航中止'
      || ['中止', '運航中止'].includes(String(trip.status || '').trim());
    return isCancelled
      ? { key: 'stop', label: '運航中止', text: '× 運航中止' }
      : { key: 'ok', label: '運航可能', text: '〇 運航可能' };
  };

  const tripBody = document.querySelector('#trip-table tbody');
  if (tripBody) {
    const tripView = document.body.dataset.tripView || 'upcoming';
    const displayedTrips = adminTrips.filter((trip) => tripView === 'history' ? trip.date < todayKey : trip.date >= todayKey);
    tripBody.innerHTML = displayedTrips.map((trip) => {
      const status = adminTripStatus(trip);
      const specialCapacity = Number(trip.specialCapacity || 0);
      const specialReserved = Number(trip.specialReserved || 0);
      return `
      <tr data-search-row="" data-trip-id="${esc(trip.id)}">
        <td>${fmtDate(trip.date)}</td><td>${esc(trip.course)}</td><td>${esc(trip.ship)}</td><td>${esc(trip.captain)}</td>
        <td>${esc(trip.target)}</td><td><span class="trip-seat-summary"><span class="seat-ratio">${trip.reserved} / ${trip.capacity}名</span></span></td>
        <td><span class="special-seat-count">${specialReserved} / ${specialCapacity}名</span></td>
        <td><span class="trip-status ${status.key}" data-status="${status.label}">${status.text}</span></td>
      </tr>`;
    }).join('');
  }

  const summaryBody = document.querySelector('#reservation-table tbody');
  if (summaryBody) {
    summaryBody.innerHTML = adminTrips.filter((trip) => trip.date >= todayKey && trip.reserved > 0).map((trip) => {
      const specialCapacity = Number(trip.specialCapacity || 0);
      const specialReserved = Number(trip.specialReserved || 0);
      return `
      <tr data-search-row data-date="${fmtDate(trip.date)}" data-course="${esc(trip.course)}" data-ship="${esc(trip.ship)}" data-guests="${trip.reserved}" data-capacity="${trip.capacity}" data-special-reserved="${specialReserved}" data-special-capacity="${specialCapacity}" data-trip-id="${esc(trip.id)}">
        <td>${fmtDate(trip.date)}</td><td>${esc(trip.course)}</td><td>${esc(trip.ship)}</td>
        <td><span class="trip-seat-summary"><span class="seat-ratio">${trip.reserved} / ${trip.capacity}名</span></span></td>
        <td><span class="special-seat-count">${specialReserved} / ${specialCapacity}名</span></td>
        <td><a class="btn btn-primary btn-sm" href="${esc(detailUrl(trip))}">この船の詳細</a></td>
      </tr>`;
    }).join('');
  }

  const detailBody = document.querySelector('#reservation-detail-table tbody');
  if (detailBody) {
    detailBody.innerHTML = reservations.map((item) => {
      const cancelLabel = cancellationLabel(item.status);
      return `
      <tr data-course="${esc(item.course)}" data-date="${esc(item.date)}" data-ship="${esc(reservationShip(item))}" data-detail-search-row="" data-name="${esc(item.name)}">
        <td data-editable>${esc(item.date)}</td><td data-editable>${esc(item.course)}</td><td>${esc(reservationShip(item))}</td><td data-editable>${esc(item.name)}</td>
        <td data-editable>${esc(item.nameKana || '－')}</td><td data-editable>${Number(item.participants || 0)}名</td>
        <td data-editable>${Number(item.rentalRod || 0) ? `${Number(item.rentalRod)}本` : 'なし'}</td>
        <td data-editable>${esc(item.phone || '－')}</td><td data-editable>${esc(item.email || '－')}</td>
        <td data-cancel-cell data-cancel-value="${cancelLabel}"><span class="reservation-cancel-tag ${cancellationClass(cancelLabel)}">${cancelLabel}</span></td>
        <td><button class="btn btn-primary btn-sm" data-edit-row type="button">修正</button></td>
      </tr>`;
    }).join('');
  }

  const mobileContainer = document.querySelector('.mobile-cards');
  if (mobileContainer && detailBody) {
    const mobileItem = (label, value) => `<div><div class="data-label">${esc(label)}</div><div class="data-value">${esc(value)}</div></div>`;
    mobileContainer.innerHTML = reservations.map((item) => {
      const ship = reservationShip(item);
      return `<article class="card reservation-card" data-course="${esc(item.course)}" data-date="${esc(item.date)}" data-ship="${esc(ship)}" data-detail-mobile-card="" data-name="${esc(item.name)}">
        <div class="card-body">
          ${mobileItem('予約日', item.date)}${mobileItem('便', item.course)}${mobileItem('船名', ship)}
          ${mobileItem('氏名', item.name)}${mobileItem('ふりがな', item.nameKana || '－')}
          ${mobileItem('人数', `${Number(item.participants || 0)}名`)}
          ${mobileItem('貸し竿', Number(item.rentalRod || 0) ? `${Number(item.rentalRod)}本` : 'なし')}
          ${mobileItem('電話番号', item.phone || '－')}${mobileItem('メール', item.email || '－')}
          ${mobileItem('キャンセル', cancellationLabel(item.status))}
        </div>
      </article>`;
    }).join('');
  }

  const printBody = document.querySelector('#print-reservation-table tbody');
  if (printBody) {
    printBody.innerHTML = reservations.map((item) => `
      <tr data-print-row data-ship="${esc(reservationShip(item))}"><td>${esc(item.date)}</td><td>${esc(item.course)}</td><td>${esc(reservationShip(item))}</td><td>${esc(item.name)}</td>
      <td>${Number(item.participants || 0)}名</td><td>${Number(item.rentalRod || 0) ? `${Number(item.rentalRod)}本` : 'なし'}</td><td>${esc(item.phone || '－')}</td></tr>`).join('');
  }

  // 顧客一覧・顧客詳細は、予約明細と同じ顧客ID・連絡先から集計する。
  const customerBadgeClass = (rank) => rank === '常連' ? 'badge-orange' : (rank === '新規' ? 'badge-green' : 'badge-blue');
  const customerListBody = document.querySelector('#customer-table tbody');
  if (customerListBody) {
    customerListBody.innerHTML = customers.map((customer) => `
      <tr data-search-row data-customer-id="${esc(customer.id)}" data-customer-name="${esc(customer.name)}" data-customer-rank="${esc(customer.rank)}" data-customer-last-date="${esc(customer.lastDate)}">
        <td>${esc(customer.id)}</td><td>${esc(customer.name)}</td><td>${esc(customer.phone)}</td><td>${customer.useCount}回</td>
        <td><span class="badge ${customerBadgeClass(customer.rank)}">${esc(customer.rank)}</span></td><td>${esc(customer.lastDateLabel)}</td>
      </tr>`).join('');
  }

  const customerMobileContainer = document.querySelector('.customer-mobile-cards');
  if (customerMobileContainer) {
    const item = (label, value) => `<div><div class="data-label">${esc(label)}</div><div class="data-value">${value}</div></div>`;
    customerMobileContainer.innerHTML = customers.map((customer) => `
      <article class="card customer-card" data-customer-mobile-card data-customer-id="${esc(customer.id)}" data-customer-name="${esc(customer.name)}" data-customer-rank="${esc(customer.rank)}" data-customer-last-date="${esc(customer.lastDate)}">
        <div class="card-body">
          ${item('顧客ID', esc(customer.id))}${item('顧客名', esc(customer.name))}${item('電話番号', esc(customer.phone))}
          ${item('利用回数', `${customer.useCount}回`)}${item('区分', `<span class="badge ${customerBadgeClass(customer.rank)}">${esc(customer.rank)}</span>`)}
          ${item('最終利用日', esc(customer.lastDateLabel))}
        </div>
      </article>`).join('');
  }

  const customerDetailBody = document.querySelector('#customer-detail-table tbody');
  if (customerDetailBody) {
    customerDetailBody.innerHTML = customers.map((customer) => `
      <tr data-customer-detail-row data-customer-id="${esc(customer.id)}" data-customer-name="${esc(customer.name)}" data-customer-rank="${esc(customer.rank)}" data-customer-last-date="${esc(customer.lastDate)}">
        <td>${esc(customer.id)}</td><td data-editable>${esc(customer.name)}</td><td data-editable>${esc(customer.nameKana)}</td>
        <td data-editable>${esc(customer.phone)}</td><td data-editable>${esc(customer.email)}</td><td data-editable>${customer.useCount}回</td>
        <td><span class="cancel-count${customer.cancelCount ? '' : ' is-zero'}">${customer.cancelCount}回</span></td>
        <td><span class="no-show-count${customer.noShowCount ? '' : ' is-zero'}">${customer.noShowCount}回</span></td>
        <td>${esc(customer.rank)}</td><td>${esc(customer.lastDateLabel)}</td>
        <td><button class="btn btn-primary btn-sm" data-edit-row type="button">修正</button></td>
      </tr>`).join('');
  }

  const customerDetailMobileContainer = document.querySelector('.customer-detail-mobile-cards');
  if (customerDetailMobileContainer) {
    const item = (label, value, extraClass = '') => `<div${extraClass ? ` class="${extraClass}"` : ''}><div class="data-label">${esc(label)}</div><div class="data-value">${value}</div></div>`;
    customerDetailMobileContainer.innerHTML = customers.map((customer) => `
      <article class="card customer-detail-card" data-customer-detail-mobile-card data-customer-id="${esc(customer.id)}" data-customer-name="${esc(customer.name)}" data-customer-rank="${esc(customer.rank)}" data-customer-last-date="${esc(customer.lastDate)}">
        <div class="card-body">
          ${item('顧客ID', esc(customer.id))}${item('氏名', esc(customer.name))}${item('ふりがな', esc(customer.nameKana))}
          ${item('電話番号', esc(customer.phone))}${item('メール', esc(customer.email), 'customer-email')}${item('利用回数', `${customer.useCount}回`)}
          ${item('キャンセル回数', `<span class="cancel-count${customer.cancelCount ? '' : ' is-zero'}">${customer.cancelCount}回</span>`)}
          ${item('無断キャンセル回数', `<span class="no-show-count${customer.noShowCount ? '' : ' is-zero'}">${customer.noShowCount}回</span>`)}
          ${item('区分', `<span class="badge ${customerBadgeClass(customer.rank)}">${esc(customer.rank)}</span>`)}${item('最終利用日', esc(customer.lastDateLabel))}
        </div>
      </article>`).join('');
  }

  // ダッシュボードもユーザー画面と同じ最新の出船データを表示する。
  const dashboardTitle = [...document.querySelectorAll('.sub-title')].find((el) => el.textContent.includes('本日'));
  if (dashboardTitle) {
    const todayTrips = adminTrips.filter((trip) => trip.date === todayKey);
    dashboardTitle.textContent = `本日(${todayKey.slice(5).replace('-', '/')})の出船`;
    const list = dashboardTitle.parentElement?.querySelector('.kpi-list');
    if (list) {
      list.innerHTML = todayTrips.map((trip, index) => `
        <div class="kpi-row${index ? ' dashboard-trip-separator' : ''}"><span>${esc(trip.course)}</span><strong>${esc(trip.time)} 出船</strong></div>
        <div class="kpi-row"><span>予約人数</span><strong>${trip.reserved} / ${trip.capacity}名</strong></div>
        <div class="kpi-row"><span>担当</span><strong>${esc(trip.captain)}</strong></div>`).join('');
    }
    const cards = document.querySelectorAll('.stat-card');
    const activeReservations = reservations.filter((r) => !['キャンセル', '通常キャンセル', '無断キャンセル', 'cancelled', 'canceled', 'no-show', 'no_show'].includes(r.status));
    const todayBookings = activeReservations.filter((r) => String(r.dateKey || r.date || '').replaceAll('/','-') === todayKey);
    const participants = todayBookings.reduce((sum,r) => sum + Number(r.participants || 0), 0);
    if (cards[0]) {
      cards[0].querySelector('.stat-value').textContent = `${todayBookings.length}件`;
      cards[0].querySelector('.stat-note').textContent = `参加予定 ${participants}名`;
    }
    if (cards[1]) {
      const monthBookings = activeReservations.filter((r) => String(r.dateKey || r.date || '').replaceAll('/','-').startsWith(todayKey.slice(0, 7)));
      cards[1].querySelector('.stat-value').textContent = `${monthBookings.length}件`;
      cards[1].querySelector('.stat-note').textContent = `参加予定 ${monthBookings.reduce((s,r)=>s+Number(r.participants||0),0)}名`;
    }
  }
})();
