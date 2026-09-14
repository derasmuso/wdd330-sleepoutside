function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  constructor(category) {
    this.category = category;
    this.path = `../json/${this.category}.json`;
  }
  getData() {
    return fetch(this.path)
      .then(convertToJson)
      .then((data) => data);
  }
  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }

  async search(searchTerm) {
    const products = await this.getData();
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const searchableProduct = [
        product.Name,
        product.NameWithoutBrand,
        product.Brand.Name,
      ]
        .join(" ")
        .toLowerCase();

      return searchableProduct.includes(normalizedTerm);
    });
  }
}
