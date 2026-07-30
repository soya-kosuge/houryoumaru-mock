document.addEventListener("DOMContentLoaded", () => {
    const reservationForm = document.querySelector("#reservation-form");

    if (reservationForm) {
        const loginEmail = new URLSearchParams(window.location.search).get("email");
        const emailInput = document.querySelector("#reservation-email");

        if (loginEmail && emailInput && !emailInput.value) {
            emailInput.value = loginEmail;
        }
    }

    const confirmationCard = document.querySelector(".confirmation-card");

    if (!confirmationCard) {
        return;
    }

    const params = new URLSearchParams(window.location.search);

    const rentalRod = Number(params.get("rentalRod") || 0);

    const values = {
        "#confirm-name": `${params.get("lastName") ?? ""} ${params.get("firstName") ?? ""}`.trim(),
        "#confirm-name-kana": `${params.get("lastNameKana") ?? ""} ${params.get("firstNameKana") ?? ""}`.trim(),

        "#confirm-participants": params.get("participants")
            ? `${params.get("participants")}名`
            : "－",

        // ★追加
        "#confirm-rental-rod": rentalRod > 0
            ? `${rentalRod}本`
            : "なし",

        "#confirm-phone": params.get("phone") || "－",
        "#confirm-email": params.get("reservationEmail") || "－",
        "#confirm-remarks": params.get("remarks") || "なし"
    };

    Object.entries(values).forEach(([selector, value]) => {
        const element = document.querySelector(selector);

        if (element) {
            element.textContent = value || "－";
        }
    });

    const editLink = document.querySelector(".secondary-button");

    if (editLink) {
        editLink.href = `reservation.html?${params.toString()}`;
    }
});
