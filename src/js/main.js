
import ProductList from "./ProductList.mjs";
import ExternalDataSource from "./ExternalDataSource.mjs";


const dataSource = new ExternalDataSource("/json/tents.json");


const listElement = document.querySelector("#product-list");

// Création de la liste des produits pour la catégorie "tents"
const tentsList = new ProductList("tents", dataSource, listElement);


tentsList.init();

