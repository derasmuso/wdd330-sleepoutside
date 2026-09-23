import {
  getLocalStorage,
  loadHeaderFooter,
  setLocalStorage,
} from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart");

  if (!cartItems || cartItems.length === 0) {
    document.querySelector(".product-list").innerHTML =
      "<p>Your cart is empty.</p>";

    // Hide or clear the total if the cart is empty
    updateCartTotal([]);
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  // Calculate and display the total every time the cart is rendered
  updateCartTotal(cartItems);
}

function cartItemTemplate(item) {
  const newItem = `
    <li class="cart-card">
      <!-- Product image container -->
      <a href="#" class="cart-card__image">
        <img
          src="${item.Images.PrimarySmall}"
          alt="${item.Name}"
        />
      </a>

      <!-- Product title -->
      <h2 class="card__name">
        <a href="#">${item.Name}</a>
      </h2>

      <!-- Product color -->
      <p class="cart-card__color">
        ${item.Colors[0].ColorName}
      </p>

      <!-- Product quantity -->
      <p class="cart-card__quantity">
         qty: ${item.Quantity}
      </p>

      <!-- Container holding price and remove button side by side -->
      <div class="cart-card__price-action">
        <span class="cart-card__price">$${item.FinalPrice}</span>
        <span class="cart-card__remove" data-id="${item.Id}" title="Remove item">❌</span>
      </div>
    </li>
  `;

  return newItem;
}

// Function to calculate the total cost and display it in the DOM
function updateCartTotal(cartItems) {
  const cartFooterEl = document.querySelector(".cart-footer");
  const totalAmountEl = document.querySelector("#cart-total-amount");

  if (!cartFooterEl || !totalAmountEl) return;

  if (!cartItems || cartItems.length === 0) {
    cartFooterEl.classList.add("hide"); // Hide the total element if empty
    return;
  }

  // Cumulative sum of (Price * Quantity) for each product
  let total = 0;
  cartItems.forEach((item) => {
    total += item.FinalPrice * item.Quantity;
  });

  // Display the total formatted to 2 decimal places
  totalAmountEl.innerHTML = total.toFixed(2);
  cartFooterEl.classList.remove("hide"); // Show the total container
}

// Initialize event listener to handle item removal when clicking the "X"
function initCartRemoval() {
  const cartListElement = document.querySelector(".product-list");

  if (!cartListElement) return;

  cartListElement.addEventListener("click", (event) => {
    // Check if the clicked element is the remove trigger
    if (event.target.classList.contains("cart-card__remove")) {
      const productId = event.target.dataset.id;
      removeProductFromCart(productId);
    }
  });
}

// Filter out the selected product from LocalStorage and update the view
function removeProductFromCart(id) {
  let cartItems = getLocalStorage("so-cart") || [];

  // Filter out the item matching the product ID
  cartItems = cartItems.filter((item) => item.Id !== id);

  // Save updated array back to LocalStorage
  setLocalStorage("so-cart", cartItems);

  // Re-render the cart list on the UI
  renderCartContents();
}

renderCartContents();
loadHeaderFooter();
initCartRemoval();
