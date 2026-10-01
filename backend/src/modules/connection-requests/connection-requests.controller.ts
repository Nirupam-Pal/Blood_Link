import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsObjectIdPipe } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConnectionRequestsService } from './connection-requests.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';
import { CreateConnectionRequestDto } from './dto/create-connection-request.dto';

@Controller('connection-requests')
@UseGuards(JwtAuthGuard)
export class ConnectionRequestsController {
    constructor(private readonly connectionRequestService: ConnectionRequestsService) {}


    @Post()
    async create(@CurrentUser('id') userId: string, @Body() dto: CreateConnectionRequestDto) {
        return this.connectionRequestService.createRequest(userId, dto.donorId, dto.message);
    }

    @Get('received')
    async getReceived(@CurrentUser('id') userId: string) {
        return this.connectionRequestService.getReceivedRequests(userId);
    }

    @Get('sent')
    async getSent(@CurrentUser('id') userId: string){
        return this.connectionRequestService.getSentRequests(userId);
    }

    @Patch(':id/accept')
    async accept(@Param('id', IsObjectIdPipe) id: string, @CurrentUser('id') userId: string) {
        return this.connectionRequestService.acceptRequest(id, userId);
    }

    @Patch(':id/reject')
    async reject(@Param('id', IsObjectIdPipe) id: string, @CurrentUser('id') userId: string) {
        return this.connectionRequestService.rejectRequest(id, userId);
    }

    @Patch(':id/cancel')
    async cancel(@Param('id', IsObjectIdPipe) id: string, @CurrentUser('id') userId: string) {
        return this.connectionRequestService.cancelRequest(id, userId);
    }
}

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
    constructor(private readonly connectionRequestsService: ConnectionRequestsService) {}

    @Get()
    async findAll(@CurrentUser('id') userId: string) {
        return this.connectionRequestsService.getConnections(userId);
    }
}
