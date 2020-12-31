import express from 'express';
import fs from 'fs';
import sharp from 'sharp';
// import  Product  from "../models/product";
// import  User  from "../models/user";
import path from 'path';
import { func } from 'joi';
import multer from 'multer';
import { sendUploadToGCS, resizeImages, modifyPrevious } from '../middleware/uploadTest';
import uploadController from '../middleware/uploadimages';
import { Description } from '../models/description';

const multerFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Only images are allowed', false);
  }
};

const Multer = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
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

router.post('/imagenes', Multer.array('image'), resizeImages, sendUploadToGCS, modifyPrevious, (req: any, res:any) => {
// router.post('/imagenes', Multer.array('image'), resizeImages, (req: any, res:any, next:any) => {
  try {
    const responsetodo = req.body.images.map((file:any) => file.cloudStoragePublicUrl);
    return res.status(200).json({ files: responsetodo });
    // return res.status(200);
  } catch (error) {
    console.log(`error ${error}`);
    return res.status(500);
  }
});

export default {
  router,
};
