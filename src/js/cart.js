// src/js/cart.js
import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

// Load header and footer
loadHeaderFooter();

// Calculate cart total
function calculateTotal() {
  const cart = getLocalStorage("so-cart") || [];
  let total = 0;

  cart.forEach((item) => {
    const price = item.FinalPrice || item.ListPrice || item.Price || 0;
    const quantity = item.quantity || 1;
    total += price * quantity;
  });

  return total;
}

// Display the total
function displayTotal() {
  const totalElement = document.getElementById("cartTotal");
  const totalContainer = document.querySelector(".cart-total-container");
  const emptyMessage = document.getElementById("empty-cart-message");
  const cartContainer = document.querySelector(".product-list");

  const cart = getLocalStorage("so-cart") || [];

  if (cart.length === 0) {
    if (cartContainer) cartContainer.style.display = "none";
    if (totalContainer) totalContainer.style.display = "none";
    if (emptyMessage) emptyMessage.style.display = "block";
    return;
  }

  if (cartContainer) cartContainer.style.display = "block";
  if (totalContainer) totalContainer.style.display = "block";
  if (emptyMessage) emptyMessage.style.display = "none";

  if (totalElement) {
    const total = calculateTotal();
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
}

// Render cart items
function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const cartContainer = document.querySelector(".product-list");

  if (!cartContainer) return;

  if (cartItems.length === 0) {
    cartContainer.innerHTML = "";
    displayTotal();
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  cartContainer.innerHTML = htmlItems.join("");

  displayTotal();
  setupRemoveButtons();
}

// Cart item template — FIXED for API structure
function cartItemTemplate(item) {
  // Color
  let colorName = "N/A";
  if (item.Colors && item.Colors.length > 0) {
    colorName = item.Colors[0].ColorName || "N/A";
  }

  // Price
  let price = item.FinalPrice || item.ListPrice || item.Price || 0;
  price = typeof price === "number" ? price : parseFloat(price) || 0;

  // Image — use the new API structure
  const image =
    item.Images?.PrimaryMedium ||
    item.Images?.PrimaryLarge ||
    item.Image ||
    "/images/placeholder.jpg";

  // Quantity
  const quantity = item.quantity || 1;
  const subtotal = price * quantity;

  return `
    <li class="cart-card divider cart-item">
      <a href="#" class="cart-card__image">
        <img
          src="${image}"
          alt="${item.Name || "Product"}"
          loading="lazy"
        />
      </a>
      <div class="cart-item-details">
        <a href="#">
          <h2 class="card__name">${item.Name || "Unknown Product"}</h2>
        </a>
        <p class="cart-card__color">${colorName}</p>
        <div class="cart-item-quantity">
          <button class="qty-btn qty-minus" data-id="${item.Id}">−</button>
          <span class="qty-display">${quantity}</span>
          <button class="qty-btn qty-plus" data-id="${item.Id}">+</button>
        </div>
        <p class="cart-card__price">$${price.toFixed(2)}</p>
        <p class="cart-item-subtotal">Subtotal: $${subtotal.toFixed(2)}</p>
      </div>
      <button class="remove-item" data-id="${item.Id}">
        ✕ Remove
      </button>
    </li>
  `;
}

// Remove item from cart
function removeFromCart(productId) {
  if (!productId) return;

  let cart = getLocalStorage("so-cart") || [];
  cart = cart.filter((item) => item.Id !== productId);
  setLocalStorage("so-cart", cart);

  renderCartContents();
}

// Update quantity
function updateQuantity(productId, change) {
  if (!productId) return;

  let cart = getLocalStorage("so-cart") || [];
  const item = cart.find((i) => i.Id === productId);

  if (!item) return;

  item.quantity = (item.quantity || 1) + change;

  // Remove if quantity drops to 0
  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.Id !== productId);
  }

  setLocalStorage("so-cart", cart);
  renderCartContents();
}

function setupRemoveButtons() {
  const cartContainer = document.querySelector(".product-list");
  if (!cartContainer) return;

  // Remove existing listeners first to avoid duplicates
  const newContainer = cartContainer.cloneNode(true);
  cartContainer.parentNode.replaceChild(newContainer, cartContainer);

  newContainer.addEventListener("click", function (e) {
    // Handle remove
    const removeBtn = e.target.closest(".remove-item");
    if (removeBtn) {
      const productId = removeBtn.dataset.id;
      if (productId) removeFromCart(productId);
      return;
    }

    // Handle quantity minus
    const minusBtn = e.target.closest(".qty-minus");
    if (minusBtn) {
      const productId = minusBtn.dataset.id;
      if (productId) updateQuantity(productId, -1);
      return;
    }

    // Handle quantity plus
    const plusBtn = e.target.closest(".qty-plus");
    if (plusBtn) {
      const productId = plusBtn.dataset.id;
      if (productId) updateQuantity(productId, 1);
      return;
    }
  });
}

// Initialize cart page
function initCart() {
  renderCartContents();

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      const cart = getLocalStorage("so-cart") || [];
      if (cart.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
      }
      window.location.href = "/checkout/index.html";
    });
  }
}

// Run when page loads
document.addEventListener("DOMContentLoaded", initCart);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCart);
} else {
  initCart();
}