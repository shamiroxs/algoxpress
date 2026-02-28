/**
 * Execution state model for the VM
 * Tracks array state, pointers, registers, and execution position
 */

export interface ExecutionFrame {
  instructions: any[]; // Instruction[]
  line: number;
}

export interface ExecutionState {
  // Array state
  array: number[];
  extraArray?: number[];  
  
  // Single pointer (index position in array)
  mocoPointer: number;
  chocoPointer: number;
  locoPointer: number;
  
  // Hand register (temporary storage - like holding a value)
  hand: number | null;
  
  // Execution state
  executionStack: ExecutionFrame[];
  stepCount: number;
  
  // Label map for jumps (label name -> line number)
  labelMap: Record<string, number>;
  
  // History for rewind
  history: ExecutionState[];
  currentLine: number;
  currentInstructionId: string | null;
  instructions: any[];
}

export function createInitialState(
  initialArray: number[],
  instructions: any[],
  challenge?: { 
    initialPointers?: { MOCO?: number; CHOCO?: number; LOCO?: number; } 
    initialHand?: number | null;
    extraArray?: number[];
  }
): ExecutionState {
  // Build label map from LABEL instructions
  const labelMap: Record<string, number> = {};
  instructions.forEach((inst: any, index: number) => {
    if (inst.type === 'LABEL' && inst.labelName) {
      labelMap[inst.labelName] = index;
    }
  });
  
  return {
    array: [...initialArray],
    extraArray: challenge?.extraArray
    ? [...challenge.extraArray]
    : undefined,
    mocoPointer: challenge?.initialPointers?.MOCO ?? 0,
    chocoPointer:
      challenge?.initialPointers?.CHOCO ?? 0,
    locoPointer: challenge?.initialPointers?.LOCO ?? 0,
    hand: challenge?.initialHand ?? null,
    executionStack: [
      {
        instructions,
        line: 0,
      },
    ],
    currentLine: 0,
    currentInstructionId: instructions[0]?.id ?? null,
    instructions,
    stepCount: 0,
    labelMap,
    history: [],
  };
}

export function cloneState(state: ExecutionState): ExecutionState {
  return {
    array: [...state.array],
    extraArray: state.extraArray ? [...state.extraArray] : undefined,
    mocoPointer: state.mocoPointer,
    chocoPointer: state.chocoPointer,
    locoPointer: state.locoPointer,
    hand: state.hand,
    executionStack: state.executionStack.map(frame => ({
      instructions: frame.instructions,
      line: frame.line,
    })),
    currentLine: state.currentLine,
    currentInstructionId: state.currentInstructionId,
    instructions: state.instructions,
    stepCount: state.stepCount,
    labelMap: { ...state.labelMap },
    history: [...state.history],
  };
}



