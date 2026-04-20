var VSL_TOKEN = "6b9f350817";
var VSL_WHITE_ID = "69da633a9aeab139827b25a4";
var VSL_BLACK_ID = "69e66f2905c3ed4453d6f760";
var VSL_ACCOUNT_ID = "51d04e67-3aad-457f-a49d-b873717030f8";

(function () {
  var STORAGE_KEY = "vsl_mode";
  var h = window.location.hash.replace("#", "");

  if (h === VSL_TOKEN) {
    try { sessionStorage.setItem(STORAGE_KEY, "b"); } catch (e) {}
  }

  var mode = null;
  try { mode = sessionStorage.getItem(STORAGE_KEY); } catch (e) {}

  window.VSL_VIDEO_ID = (mode === "b") ? VSL_BLACK_ID : VSL_WHITE_ID;
  history.replaceState(null, "", window.location.pathname + window.location.search);

  window._plt = window._plt || (
    performance && performance.timeOrigin
      ? performance.timeOrigin + performance.now()
      : Date.now()
  );

  var l = document.createElement("link");
  l.rel = "preload";
  l.href = "https://scripts.converteai.net/" + VSL_ACCOUNT_ID + "/players/" + window.VSL_VIDEO_ID + "/v4/player.js";
  l.as = "script";
  document.head.appendChild(l);
})();
