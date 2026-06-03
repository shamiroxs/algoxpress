// src/audio/soundManager.ts

class SoundManager {
    private sounds: Record<string, HTMLAudioElement> = {}
  
    register(name: string, src: string) {
      const audio = new Audio(src)
      audio.preload = 'auto'
  
      this.sounds[name] = audio
    }
  
    play(name: string, playbackRate=1) {
      const audio = this.sounds[name]
  
      if (!audio) return
  
      audio.pause()
      audio.currentTime = 0

      audio.playbackRate = playbackRate

  
      // avoid unhandled promise errors
      audio.play().catch(() => {})
    }

    stopAll() {
      Object.values(this.sounds).forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }
  
  export const soundManager = new SoundManager()