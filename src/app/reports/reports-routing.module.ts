import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { InterviewsReportComponent } from './interviews-report.component';
import { BenchTrackerReportComponent } from './bench-tracker-report.component';
import { PlacementsReportComponent } from './placements-report.component';
import { LegalStatusReportComponent } from './legal-status-report.component';
import { H1BExpiryReportComponent } from './h1bexpiry-report.component';
import { BillableEmpReportComponent } from './billableEmp-report.component';
import { DSRReportComponent } from './dsr-report.component';
import { NonH1BReportComponent } from './nonh1b-report.component';
import { ReportsHomeComponent } from './reports-home.component';
import { JobBoardAuditReportComponent } from './jobboard-audit-report.component';
import { ComplianceReportComponent } from './compliance-report.component';
import { TimesheetReportComponent } from './timesheet-report.component ';
import { PFAReportComponent } from './pfa-report.component';
import { DocExpiryReportComponent } from './doc-expiry-report.component';
import { JobBoardusageReportComponent } from './jobboard-usage-report.component';
import { PerformanceReportsComponent } from './performance-report.component';
const ReportRoutes: Routes = [
    /* {
        path: 'reports',
        component: ReportsHomeComponent,
        children: [
            { path: 'ftc', component: ReportsComponent }
        ]
    }, */
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
    { path: 'reports/jobboardusage', component: JobBoardusageReportComponent },
    { path: 'reports/performance', component: PerformanceReportsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ReportRoutes)],
    exports: [RouterModule]
})
export class ReportRoutingModule { }
