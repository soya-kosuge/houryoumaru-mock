const data = loadHouryoumaruData();
const fields = {
  rosterName: document.getElementById("rosterName"),
  postalCode: document.getElementById("postalCode"),
  address: document.getElementById("address"),
  age: document.getElementById("age"),
  gender: document.getElementById("gender"),
  emergency: document.getElementById("emergency")
};

fields.rosterName.value = data.roster?.name || "";
fields.postalCode.value = data.roster?.postalCode || "";
fields.address.value = data.roster?.address || "";
fields.age.value = data.roster?.age ?? "";
fields.gender.value = data.roster?.gender || "";
fields.emergency.value = data.roster?.emergency || "";

let lastLookedUpPostal = "";
fields.postalCode.addEventListener("input", async () => {
  fields.postalCode.value = formatPostalCode(fields.postalCode.value);
  const digits = fields.postalCode.value.replace(/\D/g, "");
  if (digits.length !== 7 || digits === lastLookedUpPostal) return;
  lastLookedUpPostal = digits;
  const helper = document.getElementById("postalHelper");
  try {
    if (helper) helper.textContent = "住所を検索しています…";
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
    if (!response.ok) throw new Error("postal lookup failed");
    const result = await response.json();
    const item = result?.results?.[0];
    if (!item) { if (helper) helper.textContent = "該当する住所が見つかりませんでした。"; return; }
    fields.address.value = `${item.address1 || ""}${item.address2 || ""}${item.address3 || ""}`;
    fields.address.focus();
    if (helper) helper.textContent = "住所を自動入力しました。番地・建物名などを続けて入力してください。";
  } catch (_) {
    if (helper) helper.textContent = "住所を自動取得できませんでした。住所を直接入力してください。";
  }
});

fields.emergency.addEventListener("input", () => {
  fields.emergency.value = formatPhone(fields.emergency.value);
});

document.getElementById("rosterEditForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isValidPostalCode(fields.postalCode.value)) {
    alert("郵便番号は7桁の数字で入力してください。");
    fields.postalCode.focus();
    return;
  }
  if (!isValidPhone(fields.emergency.value)) {
    alert("緊急連絡先は10桁または11桁で入力してください。");
    return;
  }
  data.roster = {
    name: fields.rosterName.value.trim(),
    postalCode: formatPostalCode(fields.postalCode.value),
    address: fields.address.value.trim(),
    age: Number(fields.age.value),
    gender: fields.gender.value,
    emergency: formatPhone(fields.emergency.value)
  };
  saveHouryoumaruData(data);
  location.href = "./index.html";
});
