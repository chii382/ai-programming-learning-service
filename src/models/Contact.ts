import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, '名前は必須です'],
      maxlength: [100, '名前は100文字以内で入力してください'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'メールアドレスは必須です'],
      maxlength: [255, 'メールアドレスは255文字以内で入力してください'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        '有効なメールアドレスを入力してください',
      ],
    },
    subject: {
      type: String,
      required: [true, '件名は必須です'],
      maxlength: [200, '件名は200文字以内で入力してください'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, '本文は必須です'],
      maxlength: [5000, '本文は5000文字以内で入力してください'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// モデルが既に存在する場合はそれを使用、存在しない場合は新規作成
const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;










