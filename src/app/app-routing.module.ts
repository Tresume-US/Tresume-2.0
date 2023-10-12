import { DivisionAuditComponent } from './division-audit/division-audit.component';
import { DivisionComponent } from './division/division.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CandidateComponent } from './candidate/candidate.component';
import { SiteVisitComponent } from './candidate/site-visit.component';
import { PlacementViewComponent } from './candidate/placement-view.component';
import { SearchResumesComponent } from './job-boards/search-resumes.component';
import { SearchResumesCBComponent } from './job-boards/search-cb-resumes.component';
import { SearchResumesJoobleComponent } from './job-boards/search-jooble-resumes.component';
import { SearchResumesMonsterComponent } from './job-boards/search-monster-resumes.component';
import { SearchResumesDiceComponent } from './job-boards/search-dice-resumes.component';
import { IntegratedSearchComponent } from './job-boards/integrated-search.component';
import { SearchComponent } from './job-boards/search.component';
import { JobBoardListComponent } from './job-boards/job-board-list.component'
import { OnboardingComponent } from './onboarding/onboarding.component';
import { OnboardingListComponent } from './onboarding/onboarding-list.component';
import { ImportDetailsComponent } from './onboarding/onboarding-workflow/import-details.component';
import { WizardWorkflowComponent } from './onboarding/onboarding-workflow/wizard-workflow.component';
import { EmployeeViewComponent } from './onboarding/onboarding-workflow/employee-view.component';
import { ComplianceDashboardComponent } from './compliancedb/compliancedashboard.component';
import { HarvestComponent } from './harvest/harvest.component';
import { HarvestViewComponent } from './harvest/harvestview.component';
import { AuthGuard } from './auth.guard';
import { AdobesignComponent1 } from './adobesign/adobesign.component';
import { LoginComponent } from './login/login.component';
import { TimesheetCreateComponent } from './timesheet-create/timesheet-create.component';
import { InterviewComponent } from './interview/interview.component';
import { SubmissionComponent } from './submission/submission.component';
import { GeneralComponent } from './general/general.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { CreateNewJobsComponent } from './create-new-jobs/create-new-jobs.component';
import { AllTimeSheetComponent } from './all-time-sheet/all-time-sheet.component';
import { AllclientComponent } from './allclient/allclient.component';
import { AddclientComponent } from './addclient/addclient.component';
import { ViewclientComponent } from './viewclient/viewclient.component';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { AllJobPostingsComponent } from './all-job-postings/all-job-postings.component';
import { OrganinfoComponent } from './organinfo/organinfo.component';
import { FinancialInfoComponent } from './financial-info/financial-info.component';



const routes: Routes = [
  { path: 'dashboard/:traineeId', component: DashboardComponent, canActivate: [AuthGuard]  },
  { path: 'compliancedashboard', component: ComplianceDashboardComponent   },
  { path: 'candidateView/:traineeId', component: CandidateComponent   },
  { path: 'candidateView/:traineeId/sitevisit', component: SiteVisitComponent   },
  // Route with placementID parameter
  { path: 'candidateView/:traineeId/placement/:placementID', component: PlacementViewComponent   },

  // Route without placementID parameter
  { path: 'candidateView/:traineeId/create', component: PlacementViewComponent   },
  { path: 'search', component: SearchResumesComponent   },
  { path: 'search/cb', component: SearchResumesCBComponent   },
  { path: 'search/monster', component: SearchResumesMonsterComponent   },
  { path: 'search/jooble', component: SearchResumesJoobleComponent   },
  { path: 'search/dice', component: SearchResumesDiceComponent   },
  { path: 'search/integrated', component: IntegratedSearchComponent },
  { path: 'searchMain', component: SearchComponent },
  { path: 'onboarding', component: OnboardingComponent   },
  { path: 'onboardingList', component: OnboardingListComponent   },
  { path: 'onboard/1', component: ImportDetailsComponent   },
  { path: 'onboard/step/:id', component: WizardWorkflowComponent   },
  { path: 'onboard/employee/:id', component: EmployeeViewComponent   },
  { path: 'jobboards', component: JobBoardListComponent   },
  { path: 'division', component: DivisionComponent, canActivate: [AuthGuard] },
  { path: 'harvest', component: HarvestComponent, canActivate: [AuthGuard] },
  { path: 'harvestview/:id', component: HarvestViewComponent, canActivate: [AuthGuard] },
  { path: 'divisionaudit', component: DivisionAuditComponent, canActivate: [AuthGuard] },
  { path: 'adobesign', component: AdobesignComponent1   },
  { path: 'adobesign/token/:token', component: AdobesignComponent1   },
  { path: 'timesheet/create', component: TimesheetCreateComponent   },
  { path: 'alltimesheet', component: AllTimeSheetComponent },
  { path: 'login', component: LoginComponent },
  { path: 'searchtresume/reviewtresume/interview', component: InterviewComponent},
  { path: 'searchtresume/reviewtresume/submission', component: SubmissionComponent},
  { path: 'timesheet/viewdetails', component: ViewDetailsComponent },
  { path: 'searchtresume/reviewtresume/general', component: GeneralComponent },
  { path: 'password-form' , component: PasswordFormComponent },
  { path: 'Myjobs/createnewjob', component:  CreateNewJobsComponent },
  { path: 'viewdetails', component: ViewDetailsComponent },
  { path: 'addclient',component: AddclientComponent},
  { path: 'allclient',component: AllclientComponent},
  { path: 'viewclient',component: ViewclientComponent},
  { path: 'jobposting' , component: AllJobPostingsComponent},
  { path: 'organizationinfo' , component:OrganinfoComponent},
  { path: 'financialinfo' , component:FinancialInfoComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }