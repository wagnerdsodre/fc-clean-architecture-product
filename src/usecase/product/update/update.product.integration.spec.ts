import { Sequelize } from "sequelize-typescript";
import Product from "../../../domain/product/entity/product";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import UpdateProductUseCase from "./update.product.usecase";

describe("Integration test update product use case", () => {
  let sequelize: Sequelize;
  let repository: ProductRepository;
  let usecase: UpdateProductUseCase;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite", storage: ":memory:", logging: false, models: [ProductModel],
    });
    await sequelize.sync({ force: true });
    repository = new ProductRepository();
    usecase = new UpdateProductUseCase(repository);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should persist changes under the same ID without changing another product", async () => {
    await repository.create(new Product("1", "Product 1", 10));
    await repository.create(new Product("2", "Product 2", 30));
    const input = { id: "1", name: "Updated product", price: 20.5 };

    await expect(usecase.execute(input)).resolves.toStrictEqual(input);

    expect((await ProductModel.findByPk("1")).toJSON()).toStrictEqual(input);
    expect((await ProductModel.findByPk("2")).toJSON()).toStrictEqual({
      id: "2", name: "Product 2", price: 30,
    });
    expect(await ProductModel.count()).toBe(2);
  });

  it("should persist a zero price", async () => {
    await repository.create(new Product("1", "Product 1", 10));

    await usecase.execute({ id: "1", name: "Free product", price: 0 });

    expect((await ProductModel.findByPk("1")).toJSON()).toStrictEqual({
      id: "1", name: "Free product", price: 0,
    });
  });

  it.each([
    [{ id: "1", name: "", price: 20 }, "Name is required"],
    [{ id: "1", name: "Updated product", price: -1 }, "Price must be greater than zero"],
  ])("should leave stored data unchanged for invalid input %j", async (input, message) => {
    await repository.create(new Product("1", "Product 1", 10));

    await expect(usecase.execute(input)).rejects.toThrow(message);

    expect((await ProductModel.findByPk("1")).toJSON()).toStrictEqual({
      id: "1", name: "Product 1", price: 10,
    });
    expect(await ProductModel.count()).toBe(1);
  });

  it("should reject an unknown ID without inserting a product", async () => {
    await repository.create(new Product("1", "Product 1", 10));

    await expect(usecase.execute({ id: "missing", name: "Updated", price: 20 }))
      .rejects.toThrow("Product not found");

    expect(await ProductModel.findByPk("missing")).toBeNull();
    expect((await ProductModel.findByPk("1")).toJSON()).toStrictEqual({
      id: "1", name: "Product 1", price: 10,
    });
    expect(await ProductModel.count()).toBe(1);
  });
});
