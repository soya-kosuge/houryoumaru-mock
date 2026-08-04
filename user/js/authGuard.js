'use strict';

const REGISTERED_KEY = 'horyomaruMockRegistered';

if (localStorage.getItem(REGISTERED_KEY) !== 'true') {
    location.replace('firstRegistration.html');
}
