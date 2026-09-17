import { getParam, loadHeaderFooter } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

loadHeaderFooter();

const productId = getParam("product");

if (!productId) {
  document.querySelector("main").innerHTML = `
    <h2>No Product Selected</h2>
    <p>Please select a product from the <a href="/index.html">homepage</a>.</p>
  `;
} else {
  const dataSource = new ProductData();
  const product = new ProductDetails(productId, dataSource);
  product.init();
}
