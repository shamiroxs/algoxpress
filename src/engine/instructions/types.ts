/**
 * Core instruction types for the DSA game
 * Intuitive, game-like instruction set for array manipulation
 */

export type PointerTarget = 'MOCO' | 'CHOCO' | 'LOCO';

export const InstructionType = {
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  MOVE_TO_END: 'MOVE_TO_END',

  SET_VALUE: 'SET_VALUE',
  SET_POINTER: 'SET_POINTER',
  PICK: 'PICK',
  PUT: 'PUT',

  IF_GREATER: 'IF_GREATER',
  IF_LESS: 'IF_LESS',
  IF_EQUAL: 'IF_EQUAL',
  IF_NOT_EQUAL: 'IF_NOT_EQUAL',
  IF_END: 'IF_END',
  IF_MEET: 'IF_MEET',
  IF_EVEN: 'IF_EVEN',

  JUMP: 'JUMP',
  LABEL: 'LABEL',

  SWAP: 'SWAP',
  SWAP_WITH_NEXT: 'SWAP_WITH_NEXT',

  INCREMENT_VALUE: 'INCREMENT_VALUE',
  DECREMENT_VALUE: 'DECREMENT_VALUE',

  WAIT: 'WAIT',
} as const;


export type InstructionType = typeof InstructionType[keyof typeof InstructionType];

export interface BaseInstruction {
  id: string;
  type: InstructionType;
  target?: PointerTarget;
}

export interface MoveLeftInstruction extends BaseInstruction {
  type: 'MOVE_LEFT';
  target: PointerTarget;
}

export interface MoveRightInstruction extends BaseInstruction {
  type: 'MOVE_RIGHT';
  target: PointerTarget;
}

export interface MoveToEndInstruction extends BaseInstruction {
  type: 'MOVE_TO_END';
  target: PointerTarget;
}

export interface SetPointerInstruction extends BaseInstruction {
  type: 'SET_POINTER';
  index: number; // pointer = index
  target: PointerTarget;
}

export interface SetValueInstruction extends BaseInstruction {
  type: 'SET_VALUE';
  value: number; // arr[pointer] = value
  target: PointerTarget;
}

export interface PickInstruction extends BaseInstruction {
  type: 'PICK'; // hand = array[pointer]
  target: PointerTarget;
}

export interface PutInstruction extends BaseInstruction {
  type: 'PUT'; // array[pointer] = hand
  target: PointerTarget;
}

export interface IfBaseInstruction extends BaseInstruction {
  body: Instruction[]; // executed only if condition is true
}

export interface IfGreaterInstruction extends IfBaseInstruction {
  type: 'IF_GREATER';// jump if hand > array[pointer]
  target: PointerTarget;
}

export interface IfLessInstruction extends IfBaseInstruction {
  type: 'IF_LESS';// jump if hand < array[pointer]
  target: PointerTarget;
}

export interface IfEqualInstruction extends IfBaseInstruction {
  type: 'IF_EQUAL'; // jump if hand === array[pointer]
  target: PointerTarget;
}

export interface IfNotEqualInstruction extends IfBaseInstruction {
  type: 'IF_NOT_EQUAL'; // jump if hand !== array[pointer]
  target: PointerTarget;
}

export interface IfEndInstruction extends BaseInstruction {
  type: 'IF_END';
  label: string; // jump if pointer === array.length - 1
  target: PointerTarget;
}

export interface IfMeetInstruction extends BaseInstruction {
  type: 'IF_MEET';
  label: string; // jump if moco === choco
}

export interface IfEvenInstruction extends IfBaseInstruction {
  type: 'IF_EVEN'; // if hand IS EVEN
  target: PointerTarget;
}

export interface JumpInstruction extends BaseInstruction {
  type: 'JUMP';
  label: string;
}

export interface LabelInstruction extends BaseInstruction {
  type: 'LABEL';
  labelName: string;
}

export interface SwapInstruction extends BaseInstruction {
  type: 'SWAP'; // swap array[moco] <-> array[choco]
}

export interface SwapWithNextInstruction extends BaseInstruction {
  type: 'SWAP_WITH_NEXT'; // swap array[pointer] with array[pointer+1]
  target: PointerTarget;
}

export interface IncrementValueInstruction extends BaseInstruction {
  type: 'INCREMENT_VALUE'; // array[pointer]++
  target: PointerTarget;
}

export interface DecrementValueInstruction extends BaseInstruction {
  type: 'DECREMENT_VALUE'; // array[pointer]--
  target: PointerTarget;
}

export interface WaitInstruction extends BaseInstruction {
  type: 'WAIT'; // consumes a step but does nothing
}

export type Instruction =
  | MoveLeftInstruction
  | MoveRightInstruction
  | MoveToEndInstruction
  | SetPointerInstruction
  | SetValueInstruction
  | PickInstruction
  | PutInstruction
  | IfGreaterInstruction
  | IfLessInstruction
  | IfEqualInstruction
  | IfNotEqualInstruction
  | IfEndInstruction
  | IfMeetInstruction
  | IfEvenInstruction
  | JumpInstruction
  | LabelInstruction
  | SwapInstruction
  | SwapWithNextInstruction
  | IncrementValueInstruction
  | DecrementValueInstruction
  | WaitInstruction;


