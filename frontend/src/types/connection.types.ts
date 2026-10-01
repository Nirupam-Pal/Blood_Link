export type ConnectionRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

// Public profile fields the backend populates on requests, connections and conversations.
export interface PublicUser {
  _id: string;
  fullName?: string;
  email?: string;
  bloodGroup?: string;
  city?: string;
  subDivision?: string;
  district?: string;
  role?: string;
}

export interface ConnectionRequest {
  _id: string;
  // Populated with the other party's profile (or null if that account was removed)
  senderId: PublicUser | string | null;
  receiverId: PublicUser | string | null;
  status: ConnectionRequestStatus;
  message?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  _id: string;
  userId: PublicUser | null;
  donorId: PublicUser | null;
  connectionRequestId: string;
  connectedAt: string;
  lastInteractionAt: string;
}

export interface CreateConnectionRequestDto {
  donorId: string;
  message?: string;
}

export interface AcceptConnectionResponse {
  connection: Connection;
  conversationId: string;
}
