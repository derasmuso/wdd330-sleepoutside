import { setLocalStorage, getLocalStorage, animateCartIcon } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      this.product = await this.dataSource.findProductById(this.productId);
      if (!this.product) {
        this.renderNotFound();
        return;
      }
      this.renderProductDetails();
      document
        .getElementById("addToCart")
        ?.addEventListener("click", this.addProductToCart.bind(this));
    } catch (error) {
      console.error("Error initializing product:", error);
      this.renderError();
    }
  }

  renderProductDetails() {
    const main = document.querySelector("main");
    if (!main) return;

    const brand = this.product.Brand?.Name || "";
    const name = this.product.Name || "Product";
    const image =
      this.product.Images?.PrimaryLarge ||
      this.product.Images?.PrimaryMedium ||
      "/images/placeholder.jpg";

    let price = this.product.FinalPrice || this.product.ListPrice || 0;
    price = typeof price === "number" ? price : parseFloat(price) || 0;

    const color = this.product.Colors?.[0]?.ColorName || "";
    const description =
      this.product.DescriptionHtmlSimple ||
      this.product.Description ||
      "No description available.";
    const id = this.product.Id || "";

    // Discount flag
    let discountHtml = "";
    const retail = Number(this.product.SuggestedRetailPrice);
    const final = Number(this.product.FinalPrice);
    if (
      Number.isFinite(retail) &&
      Number.isFinite(final) &&
      retail > final
    ) {
      const savings = retail - final;
      const percent = Math.round((savings / retail) * 100);
      discountHtml = `<span class="discount-flag">${percent}% OFF — Save $${savings.toFixed(2)}</span>`;
    }

    main.innerHTML = `
      <section class="product-detail">
        <h3>${brand}</h3>
        <h2 class="divider">${name}</h2>
        <img class="divider" src="${image}" alt="${name}" loading="lazy" onerror="this.src='/images/placeholder.jpg'">
        ${discountHtml}
        <p class="product-card__price">$${price.toFixed(2)}</p>
        <p class="product__color">${color}</p>
        <p class="product__description">${description}</p>
        <div class="product-detail__add">
          <button id="addToCart" data-id="${id}">Add to Cart</button>
        </div>
      </section>
    `;
  }

  addProductToCart() {
    const cartItems = getLocalStorage("so-cart") || [];
    const existing = cartItems.find((item) => item.Id === this.product.Id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      this.product.quantity = 1;
      cartItems.push(this.product);
    }

    setLocalStorage("so-cart", cartItems);

    // ✅ Trigger the animation
    animateCartIcon();

    // Existing button feedback
    const btn = document.getElementById("addToCart");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Successfully Added to Cart";
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Add to Cart";
      }, 2000);
    }
  }

  renderNotFound() {
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `
        <h2>Product Not Found</h2>
        <p>Please select a product from the <a href="/index.html">homepage</a>.</p>
      `;
    }
  }

  renderError() {
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `
        <h2>Error Loading Product</h2>
        <p>Please try again later.</p>
      `;
    }
  }
}