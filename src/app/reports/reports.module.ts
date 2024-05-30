import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReportRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { InterviewsReportComponent } from './interviews-report.component';
import { BenchTrackerReportComponent } from './bench-tracker-report.component';
import { PlacementsReportComponent } from './placements-report.component';
import { LegalStatusReportComponent } from './legal-status-report.component';
import { H1BExpiryReportComponent } from './h1bexpiry-report.component';
import { BillableEmpReportComponent } from './billableEmp-report.component';
import { NonH1BReportComponent } from './nonh1b-report.component';
import { DSRReportComponent } from './dsr-report.component';
import { JobBoardAuditReportComponent } from './jobboard-audit-report.component';
import { ComplianceReportComponent } from './compliance-report.component';
import { PFAReportComponent } from './pfa-report.component';
import { DocExpiryReportComponent } from './doc-expiry-report.component';
import { AgGridModule } from 'ag-grid-angular';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimesheetReportComponent } from './timesheet-report.component ';
import { JobBoardusageReportComponent } from './jobboard-usage-report.component';
import { PerformanceReportsComponent } from './performance-report.component';
@NgModule({
    imports: [
        CommonModule,
        ReportRoutingModule,
        AgGridModule.withComponents([]),
        FormsModule,
        ReactiveFormsModule,
        AccordionModule.forRoot(),
        FormlyModule,
        FormlyBootstrapModule,
        BsDatepickerModule
    ],
    declarations: [
        ReportsComponent,
        InterviewsReportComponent,
        BenchTrackerReportComponent,
        PlacementsReportComponent,
        LegalStatusReportComponent,
        H1BExpiryReportComponent,
        TimesheetReportComponent,
        BillableEmpReportComponent,
        NonH1BReportComponent,
        DSRReportComponent,
        JobBoardAuditReportComponent,
        ComplianceReportComponent,
        PFAReportComponent,
        DocExpiryReportComponent,
        JobBoardusageReportComponent,
        PerformanceReportsComponent
    ],
    providers: []
})
export class ReportsModule { }
