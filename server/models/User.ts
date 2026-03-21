import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  dailyGoal?: number;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  email: { type: String, required: true },
  dailyGoal: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);