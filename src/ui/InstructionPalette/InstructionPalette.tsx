/**
 * Instruction palette for building programs
 * Drag-and-drop or click-to-add interface
 *
 * NEW VERSION:
 * - Only renders palette cards + help modal
 * - DnDContext is now owned by parent wrapper
 * - Program logic moved to ProgramContainer
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { useGameStore } from '../../orchestrator/store';
import type { Instruction } from '../../engine/instructions/types';
import { InstructionType } from '../../engine/instructions/types';

import {
  createInstruction,
  createMoveLeft,
  createMoveRight,
  createMoveToEnd,
  createSetPointer,
  createPick,
  createPut,
  createIfGreater,
  createIfLess,
  createIfEqual,
  createIfNotEqual,
  createIfEnd,
  createIfMeet,
  createJump,
  createLabel,
  createSwap,
  createSwapWithNext,
  createIncrementValue,
  createDecrementValue,
  createWait,
  createSetValue,
  createIfEven,
} from '../../engine/instructions/factory';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useTutorialBehavior, useTutorialHighlight } from '../../tutorial/selectors';

/** ---------------- Types ---------------- */

export type DragItem =
  | {
      source: 'PALETTE';
      instructionType: InstructionType;
      pointer: 'MOCO' | 'CHOCO' | 'LOCO';
      isGlobal?: boolean;
    }
  | { source: 'PROGRAM'; instructionId: string }
  | { source: 'IF_BODY'; instructionId: string; parentIfId: string };

/** ---------------- Templates ---------------- */

const instructionTemplates = [
  { type: InstructionType.MOVE_LEFT, label: 'Left', description: 'Move pointer left (pointer -= 1)' },
  { type: InstructionType.MOVE_RIGHT, label: 'Right', description: 'Move pointer right (pointer += 1)' },
  { type: InstructionType.PICK, label: 'Copy', description: 'Copy value at pointer' },
  { type: InstructionType.PUT, label: 'Paste', description: 'Paste value at pointer' },
  { type: InstructionType.MOVE_TO_END, label: 'ToEnd', description: 'Move pointer to end (pointer = length - 1)' },
  { type: InstructionType.IF_GREATER, label: 'IFGreat', description: 'If clipboard > current value' },
  { type: InstructionType.IF_LESS, label: 'IFLess', description: 'If clipboard < current value' },
  { type: InstructionType.IF_EQUAL, label: 'IFEqual', description: 'If clipboard === current value' },
  { type: InstructionType.IF_NOT_EQUAL, label: 'IFNotEqual', description: 'If clipboard !== current value' },
  {
    type: InstructionType.IF_END,
    label: 'IFEnd',
    description: 'If pointer == length - 1, jump to label',
  },
  { type: InstructionType.IF_EVEN, label: 'IFEven', description: 'If current value % 2 === 0' },
  { type: InstructionType.SET_POINTER, label: 'GotoSeat', description: 'Set pointer to index' },
  { type: InstructionType.SET_VALUE, label: 'SetValue', description: 'Set value at pointer' },
  { type: InstructionType.JUMP, label: 'Jump', description: 'Jump to label' },
  { type: InstructionType.LABEL, label: 'Label', description: 'Define a label' },
  { type: InstructionType.SWAP, label: 'Swap', description: 'Swap moco and choco value' },
  { type: InstructionType.SWAP_WITH_NEXT, label: 'SwapNxt', description: 'Swap current with next element' },
  { type: InstructionType.SWAP_WITH, label: 'Swap*', description: 'Swap loco value with moco or choco' },
  { type: InstructionType.IF_MEET, label: 'IFMeet', description: 'Jump if moco == choco' },
  { type: InstructionType.INCREMENT_VALUE, label: 'Value +', description: 'Increment value at pointer' },
  { type: InstructionType.DECREMENT_VALUE, label: 'Value -', description: 'Decrement value at pointer' },
  { type: InstructionType.WAIT, label: 'Wait', description: 'Wait (no operation)' },
];

const INSTRUCTION_ICONS: Record<InstructionType, string> = {
  [InstructionType.MOVE_LEFT]: '←',
  [InstructionType.MOVE_RIGHT]: '→',
  [InstructionType.MOVE_TO_END]: '→→',
  [InstructionType.PICK]: '🔗',
  [InstructionType.PUT]: '📋',
  [InstructionType.SET_POINTER]: '💺',
  [InstructionType.SET_VALUE]: '✍🏻',
  [InstructionType.IF_GREATER]: '>',
  [InstructionType.IF_LESS]: '<',
  [InstructionType.IF_EQUAL]: '=',
  [InstructionType.IF_NOT_EQUAL]: '!=',
  [InstructionType.IF_END]: '🏁',
  [InstructionType.IF_MEET]: '🤝',
  [InstructionType.IF_EVEN]: '☯',
  [InstructionType.JUMP]: '↰',
  [InstructionType.LABEL]: '🏷️',
  [InstructionType.SWAP]: '⇄',
  [InstructionType.SWAP_WITH_NEXT]: '→←',
  [InstructionType.SWAP_WITH]: '⇄',
  [InstructionType.INCREMENT_VALUE]: '➕',
  [InstructionType.DECREMENT_VALUE]: '➖',
  [InstructionType.WAIT]: '⏳',
};

const globalInstructionTypes: InstructionType[] = [
  InstructionType.SWAP,
  InstructionType.IF_MEET,
  InstructionType.JUMP,
  InstructionType.LABEL,
  InstructionType.WAIT,
];

/** ---------------- Helpers ---------------- */


/** ---------------- Components ---------------- */


function DraggablePaletteItem({
  template,
  pointer,
  isGlobal = false,
  restrictToSingleInstruction,
  tutorialInstruction,
  onClickAdd,
}: {
  template: { type: InstructionType; label: string; description: string };
  pointer: 'MOCO' | 'CHOCO' | 'LOCO';
  isGlobal?: boolean;
  restrictToSingleInstruction: boolean;
  tutorialInstruction: InstructionType | null;
  onClickAdd: (type: InstructionType, pointer: 'MOCO' | 'CHOCO' | 'LOCO') => void;
}) {
  const isAllowedByTutorial =
    !restrictToSingleInstruction || template.type === tutorialInstruction;

  const shouldPulse = useTutorialHighlight('INSTRUCTION_PALETTE', {
    instructionType: template.type,
  });

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `palette-${pointer}-${template.type}`,
    disabled: !isAllowedByTutorial,
    data: {
      source: 'PALETTE',
      instructionType: template.type,
      pointer,
      isGlobal,
    } satisfies DragItem,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const buttonClass = isGlobal
    ? 'bg-purple-700 hover:bg-purple-600 text-white'
    : pointer === 'MOCO'
    ? 'bg-blue-700 hover:bg-blue-600 text-white'
    : pointer === 'CHOCO'
    ? 'bg-red-700 hover:bg-red-600 text-white'
    : 'bg-yellow-600 hover:bg-yellow-500 text-white';

  const disabledClass = !isAllowedByTutorial ? 'opacity-30 cursor-not-allowed' : '';

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={() => {
        if (!isAllowedByTutorial) return;
        onClickAdd(template.type, pointer);
      }}
      className={`
        relative
        w-12 sm:w-16
        aspect-square
        rounded-lg sm:rounded-xl border-2
        flex flex-col items-center justify-center
        text-center
        transition-all duration-200
        select-none touch-none
        ${buttonClass}
        hover:scale-105 hover:-translate-y-1 hover:shadow-xl
        active:scale-95 cursor-grab
        ${disabledClass}
        ${shouldPulse ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
      `}
      title={template.description}
    >
      <div className="text-base sm:text-3xl">{INSTRUCTION_ICONS[template.type]}</div>
      <div className="text-[10px] sm:text-xs font-semibold tracking-wide">{template.label}</div>
      <div className="absolute inset-0 rounded sm:rounded-xl pointer-events-none bg-white/5" />
    </div>
  );
}

function InstructionHelpModal({
  guideInstructionTypes,
  onClose,
}: {
  guideInstructionTypes: Set<InstructionType>;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isOutside = (target: EventTarget | null) =>
      modalRef.current && target instanceof Node && !modalRef.current.contains(target);

    const handlePointerDown = (e: PointerEvent) => {
      if (isOutside(e.target)) onClose();
    };
    const handleWheel = (e: WheelEvent) => {
      if (isOutside(e.target)) onClose();
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isOutside(e.target)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function getGuideStyle(type: InstructionType) {
    if (globalInstructionTypes.includes(type)) return 'border-purple-500/50 bg-purple-900/20';
    return 'border-gray-600 bg-gray-800/60';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-xl w-[84%] sm:w-full max-w-lg max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-semibold">Instruction Guide</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 text-lg">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {instructionTemplates
            .filter((inst) => guideInstructionTypes.has(inst.type))
            .map((inst) => (
              <div
                key={inst.type}
                className={`
                  relative
                  flex gap-4 items-start
                  rounded-xl border-2
                  p-3
                  transition
                  ${getGuideStyle(inst.type)}
                `}
              >
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`
                      text-xs px-2 py-0.5 rounded
                      ${
                        globalInstructionTypes.includes(inst.type)
                          ? 'bg-purple-700 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }
                    `}
                  >
                    {globalInstructionTypes.includes(inst.type) ? 'SHARED' : 'MOCO/CHOCO/LOCO'}
                  </span>
                </div>

                <div
                  className="
                    w-16 h-16
                    flex flex-col items-center justify-center
                    rounded-lg
                    border-2 border-gray-600
                    bg-gray-900/90
                    text-white
                    shrink-0
                    relative
                  "
                >
                  <div className="text-lg sm:text-2xl leading-none">{INSTRUCTION_ICONS[inst.type]}</div>
                  <div className="text-[10px] sm:text-[12px] leading-tight font-mono opacity-90 mt-1 text-center">
                    {inst.label}
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-white/5 pointer-events-none" />
                </div>

                <div className="flex-1" />

                <div className="absolute inset-0 hidden sm:flex items-center justify-center px-6 pointer-events-none">
                  <p className="text-gray-300 text-xs leading-snug text-center max-w-sm">
                    {inst.description}
                  </p>
                </div>

                <div className="block sm:hidden mt-8 w-full">
                  <p className="text-gray-300 text-xs leading-snug text-right">{inst.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/** ---------------- Main ---------------- */

export function InstructionPalette() {
  const { playerInstructions, addInstruction } = useGameStore();
  const { currentChallenge } = useGameStore();

  const [showHelp, setShowHelp] = useState(false);

  const capabilities = currentChallenge?.capabilities;
  const allowedPointers = capabilities?.allowedPointers ?? ['MOCO', 'CHOCO', 'LOCO'];
  const allowedInstructions = useMemo(
    () => new Set(capabilities?.allowedInstructions ?? Object.values(InstructionType)),
    [capabilities?.allowedInstructions]
  );

  const pointerInstructionTemplates = useMemo(
    () =>
      instructionTemplates.filter(
        (t) => !globalInstructionTypes.includes(t.type) && allowedInstructions.has(t.type)
      ),
    [allowedInstructions]
  );

  const globalInstructionTemplates = useMemo(
    () =>
      instructionTemplates.filter(
        (t) => globalInstructionTypes.includes(t.type) && allowedInstructions.has(t.type)
      ),
    [allowedInstructions]
  );

  /** Tutorial behavior */
  const behavior = useTutorialBehavior();
  const highlight = behavior?.highlight;
  const tutorialInstruction = behavior?.highlight?.instructionType ?? null;

  const restrictToSingleInstruction =
    !!tutorialInstruction && behavior?.highlight?.scope === 'INSTRUCTION_PALETTE';

  /** highlight states */
  const paletteHighlight =
    highlight?.scope === 'INSTRUCTION_PALETTE' && !highlight.instructionType && !highlight.control;

  const highlightHelp = useTutorialHighlight('INSTRUCTION_PALETTE', { control: 'HELP' });
  const highlightPalette = paletteHighlight && !highlightHelp;

  /** Used in help modal to show only relevant instructions */
  function collectInstructionTypes(
    instructions: Instruction[],
    set = new Set<InstructionType>()
  ): Set<InstructionType> {
    for (const inst of instructions) {
      set.add(inst.type);
      if ('body' in inst && Array.isArray(inst.body)) {
        collectInstructionTypes(inst.body, set);
      }
    }
    return set;
  }

  const usedInstructionTypes = useMemo(() => collectInstructionTypes(playerInstructions), [playerInstructions]);

  const guideInstructionTypes = useMemo(() => {
    return new Set<InstructionType>([...allowedInstructions, ...usedInstructionTypes]);
  }, [allowedInstructions, usedInstructionTypes]);

  /** Label generation (unchanged behavior) */
  const generateUniqueLabelName = (): string => {
    const existingLabels = new Set<string>();
    playerInstructions.forEach((inst) => {
      if (inst.type === InstructionType.LABEL && 'labelName' in inst) {
        existingLabels.add(inst.labelName);
      }
    });

    let counter = 1;
    let labelName = 'label1';
    while (existingLabels.has(labelName)) {
      counter++;
      labelName = `label${counter}`;
    }
    return labelName;
  };

  const handleAddInstruction = (type: InstructionType, pointer: 'MOCO' | 'CHOCO' | 'LOCO') => {
    if (!allowedInstructions.has(type)) return;

    let instruction: Instruction;

    switch (type) {
      case InstructionType.MOVE_LEFT:
        instruction = createMoveLeft(pointer);
        break;
      case InstructionType.MOVE_RIGHT:
        instruction = createMoveRight(pointer);
        break;
      case InstructionType.MOVE_TO_END:
        instruction = createMoveToEnd(pointer);
        break;
      case InstructionType.SET_POINTER:
        instruction = createSetPointer(pointer, 0);
        break;
      case InstructionType.SET_VALUE:
        instruction = createSetValue(pointer, 0);
        break;
      case InstructionType.PICK:
        instruction = createPick(pointer);
        break;
      case InstructionType.PUT:
        instruction = createPut(pointer);
        break;
      case InstructionType.IF_GREATER:
        instruction = createIfGreater(pointer);
        break;
      case InstructionType.IF_LESS:
        instruction = createIfLess(pointer);
        break;
      case InstructionType.IF_EQUAL:
        instruction = createIfEqual(pointer);
        break;
      case InstructionType.IF_NOT_EQUAL:
        instruction = createIfNotEqual(pointer);
        break;
      case InstructionType.IF_END:
        instruction = createIfEnd(pointer, generateUniqueLabelName());
        break;
      case InstructionType.IF_MEET:
        instruction = createIfMeet(generateUniqueLabelName());
        break;
      case InstructionType.IF_EVEN:
        instruction = createIfEven(pointer);
        break;
      case InstructionType.JUMP:
        instruction = createJump(generateUniqueLabelName());
        break;
      case InstructionType.LABEL:
        instruction = createLabel(generateUniqueLabelName());
        break;
      case InstructionType.SWAP:
        instruction = createSwap();
        break;
      case InstructionType.SWAP_WITH_NEXT:
        instruction = createSwapWithNext(pointer);
        break;
      case InstructionType.INCREMENT_VALUE:
        instruction = createIncrementValue(pointer);
        break;
      case InstructionType.DECREMENT_VALUE:
        instruction = createDecrementValue(pointer);
        break;
      case InstructionType.WAIT:
        instruction = createWait();
        break;
      default:
        // fallback factory
        instruction = createInstruction(type, pointer);
    }

    addInstruction(instruction);
  };

  return (
    <div className="instruction-palette bg-gray-800 rounded-lg sm:p-4">
      {/* Header */}
      <div className="relative flex items-center mb-1 sm:mb-3">
        <button
          onClick={() => setShowHelp(true)}
          title="Instruction help"
          className={`
            ml-auto
            text-gray-300
            transition
            sm:text-lg
            px-2
            ${highlightHelp ? 'ring-2 ring-yellow-400 rounded' : 'hover:text-yellow-400'}
          `}
        >
          ⓘ
        </button>

        <h3 className="absolute left-1/2 -translate-x-1/2 text-sm sm:text-base text-white font-semibold">
          Action Cards
        </h3>
      </div>

      <div className="flex gap-0.5 sm:gap-3 justify-end">
        {/* Shared instructions */}
        {globalInstructionTemplates.length > 0 && (
          <div className="flex justify-center">
            <div className="bg-gray-700/60 rounded-lg px-1.5 py-3 sm:p-3 w-full max-w-md">
              <h4 className="text-sm text-gray-400 font-semibold mb-1 sm:mb-2 text-xs sm:text-base text-center tracking-widest">
                SHARED
              </h4>

              <SortableContext
                items={globalInstructionTemplates.map((t) => `palette-MOCO-${t.type}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-row gap-1 sm:gap-2">
                  {globalInstructionTemplates.map((template) => (
                    <DraggablePaletteItem
                      key={`global-${template.type}`}
                      template={template}
                      pointer="MOCO"
                      isGlobal
                      restrictToSingleInstruction={restrictToSingleInstruction}
                      tutorialInstruction={tutorialInstruction}
                      onClickAdd={handleAddInstruction}
                    />
                  ))}

                </div>
              </SortableContext>
            </div>
          </div>
        )}

        {/* MOCO */}
        {allowedPointers.includes('MOCO') && (
          <div className={`
            flex justify-center
            ${highlightPalette ? 'ring-2 ring-yellow-400 rounded-lg' : ''}
            `}>
            <div className="bg-gray-700/60 rounded-lg px-1.5 py-3 sm:p-3 w-full max-w-md">

              <h4 className="text-blue-400 text-sm font-semibold mb-1 sm:mb-2 text-xs sm:text-base text-center tracking-widest">
                MOCO
              </h4>

              <SortableContext
                items={pointerInstructionTemplates.map((t) => `palette-MOCO-${t.type}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-row gap-1 sm:gap-2">
                  {pointerInstructionTemplates
                  .filter((t) => t.type !== InstructionType.SWAP_WITH)
                  .map((template) => (
                    <DraggablePaletteItem
                      key={`moco-${template.type}`}
                      template={template}
                      pointer="MOCO"
                      restrictToSingleInstruction={restrictToSingleInstruction}
                      tutorialInstruction={tutorialInstruction}
                      onClickAdd={handleAddInstruction}
                    />
                  ))}

                </div>
              </SortableContext>
            </div>
          </div>
        )}

        {/* CHOCO */}
        {allowedPointers.includes('CHOCO') && (
          <div className="flex justify-center">
            <div className="bg-gray-700/60 rounded-lg px-1.5 py-3 sm:p-3 w-full max-w-md">
              <h4 className="text-red-400 text-sm font-semibold mb-1 sm:mb-2 text-xs sm:text-base text-center tracking-widest">
                CHOCO
              </h4>

              <SortableContext
                items={pointerInstructionTemplates.map((t) => `palette-CHOCO-${t.type}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-row gap-1 sm:gap-2">
                  {pointerInstructionTemplates
                  .filter((t) => t.type !== InstructionType.SWAP_WITH)
                  .map((template) => (
                    <DraggablePaletteItem
                      key={`choco-${template.type}`}
                      template={template}
                      pointer="CHOCO"
                      restrictToSingleInstruction={restrictToSingleInstruction}
                      tutorialInstruction={tutorialInstruction}
                      onClickAdd={handleAddInstruction}
                    />
                  ))}

                </div>
              </SortableContext>
            </div>
          </div>
        )}

        {/* LOCO */}
        {allowedPointers.includes('LOCO') && (
          <div className="flex justify-center">
            <div className="bg-gray-700/60 rounded-lg px-1.5 py-3 sm:p-3 w-full max-w-md">
              <h4 className="text-yellow-400 text-sm font-semibold mb-1 sm:mb-2 text-xs sm:text-base text-center tracking-widest">
                LOCO
              </h4>

              <SortableContext
                items={pointerInstructionTemplates.map((t) => `palette-LOCO-${t.type}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-row gap-1 sm:gap-2">
                  {pointerInstructionTemplates.map((template) => (
                    <DraggablePaletteItem
                      key={`loco-${template.type}`}
                      template={template}
                      pointer="LOCO"
                      restrictToSingleInstruction={restrictToSingleInstruction}
                      tutorialInstruction={tutorialInstruction}
                      onClickAdd={handleAddInstruction}
                    />
                  ))}

                </div>
              </SortableContext>
            </div>
          </div>
        )}
      </div>

      {/* Help modal */}
      {showHelp && (
        <InstructionHelpModal
          guideInstructionTypes={guideInstructionTypes}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}
