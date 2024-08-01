import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GridOptions, ColDef, RowNode, Column, GridApi } from 'ag-grid-community';
import { JobBoardsService } from './job-boards.service';
import { CookieService } from 'ngx-cookie-service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import * as FileSaver from 'file-saver';
// import * as htmlDocx from 'html-docx-js';
// import * as html2pdf from 'html2pdf.js';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxExtendedPdfViewerService, TextLayerRenderedEvent } from 'ngx-extended-pdf-viewer';
import * as html2pdf from 'html2pdf.js';

const b64toBlob = (b64Data: any, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

@Component({
    selector: 'app-search-cb-resumes',
    templateUrl: './search-cb-resumes.component.html',
    providers: [JobBoardsService, CookieService, MessageService],
    styleUrls: ['./search-resumes.component.scss']
})


export class SearchResumesCBComponent implements OnInit {

    @ViewChild('pdfdoc') pdfdoc: ElementRef;

    form = new FormGroup({});
    model: any = {};
    options: FormlyFormOptions = {};
    fields: FormlyFieldConfig[] = [
        {
            key: 'keyword',
            type: 'input',
            templateOptions: {
                label: 'Keywords',
                placeholder: 'Enter the search keyword',
                required: true,
            },
        },
    ];
keyWord:string
    states: any[] = [
        'Alabama',
        'Alaska',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Dakota',
        'North Carolina',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'Washington DC',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
        //canada
        'Ontario',
        'Alberta',
        'British Columbia',
        'Manitoba',
        'New Brunswick',
        'Newfoundland and Labrador',
        'Nova Scotia',
        'Prince Edward Island',
        'Quebec',
        'Saskatchewan',
        'Northwest Territories',
        'Nunavut',
        'Yukon'
    ];

    workStatus: any[] = [
        { value: 'CTAY', name: 'Can work for any employer' },
        { value: 'CTCT', name: 'US Citizen' },
        { value: 'CTEM', name: 'H1 Visa' },
        { value: 'CTGR', name: 'Green Card Holder' },
        { value: 'CTNO', name: 'Need H1 Visa Sponsor' },
        { value: 'CTNS', name: 'Not Specified' },
        { value: 'EATN', name: 'TN Permit Holder' },
        { value: 'EAEA', name: 'Employment Authorization Document' },

    ];

    educationDegree: any[] = [
        { value: 'CE5', name: 'Not Specified' },
        { value: 'CE30', name: 'Vocational' },
        { value: 'CE31', name: 'High School' },
        { value: 'CE32', name: 'Associate Degree' },
        { value: 'CE321', name: 'Bachelor\'s Degree' },
        { value: 'CE3210', name: 'Master\'s Degree' },
        { value: 'CE3211', name: 'Doctorate' },

    ];

    employedTypes = [
        { value: 'True', name: 'True' },
        { value: 'False', name: 'False' },
    ]
       jobTypes = [
        { label: 'Contract to Hire', value: 'ETCH' },
        { label: 'Contract - Corp-to-Corp', value: 'ETCC' },
        { label: 'Contract - Independent 1099', value: 'ETCI' },
        { label: 'Contract - W2', value: 'ETC2' },
        { label: 'Consultant', value: 'ETCN' },
        { label: 'Full-Time', value: 'ETFE' },
        { label: 'Part-Time', value: 'ETPE' },
        { label: 'Contractor', value: 'ETCT' },
        { label: 'Intern', value: 'ETIN' },
        { label: 'Seasonal/Temp', value: 'ETTS' },
        { label: 'Not Specified', value: 'ETNS' },
        { label: 'Permanent', value: 'ETPT' },
        { label: 'Freelance', value: 'ETFL' },
        { label: 'Apprenticeship', value: 'ETAP' },
        { label: 'Student - Professional', value: 'ETSP' },
        { label: 'Student - Apprentice', value: 'ETSA' },
        { label: 'Temporary/Part Time', value: 'ETTP' },
        { label: 'Temporary/Full Time', value: 'ETTF' },
        { label: 'Per Diem', value: 'ETPD' },
        { label: 'Full Time/Part Time', value: 'ETFP' },
        { label: 'Franchises', value: 'ETFR' },
        { label: 'Bank', value: 'ETBK' }
    ];

    rowData: any;
    columnDefs: any;
    public gridOptions: GridOptions = {};
    public gridApi: GridApi;
    public selectedState: string;
    public resumeHTMLContent: string;
    traineeId: string | null;
    private cookieValue: any;
    modalRef?: BsModalRef;
    loggedTraineeId: any;
    skills: any[] = [];
    edgeIDs: any[] = [];
    resultsFound: boolean = false;
    loading: boolean = false;
    searchRequestItem: CBSearchRequestItem = {};
    daysWithin: string;
    searchSkill: string;
    yearsOfExp: string;
    excludeTerms: string;
    schoolName: string;
    maxSkillsPerProfile: number;
    selectedJobType: { label: string, value: string };
    currentlyEmployed: { value: string, name: string };
    willingToRelocate: boolean;
    hasSecurityClearance: boolean;
    selectedWorkstatus: any[] = [];
    selectedEducationDegree: any;
    migratedProfiles: any[] = [];
    isProfileLoaded: boolean = false;
    currentResumeContent: any;
    visibleSidebar2: boolean = false;
    application: any;
    fileReady: boolean = false;
    isPDFSrc: boolean = false;
    objUrl: any;
    componentInitialized: boolean;
    currentResumeResp: any;
    currentEdgeID: any;
    currentResumeID: any;
    isMigratedProfile: boolean = false;

    availablecredits:any = 0;

    @ViewChild('lgModal', { static: false }) lgModal?: ModalDirective;
    @ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;
    accessToken: any;
    totalResults: any;
    quota: any;


    //division 
    creditcount: any = 0;
    usedcount: any = 0;
    clientip: any;
    OrgID: any;
    userName1: any;
    TraineeID: any;
    divID: any;
    jobID: any = 4;
    isallowed: any = true;
    divcandidateemail: any = '';
    description: string = '';
    showcrediterror: boolean = false;
    cbcrediterror:boolean = false
    cfullname: any;
    clocation: any;
    cphone: any;
    cemail: any;
    cworkpermit: any;
    cyearsofExperience: any;
    cjobtitle: any;
    csocialsource: any;
    ceducation: any;
    cskill: any;

    constructor(private route: ActivatedRoute, private service: JobBoardsService, private cookieService: CookieService,
        private messageService: MessageService, private sanitizer: DomSanitizer) {
        this.traineeId = this.cookieService.get('TraineeID');
        if (this.traineeId == '') {
            this.traineeId = localStorage.getItem("TraineeID");
        }
        //(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    }

    ngOnInit(): void {
        this.loading = true;
        this.cookieValue = this.cookieService.get('userName1')
        //division
        this.OrgID = this.cookieService.get('OrgID');
        this.userName1 = this.cookieService.get('userName1');
        this.TraineeID = this.cookieService.get('TraineeID');

        // this.OrgID = 9;
        // this.userName1 = 'karthik@tresume.us';
        // this.TraineeID = 36960;

        this.fetchcredit();
        this.ipaddress();
        this.jobID = 4;

        this.initGrid();
        // this.accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk3OGYxMjUzMGNiMjMzZWVkYTQwOTI1OGNiYzhjNTA3IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL2F1dGguY2FyZWVyYnVpbGRlci5jb20iLCJuYmYiOjE3MTc2ODkyNDQsImlhdCI6MTcxNzY4OTI0NCwiZXhwIjoxNzE3NjkxMzQ0LCJzY29wZSI6WyJvcGVuaWQiXSwiYW1yIjpbInB3ZCJdLCJjbGllbnRfaWQiOiJDYTliODhiOTUiLCJjbGllbnRfb3duZXJfaWQiOiJPNDU2ZmVmNGZkNGE3ZjEiLCJjbGllbnRfcmVnaW9uIjoicHJvZHVzIiwic3ViIjoiVTJTODc0NjU3QjU0UTVSWUZDWiIsImF1dGhfdGltZSI6MTcxNzY4MDk4NCwiaWRwIjoibG9jYWwiLCJ1c2VyX3R5cGUiOiJFbXBsb3llckNvbXBhbnkiLCJhY2NvdW50cyI6WyJBNzkwTTU2Nko0SkoyTFFEMzFWIl0sImFjY291bnRkaWQiOiJBNzkwTTU2Nko0SkoyTFFEMzFWIiwic2lkIjoiRkJCNjkwODM0MTZBRTczRjRGRUQ4RjdGMzk5QzZFMjYifQ.BASUGjOmeX_1SHQ2FhtawOw-yhAMaaNz4ZSi0MMOQa96fcuuVdXRjlk67MEqGYsHAQQqG5ajEqgDnuuDY3yuLoSDRpzI6y7CyMBAfUvaPALkJMja6hpQP7pq_leyx2rRhm2eh2xRjzmkl3BMKcOV0VOSTF0gN_NanKV_YBswS3IpS7-76hM6RVAgR5aObwXVawRTfyxyGJKiLgET0Yu7WS0gNc0Y9O1St9trAr4BlZgn_1JsRJv_Y6tzRxHifbaCMkw7XoDofXje8nkf9j2WuW977WLE6yZOFwdJEetqgf1ATz5x9u6TCxiJETn2zPfCVlisO1LlnyqMJz6xRcA_ag';
        this.service.getCBAuthToken().subscribe((x: any) => {
            if (x.code != 460) {
                this.accessToken = x.access_token;

            }
            else {
                this.messageService.add({ severity: 'warning', summary: 'Server Issue from Career Builder. Please try again later.' });
            }
            this.loading = false;
        }, error => {
            this.loading = false;
            this.messageService.add({ severity: 'warning', summary: 'Server Issue from Career Builder. Please try again later.' });
            // Handle error if needed
        });

        console.log(this.traineeId);

        let migrateCheckReq = {
            source: 'CB',
            traineeId: this.traineeId
        }
        this.service.checkIfProfileMigrated(migrateCheckReq).subscribe((response: any) => {
            console.log('response', response)
            this.migratedProfiles = response;

        })
        /* if (this.traineeId) {
            let req = {
                "traineeId": this.traineeId,
                "keyword": ''
            }
            this.service.getResumes(req).subscribe(x => {
                let response = x.result;
                this.rowData = response;
                this.paginatedArray = this.rowData.slice(0, 10);
                console.log('this.rowData', this.rowData)
                this.sizeToFit();

            });
        }
        else {
            let req = {
                userName: this.cookieValue
            }
            this.service.getLoggedUser(req).subscribe((x: any) => {
                if (x) {
                    this.traineeId = x[0].TraineeID;
                }
                let req = {
                    "traineeId": this.traineeId,
                    "keyword": ''
                }
                this.service.getResumes(req).subscribe(x => {
                    let response = x.result;
                    this.rowData = response;
                    console.log('this.rowData', this.rowData)
                    this.sizeToFit();

                });
            });
        } */
    }

    public initGrid() {
        let cellRendererFn = function (params: any): any { return null; };
        this.columnDefs = [
            { headerName: 'Source', field: 'Source', sortable: true, resizable: true, filter: true },
            { headerName: 'Name', field: 'FullName', sortable: true, resizable: true, filter: true },
            { headerName: 'Years of Exp', field: 'YRSEXP', sortable: true, resizable: true, valueFormatter: this.yearsRender.bind(this), filter: true },
            { headerName: 'Location', field: 'CurrentLocation', sortable: true, resizable: true, filter: true },
            { headerName: 'Legal Status', field: 'LegalStatus', sortable: true, resizable: true, filter: true },
            { headerName: 'Title', field: 'TraineeTitle', sortable: true, resizable: true, filter: true },
            { headerName: 'Last Update', field: 'LastUpdateTime', resizable: true, valueFormatter: this.renderCell.bind(this) }
        ];

        this.columnDefs.push({
            headerName: '', field: 'download', minWidth: 60, maxWidth: 60,
            onCellClicked: this.download.bind(this),
            cellClass: "fa fa-info-circle",
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

    public downloadDoc() {
        const blob = b64toBlob(this.currentResumeResp.Content, this.currentResumeResp.ContentType);
        FileSaver.saveAs(blob, this.currentResumeResp.Filename);
    }

    public download() {
        
        if (this.isMigratedProfile) {
            // alert('clicked2');
            // this.messageService.add({ severity: 'warning', summary: 'Resume Migrated. Get details from Quick View' });
            // return;
            // let docBlob: any = htmlDocx.asBlob(this.objUrl);
            // html2pdf().from(this.objUrl).save(this.currentEdgeID + '.pdf');
            // FileSaver.saveAs(docBlob, this.currentEdgeID + '.docx');
            //  let req = {
            //     userName: this.currentResumeID
            // }
            // this.service.getResumePath(req).subscribe((x: any) => {
            //     console.log('x', x)
            //     FileSaver.saveAs("https://tresume.us/" + x[0].ResumePath, x[0].ResumeName);
            // }); 
        const pdfdoc = this.pdfdoc.nativeElement;
        const pdfOptions = {
          margin: 10,
          filename: 'Resume.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf().from(pdfdoc).set(pdfOptions).save();
        }
        else {
            let req = {
                edgeID: this.currentEdgeID,
                token: this.accessToken,
                userName: this.traineeId
            }
            this.loading = true;
            this.service.downloadCBpdf(req).subscribe((x: any) => {
                console.log('x', x)
                // this.isPDFSrc = (x.ContentType === "application/pdf") ? true : false;
                let b64Data: any = x.Content;
                this.currentResumeResp = x;
                this.currentResumeContent = x.Content;
                let contentType = x.ContentType;
                const blob = b64toBlob(b64Data, contentType);
                this.loading = false;
                //this.isProfileLoaded = true;
                /* let req22 = {
                    file: blob,
                    fileName: x.Filename,
     
                }
                this.service.uploadJobBoardResume(req22).subscribe(y => {
                    console.log('y', y)
     
                }); */
                FileSaver.saveAs(blob, x.Filename);
            });
        }
    }

    private yearsRender(params: any) {
        if (params.value && params.value > 11) {
            return params.value / 12;
        }
        else if (params.value > 0) {
            return params.value + ' Month';
        }
        else {
            return '';
        }
    }

    private renderCell(params: any) {
        if (params.value && params.value != '1900-01-01') {
            return params.value;
        }
        else {
            return '';
        }
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

    public onSearch() {
        let req = {
            token: this.accessToken
        }
        this.service.getCBQuota(req).subscribe((x: any) => {
            this.quota = x.data.RDBSlicesRemainingQuota;
            if(this.quota['us monthly'] == 0){
                this.cbcrediterror = true;
                this.messageService.add({ severity: 'warning', summary: 'Careerbuilder Monthly Quota Exhausted' });
            }else if(this.quota['us daily'] == 0){
                this.cbcrediterror = true;
                this.messageService.add({ severity: 'warning', summary: 'Careerbuilder Daily Quota Exhausted' });
            }
        });
        if (this.searchRequestItem.page == undefined) {
            let auditReq = {
                jobBoard: 'CB',
                query: this.model.keyword,
                dateTime: new Date(),
                userName: this.cookieValue
            }
            this.service.jobBoardAudit(auditReq).subscribe(x => { });
        }
        this.loading = true;
        //this.resultsFound = false;
        this.searchRequestItem.query = this.model.keyword;
        this.searchRequestItem.token = this.accessToken;
        this.searchRequestItem.resultsPerPage = 10;
        this.searchRequestItem.locations = this.selectedState;
        this.searchRequestItem.filters = this.getFilterValues();
        this.searchRequestItem.facetFilter = this.getFacetFilterValues();
        this.edgeIDs = [];
        this.keyWord=this.model.keyword.toLowerCase()
        this.service.getCBResumes(this.searchRequestItem).subscribe((x: any) => {
            if (x.code == 401) {
                this.messageService.add({ severity: 'warning', summary: 'Session Expired. Please refresh the page' });
                return;
            }
            this.loading = false;
            this.resultsFound = true;
            let response = x.data;
            this.totalResults = response.TotalResults;
            this.rowData = response.Results;
            this.rowData.map((items: any) => {
                items.migrated = this.migratedProfiles.find(x => x.ATSID == items.EdgeID) ? true : false;
                if (this.showcrediterror == true) {
                    items.showmigrated = this.migratedProfiles.find(x => x.ATSID == items.EdgeID) ? true : false;
                }
                console.log('items.migrated', items.migrated)
                let item: any = Object.keys(items.Keywords);
                items.skills = [];
                item.forEach((itm: any, index: any) => {
                    if (index < 3) {
                        items.skills.push(itm);
                    }
                });
            });
            console.log('this.rowData', this.rowData)
            console.log('this.edgeIDs', this.edgeIDs)
        });
    }

    private getFilterValues() {
        let filter: string = '';
        if (this.daysWithin) {
            filter = 'ResumeModified:[NOW-' + this.daysWithin + 'DAYS/DAY TO *]';
        }
        if (this.searchSkill) {
            filter += 'Skill:[' + this.searchSkill + ']';
        }
        return filter;
    }

    public getFacetFilterValues() {
        let facetFilter: string = '';
        if (this.yearsOfExp) {
            facetFilter = 'YearsOfExperience:' + this.yearsOfExp;
        }
        if (this.schoolName) {
            facetFilter = 'School:[' + this.schoolName + ']';
        }
        if (this.willingToRelocate) {
            facetFilter += ' WillingToRelocate:' + this.willingToRelocate;
        }
        if (this.hasSecurityClearance) {
            facetFilter += ' SecurityClearance:' + this.hasSecurityClearance;
        }
        if (this.selectedWorkstatus.length > 0) {
            facetFilter += ' WorkStatus:' + this.selectedWorkstatus[0].value;
        }
        if (this.selectedEducationDegree) {
            facetFilter += ' HighestEducationDegreeCode:' + this.selectedEducationDegree.value;
        }
        if (this.excludeTerms) {
            facetFilter += ' ExcludeTerms:[' + this.excludeTerms + ']';
        }
        if (this.maxSkillsPerProfile) {
            facetFilter += ' MaxSkillsPerProfile:' + this.maxSkillsPerProfile;
        }
        if (this.selectedJobType) {
            facetFilter += ' DesiredJobType:' + this.selectedJobType.value;
        }
        if (this.currentlyEmployed !== undefined) {
            facetFilter += ' CurrentlyEmployed:' + this.currentlyEmployed;
        }
        if (this.description) {
            facetFilter += ' Description:[' + this.description + ']';
        }
        return facetFilter;
    }

    public selecteWorkstatus(value: any) {
        console.log('value', value)

    }

    public onPreview(params: any) {
        if (!this.showcrediterror) {
            let req = {
                token: this.accessToken,
                edgeID: params.EdgeID
            }
            this.loading = true;
            this.service.getCBProfileDetails(req).subscribe((profileDetails: any) => {
                let inputString = this.model.keyword || '';
              console.log(this.model.keyword);
              var keywords: any[] = [];
              if (inputString.trim() !== '') {
                keywords = inputString.match(/"[^"]+"|\S+/g);
                if (keywords !== null) {
                  keywords = keywords
                    .map((keyword: string) => keyword.replace(/(^"|"$|\(|\))/g, ''))
                    .filter(
                      (keyword: string) =>
                        !['and', 'or', 'not'].includes(keyword.toLowerCase())
                    );
                  keywords = keywords.filter(keyword => keyword !== '');
                  keywords = keywords.map(keyword => keyword.replace(/^"|"$/g, ''));
                } else {
                  keywords = [];
                }
              }

                console.log(keywords);
                if (profileDetails) {
                    this.currentEdgeID = params.EdgeID;
                    this.cfullname = profileDetails.Names[0].First+' '+profileDetails.Names[0].Last;
                    this.clocation = profileDetails.Locations.CurrentLocations[0].State;
                    this.cemail = profileDetails.IDs.Email.Identifiers[0].ID?.[0] ?? null;
                    this.cyearsofExperience = profileDetails.YearsOfExperience ;
                    this.cjobtitle = profileDetails.JobTitle?? null;
                    this.ceducation = profileDetails?.Educations;
                    this.cskill = profileDetails?.Keywords;
                    
                    //this.download(params);
                    console.log('x', profileDetails)
                    let emailID = profileDetails.IDs.Email.Identifiers[0].ID;
                    let firstName = profileDetails.Names[0].First;
                    let lastName = profileDetails.Names[0].Last;
                    let title = profileDetails.JobTitle;
                    let CurrentLocation = profileDetails.Locations.CurrentLocations[0].State;
                    let YearsOfExpInMonths = (profileDetails.YearsOfExperience * 12).toString();
                    let skilllist = Object.keys(profileDetails.Keywords);
                    let skills: any = [];
                    skilllist.forEach((itm: any) => {
                        skills.push(itm);
                    });
                    let HtmlResume = '';
                    let source = "CB";
                    let ATSID = profileDetails.EdgeID;
                    let UserOrganizationID = '';
                    this.currentResumeID = emailID;
                    this.divcandidateemail = profileDetails.IDs.Email.Identifiers[0].ID;
                    let req1: CBProfileRequestItem = {
                        emailID: emailID
                    }
                    this.service.checkIfResumeExists(req1).subscribe((y: any) => {
                        let resumedata = '';
                        if (y.length > 0) {

                            if(y[0].HtmlResume == '' || y[0].HtmlResume == null){
                                resumedata = 'No resumes found'
                            }else{
                                resumedata = y[0].HtmlResume
                            }

                            this.objUrl = this.highlightSkills(
                                resumedata,
                                keywords
                              );
                            // this.objUrl = this.sanitizer.bypassSecurityTrustHtml(y[0].HtmlResume);

                            this.loading = false;
                            this.fileReady = true;
                            this.visibleSidebar2 = true;
                            this.isMigratedProfile = true;
                        }
                        else {
                            this.isMigratedProfile = false;
                            let createRequest: CBProfileRequestItem = {
                                emailID: emailID,
                                firstName: firstName,
                                lastName: lastName,
                                title: title,
                                currentLocation: CurrentLocation,
                                yearsOfExpInMonths: YearsOfExpInMonths,
                                skills: skills,
                                source: 'CB',
                                ATSID: ATSID,
                                traineeId: this.traineeId,
                                securityclearance:this.hasSecurityClearance ? '1' : '0'
                            }
                            this.service.getCBResumePreview(req).subscribe((html: any) => {
                                this.loading = false;
                                this.fileReady = true;
                                this.visibleSidebar2 = true;
                                
                                if(html.flag == 1){
                                    createRequest.htmlResume = html.text
                                    resumedata = html.text
                                }else{
                                    resumedata = "No Resumes Found"
                                }
                                

                                if (!this.isPDFSrc) {
                                    // this.objUrl = this.sanitizer.bypassSecurityTrustHtml(html.text);
                                    this.objUrl = this.highlightSkills(
                                        resumedata,
                                        keywords
                                      );
                                }

                                this.service.createJobSeekerProfile(createRequest).subscribe(z => {

                                }, error => {
                                    this.loading = false;
                                    console.error('Error in createJobSeekerProfile:', error);
                                    // Handle error if needed
                                });
                            }, error => {
                                this.loading = false;
                                this.service.createJobSeekerProfile(createRequest).subscribe(z => {

                                }, error => {
                                    console.error('Error in createJobSeekerProfile:', error);
                                    // Handle error if needed
                                });
                            });
                            this.adddivisionaudit();
                        }
                    });
                }
            });
        }
        else {
            this.messageService.add({ severity: 'warning', summary: 'You dont have enough credits' });
        }
    }

    public downloadhtmlPdf(){
        setTimeout(() => {
          const options = {
            margin: [5, 5, 5, 5], // Optional margin settings
            filename: this.cfullname+'.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
    
          html2pdf()
            .from(document.getElementById('printpdf')!)
            .set(options)
            .save();
        });
      }

      ExportToDoc() {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
      
        const footer = "</body></html>";
      
        const html = header + ' ' + document.getElementById('printpdf')!.innerHTML+' ' + footer;
      
        console.log(html);
        const blob = new Blob(['\ufeff', html], {
          type: 'application/msword'
        });
      
        const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
      
        var filename = this.cfullname  ? this.cfullname  + '.doc' : 'document.doc';
      
        if ((navigator as any).msSaveOrOpenBlob) {
          // For Internet Explorer
          (navigator as any).msSaveOrOpenBlob(blob, filename);
        } else {
          // For other browsers
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = filename;
          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      }
    highlightSkills(htmlContent: string, skills: string[]): string {
        skills.forEach((skill) => {
          // Constructing regex pattern to match all variations of the skill
          var htmltagslist= ['data','big','center','embed','form','meta','input','select','menu','style','strike','border','disc','type','circle']
          if (!htmltagslist.includes(skill.toLowerCase())) {
            const regex = new RegExp(
              `\\b${skill
                .split('')
                .map((c) => `[${c}${c.toUpperCase()}]`)
                .join('')}+\\b`,
              'g'
            );
            console.log(regex);
            htmlContent = htmlContent.replace(
              regex,
              `<span style="background-color: yellow;font-weight: bold;">$&</span>`
            );
          }
          
        });
        return htmlContent;
      }
    
      sanitizeHtml(htmlContent: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
      }

    public goBack() {
        window.history.back();
    }

    pageChanged(event: PageChangedEvent): void {
        this.searchRequestItem.page = event.page;
        this.onSearch();
        const startItem = (event.page - 1) * event.itemsPerPage;
        const endItem = event.page * event.itemsPerPage;
        window.scrollTo(0, 0);

    }

    public onReady(): void {
        this.componentInitialized = true;
        this.application = (window as any).PDFViewerApplication;
        // this.info('PDF loading starts', this.application != null);
    }

    public close(result?: void) {
        // unbind offending event listeners
        const unbindWindowEvents = this.application?.unbindWindowEvents?.bind(this.application);
        if (typeof unbindWindowEvents === 'function') {
            unbindWindowEvents();
        } else {
            console.log('Error unbind pdf viewer')
        }
    }

    //Division

    public async fetchcredit() {
        try {
            let Req = {
                userName: this.userName1,
            };

            let type = 0;
            let divid = 0;

            const fetchDivisionCredit = (): Promise<void> => {
                return new Promise<void>((resolve, reject) => {
                    this.service
                        .fetchdvisioncredit(Req)
                        .toPromise()
                        .then((x: any) => {
                            console.log(x.result.length);
                            if (x.result.length == 0) {
                                this.showcrediterror = true;
                                this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'No division credit found' });
                                reject('No division credit found');
                            } else {
                                this.creditcount = x.result[0].ucb;
                                this.divID = x.result[0].id;
                                console.log(this.divID);
                                type = x.result[0].type;
                                divid = x.result[0].id;
                                resolve();
                            }
                        })
                        .catch((error: any) => {
                            reject(error);
                        });
                });
            };

            const fetchUsage = (): Promise<void> => {
                return new Promise<void>((resolve, reject) => {
                    let Req2 = {
                        type: type,
                        jobID: this.jobID,
                        divid: this.divID,
                        jobboardName: 'careerbuilder',
                        userName: this.userName1,
                    };
                    this.service
                        .fetchusage(Req2)
                        .toPromise()
                        .then((x: any) => {
                            console.log(x.result);
                            this.usedcount = x.result[0].row_count;
                            var count = this.creditcount - this.usedcount;
                            this.availablecredits = count;
                            var percentage = (10 / this.creditcount) * 100;
                            let Req3 = {
                                type: type,
                                jobID: this.jobID,
                                divid: this.divID,
                                jobboardName: 'careerbuilder',
                                percentage: percentage,
                            };
                            if (percentage >= 80) {
                                this.service
                                    .senddivisionerrormail(Req3)
                                    .toPromise()
                                    .then((x: any) => {
                                        // Handle the email sent
                                    })
                                    .catch((error: any) => {
                                        // Handle the email sending error
                                    });
                            }
                            console.log(count);
                            if (count <= 0) {
                                this.showcrediterror = true;
                                this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough credit to View Resume' });
                            }
                            resolve();
                        })
                        .catch((error: any) => {
                            reject(error);
                        });
                });
            };

            await fetchDivisionCredit();
            await fetchUsage();

            console.log(this.showcrediterror);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    //division
    public ipaddress() {
        let Req = {
            userName: this.userName1,
        };
        this.service.getclientipaddress(Req).subscribe((x: any) => {
            this.ipaddress = x.body;
            console.log(this.ipaddress)
        });
    }

    public adddivisionaudit() {
        let Req = {
            userName: this.userName1,
            divID: this.divID,
            jobID: this.jobID,
            ipaddress: this.ipaddress,
            candidateemail: ''
        };
        this.service.adddivisionaudit(Req).subscribe((x: any) => {
            this.ipaddress = x.body;
            console.log(this.ipaddress)
        });
        this.fetchcredit();

    }

    public nocredits() {
        if(this.showcrediterror){
            this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough credit to View Resume' });
        }else if(this.cbcrediterror){
            this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'Cant View Resume due to Careerbuilder Quota Exhausted' });
        }
        
    }


}

export interface CBSearchRequestItem {
    query?: string;
    token?: string;
    locations?: string;
    page?: number;
    resultsPerPage?: number;
    locationRadius?: number;
    jobTitle?: string;
    filters?: string;
    facetFilter?: string;
}


export interface CBProfileRequestItem {
    emailID?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    currentLocation?: string;
    yearsOfExpInMonths?: string;
    skills?: string;
    htmlResume?: string;
    source?: string;
    ATSID?: string;
    traineeId?: string | null;
    securityclearance?:string | null;
}

