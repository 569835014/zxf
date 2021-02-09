export function isBrowserIE() {
    let document = window.document;
    return document.documentMode;
}


export function isBrowserChrome() {
    let ua  = navigator.userAgent;
    return ua.indexOf('Chrome') != -1;
}

export function isBrowserSafari(){
    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
}

export function isBrowserEdge(){
    return !isBrowserIE() && !!window.StyleMedia;
}

export function isBrowserFirefox(){
    return !isBrowserIE() && !!window.StyleMedia;
}

export function isIosDevice(){
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
