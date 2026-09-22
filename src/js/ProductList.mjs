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
    try {
      const products = await this.dataSource.getData(this.category);

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

    sortSelect.addEventListener(
      "change",
      (event) => {
        const sortValue =
          event.target.value;

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
    product.Images?.PrimaryMedium ||
    product.Images?.PrimaryLarge ||
    product.Image ||
    "/images/placeholder.jpg";

  const productUrl =
    `/product_pages/?product=${encodeURIComponent(
      product.Id
    )}`;

  return `
    <li class="product-card">

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