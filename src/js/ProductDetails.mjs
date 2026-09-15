
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);

    this.renderProductDetails();

    document
      .getElementById("addToCart")
      .addEventListener(
        "click",
        this.addProductToCart.bind(this)
      );
  }

  addProductToCart() {
    // Get the existing cart from localStorage.
    // If there is no cart yet, create an empty array.
    const cartItems = getLocalStorage("so-cart") || [];

    // Add the current product to the cart array.
    // Using an array allows multiple products to be stored.
    cartItems.push(this.product);

    // Save the updated cart array back to localStorage.
    setLocalStorage("so-cart", cartItems);

    // Disable the Add to Cart button after the product
    // has been successfully added.
    const addToCartButton = document.getElementById("addToCart");
    addToCartButton.disabled = true;

    // Change the button text to let the user know
    // the product was added.
    addToCartButton.textContent = "Successfully Added to Cart";
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }
}

function productDetailsTemplate(product) {
  document.querySelector("h2").textContent = product.Brand.Name;

  document.querySelector("h3").textContent =
    product.NameWithoutBrand;

  const productImage = document.getElementById("productImage");

  productImage.src = product.Image;
  productImage.alt = product.NameWithoutBrand;

  document.getElementById("productPrice").textContent =
    product.FinalPrice;

  document.getElementById("productColor").textContent =
    product.Colors[0].ColorName;

  document.getElementById("productDesc").innerHTML =
    product.DescriptionHtmlSimple;

  document.getElementById("addToCart").dataset.id =
    product.Id;
}
