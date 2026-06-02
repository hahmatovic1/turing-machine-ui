//based on the TM definition
export class TuringMachine { 
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
  readSymbol: string;
  nextState: string;
  writeSymbol: string;
  moveDirection: MoveDirection;
}

export type MoveDirection = 'L' | 'R';
