import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get()
    async getConversations(@CurrentUser() account: any) {
        return this.chatService.getConversations(account.sub || account._id);
    }

    @Get(':id/messages')
    async getMessages(
        @Param('id') id: string,
        @CurrentUser() account: any,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.chatService.getMessages(id, account.sub || account._id, limit ? Number(limit) : 50, offset ? Number(offset) : 0);
    }

}
