import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../database/base.repository";
import { ConnectionRequest } from "../schemas/connection-request.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ConnectionRequestRepository extends BaseRepository<ConnectionRequest> {
    constructor(@InjectModel(ConnectionRequest.name) private readonly connectionRequestModel: Model<ConnectionRequest>) {
        super(connectionRequestModel);
    }
}