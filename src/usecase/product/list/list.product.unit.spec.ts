import Product from "../../../domain/product/entity/product";
import ProductRepositoryInterface from "../../../domain/product/repository/product-repository.interface";
import ListProductUseCase from "./list.product.usecase";

describe("Unit test list product use case", () => {
  let repository: jest.Mocked<ProductRepositoryInterface>;
  let usecase: ListProductUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(), find: jest.fn(), findAll: jest.fn(), update: jest.fn(),
    };
    usecase = new ListProductUseCase(repository);
  });

  it("should map every product to a DTO", async () => {
    repository.findAll.mockResolvedValue([
      new Product("1", "Product 1", 10.5),
      new Product("2", "Free product", 0),
    ]);

    await expect(usecase.execute({})).resolves.toStrictEqual({
      products: [
        { id: "1", name: "Product 1", price: 10.5 },
        { id: "2", name: "Free product", price: 0 },
      ],
    });
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should return an empty list when no products exist", async () => {
    repository.findAll.mockResolvedValue([]);

    await expect(usecase.execute({})).resolves.toStrictEqual({ products: [] });
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Database unavailable");
    repository.findAll.mockRejectedValue(error);

    await expect(usecase.execute({})).rejects.toBe(error);
  });
});
