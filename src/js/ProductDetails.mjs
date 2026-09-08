// src/js/ProductDetails.mjs
import { setLocalStorage, getLocalStorage, convertToCurrency } from './utils.mjs';

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      // Get product details from the data source
      this.product = await this.dataSource.findProductById(this.productId);
      
      if (!this.product) {
        this.renderNotFound();
        return;
      }

      // Render the product details
      this.renderProductDetails();

      // Add event listener to Add to Cart button
      const addToCartButton = document.getElementById('addToCart');
      if (addToCartButton) {
        addToCartButton.addEventListener('click', this.addToCart.bind(this));
      }

    } catch (error) {
      console.error('Error initializing product details:', error);
      this.renderError();
    }
  }

  renderProductDetails() {
    const productContainer = document.querySelector('main');
    
    // Build the product HTML
    const productHTML = `
      <section class="product-detail">
        <div class="product-image">
          <img src="${this.product.Image}" alt="${this.product.Name}" loading="lazy">
        </div>
        <div class="product-info">
          <h1 class="product-name">${this.product.Name}</h1>
          <p class="product-brand">${this.product.Brand || 'Outdoor Gear'}</p>
          <p class="product-price">${convertToCurrency(this.product.Price)}</p>
          <p class="product-description">${this.product.Description || 'No description available.'}</p>
          
          <div class="product-actions">
            <button id="addToCart" class="btn btn-primary">
              <span class="icon">🛒</span> Add to Cart
            </button>
          </div>
        </div>
      </section>
    `;

    // If there's an existing product container, replace it
    if (productContainer) {
      productContainer.innerHTML = productHTML;
    } else {
      // If no main element exists, create one
      const body = document.querySelector('body');
      const newMain = document.createElement('main');
      newMain.innerHTML = productHTML;
      body.appendChild(newMain);
    }
  }

  renderNotFound() {
    const productContainer = document.querySelector('main');
    const notFoundHTML = `
      <section class="product-not-found">
        <h2>Product Not Found</h2>
        <p>We're sorry, but the product you're looking for doesn't exist.</p>
        <a href="../index.html" class="btn">Return to Shop</a>
      </section>
    `;
    
    if (productContainer) {
      productContainer.innerHTML = notFoundHTML;
    }
  }

  renderError() {
    const productContainer = document.querySelector('main');
    const errorHTML = `
      <section class="product-error">
        <h2>Something Went Wrong</h2>
        <p>We're having trouble loading this product. Please try again later.</p>
        <a href="../index.html" class="btn">Return to Shop</a>
      </section>
    `;
    
    if (productContainer) {
      productContainer.innerHTML = errorHTML;
    }
  }

  addToCart() {
    // Get existing cart or create new one
    let cartItems = getLocalStorage('so-cart') || [];
    
    // Check if product already in cart
    const existingItem = cartItems.find(item => item.Id === this.product.Id);
    
    if (existingItem) {
      // If product exists, increase quantity
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      // If new product, add it with quantity 1
      this.product.quantity = 1;
      cartItems.push(this.product);
    }

    // Save to localStorage
    setLocalStorage('so-cart', cartItems);
    
    // Show feedback
    this.showAddToCartFeedback();
  }

  showAddToCartFeedback() {
    const button = document.getElementById('addToCart');
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '✓ Added to Cart!';
      button.classList.add('added');
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('added');
      }, 2000);
    }
  }
}