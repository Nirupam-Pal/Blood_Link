import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true, index: true })
  participantIds!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Connection', required: true, unique: true })
  connectionId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessageId?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  lastMessageAt!: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participantIds: 1 });