import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  ritualId: mongoose.Types.ObjectId;
  userId: string;
  bookId: mongoose.Types.ObjectId;
  pagesRead: number;
  date: string; // YYYY-MM-DD
  timestamp: Date;
  isCompleted?: boolean;
  note?: string;
}

const LogSchema: Schema = new Schema({
  ritualId: { type: Schema.Types.ObjectId, ref: 'Ritual', required: true },
  userId: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  pagesRead: { type: Number, required: true },
  date: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  note: { type: String }
});

export default mongoose.model<ILog>('Log', LogSchema);