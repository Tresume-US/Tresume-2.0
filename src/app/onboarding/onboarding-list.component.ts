import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { Router } from "@angular/router";
import { OnboardingService } from './onboarding.service';
import { ProgressRenderer } from './progress-cell.component';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { CcpaPopupComponent } from './ccpa-popup.component';

interface IRange {
    value: Date[];
    label: string;
}
@Component({
    selector: 'app-onboarding-list',
    templateUrl: './onboarding-list.component.html',
    providers: [OnboardingService],
    styleUrls: ['./onboarding.component.scss']
})
export class OnboardingListComponent implements OnInit {

    rowData: any;
    public gridOptions: GridOptions = {};
    public gridApi: GridApi;
    columnDefs: any;
    public frameworkComponents: {};
    public OrgID: any;
    public startDate: any;
    public endDate: any;
    public totalCounts: any = {};
    obinstruction: any;

    selectedStatusOptions: any[] = [];
    filterForm = new FormGroup({
        dates: new FormControl('', Validators.required)
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
    traineeId: string | null;
    useremail: string;
    currentActive = 1;
    showProgressModal = false;
    
    steps = [
      'Step 1: Personal Information',
      'Step 2: Contact Information',
      'Step 3: Employment Details',
      'Step 4: Review and Submit',
      'Step 5: Contact Information',
      'Step 6: Employment Details',
      'Step 7: Review and Submit',
      'Step 8: Contact Information',
    ];
    
    images = [
      'assets/img/onboard/S1.png',
      'assets/img/onboard/STEP2.png',
      'assets/img/onboard/ST3.png',
      'assets/img/onboard/S4.png',
      'assets/img/onboard/S5.png',
      'assets/img/onboard/S6.png',
      'assets/img/onboard/S7.png',
      'assets/img/onboard/ST8.png',
    ];
    
    get progressHeight() {
        return ((this.currentActive - 1) / (this.steps.length - 1)) * 100 + '%';
      }
    
    
      next() {
        if (this.currentActive < this.steps.length) {
          this.currentActive++;
        }
        // if (this.currentActive > this.steps.length){
        //     this.showProgressModal = false;
        // }
      }
    
        finish(){
            if(this.currentActive == this.steps.length){
            this.showProgressModal = false;
            }
        }
      prev() {
        if (this.currentActive > 1) {
          this.currentActive--;
        }
      }
    
      skip() {
        this.showProgressModal = false;
      }


    constructor(private service: OnboardingService, private router: Router, private cookieService: CookieService, private dialog: MatDialog) {
        this.useremail = this.cookieService.get('userName1')
        this.frameworkComponents = {
            'ProgressRenderer': ProgressRenderer,
        }
        this.startDate = this.dateFormatter(this.ranges[2].value[0]);
        this.endDate = this.dateFormatter(this.ranges[2].value[1]);
        this.traineeId = sessionStorage.getItem("TraineeID");
    }

    ngOnInit(): void {
        //this.showCcpaPopup();
        // this.showProgressModal = true;
        // this.fetchEmployeeList();
        let req:any={
            useremail: this.useremail
        }
        this.service.getinstructionstatus(req).subscribe(response => {
            console.log('Full response from service:', response);  // Log the full response
        
            // Safely access response.recordsets[0][0].obinstruction with optional chaining
            const instruction = response?.recordsets?.[0]?.[0]?.obinstruction;
        
            if (instruction !== undefined) {
                this.obinstruction = instruction;
        
                if (this.obinstruction === 0) {
                    this.showProgressModal = true;
                } else {
                    this.showProgressModal = false;
                }
            } else {
                console.error('obinstruction is undefined in the response');
            }
        }, error => {
            console.error('Error fetching instruction status:', error);
        });
        
        this.OrgID = this.cookieService.get('OrgID') || "9";
        let cellRendererFn = function (params: any): any { return null; };
        this.columnDefs = [
            { headerName: 'Date', field: 'Date', sortable: true, filter: true, resizable: true },
            { headerName: 'Employee Name', field: 'Employee Name', sortable: true, filter: true, resizable: true },
            /* { field: 'Reports to', sortable: true, filter: true, resizable: true }, */
            { headerName: 'Employment Start Date', field: 'Start Date', sortable: true, filter: true, resizable: true },
            { headerName: 'Status', field: 'status', sortable: true, filter: true, resizable: true, valueFormatter: this.renderCell.bind(this) },
            /* { headerName: 'Completed', field: 'Completed', sortable: true, filter: true, resizable: true } */
        ];

        this.columnDefs.push(
            {
                headerName: '% Completed', field: 'Completed', minWidth: 100, maxWidth: 500,
                onCellClicked: this.download.bind(this),
                //cellClass: "fa fa-info-circle",
                cellStyle: { cursor: 'pointer' },
                headerClass: "ag-header-cell-action",
                cellRenderer: "ProgressRenderer",
                suppressMenu: true, suppressMovable: true,
                pinned: "right"
            },
            {
                headerName: '', field: 'download', minWidth: 60, maxWidth: 60,
                onCellClicked: this.edit.bind(this),
                cellClass: "fa fa-info-circle",
                cellStyle: { cursor: 'pointer' },
                headerClass: "ag-header-cell-action",
                cellRenderer: cellRendererFn,
                suppressMenu: true, suppressMovable: true,
                pinned: "right"
            }
        );
        if (this.traineeId == '1' || this.traineeId == '411') {
            this.columnDefs.push(
                {
                    headerName: '', field: 'delete', minWidth: 60, maxWidth: 60,
                    onCellClicked: this.delete.bind(this),
                    cellClass: "fa fa-trash",
                    cellStyle: { cursor: 'pointer' },
                    headerClass: "ag-header-cell-action",
                    cellRenderer: cellRendererFn,
                    suppressMenu: true, suppressMovable: true,
                    pinned: "right"
                });
        }


        this.gridOptions = {
            rowData: this.rowData,
            columnDefs: this.columnDefs,
            pagination: true
        }
        this.getOnboardList(this.startDate, this.endDate);
        this.getOnbaordingDashboard();
    }

    public getOnboardList(startDate?: string, endDate?: string) {
        let requestItem: any = {
            useremail: this.useremail,
            startDate: startDate,
            endDate: endDate
        }
        this.service.getOnboardingList(requestItem).subscribe(x => {
            let response = x;
            if (response) {
                this.rowData = response;
                this.employees = x.result; 
                this.sizeToFit();
            }
        });
    }

    private download(params: any) {
        if (params.data) {
            console.log('params.data', params.data)
            let req = {
                traineeID: params.data.TraineeID
            }

        }
    }

    private renderCell(params: any) {
        if (params.value && params.value == 1) {
            return "Pending";
        }
        else if (params.value && params.value == 2) {
            return 'Requested';
        }
        else {
            return 'Complete';
        }
    }

    public onValueChange(value: any) {
        this.startDate = this.dateFormatter(value[0]);
        this.endDate = this.dateFormatter(value[1]);
    }

    public dateFormatter(value: any) {
        let formattedDate = formatDate(value, 'MM-dd-yyyy', "en-US");
        return formattedDate;
    }

    public onFilter() {
        this.getOnboardList(this.startDate, this.endDate);
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
    }

    public sizeToFit() {
        let ids: string[] = [];
        this.columnDefs.forEach((column: any) => {
            ids.push(column.field || "");
        });
        if (this.gridOptions.columnApi) {
            this.gridOptions.columnApi.autoSizeColumns(ids);
        }
        if (this.gridOptions.api) {
            this.gridOptions.api.sizeColumnsToFit();
        }
    }

    public startOnboard() {
        this.router.navigate(['/onboard/1'])

    }

    public edit(params: any) {
        this.router.navigate(['/onboard/step/' + params.data.ID]);
        console.log('params', params.data.ID)

    }
    public navigateToOnboardStep(id: any) {
        this.router.navigate(['/onboard/step/' + id]);
    }
    

    public delete(params: any) {
        console.log('params', params)
        this.service.deleteCurrentOnboarding({ id: params.data.ID }).subscribe(x => {
            this.getOnboardList(this.startDate, this.endDate);
        });

    }

    getOnbaordingDashboard() {
        this.service.getTotalOnbaordings(this.OrgID).subscribe((x: any) => {
            this.totalCounts = x[0];

        });
    }

    showCcpaPopup() {
        const dialogRef = this.dialog.open(CcpaPopupComponent, {
            width: '400px',
            disableClose: true,
            panelClass: 'cc-footer-popup',
        });

        /* dialogRef.afterClosed().subscribe((result) => {
          if (result === true) {
            
          } else {
            
          }
        }); */
    }

    hide() {
        let req: any = {
            useremail: this.useremail
        };
    
        this.service.updateinstruction(req).subscribe(
            (response) => {
                this.showProgressModal = false;
            },
            (error) => {
                this.showProgressModal = false;
            }
        );
    }
    
    

    employees: any[];
    fetchEmployeeList(){
        let Req = {
            useremail: this.useremail,
        };
        this.service.getOnboardingList(Req).subscribe((x: any) => {
          this.employees = x.result;        
        });
      }

      getBackgroundColor(completion: number): string {
        if (completion < 25) {
            return "#e7602e99"; // light red
        } else if (completion >= 25 && completion <= 75) {
            return "#f4963980"; // light orange
        } else {
            return "#a4e73466"; // light green
        }
    }

    navigateToDetailsPage(employee: any) {
        if (employee && employee.ID) {
          this.router.navigate(['/onboard/step/' + employee.ID]); 
        }
      }
}