
const data = loadHouryoumaruData();

document.getElementById("accountNameKanji").textContent = data.account.nameKanji;
document.getElementById("accountNameKana").textContent = data.account.nameKana;
document.getElementById("accountEmail").textContent = data.account.email;
document.getElementById("accountPhone").textContent = data.account.phone;

document.getElementById("rosterName").textContent = data.roster.name;
document.getElementById("rosterPostalCode").textContent = data.roster.postalCode || "未登録";
document.getElementById("rosterAddress").textContent = data.roster.address;
document.getElementById("rosterAge").textContent = `${data.roster.age}歳`;
document.getElementById("rosterGender").textContent = data.roster.gender;
document.getElementById("rosterEmergency").textContent = data.roster.emergency;

const list = document.getElementById("reservationList");
if (!data.reservations.length) {
  list.innerHTML = '<div class="empty">現在の予約はありません。</div>';
} else {
  // マイページのMOCKでは予約一覧は1件のみ表示する。
  // 以前のテストデータがlocalStorageに複数残っていても画面には増やさない。
  const reservation = data.reservations[0];
  list.innerHTML = `
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
  `;
}
