(() => {
  const PROFILE_KEY='horyomaruProfile', TRIP_KEY='horyomaruSelectedTrip', RES_KEY='horyomaruReservation';
  const $=s=>document.querySelector(s); const params=new URLSearchParams(location.search);
  const getProfile=()=>JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');
  const getTrip=()=>JSON.parse(sessionStorage.getItem(TRIP_KEY)||'null');
  const redirectSchedule=()=>location.href='shipScheduleList.html';

  if ($('#first-login-form')) {
    const profile=getProfile();
    if(profile){ $('#first-login-area').hidden=true; $('#line-login-area').hidden=false; $('#login-title').textContent='LINEログイン'; $('#login-lead').textContent='2回目以降はLINEログインだけで進めます。'; }
    $('#first-login-form')?.addEventListener('submit',e=>{e.preventDefault(); const f=new FormData(e.currentTarget); localStorage.setItem(PROFILE_KEY,JSON.stringify({name:f.get('name'),email:f.get('email')})); redirectSchedule();});
    $('#line-login-button')?.addEventListener('click',()=>{ $('#line-login-button').disabled=true; $('#loading-message').hidden=false; setTimeout(redirectSchedule,900); });
  }

  if ($('#reservation-form')) {
    const profile=getProfile(); if(!profile){ location.href='signin.html'; return; }
    $('#profile-name').textContent=profile.name; $('#profile-email').textContent=profile.email;
    const trip=getTrip()||{date:params.get('date')||'2026年7月28日（火）',name:params.get('name')||'半夜便',time:params.get('time')||'18:00',target:params.get('target')||'マイカ＆ムギイカ',price:params.get('price')||'お一人様 13,000円（税込）',detail:params.get('detail')||'shipScheduleList.html'};
    sessionStorage.setItem(TRIP_KEY,JSON.stringify(trip)); $('#trip-title').textContent=`${trip.date} ${trip.name}`; $('#trip-time').textContent=trip.time; $('#trip-target').textContent=trip.target; $('#trip-price').textContent=trip.price; $('#detail-back').href=trip.detail;
    for(let i=1;i<=25;i++) $('#participants').insertAdjacentHTML('beforeend',`<option value="${i}">${i}名</option>`); for(let i=0;i<=25;i++) $('#rental-rod').insertAdjacentHTML('beforeend',`<option value="${i}">${i===0?'なし':i+'本'}</option>`);
    $('#reservation-form').addEventListener('submit',e=>{e.preventDefault(); const f=new FormData(e.currentTarget); sessionStorage.setItem(RES_KEY,JSON.stringify({participants:f.get('participants'),rentalRod:f.get('rentalRod'),remarks:f.get('remarks')||'なし'})); location.href='reservationConfirm.html';});
  }

  if ($('#confirmation-list')) {
    const profile=getProfile(), trip=getTrip(), res=JSON.parse(sessionStorage.getItem(RES_KEY)||'null'); if(!profile||!trip||!res){location.href='shipScheduleList.html';return;}
    const rows=[['予約日',trip.date],['コース',trip.name],['出船時刻',trip.time],['釣り物',trip.target],['料金',trip.price],['名前',profile.name],['メールアドレス',profile.email],['参加人数',res.participants+'名'],['貸し竿',res.rentalRod==='0'?'なし':res.rentalRod+'本'],['備考',res.remarks]];
    $('#confirmation-list').innerHTML=rows.map(([k,v])=>`<div class="confirmation-item"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  }
})();
