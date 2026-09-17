import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

loadHeaderFooter();

const category = getParam("category");
const dataSource = new ProductData();
const listElement = document.querySelector(".product-list");
const myList = new ProductList(category, dataSource, listElement);

myList.init();

const categoryNames = {
    tents: "Tents",
    hammocks: "Hammocks",
    backpacks: "Backpacks",
    "sleeping-bags": "Sleeping Bags",
};

const categoryTitleElement = document.querySelector(".title.highlight");
categoryTitleElement.textContent = categoryNames[category] ?? category;