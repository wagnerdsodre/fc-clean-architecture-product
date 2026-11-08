import { validate as isUuid } from "uuid";
import Product from "../../../domain/product/entity/product";
import ProductRepositoryInterface from "../../../domain/product/repository/product-repository.interface";
import CreateProductUseCase from "./create.product.usecase";

describe("Unit test create product use case", () => {
  let repository: jest.Mocked<ProductRepositoryInterface>;
  let usecase: CreateProductUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };
    usecase = new CreateProductUseCase(repository);
  });

  it("should create a product and return its DTO", async () => {
    const input = { name: "Product 1", price: 10.5 };
    const output = await usecase.execute(input);

    expect(output).toStrictEqual({ id: expect.any(String), ...input });
    expect(isUuid(output.id)).toBe(true);
    expect(repository.create).toHaveBeenCalledTimes(1);
    const product = repository.create.mock.calls[0][0];
    expect(product).toBeInstanceOf(Product);
    expect({ id: product.id, name: product.name, price: product.price }).toEqual(output);
    expect(input).toEqual({ name: "Product 1", price: 10.5 });
  });

  it("should generate a different ID for each product", async () => {
    const input = { name: "Product 1", price: 10 };
    const first = await usecase.execute(input);
    const second = await usecase.execute(input);

    expect(first.id).not.toBe(second.id);
  });

  it("should accept a zero price according to the domain rules", async () => {
    await expect(usecase.execute({ name: "Free product", price: 0 })).resolves.toEqual({
      id: expect.any(String), name: "Free product", price: 0,
    });
  });

  it.each([
    [{ name: "", price: 10 }, "Name is required"],
    [{ name: "Product 1", price: -1 }, "Price must be greater than zero"],
  ])("should reject invalid input %j before persisting", async (input, message) => {
    await expect(usecase.execute(input)).rejects.toThrow(message);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should propagate persistence errors", async () => {
    const error = new Error("Database unavailable");
    repository.create.mockRejectedValue(error);

    await expect(usecase.execute({ name: "Product 1", price: 10 })).rejects.toBe(error);
  });
});
