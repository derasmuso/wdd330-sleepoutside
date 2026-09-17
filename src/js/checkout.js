// src/js/checkout.js
import { getLocalStorage, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

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

function renderOrderSummary() {
  const cart = getLocalStorage("so-cart") || [];
  const itemsContainer = document.getElementById("checkoutItems");
  const totalElement = document.getElementById("checkoutTotal");

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    if (totalElement) totalElement.textContent = "$0.00";
    return;
  }

  let html = `<ul class="checkout-items-list">`;
  cart.forEach((item) => {
    const price = item.FinalPrice || item.ListPrice || item.Price || 0;
    const quantity = item.quantity || 1;
    const subtotal = price * quantity;
    html += `
      <li>
        <span>${item.Name || "Product"} (x${quantity})</span>
        <span>$${subtotal.toFixed(2)}</span>
      </li>
    `;
  });
  html += `</ul>`;

  itemsContainer.innerHTML = html;

  if (totalElement) {
    totalElement.textContent = `$${calculateTotal().toFixed(2)}`;
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const cart = getLocalStorage("so-cart") || [];
  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    return;
  }
  const form = event.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  alert("Order placed successfully! Thank you for your purchase.");
  localStorage.removeItem("so-cart");
  window.location.href = "/index.html";
}

function initCheckout() {
  renderOrderSummary();
  const form = document.getElementById("checkoutForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
}

document.addEventListener("DOMContentLoaded", initCheckout);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCheckout);
} else {
  initCheckout();
}