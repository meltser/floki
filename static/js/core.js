function showAndCreateAutoClosingAlert(selector, delay) {
    $(selector).show();
    window.setTimeout(function() { $(selector).hide(); }, delay);
}