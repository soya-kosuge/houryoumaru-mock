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

/**
 * 日本時間の今日を「YYYY-MM-DD」で取得する
 */
function getJapanTodayKey() {
    const japanNow = new Date(
        Date.now() + (9 * 60 * 60 * 1000)
    );

    return japanNow.toISOString().slice(0, 10);
}

/**
 * 年・月・日から「YYYY-MM-DD」を作成する
 */
function toDateKey(year, monthIndex, day) {
    return [
        year,
        String(monthIndex + 1).padStart(2, '0'),
        String(day).padStart(2, '0')
    ].join('-');
}

/**
 * 指定した日付に日数を加える
 */
function addDays(dateKey, amount) {
    const [year, month, day] = dateKey
        .split('-')
        .map(Number);

    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + amount);

    return toDateKey(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}

/**
 * 選択した日付を日本語形式に変換する
 */
function formatSelectedDate(dateKey) {
    const [year, month, day] = dateKey
        .split('-')
        .map(Number);

    const week = [
        '日',
        '月',
        '火',
        '水',
        '木',
        '金',
        '土'
    ];

    const date = new Date(year, month - 1, day);

    return `${year}年${month}月${day}日（${week[date.getDay()]}）`;
}

const todayKey = getJapanTodayKey();
const tomorrowKey = addDays(todayKey, 1);

const [todayYear, todayMonth] = todayKey
    .split('-')
    .map(Number);

let displayedMonth = new Date(
    todayYear,
    todayMonth - 1,
    1
);

let selectedDate = null;

/**
 * 出船予定カードのラベルを更新する
 */
function updateScheduleLabels() {
    cards.forEach((card) => {
        const dateKey = card.dataset.date;
        const label = card.querySelector('.date-label');

        card.classList.toggle(
            'is-today-card',
            dateKey === todayKey
        );

        if (!label) {
            return;
        }

        if (dateKey === todayKey) {
            label.textContent = '本日の出船予定';
            return;
        }

        if (dateKey === tomorrowKey) {
            label.textContent = '翌日の出船予定';
            return;
        }

        if (
            label.textContent.trim() === '本日の出船予定' ||
            label.textContent.trim() === '翌日の出船予定'
        ) {
            label.textContent = '出船予定';
        }
    });
}

/**
 * カレンダーを描画する
 */
function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    const firstWeekday = new Date(
        year,
        month,
        1
    ).getDay();

    const lastDay = new Date(
        year,
        month + 1,
        0
    ).getDate();

    /*
     * 「今日：30日」などは表示せず、
     * 年月だけを表示する
     */
    calendarMonth.textContent =
        `${year}年${month + 1}月`;

    calendarGrid.replaceChildren();

    /*
     * 月初までの空白
     */
    for (let i = 0; i < firstWeekday; i += 1) {
        const blank = document.createElement('span');

        blank.className = 'calendar-blank';
        blank.setAttribute('aria-hidden', 'true');

        calendarGrid.appendChild(blank);
    }

    /*
     * 日付ボタンを作成
     */
    for (let day = 1; day <= lastDay; day += 1) {
        const dateKey = toDateKey(
            year,
            month,
            day
        );

        const date = new Date(
            year,
            month,
            day
        );

        const weekday = date.getDay();
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === selectedDate;

        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'calendar-day';
        button.dataset.date = dateKey;

        /*
         * 日曜日・土曜日のクラス
         */
        if (weekday === 0) {
            button.classList.add('is-sunday');
        } else if (weekday === 6) {
            button.classList.add('is-saturday');
        }

        /*
         * 日付の数字
         */
        const dayNumber = document.createElement('span');

        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;

        button.appendChild(dayNumber);

        /*
         * 今日の日付
         *
         * 「今日」という文字は追加しない。
         * is-todayクラスだけ付けて、
         * CSSで青い枠を表示する。
         */
        if (isToday) {
            button.classList.add('is-today');
            button.setAttribute('aria-current', 'date');

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

        /*
         * 選択中の日付
         */
        if (isSelected) {
            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }

        /*
         * 日付をクリックしたときの処理
         */
        button.addEventListener('click', () => {
            filterByDate(dateKey);
        });

        calendarGrid.appendChild(button);
    }
}

/**
 * 選択された日付で出船予定を絞り込む
 */
function filterByDate(dateKey) {
    selectedDate = dateKey;

    let visibleCount = 0;

    cards.forEach((card) => {
        const shouldShow =
            card.dataset.date === dateKey;

        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleCount += 1;
        }
    });

    const dateLabel = formatSelectedDate(dateKey);

    if (dateKey === todayKey) {
        filterResult.textContent =
            `${dateLabel}の出船予定を表示しています`;
    } else {
        filterResult.textContent =
            `${dateLabel}の出船予定を表示しています`;
    }

    if (emptyResult) {
        emptyResult.hidden = visibleCount !== 0;
    }

    renderCalendar();

    /*
     * スマートフォンでは
     * 絞り込み後に予定一覧まで移動する
     */
    if (
        scheduleArea &&
        window.matchMedia('(max-width: 768px)').matches
    ) {
        scheduleArea.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * すべての日程を表示する
 */
function showAllSchedules() {
    selectedDate = null;

    cards.forEach((card) => {
        card.hidden = false;
    });

    filterResult.textContent = '';

    if (emptyResult) {
        emptyResult.hidden = true;
    }

    renderCalendar();
}

/**
 * 前月を表示する
 */
previousMonthButton.addEventListener('click', () => {
    displayedMonth = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth() - 1,
        1
    );

    renderCalendar();
});

/**
 * 翌月を表示する
 */
nextMonthButton.addEventListener('click', () => {
    displayedMonth = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth() + 1,
        1
    );

    renderCalendar();
});

/**
 * すべての日程を表示
 */
showAllButton.addEventListener(
    'click',
    showAllSchedules
);

/**
 * 初期表示
 */
updateScheduleLabels();
renderCalendar();