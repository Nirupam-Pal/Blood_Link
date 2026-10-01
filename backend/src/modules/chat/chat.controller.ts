import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { IsObjectIdPipe } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get()
    async getConversations(@CurrentUser('id') userId: string) {
        return this.chatService.getConversations(userId);
    }

    @Get(':id/messages')
    async getMessages(
        @Param('id', IsObjectIdPipe) id: string,
        @CurrentUser('id') userId: string,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    ) {
        return this.chatService.getMessages(id, userId, limit, offset);
    }

}
