import { TestBed } from '@angular/core/testing';

import { CorporateDocumentService } from './corporate-document.service';

describe('CorporateDocumentService', () => {
  let service: CorporateDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorporateDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
