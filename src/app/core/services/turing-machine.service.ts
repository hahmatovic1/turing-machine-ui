import { Injectable } from '@angular/core';
import { TuringMachine, Transition } from '../../models/turing-machine.model';

interface TuringMachineConfig {
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  initialState: string;
  blank: string;
  finalStates: string[];
  transitions: Transition[];
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
        machine.transitions = config.transitions;
      }

      return { machine, errors };
    } catch (e) {
      errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
      return { machine, errors };
    }
  }

  getExampleConfiguration(): string {
    return JSON.stringify(
      {
        states: ['q0', 'q1', 'q2'],
        inputAlphabet: ['0', '1'],
        tapeAlphabet: ['0', '1', '_'],
        initialState: 'q0',
        blank: '_',
        finalStates: ['q2'],
        transitions: [
          {
            currentState: 'q0',
            readSymbol: '0',
            nextState: 'q1',
            writeSymbol: '1',
            moveDirection: 'R'
          },
          {
            currentState: 'q1',
            readSymbol: '1',
            nextState: 'q2',
            writeSymbol: '0',
            moveDirection: 'L'
          }
        ]
      },
      null,
      2
    );
  }
}
