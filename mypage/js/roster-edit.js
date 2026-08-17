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
fields.gender.value = data.roster?.gender || "男性";
fields.emergency.value = data.roster?.emergency || "";

fields.postalCode.addEventListener("input", () => { fields.postalCode.value = formatPostalCode(fields.postalCode.value); });

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
