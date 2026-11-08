import express, { Request, Response } from "express";
import ListProductUseCase from "../../../usecase/product/list/list.product.usecase";
import ProductRepository from "../../product/repository/sequelize/product.repository";

export const productRoute = express.Router();

productRoute.get("/", async (req: Request, res: Response) => {
  const usecase = new ListProductUseCase(new ProductRepository());

  try {
    const output = await usecase.execute({});
    res.status(200).json(output);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
