import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConnectionRequestsService } from './connection-requests.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';
import { CreateConnectionRequestDto } from './dto/create-connection-request.dto';

@Controller('connection-requests')
@UseGuards(JwtAuthGuard)
export class ConnectionRequestsController {
    constructor(private readonly connectionRequestService: ConnectionRequestsService) {}


    @Post()
    async create(@CurrentUser() account: any, @Body() dto: CreateConnectionRequestDto) {
        return this.connectionRequestService.createRequest(account.sub || account._id, dto.donorId, dto.message);
    }

    @Get('received')
    async getReceived(@CurrentUser() account: any) {
        return this.connectionRequestService.getReceivedRequests(account.sub || account._id);
    }

    @Get('sent')
    async getSent(@CurrentUser() account: any){
        return this.connectionRequestService.getSentRequests(account.sub || account._id);
    }

    @Patch(':id/accept')
    async accept(@Param('id') id: string, @CurrentUser() account: any) {
        return this.connectionRequestService.acceptRequest(id, account.sub || account._id);
    }

    @Patch(':id/reject')
    async reject(@Param('id') id: string, @CurrentUser() account: any) {
        return this.connectionRequestService.rejectRequest(id, account.sub || account._id);
    }

    @Patch(':id/cancel')
    async cancel(@Param('id') id: string, @CurrentUser() account: any) {
        return this.connectionRequestService.cancelRequest(id, account.sub || account._id);
    }
}

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
    constructor(private readonly connectionRequestsService: ConnectionRequestsService) {}

    @Get()
    async findAll(@CurrentUser() account: any) {
        return this.connectionRequestsService.getConnections(account.sub || account._id);
    }
}