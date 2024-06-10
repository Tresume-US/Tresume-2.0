import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterViewJobsComponent } from './recruiter-view-jobs.component';

describe('RecruiterViewJobsComponent', () => {
  let component: RecruiterViewJobsComponent;
  let fixture: ComponentFixture<RecruiterViewJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecruiterViewJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecruiterViewJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
