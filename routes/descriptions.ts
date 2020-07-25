import express from 'express';
import _ from 'lodash';
import { Description, validate } from '../models/description';

const router = express.Router();

const pickParams = (req: express.Request) => _.pick(req.body, [
  '_id',
  'description',
  'physicalAspect',
  'smell',
  'color',
  'fragance',
  'gravity',
  'viscosity',
  'solubility',
  'flammable',
  'density',
  'ph',
  'activeComponent',
  'weight',
  'refractionIndex',
  'dilution',
  'isToxic',
  'paragraph1',
  'paragraph2',
  'paragraph3',
  'paragraph4',
  'stepTitle',
  'steps',
  'promoTitle',
]);

router.get('/allDescriptions', async (req: express.Request, res: express.Response) => {
  try {
    let from: any = req.query.from || 0;
    from = Number(from * 11);
    const descriptions = Description.find({}).skip(from).limit(11);
    const numDescriptions = Description.countDocuments({});
    res.status(200).send({
      descriptions,
      pages: Math.ceil(await numDescriptions / 11),
    });
  } catch (error) {
    res.status(500);
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const descriptionsParams = pickParams(req);
    let descriptionId = await Description.countDocuments({}) as number;
    descriptionId += 1;
    let idIsAvailable = false;
    while (idIsAvailable === false) {
      // eslint-disable-next-line no-await-in-loop
      const availableDescription = await Description.findById(descriptionId);
      if (!availableDescription) {
        idIsAvailable = true;
        break;
      }
      descriptionId += 1;
    }
    // eslint-disable-next-line no-underscore-dangle
    descriptionsParams._id = descriptionId;
    const description = new Description(descriptionsParams);

    await description.save();
    return res.status(200).send({
      message: 'Description created succesfully',
      description,
    });
  } catch (errorMessage) {
    return res.status(500).send({
      message: 'There was an error creating description',
      error,
    });
  }
});

router.put('/:id', async (req: express.Request, res: express.Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const description = await Description.findByIdAndUpdate(req.params.id, pickParams(req));
    if (!description) return res.status(404).send('The product cannot be found');
    return res.status(200).send({
      message: 'Succesful update',
      description,
    });
  } catch (errorMessage) {
    return res.status(500).send({
      message: 'There was an error updating description',
      errorMessage,
    });
  }
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const description = await Description.findByIdAndDelete(req.params.id);
    if (!description) return res.status(404).send('Description to delete cannot be found');

    return res.status(200).send({
      message: 'Description deleted succesfully',
      description,
    });
  } catch (error) {
    return res.status(500).send({
      message: 'There was an error deleting description',
      error,
    });
  }
});

export default {
  router,
};