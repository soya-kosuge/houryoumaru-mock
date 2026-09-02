(() => {
  'use strict';

  const appData = window.HoryomaruAppData;
  const form = document.querySelector('#phone-reservation-form');
  const tripSelect = document.querySelector('#phone-trip');
  const summary = document.querySelector('#phone-trip-summary');
  if (!appData || !form || !tripSelect || !summary) return;

  const trips = appData.getTrips().slice().sort((a, b) => {
    return String(a.date).localeCompare(String(b.date), 'ja') ||
      String(a.time).localeCompare(String(b.time), 'ja') ||
      String(a.ship).localeCompare(String(b.ship), 'ja');
  });
  const tripMap = new Map(trips.map((trip) => [trip.id, trip]));
  const formatDate = (value) => String(value || '').replaceAll('-', '/');

  trips.forEach((trip) => {
    const option = document.createElement('option');
    option.value = trip.id;
    option.textContent = `${formatDate(trip.date)} ${trip.time} ${trip.course}｜${trip.ship}（空き${trip.remaining}名）`;
    option.disabled = Number(trip.remaining || 0) <= 0;
    tripSelect.appendChild(option);
  });

  const updateTripSummary = () => {
    const trip = tripMap.get(tripSelect.value);
    if (!trip) {
      summary.textContent = '出船日・便・船名を選択してください。';
      return;
    }
    summary.textContent = `${formatDate(trip.date)} ${trip.time}出船／${trip.course}／${trip.ship}／${trip.captain}／予約 ${trip.reserved}名・空き ${trip.remaining}名`;
    const participants = document.querySelector('#phone-participants');
    participants.max = String(Math.max(1, Number(trip.remaining || 0)));
  };

  const requestedTripId = new URLSearchParams(location.search).get('tripId');
  const initialTrip = trips.find((trip) => trip.id === requestedTripId && Number(trip.remaining || 0) > 0) ||
    trips.find((trip) => Number(trip.remaining || 0) > 0);
  if (initialTrip) tripSelect.value = initialTrip.id;
  updateTripSummary();
  tripSelect.addEventListener('change', updateTripSummary);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const trip = tripMap.get(tripSelect.value);
    if (!trip) {
      alert('対象の出船を選択してください。');
      tripSelect.focus();
      return;
    }

    const participants = Math.max(1, Number.parseInt(document.querySelector('#phone-participants').value || '1', 10));
    if (participants > Number(trip.remaining || 0)) {
      alert(`空きは${trip.remaining}名です。参加人数を変更してください。`);
      document.querySelector('#phone-participants').focus();
      return;
    }

    const phone = document.querySelector('#phone-number').value.trim();
    if (phone.replace(/\D/g, '').length < 10) {
      alert('電話番号を10桁以上で入力してください。');
      document.querySelector('#phone-number').focus();
      return;
    }

    const storageKey = 'horyomaruAdminReservations';
    let reservations = [];
    try { reservations = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { reservations = []; }
    if (!Array.isArray(reservations)) reservations = [];

    const reservation = {
      id: `T-${Date.now()}`,
      tripId: trip.id,
      date: formatDate(trip.date),
      dateKey: trip.date,
      course: trip.course,
      ship: trip.ship,
      departureTime: trip.time,
      target: trip.target,
      name: document.querySelector('#phone-name').value.trim(),
      nameKana: document.querySelector('#phone-name-kana').value.trim(),
      participants,
      rentalRod: Math.max(0, Number.parseInt(document.querySelector('#phone-rental-rod').value || '0', 10)),
      phone,
      email: document.querySelector('#phone-email').value.trim(),
      remarks: document.querySelector('#phone-remarks').value.trim(),
      source: '電話受付',
      status: '予約中'
    };

    reservations.push(reservation);
    localStorage.setItem(storageKey, JSON.stringify(reservations));
    appData.addReservationDelta(trip.id, participants);

    const params = new URLSearchParams({ date: trip.date, course: trip.course, ship: trip.ship, saved: 'phone' });
    location.href = `adminReservationDetail.html?${params.toString()}`;
  });
})();
