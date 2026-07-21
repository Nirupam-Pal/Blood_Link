import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { BloodGroup } from '../../common/enums/blood-group.enum';

@Schema({ _id: false, versionKey: false })
class InventoryItem {
  @Prop({ required: true, default: 0, min: 0 })
  units!: number;

  @Prop({ required: true, default: Date.now })
  lastUpdated!: Date;
}
const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);

@Schema({ _id: false, versionKey: false })
class GeoJSONPoint {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type!: string;

  @Prop({ type: [Number], required: true })
  coordinates!: number[];
}
const GeoJSONPointSchema = SchemaFactory.createForClass(GeoJSONPoint);

@Schema({ timestamps: true, versionKey: false })
export class BloodBank extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    primaryKey: true,
  })
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  bloodBankName!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  licenseNumber!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true, index: true })
  state!: string;

  @Prop({ required: true, index: true })
  district!: string;

  @Prop({ required: true, index: true })
  subDivision!: string;

  @Prop({ required: true, index: true })
  city!: string;

  @Prop({ required: true })
  pinCode!: string;

  @Prop({ type: GeoJSONPointSchema, required: true, index: '2dsphere' })
  location!: GeoJSONPoint;

  @Prop({ default: false, index: true })
  verified!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({
        type: {
            [BloodGroup.A_POSITIVE]: { type: InventoryItemSchema, default: () => ({}) },
            [BloodGroup.A_NEGATIVE]: { type: InventoryItemSchema, default: () => ({}) },
            [BloodGroup.B_POSITIVE]: { type: InventoryItemSchema, default: () => ({}) },
            [BloodGroup.B_NEGATIVE]: { type: InventoryItemSchema, default: () => ({}) },
            [BloodGroup.AB_POSITIVE]: { type: InventoryItemSchema, default: () => ({}) },
            [BloodGroup.AB_NEGATIVE]: { type: InventoryItemSchema, default: () => ({}) },
            [BloodGroup.O_POSITIVE]: { type: InventoryItemSchema, default: () => ({}) },
            [BloodGroup.O_NEGATIVE]: { type: InventoryItemSchema, default: () => ({}) },
        },
        default: {},
    })
    inventory!: Record<string, InventoryItem>;
}

export const BloodBankSchema = SchemaFactory.createForClass(BloodBank);

// Compound Index for Administrative Region Searches
BloodBankSchema.index({ state: 1, district: 1, subDivision: 1, city: 1 });

// Compound Index for Regional Verification Filtering
BloodBankSchema.index({ state: 1, city: 1, verified: 1, isActive: 1 });