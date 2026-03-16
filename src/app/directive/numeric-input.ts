import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericInput]',
})
export class NumericInput {
  constructor() {}

 @HostListener('keydown', ['$event'])
  handleKeypress(event: KeyboardEvent): void {
    if (!/^\d$/.test(event.key) && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }
}
