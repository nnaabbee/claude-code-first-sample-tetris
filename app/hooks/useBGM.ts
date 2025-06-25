import { useState, useCallback, useEffect } from 'react'

export const useBGM = () => {
  const [isBGMPlaying, setIsBGMPlaying] = useState(true)
  const [bgmInterval, setBgmInterval] = useState<NodeJS.Timeout | null>(null)

  const playBGMNote = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // テトリス風のメロディー
      const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 587.33, 523.25] // C-D-E-F-G-E-D-C
      const noteIndex = Math.floor(Date.now() / 500) % melody.length

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(melody[noteIndex], audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('BGM note not supported')
    }
  }, [])

  const startBGM = useCallback(() => {
    // Stop any existing interval first
    if (bgmInterval) {
      clearInterval(bgmInterval)
      setBgmInterval(null)
    }

    // Play first note immediately
    playBGMNote()

    // Then play every 500ms
    const interval = setInterval(() => {
      playBGMNote()
    }, 500)

    setBgmInterval(interval)
  }, [playBGMNote, bgmInterval])

  const stopBGM = useCallback(() => {
    if (bgmInterval) {
      clearInterval(bgmInterval)
      setBgmInterval(null)
    }
  }, [bgmInterval])

  const toggleBGM = useCallback(() => {
    if (isBGMPlaying) {
      // Stop BGM
      stopBGM()
      setIsBGMPlaying(false)
    } else {
      // Start BGM
      setIsBGMPlaying(true)
      // Use setTimeout to ensure state is updated before starting BGM
      setTimeout(() => {
        startBGM()
      }, 50)
    }
  }, [isBGMPlaying, stopBGM, startBGM])

  // Auto-start BGM when initialized
  const initializeBGM = useCallback((isInitialized: boolean) => {
    if (isInitialized && isBGMPlaying && !bgmInterval) {
      startBGM()
    }
  }, [isBGMPlaying, bgmInterval, startBGM])

  // Clean up BGM on unmount
  useEffect(() => {
    return () => {
      stopBGM()
    }
  }, [stopBGM])

  return {
    isBGMPlaying,
    toggleBGM,
    stopBGM,
    initializeBGM
  }
}