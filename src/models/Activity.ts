import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  /** Exact date when documented. Undocumented events use `dateLabel` only. */
  activityDate?: Date;
  endDate?: Date;
  /** Human-readable label used when an exact date is not verified. */
  dateLabel?: string;
  published: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 20000 },
    coverImageUrl: { type: String },
    coverImagePublicId: { type: String },
    activityDate: { type: Date },
    endDate: { type: Date },
    dateLabel: { type: String, trim: true, maxlength: 120 },
    published: { type: Boolean, default: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

ActivitySchema.index({ published: 1, activityDate: -1 });

ActivitySchema.pre('validate', function () {
  if (!this.activityDate && !this.dateLabel) {
    throw new Error(
      'An activity needs either a verified activity date or a descriptive date label.'
    );
  }
});

const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
