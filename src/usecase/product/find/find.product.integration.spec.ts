import { Sequelize } from "sequelize-typescript";
import Product from "../../../domain/product/entity/product";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import FindProductUseCase from "./find.product.usecase";

describe("Integration test find product use case", () => {
  let sequelize: Sequelize;
  let repository: ProductRepository;
  let usecase: FindProductUseCase;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite", storage: ":memory:", logging: false, models: [ProductModel],
    });
    await sequelize.sync({ force: true });
    repository = new ProductRepository();
    usecase = new FindProductUseCase(repository);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should find the requested product among persisted products", async () => {
    await repository.create(new Product("1", "Product 1", 10.5));
    await repository.create(new Product("2", "Product 2", 20));

    await expect(usecase.execute({ id: "1" })).resolves.toStrictEqual({
      id: "1", name: "Product 1", price: 10.5,
    });
    expect(await ProductModel.count()).toBe(2);
  });

  it("should find a product with zero price", async () => {
    await repository.create(new Product("1", "Free product", 0));

    await expect(usecase.execute({ id: "1" })).resolves.toEqual({
      id: "1", name: "Free product", price: 0,
    });
  });

  it("should reject an unknown ID even when other products exist", async () => {
    await repository.create(new Product("1", "Product 1", 10));

    await expect(usecase.execute({ id: "missing" })).rejects.toThrow("Product not found");
    expect(await ProductModel.count()).toBe(1);
  });

  it("should reject an ID when the database is empty", async () => {
    await expect(usecase.execute({ id: "missing" })).rejects.toThrow("Product not found");
  });
});
