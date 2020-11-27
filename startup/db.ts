import mongoose from 'mongoose';

let stringConnection = '';
if (process.env.APP_ENV === 'prod') {
  stringConnection = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
} else {
  stringConnection = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
  // stringConnection = 'mongodb://127.0.0.1:27017/javel';
  // stringConnection = 'mongodb://mongo/javel';
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
