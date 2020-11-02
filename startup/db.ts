import mongoose from 'mongoose';

let stringConnection = '';
if (process.env.APP_ENV === 'prod') {
  stringConnection = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.DB_CONTAINER}:27017/${process.env.MONGODB_DATABASE}`;
} else {
  // stringConnection = 'mongodb://127.0.0.1:27017/javel';
  stringConnection = 'mongodb://mongo/javel';
}

export default () => {
  mongoose
    .connect(stringConnection, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log('connected to MongoDB...'));
};
