document.addEventListener("DOMContentLoaded", function() {

	const cbUrlParams = new URLSearchParams(window.location.search);
	const pageParam = cbUrlParams.get('pg');
	const customParam = cbUrlParams.get('custom');
	const links = document.querySelectorAll('.buylink');
	const copyb = document.querySelectorAll("#copyb");
	const copyw = document.querySelectorAll("#copyw");
	const hiddenContent = document.querySelectorAll(".esconder");

	if (pageParam == 'cyb' || (customParam && customParam.includes('cyb')) || ['vsl', 'dtc', 'ecom'].includes(document.body.id)) {

		copyb.forEach(e => e.style.display = "block");
		copyw.forEach(e => e.style.display = "none");

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
