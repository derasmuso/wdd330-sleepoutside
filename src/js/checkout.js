// src/js/checkout.js
import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", ".checkout-summary");
checkout.init();

const zipInput = document.getElementById("zip");
if (zipInput) {
  zipInput.addEventListener("blur", () => {
    checkout.calculateOrderTotal();
  });
}

const form = document.getElementById("checkoutForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    checkout.calculateOrderTotal();

    try {
      await checkout.checkout(form);
      alert("Order placed successfully!");
      localStorage.removeItem("so-cart");
      window.location.href = "/index.html";
    } catch (error) {
      alert("There was a problem placing your order. Please try again.");
      console.error(error);
    }
  });
}
