import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { ModalComponent } from "./shared/components/modal/modal.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'restaurante-frontend';
}
