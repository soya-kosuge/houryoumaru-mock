'use strict';

const cards = [...document.querySelectorAll('.date-card[data-date]')];
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonth = document.getElementById('calendar-month');
const emptyResult = document.getElementById('empty-result');
const showAllButton = document.getElementById('show-all');
const previousMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const scheduleArea = document.querySelector('.schedule-area');

function getJapanTodayKey() {
    const japanNow = new Date(Date.now() + (9 * 60 * 60 * 1000));
    return japanNow.toISOString().slice(0, 10);
}

function toDateKey(year, monthIndex, day) {
    return [year, String(monthIndex + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
}

function addDays(dateKey, amount) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + amount);
    return toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatSelectedDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const week = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(year, month - 1, day);
    return `${year}年${month}月${day}日（${week[date.getDay()]}）`;
}

function hasTripContent(row) {
    const time = row.querySelector('.trip-time')?.textContent.trim() || '';
    const target = row.querySelector('.trip-target')?.textContent.trim() || '';
    const unknownValues = ['', '－', '-', '未定', '内容未定'];
    return !unknownValues.includes(time) && !unknownValues.includes(target);
}

function normalizeTripStatus(row) {
    const statusNode = row.querySelector('.status');
    if (!statusNode) return { key: 'unknown', text: '－ 内容未定', remainingSeats: 0 };

    let key = 'unknown';
    if (statusNode.classList.contains('full')) key = 'full';
    else if (statusNode.classList.contains('few')) key = 'few';
    else if (statusNode.classList.contains('ok')) key = 'ok';

    // 内容が確定しているのに「－」なら、自動的に空きありへ補正。
    if (key === 'unknown' && hasTripContent(row)) key = 'ok';

    const configuredRemaining = Number(row.dataset.remainingSeats);
    const defaultRemaining = key === 'full' ? 0 : key === 'few' ? 3 : key === 'ok' ? 16 : 0;
    const remainingSeats = Number.isFinite(configuredRemaining) && row.dataset.remainingSeats !== ''
    ? configuredRemaining
    : defaultRemaining;

    statusNode.className = `status ${key}`;
    statusNode.textContent = key === 'full'
    ? '× 空きなし'
    : key === 'few'
    ? '△ 残りわずか'
    : key === 'ok'
    ? '〇 空きあり'
    : '－ 内容未定';

    row.dataset.status = key;
    row.dataset.remainingSeats = String(remainingSeats);
    return { key, text: statusNode.textContent, remainingSeats };
}

const todayKey = getJapanTodayKey();
const tomorrowKey = addDays(todayKey, 1);
const [todayYear, todayMonth] = todayKey.split('-').map(Number);
let displayedMonth = new Date(todayYear, todayMonth - 1, 1);
let selectedDate = null;

function markPastSchedules() {
    cards.forEach((card) => {
        const isPast = card.dataset.date < todayKey;
        card.classList.toggle('is-past-card', isPast);
        card.dataset.past = isPast ? 'true' : 'false';

        if (!isPast) return;
        const label = card.querySelector('.date-label');
        if (label) label.textContent = '受付終了';
        card.querySelectorAll('.trip-row').forEach((row) => {
            row.classList.add('is-disabled');
            row.setAttribute('aria-disabled', 'true');
            row.removeAttribute('href');
            const status = row.querySelector('.status');
            if (status) {
                status.className = 'status closed';
                status.textContent = '受付終了';
            }
        });
    });
}

function updateScheduleLabels() {
    cards.forEach((card) => {
        const dateKey = card.dataset.date;
        const label = card.querySelector('.date-label');
        card.classList.toggle('is-today-card', dateKey === todayKey);
        if (!label || card.dataset.past === 'true') return;

        if (dateKey === todayKey) {
            label.innerHTML = '<strong>本日</strong>の出船予定';
        } else if (dateKey === tomorrowKey) {
            label.innerHTML = '<strong>翌日</strong>の出船予定';
        } else if (/本日|翌日/.test(label.textContent)) {
            label.textContent = '出船予定';
        }
    });
}

async function ensureMonthLoaded(year, monthIndex) {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    try {
        await window.HoryomaruScheduleApi?.loadMonth(monthKey);
        // MOCKはHTML内のデータを利用。本番APIではここで返却データからカードを描画する。
    } catch (error) {
        console.warn('月別出船情報の取得に失敗しました。MOCKデータを表示します。', error);
    }
}

function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    calendarMonth.textContent = `${year}年${month + 1}月`;
    calendarGrid.replaceChildren();

    for (let i = 0; i < firstWeekday; i += 1) {
        const blank = document.createElement('span');
        blank.className = 'calendar-blank';
        blank.setAttribute('aria-hidden', 'true');
        calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= lastDay; day += 1) {
        const dateKey = toDateKey(year, month, day);
        const date = new Date(year, month, day);
        const weekday = date.getDay();
        const isPast = dateKey < todayKey;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.dataset.date = dateKey;
        if (weekday === 0) button.classList.add('is-sunday');
        else if (weekday === 6) button.classList.add('is-saturday');
        if (dateKey === todayKey) {
            button.classList.add('is-today');
            button.setAttribute('aria-current', 'date');
        }
        if (dateKey === selectedDate) {
            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
        } else button.setAttribute('aria-pressed', 'false');
        if (isPast) {
            button.classList.add('is-past');
            button.disabled = true;
            button.setAttribute('aria-label', `${month + 1}月${day}日、受付終了`);
        } else {
            button.setAttribute('aria-label', `${month + 1}月${day}日の予定を表示`);
            button.addEventListener('click', () => filterByDate(dateKey));
        }
        const dayNumber = document.createElement('span');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        button.appendChild(dayNumber);
        calendarGrid.appendChild(button);
    }
}

function rowMatchesConditions(row) {
    return true;
}

function applyFilters() {
    let visibleTripCount = 0;
    cards.forEach((card) => {
        const dateMatches = !selectedDate || card.dataset.date === selectedDate;
        let cardVisibleTrips = 0;
        card.querySelectorAll('.trip-row').forEach((row) => {
            const matches = dateMatches && rowMatchesConditions(row);
            row.hidden = !matches;
            if (matches) cardVisibleTrips += 1;
        });
        card.hidden = !dateMatches || cardVisibleTrips === 0;
        visibleTripCount += cardVisibleTrips;
    });

    const conditions = [];
    if (selectedDate) conditions.push(formatSelectedDate(selectedDate));
    if (emptyResult) emptyResult.hidden = visibleTripCount !== 0;
}

function filterByDate(dateKey) {
    selectedDate = dateKey;
    applyFilters();
    renderCalendar();
    if (scheduleArea && window.matchMedia('(max-width: 768px)').matches) {
        scheduleArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showAllSchedules() {
    selectedDate = null;
    applyFilters();
    renderCalendar();
}

previousMonthButton?.addEventListener('click', async () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    await ensureMonthLoaded(displayedMonth.getFullYear(), displayedMonth.getMonth());
    renderCalendar();
});
nextMonthButton?.addEventListener('click', async () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    await ensureMonthLoaded(displayedMonth.getFullYear(), displayedMonth.getMonth());
    renderCalendar();
});
showAllButton?.addEventListener('click', showAllSchedules);

// ステータス定義を統一してからリンク生成。
document.querySelectorAll('.trip-row').forEach((row) => normalizeTripStatus(row));
markPastSchedules();
updateScheduleLabels();
applyFilters();
renderCalendar();
ensureMonthLoaded(displayedMonth.getFullYear(), displayedMonth.getMonth());

// 各便の表示内容をクエリ文字列で詳細画面へ渡す。
document.querySelectorAll('.trip-row').forEach((row) => {
    if (row.closest('.date-card')?.dataset.past === 'true') return;
    const card = row.closest('.date-card');
    const rawDate = card?.dataset.date || '';
    const date = rawDate ? new Date(`${rawDate}T00:00:00`) : null;
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const dateText = date && !Number.isNaN(date.getTime())
    ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`
    : rawDate;
    const statusNode = row.querySelector('.status');
    const status = row.dataset.status || 'unknown';
    const params = new URLSearchParams({
        date: dateText,
        dateKey: rawDate,
        name: row.querySelector('.trip-name')?.textContent.trim() || '',
        time: row.querySelector('.trip-time')?.textContent.trim() || '',
        target: row.querySelector('.trip-target')?.textContent.trim() || '',
        status,
        statusText: statusNode?.textContent.trim() || '－ 内容未定',
        tripId: row.dataset.tripId || '',
        capacity: row.dataset.capacity || '0',
        reservedSeats: row.dataset.reservedSeats || '0',
        remainingSeats: row.dataset.remainingSeats || '0',
        price: 'お一人様 13,000円（税込）'
    });
    row.href = `shipScheduleDetail.html?${params.toString()}`;
});
