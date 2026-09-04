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
  const septemberSpecialTrips = [
    ['2026-09-05', 'アオリ便', '15:30', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-06', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-12', '半夜便', '16:00', 'アオリ +マイカ', 'ok'],
    ['2026-09-12', '深夜便', '23:30', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-13', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-13', 'アオリ便', '05:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-18', '深夜便', '23:50', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ...[19, 20, 21, 22, 23].flatMap((day) => {
      const date = `2026-09-${String(day).padStart(2, '0')}`;
      const rows = [
        [date, '早朝便', '05:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
        [date, '半夜便', '16:00', 'アオリ +マイカ', 'ok']
      ];
      if (day !== 23) rows.push([date, '深夜便', '23:30', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok']);
      return rows;
    }),
    ['2026-09-26', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok'],
    ['2026-09-27', 'アオリ便', '02:00', 'アオリ ﾃｨｯﾌﾟﾗﾝ', 'ok']
  ];
  const existingSeptemberTrips = new Map(
    trips.filter((trip) => trip.date.startsWith('2026-09'))
      .map((trip) => [`${trip.date}|${trip.course}`, trip])
  );
  const septemberSchedule = [];
  for (let day = 1; day <= 30; day += 1) {
    const date = `2026-09-${String(day).padStart(2, '0')}`;
    septemberSchedule.push([date, '半夜便', '17:00', day === 5 ? 'スーパーロング便' : 'マイカ', day === 5 ? 'few' : 'ok']);
    if (day !== 3) {
      septemberSchedule.push([date, '深夜便', '22:00', day >= 8 && day <= 12 ? 'マイカ＆ムギイカ' : 'マイカ', 'ok']);
    }
  }
  septemberSchedule.push(...septemberSpecialTrips);

  const septemberAdminTrips = septemberSchedule
    .sort((a, b) => `${a[0]} ${a[2]}`.localeCompare(`${b[0]} ${b[2]}`))
    .map(([date, course, time, target, sourceStatus], index) => {
      const isSmallBoat = course === 'アオリ便' || course === '早朝便' || time === '16:00' || time > '23:00';
      const ship = isSmallBoat ? 'カムトゥドリーム' : (course === '半夜便' ? 'スーパードリーム' : 'ドリーム');
      const setting = shipSettings[ship];
      const existing = existingSeptemberTrips.get(`${date}|${course}`);
      const reserved = sourceStatus === 'few'
        ? setting.capacity - 2
        : Math.min(setting.capacity, Number(existing?.reserved || 0));
      return {
        id: `user-schedule-${date}-${index + 1}`,
        date, course, time, target, ship,
        captain: index % 2 === 0 ? '佐藤船長' : '山田船長',
        capacity: setting.capacity,
        specialCapacity: setting.specialCapacity,
        specialReserved: 0,
        reserved,
        remaining: setting.capacity - reserved,
        status: sourceStatus,
        price: Number(existing?.price || 13000)
      };
    });
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
    ...trips.filter((trip) => !trip.date.startsWith('2026-09')).map((trip) => {
      const ship = trip.ship;
      const setting = shipSettings[ship];
      return { ...trip, ship, capacity: setting.capacity, specialCapacity: setting.specialCapacity, specialReserved: 0 };
    }),
    ...septemberAdminTrips
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
  const reservationStatus = (trip) => {
    const remaining = Number(trip.remaining || 0);
    if (remaining === 0) return { key: 'full', label: '満員' };
    if (remaining <= 3) return { key: 'few', label: '残りわずか' };
    return { key: 'ok', label: '空きあり' };
  };
  const cancellationLabel = (status) => {
    if (['無断キャンセル', 'no-show', 'no_show'].includes(status)) return '無断キャンセル';
    if (['キャンセル', '通常キャンセル', 'cancelled', 'canceled'].includes(status)) return '通常キャンセル';
    return 'なし';
  };
  const cancellationClass = (label) => label === '無断キャンセル' ? 'no-show' : (label === '通常キャンセル' ? 'normal' : 'none');
  const adminTripStatus = (trip) => {
    const remaining = Math.max(0, Number(trip.capacity || 0) - Number(trip.reserved || 0));
    if (remaining === 0) return { key: 'full', label: '満員', text: '× 満員' };
    if (remaining <= 3) return { key: 'few', label: '残りわずか', text: '△ 残りわずか' };
    return { key: 'ok', label: '空きあり', text: '〇 空きあり' };
  };

  const tripBody = document.querySelector('#trip-table tbody');
  if (tripBody) {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const tripView = document.body.dataset.tripView || 'upcoming';
    const displayedTrips = adminTrips.filter((trip) => tripView === 'history' ? trip.date < todayKey : trip.date >= todayKey);
    tripBody.innerHTML = displayedTrips.map((trip) => {
      const status = adminTripStatus(trip);
      const specialCapacity = Number(trip.specialCapacity || 0);
      const specialReserved = Number(trip.specialReserved || 0);
      return `
      <tr data-search-row="" data-trip-id="${esc(trip.id)}">
        <td>${fmtDate(trip.date)}</td><td>${esc(trip.course)}</td><td>${esc(trip.ship)}</td><td>${esc(trip.captain)}</td>
        <td>${esc(trip.target)}</td><td>${trip.reserved} / ${trip.capacity}名</td>
        <td><span class="special-seat-count">${specialReserved} / ${specialCapacity}名</span></td>
        <td><span class="trip-status ${status.key}" data-status="${status.label}">${status.text}</span></td>
      </tr>`;
    }).join('');
  }

  const summaryBody = document.querySelector('#reservation-table tbody');
  if (summaryBody) {
    summaryBody.innerHTML = trips.filter((trip) => trip.reserved > 0).map((trip) => {
      const status = reservationStatus(trip);
      return `
      <tr data-search-row data-date="${fmtDate(trip.date)}" data-course="${esc(trip.course)}" data-ship="${esc(trip.ship)}" data-guests="${trip.reserved}" data-remaining="${trip.remaining}" data-trip-id="${esc(trip.id)}">
        <td>${fmtDate(trip.date)}</td><td>${esc(trip.course)}</td><td>${esc(trip.ship)}</td><td>${trip.reserved}名</td>
        <td><span class="trip-status ${status.key}">${status.label}</span></td>
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
