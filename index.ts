import express from 'express';
import routes from './startup/routes';

const app = express();
routes(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});