document.addEventListener("DOMContentLoaded", function () {

	const kits = ['kit1', 'kit2', 'kit3'];
	const kitClassToStorageKey = {
		kit1: 'k1',
		kit2: 'k2',
		kit3: 'k3'
	};
	const urlParams = new URLSearchParams(window.location.search);
	const kitParam = urlParams.get('kit');
	const links = document.querySelectorAll('.buylink');

	// Atualiza URLs dos botões e salva no localStorage
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

		// Se nenhum kit está na classe, mas há kitParam vindo da URL, repassa
		if (kitParam && kits.includes(kitParam)) {
			url.searchParams.set('kit', kitParam);
			link.href = url.toString();
		}
	});

	// Esconde tudo relacionado a kits
	kits.forEach(kit => {
		const key = kitClassToStorageKey[kit];
		document.querySelectorAll(`.${key}`).forEach(el => {
			el.style.display = 'none';
		});
	});

	// Determina qual kit mostrar
	let selectedKitKey = null;

	if (kitParam && kits.includes(kitParam)) {
		selectedKitKey = kitClassToStorageKey[kitParam];
	} else {
		selectedKitKey = localStorage.getItem('selectedKit');
	}

	if (selectedKitKey) {
		document.querySelectorAll(`#${selectedKitKey}`).forEach(el => {
			el.style.display = 'block';
		});
	}

});
