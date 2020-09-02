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

// router.post('/upload/image/:id', async (req: express.Request, res: express.Response) => {
//   const { id } = req.params;

//   if (!req.files) {
//     return res.status(400)
//       .json({
//         ok: false,
//         err: {
//           message: 'None files were selected',
//         },
//       });
//   }

//   const images = req.files.images as any;
//   const validExtensions = ['PNG', 'png', 'jpg', 'jpeg', 'JPG'];
//   const indexes = [];
//   try {
//     let imagesReturn = [];
//     let filePath = `assets/images/description/${id}`;
//     folderExists(filePath);
//     // There are several images, images represent an array and we have to iterate
//     if (images.length !== undefined) {
//       for (let index = 0; index < images.length; index += 1) {
//         indexes.push(index);
//       }

//       const imagesPath = indexes.map(async (index) => {
//         const currentImage = images[index];
//         const extFile = currentImage.name.split('.')[1];
//         if (validExtensions.indexOf(extFile) < 0) {
//           return res.status(400)
//             .json({
//               ok: false,
//               error: {
//                 message: `Valid file extensions are: ${validExtensions}`,
//               },
//             });
//         }
//         filePath = `assets/images/description/${id}/${currentImage.name}`;
//         if (!checkIfExists(filePath)) {
//           await currentImage.mv(filePath);
//         }
//         return filePath;
//       });
//       imagesReturn = await Promise.all(imagesPath);
//       console.log(imagesReturn);
//       imagesReturn.forEach(async (imagename) => {
//         console.log(imagename);
//         const aja = imagename as string;
//         const name = aja.split('/')[3];
//         console.log(name);
//         await sharp(aja, { failOnError: true })
//           .resize(64, 64)
//           .withMetadata()
//           .toFile(`assets/images/description/${id}/thumbnail-${name}`);
//       });
//     } else {
//       // There is only one image thus images is an object not an array
//       filePath = `assets/images/description/${id}/${images.name}`;
//       await images.mv(filePath);
//       imagesReturn.push(filePath);
//     }
//     const currentDescription = await Description.findById(id) as any;
//     if (!currentDescription) {
//       return res.status(404).send('Description not found');
//     }
//     // search if the image already exists
//     console.log(imagesReturn);
//     const unionArray = [...new Set([...imagesReturn, ...currentDescription.images])];
//     const updatedDescription = await Description.findByIdAndUpdate(id, {
//       images: unionArray,
//     });
//     return res.status(200).send({
//       message: 'File uploaded and description updated',
//       updatedDescription,
//       unionArray,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       ok: false,
//       err: {
//         message: error.message,
//       },
//     });
//   }
// });

router.post(
  '/multiple-upload/:id',
  uploadController.uploadImages,
  uploadController.deletePrevious,
  uploadController.resizeImages,
  uploadController.getResult,
  async (req, res) => {
    const { id } = req.params.id as any;
    const description = await Description.findOneAndUpdate(id, {
      images: req.body.images,
    });
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
