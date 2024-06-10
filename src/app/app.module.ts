import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { appInitializer, AppConfigService } from './security/app-preloader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationModule } from './navbar/navbar.module';
import { ChartsModule } from 'ng2-charts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AgGridModule } from 'ag-grid-angular';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CandidateComponent } from './candidate/candidate.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FileUploadModule } from 'primeng/fileupload';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyFieldStepper } from './stepper-type';
import { MatStepperModule } from '@angular/material/stepper';
import { FileValueAccessor } from './file-value-accessor';
import { FormlyFieldFile } from './file-type.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { SiteVisitComponent } from './candidate/site-visit.component';
import { PlacementViewComponent } from './candidate/placement-view.component';
import { SearchResumesComponent } from './job-boards/search-resumes.component';
import { SearchResumesCBComponent } from './job-boards/search-cb-resumes.component';
import { SearchResumesJoobleComponent } from './job-boards/search-jooble-resumes.component';
import { SearchResumesMonsterComponent } from './job-boards/search-monster-resumes.component';
import { SearchResumesDiceComponent } from './job-boards/search-dice-resumes.component';
import { IntegratedSearchComponent } from './job-boards/integrated-search.component';
import { SearchComponent } from './job-boards/search.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CookieService } from 'ngx-cookie-service';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { OnboardingListComponent } from './onboarding/onboarding-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { FinancialInfoComponent } from './financial-info/financial-info.component';
import { ProgressRenderer } from './onboarding/progress-cell.component'
import { ImportDetailsComponent } from './onboarding/onboarding-workflow/import-details.component';
import { EmployeeViewComponent } from './onboarding/onboarding-workflow/employee-view.component';
import { WizardWorkflowComponent } from './onboarding/onboarding-workflow/wizard-workflow.component';
import { EditorModule } from 'primeng/editor';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { ReportsModule } from './reports/reports.module';
import { ChipModule } from 'primeng/chip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { JobBoardListComponent } from './job-boards/job-board-list.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MatTabsModule } from '@angular/material/tabs';
import { SidebarModule } from 'primeng/sidebar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TabViewModule } from 'primeng/tabview';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ComplianceDashboardComponent } from './compliancedb/compliancedashboard.component';
import { GenderRenderer } from './candidate/list-renderer.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DivisionComponent } from './division/division.component';
import { DivisionAuditComponent } from './division-audit/division-audit.component';
import { HarvestComponent } from './harvest/harvest.component';
import { HarvestViewComponent } from './harvest/harvestview.component';
import { AdobesignComponent1 } from './adobesign/adobesign.component';
import { AdobesignComponent } from './onboarding/onboarding-workflow/adobe-sign.component';
import { CcpaPopupModule } from './onboarding/ccpa-popup.module';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { AppService } from './app.service';
import { RouterModule } from '@angular/router';
import { InterviewComponent } from './interview/interview.component';
import { SubmissionComponent } from './submission/submission.component';
import { GeneralComponent } from './general/general.component';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { CreateNewJobsComponent } from './create-new-jobs/create-new-jobs.component';
import { AllclientComponent } from './allclient/allclient.component';
import { AddclientComponent } from './addclient/addclient.component';
import { ViewclientComponent } from './viewclient/viewclient.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { AllJobPostingsComponent } from './all-job-postings/all-job-postings.component';
import { OrganinfoComponent } from './organinfo/organinfo.component';
import { SearchTresumeComponent } from './search-tresume/search-tresume.component';
import { HrmsComponent } from './hrms/hrms.component';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TalentBenchComponent } from './talent-bench/talent-bench.component';
import { MatSelectModule } from '@angular/material/select';

//import { jsPDF } from 'jspdf';

//import { jsPDF } from 'jspdf';

//import { jsPDF } from 'jspdf';

import { ApplicantDetailsComponent } from './applicant-details/applicant-details.component';
import { SubmittedCandiatesComponent } from './submitted-candiates/submitted-candiates.component';
import { JobBoardAccountComponent } from './job-board-account/job-board-account.component';
import { AccountsAddUserComponent } from './accounts-add-user/accounts-add-user.component';
import { ProfileComponent } from './profile/profile.component';
import { AboutmeComponent } from './aboutme/aboutme.component';
import { InformationComponent } from './information/information.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { ReviewTresumeComponent } from './review-tresume/review-tresume.component';
import { BatchComponent } from './batch/batch.component';
import { VendorComponent } from './vendor/vendor.component';
import { JobApplicationComponent } from './job-application/job-application.component';
import { ViewvendorComponent } from './viewvendor/viewvendor.component';
import { AddvendorComponent } from './addvendor/addvendor.component';
import { AllTimeListComponent } from './all-time-list/all-time-list.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { AssignRoleComponent } from './assign-role/assign-role.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { AccountsAddRoleComponent } from './accounts-add-role/accounts-add-role.component';
import { HomeComponent } from './landing-page/home/home.component';
import { AboutComponent } from './landing-page/about/about.component';
import { AtsComponent } from './landing-page/ats/ats.component';
import { MarketplaceComponent } from './landing-page/marketplace/marketplace.component';
import { ProductsComponent } from './landing-page/products/products.component';
import { TalentSuiteComponent } from './landing-page/talent-suite/talent-suite.component';
import { WorkforceComponent } from './landing-page/workforce/workforce.component';
import { FeaturesComponent } from './landing-page/features/features.component';
import { ContactComponent } from './landing-page/contact/contact.component';
import { TimesheetComponent } from './landing-page/timesheet/timesheet.component';
import { CareerBuilderComponent } from './landing-page/career-builder/career-builder.component';
import { DiceComponent } from './landing-page/dice/dice.component';
import { JobleeComponent } from './landing-page/joblee/joblee.component';
import { OptNationComponent } from './landing-page/opt-nation/opt-nation.component';
import { YahooComponent } from './landing-page/yahoo/yahoo.component';
import { CreateAllTimeListComponent } from './create-all-time-list/create-all-time-list.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { SearchResumesOptComponent } from './job-boards/search-opt-resumes.component';
import { LoginHomeHealthComponent } from './login/login-homehealth.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
// import { TimesheetViewdetailsComponent } from './timesheet-viewdetails/timesheet-viewdetails.component';
import { NgxLoadingModule } from 'ngx-loading';
import { AllInvoiceComponent } from './all-invoice/all-invoice.component';
import { PaymentComponent } from './all-invoice/payment/payment.component';
import { ArAgingReportComponent } from './ar-aging-report/ar-aging-report.component';
import { NewTimeSheetReportComponent } from './new-time-sheet-report/new-time-sheet-report.component';
import { SendInvoiceComponent } from './all-invoice/send-invoice/send-invoice.component';
import { DatePipe } from '@angular/common';
import { MonsterComponent } from './landing-page/monster/monster.component';
import { AdobeComponent } from './landing-page/adobe/adobe.component';
import { TruncatePipe } from './truncate.pipe';
import { TimeActivityComponent } from './all-invoice/time-activity/time-activity.component';
import { CreateStatementsComponent } from './all-invoice/create-statements/create-statements.component';
import { MultipleInvoicesComponent } from './all-invoice/multiple-invoices/multiple-invoices.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { InvoiceReportComponent } from './invoice-report/invoice-report.component';
import { CorporateDocumentComponent } from './corporate-document/corporate-document.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ClientViewDetailsComponent } from './client-view-details/client-view-details.component';
import { RecruiterViewJobsComponent } from './recruiter-view-jobs/recruiter-view-jobs.component';



@NgModule({
  declarations: [
    AppComponent,
    TalentBenchComponent,
    DashboardComponent,
    ComplianceDashboardComponent,
    CandidateComponent,
    SiteVisitComponent,
    SearchResumesComponent,
    SearchResumesCBComponent,
    SearchResumesOptComponent,
    SearchResumesJoobleComponent,
    SearchResumesMonsterComponent,
    SearchResumesDiceComponent,
    IntegratedSearchComponent,
    SearchComponent,
    JobBoardListComponent,
    FormlyFieldStepper,
    FileValueAccessor,
    FormlyFieldFile,
    OnboardingComponent,
    OnboardingListComponent,
    ProgressRenderer,
    ImportDetailsComponent,
    EmployeeViewComponent,
    WizardWorkflowComponent,
    PlacementViewComponent,
    GenderRenderer,
    DivisionComponent,
    DivisionAuditComponent,
    HarvestComponent,
    HarvestViewComponent,
    AdobesignComponent1,
    AdobesignComponent,
    LoginComponent,
    InterviewComponent,
    SubmissionComponent,
    GeneralComponent,
    ViewDetailsComponent,
    PasswordFormComponent,
    CreateNewJobsComponent,
    AllclientComponent,
    AddclientComponent,
    ViewclientComponent,
    AllJobPostingsComponent,
    OrganinfoComponent,
    ApplicantDetailsComponent,
    FinancialInfoComponent,
    SearchTresumeComponent,
    HrmsComponent,
    SubmittedCandiatesComponent,
    JobBoardAccountComponent,
    ProfileComponent,
    AboutmeComponent,
    InformationComponent,
    AccountsAddUserComponent,
    VendorComponent,
    ViewvendorComponent,
    AddvendorComponent,
    SubscriptionComponent,
    ReviewTresumeComponent,
    BatchComponent,
    JobApplicationComponent,
    AllTimeListComponent,
    CreateProjectComponent,
    AssignRoleComponent,
    AddAdminComponent,
    AccountsAddRoleComponent,
    HomeComponent,
    AboutComponent,
    AtsComponent,
    MarketplaceComponent,
    ProductsComponent,
    TalentSuiteComponent,
    WorkforceComponent,
    FeaturesComponent,
    ContactComponent,
    TimesheetComponent,
    CareerBuilderComponent,
    DiceComponent,
    JobleeComponent,
    OptNationComponent,
    YahooComponent,
    CreateAllTimeListComponent,
    ResetPasswordComponent,
    ForgetPasswordComponent,
    LoginHomeHealthComponent,
    CreateInvoiceComponent,
    AllInvoiceComponent,
      PaymentComponent,
      ArAgingReportComponent,
      NewTimeSheetReportComponent,
      MonsterComponent,
      AdobeComponent,
      SendInvoiceComponent,
      TruncatePipe,
      TimeActivityComponent,
      CreateStatementsComponent,
      MultipleInvoicesComponent,
      InvoiceReportComponent,
      CorporateDocumentComponent,
      ClientViewDetailsComponent,
      RecruiterViewJobsComponent,
    // TimesheetViewdetailsComponent

  ],
  imports: [
    HttpClientModule,
    NavigationModule,
    MatTableModule,
    MatIconModule,
    MatSortModule,
    BrowserModule,
    AppRoutingModule,
    ChartsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    MatCheckboxModule,
    CheckboxModule,
    ReportsModule,
    ChipModule,
    RadioButtonModule,
    MatTabsModule,
    SidebarModule,
    MatSidenavModule,
    TabViewModule,
    MessagesModule,
    MessageModule,
    NgxExtendedPdfViewerModule,
    OverlayPanelModule,
    InputTextModule,
    AutoCompleteModule,
    InputSwitchModule,
    CcpaPopupModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    AgGridModule.withComponents([]),
    AgGridModule.withComponents([ProgressRenderer]),
    AccordionModule.forRoot(),
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    FileUploadModule,
    EditorModule,
    ToastModule,
    RouterModule,
    MatSelectModule,
    ScrollingModule,
    NgxDatatableModule,
    FormlyModule.forRoot({ extras: { lazyRender: true } }),
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
      types: [
        { name: 'stepper', component: FormlyFieldStepper, wrappers: [] },
        { name: 'file', component: FormlyFieldFile, wrappers: ['form-field'] }
      ],
    }),
    FormlyBootstrapModule,
    MatStepperModule,
    ProgressSpinnerModule,
    MatDialogModule,
    DropdownModule,
    MultiSelectModule,
    MatSlideToggleModule,
    AlertModule.forRoot(),
    TypeaheadModule.forRoot(),
    ProgressbarModule.forRoot(),
    PaginationModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [CookieService, BsLocaleService, AuthGuard, AppService, AppConfigService,DatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AppConfigService],
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ProgressRenderer]
})
export class AppModule { }
