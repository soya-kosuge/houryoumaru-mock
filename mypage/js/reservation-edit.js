
async function lookupAddressFromPostal(input, addressInput, helper, addressDetailInput = null) {
  const digits = String(input.value || "").replace(/\D/g, "");
  if (digits.length !== 7) return;
  try {
    if (helper) helper.textContent = "住所を検索しています…";
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
    if (!response.ok) throw new Error("postal lookup failed");
    const result = await response.json();
    const item = result?.results?.[0];
    if (!item) { if (helper) helper.textContent = "該当する住所が見つかりませんでした。"; return; }
    addressInput.value = `${item.address1 || ""}${item.address2 || ""}${item.address3 || ""}`;
    if (addressDetailInput) addressDetailInput.focus();
    if (helper) helper.textContent = "住所を自動入力しました。番地・建物名を入力してください。";
  } catch (_) {
    if (helper) helper.textContent = "住所を自動取得できませんでした。住所を直接入力してください。";
  }
}


const data = loadHouryoumaruData();
const reservationId = getReservationId();
const reservation = data.reservations.find((item) => item.id === reservationId);
const form = document.getElementById("reservationEditForm");
const container = document.getElementById("companionsContainer");

if (!reservation) {
  form.innerHTML = '<div class="card empty">予約情報が見つかりません。</div>';
} else {
  document.getElementById("backDetailLink").href =
    `./reservation-detail.html?id=${encodeURIComponent(reservation.id)}`;

  document.getElementById("reservationDate").value = reservation.date;
  document.getElementById("tripType").value = reservation.tripType;
  document.getElementById("partySize").value = reservation.partySize;
  document.getElementById("rentalRods").value = reservation.rentalRods;
  document.getElementById("notes").value = reservation.notes || "";

  document.getElementById("repName").value = reservation.representative.name;
  document.getElementById("repPostalCode").value = reservation.representative.postalCode || data.roster?.postalCode || "";
  document.getElementById("repAddress").value = reservation.representative.address;
  document.getElementById("repAddressDetail").value = reservation.representative.addressDetail || "";
  document.getElementById("repAge").value = reservation.representative.age;
  document.getElementById("repGender").value = reservation.representative.gender;
  document.getElementById("repEmergency").value = reservation.representative.emergency;
  document.getElementById("repEmergencyRelation").value = reservation.representative.emergencyRelation || "";
  document.getElementById("repPostalCode").addEventListener("input", (event) => { event.currentTarget.value = formatPostalCode(event.currentTarget.value); });

  initializeCompanions();
  updateCompanionState();
}

document.querySelectorAll(".phone-input").forEach(bindPhoneFormatting);
document.getElementById("addCompanionBtn").addEventListener("click", () => {
  const maxCompanions = getAllowedCompanionCount();
  const currentCards = container.querySelectorAll(".person-card").length;
  if (maxCompanions <= 0) return;
  if (currentCards >= maxCompanions) {
    alert(`同行者は最大${maxCompanions}名まで登録できます。`);
    return;
  }
  addCompanion();
});

document.getElementById("partySize").addEventListener("input", updateCompanionState);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const allPhoneInputs = [...document.querySelectorAll(".phone-input")];
  for (const input of allPhoneInputs) {
    if (input.value && !isValidPhone(input.value)) {
      alert("電話番号・緊急連絡先は10桁または11桁の電話番号を入力してください。");
      input.focus();
      return;
    }
  }

  const companions = [];
  const cards = [...container.querySelectorAll(".person-card")];

  for (const card of cards) {
    const person = {
      name: card.querySelector('[data-field="name"]').value.trim(),
      postalCode: card.querySelector('[data-field="postalCode"]').value.trim(),
      address: card.querySelector('[data-field="address"]').value.trim(),
      addressDetail: card.querySelector('[data-field="addressDetail"]').value.trim(),
      age: card.querySelector('[data-field="age"]').value,
      gender: card.querySelector('[data-field="gender"]').value,
      emergency: card.querySelector('[data-field="emergency"]').value.trim(),
      emergencyRelation: card.querySelector('[data-field="emergencyRelation"]').value
    };

    const allBlank = !person.name && !person.postalCode && !person.address && !person.addressDetail && !person.age && !person.gender && !person.emergency && !person.emergencyRelation;
    if (allBlank) continue;

    if (!person.name || !person.postalCode || !person.address || !person.addressDetail || !person.age || !person.gender || !person.emergency || !person.emergencyRelation) {
      alert("同行者情報を登録する場合は、氏名・郵便番号・住所・番地・建物名・年齢・性別・緊急連絡先・続柄をすべて入力してください。");
      return;
    }

    if (!isValidPostalCode(person.postalCode)) {
      alert("同行者の郵便番号は7桁の数字で入力してください。");
      return;
    }

    if (!isValidPhone(person.emergency)) {
      alert("同行者の緊急連絡先の形式を確認してください。");
      return;
    }

    person.postalCode = formatPostalCode(person.postalCode);
    person.age = Number(person.age);
    person.emergency = formatPhone(person.emergency);
    companions.push(person);
  }

  reservation.date = document.getElementById("reservationDate").value;
  reservation.tripType = document.getElementById("tripType").value;
  reservation.partySize = Number(document.getElementById("partySize").value);
  reservation.rentalRods = Number(document.getElementById("rentalRods").value);
  reservation.notes = document.getElementById("notes").value.trim();

  const repPostalCode = document.getElementById("repPostalCode").value.trim();
  if (!isValidPostalCode(repPostalCode)) {
    alert("代表者の郵便番号は7桁の数字で入力してください。");
    document.getElementById("repPostalCode").focus();
    return;
  }

  reservation.representative = {
    name: document.getElementById("repName").value.trim(),
    postalCode: formatPostalCode(repPostalCode),
    address: document.getElementById("repAddress").value.trim(),
    addressDetail: document.getElementById("repAddressDetail").value.trim(),
    age: Number(document.getElementById("repAge").value),
    gender: document.getElementById("repGender").value,
    emergency: formatPhone(document.getElementById("repEmergency").value),
    emergencyRelation: document.getElementById("repEmergencyRelation").value
  };
  reservation.companions = companions;

  saveHouryoumaruData(data);

  const notice = document.getElementById("saveNotice");
  notice.className = "notice";
  notice.textContent = "予約内容と乗船名簿情報を保存しました。";
  window.scrollTo({ top: 0, behavior: "smooth" });

  setTimeout(() => {
    location.href = `./reservation-detail.html?id=${encodeURIComponent(reservation.id)}`;
  }, 450);
});

function addCompanion(person = {}) {
  const card = document.createElement("div");
  card.className = "person-card";
  card.innerHTML = `
    <div class="person-head">
      <h3>同行者</h3>
      <button class="link-btn remove-companion" type="button">削除</button>
    </div>
    <div class="form-grid">
      <div class="field"><label>氏名</label><input data-field="name" type="text" placeholder="例：山田 太郎" value="${escapeHtml(cleanCompanionValue(person.name))}"></div>
      <div class="field"><label>郵便番号</label><input data-field="postalCode" class="postal-input" type="text" inputmode="numeric" maxlength="8" placeholder="例：460-0000" value="${escapeHtml(cleanCompanionValue(person.postalCode))}"><div class="helper postal-helper">郵便番号から住所を自動入力できます。</div></div>
      <div class="field full"><label>住所</label><input data-field="address" type="text" placeholder="例：愛知県名古屋市中区" value="${escapeHtml(cleanCompanionValue(person.address))}"></div>
      <div class="field full"><label>番地・建物名</label><input data-field="addressDetail" type="text" placeholder="例：○○町1-2-3 ○○マンション101号室" value="${escapeHtml(cleanCompanionValue(person.addressDetail))}"></div>
      <div class="field"><label>年齢</label><input data-field="age" type="number" min="0" max="120" placeholder="例：32" value="${escapeHtml(cleanCompanionValue(person.age))}"></div>
      <div class="field">
        <label>性別</label>
        <select data-field="gender">
          <option value="">選択してください</option>
          ${["男性","女性","回答しない"].map((option) =>
            `<option value="${option}" ${person.gender === option ? "selected" : ""}>${option}</option>`
          ).join("")}
        </select>
      </div>
      <div class="field">
        <label>緊急連絡先（電話番号）</label>
        <input data-field="emergency" class="phone-input" type="tel" inputmode="numeric" placeholder="例：090-1234-5678" value="${escapeHtml(cleanCompanionValue(person.emergency))}">
        <div class="helper">数字を入力するとハイフンを自動で付けます。</div>
      </div>
      <div class="field">
        <label>続柄</label>
        <select data-field="emergencyRelation">
          <option value="">選択してください</option>
          ${["妻","夫","父","母","息子","娘","兄","姉","弟","妹","叔父","叔母","祖父","祖母","その他"].map((option) =>
            `<option value="${option}" ${person.emergencyRelation === option ? "selected" : ""}>${option}</option>`
          ).join("")}
        </select>
      </div>
    </div>
  `;
  card.querySelector(".remove-companion").addEventListener("click", () => card.remove());
  bindPhoneFormatting(card.querySelector(".phone-input"));
  const postalInput = card.querySelector(".postal-input");
  postalInput?.addEventListener("input", async () => {
    postalInput.value = formatPostalCode(postalInput.value);
    if (postalInput.value.replace(/\D/g, "").length === 7) {
      await lookupAddressFromPostal(postalInput, card.querySelector('[data-field="address"]'), card.querySelector(".postal-helper"), card.querySelector('[data-field="addressDetail"]'));
    }
  });
  container.appendChild(card);
}

function initializeCompanions() {
  const allowed = getAllowedCompanionCount();
  container.innerHTML = "";
  if (allowed <= 0) return;

  const saved = (reservation.companions || []).filter((person) => hasRealCompanionData(person));
  // 初期表示は1カードだけ。保存済みの実データがある場合のみ、その人数分を復元する。
  if (saved.length) {
    saved.slice(0, allowed).forEach((person) => addCompanion(person));
  } else {
    addCompanion({});
  }
}

function getAllowedCompanionCount() {
  return Math.max(0, Number(document.getElementById("partySize")?.value || 1) - 1);
}

function updateCompanionState() {
  const allowed = getAllowedCompanionCount();
  const sectionCard = document.getElementById("companionsCard");
  const addButton = document.getElementById("addCompanionBtn");
  const reminder = document.getElementById("companionReminder");
  const disabledMessage = document.getElementById("companionDisabledMessage");

  reminder.hidden = allowed <= 0;
  disabledMessage.hidden = allowed > 0;
  addButton.disabled = allowed <= 0;
  sectionCard.classList.toggle("is-disabled", allowed <= 0);

  if (allowed <= 0) {
    container.innerHTML = "";
    return;
  }

  const cards = [...container.querySelectorAll(".person-card")];
  cards.slice(allowed).forEach((card) => card.remove());
  if (!container.querySelector(".person-card")) addCompanion({});
}

function cleanCompanionValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized === "---" || normalized === "未登録") return "";
  return normalized;
}

function hasRealCompanionData(person = {}) {
  const name = cleanCompanionValue(person.name);
  // 旧MOCKの固定ダミー同行者は初期値として復元しない。
  if (["佐藤 花子", "鈴木 一郎"].includes(name)) return false;
  return Boolean(
    name || cleanCompanionValue(person.postalCode) || cleanCompanionValue(person.address) || cleanCompanionValue(person.age) ||
    cleanCompanionValue(person.gender) || cleanCompanionValue(person.emergency) || cleanCompanionValue(person.emergencyRelation)
  );
}

function bindPhoneFormatting(input) {
  if (!input || input.dataset.bound === "true") return;
  input.dataset.bound = "true";
  input.addEventListener("input", () => {
    input.value = formatPhone(input.value);
  });
}

const repPostalInput = document.getElementById("repPostalCode");
const repAddressInput = document.getElementById("repAddress");
repPostalInput?.addEventListener("input", async () => {
  repPostalInput.value = formatPostalCode(repPostalInput.value);
  if (repPostalInput.value.replace(/\D/g, "").length === 7) {
    await lookupAddressFromPostal(repPostalInput, repAddressInput, document.getElementById("repPostalHelper"), document.getElementById("repAddressDetail"));
  }
});
