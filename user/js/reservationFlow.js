(() => {
    'use strict';

    const PROFILE_KEY = 'horyomaruProfile';
    const REGISTERED_KEY = 'horyomaruMockRegistered';
    const TRIP_KEY = 'horyomaruSelectedTrip';
    const RESERVATION_KEY = 'horyomaruReservation';
    const EMPTY_PROFILE = Object.freeze({ name: '', nameKana: '', email: '', phone: '' });
    const $ = (selector) => document.querySelector(selector);
    const params = new URLSearchParams(location.search);
    const attachUnsavedChangesGuard = (form) => {
        if (!form) return { allowLeave: () => {} };
        let dirty = false;
        let safeLeave = false;
        form.addEventListener('input', () => { dirty = true; });
        form.addEventListener('change', () => { dirty = true; });
        const message = '入力内容が破棄されますが、よろしいですか？';
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (!link || safeLeave || !dirty) return;
            const href = link.getAttribute('href') || '';
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            if (!window.confirm(message)) event.preventDefault();
        }, true);
        window.addEventListener('beforeunload', (event) => {
            if (!dirty || safeLeave) return;
            event.preventDefault();
            event.returnValue = '';
        });
        return { allowLeave: () => { safeLeave = true; dirty = false; } };
    };

    const getProfile = () => {
        try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
        catch { return null; }
    };
    const isRegistered = () => localStorage.getItem(REGISTERED_KEY) === 'true';
    const getStoredTrip = () => {
        try { return JSON.parse(sessionStorage.getItem(TRIP_KEY) || 'null'); }
        catch { return null; }
    };
    const hasTripParams = () => ['date', 'name', 'time', 'target'].some((key) => params.has(key));
    const getTrip = () => {
        // 出船詳細から来た場合は、前回sessionStorageより今回URLの便を必ず優先する。
        if (hasTripParams()) {
            return {
                date: params.get('date') || '',
                dateKey: params.get('dateKey') || '',
                name: params.get('name') || '',
                time: params.get('time') || '',
                target: params.get('target') || '',
                status: params.get('status') || 'ok',
                statusText: params.get('statusText') || '〇 空きあり',
                tripId: params.get('tripId') || '',
                capacity: Number(params.get('capacity') || 0),
                reservedSeats: Number(params.get('reservedSeats') || 0),
                remainingSeats: Number(params.get('remainingSeats') || 0),
                price: params.get('price') || 'お一人様 13,000円（税込）',
                detail: params.get('detail') || `shipScheduleDetail.html?${params.toString()}`
            };
        }
        return getStoredTrip();
    };
    const redirectSchedule = () => { location.href = 'shipScheduleList.html'; };

    if ($('#first-registration-form')) {
        if (isRegistered()) { redirectSchedule(); return; }
        const registrationForm = $('#first-registration-form');
        const registrationLeaveGuard = attachUnsavedChangesGuard(registrationForm);
        const nameInput = $('#name');
        const nameKanaInput = $('#name-kana');
        const telInput = $('#tel');
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = nameInput.value.trim();
            const nameKana = nameKanaInput.value.trim();
            const tel = telInput.value.trim();
            if (name && !/^[一-龯々ぁ-ゖァ-ヶー\s]+$/.test(name)) { alert('名前（漢字）は漢字・ひらがな・カタカナで入力してください。'); nameInput.focus(); return; }
            if (nameKana && !/^[ぁ-ゖー\s]+$/.test(nameKana)) { alert('名前（かな）はひらがなで入力してください。'); nameKanaInput.focus(); return; }
            if (tel && !/^[0-9]+$/.test(tel)) { alert('電話番号はハイフンなしの数字のみで入力してください。'); telInput.focus(); return; }
            const form = new FormData(event.currentTarget);
            localStorage.setItem(PROFILE_KEY, JSON.stringify({
                name: form.get('name') || '', nameKana: form.get('nameKana') || '',
                email: form.get('email') || '', phone: form.get('tel') || ''
            }));
            localStorage.setItem(REGISTERED_KEY, 'true');
            registrationLeaveGuard.allowLeave();
            redirectSchedule();
        });
    }

    if ($('#reservation-form')) {
        if (!isRegistered()) { location.replace('signin.html'); return; }
        const profile = getProfile() || EMPTY_PROFILE;
        const reservationLeaveGuard = attachUnsavedChangesGuard($('#reservation-form'));
        $('#profile-name').textContent = profile.name || '－';
        $('#profile-name-kana').textContent = profile.nameKana || '－';
        $('#profile-email').textContent = profile.email || '－';
        $('#profile-phone').textContent = profile.phone || '－';

        const trip = getTrip();
        if (!trip) { redirectSchedule(); return; }
        sessionStorage.setItem(TRIP_KEY, JSON.stringify(trip));
        $('#trip-title').textContent = `${trip.date} ${trip.name}`;
        $('#trip-time').textContent = trip.time;
        $('#trip-target').textContent = trip.target;
        $('#trip-price').textContent = trip.price;
        $('#detail-back').href = trip.detail || 'shipScheduleList.html';

        const participants = $('#participants');
        const remainingSeats = Math.max(0, Number(trip.remainingSeats || 0));
        const maxGuests = Math.min(25, remainingSeats);
        for (let i = 1; i <= maxGuests; i += 1) {
            participants.insertAdjacentHTML('beforeend', `<option value="${i}">${i}名</option>`);
        }
        if (remainingSeats > 0) {
            const note = document.createElement('p');
            note.className = 'seat-remaining-note';
            note.textContent = `現在の残り定員：${remainingSeats}名`;
            participants.closest('.form-group')?.appendChild(note);
        } else {
            participants.disabled = true;
            const submit = $('#reservation-form button[type="submit"]');
            if (submit) submit.disabled = true;
        }

        const rentalRod = $('#rental-rod');
        for (let i = 0; i <= 25; i += 1) {
            rentalRod.insertAdjacentHTML('beforeend', `<option value="${i}">${i === 0 ? 'なし' : `${i}本`}</option>`);
        }

        $('#reservation-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const requestedGuests = Number(form.get('participants') || 0);
            if (!requestedGuests) { alert('参加人数を選択してください。'); participants.focus(); return; }
            if (requestedGuests > remainingSeats) {
                alert(`残り定員は${remainingSeats}名です。${remainingSeats}名以下で予約してください。`);
                participants.focus();
                return;
            }

            // 同時アクセス対策：確認画面へ進む直前にも最新残席を再確認。
            const availability = await window.HoryomaruScheduleApi?.checkAvailability(trip, requestedGuests);
            const latestRemaining = Number(availability?.remainingSeats ?? remainingSeats);
            if (availability && (!availability.available || requestedGuests > latestRemaining)) {
                alert(`現在の残り定員は${latestRemaining}名です。人数を変更してもう一度お試しください。`);
                participants.focus();
                return;
            }

            sessionStorage.setItem(RESERVATION_KEY, JSON.stringify({
                participants: String(requestedGuests),
                rentalRod: form.get('rentalRod'),
                remarks: form.get('remarks') || 'なし'
            }));
            reservationLeaveGuard.allowLeave();
            location.href = 'reservationConfirm.html';
        });
    }

    if ($('#confirmation-list')) {
        if (!isRegistered()) { location.replace('signin.html'); return; }
        const profile = getProfile() || EMPTY_PROFILE;
        const trip = getStoredTrip();
        let reservation = null;
        try { reservation = JSON.parse(sessionStorage.getItem(RESERVATION_KEY) || 'null'); }
        catch { reservation = null; }
        if (!trip || !reservation) { location.replace('shipScheduleList.html'); return; }

        const rows = [
            ['予約日', trip.date], ['コース', trip.name], ['出船時刻', trip.time], ['釣り物', trip.target], ['料金', trip.price],
            ['名前（漢字）', profile.name || '－'], ['名前（かな）', profile.nameKana || '－'],
            ['メールアドレス', profile.email || '－'], ['電話番号', profile.phone || '－'],
            ['参加人数', `${reservation.participants}名`],
            ['貸し竿', reservation.rentalRod === '0' ? 'なし' : `${reservation.rentalRod}本`], ['備考', reservation.remarks]
        ];
        const confirmationList = $('#confirmation-list');
        const fragment = document.createDocumentFragment();
        rows.forEach(([key, value]) => {
            const item = document.createElement('div');
            const term = document.createElement('dt');
            const description = document.createElement('dd');
            item.className = 'confirmation-item'; term.textContent = key; description.textContent = value;
            item.append(term, description); fragment.appendChild(item);
        });
        confirmationList.replaceChildren(fragment);

        // 予約確定直前にも再確認。本番ではこの後の「確保API」内でDB排他制御して確定する。
        $('#complete-link')?.addEventListener('click', async (event) => {
            event.preventDefault();
            const errorBox = $('#reservation-error');
            const showError = (message) => {
                if (errorBox) {
                    errorBox.textContent = message;
                    errorBox.hidden = false;
                    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert(message);
                }
            };
            if (errorBox) errorBox.hidden = true;

            try {
                const requestedGuests = Number(reservation.participants || 0);
                const availability = await window.HoryomaruScheduleApi?.checkAvailability(trip, requestedGuests);
                const latestRemaining = Number(availability?.remainingSeats ?? trip.remainingSeats ?? 0);
                if (availability && (!availability.available || requestedGuests > latestRemaining)) {
                    showError(`申し訳ありません。残り定員が${latestRemaining}名に変わりました。入力内容は保持されています。「入力内容を修正する」から人数を変更してください。`);
                    return;
                }

                // MOCKでもユーザー予約を管理画面へ反映する。
            const adminKey = 'horyomaruAdminReservations';
            let adminReservations = [];
            try { adminReservations = JSON.parse(localStorage.getItem(adminKey) || '[]'); } catch { adminReservations = []; }
            if (!Array.isArray(adminReservations)) adminReservations = [];
            const reservationId = `U-${Date.now()}`;
            const blankCompanion = () => ({ name: '---', address: '---', age: '---', gender: '---', emergency: '---' });
            adminReservations.push({
                id: reservationId,
                tripId: trip.tripId || '',
                date: (trip.dateKey || '').replaceAll('-', '/'),
                dateKey: trip.dateKey || '',
                course: trip.name,
                departureTime: trip.time || '',
                target: trip.target || '',
                name: profile.name || 'LINEユーザー',
                nameKana: profile.nameKana || '',
                participants: requestedGuests,
                rentalRod: Number(reservation.rentalRod || 0),
                phone: profile.phone || '',
                email: profile.email || '',
                remarks: reservation.remarks || '',
                representative: {
                    name: profile.name || '---',
                    address: '---', age: '---', gender: '---', emergency: '---'
                },
                companions: Array.from({ length: Math.max(0, requestedGuests - 1) }, blankCompanion),
                status: '予約中'
            });
            localStorage.setItem(adminKey, JSON.stringify(adminReservations));
            const appTrip = window.HoryomaruAppData?.getTrips?.().find((item) => item.id === trip.tripId);
            if (trip.tripId) window.HoryomaruAppData?.addReservationDelta(trip.tripId, requestedGuests);
            window.HoryomaruAppData?.addAdminNotification?.(
                '予約を受け付けました。',
                `${profile.name || 'LINEユーザー'}様／${(trip.dateKey || '').replaceAll('-', '/')} ${trip.name}${appTrip?.ship ? `／${appTrip.ship}` : ''}`,
                'reservation'
            );
            if (requestedGuests === latestRemaining) {
                window.HoryomaruAppData?.addAdminNotification?.(
                    '予約が満員になりました。',
                    `${(trip.dateKey || '').replaceAll('-', '/')} ${trip.name}${appTrip?.ship ? `／${appTrip.ship}` : ''}`,
                    'full'
                );
            }
                location.href = 'reservationComplete.html';
            } catch (error) {
                console.error(error);
                showError('予約登録中にエラーが発生しました。入力内容は保持されています。時間をおいて、もう一度「この内容で予約する」を押してください。');
            }
        });
    }

    function formatPostalCode(value) {
        const digits = String(value || '').replace(/\D/g, '').slice(0, 7);
        return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
    }
})();
