import mongoose, { Schema, Document, Model } from 'mongoose';

export const MEMBER_CATEGORY_VALUES = ['faculty', 'leadership', 'core', 'alumni'] as const;
export type MemberCategory = (typeof MEMBER_CATEGORY_VALUES)[number];

export interface IMember extends Document {
  fullName: string;
  role: string;
  memberCategory: MemberCategory;
  department?: string;
  biography?: string;
  portraitUrl?: string;
  portraitPublicId?: string;
  altText: string;
  displayOrder: number;
  published: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    memberCategory: {
      type: String,
      required: true,
      enum: MEMBER_CATEGORY_VALUES,
    },
    department: { type: String, trim: true, maxlength: 200 },
    biography: { type: String, maxlength: 2000 },
    portraitUrl: { type: String },
    portraitPublicId: { type: String },
    altText: { type: String, required: true, maxlength: 300 },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

MemberSchema.index({ published: 1, memberCategory: 1, displayOrder: 1 });

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;
