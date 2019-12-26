import { Product } from "../models/product";
import express from "express";
import productList from "../seeds/products.json";

const router = express.Router();

router.post("/seeds", async (req: express.Request, res: express.Response) => {
  productList.data.forEach(async (element: any, idx: number) => {
    try {
      // element.steps = JSON.parse(element.steps);
      console.error(element);

      const product = new Product(element);
      await Product.remove({});
      await product.save();

      console.log(">>>> Seeds created");
      res.send("Seeds generated");
    } catch (error) {
      console.log(">>>> There was a problem creating seeds");
      console.log(error);
      res.send("Something went wrong");
    }
  });
});

export default {
  router
};
