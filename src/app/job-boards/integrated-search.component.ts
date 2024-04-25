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
    selector: 'app-integrated-search',
    templateUrl: './integrated-search.component.html',
    providers: [JobBoardsService, CookieService, MessageService],
    styleUrls: ['./search-resumes.component.scss']
})


export class IntegratedSearchComponent implements OnInit {

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
                label: 'Keywords',
                placeholder: 'Search jobs, keywords, companies',
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
        {dicevale:'', cbvalue: 'CTAY', name: 'Can work for any employer' },
        {dicevale:'us citizenship',cbvalue: 'CTCT', name: 'US Citizen' },
        {dicevale:'have h1', cbvalue: 'CTEM', name: 'H1 Visa' },
        {dicevale:'green card', cbvalue: 'CTGR', name: 'Green Card Holder' },
        {dicevale:'need h1',cbvalue: 'CTNO', name: 'Need H1 Visa Sponsor' },
        {dicevale:'',cbvalue: 'CTNS', name: 'Not Specified' },
        {dicevale:'tn permit holder', cbvalue: 'EATN', name: 'TN Permit Holder' },
        {dicevale:'', cbvalue: 'EAEA', name: 'Employment Authorization Document' },

    ];


    educationDegree: any[] = [
        { value: 'Vocational', name: 'Vocational' },
        { value: 'High School', name: 'High School' },
        { value: 'Associate Degree', name: 'Associate Degree' },
        { value: 'Bachelors Degree', name: 'Bachelor\'s Degree' },
        { value: 'Masters Degree', name: 'Master\'s Degree' },
        { value: 'Doctorate', name: 'Doctorate' },

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
    schoolName: string;
    willingToRelocate: boolean;
    hasSecurityClearance: boolean;
    selectedWorkstatus: any[] = [];
    selectedEducationDegree: any;
    searchType: SearchType = SearchType.jobDetail;

    @ViewChild('lgModal', { static: false }) lgModal?: ModalDirective;
    @ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;
    monsterAccessToken: any;
    cbAccessToken: any;
    diceaccessToken: any;
    cbData: any;
    monsterData: any;
    diceData: any;
    tresumeData:any;
    totalResults: number = 0;
    quota: any;

    visibleSidebar2: boolean = false;
    currentResumeResp: any;
    isPDFSrc: boolean = false;
    objUrl: SafeHtml;

    dicecreditcount: any = 0;
    diceusedcount: any = 0;

    cbcreditcount: any = 0;
    cbusedcount: any = 0;

    monstercreditcount: any = 0;
    monsterusedcount: any = 0;

    clientip: any;
    OrgID: any;
    userName1: any;
    TraineeID: any;
    divID: any;
    jobID: any = 3;
    isallowed: any = true;
    divcandidateemail: any = '';


    showmonstererror: boolean = false;
    showcberror: boolean = false;
    showdiceerror: boolean = false;
    fileReady: boolean = false;
    migratedResumeID: any;
    application: any;
    amonster:any=0;
    adice:any=0;
    acb=0;
    onlyWithSecurityClearance:boolean = true;

    constructor(private route: ActivatedRoute, private service: JobBoardsService, private cookieService: CookieService, private messageService: MessageService, private sanitizer: DomSanitizer) {
        this.traineeId = sessionStorage.getItem("TraineeID");
        //(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    }

    ngOnInit(): void {
        this.cookieValue = this.cookieService.get('userName1')
        this.OrgID = this.cookieService.get('OrgID');
        this.userName1 = this.cookieService.get('userName1');
        this.TraineeID = this.cookieService.get('TraineeID');

        // this.OrgID = 9;
        // this.userName1 = 'karthik@tresume.us';
        // this.TraineeID = 36960;

        this.initGrid();
        let request = {
            client_id: "xtresume_mpsx01",
            client_secret: "f5u0Lu4AwqcK6NMM",
            scope: "GatewayAccess",
            grant_type: "client_credentials"
        };
        this.service.getMonsterAuthToken(request).subscribe((x: any) => {
            if (x) {
                this.monsterAccessToken = x.access_token;
            }
        });
        this.service.getCBAuthToken().subscribe((x: any) => {
            if (x) {
                this.cbAccessToken = x.access_token;
            }
        });
        let request2 = '';
        this.service.getDiceAuthToken(request2).subscribe((x: any) => {
            if (x) {
                this.diceaccessToken = x.access_token;
            }
        });
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

        this.fetchcredit(2);
        this.fetchcredit(3);
        this.fetchcredit(4);
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
        console.log(params);
        if (params.type == 'monster') {
            let req = {
                resumeID: params.identity.textResumeID,
                token: this.monsterAccessToken
            }
            this.loading = true;
            this.service.getMonsterCandidateDetails(req).subscribe((x: any) => {
                this.loading = false;
                let b64Data: any = x.resumeDocument.file;
                let contentType = x.resumeDocument.fileContentType;
                const blob = b64toBlob(b64Data, contentType);
                FileSaver.saveAs(blob, x.resumeDocument.fileName);
                return;
            });
            this.adddivisionaudit(3);
        }
        if (params.type == 'cb') {
            let req = {
                edgeID: params.EdgeID,
                token: this.cbAccessToken
            }
            this.loading = true;
            this.service.downloadCBpdf(req).subscribe((x: any) => {
                this.loading = false;
                let b64Data: any = x.Content;
                let contentType = x.ContentType;
                const blob = b64toBlob(b64Data, contentType);
                FileSaver.saveAs(blob);
            });
            this.adddivisionaudit(4);
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

    /* public onSearch() {
        this.monsterSearch();
        this.cbSearch();
    } */

    async onSearch() {
        // debugger;
        const [result1, result2,result3,result4] = await Promise.all([this.monsterSearch(),this.DiceSearch(),this.tresumeSearch(),this.cbSearch()]);

        setTimeout(() => {
            this.shuffleResults();
        }, 5000);
    }

    public shuffleResults() {
        if (this.cbData) {
            this.cbData.map((x: any) => x.type = 'cb');
        }else{
            this.cbData = [];
        }
        if (this.monsterData) {
            this.monsterData.map((x: any) => x.type = 'monster');
        }else{
            this.monsterData = [];
        }
        if (this.diceData) {
            this.diceData.map((x: any) => x.type = 'dice');

        }else{
            this.diceData = [];

        }
        if (this.tresumeData) {
            this.tresumeData.map((x: any) => x.type = 'tresume');
        }else{
            this.tresumeData = [];

        }
        // if (this.cbData && this.monsterData && this.diceData && this.tresumeData) {
        //     var concated1 = this.cbData.concat(this.monsterData);
        //     let concated2 = concated1.concat(this.diceData);
        //     let concated = concated2.concat(this.tresumeData);
        //     concated.sort(() => Math.random() - 0.5);
        //     this.rowData = concated;
        //     console.log('concated', this.rowData)
        // }
        // else {
        //      this.rowData = this.diceData;
        
        // }

            var concated1 = this.cbData.concat(this.monsterData);
            let concated2 = concated1.concat(this.diceData);
            let concated = concated2.concat(this.tresumeData);
            concated.sort(() => Math.random() - 0.5);
            this.rowData = concated;
            console.log('concated', this.rowData)

    }

    public cbSearch() {
        if (this.cbAccessToken) {
            let req = {
                token: this.cbAccessToken
            }
            this.service.getCBQuota(req).subscribe((x: any) => {

                if (x.errors[0]) {
                    this.messageService.add({ severity: 'warning', summary: 'Career Builder Account Error' });
                    return;
                }

                this.quota = x.data.RDBSlicesRemainingQuota;
            });
            if (this.searchRequestItem.page == undefined) {
                let auditReq = {
                    jobBoard: 'CB',
                    query: this.model.boolean,
                    dateTime: new Date(),
                    userName: this.cookieValue
                }
                this.service.jobBoardAudit(auditReq).subscribe(x => { });
            }
            this.loading = true;
            //this.resultsFound = false;
            this.searchRequestItem.query = this.model.boolean;
            this.searchRequestItem.token = this.cbAccessToken;
            this.searchRequestItem.resultsPerPage = 10;
            this.searchRequestItem.locations = this.selectedState;
            this.searchRequestItem.filters = this.getFilterValues();
            this.searchRequestItem.facetFilter = this.getFacetFilterValues();
            this.service.getCBResumes(this.searchRequestItem).subscribe((x: any) => {

                if (x.errors[0]) {
                    this.messageService.add({ severity: 'warning', summary: 'Career Builder Account Error' });
                    return;
                }
                this.loading = false;
                this.resultsFound = true;
                let response = x.data;
                this.totalResults += response.TotalResults;
                this.cbData = response.Results;
                this.cbData.map((items: any) => {
                    let item: any = Object.keys(items.Keywords);
                    items.skills = [];
                    item.forEach((itm: any, index: any) => {
                        if (index < 3) {
                            items.skills.push(itm);
                        }
                    });
                });
                //return this.cbData;
                //console.log('cbDate', this.cbData)
            });
        }
    }

    public monsterSearch() {
        if (this.monsterAccessToken) {
            let req = {};
            let objectReq: any;
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

                }
            };
            if(this.yearsOfExp) {
                objectReq.semantic.yearsOfExperience = {
                    expression: this.yearsOfExp.toString()+'-'+(this.yearsOfExp+4).toString(),
                    importance: 'Required'
                 }
            }
            if (this.onlyWithSecurityClearance) {
                objectReq.semantic.securityClearances = [{
                    clearanceId: 'Active Confidential',
                    countryAbbrev: 'US'
                }]
            }
            req = {
                token: this.monsterAccessToken,
                page: this.searchRequestItem.page,
                searchType: 'semantic',
                searchRequest: objectReq
            }
            this.loading = true;

            this.service.getMonsterSearch(req).subscribe((x: any) => {
                this.loading = false;
                this.resultsFound = false;
                let response = x;
                this.monsterData = response.candidates;
                if (this.monsterData.length > 0) {
                    this.resultsFound = true;
                    this.totalResults += response.boards[0].matched;
                    this.monsterData.map((items: any) => {
                        let item: any = items.relevance;
                        items.skills = [];
                        item.skills.forEach((itm: any) => {
                            items.skills.push(itm.name);
                        });
                    });
                }
                //return monsterData;
                //console.log('monsterData', this.monsterData)
            });
        }
    }

    public DiceSearch() {
        if (this.diceaccessToken) {
            let req =
                'q=' +
                encodeURIComponent(this.model.boolean) +
                '&page=' +
                (this.searchRequestItem?.page || 1);
            if (this.selectedState) {
                /* const selectedState = "value"+"'"'":" + this.selectedState"" */
                let locations = '[{"value":"' + this.selectedState + '"}]';
                if (this.searchRequestItem.locationRadius) {
                    locations =
                        '[{"value":"' +
                        this.selectedState +
                        '","distance":' +
                        this.searchRequestItem.locationRadius +
                        ',"distanceUnit":"miles"}]';
                    console.log('locations', `${locations}`);
                }
                req += '&locations=' + encodeURIComponent(locations);
                req += this.daysWithin? '&dateResumeLastUpdated=' + this.daysWithin: '';
                let exp = '{"min":' + this.yearsOfExp + '}';
                req += exp?'&yearsExperience=' + encodeURIComponent(exp):'';
                const workarray = this.selectedWorkstatus.map(item => item.dicevalue); 
                const workPermit = workarray.join(', ');
                req += workPermit ? '&workPermit=' +workPermit:'';
                req += this.onlyWithSecurityClearance ? '&onlyWithSecurityClearance=' + this.onlyWithSecurityClearance : '';
            }
            this.loading = true;
            if (this.searchRequestItem.page == undefined) {
                let auditReq = {
                    jobBoard: 'Dice',
                    query: this.model.boolean,
                    dateTime: new Date(),
                    userName: this.cookieValue,
                };
                this.service.jobBoardAudit(auditReq).subscribe((x) => { });
            }

            this.service
                .getDiceSearch(req, this.diceaccessToken)
                .subscribe((x: any) => {
                    console.log('x', x);
                    this.loading = false;
                    this.resultsFound = false;
                    let response = x;
                    this.diceData = response.data;
                    this.resultsFound = true;
                    this.totalResults += response.meta.totalCount;
                    console.log(this.diceData);
                    if (this.diceData.length > 0) {
                        this.diceData.map((items: any) => {
                            let item: any = items;
                            items.skills = [];
                            for (let i = 0; i < 5; i++) {
                                items.skills.push(item.skills[i] ? item.skills[i].skill : '');
                            }
                        });
                    }
                });
        }
    }
  
    public tresumeSearch() {
        let req = {
            "traineeId": this.traineeId,
            'keyword': this.model.boolean,
            'location': this.selectedState,
            'yearsOfExp': this.yearsOfExp * 12,
            'daysWithin': this.daysWithin,
            'yearsOfExpmin':'',
            'Jobboard':{ value: 'all', name: 'All' }
        }
        this.service.getResumes2(req).subscribe(x => {
            let response = x.result;
            this.tresumeData = response;
            console.log(this.tresumeData)

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
            facetFilter += ' WorkStatus:' + this.selectedWorkstatus[0].cbvalue;
        }
        if (this.selectedEducationDegree) {
            facetFilter += ' HighestEducationDegreeCode:' + this.selectedEducationDegree.value;
        }
        return facetFilter;
    }

    public selecteWorkstatus(value: any) {
        console.log('value', value)

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

    //Division

    public fetchcredit(jobid: any) {
        let Req = {
            userName: this.userName1,
        };
        let type = 0;
        let divid = 0;
        this.service.fetchdvisioncredit(Req).subscribe((x: any) => {
            if(x.result.length == 0){
                this.showmonstererror = true;
                this.showdiceerror = true;
                this.showcberror = true;
                this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'No division credit found' });
            } else{
            this.monstercreditcount = x.result[0].umonster;
            this.dicecreditcount = x.result[0].udice;
            this.cbcreditcount = x.result[0].ucb;
            this.divID = x.result[0].id;

            type = x.result[0].type;
            divid = x.result[0].id;

            let Req2 = {
                type: type,
                jobID: jobid,
                divid: divid,
                userName: this.userName1,
            };
            var count = 0;
            this.service.fetchusage(Req2).subscribe((x: any) => {
                if (jobid == 3) {
                    this.monsterusedcount = x.result[0].row_count;
                    count = this.monstercreditcount - this.monsterusedcount;
                    this.amonster = count;
                    if (count <= 0) {
                        this.showmonstererror = true;
                        this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough Monster credit to View Resume' });
                    }
                }
                if (jobid == 2) {
                    this.diceusedcount = x.result[0].row_count;
                    count = this.dicecreditcount - this.diceusedcount;
                    this.adice = count;
                    if (count <= 0) {
                        this.showdiceerror = true;
                        this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough Dice credit to View Resume' });
                    }
                }
                if (jobid == 4) {
                    this.cbusedcount = x.result[0].row_count;
                    count = this.cbcreditcount - this.cbusedcount;
                    this.acb = count;
                    if (count <= 0) {
                        this.showcberror = true;
                        this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough Career Builder credit to View Resume' });
                    }
                }


            });
        }
        });
    }

    // public async fetchcredit(jobid: any) {
    //     try {
    //       let Req = {
    //         userName: this.userName1,
    //       };
    
    //       let type = 0;
    //       let divid = 0;
    
    //       const fetchDivisionCredit = (): Promise<void> => {
    //         return new Promise<void>((resolve, reject) => {
    //           this.service
    //             .fetchdvisioncredit(Req)
    //             .toPromise()
    //             .then((x: any) => {
    //               console.log(x.result.length);
    //               if (x.result.length == 0) {
    //                 this.showmonstererror = true;
    //                 this.showdiceerror = true;
    //                 this.showcberror = true;
    //                 this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'No division credit found' });
    //                 reject('No division credit found');
    //               } else {
    //                 this.monstercreditcount = x.result[0].monster;
    //                 this.dicecreditcount = x.result[0].dice;
    //                 this.cbcreditcount = x.result[0].cb;
    //                 this.divID = x.result[0].id;

    //                 resolve();
    //               }
    //             })
    //             .catch((error: any) => {
    //               reject(error);
    //             });
    //         });
    //       };
    
    //       const fetchUsage = (): Promise<void> => {
    //         return new Promise<void>((resolve, reject) => {
    //             var jbname = '';
    //             var count =0;
    //             var percentage = 0;

                
    //           let Req2 = {
    //             type: type,
    //             jobID: this.jobID,
    //             divid: this.divID,
    //             jobboardName: jbname,
    //           };
    //           this.service
    //             .fetchusage(Req2)
    //             .toPromise()
    //             .then((x: any) => {
    //               console.log(x.result);
    //               if (jobid == 3) {
    //                 this.monsterusedcount = x.result[0].row_count;
    //                 count = this.monstercreditcount - this.monsterusedcount;
    //                 jbname = 'Monster';
    //                 percentage = (this.monsterusedcount / this.monstercreditcount) * 100;
    //                 if (count <= 0) {
    //                     this.showmonstererror = true;
    //                     this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough credit to View Resume' });
    //                 }
    //             }
    //             if (jobid == 2) {
    //                 this.diceusedcount = x.result[0].row_count;
    //                 count = this.dicecreditcount - this.diceusedcount;
    //                 jbname = 'Dice';
    //                 percentage = (this.diceusedcount / this.dicecreditcount) * 100;
    //                 if (count <= 0) {
    //                     this.showdiceerror = true;
    //                     this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough credit to View Resume' });
    //                 }
    //             }
    //             if (jobid == 4) {
    //                 this.cbusedcount = x.result[0].row_count;
    //                 count = this.cbcreditcount - this.cbusedcount;
    //                 jbname = 'Career Builder';
    //                 percentage = (this.cbusedcount / this.cbcreditcount) * 100;
    //                 if (count <= 0) {
    //                     this.showcberror = true;
    //                     this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough credit to View Resume' });
    //                 }
    //             }
                  
    //               let Req3 = {
    //                 type: type,
    //                 jobID: this.jobID,
    //                 divid: this.divID,
    //                 jobboardName: jbname,
    //                 percentage: percentage,
    //               };
    //               if (percentage >= 80) {
    //                 this.service
    //                   .senddivisionerrormail(Req3)
    //                   .toPromise()
    //                   .then((x: any) => {
    //                     // Handle the email sent
    //                   })
    //                   .catch((error: any) => {
    //                     // Handle the email sending error
    //                   });
    //               }
                  
    //               resolve();
    //             })
    //             .catch((error: any) => {
    //               reject(error);
    //             });
    //         });
    //       };
    
    //       await fetchDivisionCredit();
    //       await fetchUsage();
    
    //     } catch (error) {
    //       console.error('Error:', error);
    //     }
    //   }

    public ipaddress() {
        let Req = {
            userName: this.userName1,
        };
        this.service.getclientipaddress(Req).subscribe((x: any) => {
            this.ipaddress = x.body;
            console.log(this.ipaddress)
        });
    }

    public adddivisionaudit(jobid: any) {
        let Req = {
            userName: this.userName1,
            divID: this.divID,
            jobID: jobid,
            ipaddress: this.ipaddress,
            candidateemail: ''
        };
        this.service.adddivisionaudit(Req).subscribe((x: any) => {
            this.ipaddress = x.body;
            console.log(this.ipaddress)
        });

        this.fetchcredit(jobid);

    }

    private download2(params: any) {

        this.loading = true;
        this.service.getDiceProfileView(params, this.diceaccessToken).subscribe((x: any) => {
            console.log('x', x)
            this.loading = false;
            if (x.resume) {
                let profileDetails = x;
                let emailID = profileDetails.email[0];
                this.divcandidateemail = profileDetails.email[0];
                let firstName = profileDetails.firstName;
                let lastName = profileDetails.lastName;
                let title = profileDetails?.desiredJobTitles[0];
                let CurrentLocation = profileDetails?.region;
                let YearsOfExpInMonths = (profileDetails.yearsOfExperience * 12).toString();
                let skilllist: any = profileDetails.skills;
                let skills: any = [];
                skilllist.forEach((itm: any) => {
                    skills.push(itm.skill);
                });
                let HtmlResume = profileDetails.resume?.resumeHtml;
                let source = "Dice";
                let ATSID = profileDetails.legacyIds[0];
                this.migratedResumeID = emailID;
                let req1: DiceProfileRequestItem = {
                    emailID: emailID
                }
                this.service.checkIfResumeExists(req1).subscribe((y: any) => {
                    
                    if (y.length > 0) {
                        this.isPDFSrc = false;
                        this.objUrl = this.sanitizer.bypassSecurityTrustHtml(y[0].HtmlResume);
                        this.loading = false;
                        this.fileReady = true;
                        this.visibleSidebar2 = true;
                    }
                    else {
                        this.currentResumeResp = x.resume;
                        let b64Data: any = x.resume.resumeData;
                        let contentType = x.resume.contentType;
                        const blob = b64toBlob(b64Data, contentType);
                        this.isPDFSrc = (contentType === "application/pdf") ? true : false;
                        this.fileReady = true;
                        this.visibleSidebar2 = true;
                        let createRequest: DiceProfileRequestItem = {
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
                            traineeId: this.traineeId
                        }
                        this.service.createJobSeekerProfile(createRequest).subscribe(z => {
                            let saveResumeReq = {
                                Filename: profileDetails.fullName + '_' + x.resume.filename,
                                Content: b64Data,
                                userName: this.traineeId,
                                emailID: emailID
                            }
                            this.service.saveResume(saveResumeReq).subscribe(x => {
                                let req = {
                                    userName: this.migratedResumeID
                                }
                                this.service.getResumePath(req).subscribe((x: any) => {
                                    FileSaver.saveAs("https://tresume.us/" + x[0].ResumePath, x[0].ResumeName);
                                });
                            });

                        });

                        this.adddivisionaudit(2);
                    }
                    
                });
            }
            else {
                this.messageService.add({ severity: 'warning', summary: 'No Resume Found' });
            }
        });


    }

    public downloadAsPdf(currentResumeEmail:any) {
        let req = {
            userName: currentResumeEmail
        }
        this.service.getResumePath(req).subscribe((x: any) => {
            console.log('x', x)
            FileSaver.saveAs("https://tresume.us/" + x[0].ResumePath, x[0].ResumeName);
        });
        /* var html = htmlToPdfmake(this.resumeHTMLContent);
        const dd = {
            content: html,
            defaultStyle: {
                font: 'Roboto',
                bold: false
            }
        };
        pdfMake.createPdf(dd).download(); */
        /* const doc = new jsPDF('p', 'px', [500, 800]);
        doc.html(this.resumeHTMLContent, {
            callback: function (doc) {
                doc.save('tableToPdf.pdf');
            },
            x: 10,
            y: 10
        }); */
    }

    private dicedownload(params: any) {
        if (!this.showdiceerror) {
            this.loading = true;
            this.service.getDiceProfileView(params, this.diceaccessToken).subscribe((x: any) => {
                console.log('x', x)
                this.loading = false;
                if (x.resume) {
                    let profileDetails = x;
                    let emailID = profileDetails.email[0];
                    this.divcandidateemail = profileDetails.email[0];
                    let firstName = profileDetails.firstName;
                    let lastName = profileDetails.lastName;
                    let title = profileDetails?.desiredJobTitles[0];
                    let CurrentLocation = profileDetails?.region;
                    let YearsOfExpInMonths = (profileDetails.yearsOfExperience * 12).toString();
                    let skilllist: any = profileDetails.skills;
                    let skills: any = [];
                    skilllist.forEach((itm: any) => {
                        skills.push(itm.skill);
                    });
                    let HtmlResume = profileDetails.resume?.resumeHtml;
                    let source = "Dice";
                    let ATSID = profileDetails.legacyIds[0];
                    this.migratedResumeID = emailID;
                    let req1: DiceProfileRequestItem = {
                        emailID: emailID
                    }
                    this.service.checkIfResumeExists(req1).subscribe((y: any) => {
                        if (y.length > 0) {
                            this.isPDFSrc = false;
                            this.objUrl = this.sanitizer.bypassSecurityTrustHtml(y[0].HtmlResume);
                            this.loading = false;
                            this.fileReady = true;
                            this.visibleSidebar2 = true;
                        }
                        else {
                            this.currentResumeResp = x.resume;
                            let b64Data: any = x.resume.resumeData;
                            let contentType = x.resume.contentType;
                            const blob = b64toBlob(b64Data, contentType);
                            this.isPDFSrc = (contentType === "application/pdf") ? true : false;
                            this.fileReady = true;
                            this.visibleSidebar2 = true;
                            let createRequest: DiceProfileRequestItem = {
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
                                traineeId: this.traineeId
                            }
                            this.service.createJobSeekerProfile(createRequest).subscribe(z => {
                                let saveResumeReq = {
                                    Filename: profileDetails.fullName + '_' + x.resume.filename,
                                    Content: b64Data,
                                    userName: this.traineeId,
                                    emailID: emailID
                                }
                                this.service.saveResume(saveResumeReq).subscribe(x => {

                                });

                            });

                            this.adddivisionaudit(2);
                        }
                    });
                }
                else {
                    this.messageService.add({ severity: 'warning', summary: 'No Resume Found' });
                }
            });
        }
        else {
            this.messageService.add({ severity: 'warning', summary: 'You have no credits left' });
        }


    }

    public dicedownloadDoc() {
        let req = {
            userName: this.migratedResumeID
        }
        this.service.getResumePath(req).subscribe((x: any) => {
            FileSaver.saveAs("https://tresume.us/" + x[0].ResumePath, x[0].ResumeName);
        });
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

    public nocredits(){
        this.messageService.add({ severity: 'warning', summary: 'Notification', detail: 'You dont have enough credit to View Resume' });
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

export interface DiceProfileRequestItem {
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
}