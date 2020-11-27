import mongoose, { Schema } from 'mongoose';

const resetPasswordSchema = new mongoose.Schema({

  userId: { type: Schema.Types.ObjectId },
  resetPasswordToken: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  expire: {
    type: Date,
  },
  status: {
    type: Number,
  },
});

// eslint-disable-next-line import/prefer-default-export
export const Reset = mongoose.model('Reset', resetPasswordSchema);
