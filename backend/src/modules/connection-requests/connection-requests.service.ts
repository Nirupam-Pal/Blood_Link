import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConnectionRequestRepository } from './repositories/connection-request.repository';
import { ConnectionRepository } from './repositories/connection.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatService } from '../chat/chat.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection as MongoConnection, Types } from 'mongoose';
import { ConnectionRequestStatus } from '../../common/enums/connection-request-status.enum';
import { Connection } from './schemas/connection.schema';

const USER_PUBLIC_FIELDS = 'fullName email bloodGroup city subDivision district';
const MAX_REQUESTS_RETURNED = 100;

@Injectable()
export class ConnectionRequestsService {
    constructor(
        private readonly connectionRequestRepository: ConnectionRequestRepository,
        private readonly connectionRepository: ConnectionRepository,
        private readonly usersRepository: UsersRepository,
        private readonly notificationService: NotificationsService,
        private readonly chatService: ChatService,
        @InjectConnection() private readonly mongoConnection: MongoConnection,
    ) {}

    async createRequest(senderId: string, donorId: string, message?: string) {
        if (senderId === donorId) {
        throw new BadRequestException(
            'You cannot send a connection request to yourself.',
        );
        }

        const donor = await this.usersRepository.findById(donorId);
        if (!donor || !donor.donor || !donor.isActive) {
        throw new BadRequestException(
            'Target account is not a registered donor.',
        );
        }

        const sender = new Types.ObjectId(senderId);
        const receiver = new Types.ObjectId(donorId);

        const existingConnection = await this.connectionRepository.findOne({
        $or: [
            { userId: sender, donorId: receiver },
            { userId: receiver, donorId: sender },
        ],
        });
        if (existingConnection) {
        throw new BadRequestException(
            'A valid connection already exists with this donor.',
        );
        }

        // Check both directions so two people can't have crossing pending requests
        const existing = await this.connectionRequestRepository.findOne({
        $or: [
            { senderId: sender, receiverId: receiver },
            { senderId: receiver, receiverId: sender },
        ],
        status: ConnectionRequestStatus.PENDING,
        });

        if (existing) {
        throw new BadRequestException(
            existing.senderId.equals(sender)
            ? 'A pending connection request already exists.'
            : 'This donor has already sent you a connection request.',
        );
        }

        let request;
        try {
        request = await this.connectionRequestRepository.create({
            senderId: sender,
            receiverId: receiver,
            message,
            status: ConnectionRequestStatus.PENDING,
        });
        } catch (error) {
        // Unique partial index hit by a concurrent duplicate request
        if ((error as { code?: number })?.code === 11000) {
            throw new BadRequestException(
            'A pending connection request already exists.',
            );
        }
        throw error;
        }

        const senderUser = await this.usersRepository.findById(senderId);
        await this.notificationService.createNotification({
        userId: donorId,
        type: 'CONNECTION_REQUEST_RECEIVED',
        title: 'New Connection Request',
        message: senderUser?.fullName
            ? `${senderUser.fullName} has sent you a blood connection request.`
            : `You have received a blood connection request.`,
        referenceId: request._id.toString(),
        actionPath: '/connections?tab=received',
        });

        return request;
    }

    async getReceivedRequests(donorId: string) {
        return this.connectionRequestRepository.findMany(
        { receiverId: new Types.ObjectId(donorId) },
        undefined,
        {
            sort: { createdAt: -1 },
            limit: MAX_REQUESTS_RETURNED,
            populate: {
            path: 'senderId',
            select: USER_PUBLIC_FIELDS,
            },
        },
        );
    }

    async getSentRequests(userId: string) {
        return this.connectionRequestRepository.findMany(
            { senderId: new Types.ObjectId(userId) },
            undefined,
            {
                sort: { createdAt: -1 },
                limit: MAX_REQUESTS_RETURNED,
                populate: {
                    path: 'receiverId',
                    select: USER_PUBLIC_FIELDS,
                },
            },
        );
    }

    async acceptRequest(requestId: string, donorId: string) {
        const session = await this.mongoConnection.startSession();
        let connection!: Connection;
        let conversationId!: string;
        let senderId!: string;

        try {
            // withTransaction retries on write conflicts, so a concurrent accept/cancel
            // re-reads the request and fails the PENDING check instead of double-accepting.
            await session.withTransaction(async () => {
                const request = await this.connectionRequestRepository.findById(requestId, undefined, { session });
                if(!request) {
                    throw new NotFoundException('Connection request not found.')
                }

                if(request.receiverId.toString() !== donorId) {
                    throw new ForbiddenException('You are not authorized to accept this request');
                }

                if(request.status !== ConnectionRequestStatus.PENDING) {
                    throw new BadRequestException(`Request is already ${request.status.toLowerCase()}`);
                }

                request.status = ConnectionRequestStatus.ACCEPTED;
                request.respondedAt = new Date();
                await request.save({ session });

                connection = await this.connectionRepository.create(
                    {
                        userId: request.senderId,
                        donorId: request.receiverId,
                        connectionRequestId: request._id,
                        connectedAt: new Date(),
                        lastInteractionAt: new Date(),
                    },
                    session,
                );

                const conversation = await this.chatService.getOrCreateConversation(
                    request.senderId.toString(),
                    request.receiverId.toString(),
                    connection._id!.toString(),
                    session,
                );

                conversationId = conversation._id!.toString();
                senderId = request.senderId.toString();
            });
        } finally {
            await session.endSession();
        }

        await this.notificationService.createNotification({
            userId: senderId,
            type: 'CONNECTION_REQUEST_ACCEPTED',
            title: 'Connection Accepted',
            message: 'Your blood connection request has been accepted!',
            referenceId: connection._id!.toString(),
            actionPath: `/messages?c=${conversationId}`,
        });

        return { connection, conversationId };
    }

    async rejectRequest(requestId: string, donorId: string) {
        const request = await this.connectionRequestRepository.findById(requestId);
        if (!request) {
            throw new NotFoundException('Connection request not found.');
        }

        if (request.receiverId.toString() !== donorId) {
            throw new ForbiddenException('You are not authorized to reject this request.')
        }

        // Conditional update so a concurrent accept/cancel can't be overwritten
        const updated = await this.connectionRequestRepository.findOneAndUpdate(
            { _id: request._id, status: ConnectionRequestStatus.PENDING },
            { status: ConnectionRequestStatus.REJECTED, respondedAt: new Date() },
        );
        if (!updated) {
            throw new BadRequestException('Only pending requests can be rejected.');
        }

        await this.notificationService.createNotification({
            userId: request.senderId.toString(),
            type: 'CONNECTION_REQUEST_REJECTED',
            title: 'Connection Rejected',
            message: 'Your blood connection request was declined.',
            referenceId: request._id!.toString(),
            actionPath: '/connections?tab=sent',
        });

        return updated;
    }

    async cancelRequest(requestId: string, userId: string) {
        const request = await this.connectionRequestRepository.findById(requestId);
        if(!request) {
            throw new NotFoundException('Connection request not found.');
        }

        if(request.senderId.toString() !== userId) {
            throw new ForbiddenException('You are not authorized to cancel this request.');
        }

        const updated = await this.connectionRequestRepository.findOneAndUpdate(
            { _id: request._id, status: ConnectionRequestStatus.PENDING },
            { status: ConnectionRequestStatus.CANCELLED },
        );
        if (!updated) {
            throw new BadRequestException('Only pending requests can be cancelled.');
        }
        return updated;
    }

    async getConnections(accountId: string) {
        const id = new Types.ObjectId(accountId);
        return this.connectionRepository.findMany(
            { $or: [{ userId: id }, { donorId: id }] },
            undefined,
            {
                sort: { lastInteractionAt: -1 },
                populate: [
                    { path: 'userId', select: `${USER_PUBLIC_FIELDS} role` },
                    { path: 'donorId', select: `${USER_PUBLIC_FIELDS} role` },
                ],
            },
        );
    }
}
