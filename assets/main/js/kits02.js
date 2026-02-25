document.addEventListener("DOMContentLoaded", function () {

	const kits = ['kit1', 'kit2', 'kit3'];
	const kitClassToStorageKey = {
		kit1: 'k1',
		kit2: 'k2',
		kit3: 'k3'
	};
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const kitParam = urlParams.get('kit');
	const links = document.querySelectorAll('.buylink');

	links.forEach(link => {
		if (!(link instanceof HTMLAnchorElement)) return;

		const url = new URL(link.href);

		for (const kit of kits) {
			if (link.classList.contains(kit)) {
				url.searchParams.set('kit', kit);
				link.href = url.toString();

				link.addEventListener('click', () => {
				localStorage.setItem('selectedKit', kitClassToStorageKey[kit]);
				});

				return;
			}
		}

		if (kitParam && kits.includes(kitParam)) {
			url.searchParams.set('kit', kitParam);
			link.href = url.toString();
		}
	});

	kits.forEach(kit => {
		const key = kitClassToStorageKey[kit];
		document.querySelectorAll(`.${key}`).forEach(el => {
		el.style.display = 'none';
		});
	});

	let selectedKitKey = null;

	if (kitParam && kits.includes(kitParam)) selectedKitKey = kitClassToStorageKey[kitParam];
	else selectedKitKey = localStorage.getItem('selectedKit');

	if (selectedKitKey) {
		document.querySelectorAll(`#${selectedKitKey}`).forEach(el => {
			el.style.display = 'block';
		});
	}

});
