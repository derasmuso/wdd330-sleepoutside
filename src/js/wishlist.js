import {
  getLocalStorage,
  setLocalStorage,
  loadHeaderFooter,
  alertMessage,
} from "./utils.mjs";

document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter();
  renderWishlist();
});

function renderWishlist() {
  const wishlistElement =
    document.getElementById("wishlist");

  if (!wishlistElement) return;

  const wishlist =
    getLocalStorage("so-wishlist") || [];

  if (wishlist.length === 0) {
    wishlistElement.innerHTML = `
      <p>Your wishlist is empty.</p>
    `;
    return;
  }

  wishlistElement.innerHTML = wishlist
    .map((product) => {
      const image =
        product?.Images?.PrimaryMedium ||
        product?.Images?.PrimaryLarge ||
        product?.Image ||
        "";

      const name =
        product?.NameWithoutBrand ||
        product?.Name ||
        "Product";

      const price = Number(product?.FinalPrice);

      return `
        <article class="wishlist-card">
          <img
            src="${image}"
            alt="${name}"
          />

          <h2>${name}</h2>

          <p>
            $${Number.isFinite(price)
              ? price.toFixed(2)
              : "0.00"}
          </p>

          <div class="wishlist-card__actions">
            <button
              class="wishlist-add-cart"
              data-id="${product?.Id || ""}"
            >
              Add to Cart
            </button>

            <button
              class="wishlist-remove"
              data-id="${product?.Id || ""}"
            >
              Remove
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  addWishlistEvents();
}

function addWishlistEvents() {
  const addCartButtons =
    document.querySelectorAll(
      ".wishlist-add-cart",
    );

  const removeButtons =
    document.querySelectorAll(
      ".wishlist-remove",
    );

  addCartButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        addToCart(button.dataset.id);
      },
    );
  });

  removeButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        removeFromWishlist(
          button.dataset.id,
        );
      },
    );
  });
}

function addToCart(productId) {
  const wishlist =
    getLocalStorage("so-wishlist") || [];

  const product = wishlist.find(
    (item) =>
      String(item?.Id) === String(productId),
  );

  if (!product) return;

  const cart =
    getLocalStorage("so-cart") || [];

  const existingItem = cart.find(
    (item) =>
      String(item?.Id) === String(productId),
  );

  if (existingItem) {
    existingItem.Quantity =
      (existingItem.Quantity || 1) + 1;
  } else {
    cart.push({
      ...product,
      Quantity: 1,
      SelectedColor:
        product?.Colors?.[0] || null,
    });
  }

  setLocalStorage("so-cart", cart);

  alertMessage(
    "Product added to cart!",
    false,
  );
}

function removeFromWishlist(productId) {
  const wishlist =
    getLocalStorage("so-wishlist") || [];

  const updatedWishlist =
    wishlist.filter(
      (item) =>
        String(item?.Id) !==
        String(productId),
    );

  setLocalStorage(
    "so-wishlist",
    updatedWishlist,
  );

  renderWishlist();
}