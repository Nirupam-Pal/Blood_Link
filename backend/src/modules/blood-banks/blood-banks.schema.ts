import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

@Schema({_id: false, versionKey: false})
class InventoryItem {
    @Prop({ required: true, default: 0, min: 0 })
    units!: number;

    @Prop({ required: true, default: Date.now })
    lastUpdated!: Date;
}
const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem)

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
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, primaryKey: true })
    declare _id: Types.ObjectId;
}