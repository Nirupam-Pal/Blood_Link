import { Module } from '@nestjs/common';
import { ConnectionRequestsController, ConnectionsController } from './connection-requests.controller';
import { ConnectionRequestsService } from './connection-requests.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionRequest, ConnectionRequestSchema } from './schemas/connection-request.schema';
import { Connection, ConnectionSchema } from './schemas/connection.schema';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatModule } from '../chat/chat.module';
import { ConnectionRequestRepository } from './repositories/connection-request.repository';
import { ConnectionRepository } from './repositories/connection.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConnectionRequest.name, schema: ConnectionRequestSchema },
      { name: Connection.name, schema: ConnectionSchema },
    ]),
    UsersModule,
    NotificationsModule,
    ChatModule
  ],
  controllers: [ConnectionRequestsController, ConnectionsController],
  providers: [ConnectionRequestsService, ConnectionRequestRepository, ConnectionRepository],
  exports: [ConnectionRepository]
})
export class ConnectionRequestsModule {}
