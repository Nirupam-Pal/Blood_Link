import { io, Socket } from 'socket.io-client';
import { API_ROUTES } from './api-routes';
import { notificationService } from './services/notification-service';

let socket: Socket | null = null;

/**
 * Shared Socket.IO connection for chat. The token is read on every
 * (re)connect so a refreshed access token from api-client is picked up.
 */
export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(API_ROUTES.SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: (cb) => cb({ token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null }),
  });

  // The server drops sockets with an invalid/expired token and Socket.IO
  // won't auto-reconnect after a server-side disconnect. Make one cheap
  // authenticated REST call (which refreshes the token if needed) and retry.
  let retried = false;
  socket.on('disconnect', async (reason) => {
    if (reason !== 'io server disconnect' || retried) return;
    retried = true;
    try {
      await notificationService.getUnreadCount();
      socket?.connect();
    } catch {
      // Session is gone; api-client already logged the user out.
    }
  });
  socket.on('connect', () => {
    retried = false;
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
