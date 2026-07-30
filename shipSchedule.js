'use strict';

const cards = [...document.querySelectorAll('.date-card[data-date]')];
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonth = document.getElementById('calendar-month');
const filterResult = document.getElementById('filter-result');
const emptyResult = document.getElementById('empty-result');
const showAllButton = document.getElementById('show-all');
const previousMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const scheduleArea = document.querySelector('.schedule-area');

const scheduleStatusByDate = new Map(
    cards.map((card) => [
        card.dataset.date,
        [...card.querySelectorAll('.status')].map((status) => {
            if (status.classList.contains('full')) return 'full';
            if (status.classList.contains('few')) return 'few';
            if (status.classList.contains('ok')) return 'ok';
            return 'unknown';
        })
    ])
);

function getJapanTodayKey() {
    const japanNow = new Date(Date.now() + (9 * 60 * 60 * 1000));
    return japanNow.toISOString().slice(0, 10);
}

function toDateKey(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function addDays(dateKey, amount) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + amount);

    return toDateKey(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}

function formatSelectedDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const week = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(year, month - 1, day);

    return `${year}年${month}月${day}日（${week[date.getDay()]}）`;
}

const todayKey = getJapanTodayKey();
const tomorrowKey = addDays(todayKey, 1);
const [todayYear, todayMonth] = todayKey.split('-').map(Number);

let displayedMonth = new Date(todayYear, todayMonth - 1, 1);
let selectedDate = null;

function updateScheduleLabels() {
    cards.forEach((card) => {
        const dateKey = card.dataset.date;
        const label = card.querySelector('.date-label');

        card.classList.toggle('is-today-card', dateKey === todayKey);

        if (!label) return;

        if (dateKey === todayKey) {
            label.textContent = '本日の出船予定';
        } else if (dateKey === tomorrowKey) {
            label.textContent = '翌日の出船予定';
        } else if (
            label.textContent.trim() === '本日の出船予定' ||
            label.textContent.trim() === '翌日の出船予定'
        ) {
            label.textContent = '出船予定';
        }
    });
}

function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const [, currentMonth, currentDay] = todayKey.split('-').map(Number);
    const isCurrentMonth = year === todayYear && month + 1 === currentMonth;
    calendarMonth.textContent = isCurrentMonth
        ? `${year}年${month + 1}月（今日：${currentDay}日）`
        : `${year}年${month + 1}月`;
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
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === selectedDate;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.dataset.date = dateKey;

        if (weekday === 0) {
            button.classList.add('is-sunday');
        } else if (weekday === 6) {
            button.classList.add('is-saturday');
        }

        const dayNumber = document.createElement('span');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        button.appendChild(dayNumber);

        const statuses = scheduleStatusByDate.get(dateKey) || [];
        if (statuses.length > 0) {
            button.classList.add('has-schedule');

            const dots = document.createElement('span');
            dots.className = 'calendar-status-dots';
            dots.setAttribute('aria-hidden', 'true');

            statuses.slice(0, 3).forEach((statusName) => {
                const dot = document.createElement('i');
                dot.className = `calendar-status-dot ${statusName}`;
                dots.appendChild(dot);
            });

            button.appendChild(dots);
        }

        if (isToday) {
            button.classList.add('is-today');
            button.setAttribute('aria-current', 'date');

            const todayLabel = document.createElement('span');
            todayLabel.className = 'calendar-today-label';
            todayLabel.textContent = '今日';
            button.appendChild(todayLabel);

            button.setAttribute(
                'aria-label',
                `今日、${month + 1}月${day}日の予定を表示`
            );
        } else {
            button.setAttribute(
                'aria-label',
                `${month + 1}月${day}日の予定を表示`
            );
        }

        if (isSelected) {
            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }

        button.addEventListener('click', () => {
            filterByDate(dateKey);
        });

        calendarGrid.appendChild(button);
    }
}

function filterByDate(dateKey) {
    selectedDate = dateKey;
    let visibleCount = 0;

    cards.forEach((card) => {
        const shouldShow = card.dataset.date === dateKey;
        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleCount += 1;
        }
    });

    const dateLabel = formatSelectedDate(dateKey);

    filterResult.textContent = dateKey === todayKey
        ? `今日・${dateLabel}の出船予定を表示しています`
        : `${dateLabel}の出船予定を表示しています`;

    emptyResult.hidden = visibleCount !== 0;
    renderCalendar();

    if (scheduleArea && window.matchMedia('(max-width: 768px)').matches) {
        scheduleArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showAllSchedules() {
    selectedDate = null;

    cards.forEach((card) => {
        card.hidden = false;
    });

    filterResult.textContent = '';
    emptyResult.hidden = true;
    renderCalendar();
}

previousMonthButton.addEventListener('click', () => {
    displayedMonth = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth() - 1,
        1
    );

    renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
    displayedMonth = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth() + 1,
        1
    );

    renderCalendar();
});

showAllButton.addEventListener('click', showAllSchedules);

updateScheduleLabels();
renderCalendar();
