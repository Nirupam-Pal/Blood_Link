export type NotificationType =
  | 'CONNECTION_REQUEST_RECEIVED'
  | 'CONNECTION_REQUEST_ACCEPTED'
  | 'CONNECTION_REQUEST_REJECTED'
  | 'NEW_MESSAGE'
  | 'SYSTEM_NOTIFICATION';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
