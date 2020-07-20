import express from 'express';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { User, validate } from '../models/user';
import auth from '../middleware/auth';
import adminAuth from '../middleware/adminAuth';

const router = express.Router();

const pickParams = (req: express.Request, isPost: Boolean) => {
  const parameters = [
    'name',
    'lastname',
    'email',
    'telephone',
    'address',
    'identificationType',
    'identificationNumber',
    'city',
    'state',
  ];
  if (isPost) parameters.push('password');
  return _.pick(req.body, parameters);
};

router.get('/me', auth, async (req: express.Request, res: express.Response) => {
  // eslint-disable-next-line no-underscore-dangle
  const user = await User.findById(req.body._id).select('-password');
  res.status(200).send(user);
});

router.get('/allUsers', [auth], async (req: express.Request, res: express.Response) => {
  try {
    const users = await User.find({});
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({
      message: 'There was an error retrieving users',
      error,
    });
  }
});

router.get('/userById', [auth], async (req: express.Request, res: express.Response) => {
  const { parameters } = req.body;
  try {
    const user = User.find({
      identificationType: parameters.identificatonType,
    });
    if (!user) return res.status(404).send('User not found');
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({
      message: 'There was an error retirving user',
      error,
    });
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = (await User.findOne({ email: req.body.email })) as any;
    if (user) return res.status(400).send('User already registered.');
    user = new User(
      pickParams(req, true),
    );

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res
      .header('x-auth-token', token)
      .send({ ..._.pick(user, ['_id', 'name', 'email']), token });
  } catch (error) {
    return res.status(500).send({
      message: 'There was an error creating user',
      error,
    });
  }
});

router.put('/', auth, async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // eslint-disable-next-line no-underscore-dangle
  const userId = (req as express.JRequest).user._id;

  const user = await User.findByIdAndUpdate(userId, pickParams(req, false));

  if (!user) return res.status(404).send('The user cannot be found');

  return res.status(204).send({
    message: 'Updated succesfully',
  });
});

router.put('/deactivate', auth, async (req: express.Request, res: express.Response) => {
  // eslint-disable-next-line no-underscore-dangle
  const userId = (req as express.JRequest).user._id;
  const user = await User.findByIdAndUpdate(userId, {
    isActive: false,
  });

  if (!user) return res.status(404).send('The user cannot be found');

  return res.status(204).send('User deactivated succesfully');
});

router.delete('/:id', [auth, adminAuth], async (req: express.Request, res: express.Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) return res.status(404).send('The user cannot be found');

  res.status(204).send('User deleted succesfully');
});

export default {
  router,
};
