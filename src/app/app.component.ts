import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TapeComponent } from "./shared/components/tape/tape.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TapeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'turing-machine-ui';
}
