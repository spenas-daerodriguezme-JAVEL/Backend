import express from 'express';
import users from '../routes/user';
import products from '../routes/product';
import auth from '../routes/auth';
import seed from '../routes/seed';
// import upload from '../routes/upload';

export default function(app: express.Express) {
  app.use(express.json());
  app.use('/api/users', users.router);
  app.use('/api/product', products.router);
  app.use('/auth', auth.router);
  app.use('/auth', auth.router);
  app.use('/secret', seed.router);
  app.use('/healthcheck', express.Router() 
    .post('/', async(req: express.Request, res: express.Response) => {
      res.send('Javel OK');
    })
  )
}