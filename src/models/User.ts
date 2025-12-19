import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
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
      unique: true,
      maxlength: [255, 'メールアドレスは255文字以内で入力してください'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        '有効なメールアドレスを入力してください',
      ],
    },
    image: {
      type: String,
      maxlength: [500, '画像URLは500文字以内で入力してください'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// モデルが既に存在する場合はそれを使用、存在しない場合は新規作成
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
