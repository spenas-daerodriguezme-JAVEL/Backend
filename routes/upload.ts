import express from 'express';
import fileUpload from 'express-fileupload';
// import  Product  from "../models/product";
// import  User  from "../models/user";
import fs from 'fs';
import path from 'path';

const router = express();

router.use(fileUpload());

router.post('/upload/product/', (req, res) => {
  const { tipo } = req.params;
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
  const validExtensions = ['PNG', 'png', 'jpg', 'jpeg'];

  try {
    for (let index = 0; index < images.length; index += 1) {
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

      currentImage.mv(`images/product/${currentImage.name}`, (err: any) => {
        if (err) {
          throw new Error(`There was an error moving the file: ${err}`);
        }
      });
    }

    return res.send('File uploaded');
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
