import https from 'https';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import routes from './startup/routes';
import db from './startup/db';
import config from './startup/config';
// TODO: Remove cors using env variable so that production env ignores it
const options = {
  key: fs.readFileSync(path.resolve('./build/certs/privkey.pem'), 'utf-8'),
  cert: fs.readFileSync(path.resolve('./build/certs/fullchain.pem'), 'utf-8'),
};
const app = express();
app.use(cors());
routes(app);
db();
config();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

https.createServer(options, app).listen(port, () => {
  console.log(`Listening on port ${port}`);
});
