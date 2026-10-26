import mongoose, { Schema, Document, Model } from 'mongoose';

export const GALLERY_CATEGORY_VALUES = [
  'Campus Life',
  'Events & Workshops',
  'Photowalks',
  'Behind the Lens',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORY_VALUES)[number];

export interface IGalleryItem extends Document {
  title: string;
  caption: string;
  imageUrl: string;
  imagePublicId?: string;
  thumbnailUrl?: string;
  altText: string;
  category: GalleryCategory;
  eventDate?: Date;
  published: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    caption: { type: String, required: true, trim: true, maxlength: 600 },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    thumbnailUrl: { type: String },
    altText: { type: String, required: true, trim: true, maxlength: 300 },
    category: {
      type: String,
      required: true,
      enum: GALLERY_CATEGORY_VALUES,
    },
    eventDate: { type: Date },
    published: { type: Boolean, default: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

GalleryItemSchema.index({ published: 1, eventDate: -1, createdAt: -1 });
GalleryItemSchema.index({ published: 1, category: 1 });

const GalleryItem: Model<IGalleryItem> =
  mongoose.models.GalleryItem ||
  mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);

export default GalleryItem;
