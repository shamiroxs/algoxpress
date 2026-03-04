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
    title: 'Group Boarding',
    description: `Even tickets must board before odd tickets.`,
    hints: ['Move even tickets numbers left', 'Move odd tickets numbers right.'],
    difficulty: Difficulty.EASY,
    initialArray: [1, 2, 3, 4, 5, 6],
    targetArray: [2, 4, 6, 1, 5, 3],
    maxSteps: 37,
    clipboard: false,
    instructions: [
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
      {
        id: 'if-even',
        type: InstructionType.IF_EVEN,
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
        InstructionType.SWAP,
      ],
    },
  },
  {
    id: 'challenge-5',
    title: 'Penalty Boarding',
    description: `Passengers with penalty tickets (negative) must board before regular ones.`,
    hints: [
      'Move all negative values to the left end, preserving relative order of others.',
      'You begin with a zero in clipboard.'
    ],
    difficulty: Difficulty.EASY,
    initialArray: [1, -2, 3, -4, 5, -6],
    targetArray: [-2, -4, -6, 1, 5, 3],
    maxSteps: 31,
    initialHand: 0,
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
        InstructionType.MOVE_RIGHT,
        InstructionType.SWAP,
        InstructionType.IF_LESS
      ],
      suggestedInstructions: [
        InstructionType.IF_GREATER,
      ],
    }
  },
  {
    id: 'challenge-6',
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
      {
        id: 'loop-exit',
        type: InstructionType.LABEL,
        labelName: 'exit',
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
    id: 'challenge-7',
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
    id: 'challenge-8',
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
        InstructionType.IF_GREATER,
        InstructionType.IF_EQUAL,
      ],
    }
  },
  {
    id: 'challenge-9',
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
        InstructionType.SET_VALUE,
  
        InstructionType.JUMP,
        InstructionType.LABEL,
      ],
    },
  },  
  {
    id: 'challenge-10',
    title: 'Clear the Aisle',
    description: `Passengers without tickets must step aside without disturbing valid ones.`,
    hints: [
      'Move all zero values to the right end, preserving order of others.',
      'You begin with a zero in clipboard.'
    ],
    
    difficulty: Difficulty.HARD,
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
    id: 'challenge-11',
    title: 'Ticket Classes',
    description: `Passengers of classes: 0 = Economy, 1 = Business, 2 = First Class. 
    Board them in order.`,
    hints: [
      'All 0`s at first, then 1`s and then 2`s',
      'You begin with a 1 in clipboard.',
    ],
    difficulty: Difficulty.HARD,
    initialArray: [2, 0, 2, 1, 1, 0],
    targetArray: [0, 0, 1, 1, 2, 2],
    maxSteps: 40,
    initialHand: 1,
    initialPointers: {
      MOCO: 0,   // left boundary (next 0 slot)
      LOCO: 0,   // current scanner
      CHOCO: 5,  // right boundary (next 2 slot)
    },
    instructions: [
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
      {
        id: 'if-less',
        type: InstructionType.IF_LESS,
        target: 'LOCO', 
        body: [],
      },
      {
        id: 'if-equal',
        type: InstructionType.IF_EQUAL,
        target: 'LOCO',
        body: [],
      },
      {
        id: 'if-great',
        type: InstructionType.IF_GREATER,
        target: 'LOCO',
        body: [],
      },
      {
        id: 'if-meet',
        type: InstructionType.IF_MEET,
        label: 'exit'
      },
      {
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
      },
      {
        id: 'loop-exit',
        type: InstructionType.LABEL,
        labelName: 'exit',
      },
    ],
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO', 'LOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
  
        InstructionType.SWAP_WITH,
      ],
      suggestedInstructions: [
        InstructionType.SWAP,
      ],
    },
  },
  {
    id: 'challenge-12',
    title: 'Alternate Boarding',
    description: `Tickets are sorted. Board the highest and lowest alternatingly.`,
    hints: [
      'Rearrange so seats alternate: max, min, second max, second min...',
      'MOCO starts at the left (min), CHOCO starts at the right (max).',
      'LOCO writes to a new position each step.',
    ],
    difficulty: Difficulty.HARD,
    initialArray: [1, 2, 3, 4, 5, 6],
    targetArray: [6, 1, 5, 2, 4, 3],
    extraArray: [1, 2, 3, 4, 5, 6],
    maxSteps: 30,
    initialPointers: {
      MOCO: 0,   // left pointer (min side)
      CHOCO: 5,  // right pointer (max side)
      LOCO: 0,   // write head
    },
    instructions: [
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
      },
      {
        id: 'move-left',
        type: InstructionType.MOVE_LEFT,
        target: 'CHOCO',
      }, 
      {
        id: 'move-right-loco',
        type: InstructionType.MOVE_RIGHT,
        target: 'LOCO',
      }, 
      {
        id: 'move-right',
        type: InstructionType.MOVE_RIGHT,
        target: 'MOCO',
      }, 
      {
        id: 'move-right-loco2',
        type: InstructionType.MOVE_RIGHT,
        target: 'LOCO',
      }, 
      {
        id: 'jump-loop',
        type: InstructionType.JUMP,
        label: 'loop',
      },
    ],
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO', 'LOCO'],
      allowedInstructions: [
        InstructionType.PICK,
        InstructionType.PUT,
      ],
      suggestedInstructions: [
        InstructionType.SWAP_WITH,
        InstructionType.IF_MEET,
      ],
    },
  },
  {
    id: 'challenge-13',
    title: 'Boarding Order',
    description: `The conductor mixed up the boarding sequence. Restore it to the next permutation.`,
    hints: [
      'Find the rightmost position where a value is smaller than its right neighbor (the "pivot").',
      'Find the smallest value to the right of the pivot that is still larger than it.',
      'Swap the pivot with that value, then reverse the suffix to the right of the pivot position.',
    ],// HERE add a detailed explaination with 3 element example.
    difficulty: Difficulty.HARD,
    initialArray: [2, 1, 5, 4, 3, 0, 0],
    targetArray: [2, 3, 0, 0, 1, 4, 5],
    maxSteps: 60,
    initialPointers: {
      MOCO: 5,   // scans for pivot from right
      CHOCO: 6,  // scans for swap candidate / reversal right end
    },
    instructions: [
      {
        id: 'loop1-start',
        type: InstructionType.LABEL,
        labelName: 'loop1',
      },
      {
        id: 'pick-compare',
        type: InstructionType.PICK,
        target: 'MOCO',
      },
      {
        id: 'if-less-moco',
        type: InstructionType.IF_LESS,
        target: 'MOCO',
        body: [
          {
            id: 'jump-pivot',
            type: InstructionType.JUMP,
            label: 'pivot',
          },
        ],
      },
      {
        id: 'jump-loop1',
        type: InstructionType.JUMP,
        label: 'loop1',
      },
      {
        id: 'pivot-label',
        type: InstructionType.LABEL,
        labelName: 'pivot',
      },
      {
        id: 'pick-pivot',
        type: InstructionType.PICK,
        target: 'MOCO',
      },
      {
        id: 'loop2-start',
        type: InstructionType.LABEL,
        labelName: 'loop2',
      },
      {
        id: 'if-greater-choco',
        type: InstructionType.IF_GREATER,
        target: 'CHOCO',
        body: [
          {
            id: 'jump-backward',
            type: InstructionType.JUMP,
            label: 'backward',
          },
        ],
      },
      {
        id: 'jump-loop2',
        type: InstructionType.JUMP,
        label: 'loop2',
      },
      {
        id: 'backward-label',
        type: InstructionType.LABEL,
        labelName: 'backward',
      },
      //
      {
        id: 'to-end',
        type: InstructionType.SET_POINTER,
        target: 'CHOCO',
        index: 6,
      },
      {
        id: 'loop3-start',
        type: InstructionType.LABEL,
        labelName: 'loop3',
      },
      {
        id: 'if-meet-exit',
        type: InstructionType.IF_MEET,
        label: 'exit',
      },
      {
        id: 'jump-loop3',
        type: InstructionType.JUMP,
        label: 'loop3',
      },
      {
        id: 'loop-exit',
        type: InstructionType.LABEL,
        labelName: 'exit',
      },
    ],
    unlocked: true,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_LEFT,
        InstructionType.MOVE_RIGHT,
        InstructionType.SWAP,

        //move choco to end
      ],
    },
  },
];

/*
------------------------------
------------------------------
------------------------------
------------------------------
Next Permutation (In-Place)

Problem:
Rearrange numbers into lexicographically next greater permutation.

Input:
[1, 2, 3]

Output:
[1, 3, 2]

1 2 3
1 3 2
2 1 3
2 3 1
3 1 2
3 2 1 
Another example:

Input:
[2, 1, 5, 4, 3, 0, 0]

Output:
[2, 3, 0, 0, 1, 4, 5]
------------------------------
Wiggle Sort

Problem:
Rearrange array such that:

arr[0] < arr[1] > arr[2] < arr[3] > arr[4] ...

Input:
[3, 5, 2, 1, 6, 4]

Output (one valid):
[3, 5, 1, 6, 2, 4]
------------------------------
Rearrange So Largest Element Moves to End (Single Pass Bubble Step)

Input:
[4, 2, 7, 1, 3]

Output (after one pass):
[2, 4, 1, 3, 7]
------------------------------
????
Rearrange in Zig-Zag Fashion

Condition:
a < b > c < d > e

Input:
[4,3,7,8,6,2,1]

Output:
[3,7,4,8,2,6,1]
------------------------------
???
In-Place Merge of Two Sorted Halves (Same Array)

Problem:
Array has two sorted halves. Merge them in-place.

Input:
[1,3,5,7, 2,4,6,8]

Output:
[1,2,3,4,5,6,7,8]
------------------------------
Rearrange So No Element Equals Average of Neighbors

Input:
[1,2,3,4,5]

Output (one valid):
[1,3,2,5,4]
------------------------------
------------------------------
#add index feature
------------------------------
Rearrange So That arr[i] = i (If Possible)

Problem:
Rearrange array so that value at index i becomes i, otherwise -1.

Input:
[-1, -1, 2, 1, -1, 5]

Output:
[-1, 1, 2, -1, -1, 5]

(Use swapping until correct position.)
------------------------------
Cyclic Sort (1 to N numbers)

Problem:
Array contains numbers from 1 to N. Place each number at correct index.

Input:
[3, 1, 5, 4, 2]

Output:
[1, 2, 3, 4, 5]
------------------------------
Find First Missing Positive (Rearrangement Based)

Problem:
Rearrange so each positive number is placed at index value-1.

Input:
[3, 4, -1, 1]

Output (after rearrangement):
[1, -1, 3, 4]
------------------------------
Rearrange Such That arr[i] = arr[arr[i]]

Problem:
Modify array so that each element becomes value at its index.

Input:
[3, 2, 0, 1]

Output:
[1, 0, 3, 2]

(Must be done in-place without extra array.)
------------------------------
------------------------------
------------------------------
------------------------------
*/
