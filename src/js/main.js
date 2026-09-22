import ProductData from "./ProductData.mjs";

import ProductList from "./ProductList.mjs";

import { initSearchForm } from "./search-form.mjs";

import { getLocalStorage, loadHeaderFooter } from "./utils.mjs";

function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];

  const totalItems = cartItems.reduce(
    (total, item) => total + (item.Quantity || 1),
    0,
  );

  const cartCount = document.querySelector(".cart-count");

  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

async function initApp() {
  await loadHeaderFooter();

  updateCartCount();

  const dataSource = new ProductData("tents");

  const element = document.querySelector(".product-list");

  const productList = new ProductList("Tents", dataSource, element);

  productList.init();

  initSearchForm(document.querySelector(".search-form"));
}

initApp();