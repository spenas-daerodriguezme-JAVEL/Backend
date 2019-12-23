import { Product } from '../modules/product';
import express from 'express';
import productList from '../seeds/products.json';

const router = express.Router();

router.post('/seeds', async (req: express.Request, res: express.Response) => {

  productList.data.forEach(async (element: any, idx: number) => {
    try {
      // element.steps = JSON.parse(element.steps);
      console.error(element);
      
      const product = new Product(element);
      await Product.remove({});
      await product.save();
      
      console.log('>>>> Seeds created');
      res.send('Seeds generated');
    } catch (error) {
      console.log('>>>> There was a problem creating seeds');
      console.log(error);
      res.send('Something went wrong');
    }
  });
});

// const data = [
//   {
//     "name": "OXIGENO ACTIVO",
//     "businessLine": "Cuidado textil",
//     "model": "200 gr",
//     "price": 4000,
//     "classificator": 1,
//     "description": "Limpiador natural. Blanqueador para ropas. Quita manchas orgánicas. Desinfectante. Elimina el moho. Desodorante. Desengrasante. Aumenta la eficacia de los detergentes. Producto biodegradable",
//     "physicalAspect": "Granulado",
//     "smell": "No aplica",
//     "color": "Blanco",
//     "fragance": "No aplica",
//     "gravity": "No aplica",
//     "viscosity": "No aplica",
//     "solubility": "Total",
//   }
// ];

export default {
  router,
}
