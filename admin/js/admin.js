document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------
    // 共通処理
    // -----------------------------
    const normalizeName = (value) => value.trim().toLowerCase().replace(/\s+/g, "");
    const normalizeDate = (value) => value.replace(/-/g, "/");

    const updateResultCount = (element, visibleCount, totalCount) => {
        if (!element) return;

        element.textContent = visibleCount === totalCount
            ? `全${totalCount}件を表示しています`
            : `${visibleCount}件が見つかりました`;
    };

    // -----------------------------
    // ヘッダーメニュー
    // -----------------------------
    const menuToggle = document.querySelector(".menu-toggle");
    const headerNav = document.querySelector(".header-nav");

    if (menuToggle && headerNav) {
        menuToggle.addEventListener("click", () => {
            headerNav.classList.toggle("is-open");
        });
    }

    // -----------------------------
    // 予約一覧の検索
    // -----------------------------
    const reservationTable = document.querySelector("#reservation-table");
    const reservationDate = document.querySelector("#reservation-date");
    const reservationCourse = document.querySelector("#reservation-course");
    const customerName = document.querySelector("#customer-name");
    const reservationGuests = document.querySelector("#reservation-guests");
    const reservationClearButton = document.querySelector("#reservation-search-clear");
    const reservationResultCount = document.querySelector("#reservation-result-count");
    const reservationPrintLink = document.querySelector("#reservation-print-link");

    const buildPrintUrl = () => {
        const params = new URLSearchParams();

        if (reservationDate?.value) params.set("date", reservationDate.value);
        if (reservationCourse?.value) params.set("course", reservationCourse.value);
        if (customerName?.value.trim()) params.set("name", customerName.value.trim());
        if (reservationGuests?.value.trim()) params.set("guests", reservationGuests.value.trim());

        const queryString = params.toString();
        return queryString
            ? `adminReservationDetailPrint.html?${queryString}`
            : "adminReservationDetailPrint.html";
    };

    const updatePrintLink = () => {
        if (reservationPrintLink) {
            reservationPrintLink.href = buildPrintUrl();
        }
    };

    if (reservationTable && reservationDate && reservationCourse && customerName && reservationGuests) {
        const reservationRows = Array.from(
            reservationTable.querySelectorAll("tbody tr[data-search-row]")
        );

        const searchReservations = () => {
            const selectedDate = normalizeDate(reservationDate.value);
            const selectedCourse = reservationCourse.value;
            const enteredName = normalizeName(customerName.value);
            const enteredGuests = reservationGuests.value.trim();
            let visibleCount = 0;

            reservationRows.forEach((row) => {
                const cells = row.querySelectorAll("td");
                if (cells.length < 4) return;

                const rowDate = cells[0].textContent.trim();
                const rowCourse = cells[1].textContent.trim();
                const rowName = normalizeName(cells[2].textContent);
                const rowGuests = cells[3].textContent.replace(/\D/g, "");

                const matches =
                    (!selectedDate || rowDate === selectedDate) &&
                    (!selectedCourse || rowCourse === selectedCourse) &&
                    (!enteredName || rowName.includes(enteredName)) &&
                    (!enteredGuests || rowGuests === enteredGuests);

                row.hidden = !matches;
                if (matches) visibleCount++;
            });

            updateResultCount(reservationResultCount, visibleCount, reservationRows.length);
            updatePrintLink();
        };

        reservationDate.addEventListener("change", searchReservations);
        reservationCourse.addEventListener("change", searchReservations);
        customerName.addEventListener("input", searchReservations);
        reservationGuests.addEventListener("input", searchReservations);

        reservationClearButton?.addEventListener("click", () => {
            reservationDate.value = "";
            reservationCourse.value = "";
            customerName.value = "";
            reservationGuests.value = "";
            searchReservations();
            reservationDate.focus();
        });

        searchReservations();
    }

    // -----------------------------
    // 予約一覧（印刷用）の絞り込み
    // -----------------------------
    const printReservationTable = document.querySelector("#print-reservation-table");
    const printFilterSummary = document.querySelector("#print-filter-summary");
    const printEmptyMessage = document.querySelector("#print-empty-message");

    if (printReservationTable) {
        const params = new URLSearchParams(window.location.search);
        const selectedDate = normalizeDate(params.get("date") || "");
        const selectedCourse = params.get("course") || "";
        const rawName = params.get("name") || "";
        const enteredName = normalizeName(rawName);
        const enteredGuests = (params.get("guests") || "").trim();
        const printRows = Array.from(
            printReservationTable.querySelectorAll("tbody tr[data-print-row]")
        );
        let visibleCount = 0;

        printRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length < 4) return;

            const rowDate = cells[0].textContent.trim();
            const rowCourse = cells[1].textContent.trim();
            const rowName = normalizeName(cells[2].textContent);
            const rowGuests = cells[3].textContent.replace(/\D/g, "");

            const matches =
                (!selectedDate || rowDate === selectedDate) &&
                (!selectedCourse || rowCourse === selectedCourse) &&
                (!enteredName || rowName.includes(enteredName)) &&
                (!enteredGuests || rowGuests === enteredGuests);

            row.hidden = !matches;
            if (matches) visibleCount++;
        });

        if (printFilterSummary) {
            const conditions = [];
            if (selectedDate) conditions.push(`予約日：${selectedDate}`);
            if (selectedCourse) conditions.push(`便：${selectedCourse}`);
            if (rawName) conditions.push(`顧客名：${rawName}`);
            if (enteredGuests) conditions.push(`人数：${enteredGuests}名`);

            printFilterSummary.textContent = conditions.length
                ? `絞り込み条件：${conditions.join(" / ")}（${visibleCount}件）`
                : `全${visibleCount}件を印刷対象として表示しています`;
        }

        if (printEmptyMessage) {
            printEmptyMessage.hidden = visibleCount !== 0;
        }
    }

    // -----------------------------
    // 出船一覧の検索
    // -----------------------------
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

        const searchTrips = () => {
            const selectedDate = normalizeDate(tripDate.value);
            const selectedCourse = tripCourse.value;
            const selectedShip = tripShip.value;
            const selectedCaptain = tripCaptain.value;
            const selectedStatus = tripStatus.value;
            let visibleCount = 0;

            tripRows.forEach((row) => {
                const cells = row.querySelectorAll("td");
                if (cells.length < 7) return;

                const rowDate = cells[0].textContent.trim();
                const rowCourse = cells[1].textContent.trim();
                const rowShip = cells[2].textContent.trim();
                const rowCaptain = cells[3].textContent.trim();
                const statusElement = cells[6].querySelector("[data-status]");
                const rowStatus = statusElement
                    ? statusElement.dataset.status
                    : cells[6].textContent.trim();

                const matches =
                    (!selectedDate || rowDate === selectedDate) &&
                    (!selectedCourse || rowCourse === selectedCourse) &&
                    (!selectedShip || rowShip === selectedShip) &&
                    (!selectedCaptain || rowCaptain === selectedCaptain) &&
                    (!selectedStatus || rowStatus === selectedStatus);

                row.hidden = !matches;
                if (matches) visibleCount++;
            });

            updateResultCount(tripResultCount, visibleCount, tripRows.length);
        };

        tripDate.addEventListener("change", searchTrips);
        tripCourse.addEventListener("change", searchTrips);
        tripShip.addEventListener("change", searchTrips);
        tripCaptain.addEventListener("change", searchTrips);
        tripStatus.addEventListener("change", searchTrips);

        tripClearButton?.addEventListener("click", () => {
            tripDate.value = "";
            tripCourse.value = "";
            tripShip.value = "";
            tripCaptain.value = "";
            tripStatus.value = "";
            searchTrips();
            tripDate.focus();
        });

        searchTrips();
    }

    // -----------------------------
    // 保存通知
    // -----------------------------
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

    // -----------------------------
    // 行ごとの修正・保存
    // -----------------------------
    document.querySelectorAll("[data-edit-row]").forEach((button) => {
        button.addEventListener("click", () => {
            const row = button.closest("tr");
            if (!row) return;

            const isEditing = button.dataset.editing === "true";
            const editableCells = row.querySelectorAll("td[data-editable]");

            if (!isEditing) {
                editableCells.forEach((cell, index) => {
                    const value = cell.textContent.trim();
                    const input = document.createElement("input");

                    input.type = "text";
                    input.className = "table-edit-input";
                    input.value = value;
                    input.dataset.originalValue = value;
                    input.setAttribute("aria-label", `編集項目${index + 1}`);

                    cell.textContent = "";
                    cell.appendChild(input);
                });

                row.classList.add("is-editing");
                button.dataset.editing = "true";
                button.textContent = "保存";

                const firstInput = row.querySelector(".table-edit-input");
                if (firstInput) {
                    firstInput.focus();
                    firstInput.select();
                }
                return;
            }

            editableCells.forEach((cell) => {
                const input = cell.querySelector(".table-edit-input");
                if (input) cell.textContent = input.value.trim();
            });

            row.classList.remove("is-editing");
            button.dataset.editing = "false";
            button.textContent = "修正";
            showSaveToast();
        });
    });
});
