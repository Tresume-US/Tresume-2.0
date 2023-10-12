import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartsModule } from 'ng2-charts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
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
import { TimesheetCreateComponent } from './timesheet-create/timesheet-create.component';
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
//import { jsPDF } from 'jspdf';


//import { jsPDF } from 'jspdf';

//import { jsPDF } from 'jspdf';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ComplianceDashboardComponent,
    CandidateComponent,
    SiteVisitComponent,
    SearchResumesComponent,
    SearchResumesCBComponent,
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
    TimesheetCreateComponent,
    InterviewComponent,
    SubmissionComponent,
    GeneralComponent,
    ViewDetailsComponent,
    TimesheetCreateComponent,
    PasswordFormComponent,
    CreateNewJobsComponent,
    AllclientComponent,
    AddclientComponent,
    ViewclientComponent,
    AllJobPostingsComponent,
    OrganinfoComponent,
    FinancialInfoComponent,
    
    
  ],
  imports: [
    HttpClientModule,
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
    PaginationModule.forRoot()
  ],
  providers: [CookieService, AuthGuard, AppService],
  bootstrap: [AppComponent],
  entryComponents: [ProgressRenderer]
})
export class AppModule { }