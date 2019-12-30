import express from "express";
import { Product, validate } from "../models/product";

const router = express.Router();

router.get(
  [
    "/",
    "/businessline/:businessline",
    "/price/:price",
    "/businessline/:businessline/price/:price"
  ],
  async (req: express.Request, res: express.Response) => {
    const params = req.params;
    let from = req.query.from | 0;
    from = Number(from);

    const findObj: { [key: string]: any } = {};

    if (params["businessline"]) {
      let regexp = new RegExp(params["businessline"], 'i');
      findObj["businessLine"] = regexp;
    }

    if (params["price"]) {
      let splitter = params["price"].split("-");
      const price_obj = {
        $gte: splitter[0],
        $lte: splitter[1]
      };
      findObj["price"] = price_obj;
    }



    Product.find(findObj)
      .skip(from)
      .limit(11)
      .exec((err, productos) =>{
        if (err) {
          return res.status(500).json({
              ok: false,
              err
          });
      }

      res.json({
          ok: true,
          productos
      });
      });

    // console.log(req.params);
    //res.send(`Data: ${req.params.price}`).status(200);
   
  }
);

router.post(
  "/product",
  async (req: express.Request, res: express.Response) => { }
);

export default {
  router
};
