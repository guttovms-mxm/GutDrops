document.addEventListener("DOMContentLoaded", function() {

	const testQueryString = window.location.search;
	const testUrlParams = new URLSearchParams(testQueryString);
	const pageParam = testUrlParams.get('funnelid');
	const buylinks = document.querySelectorAll('.buylink');
	var funnelId = document.querySelector("body").dataset.funnel;

	if (pageParam) {
		addParameter(pageParam);
	} else if (funnelId) {
		addParameter(funnelId);
	} else {
		return;
	}

	function addParameter(idsource) {
		buylinks.forEach(link => {
			const buyurl = new URL(link.href);
			buyurl.searchParams.set('funnelid', idsource);
			link.href = buyurl.toString();
		});
	}
});