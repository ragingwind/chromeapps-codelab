'use strict';
document.addEventListener('DOMContentLoaded', function() {
    // Request or reading cache a token
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        console.log(token);
    });
}, false);
