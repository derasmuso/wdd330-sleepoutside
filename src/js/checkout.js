// src/js/checkout.js
import { loadHeaderFooter, alertMessage } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", ".checkout-summary");
checkout.init();

// Calculate tax/shipping/total when zip code is filled
const zipInput = document.getElementById("zip");
if (zipInput) {
  zipInput.addEventListener("blur", () => {
    checkout.calculateOrderTotal();
  });
}

// Handle form submission
const form = document.getElementById("checkoutForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    checkout.calculateOrderTotal();

    try {
      await checkout.checkout(form);
      // Success! Clear cart and go to success page
      localStorage.removeItem("so-cart");
      window.location.href = "/checkout/success.html";
    } catch (error) {
      // Show error to user
      console.error("Checkout error:", error);
      const message =
        error.message?.message ||
        error.message ||
        "There was a problem placing your order.";
      alertMessage(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    }
  });
}
