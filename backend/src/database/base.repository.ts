import { Model } from "mongoose";

export class BaseRepository<T extends Document> {
    constructor(protected readonly model: Model<T>) {}

    async create(doc: Partial<unknown>): Promise<T> {
        const createdEntity = new this.model(doc)
        return createdEntity.save() as Promise<T>;
    }
}