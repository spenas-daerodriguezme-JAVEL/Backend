import express from 'express';
import fs from 'fs';
import sharp from 'sharp';
// import  Product  from "../models/product";
// import  User  from "../models/user";
import path from 'path';
import { func } from 'joi';
import multer from 'multer';
import sendUploadToGCS from '../middleware/uploadTest';
import uploadController from '../middleware/uploadimages';
import { Description } from '../models/description';

const Multer = multer({
  storage: multer.memoryStorage(),
});

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

router.post('/imagenes', Multer.array('image'), sendUploadToGCS, (req: any, res:any, next:any) => {
  const responsetodo = req.files.map((file:any) => file.cloudStoragePublicUrl);
  res.status(200).json({ files: responsetodo });
});

export default {
  router,
};
