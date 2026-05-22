/**
 * Global sound manager
 */

import stepMp3 from '../assets/sounds/step.mp3';
import swapMp3 from '../assets/sounds/swap.mp3';
import conditionsMp3 from '../assets/sounds/conditions.mp3';
import handMp3 from '../assets/sounds/hand.mp3';
import errorMp3 from '../assets/sounds/error.mp3';
import successMp3 from '../assets/sounds/success.mp3';

type SoundKey =
  | 'step'
  | 'swap'
  | 'condition'
  | 'hand'
  | 'error'
  | 'success';

const sounds: Record<SoundKey, HTMLAudioElement> = {
  step: new Audio(stepMp3),
  swap: new Audio(swapMp3),
  condition: new Audio(conditionsMp3),
  hand: new Audio(handMp3),
  error: new Audio(errorMp3),
  success: new Audio(successMp3),
};

let currentExecutionSpeed = 1;

/**
 * Called whenever execution speed changes
 */
export function setSoundExecutionSpeed(speed: 1 | 2 | 4) {
  currentExecutionSpeed = speed;

  // Faster playback for gameplay sounds
  sounds.step.playbackRate = speed;
  sounds.swap.playbackRate = speed;
  sounds.condition.playbackRate = speed;
  sounds.hand.playbackRate = speed;

  // Keep these cinematic
  sounds.error.playbackRate = 1;
  sounds.success.playbackRate = 1;
}

export function playSound(sound: SoundKey) {
  const audio = sounds[sound];

  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.play();
  } catch {
    // ignore autoplay errors
  }
}

setSoundExecutionSpeed(1);