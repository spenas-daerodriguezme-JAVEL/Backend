import express from 'express';
import users from '../routes/user';

export default function(app: express.Express) {
  app.use(express.json());
  app.use('/api/users', users.router);
}