import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Example {
  name: string;
  tapeInput: string;
  config: string;
}

export interface ExampleData {
  tapeInput: string;
  config: string;
}

@Component({
  selector: 'app-examples',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './examples.component.html',
  styleUrl: './examples.component.scss'
})
export class ExamplesComponent {
  exampleSelected = output<ExampleData>();

  examples: Example[] = [
    {
      name: 'Binary Incrementer',
      tapeInput: '101',
      config: JSON.stringify({
        states: ['q0', 'q1', 'q2'],
        inputAlphabet: ['0', '1'],
        tapeAlphabet: ['0', '1', '_'],
        initialState: 'q0',
        blank: '_',
        finalStates: ['q2'],
        transitions: [
          { currentState: 'q0', readSymbol: '1', nextState: 'q0', writeSymbol: '1', moveDirection: 'R' },
          { currentState: 'q0', readSymbol: '0', nextState: 'q0', writeSymbol: '0', moveDirection: 'R' },
          { currentState: 'q0', readSymbol: '_', nextState: 'q1', writeSymbol: '1', moveDirection: 'L' },
          { currentState: 'q1', readSymbol: '1', nextState: 'q1', writeSymbol: '0', moveDirection: 'L' },
          { currentState: 'q1', readSymbol: '0', nextState: 'q2', writeSymbol: '1', moveDirection: 'R' }
        ]
      }, null, 2)
    },
    {
      name: 'Bit Flip',
      tapeInput: '010',
      config: JSON.stringify({
        states: ['q0', 'q1'],
        inputAlphabet: ['0', '1'],
        tapeAlphabet: ['0', '1', '_'],
        initialState: 'q0',
        blank: '_',
        finalStates: ['q1'],
        transitions: [
          { currentState: 'q0', readSymbol: '0', nextState: 'q0', writeSymbol: '1', moveDirection: 'R' },
          { currentState: 'q0', readSymbol: '1', nextState: 'q0', writeSymbol: '0', moveDirection: 'R' },
          { currentState: 'q0', readSymbol: '_', nextState: 'q1', writeSymbol: '_', moveDirection: 'L' }
        ]
      }, null, 2)
    },
    {
      name: 'Count Ones',
      tapeInput: '1111',
      config: JSON.stringify({
        states: ['q0', 'q1', 'q2'],
        inputAlphabet: ['1'],
        tapeAlphabet: ['1', '_'],
        initialState: 'q0',
        blank: '_',
        finalStates: ['q2'],
        transitions: [
          { currentState: 'q0', readSymbol: '1', nextState: 'q0', writeSymbol: '1', moveDirection: 'R' },
          { currentState: 'q0', readSymbol: '_', nextState: 'q1', writeSymbol: '_', moveDirection: 'L' },
          { currentState: 'q1', readSymbol: '1', nextState: 'q2', writeSymbol: '1', moveDirection: 'R' }
        ]
      }, null, 2)
    }
  ];

  selectExample(example: Example) {
    this.exampleSelected.emit({
      tapeInput: example.tapeInput,
      config: example.config
    });
  }
}
