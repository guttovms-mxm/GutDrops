document.addEventListener("DOMContentLoaded", function() {

	const cbQueryString = window.location.search;
	const cbUrlParams = new URLSearchParams(cbQueryString);
	const pageParam = cbUrlParams.get('pg');
	const customParam = cbUrlParams.get('custom');
	const afidParam = cbUrlParams.get('afid');
	const links = document.querySelectorAll('.buylink');
	const copyb = document.querySelectorAll("#copyb");
	const copyw = document.querySelectorAll("#copyw");
	const hiddenContent = document.querySelectorAll(".esconder");
	const bodyClassList = document.body.classList;

	if (bodyClassList.contains('cartpanda') && afidParam) {
		links.forEach(link => {
			if (link instanceof HTMLAnchorElement) {
				const url = new URL(link.href);
				url.searchParams.set('pg', 'cyb');
				link.href = url.toString();
			}
		});

		const url = new URL(window.location.href);
		if (!url.searchParams.has('pg')) {
			url.searchParams.set('pg', 'cyb');
			window.location.replace(url.toString());
		}

		copyb.forEach(e => e.style.display = "block");
		copyw.forEach(e => e.style.display = "none");

		if (hiddenContent) hiddenContent.forEach(e => e.style.display = "none");
	}

	if (pageParam == 'cyb' || (customParam && customParam.includes('cyb')) || ['vsl', 'dtc', 'ecom'].includes(document.body.id)) {

		if (copyb) {
			copyb.forEach(e => e.style.display = "block");
			copyw.forEach(e => e.style.display = "none");
		}

		if (hiddenContent) hiddenContent.forEach(e => e.style.display = "none");

		links.forEach(link => {
			if (link instanceof HTMLAnchorElement) {
				const url = new URL(link.href);
				url.searchParams.set('pg', 'cyb');
				link.href = url.toString();
			}
		});
	} else {
		copyb.forEach(e => e.remove());
	}

});
