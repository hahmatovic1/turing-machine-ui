import { Injectable } from '@angular/core';
import { TuringMachine, Transition, TransitionTuple } from '../../models/turing-machine.model';

interface TuringMachineConfig {
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  initialState: string;
  blank: string;
  finalStates: string[];
  transitions: (TransitionTuple | Transition)[];
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
          // Handle tuple format [currentState, readSymbol, nextState, writeSymbol, moveDirection]
          if (Array.isArray(t)) {
            if (t.length !== 5) {
              errors.push(`Transition ${index} must be a tuple of [currentState, readSymbol, nextState, writeSymbol, moveDirection]`);
              return null;
            }
            return {
              currentState: t[0],
              readSymbol: t[1],
              nextState: t[2],
              writeSymbol: t[3],
              moveDirection: t[4] as 'L' | 'R'
            };
          }
          // Handle object format
          return t as Transition;
        }).filter((t): t is Transition => t !== null);
      }

      return { machine, errors };
    } catch (e) {
      errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
      return { machine, errors };
    }
  }

  getExampleConfiguration(): string {
    return `{
  "states": ["q0", "q1", "q2"],
  "inputAlphabet": ["0", "1"],
  "tapeAlphabet": ["0", "1", "_"],
  "initialState": "q0",
  "blank": "_",
  "finalStates": ["q2"],
  "transitions": [["q0", "0", "q1", "1", "R"], ["q1", "1", "q2", "0", "L"]]
}`;
  }
}
