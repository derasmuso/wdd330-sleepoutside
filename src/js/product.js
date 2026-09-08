// src/js/product.js
import { getParam } from './utils.mjs';
import ProductData from './ProductData.mjs';
import ProductDetails from './ProductDetails.mjs';

// Get product ID from URL
const productId = getParam('product');

// If no product ID, show message
if (!productId) {
  console.warn('No product ID provided in URL');
  document.querySelector('main').innerHTML = `
    <section class="product-not-found">
      <h2>No Product Selected</h2>
      <p>Please select a product from the <a href="../index.html">homepage</a>.</p>
    </section>
  `;
} else {
  // Create data source instance for tents
  const dataSource = new ProductData('tents');
  
  // Create product details instance
  const product = new ProductDetails(productId, dataSource);
  
  // Initialize the product page
  product.init();
}