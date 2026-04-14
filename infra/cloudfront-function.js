var crypto = require("crypto");

var HMAC_SECRET = "66bf50f58a65c5d4e11fb1ebc3761534683e2ba4adbb75fdda6c40ca7f00984e";

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.indexOf("/p/3f86c2c3fd84") === 0) {
    if (uri === "/p/3f86c2c3fd84" || uri === "/p/3f86c2c3fd84/") {
      request.uri = "/p/3f86c2c3fd84/index.html";
    }
    return request;
  }

  if (uri.indexOf("/p/e937187b865c") === 0) {
    return request;
  }

  var match = uri.match(/^\/p\/([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\/?$/);
  if (!match) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  var payload = match[1];
  var sig = match[2];

  var hmac = crypto.createHmac("sha256", HMAC_SECRET);
  hmac.update(payload);
  var digest = hmac.digest();

  var truncated = digest.slice(0, 10);
  var expectedSig = truncated.toString("base64url");

  if (sig !== expectedSig) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  var decoded = Buffer.from(payload, "base64url").toString();
  var expiry = parseInt(decoded, 10);
  if (isNaN(expiry)) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  if (Date.now() / 1000 > expiry) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  request.uri = "/p/e937187b865c/index.html";
  return request;
}
