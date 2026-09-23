import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(
    category,
    dataSource,
    listElement
  ) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
<<<<<<< HEAD
    try {
      const products =
        await this.dataSource.getData();

      this.renderList(products);

      this.updateProductCount(
        products.length
      );

      this.renderBreadcrumb(
        products.length
      );

      this.initSorting();

    } catch (error) {
      console.error(
        "Unable to load products:",
        error
      );

      this.renderList([]);
      this.updateProductCount(0);
      this.renderBreadcrumb(0);
=======
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
>>>>>>> 279938a3d8dddbbaedac89c087e25fdd1f3cd75e
    }
  }

  renderList(list) {
    this.products = Array.isArray(list)
      ? list
      : [];

    if (!this.listElement) {
      console.error(
        "Product list element was not found."
      );

      return;
    }

    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      this.products,
      "afterbegin",
      true
    );
  }

  updateProductCount(count) {
    const countElement =
      document.querySelector(
        "#product-count"
      );

    if (!countElement) {
      return;
    }

    countElement.textContent =
      `${count} ${
        count === 1
          ? "item"
          : "items"
      }`;
  }

  /*
   * Product list breadcrumb:
   *
   * Tents -> (24 items)
   */
  renderBreadcrumb(count) {
    const breadcrumb =
      document.querySelector(
        "#breadcrumb"
      );

    if (!breadcrumb) {
      return;
    }

    breadcrumb.innerHTML = `
      <span>
        ${escapeHtml(this.category)}
      </span>

      <span aria-hidden="true">
        -&gt;
      </span>

      <span>
        (${count}
        ${count === 1 ? "item" : "items"})
      </span>
    `;

    breadcrumb.setAttribute(
      "aria-label",
      `${this.category}, ${count} ${
        count === 1
          ? "item"
          : "items"
      }`
    );
  }

  initSorting() {
    const sortSelect =
      document.querySelector(
        "#sort-select"
      );

    if (!sortSelect) {
      return;
    }

<<<<<<< HEAD
    sortSelect.addEventListener(
      "change",
      (event) => {
        const sortValue =
          event.target.value;
=======
      // Create a shallow copy of the products array to avoid mutating the original data
      let sortedProducts = [...this.list];
>>>>>>> 279938a3d8dddbbaedac89c087e25fdd1f3cd75e

        const sortedProducts =
          [...this.products];

        switch (sortValue) {
          case "name-asc":
            sortedProducts.sort(
              (a, b) =>
                getProductName(a)
                  .localeCompare(
                    getProductName(b)
                  )
            );
            break;

          case "name-desc":
            sortedProducts.sort(
              (a, b) =>
                getProductName(b)
                  .localeCompare(
                    getProductName(a)
                  )
            );
            break;

          case "price-asc":
            sortedProducts.sort(
              (a, b) =>
                Number(
                  a.FinalPrice || 0
                ) -
                Number(
                  b.FinalPrice || 0
                )
            );
            break;

          case "price-desc":
            sortedProducts.sort(
              (a, b) =>
                Number(
                  b.FinalPrice || 0
                ) -
                Number(
                  a.FinalPrice || 0
                )
            );
            break;

          default:
            break;
        }

        this.renderList(
          sortedProducts
        );
      }
    );
  }
}

/*
 * Product card
 */
function productCardTemplate(product) {
  const discount =
    calculateDiscount(product);

  const productName =
    product.NameWithoutBrand ||
    product.Name ||
    "Product";

  const brandName =
    product.Brand?.Name || "";

  const productImage =
    product.Image || "";

  const productUrl =
    `/product_pages/?product=${encodeURIComponent(
      product.Id
    )}`;

  return `
    <li class="product-card">
<<<<<<< HEAD

      <a href="${productUrl}">

        <div class="product-card__image-wrapper">

          ${
            discount
              ? `
                <span
                  class="discount-badge"
                  aria-label="${discount.percentage}% discount"
                >
                  ${discount.percentage}% OFF
                </span>
              `
              : ""
          }

          <picture>
            <img
              src="${escapeHtml(productImage)}"
              alt="${escapeHtml(productName)}"
              loading="lazy"
              width="320"
              height="320"
            />
          </picture>

        </div>

        <h3 class="card__brand">
          ${escapeHtml(brandName)}
        </h3>

        <h2 class="card__name">
          ${escapeHtml(productName)}
        </h2>

        <p class="product-card__price">
          $${formatPrice(product.FinalPrice)}
        </p>

=======
      <a href="/product_pages/?product=${product.Id}">
        <img src="${product.Images.PrimaryMedium}" alt="${product.Name}">
        <h3 class="card__brand">${product.Brand.Name}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <p class="product-card__price">$${product.FinalPrice}</p>
>>>>>>> 279938a3d8dddbbaedac89c087e25fdd1f3cd75e
      </a>

    </li>
  `;
}

function getProductName(product) {
  return (
    product?.NameWithoutBrand ||
    product?.Name ||
    ""
  ).toLowerCase();
}

function calculateDiscount(product) {
  const retailPrice =
    Number(
      product?.SuggestedRetailPrice
    );

  const finalPrice =
    Number(
      product?.FinalPrice
    );

  if (
    !Number.isFinite(retailPrice) ||
    !Number.isFinite(finalPrice)
  ) {
    return null;
  }

  if (
    retailPrice <= 0 ||
    finalPrice <= 0 ||
    finalPrice >= retailPrice
  ) {
    return null;
  }

  const percentage =
    Math.round(
      ((retailPrice - finalPrice) /
        retailPrice) *
        100
    );

  if (percentage <= 0) {
    return null;
  }

  return {
    percentage
  };
}

function formatPrice(price) {
  const numericPrice =
    Number(price);

  if (
    !Number.isFinite(
      numericPrice
    )
  ) {
    return "0.00";
  }

  return numericPrice.toFixed(2);
}

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
  );
}