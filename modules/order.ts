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
                unique: true,
              },
              telephone: {
                type: String,
                required: true,
                minlength: 7,
              },
              address: {
                type: String,
              },
              city: {
                type: String,
              },

        })

    },
    products: Array,
    created_at: Date,
    total: Number,


});

const Order = mongoose.model('Order', orderSchema);

export default {
    Order
}