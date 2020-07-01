import express from 'express';
import _ from 'lodash';
import Order from '../models/order';
import adminAuth from '../middleware/adminAuth';
import auth from '../middleware/auth';

const router = express.Router();

const pickParams = (req: express.Request) => _.pick(req.body, [
  'name',
  'lastName',
  'email',
  'telephone',
  'address',
  'city',
  'state',
]);

// router.get('/', [auth, adminAuth], async (req: express.Request, res: express.Response) => {

// })

// router.post('/', async (req: express.Request, res: express.Response) => {

//   const products = req.body.products as any[];
//   const findProduct: { [key: string]:any } = {};
//   products.forEach((item) => {
//     product =
//   })

//   let order = new Order({
//     user: pickParams(req),
//     products:
//     })
// })
