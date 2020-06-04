import mongoose, { Schema } from "mongoose";
import config from "config";
import jwt from "jsonwebtoken";
import Joi from "joi";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  lastname: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255,
    unique: true
  },
  birthday: Date,
  telephone: {
    type: String,
    required: true,
    minlength: 7
  },
  identificationType: {
    type: String,
    required: true,
  },
  identificationNumber: {
    type: Number,
    required: true,
    minlength: 7
  },
  address: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true
  } 

});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    "casa",
    { expiresIn: "2h" }
  );
  return token;
};

export const User = mongoose.model("User", userSchema);

export const validate = (user: Schema) => {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50),
    lastname: Joi.string()
      .min(5)
      .max(50),
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
  };

  return Joi.validate(user, schema);
};