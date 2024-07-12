import { Component, OnInit, ViewChild,Input } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { DatePipe, formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { CandidateService } from './candidate.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as FileSaver from 'file-saver';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { startWith, tap, filter } from 'rxjs/operators';
import { AlertComponent } from 'ngx-bootstrap/alert';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.scss'],
  providers: [CandidateService,MessageService]
})
export class CandidateComponent implements OnInit {
  loading:boolean = false;

  public traineeId: any;
  public loggedTraineeId: any;
  rowData: any;
  columnDefs: any;
  public gridOptions: GridOptions = {};
  public gridApi: GridApi;
  modalRef?: BsModalRef;
  public confirmDeleteID: any;
  public documentTypes: any;
  response: string;
  modaltest: string;
  uploadUrl = `${environment.apiUrl}uploadDocument`;
  placementList:any;
  //uploadUrl = 'http://localhost:3000/uploadDocument';
  @ViewChild('childModal', { static: false }) childModal?: ModalDirective;
  @Input() candidateId: string;
  form = new FormGroup({});
  model: any = {};
  //options: FormlyFormOptions = {};

  fields: FormlyFieldConfig[] = [{
    type: 'stepper',
    fieldGroup: [
      {
        templateOptions: { label: 'Select a Document Type' },
        fieldGroup: [
          {
            key: 'docType',
            type: 'select',
            templateOptions: {
              label: 'Document Type',
              required: true,
              options: [
                { id: 1, name: 'Offer Letter', group: 'Employee' },
                { id: 29, name: 'Employee Handbook', group: 'Employee' },
                { id: 30, name: 'Voided Check', group: 'Employee' },
                { id: 31, name: 'Insurance', group: 'Employee' },
                { id: 32, name: 'Direct Deposit', group: 'Employee' },
                { id: 2, name: 'Performance', group: 'Employee' },
                { id: 33, name: 'Vacation Documents', group: 'Employee' },
                { id: 34, name: 'Termination', group: 'Employee' },
                { id: 3, name: 'NCA', group: 'Agreement' },
                { id: 35, name: 'Agreement (Others)', group: 'Agreement' },
                { id: 4, name: 'State Tax Form', group: 'Tax' },
                { id: 4, name: 'W4', group: 'Tax' },
                { id: 5, name: 'Recruitment Tracker', group: 'HR Others' },
                { id: 22, name: 'I-20', group: 'Work Authorization' },
                { id: 10, name: 'EAD', group: 'Work Authorization' },
                { id: 7, name: 'CPT', group: 'Work Authorization' },
                { id: 11, name: 'US Passport / Green Card / Work Authorization', group: 'Work Authorization' },
                { id: 23, name: 'I-983', group: 'Work Authorization' },
                { id: 9, name: 'H1B Approval', group: 'H1B' },
                { id: 24, name: 'H1B (Others)', group: 'H1B' },
                { id: 19, name: 'LCA', group: 'H1B' },
                { id: 25, name: 'Wages', group: 'GC' },
                { id: 14, name: 'Labor', group: 'GC' },
                { id: 15, name: 'I-140', group: 'GC' },
                { id: 16, name: 'I-485', group: 'GC' },
                { id: 6, name: 'Work Order', group: 'Client/MSA Work Order' },
                { id: 6, name: 'MSA', group: 'Client/MSA Work Order' },
                { id: 20, name: 'Passport', group: 'Others' },
                { id: 18, name: 'I-9', group: 'Others' },
                { id: 21, name: 'ID', group: 'Others' },
                { id: 27, name: 'Other', group: 'Others' },

                //newly added request from yuvarani
                { id: 37, name: 'SSN', group: 'Others' },
                { id: 11, name: 'Green Card', group: 'Others' },
                { id: 53, name: 'Adobe onboarding', group: 'Others' },
                { id: 54, name: 'HireRight background check', group: 'Others' },
                { id: 20, name: 'Passport', group: 'Others' },
                { id: 55, name: 'Work authorization', group: 'Others' },
                { id: 36, name: 'Driver license', group: 'Others' },
                { id: 56, name: 'PPD/TB Result', group: 'Others' },
                { id: 38, name: 'Car Insurance', group: 'Others' },
                { id: 58, name: 'Car registration', group: 'Others' },
                { id: 59, name: 'Resume', group: 'Others' },
                { id: 60, name: 'Void Check', group: 'Others' },
                { id: 61, name: 'BLS', group: 'Others' },
                { id: 62, name: 'CPR', group: 'Others' },
                { id: 63, name: 'Hep B Declination', group: 'Others' },
                { id: 50, name: 'Hep B vaccination', group: 'Others' },
                { id: 47, name: 'Covid vaccination', group: 'Others' },
                { id: 49, name: 'Flu vaccination', group: 'Others' },
                { id: 64, name: 'Flu Declination', group: 'Others' },
                { id: 48, name: 'MMR vaccination', group: 'Others' },
                { id: 65, name: 'Physical exam', group: 'Others' },
                { id: 66, name: 'E-Verification', group: 'Others' },
                { id: 68, name: 'Chest X-Ray', group: 'Others' },
                { id: 67, name: 'Orientation document', group: 'Others' },
              ],
              valueProp: 'id',
              labelProp: 'name',
              model: 'modaltest',
            },
          }
        ],
      },
      {
        templateOptions: { label: 'Validation' },
        fieldGroup: [
          {
            key: 'startDate',
            type: 'input',
            templateOptions: {
              type: 'date',
              label: 'Start Date',
              required: true,
            },
            expressionProperties: {
              'templateOptions.required': model => model.docType == 9 || model.docType == 11 || model.docType == 1 || model.docType == 37 || model.docType == 53 || model.docType == 54 || model.docType == 59 || model.docType == 60 || model.docType == 50 || model.docType == 63 || model.docType == 64 || model.docType == 48 || model.docType == 18 || model.docType == 66 || model.docType == 67 || model.docType == 68|| model.docType == 47
            },
            hideExpression: model => model.docType == 20 || model.docType == 21 || model.docType == 22
              || model.docType == 10 || model.docType == 23 || model.docType == 6 
          },
          {
            key: 'endDate',
            type: 'input',
            templateOptions: {
              type: 'date',
              label: 'Expiry Date',
              required: false,
            },
            hideExpression: model => model.docType == 3 || model.docType == 29 || model.docType == 30 || model.docType == 31 || model.docType == 32 
              || model.docType == 2 || model.docType == 33 || model.docType == 34 || model.docType == 24 || model.docType == 37 || model.docType == 53|| model.docType == 54 || model.docType == 59 || model.docType == 60 || model.docType == 50 || model.docType == 63 || model.docType == 64 || model.docType == 48 || model.docType == 18 || model.docType == 66 || model.docType == 67|| model.docType == 68|| model.docType == 47,
            expressionProperties: {
              'templateOptions.required': model => !(model.docType == 3 || model.docType == 29 || model.docType == 30 || model.docType == 31
                || model.docType == 32 || model.docType == 2 || model.docType == 33 || model.docType == 34 || model.docType == 24 || model.docType == 1|| model.docType == 37 || model.docType == 53 || model.docType == 54 || model.docType == 59 || model.docType == 60 || model.docType == 50 || model.docType == 63 || model.docType == 64 || model.docType == 48 || model.docType == 18 || model.docType == 66 || model.docType == 67|| model.docType == 68|| model.docType == 47)
            },
          },
          {
            key: 'title',
            type: 'input',
            templateOptions: {
              type: 'input',
              label: 'Title',
              required: false,
            },
            hideExpression: model => model.docType != 19
          },
          {
            key: 'rate',
            type: 'input',
            templateOptions: {
              type: 'input',
              label: 'LCA Rate',
              required: false,
              addonLeft: {
                text: '$/Hr',
              }
            },
            hideExpression: model => model.docType != 19
          },
          {
            key: 'clientName',
            type: 'input',
            templateOptions: {
              type: 'input',
              label: 'Client Name',
              required: false,
            },
            hideExpression: model => model.docType != 19 && model.docType != 3
          },
          {
            key: 'state',
            type: 'input',
            templateOptions: {
              type: 'input',
              label: 'State',
              required: false,
            },
            hideExpression: model => model.docType != 19
          },
          {
            key: 'salary',
            type: 'input',
            templateOptions: {
              type: 'input',
              label: 'Salary',
              required: false,
              addonLeft: {
                text: '$',
              },
            },
            hideExpression: model => model.docType != 1
          }
        ],
      },
      {
        templateOptions: { label: 'Upload' },
        fieldGroup: [
          {
            key: 'file',
            type: 'file',
            templateOptions: {
              label: 'Upload file',
              required: true,
            },
          },
        ],
      },
    ],
  }];

  options: Array<FormlyFormOptions> = this.fields.map(() => ({}));


  toggleSuccess: boolean = false;
  toggleError: boolean = false;
  expiredDocs: any[] = [];
  compMsg: string = "These documents are expired or will be expiring soon. Please update them.";


  constructor(private route: ActivatedRoute, private http: HttpClient, private service: CandidateService, private modalService: BsModalService, private messageService: MessageService) {
    // this.traineeId = this.route.snapshot.params["traineeId"];
    this.response = '';
    this.loggedTraineeId = sessionStorage.getItem("TraineeID");
  }

  ngOnInit(): void {
    this.traineeId=this.candidateId;
    this.initGrid();
    this.getDocuments();
    let Req = {
      TraineeID: this.traineeId,
    };

    this.service.getplacementsBytID(Req).subscribe((x: any) => {
      
      this.placementList = x.result;
      console.log(this.placementList);
    });
  }

  public initGrid() {
    let cellRendererFn = function (params: any): any { return null; };
    this.columnDefs = [
      { headerName: 'Uploaded Date', field: 'CreateTime', sortable: true, comparator: this.dateComparator.bind(this), resizable: true, sort: 'desc' },
      { headerName: 'Document Name', field: 'DocumentName', sortable: true, filter: true, resizable: true },
      { headerName: 'Document Type', field: 'DocTypeName', sortable: true, filter: true, resizable: true },
      { headerName: 'Document Start Date', field: 'StartDate', resizable: true, valueFormatter: this.renderCell.bind(this) },
      { headerName: 'Document Expiry Date', field: 'ExpiryDate', resizable: true, cellStyle: this.renderCellstyle.bind(this), valueFormatter: this.renderCell.bind(this) },
      { headerName: 'Other Info', field: 'info', sortable: false, resizable: true, valueFormatter: this.renderInfoCell.bind(this) },
      {
        headerName: 'Placement',
        field: 'PlacementID',
        resizable: true,
        cellRenderer: this.renderActionButton2.bind(this),
        suppressMenu: true,
        suppressMovable: true,
        pinned: "right"
      },
      {
        headerName: 'Action',
        field: 'Active',
        resizable: true,
        cellRenderer: this.renderActionButton.bind(this),
        suppressMenu: true,
        suppressMovable: true,
        pinned: "right"
      },
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
    this.columnDefs.push({
      headerName: '', field: 'delete', minWidth: 15, maxWidth: 50,
      onCellClicked: this.delete.bind(this),
      cellClass: "fa fa-trash",
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
    console.log('this.expiredDocs', this.expiredDocs)
  }

  public renderActionButton(params: any): any {
    const isActive = params.value; 
    const toggleSwitchContainer = document.createElement('label');
    toggleSwitchContainer.classList.add('switch');

    const toggleSwitchInput = document.createElement('input');
    toggleSwitchInput.type = 'checkbox';
    toggleSwitchInput.checked = isActive;
    toggleSwitchInput.addEventListener('change', () => this.toggleAction(params.data, toggleSwitchInput.checked));

    const toggleslidet = document.createElement('span');
    toggleslidet.classList.add('slider');
    toggleslidet.classList.add('round');


    toggleSwitchContainer.appendChild(toggleSwitchInput);
    toggleSwitchContainer.appendChild(toggleslidet);
    return toggleSwitchContainer;
  }

  // public renderActionButton2(params: any): any {
  //   const dropdownContainer = document.createElement('div');
  //   const dropdown = document.createElement('select');
  //   const PID = params.value;
  //   this.placementList.forEach((placement: { PID: { toString: () => string; }; ClientName: string; }) => {
  //     const option = document.createElement('option');
  //     option.value = placement.PID.toString(); 
  //     option.text = placement.ClientName; 
  //     dropdown.appendChild(option);
  //   });

  //   dropdown.addEventListener('change', () => {
  //     const selectedOptionIndex = dropdown.selectedIndex;
  //     const selectedOptionValue = dropdown.options[selectedOptionIndex].value;
  //     this.handleDropdownChange(params.data, selectedOptionValue);
  //   });

  //   dropdownContainer.appendChild(dropdown); 
  //   return dropdownContainer;
  // }
  public renderActionButton2(params: any): any {
    const dropdownContainer = document.createElement('div');
    const dropdown = document.createElement('select');
    const PID = params.value;
  
    let found = false; // Flag to check if PID is found in placementList
  
    this.placementList.forEach((placement: { PID: { toString: () => string; }; ClientName: string; }) => {
      const option = document.createElement('option');
      option.value = placement.PID.toString();
      option.text = placement.ClientName;
  
      // Check if the current option's PID matches the params.value (PID)
      if (placement.PID.toString() === PID) {
        option.selected = true; // Set the option as selected
        found = true; // Set found to true as the PID is found
      }
  
      dropdown.appendChild(option);
    });
  
    // If PID not found, create a default 'Please select Placement' option
    if (!found) {
      const defaultOption = document.createElement('option');
      defaultOption.value = ''; // Set a default value if needed
      defaultOption.text = 'Please select Placement';
      defaultOption.selected = true; // Set the default option as selected
      dropdown.insertBefore(defaultOption, dropdown.firstChild); // Insert at the beginning of the dropdown
    }
  
    dropdown.addEventListener('change', () => {
      const selectedOptionIndex = dropdown.selectedIndex;
      const selectedOptionValue = dropdown.options[selectedOptionIndex].value;
      this.handleDropdownChange(params.data, selectedOptionValue);
    });
  
    dropdownContainer.appendChild(dropdown);
    return dropdownContainer;
  }
  
  handleDropdownChange(data: any, selectedOptionValue: string) {

    console.log(data);
    console.log(selectedOptionValue);
    let Req = {
      CID: data.CandidateDocumentID,
      PID: selectedOptionValue
    };

    this.service.UpdateplacementsBytID(Req).subscribe((x: any) => {

      this.messageService.add({ severity: 'success', summary: 'Placement Document Updated Successfully.' });
    });

  }




  public toggleAction(data: any, isActive: boolean): void {
    console.log(data.CandidateDocumentID);
    console.log(isActive);
    var status = 0;
    if (isActive) {
      status = 1;
    }

    let Req = {
      status: status,
      docId: data.CandidateDocumentID,

    };
    this.service.changeDocStatus(Req).subscribe((x: any) => {

      console.log(x);
    });

  }



  public getDocuments() {
    this.service.getDocuments({ traineeID: this.traineeId }).subscribe(x => {
      let response = x.result;
      if (response) {
        this.rowData = response;
        this.sizeToFit();
        console.log(this.rowData);
      }
    });
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

  private renderCellstyle(params: any) {
    if (params.value && params.value != '01/01/1900') {
      let CurrentDate = new Date(new Date());
      let days = params.data.DocTypeName == 'H1B' ? 180 : 30;
      let h1bExpdate = new Date(CurrentDate.setDate(CurrentDate.getDate() + days));
      let formGivenDate = new Date(params.value);

      if (formGivenDate < h1bExpdate) {
        this.expiredDocs.push(params.data.DocTypeName);
        this.compMsg += " * " + params.data.DocTypeName + " ";
        return { backgroundColor: 'rgba(255,128,171,.4)' };
      }
      else {
        return '';
      }
    }
    return '';
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

  onGridReady(params: any) {
    this.gridApi = params.api;
    //this.gridColumnApi = params.columnApi;
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

  private download(params: any) {
    // if (params.data) {
    //   FileSaver.saveAs("https://tresume.us/" + params.data.DocumentPath, params.data.DocumentName);
    // }
    if (params.data) {
      var documentUrl = "https://tresume.us/" + params.data.DocumentPath;
      var documentName = params.data.DocumentName;
      var newWindow = window.open(documentUrl, '_blank');
      if (newWindow) {
        newWindow.focus();
      } else {
        console.error('Unable to open new window. Popup blocker may be enabled.');
      }
    }
  }

  onExport() {
    FileSaver.saveAs('', "test.pdf");
  }

  private delete(params: any) {
    this.childModal?.show();
    this.confirmDeleteID = params.data.CandidateDocumentID;
  }

  showChildModal(): void {
    this.childModal?.show();
  }

  acceptDelete() {
    this.service.deleteDocument(this.confirmDeleteID).subscribe(x => {
      this.getDocuments();
      this.childModal?.hide();
    });
  }

  declineDelete(): void {
    this.childModal?.hide();
    this.confirmDeleteID = 0;
  }

  onUpload(model: any) {
    let file = model.file[0];
    let uploadUrl = this.uploadUrl + '/' + this.traineeId;
    let reqBody = this.loggedTraineeId || 1;
    this.options.forEach(tabOptions => console.log('tabOptions', tabOptions));
    this.service.uploadDocument(uploadUrl, file, reqBody).subscribe((x: any) => {
      if (x.type == 4) {
        if (x.body.code == 'LIMIT_FILE_SIZE') {
          this.toggleError = true;
          return;
        }
        let response = x.body;
        console.log('response', response)
        if (response) {
          let formattedPath = response.FilePath.replace(/\\/g, "/");
          formattedPath = formattedPath.split('/httpdocs/')[1];
          console.log('formattedPath', formattedPath)
          let request = {
            "loggedUserId": this.traineeId || 1,
            "FileName": response.FileName,
            "FilePath": formattedPath,
            "loggedUserEmail": response.loggedUserEmail,
            "docType": model.docType,
            "startDate": model.startDate || '',
            "expiryDate": model.endDate || '',
            "otherInfo": {
              "title": model.title || '',
              "Client": model.clientName || '',
              "rate": model.rate || '',
              "salary": model.salary || '',
              "state": model.state || '',
            }
          }
          if (model.title) {
            console.log('model.title', model.title)

          }
          if (model.rate) {
            console.log('model.rate', model.rate)

          }
          this.service.uploadInsert(request).subscribe((x: any) => {
            if (x) {
              this.toggleSuccess = true;
              this.getDocuments();
            }
          });

          this.form.reset();
        }
      }
    });
  }

  onClosed(): void {
    this.toggleError = false;
    this.toggleSuccess = false;

  }

  public onDocChange(param: any) {
    this.fields[1].fieldGroup
    console.log('this.fields[1].fieldGroup', this.fields[1].fieldGroup)
    return true;

  }

  public goBack() {
    window.history.back();
  }

}