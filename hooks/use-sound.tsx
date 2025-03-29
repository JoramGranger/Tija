"use client"

import { useEffect, useState } from "react"

export function useSound() {
  const [isMounted, setIsMounted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if user has previously muted sounds
    const savedMuteState = localStorage.getItem("triviaAppMuted")
    if (savedMuteState) {
      setIsMuted(savedMuteState === "true")
    }
  }, [])

  const toggleMute = () => {
    const newMuteState = !isMuted
    setIsMuted(newMuteState)
    localStorage.setItem("triviaAppMuted", String(newMuteState))
  }

  // Instead of trying to play actual sound files, we'll use the Web Audio API
  // to generate simple sounds programmatically
  const playSound = (type: "click" | "correct" | "incorrect" | "success") => {
    if (!isMounted || isMuted) return
    if (typeof window === "undefined" || !window.AudioContext) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configure sound based on type
      switch (type) {
        case "click":
          oscillator.type = "sine"
          oscillator.frequency.value = 800
          gainNode.gain.value = 0.1
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
          setTimeout(() => oscillator.stop(), 100)
          break

        case "correct":
          oscillator.type = "sine"
          oscillator.frequency.value = 800
          gainNode.gain.value = 0.1
          oscillator.start()
          setTimeout(() => {
            oscillator.frequency.value = 1200
          }, 100)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
          setTimeout(() => oscillator.stop(), 300)
          break

        case "incorrect":
          oscillator.type = "sawtooth"
          oscillator.frequency.value = 300
          gainNode.gain.value = 0.1
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
          setTimeout(() => oscillator.stop(), 300)
          break

        case "success":
          oscillator.type = "sine"
          oscillator.frequency.value = 600
          gainNode.gain.value = 0.1
          oscillator.start()

          // Play a little melody
          setTimeout(() => (oscillator.frequency.value = 800), 100)
          setTimeout(() => (oscillator.frequency.value = 1000), 200)
          setTimeout(() => (oscillator.frequency.value = 1200), 300)

          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)
          setTimeout(() => oscillator.stop(), 500)
          break
      }
    } catch (error) {
      console.error("Failed to play sound:", error)
    }
  }

  const playButtonClick = () => playSound("click")
  const playCorrect = () => playSound("correct")
  const playIncorrect = () => playSound("incorrect")
  const playSuccess = () => playSound("success")

  return {
    isMuted,
    toggleMute,
    playButtonClick,
    playCorrect,
    playIncorrect,
    playSuccess,
  }
}

