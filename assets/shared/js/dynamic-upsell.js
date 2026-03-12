/*
 Dynamic Upsell Page Behavior
 Switches between simple DTC (#copyw) and VSL (#copyb) content.
 Checks ?param= (ClickBank passthrough) or ?funnelid= (local testing).
 If either contains "vsl", shows #copyb (with video).
 Otherwise, shows #copyw (simple product grid).
*/

(function() {
	var urlParams = new URLSearchParams(window.location.search);
	var cbParam = urlParams.get("param") || "";
	var funnelId = urlParams.get("funnelid") || "";
	var isVSL = cbParam.toLowerCase().indexOf("vsl") !== -1 || funnelId.toLowerCase().indexOf("vsl") !== -1;
	var copyw = document.getElementById("copyw");
	var copyb = document.getElementById("copyb");

	if (!copyw || !copyb) return;

	if (isVSL) {
		// VSL funnel: show video page, hide products until CTA fires
		copyw.style.display = "none";
		copyb.style.display = "block";

		// Poll for VTurb CTA button
		var pageId = document.body.id || "upsell";
		var ctaKey = "slimfix_" + pageId + "_cta";

		if (localStorage.getItem(ctaKey) === "true") {
			// Already seen CTA, reveal immediately
			var hidden = copyb.querySelectorAll(".esconder");
			for (var i = 0; i < hidden.length; i++) {
				hidden[i].style.display = "block";
			}
		} else {
			var ctaInterval = setInterval(function() {
				var ctaBtn = document.querySelector(".smartplayer-anchor-button");
				if (ctaBtn && ctaBtn.offsetParent !== null && ctaBtn.offsetHeight > 0) {
					clearInterval(ctaInterval);
					localStorage.setItem(ctaKey, "true");
					var hidden = copyb.querySelectorAll(".esconder");
					for (var i = 0; i < hidden.length; i++) {
						hidden[i].style.display = "block";
					}
				}
			}, 500);
		}
	} else {
		// DTC funnel: show products directly, no video
		copyw.style.display = "block";
		copyb.style.display = "none";
	}
})();
