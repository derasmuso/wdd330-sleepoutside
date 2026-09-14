import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { initSearchForm } from "./search-form.mjs";

const dataSource = new ProductData("tents");

const element = document.querySelector(".product-list");

const productList = new ProductList("Tents", dataSource, element);
productList.init();

initSearchForm(document.querySelector(".search-form"));
