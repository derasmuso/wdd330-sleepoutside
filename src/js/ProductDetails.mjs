import { setLocalStorage, getLocalStorage } from './utils.mjs';

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      this.product = await this.dataSource.findProductById(this.productId);
      if (!this.product) {
        this.renderNotFound();
        return;
      }
      this.renderProductDetails();
      document
        .getElementById('addToCart')
        ?.addEventListener('click', this.addToCart.bind(this));
    } catch (error) {
      console.error('Error initializing product:', error);
      this.renderError();
    }
  }

  renderProductDetails() {
    const main = document.querySelector('main');
    if (!main) return;

    // Extract data from new API structure
    const brand = this.product.Brand?.Name || '';
    const name = this.product.Name || 'Product';
    const image =
      this.product.Images?.PrimaryLarge ||
      this.product.Images?.PrimaryMedium ||
      '/images/placeholder.jpg';

    let price = 0;
    if (this.product.FinalPrice !== undefined) {
      price = this.product.FinalPrice;
    } else if (this.product.ListPrice !== undefined) {
      price = this.product.ListPrice;
    }
    price = typeof price === 'number' ? price : parseFloat(price) || 0;

    const color = this.product.Colors?.[0]?.ColorName || '';
    const description = this.product.Description || 'No description available.';
    const id = this.product.Id || '';

    main.innerHTML = `
      <section class="product-detail">
        <h3>${brand}</h3>
        <h2 class="divider">${name}</h2>
        <img class="divider" src="${image}" alt="${name}" loading="lazy">
        <p class="product-card__price">$${price.toFixed(2)}</p>
        <p class="product__color">${color}</p>
        <p class="product__description">${description}</p>
        <div class="product-detail__add">
          <button id="addToCart" data-id="${id}">Add to Cart</button>
        </div>
      </section>
    `;
  }

  addToCart() {
    const cart = getLocalStorage('so-cart') || [];
    cart.push(this.product);
    setLocalStorage('so-cart', cart);
    alert('Product added to cart! 🛒');
  }

  renderNotFound() {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <h2>Product Not Found</h2>
        <p>Please try another product from the <a href="/index.html">homepage</a>.</p>
      `;
    }
  }

  renderError() {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <h2>Error Loading Product</h2>
        <p>Please try again later.</p>
      `;
    }
  }
}