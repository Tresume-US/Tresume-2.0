import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DashboardService, RequestItem } from '../dashboard/dashboard.service';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { CookieService } from 'ngx-cookie-service';

interface IRange {
  value: Date[];
  label: string;
}

@Component({
  selector: 'app-performancereports',
  templateUrl: './performance-report.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [DashboardService,CookieService]
})
export class PerformanceReportsComponent implements OnInit {
  loading: boolean = false;

  public gridOptions: GridOptions = {};
  public gridApi: GridApi;
  name = new FormControl('');
  filterForm = new FormGroup({
    dates: new FormControl('', Validators.required),
    recruiter: new FormControl('', Validators.required),
    candidateStatus: new FormControl('')
  });

  //rowData: Observable<any[]>;
  rowData: any;
  public ranges: IRange[] = [{
    value: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
    label: 'Last 7 Days'
  }, {
    value: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
    label: 'Last 30 Days'
  }, {
    value: [new Date(new Date().setDate(new Date().getDate() - 90)), new Date()],
    label: 'Last 90 Days'
  }];

  columnDefs = [
    { field: 'Date', sortable: true, filter: true, resizable: true, sort: 'desc' },
    { field: 'Recruiter', sortable: true, filter: true, resizable: true },
    { field: 'Candidate Name', sortable: true, filter: true, resizable: true },
    { field: 'Referral', sortable: true, filter: true, resizable: true },
    { field: 'Contact Number', sortable: true, filter: true, resizable: true },
    { field: 'Visa Status', sortable: true, filter: true, resizable: true },
    { field: 'Status Expiration Date', sortable: true, filter: true, resizable: true },
    { field: 'Gender', sortable: true, filter: true, resizable: true, width: 100 },
    { field: 'Email', sortable: true, filter: true, resizable: true },
    { field: 'Current Location', sortable: true, filter: true, resizable: true },
    { field: 'Location constraint', sortable: true, filter: true, resizable: true },
    { field: 'Status', sortable: true, filter: true, resizable: true },
    { field: 'Notes', sortable: true, filter: true, resizable: true },
    { field: 'FTC Notes', sortable: true, filter: true, resizable: true },
  ];

  candidateStatus = [
    { id: 1, name: 'On Training' },
    { id: 2, name: 'Direct Marketing' },
    { id: 3, name: 'Requirement Based Marketing/Sourcing' },
    { id: 4, name: 'On Bench' },
    { id: 5, name: 'Marketing On Hold' },
    { id: 6, name: 'Has Offer' },
    { id: 7, name: 'Placed/Working at Client Location' },
    { id: 8, name: 'First Time Caller' },
    { id: 9, name: 'Dropped - Training' },
    { id: 10, name: 'Dropped - Marketing' },
    { id: 11, name: 'Dropped - Other' },
    { id: 12, name: 'Terminate' },
    { id: 13, name: 'Replaced at Client site' }
  ];

  public startDate: any;
  public endDate: any;
  public traineeId: any;
  public recruiter: any = [];
  submissionlist: any;
  placementlist: any;
  interviewlist: any;
  OrgID: any;

  constructor(private http: HttpClient, private service: DashboardService,private cookieService: CookieService,) {
    this.traineeId = sessionStorage.getItem("TraineeID");
    this.startDate = this.dateFormatter(this.ranges[1].value[0]);
    this.endDate = this.dateFormatter(this.ranges[1].value[1]);
    sessionStorage.setItem("Route", 'Reports');
  }

  ngOnInit() {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.gridOptions = {
      rowData: this.rowData,
      columnDefs: this.columnDefs,
      pagination: true
    }
    /* if (this.gridOptions.api) {
      this.gridOptions.api.sizeColumnsToFit();
    } */

    this.filterForm.controls['dates'].setValue([this.ranges[1].value[0], this.ranges[1].value[1]])
    this.filterForm.controls['recruiter'].setValue('All')
    this.filterForm.controls['candidateStatus'].setValue('8')
    this.getperformancereport(this.startDate, this.endDate);
    this.getAllRecruiters();
  }

  public onSubmit() {
    console.warn(this.filterForm.value);
  }


  public getperformancereport(startDate?: string, endDate?: string) {
    let recruiterId = this.filterForm.get('recruiter')?.value
    let candidateStatus = this.filterForm.get('candidateStatus')?.value
    let requestItem: any = {
      fromDate: startDate,
      toDate: endDate,
      recruiterId: recruiterId ,
      orgID:this.OrgID
    }
    this.service.getperformancereport(requestItem).subscribe(x => {
      let response = x;
      
      if (response) {
        this.rowData = response;
        this.submissionlist = response.submissionlist
        this.placementlist = response.placementlist
        this.interviewlist = response.interviewlist
        console.log(this.submissionlist);
        this.sizeToFit();
      }
    });
  }

  public getAllRecruiters() {
    this.service.getAllRecruiters(this.traineeId).subscribe(x => {
      let response = x.result;
      if (response) {
        this.recruiter = response;
        console.log(response);
      }
    this.loading = false;

    });
  }

  public sizeToFit() {
    let ids: string[] = [];
    this.columnDefs.forEach(column => {
      ids.push(column.field || "");
    });
    if (this.gridOptions.columnApi) {
      this.gridOptions.columnApi.autoSizeColumns(ids);
    }
    if (this.gridOptions.api) {
      this.gridOptions.api.sizeColumnsToFit();
    }
  }

  public onFilter() {
    this.getperformancereport(this.startDate, this.endDate);
  }

  public onExport() {
    this.gridApi.exportDataAsCsv();
  }

  public onValueChange(value: any) {
    this.startDate = this.dateFormatter(value[0]);
    this.endDate = this.dateFormatter(value[1]);
  }

  public dateFormatter(value: any) {
    let formattedDate = formatDate(value, 'yyyy-MM-dd', "en-US");
    return formattedDate;
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    //this.gridColumnApi = params.columnApi;
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: Event) {
    setTimeout(() => {

      this.sizeToFit();

    }, 10);
  }




}
