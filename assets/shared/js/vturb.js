/*
 Vturb CTA Callback
 Shows hidden content when VTurb CTA (Call to Action) becomes visible,
 then hides the CTA button itself.
*/

document.addEventListener("DOMContentLoaded", function () {
	var CLASS_TO_DISPLAY = ".esconder";
	var STORAGE_KEY = "slimfix_cta_displayed";
	var CTA_SELECTOR = ".smartplayer-anchor-button";
	var elsDisplayed = false;
	var elsHidden = document.querySelectorAll(CLASS_TO_DISPLAY);
	var elsHiddenList = [];

	setTimeout(function () { elsHiddenList = Array.prototype.slice.call(elsHidden); }, 0);

	var hideCTAButton = function () {
		var els = document.querySelectorAll(CTA_SELECTOR);
		els.forEach(function (el) {
			el.style.display = "none";
			if (el.parentElement) el.parentElement.style.display = "none";
		});
	};

	var showHiddenElements = function () {
		if (elsDisplayed) return;
		elsDisplayed = true;
		elsHiddenList.forEach(function (e) { e.style.display = "block"; });
		hideCTAButton();
		try {
			localStorage.setItem(STORAGE_KEY, "true");
		} catch (e) {
			console.warn("Failed to save data in localStorage: ", e);
		}
	};

	// Check if user already saw the content before
	var alreadyDisplayed = null;
	try {
		alreadyDisplayed = localStorage.getItem(STORAGE_KEY);
	} catch (e) {
		console.warn("Failed to read data from localStorage: ", e);
	}

	if (alreadyDisplayed === "true") {
		setTimeout(function () {
			showHiddenElements();
			hideCTAButton();
		}, 100);
		return;
	}

	// Poll for VTurb CTA button visibility
	var checkInterval = setInterval(function () {
		if (elsDisplayed) {
			clearInterval(checkInterval);
			return;
		}
		var el = document.querySelector(CTA_SELECTOR);
		if (el && el.offsetParent !== null && el.offsetHeight > 0) {
			showHiddenElements();
			clearInterval(checkInterval);
		}
	}, 500);
});
