const { Storage } = require('@google-cloud/storage');

const { CLOUD_BUCKET } = process.env;
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.KEYFILE_PATH,
});
const bucket = storage.bucket(CLOUD_BUCKET);

const getPublicUrl = (filename:any) => `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;

const sendUploadToGCS = (req:any, res:any, next:any) => {
  if (!req.files) {
    return next();
  }

  let promises = [] as any;
  req.files.forEach((image:any, index:any) => {
    const gcsname = Date.now() + image.originalname;
    const file = bucket.file(gcsname);

    const promise = new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
      });

      stream.on('finish', async () => {
        try {
          req.files[index].cloudStorageObject = gcsname;
          await file.makePublic();
          req.files[index].cloudStoragePublicUrl = getPublicUrl(gcsname);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', (err:any) => {
        req.files[index].cloudStorageError = err;
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

export default sendUploadToGCS;
