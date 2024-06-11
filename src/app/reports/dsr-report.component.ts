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
    templateUrl: './dsr-report.component.html',
    styleUrls: ['./reports.component.scss'],
    providers: [DashboardService, ReportsService]
})
export class DSRReportComponent implements OnInit {

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
        { field: 'SubmissionID', headerName: 'Submission ID', sortable: true, filter: true, resizable: true },
        { field: 'CandidateName', headerName: 'Candidate Name', sortable: true, filter: true, resizable: true },
        { field: 'MarketerName', headerName: 'Marketer Name', sortable: true, filter: true, resizable: true },
        { field: 'Title', sortable: true, filter: true, resizable: true },
        { field: 'SubmissionDate', headerName: 'Submission Date', sortable: true, filter: true, resizable: true },
        { field: 'VendorName', headerName: 'Vendor Name', sortable: true, filter: true, resizable: true },
        { field: 'ClientName', headerName: 'Client Name', sortable: true, filter: true, resizable: true },
        { field: 'Note', sortable: true, filter: true, resizable: true },
        { field: 'Rate', sortable: true, filter: true, resizable: true }
    ];

    public startDate: any;
    public endDate: any;
    public traineeId: any;
    public recruiter: any = [];

    constructor(private http: HttpClient, private service: DashboardService, private reportService: ReportsService) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        this.startDate = this.dateFormatter(this.ranges[1].value[1]);
        this.endDate = this.dateFormatter(this.ranges[1].value[0]);
        console.log(this.ranges);
        sessionStorage.setItem("Route", 'Reports');
    }

    ngOnInit() {
        this.gridOptions = {
            rowData: this.rowData,
            columnDefs: this.columnDefs,
            pagination: true
        }
        
        this.getInterviews(this.startDate, this.endDate);
        //this.getAllRecruiters();
    }

    public onSubmit() {
        console.warn(this.filterForm.value);
    }


    public getInterviews(startDate?: string, endDate?: string) {
        let recruiterId = this.filterForm.get('recruiter')?.value
        let requestItem: any = {
            /*  organizationID: 9, */
            startDate: startDate,
            endDate: endDate,
            traineeId: this.traineeId,
            //recruiterId: recruiterId != 'All' ? recruiterId : undefined
        }
        this.reportService.getDSRReport(requestItem).subscribe(x => {
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
        this.getInterviews(this.startDate, this.endDate);
    }

    public onExport() {
        this.gridApi.exportDataAsCsv();
    }

    public onValueChange(value: any) {
        this.startDate = this.dateFormatter(value[0]);
        this.endDate = this.dateFormatter(value[1]);
        this.getInterviews(this.startDate, this.endDate);
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

    public pivotData: any[] = [];
    public pivotColumnDefs: ColDef[] = [];

    public onExportPivotCSV() {
        const originalCsvData: string | undefined = this.gridApi.getDataAsCsv();

        if (!originalCsvData) {
            console.error('Failed to export original CSV data');
            return;
        }

        const originalRows = originalCsvData.split('\n');
        const rowCount = originalRows.length - 1;

        for (let i = 0; i < 3; i++) {
            originalRows.push('');
        }

        this.pivotData = this.generatePivotTableData(this.rowData);

        this.pivotColumnDefs = [
            { field: 'Marketer Name', headerName: 'Marketer Name' },
            { field: 'count', headerName: 'Number of DSR' },
        ];

        const pivotCsvData = this.convertPivotDataToCSV(this.pivotData, this.pivotColumnDefs);

        const pivotRows = pivotCsvData.split('\n').filter(row => row.trim() !== '');

        const combinedCsvData = pivotRows.join('\n') + '\n\n\n' + originalRows.join('\n');

        const blob = new Blob([combinedCsvData], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'DSR_report_pivot.csv';
        link.click();
    }

    private generatePivotTableData(data: any[]): any[] {
        const pivotedData: any[] = [];

        const pivotMap = new Map<string, any>();

        for (const row of data) {
            console.log(row);
            const marketerName = row['MarketerName'] || 'N/A';

            const key = `${marketerName}`;
            if (pivotMap.has(key)) {
                pivotMap.get(key).count += 1;
            } else {
                pivotMap.set(key, {
                    'Marketer Name': marketerName,
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