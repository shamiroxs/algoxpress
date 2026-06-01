import type { Challenge } from "./types";
import { Difficulty } from "./types";

export function getSpeedLimit(challenge: Challenge): number {
  if (challenge.starRequirements?.speedSeconds) {
    return challenge.starRequirements.speedSeconds;
  }

  switch (challenge.difficulty) {
    case Difficulty.EASY:
      return 80;

    case Difficulty.MEDIUM:
      return 200;

    case Difficulty.HARD:
      return 900;
  }
}
