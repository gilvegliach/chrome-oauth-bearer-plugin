
var urlPatterns;
var authUrl;
var userName;
var password;
var token;
var fixedToken;

function fetchToken() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', authUrl, true, userName, password);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            token = xhr.responseText.replace("\n", "");
        }
    }
    xhr.send(null);
}

function init() {
    chrome.storage.sync.get({
        url: '<unknown>',
        username: '<unknown>',
        password: '<unknown>',
        authURL: '<unknown>'

    }, function(items) {
        urlPatterns = items.url;
        userName = items.username;
        authUrl = items.authURL;
        password = items.password;
        fetchToken();
    });
}

function updateSetting (url_pattern, user_name, auth_url, pass_word) {
    urlPatterns = url_pattern;
    authUrl = auth_url;
    userName = user_name;
    password = pass_word;
    fetchToken();
}

function startsWithPattern(input, pattern) {
	pattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
	pattern = pattern.replace(/\*/g, ".*");
	pattern = "^" + pattern;
	return input.match(pattern);
}

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    if (token && urlPatterns) {
        var urlPatternsArray =  urlPatterns.split("\n")
        var match = false;
        for (i = 0; i < urlPatternsArray.length; i++) {
            if (startsWithPattern(details.url, urlPatternsArray[i])) {
                match = true;
                break;
            }
        }
        if (match) {
            console.log("Setting Authorization Header.");
            details.requestHeaders.push({name:"Authorization",value:"Bearer " + token});
        }
    }
    return {requestHeaders: details.requestHeaders};
},
{"urls":["*://*/*"]},
["requestHeaders", "blocking"]);

chrome.alarms.onAlarm.addListener(function(alarm){
    fetchToken();
});

init()

chrome.alarms.create("refresh_token", {periodInMinutes:40});


