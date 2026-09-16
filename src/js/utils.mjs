// src/js/utils.mjs

// Get a parameter from the URL query string
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// Set data in localStorage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Get data from localStorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// Convert a number to currency format
export function convertToCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Generate a random ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


// Render a single template into a parent element
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

// Load a template from a file path
export async function loadTemplate(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`Failed to load template: ${res.status}`);
    }
    const template = await res.text();
    return template;
  } catch (error) {
    console.error('Error loading template:', error);
    return '';
  }
}

// Load both header and footer
export async function loadHeaderFooter() {
  try {
    // Load header
    const headerTemplate = await loadTemplate('/partials/header.html');
    const headerElement = document.querySelector('#main-header');
    if (headerElement) {
      renderWithTemplate(headerTemplate, headerElement);
    }

    // Load footer
    const footerTemplate = await loadTemplate('/partials/footer.html');
    const footerElement = document.querySelector('#main-footer');
    if (footerElement) {
      renderWithTemplate(footerTemplate, footerElement);
    }
  } catch (error) {
    console.error('Error loading header/footer:', error);
  }
}

// Existing renderListWithTemplate function
export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  if (clear) {
    parentElement.innerHTML = '';
  }
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(''));
}