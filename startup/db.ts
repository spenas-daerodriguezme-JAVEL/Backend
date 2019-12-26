import mongoose from 'mongoose';

export default function() {
    mongoose.connect('mongodb://localhost/javel', { useNewUrlParser: true, useUnifiedTopology: true  })
        .then(() => console.log('connected to MongoDB...'));
}