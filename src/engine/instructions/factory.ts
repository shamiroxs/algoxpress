/**
 * Factory functions for creating instructions
 */


import type { Instruction, PointerTarget } from './types';
import { InstructionType } from './types';

export function createInstruction(
  type: InstructionType,
  pointer: 'MOCO' | 'CHOCO' | 'LOCO'
): Instruction {
  switch (type) {
    case InstructionType.MOVE_LEFT:
      return createMoveLeft(pointer);
    case InstructionType.MOVE_RIGHT:
      return createMoveRight(pointer);
    case InstructionType.MOVE_TO_END:
      return createMoveToEnd(pointer);
    case InstructionType.SET_POINTER:
      return createSetPointer(pointer, 0);
    case InstructionType.SET_VALUE:
      return createSetValue(pointer, 0);
    case InstructionType.PICK:
      return createPick(pointer);
    case InstructionType.PUT:
      return createPut(pointer);
    case InstructionType.IF_GREATER:
      return createIfGreater(pointer);
    case InstructionType.IF_LESS:
      return createIfLess(pointer);
    case InstructionType.IF_EQUAL:
      return createIfEqual(pointer);
    case InstructionType.IF_NOT_EQUAL:
      return createIfNotEqual(pointer);
    case InstructionType.IF_END:
      return createIfEnd(pointer, 'label');
    case InstructionType.IF_MEET:
      return createIfMeet('label');
    case InstructionType.IF_EVEN:
      return createIfEven(pointer);
    case InstructionType.JUMP:
      return createJump('label');
    case InstructionType.LABEL:
      return createLabel('label');
    case InstructionType.SWAP:
      return createSwap();
    case InstructionType.SWAP_WITH_NEXT:
      return createSwapWithNext(pointer);
    case InstructionType.INCREMENT_VALUE:
      return createIncrementValue(pointer);
    case InstructionType.DECREMENT_VALUE:
      return createDecrementValue(pointer);
    case InstructionType.WAIT:
      return createWait();
    default:
      throw new Error('Unsupported instruction');
  }
}

export function createMoveLeft(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `moveleft-${Date.now()}-${Math.random()}`,
    type: InstructionType.MOVE_LEFT,
    target,
    
  };
}

export function createMoveRight(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `moveright-${Date.now()}-${Math.random()}`,
    type: InstructionType.MOVE_RIGHT,
    target,
    
  };
}

export function createMoveToEnd(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `movetoend-${Date.now()}-${Math.random()}`,
    type: InstructionType.MOVE_TO_END,
    target,
    
  };
}

export function createSetPointer(
  target: PointerTarget,
  index: number,
  
): Instruction {
  return {
    id: `setptr-${Date.now()}-${Math.random()}`,
    type: InstructionType.SET_POINTER,
    target,
    index,
    
  };
}

export function createSetValue(
  target: PointerTarget,
  value: number,
  
): Instruction {
  return {
    id: `setval-${Date.now()}-${Math.random()}`,
    type: InstructionType.SET_VALUE,
    target,
    value,
    
  };
}


export function createPick(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `pick-${Date.now()}-${Math.random()}`,
    type: InstructionType.PICK,
    target,
    
  };
}

export function createPut(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `put-${Date.now()}-${Math.random()}`,
    type: InstructionType.PUT,
    target,
    
  };
}


export function createIfGreater(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `ifgreater-${Date.now()}-${Math.random()}`,
    type: InstructionType.IF_GREATER,
    target,
    body: [],
    
  };
}

export function createIfLess(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `ifless-${Date.now()}-${Math.random()}`,
    type: InstructionType.IF_LESS,
    target,
    body: [],
    
  };
}

export function createIfEqual(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `ifequal-${Date.now()}-${Math.random()}`,
    type: InstructionType.IF_EQUAL,
    target,
    body: [],
    
  };
}

export function createIfNotEqual(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `ifnotequal-${Date.now()}-${Math.random()}`,
    type: InstructionType.IF_NOT_EQUAL,
    target,
    body: [],
    
  };
}

export function createIfEnd(
  target: PointerTarget,
  label: string,
  
): Instruction {
  return {
    id: `ifend-${Date.now()}-${Math.random()}`,
    type: InstructionType.IF_END,
    target,
    label,
    
  };
}

export function createIfMeet(
  label: string,
  
): Instruction {
  return {
    id: `ifmeet-${Date.now()}-${Math.random()}`,
    type: InstructionType.IF_MEET,
    label,
    
  };
}

export function createIfEven(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `ifeven-${Date.now()}-${Math.random()}`,
    type: InstructionType.IF_EVEN,
    target,
    body: [],
    
  };
}

export function createJump(label: string): Instruction {
  return {
    id: `jump-${Date.now()}-${Math.random()}`,
    type: InstructionType.JUMP,
    
    label,
  };
}

export function createLabel(labelName: string): Instruction {
  return {
    id: `label-${Date.now()}-${Math.random()}`,
    type: InstructionType.LABEL,
    
    labelName,
  };
}

export function createSwap(): Instruction {
  return {
    id: `swap-${Date.now()}-${Math.random()}`,
    type: InstructionType.SWAP,
    
  };
}

export function createSwapWithNext(target: PointerTarget): Instruction {
  return {
    id: `swap-${Date.now()}-${Math.random()}`,
    type: InstructionType.SWAP_WITH_NEXT,
    target,
    
  };
}


export function createIncrementValue(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `incval-${Date.now()}-${Math.random()}`,
    type: InstructionType.INCREMENT_VALUE,
    target,
    
  };
}

export function createDecrementValue(
  target: PointerTarget,
  
): Instruction {
  return {
    id: `decval-${Date.now()}-${Math.random()}`,
    type: InstructionType.DECREMENT_VALUE,
    target,
    
  };
}


export function createWait(): Instruction {
  return {
    id: `wait-${Date.now()}-${Math.random()}`,
    type: InstructionType.WAIT,
    
  };
}
