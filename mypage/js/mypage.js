
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
if (!data.reservations.length) {
  list.innerHTML = '<div class="empty">現在の予約はありません。</div>';
} else {
  const reservations = [...data.reservations].sort((a, b) =>
    `${a.date || ""} ${a.departureTime || ""}`.localeCompare(`${b.date || ""} ${b.departureTime || ""}`)
  );
  list.innerHTML = reservations.map((reservation) => `
    <div class="reservation-item">
      <div class="reservation-top">
        <div>
          <strong>${escapeHtml(reservation.date)} ${escapeHtml(reservation.tripType)}</strong>
          <div class="reservation-meta">
            ${escapeHtml(reservation.departureTime)}出船 / ${escapeHtml(reservation.target)} /
            ${escapeHtml(reservation.partySize)}名
          </div>
        </div>
      </div>
      <div class="page-actions">
        <a class="btn primary" href="./reservation-detail.html?id=${encodeURIComponent(reservation.id)}">予約内容を確認</a>
      </div>
    </div>
  `).join("");
}
