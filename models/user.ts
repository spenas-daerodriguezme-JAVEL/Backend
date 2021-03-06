import mongoose, { Schema } from 'mongoose';
import config from 'config';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: false,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255,
    unique: true,
  },
  birthday: Date,
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
    unique: true,
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
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  resetPasswordToken: {
      type: String,
      required: false
  },

  resetPasswordExpires: {
      type: Date,
      required: false
  }

});

userSchema.methods.generateAuthToken = function () {
  const key = process.env.JWT_KEY as string;
  const token = jwt.sign(
    // eslint-disable-next-line no-underscore-dangle
    { _id: this._id, isAdmin: this.isAdmin },
    key,
    { expiresIn: '2h' },
  );
  return token;
};

userSchema.methods.generatePasswordReset = function() {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
  return null;
};

export const User = mongoose.model('User', userSchema);

export const validate = (user: Schema) => {
  const schema = {
    name: Joi.string()
      .min(2)
      .max(50),
    lastName: Joi.string().allow(null, ''),
    email: Joi.string()
      .min(5)
      .max(255)
      .email(),
    password: Joi.string()
      .min(5)
      .max(255),
    telephone: Joi.string()
      .min(7),
    identificationType: Joi.string(),

    identificationNumber: Joi.number()
      .min(7),
    state: Joi.string(),
    city: Joi.string(),
    address: Joi.string(),
    isAdmin: Joi.boolean(),
    isActive: Joi.boolean(),
  };

  return Joi.validate(user, schema);
};
