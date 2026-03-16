import { TestBed } from '@angular/core/testing';

import { BillingCalculator } from './billing-calculator';

describe('BillingCalculator', () => {
  let service: BillingCalculator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillingCalculator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
