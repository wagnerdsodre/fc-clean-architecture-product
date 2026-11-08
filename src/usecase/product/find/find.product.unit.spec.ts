import Product from "../../../domain/product/entity/product";
import ProductRepositoryInterface from "../../../domain/product/repository/product-repository.interface";
import FindProductUseCase from "./find.product.usecase";

describe("Unit test find product use case", () => {
  let repository: jest.Mocked<ProductRepositoryInterface>;
  let usecase: FindProductUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(), find: jest.fn(), findAll: jest.fn(), update: jest.fn(),
    };
    usecase = new FindProductUseCase(repository);
  });

  it("should find a product by ID and return only its DTO", async () => {
    repository.find.mockResolvedValue(new Product("1", "Product 1", 10.5));

    const output = await usecase.execute({ id: "1" });

    expect(output).toStrictEqual({ id: "1", name: "Product 1", price: 10.5 });
    expect(repository.find).toHaveBeenCalledTimes(1);
    expect(repository.find).toHaveBeenCalledWith("1");
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should propagate a product not found error", async () => {
    repository.find.mockRejectedValue(new Error("Product not found"));

    await expect(usecase.execute({ id: "missing" })).rejects.toThrow("Product not found");
  });

  it("should propagate database errors", async () => {
    const error = new Error("Database unavailable");
    repository.find.mockRejectedValue(error);

    await expect(usecase.execute({ id: "1" })).rejects.toBe(error);
  });
});
