import sharp from 'sharp';
import { Description } from '../models/description';

const { Storage } = require('@google-cloud/storage');

const { CLOUD_BUCKET } = process.env;
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.KEYFILE_PATH,
});
const bucket = storage.bucket(CLOUD_BUCKET);

const getPublicUrl = (filename:any) => `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;

const resizeImages = async (req: any, res: any, next: any) => {
  const { id } = req.body;
  if (!req.files) return next();
  req.body.images = [];
  let idx = 0;
  await Promise.all(
    req.files.map(async (file: any) => {
      // const filename = file.originalname.replace(/\..+$/, '');
      const originalFilename = `${id}-${idx}.webp`;
      const thumbnailFilename = `thumbnail-${id}-${idx}.webp`;
      idx += 1;
      const thumbnailImage = await sharp(file.buffer)
        .resize(640, 320)
        .toBuffer();

      const originalImage = await sharp(file.buffer)
        .resize(320, 160)
        .toBuffer();

      req.body.images.push({
        originalname: originalFilename,
        buffer: thumbnailImage,
      });
      req.body.images.push({
        originalname: thumbnailFilename,
        buffer: originalImage,
      });
    }),
  );
  return next();
};

const sendUploadToGCS = (req:any, res:any, next:any) => {
  if (!req.files) {
    return next();
  }

  let promises = [] as any;
  req.body.images.forEach((image:any, index:any) => {
    const gcsname = `${Date.now()}-${image.originalname}`;
    const file = bucket.file(gcsname);

    const promise = new Promise((resolve, reject) => {
      const stream = file.createWriteStream({});

      stream.on('finish', async () => {
        try {
          req.body.images[index].cloudStorageObject = gcsname;
          await file.makePublic();
          req.body.images[index].cloudStoragePublicUrl = getPublicUrl(gcsname);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', (err:any) => {
        req.body.images[index].cloudStorageError = err;
        reject(err);
      });

      stream.end(image.buffer);
    });

    promises.push(promise);
  });

  Promise.all(promises)
    .then((_) => {
      promises = [];
      next();
    })
    .catch(next);
};

const modifyPrevious = async (req: any, res: any, next: any) => {
  const { id } = req.body;
  try {
    console.log(req.body.images);
    const description:any = await Description.findById(id);
    const deletionsPromise = description.images.map(async (element:any) => {
      const image = element.split('/')[4];
      return bucket.file(image).delete();
    });
    console.log('req.body.images.map :>> ', req.body.images.map);
    console.log('description.images :>> ', description.images);
    const deletions = Promise.all(deletionsPromise);
    description.images = req.body.images.map((file:any) => file.cloudStoragePublicUrl);
    await description.save();
    if (deletions) {
      return next();
    }
  } catch (error) {
    return res.send(error);
  }
};

export {
  sendUploadToGCS,
  resizeImages,
  modifyPrevious,
};
