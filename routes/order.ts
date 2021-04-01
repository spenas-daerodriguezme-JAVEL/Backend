/* eslint-disable no-underscore-dangle */
import express from 'express';
import _, { reduce } from 'lodash';
// import Handlebars from 'handlebars';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import md5 from 'md5';
import { any } from 'joi';
import Handlebars from '../startup/Handlebars';
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

function generateMailInfo(order: any): any {
  let cid = 1;
  const attachments = [{
    filename: 'logo',
    path: path.resolve(`${process.env.IMAGES_TEMPLATE_PATH}/thechem_logo.png`),
    cid: cid.toString(),
  }];
  // eslint-disable-next-line max-len
  const productsList: { name: any; qty: number; price: number; cid: number; capacity: number }[] = [];
  // eslint-disable-next-line max-len
  order.products.forEach((product: { productName: any; qty: number; price: number; images: Array<string>; capacity: number }) => {
    cid += 1;
    let image = '';
    if (product.images.length === 0) {
      image = path.resolve(`${process.env.IMAGES_TEMPLATE_PATH}/thechem_logo.png`);
    } else {
      image = product.images[0];
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

async function sendSucessfulEmail(order: any) {
  // read template
  const file = fs.readFileSync(path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/order.hbs`), 'utf-8').toString();
  const { attachments, products } = generateMailInfo(order);
  const template = Handlebars.compile(file);
  const result = template({
    name: order.user.name,
    products,
  });

  const mail = await transport.sendMail({
    from: process.env.SMTP_USER,
    to: [order.user.email],
    // bcc: 'aguadejavel@gmail.com',
    bcc: 'spenas@unal.edu.co',
    subject: `Confirmación de pedido #${order.publicId}`,
    html: result,
    attachments,
  });

  return mail;
}
async function sendDeclinedEmail(order: any) {
  // read template
  const file = fs.readFileSync(path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/declined_transaction.hbs`), 'utf-8').toString();
  const attachments = [{
    filename: 'logo',
    path: path.resolve(`${process.env.IMAGES_TEMPLATE_PATH}/thechem_logo.png`),
    cid: '1',
  }] as any;
  const template = Handlebars.compile(file);
  const result = template({
    order: order.publicId,
  });
  const mail = await transport.sendMail({
    from: process.env.SMTP_USER,
    to: [order.user.email],
    subject: 'Transacción rechazada',
    html: result,
    attachments,
  });

  return mail;
}

async function sendErrorEmail(order: any, errorMessage: string) {
  // read template
  const file = fs.readFileSync(path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/error_mail.hbs`), 'utf-8').toString();
  const attachments = [{
    filename: 'logo',
    path: path.resolve(`${process.env.IMAGES_TEMPLATE_PATH}/thechem_logo.png`),
    cid: '1',
  }] as any;
  const template = Handlebars.compile(file);
  const result = template({
    order: order.publicId,
    errorMessage,
  });
  const mail = await transport.sendMail({
    from: process.env.SMTP_USER,
    // to: ['aguadejavel@gmail.com', 'spenas@unal.edu.co'],
    to: ['spenas@unal.edu.co'],
    subject: `Error en transacción #${order.publicId}`,
    html: result,
    attachments,
  });

  return mail;
}

async function sendCreatedOrderEmail(order: any) {
  // read template
  const file = fs.readFileSync(path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/order_created.hbs`), 'utf-8').toString();
  const attachments = [{
    filename: 'logo',
    // path: path.resolve('./assets/images/thechem_logo.png'),
    path: path.resolve(`${process.env.IMAGES_TEMPLATE_PATH}/thechem_logo.png`),
    cid: '1',
  }] as any;
  const template = Handlebars.compile(file);
  const result = template({
    name: order.user.name,
  });

  const mail = await transport.sendMail({
    from: process.env.SMTP_USER,
    to: [order.user.email],
    subject: 'Transacción en proceso',
    html: result,
    attachments,
  });

  return mail;
}

router.get('/allOrders', [auth, adminAuth], async (req: express.Request, res: express.Response) => {
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
    res.status(200).send(ordersToReturn);
  } catch (error) {
    res.status(500);
  }
});

router.get('/byId/:id', auth, async (req: express.Request, res: express.Response) => {
  try {
    const order = await Order.findById(req.params.id) as any;

    if (order === null) return res.status(404).send('Order was not found');

    // This section of code is for retriving images from each product
    const productIds: any = [];
    order.products.forEach((product: any) => {
      // add element to beginning of array
      productIds.unshift(mongoose.Types.ObjectId(product.productId));
    });

    const productsFromDB: any = await Product.find({ _id: { $in: productIds } }, 'SKU').populate('properties', 'images');

    if (productsFromDB) {
      productsFromDB.forEach((product: any) => {
        const index = order.products.findIndex(
          (prod: any) => String(prod.productId) === String(product._id),
        );
        if (index >= 0) {
          order.products[index].images = product.properties.images;
        }
      });
    }
    // end of retriving image per product

    const orderToReturn = {
      id: order._id,
      publicId: order.publicId,
      user: order.user,
      products: order.products,
      price: order.totalPrice,
      date: order.dateCreated.toLocaleString('es-CO', { timeZone: 'America/Bogota' }).toString(),
      status: order.status,
    };

    const { user } = req as express.JRequest;
    const userFromDB = await User.findById(user._id) as any;

    if (!user.isAdmin && order.user.identificationNumber !== userFromDB.identificationNumber) {
      return res.status(403).send('Access denied.');
    }

    return res.status(200).send(orderToReturn);
  } catch (error) {
    console.log(error);
    return res.status(500).send('There was an error retrieving the orders by id');
  }
});

router.get('/byUserId/:id', auth, async (req: express.Request, res: express.Response) => {
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

    const infoRequest = req as express.JRequest;
    if (!infoRequest.user.isAdmin && infoRequest.user._id !== user._id.toString()) {
      return res.status(403).send('Access denied');
    }

    return res.status(200).send(ordersToReturn);
  } catch (error) {
    return res.status(500);
  }
});

router.post('/createOrder', async (req: express.Request, res: express.Response) => {
  const MAX_VALUE_PER_DAY = 40000000;
  const MAX_VALUE_PER_TRANSACTION = 10000000;

  if (req.body.totalPrice > MAX_VALUE_PER_TRANSACTION) {
    return res.status(406).send('Order price exceeds value allowed.');
  }

  // Validate maximum value of transactions per day
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderSumPrices = await Order.aggregate([
      { $match: { dateCreated: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]) as any;
    if (orderSumPrices.length > 0) {
      const totalOrderPricePerDay = orderSumPrices[0].total + req.body.totalPrice;
      if (totalOrderPricePerDay > MAX_VALUE_PER_DAY) {
        return res.status(409).send('Maximum value of trasactions per day reached');
      }
    }
  } catch (error) {
    return res.status(500).send('Something was wrong. Try again later');
  }
  // --------------- end validation maximum value of transactions per day

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

    // if (incompleteQtyProducts.length !== 0) {
    //   return res.status(400).send({
    //     message: 'The following products doesnt have the required quantities',
    //     products: incompleteQtyProducts,
    //   });
    // }

    let newPublicId = await Order.countDocuments({}) as number;
    newPublicId += 1;
    const dateCreated = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }).toString();

    const order = new Order({
      publicId: newPublicId,
      user: pickParams(req),
      products: productsContent,
      totalPrice: req.body.totalPrice,
      dateCreated,
    });

    const response = await order.save();
    const mail = await sendCreatedOrderEmail(order);
    return res.status(200).send({
      createdOrder: response,
      mail,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'Error creating order',
      error,
    });
  }
});

router.post('/updateStatus', async (req: express.Request, res: express.Response) => {
  try {
    const { body } = req;
    console.log(body);
    if (body.event === null || body.event !== 'transaction.updated') {
      return res.status(400);
    }

    const { transaction } = body.data;
    const dateUpdated = body.sent_at;
    const transactionCost = transaction.amount_in_cents;
    const wompiId = transaction.id;
    const transactionStatus = transaction.status;
    // console.log(id);
    const id = mongoose.Types.ObjectId(transaction.reference);

    const order = await Order.findById(id) as any;

    let errorMessage;
    let mail;

    if (transactionCost !== order.totalPrice * 100) {
      errorMessage = `El precio de Wompi no coincide con el precio de la base de datos: Wompi $${transactionCost} - App $${order.totalPrice * 100} (centavos)`;
      mail = await sendErrorEmail(order, errorMessage);
    }

    switch (transactionStatus) {
      case 'APPROVED':
        mail = await sendSucessfulEmail(order);
        break;
      case 'DECLINED':
        mail = await sendDeclinedEmail(order);
        break;
      default:
        errorMessage = `El estado de la transacción no es ni aprobado ni rechazado: ${transactionStatus}`;
        mail = await sendErrorEmail(order, errorMessage);
        return res.sendStatus(400);
    }

    order.status = transactionStatus;
    order.dateUpdated = dateUpdated;
    order.wompiId = wompiId;

    const orderUpdated = await order.save();
    return res.status(200).send({
      orderUpdated,
      mail,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error,
    });
  }
});

export default {
  router,
};
