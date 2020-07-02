import express from 'express';
import cors from 'cors';
import routes from './startup/routes';
import db from './startup/db';
import config from './startup/config';
// TODO: Remove cors using env variable so that production env ignores it

const app = express();
app.use(cors());
routes(app);
db();
config();
const port = process.env.PORT || 3000;

console.log('Test');

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
