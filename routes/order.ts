/* eslint-disable no-underscore-dangle */
import express from 'express';
import _ from 'lodash';
import axios from 'axios';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
import md5 from 'md5';
import auth from '../middleware/auth';
import { Order } from '../models/order';
import { Product } from '../models/product';
import { Description } from '../models/description';
import { User } from '../models/user';
import adminAuth from '../middleware/adminAuth';
import { transport } from '../startup/mailer';

const router = express.Router();

const pickParams = (req: express.Request) => _.pick(req.body, [
  'name',
  'lastName',
  'email',
  'identificationType',
  'identificationNumber',
  'telephone',
  'address',
  'city',
  'state',
]);

// router.get('/', [auth, adminAuth], async (req: express.Request, res: express.Response) => {

// })
router.get('/allOrders', async (req: express.Request, res: express.Response) => {
  try {
    const orders = await Order.find({}) as any;
    const ordersToReturn = orders.map((order: any) => ({
      id: order._id,
      publicId: order.publicId,
      userIdentification: order.user.identificationNumber,
      price: order.totalPrice,
      date: order.dateCreated.toLocaleString('es-CO', { timeZone: 'America/Bogota' }).toString(),
      status: order.status,
    }));
    res.status(200).send({
      ordersToReturn,
    });
  } catch (error) {
    res.status(500);
  }
});

router.get('/byId/:id', async (req: express.Request, res: express.Response) => {
  try {
    const orders = await Order.findById(req.params.id) as any;
    // const orders = await Order.find({ 'user.identificationNumber': req.params.id }) as any;
    const ordersToReturn = orders.map((order: any) => ({
      id: order._id,
      publicId: order.publicId,
      price: order.totalPrice,
      date: order.dateCreated.toLocaleString('es-CO', { timeZone: 'America/Bogota' }).toString(),
      status: order.status,
    }));
    res.status(200).send(ordersToReturn);
  } catch (error) {
    res.status(500).send('There was an error retrieving the orders by id');
  }
});

router.get('/byUserId/:id', async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findById(req.params.id) as any;
    if (user === null) return res.status(404);
    const orders = await Order.find({
      'user.identificationNumber': user.identificationNumber,
    });
    const ordersToReturn = orders.map((order: any) => ({
      id: order._id,
      publicId: order.publicId,
      price: order.totalPrice,
      date: order.dateCreated.toLocaleString('es-CO', { timeZone: 'America/Bogota' }).toString(),
      status: order.status,
      userIdentification: order.user.identificationNumber,
    }));
    return res.status(200).send(ordersToReturn);
  } catch (error) {
    return res.status(500);
  }
});

router.post('/createOrder', async (req: express.Request, res: express.Response) => {
  const products = req.body.products as any[];
  const incompleteQtyProducts = [] as any[];

  try {
    const checkedProducts = products.map(async (item) => {
      const product = await Product.findById(item.productId) as any;
      if (!product) return new Error('Error in product');
      const description = await Description.findById(product.properties) as any;
      if (product.quantity < item.qty) {
        incompleteQtyProducts.push({
          // eslint-disable-next-line no-underscore-dangle
          productId: product._id,
          qty: product.quantity,
        });
      }
      return {
        productId: item.productId,
        productName: product.name,
        qty: item.qty,
        images: description.images,
        price: product.price,
        capacity: product.capacity,
      };
    });
    const productsContent = await Promise.all(checkedProducts);
    if (incompleteQtyProducts.length !== 0) {
      return res.status(400).send({
        message: 'The following products doesnt have the required quantities',
        products: incompleteQtyProducts,
      });
    }
    let newPublicId = await Order.countDocuments({}) as number;
    newPublicId += 1;
    const dateCreated = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }).toString();
    console.log(dateCreated);
    const order = new Order({
      publicId: newPublicId,
      user: pickParams(req),
      products: productsContent,
      totalPrice: req.body.totalPrice,
      dateCreated,
      status: 'PENDING',
    });
    const apiKey = process.env.SHP_KEY;
    const merchantId = process.env.MERCHANT_ID;
    const signature = md5(`${apiKey}~${merchantId}~${order._id}~${req.body.totalPrice}~COP`);
    const response = await order.save();
    return res.status(200).send({
      createdOrder: response,
      merchantId,
      signature,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'Error creating order',
      error,
    });
  }
});

function generateMailInfo(order:any) : any {
  let cid = 1;
  const attachments = [{
    filename: 'logo',
    path: path.resolve('./assets/images/aguadejavel_logo.png'),
    cid: cid.toString(),
  }];
  // eslint-disable-next-line max-len
  const productsList: { name: any; qty: number; price: number; cid: number; capacity: number }[] = [];
  // eslint-disable-next-line max-len
  order.products.forEach((product: { productName: any; qty: number; price: number; images:Array<string>; capacity: number }) => {
    cid += 1;
    let image = '';
    if (product.images.length === 0) {
      image = path.resolve('./assets/images/aguadejavel_logo.png');
    } else {
      image = path.resolve(product.images[0]);
    }
    productsList.push({
      name: product.productName,
      qty: product.qty,
      price: product.price * product.qty,
      cid,
      capacity: product.capacity,
    });
    attachments.push({
      filename: product.productName,
      path: image,
      cid: cid.toString(),
    });
  });
  return { attachments, products: productsList };
}

router.put('/updateStatus/:id', async (req: express.Request, res: express.Response) => {
  try {
    const id = req.params.id as any;
    const order = await Order.findById(id) as any;

    // read template
    const file = fs.readFileSync(path.resolve('./assets/emails/order.hbs'), 'utf-8').toString();
    const { attachments, products } = generateMailInfo(order);
    const template = Handlebars.compile(file);
    const result = template({
      name: order.user.name,
      products,
    });
    const mail = await transport.sendMail({
      from: process.env.SMTP_USER,
      to: ['spenas@unal.edu.co'],
      subject: `Confirmación de pedido #${order._id}`,
      html: result,
      attachments,
    });
    return res.status(200).send({
      order,
      mail,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error,
    });
  }
});

router.post('/confirmTransaction', async (req: express.Request, res: express.Response) => {
  try {
    let updatedOrder;
    if (!req.body) throw new Error('No ha llegado body');
    const orderId = req.body.reference_sale;
    if (req.body.state_pol === 1) {
      const order = await Order.findById(orderId) as any;

      // read template
      const file = fs.readFileSync(path.resolve('./assets/emails/order.hbs'), 'utf-8').toString();
      const { attachments, products } = generateMailInfo(order);
      const template = Handlebars.compile(file);
      const result = template({
        name: order.user.name,
        products,
      });
      const mail = await transport.sendMail({
        from: process.env.SMTP_USER,
        to: ['spenas@unal.edu.co'],
        subject: `Confirmación de pedido #${order._id}`,
        html: result,
        attachments,
      });
      updatedOrder = await Order.findByIdAndUpdate(orderId, {
        status: 'APPROVED',
        dateUpdated: req.body.transaction_date,
      });
      return res.status(200).send({
        updatedOrder,
        mail,
      });
    }

    if (req.body.state_pol === 6) {
      updatedOrder = await Order.findByIdAndUpdate(orderId, {
        status: 'DECLINED',
        dateUpdated: req.body.transaction_date,
      });
    }
    if (req.body.state_pol === 104) {
      updatedOrder = await Order.findByIdAndUpdate(orderId, {
        status: 'ERROR',
        dateUpdated: req.body.transaction_date,
      });
    }
    return res.status(400).send({
      updatedOrder,
    });
  } catch (error) {
    return res.status(500).send({
      error,
    });
  }
});

router.get('/pay-test', async (req: express.Request, res: express.Response) => {
  const respo = await axios.post('https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu', {
    merchantId: 508029,
    ApiKey: '4Vj8eK4rloUd272L48hsrarnUA',
    referenceCode: 'TestPayU',
    accountId: 512321,
    description: 'Test PAYU',
    amount: 3,
    tax: 0,
    taxReturnBase: 0,
    currency: 'USD',
    signature: 'ba9ffa71559580175585e45ce70b6c37',
    test: 1,
    buyerEmail: 'test@test.com',
  });
  // console.log(respo);
  res.set('Content-Type', 'text/html').send(respo.data);
});
export default {
  router,
};
