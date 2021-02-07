import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

export interface IProduct extends Document {
  SKU: string,
  name: string,
  businessLine: string,
  capacity: string,
  measurementUnit: string,
  price: number,
  quantity: number,
  position: Number,
  properties: Number,
  isInCarousel: Boolean,
}

const productSchema = new Schema({
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
  position: Number,
  quantity: Number,
  isActive: {
    type: Boolean,
    default: true,
  },
  properties: { type: Number, ref: 'Description' },
  isInCarousel: { 
    type: Boolean,
    default: false,
  }
});

// export const Product = mongoose.model<IProduct>('Product', productSchema);
export const Product = mongoose.model('Product', productSchema);

export const validate = (product: Schema) => {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    businessLine: Joi.string()
      .min(3)
      .max(50)
      .required(),
    price: Joi.number().required(),
  };

  return Joi.validate(product, schema);
};
