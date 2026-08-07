'use strict';

const params = new URLSearchParams(location.search);

const trip = {
    date: params.get('date') || '2026年8月6日（木）',
    dateKey: params.get('dateKey') || '',
    name: params.get('name') || '半夜便',
    time: params.get('time') || '18:00',
    target: params.get('target') || 'マイカ＆ムギイカ',
    status: params.get('status') || 'full',
    statusText: params.get('statusText') || '× 空きなし',
    tripId: params.get('tripId') || '',
    capacity: Number(params.get('capacity') || 0),
    reservedSeats: Number(params.get('reservedSeats') || 0),
    remainingSeats: Number(params.get('remainingSeats') || 0),
    price: params.get('price') || 'お一人様 13,000円（税込）'
};

const subtractMinutes = (timeText, minutes) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(timeText || '');
    if (!match) return '－';
    const total = (Number(match[1]) * 60 + Number(match[2]) - minutes + 24 * 60) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const contentUndecided = ['', '－', '-', '未定', '内容未定'].includes(trip.time)
    || ['', '－', '-', '未定', '内容未定'].includes(trip.target);
if (contentUndecided) {
    trip.status = 'unknown';
    trip.statusText = '－ 内容未定';
    trip.remainingSeats = 0;
}

document.getElementById('detail-date').textContent = trip.date;
document.getElementById('detail-name').textContent = trip.name;
document.getElementById('detail-time').textContent = trip.time;
document.getElementById('detail-target').textContent = trip.target;
document.getElementById('detail-price').textContent = trip.price;
// 集合時間は便種に関係なく、必ず出船時刻の60分前。
document.getElementById('detail-meeting-time').textContent = subtractMinutes(trip.time, 60);

const statusElement = document.getElementById('detail-status');
statusElement.textContent = trip.statusText;
statusElement.className = `status ${trip.status}`;
const actions = document.getElementById('detail-actions');

if (trip.status === 'full') {
    actions.innerHTML = `<button class="reserve-button disabled" type="button" disabled>満員のため予約できません。</button>`;
} else if (trip.status === 'unknown') {
    actions.innerHTML = `<button class="reserve-button disabled" type="button" disabled>出船内容が未定のため予約できません。</button>`;
} else {
    const next = new URLSearchParams(params);
    next.set('detail', `shipScheduleDetail.html?${params.toString()}`);
    next.set('remainingSeats', String(trip.remainingSeats));
    actions.innerHTML = `<a class="reserve-button" href="reservation.html?${next.toString()}">この便を予約する</a>`;
}
