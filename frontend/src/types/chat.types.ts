import { PublicUser } from './connection.types';

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participantIds: (PublicUser | null)[];
  connectionId: string;
  lastMessageId?: ChatMessage | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}
