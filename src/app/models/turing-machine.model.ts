//based on the TM definition
export class TuringMachine {
    numberOfTapes: number = 1;
    states = new Set<string>();
    inputAlphabet = new Set<string>();
    tapeAlphabet = new Set<string>();
    transitions: Transition[] = [];
    initialState = "";
    blank = "";
    finalStates = new Set<string>();
}

export interface Transition {
  currentState: string;
  readSymbols: string[];
  nextState: string;
  writeSymbols: string[];
  moveDirections: MoveDirection[];
}

/** Single-tape transition format for backwards compatibility */
export interface SingleTapeTransition {
  currentState: string;
  readSymbol: string;
  nextState: string;
  writeSymbol: string;
  moveDirection: MoveDirection;
}

/** Legacy single-tape tuple format: [currentState, readSymbol, nextState, writeSymbol, moveDirection] */
export type TransitionTuple = [string, string, string, string, 'L' | 'R'];
/** Multi-tape tuple format: [currentState, [readSymbols...], nextState, [writeSymbols...], [moveDirections...]] */
export type MultiTapeTransitionTuple = [string, string[], string, string[], MoveDirection[]];

export type MoveDirection = 'L' | 'R' | 'N';
