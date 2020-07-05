import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

const orderSchema = new mongoose.Schema({
  user: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
      },
      lastname: {
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
        unique: true,
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

const Order = mongoose.model('Order', orderSchema);

export default {
  Order,
};
