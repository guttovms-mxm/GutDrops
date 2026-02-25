// Seleciona a div que deve ficar visível antes da contagem começar
const esconderDiv = document.querySelector('.after-quiz');

// Seleciona todos os elementos com a classe "countdown"
const countdownElements = document.querySelectorAll('.countdown');

// Inicializa o valor inicial da contagem regressiva (usando o primeiro elemento como referência)
let remainingValue = countdownElements.length > 0 ? parseInt(countdownElements[0].textContent, 10) : 0;

// Função para gerar um intervalo aleatório entre 10 e 30 segundos
const getRandomInterval = () => Math.floor(Math.random() * 20000) + 10000; // Entre 10000ms (10s) e 30000ms (30s)

// Função para iniciar a contagem regressiva sincronizada
const startCountdown = () => {
	const updateCountdown = () => {
		if (remainingValue > 0) {
			remainingValue--; // Decrementa o valor global

			// Atualiza todos os elementos simultaneamente
			countdownElements.forEach(el => el.textContent = remainingValue);

			// Agendar próxima atualização com intervalo aleatório
			setTimeout(updateCountdown, getRandomInterval());
		}
	};

	// Inicia a contagem
	setTimeout(updateCountdown, getRandomInterval());
};

// Verifica se a div deixou de ter display: none
const checkVisibility = setInterval(() => {
	if (window.getComputedStyle(esconderDiv).display !== 'none') {
		clearInterval(checkVisibility); // Para de verificar
		startCountdown(); // Inicia a contagem regressiva
		var buyTimer = setInterval(bottlesBuying, 12000);
		console.log("active")
	}
}, 500); // Verifica a cada meio segundo