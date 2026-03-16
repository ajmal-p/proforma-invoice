import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Invoice } from "./components/invoice/invoice";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Invoice],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppShell {
  protected readonly title = signal('proforma-invoice');
}
