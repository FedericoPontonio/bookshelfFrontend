import { TestBed } from '@angular/core/testing';

import { UserBooksProviderService } from './user-books-provider.service';

describe('UserBooksProviderService', () => {
  let service: UserBooksProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserBooksProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
