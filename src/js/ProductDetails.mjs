import { getLocalStorage, setLocalStorage } from "./utils.mjs";

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

    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
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

    const itemAlreadyInCart = cartItems.find(
      (item) => item.Id === this.product.Id,
    );
    // If the product is already in the cart, increase its quantity.
    if (itemAlreadyInCart) {
      itemAlreadyInCart.Quantity =
        (itemAlreadyInCart.Quantity ||
          1) + 1;

    } else {
      this.product.Quantity = 1;

      // Add the current product to the cart array.
      cartItems.push(this.product);
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

  document.querySelector("h3").textContent = product.NameWithoutBrand;

  const nameElement =
    document.querySelector("h3");

  productImage.src = product.Images.PrimaryLarge;
  productImage.alt = product.NameWithoutBrand;

  document.getElementById("productPrice").textContent = product.FinalPrice;

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

  document.getElementById("addToCart").dataset.id = product.Id;
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