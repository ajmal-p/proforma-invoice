import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BillingCalculator } from '../../services/billing-calculator';
import { FORM_SELECT_DATA } from '../../models/form-select-data';
import { merge } from 'rxjs';
import { EntryRow } from '../../models/billing-model';
import { NumericInput } from '../../directive/numeric-input';

@Component({
  selector: 'app-invoice',
  imports: [ReactiveFormsModule, CommonModule, NumericInput],
  templateUrl: './invoice.html',
  styleUrl: './invoice.scss',
})
export class Invoice implements OnInit {
  private fb = inject(FormBuilder);
  private calculator = inject(BillingCalculator);
  private destroyRef = inject(DestroyRef);

  invoiceForm!: FormGroup;
  selectOptions = FORM_SELECT_DATA;
  toastVisible = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.buildFormGroup();
    this.appendEntry();
    this.observeExpenseUpdates();
  }

  private buildFormGroup(): void {
    this.invoiceForm = this.fb.group({
      docId: ['IMP001'],
      voucherName: ['IMP00001'],
      vendorId: [''],
      buyer: [''],
      paymentTerm: [''],
      shippingMethod: [''],
      taxGroup: [''],
      currency: ['AED'],
      date: [new Date().toISOString().substring(0, 10)],
      dueDate: [new Date().toISOString().substring(0, 10)],

      subtotal: [{ value: 0, disabled: true }],
      totalQuantity: [{ value: 0, disabled: true }],
      tax: [0],
      totalAmount: [{ value: 0, disabled: true }],
      totalExpense: [null],

      notes: [''],
      entries: this.fb.array([])
    });
  }

  get entries(): FormArray {
    return this.invoiceForm.get('entries') as FormArray;
  }

  appendEntry(): void {
    const row = this.fb.group({
      productCode: ['ITEM001'],
      description: ['Default Item'],
      unit: ['BAG'],
      qty: [null, [Validators.min(0)]],
      price: [null, [Validators.min(0)]],
      amount: [{ value: 0, disabled: true }],
      distributedCost: [{ value: 0, disabled: true }]
    });

    this.entries.push(row);
    this.observeEntryUpdates(row);
  }

  deleteEntry(index: number): void {
    this.entries.removeAt(index);
    this.computeTotals();
  }

  private observeExpenseUpdates(): void {
    this.invoiceForm.get('totalExpense')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.computeTotals());
  }

  private observeEntryUpdates(row: FormGroup): void {
    merge(
      row.get('qty')!.valueChanges,
      row.get('price')!.valueChanges
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.computeTotals());
  }

  private computeTotals(): void {
    let subtotal = 0;
    let totalQuantity = 0;

    const entryData = this.entries.controls.map(ctrl => {
      const qty = Number(ctrl.get('qty')?.value) || 0;
      const price = Number(ctrl.get('price')?.value) || 0;
      const amount = qty * price;

      subtotal += amount;
      totalQuantity += qty;

      ctrl.get('amount')?.setValue(amount, { emitEvent: false });

      return { ...ctrl.value, amount, distributedCost: 0 };
    });

    const totalExpense = Number(this.invoiceForm.get('totalExpense')?.value) || 0;

    const distributed = this.calculator.distributeExpenses(entryData, totalExpense, subtotal);
    distributed.forEach((row, i) => {
      this.entries.at(i)
        .get('distributedCost')
        ?.setValue(row.distributedCost, { emitEvent: false });
    });

    this.invoiceForm.patchValue(
      { subtotal, totalQuantity, totalAmount: subtotal },
      { emitEvent: false }
    );
  }

  submitForm(): void {
    const raw = this.invoiceForm.getRawValue();

    const output = {
      headerInformation: {
        docId: raw.docId,
        voucherName: raw.voucherName,
        vendorId: raw.vendorId,
        buyer: raw.buyer,
        paymentTerm: raw.paymentTerm,
        shippingMethod: raw.shippingMethod,
        taxGroup: raw.taxGroup,
        date: raw.date,
        dueDate: raw.dueDate,
        currency: raw.currency,
        notes: raw.notes,
        subtotal: raw.subtotal,
        totalQuantity: raw.totalQuantity,
        tax: raw.tax,
        totalAmount: raw.totalAmount,
        totalExpense: raw.totalExpense,
      },
      itemEntryInformation: raw.entries.map((item: EntryRow) => ({
        productCode: item.productCode,
        description: item.description,
        unit: item.unit,
        qty: item.qty,
        price: item.price,
        amount: item.amount,
        distributedCost: item.distributedCost,
      })),
    };

    console.log(output);
    this.showToast();
  }

  showToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3000);
  }

  dismissToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastVisible.set(false);
  }

  resetForm(): void {
    this.buildFormGroup();
    this.appendEntry();
    this.observeExpenseUpdates();
  }
}
