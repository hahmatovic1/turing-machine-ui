import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Example {
  name: string;
  input: string;
}

@Component({
  selector: 'app-examples',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './examples.component.html',
  styleUrl: './examples.component.scss'
})
export class ExamplesComponent {
  exampleSelected = output<string>();

  examples: Example[] = [
    { name: 'Hello World', input: '01010101' },
    { name: 'Count', input: '1111' },
    { name: 'Palindrome', input: 'abba' },
    { name: 'Binary Add', input: '101+11' }
  ];

  selectExample(example: Example) {
    this.exampleSelected.emit(example.input);
  }
}
