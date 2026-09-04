(() => {
    'use strict';
    if (window.HoryomaruAppData) return; // 共通データ連携版ではsharedDataBinderが描画する。

    const STORAGE_KEY = 'horyomaruAdminReservations';

    const readReservations = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const formatRod = (count) => Number(count) > 0 ? `${Number(count)}本` : 'なし';
    const cancellationLabel = (status) => {
        if (['無断キャンセル', 'no-show', 'no_show'].includes(status)) return '無断キャンセル';
        if (['キャンセル', '通常キャンセル', 'cancelled', 'canceled'].includes(status)) return '通常キャンセル';
        return 'なし';
    };
    const cancellationClass = (label) => label === '無断キャンセル' ? 'no-show' : (label === '通常キャンセル' ? 'normal' : 'none');
    const digits = (value) => String(value || '').replace(/\D/g, '');
    const formatPhone = (value) => {
        const d = digits(value).slice(0, 15);
        if (!d) return '－';
        if (d.startsWith('00')) {
            if (d.length <= 4) return d;
            if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, -4)}-${d.slice(-4)}`;
        }
        if (d.startsWith('0120') || d.startsWith('0570')) {
            if (d.length <= 4) return d;
            if (d.length <= 7) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7, 10)}`;
        }
        if (d.startsWith('0800')) {
            if (d.length <= 4) return d;
            if (d.length <= 7) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7, 11)}`;
        }
        if (/^(020|050|070|080|090)/.test(d)) {
            if (d.length <= 3) return d;
            if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
            return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
        }
        if ((d.startsWith('03') || d.startsWith('06')) && d.length <= 10) {
            if (d.length <= 2) return d;
            if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
            return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
        }
        const fourDigitArea = /^(?:013[4-9]|014[2-6]|015[2-8]|016[2-7]|017[2-9]|018[2-7]|019[1-8]|022[0-9]|023[3-8]|024[0-9]|025[0-9]|026[0-9]|027[0-9]|028[0-9]|029[0-9]|042[2-9]|043[0-9]|044[0-9]|045[0-9]|046[0-9]|047[0-9]|048[0-9]|049[0-9]|052[0-9]|053[0-9]|054[0-9]|055[0-9]|056[0-9]|057[2-9]|058[0-9]|059[0-9]|072[0-9]|073[0-9]|074[0-9]|075[0-9]|076[0-9]|077[0-9]|078[0-9]|079[0-9]|082[0-9]|083[0-9]|084[0-9]|085[0-9]|086[0-9]|087[0-9]|088[0-9]|089[0-9]|092[0-9]|093[0-9]|094[0-9]|095[0-9]|096[0-9]|097[0-9]|098[0-9]|099[0-9])/;
        if (d.length <= 10 && fourDigitArea.test(d)) {
            if (d.length <= 4) return d;
            if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 10)}`;
        }
        if (d.startsWith('0') && d.length <= 10) {
            if (d.length <= 3) return d;
            if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
            return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
        }
        if (/^[2-9]/.test(d)) {
            if (d.length <= 4) return d;
            if (d.length <= 8) return `${d.slice(0, d.length - 4)}-${d.slice(-4)}`;
            return `${d.slice(0, d.length - 8)}-${d.slice(-8, -4)}-${d.slice(-4)}`;
        }
        return d;
    };

    const reservations = readReservations();
    if (!reservations.length) return;

    // 予約管理：個別予約を追加。既存admin.jsが日付×便で集約する。
    const reservationBody = document.querySelector('#reservation-table tbody');
    if (reservationBody) {
        reservations.forEach((item) => {
            const cancelLabel = cancellationLabel(item.status);
            const row = document.createElement('tr');
            row.dataset.searchRow = '';
            row.innerHTML = `
                <td>${escapeHtml(item.date)}</td>
                <td>${escapeHtml(item.course)}</td>
                <td>${Number(item.participants || 0)}名</td>
            `;
            reservationBody.appendChild(row);
        });
    }

    // 予約詳細：PC表 + スマホカード
    const detailBody = document.querySelector('#reservation-detail-table tbody');
    const mobileContainer = document.querySelector('.mobile-cards');
    if (detailBody) {
        reservations.forEach((item) => {
            const row = document.createElement('tr');
            row.dataset.detailSearchRow = '';
            row.dataset.date = item.date || '';
            row.dataset.course = item.course || '';
            row.dataset.name = item.name || '';
            row.dataset.userReservation = 'true';
            row.innerHTML = `
                <td data-editable>${escapeHtml(item.date)}</td>
                <td data-editable>${escapeHtml(item.course)}</td>
                <td data-editable>${escapeHtml(item.name)}</td>
                <td data-editable>${escapeHtml(item.nameKana)}</td>
                <td data-editable>${Number(item.participants || 0)}名</td>
                <td data-editable>${escapeHtml(formatRod(item.rentalRod))}</td>
                <td data-editable>${escapeHtml(formatPhone(item.phone))}</td>
                <td data-editable>${escapeHtml(item.email)}</td>
                <td data-cancel-cell data-cancel-value="${cancelLabel}"><span class="reservation-cancel-tag ${cancellationClass(cancelLabel)}">${cancelLabel}</span></td>
                <td><button class="btn btn-primary btn-sm" data-edit-row type="button">修正</button></td>
            `;
            detailBody.appendChild(row);

            if (mobileContainer) {
                const card = document.createElement('article');
                card.className = 'card reservation-card';
                card.dataset.detailMobileCard = '';
                card.dataset.date = item.date || '';
                card.dataset.course = item.course || '';
                card.dataset.name = item.name || '';
                card.dataset.userReservation = 'true';
                const values = [
                    ['予約日', item.date],
                    ['便', item.course],
                    ['氏名', item.name],
                    ['ふりがな', item.nameKana],
                    ['人数', `${Number(item.participants || 0)}名`],
                    ['貸し竿', formatRod(item.rentalRod)],
                    ['電話番号', formatPhone(item.phone)],
                    ['メール', item.email],
                    ['キャンセル', cancelLabel]
                ];
                card.innerHTML = `<div class="card-body">${values.map(([label, value]) => `
                    <div>
                        <div class="data-label">${escapeHtml(label)}</div>
                        <div class="data-value">${escapeHtml(value)}</div>
                    </div>
                `).join('')}</div>`;
                mobileContainer.appendChild(card);
            }
        });
    }

    // 印刷一覧
    const printBody = document.querySelector('#print-reservation-table tbody');
    if (printBody) {
        reservations.forEach((item) => {
            const row = document.createElement('tr');
            row.dataset.printRow = '';
            row.innerHTML = `
                <td>${escapeHtml(item.date)}</td>
                <td>${escapeHtml(item.course)}</td>
                <td>${escapeHtml(item.name)}</td>
                <td>${Number(item.participants || 0)}名</td>
                <td>${escapeHtml(formatRod(item.rentalRod))}</td>
                <td>${escapeHtml(formatPhone(item.phone))}</td>
            `;
            printBody.appendChild(row);
        });
    }

    // 顧客管理・顧客詳細
    // ユーザー予約を電話番号 / メール単位でまとめる
    const customerBody =
        document.querySelector(
            "#customer-table tbody"
        );

    const customerMobileContainer =
        document.querySelector(
            ".customer-mobile-cards"
        );

    const customerDetailBody =
        document.querySelector(
            "#customer-detail-table tbody"
        );

    const customerDetailMobileContainer =
        document.querySelector(
            ".customer-detail-mobile-cards"
        );

    if (
        customerBody ||
        customerMobileContainer ||
        customerDetailBody ||
        customerDetailMobileContainer
    ) {
        const customers =
            new Map();

        reservations.forEach((item) => {
            const key =
                digits(item.phone) ||
                item.email ||
                item.name;

            if (!customers.has(key)) {
                customers.set(
                    key,
                    {
                        ...item,
                        useCount: 0,
                        cancelCount: 0,
                        noShowCount: 0,
                        lastDate:
                            item.date || ""
                    }
                );
            }

            const customer =
                customers.get(key);

            // 利用回数 = 実際に乗船完了した回数。status未設定の既存MOCKは乗船済み扱い。
            if (!item.status || item.status === '乗船済み' || item.status === 'completed') {
                customer.useCount += 1;
            } else if (item.status === 'キャンセル' || item.status === 'cancelled' || item.status === 'canceled') {
                customer.cancelCount += 1;
            } else if (item.status === '無断キャンセル' || item.status === 'no-show' || item.status === 'no_show') {
                customer.noShowCount += 1;
            }

            if (
                (item.date || "") >
                customer.lastDate
            ) {
                customer.lastDate =
                    item.date || "";
            }
        });

        let index = 0;

        customers.forEach((customer) => {
            index += 1;

            const id =
                2000 + index;

            const count =
                customer.useCount;

            const rank =
                count >= 6
                    ? "VIP"
                    : count >= 2
                        ? "常連"
                        : "新規";

            const badge =
                rank === "VIP"
                    ? "badge-orange"
                    : rank === "常連"
                        ? "badge-blue"
                        : "badge-green";


            // 顧客一覧 PC
            if (customerBody) {
                const row =
                    document.createElement("tr");

                row.dataset.searchRow = "";
                row.dataset.userCustomer =
                    "true";

                row.dataset.customerId =
                    String(id);

                row.dataset.customerName =
                    customer.name || "";

                row.dataset.customerRank =
                    rank;

                row.dataset.customerLastDate =
                    customer.lastDate || "";

                row.innerHTML = `
                    <td>${id}</td>

                    <td>
                        ${escapeHtml(
                            customer.name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            formatPhone(
                                customer.phone
                            )
                        )}
                    </td>

                    <td>
                        ${count}回
                    </td>

                    <td>
                        <span class="badge ${badge}">
                            ${rank}
                        </span>
                    </td>

                    <td>
                        ${escapeHtml(
                            customer.lastDate
                        )}
                    </td>
                `;

                customerBody.appendChild(row);
            }


            // 顧客一覧 スマホ
            if (customerMobileContainer) {
                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "card customer-card";

                card.dataset.customerMobileCard =
                    "";

                card.dataset.customerId =
                    String(id);

                card.dataset.customerName =
                    customer.name || "";

                card.dataset.customerRank =
                    rank;

                card.dataset.customerLastDate =
                    customer.lastDate || "";

                card.innerHTML = `
                    <div class="card-body">

                        <div>
                            <div class="data-label">
                                顧客ID
                            </div>
                            <div class="data-value">
                                ${id}
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                顧客名
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    customer.name
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                電話番号
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    formatPhone(
                                        customer.phone
                                    )
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                利用回数
                            </div>
                            <div class="data-value">
                                ${count}回
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                区分
                            </div>
                            <div class="data-value">
                                <span class="badge ${badge}">
                                    ${rank}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                最終利用日
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    customer.lastDate
                                )}
                            </div>
                        </div>

                    </div>
                `;

                customerMobileContainer
                    .appendChild(card);
            }


            // 顧客詳細 PC
            if (customerDetailBody) {
                const row =
                    document.createElement("tr");

                row.dataset.customerDetailRow =
                    "";

                row.dataset.customerId =
                    String(id);

                row.dataset.customerName =
                    customer.name || "";

                row.dataset.customerRank =
                    rank;

                row.dataset.customerLastDate =
                    customer.lastDate || "";

                row.innerHTML = `
                    <td>${id}</td>

                    <td data-editable>
                        ${escapeHtml(
                            customer.name
                        )}
                    </td>

                    <td data-editable>
                        ${escapeHtml(
                            customer.nameKana
                        )}
                    </td>

                    <td data-editable>
                        ${escapeHtml(
                            formatPhone(
                                customer.phone
                            )
                        )}
                    </td>

                    <td data-editable>
                        ${escapeHtml(
                            customer.email
                        )}
                    </td>

                    <td data-editable>
                        ${count}回
                    </td>

                    <td><span class="cancel-count${customer.cancelCount ? '' : ' is-zero'}">${customer.cancelCount}回</span></td>

                    <td><span class="no-show-count${customer.noShowCount ? '' : ' is-zero'}">${customer.noShowCount}回</span></td>

                    <td>
                        ${rank}
                    </td>

                    <td>
                        ${escapeHtml(
                            customer.lastDate
                        )}
                    </td>

                    <td>
                        <button
                            class="btn btn-primary btn-sm"
                            data-edit-row
                            type="button"
                        >
                            修正
                        </button>
                    </td>
                `;

                customerDetailBody
                    .appendChild(row);
            }


            // 顧客詳細 スマホ
            if (customerDetailMobileContainer) {
                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "card customer-detail-card";

                card.dataset
                    .customerDetailMobileCard =
                    "";

                card.dataset.customerId =
                    String(id);

                card.dataset.customerName =
                    customer.name || "";

                card.dataset.customerRank =
                    rank;

                card.dataset.customerLastDate =
                    customer.lastDate || "";

                card.innerHTML = `
                    <div class="card-body">

                        <div>
                            <div class="data-label">
                                顧客ID
                            </div>
                            <div class="data-value">
                                ${id}
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                氏名
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    customer.name
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                ふりがな
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    customer.nameKana
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                電話番号
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    formatPhone(
                                        customer.phone
                                    )
                                )}
                            </div>
                        </div>

                        <div class="customer-email">
                            <div class="data-label">
                                メール
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    customer.email
                                )}
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                利用回数
                            </div>
                            <div class="data-value">
                                ${count}回
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                キャンセル回数
                            </div>
                            <div class="data-value"><span class="cancel-count${customer.cancelCount ? '' : ' is-zero'}">${customer.cancelCount}回</span></div>
                        </div>

                        <div>
                            <div class="data-label">
                                無断キャンセル回数
                            </div>
                            <div class="data-value"><span class="no-show-count${customer.noShowCount ? '' : ' is-zero'}">${customer.noShowCount}回</span></div>
                        </div>

                        <div>
                            <div class="data-label">
                                区分
                            </div>
                            <div class="data-value">
                                <span class="badge ${badge}">
                                    ${rank}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div class="data-label">
                                最終利用日
                            </div>
                            <div class="data-value">
                                ${escapeHtml(
                                    customer.lastDate
                                )}
                            </div>
                        </div>

                    </div>
                `;

                customerDetailMobileContainer
                    .appendChild(card);
            }
        });
    }

    // ダッシュボード：既存MOCK値にユーザー予約分を加算。
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 3) {
        const now = new Date(Date.now() + (9 * 60 * 60 * 1000));
        const today = now.toISOString().slice(0, 10).replace(/-/g, '/');
        const currentMonth = today.slice(0, 7);
        const todayReservations = reservations.filter((item) => item.date === today);
        const monthReservations = reservations.filter((item) => String(item.date || '').startsWith(currentMonth));
        const uniqueCustomers = new Set(reservations.map((item) => digits(item.phone) || item.email || item.name));
        const monthCustomers = new Set(monthReservations.map((item) => digits(item.phone) || item.email || item.name));

        const readNumber = (element) => Number((element?.textContent || '').replace(/\D/g, '')) || 0;
        const firstValue = statCards[0].querySelector('.stat-value');
        const firstNote = statCards[0].querySelector('.stat-note');
        const secondValue = statCards[1].querySelector('.stat-value');
        const thirdValue = statCards[2].querySelector('.stat-value');
        const thirdNote = statCards[2].querySelector('.stat-note');

        if (firstValue) firstValue.textContent = `${readNumber(firstValue) + todayReservations.length}件`;
        if (firstNote) {
            const baseParticipants = readNumber(firstNote);
            const added = todayReservations.reduce((sum, item) => sum + Number(item.participants || 0), 0);
            firstNote.textContent = `参加予定 ${baseParticipants + added}名`;
        }
        if (secondValue) secondValue.textContent = `${readNumber(secondValue) + monthReservations.length}件`;
        if (thirdValue) thirdValue.textContent = `${readNumber(thirdValue) + uniqueCustomers.size}名`;
        if (thirdNote) thirdNote.textContent = `今月の新規 ${readNumber(thirdNote) + monthCustomers.size}名`;
    }
})();
