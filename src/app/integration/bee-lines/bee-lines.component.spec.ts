import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeeLinesComponent } from './bee-lines.component';

describe('BeeLinesComponent', () => {
  let component: BeeLinesComponent;
  let fixture: ComponentFixture<BeeLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeeLinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeeLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
