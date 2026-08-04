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

    // 顧客管理：検索・区分絞り込み
    const customerTable = document.querySelector("#customer-table");
    const customerSearch = document.querySelector("#customer-search");
    const customerRank = document.querySelector("#customer-rank");

    if (customerTable && customerSearch && customerRank) {
        const customerRows = Array.from(customerTable.querySelectorAll("tbody tr[data-search-row]"));

        const filterCustomers = () => {
            const query = normalizeName(customerSearch.value);
            const selectedRank = customerRank.value;

            customerRows.forEach((row) => {
                const cells = row.querySelectorAll("td");
                const name = normalizeName(cells[1]?.textContent || "");
                const phone = (cells[2]?.textContent || "").replace(/\D/g, "");
                const rank = cells[4]?.textContent.trim() || "";
                const normalizedQuery = query.replace(/\D/g, "");

                const matchesText = !query || name.includes(query) || (normalizedQuery && phone.includes(normalizedQuery));
                const matchesRank = !selectedRank || selectedRank === "すべて" || rank === selectedRank;
                row.hidden = !(matchesText && matchesRank);
            });
        };

        customerSearch.addEventListener("input", filterCustomers);
        customerRank.addEventListener("change", filterCustomers);
        filterCustomers();
    }

// 予約一覧：日付 × 便ごとに集約して表示
const reservationTable = document.querySelector("#reservation-table");
const reservationDate = document.querySelector("#reservation-date");
const reservationCourse = document.querySelector("#reservation-course");
const reservationGuests = document.querySelector("#reservation-guests");
const reservationSortDirection = document.querySelector("#reservation-sort-direction");
const reservationClearButton = document.querySelector("#reservation-search-clear");
const reservationResultCount = document.querySelector("#reservation-result-count");
const reservationPrintLink = document.querySelector("#reservation-print-link");

const buildPrintUrl = () => {
    const params = new URLSearchParams();

    if (reservationDate?.value) {
        params.set("date", reservationDate.value);
    }

    if (reservationCourse?.value) {
        params.set("course", reservationCourse.value);
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
            cells[1]?.textContent.trim() || "";

        const guests =
            Number(
                cells[2]?.textContent.replace(/\D/g, "")
            ) || 0;


        const key = `${date}_${course}`;


        if (!groupedReservations.has(key)) {

            groupedReservations.set(key, {
                date: date,
                course: course,
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
        row.dataset.guests = reservation.guests;


        row.innerHTML = `
            <td>${reservation.date}</td>
            <td>${reservation.course}</td>
            <td>${reservation.guests}名</td>
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


            const matches =
                matchesDate &&
                matchesCourse &&
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
            reservationGuests.value = "";


            if (reservationSortDirection) {
                reservationSortDirection.value = "desc";
            }


            refreshReservations();


            reservationDate.focus();

        }
    );


    // 初回表示
    refreshReservations();

}
            // 並び順は「日付 → 便 → 氏名」で固定し、昇順・降順だけ切り替える。
            for (const key of ["date", "course", "name"]) {
                const diff = compareText(a[key], b[key]);
                if (diff !== 0) return diff * direction;
            }
            return 0;
        };

        const refreshReservations = () => {
            reservationRows.sort(compareRows).forEach((row) => reservationBody.appendChild(row));

            const selectedDate = normalizeDate(reservationDate.value);
            const selectedCourse = reservationCourse.value;
            const enteredGuests = reservationGuests.value.trim();
            let visibleCount = 0;

            reservationRows.forEach((row) => {
                const data = readReservation(row);
                const matches =
                    (!selectedDate || data.date === selectedDate) &&
                    (!selectedCourse || data.course === selectedCourse) &&
                    (!enteredGuests || data.guests === enteredGuests);

                row.hidden = !matches;
                if (matches) visibleCount += 1;
            });

            updateResultCount(reservationResultCount, visibleCount, reservationRows.length);
            if (reservationPrintLink) reservationPrintLink.href = buildPrintUrl();
        };

        reservationDate.addEventListener("change", refreshReservations);
        reservationCourse.addEventListener("change", refreshReservations);
        reservationGuests.addEventListener("input", refreshReservations);
        reservationSortDirection?.addEventListener("change", refreshReservations);

        reservationClearButton?.addEventListener("click", () => {
            reservationDate.value = "";
            reservationCourse.value = "";
            reservationGuests.value = "";
            if (reservationSortDirection) reservationSortDirection.value = "desc";
            refreshReservations();
            reservationDate.focus();
        });

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
        const enteredGuests = (params.get("guests") || "").trim();
        const printRows = Array.from(printReservationTable.querySelectorAll("tbody tr[data-print-row]"));
        let visibleCount = 0;

        printRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            const rowDate = cells[0]?.textContent.trim() || "";
            const rowCourse = cells[1]?.textContent.trim() || "";
            const rowGuests = cells[3]?.textContent.replace(/\D/g, "") || "";
            const matches =
                (!selectedDate || rowDate === selectedDate) &&
                (!selectedCourse || rowCourse === selectedCourse) &&
                (!enteredGuests || rowGuests === enteredGuests);

            row.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        if (printFilterSummary) {
            const conditions = [];
            if (selectedDate) conditions.push(`予約日：${selectedDate}`);
            if (selectedCourse) conditions.push(`便：${selectedCourse}`);
            if (enteredGuests) conditions.push(`人数：${enteredGuests}名`);

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

    // 予約詳細：検索・並び替え（初期順：日付 → 便 → 氏名 の降順）
    const detailTable = document.querySelector("#reservation-detail-table");
    const detailSearchDate = document.querySelector("#detail-search-date");
    const detailSearchCourse = document.querySelector("#detail-search-course");
    const detailSearchName = document.querySelector("#detail-search-name");
    const detailSortDirection = document.querySelector("#detail-sort-direction");
    const detailClearButton = document.querySelector("#detail-search-clear");
    const detailResultCount = document.querySelector("#detail-result-count");

    if (detailTable && detailSearchDate && detailSearchCourse && detailSearchName) {
        const detailBody = detailTable.querySelector("tbody");
        const detailRows = Array.from(detailTable.querySelectorAll("tbody tr[data-detail-search-row]"));
        const mobileContainer = document.querySelector(".mobile-cards");
        const mobileCards = mobileContainer
            ? Array.from(mobileContainer.querySelectorAll("[data-detail-mobile-card]"))
            : [];

        const readDetail = (element) => ({
            date: element.dataset.date || "",
            course: element.dataset.course || "",
            name: element.dataset.name || ""
        });

        const compareElements = (elementA, elementB) => {
            const a = readDetail(elementA);
            const b = readDetail(elementB);
            const direction = detailSortDirection?.value === "asc" ? 1 : -1;

            // 並び順は「日付 → 便 → 氏名」で固定し、昇順・降順だけ切り替える。
            for (const key of ["date", "course", "name"]) {
                const diff = compareText(a[key], b[key]);
                if (diff !== 0) return diff * direction;
            }
            return 0;
        };

        const matchesDetail = (element) => {
            const data = readDetail(element);
            const selectedDate = normalizeDate(detailSearchDate.value);
            const selectedCourse = detailSearchCourse.value;
            const enteredName = normalizeName(detailSearchName.value);

            return (
                (!selectedDate || data.date === selectedDate) &&
                (!selectedCourse || data.course === selectedCourse) &&
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

            updateResultCount(detailResultCount, visibleCount, detailRows.length);
        };

        detailSearchDate.addEventListener("change", refreshDetails);
        detailSearchCourse.addEventListener("change", refreshDetails);
        detailSearchName.addEventListener("input", refreshDetails);
        detailSortDirection?.addEventListener("change", refreshDetails);

        detailClearButton?.addEventListener("click", () => {
            detailSearchDate.value = "";
            detailSearchCourse.value = "";
            detailSearchName.value = "";
            if (detailSortDirection) detailSortDirection.value = "desc";
            refreshDetails();
            detailSearchDate.focus();
        });

        refreshDetails();
    }

    // 行ごとの修正・保存
    document.querySelectorAll("[data-edit-row]").forEach((button) => {
        button.addEventListener("click", () => {
            const row = button.closest("tr");
            if (!row) return;

            const isEditing = button.dataset.editing === "true";
            const editableCells = row.querySelectorAll("td[data-editable]");

            if (!isEditing) {
                editableCells.forEach((cell, index) => {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.className = "table-edit-input";
                    input.value = cell.textContent.trim();
                    input.setAttribute("aria-label", `編集項目${index + 1}`);
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

            editableCells.forEach((cell) => {
                const input = cell.querySelector(".table-edit-input");
                if (input) cell.textContent = input.value.trim();
            });

            if (row.matches("[data-detail-search-row]")) {
                const cells = row.querySelectorAll("td[data-editable]");
                row.dataset.date = cells[0]?.textContent.trim() || "";
                row.dataset.course = cells[1]?.textContent.trim() || "";
                row.dataset.name = cells[2]?.textContent.trim() || "";
            }

            row.classList.remove("is-editing");
            button.dataset.editing = "false";
            button.textContent = "修正";
            showSaveToast();
        });
    });
});
