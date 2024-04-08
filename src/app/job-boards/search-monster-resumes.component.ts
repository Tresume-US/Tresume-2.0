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
    selector: 'app-search-monster-resumes',
    templateUrl: './search-monster-resumes.component.html',
    providers: [JobBoardsService, CookieService, MessageService, NgxExtendedPdfViewerService],
    styleUrls: ['./search-resumes.component.scss']
})


export class SearchResumesMonsterComponent implements OnInit {

    form = new FormGroup({});
    form1 = new FormGroup({});
    model: any = {};
    options: FormlyFormOptions = {};
    fields: FormlyFieldConfig[] = [
        {
            key: 'keyword',
            type: 'input',
            templateOptions: {
                label: 'Job Title',
                placeholder: 'Search jobs, keywords, companies',
                required: true,
            },
        },
        {
            key: 'jobDesc',
            type: 'textarea',
            templateOptions: {
                label: 'Job Description',
                placeholder: 'Enter Job Description',
                required: true,
                rows: 5
            },
        }
    ];

    fieldBool: FormlyFieldConfig[] = [
        {
            key: 'boolean',
            type: 'input',
            templateOptions: {
                label: 'Boolean',
                placeholder: 'Search boolean query',
                required: true,
            },
        },
    ];

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
        { name: 'Citizen' },
        { name: 'PermanentResident' },
        { name: 'Other' }

    ];

    educationDegree: any[] = [
        { value: 'Vocational', name: 'Vocational' },
        { value: 'High School', name: 'High School' },
        { value: 'Associate Degree', name: 'Associate Degree' },
        { value: 'Bachelors Degree', name: 'Bachelor\'s Degree' },
        { value: 'Masters Degree', name: 'Master\'s Degree' },
        { value: 'Doctorate', name: 'Doctorate' },

    ];

    securityClearances: any[] = [
        { value: 2, name: 'Unspecified' },
        { value: 3, name: 'Active Confidential' },
        { value: 4, name: 'Active Secret' },
        { value: 5, name: 'Active Top Secret' },
        { value: 6, name: 'Active Top Secret/SCI' },
        { value: 19, name: 'Active TS/SCI-CI Polygraph' },
        { value: 20, name: 'Active TS/SCI-FS Polygraph' },
        { value: 21, name: 'Other Active Clearance' }
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
    resultsFound: boolean = false;
    loading: boolean = false;
    searchRequestItem: CBSearchRequestItem = {};
    daysWithin: number;
    searchSkill: string;
    yearsOfExp: number;
    yearsOfExpmin: number;
    schoolName: string;
    willingToRelocate: boolean;
    hasSecurityClearance: boolean;
    selectedWorkstatus: any[] = [];
    selectedEducationDegree: any;
    selectedSecurityClearance: any;
    searchType: SearchType = SearchType.jobDetail;
    fileBlob: any;
    fileReady: boolean = false;
    visibleSidebar2: boolean = false;
    isPDFSrc: boolean = false;
    objUrl: SafeHtml;
    currentResumeResp: any;
    private alreadyRendered: Array<HTMLSpanElement> = [];
    migratedProfiles: any[] = [];

    @ViewChild('lgModal', { static: false }) lgModal?: ModalDirective;
    @ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;
    accessToken: any;
    totalResults: any;
    quota: any;
    componentInitialized: boolean;
    application: any;
    currentResumeID: any;
    isMigratedProfile: boolean = false;

    showcrediterror: boolean = false;

    //division 
    creditcount: any = 0;
    usedcount: any = 0;
    clientip: any;
    OrgID: any;
    userName1: any;
    TraineeID: any;
    divID: any;
    jobID: any = 3;
    isallowed: any = true;
    divcandidateemail: any = '';
    availablecredits:any = 0;
    Htmlresumetopdf: any;
    cfullname: string;
    clocation: any;
    cyearsofExperience: string;
    cemail: any;
    cphone: any;
    cjobtitle: any;
    cskill: any;
    migratedResumeID: any;
    cworkpermit: string;
    csocialsource: string;
    ceducation: string;

    constructor(private route: ActivatedRoute, private service: JobBoardsService, private cookieService: CookieService,
        private messageService: MessageService, private sanitizer: DomSanitizer, private pdfViewerService: NgxExtendedPdfViewerService) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        // this.traineeId = this.cookieService.get('TraineeID')
    }

    ngOnInit(): void {

        this.OrgID = this.cookieService.get('OrgID');
        this.userName1 = this.cookieService.get('userName1');
        this.TraineeID = this.cookieService.get('TraineeID');
        this.cookieValue = this.cookieService.get('userName1');

        // this.OrgID = 9;
        // this.userName1 = 'karthik@tresume.us';
        // this.TraineeID = 36960;

        this.initGrid();
        //test account
        /* let request = {
            client_id: "xtresume_mpsx01",
            client_secret: "f5u0Lu4AwqcK6NMM",
            scope: "GatewayAccess",
            grant_type: "client_credentials"
        }; */
        let request = {
            client_id: "xw315565570wxrds",
            client_secret: "3FeLETRO2RvkMszQ",
            scope: "GatewayAccess",
            grant_type: "client_credentials"
        };
        this.service.getMonsterAuthToken(request).subscribe((x: any) => {
            if (x) {
                this.accessToken = x.access_token;
            }
        });
        console.log(this.traineeId);
        let migrateCheckReq = {
            source: 'Monster',
            traineeId: this.traineeId
        }
        this.service.checkIfProfileMigrated(migrateCheckReq).subscribe((response: any) => {
            this.migratedProfiles = response;

        })

        this.jobID = 3

        this.fetchcredit();
        this.ipaddress();
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

    private download(params: any) {
        let inputString;
        if(this.searchType ==2){
          inputString = this.model.boolean || '';
        }else{
          inputString = this.model.keyword || '';
        }
        console.log(this.model.boolean);
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
            keywords = keywords.filter((keyword) => keyword !== '');
            keywords = keywords.map((keyword) => keyword.replace(/^"|"$/g, ''));
          } else {
            keywords = [];
          }
        }

        console.log(keywords);
        let req1 = {
            md5emailID: params.textResumeID
        };
        this.service.checkmd5resume(req1).subscribe((y: any) => {
            if (y.length > 0) {
                this.isPDFSrc = false;
                this.objUrl = this.highlightSkills(y[0].HtmlResume, keywords);
                this.Htmlresumetopdf = y[0].HtmlResume;
                this.loading = false;
                this.fileReady = true;
                this.visibleSidebar2 = true;
                this.cfullname = (y[0].FirstName ?? '') + ' ' + (y[0].LastName ?? '');
                this.clocation = y[0].CurrentLocation ?? '';
                this.cyearsofExperience = ((y[0].YearsOfExpInMonths ?? 0) / 12).toString();
                this.cemail = y[0].UserName ?? '';
                this.cphone = y[0].PhoneNumber ?? '';
                this.cjobtitle = y[0].Title ?? '';
                const skillsString = y[0].Skill || '';
                const skillsArray = skillsString.split(',');
                const skillsObject = skillsArray.map((skill: any) => ({ skill }));
                console.log(skillsObject);
                this.cskill = skillsObject;
                this.migratedResumeID = y[0].UserName ?? '';
            } else {
                let req2 = {
                    resumeID: params.textResumeID,
                    token: this.accessToken
                };
                this.loading = true;
                this.service.getMonsterCandidateDetails(req2).subscribe((x: any) => {
                    this.loading = false;
                    if (x.status == 'fail') {
                        this.messageService.add({ severity: 'warning', summary: 'No Resume Found' });
                        return;
                    }
                    let profileDetails = x;
                    let emailID = profileDetails.identity.emailAddress;
                    this.divcandidateemail = emailID;
                    let name = profileDetails.identity.name.split(' ');
                    let firstName = name[0];
                    let lastName = name[1] || '';
                    let title = profileDetails.targetJobTitle;
                    let CurrentLocation = profileDetails.location.state || '';
                    let YearsOfExpInMonths = (profileDetails.yearsOfExperience * 12).toString();
                    let skilllist: any[] = profileDetails.relevance.skills || [];
                    let skills: string[] = [];
                    skilllist.forEach((itm: any) => {
                        skills.push(itm.name);
                    });
                    let HtmlResume = profileDetails.resume;
                    let source = 'Monster';
                    let ATSID = params.textResumeID;
    
                    this.cfullname = firstName + ' ' + lastName;
                    this.clocation = CurrentLocation;
                    this.cphone = '';
                    this.cemail = emailID;
                    this.cworkpermit = '';
                    this.cyearsofExperience = profileDetails.yearsOfExperience;
                    this.cjobtitle = title;
                    this.csocialsource = '';
                    this.ceducation = '';
                    this.cskill = skills;
    
                    let b64Data: any = x.resumeDocument.file;
                    this.fileBlob = b64Data;
                    let contentType = x.resumeDocument.fileContentType;
                    this.isPDFSrc = contentType === 'application/pdf';
                    this.currentResumeResp = x.resumeDocument;
                    const blob = b64toBlob(b64Data, contentType);
                    if (!this.isPDFSrc) {
                        this.objUrl = this.sanitizer.bypassSecurityTrustHtml(x.resume);
                        /* const re = new RegExp(`\\b${this.model.boolean}\\b`, 'gi');
                        this.objUrl = x.resume.replace(re, `<mark>${this.model.boolean}</mark>`); */
                    }
                    this.fileReady = true;
                    this.visibleSidebar2 = true;
                    let securityclearance = '0'
                    if (this.selectedSecurityClearance && this.selectedSecurityClearance.value != 2) {
                        securityclearance = '1';
                      } else {
                        securityclearance = '0';
                      }
                    let createRequest: MonsterProfileRequestItem = {
                        emailID: emailID,
                        firstName: firstName,
                        lastName: lastName,
                        title: title,
                        currentLocation: CurrentLocation,
                        yearsOfExpInMonths: YearsOfExpInMonths,
                        skills: skills,
                        htmlResume: HtmlResume,
                        source: source,
                        ATSID: ATSID,
                        traineeId: this.traineeId,
                        securityclearance:securityclearance
                    };
                    this.service.createJobSeekerProfile(createRequest).subscribe(z => {
                        console.log('z', z);
                        let saveResumeReq = {
                            Filename: x.resumeDocument.fileName,
                            Content: this.fileBlob,
                            userName: this.traineeId,
                            emailID: emailID
                        };
                        this.service.saveResume(saveResumeReq).subscribe(() => {
                            // Handle success if needed
                        });
                    });
                    this.adddivisionaudit();
                });
            }
        });
    }
    highlightSkills(htmlContent: string, skills: string[]): string {
        skills.forEach((skill) => {
          // Constructing regex pattern to match all variations of the skill
          var htmltagslist = [
            'data',
            'big',
            'center',
            'embed',
            'form',
            'meta',
            'input',
            'select',
            'menu',
            'style',
            'strike',
            'border',
            'disc',
            'type',
            'circle',
          ];
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
    

    public downloadDoc() {
        if (this.isMigratedProfile) {
            let req = {
                userName: this.currentResumeID
            }
            this.service.getResumePath(req).subscribe((x: any) => {
                FileSaver.saveAs("https://tresume.us/" + x[0].ResumePath, x[0].ResumeName);
            });
        }
        else {
            const blob = b64toBlob(this.currentResumeResp.file, this.currentResumeResp.fileContentType);
            FileSaver.saveAs(blob, this.currentResumeResp.fileName);
        }
    }

    public highlightWords(event: any): void {
        event.source.textLayer.textDivs.forEach((span: any) => { this.alreadyRendered.push(span); });
        event.source.textLayer.textDivs.forEach((span: any) => { this.doMarkLongWordsInSpan(span); });
    }

    public doMarkLongWordsInSpan(span: HTMLSpanElement): void {

        const withMarks = span.innerText.split(' ').map((t) => this.markOneLongWord(t)).join(' ');
        span.innerHTML = withMarks;

    }

    private markOneLongWord(word: string): string {
        if (word == this.model.boolean)
        /* if (word.length>6) */ {
            return `<div style="background-color: #00f;">${word}</div>`;
        }
        return word;
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
        let req = {};
        let objectReq: SearchReqItem;
        if (this.searchType == SearchType.jobDetail) {
            req = {
                token: this.accessToken,
                jobTitle: this.model.keyword,
                jobDesc: this.model.jobDesc,
                location: this.selectedState,
                radius: this.searchRequestItem.locationRadius,
                page: this.searchRequestItem.page,
                searchType: 'jobDetail'
            }
        }
        if (this.searchType == SearchType.semantic) {
            objectReq = {
                country: 'US',
                searchType: 'semantic',
                semantic: {
                    booleanExpression: {
                        expression: this.model.boolean,
                        importance: 'Required'
                    },
                    locations: [
                        {
                            locationExpression: this.selectedState,
                            radius: this.searchRequestItem.locationRadius ? this.searchRequestItem.locationRadius : 25
                        }
                    ],

                    resumeUpdatedMaximumAge: this.daysWithin * 1440,
                    willingnessToRelocate: this.willingToRelocate

                }
            };
            let legalStatuses = [];
            if (this.selectedWorkstatus) {
                for (let legalStatus of this.selectedWorkstatus) {
                    legalStatuses.push({
                        countryAbbrev: 'US',
                        legalStatusName: legalStatus.name
                    })
                }
            }
            objectReq.semantic.legalStatuses = legalStatuses;
            if (this.yearsOfExp && this.yearsOfExpmin) {
                objectReq.semantic.yearsOfExperience = {
                    expression: this.yearsOfExpmin.toString()+'-'+this.yearsOfExp.toString(),
                    importance: 'Required'
                }
            }else if(this.yearsOfExp) {
                objectReq.semantic.yearsOfExperience = {
                    expression: '0-'+this.yearsOfExp.toString(),
                    importance: 'Required'
                }
            }else if(this.yearsOfExpmin){
                objectReq.semantic.yearsOfExperience = {
                    expression: this.yearsOfExpmin.toString(),
                    importance: 'Required'
                }
            }

            if (this.selectedEducationDegree?.value) {
                objectReq.semantic.degrees = [{
                    degreeName: this.selectedEducationDegree.value,
                    importance: 'Required'
                }]
            }
            if (this.selectedSecurityClearance?.value) {
                objectReq.semantic.securityClearances = [{
                    clearanceId: this.selectedSecurityClearance.value,
                    countryAbbrev: 'US'
                }]
            }
            req = {
                token: this.accessToken,
                page: this.searchRequestItem.page,
                searchType: 'semantic',
                searchRequest: objectReq
            }
        }
        this.loading = true;
        if (this.searchRequestItem.page == undefined) {
            let auditReq = {
                jobBoard: 'Monster',
                query: this.model.boolean,
                dateTime: new Date(),
                userName: this.cookieValue
            }
            this.service.jobBoardAudit(auditReq).subscribe(x => { });
        }

        this.service.getMonsterSearch(req).subscribe((x: any) => {
            this.loading = false;
            this.resultsFound = false;
            let response = x;
            this.rowData = response.candidates;
            if (this.rowData.length > 0) {
                this.resultsFound = true;
                this.totalResults = response.boards[0].matched;
                this.rowData.map((items: any) => {
                    items.migrated = this.migratedProfiles.find(x => x.ATSID == items.identity.textResumeID) ? true : false;
                    if (this.showcrediterror == true) {
                        items.showmigrated = this.migratedProfiles.find(x => x.ATSID == items.EdgeID) ? true : false;
                    }
                    let item: any = items.relevance;
                    if (item.skills) {
                        items.skills = [];
                        item.skills.forEach((itm: any) => {
                            items.skills.push(itm.name);
                        });
                    }
                });
            }
            console.log('this.rowData', this.rowData)
        });
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
                    this.messageService.add({ severity: 'warning', summary: 'Error', detail: 'No division credit found' });
                    reject('No division credit found');
                  } else {
                    this.creditcount = x.result[0].umonster;
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
                jobboardName: 'Monster',
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
                  var percentage = (this.usedcount / this.creditcount) * 100;
                  let Req3 = {
                    type: type,
                    jobID: this.jobID,
                    divid: this.divID,
                    jobboardName: 'Monster',
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
                    this.messageService.add({ severity: 'warning', summary: 'Error', detail: 'You dont have enough credit to View Resume' });
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

    public nocredits(){
        this.messageService.add({ severity: 'warning', summary: 'Error', detail: 'You dont have enough credit to View Resume' });
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

export enum SearchType {
    jobDetail = 1,
    semantic
}

export interface SearchReqItem {
    country?: string;
    searchType?: string;
    semantic: {
        booleanExpression?: {
            expression: string,
            importance: string
        },
        candidateName?: string,
        degrees?: [
            {
                degreeName: string,
                importance: string
            }
        ],
        legalStatuses?: any[],
        securityClearances?: any[],
        locations?: [
            {
                city?: string,
                state?: string,
                postalCode?: string,
                radius: number,
                radiusUnit?: string,
                locationExpression: string
            }
        ],
        resumeUpdatedMaximumAge?: number,
        willingnessToRelocate?: boolean,
        yearsOfExperience?: {
            expression: string,
            importance: string
        }
    }

}

export interface MonsterProfileRequestItem {
    emailID?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    currentLocation?: string;
    yearsOfExpInMonths?: string;
    skills?: string[];
    htmlResume?: string;
    source?: string;
    ATSID?: string;
    traineeId?: string | null;
    securityclearance?: string | null;
}
