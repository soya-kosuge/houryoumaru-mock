'use strict';

const SESSION_LOGIN_KEY = 'horyomaruMockSessionLoggedIn';

if (sessionStorage.getItem(SESSION_LOGIN_KEY) !== 'true') {
    location.replace('signin.html');
}
