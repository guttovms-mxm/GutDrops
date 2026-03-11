// Bottles Bought
var stockNumber = 250;
const cNames = ['Jessica', 'James', 'Maria', 'Robert', 'Naomi', 'Samantha', 'Giulia', 'Joseph', 'Emmily', 'Daniel'];
const cLocals = ['California', 'Ohio', 'Pennsylvania', 'Michigan', 'Illinois', 'North Caroline', 'Georgia', 'Florida', 'Texas'];
const tBottles = [3, 6, 6];

const purchaseNotificationHTML = `
<!-- Purchase Notifications -->
<div id="purchase-notifications" class="purchases-disclaimer">
  <div class="purchases-box">
	<div class="purchased-bottle">
	  <img id="one-bottle" src="../assets/main/products/img/img-2-bottles.webp" style="display: none;">
	  <img id="three-bottles" src="../assets/main/products/img/img-3-bottles.webp" style="display: none;">
	  <img id="six-bottles" src="../assets/main/products/img/img-6-bottles.webp" style="display: none;">
	</div>
	<div class="purchase-info">
	  <span id="customer-name"></span> in <span id="customer-location"></span> just bought <span id="items-purchased"></span>!
	</div>
  </div>
</div>
<!-- END Purchase Notifications -->
`;
document.body.insertAdjacentHTML('beforeend', purchaseNotificationHTML);

function bottlesBuying() {
	const esconderDiv = document.querySelector('.esconder');

	// Se a div existe e está escondida, sai da função
	if (esconderDiv && window.getComputedStyle(esconderDiv).display === 'none') {
		return;
	}

	const randName = cNames[Math.floor(Math.random() * cNames.length)];
	const randLocal = cLocals[Math.floor(Math.random() * cLocals.length)];
	const randBottle = tBottles[Math.floor(Math.random() * tBottles.length)];

	const oneBottle = document.querySelector('#one-bottle');
	const threeBottles = document.querySelector('#three-bottles');
	const sixBottles = document.querySelector('#six-bottles');

	stockNumber -= randBottle;

	if (randBottle === 3) {
		oneBottle.style.display = 'none';
		threeBottles.style.display = 'block';
		sixBottles.style.display = 'none';
		document.querySelector('#items-purchased').innerHTML = randBottle + ' bottles';
	} else if (randBottle === 6) {
		oneBottle.style.display = 'none';
		threeBottles.style.display = 'none';
		sixBottles.style.display = 'block';
		document.querySelector('#items-purchased').innerHTML = randBottle + ' bottles';
	} else {
		oneBottle.style.display = 'block';
		threeBottles.style.display = 'none';
		sixBottles.style.display = 'none';
		document.querySelector('#items-purchased').innerHTML = randBottle + ' bottle';
	}

	document.querySelectorAll('.stock').forEach(e => e.innerHTML = stockNumber);
	document.querySelector('#customer-name').innerHTML = randName;
	document.querySelector('#customer-location').innerHTML = randLocal;
	document.querySelector('.purchases-disclaimer').style.right = '20px';

	setTimeout(() => {
		document.querySelector('.purchases-disclaimer').style.right = '-800px';
	}, 10000);

	if (stockNumber < 25) clearInterval(buyTimer);
}

var buyTimer = setInterval(bottlesBuying, 12000);