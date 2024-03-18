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
import { HomeComponent } from './landing-page/home/home.component';
import { AboutComponent } from './landing-page/about/about.component';
import { AtsComponent } from './landing-page/ats/ats.component';
import { WorkforceComponent } from './landing-page/workforce/workforce.component';
import { TalentSuiteComponent } from './landing-page/talent-suite/talent-suite.component';
import { ContactComponent } from './landing-page/contact/contact.component';
import { MarketplaceComponent } from './landing-page/marketplace/marketplace.component';
import { MonsterComponent } from './landing-page/monster/monster.component';
import { DiceComponent } from './landing-page/dice/dice.component';
import { CareerBuilderComponent } from './landing-page/career-builder/career-builder.component';
import { OptNationComponent } from './landing-page/opt-nation/opt-nation.component';
import { FeaturesComponent } from './landing-page/features/features.component';
import { TimesheetComponent } from './landing-page/timesheet/timesheet.component';
import { JobleeComponent } from './landing-page/joblee/joblee.component';
import { ProductsComponent } from './landing-page/products/products.component';
import { YahooComponent } from './landing-page/yahoo/yahoo.component';
import { AdobeComponent } from './landing-page/adobe/adobe.component';
import { ReportsHomeComponent } from './reports/reports-home.component';
import { BenchTrackerReportComponent } from './reports/bench-tracker-report.component';
import { BillableEmpReportComponent } from './reports/billableEmp-report.component';
import { ComplianceReportComponent } from './reports/compliance-report.component';
import { DocExpiryReportComponent } from './reports/doc-expiry-report.component';
import { DSRReportComponent } from './reports/dsr-report.component';
import { H1BExpiryReportComponent } from './reports/h1bexpiry-report.component';
import { InterviewsReportComponent } from './reports/interviews-report.component';
import { JobBoardAuditReportComponent } from './reports/jobboard-audit-report.component';
import { LegalStatusReportComponent } from './reports/legal-status-report.component';
import { NonH1BReportComponent } from './reports/nonh1b-report.component';
import { PFAReportComponent } from './reports/pfa-report.component';
import { PlacementsReportComponent } from './reports/placements-report.component';
import { ReportsComponent } from './reports/reports.component';
import { TimesheetReportComponent } from './reports/timesheet-report.component ';
import { CreateAllTimeListComponent } from './create-all-time-list/create-all-time-list.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { SearchResumesOptComponent } from './job-boards/search-opt-resumes.component';
import { LoginHomeHealthComponent } from './login/login-homehealth.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { AllInvoiceComponent } from './all-invoice/all-invoice.component';
import { PaymentComponent } from './all-invoice/payment/payment.component';
import { ArAgingReportComponent } from './ar-aging-report/ar-aging-report.component';
import { NewTimeSheetReportComponent } from './new-time-sheet-report/new-time-sheet-report.component';
import { SendInvoiceComponent } from './all-invoice/send-invoice/send-invoice.component';
import { TimeActivityComponent } from './all-invoice/time-activity/time-activity.component';
import { CreateStatementsComponent } from './all-invoice/create-statements/create-statements.component';
import { MultipleInvoicesComponent } from './all-invoice/multiple-invoices/multiple-invoices.component';
import { InvoiceReportComponent } from './invoice-report/invoice-report.component';
import { CorporateDocumentComponent } from './corporate-document/corporate-document.component';

const routes: Routes = [
  { path: 'dashboard/:traineeId', component: DashboardComponent, canActivate: [AuthGuard]  },
  { path: 'compliancedashboard', component: ComplianceDashboardComponent, canActivate: [AuthGuard]   },
  { path: 'candidateView/:traineeId', component: CandidateComponent, canActivate: [AuthGuard]   },
  { path: 'candidateView/:traineeId/sitevisit', component: SiteVisitComponent, canActivate: [AuthGuard]   },
  { path: 'placementview', component: PlacementViewComponent, canActivate: [AuthGuard]   },
  { path: 'candidateView/:traineeId/create/:routetype', component: PlacementViewComponent, canActivate: [AuthGuard]   },
  { path: 'candidateView/:traineeId/placement/:placementID', component: PlacementViewComponent, canActivate: [AuthGuard] },
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
  { path: 'onboard/employee/:id', component: EmployeeViewComponent },
  { path: 'jobboards', component: JobBoardListComponent   , canActivate: [AuthGuard]},
  { path: 'create-project', component: CreateProjectComponent   , canActivate: [AuthGuard]},
  { path: 'alltimelist', component: AllTimeListComponent   , canActivate: [AuthGuard]},
  { path: 'division', component: DivisionComponent, canActivate: [AuthGuard] },
  { path: 'harvest', component: HarvestComponent, canActivate: [AuthGuard] },
  { path: 'harvestview/:id', component: HarvestViewComponent, canActivate: [AuthGuard] },
  { path: 'divisionaudit', component: DivisionAuditComponent, canActivate: [AuthGuard] },
  { path: 'adobesign', component: AdobesignComponent1, canActivate: [AuthGuard]     },
  { path: 'adobesign/token/:token', component: AdobesignComponent1, canActivate: [AuthGuard]   },
  { path: 'searchtresume/reviewtresume/interview', component: InterviewComponent, canActivate: [AuthGuard]  },
  { path: 'searchtresume/reviewtresume/submission', component: SubmissionComponent, canActivate: [AuthGuard]  },
  { path: 'timesheet/viewdetails', component: ViewDetailsComponent, canActivate: [AuthGuard]   },
  { path: 'searchtresume/reviewtresume/general', component: GeneralComponent, canActivate: [AuthGuard]   },
  { path: 'Myjobs/createnewjob', component:  CreateNewJobsComponent, canActivate: [AuthGuard]   },
  { path: 'viewdetails', component: ViewDetailsComponent, canActivate: [AuthGuard]   },
  { path: 'allclient/:authType',component: AllclientComponent, canActivate: [AuthGuard]  },
  { path: 'viewclient/:authType',component: ViewclientComponent, canActivate: [AuthGuard]  },
  { path: 'organizationinfo' , component:OrganinfoComponent, canActivate: [AuthGuard]  },
  { path: 'searchtresume' , component:SearchTresumeComponent, canActivate: [AuthGuard]  },
  { path: 'financialinfo' , component:FinancialInfoComponent, canActivate: [AuthGuard]  },
  { path: 'addclient/:authType',component: AddclientComponent, canActivate: [AuthGuard]  },
  // { path: 'viewclient',component: ViewclientComponent, canActivate: [AuthGuard]  },
  { path: 'jobpostings',component:AllJobPostingsComponent, canActivate: [AuthGuard]  },
  { path: 'jobapplication',component:JobApplicationComponent, canActivate: [AuthGuard]  },
  { path: 'organizationinfo' , component:OrganinfoComponent, canActivate: [AuthGuard]  },
  { path: 'applicantdetails/:jobID', component:ApplicantDetailsComponent, canActivate: [AuthGuard]  },
  { path: 'jobboardaccount', component:JobBoardAccountComponent, canActivate: [AuthGuard]  },
  { path: 'talentBench', component:TalentBenchComponent, canActivate: [AuthGuard]  },
  { path: 'submitted-candidates/:jobId', component:SubmittedCandiatesComponent, canActivate: [AuthGuard]  },
  { path: 'reviewtresume/:routeType/:traineeID/:tabIndex', component:ReviewTresumeComponent, canActivate: [AuthGuard]  },
  // { path: 'reviewtresume/:traineeID', component:ReviewTresumeComponent, canActivate: [AuthGuard]  },
  { path: 'adobesign', component: AdobesignComponent1   , canActivate: [AuthGuard]},
  { path: 'adobesign/token/:token', component: AdobesignComponent1  , canActivate: [AuthGuard] },
  { path: 'timesheet/viewdetails', component: ViewDetailsComponent},
  { path: 'viewtimesheet/:id', component: ViewDetailsComponent },
  { path: 'timesheet/viewdetails/:traineeID/:row', component: ViewDetailsComponent },
  { path: 'candidates/:routeType' , component:HrmsComponent, canActivate: [AuthGuard]},
  { path: 'accountsadduser', component:AccountsAddUserComponent, canActivate: [AuthGuard]  },
  { path: 'accountsaddrole',component:AccountsAddRoleComponent, canActivate: [AuthGuard]  },
  { path: 'login', component: LoginComponent},
  { path: 'profile',component:ProfileComponent},
  { path: 'information',component:InformationComponent},
  { path: 'password',component:PasswordComponent},
  { path: 'aboutme',component:AboutmeComponent},
  { path: 'batch',component:BatchComponent},
  { path: 'vendor/:authType',component:VendorComponent, canActivate: [AuthGuard] },
  { path: 'addadmin', component:AddAdminComponent,canActivate: [AuthGuard]},
  { path: 'viewvendor',component:ViewvendorComponent},
  { path: 'addvendor',component:AddvendorComponent},
  { path: 'assignrole',component:AssignRoleComponent},
  { path: '',component:HomeComponent},
  { path: 'about',component:AboutComponent},
  { path: 'ats',component:AtsComponent},
  { path: 'workforce',component:WorkforceComponent},
  { path: 'talent-suite',component:TalentSuiteComponent},
  { path: 'contact',component:ContactComponent},
  { path: 'contact',component:ContactComponent},
  { path: 'market',component:MarketplaceComponent},
  { path: 'monster',component:MonsterComponent},
  { path: 'dice',component:DiceComponent},
  { path: 'career',component:CareerBuilderComponent},
  { path: 'opt-nation',component:OptNationComponent},
  {path:'features',component:FeaturesComponent},
  {path:'timesheet',component:TimesheetComponent},
  {path:'opt',component:OptNationComponent},
  {path:'product',component:ProductsComponent},
  {path:'joble',component:JobleeComponent},
  {path:'yahoo',component:YahooComponent},
  {path:'adobe',component:AdobeComponent},
  { path: 'createalltimelist', component: CreateAllTimeListComponent },
  { path: 'reports', component: ReportsHomeComponent },
  { path: 'reports/ftc', component: ReportsComponent },
  { path: 'reports/interviews', component: InterviewsReportComponent },
  { path: 'reports/benchtracker', component: BenchTrackerReportComponent },
  { path: 'reports/placements', component: PlacementsReportComponent },
  { path: 'reports/legalstatus', component: LegalStatusReportComponent },
  { path: 'reports/h1bexpiry', component: H1BExpiryReportComponent },
  { path: 'reports/timesheet', component: TimesheetReportComponent },
  { path: 'reports/billable', component: BillableEmpReportComponent },
  { path: 'reports/nonh1b', component: NonH1BReportComponent },
  { path: 'reports/dsr', component: DSRReportComponent },
  { path: 'reports/jobboardaudit', component: JobBoardAuditReportComponent },
  { path: 'reports/compliance', component: ComplianceReportComponent },
  { path: 'reports/pfa', component: PFAReportComponent },
  { path: 'reports/docexpiry', component: DocExpiryReportComponent },
  { path: 'resetpassword/:resetkey', component: ResetPasswordComponent  },
  { path: 'forgetPassword', component: ForgetPasswordComponent },
  { path: 'search/opt', component: SearchResumesOptComponent, canActivate: [AuthGuard] },
  { path: 'homehealth/login', component: LoginHomeHealthComponent },
  { path: 'create-invoice', component: CreateInvoiceComponent },
  { path: 'all-invoice', component: AllInvoiceComponent },
  { path: 'invoice-report', component: InvoiceReportComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'tsreport', component: NewTimeSheetReportComponent },
  { path: 'reports/ar-aging-report', component: ArAgingReportComponent },

  { path: 'send-invoice', component: SendInvoiceComponent },
  { path: 'time-activity', component: TimeActivityComponent },
  { path: 'create-statements', component: CreateStatementsComponent },
  { path: 'multiple-invoices', component: MultipleInvoicesComponent },
  { path: 'corpdocument', component: CorporateDocumentComponent },
  // { path: '', redirectTo: 'homelanding', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' }, 
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
