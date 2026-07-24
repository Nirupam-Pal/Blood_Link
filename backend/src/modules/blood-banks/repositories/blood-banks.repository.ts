import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../database/base.repository";
import { BloodBank } from "../blood-banks.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class BloodBanksRepository extends BaseRepository<BloodBank> {
    constructor(@InjectModel(BloodBank.name) private readonly bloodBankModel: Model<BloodBank>) {
        super(bloodBankModel);
    }
}