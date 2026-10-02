import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import { Model, Types } from 'mongoose';
import { UsersRepository } from '../users/repositories/users.repository';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
        private readonly usersRepository: UsersRepository,
        private readonly emailService: EmailService,
    ) {}

    async createNotification(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        referenceId?: string;
        /** Frontend path the email's button links to; defaults to the notifications page. */
        actionPath?: string;
    }) {
        const notification = await this.notificationModel.create({
            userId: new Types.ObjectId(data.userId),
            type: data.type,
            title: data.title,
            message: data.message,
            referenceId: data.referenceId,
        });

        // Fire-and-forget so slow or failing email delivery never delays the caller
        void this.sendEmail(data).catch((error) =>
            this.logger.error(`Failed to email notification to user ${data.userId}`, error),
        );

        return notification;
    }

    async hasUnread(userId: string, type: NotificationType, referenceId: string) {
        const existing = await this.notificationModel.exists({
            userId: new Types.ObjectId(userId),
            type,
            referenceId,
            isRead: false,
        });
        return !!existing;
    }

    async getNotifications(userId: string) {
        return this.notificationModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(50);
    }

    async getUnreadCount(userId: string) {
        return this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false });
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.notificationModel.findOneAndUpdate(
            { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
            { isRead: true },
            { new: true },
        );
        if (!notification) {
            throw new NotFoundException('Notification not found.');
        }
        return notification;
    }

    async markAllAsRead(userId: string) {
        return this.notificationModel.updateMany(
            { userId: new Types.ObjectId(userId), isRead: false },
            { isRead: true },
        );
    }

    private async sendEmail(data: { userId: string; title: string; message: string; actionPath?: string }) {
        const user = await this.usersRepository.findById(data.userId);
        if (!user?.email || !user.isActive) {
            return;
        }
        await this.emailService.sendNotificationEmail({
            to: user.email,
            name: user.fullName,
            title: data.title,
            message: data.message,
            actionPath: data.actionPath,
        });
    }
}
