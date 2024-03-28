import { Component, OnInit } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { formatDate } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { NewTimeSheetReportService } from './new-time-sheet-report.service';
import * as html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-new-time-sheet-report',
  templateUrl: './new-time-sheet-report.component.html',
  styleUrls: ['./new-time-sheet-report.component.scss'],
  providers: [NewTimeSheetReportService, CookieService, MessageService],
})
export class NewTimeSheetReportComponent implements OnInit {

  showNotes: boolean = false;
  notes: string = '';
  sort_mode: any;
  sortOptionsList: any;
  sort_by: any;
  showSortingOptions = false;
  OrgID: string = '';
  TraineeID: string = '';
  startdate: Date;
  enddate: Date;
  maxSelectableDays: number;
  showExportOptions: boolean = false;
  selectedDateRange: Date[] = [];
  loading: boolean = false;
  noResultsFound: boolean = true;
  timesheetrole: any;
  sortbyoptions = ['Activity Date', 'Client', 'product', 'Description', 'Rate', 'Duration', 'Billable'];

  sumOfHours: number = 0;
  sumOfRate: number = 0;

  options = ['All', 'This week', 'This Month', 'Customize'];



  // The current selection from the dropdown
  selection: string = 'All';

  // Method to check if 'Customize' is selected
  isCustomizeSelected(): boolean {
    return this.selection === 'Customize';
  }
  tableData: { totalhrs: any ,totalamt:any }[] = [];

  ngOnInit(): void {
    this.candidatelist();
    this.fromDate = this.getFirstDayOfMonthUTC();
    this.toDate = this.getLastDayOfMonthUTC();
    this.fetchtimesheetreport();

    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.timesheetrole = this.cookieService.get('timesheet_role');
  }

  constructor(private cookieService: CookieService, private service: NewTimeSheetReportService, private messageService: MessageService) {
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.timesheetrole = this.cookieService.get('timesheet_role');
  }

  selectedItem: any;
  candidatelistname: any;
  candidateid: any = 0;

  candidatelist() {
    let Req = {
      OrgId: this.OrgID,
    };
    this.service.reportCandidatetList(Req).subscribe((x: any) => {
      this.candidatelistname = x.result;
    });
  }

  fetchtimesheetreport() {
    let Req = {
      OrgID: this.OrgID,
    };
    this.service.getTimesheetReport(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.loading = false;
      this.calculateSum();
    });
  }

  toggleSortingOptions(event: Event) {
    event.preventDefault();
    this.showSortingOptions = !this.showSortingOptions;
  }

  toggleNotes(event: Event) {
    event.preventDefault();
    this.showNotes = !this.showNotes;
  }

  closeNotes() {
    this.showNotes = false;
  }

  // getTotalDuration(): string {
  //   let totalMinutes = 0;

  //   for (const row of this.tableData) {
  //     if (row.duration) {
  //       const durationParts = row.duration.split(':');
  //       const hours = parseInt(durationParts[0], 10);
  //       const minutes = parseInt(durationParts[1], 10);
  //       totalMinutes += hours * 60 + minutes;
  //     }
  //   }

  //   const totalHours = Math.floor(totalMinutes / 60);
  //   const remainingMinutes = totalMinutes % 60;

  //   return `${totalHours}:${remainingMinutes}`;
  // }

  toggleExportOptions() {
    this.showExportOptions = !this.showExportOptions;
  }
  exportAsPDF(): void {
    const element = document.getElementById('export-content');
    const notesContent = this.notes ? `Notes: ${this.notes}` : ''; // Add notes content if available
    const htmlContent = element ? element.innerHTML + notesContent : ''; // Concatenate element HTML with notes content
    html2pdf().from(htmlContent).save();
    this.showExportOptions = false;
  }


  exportAsExcel(): void {
    const element = document.getElementById('export-content');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    // Get notes content
    const notesContent = this.notes ? `Notes: ${this.notes}` : '';

    // Decode range if !ref is defined, otherwise set a default range
    let range = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };

    // Calculate the next row for the notes
    const nextRow = range.e.r + 2;

    // Add notes content to the Excel sheet
    ws[`A${nextRow}`] = { t: 's', v: notesContent };

    // Update range to include the new notes row
    range.e.r++;

    // Update !ref property with the new range
    ws['!ref'] = XLSX.utils.encode_range(range);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'export.xlsx');
    this.showExportOptions = false;

  }




  fromDate: Date;
  toDate: Date;
  title: string = "ASTA CRS INC";
  subTitle: string = "Time Activities By Employees";
  isEditMode: boolean = false;

  formatDate(date: Date): string {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return `${monthNames[date.getMonth()]} ${date.getDate()}-${this.toDate.getDate()}, ${date.getFullYear()}`;
  }

  getFirstDayOfMonthUTC(): Date {
    let today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  }

  // Function to get the last day of the month in UTC
  getLastDayOfMonthUTC(): Date {
    let today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
  }
  runReport(): void {
    let Req: any = {
      OrgID: this.OrgID,
      startdate: '',
      enddate: '',
      candidateid: this.candidateid
    };

    if (this.isCustomizeSelected() && this.fromDate && this.toDate) {
      Req.startdate = this.fromDate.toISOString();
      Req.enddate = this.toDate.toISOString();
    } else if (this.selection === 'This week') {
      let today = new Date();
      let startOfWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay()));
      let endOfWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + (6 - today.getUTCDay())));
      Req.startdate = startOfWeek.toISOString();
      Req.enddate = endOfWeek.toISOString();
    } else if (this.selection === 'This Month') {
      let today = new Date();
      let startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      let endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
      Req.startdate = startOfMonth.toISOString();
      Req.enddate = endOfMonth.toISOString();
    }

    this.service.getTimesheetReport(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.loading = false;
      this.calculateSum();

    });
  }

  calculateSum() {
    this.sumOfHours = 0;
    this.sumOfRate = 0;
    
    this.tableData.forEach(row => {
      this.sumOfHours += parseFloat(row.totalhrs) || 0;
      this.sumOfRate += parseFloat(row.totalamt) || 0;
    });
  }
  
}