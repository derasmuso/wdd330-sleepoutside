import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

const productId = getParam("product");
const category = (getParam("category") || "products").toLowerCase();
const dataSource = new ProductData(category);
const product = new ProductDetails(productId, dataSource, category);

async function init() {
  await loadHeaderFooter();
  await product.init();
}

init();
