const data = loadHouryoumaruData();
const fields = {
  nameKanji: document.getElementById("nameKanji"),
  nameKana: document.getElementById("nameKana"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone")
};

fields.nameKanji.value = data.account?.nameKanji || "";
fields.nameKana.value = data.account?.nameKana || "";
fields.email.value = data.account?.email || "";
fields.phone.value = data.account?.phone || "";

fields.phone.addEventListener("input", () => {
  fields.phone.value = formatPhone(fields.phone.value);
});

document.getElementById("accountEditForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isValidPhone(fields.phone.value)) {
    alert("電話番号は10桁または11桁で入力してください。");
    return;
  }
  data.account = {
    nameKanji: fields.nameKanji.value.trim(),
    nameKana: fields.nameKana.value.trim(),
    email: fields.email.value.trim(),
    phone: formatPhone(fields.phone.value)
  };
  saveHouryoumaruData(data);
  location.href = "./index.html";
});
