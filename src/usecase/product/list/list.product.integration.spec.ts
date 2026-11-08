import { Sequelize } from "sequelize-typescript";
import Product from "../../../domain/product/entity/product";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import ListProductUseCase from "./list.product.usecase";

describe("Integration test list product use case", () => {
  let sequelize: Sequelize;
  let repository: ProductRepository;
  let usecase: ListProductUseCase;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite", storage: ":memory:", logging: false, models: [ProductModel],
    });
    await sequelize.sync({ force: true });
    repository = new ProductRepository();
    usecase = new ListProductUseCase(repository);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should return all persisted products without assuming database order", async () => {
    await repository.create(new Product("1", "Product 1", 10.5));
    await repository.create(new Product("2", "Free product", 0));

    const output = await usecase.execute({});

    expect(output.products).toHaveLength(2);
    expect(output.products).toEqual(expect.arrayContaining([
      { id: "1", name: "Product 1", price: 10.5 },
      { id: "2", name: "Free product", price: 0 },
    ]));
    expect(await ProductModel.count()).toBe(2);
  });

  it("should return an empty list when the database is empty", async () => {
    await expect(usecase.execute({})).resolves.toStrictEqual({ products: [] });
  });

  it("should return a list with a single persisted product", async () => {
    await repository.create(new Product("1", "Product 1", 10));

    await expect(usecase.execute({})).resolves.toStrictEqual({
      products: [{ id: "1", name: "Product 1", price: 10 }],
    });
  });
});
