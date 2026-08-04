(() => {
    'use strict';

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
    const digits = (value) => String(value || '').replace(/\D/g, '');
    const formatPhone = (value) => {
        const d = digits(value);
        if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
        if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
        return value || '－';
    };

    const reservations = readReservations();
    if (!reservations.length) return;

    // 予約管理：個別予約を追加。既存admin.jsが日付×便で集約する。
    const reservationBody = document.querySelector('#reservation-table tbody');
    if (reservationBody) {
        reservations.forEach((item) => {
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
                    ['メール', item.email]
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
                        lastDate:
                            item.date || ""
                    }
                );
            }

            const customer =
                customers.get(key);

            customer.useCount += 1;

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
                count >= 10
                    ? "VIP"
                    : count >= 3
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

                    <td data-editable>
                        ${rank}
                    </td>

                    <td data-editable>
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
