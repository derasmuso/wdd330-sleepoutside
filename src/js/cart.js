import { getLocalStorage, loadHeaderFooter } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart");

  if (!cartItems || cartItems.length === 0) {
    document.querySelector(".product-list").innerHTML =
      "<p>Your cart is empty.</p>";
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
}

function cartItemTemplate(item) {
  const newItem = `
    <li class="cart-card divider">
      <!-- Direct child 1: Product image container -->
      <a href="#" class="cart-card__image">
        <img
          src="${item.Images.PrimarySmall}"
          alt="${item.Name}"
        />
      </a>

      <!-- Direct child 2: Product title as a direct child of the grid -->
      <h2 class="card__name">
        <a href="#">${item.Name}</a>
      </h2>

      <!-- Direct child 3: Product color -->
      <p class="cart-card__color">
        ${item.Colors[0].ColorName}
      </p>

      <!-- Direct child 4: Product quantity -->
      <p class="cart-card__quantity">
         qty: ${item.Quantity}
      </p>

      <!-- Direct child 5: Product price -->
      <p class="cart-card__price">
        $${item.FinalPrice}
      </p>
    </li>
  `;

  return newItem;
}
renderCartContents();
loadHeaderFooter();
