
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
      id: "R20260815001",
      date: "2026-09-15",
      tripType: "半夜便",
      departureTime: "18:00",
      unitPrice: 13000,
      rentalRodUnitPrice: 0,
      target: "マイカ・ムギイカ",
      partySize: 3,
      rentalRods: 2,
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
    date: item.dateKey || String(item.date || "").replaceAll("/", "-"),
    tripType: item.course || item.tripType || "---",
    departureTime: item.departureTime || item.time || "---",
    target: item.target || "---",
    partySize,
    rentalRods: Number(item.rentalRod ?? item.rentalRods ?? 0),
    unitPrice: Number(item.unitPrice || item.pricePerPerson || 13000),
    rentalRodUnitPrice: Number(item.rentalRodUnitPrice || 0),
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

  const byId = new Map((data.reservations || []).map((r) => [r.id, r]));
  shared.forEach((item) => {
    const normalized = normalizeSharedReservation(item, data);
    const existing = byId.get(normalized.id);
    if (existing) Object.assign(existing, normalized);
    else {
      data.reservations.push(normalized);
      byId.set(normalized.id, normalized);
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
      date: String(r.date || "").replaceAll("-", "/"),
      dateKey: r.date || "",
      course: r.tripType,
      departureTime: r.departureTime,
      target: r.target,
      name: data.account?.nameKanji || r.representative?.name || "---",
      nameKana: data.account?.nameKana || "",
      participants: Number(r.partySize || 0),
      rentalRod: Number(r.rentalRods || 0),
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
    return ensureRosterStartsUnregistered(applyEmergencyRelationMigration(applyPostalCodeMigration(migrateYamadaAddress(mergeSharedReservations(structuredClone(DEFAULT_DATA))))));
  }
  try {
    return ensureRosterStartsUnregistered(applyEmergencyRelationMigration(applyPostalCodeMigration(migrateYamadaAddress(mergeSharedReservations(JSON.parse(stored))))));
  } catch (_) {
    localStorage.setItem(HOURYOUMARU_STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return ensureRosterStartsUnregistered(applyEmergencyRelationMigration(applyPostalCodeMigration(migrateYamadaAddress(mergeSharedReservations(structuredClone(DEFAULT_DATA))))));
  }
}

function saveHouryoumaruData(data) {
  localStorage.setItem(HOURYOUMARU_STORAGE_KEY, JSON.stringify(data));
  syncReservationsToShared(data);
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
