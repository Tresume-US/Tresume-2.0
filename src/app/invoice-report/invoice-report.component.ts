import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { InvoiceReportService } from './invoice-report.service';
import * as html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { NewTimeSheetReportService } from '../new-time-sheet-report/new-time-sheet-report.service'
@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html',
  styleUrls: ['./invoice-report.component.scss'],
  providers: [CookieService,InvoiceReportService , MessageService,NewTimeSheetReportService],
})
export class InvoiceReportComponent implements OnInit {

  showExportOptions: boolean = false;
  selection: string = 'All';
  options = ['All','This week','This Month','Customize'];
  title: string = "ASTA CRS INC";
  OrgID:string = '';
  subTitle: string = "Invoice List";
  TraineeID:string = '';
  timesheetrole:string = '';
  showNotes: boolean = false;
  fromDate: Date;
  toDate: Date;
  candidateid:any =0;
  candidatelistname:any;
  tableData: { }[] = [];

  notes: string = '';
  loading: boolean = false;

  constructor(private cookieService: CookieService,private messageService: MessageService, private service:InvoiceReportService,private request:NewTimeSheetReportService) { 
    this.OrgID = this.cookieService.get('OrgID');

    this.fromDate = new Date();
    this.toDate = new Date();
   }

  ngOnInit(): void {  
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.timesheetrole = this.cookieService.get('timesheet_role');
    this.loading=true;
    this.fetchinvoicereport();
    this.candidatelist();
  }

  candidatelist(){
    let Req = {
     OrgId : this.OrgID,
     timesheetrole: this.timesheetrole,
     TraineeID:this.TraineeID
    };
    this.service.invoiceCandidatetList(Req).subscribe((x: any) => {
      this.candidatelistname = x.result;
    });
  }

  toggleExportOptions() {
    this.showExportOptions = !this.showExportOptions;
  }

  isCustomizeSelected(): boolean {
    return this.selection === 'Customize';
    }

  toggleNotes(event: Event) {
    event.preventDefault(); 
    this.showNotes = !this.showNotes;
  }

 InvoiceReport: any [] = [];
   
 fetchinvoicereport(){
  let Req = {
    OrgID: this.OrgID,
  };
  this.service.getInvoiceReport(Req).subscribe((x: any) => {
    this.InvoiceReport = x.result;
    this.loading = false;
  });
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
  

  calculateOpenBalance(total: string, receivedamt: string): number {
    // Convert total and receivedamt to numbers using parseFloat
    const totalAmount: number = parseFloat(total);
    const receivedAmount: number = parseFloat(receivedamt);
  
    // Calculate the open balance
    const openBalance: number = totalAmount - receivedAmount;
  
    // Return the open balance
    return openBalance;
  }

  
  runReport(): void {
    let Req: any = {
      OrgID: this.OrgID,
      startdate: '',
      enddate: '',
      candidateid:this.candidateid,
      timesheetrole: this.timesheetrole,
      TraineeID:this.TraineeID
    };
    this.service.getInvoiceReport(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.loading = false;
      this.fetchinvoicereport();
    });
      }
  


}
