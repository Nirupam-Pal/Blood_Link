import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ConnectionRequestStatus } from '../../../common/enums/connection-request-status.enum';

@Schema({ timestamps: true })
export class ConnectionRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  receiverId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ConnectionRequestStatus,
    default: ConnectionRequestStatus.PENDING,
    index: true,
  })
  status!: ConnectionRequestStatus;

  @Prop({ type: String, trim: true, maxlength: 500 })
  message?: string;

  @Prop({ type: Date })
  respondedAt?: Date;
}

export const ConnectionRequestSchema =
  SchemaFactory.createForClass(ConnectionRequest);

ConnectionRequestSchema.index({ senderId: 1, receiverId: 1, status: 1 });

// Prevents duplicate pending requests between the same sender and receiver (even under concurrent inserts)
ConnectionRequestSchema.index(
  { senderId: 1, receiverId: 1 },
  { unique: true, partialFilterExpression: { status: ConnectionRequestStatus.PENDING } },
);
