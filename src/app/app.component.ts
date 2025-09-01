import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './shared/components/modal/modal.component';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'restaurante-frontend';
}
