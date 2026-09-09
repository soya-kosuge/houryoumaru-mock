const data = loadHouryoumaruData();
const form = document.getElementById('profileEditForm');
const fields = {
  nameKanji: document.getElementById('nameKanji'), nameKana: document.getElementById('nameKana'),
  email: document.getElementById('email'), phone: document.getElementById('phone'),
  rosterName: document.getElementById('rosterName'), postalCode: document.getElementById('postalCode'),
  address: document.getElementById('address'), addressDetail: document.getElementById('addressDetail'),
  age: document.getElementById('age'), gender: document.getElementById('gender'),
  emergency: document.getElementById('emergency'), emergencyRelation: document.getElementById('emergencyRelation')
};

fields.nameKanji.value = data.account?.nameKanji || '';
fields.nameKana.value = data.account?.nameKana || '';
fields.email.value = data.account?.email || '';
fields.phone.value = data.account?.phone || '';
fields.rosterName.value = data.roster?.name || '';
fields.postalCode.value = data.roster?.postalCode || '';
fields.address.value = data.roster?.address || '';
fields.addressDetail.value = data.roster?.addressDetail || '';
fields.age.value = data.roster?.age ?? '';
fields.gender.value = data.roster?.gender || '';
fields.emergency.value = data.roster?.emergency || '';
fields.emergencyRelation.value = data.roster?.emergencyRelation || '';

fields.phone.addEventListener('input', () => { fields.phone.value = formatPhone(fields.phone.value); });
fields.emergency.addEventListener('input', () => { fields.emergency.value = formatPhone(fields.emergency.value); });
fields.postalCode.addEventListener('input', async () => {
  fields.postalCode.value = formatPostalCode(fields.postalCode.value);
  const digits = fields.postalCode.value.replace(/\D/g, '');
  if (digits.length !== 7) return;
  const helper = document.getElementById('postalHelper');
  try {
    helper.textContent = '住所を検索しています…';
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
    if (!response.ok) throw new Error('postal lookup failed');
    const result = await response.json();
    const item = result?.results?.[0];
    if (!item) { helper.textContent = '該当する住所が見つかりませんでした。'; return; }
    fields.address.value = `${item.address1 || ''}${item.address2 || ''}${item.address3 || ''}`;
    fields.addressDetail.focus();
    helper.textContent = '住所を自動入力しました。番地・建物名を入力してください。';
  } catch (_) {
    helper.textContent = '住所を自動取得できませんでした。住所を直接入力してください。';
  }
});

let dirty = false;
let safeLeave = false;
form.addEventListener('input', () => { dirty = true; });
form.addEventListener('change', () => { dirty = true; });
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || !dirty || safeLeave) return;
  if (!confirm('入力内容が破棄されますが、よろしいですか？')) event.preventDefault();
}, true);
window.addEventListener('beforeunload', (event) => {
  if (!dirty || safeLeave) return;
  event.preventDefault(); event.returnValue = '';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!isValidPhone(fields.phone.value)) {
    alert('電話番号は10桁または11桁で入力してください。'); fields.phone.focus(); return;
  }

  const rosterValues = [fields.rosterName, fields.postalCode, fields.address, fields.addressDetail, fields.age, fields.gender, fields.emergency, fields.emergencyRelation];
  const hasRosterInput = rosterValues.some((field) => String(field.value || '').trim());
  if (hasRosterInput) {
    if (fields.postalCode.value && !isValidPostalCode(fields.postalCode.value)) {
      alert('郵便番号は7桁の数字で入力してください。'); fields.postalCode.focus(); return;
    }
    if (fields.emergency.value && !isValidPhone(fields.emergency.value)) {
      alert('緊急連絡先は10桁または11桁で入力してください。'); fields.emergency.focus(); return;
    }
  }

  // MOCKでもログイン情報と乗船名簿情報は別オブジェクト（DB想定では別テーブル）として保持する。
  data.account = {
    nameKanji: fields.nameKanji.value.trim(), nameKana: fields.nameKana.value.trim(),
    email: fields.email.value.trim(), phone: formatPhone(fields.phone.value)
  };
  data.roster = {
    name: fields.rosterName.value.trim(),
    postalCode: fields.postalCode.value ? formatPostalCode(fields.postalCode.value) : '',
    address: fields.address.value.trim(), addressDetail: fields.addressDetail.value.trim(),
    age: fields.age.value ? Number(fields.age.value) : '', gender: fields.gender.value,
    emergency: fields.emergency.value ? formatPhone(fields.emergency.value) : '',
    emergencyRelation: fields.emergencyRelation.value
  };
  saveHouryoumaruData(data);
  safeLeave = true; dirty = false;
  location.href = './index.html';
});
