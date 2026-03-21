import mongoose, { Schema, Document } from 'mongoose';

export interface IRitual extends Document {
  name: string;
  members: string[]; // UIDs
  modality: "shared" | "individual";
  sharedBookId?: mongoose.Types.ObjectId;
  dailyThreshold: number;
  logTime: string; // HH:mm
  streakCount: number;
  lastSyncDate?: string; // YYYY-MM-DD
  createdBy: string;
  status: "active" | "archived";
  createdAt: Date;
}

const RitualSchema: Schema = new Schema({
  name: { type: String, required: true },
  members: [{ type: String, required: true }],
  modality: { type: String, enum: ['shared', 'individual'], required: true },
  sharedBookId: { type: Schema.Types.ObjectId, ref: 'Book' },
  dailyThreshold: { type: Number, required: true },
  logTime: { type: String, required: true },
  streakCount: { type: Number, default: 0 },
  lastSyncDate: { type: String },
  createdBy: { type: String, required: true },
  status: { type: String, enum: ['active', 'archived'], required: true, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRitual>('Ritual', RitualSchema);