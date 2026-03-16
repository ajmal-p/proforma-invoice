import { Injectable } from '@angular/core';
import { LineItem } from '../models/billing-model';

@Injectable({
  providedIn: 'root',
})
export class BillingCalculator {

  distributeExpenses(items: LineItem[], totalExpense: number, grandTotal: number): LineItem[] {
    return items.map(d => ({
      ...d,
      allocatedExpense: grandTotal === 0 ? 0 : Number(((d.amount / grandTotal) * totalExpense).toFixed(2))
    }));
  }

}
