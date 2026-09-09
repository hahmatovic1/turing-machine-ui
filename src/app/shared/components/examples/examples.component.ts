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
      config: `{
  "states": ["q0", "q1", "q2"],
  "inputAlphabet": ["0", "1"],
  "tapeAlphabet": ["0", "1", "_"],
  "initialState": "q0",
  "blank": "_",
  "finalStates": ["q2"],
  "transitions": [["q0", "1", "q0", "1", "R"], ["q0", "0", "q0", "0", "R"], ["q0", "_", "q1", "1", "L"], ["q1", "1", "q1", "0", "L"], ["q1", "0", "q2", "1", "R"]]
}`
    },
    {
      name: 'Bit Flip',
      tapeInput: '010',
      config: `{
  "states": ["q0", "q1"],
  "inputAlphabet": ["0", "1"],
  "tapeAlphabet": ["0", "1", "_"],
  "initialState": "q0",
  "blank": "_",
  "finalStates": ["q1"],
  "transitions": [["q0", "0", "q0", "1", "R"], ["q0", "1", "q0", "0", "R"], ["q0", "_", "q1", "_", "L"]]
}`
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
        transitions: [["q0", "1", "q0", "1", "R"], ["q0", "_", "q1", "_", "L"], ["q1", "1", "q2", "1", "R"]]
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
