var TorrentStatus = {
    STARTED: 1,
    CHECKING: 2,
    CHECKED: 8,
    ERROR: 16,
    PAUSED: 32,
    QUEUED: 64,
    LOADED: 128
};

function showAndCreateAutoClosingAlert(selector, delay) {
    $(selector).show();
    window.setTimeout(function() { $(selector).hide(); }, delay);
}

function checkBit(val, pos) {
    return val & (1<<(pos));
}

function isStatusSet(val, status) {
    return val & status;
}