import mongoose from 'mongoose';

const dbLocation = process.env.DB_CONTAINER || 'localhost';
export default () => {
  mongoose
    .connect(`mongodb://${dbLocation}:27017/javel`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('connected to MongoDB...'));
};
