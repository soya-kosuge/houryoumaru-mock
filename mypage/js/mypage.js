
const data = loadHouryoumaruData();

document.getElementById("accountNameKanji").textContent = data.account.nameKanji;
document.getElementById("accountNameKana").textContent = data.account.nameKana;
document.getElementById("accountEmail").textContent = data.account.email;
document.getElementById("accountPhone").textContent = data.account.phone;

const rosterValue = (value) => String(value ?? "").trim() || "未登録";
document.getElementById("rosterName").textContent = rosterValue(data.roster.name);
document.getElementById("rosterPostalCode").textContent = rosterValue(data.roster.postalCode);
document.getElementById("rosterAddress").textContent = rosterValue(data.roster.address);
document.getElementById("rosterAddressDetail").textContent = rosterValue(data.roster.addressDetail);
document.getElementById("rosterAge").textContent = String(data.roster.age ?? "").trim() ? `${data.roster.age}歳` : "未登録";
document.getElementById("rosterGender").textContent = rosterValue(data.roster.gender);
document.getElementById("rosterEmergency").textContent = rosterValue(data.roster.emergency);
document.getElementById("rosterEmergencyRelation").textContent = rosterValue(data.roster.emergencyRelation);

const list = document.getElementById("reservationList");
const historyList = document.getElementById("reservationHistoryList");
const isPastReservation = (reservation) => {
  const departure = new Date(`${reservation.date || ""}T${reservation.departureTime || "23:59"}:00`);
  return Number.isFinite(departure.getTime()) && departure.getTime() < Date.now();
};
const activeReservations = (data.reservations || []).filter((reservation) =>
  !isPastReservation(reservation) && !["通常キャンセル", "キャンセル", "無断キャンセル"].includes(reservation.status)
);
const reservationStatusBadge = (reservation) => {
  const status = getHouryoumaruReservationStatus(reservation);
  if (["通常キャンセル", "キャンセル"].includes(status)) return { label: "キャンセル済み", className: "cancelled" };
  if (status === "無断キャンセル") return { label: status, className: "cancelled" };
  return { label: status, className: status === "予約完了" ? "completed" : "pending" };
};

if (!activeReservations.length) {
  list.innerHTML = '<div class="empty">現在の予約はありません。</div>';
} else {
  const reservations = [...activeReservations].sort((a, b) =>
    `${a.date || ""} ${a.departureTime || ""}`.localeCompare(`${b.date || ""} ${b.departureTime || ""}`)
  );
  list.innerHTML = reservations.map((reservation) => {
    const status = reservationStatusBadge(reservation);
    return `
    <div class="reservation-item">
      <div class="reservation-top">
        <div>
          <strong>${escapeHtml(reservation.date)} ${escapeHtml(reservation.tripType)}</strong>
          <div class="reservation-meta">
            ${escapeHtml(reservation.departureTime)}出船 / ${escapeHtml(reservation.target)} /
            ${escapeHtml(reservation.partySize)}名
          </div>
          <div class="history-status"><span class="badge ${status.className}">${escapeHtml(status.label)}</span></div>
        </div>
      </div>
      <div class="page-actions reservation-actions">
        <a class="btn primary" href="./reservation-detail.html?id=${encodeURIComponent(reservation.id)}">詳細を見る</a>
      </div>
    </div>
  `;
  }).join("");
}

const historyReservations = [...(data.pastReservations || []), ...(data.reservations || []).filter((reservation) =>
  isPastReservation(reservation) || ["通常キャンセル", "キャンセル", "無断キャンセル", "乗船済み"].includes(reservation.status)
)].sort((a, b) => `${b.date || ""} ${b.departureTime || ""}`.localeCompare(`${a.date || ""} ${a.departureTime || ""}`));

if (!historyReservations.length) {
  historyList.innerHTML = '<div class="empty">過去の予約はありません。</div>';
} else {
  historyList.innerHTML = historyReservations.map((reservation) => {
    const status = reservationStatusBadge(reservation);
    return `
      <div class="reservation-item">
        <div class="reservation-top">
          <div>
            <strong>${escapeHtml(reservation.date)} ${escapeHtml(reservation.tripType)}</strong>
            <div class="reservation-meta">${escapeHtml(reservation.departureTime)}出船 / ${escapeHtml(reservation.target)} / ${escapeHtml(reservation.partySize)}名</div>
            <div class="history-status"><span class="badge ${status.className}">${escapeHtml(status.label)}</span></div>
          </div>
        </div>
        <div class="page-actions reservation-actions history-actions">
          <a class="btn primary" href="./reservation-detail.html?id=${encodeURIComponent(reservation.id)}">詳細を見る</a>
        </div>
      </div>
    `;
  }).join("");
}
