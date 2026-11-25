
import { createWatchScene } from './3D-Watch.js';

const productsContainer = document.getElementById('productsContainer');
const categoryButtons = document.querySelectorAll('[data-category]');

async function loadProducts() {
  try {
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('Products could not load');

    const products = await response.json();
    displayProducts(products);

    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;

        displayProducts(
          category === 'All'
            ? products
            : products.filter(item => item.category === category)
        );
      });
    });
  } catch (error) {
    console.error(error);
    if (productsContainer) {
      productsContainer.innerHTML =
        '<p class="text-center">Products could not load. Please use Live Server.</p>';
    }
  }
}

function displayProducts(products) {
  if (!productsContainer) return;

  productsContainer.innerHTML = products.map(product => `
    <div class="col-md-6 col-lg-4">
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}"
             onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700'">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="price">$${Number(product.price).toLocaleString()}</p>
          <button class="btn btn-outline-primary"
            onclick="showProduct('${product.id}')">View Details</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.showProduct = async function(id) {
  const response = await fetch('./products.json');
  const products = await response.json();
  const product = products.find(item => item.id === id);
  if (!product) return;

  const modalBody = document.getElementById('productModalBody');
  if (modalBody) {
    modalBody.innerHTML = `
      <img src="${product.image}" class="img-fluid rounded mb-3"
           alt="${product.name}">
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <h4>$${Number(product.price).toLocaleString()}</h4>
    `;
  }

  const modalElement = document.getElementById('productModal');
  if (modalElement && window.bootstrap) {
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }
};

const count = Number(localStorage.getItem('albertoVisitors') || 0) + 1;
localStorage.setItem('albertoVisitors', count);
const visitorElement = document.getElementById('visitorCount');
if (visitorElement) visitorElement.textContent = `Visitors: ${count}`;

function updateTicker() {
  const element = document.getElementById('liveTicker');
  if (element) {
    element.textContent = new Date().toLocaleString();
  }
}
updateTicker();
setInterval(updateTicker, 1000);

const locationElement = document.getElementById('userLocation');
if (locationElement && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      locationElement.textContent =
        `Location: ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
    },
    () => {
      locationElement.textContent = 'Location unavailable';
    }
  );
}

const watchScene = createWatchScene('watchCanvas');

document.getElementById('explodeBtn')?.addEventListener('click', () => {
  watchScene?.explode();
});

document.getElementById('assembleBtn')?.addEventListener('click', () => {
  watchScene?.assemble();
});

loadProducts();
