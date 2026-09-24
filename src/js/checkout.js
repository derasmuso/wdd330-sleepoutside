import { getLocalStorage, loadHeaderFooter } from "./utils.mjs";

const CART_KEY = "so-cart";
const TAX_RATE = 0.06;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_RATE = 10;

function getCart() {
  const cart = getLocalStorage(CART_KEY);
  return Array.isArray(cart) ? cart : [];
}

function getItemPrice(item) {
  const price = Number(item?.FinalPrice ?? item?.ListPrice ?? 0);
  return Number.isFinite(price) && price >= 0 ? price : 0;
}

function calculateTotals(cart) {
  const subtotal = cart.reduce((sum, item) => {
    const quantity = Number(item?.Quantity || 1);
    return sum + getItemPrice(item) * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
  }, 0);

  const tax = subtotal * TAX_RATE;
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_RATE;

  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
  };
}

function displayTotals(totals) {
  document.querySelector("#subtotal").textContent =
    `Subtotal: $${totals.subtotal.toFixed(2)}`;

  document.querySelector("#tax").textContent =
    `Tax: $${totals.tax.toFixed(2)}`;

  document.querySelector("#shipping").textContent =
    `Shipping Estimate: $${totals.shipping.toFixed(2)}`;

  document.querySelector("#ordertotal").textContent =
    `Order Total: $${totals.total.toFixed(2)}`;
}

function showMessage(message, type = "error") {
  const element = document.querySelector("#checkoutMessage");

  if (!element) return;

  element.textContent = message;
  element.className = `checkout-message ${type}`;
  element.hidden = false;
}

function clearMessage() {
  const element = document.querySelector("#checkoutMessage");

  if (!element) return;

  element.textContent = "";
  element.hidden = true;
  element.className = "checkout-message";
}

function validateCardNumber(value) {
  const digits = value.replace(/\D/g, "");

  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  // Luhn validation.
  let sum = 0;
  let doubleDigit = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function validateExpiration(value) {
  if (!value) return false;

  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return (
    year > currentYear ||
    (year === currentYear && month >= currentMonth)
  );
}

function validateCheckoutForm(form) {
  const requiredFields = [...form.querySelectorAll("[required]")];

  for (const field of requiredFields) {
    if (!field.value.trim()) {
      field.setCustomValidity("This field is required.");
    } else {
      field.setCustomValidity("");
    }
  }

  const zip = document.querySelector("#zip");
  if (zip.value && !/^\d{5}$/.test(zip.value.trim())) {
    zip.setCustomValidity("Enter a 5-digit ZIP code.");
  }

  const cardNumber = document.querySelector("#ccn");
  if (cardNumber.value && !validateCardNumber(cardNumber.value)) {
    cardNumber.setCustomValidity("Enter a valid card number.");
  }

  const expiration = document.querySelector("#expiration");
  if (expiration.value && !validateExpiration(expiration.value)) {
    expiration.setCustomValidity("Enter a current or future expiration date.");
  }

  const security = document.querySelector("#security");
  if (security.value && !/^\d{3,4}$/.test(security.value.trim())) {
    security.setCustomValidity("Enter a 3 or 4 digit security code.");
  }

  return form.checkValidity();
}

async function handleSubmit(event) {
  event.preventDefault();
  clearMessage();

  const form = event.currentTarget;
  const cart = getCart();

  if (cart.length === 0) {
    showMessage("Your cart is empty. Add an item before checking out.");
    return;
  }

  if (!validateCheckoutForm(form)) {
    form.reportValidity();
    showMessage("Please correct the highlighted fields and try again.");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Processing...";
    }

    // This project has no backend payment endpoint, so this is the
    // client-side checkout flow required for the assignment.
    const totals = calculateTotals(cart);
    displayTotals(totals);

    await new Promise((resolve) => setTimeout(resolve, 400));

    localStorage.removeItem(CART_KEY);
    form.reset();

    showMessage(
      `Order placed successfully! Your total was $${totals.total.toFixed(2)}.`,
      "success",
    );

    displayTotals({
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    });
  } catch (error) {
    console.error("Checkout failed:", error);
    showMessage(
      "We could not complete your order. Please check your information and try again.",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Place Order";
    }
  }
}

async function init() {
  await loadHeaderFooter();

  const cart = getCart();

  if (cart.length === 0) {
    showMessage("Your cart is empty. Add an item before checking out.");
  }

  displayTotals(calculateTotals(cart));

  const form = document.querySelector("#checkoutForm");

  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
}

init();
