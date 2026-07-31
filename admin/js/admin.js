document.addEventListener("DOMContentLoaded", () => {
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
    // 共通処理
    // -----------------------------
    const normalizeName = (value) => {
        return value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");
    };

    const normalizeDate = (value) => {
        return value.replace(/-/g, "/");
    };

    // -----------------------------
    // 予約一覧の検索
    // -----------------------------
    const reservationTable =
        document.querySelector("#reservation-table");

    const reservationDate =
        document.querySelector("#reservation-date");

    const reservationCourse =
        document.querySelector("#reservation-course");

    const customerName =
        document.querySelector("#customer-name");

    const reservationGuests =
        document.querySelector("#reservation-guests");

    const reservationClearButton =
        document.querySelector("#reservation-search-clear");

    const reservationResultCount =
        document.querySelector("#reservation-result-count");

    const reservationPrintLink =
        document.querySelector("#reservation-print-link");

    const buildPrintUrl = () => {
        const params = new URLSearchParams();

        if (reservationDate && reservationDate.value) {
            params.set("date", reservationDate.value);
        }

        if (reservationCourse && reservationCourse.value) {
            params.set("course", reservationCourse.value);
        }

        if (customerName && customerName.value.trim()) {
            params.set("name", customerName.value.trim());
        }

        if (
            reservationGuests &&
            reservationGuests.value.trim()
        ) {
            params.set(
                "guests",
                reservationGuests.value.trim()
            );
        }

        const queryString = params.toString();

        if (queryString) {
            return `adminReservationDetailPrint.html?${queryString}`;
        }

        return "adminReservationDetailPrint.html";
    };

    const updatePrintLink = () => {
        if (reservationPrintLink) {
            reservationPrintLink.href = buildPrintUrl();
        }
    };

    if (
        reservationTable &&
        reservationDate &&
        reservationCourse &&
        customerName &&
        reservationGuests
    ) {
        const reservationRows = Array.from(
            reservationTable.querySelectorAll(
                "tbody tr[data-search-row]"
            )
        );

        const searchReservations = () => {
            const selectedDate = normalizeDate(
                reservationDate.value
            );

            const selectedCourse =
                reservationCourse.value;

            const enteredName = normalizeName(
                customerName.value
            );

            const enteredGuests =
                reservationGuests.value.trim();

            let visibleCount = 0;

            reservationRows.forEach((row) => {
                const cells =
                    row.querySelectorAll("td");

                if (cells.length < 4) {
                    return;
                }

                const rowDate =
                    cells[0].textContent.trim();

                const rowCourse =
                    cells[1].textContent.trim();

                const rowName = normalizeName(
                    cells[2].textContent
                );

                const rowGuests =
                    cells[3].textContent.replace(
                        /\D/g,
                        ""
                    );

                const matchesDate =
                    selectedDate === "" ||
                    rowDate === selectedDate;

                const matchesCourse =
                    selectedCourse === "" ||
                    rowCourse === selectedCourse;

                const matchesName =
                    enteredName === "" ||
                    rowName.includes(enteredName);

                const matchesGuests =
                    enteredGuests === "" ||
                    rowGuests === enteredGuests;

                const matches =
                    matchesDate &&
                    matchesCourse &&
                    matchesName &&
                    matchesGuests;

                row.hidden = !matches;

                if (matches) {
                    visibleCount++;
                }
            });

            if (reservationResultCount) {
                if (
                    visibleCount ===
                    reservationRows.length
                ) {
                    reservationResultCount.textContent =
                        `全${reservationRows.length}件を表示しています`;
                } else {
                    reservationResultCount.textContent =
                        `${visibleCount}件が見つかりました`;
                }
            }

            updatePrintLink();
        };

        reservationDate.addEventListener(
            "change",
            searchReservations
        );

        reservationCourse.addEventListener(
            "change",
            searchReservations
        );

        customerName.addEventListener(
            "input",
            searchReservations
        );

        reservationGuests.addEventListener(
            "input",
            searchReservations
        );

        if (reservationClearButton) {
            reservationClearButton.addEventListener(
                "click",
                () => {
                    reservationDate.value = "";
                    reservationCourse.value = "";
                    customerName.value = "";
                    reservationGuests.value = "";

                    searchReservations();
                    reservationDate.focus();
                }
            );
        }

        searchReservations();
    }

// -----------------------------
// 出船一覧の検索
// -----------------------------
const tripTable =
    document.querySelector("#trip-table");

const tripDate =
    document.querySelector("#trip-date");

const tripCourse =
    document.querySelector("#trip-course");

const tripShip =
    document.querySelector("#trip-ship");

const tripCaptain =
    document.querySelector("#trip-captain");

const tripStatus =
    document.querySelector("#trip-status");

const tripClearButton =
    document.querySelector("#trip-search-clear");

const tripResultCount =
    document.querySelector("#trip-result-count");

if (
    tripTable &&
    tripDate &&
    tripCourse &&
    tripShip &&
    tripCaptain &&
    tripStatus
) {
    const tripRows = Array.from(
        tripTable.querySelectorAll(
            "tbody tr[data-search-row]"
        )
    );

    const searchTrips = () => {
        const selectedDate =
            normalizeDate(tripDate.value);

        const selectedCourse =
            tripCourse.value;

        const selectedShip =
            tripShip.value;

        const selectedCaptain =
            tripCaptain.value;

        const selectedStatus =
            tripStatus.value;

        let visibleCount = 0;

        tripRows.forEach((row) => {
            const cells =
                row.querySelectorAll("td");

            if (cells.length < 7) {
                return;
            }

            const rowDate =
                cells[0].textContent.trim();

            const rowCourse =
                cells[1].textContent.trim();

            const rowShip =
                cells[2].textContent.trim();

            const rowCaptain =
                cells[3].textContent.trim();

            /*
             * 状態欄は表示文字ではなく
             * data-statusの値で判定する
             *
             * 受付中   → ○ 空きあり
             * 満員     → × 満員
             * 受付停止 → － 受付停止
             */
            const statusElement =
                cells[6].querySelector(
                    "[data-status]"
                );

            const rowStatus =
                statusElement
                    ? statusElement.dataset.status
                    : cells[6].textContent.trim();

            const matchesDate =
                selectedDate === "" ||
                rowDate === selectedDate;

            const matchesCourse =
                selectedCourse === "" ||
                rowCourse === selectedCourse;

            const matchesShip =
                selectedShip === "" ||
                rowShip === selectedShip;

            const matchesCaptain =
                selectedCaptain === "" ||
                rowCaptain === selectedCaptain;

            const matchesStatus =
                selectedStatus === "" ||
                rowStatus === selectedStatus;

            const matches =
                matchesDate &&
                matchesCourse &&
                matchesShip &&
                matchesCaptain &&
                matchesStatus;

            row.hidden = !matches;

            if (matches) {
                visibleCount++;
            }
        });

        if (tripResultCount) {
            if (
                visibleCount ===
                tripRows.length
            ) {
                tripResultCount.textContent =
                    `全${tripRows.length}件を表示しています`;
            } else {
                tripResultCount.textContent =
                    `${visibleCount}件が見つかりました`;
            }
        }
    };

    tripDate.addEventListener(
        "change",
        searchTrips
    );

    tripCourse.addEventListener(
        "change",
        searchTrips
    );

    tripShip.addEventListener(
        "change",
        searchTrips
    );

    tripCaptain.addEventListener(
        "change",
        searchTrips
    );

    tripStatus.addEventListener(
        "change",
        searchTrips
    );

    if (tripClearButton) {
        tripClearButton.addEventListener(
            "click",
            () => {
                tripDate.value = "";
                tripCourse.value = "";
                tripShip.value = "";
                tripCaptain.value = "";
                tripStatus.value = "";

                searchTrips();
                tripDate.focus();
            }
        );
    }

    searchTrips();
}
    // -----------------------------
    // 左下の保存通知
    // -----------------------------
    let toastTimer = null;

    const showSaveToast = (
        message = "保存しました"
    ) => {
        let toast =
            document.querySelector("#save-toast");

        if (!toast) {
            toast =
                document.createElement("div");

            toast.id = "save-toast";
            toast.className = "save-toast";
            toast.setAttribute(
                "role",
                "status"
            );
            toast.setAttribute(
                "aria-live",
                "polite"
            );

            document.body.appendChild(toast);
        }

        toast.textContent = message;

        if (toastTimer) {
            window.clearTimeout(toastTimer);
        }

        toast.classList.remove("is-show");

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                toast.classList.add(
                    "is-show"
                );
            });
        });

        toastTimer =
            window.setTimeout(() => {
                toast.classList.remove(
                    "is-show"
                );
            }, 3000);
    };

    // -----------------------------
    // 行ごとの修正・保存
    // -----------------------------
    document
        .querySelectorAll("[data-edit-row]")
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const row =
                        button.closest("tr");

                    if (!row) {
                        return;
                    }

                    const isEditing =
                        button.dataset.editing ===
                        "true";

                    const editableCells =
                        row.querySelectorAll(
                            "td[data-editable]"
                        );

                    if (!isEditing) {
                        editableCells.forEach(
                            (cell, index) => {
                                const value =
                                    cell.textContent.trim();

                                const input =
                                    document.createElement(
                                        "input"
                                    );

                                input.type = "text";
                                input.className =
                                    "table-edit-input";

                                input.value = value;

                                input.dataset.originalValue =
                                    value;

                                input.setAttribute(
                                    "aria-label",
                                    `編集項目${index + 1}`
                                );

                                cell.textContent = "";
                                cell.appendChild(input);
                            }
                        );

                        row.classList.add(
                            "is-editing"
                        );

                        button.dataset.editing =
                            "true";

                        button.textContent =
                            "保存";

                        const firstInput =
                            row.querySelector(
                                ".table-edit-input"
                            );

                        if (firstInput) {
                            firstInput.focus();
                            firstInput.select();
                        }

                        return;
                    }

                    editableCells.forEach(
                        (cell) => {
                            const input =
                                cell.querySelector(
                                    ".table-edit-input"
                                );

                            if (!input) {
                                return;
                            }

                            cell.textContent =
                                input.value.trim();
                        }
                    );

                    row.classList.remove(
                        "is-editing"
                    );

                    button.dataset.editing =
                        "false";

                    button.textContent =
                        "修正";

                    showSaveToast(
                        "保存しました"
                    );
                }
            );
        });
});