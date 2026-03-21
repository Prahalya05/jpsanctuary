import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  userId: string;
  title: string;
  author: string;
  coverURL?: string;
  status: "reading" | "completed";
  totalPages: number;
  currentPage: number;
  completedAt?: Date;
  addedAt: Date;
}

const BookSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverURL: { type: String },
  status: { type: String, enum: ['reading', 'completed'], required: true },
  totalPages: { type: Number, required: true },
  currentPage: { type: Number, required: true },
  completedAt: { type: Date },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBook>('Book', BookSchema);