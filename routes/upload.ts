import express from 'express';
import fs from 'fs';
import sharp from 'sharp';
// import  Product  from "../models/product";
// import  User  from "../models/user";
import path from 'path';
import { func } from 'joi';
import uploadController from '../middleware/uploadimages';
import { Description } from '../models/description';

const router = express();

router.post(
  '/upload/:id',
  uploadController.uploadImages,
  uploadController.deletePrevious,
  uploadController.resizeImages,
  uploadController.getResult,
  async (req, res) => {
    const id = Number(req.params.id);
    const description = await Description.findOneAndUpdate({ _id: id }, {
      images: req.body.images,
    }, {
      new: true,
    });
    if (!description) return res.status(404).json('Description not found');
    const images = req.body.images
      .map((image: any) => `${image}`)
      .join('');

    return res.status(200).send({
      message: `Images were uploaded:${images}`,
      description,
    });
  },
);

export default {
  router,
};
