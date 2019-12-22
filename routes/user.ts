import auth from '../middleware/auth';
import express from 'express';
import bcrypt from 'bcrypt';
import { User, validate } from '../modules/user';
import _ from 'lodash';
import { IUser } from '../types/user-type';

const router = express.Router();

router.get('/me', auth, async (req: express.Request, res: express.Response) => {
  const user = await User.findById(req.body._id).select('-password');
  res.send(user);
});

router.post('/', async (req: express.Request, res: express.Response) => {
  console.log(req.body);
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = (await User.findOne({ email: req.body.email })) as any;
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'lastName', 'email', 'telephone', 'address', 'city', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});



export default {
  router,
}