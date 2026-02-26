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
	const customParam = urlParams.get('custom'); // Parâmetro custom da Digistore24
	const links = document.querySelectorAll('.buylink');

	// Variáveis para cartpanda
	const variant = urlParams.get('variant');
	const bodyClassList = document.body.classList;
	let variantKit = null;
	const bodyId = document.body.id;

	if (bodyClassList.contains('cartpanda') && !variant && !kitParam && bodyId === "upsell1") {
		// Define o kit padrão como 'kit3'
		const defaultKit = 'kit3';

		// Primeiro, esconde tudo relacionado a kits
		kits.forEach(kit => {
			const key = kitClassToStorageKey[kit]; // 'k1', 'k2', 'k3'
			document.querySelectorAll(`.${key}`).forEach(el => {
				el.style.display = 'none';
			});
		});

		// Atualiza todos os links para incluir o kit padrão, se ainda não tiverem
		links.forEach(link => {
			if (!(link instanceof HTMLAnchorElement)) return;

			const url = new URL(link.href);
			if (!url.searchParams.has('kit')) {
				url.searchParams.set('kit', defaultKit);
				link.href = url.toString();
			}
		});

		// Atualiza a URL atual da página, se ainda não tiver o parâmetro 'kit'
		const url = new URL(window.location.href);
		if (!url.searchParams.has('kit')) {
			url.searchParams.set('kit', defaultKit);
			window.location.replace(url.toString());
		}

		// Salva o kit padrão no localStorage
		localStorage.setItem('selectedKit', kitClassToStorageKey[defaultKit]);

		// Exibe o conteúdo correspondente ao kit padrão
		const selectedKitKey = kitClassToStorageKey[defaultKit];
		document.querySelectorAll(`#${selectedKitKey}`).forEach(el => {
			el.style.display = 'block';
		});
	}

	// Callback para kits cartpanda
	if (bodyClassList.contains('cartpanda') && variant && !kitParam) {

		// Mapeamento de variant IDs para kits
		const variantToKitMap = {
			//Alterar conforme código do produto na Cartpanda
			//'184927172': 'kit1', 
			//'184927173': 'kit2',
			//'184927174': 'kit3',
			// Novos IDs
			
		};

		// Primeiro, esconde tudo relacionado a kits
		kits.forEach(kit => {
			const key = kitClassToStorageKey[kit]; // 'k1', 'k2', 'k3'
			document.querySelectorAll(`.${key}`).forEach(el => {
				el.style.display = 'none';
			});
		});

		// Usa o mapa de variant IDs para determinar o kit
		variantKit = variantToKitMap[variant];

		if (variantKit) {
			links.forEach(link => {
				if (!(link instanceof HTMLAnchorElement)) return;

				const url = new URL(link.href);
				if (!url.searchParams.has('kit')) {
					url.searchParams.set('kit', variantKit);
					link.href = url.toString();
				}
			});

			const url = new URL(window.location.href);
			if (!url.searchParams.has('kit')) {
				url.searchParams.set('kit', variantKit);
				window.location.replace(url.toString());
			}

			localStorage.setItem('selectedKit', kitClassToStorageKey[variantKit]);
		}

		if (!selectedKitKey && kitParam && kits.includes(kitParam)) {
			selectedKitKey = kitClassToStorageKey[kitParam];
		}

		if (!selectedKitKey) {
			selectedKitKey = localStorage.getItem('selectedKit');
		}

		if (selectedKitKey) {
			document.querySelectorAll(`#${selectedKitKey}`).forEach(el => {
				el.style.display = 'block';
			});
		}
	}

	// Atualiza URLs dos botões e salva no localStorage
	links.forEach(link => {
		if (!(link instanceof HTMLAnchorElement)) return;

		const url = new URL(link.href);

		// Se o link tem uma das classes de kit, adiciona param e localStorage
		for (const kit of kits) {
			if (link.classList.contains(kit)) {
				url.searchParams.set('kit', kit);
				link.href = url.toString();

				link.addEventListener('click', () => {
				localStorage.setItem('selectedKit', kitClassToStorageKey[kit]);
				});

				return; // não precisa checar outras classes
			}
		}

		// Se nenhum kit está na classe, mas há kitParam vindo da URL, repassa
		if (kitParam && kits.includes(kitParam)) {
			url.searchParams.set('kit', kitParam);
			link.href = url.toString();
		}
	});

	// Primeiro, esconde tudo relacionado a kits
	kits.forEach(kit => {
		const key = kitClassToStorageKey[kit]; // 'k1', 'k2', 'k3'
		document.querySelectorAll(`.${key}`).forEach(el => {
		el.style.display = 'none';
		});
	});
	
	// Determina qual kit mostrar
	let selectedKitKey = null;

	if (!kitParam && customParam) { // Verificar se tem o parâmetro custom da Digistore24
		const match = customParam.match(/kit-(kit\d+)/); // Ex: "kit1", "kit2"
		if (match && kits.includes(match[1])) {
			selectedKitKey = kitClassToStorageKey[match[1]];
		}
	} else if (kitParam && kits.includes(kitParam)) {
		selectedKitKey = kitClassToStorageKey[kitParam]; // Ex: kit1 → k1
	} else {
		selectedKitKey = localStorage.getItem('selectedKit'); // Ex: k1, k2, k3
	}

	if (selectedKitKey) {
		document.querySelectorAll(`#${selectedKitKey}`).forEach(el => {
			el.style.display = 'block';
		});
	}

});