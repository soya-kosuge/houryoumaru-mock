'use strict';

document.querySelectorAll('.logo').forEach((logo) => {
    logo.addEventListener('error', () => {
        logo.hidden = true;
    });
});

// Webアプリ内で「出船情報」と「マイページ」を自由に行き来できる共通導線。
document.querySelectorAll('.site-header .header-inner').forEach((header) => {
    if (header.querySelector('.user-header-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'user-header-nav';
    nav.setAttribute('aria-label', 'ユーザーメニュー');
    nav.innerHTML = `
        <a href="shipScheduleList.html">出船情報</a>
        <a href="../mypage/index.html">マイページ</a>
    `;
    header.appendChild(nav);
});
