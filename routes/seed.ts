import express from 'express';
import { Product } from '../models/product';
import { Description } from '../models/description';
import productList from '../seeds/products.json';
import descriptionList from '../seeds/descriptions.json';

const router = express.Router();

router.post('/seeds', async (req: express.Request, res: express.Response) => {
  productList.data.forEach(async (element: any, idx: number) => {
    try {
      // element.steps = JSON.parse(element.steps);
      const product = new Product(element);
      await Product.remove({});
      await product.save();
      console.log('>>>> Seeds created');
    } catch (error) {
      console.log('>>>> There was a problem creating seeds');
      res.send('Something went wrong');
    }
  });
  res.send('Seeds generated');
});

router.post('/descriptions', async (req: express.Request, res: express.Response) => {
  descriptionList.data.forEach(async (element: any) => {
    try {
      const description = new Description(element);
      await description.save();
      console.log('Creating machine goes brrrr');
    } catch (error) {
      res.send('There was an error with descriptions');
    }
  });
  res.send('Descriptiopns generated');
});

router.get('/aidis', async (req: express.Request, res: express.Response) => {
  const descriptions = await Description.find({}).select('descriptionIdx').exec();
  res.json({
    descriptions,
  });
});

export default {
  router,
};
