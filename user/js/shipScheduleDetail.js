'use strict';

const params = new URLSearchParams(location.search);

const trip = {
    date: params.get('date') || '2026年7月29日（水）',
    name: params.get('name') || '半夜便',
    time: params.get('time') || '18:00',
    target: params.get('target') || 'マイカ＆ムギイカ',
    status: params.get('status') || 'full',
    statusText: params.get('statusText') || '× 満員御礼',
    price: params.get('price') || 'お一人様 13,000円（税込）'
};

document.getElementById('detail-date').textContent = trip.date;
document.getElementById('detail-name').textContent = trip.name;
document.getElementById('detail-time').textContent = trip.time;
document.getElementById('detail-target').textContent = trip.target;
document.getElementById('detail-price').textContent = trip.price;

// 半夜便は17:00、深夜便（中型船を含む）は21:00に集合。
const meetingTime = trip.name.includes('深夜便') ? '21:00' : '17:00';
document.getElementById('detail-meeting-time').textContent = meetingTime;

const statusElement = document.getElementById('detail-status');
statusElement.textContent = trip.statusText;
statusElement.className = `status ${trip.status}`;

const actions = document.getElementById('detail-actions');

if (trip.status === 'full') {
    actions.innerHTML = `
        <button class="reserve-button disabled" type="button" disabled>
            満員のため予約できません
        </button>
    `;
} else {
    const next = new URLSearchParams(params);
    next.set('detail', `shipScheduleDetail.html?${params.toString()}`);

    const destination = `reservation.html?${next.toString()}`;

    actions.innerHTML = `
        <a class="reserve-button" href="${destination}">この便を予約する</a>
    `;
}
