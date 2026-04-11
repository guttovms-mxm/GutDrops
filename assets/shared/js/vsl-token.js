var VSL_TOKEN = "6b9f350817";
var VSL_WHITE_ID = "69da633a9aeab139827b25a4";
var VSL_BLACK_ID = "69da7453b4a3becf5f2c3050";
var VSL_ACCOUNT_ID = "51d04e67-3aad-457f-a49d-b873717030f8";

(function () {
  var h = window.location.hash.replace("#", "");
  window.VSL_VIDEO_ID = (h === VSL_TOKEN) ? VSL_BLACK_ID : VSL_WHITE_ID;
  history.replaceState(null, "", window.location.pathname);

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
