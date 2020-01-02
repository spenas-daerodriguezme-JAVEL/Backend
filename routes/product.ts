import express from "express";
import { Product, validate } from "../models/product";
import adminAuth from "../middleware/adminAuth";
import auth from "../middleware/auth";
import _ from "lodash";
import user from "./user";

const router = express.Router();

let pickParams = (req: express.Request) => {
  return _.pick(req.body, [
    "name",
    "businessLine",
    "price",
    "classificator",
    "quantity",
    "description",
    "model",
    "physicalAspect",
    "smell",
    "color",
    "fragance",
    "gravity",
    "viscosity",
    "solubility",
    "flammable",
    "density",
    "ph",
    "activeComponent",
    "weight",
    "refractionIndex",
    "dilution",
    "isToxic",
    "paragraph1",
    "paragraph2",
    "paragraph3",
    "paragraph4",
    "stepTitle",
    "steps",
    "promoTitle"
  ]);
};

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
      let regexp = new RegExp(params["businessline"], "i");
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
      .exec(async (err, products) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err
          });
        }
        Product.countDocuments({}, function (err: any, count: number) {
          res.json({
            ok: true,
            products,
            pages: Math.ceil(count / 11)
          });
        });
      });

    // console.log(req.params);
    //res.send(`Data: ${req.params.price}`).status(200);
  }
);

router.get('/search/:search', async (req: express.Request, res: express.Response) => {
  const params = req.params;
  let search = new RegExp(params["search"], "i");
  await Product.find({
    $or: [
      { "name": search},
      {"businessLine": search},
      {"model": search},
      {"description": search}
    ]
    // "name": search
  }, (err, products) => {
      if (err) res.status(500).send({
        err
      })
      if (!products) res.status(404).send();
      res.status(200).send({
        ok: true,
        products
      })
  })
});

router.get('/businesslinelist', (req: express.Request, res: express.Response) => {

  const businesslines = Product.find()
    .distinct("businessLine", (err, businessLines) => {
      if (err) res.status(500).send()
      res.status(200).send({
        ok: true,
        businessLines
      });

    })

});

router.post("/", async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let product = new Product(pickParams(req));

  await product.save();
  res.status(200).send({
    message: "Product created succesfully",
    product
  });
});

router.put("/:id", async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let product = await Product.findByIdAndUpdate(req.params.id, pickParams(req));

  if (!product) return res.status(404).send("The product cannot be found.");

  res.status(200).send({
    message: "Updated succesfully",
    product
  });
});

export default {
  router
};
