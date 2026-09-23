import { Prop, Schema } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type NotificationType =
  | 'CONNECTION_REQUEST_RECEIVED'
  | 'CONNECTION_REQUEST_ACCEPTED'
  | 'CONNECTION_REQUEST_REJECTED'
  | 'NEW_MESSAGE'
  | 'SYSTEM_NOTIFICATION';

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId?: Types.ObjectId;

    @Prop({ type: String, required: true })
    type?: NotificationType;

    @Prop({ type: String, required: true })
    title?: string;

    @Prop({ type: String, required: true })
    message?: string;

    @Prop({ type: String })
    referenceId?: string;

    @Prop({ type: Boolean, default: false, index: true })
    isRead?: boolean
}