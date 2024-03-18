import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { GridOptions, ColDef, RowNode, Column, GridApi, ICellRendererComp, ICellRendererParams, KeyCreatorParams } from 'ag-grid-community';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateService } from './candidate.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { dateComparator } from '../common/dateComparator';
import * as FileSaver from 'file-saver';
import { CookieService } from 'ngx-cookie-service';
import { MatLabel } from '@angular/material/form-field';
import { MessageService } from 'primeng/api';


@Component({
    selector: 'app-placement-view',
    templateUrl: './placement-view.component.html',
    styleUrls: ['./candidate.component.scss'],
    providers: [CandidateService, DashboardService, DatePipe,MessageService]
})


export class PlacementViewComponent implements OnInit {
    loading:boolean = false;

    myForm: FormGroup;
    isEditView: boolean = false;
    loadDocuments: boolean = false;
    placementItem: any = [];
    bsConfig?: Partial<BsDatepickerConfig>;

    rowData: any;
    columnDefs: any;
    public gridApi: GridApi;
    public gridOptions: GridOptions = {};
    public traineeId: any;
    public saved: boolean = false;


    states: { name: string, code: string }[] = [
        { name: 'Alabama', code: 'AL' },
        { name: 'Alaska', code: 'AK' },
        { name: 'Arizona', code: 'AZ' },
        { name: 'Arkansas', code: 'AR' },
        { name: 'California', code: 'CA' },
        { name: 'Colorado', code: 'CO' },
        { name: 'Connecticut', code: 'CT' },
        { name: 'Delaware', code: 'DE' },
        { name: 'Florida', code: 'FL' },
        { name: 'Georgia', code: 'GA' },
        { name: 'Hawaii', code: 'HI' },
        { name: 'Idaho', code: 'ID' },
        { name: 'Illinois', code: 'IL' },
        { name: 'Indiana', code: 'IN' },
        { name: 'Iowa', code: 'IA' },
        { name: 'Kansas', code: 'KS' },
        { name: 'Kentucky', code: 'KY' },
        { name: 'Louisiana', code: 'LA' },
        { name: 'Maine', code: 'ME' },
        { name: 'Maryland', code: 'MD' },
        { name: 'Massachusetts', code: 'MA' },
        { name: 'Michigan', code: 'MI' },
        { name: 'Minnesota', code: 'MN' },
        { name: 'Mississippi', code: 'MS' },
        { name: 'Missouri', code: 'MO' },
        { name: 'Montana', code: 'MT' },
        { name: 'Nebraska', code: 'NE' },
        { name: 'Nevada', code: 'NV' },
        { name: 'New Hampshire', code: 'NH' },
        { name: 'New Jersey', code: 'NJ' },
        { name: 'New Mexico', code: 'NM' },
        { name: 'New York', code: 'NY' },
        { name: 'North Carolina', code: 'NC' },
        { name: 'North Dakota', code: 'ND' },
        { name: 'Ohio', code: 'OH' },
        { name: 'Oklahoma', code: 'OK' },
        { name: 'Oregon', code: 'OR' },
        { name: 'Pennsylvania', code: 'PA' },
        { name: 'Rhode Island', code: 'RI' },
        { name: 'South Carolina', code: 'SC' },
        { name: 'South Dakota', code: 'SD' },
        { name: 'Tennessee', code: 'TN' },
        { name: 'Texas', code: 'TX' },
        { name: 'Utah', code: 'UT' },
        { name: 'Vermont', code: 'VT' },
        { name: 'Virginia', code: 'VA' },
        { name: 'Washington', code: 'WA' },
        { name: 'Washington DC', code: 'DC' },
        { name: 'West Virginia', code: 'WV' },
        { name: 'Wisconsin', code: 'WI' },
        { name: 'Wyoming', code: 'WY' }
    ];
    selectedState: { name: string, code: string };

    loaded?: boolean = false;
    marketersAuto: string[];
    OrgID: any;
    placementAdd: any;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private service: CandidateService, private datePipe: DatePipe, private cd: ChangeDetectorRef, private cookieService: CookieService,private router: Router, private messageService: MessageService) {
        this.placementItem.placementID = this.route.snapshot.params["placementID"];
        this.placementItem.TraineeID = this.traineeId = this.route.snapshot.params["traineeId"];
        this.placementItem.routetype = this.traineeId = this.route.snapshot.params["routetype"];
        this.OrgID = this.cookieService.get('OrgID');
        this.myForm = this.formBuilder.group({
        });

        const fieldConfigs = [
            { fieldName: 'Notes', required: false },
            { fieldName: 'BillRate', required: true },
            { fieldName: 'BillType', required: true },
            { fieldName: 'MarketerName', required: true },
            { fieldName: 'ClientState', required: true },
            { fieldName: 'StartDate', required: true },
            { fieldName: 'EndDate', required: true },
            { fieldName: 'DatePlaced', required: false },
            { fieldName: 'Title', required: true },
            { fieldName: 'CandidateEmailId', required: false },
            { fieldName: 'ClientName', required: true },
            { fieldName: 'POStartDate', required: true },
            { fieldName: 'POEndDate', required: false },
            { fieldName: 'ClientManagerName', required: false },
            { fieldName: 'ClientEmail', required: false },
            { fieldName: 'ClientPhone', required: false },
            { fieldName: 'ClientAddress', required: false },
            { fieldName: 'VendorName', required: false },
            { fieldName: 'VendorContact', required: false },
            { fieldName: 'VendorEmail', required: false },
            { fieldName: 'VendorPhone', required: false },
            { fieldName: 'VendorAddress', required: false },
            { fieldName: 'SubVendorName', required: false },
            { fieldName: 'SubVendorContact', required: false },
            { fieldName: 'SubVendorEmail', required: false },
            { fieldName: 'SubVendorPhone', required: false },
            { fieldName: 'SubVendorAddress', required: false },
            { fieldName: 'PrimaryPlacement', required: false }
        ];

        fieldConfigs.forEach(fieldConfig => {
            const validators = fieldConfig.required ? Validators.required : [];
            this.myForm.addControl(fieldConfig.fieldName, this.formBuilder.control('', validators));
        });
    }


    ngOnInit(): void {
        this.bsConfig = Object.assign({}, { containerClass: 'theme-default' });
        if (this.placementItem.placementID) {
            this.isEditView = true;
            this.service.getPlacementDetails(this.placementItem.placementID).subscribe((x: any) => {
                console.log(x);
                this.placementItem = x[0];
                this.placementItem.StartDate = new Date(x[0].StartDate);
                this.placementItem.EndDate = new Date(x[0].EndDate);
                this.placementItem.DatePlaced = new Date(x[0].PlacedDate);
                this.placementItem.POStartDate = new Date(x[0].POStartDate);
                this.placementItem.POEndDate = new Date(x[0].POEndDate);
                this.placementItem.traineeID = this.traineeId;
                this.loaded = true;
                for (const controlName in this.myForm.controls) {
                    if (this.myForm.controls.hasOwnProperty(controlName)) {
                        this.myForm.patchValue({
                            [controlName]: this.placementItem[controlName]
                        });
                    }
                }
                this.myForm.controls['MarketerName'].setValue({ Name: this.placementItem.MarketerName });

            });
            this.initGrid();
        }
        else {
            this.myForm.controls['BillType'].setValue(true);
            this.myForm.controls['PrimaryPlacement'].setValue(false);
            this.loaded = true;
        }

        this.placementAdd = this.formBuilder.group({
            notes: ['', [Validators.required, Validators.minLength(3)]],
            BillRate: ['', [Validators.required]],
          });

    }

    public initGrid() {
        let cellRendererFn = function (params: any): any { return null; };
        this.columnDefs = [
            { headerName: 'Uploaded Date', field: 'CreateTime', sortable: true, comparator: dateComparator.bind(this), resizable: true, sort: 'desc' },
            { headerName: 'Document Name', field: 'DocumentName', sortable: true, filter: true, resizable: true },
            { headerName: 'Document Type', field: 'DocTypeName', sortable: true, filter: true, resizable: true },
            { headerName: 'Document Start Date', field: 'StartDate', resizable: true, valueFormatter: this.renderCell.bind(this) },
            { headerName: 'Document Expiry Date', field: 'ExpiryDate', resizable: true, valueFormatter: this.renderCell.bind(this) },
            /* {
                field: 'PlacementID',
                width: 110,
                editable: true,
                cellEditorFramework: GenderRenderer,
                cellRenderer: (params: any) => {
                    if (params.value != undefined) {
                        return params.value;
                    }
                    else {
                        return "test";
                    }
                }
            } */
        ];

        this.columnDefs.push({
            headerName: '', field: 'download', minWidth: 15, maxWidth: 50,
            onCellClicked: this.download.bind(this),
            cellClass: "fa fa-download",
            cellStyle: { cursor: 'pointer' },
            headerClass: "ag-header-cell-action",
            cellRenderer: cellRendererFn,
            suppressMenu: true, suppressMovable: true,
            pinned: "right"
        });

        this.gridOptions = {
            rowData: this.rowData,
            columnDefs: this.columnDefs,
            pagination: true
        }
    }

    public getDocuments() {
        this.service.getDocuments({ traineeID: this.placementItem.traineeID, docTypeID: 6 }).subscribe(x => {
            let response = x.result;
            if (response) {
                this.loadDocuments = true;
                this.rowData = response;
                this.sizeToFit();
            }
        });
    }

    private renderCell(params: any) {
        if (params.value && params.value != '01/01/1900') {
            return params.value;
        }
        else {
            return '';
        }
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

    private download(params: any) {
        if (params.data) {
            FileSaver.saveAs("https://tresume.us/" + params.data.DocumentPath, params.data.DocumentName);
        }
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

    onGridReady(params: any) {
        this.gridApi = params.api;
        this.getDocuments();

        //this.gridColumnApi = params.columnApi;
    }

    search(event: any) {
        let req = {
            keyword: event.query,
            orgID: this.OrgID
        }
        this.service.getMarketerNames(req).subscribe((data: any) => {
            this.marketersAuto = data.result;
        });
    }

    setMarketer(params: any) {
        console.log('params', params)
        this.placementItem.MarketerID = params.TraineeID;

    }

    onSubmit() {
        this.loading = true;
        const requestItem = Object.assign({}, this.placementItem, this.myForm.value);
        requestItem.MarketerName = this.placementItem.MarketerID;
        this.service.addUpdatePlacementDetails(requestItem).subscribe(x => {
            this.saved = true;
            var url = '/reviewtresume/1/'+this.placementItem.TraineeID+'/2';
        console.log(url);
          this.router.navigateByUrl(url);
        });
        this.messageService.add({ severity: 'success', summary:  'Success' });
        this.loading = false;

    }

    backToList() {
        var url = '/reviewtresume/1/' + this.placementItem.TraineeID + '/2';
        console.log(url);
          this.router.navigateByUrl(url);
    }
}

export interface PlacementItem {
    Notes?: string;
    billRate?: any;
    marketerName?: string;
    clientState?: string;
    startDate?: Date;
    endDate?: Date;
    datePlaced?: Date;
    title?: string;
    workEmailID?: string;
    clientName?: string;
    poStartDate?: Date;
    poSEndDate?: Date;
    clientManagerName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientAddress?: string;
    vendorName?: string;
    vendorContact?: string;
    vendorEmail?: string;
    vendorPhone?: string;
    vendorAddress?: string;
    subVendorName?: string;
    subVendorContact?: string;
    subVendorEmail?: string;
    subVendorPhone?: string;
    subVendorAddress?: string;
    PlacementID?: string;
    primaryPlacement?: boolean;
}

class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `${params.value.name}`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}