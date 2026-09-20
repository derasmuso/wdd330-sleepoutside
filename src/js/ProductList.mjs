import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = []; // Array to store fetched products for filtering or sorting
  }

  async init() {
    // 1. Fetch products from the data source
    const data = await this.dataSource.getData(this.category);

    // 2. Ensure 'this.list' is strictly an array (handles whether getData returns an array or an object wrapper)
    this.list = Array.isArray(data) ? data : data.Result || data.products || [];

    // 3. Render the initial list
    this.renderList(this.list);

    // 4. Initialize the sorting functionality
    this.initSorting();

    // 5. Title
    const titleElement = document.querySelector(".title");
    if (titleElement) {
      titleElement.textContent = this.category;
    }
  }

  renderList(list) {
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      "afterbegin",
      true,
    );
  }

  initSorting() {
    const sortSelect = document.querySelector("#sort-select");
    if (!sortSelect) return; // Exit if the sorting element is not present on this page

    sortSelect.addEventListener("change", (event) => {
      const sortValue = event.target.value;

      // Create a shallow copy of the products array to avoid mutating the original data
      let sortedProducts = [...this.list];

      // Sort products based on the selected criteria
      if (sortValue === "name-asc") {
        sortedProducts.sort((a, b) => a.Name.localeCompare(b.Name));
      } else if (sortValue === "name-desc") {
        sortedProducts.sort((a, b) => b.Name.localeCompare(a.Name));
      } else if (sortValue === "price-asc") {
        sortedProducts.sort((a, b) => a.FinalPrice - b.FinalPrice);
      } else if (sortValue === "price-desc") {
        sortedProducts.sort((a, b) => b.FinalPrice - a.FinalPrice);
      }

      // Re-render the UI list with the newly sorted items
      this.renderList(sortedProducts);
    });
  }
}

function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="/product_pages/?product=${product.Id}">
        <img src="${product.Images.PrimaryMedium}" alt="${product.Name}">
        <h3 class="card__brand">${product.Brand.Name}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <p class="product-card__price">$${product.FinalPrice}</p>
      </a>
    </li>
    `;
}
