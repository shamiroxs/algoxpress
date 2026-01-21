/**
 * Challenge definitions
 * MVP: 7-10 handcrafted Array challenges
 */ 

import type { Challenge } from './types';
import { Difficulty } from './types';
import { InstructionType } from '../instructions/types';

export const challenges: Challenge[] = [
  {
    id: 'challenge-0',
    title: 'Start Here',
    description: `Make Seat 1 match Seat 0.`,
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
        InstructionType.MOVE_RIGHT,
        InstructionType.MOVE_LEFT,
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
  },
  {
    id: 'challenge-3',
    title: 'Seat Rotation',
    description: 'All passengers move left, the first passenger goes to last seat',
    hints: ['Swap each passenger with their right neighbor, one at a time.'],
    difficulty: Difficulty.EASY,
    initialArray: [1, 2, 3, 4],
    targetArray: [2, 3, 4, 1],
    maxSteps: 15,
    instructions: [
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
      {
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
      },  
    ],    
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,

        InstructionType.SWAP_WITH_NEXT,
      ],
    },
  },
  {
    id: 'challenge-4',
    title: 'Backwards Tickets',
    description: `The compartment was filled from the wrong direction.`,
    hints: ['Reverse the order of all ticket values.'],
    difficulty: Difficulty.EASY,
    initialArray: [5, 4, 3, 2, 1],
    targetArray: [1, 2, 3, 4, 5],
    maxSteps: 13,
    initialPointers: {
      MOCO: 0,
      CHOCO: 4, // last index
    },
    instructions: [
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
  
      {
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
      },  
    ],
    
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,

        InstructionType.IF_MEET,
        InstructionType.SWAP,
      ],
    }
    
  },
  
  {
    id: 'challenge-5',
    title: 'VIP Seat',
    description: `A VIP is already seated somewhere. Seat 0 is also reserved by them.`,
    hints: ['Copy the highest ticket value into Seat 0.'
    ],
    difficulty: Difficulty.EASY,
    initialArray: [0, 7, 2, 9, 1],
    targetArray: [9, 7, 2, 9, 1],
    maxSteps: 30,
    instructions: [
      {
        id: 'pick',
        type: InstructionType.PICK,
        target: 'MOCO',
      },
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
      {
        id: 'if-less',
        type: InstructionType.IF_LESS,
        target: "MOCO",
        body: [],
      },  
      {
        id: 'if-end',
        type: InstructionType.IF_END,
        target: "MOCO",
        label: 'stop'
      },  
  
      {
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
      },  
      {
        id: 'exit-loop',
        type: InstructionType.LABEL,
        labelName: 'stop',
      },
    ],
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.SET_POINTER,
        InstructionType.PICK,
        InstructionType.PUT,

        InstructionType.IF_END,
      ],
      suggestedInstructions: [
        InstructionType.SET_POINTER,
        InstructionType.PICK,
        InstructionType.PUT,
      ],
    },
  },
  {
    id: 'challenge-6',
    title: 'Clear the Aisle',
    description: `Passengers without tickets must step aside without disturbing valid ones.`,
    hints: [
      'Move all zero values to the right end, preserving order of others.',
      'You begin with a zero in hand.'
    ],
    
    difficulty: Difficulty.MEDIUM,
    initialArray: [0, 1, 0, 3, 12, 0],
    targetArray: [1, 3, 12, 0, 0, 0],
    maxSteps: 28,
    initialHand: 0,
    instructions: [
      {
        id: 'move-right',
        type: InstructionType.MOVE_RIGHT,
        target: 'CHOCO',
      },
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
      {
        id: 'if-equal',
        type: InstructionType.IF_EQUAL,
        target: "CHOCO",
        body: [],
      },  
      {
        id: 'if-end',
        type: InstructionType.IF_END,
        target: "CHOCO",
        label: 'stop'
      },  
  
      {
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
      },  
      {
        id: 'exit-loop',
        type: InstructionType.LABEL,
        labelName: 'stop',
      },
    ],
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.MOVE_LEFT,

        InstructionType.SWAP,
      ],
      suggestedInstructions: [
        InstructionType.IF_EQUAL,
      ],
    }
  },
  {
    id: 'challenge-7',
    title: 'Inspection Check',
    description: `An inspector checks ticket order before departure.`,
    hints: ['Set Seat 0 to 0 if the remaining seats are NOT increasing order',
      'Otherwise, no change needed (Seat 0 starts as 1)',
    ],
    difficulty: Difficulty.MEDIUM,
    initialArray: [1, 3, 5, 7, 6],
    targetArray: [0, 3, 5, 7, 6],
    maxSteps: 26,
    instructions: [
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
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
        id: 'if-end',
        type: InstructionType.IF_END,
        target: "MOCO",
        label: 'stop'
      },  
      {
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
      },  
      {
        id: 'exit-loop',
        type: InstructionType.LABEL,
        labelName: 'stop',
      },
    ],
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO'],
      allowedInstructions: [
        InstructionType.SET_POINTER,
        InstructionType.SET_VALUE,
  
        InstructionType.IF_GREATER,
        InstructionType.IF_LESS,
  
        InstructionType.JUMP,
        InstructionType.LABEL,
      ],
    },
  },  
  {
    id: 'challenge-8',
    title: 'Duplicate Ticket',
    description: 'Only one ticket per passenger is allowed.',
    hints: ['If any duplicate ticket exists, copy that value into Seat 0.'],
    difficulty: Difficulty.MEDIUM,
    initialArray: [1, 3, 4, 2, 2],
    targetArray: [2, 3, 4, 2, 2],
    maxSteps: 25,
    instructions: [],
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.MOVE_TO_END,
        InstructionType.SET_POINTER,
        InstructionType.PICK,
        InstructionType.PUT,

        InstructionType.IF_GREATER,
        InstructionType.IF_LESS,
        InstructionType.IF_EQUAL,
        InstructionType.IF_END,

        InstructionType.JUMP,
        InstructionType.LABEL,
        InstructionType.WAIT,
      ],
      suggestedInstructions: [
        InstructionType.IF_LESS,
        InstructionType.IF_EQUAL,
      ],
    }
  },
];

