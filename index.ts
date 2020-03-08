import express from "express";
import routes from "./startup/routes";
import db from "./startup/db";
import config from "./startup/config";
import cors from 'cors';

const app = express();
app.use(cors());
routes(app);
db();
config();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
