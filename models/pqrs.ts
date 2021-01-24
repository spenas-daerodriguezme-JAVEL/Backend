import mongoose, { Schema } from 'mongoose';

const pqrsModel = new Schema({
    message: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      required: true,
      default: Date.now
    },
    user: {
      type: new mongoose.Schema({                
        identificationType: {
          type: String,
          required: true,
        },
        identificationNumber: {
          type: Number,
          required: true,
          minlength: 2,
        },
        name: {
          type: String,
          required: true,
          minlength: 2,
          maxlength: 50,
        },
        lastName: {
          type: String,
          required: true,
          minlength: 2,
          maxlength: 50,
        },
        email: {
          type: String,
          required: true,
          minlength: 2,
          maxlength: 255,
        },
        telephone: {
          type: String,
          required: true,
          minlength: 7,
        },
      }),
    },
});
  
export const PQRS = mongoose.model('PQRS', pqrsModel);
