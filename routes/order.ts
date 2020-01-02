import express from "express";
import Order from "../models/order";
import adminAuth from "../middleware/adminAuth";
import auth from "../middleware/auth";
import _ from "lodash";

const router = express.Router();

let pickParams = (req: express.Request) => {
  return _.pick(req.body, [
    "name",
    "lastName",
    "email",
    "telephone",
    "address",
    "city",
    "state"
  ]);
};

router.get('/', [auth, adminAuth], async (req: express.Request, res: express.Response) => {

})

// router.post('/', async (req: express.Request, res: express.Response) => {

//   const products = req.body.products as any[];
//   const findProduct: { [key: string]:any } = {};
//   products.forEach((item) => {

//   })

//   let order = new Order({
//     user: pickParams(req),
//     products: 
//     })
// })