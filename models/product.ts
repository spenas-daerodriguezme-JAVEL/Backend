import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

const productSchema = new mongoose.Schema({
  SKU: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  businessLine: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  capacity: {
    type: String,
    required: true,
  },
  measurementUnit: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: Number,
  properties: { type: Number, ref: 'Description' },

});

export const Product = mongoose.model('Product', productSchema);

export const validate = (product: Schema) => {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    businessLine: Joi.string()
      .min(5)
      .max(50)
      .required(),
    price: Joi.number().required(),
    classificator: Joi.number().required(),
    model: Joi.string().required(),
  };

  return Joi.validate(product, schema);
};
