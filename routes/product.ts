import express from "express";
import { Product, validate } from "../models/product";

const router = express.Router();

router.get(
  [
    "/",
    "/businessline/:businessLine",
    "/price/:price",
    "/businessline/:businessLine/price/:price"
  ],
  async (req: express.Request, res: express.Response) => {
    const params = req.params;
    let from = req.query.from | 0;
    from = Number(from);

    const findObj: { [key: string]: any } = {};

    if (params["businessline"]) {
      findObj["businessline"] = params["businessline"];
    }

    if (params["price"]) {
      let splitter = params["price"].split("-");
      const price_obj = {
        $gte: splitter[0],
        $lte: splitter[1]
      };
      findObj["price"] = price_obj;
    }

    const products = Product.find(findObj)
      .skip(from)
      .limit(11);

    console.log(req.params);
    res.send(`Data: ${req.params}`).status(200);
  }
);

router.post(
  "/product",
  async (req: express.Request, res: express.Response) => {}
);

export default {
  router
};
