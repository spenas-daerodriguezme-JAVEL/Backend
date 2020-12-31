import multer from 'multer';
import sharp from 'sharp';
import fs, { readdirSync } from 'fs';
import { nextTick } from 'process';
const { Storage } = require('@google-cloud/storage');

const multerStorage = multer.memoryStorage();

const multerFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Only images are allowed', false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadFiles = upload.array('images', 5);

const uploadImages = (req: any, res: any, next: any) => {
  uploadFiles(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.send('Too many files to upload.');
      }
    } else if (err) {
      return res.send(err);
    }

    return next();
  });
};

function folderExists(filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    return true;
  }
  fs.mkdirSync(filePath);
  return false;
}

const deletePrevious = async (req: any, res: any, next: any) => {
  // eslint-disable-next-line prefer-destructuring
  const id = req.params.id;
  const filePath = `assets/images/description/${id}`;
  if (folderExists(filePath)) {
    const files = readdirSync(filePath);
    // eslint-disable-next-line guard-for-in
    files.forEach((file) => {
      fs.unlinkSync(`${filePath}/${file}`);
    });
  }
  req.body.path = filePath;
  next();
};

const resizeImages = async (req: any, res: any, next: any) => {
  if (!req.files) return next();

  req.body.images = [];
  await Promise.all(
    req.files.map(async (file: any) => {
      const filename = file.originalname.replace(/\..+$/, '');
      const newFilename = `${filename}.jpeg`;
      const newFilenameWThumbnails = `thumbnail-${filename}.jpeg`;

      await sharp(file.buffer)
        .resize(640, 320)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${req.body.path}/${newFilename}`);

      await sharp(file.buffer)
        .resize(320, 160)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${req.body.path}/${newFilenameWThumbnails}`);

      req.body.images.push(newFilename);
      req.body.images.push(newFilenameWThumbnails);
    }),
  );
  return next();
};

const getResult = async (req: any, res: any, next: any) => {
  if (req.body.images.length <= 0) {
    return res.send('You must select at least 1 image.');
  }

  return next();
};

export default {
  uploadImages,
  resizeImages,
  deletePrevious,
  getResult,
};
