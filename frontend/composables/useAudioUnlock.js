// ~/composables/useAudioUnlock.js
export const useAudioUnlock = () => {
  const unlocked = ref(false)
  
  const unlockAudio = () => {
    if (unlocked.value) return
    const testAudio = new Audio('/applause-8.mp3')
    testAudio.play().catch(() => {
      // may fail, but unlock happens
    }).finally(() => {
      testAudio.pause()
      testAudio.currentTime = 0
      unlocked.value = true
      window.removeEventListener('click', unlockAudio)
    })
  }

  // Listen for first click anywhere
  window.addEventListener('click', unlockAudio)
  return { unlocked }
}
