// ~/composables/useShipokNotification.js
import { ref } from 'vue';
import { useSpeechNotification } from '~/composables/useSpeechNotification';

export const useShipokNotification = () => {
  const latestNotification = ref(null);
  const { playNotification } = useSpeechNotification();

  const { $socket } = useNuxtApp();

  if ($socket) {
    $socket.on('shipok_notification', (data) => {
      latestNotification.value = data;
      setTimeout(() => {
        
      playNotification(data);
      },2000)
    });
  }

  return { latestNotification };
};
