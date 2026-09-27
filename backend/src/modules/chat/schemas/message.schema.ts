import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true })
    conversationId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    receiverId!: Types.ObjectId;

    @Prop({ type: String, required: true, trim: true, maxlength: 2000 })
    content!: string;

    @Prop({ type: Boolean, default: false })
    isRead!: boolean;

    @Prop({ type: Date })
    readAt?: Date; 
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: 1 });