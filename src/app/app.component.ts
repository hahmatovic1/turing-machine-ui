import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { TapeComponent } from './shared/components/tape/tape.component';
import { ExamplesComponent } from './shared/components/examples/examples.component';
import { TuringMachineService } from './core/services/turing-machine.service';
import { TuringMachine } from './models/turing-machine.model';
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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

  tapeContent = signal<string[]>([]);
  headPosition = signal<number>(0);
  private stepInterval: number | null = null;

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
    this.initializeTape();
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
      this.initializeTape();
    } else {
      this.currentMachine.set(null);
      this.currentState.set('');
      this.initialState.set('');
    }
  }

  private initializeTape(): void {
    const machine = this.currentMachine();
    if (!machine) return;

    const inputStr = this.inputValue();
    const padding = 16;

    if (inputStr) {
      const chars = inputStr.split('');
      const paddedTape = Array(padding).fill(machine.blank).concat(chars).concat(Array(padding).fill(machine.blank));
      this.tapeContent.set(paddedTape);
      this.headPosition.set(padding);
    } else {
      const emptyTape = Array(padding * 2 + 8).fill(machine.blank);
      this.tapeContent.set(emptyTape);
      this.headPosition.set(padding);
    }
  }

  private step(): void {
    const machine = this.currentMachine();
    if (!machine) return;

    const state = this.currentState();
    const tape = this.tapeContent();
    const head = this.headPosition();

    const readSymbol = tape[head] || machine.blank;

    const transition = machine.transitions.find(
      t => t.currentState === state && t.readSymbol === readSymbol
    );

    if (!transition) return;

    const newTape = [...tape];
    newTape[head] = transition.writeSymbol;
    this.tapeContent.set(newTape);

    const newHead = transition.moveDirection === 'R' ? head + 1 : head - 1;
    if (newHead >= 0 && newHead < tape.length) {
      this.headPosition.set(newHead);
    } else if (newHead >= tape.length) {
      const machine_blank = machine.blank;
      this.tapeContent.set([...newTape, machine_blank]);
      this.headPosition.set(newHead);
    } else if (newHead < 0) {
      const machine_blank = machine.blank;
      this.tapeContent.set([machine_blank, ...newTape]);
      this.headPosition.set(0);
    }

    this.currentState.set(transition.nextState);
  }

  toggleDualTapeMode(): void {
    console.log('Dual/Single toggle pressed');
    this.dualTapeMode.set(!this.dualTapeMode());
  }

  playMachine(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    this.stepInterval = window.setInterval(() => {
      const machine = this.currentMachine();
      if (!machine) {
        this.stopMachine();
        return;
      }

      const state = this.currentState();
      const tape = this.tapeContent();
      const head = this.headPosition();
      const readSymbol = tape[head] || machine.blank;

      const hasTransition = machine.transitions.some(
        t => t.currentState === state && t.readSymbol === readSymbol
      );

      if (!hasTransition || machine.finalStates.has(state)) {
        this.stopMachine();
        return;
      }

      this.step();
    }, 1500);
  }

  stopMachine(): void {
    this.isRunning.set(false);
    if (this.stepInterval !== null) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  }

  revertMachine(): void {
    this.stopMachine();
    this.currentState.set(this.initialState());
    this.initializeTape();
  }

  loadExampleConfig(): void {
    console.log('Load Example button pressed');
    const example = this.turingMachineService.getExampleConfiguration();
    this.turingMachineConfig.set(example);
    this.parseConfiguration(example);
  }

  importConfig(): void {
    console.log('Import button pressed');
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      console.log('File selected for import:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.turingMachineConfig.set(content);
        this.parseConfiguration(content);
      };
      reader.readAsText(file);
    }

    input.value = '';
  }

  exportConfig(): void {
    console.log('Export button pressed');
    const config = this.turingMachineConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'turing-machine-config.json';
    link.click();
    URL.revokeObjectURL(url);
  }
}
