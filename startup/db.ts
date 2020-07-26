import mongoose from 'mongoose';

let stringConnection = '';
if (process.env.APP_ENV === 'prod') {
  stringConnection = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.DB_CONTAINER}:27017/${process.env.MONGODB_DATABASE}`;
} else {
  stringConnection = 'mongodb://localhost:27017/javel';
}

console.log(stringConnection);
console.log(process.env.APP_ENV);

export default () => {
  mongoose
    .connect(stringConnection, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('connected to MongoDB...'));
};
