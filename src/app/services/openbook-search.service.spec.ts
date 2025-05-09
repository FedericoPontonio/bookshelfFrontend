import { TestBed } from '@angular/core/testing';

import { OpenbookSearchService } from './openbook-search.service';

describe('OpenbookSearchService', () => {
  let service: OpenbookSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenbookSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
