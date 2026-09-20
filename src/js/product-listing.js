import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { initSearchForm } from "./search-form.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

async function initApp() {
  await loadHeaderFooter(); //to prevent search-form null

  const category = getParam("category");
  const dataSource = new ProductData("tents");

  const element = document.querySelector(".product-list");

  const productList = new ProductList(category, dataSource, element);
  productList.init();

  initSearchForm(document.querySelector(".search-form"));
}

initApp();
