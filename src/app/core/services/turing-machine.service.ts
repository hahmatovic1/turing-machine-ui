import { Injectable } from '@angular/core';
import { TuringMachine, Transition, TransitionTuple, MultiTapeTransitionTuple, SingleTapeTransition } from '../../models/turing-machine.model';

interface TuringMachineConfig {
  numberOfTapes?: number;
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  initialState: string;
  blank: string;
  finalStates: string[];
  transitions: (TransitionTuple | MultiTapeTransitionTuple | Transition | SingleTapeTransition)[];
}

@Injectable({
  providedIn: 'root'
})
export class TuringMachineService {

  parseTuringMachineConfig(jsonString: string): { machine: TuringMachine; errors: string[] } {
    const errors: string[] = [];
    const machine = new TuringMachine();

    try {
      const config: TuringMachineConfig = JSON.parse(jsonString);

      machine.numberOfTapes = config.numberOfTapes || 1;

      if (!config.states || !Array.isArray(config.states)) {
        errors.push('states must be an array');
      } else {
        machine.states = new Set(config.states);
      }

      if (!config.inputAlphabet || !Array.isArray(config.inputAlphabet)) {
        errors.push('inputAlphabet must be an array');
      } else {
        machine.inputAlphabet = new Set(config.inputAlphabet);
      }

      if (!config.tapeAlphabet || !Array.isArray(config.tapeAlphabet)) {
        errors.push('tapeAlphabet must be an array');
      } else {
        machine.tapeAlphabet = new Set(config.tapeAlphabet);
      }

      if (!config.initialState || typeof config.initialState !== 'string') {
        errors.push('initialState must be a non-empty string');
      } else {
        machine.initialState = config.initialState;
      }

      if (!config.blank || typeof config.blank !== 'string') {
        errors.push('blank must be a non-empty string');
      } else {
        machine.blank = config.blank;
      }

      if (!config.finalStates || !Array.isArray(config.finalStates)) {
        errors.push('finalStates must be an array');
      } else {
        machine.finalStates = new Set(config.finalStates);
      }

      if (!config.transitions || !Array.isArray(config.transitions)) {
        errors.push('transitions must be an array');
      } else {
        machine.transitions = config.transitions.map((t, index) => {
          return this.parseTransition(t, index, machine.numberOfTapes, errors);
        }).filter((t): t is Transition => t !== null);

        if (machine.transitions.length > 0) {
          errors.push(...this.validateTransitionTapeCount(machine.transitions, machine.numberOfTapes));
        }
      }

      return { machine, errors };
    } catch (e) {
      errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
      return { machine, errors };
    }
  }

  private parseTransition(t: any, index: number, numberOfTapes: number, errors: string[]): Transition | null {
    // Handle multi-tape object format
    if (typeof t === 'object' && !Array.isArray(t)) {
      if (this.isTransition(t)) {
        return t as Transition;
      } else if (this.isSingleTapeTransition(t)) {
        // Convert single-tape format to multi-tape
        return {
          currentState: t.currentState,
          readSymbols: [t.readSymbol],
          nextState: t.nextState,
          writeSymbols: [t.writeSymbol],
          moveDirections: [t.moveDirection]
        };
      }
    }

    // Handle tuple format
    if (Array.isArray(t)) {
      if (t.length === 5) {
        // Legacy single-tape tuple: [currentState, readSymbol, nextState, writeSymbol, moveDirection]
        if (typeof t[1] === 'string' && typeof t[3] === 'string') {
          return {
            currentState: t[0],
            readSymbols: [t[1]],
            nextState: t[2],
            writeSymbols: [t[3]],
            moveDirections: [t[4]]
          };
        }
      }

      if (t.length === 5) {
        // Multi-tape tuple: [currentState, [readSymbols...], nextState, [writeSymbols...], [moveDirections...]]
        if (Array.isArray(t[1]) && Array.isArray(t[3]) && Array.isArray(t[4])) {
          if (t[1].length !== numberOfTapes || t[3].length !== numberOfTapes || t[4].length !== numberOfTapes) {
            errors.push(`Transition ${index}: read, write, and move arrays must match numberOfTapes (${numberOfTapes})`);
            return null;
          }
          return {
            currentState: t[0],
            readSymbols: t[1],
            nextState: t[2],
            writeSymbols: t[3],
            moveDirections: t[4]
          };
        }
      }

      errors.push(`Transition ${index}: invalid format`);
      return null;
    }

    errors.push(`Transition ${index}: must be an object or array`);
    return null;
  }

  private isTransition(obj: any): obj is Transition {
    return (
      typeof obj.currentState === 'string' &&
      Array.isArray(obj.readSymbols) &&
      typeof obj.nextState === 'string' &&
      Array.isArray(obj.writeSymbols) &&
      Array.isArray(obj.moveDirections)
    );
  }

  private isSingleTapeTransition(obj: any): obj is SingleTapeTransition {
    return (
      typeof obj.currentState === 'string' &&
      typeof obj.readSymbol === 'string' &&
      typeof obj.nextState === 'string' &&
      typeof obj.writeSymbol === 'string' &&
      (obj.moveDirection === 'L' || obj.moveDirection === 'R' || obj.moveDirection === 'N')
    );
  }

  private validateTransitionTapeCount(transitions: Transition[], numberOfTapes: number): string[] {
    const errors: string[] = [];
    transitions.forEach((t, index) => {
      if (t.readSymbols.length !== numberOfTapes || t.writeSymbols.length !== numberOfTapes || t.moveDirections.length !== numberOfTapes) {
        errors.push(`Transition ${index}: array lengths don't match numberOfTapes (${numberOfTapes})`);
      }
    });
    return errors;
  }

  getExampleConfiguration(): string {
    return this.getSingleTapeExample();
  }

  getSingleTapeExample(): string {
    return `{
  "numberOfTapes": 1,
  "states": ["q0", "q1", "q2"],
  "inputAlphabet": ["0", "1"],
  "tapeAlphabet": ["0", "1", "_"],
  "initialState": "q0",
  "blank": "_",
  "finalStates": ["q2"],
  "transitions": [
    ["q0", ["0"], "q0", ["0"], ["R"]],
    ["q0", ["1"], "q0", ["1"], ["R"]],
    ["q0", ["_"], "q1", ["1"], ["L"]],
    ["q1", ["1"], "q1", ["0"], ["L"]],
    ["q1", ["0"], "q2", ["1"], ["R"]]
  ]
}`;
  }

  getTwoTapeExample(): string {
    return `{
  "numberOfTapes": 2,
  "states": ["q0", "q1"],
  "inputAlphabet": ["a", "b"],
  "tapeAlphabet": ["a", "b", "_"],
  "initialState": "q0",
  "blank": "_",
  "finalStates": ["q1"],
  "transitions": [
    ["q0", ["a", "_"], "q0", ["a", "a"], ["R", "R"]],
    ["q0", ["b", "_"], "q0", ["b", "b"], ["R", "R"]],
    ["q0", ["_", "_"], "q1", ["_", "_"], ["N", "N"]]
  ]
}`;
  }

  getThreeTapeExample(): string {
    return `{
  "numberOfTapes": 3,
  "states": ["q0", "q1", "q2"],
  "inputAlphabet": ["a", "b"],
  "tapeAlphabet": ["a", "b", "_"],
  "initialState": "q0",
  "blank": "_",
  "finalStates": ["q2"],
  "transitions": [
    ["q0", ["a", "_", "_"], "q0", ["a", "a", "a"], ["R", "R", "R"]],
    ["q0", ["b", "_", "_"], "q0", ["b", "b", "b"], ["R", "R", "R"]],
    ["q0", ["_", "_", "_"], "q1", ["_", "_", "_"], ["N", "N", "N"]],
    ["q1", ["_", "_", "_"], "q2", ["_", "_", "_"], ["N", "N", "N"]]
  ]
}`;
  }
}
