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
  dualTapeMode = signal<boolean>(false);

  onExampleSelected(exampleInput: string): void {
    this.inputValue.set(exampleInput);
  }

  onInputChange(value: string): void {
    this.inputValue.set(value);
  }

  toggleDualTapeMode(): void {
    this.dualTapeMode.set(!this.dualTapeMode());
  }
}
