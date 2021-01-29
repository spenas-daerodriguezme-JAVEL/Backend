import express from 'express';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import { PQRS } from '../models/pqrs';
import { User } from '../models/user';
import auth from '../middleware/auth';
import { transport } from '../startup/mailer';

const router = express.Router();

router.post('/', auth, async (req: express.Request, res: express.Response) => {
  try {
    const { body } = req;
    const textTruncated = truncateText(body.message, 2000);

    const { user } = req as express.JRequest;

        const userFromDB = await User.findById(user._id) as any;
        if (!userFromDB) {
            return res.status(200).send("User was not found. Creation aborted.");
        }
        const pqrsToCreate = {
            message: textTruncated,
            user: {
                name: userFromDB.name,
                lastName: userFromDB.lastName,
                email: userFromDB.email,
                telephone: userFromDB.telephone,
                identificationType: userFromDB.identificationType,
                identificationNumber: userFromDB.identificationNumber,
            }
        }
        const pqrs = new PQRS(pqrsToCreate);
        await pqrs.save();
        
        // Send email
        const file = fs.readFileSync( 
        path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/pqrs.hbs`),
            'utf-8'
        ).toString();
    
        const template = Handlebars.compile(file);
        const result = template({
            content: pqrsToCreate.message,
            name: pqrsToCreate.user.name,
            user: pqrsToCreate.user,
        });
        let cid = 1;
        const attachments = [{
            filename: 'logo',
            path: path.resolve('./assets/images/aguadejavel_logo.png'),
            cid: cid.toString(),
        }];
        
        const mail = await transport.sendMail({
            from: process.env.SMTP_USER,
            to: [pqrsToCreate.user.email],            
            subject: `Radicación de solicitud`,
            html: result,
            attachments,
        });
        return res.status(200).send({
            message: 'PQRS created succesfully',
            pqrs,
        });

    } catch (error) {
        console.log(error);
        
        return res.status(500).send({
            message: 'There was an error creating PQRS.',
            error,
        });
    }
    const pqrsToCreate = {
      message: textTruncated,
      user: {
        name: userFromDB.name,
        lastName: userFromDB.lastName,
        email: userFromDB.email,
        telephone: userFromDB.telephone,
        identificationType: userFromDB.identificationType,
        identificationNumber: userFromDB.identificationNumber,
      },
    };
    const pqrs = new PQRS(pqrsToCreate);
    await pqrs.save();

    // Send email
    const file = fs.readFileSync(
      path.resolve(`${process.env.EMAIL_TEMPLATES_PATH}/pqrs.hbs`),
      'utf-8',
    ).toString();

    const template = Handlebars.compile(file);
    const result = template({
      content: pqrsToCreate.message,
      name: pqrsToCreate.user.name,
      email: pqrsToCreate.user.email,
    });
    const cid = 1;
    const attachments = [{
      filename: 'logo',
      path: path.resolve('./assets/images/aguadejavel_logo.png'),
      cid: cid.toString(),
    }];

    const mail = await transport.sendMail({
      from: process.env.SMTP_USER,
      to: [pqrsToCreate.user.email],
      subject: 'Radicación de solicitud',
      html: result,
      attachments,
    });
    return res.status(200).send({
      message: 'PQRS created succesfully',
      pqrs,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      message: 'There was an error creating PQRS.',
      error,
    });
  }
});

function truncateText(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }

  return text.substr(0, length);
}

export default {
  router,
};
