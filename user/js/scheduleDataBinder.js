(() => {
  'use strict';
  const data = window.HoryomaruAppData;
  if (!data) return;

  const statusText = { ok: '〇 空きあり', few: '△ 残りわずか', full: '× 空きなし', unknown: '－ 内容未定' };
  const trips = data.getTrips();
  const tripsById = new Map(trips.map((trip) => [trip.id, trip]));
  document.querySelectorAll('.date-card[data-date]').forEach((card) => {
    const date = card.dataset.date;
    card.querySelectorAll('.trip-row').forEach((row) => {
      const course = row.querySelector('.trip-name')?.textContent.trim() || '';
      const tripId = row.dataset.tripId || '';
      const trip = tripsById.get(tripId) || data.getTrip(date, course);
      if (!trip) return;
      row.dataset.tripId = trip.id;
      row.dataset.capacity = String(trip.capacity);
      row.dataset.reservedSeats = String(trip.reserved);
      row.dataset.remainingSeats = String(trip.remaining);
      row.dataset.status = trip.status;
      const time = row.querySelector('.trip-time');
      const target = row.querySelector('.trip-target');
      const status = row.querySelector('.status');
      if (time) time.textContent = trip.time;
      if (target) target.textContent = trip.target;
      if (status) {
        status.className = `status ${trip.status}`;
        status.textContent = statusText[trip.status] || statusText.unknown;
      }
    });
  });
})();
