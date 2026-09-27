import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.externalServices = new ExternalServices();
  }

  init() {
    this.list = getLocalStorage(this.key) || [];

    this.calculateItemSubTotal();
    this.calculateOrderTotal();
  }

  calculateItemSubTotal() {
    this.itemTotal = this.list.reduce((total, item) => {
      const price = Number(item.FinalPrice || item.ListPrice || 0);
      const quantity = Number(item.Quantity || 1);

      return total + price * quantity;
    }, 0);

    return this.itemTotal;
  }

  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;

    const itemCount = this.list.reduce((total, item) => {
      return total + Number(item.Quantity || 1);
    }, 0);

    if (itemCount > 0) {
      this.shipping = 10 + (itemCount - 1) * 2;
    } else {
      this.shipping = 0;
    }

    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();

    return this.orderTotal;
  }

  displayOrderTotals() {
    const subtotal = document.querySelector(
      `${this.outputSelector} #subtotal`,
    );

    const tax = document.querySelector(
      `${this.outputSelector} #tax`,
    );

    const shipping = document.querySelector(
      `${this.outputSelector} #shipping`,
    );

    const orderTotal = document.querySelector(
      `${this.outputSelector} #ordertotal`,
    );

    if (subtotal) {
      subtotal.innerText = `Subtotal: $${this.itemTotal.toFixed(2)}`;
    }

    if (tax) {
      tax.innerText = `Tax: $${this.tax.toFixed(2)}`;
    }

    if (shipping) {
      shipping.innerText = `Shipping Estimate: $${this.shipping.toFixed(2)}`;
    }

    if (orderTotal) {
      orderTotal.innerText = `Order Total: $${this.orderTotal.toFixed(2)}`;
    }
  }

  packageItems(items) {
    return items.map((item) => ({
      id: item.Id,
      quantity: item.Quantity,
    }));
  }

  async checkout(form) {
    const formData = new FormData(form);

    const order = {
      orderDate: new Date(),
      fname: formData.get("fname"),
      lname: formData.get("lname"),
      street: formData.get("saddress"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      cardNumber: formData.get("ccn"),
      expiration: formData.get("expiration"),
      code: formData.get("security"),
      items: this.packageItems(this.list),
      orderTotal: this.orderTotal,
      shipping: this.shipping,
      tax: this.tax,
    };

    return this.externalServices.checkout(order);
  }
}