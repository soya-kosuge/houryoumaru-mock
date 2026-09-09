const data = loadHouryoumaruData();
const reservationId = getReservationId();
const reservation = data.reservations.find((item) => item.id === reservationId);
const form = document.getElementById('reservationEditForm');
const partySize = document.getElementById('partySize');
const rentalRods = document.getElementById('rentalRods');
const saveButton = document.getElementById('saveReservationButton');
const limitNotice = document.getElementById('changeLimitNotice');

if (!reservation) {
  form.innerHTML = '<div class="card empty">予約情報が見つかりません。</div>';
} else {
  document.getElementById('backDetailLink').href = `./reservation-detail.html?id=${encodeURIComponent(reservation.id)}`;
  document.getElementById('reservationDateText').textContent = reservation.date || '－';
  document.getElementById('tripTypeText').textContent = reservation.tripType || '－';
  document.getElementById('departureTimeText').textContent = reservation.departureTime || '－';
  partySize.value = Number(reservation.partySize || 1);
  rentalRods.value = Number(reservation.rentalRods || 0);

  const unitPrice = Number(reservation.unitPrice || reservation.pricePerPerson || 13000);
  const rentalUnitPrice = Number(reservation.rentalRodUnitPrice || 0);
  const yen = (value) => `${Number(value || 0).toLocaleString('ja-JP')}円`;
  const recalculate = () => {
    const people = Math.max(1, Number(partySize.value || 1));
    const rods = Math.max(0, Number(rentalRods.value || 0));
    const fare = unitPrice * people;
    const rental = rentalUnitPrice * rods;
    document.getElementById('farePrice').textContent = `${yen(fare)}（${yen(unitPrice)} × ${people}名）`;
    document.getElementById('rentalPrice').textContent = `${yen(rental)}（${rods}本）`;
    document.getElementById('totalPrice').textContent = yen(fare + rental);
    document.getElementById('rentalPriceNote').textContent = rentalUnitPrice > 0
      ? `貸し竿単価：${yen(rentalUnitPrice)} / 本`
      : '貸し竿単価はMOCK上で未設定のため、現在は0円として自動計算しています。';
    return fare + rental;
  };
  partySize.addEventListener('input', recalculate);
  rentalRods.addEventListener('input', recalculate);
  recalculate();

  const departure = new Date(`${reservation.date}T${reservation.departureTime || '00:00'}:00`);
  const hoursUntilDeparture = (departure.getTime() - Date.now()) / 3600000;
  const isLocked = Number.isFinite(hoursUntilDeparture) && hoursUntilDeparture < 48;
  if (isLocked) {
    partySize.disabled = true;
    rentalRods.disabled = true;
    saveButton.disabled = true;
    limitNotice.classList.add('is-locked');
    limitNotice.textContent = '出船48時間以内のためWeb上では予約変更できません。変更が必要な場合は豊漁丸へ電話でお問い合わせください。';
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
    saveHouryoumaruData(data);
    safeLeave = true; dirty = false;
    const notice = document.getElementById('saveNotice');
    notice.className = 'notice';
    notice.textContent = '人数・レンタル品と料金を更新しました。';
    setTimeout(() => { location.href = `./reservation-detail.html?id=${encodeURIComponent(reservation.id)}`; }, 350);
  });
}
