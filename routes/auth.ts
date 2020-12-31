import Joi from 'joi';
import bcrypt from 'bcrypt';
import express from 'express';
import { User } from '../models/user';
import { transport } from '../startup/mailer';
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';

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
  User.findOne({ email: req.body.email })
    .then( (user:any) => {
      if (!user) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });
      
      user.generatePasswordReset();

      user.save()
        .then(async (user:any) => {

          let link = "http://" + req.headers.host + "/reset-password/" + user.resetPasswordToken;

          const file = fs.readFileSync(path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/recover_pass.hbs`), 'utf-8').toString();
          const template = Handlebars.compile(file);
          const result = template({
            name: user.name,
            link,
          });
          let cid = 1;
          const attachments = [{
            filename: 'logo',
            path: path.resolve('./assets/images/aguadejavel_logo.png'),
            cid: cid.toString(),
          }];
          try {
            const mail = await transport.sendMail({
              from: process.env.SMTP_USER,
              to: [user.email],            
              bcc: 'daafonsecara@unal.edu.co',
              subject: `Recuperación de contraseña`,
              html: result,
              attachments,
            });
            return res.status(200).send('Recover email was send.');
          } catch (error) {
            return res.status(500).send('An error ocurred when recovery mail was sending.');            
          }          
        })
        .catch( (err:any) => res.status(500).json({ message: err.message }));
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

router.post('/validate-token', async (req: express.Request, res: express.Response) => {
  console.log("---- Token " + req.body.token);  
  
  User.findOne({resetPasswordToken: req.body.token, resetPasswordExpires: {$gt: Date.now()}})
    .then((user) => {
        if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

        //Redirect user to form with the email address
        res.status(200).json({ message: 'Password reset token is valid.' });
    })
    .catch(err => res.status(500).json({message: err.message}));
});

router.post('/reset-password', async (req: express.Request, res: express.Response) => {
  User.findOne({resetPasswordToken: req.body.token, resetPasswordExpires: {$gt: Date.now()}})
    .then( async (user:any) => {
      if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
      
      const { error } = validateResetPassword(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      //Set the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      try {
        user.save();
        return res.status(200).send("Password was reset successfully");
      } catch (error) {
        return res.status(500).send("Something was wrong. Try again later.");
      }
    });
});
export default { router };
