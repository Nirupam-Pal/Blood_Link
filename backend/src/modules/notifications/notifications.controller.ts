import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationService: NotificationsService) {}

    @Get()
    async findAll(@CurrentUser() account: any) {
        return this.notificationService.getNotifications(account.sub || account._id);
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser() account: any) {
        const count =  this.notificationService.getUnreadCount(account.sub || account._id);
        return { count };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @CurrentUser() account: any){
        return this.notificationService.markAsRead(id, account.sub || account._id);
    }

    @Patch('read-all')
    async markAllAsRead(@CurrentUser() account: any) {
        return this.notificationService.markAllAsRead(account.sub || account._id);
    }
}
