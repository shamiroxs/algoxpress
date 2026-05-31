/**
 * Challenge definitions
 * MVP: 7-10 handcrafted Array challenges
 */ 

import type { Challenge } from './types';
import { Difficulty } from './types';
import { InstructionType } from '../instructions/types';
import { ConceptTag } from './types';
import { AlgorithmPattern } from './types';

export const arrayChallenges: Challenge[] = [
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
    concepts: [
      ConceptTag.COPY,
      ConceptTag.POINTER_MOVEMENT,
    ],
    
    learningObjectives: [
      'Understand picking and placing values',
      'Understand moving between array positions',
    ],
    
    pattern: AlgorithmPattern.SEQUENTIAL,
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
    clipboard: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.MOVE_TO_END,
        InstructionType.SWAP,
      ],
    },
    concepts: [
      ConceptTag.SWAP,
      ConceptTag.TWO_POINTERS,
    ],
    
    learningObjectives: [
      'Learn swapping values',
      'Understand operating on distant positions',
    ],
    
    pattern: AlgorithmPattern.TWO_POINTER,
  },
  {
    id: 'challenge-2',
    title: 'Seat Rotation',
    description: 'All passengers move left, the first passenger goes to last seat',
    hints: ['Swap each passenger with their right neighbor, one at a time.'],
    difficulty: Difficulty.EASY,
    initialArray: [1, 2, 3, 4],
    targetArray: [2, 3, 4, 1],
    maxSteps: 15,
    starRequirements: {
      speedSeconds: 60,
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
    clipboard: false,
    capabilities: {
      allowedPointers: ['MOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,

        InstructionType.SWAP_WITH_NEXT,
      ],
    },
    concepts: [
      ConceptTag.SWAP,
      ConceptTag.TWO_POINTERS,
    ],
    
    learningObjectives: [
      'Learn swapping values',
      'Understand operating on distant positions',
    ],
    
    pattern: AlgorithmPattern.TWO_POINTER,
  },
  {
    id: 'challenge-3',
    title: 'Group Boarding',
    description: `Even tickets must board before odd tickets.`,
    hints: ['Move even tickets numbers left', 'Move odd tickets numbers right.'],
    difficulty: Difficulty.EASY,
    initialArray: [1, 2, 3, 4, 5, 6],
    targetArray: [2, 4, 6, 1, 5, 3],
    maxSteps: 37,
    starRequirements: {
      speedSeconds: 60,
    },
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
    concepts: [
      ConceptTag.PARTITIONING,
      ConceptTag.CONDITIONALS,
    ],
    
    learningObjectives: [
      'Group values by property',
      'Detect even and odd values',
      'Reorder using local swaps',
    ],
    
    pattern: AlgorithmPattern.PARTITION,
  },
  {
    id: 'challenge-4',
    title: 'Bubble Up',
    description: 'The highest-value ticket must reach the last seat in a single pass.',
    hints: [
      'Compare each seat with its left neighbor.',
      'Swap if the left ticket is greater than the right.'
    ],
    difficulty: Difficulty.EASY,
    initialArray: [4, 2, 7, 1, 3],
    targetArray: [2, 4, 1, 3, 7],
    maxSteps: 28,
    starRequirements: {
      speedSeconds: 60,
    },
    initialPointers: {
      MOCO: 0,
      CHOCO: 1, // last index
    },
    instructions: [
      {
        id: 'loop-start',
        type: InstructionType.LABEL,
        labelName: 'loop',
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
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.SWAP,
        InstructionType.PICK,
      ],
      suggestedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.SWAP,
      ],
    },
    concepts: [
      ConceptTag.BUBBLE_SORT_PASS,
      ConceptTag.CONDITIONALS,
      ConceptTag.LINEAR_SCAN,
    ],
    
    learningObjectives: [
      'Understand compare-and-swap',
      'Learn how large values move rightward',
    ],
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
    starRequirements: {
      speedSeconds: 60,
    },
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
    },
    concepts: [
      ConceptTag.PARTITIONING,
      ConceptTag.STABLE_PARTITION,
      ConceptTag.CONDITIONALS,
    ],
    
    learningObjectives: [
      'Move matching values to one side',
      'Preserve order while partitioning',
    ],
    
    pattern: AlgorithmPattern.PARTITION,
  },
  {
    id: 'challenge-6',
    title: 'Balanced Carriage',
    description: `Something suspicious, some passengers ticket numbers 
    is the exact average of their neighbors. Shuffle the pairs.`,
    hints: [
      'Swap every adjacent pair: positions (0,1), (2,3), (4,5)...',
      'After swapping each pair, MOCO should skip the already-swapped element.',
      'CHOCO always stays one step ahead of MOCO.',
    ],
    difficulty: Difficulty.EASY,
    initialArray: [1, 2, 3, 4, 5],
    targetArray: [2, 1, 4, 3, 5],
    maxSteps: 12,
    starRequirements: {
      speedSeconds: 60,
    },
    initialPointers: {
      MOCO: 0,  // points to left of each pair
      CHOCO: 1, // points to right of each pair (always MOCO + 1)
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
    clipboard: false,
    capabilities: {
      allowedPointers: ['MOCO', 'CHOCO'],
      allowedInstructions: [
        InstructionType.MOVE_RIGHT,
        InstructionType.SWAP,
      ],
      suggestedInstructions: [
        InstructionType.MOVE_RIGHT,
      ],
    },
    concepts: [
      ConceptTag.TWO_POINTERS,
    ],
    
    learningObjectives: [
      'Swap neighboring pairs',
      'Skip already-processed regions',
      'Coordinate synchronized pointers',
    ],
    
    pattern: AlgorithmPattern.TWO_POINTER,
  },
  {
    id: 'challenge-7',
    title: 'Backwards Tickets',
    description: `The compartment was filled from the wrong direction.`,
    hints: ['Reverse the order of all ticket values.'],
    difficulty: Difficulty.EASY,
    initialArray: [5, 4, 3, 2, 1],
    targetArray: [1, 2, 3, 4, 5],
    maxSteps: 13,
    starRequirements: {
      speedSeconds: 60,
    },
    clipboard: false,
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
    },
    concepts: [
      ConceptTag.REVERSAL,
      ConceptTag.TWO_POINTERS,
    ],
    
    learningObjectives: [
      'Reverse an array in place',
      'Learn converging pointers',
    ],
  }, 
  {
    id: 'challenge-8',
    title: 'VIP Seat',
    description: `A VIP is already seated somewhere. Seat 0 is also reserved by them.
    (highest ticket number is the VIP)`,
    hints: ['Copy the highest ticket value into Seat 0.'
    ],
    difficulty: Difficulty.MEDIUM,
    initialArray: [0, 7, 2, 9, 1],
    targetArray: [9, 7, 2, 9, 1],
    maxSteps: 42,
    starRequirements: {
      speedSeconds: 60,
    },
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
    concepts: [
      ConceptTag.MAXIMUM_SELECTION,
      ConceptTag.LINEAR_SCAN,
      ConceptTag.SEARCH,
    ],
    
    learningObjectives: [
      'Track the maximum while scanning',
      'Copy selected values to target positions',
    ],
  },
  {
    id: 'challenge-9',
    title: 'Duplicate Ticket',
    description: `Only one ticket per passenger is allowed.
    Report duplicate ticket at seat zero`,
    hints: ['If any duplicate ticket exists, copy that value into Seat 0.', 'Assume no passenger at seat 0'],
    difficulty: Difficulty.MEDIUM,
    initialArray: [0, 3, 4, 2, 2],
    targetArray: [2, 3, 4, 2, 2],
    maxSteps: 23,
    starRequirements: {
      speedSeconds: 60,
    },
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
    },
    concepts: [
      ConceptTag.DUPLICATE_DETECTION,
      ConceptTag.SEARCH,
      ConceptTag.NESTED_SCAN,
    ],
    
    learningObjectives: [
      'Compare values across positions',
      'Detect repeated elements',
    ],
  },
  {
    id: 'challenge-10',
    title: 'Inspection Check',
    description: `An inspector checks ticket order before departure.`,
    hints: ['Set Seat 0 to 0 if the remaining seats are NOT increasing order',
      'Otherwise, no change needed (Seat 0 starts as 1)',
    ],
    difficulty: Difficulty.MEDIUM,
    initialArray: [1, 3, 5, 7, 6],
    targetArray: [0, 3, 5, 7, 6],
    maxSteps: 26,
    starRequirements: {
      speedSeconds: 60,
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
    concepts: [
      ConceptTag.SORT_VALIDATION,
      ConceptTag.CONDITIONALS,
      ConceptTag.LINEAR_SCAN,
    ],
    
    learningObjectives: [
      'Validate increasing order',
      'Detect violations during traversal',
    ],
  }, 
  {
    id: 'challenge-11',
    title: 'Clear the Aisle',
    description: `Passengers without tickets must step aside without disturbing valid ones.`,
    hints: [
      'Move all zero values to the right end, preserving order of others.',
      'You begin with a zero in clipboard.'
    ],
    
    difficulty: Difficulty.MEDIUM,
    initialArray: [0, 1, 0, 3, 12, 0],
    targetArray: [1, 3, 12, 0, 0, 0],
    maxSteps: 28,
    starRequirements: {
      speedSeconds: 60,
    },
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
    },
    concepts: [
      ConceptTag.STABLE_PARTITION,
      ConceptTag.TWO_POINTERS,
      ConceptTag.CONDITIONALS,
    ],
    
    learningObjectives: [
      'Move matching values to the end',
      'Preserve order of non-matching values',
      'Coordinate read and write positions',
    ],
    
    pattern: AlgorithmPattern.PARTITION,
  },
  {
    id: 'challenge-12',
    title: 'Wiggle Sort',
    description: `Passengers must alternate: low, high, low, high...
    Odd seats must hold higher tickets than their neighbors.`,
    hints: [
      'At every odd index, the value should be greater than its neighbors.',
      'If arr[i] > arr[i+1] at an even index, swap them.',
      'If arr[i] < arr[i+1] at an odd index, swap them.',
    ],
    difficulty: Difficulty.HARD,
    initialArray: [3, 5, 2, 1, 6, 4],
    targetArray: [3, 5, 1, 6, 2, 4],
    maxSteps: 27,
    starRequirements: {
      speedSeconds: 60,
    },
    initialPointers: {
      MOCO: 0,  // current scanner
      CHOCO: 1, // lookahead (always MOCO + 1)
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
        target: 'CHOCO',
        body: [],
      },
      {
        id: 'if-great',
        type: InstructionType.IF_GREATER,
        target: 'CHOCO',
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
        InstructionType.PICK,
      
      ],
      suggestedInstructions: [

      ],
    },
    concepts: [
      ConceptTag.WIGGLE_PATTERN,
      ConceptTag.CONDITIONALS,
    ],
    
    learningObjectives: [
      'Maintain alternating inequalities',
      'Apply different rules on odd/even positions',
      'Use local swaps to enforce global structure',
    ],
    
    pattern: AlgorithmPattern.GREEDY,
  },
  {
    id: 'challenge-13',
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
    starRequirements: {
      speedSeconds: 60,
    },
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
    concepts: [
      ConceptTag.DUTCH_FLAG,
      ConceptTag.THREE_POINTERS,
      ConceptTag.PARTITIONING,
    ],
    
    learningObjectives: [
      'Partition arrays into three regions',
      'Coordinate multiple pointers',
      'Perform in-place classification',
    ],
    
    pattern: AlgorithmPattern.PARTITION,
  },
  {
    id: 'challenge-14',
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
    starRequirements: {
      speedSeconds: 60,
    },
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
    concepts: [
      ConceptTag.TWO_POINTERS,
    ],
    
    learningObjectives: [
      'Read from opposite ends simultaneously',
      'Construct a new arrangement incrementally',
      'Separate source and destination traversal',
    ],
    
    pattern: AlgorithmPattern.TWO_POINTER,
  },
  {
    id: 'challenge-15',
    title: 'Boarding Order',
    description: `The conductor mixed up the boarding sequence. Restore it to the next permutation.`,
    hints: [
      'Find the rightmost position where a value is smaller than its right neighbor (the "pivot").',
      'Find the smallest value to the right of the pivot that is still larger than it.',
      'Swap the pivot with that value, then reverse the suffix to the right of the pivot position.',
    ],
    explanation: `A permutation is one possible ordering of values. The "next permutation" is the next ordering in sorted sequence.

      For [1, 2, 3], all orderings in order are:
      1 2 3  ← here
      1 3 2  ← next
      2 1 3
      2 3 1
      3 1 2
      3 2 1`,
    difficulty: Difficulty.HARD,
    initialArray: [2, 1, 5, 4, 3, 0, 0],
    targetArray: [2, 3, 0, 0, 1, 4, 5],
    maxSteps: 20,
    starRequirements: {
      speedSeconds: 60,
    },
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

      ],
    },
    concepts: [
      ConceptTag.NEXT_PERMUTATION,
      ConceptTag.REVERSAL,
      ConceptTag.SEARCH,
      ConceptTag.TWO_POINTERS,
    ],
    
    learningObjectives: [
      'Find pivots in ordered structures',
      'Reverse suffixes in place',
      'Construct the next lexicographic ordering',
    ],
  },
];

