import Joi from 'joi';
import bcrypt from 'bcrypt';
import express from 'express';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
import { transport } from '../startup/mailer';
import { User } from '../models/user';
import auth from '../middleware/auth';

const router = express.Router();

function validate(req: express.Request) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required(),
  };

  return Joi.validate(req, schema);
}

function validateResetPassword(req: express.Request) {
  const schema = {
    token: Joi.string()
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required(),
  };

  return Joi.validate(req, schema);
}

function validateChangePassword(req: express.Request) {
  const schema = {
    oldPassword: Joi.string()
      .min(5)
      .max(255)
      .required(),
    newPassword: Joi.string()
      .min(5)
      .max(255)
      .required(),
  };

  return Joi.validate(req, schema);
}

router.post('/', async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = (await User.findOne({ email: req.body.email })) as any;
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  return res.status(200).send(token);
});

router.post('/recover', async (req: express.Request, res: express.Response) => {
  try {
    const user: any = await User.findOne({ email: req.body.email });

    if (!user) return res.status(401).json({ message: `The email address ${req.body.email} is not associated with any account. Double-check your email address and try again.` });

    user.generatePasswordReset();

    const userSaved: any = await user.save();

    const link = `${req.headers.origin}/new-password/${userSaved.resetPasswordToken}`;

    const file = fs.readFileSync(
      path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/recover_pass.hbs`),
      'utf-8',
    ).toString();

    const template = Handlebars.compile(file);
    const result = template({
      name: userSaved.name,
      link,
    });
    const cid = 1;
    const attachments = [{
      filename: 'logo',
      path: path.resolve(`${process.env.IMAGES_TEMPLATE_PATH}/thechem_logo.png`),
      cid: cid.toString(),
    }];

    const mail = await transport.sendMail({
      from: process.env.SMTP_USER,
      to: [user.email],
      subject: 'Recuperación de contraseña',
      html: result,
      attachments,
    });

    return res.status(200).send('Recover email was send.');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/validate-token', async (req: express.Request, res: express.Response) => {
  try {
    const user: any = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });

    return res.status(200).json({ message: 'Password reset token is valid.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', async (req: express.Request, res: express.Response) => {
  try {
    const { error } = validateResetPassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user: any = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).send('Password was reset successfully');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/change-password', auth, async (req: express.Request, res: express.Response) => {
  const { error } = validateChangePassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const { user } = req as express.JRequest;
    const userFromBD = await User.findById(user._id) as any;
    if (!userFromBD) return res.status(404).send('User not found.');

    const validPassword = await bcrypt.compare(req.body.oldPassword, userFromBD.password);
    if (!validPassword) return res.status(400).send('It was a problem in the password validation.');

    const salt = await bcrypt.genSalt(10);
    userFromBD.password = await bcrypt.hash(req.body.newPassword, salt);

    await userFromBD.save();

    return res.status(200).send('Password was change successfully');
  } catch (error) {
    return res.status(500).send('Something was wrong. Try later.');
  }
});

export default { router };
