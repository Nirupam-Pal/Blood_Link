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

// @Schema({ _id: false, versionKey: false })
// class GeoJSONPoint {
//   @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
//   type!: string;

//   @Prop({ type: [Number], required: true })
//   coordinates!: number[];
// }
// const GeoJSONPointSchema = SchemaFactory.createForClass(GeoJSONPoint);

@Schema({ timestamps: true, versionKey: false })
export class BloodBank extends Document {

  @Prop({ required: true })
  bloodBankName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({required: true, select: false})
  password!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  licenseNumber!: string;

  @Prop({ required: true, unique: true, trim: true })
  phoneNumber!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true, index: true, trim: true })
  state!: string;

  @Prop({ required: true, index: true, trim: true })
  district!: string;

  @Prop({ required: true, index: true, trim: true })
  subDivision!: string;

  @Prop({ required: true, index: true, trim: true })
  city!: string;

  @Prop({ required: true, trim: true })
  pinCode!: string;

  // @Prop({ type: GeoJSONPointSchema, required: true, index: '2dsphere' })
  // location!: GeoJSONPoint;

  @Prop({ default: false, index: true })
  emailVerified!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: String, default: null, select: false })
  refreshTokenHash!: string;

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
    inventory!: Record<BloodGroup, InventoryItem>;
}

export const BloodBankSchema = SchemaFactory.createForClass(BloodBank);

// Compound Index for Administrative Region Searches
BloodBankSchema.index({ isActive: 1, state: 1, district: 1, subDivision: 1, city: 1 });
BloodBankSchema.index({ isActive: 1, state: 1, district: 1 });
BloodBankSchema.index({ isActive: 1, state: 1, subDivision: 1 });
BloodBankSchema.index({ isActive: 1, state: 1, city: 1 });

// Compound Index for Regional Verification Filtering
BloodBankSchema.index({ state: 1, city: 1, emailVerified: 1, isActive: 1 });