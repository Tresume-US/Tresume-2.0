import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientViewDetailsComponent } from './client-view-details.component';

describe('ClientViewDetailsComponent', () => {
  let component: ClientViewDetailsComponent;
  let fixture: ComponentFixture<ClientViewDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientViewDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientViewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
