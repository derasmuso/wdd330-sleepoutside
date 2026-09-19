import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter } from "./utils.mjs";

const params = new URLSearchParams(
  window.location.search
);

const category = (
  params.get("category") || "tents"
).toLowerCase();

const dataSource = new ProductData(category);

const productListElement =
  document.querySelector(".product-list");

async function initProductList() {
  await loadHeaderFooter();

  try {
    const products = await dataSource.getData();

    // Convert "tents" to "Tents"
    // Convert "sleeping-bags" to "Sleeping Bags"
    const categoryName = category
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

    // Update page title
    const title =
      document.querySelector(
        "#product-list-title"
      );

    if (title) {
      title.textContent = categoryName;
    }

    // Create ProductList
    const productList = new ProductList(
      categoryName,
      dataSource,
      productListElement
    );

    // Render products
    productList.renderList(products);

    // Render:
    // Tents -> (24 items)
    productList.renderBreadcrumb(
      products.length
    );

    // Update product count
    productList.updateProductCount(
      products.length
    );

    // Enable sorting
    productList.initSorting();

  } catch (error) {
    console.error(
      "Unable to load products:",
      error
    );

    const breadcrumb =
      document.querySelector("#breadcrumb");

    if (breadcrumb) {
      breadcrumb.textContent =
        "Unable to load products";
    }

    const title =
      document.querySelector(
        "#product-list-title"
      );

    if (title) {
      title.textContent =
        "Unable to load products";
    }
  }
}

initProductList();