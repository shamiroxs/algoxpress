import { arrayChallenges } from './arrayChallenges';
import { linkedChallenges } from './linkedChallenges';
import { treeChallenges } from './treeChallenges';

import type { Challenge } from './types';

export const challengesByTrain: Record<string, Challenge[]> = {
  'array-train': arrayChallenges,
  'linked-train': linkedChallenges,
  'tree-train': treeChallenges,
};