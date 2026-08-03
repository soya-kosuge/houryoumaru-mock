(() => {
  const PROFILE_KEY='horyomaruProfile', TRIP_KEY='horyomaruSelectedTrip', RES_KEY='horyomaruReservation';
  const $=s=>document.querySelector(s); const params=new URLSearchParams(location.search);
  const getProfile=()=>JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');
  const getTrip=()=>JSON.parse(sessionStorage.getItem(TRIP_KEY)||'null');
  const redirectSchedule=()=>location.href='shipScheduleList.html';

  if ($('#first-login-form')) {
    const mode = params.get('mode') === 'line' ? 'line' : 'first';
    const firstLoginArea = $('#first-login-area');
    const lineLoginArea = $('#line-login-area');
    const loginTitle = $('#login-title');
    const loginLead = $('#login-lead');

    if (mode === 'line') {
      firstLoginArea.hidden = true;
      lineLoginArea.hidden = false;
      loginTitle.textContent = 'LINEログイン';
      loginLead.textContent = '2回目以降はLINEログインだけで出船予定へ進みます。';
    } else {
      firstLoginArea.hidden = false;
      lineLoginArea.hidden = true;
      loginTitle.textContent = '初回ログイン';
      loginLead.textContent = '初回のみ、名前・メールアドレス・パスワードを入力してください。';
    }

    $('#first-login-form')?.addEventListener('submit', (event) => {
      event.preventDefault();

      const form = new FormData(event.currentTarget);
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        name: form.get('name'),
        email: form.get('email')
      }));

      redirectSchedule();
    });

    $('#line-login-button')?.addEventListener('click', () => {
      const button = $('#line-login-button');
      const loading = $('#loading-message');

      button.disabled = true;
      $('#line-login-actions').hidden = true;
      loading.hidden = false;

      // 2回目ログインだけを単体確認した場合でも、
      // 予約フローを続けられるようMOCK用プロフィールを用意する。
      if (!getProfile()) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
          name: 'LINEユーザー',
          email: 'line-user@example.com'
        }));
      }

      window.setTimeout(redirectSchedule, 1200);
    });
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
