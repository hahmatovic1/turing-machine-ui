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
  stepCount = signal<number>(0);

  tapesContent = signal<string[][]>([]);
  headsPosition = signal<number[]>([]);
  // Legacy single-tape signals (maintained for backwards compatibility)
  tapeContent = signal<string[]>([]);
  headPosition = signal<number>(0);
  private stepInterval: number | null = null;

  isMachineValid = computed(() => this.configErrors().length === 0 && this.currentMachine() !== null);

  currentReadSymbols = computed(() => {
    const machine = this.currentMachine();
    if (!machine) return [];

    const numberOfTapes = machine.numberOfTapes;
    const symbols: string[] = [];

    for (let i = 0; i < numberOfTapes; i++) {
      if (i === 0) {
        const input = this.inputValue();
        symbols.push(input.length > 0 ? input[0] : machine.blank);
      } else {
        symbols.push(machine.blank);
      }
    }

    return symbols;
  });

  nextTransition = computed(() => {
    const machine = this.currentMachine();
    const state = this.currentState();
    const readSymbols = this.currentReadSymbols();

    if (!machine || !state || readSymbols.length === 0) return null;

    return machine.transitions.find(
      t => t.currentState === state && this.arraysEqual(t.readSymbols, readSymbols)
    ) || null;
  });

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

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
      this.stepCount.set(0);
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
    const numberOfTapes = machine.numberOfTapes;

    const tapes: string[][] = [];
    const heads: number[] = [];

    for (let i = 0; i < numberOfTapes; i++) {
      let tape: string[];

      if (i === 0 && inputStr) {
        // First tape gets the input
        const chars = inputStr.split('');
        tape = Array(padding).fill(machine.blank).concat(chars).concat(Array(padding).fill(machine.blank));
      } else {
        // Other tapes start empty
        tape = Array(padding * 2 + 8).fill(machine.blank);
      }

      tapes.push(tape);
      heads.push(padding);
    }

    this.tapesContent.set(tapes);
    this.headsPosition.set(heads);

    // Maintain backwards compatibility
    if (tapes.length > 0) {
      this.tapeContent.set(tapes[0]);
      this.headPosition.set(heads[0]);
    }
  }

  private step(): void {
    const machine = this.currentMachine();
    if (!machine) return;

    const state = this.currentState();
    const tapes = this.tapesContent();
    const heads = this.headsPosition();

    // Read symbols from all tapes
    const readSymbols = tapes.map((tape, i) => tape[heads[i]] || machine.blank);

    const transition = machine.transitions.find(
      t => t.currentState === state && this.arraysEqual(t.readSymbols, readSymbols)
    );

    if (!transition) return;

    // Update all tapes
    const newTapes = tapes.map((tape, i) => {
      const newTape = [...tape];
      newTape[heads[i]] = transition.writeSymbols[i];
      return newTape;
    });

    // Move all heads independently
    const newHeads = heads.map((head, i) => {
      const move = transition.moveDirections[i];
      if (move === 'R') return head + 1;
      if (move === 'L') return head - 1;
      return head; // 'N' - no move
    });

    // Handle tape expansion for each tape independently
    const finalTapes = newTapes.map((tape, i) => {
      let finalTape = tape;
      let finalHead = newHeads[i];

      if (finalHead >= finalTape.length) {
        finalTape = [...finalTape, machine.blank];
      } else if (finalHead < 0) {
        finalTape = [machine.blank, ...finalTape];
        finalHead = 0;
      }

      newHeads[i] = finalHead;
      return finalTape;
    });

    this.tapesContent.set(finalTapes);
    this.headsPosition.set(newHeads);

    // Maintain backwards compatibility
    if (finalTapes.length > 0) {
      this.tapeContent.set(finalTapes[0]);
      this.headPosition.set(newHeads[0]);
    }

    this.currentState.set(transition.nextState);
    this.stepCount.set(this.stepCount() + 1);
  }

  stepMachine(): void {
    const machine = this.currentMachine();
    if (!machine || this.isRunning()) return;

    const state = this.currentState();
    const tapes = this.tapesContent();
    const heads = this.headsPosition();

    const readSymbols = tapes.map((tape, i) => tape[heads[i]] || machine.blank);
    const hasTransition = machine.transitions.some(
      t => t.currentState === state && this.arraysEqual(t.readSymbols, readSymbols)
    );

    if (!hasTransition || machine.finalStates.has(state)) {
      return;
    }

    this.step();
  }

  toggleDualTapeMode(): void {
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
      const tapes = this.tapesContent();
      const heads = this.headsPosition();

      // Read symbols from all tapes
      const readSymbols = tapes.map((tape, i) => tape[heads[i]] || machine.blank);

      const hasTransition = machine.transitions.some(
        t => t.currentState === state && this.arraysEqual(t.readSymbols, readSymbols)
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
    this.stepCount.set(0);
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
