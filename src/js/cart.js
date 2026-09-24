import {
  getLocalStorage,
  loadHeaderFooter,
  setLocalStorage,
} from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  const cartFooter = document.querySelector(".cart-footer");
  const cartTotal = document.querySelector(".cart-total");

  if (!productList) return;

  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is empty.</p>";

    if (cartFooter) {
      cartFooter.classList.add("hide");
    }
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  productList.innerHTML = htmlItems.join("");

  // Show the footer only when there are products in the cart.
  if (cartFooter && cartTotal) {
    const total = cartItems.reduce((sum, item) => {
      const price = Number(item.FinalPrice ?? item.ListPrice ?? 0);
      const quantity = Number(item.Quantity || 1);

      return sum + (Number.isFinite(price) ? price * quantity : 0);
    }, 0);

    cartFooter.classList.remove("hide");
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }
}

function getProductImage(item) {
  // Some of the local tent data uses Image, while the backpack and
  // sleeping-bag data uses Images.PrimarySmall.
  return (
    item?.Images?.PrimarySmall ||
    item?.Images?.PrimaryMedium ||
    item?.Image ||
    ""
  );
}

function getProductColor(item) {
  return (
    item?.SelectedColor?.ColorName ||
    item?.Colors?.[0]?.ColorName ||
    "Color not specified"
  );
}

function cartItemTemplate(item) {
  const image = getProductImage(item);
  const name = item?.Name || item?.NameWithoutBrand || "Product";
  const color = getProductColor(item);
  const quantity = Number(item?.Quantity || 1);
  const price = Number(item?.FinalPrice ?? item?.ListPrice ?? 0);

  return `
    <li class="cart-card divider">
      <a href="#" class="cart-card__image" aria-label="${escapeHtml(name)}">
        ${
          image
            ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" />`
            : `<span class="cart-image-placeholder">No image</span>`
        }
      </a>

      <h2 class="card__name">
        <a href="#">${escapeHtml(name)}</a>
      </h2>

      <p class="cart-card__color">
        ${escapeHtml(color)}
      </p>

      <p class="cart-card__quantity">
        qty: ${quantity}
      </p>

      <div class="cart-card__price-action">
        <span class="cart-card__price">$${price.toFixed(2)}</span>
        <button
          type="button"
          class="cart-card__remove"
          data-id="${escapeHtml(item?.Id || "")}"
          title="Remove item"
          aria-label="Remove ${escapeHtml(name)}"
        >❌</button>
      </div>
    </li>
  `;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character],
  );
}

function initCartRemoval() {
  const cartListElement = document.querySelector(".product-list");

  if (!cartListElement) return;

  cartListElement.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".cart-card__remove");

    if (!removeButton) return;

    const productId = removeButton.dataset.id;
    removeProductFromCart(productId);
  });
}

function removeProductFromCart(id) {
  let cartItems = getLocalStorage("so-cart") || [];

  cartItems = cartItems.filter((item) => item?.Id !== id);

  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

async function init() {
  renderCartContents();
  await loadHeaderFooter();
  initCartRemoval();
}

init();
