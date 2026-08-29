import { Component, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tape',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tape.component.html',
  styleUrl: './tape.component.scss'
})
export class TapeComponent implements OnInit {
  input = input<string>('');
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

  ngOnInit() {
    this.calculateCellsPerView();
    window.addEventListener('resize', () => this.calculateCellsPerView());
    this.updateTapeContent();
  }

  ngOnChanges() {
    this.updateTapeContent();
  }

  private updateTapeContent() {
    const inputValue = this.input();
    const padding = this.cellsPerView() * 2;

    if (inputValue) {
      const chars = inputValue.split('');
      // Pad tape with blanks on both sides
      const paddedTape = Array(padding).fill('_').concat(chars).concat(Array(padding).fill('_'));
      this.tapeContent.set(paddedTape);
      // Center the head at the beginning
      this.headPosition.set(padding);
      this.scrollIndex.set(Math.max(0, padding - Math.floor(this.cellsPerView() / 2)));
    } else {
      // Show all blanks initially
      const emptyTape = Array(padding * 2 + this.cellsPerView()).fill('_');
      this.tapeContent.set(emptyTape);
      this.headPosition.set(padding);
      this.scrollIndex.set(Math.max(0, padding - Math.floor(this.cellsPerView() / 2)));
    }
  }

  private calculateCellsPerView() {
    const cellWidth = 50; // cell width
    const gapWidth = 0.5 * 16; // gap in pixels (0.5rem = ~8px, but accounting for padding)
    const arrowWidth = 40 + 16; // arrow button width + gap
    const totalPadding = 40; // page padding

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
