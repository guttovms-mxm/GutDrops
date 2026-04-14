var HMAC_SECRET = "66bf50f58a65c5d4e11fb1ebc3761534683e2ba4adbb75fdda6c40ca7f00984e";

async function handler(event) {
  var request = event.request;
  var uri = request.uri;

  var match = uri.match(/^\/p\/([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\/?$/);
  if (!match) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  var payload = match[1];
  var sig = match[2];

  var key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  var sigBytes = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  );

  var expectedSig = base64urlEncode(sigBytes.slice(0, 10));

  if (sig !== expectedSig) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  var expiryStr = base64urlDecode(payload);
  var expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry)) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  if (Date.now() / 1000 > expiry) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  request.uri = "/p/e937187b865c/index.html";
  return request;
}

function base64urlEncode(bytes) {
  var binary = "";
  for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}
