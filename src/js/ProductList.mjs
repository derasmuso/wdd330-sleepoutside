import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement, quickViewDialog) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.quickViewDialog = quickViewDialog;
    this.quickViewOpener = null;
    this.quickViewProductId = null;
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
    this.initQuickView();

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

  initQuickView() {
    if (!this.quickViewDialog) return;

    this.listElement.addEventListener("click", async (event) => {
      const button = event.target.closest(".quick-view-button");
      if (!button) return;

      this.quickViewOpener = button;
      await this.showQuickView(button.dataset.productId);
    });

    this.quickViewDialog
      .querySelector(".quick-view__close")
      .addEventListener("click", () => this.quickViewDialog.close());

    this.quickViewDialog.addEventListener("click", (event) => {
      if (event.target === this.quickViewDialog) this.quickViewDialog.close();
    });

    this.quickViewDialog.addEventListener("close", () => {
      this.quickViewOpener?.focus();
      this.quickViewOpener = null;
      this.quickViewProductId = null;
    });
  }

  async showQuickView(productId) {
    const content = this.quickViewDialog.querySelector(".quick-view__content");
    this.quickViewProductId = productId;
    content.innerHTML = "<p>Loading product details...</p>";
    if (!this.quickViewDialog.open) this.quickViewDialog.showModal();

    try {
      const product = await this.dataSource.findProductById(productId);
      if (this.quickViewProductId !== productId) return;
      content.innerHTML = quickViewTemplate(product);
    } catch (error) {
      if (this.quickViewProductId !== productId) return;
      console.error("Unable to load product details:", error);
      content.innerHTML =
        "<p>Product details could not be loaded. Please try again.</p>";
    }
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
      <button class="quick-view-button" type="button" data-product-id="${product.Id}">
        Quick View
      </button>
    </li>
    `;
}

function quickViewTemplate(product) {
  const color = product.Colors?.[0]?.ColorName || "Not specified";
  const image = product.Images.PrimaryLarge || product.Images.PrimaryMedium;

  return `
    <img src="${image}" alt="${product.NameWithoutBrand}">
    <div class="quick-view__details">
      <p class="card__brand">${product.Brand.Name}</p>
      <h2>${product.NameWithoutBrand}</h2>
      <p class="product-card__price">$${product.FinalPrice}</p>
      <p><strong>Color:</strong> ${color}</p>
      <div class="product__description">${product.DescriptionHtmlSimple}</div>
      <a class="quick-view__details-link" href="/product_pages/?product=${product.Id}">
        View full product details
      </a>
    </div>
  `;
}
