import { Component, OnInit } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { formatDate } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { NewTimeSheetReportService} from './new-time-sheet-report.service';

@Component({
  selector: 'app-new-time-sheet-report',
  templateUrl: './new-time-sheet-report.component.html',
  styleUrls: ['./new-time-sheet-report.component.scss'],
  providers: [ NewTimeSheetReportService, CookieService,MessageService],
})
export class NewTimeSheetReportComponent implements OnInit {
  loading:boolean = false;
  showNotes: boolean = false;
  notes: string = '';
  sort_mode: any;
  sortOptionsList: any;
  sort_by: any;
  showSortingOptions = false;
  OrgID:string = '';
  TraineeID:string = '';

  maxSelectableDays: number;
  showExportOptions: boolean = false;
  selectedDateRange: Date[] = [];
  noResultsFound:boolean = true;
  timesheetrole: any;
  sortbyoptions = ['Activity Date', 'Client', 'product', 'Description', 'Rate', 'Duration', 'Billable'];


  options = ['All','This week','This Month','Customize'];



  // The current selection from the dropdown
  selection: string = 'All';

  // Method to check if 'Customize' is selected
  isCustomizeSelected(): boolean {
    return this.selection === 'Customize';
  }
  
  
  tableData = [
    { activeDate: '', client: '', product: '', description: '', rates: '', duration: '', billable: '' },
    ];



  ngOnInit(): void { 
    this.loading = true;
    this.fromDate = this.getFirstDayOfMonth();
    this.toDate = this.getLastDayOfMonth();
    this.fetchtimesheetreport();

    
  this.OrgID = this.cookieService.get('OrgID');
  // this.JobID = this.cookieService.get('userName1');
  this.TraineeID = this.cookieService.get('TraineeID');  
  this.timesheetrole = this.cookieService.get('timesheet_role');
  }

  constructor(private cookieService: CookieService, private service:NewTimeSheetReportService,private messageService: MessageService) {


   }

 
   
fetchtimesheetreport(){
  let Req = {
    traineeID: this.TraineeID,
    timesheetrole:this.timesheetrole
  };
  this.service.getTimesheetReport(Req).subscribe((x: any) => {
    this.tableData = x.result;
    this.noResultsFound = this.tableData.length === 0;
  this.loading = false;
  
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

  getTotalDuration(): string {
    let totalMinutes = 0;

    for (const row of this.tableData) {
      if (row.duration) {
        const durationParts = row.duration.split(':');
        const hours = parseInt(durationParts[0], 10);
        const minutes = parseInt(durationParts[1], 10);
        totalMinutes += hours * 60 + minutes;
      }
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${totalHours}:${remainingMinutes}`;
  }

  exportAsPDF() {
    console.log('Exporting as PDF');
    this.showExportOptions = false;
  }

  exportAsExcel() {
    console.log('Exporting as Excel');
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

  getFirstDayOfMonth(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  getLastDayOfMonth(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }


  runReport(): void {
    if (this.isCustomizeSelected() && this.fromDate && this.toDate) {
     
      // this.fetchData(this.fromDate, this.toDate);
      console.log('Running report from', this.fromDate, 'to', this.toDate);
    } else {
      
      // this.fetchAllData();
      console.log('Running report for all data');
    }
  }
}
