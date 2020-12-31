import express from 'express';
import users from '../routes/user';
import products from '../routes/product';
import auth from '../routes/auth';
import descriptions from '../routes/descriptions';
import seed from '../routes/seed';
import upload from '../routes/upload';
import orders from '../routes/order';
import requisitions from '../routes/requisitions';

export default (app: express.Express) => {
  app.use(express.json());
  app.use('/api/users', users.router);
  app.use('/api/product', products.router);
  app.use('/api/order', orders.router);
  app.use('/api/description', descriptions.router);
  app.use('/auth', auth.router);
  app.use('/secret', seed.router);
  app.use('/solicitude', requisitions.router);
  app.use('/', upload.router);
  app.use('/healthcheck', express.Router()
    .post('/', async (req: express.Request, res: express.Response) => {
      res.send('Javel OK xD test final? alfina?');
    }));
};
