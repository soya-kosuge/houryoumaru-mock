(() => {
  'use strict';
  const data = window.HoryomaruAppData;
  const container = document.querySelector('#schedule');
  if (!data || !container) return;
  const trips = data.getTrips();
  const byDate = new Map();
  trips.forEach((trip) => {
    if (!byDate.has(trip.date)) byDate.set(trip.date, []);
    byDate.get(trip.date).push(trip);
  });
  const esc = (value) => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const weekday = ['日','月','火','水','木','金','土'];
  container.innerHTML = [...byDate].sort(([a],[b]) => a.localeCompare(b)).map(([date, rows]) => {
    const parsed = new Date(`${date}T00:00:00`);
    const label = `${parsed.getMonth()+1}月${parsed.getDate()}日（${weekday[parsed.getDay()]}）`;
    return `<article class="date-card" data-date="${date}">
      <div class="date-head"><h2 class="date-title">${label}</h2><span class="date-label">出船予定</span></div>
      <div class="trip-list">${rows.map((trip) => `<a class="trip-row" href="shipScheduleList.html" data-trip-id="${esc(trip.id)}" data-capacity="${trip.capacity}" data-reserved-seats="${trip.reserved}" data-remaining-seats="${trip.remaining}" data-status="${trip.status}">
        <span class="trip-name">${esc(trip.course)}</span><span class="trip-time">${esc(trip.time)}</span>
        <span class="trip-target">${esc(trip.target)}</span><span class="status ${trip.status}">${trip.status === 'ok' ? '〇 空きあり' : trip.status === 'full' ? '× 空きなし' : '× 出船中止'}</span><span class="arrow" aria-hidden="true">›</span>
      </a>`).join('')}</div></article>`;
  }).join('');
})();
