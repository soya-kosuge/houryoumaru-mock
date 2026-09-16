
const data = loadHouryoumaruData();
const reservationId = getReservationId();
const activeReservation = data.reservations.find((item) => item.id === reservationId);
const reservation = activeReservation || (data.pastReservations || []).find((item) => item.id === reservationId);

if (!reservation) {
  document.querySelector("main").innerHTML = '<div class="card empty">予約情報が見つかりません。</div>';
} else {
  const editLink = document.getElementById("editReservationLink");
  const cancelButton = document.getElementById("cancelReservationButton");
  editLink.href = `./reservation-edit.html?id=${encodeURIComponent(reservation.id)}`;
  const departure = new Date(`${reservation.date}T${reservation.departureTime || "00:00"}:00`);
  const hoursUntilDeparture = (departure.getTime() - Date.now()) / 3600000;
  const isHistory = !activeReservation || hoursUntilDeparture < 0 || ["通常キャンセル", "キャンセル", "無断キャンセル", "乗船済み"].includes(reservation.status);
  const displayStatus = getHouryoumaruReservationStatus(reservation);
  const displayStatusLabel = ["通常キャンセル", "キャンセル"].includes(displayStatus) ? "キャンセル済み" : displayStatus;
  const statusClass = displayStatus === "予約完了" ? "completed" : (displayStatus === "予約中" ? "pending" : "cancelled");
  if (isHistory) {
    editLink.hidden = true;
    cancelButton.hidden = true;
  } else if (displayStatus === "予約完了") {
    editLink.removeAttribute("href");
    editLink.setAttribute("aria-disabled", "true");
    editLink.classList.add("is-disabled");
    editLink.textContent = "予約完了のため変更不可";
    editLink.title = "変更が必要な場合は豊漁丸へ電話でお問い合わせください。";
  }

  cancelButton?.addEventListener("click", () => {
    if (!window.confirm(`${reservation.date} ${reservation.tripType}の予約をキャンセルしますか？\nこの操作は元に戻せません。`)) return;
    if (cancelHouryoumaruReservation(data, reservation.id)) {
      window.alert("予約をキャンセルしました。");
      location.href = "./index.html";
    }
  });

  document.getElementById("reservationSummary").innerHTML = `
    <div class="row"><div class="label">予約番号</div><div class="value">${escapeHtml(reservation.id)}</div></div>
    <div class="row"><div class="label">状態</div><div class="value"><span class="badge ${statusClass}">${escapeHtml(displayStatusLabel)}</span></div></div>
    <div class="row"><div class="label">予約受付日時</div><div class="value">${escapeHtml(formatReservationDateTime(reservation.reservedAt || reservation.createdAt))}</div></div>
    <div class="row"><div class="label">予約日</div><div class="value">${escapeHtml(reservation.date)}</div></div>
    <div class="row"><div class="label">便</div><div class="value">${escapeHtml(reservation.tripType)}</div></div>
    <div class="row"><div class="label">出船時刻</div><div class="value">${escapeHtml(reservation.departureTime)}</div></div>
    <div class="row"><div class="label">釣り物</div><div class="value">${escapeHtml(reservation.target)}</div></div>
    <div class="row"><div class="label">人数</div><div class="value">${escapeHtml(reservation.partySize)}名</div></div>
    <div class="row"><div class="label">貸し竿</div><div class="value">${escapeHtml(reservation.rentalRods)}本</div></div>
    <div class="row"><div class="label">合計料金</div><div class="value">${Number(reservation.totalPrice || (Number(reservation.unitPrice || 13000) * Number(reservation.partySize || 0)) + (Number(reservation.rentalRodUnitPrice || 0) * Number(reservation.rentalRods || 0))).toLocaleString('ja-JP')}円</div></div>
    <div class="row"><div class="label">備考</div><div class="value">${escapeHtml(reservation.notes || "")}</div></div>
  `;

  document.getElementById("representativeRoster").innerHTML =
    rosterRows(data.roster || reservation.representative);

  const companionArea = document.getElementById("companionRoster");
  const companionCount = Math.max(0, Number(reservation.partySize || 1) - 1);
  const companionReminder = document.getElementById("companionDetailReminder");
  if (companionReminder) companionReminder.hidden = companionCount <= 0;
  const savedCompanions = (reservation.companions || []).filter((person) => hasCompanionData(person));

  if (companionCount <= 0) {
    companionArea.innerHTML = '<div class="empty">同行者なし</div>';
  } else if (!savedCompanions.length) {
    companionArea.innerHTML = `
      <div class="subcard">
        <div class="subcard-title">同行者 乗船名簿情報</div>
        ${rosterRows({})}
      </div>
    `;
  } else {
    companionArea.innerHTML = savedCompanions.slice(0, companionCount).map((person, index) => `
      <div class="subcard">
        <div class="subcard-title">同行者 ${index + 1}</div>
        ${rosterRows(person)}
      </div>
    `).join("");
  }
}

function formatReservationDateTime(value) {
  const date = new Date(value || "");
  if (!Number.isFinite(date.getTime())) return "未登録";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Tokyo"
  }).format(date);
}

function rosterRows(person = {}) {
  const valueOrUnregistered = (value) => {
    const normalized = String(value ?? "").trim();
    return normalized && normalized !== "---" ? escapeHtml(normalized) : '<span class="unregistered">未登録</span>';
  };
  const age = String(person.age ?? "").trim();
  return `
    <div class="row"><div class="label">氏名</div><div class="value">${valueOrUnregistered(person.name)}</div></div>
    <div class="row"><div class="label">郵便番号</div><div class="value">${valueOrUnregistered(person.postalCode)}</div></div>
    <div class="row"><div class="label">住所</div><div class="value">${valueOrUnregistered(person.address)}</div></div>
    <div class="row"><div class="label">番地・建物名</div><div class="value">${valueOrUnregistered(person.addressDetail)}</div></div>
    <div class="row"><div class="label">年齢</div><div class="value">${age && age !== "---" ? `${escapeHtml(age)}歳` : '<span class="unregistered">未登録</span>'}</div></div>
    <div class="row"><div class="label">性別</div><div class="value">${valueOrUnregistered(person.gender)}</div></div>
    <div class="row"><div class="label">緊急連絡先</div><div class="value">${valueOrUnregistered(person.emergency)}</div></div>
    <div class="row"><div class="label">続柄</div><div class="value">${valueOrUnregistered(person.emergencyRelation)}</div></div>
  `;
}

function hasCompanionData(person = {}) {
  const values = [person.name, person.postalCode, person.address, person.age, person.gender, person.emergency, person.emergencyRelation]
    .map((value) => String(value ?? "").trim())
    .filter((value) => value && value !== "---" && value !== "未登録");
  if (["佐藤 花子", "鈴木 一郎"].includes(String(person.name || "").trim())) return false;
  return values.length > 0;
}
