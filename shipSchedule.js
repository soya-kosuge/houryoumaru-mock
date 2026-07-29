'use strict';

const cards = [...document.querySelectorAll('.date-card[data-date]')];
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonth = document.getElementById('calendar-month');
const filterResult = document.getElementById('filter-result');
const emptyResult = document.getElementById('empty-result');
const showAllButton = document.getElementById('show-all');

const availableDates = new Set(cards.map((card) => card.dataset.date));
let displayedMonth = new Date(2026, 6, 1);
let selectedDate = null;

function toDateKey(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatSelectedDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const week = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(year, month - 1, day);
    return `${year}年${month}月${day}日（${week[date.getDay()]}）`;
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
        calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= lastDay; day += 1) {
        const dateKey = toDateKey(year, month, day);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.textContent = day;
        button.dataset.date = dateKey;
        button.setAttribute('aria-label', `${month + 1}月${day}日の予定を表示`);

        if (selectedDate === dateKey) {
            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }

        button.addEventListener('click', () => filterByDate(dateKey));
        calendarGrid.appendChild(button);
    }
}

function filterByDate(dateKey) {
    selectedDate = dateKey;
    let visibleCount = 0;

    cards.forEach((card) => {
        const shouldShow = card.dataset.date === dateKey;
        card.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
    });

    const dateLabel = formatSelectedDate(dateKey);
    filterResult.textContent = `${dateLabel}の出船予定を表示しています`;
    emptyResult.hidden = visibleCount !== 0;
    renderCalendar();
}

function showAllSchedules() {
    selectedDate = null;
    cards.forEach((card) => { card.hidden = false; });
    filterResult.textContent = '';
    emptyResult.hidden = true;
    renderCalendar();
}

document.getElementById('prev-month').addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
});

showAllButton.addEventListener('click', showAllSchedules);
renderCalendar();
