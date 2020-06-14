import mongoose, { Schema } from "mongoose";
import Joi from "joi";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  businessLine: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  price: {
    type: Number,
    required: true
  },
  classificator: {
    type: Number,
    required: true
  },
  quantity: Number,
  description: {
    type: String,
    maxlength: 255
  },
  model: {
    type: String,
    required: true
  },
  
});

export const Product = mongoose.model("Product", productSchema);

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
    model: Joi.string().required()
  };

  return Joi.validate(product, schema);
};
