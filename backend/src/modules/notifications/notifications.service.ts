import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import { Model, Types } from 'mongoose';
import { EmailService } from '../../common/services/email.service';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
        private readonly emailService: EmailService,
    ) {}

    async createNotification(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        referenceId?: string;
    }) {
        const notification = await this.notificationModel.create({
            userId: new Types.ObjectId(data.userId),
            type: data.type,
            title: data.title,
            message: data.message,
            referenceId: data.referenceId,
        });
        return notification;
    }

    async getNotifications(userId: string) {
        return this.notificationModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(50);
    }

    async getUnreadCount(userId: string) {
        return this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false });
    }

    async markAsRead(notificationId: string, userId: string) {
        return this.notificationModel.findOneAndUpdate(
            { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
            { isRead: true },
            { new: true },
        )
    }

    async markAllAsRead(userId: string) {
        return this.notificationModel.updateMany(
            { userId: new Types.ObjectId(userId), isRead: false },
            { isRead: true },
        )
    }
}
