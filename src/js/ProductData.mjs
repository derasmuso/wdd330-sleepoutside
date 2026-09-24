/**
 * Product data loader for the SleepOutside project.
 *
 * The project includes product JSON in /public/json so the app works locally
 * and on static hosting without requiring a separate API server.
 */
function normalizeProducts(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.Result)) return data.Result;
  if (Array.isArray(data?.products)) return data.products;
  return [];
}

async function fetchJson(url) {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`Unable to load ${url}: HTTP ${response.status}`);
  }

  // A Vite/hosting fallback often returns index.html for a bad API URL.
  // Detect that before calling response.json(), which would otherwise produce
  // the confusing "Unexpected token '<'" error.
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    if (/^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) {
      throw new Error(`Expected JSON from ${url}, but the server returned HTML.`);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Expected JSON from ${url}, but received an invalid response.`);
    }
  }

  return response.json();
}

export default class ProductData {
  constructor(category = "tents") {
    this.category = category;
  }

  async getData(category = this.category) {
    const normalizedCategory = String(category || "tents")
      .trim()
      .toLowerCase();

    const data = await fetchJson(`/json/${normalizedCategory}.json`);
    return normalizeProducts(data);
  }

  async findProductById(id) {
    const productId = String(id || "").trim();
    if (!productId) return null;

    // Product detail pages pass their category in the URL. Search that file
    // first, then fall back to the other local product datasets.
    const categories = [this.category, "tents", "backpacks", "sleeping-bags"]
      .map((category) => String(category || "").toLowerCase())
      .filter((category, index, array) => category && array.indexOf(category) === index);

    for (const category of categories) {
      try {
        const products = await this.getData(category);
        const found = products.find(
          (product) => String(product?.Id || "").toLowerCase() === productId.toLowerCase(),
        );

        if (found) return found;
      } catch (error) {
        console.warn(`Unable to search ${category} product data:`, error);
      }
    }

    return null;
  }

  async search(searchTerm) {
    const normalizedTerm = String(searchTerm || "").trim().toLowerCase();
    if (!normalizedTerm) return [];

    const categories = ["tents", "backpacks", "sleeping-bags"];
    const results = [];

    for (const category of categories) {
      try {
        const products = await this.getData(category);
        results.push(
          ...products.filter((product) => {
            const searchableProduct = [
              product?.Name,
              product?.NameWithoutBrand,
              product?.Brand?.Name,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableProduct.includes(normalizedTerm);
          }),
        );
      } catch (error) {
        console.warn(`Unable to search ${category} product data:`, error);
      }
    }

    return results;
  }
}
