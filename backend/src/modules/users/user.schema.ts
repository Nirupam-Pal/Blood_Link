import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Gender } from "../../common/enums/gender.enum";
import { Role } from "../../common/enums/role.enum";

@Schema({ timestamps: true, versionKey: false })
export class User extends Document {
    @Prop({ required: true, unique: true, index: true, trim: true, lowercase: true })
    email!: string;

    @Prop({ required: true, select: false })
    password!: string;

    @Prop({ required: true })
    fullName!: string;

    @Prop({ required: true, enum: Gender })
    gender!: string;

    @Prop({ required: true, index: true, trim: true })
    state!: string;

    @Prop({ required: true, index: true, trim: true })
    district!: string;
    
    @Prop({ required: true, index: true, trim: true })
    subDivision!: string;
    
    @Prop({ required: true, index: true, trim: true })
    city!: string

    @Prop({ required: true, trim: true })
    pinCode!: string;

    @Prop({ required: true, enum: Role, default: Role.USER, index: true })
    role!: string;

    @Prop({ default: false })
    donor!: boolean;

    @Prop({ default: true, index: true })
    isActive!: boolean;

    @Prop({ type: String, default: null, select: false })
    refreshTokenHash!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ state: 1, district: 1, subDivision: 1, city: 1  })