// ~/plugins/socket.client.js
import { io } from 'socket.io-client';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const socket = io(config.public.socketUrl, {
    transports: ['websocket'],
  });

  // Optionally handle connection events
  socket.on('connect', () => console.log('✅ Connected to Socket.IO server'));
  socket.on('disconnect', () => console.warn('❌ Disconnected from Socket.IO'));

  // Provide globally
  nuxtApp.provide('socket', socket);
});
