import { Component, input, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TapeState {
  content: string[];
  headPosition: number;
  scrollIndex: number;
  label: string;
}

@Component({
  selector: 'app-tape',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tape.component.html',
  styleUrl: './tape.component.scss'
})
export class TapeComponent implements OnInit {
  // Legacy single-tape inputs (backwards compatible)
  tapeInput = input<string>('');
  externalTapeContent = input<string[]>([]);
  externalHeadPosition = input<number>(0);

  // Multi-tape inputs
  externalTapesContent = input<string[][]>([]);
  externalHeadPositions = input<number[]>([]);

  cellsPerView = signal(8);
  tapes = signal<TapeState[]>([]);

  getVisibleCells(tapeIndex: number): string[] {
    const tape = this.tapes()[tapeIndex];
    if (!tape) return [];
    const start = tape.scrollIndex;
    const end = start + this.cellsPerView();
    return tape.content.slice(start, end);
  }

  getHeadPositionInView(tapeIndex: number): number {
    const tape = this.tapes()[tapeIndex];
    if (!tape) return -1;
    return tape.headPosition - tape.scrollIndex;
  }

  getMaxScroll(tapeIndex: number): number {
    const tape = this.tapes()[tapeIndex];
    if (!tape) return 0;
    return Math.max(0, tape.content.length - this.cellsPerView());
  }

  constructor() {
    effect(() => {
      const externalTapes = this.externalTapesContent();
      const externalHeads = this.externalHeadPositions();

      if (externalTapes.length > 0 && externalHeads.length === externalTapes.length) {
        this.initializeMultipleTapes(externalTapes, externalHeads);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const externalContent = this.externalTapeContent();
      const externalHead = this.externalHeadPosition();

      if (externalContent.length > 0 && this.externalTapesContent().length === 0) {
        this.initializeMultipleTapes([externalContent], [externalHead]);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.calculateCellsPerView();
    window.addEventListener('resize', () => this.calculateCellsPerView());

    const tapeInput = this.tapeInput();
    if (tapeInput && this.externalTapesContent().length === 0 && this.externalTapeContent().length === 0) {
      this.initializeSingleTape(tapeInput);
    }
  }

  private initializeSingleTape(input: string) {
    const padding = this.cellsPerView() * 2;
    const chars = input.split('');
    const paddedTape = Array(padding).fill('_').concat(chars).concat(Array(padding).fill('_'));
    const scrollPos = Math.max(0, padding - Math.floor(this.cellsPerView() / 2));

    this.tapes.set([{
      content: paddedTape,
      headPosition: padding,
      scrollIndex: scrollPos,
      label: 'Tape 1'
    }]);
  }

  private initializeMultipleTapes(tapesContent: string[][], headPositions: number[]) {
    const newTapes: TapeState[] = tapesContent.map((content, index) => ({
      content,
      headPosition: headPositions[index],
      scrollIndex: this.calculateScrollIndex(headPositions[index]),
      label: `Tape ${index + 1}`
    }));
    this.tapes.set(newTapes);
  }

  private calculateScrollIndex(headPosition: number): number {
    return Math.max(0, headPosition - Math.floor(this.cellsPerView() / 2));
  }

  scrollLeft(tapeIndex: number) {
    const updatedTapes = this.tapes();
    if (updatedTapes[tapeIndex]) {
      updatedTapes[tapeIndex].scrollIndex = Math.max(0, updatedTapes[tapeIndex].scrollIndex - 1);
      this.tapes.set([...updatedTapes]);
    }
  }

  scrollRight(tapeIndex: number) {
    const updatedTapes = this.tapes();
    if (updatedTapes[tapeIndex]) {
      const maxScroll = this.getMaxScroll(tapeIndex);
      updatedTapes[tapeIndex].scrollIndex = Math.min(maxScroll, updatedTapes[tapeIndex].scrollIndex + 1);
      this.tapes.set([...updatedTapes]);
    }
  }

  private calculateCellsPerView() {
    const cellWidth = 50;
    const gapWidth = 0.5 * 16;
    const arrowWidth = 40 + 16;
    const totalPadding = 40;

    const availableWidth = window.innerWidth - (arrowWidth * 2) - totalPadding;
    const cellsPerViewCalc = Math.floor(availableWidth / (cellWidth + gapWidth));
    this.cellsPerView.set(Math.max(3, cellsPerViewCalc));
  }
}
