import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";

import { getComments, addComment } from "./comments.mjs";

export default class ProductDetails {
  constructor(productId, dataSource, category = "products") {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.category = category;
    this.selectedColor = null;
  }

  async init() {
    try {
      this.product = await this.dataSource.findProductById(this.productId);

      if (!this.product) {
        console.error("Product not found.");
        return;
      }

      this.renderProductDetails();

      renderCommentSection(this.productId);

      const addToCartButton = document.getElementById("addToCart");
      const colorContainer = document.getElementById("productColors");
      const wishlistButton = document.getElementById("addToWishlist");

      if (colorContainer) {
        colorContainer.addEventListener("change", (event) => {
          if (event.target.matches('input[name="productColor"]')) {
            this.selectedColor =
              this.product?.Colors?.find(
                (color) =>
                  String(color?.ColorCode) === String(event.target.value),
              ) ||
              this.product?.Colors?.[0] ||
              null;
          }
        });

        this.selectedColor = this.product?.Colors?.[0] || null;
      }

      if (wishlistButton) {
        wishlistButton.addEventListener("click", this.addToWishlist.bind(this));
      }

      if (addToCartButton) {
        addToCartButton.addEventListener(
          "click",
          this.addProductToCart.bind(this),
        );
      }
    } catch (error) {
      console.error("Unable to load product:", error);
    }
  }

  addToWishlist() {
    const wishlist = getLocalStorage("so-wishlist") || [];

    const alreadyInWishlist = wishlist.some(
      (item) => item?.Id === this.product?.Id,
    );

    if (alreadyInWishlist) {
      alertMessage("Product is already in your wishlist!", false);
      return;
    }

    wishlist.push(this.product);
    setLocalStorage("so-wishlist", wishlist);

    alertMessage("Product added to wishlist!", false);
  }

  addProductToCart() {
    const cartItems = getLocalStorage("so-cart") || [];

    const colors = Array.isArray(this.product?.Colors)
      ? this.product.Colors
      : [];

    const selectedColor = this.selectedColor || colors[0] || null;

    const itemAlreadyInCart = cartItems.find(
      (item) =>
        item?.Id === this.product?.Id &&
        (item?.SelectedColor?.ColorCode || "") ===
          (selectedColor?.ColorCode || ""),
    );

    if (itemAlreadyInCart) {
      itemAlreadyInCart.Quantity = (itemAlreadyInCart.Quantity || 1) + 1;
    } else {
      const cartProduct = {
        ...this.product,
        Quantity: 1,
        SelectedColor: selectedColor,
      };

      cartItems.push(cartProduct);
    }

    setLocalStorage("so-cart", cartItems);

    alertMessage("Product added to cart!", false);

    const addToCartButton = document.getElementById("addToCart");

    if (addToCartButton) {
      addToCartButton.disabled = true;
      addToCartButton.textContent = "Successfully Added to Cart";
    }
  }

  renderProductDetails() {
    productDetailsTemplate(this.product, this.category);
  }
}

function productDetailsTemplate(product, category) {
  const brandElement = document.querySelector("h2");

  if (brandElement) {
    brandElement.textContent = product?.Brand?.Name || "";
  }

  const nameElement = document.querySelector("h3");

  if (nameElement) {
    nameElement.textContent = product?.NameWithoutBrand || product?.Name || "";
  }

  const images = product?.Images || {};
  const productImage = document.getElementById("productImage");

  if (productImage) {
    productImage.src = images.PrimaryLarge || product?.Image || "";

    productImage.alt = product?.NameWithoutBrand || product?.Name || "Product";
  }

  const picture = document.getElementById("productImagePicture");

  if (picture) {
    const small = images.PrimarySmall || product?.Image;

    const medium = images.PrimaryMedium || product?.Image;

    const large =
      images.PrimaryLarge || images.PrimaryExtraLarge || product?.Image;

    picture.innerHTML = `
      ${
        small
          ? `<source media="(max-width: 499px)" srcset="${escapeHtml(small)}" />`
          : ""
      }

      ${
        medium
          ? `<source media="(min-width: 500px) and (max-width: 899px)" srcset="${escapeHtml(medium)}" />`
          : ""
      }

      ${
        large
          ? `<source media="(min-width: 900px)" srcset="${escapeHtml(large)}" />`
          : ""
      }

      <img
        id="productImage"
        src="${escapeHtml(large || "")}"
        alt="${escapeHtml(
          product?.NameWithoutBrand || product?.Name || "Product",
        )}"
      />
    `;
  }

  const priceElement = document.getElementById("productPrice");

  const finalPrice = Number(product?.FinalPrice);

  if (priceElement) {
    priceElement.textContent = Number.isFinite(finalPrice)
      ? finalPrice.toFixed(2)
      : "0.00";
  }

  const discountFlag = document.getElementById("discountFlag");

  const retailPrice = Number(product?.SuggestedRetailPrice);

  if (
    discountFlag &&
    Number.isFinite(retailPrice) &&
    Number.isFinite(finalPrice) &&
    retailPrice > finalPrice
  ) {
    const savings = retailPrice - finalPrice;

    const percentage = Math.round((savings / retailPrice) * 100);

    discountFlag.textContent = `${percentage}% OFF — Save $${savings.toFixed(2)}`;

    discountFlag.hidden = false;
  } else if (discountFlag) {
    discountFlag.hidden = true;
  }

  const colorElement = document.getElementById("productColor");

  const colors = Array.isArray(product?.Colors) ? product.Colors : [];

  if (colorElement) {
    colorElement.textContent = colors[0]?.ColorName || "";
  }

  renderColorOptions(product);

  const descriptionElement = document.getElementById("productDesc");

  if (descriptionElement) {
    descriptionElement.innerHTML = product?.DescriptionHtmlSimple || "";
  }

  const breadcrumb = document.querySelector("#breadcrumb");

  if (breadcrumb) {
    const categoryName = formatCategoryName(category);

    breadcrumb.innerHTML = `
      <a href="/product_listing/index.html?category=${encodeURIComponent(
        category,
      )}">
        ${escapeHtml(categoryName)}
      </a>
    `;

    breadcrumb.setAttribute("aria-label", categoryName);
  }

  const addToCartButton = document.getElementById("addToCart");

  if (addToCartButton) {
    addToCartButton.dataset.id = product?.Id || "";
  }
}

function renderColorOptions(product) {
  const container = document.getElementById("productColors");

  if (!container) return;

  const colors = Array.isArray(product?.Colors) ? product.Colors : [];

  if (colors.length <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <fieldset class="product-colors">
      <legend class="product-colors__title">
        Choose a color
      </legend>

      <div class="color-options">
        ${colors
          .map((color, index) => {
            const code = escapeHtml(color?.ColorCode || String(index));

            const name = escapeHtml(color?.ColorName || "Color");

            const swatch = color?.ColorChipImageSrc
              ? `<img
                    src="${escapeHtml(color.ColorChipImageSrc)}"
                    alt="${name} color swatch"
                  />`
              : `<span
                    class="color-swatch-fallback"
                    aria-hidden="true">
                  </span>`;

            return `
              <div class="color-option">
                <input
                  type="radio"
                  id="color-${code}"
                  name="productColor"
                  value="${code}"
                  ${index === 0 ? "checked" : ""}
                />

                <label for="color-${code}">
                  ${swatch}

                  <span class="color-option__name">
                    ${name}
                  </span>
                </label>
              </div>
            `;
          })
          .join("")}
      </div>

      <p class="selected-color">
        Selected:
        <strong id="selectedColorName">
          ${escapeHtml(colors[0]?.ColorName || "")}
        </strong>
      </p>
    </fieldset>
  `;

  const firstColor = colors[0] || null;

  let selectedColor = firstColor;

  const selectedColorName = document.getElementById("selectedColorName");

  container.querySelectorAll('input[name="productColor"]').forEach((input) => {
    input.addEventListener("change", () => {
      selectedColor =
        colors.find((color) => String(color?.ColorCode) === input.value) ||
        firstColor;

      if (selectedColorName) {
        selectedColorName.textContent = selectedColor?.ColorName || "";
      }
    });
  });

  container.dataset.selectedColor = firstColor?.ColorCode || "";

  container.addEventListener("change", (event) => {
    if (event.target.matches('input[name="productColor"]')) {
      container.dataset.selectedColor = event.target.value;
    }
  });
}

function formatCategoryName(category) {
  if (!category || category === "products") {
    return "Products";
  }

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
        "'": "&#039;",
      })[character],
  );
}

export function renderCommentSection(productId) {
  const productDetailsElement = document.querySelector(".product-detail"); // Or your main container element

  // Create the comments section container
  const commentsSection = document.createElement("section");
  commentsSection.classList.add("product-comments");

  commentsSection.innerHTML = `
    <h3>Customer Comments & Reviews</h3>
    <div id="comments-list"></div>
    <form id="comment-form">
      <div class="input-group">
        <label for="comment-author">Your Name:</label>
        <input type="text" id="comment-author" required />
      </div>
      <div class="input-group">
        <label for="comment-text">Your Comment:</label>
        <textarea id="comment-text" required></textarea>
      </div>
      <button type="submit" id="submit-comment">Add Comment</button>
    </form>
  `;

  productDetailsElement.appendChild(commentsSection);

  // Display existing comments on load
  displayComments(productId);

  // Handle form submission
  const form = document.getElementById("comment-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const author = document.getElementById("comment-author").value;
    const text = document.getElementById("comment-text").value;

    addComment(productId, author, text);
    displayComments(productId);
    form.reset(); // Clear the form inputs
  });
}

function displayComments(productId) {
  const commentsListElement = document.getElementById("comments-list");
  const comments = getComments(productId);

  if (comments.length === 0) {
    commentsListElement.innerHTML =
      '<p class="no-comments">No comments yet. Be the first to share your thoughts about this product!</p>';
    return;
  }

  commentsListElement.innerHTML = comments
    .map(
      (c) => `
    <div class="comment-card">
      <div class="comment-header">
        <strong>${c.author}</strong> 
        <small class="comment-date">${c.date}</small>
      </div>
      <p class="comment-body">${c.text}</p>
    </div>
  `,
    )
    .join("");
}
