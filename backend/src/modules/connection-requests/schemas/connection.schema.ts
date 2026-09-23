import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema({ timestamps: true })
export class Connection extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    donorId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ConnectionRequest', required: true, unique: true })
    connectionRequestId?: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    connectedAt?: Date;

    @Prop({ type: Date, default: Date.now })
    lastInteractionAt?: Date;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);

ConnectionSchema.index({ userId: 1, donorId: 1 }, { unique: true })