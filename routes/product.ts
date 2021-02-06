import express from 'express';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import _ from 'lodash';
import { Product, validate } from '../models/product';
import adminAuth from '../middleware/adminAuth';
import auth from '../middleware/auth';
import { User } from '../models/user';
import { transport } from '../startup/mailer';

const router = express.Router();

const pickParams = (req: express.Request) => _.pick(req.body, [
  'name',
  'businessLine',
  'price',
  'classificator',
  'quantity',
  'properties',
]);

router.get(
  [
    '/',
    '/businessline/:businessline',
    '/price/:price',
    '/businessline/:businessline/price/:price',
  ],
  async (req: express.Request, res: express.Response) => {
    const { params } = req;
    let from: any = req.query.from || 0;
    from = Number(from * 11);

    const findObj: { [key: string]: any } = {};

    if (params.businessline) {
      const regexp = new RegExp(params.businessline, 'i');
      findObj.businessLine = regexp;
    }

    if (params.price) {
      const splitter = params.price.split('-');
      const priceObj = {
        $gte: splitter[0],
        $lte: splitter[1],
      };
      findObj.price = priceObj;
    }

    Product.find(findObj)
      .skip(from)
      .populate('properties')
      .limit(11)
      .exec(async (err, products) => {
        if (err) {
          return res.status(500).json({
            err,
          });
        }

        Product.countDocuments(findObj, (err: any, count: number) => {
          res.json({
            products,
            pages: Math.ceil(count / 11),
          });
        });
      });
  },
);

router.get('/search/:search', async (req: express.Request, res: express.Response) => {
  let from: any = req.query.from || 0;
  from = Number(from * 11);
  const { params } = req;
  const search = new RegExp(params.search, 'i');

  const findObj = {
    $or: [
      { name: search },
      { businessLine: search },
      { model: search },
      { description: search },
    ],
  };

  await Product.find(findObj)
    .skip(from)
    .limit(11)
    .exec((err, products) => {
      if (err) {
        res.status(500).send({
          err,
        });
      }
      if (!products) res.status(404).send();

      Product.countDocuments(findObj, (err: any, count: number) => {
        res.json({
          products,
          pages: Math.ceil(count / 11),
        });
      });
    });
});

router.get('/carousel', async (req: express.Request, res: express.Response) => {
  // _id is returned by default
  const fieldsToReturn = {
    name: 1,
    capacity: 1,
    price: 1,
    properties: 1
  }
  try {
    const products = await Product.find({isInCarousel: true}).limit(6).populate('properties');
    return res.status(200).send(products);
  } 
  catch(error) {
    return res.status(500).send('Something was wrong with carousel products');
  }
})

router.get('/businesslinelist', (req: express.Request, res: express.Response) => {
  Product.find()
    .distinct('businessLine', (err, businessLines) => {
      if (err) res.status(500).send();
      res.status(200).send({
        businessLines,
      });
    });
});

router.get('/allProducts', [auth, adminAuth], async (req: express.Request, res: express.Response) => {
  try {
    const products = await Product.find({}) as any;
    const productsToReturn = products.map((product: any) => ({
      SKU: product.SKU,
      name: product.name,
      link: product._id,
      capacity: product.capacity,
      position: product.position,

    }));
    return res.status(200).send(productsToReturn);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('properties') as any;
    if (product === null) {
      return res.sendStatus(404);
    }
    return res.status(200).send(product);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post('/request-products', auth, async (req: express.Request, res: express.Response) => {
  try {
    const { products } = req.body;

    const { user } = req as express.JRequest;

    const userFromDB = await User.findById(user._id) as any;
    if (!userFromDB) {
      return res.status(400).send('User was not found. Creation aborted.');
    }

    // Send email
    const file = fs.readFileSync(
      path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/admin_products_requirements.hbs`),
      'utf-8',
    ).toString();

    const template = Handlebars.compile(file);
    const result = template({
      name: userFromDB.name,
      products,
      user: userFromDB,
    });
    const cid = 1;
    const attachments = [{
      filename: 'logo',
      path: path.resolve('./assets/images/aguadejavel_logo.png'),
      cid: cid.toString(),
    }];

    const mail = await transport.sendMail({
      from: process.env.SMTP_USER,
      to: userFromDB.email,
      subject: 'Solicitud de productos',
      html: result,
      attachments,
    });
    return res.status(200).send({
      message: 'Product request created succesfully',
      mail,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      message: 'There was an error creating PQRS.',
      error,
    });
  }
});

router.post('/', [auth, adminAuth], async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  console.log(req.body);
  const product = new Product(req.body);

  await product.save();
  res.status(200).send({
    message: 'Product created succesfully',
    product,
  });
});

router.put('/insertPosition', [auth, adminAuth], async (req: express.Request, res: express.Response) => {
  try {
    const pro = await Product.find({}) as any;
    let cont = 1;
    pro.map((product:any) => {
      const auxprod = product;
      auxprod.position = cont;
      console.log(auxprod);
      cont += 1;
      return auxprod.save();
    });
    await Promise.all(pro);
    return res.status(200);
  } catch (error) {
    return res.status(500);
  }
});

router.put('/:id', [auth, adminAuth], async (req: express.Request, res: express.Response) => {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  const product = await Product.findByIdAndUpdate(req.params.id, req.body);

  if (!product) return res.status(404).send('The product cannot be found.');

  return res.status(200).send({
    message: 'Updated succesfully',
    product,
  });
});

router.delete('/:id', [auth, adminAuth], async (req: express.Request, res: express.Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) res.status(404).send('The product cannot be found');

  res.status(200).send({
    message: 'Element deleted succesfully',
    product,
  });
});

export default {
  router,
};
