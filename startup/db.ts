import mongoose from "mongoose";

export default function() {
  mongoose
    .connect("mongodb://mongo:27017/javel", {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    })
    .then(() => console.log("connected to MongoDB..."));
}
