import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// Function to calculate cart total
function calculateTotal() {
  const cart = getLocalStorage("so-cart") || [];
  let total = 0;
  
  cart.forEach(item => {
    const price = item.FinalPrice || item.Price || 0;
    const quantity = item.quantity || 1;
    total += price * quantity;
  });
  
  return total;
}

// Function to display the total
function displayTotal() {
  const totalElement = document.getElementById('cartTotal');
  const totalContainer = document.querySelector('.cart-total-container');
  const emptyMessage = document.getElementById('empty-cart-message');
  const cartContainer = document.querySelector('.product-list');
  
  const cart = getLocalStorage("so-cart") || [];
  
  if (cart.length === 0) {
    // Hide cart and total, show empty message
    if (cartContainer) cartContainer.style.display = 'none';
    if (totalContainer) totalContainer.style.display = 'none';
    if (emptyMessage) emptyMessage.style.display = 'block';
    return;
  }
  
  // Show cart and total, hide empty message
  if (cartContainer) cartContainer.style.display = 'block';
  if (totalContainer) totalContainer.style.display = 'block';
  if (emptyMessage) emptyMessage.style.display = 'none';
  
  // Update total
  if (totalElement) {
    const total = calculateTotal();
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  
  // If cart is empty, show message
  if (cartItems.length === 0) {
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartContainer = document.querySelector('.product-list');
    const totalContainer = document.querySelector('.cart-total-container');
    
    if (cartContainer) cartContainer.style.display = 'none';
    if (totalContainer) totalContainer.style.display = 'none';
    if (emptyMessage) emptyMessage.style.display = 'block';
    return;
  }
  
  // Render cart items
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  const cartContainer = document.querySelector('.product-list');
  if (cartContainer) {
    cartContainer.innerHTML = htmlItems.join("");
    cartContainer.style.display = 'block';
  }
  
  // Display total
  displayTotal();
}

function cartItemTemplate(item) {
  // Safely get color name
  let colorName = '';
  if (item.Colors && item.Colors.length > 0 && item.Colors[0].ColorName) {
    colorName = item.Colors[0].ColorName;
  }
  
  // Safely get price
  const price = item.FinalPrice || item.Price || 0;
  
  // Safely get image
  const image = item.Image || '/images/placeholder.jpg';
  
  // Get quantity (default to 1)
  const quantity = item.quantity || 1;
  
  // Calculate subtotal for this item
  const subtotal = price * quantity;
  
  const newItem = `<li class="cart-card divider cart-item">
    <a href="#" class="cart-card__image">
      <img
        src="${image}"
        alt="${item.Name || 'Product'}"
        loading="lazy"
      />
    </a>
    <div class="cart-item-details">
      <a href="#">
        <h2 class="card__name">${item.Name || 'Unknown Product'}</h2>
      </a>
      <p class="cart-card__color">${colorName || 'N/A'}</p>
      <div class="cart-item-quantity">
        <label>Qty: ${quantity}</label>
      </div>
      <p class="cart-card__price">$${price.toFixed(2)}</p>
      <p class="cart-item-subtotal">Subtotal: $${subtotal.toFixed(2)}</p>
    </div>
    <button class="remove-item" data-id="${item.Id || ''}" data-index="${item.index || 0}">
      ✕ Remove
    </button>
  </li>`;

  return newItem;
}

// Function to remove item from cart
function removeFromCart(productId) {
  if (!productId) return;
  
  let cart = getLocalStorage("so-cart") || [];
  cart = cart.filter(item => item.Id !== productId);
  setLocalStorage("so-cart", cart);
  
  // Re-render the cart
  renderCartContents();
}

// Add event listener for remove buttons (event delegation)
function setupRemoveButtons() {
  document.querySelector('.product-list')?.addEventListener('click', function(e) {
    const removeBtn = e.target.closest('.remove-item');
    if (removeBtn) {
      const productId = removeBtn.dataset.id;
      if (productId) {
        removeFromCart(productId);
      }
    }
  });
}

// Initialize the cart page
function initCart() {
  renderCartContents();
  setupRemoveButtons();
  
  // Checkout button handler
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      const cart = getLocalStorage("so-cart") || [];
      if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
      }
      window.location.href = '/checkout/index.html';
    });
  }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
  initCart();
});

// Also run immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
}

// Export for use in other modules
export { calculateTotal, displayTotal, renderCartContents, removeFromCart };