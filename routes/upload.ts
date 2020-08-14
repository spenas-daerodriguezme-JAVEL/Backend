import express from 'express';
import fs from 'fs';
import fileUpload, { UploadedFile } from 'express-fileupload';
// import  Product  from "../models/product";
// import  User  from "../models/user";
import path from 'path';
import { func } from 'joi';
import { Description } from '../models/description';

const router = express();

router.use(fileUpload());

function checkIfExists(filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    return true;
  }
  return false;
}

function folderExists(filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    return true;
  }
  fs.mkdirSync(filePath);
  return false;
}

router.post('/upload/image/:id', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!req.files) {
    return res.status(400)
      .json({
        ok: false,
        err: {
          message: 'None files were selected',
        },
      });
  }

  const images = req.files.images as any;
  const validExtensions = ['PNG', 'png', 'jpg', 'jpeg', 'JPG'];
  const indexes = [];
  try {
    let imagesReturn = [];
    let filePath = `images/product/${id}`;
    folderExists(filePath);
    // There are several images, images represent an array and we have to iterate
    if (images.length !== undefined) {
      for (let index = 0; index < images.length; index += 1) {
        indexes.push(index);
      }

      const imagesPath = indexes.map(async (index) => {
        const currentImage = images[index];
        const extFile = currentImage.name.split('.')[1];
        if (validExtensions.indexOf(extFile) < 0) {
          return res.status(400)
            .json({
              ok: false,
              error: {
                message: `Valid file extensions are: ${validExtensions}`,
              },
            });
        }
        filePath = `images/product/${id}/${currentImage.name}`;
        if (!checkIfExists(filePath)) {
          await currentImage.mv(filePath);
        }
        return filePath;
      });
      imagesReturn = await Promise.all(imagesPath);
    } else {
      // There is only one image thus images is an object not an array
      filePath = `images/product/${id}/${images.name}`;
      await images.mv(filePath);
      imagesReturn.push(filePath);
    }
    const currentDescription = await Description.findById(id) as any;
    if (!currentDescription) {
      return res.status(404).send('Description not found');
    }
    // search if the image already exists
    const unionArray = [...new Set([...imagesReturn, ...currentDescription.images])];
    const updatedDescription = await Description.findByIdAndUpdate(id, {
      images: unionArray,
    });
    return res.status(200).send({
      message: 'File uploaded and description updated',
      updatedDescription,
      unionArray,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      err: {
        message: error.message,
      },
    });
  }
});

export default {
  router,
};
