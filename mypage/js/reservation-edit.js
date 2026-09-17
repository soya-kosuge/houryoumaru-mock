const data = loadHouryoumaruData();
const reservationId = getReservationId();
const reservation = data.reservations.find((item) => item.id === reservationId);
const form = document.getElementById('reservationEditForm');
const partySize = document.getElementById('partySize');
const rentalRods = document.getElementById('rentalRods');
const saveButton = document.getElementById('saveReservationButton');
const limitNotice = document.getElementById('changeLimitNotice');

const isHistoryReservation = (data.pastReservations || []).some((item) => item.id === reservationId)
  || (reservation && (
    new Date(`${reservation.date}T${reservation.departureTime || '00:00'}:00`).getTime() < Date.now()
    || ['通常キャンセル', 'キャンセル', '無断キャンセル', '乗船済み'].includes(reservation.status)
  ));

if (isHistoryReservation) {
  limitNotice.textContent = '過去の予約は変更できません。';
  form.innerHTML = '<div class="card empty">過去の予約は閲覧のみです。</div><div class="form-actions"><a class="btn" href="./reservation-detail.html?id=' + encodeURIComponent(reservationId) + '">予約詳細へ戻る</a></div>';
} else if (!reservation) {
  form.innerHTML = '<div class="card empty">予約情報が見つかりません。</div>';
} else {
  const originalPartySize = Number(reservation.partySize || 1);
  document.getElementById('backDetailLink').href = `./reservation-detail.html?id=${encodeURIComponent(reservation.id)}`;
  document.getElementById('reservationDateText').textContent = reservation.date || '－';
  document.getElementById('tripTypeText').textContent = reservation.tripType || '－';
  document.getElementById('departureTimeText').textContent = reservation.departureTime || '－';
  partySize.value = Number(reservation.partySize || 1);
  rentalRods.value = Number(reservation.rentalRods || 0);

  const unitPrice = Number(reservation.unitPrice || reservation.pricePerPerson || 13000);
  const rentalUnitPrice = HOURYOUMARU_RENTAL_ROD_UNIT_PRICE;
  const yen = (value) => `${Number(value || 0).toLocaleString('ja-JP')}円`;
  const recalculate = () => {
    const people = Math.max(1, Number(partySize.value || 1));
    const rods = Math.max(0, Number(rentalRods.value || 0));
    const fare = unitPrice * people;
    const rental = rentalUnitPrice * rods;
    document.getElementById('farePrice').textContent = `${yen(fare)}（${yen(unitPrice)} × ${people}名）`;
    document.getElementById('rentalPrice').textContent = `${yen(rental)}（${rods}本）`;
    document.getElementById('totalPrice').textContent = yen(fare + rental);
    document.getElementById('rentalPriceNote').innerHTML = `貸し竿単価：${yen(rentalUnitPrice)} / 本（<a href="https://houryoumaru.main.jp/charge.html" target="_blank" rel="noopener noreferrer">豊漁丸公式料金表</a>掲載額）`;
    return fare + rental;
  };
  partySize.addEventListener('input', recalculate);
  rentalRods.addEventListener('input', recalculate);
  recalculate();

  const reservationStatus = getHouryoumaruReservationStatus(reservation);
  const isLocked = reservationStatus !== '予約中';
  if (isLocked) {
    partySize.disabled = true;
    rentalRods.disabled = true;
    saveButton.disabled = true;
    limitNotice.classList.add('is-locked');
    limitNotice.textContent = reservationStatus === '予約完了'
      ? '予約完了のためWeb上では予約変更できません。変更が必要な場合は豊漁丸へ電話でお問い合わせください。'
      : 'この予約はWeb上では変更できません。';
  }

  let dirty = false;
  let safeLeave = false;
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('change', () => { dirty = true; });
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || !dirty || safeLeave) return;
    if (!confirm('入力内容が破棄されますが、よろしいですか？')) event.preventDefault();
  }, true);
  window.addEventListener('beforeunload', (event) => {
    if (!dirty || safeLeave) return;
    event.preventDefault(); event.returnValue = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (isLocked) return;
    reservation.partySize = Math.max(1, Number(partySize.value || 1));
    reservation.rentalRods = Math.max(0, Number(rentalRods.value || 0));
    reservation.unitPrice = unitPrice;
    reservation.rentalRodUnitPrice = rentalUnitPrice;
    reservation.totalPrice = recalculate();
    if (reservation.tripId && reservation.partySize !== originalPartySize) {
      const overrideKey = 'horyomaruTripReservationDelta';
      let overrides = {};
      try { overrides = JSON.parse(localStorage.getItem(overrideKey) || '{}'); }
      catch (_) { overrides = {}; }
      overrides[reservation.tripId] = Number(overrides[reservation.tripId] || 0) + (reservation.partySize - originalPartySize);
      if (overrides[reservation.tripId] === 0) delete overrides[reservation.tripId];
      localStorage.setItem(overrideKey, JSON.stringify(overrides));
    }
    saveHouryoumaruData(data);
    safeLeave = true; dirty = false;
    const notice = document.getElementById('saveNotice');
    notice.className = 'notice';
    notice.textContent = '人数・レンタル品と料金を更新しました。';
    setTimeout(() => { location.href = `./reservation-detail.html?id=${encodeURIComponent(reservation.id)}`; }, 350);
  });
}
