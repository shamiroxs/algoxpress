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
    description: `Copy the first value into the second box`,
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
        id: 'swap',
        type: InstructionType.SWAP,
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
      ],
    }
    
  },
  
  {
    id: 'challenge-5',
    title: 'VIP Seat',
    description: `A VIP is already seated somewhere. Seat 0 is also reserved by them.`,
    hints: ['Copy the highest ticket value into Seat 0.'
    ],
    difficulty: Difficulty.MEDIUM,
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
        id: 'move-right',
        type: InstructionType.MOVE_RIGHT,
        target: 'MOCO',
      },
      {
        id: 'if-less',
        type: InstructionType.IF_LESS,
        target: "MOCO",
        body: [],
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
        InstructionType.SET_POINTER,
        InstructionType.PICK,
        InstructionType.PUT,
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
    title: 'Duplicate Ticket',
    description: 'Only one ticket per passenger is allowed.',
    hints: ['If any duplicate ticket exists, copy that value into Seat 0.', 'Assume no passenger at seat 0'],
    difficulty: Difficulty.MEDIUM,
    initialArray: [0, 3, 4, 2, 2],
    targetArray: [2, 3, 4, 2, 2],
    maxSteps: 23,
    initialPointers: {
      MOCO: 1,
    },
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
        id: 'if-equal',
        type: InstructionType.IF_EQUAL,
        target: "MOCO",
        body: [],
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
        
        InstructionType.SET_POINTER,

        InstructionType.PICK,
        InstructionType.PUT,

        InstructionType.JUMP,
        InstructionType.LABEL,
      ],
      suggestedInstructions: [
        InstructionType.IF_LESS,
        InstructionType.IF_EQUAL,
      ],
    }
  },
  {
    id: 'challenge-7',
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
    initialPointers: {
      MOCO: 0,
      CHOCO: 1, 
    },
    instructions: [
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
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
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
    id: 'challenge-8',
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
        id: 'if-great',
        type: InstructionType.IF_GREATER,
        target: "MOCO",
        body: [],
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
        InstructionType.SET_POINTER,
        InstructionType.SET_VALUE,
  
        InstructionType.JUMP,
        InstructionType.LABEL,
      ],
    },
  },  
  // New challenges based on classic two-pointer problems
  
  {
    id: 'challenge-9',
    title: '3Sum',
    description: 'Find all unique triplets whose sum equals zero.',
    hints: [
      'First sort the array.',
      'Fix one element and use two pointers for the rest.',
      // 'Target sum = 0'
    ],
    difficulty: Difficulty.HARD,
    initialArray: [-1, 0, 1, 2, -1, -4],
    targetArray: [-4, -1, -1, 0, 1, 2], // Sorted first, then find triplets
    maxSteps: 50,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.PICK,
        InstructionType.PUT,
        InstructionType.SWAP,
        InstructionType.IF_GREATER,
        InstructionType.IF_LESS,
        InstructionType.IF_EQUAL,
      ],
    },
  },

  {
    id: 'challenge-10',
    title: 'Container With Most Water',
    description: 'Find the maximum area of water a container can store.',
    hints: [
      'Start from both ends of the compartment.',
      'Move the pointer with the smaller height inward.',
      // 'Input: [1, 8, 6, 2, 5, 4, 8, 3, 7]',
      // 'Output: 49'
    ],
    difficulty: Difficulty.HARD,
    initialArray: [1, 8, 6, 2, 5, 4, 8, 3, 7],
    targetArray: [49, 8, 6, 2, 5, 4, 8, 3, 7], // Store result in first position
    maxSteps: 40,
    initialPointers: {
      MOCO: 0,
      CHOCO: 8,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.IF_GREATER,
        InstructionType.IF_LESS,
        InstructionType.IF_MEET,
      ],
    },
  },

  {
    id: 'challenge-11',
    title: 'Sort Colors',
    description: 'Sort passengers by ticket class: 0, 1, and 2 only.',
    hints: [
      'Use three pointers: low, mid, high.',
      'Single pass through the compartment.',
      'Dutch National Flag algorithm.',
    ],
    difficulty: Difficulty.HARD,
    initialArray: [2, 0, 2, 1, 1, 0],
    targetArray: [0, 0, 1, 1, 2, 2],
    maxSteps: 35,
    initialPointers: {
      MOCO: 0,
      CHOCO: 5,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.SWAP,
        InstructionType.IF_EQUAL,
        InstructionType.IF_GREATER,
        InstructionType.IF_LESS,
      ],
    },
  },

  {
    id: 'challenge-12',
    title: 'Longest Valid Window',
    description: 'Find the length of the longest subarray with sum not exceeding the limit.',
    hints: [
      'Expand right pointer to include more seats.',
      'Shrink left when sum exceeds limit.',
      // 'k = 14',
      // 'Expected length: 4'
    ],
    difficulty: Difficulty.MEDIUM,
    initialArray: [2, 5, 1, 7, 10],
    targetArray: [4, 5, 1, 7, 10], // Store result (length=4) in first position
    maxSteps: 30,
    initialPointers: {
      MOCO: 0,
      CHOCO: 0,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.MOVE_LEFT,
        InstructionType.IF_GREATER,
        InstructionType.PICK,
        InstructionType.PUT,
      ],
    },
  },

  {
    id: 'challenge-13',
    title: 'Remove Duplicates II',
    description: 'Each ticket value can appear at most twice.',
    hints: [
      'Allow each element to appear at most twice.',
      'Maintain order of remaining elements.',
      'Array is sorted.',
    ],
    difficulty: Difficulty.MEDIUM,
    initialArray: [0, 0, 1, 1, 1, 1, 2, 3, 3],
    targetArray: [0, 0, 1, 1, 2, 3, 3, 0, 0], // Modified array with duplicates removed
    maxSteps: 30,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.PICK,
        InstructionType.PUT,
        InstructionType.IF_EQUAL,
        InstructionType.SWAP,
      ],
    },
  },

  {
    id: 'challenge-14',
    title: 'Minimum Window Size',
    description: 'Find the minimum length subarray with sum meeting the target.',
    hints: [
      'Use two pointers to track window.',
      'Expand until sum >= target.',
      'Shrink to find minimum.',
      // 'Target = 7'
    ],
    difficulty: Difficulty.HARD,
    initialArray: [2, 3, 1, 2, 4, 3],
    targetArray: [2, 3, 1, 2, 4, 3], // Store result (length=2) in first position
    maxSteps: 35,
    initialPointers: {
      MOCO: 0,
      CHOCO: 0,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.MOVE_LEFT,
        InstructionType.IF_GREATER,
        InstructionType.PICK,
        InstructionType.PUT,
      ],
    },
  },

  {
    id: 'challenge-15',
    title: 'Squared and Sorted',
    description: 'Return sorted array of squares of each ticket value.',
    hints: [
      'Array contains negative and positive values.',
      'Compare absolute values from both ends.',
      'Fill result from the back.',
    ],
    difficulty: Difficulty.MEDIUM,
    initialArray: [-7, -3, 2, 3, 11],
    targetArray: [4, 9, 9, 49, 121],
    maxSteps: 30,
    initialPointers: {
      MOCO: 0,
      CHOCO: 4,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.PICK,
        InstructionType.PUT,
        InstructionType.IF_GREATER,
        InstructionType.IF_LESS,
      ],
    },
  },

  {
    id: 'challenge-16',
    title: 'Trapping Rain Water',
    description: 'Calculate total water trapped between ticket holders.',
    hints: [
      'Use two pointers from both ends.',
      'Track leftMax and rightMax heights.',
      'Move the pointer with smaller height.',
      'Water trapped = min(leftMax, rightMax) - current height.',
    ],
    difficulty: Difficulty.HARD,
    initialArray: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
    targetArray: [6, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], // Store result (6) in first position
    maxSteps: 60,
    initialPointers: {
      MOCO: 0,
      CHOCO: 11,
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
    unlocked: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.IF_GREATER,
        InstructionType.IF_LESS,
        InstructionType.PICK,
        InstructionType.PUT,
        InstructionType.IF_MEET,
      ],
    },
  },
  
];

