import { HttpException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { JwtPayload } from "../../common/types";

// CORS for the socket server is configured from CORS_ORIGINS in main.ts (CorsIoAdapter)
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
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
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
            client.data.userId = String(payload.sub);
        } catch {
            client.disconnect();
        }
    }

    @SubscribeMessage('conversation:join')
    async handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
        const userId = this.getUserId(client);
        await this.run(() => this.chatService.getConversationForParticipant(data?.conversationId, userId));
        await client.join(data.conversationId);
        return { ok: true };
    }

    @SubscribeMessage('message:send')
    async handleMessageSend(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; content: string },
    ) {
        const userId = this.getUserId(client);
        const message = await this.run(() => this.chatService.saveMessage(data?.conversationId, userId, data?.content));

        this.server.to(data.conversationId).emit('message:new', message);
        return message;
    }

    private getUserId(client: Socket): string {
        const userId = client.data.userId as string | undefined;
        if (!userId) {
            throw new WsException('Unauthorized');
        }
        return userId;
    }

    /** Converts HTTP exceptions from the service layer into WsExceptions so the client gets the real message. */
    private async run<T>(fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (error instanceof HttpException) {
                throw new WsException(error.message);
            }
            throw error;
        }
    }
}
