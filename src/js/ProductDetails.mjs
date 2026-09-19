import {
  getLocalStorage,
  setLocalStorage
} from "./utils.mjs";

export default class ProductDetails {
  constructor(
    productId,
    dataSource
  ) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      this.product =
        await this.dataSource.findProductById(
          this.productId
        );

      if (!this.product) {
        console.error(
          "Product not found."
        );

        return;
      }

      this.renderProductDetails();

      const addToCartButton =
        document.getElementById(
          "addToCart"
        );

      if (addToCartButton) {
        addToCartButton.addEventListener(
          "click",
          this.addProductToCart.bind(this)
        );
      }

    } catch (error) {
      console.error(
        "Unable to load product:",
        error
      );
    }
  }

  addProductToCart() {
    const cartItems =
      getLocalStorage(
        "so-cart"
      ) || [];

    const itemAlreadyInCart =
      cartItems.find(
        (item) =>
          item.Id === this.product.Id
      );

    if (itemAlreadyInCart) {
      itemAlreadyInCart.Quantity =
        (itemAlreadyInCart.Quantity ||
          1) + 1;

    } else {
      this.product.Quantity = 1;

      cartItems.push(
        this.product
      );
    }

    setLocalStorage(
      "so-cart",
      cartItems
    );

    const addToCartButton =
      document.getElementById(
        "addToCart"
      );

    if (addToCartButton) {
      addToCartButton.disabled =
        true;

      addToCartButton.textContent =
        "Successfully Added to Cart";
    }
  }

  renderProductDetails() {
    productDetailsTemplate(
      this.product,
      this.dataSource.category
    );
  }
}

function productDetailsTemplate(
  product,
  category
) {
  
  const brandElement =
    document.querySelector("h2");

  if (brandElement) {
    brandElement.textContent =
      product.Brand?.Name || "";
  }

  const nameElement =
    document.querySelector("h3");

  if (nameElement) {
    nameElement.textContent =
      product.NameWithoutBrand ||
      product.Name ||
      "";
  }

  const productImage =
    document.getElementById(
      "productImage"
    );

  if (productImage) {
    productImage.src =
      product.Image || "";

    productImage.alt =
      product.NameWithoutBrand ||
      product.Name ||
      "Product";

    
    productImage.removeAttribute(
      "srcset"
    );

    productImage.removeAttribute(
      "sizes"
    );
  }

  
  const breadcrumb =
    document.querySelector(
      "#breadcrumb"
    );

  if (breadcrumb) {
    const categoryName =
      formatCategoryName(
        category
      );

    breadcrumb.innerHTML = `
      <a
        href="/product-list/?category=${encodeURIComponent(
          category
        )}"
      >
        ${escapeHtml(categoryName)}
      </a>
    `;

    breadcrumb.setAttribute(
      "aria-label",
      categoryName
    );
  }

  /*
   * Discount
   */
  const discountFlag =
    document.getElementById(
      "discountFlag"
    );

  const retailPrice =
    Number(
      product.SuggestedRetailPrice
    );

  const finalPrice =
    Number(
      product.FinalPrice
    );

  if (
    discountFlag &&
    Number.isFinite(
      retailPrice
    ) &&
    Number.isFinite(
      finalPrice
    ) &&
    retailPrice > finalPrice
  ) {
    const savings =
      retailPrice -
      finalPrice;

    const percentage =
      Math.round(
        (savings /
          retailPrice) *
          100
      );

    discountFlag.textContent =
      `${percentage}% OFF — Save $${savings.toFixed(
        2
      )}`;

    discountFlag.hidden =
      false;

  } else if (discountFlag) {
    discountFlag.hidden =
      true;
  }

  /*
   * Price
   */
  const priceElement =
    document.getElementById(
      "productPrice"
    );

  if (priceElement) {
    priceElement.textContent =
      finalPrice.toFixed(2);
  }

  /*
   * Color
   */
  const colorElement =
    document.getElementById(
      "productColor"
    );

  if (colorElement) {
    colorElement.textContent =
      product.Colors?.[0]
        ?.ColorName || "";
  }

  /*
   * Description
   */
  const descriptionElement =
    document.getElementById(
      "productDesc"
    );

  if (descriptionElement) {
    descriptionElement.innerHTML =
      product.DescriptionHtmlSimple ||
      "";
  }

  /*
   * Add to cart
   */
  const addToCartButton =
    document.getElementById(
      "addToCart"
    );

  if (addToCartButton) {
    addToCartButton.dataset.id =
      product.Id;
  }
}

/*
 * Convert:
 *
 * tents
 * ->
 * Tents
 *
 * sleeping-bags
 * ->
 * Sleeping Bags
 */
function formatCategoryName(
  category
) {
  if (!category) {
    return "Products";
  }

  return category
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
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
        "'": "&#039;"
      })[character]
  );
}