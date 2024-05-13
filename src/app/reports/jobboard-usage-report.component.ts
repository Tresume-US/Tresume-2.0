import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DashboardService, RequestItem } from '../dashboard/dashboard.service';
import { ReportsService } from './reports.service';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { CookieService } from 'ngx-cookie-service';


interface IRange {
    value: Date[];
    label: string;
}

@Component({
    selector: 'app-jobboard-usage-reports',
    templateUrl: './jobboard-usage-report.component.html',
    styleUrls: ['./reports.component.scss'],
    providers: [DashboardService, ReportsService]
})
export class JobBoardusageReportComponent implements OnInit {

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
        { field: 'Name', headerName: 'Recruiter Name', sortable: true, filter: true, resizable: true },
        { field: 'DivisionName', headerName: 'Division Name', sortable: true, filter: true, resizable: true },
        { field: 'monster', headerName: 'Monster', sortable: true, filter: true, resizable: true },
        { field: 'monsterused', headerName: 'Monster Used', sortable: true, filter: true, resizable: true },
        { field: 'cb', headerName: 'CareerBuilder', sortable: true, filter: true, resizable: true },
        { field: 'cbused', headerName: 'CareerBuilder Used', sortable: true, filter: true, resizable: true },
        { field: 'dice', headerName: 'Dice', sortable: true, filter: true, resizable: true },
        { field: 'diceused', headerName: 'Dice Used', sortable: true, filter: true, resizable: true },
    ];

    public startDate: any;
    public endDate: any;
    public traineeId: any;
    public recruiter: any = [];
    OrgID: string | null;

    constructor(private http: HttpClient, private service: DashboardService, private reportService: ReportsService,private cookieService: CookieService) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        this.OrgID = this.cookieService.get('OrgID');
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
            OrgID: this.OrgID,
            //recruiterId: recruiterId != 'All' ? recruiterId : undefined
        }
        this.reportService.JobboardUsageReport(requestItem).subscribe(x => {
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
        let formattedDate = formatDate(value, 'MM-dd-yyyy 23:59:59', "en-US");
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