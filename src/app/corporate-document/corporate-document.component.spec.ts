import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateDocumentComponent } from './corporate-document.component';

describe('CorporateDocumentComponent', () => {
  let component: CorporateDocumentComponent;
  let fixture: ComponentFixture<CorporateDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporateDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporateDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
