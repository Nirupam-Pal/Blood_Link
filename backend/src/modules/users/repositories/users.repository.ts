import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../database/base.repository";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../user.schema";
import { Model } from "mongoose";

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
        super(userModel);
    }

    async findWithPassword(email: string): Promise<User | null> {
        return this.userModel.findOne({ email, isActive: true }).select('+password').exec();
    }

    async findWithRefreshToken(id: string): Promise<User | null> {
        return this.userModel.findById(id).select('+refreshTokenHash').exec();
    }
}