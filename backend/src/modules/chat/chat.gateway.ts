import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService,
    ) {}

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if(!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            client.data.user = payload;
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Cleanup presence if needed
    }

    @SubscribeMessage('conversation:join')
    async handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
        client.join(data.conversationId);
    }

    @SubscribeMessage('message:send')
    async handleMessageSend(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; receiverId: string; content: string },
    ) {
        const userId = client.data.user?.sub || client.data.user?._id;
        if(!userId) return;

        const message = await this.chatService.saveMessage(data.conversationId, userId, data.receiverId, data.content);

        this.server.to(data.conversationId).emit('message:new', message);
    }
}