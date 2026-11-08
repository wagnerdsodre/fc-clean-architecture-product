import { Sequelize } from "sequelize-typescript";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import CreateProductUseCase from "./create.product.usecase";

describe("Integration test create product use case", () => {
  let sequelize: Sequelize;
  let usecase: CreateProductUseCase;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      models: [ProductModel],
    });
    await sequelize.sync({ force: true });
    usecase = new CreateProductUseCase(new ProductRepository());
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should persist a product with its generated ID and decimal price", async () => {
    const output = await usecase.execute({ name: "Product 1", price: 10.5 });
    const stored = await ProductModel.findByPk(output.id);

    expect(output).toStrictEqual({ id: expect.any(String), name: "Product 1", price: 10.5 });
    expect(stored.toJSON()).toStrictEqual(output);
    expect(await ProductModel.count()).toBe(1);
  });

  it("should persist separate products with unique IDs", async () => {
    const first = await usecase.execute({ name: "Product 1", price: 10 });
    const second = await usecase.execute({ name: "Product 1", price: 10 });

    expect(first.id).not.toBe(second.id);
    expect(await ProductModel.count()).toBe(2);
  });

  it("should persist a zero price", async () => {
    const output = await usecase.execute({ name: "Free product", price: 0 });

    expect((await ProductModel.findByPk(output.id)).price).toBe(0);
  });

  it.each([
    [{ name: "", price: 10 }, "Name is required"],
    [{ name: "Product 1", price: -1 }, "Price must be greater than zero"],
  ])("should not persist invalid input %j", async (input, message) => {
    await expect(usecase.execute(input)).rejects.toThrow(message);
    expect(await ProductModel.count()).toBe(0);
  });
});
