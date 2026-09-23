import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConnectionRequestRepository } from './repositories/connection-request.repository';
import { ConnectionRepository } from './repositories/connection.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatService } from '../chat/chat.service';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types } from 'mongoose';
import { ConnectionRequestStatus } from '../../common/enums/connection-request-status.enum';

@Injectable()
export class ConnectionRequestsService {
    constructor(
        private readonly connectionRequestRepository: ConnectionRequestRepository,
        private readonly connectionRepository: ConnectionRepository,
        private readonly usersRepository: UsersRepository,
        private readonly notificationService: NotificationsService,
        private readonly chatService: ChatService,
        @InjectConnection() private readonly mongoConnection: Connection,
    ) {}

    async createRequest(senderId: string, donorId: string, message?: string) {
        if (senderId === donorId) {
        throw new BadRequestException(
            'You cannot send a connection request to yourself.',
        );
        }

        const donor = await this.usersRepository.findById(donorId);
        if (!donor || donor.role != 'DONOR') {
        throw new BadRequestException(
            'Target account is not a registered donor.',
        );
        }

        const existing = await this.connectionRequestRepository.findOne({
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(donorId),
        status: {
            $in: [
            ConnectionRequestStatus.PENDING,
            ConnectionRequestStatus.ACCEPTED,
            ],
        },
        });

        if (existing) {
        if (existing.status === ConnectionRequestStatus.ACCEPTED) {
            throw new BadRequestException(
            'A valid connection already existswith this donor.',
            );
        }
        throw new BadRequestException(
            'A pending connection request already exists.',
        );
        }

        const request = await this.connectionRequestRepository.create({
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(donorId),
        message,
        status: ConnectionRequestStatus.PENDING,
        });

        await this.notificationService.createNotification({
        userId: donorId,
        type: 'CONNECTION_REQUEST_RECEIVED',
        title: 'New Connection Request',
        message: `You have received a blood connection request.`,
        referenceId: request._id.toString(),
        });

        return request;
    }

    async getReceivedRequests(donorId: string) {
        return this.connectionRequestRepository.findMany(
        { receiverId: new Types.ObjectId(donorId) },
        undefined,
        {
            populate: {
            path: 'senderId',
            select: 'name email phone bloodGroup city subDivision district',
            },
        },
        );
    }

    async getSentRequests(userId: string) {
        return this.connectionRequestRepository.findMany(
            { senderId: new Types.ObjectId(userId) },
            undefined,
            {
                populate: {
                    path: 'receiverId',
                    select: 'name email phone bloodGroup city subDivision district',
                },
            },
        );
    }

    // async acceptRequest(requestId: string, donorId: string) {
    //     const session: ClientSession = await this.mongoConnection.startSession();
    //     session.startTransaction();

    //     try {
    //         const request = await this.connectionRequestRepository.findById(requestId);
    //         if(!request) {
    //             throw new NotFoundException('Connection request not found.')
    //         }
    //     }
    // }


}
