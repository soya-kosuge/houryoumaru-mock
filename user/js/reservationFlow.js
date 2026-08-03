(() => {
    'use strict';

    const PROFILE_KEY = 'horyomaruProfile';
    const REGISTERED_KEY = 'horyomaruMockRegistered';
    const SESSION_LOGIN_KEY = 'horyomaruMockSessionLoggedIn';
    const TRIP_KEY = 'horyomaruSelectedTrip';
    const RESERVATION_KEY = 'horyomaruReservation';

    const $ = (selector) => document.querySelector(selector);
    const params = new URLSearchParams(location.search);

    const getProfile = () => {
        try {
            return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
        } catch {
            return null;
        }
    };

    const isRegistered = () =>
        localStorage.getItem(REGISTERED_KEY) === 'true';

    const isSessionLoggedIn = () =>
        sessionStorage.getItem(SESSION_LOGIN_KEY) === 'true';

    const getTrip = () => {
        try {
            return JSON.parse(sessionStorage.getItem(TRIP_KEY) || 'null');
        } catch {
            return null;
        }
    };

    const redirectSchedule = () => {
        location.href = 'shipScheduleList.html';
    };

    // ----------------------------------------
    // ログイン画面
    // ----------------------------------------
    if ($('#first-login-form')) {
        const requestedMode = params.get('mode');

        const mode =
            requestedMode === 'first' || requestedMode === 'line'
                ? requestedMode
                : (isRegistered() ? 'line' : 'first');

        const firstLoginArea = $('#first-login-area');
        const lineLoginArea = $('#line-login-area');
        const loginTitle = $('#login-title');
        const loginLead = $('#login-lead');

        if (mode === 'line') {
            firstLoginArea.hidden = true;
            lineLoginArea.hidden = false;

            loginTitle.textContent = 'LINEログイン';
            loginLead.textContent =
                '2回目以降はLINEログインだけで出船予定へ進みます。';

        } else {
            firstLoginArea.hidden = false;
            lineLoginArea.hidden = true;

            loginTitle.textContent = '初回ログイン';
            loginLead.textContent =
                '初回のみ、名前（漢字）・名前（かな）・メールアドレス・電話番号・パスワードを入力してください。';
        }

        // ----------------------------------------
        // 初回登録
        // ----------------------------------------
        $('#first-login-form').addEventListener('submit', (event) => {
            event.preventDefault();

            const form = new FormData(event.currentTarget);

            localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify({
                    name: form.get('name') || '',
                    nameKana: form.get('nameKana') || '',
                    email: form.get('email') || '',
                    phone: form.get('tel') || ''
                })
            );

            localStorage.setItem(REGISTERED_KEY, 'true');
            sessionStorage.setItem(SESSION_LOGIN_KEY, 'true');

            redirectSchedule();
        });

        // ----------------------------------------
        // LINEログイン
        // ----------------------------------------
        $('#line-login-button')?.addEventListener('click', () => {
            const button = $('#line-login-button');
            const actions = $('#line-login-actions');
            const loading = $('#loading-message');

            button.disabled = true;
            actions.hidden = true;
            loading.hidden = false;

            // MOCK用プロフィール
            if (!getProfile()) {
                localStorage.setItem(
                    PROFILE_KEY,
                    JSON.stringify({
                        name: 'LINEユーザー',
                        nameKana: 'らいんゆーざー',
                        email: 'line-user@example.com',
                        phone: '090-1234-5678'
                    })
                );
            }

            localStorage.setItem(REGISTERED_KEY, 'true');
            sessionStorage.setItem(SESSION_LOGIN_KEY, 'true');

            window.setTimeout(
                redirectSchedule,
                1200
            );
        });
    }

    // ----------------------------------------
    // 予約入力画面
    // ----------------------------------------
    if ($('#reservation-form')) {
        if (!isSessionLoggedIn()) {
            location.replace('signin.html');
            return;
        }

        const profile = getProfile() || {
            name: '',
            nameKana: '',
            email: '',
            phone: ''
        };

        $('#profile-name').textContent =
            profile.name || '－';

        $('#profile-name-kana').textContent =
            profile.nameKana || '－';

        $('#profile-email').textContent =
            profile.email || '－';

        $('#profile-phone').textContent =
            profile.phone || '－';

        const trip = getTrip() || {
            date:
                params.get('date') ||
                '2026年7月28日（火）',

            name:
                params.get('name') ||
                '半夜便',

            time:
                params.get('time') ||
                '18:00',

            target:
                params.get('target') ||
                'マイカ＆ムギイカ',

            price:
                params.get('price') ||
                'お一人様 13,000円（税込）',

            detail:
                params.get('detail') ||
                'shipScheduleList.html'
        };

        sessionStorage.setItem(
            TRIP_KEY,
            JSON.stringify(trip)
        );

        $('#trip-title').textContent =
            `${trip.date} ${trip.name}`;

        $('#trip-time').textContent =
            trip.time;

        $('#trip-target').textContent =
            trip.target;

        $('#trip-price').textContent =
            trip.price;

        $('#detail-back').href =
            trip.detail;

        // ----------------------------------------
        // 参加人数
        // ----------------------------------------
        const participants = $('#participants');

        for (let i = 1; i <= 25; i += 1) {
            participants.insertAdjacentHTML(
                'beforeend',
                `<option value="${i}">${i}名</option>`
            );
        }

        // ----------------------------------------
        // 貸し竿
        // ----------------------------------------
        const rentalRod = $('#rental-rod');

        for (let i = 0; i <= 25; i += 1) {
            rentalRod.insertAdjacentHTML(
                'beforeend',
                `<option value="${i}">
                    ${i === 0 ? 'なし' : `${i}本`}
                </option>`
            );
        }

        // ----------------------------------------
        // 予約入力保存
        // ----------------------------------------
        $('#reservation-form').addEventListener('submit', (event) => {
            event.preventDefault();

            const form = new FormData(event.currentTarget);

            sessionStorage.setItem(
                RESERVATION_KEY,
                JSON.stringify({
                    participants: form.get('participants'),
                    rentalRod: form.get('rentalRod'),
                    remarks: form.get('remarks') || 'なし'
                })
            );

            location.href = 'reservationConfirm.html';
        });
    }

    // ----------------------------------------
    // 予約確認画面
    // ----------------------------------------
    if ($('#confirmation-list')) {
        if (!isSessionLoggedIn()) {
            location.replace('signin.html');
            return;
        }

        const profile = getProfile() || {
            name: '',
            nameKana: '',
            email: '',
            phone: ''
        };

        const trip = getTrip();

        let reservation = null;

        try {
            reservation = JSON.parse(
                sessionStorage.getItem(RESERVATION_KEY) || 'null'
            );
        } catch {
            reservation = null;
        }

        if (!trip || !reservation) {
            location.replace('shipScheduleList.html');
            return;
        }

        const rows = [
            ['予約日', trip.date],
            ['コース', trip.name],
            ['出船時刻', trip.time],
            ['釣り物', trip.target],
            ['料金', trip.price],

            ['名前（漢字）', profile.name || '－'],
            ['名前（かな）', profile.nameKana || '－'],
            ['メールアドレス', profile.email || '－'],
            ['電話番号', profile.phone || '－'],

            ['参加人数', `${reservation.participants}名`],

            [
                '貸し竿',
                reservation.rentalRod === '0'
                    ? 'なし'
                    : `${reservation.rentalRod}本`
            ],

            ['備考', reservation.remarks]
        ];

        $('#confirmation-list').innerHTML =
            rows
                .map(
                    ([key, value]) => `
                        <div class="confirmation-item">
                            <dt>${key}</dt>
                            <dd>${value}</dd>
                        </div>
                    `
                )
                .join('');
    }

})();