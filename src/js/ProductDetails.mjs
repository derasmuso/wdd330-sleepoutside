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

  // src/js/ProductDetails.mjs

  renderProductDetails() {
    const main = document.querySelector('main');
    if (!main) return;

    // SAFELY EXTRACT DATA - handle objects vs strings
    // Brand - might be an object with a Name property
    let brand = '';
    if (this.product.Brand) {
      if (typeof this.product.Brand === 'string') {
        brand = this.product.Brand;
      } else if (this.product.Brand.Name) {
        brand = this.product.Brand.Name;
      } else if (this.product.Brand.brandName) {
        brand = this.product.Brand.brandName;
      } else {
        brand = JSON.stringify(this.product.Brand);
      }
    }

    // Price - check multiple possible field names
    let price = 0;
    if (this.product.FinalPrice !== undefined && this.product.FinalPrice !== null) {
      price = this.product.FinalPrice;
    } else if (this.product.Price !== undefined && this.product.Price !== null) {
      price = this.product.Price;
    } else if (this.product.price !== undefined && this.product.price !== null) {
      price = this.product.price;
    }
    price = typeof price === 'number' ? price : parseFloat(price) || 0;

    // Color - check multiple possible field names
    let color = '';
    if (this.product.Colors && Array.isArray(this.product.Colors) && this.product.Colors.length > 0) {
      color = this.product.Colors[0].ColorName || this.product.Colors[0].colorName || '';
    } else if (this.product.Color) {
      color = typeof this.product.Color === 'string' ? this.product.Color : this.product.Color.Name || '';
    }

    // Description - check multiple possible field names
    let description = 'No description available.';
    if (this.product.Description) {
      description = this.product.Description;
    } else if (this.product.description) {
      description = this.product.description;
    } else if (this.product.LongDescription) {
      description = this.product.LongDescription;
    }

    // Image - check multiple possible field names
    let image = '/images/placeholder.jpg';
    if (this.product.Image) {
      image = this.product.Image;
    } else if (this.product.image) {
      image = this.product.image;
    } else if (this.product.Images && Array.isArray(this.product.Images) && this.product.Images.length > 0) {
      image = this.product.Images[0];
    }

    // Name
    const name = this.product.Name || this.product.name || 'Product';

    // ID
    const id = this.product.Id || this.product.id || '';

    // Build the HTML
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