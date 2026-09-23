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
}
