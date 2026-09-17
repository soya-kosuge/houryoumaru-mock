
function ensureMypageHeaderNavigation() {
  const header = document.querySelector('.site-header .header-inner');
  if (!header || header.querySelector('.mypage-header-nav')) return;
  const nav = document.createElement('nav');
  nav.className = 'mypage-header-nav';
  nav.setAttribute('aria-label', 'ユーザーメニュー');
  nav.innerHTML = '<a href="../user/shipScheduleList.html">出船情報</a><a href="./index.html">マイページ</a>';
  header.appendChild(nav);
}
ensureMypageHeaderNavigation();


const HOURYOUMARU_STORAGE_KEY = "houryoumaruStandaloneReservationData";
const HOURYOUMARU_RENTAL_ROD_UNIT_PRICE = 3000;
const HOURYOUMARU_RESERVATION_CONFIRMATION_MS = 48 * 60 * 60 * 1000;

const DEFAULT_DATA = {
  account: {
    nameKanji: "山田 太郎",
    nameKana: "やまだ たろう",
    email: "taro.yamada@example.com",
    phone: "090-1234-5678"
  },
  roster: {
    name: "",
    postalCode: "",
    address: "",
    addressDetail: "",
    age: "",
    gender: "",
    emergency: "",
    emergencyRelation: ""
  },
  reservations: [
    {
      id: "R20260917001",
      date: "2026-09-17",
      tripType: "半夜便",
      departureTime: "17:00",
      reservedAt: "2026-09-11T10:00:00+09:00",
      unitPrice: 13000,
      rentalRodUnitPrice: HOURYOUMARU_RENTAL_ROD_UNIT_PRICE,
      target: "マイカ",
      partySize: 3,
      rentalRods: 2,
      totalPrice: 45000,
      notes: "",
      representative: {
        name: "",
        postalCode: "",
        address: "",
        addressDetail: "",
        age: "",
        gender: "",
        emergency: "",
        emergencyRelation: ""
      },
      companions: []
    },
    {
      id: "R20260926003",
      date: "2026-09-26",
      tripType: "アオリ便",
      departureTime: "02:00",
      reservedAt: "2026-09-10T09:30:00+09:00",
      unitPrice: 13000,
      rentalRodUnitPrice: HOURYOUMARU_RENTAL_ROD_UNIT_PRICE,
      target: "アオリ ティップラン",
      partySize: 1,
      rentalRods: 0,
      totalPrice: 13000,
      notes: "",
      representative: {},
      companions: []
    }
  ],
  pastReservations: [
    {
      id: "R20260915004",
      date: "2026-09-15",
      tripType: "半夜便",
      departureTime: "17:00",
      reservedAt: "2026-09-15T07:00:00+09:00",
      unitPrice: 13000,
      rentalRodUnitPrice: HOURYOUMARU_RENTAL_ROD_UNIT_PRICE,
      target: "マイカ",
      partySize: 2,
      rentalRods: 1,
      totalPrice: 29000,
      notes: "",
      representative: {},
      companions: []
    },
    {
      id: "R20260905006",
      date: "2026-09-05",
      tripType: "半夜便",
      departureTime: "17:00",
      reservedAt: "2026-08-30T09:00:00+09:00",
      unitPrice: 13000,
      rentalRodUnitPrice: HOURYOUMARU_RENTAL_ROD_UNIT_PRICE,
      target: "スーパーロング便",
      partySize: 4,
      rentalRods: 2,
      totalPrice: 58000,
      notes: "",
      representative: {},
      companions: []
    }
  ]
};

const HOURYOUMARU_SHARED_RESERVATION_KEY = "horyomaruAdminReservations";

function normalizeSharedReservation(item, baseData) {
  const partySize = Number(item.participants || item.partySize || 1);
  const companionCount = Math.max(0, partySize - 1);
  const blankCompanion = () => ({ name: "", postalCode: "", address: "", addressDetail: "", age: "", gender: "", emergency: "", emergencyRelation: "" });
  return {
    id: item.id || `U-${Date.now()}`,
    tripId: item.tripId || "",
    date: item.dateKey || String(item.date || "").replaceAll("/", "-"),
    tripType: item.course || item.tripType || "---",
    departureTime: item.departureTime || item.time || "---",
    target: item.target || "---",
    partySize,
    rentalRods: Number(item.rentalRod ?? item.rentalRods ?? 0),
    unitPrice: Number(item.unitPrice || item.pricePerPerson || 13000),
    rentalRodUnitPrice: Number(item.rentalRodUnitPrice || HOURYOUMARU_RENTAL_ROD_UNIT_PRICE),
    totalPrice: Number(item.totalPrice || (Number(item.unitPrice || item.pricePerPerson || 13000) * partySize) + (HOURYOUMARU_RENTAL_ROD_UNIT_PRICE * Number(item.rentalRod ?? item.rentalRods ?? 0))),
    reservedAt: item.reservedAt || item.createdAt || new Date().toISOString(),
    status: item.status || "予約中",
    cancelledAt: item.cancelledAt || "",
    notes: item.remarks || item.notes || "",
    representative: item.representative || {
      name: baseData?.roster?.name || item.name || "---",
      postalCode: baseData?.roster?.postalCode || "",
      address: baseData?.roster?.address || "---",
      addressDetail: baseData?.roster?.addressDetail || "",
      age: baseData?.roster?.age ?? "---",
      gender: baseData?.roster?.gender || "---",
      emergency: baseData?.roster?.emergency || "---",
      emergencyRelation: baseData?.roster?.emergencyRelation || ""
    },
    companions: Array.isArray(item.companions) && item.companions.length
      ? item.companions
      : Array.from({ length: companionCount }, blankCompanion)
  };
}

function mergeSharedReservations(data) {
  let shared = [];
  try {
    shared = JSON.parse(localStorage.getItem(HOURYOUMARU_SHARED_RESERVATION_KEY) || "[]");
  } catch (_) { shared = []; }
  if (!Array.isArray(shared) || !shared.length) return data;

  if (!Array.isArray(data.pastReservations)) data.pastReservations = [];
  const activeById = new Map((data.reservations || []).map((r) => [r.id, r]));
  const historyById = new Map(data.pastReservations.map((r) => [r.id, r]));
  const historyStatuses = ["通常キャンセル", "キャンセル", "無断キャンセル", "乗船済み"];
  shared.forEach((item) => {
    const normalized = normalizeSharedReservation(item, data);
    if (historyStatuses.includes(normalized.status)) {
      const existingHistory = historyById.get(normalized.id);
      if (existingHistory) Object.assign(existingHistory, normalized);
      else {
        data.pastReservations.push(normalized);
        historyById.set(normalized.id, normalized);
      }
      data.reservations = data.reservations.filter((reservation) => reservation.id !== normalized.id);
      activeById.delete(normalized.id);
      return;
    }
    const existing = activeById.get(normalized.id);
    if (existing) Object.assign(existing, normalized);
    else if (!historyById.has(normalized.id)) {
      data.reservations.push(normalized);
      activeById.set(normalized.id, normalized);
    }
  });
  return data;
}

function syncReservationsToShared(data) {
  let shared = [];
  try { shared = JSON.parse(localStorage.getItem(HOURYOUMARU_SHARED_RESERVATION_KEY) || "[]"); }
  catch (_) { shared = []; }
  if (!Array.isArray(shared)) shared = [];
  const map = new Map(shared.map((r) => [r.id, r]));
  (data.reservations || []).forEach((r) => {
    if (!String(r.id || "").startsWith("U-")) return;
    const prev = map.get(r.id) || {};
    map.set(r.id, {
      ...prev,
      id: r.id,
      tripId: r.tripId || "",
      date: String(r.date || "").replaceAll("-", "/"),
      dateKey: r.date || "",
      course: r.tripType,
      departureTime: r.departureTime,
      target: r.target,
      name: data.account?.nameKanji || r.representative?.name || "---",
      nameKana: data.account?.nameKana || "",
      participants: Number(r.partySize || 0),
      rentalRod: Number(r.rentalRods || 0),
      unitPrice: Number(r.unitPrice || 13000),
      rentalRodUnitPrice: HOURYOUMARU_RENTAL_ROD_UNIT_PRICE,
      totalPrice: Number(r.totalPrice || (Number(r.unitPrice || 13000) * Number(r.partySize || 0)) + (HOURYOUMARU_RENTAL_ROD_UNIT_PRICE * Number(r.rentalRods || 0))),
      reservedAt: r.reservedAt || prev.reservedAt || prev.createdAt || new Date().toISOString(),
      phone: data.account?.phone || "",
      email: data.account?.email || "",
      remarks: r.notes || "",
      representative: r.representative,
      companions: r.companions || [],
      status: prev.status || "予約中"
    });
  });
  localStorage.setItem(HOURYOUMARU_SHARED_RESERVATION_KEY, JSON.stringify([...map.values()]));
}


function migrateYamadaAddress(data) {
  return data;
}

function applyPostalCodeMigration(data) {
  if (!data.roster) data.roster = {};
  if (typeof data.roster.postalCode !== "string") data.roster.postalCode = "";
  if (typeof data.roster.addressDetail !== "string") data.roster.addressDetail = "";
  (data.reservations || []).forEach((r) => {
    if (!r.representative) r.representative = {};
    if (typeof r.representative.postalCode !== "string") r.representative.postalCode = data.roster.postalCode || "";
    if (typeof r.representative.addressDetail !== "string") r.representative.addressDetail = data.roster.addressDetail || "";
    (r.companions || []).forEach((person) => {
      if (typeof person.postalCode !== "string") person.postalCode = "";
      if (typeof person.addressDetail !== "string") person.addressDetail = "";
    });
  });

  return data;
}

function applyEmergencyRelationMigration(data) {
  if (!data.roster) data.roster = {};
  if (typeof data.roster.emergencyRelation !== "string") data.roster.emergencyRelation = "";
  (data.reservations || []).forEach((r) => {
    if (!r.representative) r.representative = {};
    if (typeof r.representative.emergencyRelation !== "string") r.representative.emergencyRelation = "";
    (r.companions || []).forEach((person) => {
      if (typeof person.emergencyRelation !== "string") person.emergencyRelation = "";
    });
  });
  return data;
}

function applyReservationHistoryMigration(data) {
  if (!Array.isArray(data.pastReservations)) {
    data.pastReservations = structuredClone(DEFAULT_DATA.pastReservations);
  }
  [...(data.reservations || []), ...data.pastReservations].forEach((reservation) => {
    reservation.rentalRodUnitPrice = HOURYOUMARU_RENTAL_ROD_UNIT_PRICE;
    if (!reservation.status) reservation.status = "予約中";
  });
  return data;
}

function ensureSampleReservations(data) {
  if (!Array.isArray(data.reservations)) data.reservations = [];
  if (!Array.isArray(data.pastReservations)) data.pastReservations = [];
  // 更新前の保存データから、廃止したサンプルだけを除外する。
  // 利用者が追加した予約・登録情報は保持する。
  const retiredSampleIds = new Set(["R20260815001", "R20260920002", "R20260914004", "R20260910005"]);
  data.reservations = data.reservations.filter((reservation) => !retiredSampleIds.has(reservation.id));
  data.pastReservations = data.pastReservations.filter((reservation) => !retiredSampleIds.has(reservation.id));
  const ids = new Set([...data.reservations, ...data.pastReservations].map((reservation) => reservation.id));
  DEFAULT_DATA.reservations.forEach((reservation) => {
    if (!ids.has(reservation.id)) data.reservations.push(structuredClone(reservation));
  });
  DEFAULT_DATA.pastReservations.forEach((reservation) => {
    if (!ids.has(reservation.id)) data.pastReservations.push(structuredClone(reservation));
  });
  return data;
}

function clearLegacySampleNotes(data) {
  [...(data.reservations || []), ...(data.pastReservations || [])].forEach((reservation) => {
    if (["左舷希望", "初参加"].includes(String(reservation.notes || "").trim())) {
      reservation.notes = "";
    }
  });
  return data;
}

function applyRegisteredProfile(data) {
  if (localStorage.getItem("horyomaruMockRegistered") !== "true") return data;
  try {
    const profile = JSON.parse(localStorage.getItem("horyomaruProfile") || "null");
    if (!profile) return data;
    data.account = {
      nameKanji: profile.name || data.account?.nameKanji || "",
      nameKana: profile.nameKana || data.account?.nameKana || "",
      email: profile.email || data.account?.email || "",
      phone: formatPhone(profile.phone || data.account?.phone || "")
    };
  } catch (_) { /* 登録情報が壊れている場合は保存済み表示を使用する。 */ }
  return data;
}

function getHouryoumaruReservationStatus(reservation, now = Date.now()) {
  const explicitStatus = String(reservation?.status || "").trim();
  if (["通常キャンセル", "キャンセル", "無断キャンセル"].includes(explicitStatus)) return explicitStatus;
  const date = String(reservation?.date || "").trim().replaceAll("/", "-");
  const time = String(reservation?.departureTime || reservation?.time || "00:00").trim();
  const departureAt = new Date(`${date}T${time}:00`).getTime();
  if (!Number.isFinite(departureAt)) return explicitStatus === "予約完了" ? "予約完了" : "予約中";

  // 出船日時の48時間前から出船後までは予約完了、49時間以上前は予約中。
  return departureAt - now <= HOURYOUMARU_RESERVATION_CONFIRMATION_MS ? "予約完了" : "予約中";
}


const HOURYOUMARU_ROSTER_RESET_KEY = "houryoumaruRosterResetV1";

function ensureRosterStartsUnregistered(data) {
  if (localStorage.getItem(HOURYOUMARU_ROSTER_RESET_KEY) === "done") return data;
  data.roster = { name: "", postalCode: "", address: "", addressDetail: "", age: "", gender: "", emergency: "", emergencyRelation: "" };
  (data.reservations || []).forEach((reservation) => {
    reservation.representative = { name: "", postalCode: "", address: "", addressDetail: "", age: "", gender: "", emergency: "", emergencyRelation: "" };
    reservation.companions = [];
  });
  localStorage.setItem(HOURYOUMARU_ROSTER_RESET_KEY, "done");
  localStorage.setItem(HOURYOUMARU_STORAGE_KEY, JSON.stringify(data));
  return data;
}

function loadHouryoumaruData() {
  const stored = localStorage.getItem(HOURYOUMARU_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(HOURYOUMARU_STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return clearLegacySampleNotes(ensureRosterStartsUnregistered(applyRegisteredProfile(ensureSampleReservations(applyReservationHistoryMigration(applyEmergencyRelationMigration(applyPostalCodeMigration(migrateYamadaAddress(mergeSharedReservations(structuredClone(DEFAULT_DATA))))))))));
  }
  try {
    return clearLegacySampleNotes(ensureRosterStartsUnregistered(applyRegisteredProfile(ensureSampleReservations(applyReservationHistoryMigration(applyEmergencyRelationMigration(applyPostalCodeMigration(migrateYamadaAddress(mergeSharedReservations(JSON.parse(stored))))))))));
  } catch (_) {
    localStorage.setItem(HOURYOUMARU_STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return clearLegacySampleNotes(ensureRosterStartsUnregistered(applyRegisteredProfile(ensureSampleReservations(applyReservationHistoryMigration(applyEmergencyRelationMigration(applyPostalCodeMigration(migrateYamadaAddress(mergeSharedReservations(structuredClone(DEFAULT_DATA))))))))));
  }
}

function saveHouryoumaruData(data) {
  localStorage.setItem(HOURYOUMARU_STORAGE_KEY, JSON.stringify(data));
  syncReservationsToShared(data);
}

function cancelHouryoumaruReservation(data, reservationId) {
  const index = (data.reservations || []).findIndex((reservation) => reservation.id === reservationId);
  if (index < 0) return false;
  const [reservation] = data.reservations.splice(index, 1);
  reservation.status = "通常キャンセル";
  reservation.cancelledAt = new Date().toISOString();
  if (!Array.isArray(data.pastReservations)) data.pastReservations = [];
  data.pastReservations.unshift(reservation);

  let shared = [];
  try { shared = JSON.parse(localStorage.getItem(HOURYOUMARU_SHARED_RESERVATION_KEY) || "[]"); }
  catch (_) { shared = []; }
  if (Array.isArray(shared)) {
    const sharedReservation = shared.find((item) => item.id === reservationId);
    if (sharedReservation) {
      sharedReservation.status = "通常キャンセル";
      sharedReservation.cancelledAt = reservation.cancelledAt;
      localStorage.setItem(HOURYOUMARU_SHARED_RESERVATION_KEY, JSON.stringify(shared));
    }
  }

  if (reservation.tripId) {
    const overrideKey = "horyomaruTripReservationDelta";
    let overrides = {};
    try { overrides = JSON.parse(localStorage.getItem(overrideKey) || "{}"); }
    catch (_) { overrides = {}; }
    overrides[reservation.tripId] = Number(overrides[reservation.tripId] || 0) - Number(reservation.partySize || 0);
    if (overrides[reservation.tripId] === 0) delete overrides[reservation.tripId];
    localStorage.setItem(overrideKey, JSON.stringify(overrides));
  }

  const notificationsKey = "horyomaruAdminNotifications";
  let notifications = [];
  try { notifications = JSON.parse(localStorage.getItem(notificationsKey) || "[]"); }
  catch (_) { notifications = []; }
  if (!Array.isArray(notifications)) notifications = [];
  notifications.unshift({
    id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    message: "予約がキャンセルされました。",
    detail: `${data.account?.nameKanji || "利用者"}様／${String(reservation.date || "").replaceAll("-", "/")} ${reservation.tripType || ""}`,
    type: "cancel",
    read: false
  });
  localStorage.setItem(notificationsKey, JSON.stringify(notifications));
  localStorage.setItem(HOURYOUMARU_STORAGE_KEY, JSON.stringify(data));
  return true;
}

function getReservationId() {
  const params = new URLSearchParams(location.search);
  return params.get("id") || loadHouryoumaruData().reservations[0]?.id || "";
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

function isValidPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

function formatPostalCode(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 7);
  return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

function isValidPostalCode(value) {
  return /^\d{3}-?\d{4}$/.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
