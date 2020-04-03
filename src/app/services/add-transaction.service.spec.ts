import { TestBed } from '@angular/core/testing';

import { AddTransactionService } from './add-transaction.service';

describe('AddTransactionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddTransactionService = TestBed.get(AddTransactionService);
    expect(service).toBeTruthy();
  });
});
