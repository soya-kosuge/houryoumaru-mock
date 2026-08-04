'use strict';

document.querySelectorAll('.logo').forEach((logo) => {
    logo.addEventListener('error', () => {
        logo.hidden = true;
    });
});
