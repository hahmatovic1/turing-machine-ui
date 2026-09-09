import { Component, input, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tape',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tape.component.html',
  styleUrl: './tape.component.scss'
})
export class TapeComponent implements OnInit {
  tapeInput = input<string>('');
  externalTapeContent = input<string[]>([]);
  externalHeadPosition = input<number>(0);
  scrollIndex = signal(0);
  headPosition = signal(0);
  cellsPerView = signal(8);
  tapeContent = signal<string[]>([]);

  get visibleCells() {
    const start = this.scrollIndex();
    const end = start + this.cellsPerView();
    return this.tapeContent().slice(start, end);
  }

  get headPositionInView() {
    return this.headPosition() - this.scrollIndex();
  }

  get maxScroll() {
    return Math.max(0, this.tapeContent().length - this.cellsPerView());
  }

  constructor() {
    effect(() => {
      const externalContent = this.externalTapeContent();
      const externalHead = this.externalHeadPosition();

      if (externalContent.length > 0) {
        this.tapeContent.set(externalContent);
        this.headPosition.set(externalHead);
        this.centerViewOnHead();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.calculateCellsPerView();
    window.addEventListener('resize', () => this.calculateCellsPerView());
    this.updateTapeContent();
  }

  ngOnChanges() {
    const externalContent = this.externalTapeContent();
    if (externalContent.length === 0) {
      this.updateTapeContent();
    }
  }

  private updateTapeContent() {
    const inputValue = this.tapeInput();
    const padding = this.cellsPerView() * 2;

    if (inputValue) {
      const chars = inputValue.split('');
      const paddedTape = Array(padding).fill('_').concat(chars).concat(Array(padding).fill('_'));
      this.tapeContent.set(paddedTape);
      this.headPosition.set(padding);
      this.scrollIndex.set(Math.max(0, padding - Math.floor(this.cellsPerView() / 2)));
    } else {
      const emptyTape = Array(padding * 2 + this.cellsPerView()).fill('_');
      this.tapeContent.set(emptyTape);
      this.headPosition.set(padding);
      this.scrollIndex.set(Math.max(0, padding - Math.floor(this.cellsPerView() / 2)));
    }
  }

  private centerViewOnHead() {
    const head = this.headPosition();
    const viewStart = Math.max(0, head - Math.floor(this.cellsPerView() / 2));
    const maxScroll = Math.max(0, this.tapeContent().length - this.cellsPerView());
    this.scrollIndex.set(Math.min(viewStart, maxScroll));
  }

  private calculateCellsPerView() {
    const cellWidth = 50;
    const gapWidth = 0.5 * 16;
    const arrowWidth = 40 + 16;
    const totalPadding = 40;

    const availableWidth = window.innerWidth - (arrowWidth * 2) - totalPadding;
    const cellsPerViewCalc = Math.floor(availableWidth / (cellWidth + gapWidth));
    this.cellsPerView.set(Math.max(3, cellsPerViewCalc));
    this.updateTapeContent();
  }

  scrollLeft() {
    this.scrollIndex.set(Math.max(0, this.scrollIndex() - 1));
  }

  scrollRight() {
    this.scrollIndex.set(Math.min(this.maxScroll, this.scrollIndex() + 1));
  }
}
