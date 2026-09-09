<<<<<<< HEAD
// src/js/ProductData.mjs

=======
>>>>>>> 301d1cfd77470fe2fab472cb17786332eb8d2e84
function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
<<<<<<< HEAD
    throw new Error('Bad Response');
=======
    throw new Error("Bad Response");
>>>>>>> 301d1cfd77470fe2fab472cb17786332eb8d2e84
  }
}

export default class ProductData {
  constructor(category) {
    this.category = category;
    this.path = `../json/${this.category}.json`;
  }
<<<<<<< HEAD

  async getData() {
    try {
      const response = await fetch(this.path);
      const data = await convertToJson(response);
      return data;
    } catch (error) {
      console.error('Error fetching product data:', error);
      return [];
    }
  }

  async findProductById(id) {
    try {
      const products = await this.getData();
      return products.find((item) => item.Id === id);
    } catch (error) {
      console.error('Error finding product:', error);
      return null;
    }
  }

  async getProductsByCategory() {
    try {
      const products = await this.getData();
      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }
}
=======
  getData() {
    return fetch(this.path)
      .then(convertToJson)
      .then((data) => data);
  }
  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }
}
>>>>>>> 301d1cfd77470fe2fab472cb17786332eb8d2e84
