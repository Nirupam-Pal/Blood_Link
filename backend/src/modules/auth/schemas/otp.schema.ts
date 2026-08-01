import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Otp extends Document {
  @Prop({ required: true, index: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  otpHash!: string; //stored as a bcrypt hash for security

  @Prop({ required: true, default: false })
  isVerified!: boolean;

  @Prop({ required: true, default: 0 })
  attempts!: number; // Rate-limiting / anti-brute-force counter

  // MongoDB TTL index: Automatically deletes the document 10 minutes (600s) after creation
  @Prop({ required: true, default: Date.now, expires: 600 })
  createdAt!: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp)
OtpSchema.index({ email: 1, createdAt: -1 });