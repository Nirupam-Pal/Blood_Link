import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from './schemas/conversation.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    ) {}

    async getOrCreateConversation(userId: string, donorId: string, connectionId: string, session?: ClientSession) {
        let conversation = await this.conversationModel.findOne({ connectionId: new Types.ObjectId(connectionId) }).session(session || null);
        if(!conversation) {
            conversation = new this.conversationModel({
                participantIds: [new Types.ObjectId(userId), new Types.ObjectId(donorId)],
                connectionId: new Types.ObjectId(connectionId),
            });
            await conversation.save({ session });
        }
        return conversation;
    }

    async getConversations(userId: string) {
        return this.conversationModel
            .find({ participantIds: new Types.ObjectId(userId) })
            .populate('participantsIds', 'name email role bloodGroup city subDivision district')
            .populate('lastMessageId')
            .sort({ lastMessage: -1 });
    }

    async getMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
        const conversation = await this.conversationModel.findById(conversationId);
        if(!conversation || !conversation.participantIds.some((id) => id.toString() === userId)) {
            throw new ForbiddenException('Access denied to this conversation.');
        }

        return this.messageModel
            .find({ conversationId: new Types.ObjectId(conversationId) })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);
    }

    async saveMessage(conversationId: string, senderId: string, receiverId: string, content: string) {
        const conversation = await this.conversationModel.findById(conversationId);
        if(!conversation || !conversation.participantIds.some((id) => id.toString() === senderId)) {
            throw new ForbiddenException('Unauthorized message posting.');
        }

        const message = await this.messageModel.create({
            conversationId: new Types.ObjectId(conversationId),
            senderId: new Types.ObjectId(senderId),
            receiverId: new Types.ObjectId(receiverId),
            content,
        });

        conversation.lastMessageId = message._id as Types.ObjectId;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        return message;
    }
}
