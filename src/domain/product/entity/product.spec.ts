import Product from "./product";

describe("Product unit tests", () => {
  it("should add an error to the notification when id is empty", () => {
    const product = new Product("", "Product 1", 100);

    expect(product.notification.getErrors()).toEqual([
      { context: "product", message: "Id is required" },
    ]);
    expect(product.validate()).toBe(false);
  });

  it("should add an error to the notification when name is empty", () => {
    const product = new Product("123", "", 100);

    expect(product.notification.getErrors()).toEqual([
      { context: "product", message: "Name is required" },
    ]);
    expect(product.validate()).toBe(false);
  });

  it("should add an error to the notification when price is negative", () => {
    const product = new Product("123", "Name", -1);

    expect(product.notification.getErrors()).toEqual([
      { context: "product", message: "Price must be greater than zero" },
    ]);
    expect(product.validate()).toBe(false);
  });

  it("should collect multiple validation errors in the notification", () => {
    const product = new Product("123", "", -1);

    expect(product.notification.getErrors()).toEqual([
      { context: "product", message: "Name is required" },
      { context: "product", message: "Price must be greater than zero" },
    ]);
    expect(product.notification.hasErrors()).toBe(true);
    expect(product.validate()).toBe(false);
  });

  it("should clear validation errors after the product becomes valid", () => {
    const product = new Product("123", "", -1);

    product.changeName("Product 1");
    product.changePrice(100);

    expect(product.notification.hasErrors()).toBe(false);
    expect(product.validate()).toBe(true);
  });

  it("should change name", () => {
    const product = new Product("123", "Product 1", 100);
    product.changeName("Product 2");
    expect(product.name).toBe("Product 2");
  });

  it("should change price", () => {
    const product = new Product("123", "Product 1", 100);
    product.changePrice(150);
    expect(product.price).toBe(150);
  });
});
