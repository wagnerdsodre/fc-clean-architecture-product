import request from "supertest";
import CreateProductUseCase from "../../../usecase/product/create/create.product.usecase";
import ProductModel from "../../product/repository/sequelize/product.model";
import ProductRepository from "../../product/repository/sequelize/product.repository";
import { app, databaseReady, sequelize } from "../express";

describe("E2E test for product listing", () => {
  beforeEach(async () => {
    await databaseReady;
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should return HTTP 200 and an empty JSON list when no products exist", async () => {
    const response = await request(app).get("/product");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(response.body).toStrictEqual({ products: [] });
  });

  it("should return HTTP 200 and a persisted product as JSON", async () => {
    const create = new CreateProductUseCase(new ProductRepository());
    const product = await create.execute({ name: "Product 1", price: 10.5 });

    const response = await request(app)
      .get("/product")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(response.body).toStrictEqual({ products: [product] });
    expect(await ProductModel.count()).toBe(1);
  });

  it("should return every persisted product with its ID, name and price", async () => {
    const create = new CreateProductUseCase(new ProductRepository());
    const first = await create.execute({ name: "Café & pão", price: 12.75 });
    const second = await create.execute({ name: "Free product", price: 0 });

    const response = await request(app).get("/product");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(Object.keys(response.body)).toEqual(["products"]);
    expect(response.body.products).toHaveLength(2);
    expect(response.body.products).toEqual(expect.arrayContaining([first, second]));
    expect(await ProductModel.count()).toBe(2);
  });

  it("should return HTTP 500 without leaking database details when listing fails", async () => {
    await ProductModel.drop();

    const response = await request(app).get("/product");

    expect(response.status).toBe(500);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(response.body).toStrictEqual({ error: "Internal server error" });
  });
});
