import CheckoutProcess from "./CheckoutProcess.mjs";
import { loadHeaderFooter } from "./utils.mjs";

const checkoutProcess = new CheckoutProcess("so-cart", "#ordersumm");

async function init() {
  await loadHeaderFooter();

  checkoutProcess.init();

  const form = document.querySelector("#checkoutForm");

  if (form) {
    form.addEventListener("submit", async (event) => {
      // personal work in comments
      // event.preventDefault();
      //checkoutProcess.checkout(form)
      event.preventDefault();
      await checkoutProcess.checkout(form);
    });
  }
}

init();