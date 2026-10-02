import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from './schemas/conversation.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/repositories/users.repository';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
        private readonly notificationsService: NotificationsService,
        private readonly usersRepository: UsersRepository,
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

        // Notifying is a side effect; never let it fail or delay the message itself
        void this.notifyReceiver(conversation._id!.toString(), senderId, receiverId.toString()).catch((error) =>
            this.logger.error(`Failed to notify user ${receiverId.toString()} of new message`, error),
        );

        return message;
    }

    /**
     * Creates one NEW_MESSAGE notification (and email) per conversation until the
     * receiver reads it, so an active chat doesn't flood their inbox.
     */
    private async notifyReceiver(conversationId: string, senderId: string, receiverId: string) {
        if (await this.notificationsService.hasUnread(receiverId, 'NEW_MESSAGE', conversationId)) {
            return;
        }

        const sender = await this.usersRepository.findById(senderId);
        const senderName = sender?.fullName ?? 'A BloodLink member';

        await this.notificationsService.createNotification({
            userId: receiverId,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: `${senderName} sent you a new message.`,
            referenceId: conversationId,
            actionPath: `/messages?c=${conversationId}`,
        });
    }
}
