import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DashboardService, RequestItem } from '../dashboard/dashboard.service';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { CookieService } from 'ngx-cookie-service';
import * as XLSX from 'xlsx';


interface IRange {
  value: Date[];
  label: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [DashboardService]
})
export class ReportsComponent implements OnInit {
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

  constructor(private http: HttpClient, private service: DashboardService) {
    this.traineeId = sessionStorage.getItem("TraineeID");
    this.startDate = this.dateFormatter(this.ranges[1].value[0]);
    this.endDate = this.dateFormatter(this.ranges[1].value[1]);
    sessionStorage.setItem("Route", 'Reports');
  }

  ngOnInit() {
    this.loading = true;
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
    this.getFTCDetails(this.startDate, this.endDate);
    this.getAllRecruiters();
  }

  public onSubmit() {
    console.warn(this.filterForm.value);
  }


  public getFTCDetails(startDate?: string, endDate?: string) {
    let recruiterId = this.filterForm.get('recruiter')?.value
    let candidateStatus = this.filterForm.get('candidateStatus')?.value
    let requestItem: any = {
      /*  organizationID: 9, */
      fromDate: startDate,
      toDate: endDate,
      traineeId: this.traineeId,
      recruiterId: recruiterId != 'All' ? recruiterId : undefined,
      candidateStatus: candidateStatus != 'All' ? candidateStatus : undefined
    }
    this.service.getFTCreport(requestItem).subscribe(x => {
      let response = x.result;
      if (response) {
        this.rowData = response;
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
    this.getFTCDetails(this.startDate, this.endDate);
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
  public pivotData: any[] = [];
  public pivotColumnDefs: ColDef[] = [];

  public onExportPivotCSV() {
      const originalCsvData: string | undefined = this.gridApi.getDataAsCsv();

      if (!originalCsvData) {
          console.error('Failed to export original FTC data');
          return;
      }

      const originalRows = originalCsvData.split('\n');
      const rowCount = originalRows.length - 1;

      for (let i = 0; i < 3; i++) {
          originalRows.push('');
      }

      this.pivotData = this.generatePivotTableData(this.rowData);

      console.log(this.rowData)

      this.pivotColumnDefs = [
          { field: 'Recruiter Name', headerName: 'Recruiter Name' },
          { field: 'count', headerName: 'Number of FTC' },
      ];

      const pivotCsvData = this.convertPivotDataToCSV(this.pivotData, this.pivotColumnDefs);

      const pivotRows = pivotCsvData.split('\n').filter(row => row.trim() !== '');

      const combinedCsvData = pivotRows.join('\n') + '\n\n\n' + originalRows.join('\n');

      const blob = new Blob([combinedCsvData], { type: 'text/csv;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'FTC_report_pivot.csv';
      link.click();
  }

  private generatePivotTableData(data: any[]): any[] {
      const pivotedData: any[] = [];

      const pivotMap = new Map<string, any>();

      for (const row of data) {
          const recruiterName = row['Recruiter']|| 'N/A';

          const key = `${recruiterName}`;
          if (pivotMap.has(key)) {
              pivotMap.get(key).count += 1;
          } else {
              pivotMap.set(key, {
                  'Recruiter Name': recruiterName,
                  count: 1
              });
          }
      }

      pivotMap.forEach((value) => {
          pivotedData.push(value);
      });

      return pivotedData;
  }

  private convertPivotDataToCSV(data: any[], columnDefs: any[]): string {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const headerRow = columnDefs.map(colDef => colDef.headerName || colDef.field);
      XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: 'A1' });

      const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
      for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ c: C, r: 0 });
          if (!worksheet[address]) continue;
          worksheet[address].s = {
              fill: { fgColor: { rgb: "FFFFE0" } },
              font: { bold: true }
          };
      }

      const columnWidths = data.reduce((widths, row) => {
          columnDefs.forEach((colDef, index) => {
              const value = row[colDef.field] ? row[colDef.field].toString() : '';
              widths[index] = Math.max(widths[index], value.length);
          });
          return widths;
      }, columnDefs.map(colDef => colDef.headerName.length));

      worksheet['!cols'] = columnWidths.map((w: number) => ({ wch: w + 2 }));

      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      return csvContent;
  }
}
