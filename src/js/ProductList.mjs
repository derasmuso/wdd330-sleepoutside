import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    try {
      const products = await this.dataSource.getData(this.category);
      this.renderList(products);
      this.updateProductCount(products.length);
      this.renderBreadcrumb(products.length);
      this.initSorting();
    } catch (error) {
      console.error("Unable to load products:", error);
      this.renderList([]);
      this.updateProductCount(0);
      this.renderBreadcrumb(0);
    }
  }

  renderList(list) {
    this.products = Array.isArray(list) ? list : [];

    if (!this.listElement) {
      console.error("Product list element was not found.");
      return;
    }

    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      this.products,
      "afterbegin",
      true,
    );
  }

  updateProductCount(count) {
    const countElement = document.querySelector("#product-count");
    if (!countElement) return;

    countElement.textContent = `${count} ${count === 1 ? "item" : "items"}`;
  }

  renderBreadcrumb(count) {
    const breadcrumb = document.querySelector("#breadcrumb");
    if (!breadcrumb) return;

    breadcrumb.innerHTML = `
      <span>${escapeHtml(this.category)}</span>
      <span class="breadcrumb__separator" aria-hidden="true">-&gt;</span>
      <span>(${count} ${count === 1 ? "item" : "items"})</span>
    `;

    breadcrumb.setAttribute(
      "aria-label",
      `${this.category}, ${count} ${count === 1 ? "item" : "items"}`,
    );
  }

  initSorting() {
    const sortSelect = document.querySelector("#sort-select");
    if (!sortSelect) return;

    sortSelect.addEventListener("change", (event) => {
      const sortValue = event.target.value;
      const sortedProducts = [...this.products];

      switch (sortValue) {
        case "name-asc":
          sortedProducts.sort((a, b) =>
            getProductName(a).localeCompare(getProductName(b)),
          );
          break;
        case "name-desc":
          sortedProducts.sort((a, b) =>
            getProductName(b).localeCompare(getProductName(a)),
          );
          break;
        case "price-asc":
          sortedProducts.sort(
            (a, b) => Number(a.FinalPrice || 0) - Number(b.FinalPrice || 0),
          );
          break;
        case "price-desc":
          sortedProducts.sort(
            (a, b) => Number(b.FinalPrice || 0) - Number(a.FinalPrice || 0),
          );
          break;
        default:
          break;
      }

      this.renderList(sortedProducts);
    });
  }
}

function productCardTemplate(product) {
  const discount = calculateDiscount(product);
  const productName = product?.NameWithoutBrand || product?.Name || "Product";
  const brandName = product?.Brand?.Name || "";
  const images = getProductImages(product);
  const category = categorySlug(product?.Category) || categorySlugFromUrl();
  const productUrl = `/product_pages/?product=${encodeURIComponent(
    product?.Id || "",
  )}&category=${encodeURIComponent(category || "products")}`;

  return `
    <li class="product-card">
      <a href="${productUrl}">
        <div class="product-card__image-wrapper">
          ${
            discount
              ? `<span class="discount-badge" aria-label="${discount.percentage}% discount">
                  ${discount.percentage}% OFF
                </span>`
              : ""
          }

          <picture>
            ${images.small ? `<source media="(max-width: 499px)" srcset="${escapeHtml(images.small)}" />` : ""}
            ${images.medium ? `<source media="(min-width: 500px) and (max-width: 899px)" srcset="${escapeHtml(images.medium)}" />` : ""}
            ${images.large ? `<source media="(min-width: 900px)" srcset="${escapeHtml(images.large)}" />` : ""}
            <img
              src="${escapeHtml(images.fallback)}"
              alt="${escapeHtml(productName)}"
              loading="lazy"
            />
          </picture>
        </div>

        <h3 class="card__brand">${escapeHtml(brandName)}</h3>
        <h2 class="card__name">${escapeHtml(productName)}</h2>
        <p class="product-card__price">$${formatPrice(product?.FinalPrice)}</p>
      </a>
    </li>
  `;
}

function getProductImages(product) {
  const apiImages = product?.Images || {};
  const fallback = product?.Image || apiImages.PrimaryMedium || apiImages.PrimaryLarge || "";

  return {
    small: apiImages.PrimarySmall || product?.Image || fallback,
    medium: apiImages.PrimaryMedium || product?.Image || fallback,
    large:
      apiImages.PrimaryLarge ||
      apiImages.PrimaryExtraLarge ||
      product?.Image ||
      fallback,
    fallback,
  };
}

function categorySlug(category) {
  if (!category) return "";
  return String(category).trim().toLowerCase().replace(/\s+/g, "-");
}

function categorySlugFromUrl() {
  return new URLSearchParams(window.location.search).get("category") || "";
}

function getProductName(product) {
  return String(product?.NameWithoutBrand || product?.Name || "").toLowerCase();
}

function calculateDiscount(product) {
  const retailPrice = Number(product?.SuggestedRetailPrice);
  const finalPrice = Number(product?.FinalPrice);

  if (!Number.isFinite(retailPrice) || !Number.isFinite(finalPrice)) return null;
  if (retailPrice <= 0 || finalPrice <= 0 || finalPrice >= retailPrice) return null;

  const percentage = Math.round(((retailPrice - finalPrice) / retailPrice) * 100);
  return percentage > 0 ? { percentage } : null;
}

function formatPrice(price) {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : "0.00";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character],
  );
}
