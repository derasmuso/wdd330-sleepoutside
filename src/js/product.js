<<<<<<< HEAD
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
=======
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  const cartItems = getLocalStorage("so-cart") || [];
  cartItems.push(product);
  setLocalStorage("so-cart", cartItems);
}
// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
>>>>>>> 301d1cfd77470fe2fab472cb17786332eb8d2e84
