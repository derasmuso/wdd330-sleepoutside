// src/js/CheckoutProcess.mjs
import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};
  formData.forEach(function (value, key) {
    convertedJSON[key] = value;
  });
  return convertedJSON;
}

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice || item.ListPrice || item.Price || 0,
    quantity: item.quantity || 1,
  }));
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.services = new ExternalServices();
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    let subtotal = 0;
    this.list.forEach((item) => {
      const price = item.FinalPrice || item.ListPrice || item.Price || 0;
      const quantity = item.quantity || 1;
      subtotal += price * quantity;
    });
    this.itemTotal = subtotal;

    const subtotalElement = document.querySelector(`${this.outputSelector} #subtotal`);
    if (subtotalElement) {
      subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
  }

  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;

    const itemCount = this.list.reduce((sum, item) => sum + (item.quantity || 1), 0);
    this.shipping = itemCount > 0 ? 10 + (itemCount - 1) * 2 : 0;

    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxElement = document.querySelector(`${this.outputSelector} #tax`);
    const shippingElement = document.querySelector(`${this.outputSelector} #shipping`);
    const totalElement = document.querySelector(`${this.outputSelector} #orderTotal`);

    if (taxElement) taxElement.textContent = `$${this.tax.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${this.shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout(form) {
    const order = formDataToJSON(form);

    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal.toFixed(2);
    order.tax = this.tax.toFixed(2);
    order.shipping = this.shipping;
    order.items = packageItems(this.list);

    console.log("Order submitted:", order);

    try {
      const response = await this.services.checkout(order);
      console.log("Server response:", response);
      return response;
    } catch (error) {
      console.error("Error submitting order:", error);
      throw error;
    }
  }
}