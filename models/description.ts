import mongoose, { Schema } from "mongoose";
import Joi from "joi";

const descriptionSchema = new mongoose.Schema({

  physicalAspect: String,
  smell: String,
  color: String,
  fragance: String,
  gravity: String,
  viscosity: String,
  solubility: String,
  flammable: Boolean,
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
  images: Array
});

export const Description = mongoose.model("Description", descriptionSchema);


