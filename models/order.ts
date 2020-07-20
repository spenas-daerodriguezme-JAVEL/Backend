import mongoose, { Schema, Document } from 'mongoose';
import Joi from 'joi';
import { Product } from './product';

const orderSchema = new mongoose.Schema({
  user: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      lastName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      email: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 255,
      },
      telephone: {
        type: String,
        required: true,
        minlength: 7,
      },
      identificationType: {
        type: String,
        required: true,
      },
      identificationNumber: {
        type: Number,
        required: true,
        minlength: 7,
      },
      address: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },
      status: {
        type: String,
      },
    }),
  },

  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    qty: {
      type: Number,
      required: true,
    },
  }],

  totalPrice: {
    type: Number,
    required: true,
  },
});

export const Order = mongoose.model('Order', orderSchema);

// export default {
//   Order,
// };
