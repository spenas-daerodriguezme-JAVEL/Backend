import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

const descriptionSchema = new Schema({
  _id: Number,
  description: String,
  physicalAspect: String,
  smell: String,
  color: String,
  fragance: String,
  gravity: String,
  viscosity: String,
  solubility: String,
  flammable: String,
  density: String,
  ph: String,
  activeComponent: String,
  weight: String,
  refractionIndex: String,
  dilution: String,
  isToxic: String,
  paragraph1: String,
  paragraph2: String,
  paragraph3: String,
  paragraph4: String,
  stepTitle: String,
  steps: Array,
  promoTitle: String,
  images: Array,
  descriptionIdx: Number,
});

export const Description = mongoose.model('Description', descriptionSchema);

export const validate = (description: Schema) => {
  const schema = {
    _id: Joi.number(),
    description: Joi.string()
      .min(5)
      .max(500),
    physicalAspect: Joi.string()
      .min(5)
      .max(255),
    smell: Joi.string()
      .max(255),
    color: Joi.string()
      .max(255),
    fragance: Joi.string()
      .max(255),
    gravity: Joi.string()
      .max(255),
    viscosity: Joi.string()
      .max(255),
    solubility: Joi.string()
      .max(255),
    flammable: Joi.string()
      .max(255),
    density: Joi.string()
      .max(255),
    ph: Joi.string()
      .max(255),
    activeComponent: Joi.string()
      .max(255),
    weight: Joi.string()
      .max(255),
    refractionIndex: Joi.string()
      .max(255),
    dilution: Joi.string()
      .max(255),
    isToxic: Joi.string()
      .max(255),
    paragraph1: Joi.string()
      .max(2000),
    paragraph2: Joi.string()
      .max(2000),
    paragraph3: Joi.string()
      .max(2000),
    paragraph4: Joi.string()
      .max(2000),
    stepTitle: Joi.string()
      .max(500),
    promoTitle: Joi.string()
      .max(100),
    steps: Joi.array(),
  };

  return Joi.validate(description, schema);
};
