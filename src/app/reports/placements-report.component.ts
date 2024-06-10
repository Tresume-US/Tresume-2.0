import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DashboardService, RequestItem } from '../dashboard/dashboard.service';
import { ReportsService } from './reports.service';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import * as XLSX from 'xlsx';



interface IRange {
    value: Date[];
    label: string;
}

@Component({
    selector: 'app-reports',
    templateUrl: './placements-report.component.html',
    styleUrls: ['./reports.component.scss'],
    providers: [DashboardService, ReportsService]
})
export class PlacementsReportComponent implements OnInit {

    public gridOptions: GridOptions = {};
    public gridApi: GridApi;
    name = new FormControl('');
    filterForm = new FormGroup({
        dates: new FormControl('', Validators.required),
        //recruiter: new FormControl('', Validators.required),
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
        { field: 'Name', sortable: true, filter: true, resizable: true },
        { field: 'Position', sortable: true, filter: true, resizable: true },
        { field: 'Recruiter Name', sortable: true, filter: true, resizable: true },
        { field: 'Marketer Name', sortable: true, filter: true, resizable: true },
        { field: 'Phone', sortable: true, filter: true, resizable: true },
        { field: 'Email ID', sortable: true, filter: true, resizable: true },
        { field: 'Legal Status', sortable: true, filter: true, resizable: true },
        { field: 'Status', sortable: true, filter: true, resizable: true },
        { field: 'Location constraint', sortable: true, filter: true, resizable: true },
        { field: 'Deal Offered', sortable: true, filter: true, resizable: true },
        { field: 'Notes', sortable: true, filter: true, resizable: true },
        { field: 'Client Address', sortable: true, filter: true, resizable: true },
    ];

    public startDate: any;
    public endDate: any;
    public traineeId: any;
    public recruiter: any = [];

    constructor(private http: HttpClient, private service: DashboardService, private reportService: ReportsService) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        this.startDate = this.dateFormatter(this.ranges[1].value[0]);
        this.endDate = this.dateFormatter(this.ranges[1].value[1]);
        sessionStorage.setItem("Route", 'Reports');
    }

    ngOnInit() {
        this.gridOptions = {
            rowData: this.rowData,
            columnDefs: this.columnDefs,
            pagination: true
        }
        this.getPlacements(this.startDate, this.endDate);
        //this.getAllRecruiters();
    }

    public onSubmit() {
        console.warn(this.filterForm.value);
    }


    public getPlacements(startDate?: string, endDate?: string) {
        let recruiterId = this.filterForm.get('recruiter')?.value
        let requestItem: any = {
            /*  organizationID: 9, */
            startDate: startDate,
            endDate: endDate,
            traineeId: this.traineeId,
            //recruiterId: recruiterId != 'All' ? recruiterId : undefined
        }
        this.reportService.getPlacementsReport(requestItem).subscribe(x => {
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
        this.getPlacements(this.startDate, this.endDate);
    }

    public onExport() {
        this.gridApi.exportDataAsCsv();
    }

    public onValueChange(value: any) {
        this.startDate = this.dateFormatter(value[0]);
        this.endDate = this.dateFormatter(value[1]);
        this.getPlacements(this.startDate, this.endDate);
    }

    public dateFormatter(value: any) {
        let formattedDate = formatDate(value, 'MM/dd/yyyy', "en-US");
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

      // ... other component properties and methods

  public pivotData: any[] = []; // Array to store pivoted data
  public pivotColumnDefs: ColDef[] = []; // Array to store pivot column definitions

  public onExportPivotCSV() {
    // 1. Generate Pivot Table Data
    this.pivotData = this.generatePivotTableData(this.rowData); // Replace with your logic to generate pivot table data

    // 2. Define Pivot Column Definitions (optional, adjust based on your analysis goals)
    this.pivotColumnDefs = [
      { field: 'Recruiter Name', headerName: 'Recruiter Name' }, 
      { field: 'Marketer Name', headerName: 'Marketer Name' }, 
      { field: 'count', valueGetter: 'getPlacementCount', headerName: 'Number of Placements' },
    ];

    // 3. Convert Pivot Table Data to CSV using XLSX library
    const csvData = this.convertPivotDataToCSV(this.pivotData, this.pivotColumnDefs);

    // 4. Trigger CSV Download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'placements_report_pivot.csv';
    link.click();
  }

  private generatePivotTableData(data: any[]): any[] {
    const pivotedData = [];

    // Iterate through original data and group/aggregate based on your requirements:
    for (const row of data) {
      const pivotRow: { // Define the type of pivotRow
        'Recruiter Name': string;
        'Marketer Name': string;
        count: number;
      } = {
        'Recruiter Name': row['Recruiter Name'], // Assuming you have a field named 'Recruiter Name'
        'Marketer Name': row['Marketer Name'] || 'N/A', // Optional: Include marketer if available, otherwise 'N/A'
        count: 1, // Assuming each row represents one placement
      };

      pivotedData.push(pivotRow);
    }

    return pivotedData;
  }

  private convertPivotDataToCSV(data: any[], columnDefs: ColDef[]): string {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const headerRow = columnDefs.map(colDef => colDef.headerName || colDef.field);
    XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: 'A1' });

    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    return csvContent;
  }
  
}