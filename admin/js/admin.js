document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const normalizeName = (value) => value.trim().toLowerCase().replace(/\s+/g, "");
    const normalizeDate = (value) => value.replace(/-/g, "/");
    const compareText = (a, b) => a.localeCompare(b, "ja", { numeric: true });

    const updateResultCount = (element, visibleCount, totalCount) => {
        if (!element) return;
        element.textContent = visibleCount === totalCount
            ? `全${totalCount}件を表示しています`
            : `${visibleCount}件が見つかりました`;
    };

    // ヘッダーメニュー
    const menuToggle = document.querySelector(".menu-toggle");
    const headerNav = document.querySelector(".header-nav");

    menuToggle?.addEventListener("click", () => {
        headerNav?.classList.toggle("is-open");
    });

    // 保存通知
    let toastTimer = null;
    const showSaveToast = (message = "保存しました") => {
        let toast = document.querySelector("#save-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "save-toast";
            toast.className = "save-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        if (toastTimer) window.clearTimeout(toastTimer);

        toast.classList.remove("is-show");
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => toast.classList.add("is-show"));
        });

        toastTimer = window.setTimeout(() => {
            toast.classList.remove("is-show");
        }, 3000);
    };

    // data-demo-submit を持つMOCKフォーム
    document.querySelectorAll("form[data-demo-submit]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            showSaveToast(form.dataset.demoSubmit || "保存しました");

            if (form.dataset.redirect) {
                window.setTimeout(() => {
                    location.href = form.dataset.redirect;
                }, 500);
            }
        });
    });

    // 顧客管理：検索・区分絞り込み・並び替え
    const customerTable = document.querySelector("#customer-table");
    const customerSearch = document.querySelector("#customer-search");
    const customerRank = document.querySelector("#customer-rank");
    const customerSortDirection = document.querySelector("#customer-sort-direction");
    const customerClearButton = document.querySelector("#customer-search-clear");
    const customerResultCount = document.querySelector("#customer-result-count");

    if (customerTable && customerSearch && customerRank) {
        const customerBody = customerTable.querySelector("tbody");

        const customerRows = Array.from(
            customerTable.querySelectorAll("tbody tr[data-search-row]")
        );

        const mobileContainer =
            document.querySelector(".customer-mobile-cards");

        const mobileCards = mobileContainer
            ? Array.from(
                mobileContainer.querySelectorAll("[data-customer-mobile-card]")
            )
            : [];

        const readCustomer = (element) => ({
            name: element.dataset.customerName || "",
            rank: element.dataset.customerRank || "",
            lastDate: element.dataset.customerLastDate || ""
        });

        const compareCustomers = (elementA, elementB) => {
            const a = readCustomer(elementA);
            const b = readCustomer(elementB);

            const direction =
                customerSortDirection?.value === "asc"
                    ? 1
                    : -1;

            const dateDiff =
                compareText(a.lastDate, b.lastDate);

            if (dateDiff !== 0) {
                return dateDiff * direction;
            }

            return compareText(a.name, b.name);
        };

        const matchesCustomer = (element) => {
            const data = readCustomer(element);

            const query =
                normalizeName(customerSearch.value);

            const digitsQuery =
                customerSearch.value.replace(/\D/g, "");

            const source =
                element.textContent || "";

            const normalizedSource =
                normalizeName(source);

            const matchesText =
                !query ||
                normalizedSource.includes(query) ||
                (
                    digitsQuery &&
                    source
                        .replace(/\D/g, "")
                        .includes(digitsQuery)
                );

            const matchesRank =
                !customerRank.value ||
                data.rank === customerRank.value;

            return matchesText && matchesRank;
        };

        const refreshCustomers = () => {
            customerRows
                .sort(compareCustomers)
                .forEach((row) => {
                    customerBody.appendChild(row);
                });

            if (mobileContainer) {
                mobileCards
                    .sort(compareCustomers)
                    .forEach((card) => {
                        mobileContainer.appendChild(card);
                    });
            }

            let visibleCount = 0;

            customerRows.forEach((row) => {
                const matches =
                    matchesCustomer(row);

                row.hidden = !matches;

                if (matches) {
                    visibleCount += 1;
                }
            });

            mobileCards.forEach((card) => {
                card.hidden =
                    !matchesCustomer(card);
            });

            updateResultCount(
                customerResultCount,
                visibleCount,
                customerRows.length
            );
        };

        customerSearch.addEventListener(
            "input",
            refreshCustomers
        );

        customerRank.addEventListener(
            "change",
            refreshCustomers
        );

        customerSortDirection?.addEventListener(
            "change",
            refreshCustomers
        );

        customerClearButton?.addEventListener(
            "click",
            () => {
                customerSearch.value = "";
                customerRank.value = "";

                if (customerSortDirection) {
                    customerSortDirection.value =
                        "desc";
                }

                refreshCustomers();
                customerSearch.focus();
            }
        );

        refreshCustomers();
    }


    // 顧客詳細：検索・区分絞り込み・並び替え
    const customerDetailTable =
        document.querySelector("#customer-detail-table");

    const customerDetailSearch =
        document.querySelector("#customer-detail-search");

    const customerDetailRank =
        document.querySelector("#customer-detail-rank");

    const customerDetailSortDirection =
        document.querySelector("#customer-detail-sort-direction");

    const customerDetailClearButton =
        document.querySelector("#customer-detail-search-clear");

    const customerDetailResultCount =
        document.querySelector("#customer-detail-result-count");

    if (
        customerDetailTable &&
        customerDetailSearch &&
        customerDetailRank
    ) {
        const detailBody =
            customerDetailTable.querySelector("tbody");

        const customerDetailRows = Array.from(
            customerDetailTable.querySelectorAll(
                "tbody tr[data-customer-detail-row]"
            )
        );

        const mobileContainer =
            document.querySelector(
                ".customer-detail-mobile-cards"
            );

        const mobileCards = mobileContainer
            ? Array.from(
                mobileContainer.querySelectorAll(
                    "[data-customer-detail-mobile-card]"
                )
            )
            : [];

        const readCustomerDetail = (element) => ({
            name: element.dataset.customerName || "",
            rank: element.dataset.customerRank || "",
            lastDate:
                element.dataset.customerLastDate || ""
        });

        const compareCustomerDetails =
            (elementA, elementB) => {
                const a =
                    readCustomerDetail(elementA);

                const b =
                    readCustomerDetail(elementB);

                const direction =
                    customerDetailSortDirection
                        ?.value === "asc"
                        ? 1
                        : -1;

                const dateDiff =
                    compareText(
                        a.lastDate,
                        b.lastDate
                    );

                if (dateDiff !== 0) {
                    return dateDiff * direction;
                }

                return compareText(
                    a.name,
                    b.name
                );
            };

        const matchesCustomerDetail =
            (element) => {
                const data =
                    readCustomerDetail(element);

                const query =
                    normalizeName(
                        customerDetailSearch.value
                    );

                const digitsQuery =
                    customerDetailSearch.value
                        .replace(/\D/g, "");

                const source =
                    element.textContent || "";

                const matchesText =
                    !query ||
                    normalizeName(source)
                        .includes(query) ||
                    (
                        digitsQuery &&
                        source
                            .replace(/\D/g, "")
                            .includes(digitsQuery)
                    );

                const matchesRank =
                    !customerDetailRank.value ||
                    data.rank ===
                        customerDetailRank.value;

                return (
                    matchesText &&
                    matchesRank
                );
            };

        const refreshCustomerDetails = () => {
            customerDetailRows
                .sort(compareCustomerDetails)
                .forEach((row) => {
                    detailBody.appendChild(row);
                });

            if (mobileContainer) {
                mobileCards
                    .sort(compareCustomerDetails)
                    .forEach((card) => {
                        mobileContainer
                            .appendChild(card);
                    });
            }

            let visibleCount = 0;

            customerDetailRows.forEach((row) => {
                const matches =
                    matchesCustomerDetail(row);

                row.hidden = !matches;

                if (matches) {
                    visibleCount += 1;
                }
            });

            mobileCards.forEach((card) => {
                card.hidden =
                    !matchesCustomerDetail(card);
            });

            updateResultCount(
                customerDetailResultCount,
                visibleCount,
                customerDetailRows.length
            );
        };

        customerDetailSearch.addEventListener(
            "input",
            refreshCustomerDetails
        );

        customerDetailRank.addEventListener(
            "change",
            refreshCustomerDetails
        );

        customerDetailSortDirection
            ?.addEventListener(
                "change",
                refreshCustomerDetails
            );

        customerDetailClearButton
            ?.addEventListener(
                "click",
                () => {
                    customerDetailSearch.value =
                        "";

                    customerDetailRank.value =
                        "";

                    if (
                        customerDetailSortDirection
                    ) {
                        customerDetailSortDirection
                            .value = "desc";
                    }

                    refreshCustomerDetails();
                    customerDetailSearch.focus();
                }
            );

        refreshCustomerDetails();
    }

// 予約一覧：日付 × 便ごとに集約して表示
const reservationTable = document.querySelector("#reservation-table");
const reservationDate = document.querySelector("#reservation-date");
const reservationCourse = document.querySelector("#reservation-course");
const reservationShip = document.querySelector("#reservation-ship");
const reservationGuests = document.querySelector("#reservation-guests");
const reservationSortDirection = document.querySelector("#reservation-sort-direction");
const reservationClearButton = document.querySelector("#reservation-search-clear");
const reservationResultCount = document.querySelector("#reservation-result-count");
const reservationPrintLink = document.querySelector("#reservation-print-link");
const reservationDetailLink = document.querySelector("#reservation-detail-link");

const buildPrintUrl = () => {
    const params = new URLSearchParams();

    if (reservationDate?.value) {
        params.set("date", reservationDate.value);
    }

    if (reservationCourse?.value) {
        params.set("course", reservationCourse.value);
    }

    if (reservationShip?.value) {
        params.set("ship", reservationShip.value);
    }

    if (reservationGuests?.value.trim()) {
        params.set("guests", reservationGuests.value.trim());
    }

    const queryString = params.toString();

    return queryString
        ? `adminReservationDetailPrint.html?${queryString}`
        : "adminReservationDetailPrint.html";
};


if (
    reservationTable &&
    reservationDate &&
    reservationCourse &&
    reservationShip &&
    reservationGuests
) {
    const reservationBody = reservationTable.querySelector("tbody");

    // HTMLに書かれている予約データを取得
    const originalRows = Array.from(
        reservationTable.querySelectorAll("tbody tr[data-search-row]")
    );

    // 日付 × 便ごとに人数を集約
    const groupedReservations = new Map();

    originalRows.forEach((row) => {

        const cells = row.querySelectorAll("td");

        const date =
            cells[0]?.textContent.trim() || "";

        const course =
            row.dataset.course || cells[1]?.textContent.trim() || "";

        const ship =
            row.dataset.ship || (cells.length >= 5 ? cells[2]?.textContent.trim() : "未設定") || "未設定";

        const guests =
            Number(row.dataset.guests || (cells.length >= 5 ? cells[3]?.textContent : cells[2]?.textContent)?.replace(/\D/g, "")) || 0;

        const tripId = row.dataset.tripId || "";
        const remaining = Number(row.dataset.remaining || 0);
        const key = `${date}_${course}_${ship}`;


        if (!groupedReservations.has(key)) {

            groupedReservations.set(key, {
                date: date,
                course: course,
                ship: ship,
                tripId: tripId,
                remaining: remaining,
                guests: 0
            });

        }


        groupedReservations.get(key).guests += guests;

    });


    // 元の行を削除
    reservationBody.innerHTML = "";


    // 集約後の行を作成
    const reservationRows = Array.from(
        groupedReservations.values()
    ).map((reservation) => {

        const row = document.createElement("tr");

        row.dataset.searchRow = "";
        row.dataset.date = reservation.date;
        row.dataset.course = reservation.course;
        row.dataset.ship = reservation.ship;
        row.dataset.tripId = reservation.tripId;
        row.dataset.remaining = reservation.remaining;
        row.dataset.guests = reservation.guests;

        const detailParams = new URLSearchParams({
            date: reservation.date.replaceAll("/", "-"),
            course: reservation.course,
            ship: reservation.ship
        });
        const phoneAction = reservation.remaining > 0
            ? `<a class="btn btn-secondary btn-sm" href="adminPhoneReservation.html?tripId=${encodeURIComponent(reservation.tripId)}">電話予約</a>`
            : '<span class="badge badge-orange">満員</span>';

        row.innerHTML = `
            <td>${reservation.date}</td>
            <td>${reservation.course}</td>
            <td>${reservation.ship}</td>
            <td>${reservation.guests}名</td>
            <td><div class="actions">
                ${phoneAction}
                <a class="btn btn-primary btn-sm" href="adminReservationDetail.html?${detailParams.toString()}">この船の詳細</a>
            </div></td>
        `;


        reservationBody.appendChild(row);


        return row;

    });


    // 行データ取得
    const readReservation = (row) => {

        return {

            date:
                row.dataset.date || "",

            course:
                row.dataset.course || "",

            ship:
                row.dataset.ship || "",

            guests:
                Number(row.dataset.guests || 0)

        };

    };


    // 並び替え
    const compareRows = (rowA, rowB) => {

        const a = readReservation(rowA);
        const b = readReservation(rowB);


        const direction =
            reservationSortDirection?.value === "asc"
                ? 1
                : -1;


        // 日付
        const dateDiff =
            compareText(a.date, b.date);

        if (dateDiff !== 0) {
            return dateDiff * direction;
        }


        // 便
        const courseDiff =
            compareText(a.course, b.course);

        if (courseDiff !== 0) {
            return courseDiff * direction;
        }

        const shipDiff = compareText(a.ship, b.ship);
        if (shipDiff !== 0) {
            return shipDiff * direction;
        }


        return 0;

    };


    // 検索・表示更新
    const refreshReservations = () => {

        // 並び替え
        reservationRows
            .sort(compareRows)
            .forEach((row) => {
                reservationBody.appendChild(row);
            });


        const selectedDate =
            normalizeDate(reservationDate.value);

        const selectedCourse =
            reservationCourse.value;

        const selectedShip =
            reservationShip.value;

        const enteredGuests =
            reservationGuests.value.trim();


        let visibleCount = 0;


        reservationRows.forEach((row) => {

            const data =
                readReservation(row);


            const matchesDate =
                !selectedDate ||
                data.date === selectedDate;


            const matchesCourse =
                !selectedCourse ||
                data.course === selectedCourse;


            const matchesGuests =
                !enteredGuests ||
                data.guests === Number(enteredGuests);

            const matchesShip =
                !selectedShip ||
                data.ship === selectedShip;


            const matches =
                matchesDate &&
                matchesCourse &&
                matchesShip &&
                matchesGuests;


            row.hidden = !matches;


            if (matches) {
                visibleCount++;
            }

        });


        updateResultCount(
            reservationResultCount,
            visibleCount,
            reservationRows.length
        );


        if (reservationPrintLink) {

            reservationPrintLink.href =
                buildPrintUrl();

        }

        if (reservationDetailLink) {
            const params = new URLSearchParams();
            if (reservationDate.value) params.set("date", reservationDate.value);
            if (reservationCourse.value) params.set("course", reservationCourse.value);
            if (reservationShip.value) params.set("ship", reservationShip.value);
            const query = params.toString();
            reservationDetailLink.href = query
                ? `adminReservationDetail.html?${query}`
                : "adminReservationDetail.html";
        }

    };


    // 検索イベント
    reservationDate.addEventListener(
        "change",
        refreshReservations
    );


    reservationCourse.addEventListener(
        "change",
        refreshReservations
    );

    reservationShip.addEventListener(
        "change",
        refreshReservations
    );


    reservationGuests.addEventListener(
        "input",
        refreshReservations
    );


    reservationSortDirection?.addEventListener(
        "change",
        refreshReservations
    );


    // 条件クリア
    reservationClearButton?.addEventListener(
        "click",
        () => {

            reservationDate.value = "";
            reservationCourse.value = "";
            reservationShip.value = "";
            reservationGuests.value = "";


            if (reservationSortDirection) {
                reservationSortDirection.value = "asc";
            }


            refreshReservations();


            reservationDate.focus();

        }
    );


    // 初回表示
    refreshReservations();

}
    // 予約一覧（印刷用）の絞り込み
    const printReservationTable = document.querySelector("#print-reservation-table");
    const printFilterSummary = document.querySelector("#print-filter-summary");
    const printEmptyMessage = document.querySelector("#print-empty-message");

    if (printReservationTable) {
        const params = new URLSearchParams(location.search);
        const selectedDate = normalizeDate(params.get("date") || "");
        const selectedCourse = params.get("course") || "";
        const selectedShip = params.get("ship") || "";
        const enteredGuests = (params.get("guests") || "").trim();
        const enteredName = normalizeName(params.get("name") || "");
        const sortDirection = params.get("sort") === "asc" ? "asc" : "desc";
        const printRows = Array.from(printReservationTable.querySelectorAll("tbody tr[data-print-row]"));
        let visibleCount = 0;

        printRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            const rowDate = cells[0]?.textContent.trim() || "";
            const rowCourse = cells[1]?.textContent.trim() || "";
            const rowShip = cells[2]?.textContent.trim() || "";
            const rowName = normalizeName(cells[3]?.textContent.trim() || "");
            const rowGuests = cells[4]?.textContent.replace(/\D/g, "") || "";
            const matches =
                (!selectedDate || rowDate === selectedDate) &&
                (!selectedCourse || rowCourse === selectedCourse) &&
                (!selectedShip || rowShip === selectedShip) &&
                (!enteredGuests || rowGuests === enteredGuests) &&
                (!enteredName || rowName.includes(enteredName));

            row.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        const printBody = printReservationTable.querySelector("tbody");
        printRows
            .sort((rowA, rowB) => {
                const a = rowA.querySelectorAll("td");
                const b = rowB.querySelectorAll("td");
                const direction = sortDirection === "asc" ? 1 : -1;
                for (const index of [0, 1, 2, 3]) {
                    const diff = compareText(a[index]?.textContent.trim() || "", b[index]?.textContent.trim() || "");
                    if (diff !== 0) return diff * direction;
                }
                return 0;
            })
            .forEach((row) => printBody?.appendChild(row));

        if (printFilterSummary) {
            const conditions = [];
            if (selectedDate) conditions.push(`予約日：${selectedDate}`);
            if (selectedCourse) conditions.push(`便：${selectedCourse}`);
            if (selectedShip) conditions.push(`船名：${selectedShip}`);
            if (enteredGuests) conditions.push(`人数：${enteredGuests}名`);
            if (enteredName) conditions.push(`氏名：${params.get("name")}`);

            printFilterSummary.textContent = conditions.length
                ? `絞り込み条件：${conditions.join(" / ")}（${visibleCount}件）`
                : `全${visibleCount}件を印刷対象として表示しています`;
        }

        if (printEmptyMessage) printEmptyMessage.hidden = visibleCount !== 0;
    }

    document.querySelector("#print-button")?.addEventListener("click", () => window.print());
    document.querySelector("#print-back-button")?.addEventListener("click", () => history.back());

    // 出船一覧の検索
    const tripTable = document.querySelector("#trip-table");
    const tripDate = document.querySelector("#trip-date");
    const tripCourse = document.querySelector("#trip-course");
    const tripShip = document.querySelector("#trip-ship");
    const tripCaptain = document.querySelector("#trip-captain");
    const tripStatus = document.querySelector("#trip-status");
    const tripClearButton = document.querySelector("#trip-search-clear");
    const tripResultCount = document.querySelector("#trip-result-count");

    if (tripTable && tripDate && tripCourse && tripShip && tripCaptain && tripStatus) {
        const tripRows = Array.from(tripTable.querySelectorAll("tbody tr[data-search-row]"));

        const refreshTrips = () => {
            const selectedDate = normalizeDate(tripDate.value);
            const selectedCourse = tripCourse.value;
            const selectedShip = tripShip.value;
            const selectedCaptain = tripCaptain.value;
            const selectedStatus = tripStatus.value;
            let visibleCount = 0;

            tripRows.forEach((row) => {
                const cells = row.querySelectorAll("td");
                const statusElement = cells[6]?.querySelector("[data-status]");
                const rowStatus = statusElement?.dataset.status || cells[6]?.textContent.trim() || "";
                const matches =
                    (!selectedDate || cells[0]?.textContent.trim() === selectedDate) &&
                    (!selectedCourse || cells[1]?.textContent.trim() === selectedCourse) &&
                    (!selectedShip || cells[2]?.textContent.trim() === selectedShip) &&
                    (!selectedCaptain || cells[3]?.textContent.trim() === selectedCaptain) &&
                    (!selectedStatus || rowStatus === selectedStatus);

                row.hidden = !matches;
                if (matches) visibleCount += 1;
            });

            updateResultCount(tripResultCount, visibleCount, tripRows.length);
        };

        [tripDate, tripCourse, tripShip, tripCaptain, tripStatus].forEach((control) => {
            control.addEventListener("change", refreshTrips);
        });

        tripClearButton?.addEventListener("click", () => {
            [tripDate, tripCourse, tripShip, tripCaptain, tripStatus].forEach((control) => {
                control.value = "";
            });
            refreshTrips();
            tripDate.focus();
        });

        refreshTrips();
    }

    // 予約詳細：日付・便・船名を指定して対象の予約だけを表示
    const detailTable = document.querySelector("#reservation-detail-table");
    const detailSearchDate = document.querySelector("#detail-search-date");
    const detailSearchCourse = document.querySelector("#detail-search-course");
    const detailSearchShip = document.querySelector("#detail-search-ship");
    const detailSearchName = document.querySelector("#detail-search-name");
    const detailSortDirection = document.querySelector("#detail-sort-direction");
    const detailClearButton = document.querySelector("#detail-search-clear");
    const detailResultCount = document.querySelector("#detail-result-count");
    const detailPrintLink = document.querySelector("#reservation-detail-print-link");

    if (detailTable && detailSearchDate && detailSearchCourse && detailSearchShip && detailSearchName) {
        const detailBody = detailTable.querySelector("tbody");
        const detailRows = Array.from(detailTable.querySelectorAll("tbody tr[data-detail-search-row]"));
        const mobileContainer = document.querySelector(".mobile-cards");
        const mobileCards = mobileContainer
            ? Array.from(mobileContainer.querySelectorAll("[data-detail-mobile-card]"))
            : [];

        const readDetail = (element) => ({
            date: element.dataset.date || "",
            course: element.dataset.course || "",
            ship: element.dataset.ship || "",
            name: element.dataset.name || ""
        });

        const compareElements = (elementA, elementB) => {
            const a = readDetail(elementA);
            const b = readDetail(elementB);
            const direction = detailSortDirection?.value === "asc" ? 1 : -1;

            // 並び順は「日付 → 便 → 船名 → 氏名」で固定し、昇順・降順だけ切り替える。
            for (const key of ["date", "course", "ship", "name"]) {
                const diff = compareText(a[key], b[key]);
                if (diff !== 0) return diff * direction;
            }
            return 0;
        };

        const matchesDetail = (element) => {
            const data = readDetail(element);
            const selectedDate = normalizeDate(detailSearchDate.value);
            const selectedCourse = detailSearchCourse.value;
            const selectedShip = detailSearchShip.value;
            const enteredName = normalizeName(detailSearchName.value);

            return (
                (!selectedDate || data.date === selectedDate) &&
                (!selectedCourse || data.course === selectedCourse) &&
                (!selectedShip || data.ship === selectedShip) &&
                (!enteredName || normalizeName(data.name).includes(enteredName))
            );
        };

        const refreshDetails = () => {
            detailRows.sort(compareElements).forEach((row) => detailBody.appendChild(row));
            if (mobileContainer) {
                mobileCards.sort(compareElements).forEach((card) => mobileContainer.appendChild(card));
            }

            let visibleCount = 0;
            detailRows.forEach((row) => {
                const matches = matchesDetail(row);
                row.hidden = !matches;
                if (matches) visibleCount += 1;
            });
            mobileCards.forEach((card) => {
                card.hidden = !matchesDetail(card);
            });

            if (detailPrintLink) {
                const params = new URLSearchParams();
                if (detailSearchDate.value) params.set("date", detailSearchDate.value);
                if (detailSearchCourse.value) params.set("course", detailSearchCourse.value);
                if (detailSearchShip.value) params.set("ship", detailSearchShip.value);
                if (detailSearchName.value.trim()) params.set("name", detailSearchName.value.trim());
                if (detailSortDirection?.value) params.set("sort", detailSortDirection.value);
                const query = params.toString();
                detailPrintLink.href = query
                    ? `adminReservationDetailPrint.html?${query}`
                    : "adminReservationDetailPrint.html";
            }

            updateResultCount(detailResultCount, visibleCount, detailRows.length);
        };

        detailSearchDate.addEventListener("change", refreshDetails);
        detailSearchCourse.addEventListener("change", refreshDetails);
        detailSearchShip.addEventListener("change", refreshDetails);
        detailSearchName.addEventListener("input", refreshDetails);
        detailSortDirection?.addEventListener("change", refreshDetails);

        detailClearButton?.addEventListener("click", () => {
            detailSearchDate.value = "";
            detailSearchCourse.value = "";
            detailSearchShip.value = "";
            detailSearchName.value = "";
            if (detailSortDirection) detailSortDirection.value = "desc";
            refreshDetails();
            detailSearchDate.focus();
        });

        const detailParams = new URLSearchParams(location.search);
        detailSearchDate.value = detailParams.get("date") || "";
        detailSearchCourse.value = detailParams.get("course") || "";
        detailSearchShip.value = detailParams.get("ship") || "";
        detailSearchName.value = detailParams.get("name") || "";
        if (detailSortDirection && detailParams.get("sort") === "asc") {
            detailSortDirection.value = "asc";
        }

        refreshDetails();
    }

    const formatPhoneForEdit = (value) => {
        const d = String(value || "").replace(/\D/g, "").slice(0, 15);
        if (!d) return "";

        // 国際電話会社識別番号など、00から始まる番号は先頭4桁を独立させる。
        if (d.startsWith("00")) {
            if (d.length <= 4) return d;
            if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, -4)}-${d.slice(-4)}`;
        }

        // フリーダイヤル・ナビダイヤル等。
        if (d.startsWith("0120") || d.startsWith("0570")) {
            if (d.length <= 4) return d;
            if (d.length <= 7) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7, 10)}`;
        }
        if (d.startsWith("0800")) {
            if (d.length <= 4) return d;
            if (d.length <= 7) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7, 11)}`;
        }

        // 携帯・IP電話・M2M。
        if (/^(020|050|070|080|090)/.test(d)) {
            if (d.length <= 3) return d;
            if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
            return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
        }

        // 東京03・大阪06。
        if ((d.startsWith("03") || d.startsWith("06")) && d.length <= 10) {
            if (d.length <= 2) return d;
            if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
            return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
        }

        // 4桁市外局番。岡崎0564など、地方固定電話でよく使う形式を優先する。
        const fourDigitArea = /^(?:013[4-9]|014[2-6]|015[2-8]|016[2-7]|017[2-9]|018[2-7]|019[1-8]|022[0-9]|023[3-8]|024[0-9]|025[0-9]|026[0-9]|027[0-9]|028[0-9]|029[0-9]|042[2-9]|043[0-9]|044[0-9]|045[0-9]|046[0-9]|047[0-9]|048[0-9]|049[0-9]|052[0-9]|053[0-9]|054[0-9]|055[0-9]|056[0-9]|057[2-9]|058[0-9]|059[0-9]|072[0-9]|073[0-9]|074[0-9]|075[0-9]|076[0-9]|077[0-9]|078[0-9]|079[0-9]|082[0-9]|083[0-9]|084[0-9]|085[0-9]|086[0-9]|087[0-9]|088[0-9]|089[0-9]|092[0-9]|093[0-9]|094[0-9]|095[0-9]|096[0-9]|097[0-9]|098[0-9]|099[0-9])/;
        if (d.length <= 10 && fourDigitArea.test(d)) {
            if (d.length <= 4) return d;
            if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
            return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 10)}`;
        }

        // その他の国内固定電話は3桁市外局番として扱う。
        if (d.startsWith("0") && d.length <= 10) {
            if (d.length <= 3) return d;
            if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
            return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
        }

        // 先頭が2〜9の番号も入力自体は許容し、末尾4桁を加入者番号として整形する。
        if (/^[2-9]/.test(d)) {
            if (d.length <= 4) return d;
            if (d.length <= 8) return `${d.slice(0, d.length - 4)}-${d.slice(-4)}`;
            return `${d.slice(0, d.length - 8)}-${d.slice(-8, -4)}-${d.slice(-4)}`;
        }

        return d;
    };

    const getCustomerRank = (count) => {
        const n = Number(count) || 0;
        if (n >= 6) return "VIP";
        if (n >= 2) return "常連";
        return "新規";
    };

    // 行編集内容をMOCK上でも再読込後に保持する。
    const rowEditStorageKey = `horyomaruAdminRowEdits:${location.pathname}`;
    const editableRows = [...document.querySelectorAll('[data-edit-row]')]
        .map((button) => button.closest('tr'))
        .filter(Boolean);
    let savedRowEdits = {};
    try { savedRowEdits = JSON.parse(localStorage.getItem(rowEditStorageKey) || '{}') || {}; }
    catch { savedRowEdits = {}; }

    editableRows.forEach((row, index) => {
        row.dataset.editStorageIndex = String(index);
        const values = savedRowEdits[index];
        if (!Array.isArray(values)) return;
        row.querySelectorAll('td[data-editable]').forEach((cell, cellIndex) => {
            if (values[cellIndex] !== undefined) cell.textContent = values[cellIndex];
        });
    });

    const persistEditedRow = (row) => {
        const index = row.dataset.editStorageIndex;
        if (index === undefined) return;
        savedRowEdits[index] = [...row.querySelectorAll('td[data-editable]')]
            .map((cell) => cell.textContent.trim());
        localStorage.setItem(rowEditStorageKey, JSON.stringify(savedRowEdits));
    };

    // 行ごとの修正・保存
    document.querySelectorAll("[data-edit-row]").forEach((button) => {
        button.addEventListener("click", () => {
            const row = button.closest("tr");
            if (!row) return;

            const isEditing = button.dataset.editing === "true";
            const editableCells = [...row.querySelectorAll("td[data-editable]")];
            const isCustomerDetail = row.matches("[data-customer-detail-row]");
            const isReservationDetail = row.matches("[data-detail-search-row]");

            if (!isEditing) {
                editableCells.forEach((cell, index) => {
                    let input;

                    if (isReservationDetail && index === 1) {
                        input = document.createElement("select");
                        input.className = "table-edit-input";
                        ["半夜便", "深夜便"].forEach((course) => {
                            const option = document.createElement("option");
                            option.value = course;
                            option.textContent = course;
                            if (cell.textContent.trim() === course) option.selected = true;
                            input.appendChild(option);
                        });
                    } else {
                        input = document.createElement("input");
                        input.className = "table-edit-input";
                    }
                    input.setAttribute("aria-label", `編集項目${index + 1}`);

                    if (isReservationDetail && index === 0) {
                        input.type = "date";
                        input.value = cell.textContent.trim().replaceAll("/", "-");
                    } else if (isReservationDetail && index === 1) {
                        // 便は上で半夜便・深夜便のプルダウンを生成済み。
                    } else if (isReservationDetail && index === 4) {
                        input.type = "number";
                        input.min = "1";
                        input.step = "1";
                        input.value = cell.textContent.replace(/\D/g, "") || "1";
                        const wrap = document.createElement("span");
                        wrap.className = "table-edit-with-unit";
                        const unit = document.createElement("span");
                        unit.className = "table-edit-unit";
                        unit.textContent = "名";
                        wrap.append(input, unit);
                        cell.replaceChildren(wrap);
                        return;
                    } else if (isReservationDetail && index === 5) {
                        input.type = "number";
                        input.min = "0";
                        input.step = "1";
                        input.value = cell.textContent.trim() === "なし" ? "0" : (cell.textContent.replace(/\D/g, "") || "0");
                        const wrap = document.createElement("span");
                        wrap.className = "table-edit-with-unit";
                        const unit = document.createElement("span");
                        unit.className = "table-edit-unit";
                        unit.textContent = "本";
                        wrap.append(input, unit);
                        cell.replaceChildren(wrap);
                        return;
                    } else if (isReservationDetail && index === 6) {
                        input.type = "tel";
                        input.inputMode = "numeric";
                        input.value = formatPhoneForEdit(cell.textContent.trim());
                        input.addEventListener("input", () => { input.value = formatPhoneForEdit(input.value); });
                    } else if (isReservationDetail && index === 7) {
                        input.type = "email";
                        input.value = cell.textContent.trim() === "－" ? "" : cell.textContent.trim();
                    } else if (isCustomerDetail && index === 2) {
                        input.type = "tel";
                        input.inputMode = "numeric";
                        input.value = formatPhoneForEdit(cell.textContent.trim());
                        input.addEventListener("input", () => {
                            input.value = formatPhoneForEdit(input.value);
                        });
                    } else if (isCustomerDetail && index === 3) {
                        input.type = "email";
                        input.value = cell.textContent.trim();
                        input.required = true;
                    } else if (isCustomerDetail && index === 4) {
                        input.type = "number";
                        input.min = "1";
                        input.step = "1";
                        input.value = cell.textContent.replace(/\D/g, "") || "1";
                        const wrap = document.createElement("span");
                        wrap.className = "table-edit-with-unit";
                        const unit = document.createElement("span");
                        unit.className = "table-edit-unit";
                        unit.textContent = "回";
                        wrap.append(input, unit);
                        cell.replaceChildren(wrap);
                        return;
                    } else {
                        input.type = "text";
                        input.value = cell.textContent.trim();
                    }

                    cell.replaceChildren(input);
                });

                row.classList.add("is-editing");
                button.dataset.editing = "true";
                button.textContent = "保存";
                const firstInput = row.querySelector(".table-edit-input");
                firstInput?.focus();
                firstInput?.select();
                return;
            }

            if (isReservationDetail) {
                const inputs = editableCells.map((cell) => cell.querySelector(".table-edit-input"));
                const emailInput = inputs[7];
                if (emailInput?.value && (!emailInput.value.includes("@") || !emailInput.checkValidity())) {
                    alert("メールアドレスは @ を含む正しい形式で入力してください。");
                    emailInput.focus();
                    return;
                }

                const participantCount = Math.max(1, Number.parseInt(inputs[4]?.value || "1", 10) || 1);
                const rodCount = Math.max(0, Number.parseInt(inputs[5]?.value || "0", 10) || 0);
                if (inputs[6]) inputs[6].value = formatPhoneForEdit(inputs[6].value);

                editableCells.forEach((cell, index) => {
                    const input = cell.querySelector(".table-edit-input");
                    if (!input) return;
                    if (index === 0) cell.textContent = input.value.replaceAll("-", "/");
                    else if (index === 4) cell.textContent = `${participantCount}名`;
                    else if (index === 5) cell.textContent = rodCount > 0 ? `${rodCount}本` : "なし";
                    else cell.textContent = input.value.trim();
                });
            } else if (isCustomerDetail) {
                const inputs = editableCells.map((cell) => cell.querySelector(".table-edit-input"));
                const phoneInput = inputs[2];
                const emailInput = inputs[3];
                const countInput = inputs[4];

                if (emailInput && (!emailInput.value.includes("@") || !emailInput.checkValidity())) {
                    alert("メールアドレスは @ を含む正しい形式で入力してください。");
                    emailInput.focus();
                    return;
                }

                const useCount = Math.max(1, Number.parseInt(countInput?.value || "1", 10) || 1);
                if (phoneInput) phoneInput.value = formatPhoneForEdit(phoneInput.value);
                if (countInput) countInput.value = String(useCount);

                editableCells.forEach((cell, index) => {
                    const input = cell.querySelector(".table-edit-input");
                    if (!input) return;
                    cell.textContent = index === 4 ? `${useCount}回` : input.value.trim();
                });

                const allCells = row.querySelectorAll("td");
                const rank = getCustomerRank(useCount);
                if (allCells[8]) allCells[8].textContent = rank;
                row.dataset.customerName = editableCells[0]?.textContent.trim() || "";
                row.dataset.customerRank = rank;

                const customerId = row.dataset.customerId;
                const mobileCard = customerId
                    ? document.querySelector(`[data-customer-detail-mobile-card][data-customer-id="${customerId}"]`)
                    : null;
                if (mobileCard) {
                    mobileCard.dataset.customerName = row.dataset.customerName;
                    mobileCard.dataset.customerRank = rank;
                    const values = mobileCard.querySelectorAll(".data-value");
                    if (values[1]) values[1].textContent = editableCells[0]?.textContent.trim() || "";
                    if (values[2]) values[2].textContent = editableCells[1]?.textContent.trim() || "";
                    if (values[3]) values[3].textContent = editableCells[2]?.textContent.trim() || "";
                    if (values[4]) values[4].textContent = editableCells[3]?.textContent.trim() || "";
                    if (values[5]) values[5].textContent = `${useCount}回`;
                    if (values[8]) values[8].textContent = rank;
                }
            } else {
                editableCells.forEach((cell) => {
                    const input = cell.querySelector(".table-edit-input");
                    if (input) cell.textContent = input.value.trim();
                });
            }

            if (row.matches("[data-detail-search-row]")) {
                const cells = row.querySelectorAll("td[data-editable]");
                row.dataset.date = cells[0]?.textContent.trim() || "";
                row.dataset.course = cells[1]?.textContent.trim() || "";
                row.dataset.name = cells[2]?.textContent.trim() || "";
            }

            row.classList.remove("is-editing");
            button.dataset.editing = "false";
            button.textContent = "修正";
            persistEditedRow(row);
            showSaveToast();
        });
    });

    // LINE配信：対象者の絞り込み・個人選択・プレビュー
    const lineForm = document.querySelector("#line-delivery-form");
    if (lineForm) {
        const appReservations = window.HoryomaruAppData?.reservations || [];
        let localReservations = [];
        try {
            const parsed = JSON.parse(localStorage.getItem("horyomaruAdminReservations") || "[]");
            localReservations = Array.isArray(parsed) ? parsed : [];
        } catch {
            localReservations = [];
        }

        const lineReservations = [...appReservations, ...localReservations];
        const normalizeDateKey = (value) => String(value || "").replaceAll("/", "-");
        const localDateKey = (date = new Date()) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        const todayKey = localDateKey();
        const lineEscapeHtml = (value) => String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        const recipientKey = (item) => String(item.email || item.phone || item.id || `${item.name}-${item.date}-${item.course}`);
        const toRecipient = (item) => ({
            key: recipientKey(item),
            name: item.name || "氏名未登録",
            phone: item.phone || "－",
            email: item.email || "－",
            date: normalizeDateKey(item.dateKey || item.date),
            course: item.course || "－"
        });

        // LINE配信で扱う顧客は「顧客管理」に表示している3人に統一する。
        const customerRecipients = [
            { id: "1001", name: "田中 太郎", phone: "090-1234-5678", useCount: 8, rank: "VIP", lastDate: "2026/07/30" },
            { id: "1002", name: "佐藤 花子", phone: "090-2345-6789", useCount: 1, rank: "新規", lastDate: "2026/07/31" },
            { id: "1003", name: "鈴木 一郎", phone: "090-3456-7890", useCount: 19, rank: "VIP", lastDate: "2026/07/25" }
        ].map((customer) => ({
            ...customer,
            key: customer.phone.replace(/\D/g, ""),
            email: lineReservations.find((item) => item.name === customer.name)?.email || "－"
        }));
        const selectedKeys = new Set();

        const targetRadios = [...lineForm.querySelectorAll('input[name="line-target-type"]')];
        const targetPanels = [...lineForm.querySelectorAll("[data-target-panel]")];
        const targetDate = document.querySelector("#line-target-date");
        const targetTrip = document.querySelector("#line-target-trip");
        const recipientSearch = document.querySelector("#line-recipient-search");
        const recipientSearchButton = document.querySelector("#line-recipient-search-button");
        const recipientResults = document.querySelector("#line-recipient-results");
        const recipientList = document.querySelector("#line-recipient-list");
        const searchCount = document.querySelector("#line-recipient-search-count");
        const checkTarget = document.querySelector("#line-check-target");
        const checkCount = document.querySelector("#line-check-count");
        const bodyInput = document.querySelector("#line-body");
        const previewButton = document.querySelector("#line-preview-button");
        const previewModal = document.querySelector("#line-preview-modal");
        const previewTarget = document.querySelector("#line-preview-target");
        const previewCount = document.querySelector("#line-preview-count");
        const previewRecipientList = document.querySelector("#line-preview-recipient-list");
        const previewBody = document.querySelector("#line-preview-body");
        const history = document.querySelector("#line-delivery-history");

        const targetLabels = {
            all: "全員",
            today: "本日の予約者",
            date: "指定日の予約者",
            trip: "指定便の予約者",
            individual: "個人指定"
        };

        const currentTargetType = () => targetRadios.find((radio) => radio.checked)?.value || "all";

        const reservationRecipients = (predicate) => {
            const reservedNames = new Set(
                lineReservations
                    .filter(predicate)
                    .map((item) => normalizeName(item.name || ""))
            );
            return customerRecipients.filter((customer) => reservedNames.has(normalizeName(customer.name)));
        };

        const selectedTripValue = (item) => `${normalizeDateKey(item.dateKey || item.date)}|${item.course || ""}`;
        const populateTrips = () => {
            if (!targetTrip) return;
            const tripMap = new Map();
            lineReservations.forEach((item) => {
                const value = selectedTripValue(item);
                if (!tripMap.has(value)) {
                    tripMap.set(value, `${normalizeDateKey(item.dateKey || item.date).replaceAll("-", "/")}　${item.course || "－"}`);
                }
            });
            const entries = [...tripMap.entries()].sort((a, b) => compareText(a[0], b[0]));
            targetTrip.innerHTML = entries.length
                ? entries.map(([value, label]) => `<option value="${lineEscapeHtml(value)}">${lineEscapeHtml(label)}</option>`).join("")
                : '<option value="">対象便がありません</option>';
            const todayTrip = entries.find(([value]) => value.startsWith(`${todayKey}|`));
            if (todayTrip) targetTrip.value = todayTrip[0];
        };

        const currentRecipients = () => {
            const type = currentTargetType();
            if (type === "today") {
                return reservationRecipients((item) => normalizeDateKey(item.dateKey || item.date) === todayKey);
            }
            if (type === "date") {
                const date = targetDate?.value || "";
                return reservationRecipients((item) => normalizeDateKey(item.dateKey || item.date) === date);
            }
            if (type === "trip") {
                const value = targetTrip?.value || "";
                return reservationRecipients((item) => selectedTripValue(item) === value);
            }
            if (type === "individual") {
                return customerRecipients.filter((recipient) => selectedKeys.has(recipient.key));
            }
            return customerRecipients;
        };

        const targetDescription = () => {
            const type = currentTargetType();
            if (type === "today") return `本日の予約者（${todayKey.replaceAll("-", "/")}）`;
            if (type === "date") return targetDate?.value ? `${targetDate.value.replaceAll("-", "/")}の予約者` : "指定日の予約者";
            if (type === "trip") return targetTrip?.selectedOptions?.[0]?.textContent || "指定便の予約者";
            if (type === "individual") return "個人指定";
            return "全員";
        };

        const rankBadgeClass = (rank) => rank === "VIP" ? "badge-orange" : rank === "常連" ? "badge-blue" : "badge-green";

        const hideRecipientResults = () => {
            if (recipientResults) recipientResults.hidden = true;
            if (recipientList) recipientList.innerHTML = "";
            if (searchCount) searchCount.textContent = "";
        };

        const renderRecipientList = () => {
            if (!recipientList || !recipientResults) return;
            const rawQuery = recipientSearch?.value.trim() || "";
            if (!rawQuery) {
                hideRecipientResults();
                return;
            }

            const query = normalizeName(rawQuery);
            const digitsQuery = rawQuery.replace(/\D/g, "");
            const visible = customerRecipients.filter((recipient) => {
                const source = `${recipient.id} ${recipient.name} ${recipient.phone}`;
                return normalizeName(source).includes(query)
                    || (digitsQuery && source.replace(/\D/g, "").includes(digitsQuery));
            });

            recipientResults.hidden = false;
            recipientList.innerHTML = visible.length
                ? visible.map((recipient) => `
                    <tr class="line-recipient-row${selectedKeys.has(recipient.key) ? " is-selected" : ""}" data-recipient-key="${lineEscapeHtml(recipient.key)}" tabindex="0" role="checkbox" aria-checked="${selectedKeys.has(recipient.key)}">
                        <td><span class="line-recipient-id"><input type="checkbox" value="${lineEscapeHtml(recipient.key)}" ${selectedKeys.has(recipient.key) ? "checked" : ""} aria-label="${lineEscapeHtml(recipient.name)}を選択">${lineEscapeHtml(recipient.id)}</span></td>
                        <td>${lineEscapeHtml(recipient.name)}</td>
                        <td>${lineEscapeHtml(recipient.phone)}</td>
                        <td>${lineEscapeHtml(recipient.useCount)}回</td>
                        <td><span class="badge ${rankBadgeClass(recipient.rank)}">${lineEscapeHtml(recipient.rank)}</span></td>
                        <td>${lineEscapeHtml(recipient.lastDate)}</td>
                    </tr>`).join("")
                : '<tr><td class="line-empty-state" colspan="6">該当する顧客がいません。</td></tr>';

            if (searchCount) searchCount.textContent = `${visible.length}件`;

            recipientList.querySelectorAll(".line-recipient-row").forEach((row) => {
                const checkbox = row.querySelector('input[type="checkbox"]');
                const toggle = () => {
                    if (!checkbox) return;
                    checkbox.checked = !checkbox.checked;
                    if (checkbox.checked) selectedKeys.add(checkbox.value);
                    else selectedKeys.delete(checkbox.value);
                    row.classList.toggle("is-selected", checkbox.checked);
                    row.setAttribute("aria-checked", String(checkbox.checked));
                    refreshAudience();
                };
                row.addEventListener("click", (event) => {
                    if (event.target === checkbox) {
                        if (checkbox.checked) selectedKeys.add(checkbox.value);
                        else selectedKeys.delete(checkbox.value);
                        row.classList.toggle("is-selected", checkbox.checked);
                        row.setAttribute("aria-checked", String(checkbox.checked));
                        refreshAudience();
                        return;
                    }
                    toggle();
                });
                row.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle();
                    }
                });
            });
        };

        function refreshAudience() {
            const recipients = currentRecipients();
            const description = targetDescription();
            if (checkTarget) checkTarget.textContent = description;
            if (checkCount) checkCount.textContent = `${recipients.length}人`;
        }

        const switchTargetPanel = () => {
            const type = currentTargetType();
            targetPanels.forEach((panel) => {
                panel.hidden = panel.dataset.targetPanel !== type;
            });
            if (type === "individual") hideRecipientResults();
            refreshAudience();
        };

        populateTrips();
        if (targetDate) targetDate.value = todayKey;
        hideRecipientResults();
        refreshAudience();

        targetRadios.forEach((radio) => radio.addEventListener("change", switchTargetPanel));
        targetDate?.addEventListener("change", refreshAudience);
        targetTrip?.addEventListener("change", refreshAudience);
        recipientSearchButton?.addEventListener("click", renderRecipientList);
        recipientSearch?.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                renderRecipientList();
            }
        });
        recipientSearch?.addEventListener("input", () => {
            if (!recipientSearch.value.trim()) hideRecipientResults();
        });

        const wrapPreviewMessage = (message, maxChars = 18) => {
            const segmenter = typeof Intl !== "undefined" && Intl.Segmenter
                ? new Intl.Segmenter("ja", { granularity: "grapheme" })
                : null;

            return String(message).split(/\r?\n/).map((line) => {
                const chars = segmenter
                    ? Array.from(segmenter.segment(line), (item) => item.segment)
                    : Array.from(line);
                const rows = [];
                for (let index = 0; index < chars.length; index += maxChars) {
                    rows.push(chars.slice(index, index + maxChars).join(""));
                }
                return rows.length ? rows.join("\n") : "";
            }).join("\n");
        };

        const openPreview = () => {
            const recipients = currentRecipients();
            if (previewTarget) previewTarget.textContent = `対象：${targetDescription()}`;
            if (previewCount) previewCount.textContent = `${recipients.length}人に配信`;
            if (previewRecipientList) {
                if (currentTargetType() === "all") {
                    previewRecipientList.innerHTML = `<li><strong>全員（${recipients.length}名）</strong></li>`;
                } else {
                    previewRecipientList.innerHTML = recipients.length
                        ? recipients.map((recipient) => `
                            <li>
                                <span class="line-preview-recipient-id">${lineEscapeHtml(recipient.id || "－")}</span>
                                <strong>${lineEscapeHtml(recipient.name)}</strong>
                            </li>`).join("")
                        : '<li class="is-empty">配信対象の顧客がいません。</li>';
                }
            }
            if (previewBody) {
                const previewMessage = bodyInput?.value.trim() || "メッセージ内容が未入力です";
                previewBody.textContent = wrapPreviewMessage(previewMessage, 18);
            }
            if (previewModal) {
                previewModal.hidden = false;
                document.body.classList.add("is-modal-open");
            }
        };
        const closePreview = () => {
            if (previewModal) previewModal.hidden = true;
            document.body.classList.remove("is-modal-open");
        };
        previewButton?.addEventListener("click", openPreview);
        document.querySelectorAll("[data-line-preview-close]").forEach((button) => button.addEventListener("click", closePreview));

        lineForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const recipients = currentRecipients();
            if (!recipients.length) {
                alert("配信対象者が0人です。対象を選択してください。");
                return;
            }
            if (!lineForm.reportValidity()) return;

            const description = targetDescription();
            if (!window.confirm(`${description}（${recipients.length}人）にLINEを配信します。よろしいですか？`)) return;
            const message = bodyInput?.value.trim() || "LINEメッセージ";
            const historyLabel = message.length > 24 ? `${message.slice(0, 24)}…` : message;
            if (history) {
                const row = document.createElement("div");
                row.className = "kpi-row";
                row.innerHTML = `<span><strong>${lineEscapeHtml(historyLabel)}</strong><small class="line-history-meta">${lineEscapeHtml(description)}・${recipients.length}人</small></span><span class="badge badge-green">送信済み</span>`;
                history.prepend(row);
            }
            showSaveToast(`LINEメッセージを${recipients.length}人に配信しました`);
        });
    }

});
