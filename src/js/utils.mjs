// wrapper for querySelector...returns matching element

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// or a more concise version if you are into that sort of thing:

// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// save data to local storage

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// set a listener for both touchend and click

export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });

  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);

  const product = urlParams.get(param);

  return product;
}

export function renderListWithTemplate(
  template,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  // Make sure list is a valid array before calling map to prevent runtime errors

  if (!Array.isArray(list)) {
    console.error(
      "The data provided to renderListWithTemplate is not a valid array:",
      list,
    );
    return;
  }

  const htmlStrings = list.map(template);

  if (clear) {
    parentElement.innerHTML = "";
  }

  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;

  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const res = await fetch(path);

  const template = await res.text();

  return template;
}

// Update the number of items displayed on the cart icon

export function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];

  const totalItems = cartItems.reduce(
    (total, item) => total + (item.Quantity || 1),
    0,
  );

  const cartCount = document.querySelector(".cart-count");

  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

export async function loadHeaderFooter() {
<<<<<<< HEAD
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");
=======
  const headerTemplate = await loadTemplate("../partials/header.html");

  const footerTemplate = await loadTemplate("../partials/footer.html");
>>>>>>> 279938a3d8dddbbaedac89c087e25fdd1f3cd75e

  const headerElement = document.querySelector("#main-header");

  const footerElement = document.querySelector("#main-footer");

  renderWithTemplate(headerTemplate, headerElement);

  renderWithTemplate(footerTemplate, footerElement);

  // Update cart count after the header has been loaded

  updateCartCount();
}