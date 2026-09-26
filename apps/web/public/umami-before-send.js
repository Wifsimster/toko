// Umami hook (data-before-send). An in-app URL can carry a child UUID
// (?child=<uuid>), so the query string is dropped before sending, except the
// utm_* parameters that attribute a visit to a campaign link.
window.tokoUmamiBeforeSend = function (type, payload) {
  if (payload && typeof payload.url === "string") {
    var url = new URL(payload.url, location.origin);
    var kept = new URLSearchParams();
    url.searchParams.forEach(function (value, key) {
      if (key.indexOf("utm_") === 0) kept.append(key, value);
    });
    var query = kept.toString();
    payload.url = url.pathname + (query ? "?" + query : "");
  }
  return payload;
};
