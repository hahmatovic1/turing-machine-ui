import { Component, inject, signal, computed } from '@angular/core';
import { TapeComponent } from './shared/components/tape/tape.component';
import { ExamplesComponent } from './shared/components/examples/examples.component';
import { TuringMachineService } from './core/services/turing-machine.service';
import { TuringMachine, Transition } from './models/turing-machine.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TapeComponent, ExamplesComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private turingMachineService = inject(TuringMachineService);

  title = 'turing-machine-ui';
  inputValue = signal<string>('');
  exampleConfig = this.turingMachineService.getExampleConfiguration();
  turingMachineConfig = signal<string>(this.exampleConfig);
  configErrors = signal<string[]>([]);
  currentMachine = signal<TuringMachine | null>(null);
  currentState = signal<string>('');
  isRunning = signal<boolean>(false);
  dualTapeMode = signal<boolean>(false);
  initialState = signal<string>('');
  tapeValidationError = signal<string>('');

  isMachineValid = computed(() => this.configErrors().length === 0 && this.currentMachine() !== null);

  currentReadSymbol = computed(() => {
    const input = this.inputValue();
    return input.length > 0 ? input[0] : this.currentMachine()?.blank || '—';
  });

  nextTransition = computed(() => {
    const machine = this.currentMachine();
    const state = this.currentState();
    const readSymbol = this.currentReadSymbol();

    if (!machine || !state) return null;

    return machine.transitions.find(
      t => t.currentState === state && t.readSymbol === readSymbol
    ) || null;
  });

  onExampleSelected(exampleData: any): void {
    this.inputValue.set(exampleData.tapeInput);
    this.turingMachineConfig.set(exampleData.config);
    this.parseConfiguration(exampleData.config);
  }

  onInputChange(value: string): void {
    this.inputValue.set(value);
    this.validateTapeInput(value);
  }

  private validateTapeInput(tapeInput: string): void {
    if (!tapeInput || !this.currentMachine()) {
      this.tapeValidationError.set('');
      return;
    }

    const machine = this.currentMachine();
    const invalidChars = new Set<string>();

    for (const char of tapeInput) {
      if (!machine!.inputAlphabet.has(char)) {
        invalidChars.add(char);
      }
    }

    if (invalidChars.size > 0) {
      this.tapeValidationError.set(`Invalid: ${Array.from(invalidChars).join(', ')}`);
    } else {
      this.tapeValidationError.set('');
    }
  }

  onConfigChange(value: string): void {
    this.turingMachineConfig.set(value);
    this.parseConfiguration(value);
  }

  private parseConfiguration(configStr: string): void {
    if (!configStr.trim()) {
      this.configErrors.set([]);
      this.currentMachine.set(null);
      this.currentState.set('');
      this.initialState.set('');
      return;
    }

    const { machine, errors } = this.turingMachineService.parseTuringMachineConfig(configStr);
    this.configErrors.set(errors);
    if (errors.length === 0) {
      this.currentMachine.set(machine);
      this.currentState.set(machine.initialState);
      this.initialState.set(machine.initialState);
      this.isRunning.set(false);
    } else {
      this.currentMachine.set(null);
      this.currentState.set('');
      this.initialState.set('');
    }
  }

  loadExampleConfig(): void {
    const example = this.turingMachineService.getExampleConfiguration();
    this.turingMachineConfig.set(example);
    this.parseConfiguration(example);
  }

  toggleDualTapeMode(): void {
    this.dualTapeMode.set(!this.dualTapeMode());
  }

  playMachine(): void {
    this.isRunning.set(true);
  }

  stopMachine(): void {
    this.isRunning.set(false);
  }

  revertMachine(): void {
    this.isRunning.set(false);
    this.currentState.set(this.initialState());
  }
}
