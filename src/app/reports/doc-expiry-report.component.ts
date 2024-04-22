import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DashboardService, RequestItem } from '../dashboard/dashboard.service';
import { ReportsService } from './reports.service';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';



interface IRange {
    value: Date[];
    label: string;
}

@Component({
    selector: 'app-docexpiry-reports',
    templateUrl: './doc-expiry-report.component.html',
    styleUrls: ['./reports.component.scss'],
    providers: [DashboardService, ReportsService]
})
export class DocExpiryReportComponent implements OnInit {

    public gridOptions: GridOptions = {};
    public gridApi: GridApi;
    rowData: any;
    public traineeId: any;
    public startDate: any;
    public endDate: any;
    public currentDate: Date;
    public currentSD: string;
    public currentED: any;
    filterForm = new FormGroup({
        dates: new FormControl('', Validators.required),
    });

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
        { field: 'CandidateName', headerName: 'Candidate Name', sortable: true, filter: true, resizable: true },
        /* { field: 'Title', headerName: 'Title', sortable: true, filter: true, resizable: true }, */
        { field: 'Recruiter', headerName: 'Recruiter', sortable: true, filter: true, resizable: true },
        /* { field: 'LCARate', headerName: 'LCA Rate', sortable: true, filter: true, resizable: true }, */
        { field: 'DocumentName', headerName: 'Document Name', sortable: true, filter: true, width: 500, resizable: true },
        { field: 'DocExpiryDate', headerName: 'Expiry Date', sortable: true, filter: true, resizable: true, valueFormatter: this.renderCell.bind(this), comparator: this.dateComparator.bind(this) },
        { field: 'DocStartDate', headerName: 'Start Date', sortable: true, filter: true, resizable: true, valueFormatter: this.renderCell.bind(this), comparator: this.dateComparator.bind(this) },
        { field: 'CreateTime', headerName: 'Created On', sortable: true, filter: true, resizable: true, valueFormatter: this.renderCell.bind(this), comparator: this.dateComparator.bind(this) }
    ];

    constructor(private http: HttpClient, private service: DashboardService, private reportService: ReportsService) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        this.traineeId = 1;
        this.currentDate = new Date(new Date());
        this.currentSD = this.dateFormatter(new Date(this.currentDate.getUTCFullYear(), this.currentDate.getMonth() - 3, 1));
        this.currentED = this.dateFormatter(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 6, 0));
        sessionStorage.setItem("Route", 'Reports');
    }


    ngOnInit(): void {
        this.gridOptions = {
            rowData: this.rowData,
            columnDefs: this.columnDefs,
            pagination: true
        }
        this.getDocExpiryReport(this.currentSD, this.currentED);
    }

    public getDocExpiryReport(startDate?: string, endDate?: string) {
        let requestItem: any = {
            traineeId: this.traineeId,
            startDate: startDate,
            endDate: endDate
        }
        this.reportService.getDocExpiryReport(requestItem).subscribe(x => {
            let response = x.result;
            if (response) {
                this.rowData = response;
                this.sizeToFit();
            }
        });
    }
    private renderInfoCell(params: any) {
        if (params.data.OtherInfo) {

            let info = params.data.OtherInfo.split(',');
            let cellInfo = info[0] ? ' Title: ' + info[0] : '';
            cellInfo += info[1] ? ' Client: ' + info[1] : '';
            cellInfo += info[2] ? ' LCA Rate: ' + info[2] : '';
            cellInfo += info[3] ? ' Salary/hr: ' + info[3] : '';
            cellInfo += info[4] ? ' State: ' + info[4] : '';
            return cellInfo;
        }
        else {
            return '';
        }
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

    public onExport() {
        this.gridApi.exportDataAsCsv();
    }

    private renderCell(params: any) {
        if (params.value && params.value != '01/01/1900') {
            return params.value;
        }
        else {
            return '';
        }
    }

    private dateComparator(date1?: any, date2?: any) {
        var date1Number = this._monthToNum(date1);
        var date2Number = this._monthToNum(date2);

        if (date1Number === null && date2Number === null) {
            return 0;
        }
        if (date1Number === null) {
            return -1;
        }
        if (date2Number === null) {
            return 1;
        }
        return date1Number - date2Number;
    }

    private _monthToNum(date?: any) {
        console.log('date', date)
        if (date === undefined || date === null || date.length !== 10) {
            return null;
        }

        var yearNumber = date.substring(6, 10);
        var monthNumber = date.substring(0, 2);
        var dayNumber = date.substring(3, 5);

        var result = yearNumber * 10000 + monthNumber * 100 + dayNumber;
        // 29/08/2004 => 20040829
        return result;
    }

    public onValueChange(value: any) {
        this.startDate = this.dateFormatter(value[0]);
        this.endDate = this.dateFormatter(value[1]);
        this.getDocExpiryReport(this.startDate, this.endDate);
    }

    public dateFormatter(value: any) {
        let formattedDate = formatDate(value, 'yyyy/MM/dd', "en-US");
        return formattedDate;
    }

    public onFilter() {
        this.getDocExpiryReport(this.startDate, this.endDate);
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
    }

    @HostListener('window:resize', ['$event'])
    onResize(e: Event) {
        setTimeout(() => {

            this.sizeToFit();

        }, 10);
    }

}