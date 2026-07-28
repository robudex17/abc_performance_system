<template>
  <transition name="fade">
    <div v-if="notification" class="notification-card">
      <div class="card-content">
        <img 
          v-if="notification.photo" 
          :src="notification.photo" 
          alt="Agent Photo" 
          class="agent-photo"
        />
        <div class="text">
          <h2 class="agent-name">{{ notification.dbname }}</h2>

          <div v-if="notification.image_link" class="image-wrapper">
            <img 
              :src="updateImageLink(notification.image_link)" 
              alt="Celebration Image"
              class="celebration-image"
            />
          </div>

          <p class="message">{{ notification.message }}</p>
          <p class="count">🎯 ShipOK: {{ notification.shipok_count }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const config = useRuntimeConfig()

const updateImageLink = (imageLink) => {
  return `${config.public.imageBaseUrl}${imageLink}`
}
</script>

<style scoped>
/* Overlay Card */
.notification-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  padding: 2rem 3rem;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  color: white;
  z-index: 9999;
  min-width: 380px;
  max-width: 520px;
  text-align: center;
  overflow: hidden;
  animation: pop-in 0.4s ease-out;
}

/* Content */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.agent-photo {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid white;
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

/* Agent Name */
.text .agent-name {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

/* Celebration Image */
.image-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.8rem;
}

.celebration-image {
  width: 120px;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  transition: transform 0.3s;
}

.celebration-image:hover {
  transform: scale(1.05);
}

/* Texts */
.text .message {
  font-size: 1.2rem;
  margin-bottom: 0.4rem;
  font-weight: 500;
}

.text .count {
  font-size: 1.1rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  display: inline-block;
  margin-top: 0.4rem;
}

/* Fade-in/out animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slight scale pop animation */
@keyframes pop-in {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
</style>
