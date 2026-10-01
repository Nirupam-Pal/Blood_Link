import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from './schemas/conversation.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAGE_SIZE = 100;

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
            .populate('participantIds', 'fullName email role bloodGroup city subDivision district')
            .populate('lastMessageId')
            .sort({ lastMessageAt: -1 });
    }

    /** Returns the conversation if the user is a participant, otherwise throws. */
    async getConversationForParticipant(conversationId: string, userId: string) {
        if (!Types.ObjectId.isValid(conversationId)) {
            throw new BadRequestException('Invalid conversation id.');
        }
        const conversation = await this.conversationModel.findById(conversationId);
        if(!conversation || !conversation.participantIds.some((id) => id.toString() === userId)) {
            throw new ForbiddenException('Access denied to this conversation.');
        }
        return conversation;
    }

    async getMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
        await this.getConversationForParticipant(conversationId, userId);

        const safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
        const safeOffset = Math.max(offset, 0);

        return this.messageModel
            .find({ conversationId: new Types.ObjectId(conversationId) })
            .sort({ createdAt: -1 })
            .skip(safeOffset)
            .limit(safeLimit);
    }

    async saveMessage(conversationId: string, senderId: string, content: unknown) {
        if (typeof content !== 'string' || !content.trim()) {
            throw new BadRequestException('Message content cannot be empty.');
        }
        if (content.length > MAX_MESSAGE_LENGTH) {
            throw new BadRequestException(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
        }

        const conversation = await this.getConversationForParticipant(conversationId, senderId);

        // The receiver is always the other participant; never trust it from the client.
        const receiverId = conversation.participantIds.find((id) => id.toString() !== senderId);
        if (!receiverId) {
            throw new BadRequestException('Conversation has no other participant.');
        }

        const message = await this.messageModel.create({
            conversationId: conversation._id,
            senderId: new Types.ObjectId(senderId),
            receiverId,
            content,
        });

        conversation.lastMessageId = message._id as Types.ObjectId;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        return message;
    }
}
