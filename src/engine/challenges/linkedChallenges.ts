import type { Challenge } from './types';
//import { Difficulty } from './types';
//import { InstructionType } from '../instructions/types';

export const linkedChallenges: Challenge[] = [
  /*
    {
        id: 'challenge-0',
        title: 'Start Here',
        description: `Copy the value in first box to the second box`,
        hints: ['Copy the ticket value from Seat 0 into Seat 1.'],
        difficulty: Difficulty.EASY,
        initialArray: [7, 0, 0, 0],
        targetArray: [7, 7, 0, 0],
        maxSteps: 3,
        instructions: [],
        unlocked: true,
        capabilities: {
          allowedPointers: ['MOCO'],
          allowedInstructions: [
            InstructionType.MOVE_LEFT,
            InstructionType.MOVE_RIGHT,
            InstructionType.PICK,
            InstructionType.PUT,
          ],
          suggestedInstructions: [
            InstructionType.PICK,
            InstructionType.MOVE_RIGHT,
            InstructionType.PUT,
          ],
        },
      },
      {
        id: 'challenge-1',
        title: 'End-Seat Correction',
        description: 'Tickets were assigned to the wrong ends of the compartment.',
        hints: ['Swap the values in the first and last seats.'],
        difficulty: Difficulty.EASY,
        initialArray: [10, 20, 30, 40, 50],
        targetArray: [50, 20, 30, 40, 10],
        maxSteps: 2,
        instructions: [],
        unlocked: true,
        capabilities: {
          allowedPointers: ['MOCO', 'CHOCO'],
          allowedInstructions: [
            InstructionType.MOVE_RIGHT,
            InstructionType.MOVE_TO_END,
            InstructionType.SWAP,
          ],
        }
      },
      {
        id: 'challenge-2',
        title: 'Ticket Challenge',
        description: `Seat 1 challenges Seat 0. Higher ticket wins.`,
        hints: ['Compare the tickets in Seat 0 and Seat 1. Keep the higher value in Seat 0.'],
        difficulty: Difficulty.EASY,
        initialArray: [4, 9, 6, 2],
        targetArray: [9, 9, 6, 2],
        maxSteps: 7,
        instructions: [
          {
            id: 'pick',
            type: InstructionType.PICK,
            target: 'MOCO',
          },
          {
            id: 'move-right',
            type: InstructionType.MOVE_RIGHT,
            target: 'MOCO',
          },
          {
            id: 'move-left',
            type: InstructionType.MOVE_LEFT,
            target: 'MOCO',
          },
          {
            id: 'put',
            type: InstructionType.PUT,
            target: 'MOCO',
          },
        ],
        unlocked: true,
        capabilities: {
          allowedPointers: ['MOCO'],
          allowedInstructions: [
            InstructionType.PICK,
            InstructionType.PUT,
    
            InstructionType.IF_GREATER,
            InstructionType.IF_LESS,
    
          ],
          suggestedInstructions: [
            InstructionType.PICK,
            InstructionType.PUT,
          ],
        },
      },*/
];