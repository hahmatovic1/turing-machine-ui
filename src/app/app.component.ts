import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TapeComponent } from './shared/components/tape/tape.component';
import { ExamplesComponent } from './shared/components/examples/examples.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TapeComponent, ExamplesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'turing-machine-ui';
  inputValue = signal<string>('');

  onExampleSelected(exampleInput: string): void {
    this.inputValue.set(exampleInput);
  }
}
