import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { getParam } from "./utils.mjs";
import { initSearchForm } from "./search-form.mjs";

const searchForm = document.querySelector(".search-form");
const searchInput = searchForm.querySelector("[name='q']");
const searchTerm = getParam("q")?.trim();
const resultMessage = document.querySelector(".search-results__message");
const productListElement = document.querySelector(".product-list");

initSearchForm(searchForm);

if (!searchTerm) {
  resultMessage.textContent = "Enter a product name, brand, or type to search.";
} else {
  searchInput.value = searchTerm;
  searchProducts(searchTerm);
}

async function searchProducts(term) {
  const dataSource = new ProductData("tents");
  const productList = new ProductList(
    "Search results",
    dataSource,
    productListElement,
  );

  try {
    const products = await dataSource.search(term);
    productList.renderList(products);
    productList.renderBreadcrumb(products.length);
    productList.products = products;
    productList.initSorting();
    resultMessage.textContent = products.length
      ? `${products.length} result${products.length === 1 ? "" : "s"} for “${term}”.`
      : `No products found for “${term}”.`;
  } catch {
    productList.renderList([]);
    resultMessage.textContent =
      "We couldn't load search results. Please try again.";
  }
}
