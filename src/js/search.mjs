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
  console.log("Término recibido para buscar:", term); // <-- 1. Verifica si esto sale en la consola

  const dataSource = new ProductData("tents");
  const productList = new ProductList(
    "Search results",
    dataSource,
    productListElement,
  );

  try {
    const products = (await dataSource.search(term)) || [];
    console.log("Productos encontrados:", products); // <-- 2. Verifica si la API devuelve datos

    productList.renderList(products);
    resultMessage.textContent = products.length
      ? `${products.length} result${products.length === 1 ? "" : "s"} for “${term}”.`
      : `No products found for “${term}”.`;
  } catch (error) {
    // <-- Añade 'error' aquí
    console.error("Error detallado en la búsqueda:", error); // <-- 3. Muestra el error real

    productList.renderList([]);
    resultMessage.textContent =
      "We couldn't load search results. Please try again.";
  }
}
