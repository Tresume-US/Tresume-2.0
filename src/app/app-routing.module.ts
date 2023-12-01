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
import { CreateNewJobsComponent } from './create-new-jobs/create-new-jobs.component';
import { AllclientComponent } from './allclient/allclient.component';
import { AddclientComponent } from './addclient/addclient.component';
import { ViewclientComponent } from './viewclient/viewclient.component';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { AllJobPostingsComponent } from './all-job-postings/all-job-postings.component';
import { OrganinfoComponent } from './organinfo/organinfo.component';
import { FinancialInfoComponent } from './financial-info/financial-info.component';
import { SearchTresumeComponent } from './search-tresume/search-tresume.component';
import { HrmsComponent } from './hrms/hrms.component';
import { ApplicantDetailsComponent } from './applicant-details/applicant-details.component';
import { ConfirmationPopupComponent } from './confirmation-popup/confirmation-popup.component';
import { SubmittedCandiatesComponent } from './submitted-candiates/submitted-candiates.component';
import { ProfileComponent } from './profile/profile.component';
import { InformationComponent } from './information/information.component';
import { PasswordComponent } from './password/password.component';
import { AboutmeComponent } from './aboutme/aboutme.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { ReviewTresumeComponent } from './review-tresume/review-tresume.component';
import { AccountsAddUserComponent } from './accounts-add-user/accounts-add-user.component';
import { JobBoardAccountComponent } from './job-board-account/job-board-account.component';
import { application } from 'express';
import { JobApplicationComponent } from './job-application/job-application.component';
import { BatchComponent } from './batch/batch.component';
import { TalentBenchComponent } from './talent-bench/talent-bench.component';
import { VendorComponent } from './vendor/vendor.component';
import { ViewvendorComponent } from './viewvendor/viewvendor.component';
import { AddvendorComponent } from './addvendor/addvendor.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { AllTimeListComponent } from './all-time-list/all-time-list.component';
import { AssignRoleComponent } from './assign-role/assign-role.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { AccountsAddRoleComponent } from './accounts-add-role/accounts-add-role.component';

const routes: Routes = [
  { path: 'dashboard/:traineeId', component: DashboardComponent, canActivate: [AuthGuard]  },
  { path: 'compliancedashboard', component: ComplianceDashboardComponent, canActivate: [AuthGuard]   },
  { path: 'candidateView/:traineeId', component: CandidateComponent, canActivate: [AuthGuard]   },
  { path: 'candidateView/31466/sitevisit', component: SiteVisitComponent, canActivate: [AuthGuard]   },
  { path: 'placementview', component: PlacementViewComponent, canActivate: [AuthGuard]   },
  { path: 'candidateView/:traineeId/create', component: PlacementViewComponent, canActivate: [AuthGuard]   },
  { path: 'search', component: SearchResumesComponent, canActivate: [AuthGuard]  },
  { path: 'search/cb', component: SearchResumesCBComponent , canActivate: [AuthGuard]  },
  { path: 'search/monster', component: SearchResumesMonsterComponent , canActivate: [AuthGuard]  },
  { path: 'search/jooble', component: SearchResumesJoobleComponent, canActivate: [AuthGuard]   },
  { path: 'search/dice', component: SearchResumesDiceComponent , canActivate: [AuthGuard]  },
  { path: 'search/integrated', component: IntegratedSearchComponent , canActivate: [AuthGuard]},
  { path: 'searchMain', component: SearchComponent , canActivate: [AuthGuard]},
  { path: 'onboarding', component: OnboardingComponent  , canActivate: [AuthGuard] },
  { path: 'onboardingList', component: OnboardingListComponent , canActivate: [AuthGuard]  },
  { path: 'onboard/1', component: ImportDetailsComponent  , canActivate: [AuthGuard] },
  { path: 'onboard/step/:id', component: WizardWorkflowComponent  , canActivate: [AuthGuard] },
  { path: 'onboard/employee/:id', component: EmployeeViewComponent , canActivate: [AuthGuard]  },
  { path: 'jobboards', component: JobBoardListComponent   , canActivate: [AuthGuard]},
  { path: 'create-project', component: CreateProjectComponent   , canActivate: [AuthGuard]},
  { path: 'alltimelist', component: AllTimeListComponent   , canActivate: [AuthGuard]},
  { path: 'division', component: DivisionComponent, canActivate: [AuthGuard] },
  { path: 'harvest', component: HarvestComponent, canActivate: [AuthGuard] },
  { path: 'harvestview/:id', component: HarvestViewComponent, canActivate: [AuthGuard] },
  { path: 'divisionaudit', component: DivisionAuditComponent, canActivate: [AuthGuard] },
  { path: 'adobesign', component: AdobesignComponent1   },
  { path: 'adobesign/token/:token', component: AdobesignComponent1 },
  { path: 'timesheetcreate', component: TimesheetCreateComponent },
  { path: 'searchtresume/reviewtresume/interview', component: InterviewComponent},
  { path: 'searchtresume/reviewtresume/submission', component: SubmissionComponent},
  { path: 'timesheet/viewdetails', component: ViewDetailsComponent },
  { path: 'searchtresume/reviewtresume/general', component: GeneralComponent },
  { path: 'Myjobs/createnewjob', component:  CreateNewJobsComponent },
  { path: 'viewdetails', component: ViewDetailsComponent },
  { path: 'allclient',component: AllclientComponent},
  { path: 'viewclient',component: ViewclientComponent},
  { path: 'organizationinfo' , component:OrganinfoComponent},
  { path: 'searchtresume' , component:SearchTresumeComponent},
  { path: 'financialinfo' , component:FinancialInfoComponent},
  { path: 'addclient',component: AddclientComponent},
  { path: 'viewclient',component: ViewclientComponent},
  { path: 'jobpostings',component:AllJobPostingsComponent},
  { path: 'jobapplication',component:JobApplicationComponent},
  { path: 'organizationinfo' , component:OrganinfoComponent},
  { path: 'applicantdetails', component:ApplicantDetailsComponent},
  { path: 'confirmpopup', component:ConfirmationPopupComponent},
  { path: 'jobboardaccount', component:JobBoardAccountComponent},
  { path: 'talentBench', component:TalentBenchComponent},
  { path: 'submittedcandidates', component:SubmittedCandiatesComponent},
  { path: 'reviewtresume', component:ReviewTresumeComponent},
  { path: 'adobesign', component: AdobesignComponent1   , canActivate: [AuthGuard]},
  { path: 'adobesign/token/:token', component: AdobesignComponent1  , canActivate: [AuthGuard] },
  { path: 'timesheet/viewdetails', component: ViewDetailsComponent, canActivate: [AuthGuard] },
  { path: 'hrms' , component:HrmsComponent, canActivate: [AuthGuard]},
  { path: 'accountsadduser', component:AccountsAddUserComponent},
  { path: 'accountsaddrole',component:AccountsAddRoleComponent},
  { path: 'login', component: LoginComponent},
  { path: 'profile',component:ProfileComponent},
  { path: 'information',component:InformationComponent},
  { path: 'password',component:PasswordComponent},
  { path: 'aboutme',component:AboutmeComponent},
  { path: 'batch',component:BatchComponent},
  { path: 'vendor',component:VendorComponent},
  { path: 'addadmin', component:AddAdminComponent},
  { path: 'viewvendor',component:ViewvendorComponent},
  { path: 'addvendor',component:AddvendorComponent},
  { path: 'assignrole',component:AssignRoleComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
