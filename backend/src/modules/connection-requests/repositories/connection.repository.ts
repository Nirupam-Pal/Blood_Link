import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../database/base.repository";
import { Connection } from "../schemas/connection.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ConnectionRepository extends BaseRepository<Connection> {
    constructor(@InjectModel(Connection.name) private readonly connectionModel: Model<Connection>) {
        super(connectionModel);
    }
}