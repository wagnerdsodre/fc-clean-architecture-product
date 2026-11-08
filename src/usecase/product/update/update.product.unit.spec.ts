import Product from "../../../domain/product/entity/product";
import ProductRepositoryInterface from "../../../domain/product/repository/product-repository.interface";
import UpdateProductUseCase from "./update.product.usecase";

describe("Unit test update product use case", () => {
  let repository: jest.Mocked<ProductRepositoryInterface>;
  let usecase: UpdateProductUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(), find: jest.fn(), findAll: jest.fn(), update: jest.fn(),
    };
    repository.find.mockResolvedValue(new Product("1", "Product 1", 10));
    usecase = new UpdateProductUseCase(repository);
  });

  it("should update the loaded product and return its DTO", async () => {
    const input = { id: "1", name: "Updated product", price: 20.5 };

    await expect(usecase.execute(input)).resolves.toStrictEqual(input);

    expect(repository.find).toHaveBeenCalledTimes(1);
    expect(repository.find).toHaveBeenCalledWith("1");
    expect(repository.update).toHaveBeenCalledTimes(1);
    const updated = repository.update.mock.calls[0][0];
    expect(updated).toBe(await repository.find.mock.results[0].value);
    expect(updated).toBeInstanceOf(Product);
    expect({ id: updated.id, name: updated.name, price: updated.price }).toEqual(input);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should allow changing the price to zero", async () => {
    await expect(usecase.execute({ id: "1", name: "Free product", price: 0 }))
      .resolves.toStrictEqual({ id: "1", name: "Free product", price: 0 });
    expect(repository.update.mock.calls[0][0].price).toBe(0);
  });

  it.each([
    [{ id: "1", name: "", price: 20 }, "Name is required"],
    [{ id: "1", name: "Updated product", price: -1 }, "Price must be greater than zero"],
  ])("should reject invalid input %j before persisting", async (input, message) => {
    await expect(usecase.execute(input)).rejects.toThrow(message);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should reject a missing product without updating", async () => {
    repository.find.mockRejectedValue(new Error("Product not found"));

    await expect(usecase.execute({ id: "missing", name: "Updated", price: 20 }))
      .rejects.toThrow("Product not found");
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should propagate lookup failures without updating", async () => {
    const error = new Error("Database unavailable");
    repository.find.mockRejectedValue(error);

    await expect(usecase.execute({ id: "1", name: "Updated", price: 20 })).rejects.toBe(error);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should propagate persistence errors", async () => {
    const error = new Error("Update failed");
    repository.update.mockRejectedValue(error);

    await expect(usecase.execute({ id: "1", name: "Updated", price: 20 })).rejects.toBe(error);
  });
});
