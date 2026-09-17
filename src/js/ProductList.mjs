import { renderListWithTemplate } from './utils.mjs';

function productCardTemplate(product) {
  // Safely extract price
  let price = 0;
  if (product.FinalPrice !== undefined) {
    price = product.FinalPrice;
  } else if (product.ListPrice !== undefined) {
    price = product.ListPrice;
  } else if (product.SuggestedRetailPrice !== undefined) {
    price = product.SuggestedRetailPrice;
  }
  price = typeof price === 'number' ? price : parseFloat(price) || 0;

  // Image from new API structure
  const image =
    product.Images?.PrimaryMedium ||
    product.Image ||
    '/images/placeholder.jpg';

  const id = product.Id || '';
  const name = product.Name || 'Product';
  const brand = product.Brand?.Name || product.Brand || '';

  return `<li class="product-card">
    <a href="/product_pages/?product=${id}">
      <img 
        src="${image}" 
        alt="${name}"
        loading="lazy"
      >
      <h3 class="card__brand">${brand}</h3>
      <h2 class="card__name">${name}</h2>
      <p class="product-card__price">$${price.toFixed(2)}</p>
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    try {
      const list = await this.dataSource.getData(this.category);
      if (!list || list.length === 0) {
        this.listElement.innerHTML = '<p>No products found.</p>';
        return;
      }
      this.renderList(list);
    } catch (error) {
      console.error('Error initializing product list:', error);
      this.listElement.innerHTML = '<p>Error loading products.</p>';
    }
  }

  renderList(list) {
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      'afterbegin',
      true
    );
  }
}