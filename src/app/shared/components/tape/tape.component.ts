import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tape',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tape.component.html',
  styleUrl: './tape.component.scss'
})
export class TapeComponent {
  input = input<string>('');
  scrollIndex = signal(0);
  cellsPerView = 8;

  get tapeCharacters() {
    return this.input().split('');
  }

  get visibleCells() {
    const start = this.scrollIndex();
    const end = start + this.cellsPerView;
    return this.tapeCharacters.slice(start, end);
  }

  get maxScroll() {
    return Math.max(0, this.tapeCharacters.length - this.cellsPerView);
  }

  scrollLeft() {
    this.scrollIndex.set(Math.max(0, this.scrollIndex() - 1));
  }

  scrollRight() {
    this.scrollIndex.set(Math.min(this.maxScroll, this.scrollIndex() + 1));
  }
}
