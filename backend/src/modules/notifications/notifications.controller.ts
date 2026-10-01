import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsObjectIdPipe } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationService: NotificationsService) {}

    @Get()
    async findAll(@CurrentUser('id') userId: string) {
        return this.notificationService.getNotifications(userId);
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser('id') userId: string) {
        const count = await this.notificationService.getUnreadCount(userId);
        return { count };
    }

    @Patch('read-all')
    async markAllAsRead(@CurrentUser('id') userId: string) {
        return this.notificationService.markAllAsRead(userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id', IsObjectIdPipe) id: string, @CurrentUser('id') userId: string) {
        return this.notificationService.markAsRead(id, userId);
    }
}
