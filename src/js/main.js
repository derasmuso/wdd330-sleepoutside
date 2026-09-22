// src/js/main.js
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { initSearchForm } from "./search-form.mjs";
import { loadHeaderFooter } from "./utils.mjs";

async function initApp() {
  await loadHeaderFooter();

  const dataSource = new ExternalServices();
  const element = document.querySelector(".product-list");

  const productList = new ProductList("tents", dataSource, element);
  await productList.init();

  initSearchForm(document.querySelector(".search-form"));
}

initApp();
