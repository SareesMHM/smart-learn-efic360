import { io } from 'socket.io-client';

export const makeChatSocket = () => {
  const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  return io(url, {
    path: '/socket.io',
    transports: ['websocket'],
    withCredentials: true,
    auth: { token },
  });
};
