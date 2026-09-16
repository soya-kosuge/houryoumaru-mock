'use strict';

(() => {
  const registeredKey = 'horyomaruMockRegistered';
  if (localStorage.getItem(registeredKey) === 'true') return;
  location.replace('../user/signin.html?returnTo=mypage');
})();
